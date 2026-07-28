import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjectPurchaseValue } from './purchaseValue.js';

test('uses purchasePrice when present', () => {
  assert.equal(getProjectPurchaseValue({ purchasePrice: 1250000, startingPrice: 900000 }), 1250000);
});

test('falls back to the current project startingPrice and legacy priceFrom', () => {
  assert.equal(getProjectPurchaseValue({ startingPrice: '1000000' }), 1000000);
  assert.equal(getProjectPurchaseValue({ priceFrom: 850000 }), 850000);
});

test('rejects missing and invalid purchase values before submission', () => {
  assert.throws(() => getProjectPurchaseValue({}), /Purchase value is missing/);
  assert.throws(() => getProjectPurchaseValue({ startingPrice: 0 }), /positive number/);
  assert.throws(() => getProjectPurchaseValue({ startingPrice: 'not-a-number' }), /positive number/);
});
