const { createHash } = require('node:crypto');
const { FieldValue } = require('firebase-admin/firestore');

const PUBLIC_STATUSES = new Set(['active', 'sold', 'inactive']);
const ACTIVE_STATUS = 'active';
const MAX_GALLERY_IMAGES = 12;
const PUBLIC_FALLBACK_IMAGE = 'https://zinoo.in/zinoo-home-hero.webp';

const text = (value, maxLength = 500) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
const safeUrl = (value) => {
  const candidate = text(value, 2000);
  if (!candidate) return '';
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'https:' ? parsed.href : '';
  } catch {
    return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '';
  }
};
const safePublicMediaUrl = (value) => {
  const candidate = text(value, 2000);
  if (!candidate) return '';
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) return '';
    // Firebase Storage download URLs need their token when the object is not
    // publicly readable through Storage rules. The project projection itself
    // is public, so retain tokens only for Firebase Storage URLs.
    if (parsed.searchParams.has('token')) {
      if (parsed.hostname !== 'firebasestorage.googleapis.com') return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
};
const stringList = (value, maxItems = 20, maxLength = 100) => {
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(source.map((item) => text(typeof item === 'string' ? item : item?.title, maxLength)).filter(Boolean))].slice(0, maxItems);
};
const slugify = (value) => text(value, 160).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/g, '') || 'project';
const validSlug = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value || '') && value.length <= 90;
const shortHash = (value) => createHash('sha256').update(String(value)).digest('hex').slice(0, 7);

function galleryUrls(project) {
  const sources = [project.display?.media?.gallery, project.galleryImages, project.images, project.media];
  const urls = sources.flatMap((items) => Array.isArray(items) ? items : [])
    .filter((item) => item?.enabled !== false)
    .map((item) => safePublicMediaUrl(typeof item === 'string' ? item : item?.downloadURL || item?.url))
    .filter(Boolean);
  return [...new Set(urls)].slice(0, MAX_GALLERY_IMAGES);
}

function videoUrls(project) {
  const videos = Array.isArray(project.videos) ? project.videos : [];
  return videos
    .filter((video) => video?.enabled !== false)
    .map((video, index) => ({
      id: text(video?.id, 160) || `video-${index}`,
      downloadURL: safePublicMediaUrl(typeof video === 'string' ? video : video?.downloadURL || video?.url)
    }))
    .filter((video) => video.downloadURL)
    .slice(0, MAX_GALLERY_IMAGES);
}

function normalizeLocation(project = {}) {
  const display = project.display || {};
  const village = text(project.village || display.basic?.village, 100);
  const locality = text(project.locality || project.area, 120);
  const taluka = text(project.taluka || display.basic?.taluka, 100);
  const district = text(project.district || display.basic?.district, 100);
  const city = text(project.city, 100);
  const name = text(project.locationName || village || locality || city || taluka || 'Chakan', 120);
  const slug = validSlug(project.locationSlug) ? project.locationSlug : slugify(name);
  const identityKey = [district, taluka, name].map((value) => value.toLowerCase()).filter(Boolean).join('|');
  return {
    id: slug,
    name,
    slug,
    locality,
    city,
    taluka,
    district,
    state: text(project.state, 100) || 'Maharashtra',
    country: text(project.country, 100) || 'India',
    latitude: number(project.latitude ?? project.location?.lat ?? display.map?.latitude),
    longitude: number(project.longitude ?? project.location?.lng ?? display.map?.longitude),
    description: text(project.locationDescription, 1000),
    identityKey
  };
}

