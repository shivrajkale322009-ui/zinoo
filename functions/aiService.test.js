const test = require('node:test');
const assert = require('node:assert/strict');
const { projectFingerprint } = require('./aiService');

test('project fingerprint is stable across object key order', () => {
  assert.equal(
    projectFingerprint({ name: 'Zinoo Greens', pricing: { from: 10, to: 20 } }),
    projectFingerprint({ pricing: { to: 20, from: 10 }, name: 'Zinoo Greens' })
  );
});

test('project fingerprint changes when saved project data changes', () => {
  assert.notEqual(
    projectFingerprint({ name: 'Zinoo Greens', availablePlots: 12 }),
    projectFingerprint({ name: 'Zinoo Greens', availablePlots: 11 })
  );
});
