const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { PROPERTY_STATUS } = require('./propertyStatus');

const app = initializeApp();
const db = getFirestore(app, 'default');
const callableOptions = { region: 'us-central1', cors: ['http://localhost:3000', 'http://localhost:5173', 'https://druvio.web.app', 'https://druvio.firebaseapp.com'] };
const REVIEW_FIELDS = new Set(['status', 'reviewedAt', 'reviewedBy', 'approvedAt', 'approvedBy', 'activatedAt', 'activatedBy']);

const permissionsOf = (profile = {}) => {
  const source = profile.permissions || profile;
  return { buyer: source.role === 'admin' || source.role === 'seller' || Boolean(source.buyer), seller: source.role === 'admin' || source.role === 'seller' || Boolean(source.seller), admin: source.role === 'admin' || Boolean(source.admin) };
};
const isValidSeller = (profile = {}) => {
  const status = [profile.status, profile.sellerStatus, profile.approvalStatus, profile.reviewStatus].map((v) => String(v || '').toLowerCase());
  return permissionsOf(profile).seller && !permissionsOf(profile).admin && !profile.deleted && !profile.disabled && !status.some((v) => ['pending', 'rejected', 'suspended', 'disabled', 'inactive', 'revoked', 'deleted'].includes(v));
};
const assertId = (id, label) => { if (typeof id !== 'string' || !id || id.includes('/')) throw new HttpsError('invalid-argument', `A valid ${label} is required.`); };
const assertProject = (project = {}) => {
  if (typeof project.name !== 'string' || project.name.trim().length < 2) throw new HttpsError('invalid-argument', 'A valid property name is required.');
  if (!(project.thumbnail || project.heroImage || project.coverImage)) throw new HttpsError('failed-precondition', 'A cover or hero image is required before publishing.');
  const lat = Number(project.latitude ?? project.location?.lat);
  const lng = Number(project.longitude ?? project.location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || (lat === 0 && lng === 0)) throw new HttpsError('failed-precondition', 'Valid latitude and longitude are required before publishing.');
  if (!Number.isFinite(Number(project.startingPrice ?? project.priceFrom)) || Number(project.startingPrice ?? project.priceFrom) <= 0) throw new HttpsError('failed-precondition', 'A valid starting price is required before publishing.');
};
const cleanChanges = (changes = {}) => Object.fromEntries(Object.entries(changes).filter(([key]) => key !== 'id' && !REVIEW_FIELDS.has(key)));
const audit = (propertyId, action, by, previousStatus, newStatus, notes = '') => ({ propertyId, action, performedBy: by, performedAt: FieldValue.serverTimestamp(), previousStatus, newStatus, ...(notes ? { notes } : {}) });

exports.createProjectForSeller = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { sellerUid, projectData } = request.data || {}; assertId(sellerUid, 'Seller');
  if (!projectData || typeof projectData.name !== 'string' || projectData.name.trim().length < 2) throw new HttpsError('invalid-argument', 'A valid property name is required.');
  const adminRef = db.collection('users').doc(request.auth.uid), sellerRef = db.collection('users').doc(sellerUid), projectRef = db.collection('projects').doc(), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const [adminSnap, sellerSnap] = await Promise.all([tx.get(adminRef), tx.get(sellerRef)]);
    if (!adminSnap.exists || !permissionsOf(adminSnap.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can create properties for Sellers.');
    if (!sellerSnap.exists || !isValidSeller(sellerSnap.data())) throw new HttpsError('failed-precondition', 'Seller association missing. This property cannot be submitted.');
    const now = FieldValue.serverTimestamp();
    tx.create(projectRef, { ...cleanChanges(projectData), ownerId: sellerUid, sellerId: sellerUid, sellerUid, createdBy: request.auth.uid, createdByRole: 'admin', status: PROPERTY_STATUS.PENDING, createdAt: now, updatedAt: now });
    tx.create(auditRef, audit(projectRef.id, 'property_submitted', request.auth.uid, null, PROPERTY_STATUS.PENDING));
  });
  return { projectId: projectRef.id, status: PROPERTY_STATUS.PENDING };
});

exports.submitProjectChanges = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, changes } = request.data || {}; assertId(projectId, 'property ID');
  const ref = db.collection('projects').doc(projectId), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref); if (!snap.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const current = snap.data(); if (![current.ownerId, current.sellerId, current.sellerUid].includes(request.auth.uid)) throw new HttpsError('permission-denied', 'Only the associated Seller may submit changes.');
    tx.update(ref, { ...cleanChanges(changes), status: PROPERTY_STATUS.PENDING, changesSubmittedAt: FieldValue.serverTimestamp(), changesSubmittedBy: request.auth.uid, updatedAt: FieldValue.serverTimestamp() });
    tx.create(auditRef, audit(projectId, 'changes_submitted', request.auth.uid, current.status, PROPERTY_STATUS.PENDING));
  });
  return { projectId, status: PROPERTY_STATUS.PENDING };
});

