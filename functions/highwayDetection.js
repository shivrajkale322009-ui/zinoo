const EARTH_RADIUS_METERS = 6371008.8;
const HIGHWAY_PATTERN = /(?:\bNH[\s-]*\d+[A-Z]*\b|\bSH[\s-]*\d+[A-Z]*\b|\bnational highway\b|\bstate highway\b|\bexpressway\b|\bhighway\b|\bmahamarg\b)/i;

function toRadians(value) { return Number(value) * Math.PI / 180; }
function toDegrees(value) { return Number(value) * 180 / Math.PI; }

function distanceMeters(from, to) {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function destinationPoint(origin, distance, bearing) {
  if (!distance) return { ...origin };
  const angularDistance = distance / EARTH_RADIUS_METERS;
  const bearingRadians = toRadians(bearing);
  const latitude = toRadians(origin.latitude);
  const longitude = toRadians(origin.longitude);
  const targetLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(angularDistance)
    + Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearingRadians)
  );
  const targetLongitude = longitude + Math.atan2(
    Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(latitude),
    Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(targetLatitude)
  );
  return { latitude: toDegrees(targetLatitude), longitude: toDegrees(targetLongitude) };
}

function buildSearchPoints(origin) {
  const rings = [0, 100, 250, 500, 1000, 2000, 3500, 5000];
  return rings.flatMap((radius) => radius === 0
    ? [{ ...origin }]
    : Array.from({ length: 12 }, (_, index) => destinationPoint(origin, radius, index * 30)));
}

function normalizeHighwayName(name = '') {
  const value = String(name).trim();
  const abbreviated = value.match(/\b(NH|SH)[\s-]*(\d+[A-Z]*)\b/i);
  if (abbreviated) return `${abbreviated[1].toUpperCase()}-${abbreviated[2].toUpperCase()}`;
  return value;
}

function highwayNameFromGeocode(payload = {}) {
  for (const result of payload.results || []) {
    const route = (result.address_components || []).find((component) => component.types?.includes('route'));
    const candidates = [route?.short_name, route?.long_name, result.formatted_address].filter(Boolean);
    const match = candidates.find((candidate) => HIGHWAY_PATTERN.test(candidate));
    if (match) return normalizeHighwayName(match);
  }
  return '';
}

async function fetchJson(url, fetchImpl = fetch) {
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`Google Maps request failed with HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error || (payload.status && !['OK', 'ZERO_RESULTS'].includes(payload.status))) {
    throw new Error(payload.error?.message || payload.error_message || payload.status);
  }
  return payload;
}

async function detectNearestHighway({ latitude, longitude, apiKey, fetchImpl = fetch }) {
  const origin = { latitude: Number(latitude), longitude: Number(longitude) };
  if (!Number.isFinite(origin.latitude) || !Number.isFinite(origin.longitude)) throw new Error('Valid coordinates are required.');
  if (!apiKey) throw new Error('Google Maps server API key is not configured.');

  const points = buildSearchPoints(origin);
  const pointValue = points.map((point) => `${point.latitude},${point.longitude}`).join('|');
  const roadsUrl = `https://roads.googleapis.com/v1/nearestRoads?points=${encodeURIComponent(pointValue)}&key=${encodeURIComponent(apiKey)}`;
  const roads = await fetchJson(roadsUrl, fetchImpl);
  const byPlaceId = new Map();
  for (const snapped of roads.snappedPoints || []) {
    if (!snapped.placeId || !snapped.location) continue;
    const candidate = {
      placeId: snapped.placeId,
      location: snapped.location,
      distance: distanceMeters(origin, snapped.location)
    };
    const existing = byPlaceId.get(candidate.placeId);
    if (!existing || candidate.distance < existing.distance) byPlaceId.set(candidate.placeId, candidate);
  }

  const candidates = [...byPlaceId.values()].sort((a, b) => a.distance - b.distance).slice(0, 40);
  const named = await Promise.all(candidates.map(async (candidate) => {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(candidate.placeId)}&key=${encodeURIComponent(apiKey)}`;
    const geocode = await fetchJson(geocodeUrl, fetchImpl);
    return { ...candidate, highwayName: highwayNameFromGeocode(geocode) };
  }));
  const highway = named.filter((candidate) => candidate.highwayName).sort((a, b) => a.distance - b.distance)[0];
  if (!highway) return { found: false };
  const highwayDistance = Math.max(0, Math.round(highway.distance));
  return {
    found: true,
    highwayName: highway.highwayName,
    highwayDistance,
    isHighwayTouch: highwayDistance <= 100
  };
}

module.exports = {
  buildSearchPoints,
  detectNearestHighway,
  distanceMeters,
  highwayNameFromGeocode,
  normalizeHighwayName
};
