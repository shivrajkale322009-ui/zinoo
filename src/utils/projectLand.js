export const LAND_ZONE_OPTIONS = [
  { value: 'agricultural', label: 'Agricultural Zone' },
  { value: 'residential', label: 'Residential Zone' },
  { value: 'commercial', label: 'Commercial Zone' }
];

export const NA_STATUS_OPTIONS = [
  { value: 'na_approved', label: 'NA Approved' },
  { value: 'pending', label: 'NA Approval Pending' },
  { value: 'not_na', label: 'Not NA' }
];

const normalizeToken = (value) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_|_$/g, '');

const optionValue = (options, value) => {
  const token = normalizeToken(value);
  return options.find((option) => normalizeToken(option.value) === token || normalizeToken(option.label) === token)?.value || '';
};

export function getProjectLandZone(project) {
  if (!project) return '';
  return optionValue(LAND_ZONE_OPTIONS, project.landZone ?? project.zoneType ?? project.zoning);
}

export function getProjectNaStatus(project) {
  if (!project) return '';
  const explicit = optionValue(NA_STATUS_OPTIONS, project.naStatus ?? project.nonAgriculturalStatus);
  if (explicit) return explicit;
  if (project.isNA === true || project.nonAgricultural === true || project.naPlot === true) return 'na_approved';
  if (project.isNA === false || project.nonAgricultural === false || project.naPlot === false) return 'not_na';
  return '';
}

export function getLandZoneLabel(projectOrValue) {
  const value = typeof projectOrValue === 'object' ? getProjectLandZone(projectOrValue) : optionValue(LAND_ZONE_OPTIONS, projectOrValue);
  return LAND_ZONE_OPTIONS.find((option) => option.value === value)?.label || 'Zone not specified';
}

export function getNaStatusLabel(projectOrValue) {
  const value = typeof projectOrValue === 'object' ? getProjectNaStatus(projectOrValue) : optionValue(NA_STATUS_OPTIONS, projectOrValue);
  return NA_STATUS_OPTIONS.find((option) => option.value === value)?.label || 'NA status not specified';
}

export function matchesProjectFilters(project, filters = {}) {
  const startingPrice = Number(project?.priceFrom ?? project?.startingPrice ?? 0);
  const distance = Number(project?.distance ?? 0);
  const score = Number(project?.DruvioScore ?? project?.plotItScore ?? 0);
  const selectedZones = Array.isArray(filters.landZones) ? filters.landZones : [];
  const selectedNaStatuses = Array.isArray(filters.naStatuses) ? filters.naStatuses : [];

  if (Number.isFinite(filters.budgetMax) && startingPrice > filters.budgetMax) return false;
  if (Number.isFinite(filters.distanceMax) && distance > filters.distanceMax) return false;
  if (filters.bankLoan && project?.bankLoan !== true) return false;
  if (Number.isFinite(filters.minScore) && score < filters.minScore) return false;
  if (selectedZones.length && !selectedZones.includes(getProjectLandZone(project))) return false;
  if (selectedNaStatuses.length && !selectedNaStatuses.includes(getProjectNaStatus(project))) return false;
  return true;
}

export function withCanonicalLandFields(project = {}) {
  const landZone = getProjectLandZone(project);
  const naStatus = getProjectNaStatus(project);
  return {
    ...project,
    landZone,
    naStatus,
    naPlot: naStatus === 'na_approved'
  };
}
