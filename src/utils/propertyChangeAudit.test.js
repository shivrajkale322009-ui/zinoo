import assert from 'node:assert/strict';
import test from 'node:test';
import { getPropertyChangeAudit } from './propertyChangeAudit.js';
test('property audit separates field changes from added and removed listing items', () => { const audit = getPropertyChangeAudit({ name: 'A', galleryImages: [{ id: 'one', fileName: 'one.jpg' }], amenities: ['Road'] }, { name: 'B', galleryImages: [{ id: 'two', fileName: 'two.jpg' }], amenities: ['Garden'] }); assert.ok(audit.changed.some((item) => item.label === 'Project Name' && item.before === 'A' && item.after === 'B')); assert.ok(audit.added.includes('Project image: two.jpg')); assert.ok(audit.removed.includes('Project image: one.jpg')); });
test('property audit recognizes exact map marker confirmation as a saveable change', () => { const audit = getPropertyChangeAudit({ mapMarkerConfirmed: false }, { mapMarkerConfirmed: true }); assert.ok(audit.hasChanges); assert.ok(audit.changed.some((item) => item.label === 'Exact map marker confirmed' && item.before === 'No' && item.after === 'Yes')); });

test('seller-only reassignment is included in the save review', () => {
  const audit = getPropertyChangeAudit({ ownerId: 'seller-a' }, { ownerId: 'seller-b', sellerId: 'seller-b', sellerUid: 'seller-b' });
  assert.equal(audit.hasChanges, true);
  assert.ok(audit.changed.some((item) => item.label === 'Seller' && item.before === 'seller-a' && item.after === 'seller-b'));
});

test('property audit detects property highlight badge changes', () => {
  const audit = getPropertyChangeAudit({ highlightBadge: 'NONE' }, { highlightBadge: 'BEST_FOR_INVESTMENT' });
  assert.equal(audit.hasChanges, true);
  assert.ok(audit.changed.some((item) => item.label === 'Property Highlight' && item.before === 'None' && item.after === 'Best for Investment'));
});

