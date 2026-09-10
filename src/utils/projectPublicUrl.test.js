import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjectPublicPath, getProjectPublicUrl } from './projectPublicUrl.js';

test('builds one canonical project path from the persisted slug', () => {
  assert.equal(getProjectPublicPath({ canonicalSlug: 'matoshri-park' }), '/projects/matoshri-park');
  assert.equal(getProjectPublicUrl({ canonicalSlug: 'matoshri-park' }), 'https://zinoo.in/projects/matoshri-park');
});

test('does not invent a URL when a project has not been published', () => {
  assert.equal(getProjectPublicPath({ id: 'private-project' }), '');
});
