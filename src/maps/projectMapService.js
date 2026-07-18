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

const projects = 'projects';
const layouts = 'layouts';

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
    latitude: toRequiredNumber(project.latitude),
    longitude: toRequiredNumber(project.longitude),
    priceFrom: priceValue,
    startingPrice: priceValue,
    remainingPlots: toOptionalNumber(project.remainingPlots),
    cashbackAmount: Math.max(0, toOptionalNumber(project.cashbackAmount) || 0),
    amenities: normalizeAmenities(project.amenities),
    status: project.status || 'approved'
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

export async function createMapProject(project) {
  const reference = doc(collection(db, projects));
  await setDoc(reference, {
    ...buildProjectPayload(project),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return reference.id;
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
}

export async function updateProjectDetails(projectId, projectData) {
  await updateDoc(doc(db, projects, projectId), {
    ...buildProjectPayload(projectData),
    updatedAt: serverTimestamp()
  });
}

export async function deleteProject(projectId) {
  await deleteDoc(doc(db, projects, projectId));
}

export async function loadProjectsInBounds(sw, ne) {
  const ref = collection(db, projects);
  const q = query(
    ref,
    where('latitude', '>=', sw.lat),
    where('latitude', '<=', ne.lat)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .filter(p => p.longitude >= sw.lng && p.longitude <= ne.lng);
}
