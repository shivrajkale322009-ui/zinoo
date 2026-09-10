export function normalizeStringList(value) {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(items
    .map((item) => String(item ?? '').trim())
    .filter(Boolean))];
}
