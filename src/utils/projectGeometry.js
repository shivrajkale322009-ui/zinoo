const pointsEqual = (first, second) => first.lat === second.lat && first.lng === second.lng;

const orientation = (first, second, third) =>
  Math.sign((second.lng - first.lng) * (third.lat - first.lat) - (second.lat - first.lat) * (third.lng - first.lng));

const segmentsIntersect = (first, second, third, fourth) =>
  orientation(first, second, third) !== orientation(first, second, fourth)
  && orientation(third, fourth, first) !== orientation(third, fourth, second);

export const normalizeProjectPolygon = (value) => {
  const coordinates = value?.points
    || (value?.type === 'Polygon' ? value.coordinates?.[0] : value);
  if (!Array.isArray(coordinates)) return [];
  const geoJsonOrder = value?.type === 'Polygon' && !value?.points;
  const path = coordinates.map((point) => {
    if (Array.isArray(point)) return geoJsonOrder
      ? { lat: Number(point[1]), lng: Number(point[0]) }
      : { lat: Number(point[0]), lng: Number(point[1]) };
    return { lat: Number(point?.lat ?? point?.latitude), lng: Number(point?.lng ?? point?.longitude) };
  }).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180);
  if (path.length > 1 && pointsEqual(path[0], path[path.length - 1])) path.pop();
  return path;
};

export const hasSelfIntersection = (path) => {
  for (let firstIndex = 0; firstIndex < path.length; firstIndex += 1) {
    const firstNext = (firstIndex + 1) % path.length;
    for (let secondIndex = firstIndex + 1; secondIndex < path.length; secondIndex += 1) {
      const secondNext = (secondIndex + 1) % path.length;
      if (firstIndex === secondIndex || firstNext === secondIndex || secondNext === firstIndex) continue;
      if (segmentsIntersect(path[firstIndex], path[firstNext], path[secondIndex], path[secondNext])) return true;
    }
  }
  return false;
};

export const buildProjectGeometry = (path, maps) => {
  const normalized = normalizeProjectPolygon(path);
  if (normalized.length < 3) throw new Error('Add at least three boundary points.');
  if (hasSelfIntersection(normalized)) throw new Error('The project boundary cannot cross itself.');
  const areaSqFt = maps.geometry.spherical.computeArea(normalized) * 10.7639104167;
  if (areaSqFt < 100) throw new Error('The project boundary is too small. Enlarge it and try again.');

  const bounds = new maps.LatLngBounds();
  normalized.forEach((point) => bounds.extend(point));
  const center = bounds.getCenter().toJSON();
  const northEast = bounds.getNorthEast().toJSON();
  const southWest = bounds.getSouthWest().toJSON();
  const closed = [...normalized, normalized[0]];

  return {
    // Firestore does not support nested arrays. Use a flat array of point maps
    // while retaining the Polygon type for compatibility with existing readers.
    layoutPolygon: { type: 'Polygon', points: closed.map((point) => ({ lat: point.lat, lng: point.lng })) },
    layoutCenter: center,
    layoutBounds: { north: northEast.lat, east: northEast.lng, south: southWest.lat, west: southWest.lng },
    layoutAreaSqFt: Math.round(areaSqFt)
  };
};
