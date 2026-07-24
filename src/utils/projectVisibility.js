import statusDefinition from '../../functions/propertyStatus.json' with { type: 'json' };

export const PROPERTY_STATUS = Object.freeze(statusDefinition.statuses);
export const PROPERTY_STATUSES = Object.freeze(Object.values(PROPERTY_STATUS));
export const LEGACY_STATUS_MAP = Object.freeze(statusDefinition.legacyMap);

export function normalizePropertyStatus(value, fallback = PROPERTY_STATUS.DRAFT) {
  const token = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  return LEGACY_STATUS_MAP[token] || fallback;
}

export function isPropertyStatus(value) {
  return PROPERTY_STATUSES.includes(value);
}

export function getProjectStatus(project = {}) {
  return normalizePropertyStatus(project.status);
}

// Single source of truth for every buyer-facing surface.
export function isPublicProperty(project) {
  return Boolean(project) && project.status === PROPERTY_STATUS.ACTIVE;
}

export const isProjectPublishable = isPublicProperty;
export const getProjectApprovalStatus = getProjectStatus;

export function getProjectCoordinates(project) {
  if (!project || typeof project !== 'object') return null;
  const candidates = [
    [project.latitude, project.longitude],
    [project.location?.lat ?? project.location?.latitude, project.location?.lng ?? project.location?.longitude],
    [project.coords?.[0], project.coords?.[1]]
  ];
  for (const [latitudeValue, longitudeValue] of candidates) {
    const lat = Number(latitudeValue);
    const lng = Number(longitudeValue);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0)) return { lat, lng };
  }
  return null;
}
