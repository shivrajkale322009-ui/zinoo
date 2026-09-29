const updatedMillis = (value) => {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Public projections can arrive after the source project snapshot. Never roll
// a selected project's price/name back when an older projection arrives.
export function mergeFreshProject(current, incoming) {
  if (!current || String(current.id) !== String(incoming?.id)) return incoming;
  if (updatedMillis(current.updatedAt) > updatedMillis(incoming.updatedAt)) {
    return { ...incoming, ...current };
  }
  return { ...current, ...incoming };
}
