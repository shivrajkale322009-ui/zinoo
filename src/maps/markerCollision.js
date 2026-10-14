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
  const cellSize = entries.reduce((size, entry) => Math.max(size, entry.width || radius, entry.height || CLUSTER_HEIGHT_PX), radius);
  const cells = new Map();
  for (const entry of ordered) {
    // Require more than 25% shared footprint area with every member, avoiding
    // both edge contact and transitive chains of otherwise separate markers.
    const cx = Math.floor(entry.x / cellSize), cy = Math.floor(entry.y / cellSize);
    const candidates = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      candidates.push(...(cells.get(`${cx + dx}:${cy + dy}`) || []));
    }
    const group = candidates.sort((a, b) => a.order - b.order).find((candidate) => candidate.every((other) => {
      const ew = entry.width || radius, ow = other.width || radius;
      const eh = entry.height || CLUSTER_HEIGHT_PX, oh = other.height || CLUSTER_HEIGHT_PX;
      const overlapWidth = Math.max(0, Math.min(entry.x + ew / 2, other.x + ow / 2) - Math.max(entry.x - ew / 2, other.x - ow / 2));
      const overlapHeight = Math.max(0, Math.min(entry.y + eh / 2, other.y + oh / 2) - Math.max(entry.y - eh / 2, other.y - oh / 2));
      return overlapWidth * overlapHeight > Math.min(ew * eh, ow * oh) * MIN_MARKER_OVERLAP;
    }));
    if (group) group.push(entry);
    else {
      const created = [entry];
      Object.defineProperty(created, 'order', { value: groups.length });
      groups.push(created);
      const key = `${cx}:${cy}`;
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(created);
    }
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
  const groups = createClusterRepresentations(projected);
  return groups.map((group) => ({ ...group, position: {
    lat: group.entries.reduce((sum, entry) => sum + entry.position.lat, 0) / group.entries.length,
    lng: group.entries.reduce((sum, entry) => sum + entry.position.lng, 0) / group.entries.length
  } }));
}