function sanitizePublicProject(project, slug) {
  const display = project.display || {};
  const locationEntity = normalizeLocation(project);
  const projectName = text(project.name || display.basic?.projectName, 120);
  const location = text(project.locationLabel || display.basic?.location
    || [locationEntity.name, locationEntity.taluka, locationEntity.district].filter(Boolean).join(', '), 220);
  const primaryImage = safePublicMediaUrl(project.thumbnail || project.heroImage || project.coverImage || display.media?.heroImage)
    || PUBLIC_FALLBACK_IMAGE;
  const galleryImages = galleryUrls(project).filter((url) => url !== primaryImage);
  const videos = videoUrls(project);
  const status = PUBLIC_STATUSES.has(project.status) ? project.status : 'inactive';
  const publicDocuments = (Array.isArray(project.documents) ? project.documents : [])
    .filter((document) => document?.showOnDetails === true && document?.enabled !== false)
    .map((document) => ({
      title: text(document.displayName || document.title || document.fileName, 160),
      type: text(document.type, 60),
      url: safeUrl(document.downloadURL || document.url)
    }))
    .filter((document) => document.title && document.url)
    .slice(0, 12);
  return {
    projectId: text(project.id, 160),
    slug,
    canonicalSlug: slug,
    projectName,
    location,
    locationId: locationEntity.id,
    locationSlug: locationEntity.slug,
    locality: locationEntity.locality,
    village: text(project.village || display.basic?.village, 100),
    taluka: locationEntity.taluka,
    district: locationEntity.district,
    city: locationEntity.city,
    description: text(project.description || project.shortDescription || display.overview?.body || display.basic?.shortDescription, 1800),
    startingPrice: number(project.startingPrice ?? project.priceFrom ?? display.pricing?.startingPrice),
    plotAreaMinSqFt: number(project.plotAreaMinSqFt ?? project.minimumPlotArea ?? project.sizeMin),
    plotAreaMaxSqFt: number(project.plotAreaMaxSqFt ?? project.maximumPlotArea ?? project.sizeMax),
    // Only seller-selected, project-scoped amenities enter the public record.
    // The admin presentation/master catalog is intentionally never a fallback.
    amenities: stringList(project.amenities),
    highwayName: text(project.highwayName, 120),
    isHighwayTouch: project.isHighwayTouch === true,
    latitude: locationEntity.latitude,
    longitude: locationEntity.longitude,
    primaryImage,
    galleryImages,
    videos,
    landZone: text(project.landZone, 80),
    naStatus: text(project.naStatus, 80),
    reraNumber: text(project.reraNumber, 100),
    remainingPlots: number(project.remainingPlots ?? project.availablePlots),
    totalPlots: number(project.totalPlots),
    developerName: text(project.developerName || project.developer, 160),
    publicContactNumber: text(project.whatsappNumber || project.salesContact || project.siteVisitContact || project.siteVisitContactNumber || project.contactNumber, 30),
    cashbackAmount: number(project.cashbackAmount ?? display.cashback?.amount),
    bankLoan: project.bankLoan === true,
    verified: project.verified === true || display.verified?.enabled === true,
    showVerifiedNameBadge: project.showVerifiedNameBadge === true || display.verified?.showNameBadge === true,
    publicDocuments,
    status,
    available: status === ACTIVE_STATUS,
    publicVisibility: true,
    publishedAt: project.activatedAt || project.publishedAt || project.updatedAt || null,
    updatedAt: project.updatedAt || project.activatedAt || null
  };
}

function selectCanonicalSlug(project, existing = null) {
  if (validSlug(project.publicSlug) && project.publicSlug !== existing?.slug) return project.publicSlug;
  const requested = existing?.slug || project.canonicalSlug || project.publicSlug || project.slug || slugify(project.name);
  return validSlug(requested) ? requested : slugify(project.name);
}

async function inspectProjectProjection({ db, projectId }) {
  const [sourceSnapshot, publicSnapshot, ownedRegistrySnapshot] = await Promise.all([
    db.collection('projects').doc(projectId).get(),
    db.collection('publicProjects').doc(projectId).get(),
    db.collection('publicProjectSlugs').where('projectId', '==', projectId).get()
  ]);
  const source = snapshotData(sourceSnapshot);
  const existing = snapshotData(publicSnapshot);
  if (!source) return { projectId, intendedAction: existing ? 'delete' : 'none', sourceExists: false };
  let proposedSlug = selectCanonicalSlug(source, existing);
  let registrySnapshot = await db.collection('publicProjectSlugs').doc(proposedSlug).get();
  let collisionResolution = 'none';
  if (registrySnapshot.exists && registrySnapshot.data().projectId !== projectId) {
    const original = proposedSlug;
    proposedSlug = `${proposedSlug.slice(0, 72).replace(/-+$/g, '')}-${shortHash(projectId)}`;
    collisionResolution = `${original} owned by ${registrySnapshot.data().projectId}; use ${proposedSlug}`;
    registrySnapshot = await db.collection('publicProjectSlugs').doc(proposedSlug).get();
  }
  const location = normalizeLocation(source);
  const locationSnapshot = await db.collection('publicLocations').doc(location.slug).get();
  const locationCollision = locationSnapshot.exists && locationSnapshot.data().identityKey
    && locationSnapshot.data().identityKey !== location.identityKey
    ? `${location.slug}: ${location.identityKey} conflicts with ${locationSnapshot.data().identityKey}` : 'none';
  return {
    projectId,
    sourceExists: true,
    sourceSlug: source.canonicalSlug || source.publicSlug || source.slug || '',
    publicSlug: existing?.slug || '',
    proposedSlug,
    collisionResolution,
    locationId: location.id,
    locationSlug: location.slug,
    locationIdentityKey: location.identityKey,
    locationCollision,
    existingRegistryOwner: registrySnapshot.exists ? registrySnapshot.data().projectId : '',
    ownedRegistrySlugs: (ownedRegistrySnapshot.docs || []).map((doc) => doc.id).sort(),
    intendedAction: !PUBLIC_STATUSES.has(source.status) ? (existing ? 'mark-unavailable' : 'none') : existing ? 'preserve/update' : 'publish'
  };
}

