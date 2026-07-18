export const MAP_ZOOM_LEVELS = Object.freeze({
  CLUSTER_MAX: 12,
  MINIMAL_PROJECT_MIN: 13,
  POLYGON_MIN: 16
});

export function getMarkerVisualState(zoom, project, selected = false) {
  if (selected) return { tier: 'high', showPolygon: zoom >= MAP_ZOOM_LEVELS.POLYGON_MIN, clusterEligible: false };
  if (zoom <= MAP_ZOOM_LEVELS.CLUSTER_MAX) return { tier: 'low', showPolygon: false, clusterEligible: true };
  if (zoom < MAP_ZOOM_LEVELS.POLYGON_MIN) return { tier: 'medium', showPolygon: false, clusterEligible: true };
  return { tier: 'high', showPolygon: Boolean(project?.layoutPolygon), clusterEligible: false };
}
