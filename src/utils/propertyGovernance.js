import { validatePropertyLocation } from './adminPropertyUtils.js';
import { PROPERTY_STATUS, normalizePropertyStatus } from './projectVisibility.js';
import { normalizeProjectDocuments } from './projectDocuments.js';

export const SECTION_STATE = Object.freeze({
  COMPLETE: 'complete',
  INCOMPLETE: 'incomplete',
  INVALID: 'invalid',
  NEEDS_REVIEW: 'needs_review',
  NOT_APPLICABLE: 'not_applicable'
});

const present = (value) => value !== undefined && value !== null && String(value).trim() !== '';
const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
const issue = (section, code, message, severity = 'blocker') => ({ section, code, message, severity });

export const PROPERTY_LIFECYCLE_LABELS = Object.freeze({
  [PROPERTY_STATUS.DRAFT]: 'Draft',
  [PROPERTY_STATUS.PENDING]: 'Pending review',
  [PROPERTY_STATUS.APPROVED]: 'Approved',
  [PROPERTY_STATUS.ACTIVE]: 'Published',
  [PROPERTY_STATUS.INACTIVE]: 'Unpublished',
  [PROPERTY_STATUS.SOLD]: 'Sold',
  [PROPERTY_STATUS.REJECTED]: 'Rejected'
});

export function getPropertyGovernance(property = {}, options = {}) {
  const sellerAssociationValid = options.sellerAssociationValid ?? property.sellerAssociationValid ?? Boolean(property.sellerId || property.sellerUid || property.ownerId);
  const status = normalizePropertyStatus(property.status);
  const documents = normalizeProjectDocuments(property);
  const contact = property.contactNumber || property.whatsappNumber || property.siteVisitContact || property.siteVisitContactNumber;
  const cover = property.thumbnail || property.thumbnailUrl || property.heroImage || property.coverImage;
  const minArea = Number(property.plotAreaMinSqFt ?? property.minimumPlotArea ?? property.sizeMin);
  const maxArea = Number(property.plotAreaMaxSqFt ?? property.maximumPlotArea ?? property.sizeMax);
  const location = validatePropertyLocation(property);
  const sections = [];
  const issues = [];

  const basicMissing = [
    !present(property.name) && 'property name',
    !present(property.description) && 'description',
    !present(contact) && 'contact number'
  ].filter(Boolean);
  if (basicMissing.length) issues.push(issue('basic', 'basic_missing', `Add ${basicMissing.join(', ')}.`));
  sections.push({ id: 'basic', label: 'Basic information', state: basicMissing.length ? SECTION_STATE.INCOMPLETE : SECTION_STATE.COMPLETE, message: basicMissing.length ? `${basicMissing.length} required item${basicMissing.length === 1 ? '' : 's'} missing` : 'Required information present' });

  if (!location.isValid) issues.push(issue('location', location.errorType || 'location_invalid', location.message));
  const locationState = location.isValid ? SECTION_STATE.COMPLETE : ['invalid', 'needs_review'].includes(location.status) ? SECTION_STATE.INVALID : SECTION_STATE.INCOMPLETE;
  sections.push({ id: 'location', label: 'Location', state: locationState, message: location.isValid ? 'Coordinates and marker confirmed' : location.message });

  const pricingMissing = !positive(property.startingPrice ?? property.priceFrom);
  const areaInvalid = positive(minArea) && positive(maxArea) && minArea > maxArea;
  if (pricingMissing) issues.push(issue('pricing', 'price_missing', 'Add a valid starting price.'));
  if (areaInvalid) issues.push(issue('pricing', 'area_range_invalid', 'Minimum plot size cannot exceed maximum plot size.'));
  const pricingState = areaInvalid ? SECTION_STATE.INVALID : pricingMissing ? SECTION_STATE.INCOMPLETE : SECTION_STATE.COMPLETE;
  sections.push({ id: 'pricing', label: 'Pricing', state: pricingState, message: pricingState === SECTION_STATE.COMPLETE ? 'Pricing is structurally valid' : 'Pricing requires attention' });

  const amenityCount = Array.isArray(property.amenityIds) ? property.amenityIds.length : Array.isArray(property.amenities) ? property.amenities.length : 0;
  sections.push({ id: 'amenities', label: 'Amenities', state: amenityCount ? SECTION_STATE.COMPLETE : SECTION_STATE.NOT_APPLICABLE, message: amenityCount ? `${amenityCount} selected` : 'Optional; none selected' });

  const legalPresent = present(property.naStatus) && present(property.landZone);
  const pendingDocuments = documents.filter((document) => !['verified', 'approved'].includes(String(document.status || '').toLowerCase())).length;
  if (!legalPresent) issues.push(issue('legal', 'legal_missing', 'Land zone and NA status are not complete.', 'advisory'));
  if (pendingDocuments) issues.push(issue('legal', 'documents_need_review', `${pendingDocuments} document${pendingDocuments === 1 ? '' : 's'} need review.`, 'advisory'));
  sections.push({ id: 'legal', label: 'Legal & documents', state: !legalPresent ? SECTION_STATE.INCOMPLETE : pendingDocuments ? SECTION_STATE.NEEDS_REVIEW : SECTION_STATE.COMPLETE, message: !legalPresent ? 'Required legal fields are missing' : pendingDocuments ? 'Documents await review' : documents.length ? 'Legal fields and documents reviewed' : 'Legal fields present; no documents supplied' });

  if (!present(cover)) issues.push(issue('media', 'cover_missing', 'Add a cover or hero image.'));
  sections.push({ id: 'media', label: 'Media', state: present(cover) ? SECTION_STATE.COMPLETE : SECTION_STATE.INCOMPLETE, message: present(cover) ? 'Buyer-facing cover present' : 'Cover or hero image missing' });

  if (!sellerAssociationValid) issues.push(issue('seller', 'seller_invalid', 'Assign an approved seller.'));
  sections.push({ id: 'seller', label: 'Seller assignment', state: sellerAssociationValid ? SECTION_STATE.COMPLETE : SECTION_STATE.INVALID, message: sellerAssociationValid ? 'Approved seller assigned' : 'Approved seller required' });

  const blockers = issues.filter((item) => item.severity === 'blocker');
  const advisories = issues.filter((item) => item.severity === 'advisory');
  const applicableSections = sections.filter((section) => section.state !== SECTION_STATE.NOT_APPLICABLE);
  const completeSections = applicableSections.filter((section) => section.state === SECTION_STATE.COMPLETE).length;
  const completeness = applicableSections.length ? Math.round((completeSections / applicableSections.length) * 100) : 0;
  const approvalEligible = status === PROPERTY_STATUS.PENDING && blockers.length === 0;
  const publicationEligible = [PROPERTY_STATUS.APPROVED, PROPERTY_STATUS.ACTIVE, PROPERTY_STATUS.INACTIVE].includes(status) && blockers.length === 0;

  return {
    lifecycle: { status, label: PROPERTY_LIFECYCLE_LABELS[status] || 'Unknown' },
    sections,
    issues,
    blockers,
    advisories,
    completeness,
    approvalEligible,
    publicationEligible,
    isPublished: status === PROPERTY_STATUS.ACTIVE,
    nextSection: blockers[0]?.section || advisories[0]?.section || null
  };
}
