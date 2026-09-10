import test from 'node:test';
import assert from 'node:assert/strict';
import { getPropertyGovernance, PROPERTY_LIFECYCLE_LABELS, SECTION_STATE } from './propertyGovernance.js';
import { PROPERTY_STATUS } from './projectVisibility.js';

const readyProperty = (overrides = {}) => ({
  id: 'property-1',
  status: PROPERTY_STATUS.PENDING,
  name: 'Matoshri Park',
  description: 'A residential plotted development near Chakan.',
  contactNumber: '9876543210',
  village: 'Bhose',
  latitude: 18.75,
  longitude: 73.86,
  mapMarkerConfirmed: true,
  startingPrice: 1200000,
  totalPlots: 40,
  remainingPlots: 20,
  plotAreaMinSqFt: 1000,
  plotAreaMaxSqFt: 2000,
  landZone: 'non_agricultural',
  naStatus: 'approved',
  thumbnail: 'https://example.com/cover.jpg',
  sellerId: 'seller-1',
  ...overrides
});

test('documents the canonical lifecycle without collapsing approval and publication', () => {
  assert.equal(PROPERTY_LIFECYCLE_LABELS[PROPERTY_STATUS.APPROVED], 'Approved');
  assert.equal(PROPERTY_LIFECYCLE_LABELS[PROPERTY_STATUS.ACTIVE], 'Published');
  assert.equal(PROPERTY_LIFECYCLE_LABELS[PROPERTY_STATUS.INACTIVE], 'Unpublished');
});

test('reports blockers instead of false completion for missing required data', () => {
  const governance = getPropertyGovernance(readyProperty({ description: '', thumbnail: '', startingPrice: 0 }), { sellerAssociationValid: true });
  assert.equal(governance.approvalEligible, false);
  assert.ok(governance.completeness < 100);
  assert.deepEqual(governance.blockers.map((item) => item.code).sort(), ['basic_missing', 'cover_missing', 'price_missing']);
});

test('distinguishes invalid values from missing values', () => {
  const invalid = getPropertyGovernance(readyProperty({ plotAreaMinSqFt: 2500, plotAreaMaxSqFt: 2000 }), { sellerAssociationValid: true });
  const missing = getPropertyGovernance(readyProperty({ startingPrice: '' }), { sellerAssociationValid: true });
  assert.equal(invalid.sections.find((section) => section.id === 'pricing').state, SECTION_STATE.INVALID);
  assert.equal(missing.sections.find((section) => section.id === 'pricing').state, SECTION_STATE.INCOMPLETE);
});

test('does not describe complete content as verified or published', () => {
  const governance = getPropertyGovernance(readyProperty(), { sellerAssociationValid: true });
  assert.equal(governance.completeness, 100);
  assert.equal(governance.lifecycle.label, 'Pending review');
  assert.equal(governance.isPublished, false);
  assert.equal(governance.approvalEligible, true);
});

test('requires an approved seller association for approval readiness', () => {
  const governance = getPropertyGovernance(readyProperty(), { sellerAssociationValid: false });
  assert.equal(governance.approvalEligible, false);
  assert.ok(governance.blockers.some((item) => item.code === 'seller_invalid'));
  assert.equal(governance.nextSection, 'seller');
});

test('keeps approval and publication readiness as separate lifecycle gates', () => {
  const approved = getPropertyGovernance(readyProperty({ status: PROPERTY_STATUS.APPROVED }), { sellerAssociationValid: true });
  const active = getPropertyGovernance(readyProperty({ status: PROPERTY_STATUS.ACTIVE }), { sellerAssociationValid: true });
  assert.equal(approved.approvalEligible, false);
  assert.equal(approved.publicationEligible, true);
  assert.equal(approved.isPublished, false);
  assert.equal(active.isPublished, true);
});
