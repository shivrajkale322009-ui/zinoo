const { HttpsError } = require('firebase-functions/v2/https');
const { FieldValue } = require('firebase-admin/firestore');

const STORAGE_ROOTS = Object.freeze(['project-media/', 'project-documents/']);
const PROPERTY_COLLECTIONS = Object.freeze(['layouts']);

const isRecord = (value) => value !== null && typeof value === 'object';

const pathFromDownloadUrl = (value) => {
  if (typeof value !== 'string' || !value.startsWith('https://firebasestorage.googleapis.com/')) return '';
  try {
    const match = new URL(value).pathname.match(/\/o\/([^/?]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  } catch {
    return '';
  }
};

const collectCandidateStoragePaths = (value, paths = new Set(), key = '') => {
  if (typeof value === 'string') {
    const directPath = /(^|Path$|path$)/.test(key) ? value.trim() : '';
    const urlPath = /url$/i.test(key) || /download/i.test(key) ? pathFromDownloadUrl(value) : '';
    [directPath, urlPath].filter((path) => STORAGE_ROOTS.some((root) => path.startsWith(root))).forEach((path) => paths.add(path));
    return paths;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectCandidateStoragePaths(item, paths));
    return paths;
  }
  if (isRecord(value)) {
    Object.entries(value).forEach(([childKey, child]) => collectCandidateStoragePaths(child, paths, childKey));
  }
  return paths;
};

const propertyStoragePrefixes = (projectId, ownerIds = []) => STORAGE_ROOTS.flatMap((root) =>
  ownerIds.filter(Boolean).map((ownerId) => `${root}${ownerId}/${projectId}/`)
);

const deleteQueryDocuments = async (db, collectionName, projectId) => {
  const snapshot = await db.collection(collectionName).where('projectId', '==', projectId).get();
  if (snapshot.empty) return 0;
  const writer = db.bulkWriter();
  snapshot.docs.forEach((document) => writer.delete(document.ref));
  await writer.close();
  return snapshot.size;
};

const isOwnedPropertyFile = async (file, projectId, ownerIds) => {
  const [metadata] = await file.getMetadata();
  const custom = metadata?.metadata || {};
  if (custom.projectId === projectId) return true;
  const uploadedBy = custom.uploadedBy;
  return Boolean(uploadedBy && ownerIds.includes(uploadedBy));
};

/**
 * Permanently deletes one property and its exclusive assets.
 * Storage is removed before Firestore so a Storage failure never leaves a
 * deleted project whose files cannot be retried.
 */
async function deletePropertyResources({ db, bucket, projectId, actorId }) {
  const projectRef = db.collection('projects').doc(projectId);
  const snapshot = await projectRef.get();
  if (!snapshot.exists) throw new HttpsError('not-found', 'This property no longer exists.');

  const project = snapshot.data();
  const ownerIds = [...new Set([project.ownerId, project.sellerId, project.sellerUid, project.createdBy].filter(Boolean))];
  const explicitPaths = [...collectCandidateStoragePaths(project)];
  const prefixPaths = propertyStoragePrefixes(projectId, ownerIds);

  const filesByName = new Map();
  for (const prefix of prefixPaths) {
    const [files] = await bucket.getFiles({ prefix });
    files.forEach((file) => filesByName.set(file.name, file));
  }
  for (const storagePath of explicitPaths) {
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) continue;
    if (prefixPaths.some((prefix) => storagePath.startsWith(prefix)) || await isOwnedPropertyFile(file, projectId, ownerIds)) {
      filesByName.set(storagePath, file);
    }
  }

  const storageFailures = [];
  for (const file of filesByName.values()) {
    try {
      await file.delete({ ignoreNotFound: true });
    } catch (error) {
      storageFailures.push({ path: file.name, message: error?.message || 'Storage deletion failed.' });
    }
  }
  if (storageFailures.length) {
    throw new HttpsError('internal', 'Some property files could not be deleted. The property was kept so deletion can be retried.', {
      stage: 'storage',
      deletedFiles: filesByName.size - storageFailures.length,
      failures: storageFailures
    });
  }

  const relatedDeleted = {};
  try {
    for (const collectionName of PROPERTY_COLLECTIONS) {
      relatedDeleted[collectionName] = await deleteQueryDocuments(db, collectionName, projectId);
    }
    await db.recursiveDelete(projectRef);
    await db.collection('propertyAuditLogs').add({
      propertyId: projectId,
      propertyName: typeof project.name === 'string' ? project.name.slice(0, 200) : 'Untitled Project',
      action: 'property_deleted',
      performedBy: actorId,
      performedAt: FieldValue.serverTimestamp(),
      previousStatus: project.status || null,
      newStatus: null,
      deletedStorageFiles: filesByName.size,
      deletedRelatedDocuments: relatedDeleted
    });
  } catch (error) {
    throw new HttpsError('internal', 'Property data could not be fully deleted. Some files or related records may already be removed. Contact support before retrying.', {
      stage: 'firestore',
      deletedStorageFiles: filesByName.size,
      relatedDeleted,
      cause: error?.message || 'Firestore deletion failed.'
    });
  }

  return {
    projectId,
    deletedStorageFiles: filesByName.size,
    deletedRelatedDocuments: relatedDeleted
  };
}

module.exports = {
  collectCandidateStoragePaths,
  deletePropertyResources,
  pathFromDownloadUrl,
  propertyStoragePrefixes
};
