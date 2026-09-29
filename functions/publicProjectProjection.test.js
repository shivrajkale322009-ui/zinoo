const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PUBLIC_FALLBACK_IMAGE,
  normalizeLocation,
  safePublicMediaUrl,
  sanitizePublicProject,
  selectCanonicalSlug,
  slugify
} = require('./publicProjectProjection');

test('projection keeps canonical public fields and excludes private project data', () => {
  const result = sanitizePublicProject({
    id: 'p1', name: 'Matoshri Park', status: 'active', village: 'Kuruli', startingPrice: 1200000,
    ownerId: 'private-owner', sellerUid: 'private-seller', whatsappNumber: '919999999999',
    reviewedBy: 'admin', documents: [{ secret: true }]
  }, 'matoshri-park');
  assert.equal(result.slug, 'matoshri-park');
  assert.equal(result.locationSlug, 'kuruli');
  assert.equal(result.status, 'active');
  assert.equal(result.publicContactNumber, '919999999999');
  for (const field of ['ownerId', 'sellerUid', 'whatsappNumber', 'reviewedBy', 'documents']) assert.equal(field in result, false);
});

test('public projects include only geographic boundary coordinates for guest maps', () => {
  const points = [{ lat: 18, lng: 73, internalNote: 'private' }, { lat: 19, lng: 73 }, { lat: 19, lng: 74 }];
  const result = sanitizePublicProject({ name: 'Map project', layoutPolygon: { type: 'Polygon', points, ownerId: 'private' } }, 'map-project');
  assert.deepEqual(result.layoutPolygon, { type: 'Polygon', points: [{ lat: 18, lng: 73 }, { lat: 19, lng: 73 }, { lat: 19, lng: 74 }] });
});

test('public boundaries support GeoJSON and omit invalid or degenerate coordinates', () => {
  assert.deepEqual(sanitizePublicProject({ layoutPolygon: { type: 'Polygon', coordinates: [[[73, 18], [73, 19], [74, 19]]] } }, 'map-project').layoutPolygon.points,
    [{ lat: 18, lng: 73 }, { lat: 19, lng: 73 }, { lat: 19, lng: 74 }]);
  for (const layoutPolygon of [undefined, [], [{ lat: 18, lng: 73 }], [{ lat: 18, lng: 73 }, { lat: 19, lng: 73 }, { lat: null, lng: 74 }]]) {
    assert.equal(sanitizePublicProject({ layoutPolygon }, 'map-project').layoutPolygon, null);
  }
});

test('public projection includes only project amenities and never display/master fallbacks', () => {
  const selected = sanitizePublicProject({
    name: 'Project A', amenities: ['Garden', 'CCTV'],
    display: { amenities: { items: [{ title: 'Swimming Pool', enabled: true }] } }
  }, 'project-a');
  const empty = sanitizePublicProject({
    name: 'Project B', amenities: [],
    display: { amenities: { items: [{ title: 'Clubhouse', enabled: true }] } }
  }, 'project-b');
  assert.deepEqual(selected.amenities, ['Garden', 'CCTV']);
  assert.deepEqual(empty.amenities, []);
});

test('public projection exposes the admin-controlled property name badge', () => {
  const result = sanitizePublicProject({
    name: 'Project A',
    display: { verified: { showNameBadge: true } }
  }, 'project-a');
  assert.equal(result.showVerifiedNameBadge, true);
});

test('location identity is normalized without deleting legacy location fields', () => {
  assert.deepEqual(normalizeLocation({ village: 'Nighoje', taluka: 'Khed', district: 'Pune' }), {
    id: 'nighoje', name: 'Nighoje', slug: 'nighoje', locality: '', city: '', taluka: 'Khed', district: 'Pune',
    state: 'Maharashtra', country: 'India', latitude: null, longitude: null, description: '',
    identityKey: 'pune|khed|nighoje'
  });
  assert.equal(slugify('Matoshri Park Phase 2'), 'matoshri-park-phase-2');
});

test('public media accepts Firebase Storage download URLs with their required access token', () => {
  assert.equal(safePublicMediaUrl('https://zinoo.in/projects/hero.webp'), 'https://zinoo.in/projects/hero.webp');
  assert.equal(
    safePublicMediaUrl('https://firebasestorage.googleapis.com/v0/b/druvio/o/project-media%2Fproject.webp?alt=media&token=secret'),
    'https://firebasestorage.googleapis.com/v0/b/druvio/o/project-media%2Fproject.webp?alt=media&token=secret'
  );
  for (const unsafe of [
    '/projects/hero.webp',
    './projects/hero.webp',
    'http://zinoo.in/hero.webp',
    'https://localhost/hero.webp',
    'https://example.com/hero.webp?token=secret',
    'not a URL'
  ]) assert.equal(safePublicMediaUrl(unsafe), '');
});

test('public projection includes safe uploaded video URLs for the buyer media carousel', () => {
  const result = sanitizePublicProject({
    name: 'Video Project',
    videos: [
      { id: 'tour', downloadURL: 'https://firebasestorage.googleapis.com/v0/b/druvio/o/project-media%2Ftour.mp4?alt=media&token=secret' },
      { id: 'unsafe', downloadURL: 'http://example.com/tour.mp4' }
    ]
  }, 'video-project');
  assert.deepEqual(result.videos, [{
    id: 'tour',
    downloadURL: 'https://firebasestorage.googleapis.com/v0/b/druvio/o/project-media%2Ftour.mp4?alt=media&token=secret'
  }]);
});

test('public project uses a safe OG fallback for relative, invalid, or missing hero media', () => {
  for (const thumbnail of ['/hero.webp', 'javascript:alert(1)', undefined]) {
    assert.equal(sanitizePublicProject({ name: 'Safe Project', thumbnail }, 'safe-project').primaryImage, PUBLIC_FALLBACK_IMAGE);
  }
  assert.equal(
    sanitizePublicProject({ name: 'Safe Project', thumbnail: 'https://cdn.zinoo.in/hero.webp' }, 'safe-project').primaryImage,
    'https://cdn.zinoo.in/hero.webp'
  );
});

test('reactivation and name changes preserve the persisted canonical slug', () => {
  const existing = { slug: 'matoshri-park' };
  assert.equal(selectCanonicalSlug({ name: 'Matoshri Park Renamed', status: 'active', publicSlug: 'matoshri-park' }, existing), 'matoshri-park');
  assert.equal(selectCanonicalSlug({ name: 'Matoshri Park', status: 'active', publicSlug: 'matoshri-park-phase-2' }, existing), 'matoshri-park-phase-2');
});
