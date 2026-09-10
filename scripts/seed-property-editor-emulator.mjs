/*
 * Seeds only localhost Firebase emulators. It never imports the production
 * Firebase configuration or accepts a remote host.
 *
 * Test credentials: seller@example.test, admin@example.test, buyer@example.test
 * Password: PropertyEditor123!
 */
const host = process.env.FIREBASE_EMULATOR_HOST || '127.0.0.1';
const projectId = process.env.FIREBASE_EMULATOR_PROJECT_ID || 'druvio';
const authBase = `http://${host}:9099/identitytoolkit.googleapis.com/v1`;
const firestoreBase = `http://${host}:8080/v1/projects/${projectId}/databases/(default)/documents`;
const password = 'PropertyEditor123!';

if (!['localhost', '127.0.0.1'].includes(host)) throw new Error('Refusing to seed a non-local Firebase host.');

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error?.message || `${response.status} ${response.statusText}`);
  return json;
};

const authUser = async (email) => {
  try {
    return await request(`${authBase}/accounts:signUp?key=fake-api-key`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true })
    });
  } catch (error) {
    if (!String(error.message).includes('EMAIL_EXISTS')) throw error;
    return request(`${authBase}/accounts:signInWithPassword?key=fake-api-key`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true })
    });
  }
};

const fieldValue = (value) => {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(fieldValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fieldValue(item)])) } };
};
const write = (path, data) => ({ update: { name: `projects/${projectId}/databases/(default)/documents/${path}`, fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, fieldValue(value)])) } });

const main = async () => {
  await request(`http://${host}:8080/`, { method: 'GET' }).catch(() => { throw new Error('Firestore emulator is not running. Start it with npm run emulators first.'); });
  const [seller, admin, buyer] = await Promise.all([authUser('seller@example.test'), authUser('admin@example.test'), authUser('buyer@example.test')]);
  const boundary = [{ lat: 18.7501, lng: 73.8601 }, { lat: 18.7501, lng: 73.8611 }, { lat: 18.7511, lng: 73.8611 }, { lat: 18.7501, lng: 73.8601 }];
  const project = {
    ownerId: seller.localId, sellerUid: seller.localId, sellerId: seller.localId, createdBy: seller.localId, createdByRole: 'seller',
    name: 'Emulator Meadows', developer: 'Example Developments', developerName: 'Example Developments', status: 'pending', availabilityStatus: 'coming_soon',
    contactNumber: '9000000001', whatsappNumber: '9000000002', siteVisitContact: '9000000001',
    village: 'Test Village', taluka: 'Test Taluka', district: 'Test District', state: 'Maharashtra', locality: 'Test Locality', area: 'Test Locality', postalCode: '410501', completeAddress: '123 Emulator Road, Test Village', locationLabel: 'Test Village • Test Taluka • Test Locality',
    latitude: 18.7505, longitude: 73.8605, coords: [18.7505, 73.8605], location: { lat: 18.7505, lng: 73.8605 }, mapMarkerConfirmed: true,
    startingPrice: 1250000, priceFrom: 1250000, cashbackPerGuntha: 15000, cashbackAmount: 15000, plotAreaMinSqFt: 1200, plotAreaMaxSqFt: 2400, sizeMin: 1200, sizeMax: 2400, remainingPlots: 18, totalPlots: 40,
    landZone: 'residential', naStatus: 'na_approved', naPlot: true, bankLoan: true, installmentPurchaseAvailable: false, reraNumber: 'TEST-RERA-001', reraStatus: 'verified', titleStatus: 'verified', pmrdaApproved: true,
    amenities: ['Garden'], amenityIds: ['garden'], description: 'A clearly fake property used only for local editor verification.',
    thumbnail: 'https://example.test/emulator-hero.webp', heroImage: 'https://example.test/emulator-hero.webp', galleryImages: [{ id: 'gallery-1', downloadURL: 'https://example.test/gallery.webp', storagePath: 'project-media/test/gallery.webp', fileName: 'gallery.webp' }], videos: [],
    documents: [{ id: 'canonical-document', type: 'approved_layout', displayName: 'Canonical Layout Plan', url: 'https://example.test/layout.pdf', downloadURL: 'https://example.test/layout.pdf', storagePath: 'project-documents/test/layout.pdf', fileName: 'layout.pdf', contentType: 'application/pdf', size: 1024, status: 'verified', verified: true, showOnDetails: true, enabled: true }],
    layoutPolygon: { type: 'Polygon', points: boundary }, layoutCenter: { lat: 18.7506, lng: 73.8606 }, layoutBounds: { north: 18.7511, east: 73.8611, south: 18.7501, west: 73.8601 }, layoutAreaSqFt: 100000,
    display: { schemaVersion: 1, basic: { projectName: 'Emulator Meadows', location: 'Test Village • Test Taluka • Test Locality' }, pricing: { startingPrice: 1250000 }, cashback: { enabled: true, amount: 15000 }, documents: { items: [{ id: 'stale-document', title: 'Stale document', url: 'https://example.test/stale.pdf', verified: true }] }, map: { latitude: 18.7505, longitude: 73.8605, address: '123 Emulator Road, Test Village' }, actions: { callNumber: '9000000001' } }
  };
  await request(`${firestoreBase}:commit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ writes: [
    write(`users/${seller.localId}`, { displayName: 'Local Seller', email: 'seller@example.test', role: 'seller', permissions: { seller: true, admin: false, buyer: true } }),
    write(`users/${admin.localId}`, { displayName: 'Local Admin', email: 'admin@example.test', role: 'admin', permissions: { seller: true, admin: true, buyer: true } }),
    write(`users/${buyer.localId}`, { displayName: 'Local Buyer', email: 'buyer@example.test', role: 'buyer', permissions: { seller: false, admin: false, buyer: true } }),
    write('amenityCatalog/garden', { name: 'Garden', isActive: true }), write('projects/property-editor-e2e', project)
  ] }) });
  console.log('Seeded local emulator project property-editor-e2e. Test accounts use password PropertyEditor123!.');
};

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
