import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getProjectStatus,
  isPublicProperty,
  PROPERTY_STATUS,
  PROPERTY_STATUSES
} from './projectVisibility.js';

test('canonical property status enum contains only lowercase business values', () => {
  assert.deepEqual(PROPERTY_STATUSES, [
    'draft',
    'pending',
    'approved',
    'active',
    'inactive',
    'sold',
    'rejected'
  ]);
});

test('only the canonical active status is buyer-visible', () => {
  const statuses = [
    PROPERTY_STATUS.DRAFT,
    PROPERTY_STATUS.PENDING,
    PROPERTY_STATUS.APPROVED,
    PROPERTY_STATUS.INACTIVE,
    PROPERTY_STATUS.SOLD,
    PROPERTY_STATUS.REJECTED,
    'Active',
    'Sold',
    'Pending'
  ];

  assert.equal(isPublicProperty({ status: PROPERTY_STATUS.ACTIVE }), true);
  for (const status of statuses) {
    assert.equal(isPublicProperty({ status }), false, `${status} must remain hidden`);
  }
});

test('legacy and unknown states cannot silently become public', () => {
  assert.equal(getProjectStatus({ status: 'Active' }), PROPERTY_STATUS.ACTIVE);
  assert.equal(getProjectStatus({ status: 'pending_review' }), PROPERTY_STATUS.PENDING);
  assert.equal(getProjectStatus({ status: 'Published' }), PROPERTY_STATUS.PENDING);
  assert.equal(getProjectStatus({ status: 'Sold Out' }), PROPERTY_STATUS.SOLD);
  assert.equal(getProjectStatus({ status: 'approved' }), PROPERTY_STATUS.APPROVED);
  assert.equal(getProjectStatus({ status: 'rejected' }), PROPERTY_STATUS.REJECTED);
  assert.equal(getProjectStatus({}), PROPERTY_STATUS.DRAFT);
});