exports.reviewProject = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, decision, reason = '' } = request.data || {}; assertId(projectId, 'property ID');
  if (![PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.REJECTED].includes(decision)) throw new HttpsError('invalid-argument', 'The review decision must be approved or rejected.');
  const reviewerRef = db.collection('users').doc(request.auth.uid), projectRef = db.collection('projects').doc(projectId), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const reviewer = await tx.get(reviewerRef); if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can review properties.');
    const snap = await tx.get(projectRef); if (!snap.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const project = snap.data(), previousStatus = project.status;
    const sellerId = project.sellerId || project.sellerUid || project.ownerId;
    if (!sellerId) throw new HttpsError('failed-precondition', 'Unable to publish property. Assign a valid seller before publishing.');
    const seller = await tx.get(db.collection('users').doc(sellerId));
    if (!seller.exists || !isValidSeller(seller.data())) throw new HttpsError('failed-precondition', 'Unable to publish property. Assign a valid seller before publishing.');
    if (previousStatus !== PROPERTY_STATUS.PENDING) throw new HttpsError('failed-precondition', 'Only pending properties can be reviewed.');
    if (decision === PROPERTY_STATUS.APPROVED) assertProject(project);
    const now = FieldValue.serverTimestamp();
    const update = {
      status: decision,
      reviewedAt: now,
      reviewedBy: request.auth.uid,
      updatedAt: now,
      ...(decision === PROPERTY_STATUS.APPROVED ? { approvedAt: now, approvedBy: request.auth.uid } : {})
    };
    const action = decision === PROPERTY_STATUS.APPROVED ? 'property_approved' : 'property_rejected';
    tx.update(projectRef, update); tx.create(auditRef, audit(projectId, action, request.auth.uid, previousStatus, update.status, reason));
  });
  return { projectId, status: decision };
});

exports.setProjectStatus = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, status } = request.data || {};
  assertId(projectId, 'property ID');
  if (![PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD].includes(status)) {
    throw new HttpsError('invalid-argument', 'Listing status must be active, inactive, or sold.');
  }
  const reviewerRef = db.collection('users').doc(request.auth.uid);
  const projectRef = db.collection('projects').doc(projectId);
  const auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const [reviewer, snapshot] = await Promise.all([tx.get(reviewerRef), tx.get(projectRef)]);
    if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can change listing status.');
    if (!snapshot.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const project = snapshot.data();
    const allowedTransitions = {
      [PROPERTY_STATUS.APPROVED]: [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD],
      [PROPERTY_STATUS.ACTIVE]: [PROPERTY_STATUS.INACTIVE, PROPERTY_STATUS.SOLD],
      [PROPERTY_STATUS.INACTIVE]: [PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.SOLD]
    };
    if (!allowedTransitions[project.status]?.includes(status)) {
      throw new HttpsError('failed-precondition', `Cannot change property status from ${project.status} to ${status}.`);
    }
    const now = FieldValue.serverTimestamp();
    tx.update(projectRef, {
      status,
      updatedAt: now,
      ...(status === PROPERTY_STATUS.ACTIVE ? { activatedAt: now, activatedBy: request.auth.uid } : {})
    });
    tx.create(auditRef, audit(projectId, `property_${status}`, request.auth.uid, project.status, status));
  });
  return { projectId, status };
});

exports.assignProjectSeller = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { projectId, sellerId } = request.data || {}; assertId(projectId, 'property ID'); assertId(sellerId, 'Seller');
  const reviewerRef = db.collection('users').doc(request.auth.uid), sellerRef = db.collection('users').doc(sellerId), projectRef = db.collection('projects').doc(projectId), auditRef = db.collection('propertyAuditLogs').doc();
  await db.runTransaction(async (tx) => {
    const [reviewer, seller, project] = await Promise.all([tx.get(reviewerRef), tx.get(sellerRef), tx.get(projectRef)]);
    if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can assign property Sellers.');
    if (!seller.exists || !isValidSeller(seller.data())) throw new HttpsError('failed-precondition', 'Select a valid Seller account.');
    if (!project.exists) throw new HttpsError('not-found', 'This property no longer exists.');
    const data = project.data(); tx.update(projectRef, { ownerId: sellerId, sellerId, sellerUid: sellerId, updatedAt: FieldValue.serverTimestamp() });
    tx.create(auditRef, audit(projectId, 'seller_association_changed', request.auth.uid, data.status, data.status, `Seller changed from ${data.sellerId || data.sellerUid || data.ownerId || 'missing'} to ${sellerId}`));
  });
  return { projectId, sellerId };
});

exports.reviewSellerRequest = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in.');
  const { requestId, decision } = request.data || {}; assertId(requestId, 'seller request ID');
  if (!['approved', 'rejected'].includes(decision)) throw new HttpsError('invalid-argument', 'The seller review decision is invalid.');
  const reviewer = await db.collection('users').doc(request.auth.uid).get(); if (!reviewer.exists || !permissionsOf(reviewer.data()).admin) throw new HttpsError('permission-denied', 'Only Admin users can review seller requests.');
  const requestRef = db.collection('sellerRequests').doc(requestId); const sellerRequest = await requestRef.get(); if (!sellerRequest.exists) throw new HttpsError('not-found', 'This seller request no longer exists.');
  const batch = db.batch(), now = FieldValue.serverTimestamp(); batch.update(requestRef, { status: decision, reviewedBy: request.auth.uid, reviewedAt: now, updatedAt: now });
  if (decision === 'approved') { const data = sellerRequest.data(); batch.set(db.collection('users').doc(data.userId || requestId), { permissions: { buyer: true, seller: true, admin: false }, businessName: data.businessName || '', updatedAt: now }, { merge: true }); }
  await batch.commit(); return { requestId, status: decision };
});
