// A cluster represents markers that visually overlap.  Keep this aligned with
// the minimum marker footprint rather than using a loose "nearby" radius.
export const CLUSTER_RADIUS_PX = 35;
export const CLUSTER_HEIGHT_PX = 32;
export const MIN_MARKER_OVERLAP = 0.25;
export const MIN_CLUSTER_SIZE = 2;

export const stableProjectKey = (project = {}) => String(
  project.id ?? `${project.name ?? ''}:${project.latitude ?? project.lat ?? ''}:${project.longitude ?? project.lng ?? ''}`
);

// Entries use world coordinates measured in pixels at the current zoom level.
// That keeps grouping tied to what the user can actually see on screen instead
// of a fixed real-world distance.
export function buildScreenSpaceClusters(entries, radius = CLUSTER_RADIUS_PX) {
  const ordered = [...entries].sort((left, right) => stableProjectKey(left.project).localeCompare(stableProjectKey(right.project)));
  const groups = [];
  for (const entry of ordered) {
    // Require more than 25% shared footprint area with every member, avoiding
    // both edge contact and transitive chains of otherwise separate markers.
    const group = groups.find((candidate) => candidate.every((other) => {
      const overlapWidth = Math.max(0, radius - Math.abs(entry.x - other.x));
      const overlapHeight = Math.max(0, CLUSTER_HEIGHT_PX - Math.abs(entry.y - other.y));
      return overlapWidth * overlapHeight > radius * CLUSTER_HEIGHT_PX * MIN_MARKER_OVERLAP;
    }));
    if (group) group.push(entry);
    else groups.push([entry]);
  }
  return groups;
}

export function createClusterRepresentations(entries, radius = CLUSTER_RADIUS_PX) {
  return buildScreenSpaceClusters(entries, radius).map((group) => ({
    kind: group.length >= MIN_CLUSTER_SIZE ? 'cluster' : 'single',
    entries: group
  }));
}

// World pixels depend only on coordinates and zoom, never the camera center.
export function createStablePropertyClusters(entries, zoom) {
  const scale = 256 * 2 ** zoom;
  const projected = entries.map((entry) => {
    const sin = Math.sin(Math.max(-85.05112878, Math.min(85.05112878, entry.position.lat)) * Math.PI / 180);
    return { ...entry, x: (entry.position.lng + 180) / 360 * scale,
      y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale };
  });
  const groups = zoom >= 20
    ? projected.map((entry) => ({ kind: 'single', entries: [entry] }))
    : createClusterRepresentations(projected);
  return groups.map((group) => ({ ...group, position: {
    lat: group.entries.reduce((sum, entry) => sum + entry.position.lat, 0) / group.entries.length,
    lng: group.entries.reduce((sum, entry) => sum + entry.position.lng, 0) / group.entries.length
  } }));
}
