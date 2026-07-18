const APPROVED_STATUSES = new Set(['approved', 'active', 'published']);
const HIDDEN_VISIBILITIES = new Set(['hidden', 'private', 'unpublished']);

const normalizedText = (value) => String(value ?? '').trim().toLowerCase();

export function getProjectApprovalStatus(project = {}) {
  const explicitStatus = [project.status, project.approvalStatus, project.reviewStatus]
    .map(normalizedText)
    .find(Boolean);

  if (APPROVED_STATUSES.has(explicitStatus)) return 'approved';
  if (explicitStatus === 'rejected') return 'rejected';
  if (project.isApproved === true) return 'approved';
  return explicitStatus || 'pending';
}

export function isProjectPublishable(project) {
  if (!project || getProjectApprovalStatus(project) !== 'approved') return false;
  if (project.archived === true || project.deleted === true || project.isPublished === false) return false;
  return !HIDDEN_VISIBILITIES.has(normalizedText(project.visibility));
}

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
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0)) {
      return { lat, lng };
    }
  }

  return null;
}
