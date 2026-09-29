import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeFreshProject } from './projectFreshness.js';

test('opening an older public route preserves the current price and name', () => {
  const current = { id: 'a', name: 'Veershree Enclave', startingPrice: 2000000, updatedAt: { seconds: 200 } };
  const route = { id: 'a', name: 'Demo', startingPrice: 1000000, updatedAt: { seconds: 100 }, slug: 'existing-url' };
  const result = mergeFreshProject(current, route);
  assert.equal(result.name, current.name);
  assert.equal(result.startingPrice, 2000000);
  assert.equal(result.slug, route.slug);
});

test('new source snapshots refresh an open project', () => {
  const result = mergeFreshProject(
    { id: 'a', startingPrice: 600000, updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'a', startingPrice: 700000, updatedAt: { toMillis: () => Date.parse('2026-09-01T00:00:00Z') } }
  );
  assert.equal(result.startingPrice, 700000);
});

test('selecting a different project does not copy the previous price', () => {
  const incoming = { id: 'b', startingPrice: 2000000 };
  assert.equal(mergeFreshProject({ id: 'a', startingPrice: 700000 }, incoming), incoming);
});
