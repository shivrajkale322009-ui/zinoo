import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjectRoutePath, getProjectRouteSlug } from './projectRoute.js';

test('parses only canonical project paths and preserves the persisted slug', () => {
  assert.equal(getProjectRouteSlug('/projects/Matoshri-Park-Phase-2/'), 'matoshri-park-phase-2');
  assert.equal(getProjectRouteSlug('/projects'), '');
  assert.equal(getProjectRouteSlug('/plots/matoshri-park-phase-2'), '');
  assert.equal(getProjectRoutePath({ canonicalSlug: 'matoshri-park-phase-2' }), '/projects/matoshri-park-phase-2');
});
