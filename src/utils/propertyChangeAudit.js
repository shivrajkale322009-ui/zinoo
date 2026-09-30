const list = (value) => Array.isArray(value) ? value : [];
const valueFor = (property, keys) => { for (const key of keys) if (property?.[key] !== undefined && property?.[key] !== null && property?.[key] !== '') return property[key]; return ''; };
const same = (left, right) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
const fileKey = (item) => String(item?.id || item?.storagePath || item?.downloadURL || item?.url || item?.fileName || item || '');
const fileLabel = (item, fallback) => item?.displayName || item?.fileName || item?.name || fallback;
const BADGE_LABELS = {
  NONE: 'None',
  BEST_FOR_INVESTMENT: 'Best for Investment',
  BANK_LOAN_AVAILABLE: 'Bank Loan Available',
  PRIME_LOCATION: 'Prime Location',
  VERIFIED_PROPERTY: 'Verified Property'
};
export const formatAuditValue = (value) => { if (value === '' || value === null || value === undefined) return 'Not set'; if (BADGE_LABELS[value]) return BADGE_LABELS[value]; if (typeof value === 'boolean') return value ? 'Yes' : 'No'; if (typeof value === 'number') return new Intl.NumberFormat('en-IN').format(value); return String(value); };
export function getPropertyChangeAudit(original = {}, draft = {}) {
  const changed = [];
  const scalarFields = [['Seller', ['sellerId', 'sellerUid', 'ownerId']], ['Project Name', ['name']], ['Property Highlight', ['highlightBadge']], ['Village', ['village']], ['Location', ['locality', 'area']], ['Price', ['startingPrice', 'priceFrom']], ['Cashback Offered', ['cashbackPerGuntha', 'cashbackAmount']], ['Contact number', ['contactNumber', 'siteVisitContact']], ['WhatsApp number', ['whatsappNumber']], ['Developer', ['developer', 'developerName']], ['Land zone', ['landZone']], ['NA status', ['naStatus']], ['Installment purchase', ['installmentPurchaseAvailable']], ['Bank loan', ['bankLoan']], ['About Project', ['description']], ['Address', ['completeAddress']], ['Exact map marker confirmed', ['mapMarkerConfirmed']]];
  scalarFields.forEach(([label, keys]) => { const before = valueFor(original, keys); const after = valueFor(draft, keys); if (!same(before, after)) changed.push({ label, before: formatAuditValue(before), after: formatAuditValue(after) }); });
  if (!same(original.layoutPolygon, draft.layoutPolygon) || !same([original.latitude, original.longitude], [draft.latitude, draft.longitude])) changed.push({ label: 'Location / layout', before: 'Updated map data', after: 'Updated map data' });
  const added = []; const removed = [];
  const compareItems = (label, before, after, itemLabel) => { const beforeKeys = new Set(list(before).map(fileKey)); const afterKeys = new Set(list(after).map(fileKey)); list(after).filter((item) => !beforeKeys.has(fileKey(item))).forEach((item) => added.push(`${label}: ${itemLabel(item)}`)); list(before).filter((item) => !afterKeys.has(fileKey(item))).forEach((item) => removed.push(`${label}: ${itemLabel(item)}`)); };
  compareItems('Project image', original.galleryImages, draft.galleryImages, (item) => fileLabel(item, 'Image'));
  compareItems('Video', original.videos, draft.videos, (item) => fileLabel(item, 'Video'));
  compareItems('Document', original.documents, draft.documents, (item) => fileLabel(item, 'Document'));
  compareItems('Amenity', original.amenities, draft.amenities, (item) => String(item));
  if (!same(valueFor(original, ['thumbnail', 'heroImage']), valueFor(draft, ['thumbnail', 'heroImage']))) changed.push({ label: 'Hero image', before: 'Current image', after: 'New image' });
  return { changed, added, removed, hasChanges: Boolean(changed.length || added.length || removed.length) };
}

