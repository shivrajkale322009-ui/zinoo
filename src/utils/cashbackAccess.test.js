import test from 'node:test';
import assert from 'node:assert/strict';
import { scopedCashbacks } from './cashbackAccess.js';

const claims = [
  { id: 'a', projectOwnerId: 'seller-a', createdBy: 'buyer-a' },
  { id: 'b', projectOwnerId: 'seller-b', createdBy: 'buyer-b' },
  { id: 'missing-owner', createdBy: 'buyer-a' }
];
test('seller views isolate global admin results, including seller switches', () => {
  assert.deepEqual(scopedCashbacks(claims, 'seller', 'seller-a').map((c) => c.id), ['a']);
  assert.deepEqual(scopedCashbacks(claims, 'seller', 'seller-b').map((c) => c.id), ['b']);
  assert.deepEqual(scopedCashbacks(claims, 'seller', ''), []);
});
test('buyers only see their submissions and admins retain global review', () => {
  assert.deepEqual(scopedCashbacks(claims, 'buyer', 'buyer-b').map((c) => c.id), ['b']);
  assert.deepEqual(scopedCashbacks(claims, 'buyer', 'unknown'), []);
  assert.deepEqual(scopedCashbacks(claims, 'admin', 'admin'), claims);
});
