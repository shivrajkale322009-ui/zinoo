import test from 'node:test';
import assert from 'node:assert/strict';
import { getSellerApplicationGovernance, isActionableSellerApplication } from './sellerGovernance.js';

const ready = (changes = {}) => ({ id: 'request-1', userId: 'user-1', status: 'pending', businessName: 'Acme Estates', businessType: 'developer', businessAddress: 'Chakan, Pune', contactPerson: 'Asha Rao', contactPhone: '9876543210', contactEmail: 'asha@example.com', description: 'Residential plotted development company.', ...changes });

test('pending is the only actionable seller application state', () => {
  assert.equal(isActionableSellerApplication(ready()), true);
  assert.equal(isActionableSellerApplication(ready({ status: 'approved' })), false);
  assert.equal(isActionableSellerApplication(ready({ status: 'rejected' })), false);
});

test('eligible application must satisfy actual submitted form requirements', () => {
  const governance = getSellerApplicationGovernance(ready());
  assert.equal(governance.approvalEligible, true);
  assert.equal(governance.completeness, 100);
});

test('invalid contact data blocks approval without implying verification', () => {
  const governance = getSellerApplicationGovernance(ready({ contactPhone: '123', contactEmail: 'bad' }));
  assert.equal(governance.approvalEligible, false);
  assert.deepEqual(governance.blockers.map((item) => item.id), ['contactPhone', 'contactEmail']);
});

test('property relationship counts use canonical ownership fields and statuses', () => {
  const governance = getSellerApplicationGovernance(ready(), [
    { ownerId: 'user-1', status: 'active' },
    { sellerUid: 'user-1', status: 'pending' },
    { sellerId: 'someone-else', status: 'rejected' }
  ]);
  assert.equal(governance.associatedProperties.length, 2);
  assert.deepEqual(governance.propertyCounts, { active: 1, pending: 1 });
});
