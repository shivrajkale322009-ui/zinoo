export const CLUSTER_RADIUS_PX = 64;
export const MIN_CLUSTER_SIZE = 2;

export const stableProjectKey = (project = {}) => String(
  project.id ?? `${project.name ?? ''}:${project.latitude ?? project.lat ?? ''}:${project.longitude ?? project.lng ?? ''}`
);

// Entries use world coordinates measured in pixels at the current zoom level.
// That keeps grouping tied to what the user can actually see on screen instead
// of a fixed real-world distance.
export function buildScreenSpaceClusters(entries, radius = CLUSTER_RADIUS_PX) {
  const ordered = [...entries].sort((left, right) => stableProjectKey(left.project).localeCompare(stableProjectKey(right.project)));
  const parents = ordered.map((_, index) => index);
  const buckets = new Map();
  const cellSize = radius;
  const root = (index) => {
    while (parents[index] !== index) {
      parents[index] = parents[parents[index]];
      index = parents[index];
    }
    return index;
  };
  const join = (left, right) => {
    const leftRoot = root(left);
    const rightRoot = root(right);
    if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot;
  };

  ordered.forEach((entry, index) => {
    const cellX = Math.floor(entry.x / cellSize);
    const cellY = Math.floor(entry.y / cellSize);
    for (let x = cellX - 1; x <= cellX + 1; x += 1) {
      for (let y = cellY - 1; y <= cellY + 1; y += 1) {
        for (const otherIndex of buckets.get(`${x}:${y}`) || []) {
          const other = ordered[otherIndex];
          if (Math.hypot(entry.x - other.x, entry.y - other.y) <= radius) join(index, otherIndex);
        }
      }
    }
    const bucketKey = `${cellX}:${cellY}`;
    buckets.set(bucketKey, [...(buckets.get(bucketKey) || []), index]);
  });

  return [...ordered.reduce((groups, entry, index) => {
    const groupId = root(index);
    if (!groups.has(groupId)) groups.set(groupId, []);
    groups.get(groupId).push(entry);
    return groups;
  }, new Map()).values()];
}

export function createClusterRepresentations(entries, radius = CLUSTER_RADIUS_PX) {
  return buildScreenSpaceClusters(entries, radius).map((group) => ({
    kind: group.length >= MIN_CLUSTER_SIZE ? 'cluster' : 'single',
    entries: group
  }));
}
