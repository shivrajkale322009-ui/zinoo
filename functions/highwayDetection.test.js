const test = require('node:test');
const assert = require('node:assert/strict');

const { buildSearchPoints, distanceMeters, highwayNameFromGeocode, normalizeHighwayName } = require('./highwayDetection');

test('builds no more than the Roads API limit of 100 points', () => {
  assert.ok(buildSearchPoints({ latitude: 18.75, longitude: 73.86 }).length <= 100);
});

test('normalizes Indian highway abbreviations', () => {
  assert.equal(normalizeHighwayName('NH 48'), 'NH-48');
  assert.equal(normalizeHighwayName('sh-54'), 'SH-54');
});

test('extracts a highway route from geocoding components', () => {
  assert.equal(highwayNameFromGeocode({ results: [{ address_components: [{ long_name: 'National Highway 48', short_name: 'NH 48', types: ['route'] }] }] }), 'NH-48');
});

test('calculates metre distance between coordinates', () => {
  const distance = distanceMeters({ latitude: 18.75, longitude: 73.86 }, { latitude: 18.751, longitude: 73.86 });
  assert.ok(distance > 110 && distance < 112);
});
