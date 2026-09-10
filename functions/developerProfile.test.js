const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDeveloperProfileUpdate } = require('./developerProfile');

const valid = {
  businessName: 'Blue Sky Estates', publicDescription: '', publicLogo: '',
  publicOfficeLocation: 'Chakan, Pune', publicPhone: '+91 98765 43210',
  publicWebsite: 'https://example.com', yearsInBusiness: 8,
  developerProfileVisible: true
};

test('developer profile update returns only allowlisted normalized fields', () => {
  assert.deepEqual(validateDeveloperProfileUpdate({ ...valid, businessName: '  Blue Sky Estates  ' }), valid);
});

test('developer profile update rejects privilege and identity fields', () => {
  assert.throws(() => validateDeveloperProfileUpdate({ ...valid, role: 'admin' }), /unsupported fields/);
  assert.throws(() => validateDeveloperProfileUpdate({ ...valid, verified: true }), /unsupported fields/);
  assert.throws(() => validateDeveloperProfileUpdate({ ...valid, ownerId: 'other' }), /unsupported fields/);
});

test('developer profile update validates URLs, years, and visibility', () => {
  assert.throws(() => validateDeveloperProfileUpdate({ ...valid, publicWebsite: 'http://example.com' }), /HTTPS/);
  assert.throws(() => validateDeveloperProfileUpdate({ ...valid, yearsInBusiness: 4.5 }), /whole number/);
  assert.throws(() => validateDeveloperProfileUpdate({ ...valid, developerProfileVisible: 'yes' }), /true or false/);
});
