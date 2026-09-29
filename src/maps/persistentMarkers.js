// Preserve the marker and its attached DOM when its visual representation is unchanged.
export function reconcileMarkers(previous, descriptors, map, createMarker) {
  const next = new Map();
  for (const descriptor of descriptors) {
    let record = previous.get(descriptor.key);
    if (!record) {
      const marker = createMarker(descriptor.options);
      record = { marker, descriptor };
      marker.addEventListener('gmp-click', () => record.descriptor.onClick());
    } else {
      const before = record.descriptor.options;
      const after = descriptor.options;
      for (const key of Object.keys(after)) {
        const unchanged = key === 'content'
          ? before.content.outerHTML === after.content.outerHTML
          : key === 'position'
            ? before.position.lat === after.position.lat && before.position.lng === after.position.lng
            : before[key] === after[key];
        if (!unchanged) record.marker[key] = after[key];
      }
      record.descriptor = descriptor;
    }
    if (record.marker.map !== map) record.marker.map = map;
    next.set(descriptor.key, record);
  }
  for (const [key, record] of previous) {
    if (!next.has(key)) record.marker.map = null;
  }
  return next;
}
