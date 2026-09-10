import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('seller review uses a decision surface instead of direct queue approval', async () => {
  const [admin, review] = await Promise.all([read('./AdminPanel.jsx'), read('./AdminSellerReview.jsx')]);
  assert.match(admin, /Review seller/);
  assert.match(admin, /<AdminSellerReview/);
  assert.doesNotMatch(admin, /onClick=\{\(\) => handleApproveSellerRequest\(request\)\}/);
  assert.match(review, /Confirm approval/);
  assert.match(review, /does not verify identity evidence or publish associated properties/i);
});

test('seller rejection reuses the accessible governed rejection dialog', async () => {
  const [admin, modal] = await Promise.all([read('./AdminPanel.jsx'), read('./PropertyRejectionModal.jsx')]);
  assert.match(admin, /seller=\{sellerPendingRejection\}/);
  assert.match(admin, /handleRejectSellerRequest\(sellerPendingRejection, reason\)/);
  assert.match(modal, /aria-modal="true"/);
  assert.match(modal, /event\.key === 'Escape'/);
  assert.match(modal, /event\.key === 'Tab'/);
});

test('backend persists authoritative seller review metadata and rejects repeat decisions', async () => {
  const backend = await read('../../functions/index.js');
  assert.match(backend, /meaningful rejection reason of at least 10 characters/);
  assert.match(backend, /Only pending seller applications can be reviewed/);
  assert.match(backend, /sellerApprovedBy/);
  assert.match(backend, /sellerAuditLogs/);
});

test('dashboard seller badge counts actionable applications only', async () => {
  const admin = await read('./AdminPanel.jsx');
  assert.match(admin, /sellerRequests\.filter\(isActionableSellerApplication\)\.length/);
  assert.match(admin, /Review Seller Applications/);
  assert.doesNotMatch(admin, />Verify Seller</);
});
