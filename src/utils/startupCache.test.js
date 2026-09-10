import assert from 'node:assert/strict';
import test from 'node:test';
import { readPersistentCache, readStartupCache } from './startupCache.js';

test('saved preferences remain readable after startup data expires', () => {
  const values = new Map([
    ['flinok:startup:saved-projects:buyer-a', JSON.stringify({
      savedAt: Date.now() - (48 * 60 * 60 * 1000),
      value: ['project-a', 'project-b']
    })]
  ]);
  global.window = { localStorage: { getItem: (key) => values.get(key) || null } };

  assert.deepEqual(readStartupCache('saved-projects:buyer-a', []), []);
  assert.deepEqual(readPersistentCache('saved-projects:buyer-a', []), ['project-a', 'project-b']);
  assert.deepEqual(readPersistentCache('saved-projects:buyer-b', []), []);

  delete global.window;
});
