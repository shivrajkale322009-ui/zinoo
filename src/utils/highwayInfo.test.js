import test from 'node:test';
import assert from 'node:assert/strict';

import { applyHighwayResult, formatHighwayDescriptionLine } from './highwayInfo.js';

test('formats highway touch at 100 metres or less', () => {
  assert.equal(formatHighwayDescriptionLine({ highwayName: 'NH-48', highwayDistance: 100, isHighwayTouch: true }), '🛣️ Highway Touch');
});

test('replaces generated highway information without duplication', () => {
  const updated = applyHighwayResult({ description: 'Premium plots\n\n📍 620 m from Old Highway' }, {
    found: true,
    highwayName: 'NH-48',
    highwayDistance: 180,
    lastCalculatedAt: '2026-08-03T00:00:00.000Z'
  });
  assert.equal(updated.description, 'Premium plots\n\n📍 180 m from NH-48');
  assert.equal(updated.highwayDistance, 180);
  assert.equal(updated.isHighwayTouch, false);
});

test('removes highway information when no highway is found', () => {
  const updated = applyHighwayResult({ description: 'Premium plots\n\n🛣️ Highway Touch' }, { found: false });
  assert.equal(updated.description, 'Premium plots');
  assert.equal(updated.highwayName, '');
});