const snapshotExists = (snapshot) => Boolean(snapshot?.exists);
const snapshotData = (snapshot) => snapshotExists(snapshot) ? snapshot.data() : null;

async function projectPublicProjection({ db, projectId }) {
  const sourceRef = db.collection('projects').doc(projectId);
  const publicRef = db.collection('publicProjects').doc(projectId);
  const registryCollection = db.collection('publicProjectSlugs');
  return db.runTransaction(async (tx) => {
    // Event delivery is only a wake-up signal. These transaction reads are the
    // authoritative current state and make delayed/out-of-order events safe.
    const [sourceSnapshot, publicSnapshot, ownedRegistrySnapshot] = await Promise.all([
      tx.get(sourceRef),
      tx.get(publicRef),
      tx.get(registryCollection.where('projectId', '==', projectId))
    ]);
    const source = snapshotData(sourceSnapshot);
    const existing = snapshotData(publicSnapshot);
    const ownedRegistries = ownedRegistrySnapshot.docs || [];

    if (!source) {
      const oldLocationSlug = existing?.locationSlug;
      let locationSnapshot = null;
      let remainingAtLocation = null;
      if (oldLocationSlug && oldLocationSlug !== 'chakan') {
        [locationSnapshot, remainingAtLocation] = await Promise.all([
          tx.get(db.collection('publicLocations').doc(oldLocationSlug)),
          tx.get(db.collection('publicProjects').where('locationSlug', '==', oldLocationSlug).limit(2))
        ]);
      }
      if (existing) tx.delete(publicRef);
      ownedRegistries.forEach((registry) => {
        if (registry.data().projectId === projectId) tx.delete(registry.ref);
      });
      const otherLocationProjects = (remainingAtLocation?.docs || []).filter((doc) => doc.id !== projectId);
      if (locationSnapshot?.exists && locationSnapshot.data().curated !== true && otherLocationProjects.length === 0) {
        tx.delete(locationSnapshot.ref);
      }
      return { action: existing || ownedRegistries.length ? 'deleted' : 'none' };
    }

    if (!PUBLIC_STATUSES.has(source.status)) {
      if (!existing) return { action: 'none' };
      // Keep the last approved content, but never represent pending/rejected
      // inventory as currently available and never copy unapproved changes.
      tx.set(publicRef, {
        status: 'unavailable',
        available: false,
        sourceStatus: source.status,
        updatedAt: source.updatedAt || existing.updatedAt || null
      }, { merge: true });
      return { action: 'unavailable', slug: existing.slug };
    }

    let canonicalSlug = selectCanonicalSlug(source, existing);
    let canonicalRegistryRef = registryCollection.doc(canonicalSlug);
    let canonicalRegistrySnapshot = await tx.get(canonicalRegistryRef);
    if (canonicalRegistrySnapshot.exists && canonicalRegistrySnapshot.data().projectId !== projectId) {
      canonicalSlug = `${canonicalSlug.slice(0, 72).replace(/-+$/g, '')}-${shortHash(projectId)}`;
      canonicalRegistryRef = registryCollection.doc(canonicalSlug);
      canonicalRegistrySnapshot = await tx.get(canonicalRegistryRef);
      if (canonicalRegistrySnapshot.exists && canonicalRegistrySnapshot.data().projectId !== projectId) {
        throw new Error(`Canonical slug collision could not be resolved for project ${projectId}.`);
      }
    }

    let location = normalizeLocation(source);
    let locationRef = db.collection('publicLocations').doc(location.slug);
    let locationSnapshot = await tx.get(locationRef);
    if (locationSnapshot.exists && locationSnapshot.data().identityKey
      && locationSnapshot.data().identityKey !== location.identityKey) {
      if (source.locationSlug === location.slug) {
        throw new Error(`Location slug collision for ${location.slug}: ${location.identityKey} conflicts with ${locationSnapshot.data().identityKey}.`);
      }
      const resolvedSlug = `${location.slug.slice(0, 72).replace(/-+$/g, '')}-${shortHash(location.identityKey)}`;
      location = { ...location, id: resolvedSlug, slug: resolvedSlug };
      locationRef = db.collection('publicLocations').doc(resolvedSlug);
      locationSnapshot = await tx.get(locationRef);
      if (locationSnapshot.exists && locationSnapshot.data().identityKey !== location.identityKey) {
        throw new Error(`Resolved location slug collision for ${resolvedSlug}.`);
      }
    }

    let previousLocationSnapshot = null;
    let previousLocationProjects = null;
    const previousLocationSlug = existing?.locationSlug;
    if (previousLocationSlug && previousLocationSlug !== location.slug && previousLocationSlug !== 'chakan') {
      [previousLocationSnapshot, previousLocationProjects] = await Promise.all([
        tx.get(db.collection('publicLocations').doc(previousLocationSlug)),
        tx.get(db.collection('publicProjects').where('locationSlug', '==', previousLocationSlug).limit(2))
      ]);
    }

    const ownedSlugs = ownedRegistries.map((registry) => registry.id).filter(validSlug);
    const historicalSlugs = [...new Set(ownedSlugs.filter((slug) => slug !== canonicalSlug))];
    const projection = { ...sanitizePublicProject({ ...source, id: projectId, locationSlug: location.slug }, canonicalSlug), historicalSlugs };

    tx.set(publicRef, projection);
    tx.set(canonicalRegistryRef, { projectId, canonicalSlug, redirect: false, updatedAt: FieldValue.serverTimestamp() });
    ownedRegistries.forEach((registry) => {
      if (registry.id === canonicalSlug || registry.data().projectId !== projectId) return;
      tx.set(registry.ref, { projectId, canonicalSlug, redirect: true, updatedAt: FieldValue.serverTimestamp() });
    });
    historicalSlugs.forEach((oldSlug) => {
      const owned = ownedRegistries.find((registry) => registry.id === oldSlug);
      if (!owned || owned.data().projectId !== projectId) return;
      tx.set(owned.ref, { projectId, canonicalSlug, redirect: true, updatedAt: FieldValue.serverTimestamp() });
    });

    const sourceChanges = {};
    if (source.canonicalSlug !== canonicalSlug) sourceChanges.canonicalSlug = canonicalSlug;
    if (source.publicSlug !== canonicalSlug) sourceChanges.publicSlug = canonicalSlug;
    if (source.locationId !== location.id) sourceChanges.locationId = location.id;
    if (source.locationSlug !== location.slug) sourceChanges.locationSlug = location.slug;
    if (Object.keys(sourceChanges).length) tx.update(sourceRef, sourceChanges);
    tx.set(locationRef, { ...location, curated: locationSnapshot.exists ? locationSnapshot.data().curated === true : false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const otherPreviousLocationProjects = (previousLocationProjects?.docs || []).filter((doc) => doc.id !== projectId);
    if (previousLocationSnapshot?.exists && previousLocationSnapshot.data().curated !== true && otherPreviousLocationProjects.length === 0) {
      tx.delete(previousLocationSnapshot.ref);
    }
    return { action: existing ? 'updated' : 'published', slug: canonicalSlug, locationSlug: location.slug };
  });
}

function createPublicProjectProjectionHandler(db) {
  return async (event) => projectPublicProjection({ db, projectId: event.params.projectId });
}

module.exports = {
  ACTIVE_STATUS,
  PUBLIC_STATUSES,
  PUBLIC_FALLBACK_IMAGE,
  createPublicProjectProjectionHandler,
  inspectProjectProjection,
  normalizeLocation,
  projectPublicProjection,
  selectCanonicalSlug,
  sanitizePublicProject,
  safePublicMediaUrl,
  slugify,
  validSlug
};
