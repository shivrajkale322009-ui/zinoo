export const MAP_MARKER_ZOOM = Object.freeze({
  HIDDEN_MAX: 10,
  LOCATION_PIN_MAX: 13,
  PROJECT_LABEL_MIN: 14,
  POLYGON_MIN: 17
});

export const MARKER_COLLISION_PIXELS = Object.freeze({
  LABEL_WIDTH: 50,
  LABEL_HEIGHT: 32,
  // Native price-label footprint: 46px minimum body width plus its 7px tail.
  // This is a collision-only value; it does not alter marker rendering.
  MOBILE_LABEL_WIDTH: 50,
  MOBILE_LABEL_HEIGHT: 32,
  PIN_RADIUS: 18
});

export function calculateMarkerPriority(project = {}, { isSelected = false } = {}) {
  const record = project && typeof project === 'object' ? project : {};
  const score = Number(record.DruvioScore ?? record.druvioScore ?? record.plotItScore ?? 0) || 0;
  const verified = record.isVerified === true || record.verified === true;
  const hasPrice = Number(record.priceFrom ?? record.startingPrice ?? 0) > 0;
  const hasPolygon = Array.isArray(record.polygonCoordinates)
    ? record.polygonCoordinates.length >= 3
    : Boolean(record.layoutPolygon);
  return score + (isSelected ? 10000 : 0) + (verified ? 300 : 0) + (record.isFeatured ? 150 : 0) + (hasPrice ? 40 : 0) + (hasPolygon ? 30 : 0);
}

export function getProjectMarkerState({ zoom, project, selectedProjectId, collisionGroup = false, visibleRank = 0 } = {}) {
  const normalizedZoom = Number(zoom) || 0;
  const selected = Boolean(project?.id && project.id === selectedProjectId);
  const labelVisible = normalizedZoom >= MAP_MARKER_ZOOM.PROJECT_LABEL_MIN && (!collisionGroup || selected || visibleRank === 0);
  const mode = labelVisible ? 'full-label' : 'price-only';
  const priority = calculateMarkerPriority(project, { isSelected: selected });

  return {
    mode,
    showProjectName: mode === 'full-label',
    showPrice: mode === 'full-label' || mode === 'price-only',
    showPolygon: normalizedZoom >= MAP_MARKER_ZOOM.POLYGON_MIN && Boolean(project?.layoutPolygon),
    priority,
    markerScale: selected ? 1.08 : 1,
    zIndex: selected ? 9999 : Math.round(priority),
    interactive: true,
    selectedStyle: selected,
    collisionGroup,
    clusterEligible: normalizedZoom <= MAP_MARKER_ZOOM.LOCATION_PIN_MAX
  };
}

export const getMarkerVisualState = (zoom, project, selected = false) => {
  const state = getProjectMarkerState({ zoom, project, selectedProjectId: selected ? project?.id : undefined });
  return { ...state, tier: state.mode === 'full-label' ? 'label' : 'pin' };
};
