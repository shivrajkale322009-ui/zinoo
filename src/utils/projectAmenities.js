const cleanText = (value) => String(value ?? '').trim();

export const normalizeAmenityNames = (value) => {
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(source.map(cleanText).filter(Boolean))];
};

export const normalizeAmenityIds = (value) => Array.isArray(value)
  ? [...new Set(value.map(cleanText).filter(Boolean))]
  : [];

export const activeAmenityCatalog = (catalog = []) => catalog
  .filter((item) => item?.isActive !== false && cleanText(item?.id) && cleanText(item?.name))
  .map((item) => ({ id: cleanText(item.id), name: cleanText(item.name) }));

export const projectAmenityNames = (project = {}) => normalizeAmenityNames(project.amenities);

export const withSelectedProjectAmenities = (project = {}, selectedIds = [], catalog = []) => {
  const ids = normalizeAmenityIds(selectedIds);
  const nameById = new Map(catalog.map((item) => [cleanText(item.id), cleanText(item.name)]));
  const previousIds = normalizeAmenityIds(project.amenityIds);
  const previousNames = normalizeAmenityNames(project.amenities);
  const previousNameById = new Map(previousIds.map((id, index) => [id, previousNames[index]]));

  return {
    ...project,
    amenityIds: ids,
    amenities: ids.map((id) => nameById.get(id) || previousNameById.get(id)).filter(Boolean)
  };
};
