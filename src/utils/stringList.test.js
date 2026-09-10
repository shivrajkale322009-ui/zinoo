import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeStringList } from './stringList.js';

test('normalizes comma-separated list fields', () => {
  assert.deepEqual(normalizeStringList('Water, Electricity, Street Lights'), [
    'Water',
    'Electricity',
    'Street Lights'
  ]);
});

test('preserves checkbox array values and removes empty duplicates', () => {
  assert.deepEqual(normalizeStringList(['Water', ' Electricity ', '', 'Water']), [
    'Water',
    'Electricity'
  ]);
});

test('returns an empty list for missing or invalid values', () => {
  assert.deepEqual(normalizeStringList(undefined), []);
  assert.deepEqual(normalizeStringList({}), []);
});
