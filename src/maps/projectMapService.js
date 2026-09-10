import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getProjectCoordinates, isProjectPublishable } from '../utils/projectVisibility';
import { PROPERTY_STATUS } from '../utils/projectVisibility';
import { CHAKAN_LOCATION } from '../utils/chakanLocation';

const projects = 'projects';
const layouts = 'layouts';
const PROJECT_CACHE_TTL_MS = 5 * 60 * 1000;
let activeProjectsCache = null;
let activeProjectsRequest = null;

const invalidateActiveProjectsCache = () => {
  activeProjectsCache = null;
};

const loadActiveProjects = async () => {
  if (activeProjectsCache && Date.now() - activeProjectsCache.loadedAt < PROJECT_CACHE_TTL_MS) {
    return activeProjectsCache.projects;
  }
  if (activeProjectsRequest) return activeProjectsRequest;

  activeProjectsRequest = getDocs(query(collection(db, projects), where('status', '==', PROPERTY_STATUS.ACTIVE)))
    .then((snapshot) => {
      const loadedProjects = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      activeProjectsCache = { loadedAt: Date.now(), projects: loadedProjects };
      return loadedProjects;
    })
    .finally(() => {
      activeProjectsRequest = null;
    });
  return activeProjectsRequest;
};

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const toOptionalNumber = (value) => {
  if (isBlank(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toRequiredNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const buildProjectPayload = (project = {}) => {
  const priceValue = toOptionalNumber(project.priceFrom ?? project.startingPrice);

  return {
    ...project,
    latitude: toRequiredNumber(project.latitude, CHAKAN_LOCATION.latitude),
    longitude: toRequiredNumber(project.longitude, CHAKAN_LOCATION.longitude),
    priceFrom: priceValue,
    startingPrice: priceValue,
    remainingPlots: toOptionalNumber(project.remainingPlots),
    cashbackAmount: Math.max(0, toOptionalNumber(project.cashbackAmount) || 0),
    amenities: normalizeAmenities(project.amenities),
    status: project.status || PROPERTY_STATUS.DRAFT
  };
};

export async function loadProjectLayouts(projectId) {
  const ref = collection(db, layouts);
  const q = query(ref, where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

export async function loadProjectLayout(layoutId) {
  const snapshot = await getDoc(doc(db, layouts, layoutId));
  if (!snapshot.exists()) throw new Error('This layout is no longer available.');
  return snapshot.data().polygonCoordinates || [];
}

export async function createProjectLayout(projectId, layoutData) {
  const reference = doc(collection(db, layouts));
  await setDoc(reference, {
    projectId,
    name: layoutData.name || 'Phase Layout',
    polygonCoordinates: layoutData.polygonCoordinates || [],
    color: layoutData.color || '#22c55e',
    visible: layoutData.visible !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return reference.id;
}

export async function saveProjectLayout(layoutId, polygonCoordinates) {
  await updateDoc(doc(db, layouts, layoutId), {
    polygonCoordinates,
    updatedAt: serverTimestamp()
  });
}

export async function updateProjectLayoutDetails(layoutId, details) {
  await updateDoc(doc(db, layouts, layoutId), {
    ...details,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProjectLayout(layoutId) {
  await deleteDoc(doc(db, layouts, layoutId));
}

export async function duplicateProjectLayout(layoutId) {
  const originalSnap = await getDoc(doc(db, layouts, layoutId));
  if (!originalSnap.exists()) throw new Error('Original layout not found.');
  const data = originalSnap.data();
  const reference = doc(collection(db, layouts));
  await setDoc(reference, {
    ...data,
    name: `${data.name} (Copy)`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return reference.id;
}

export async function updateProjectMarker(projectId, position) {
  await updateDoc(doc(db, projects, projectId), {
    latitude: position.lat,
    longitude: position.lng,
    updatedAt: serverTimestamp()
  });
  invalidateActiveProjectsCache();
}

export async function updateProjectBoundary(projectId, geometry) {
  await updateDoc(doc(db, projects, projectId), {
    layoutPolygon: geometry.layoutPolygon,
    layoutCenter: geometry.layoutCenter,
    layoutBounds: geometry.layoutBounds,
    layoutAreaSqFt: geometry.layoutAreaSqFt,
    updatedAt: serverTimestamp()
  });
  invalidateActiveProjectsCache();
}

export async function updateProjectDetails(projectId, projectData) {
  const { lastEditedAt: _lastEditedAt, ...payload } = projectData;
  const adminAudit = payload.lastEditedByRole === 'admin'
    ? {
      lastEditedBy: payload.lastEditedBy || '',
      lastEditedByRole: 'admin',
      lastEditedAt: serverTimestamp()
    }
    : {};

  await updateDoc(doc(db, projects, projectId), {
    ...buildProjectPayload(payload),
    ...adminAudit,
    updatedAt: serverTimestamp()
  });
  invalidateActiveProjectsCache();
}

export async function deleteProject(projectId) {
  await deleteDoc(doc(db, projects, projectId));
  invalidateActiveProjectsCache();
}

export async function loadProjectsInBounds(sw, ne) {
  const activeProjects = await loadActiveProjects();
  return activeProjects
    .filter(isProjectPublishable)
    .filter((project) => {
      const position = getProjectCoordinates(project);
      return position
        && position.lat >= sw.lat
        && position.lat <= ne.lat
        && position.lng >= sw.lng
        && position.lng <= ne.lng;
    });
}
