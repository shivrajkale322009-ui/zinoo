export const SELLER_APPLICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
});

export const SELLER_APPLICATION_LABELS = Object.freeze({
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected'
});

const text = (value) => String(value ?? '').trim();
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(value));
const validPhone = (value) => text(value).replace(/\D/g, '').length >= 10;

export function getSellerApplicationGovernance(application = {}, properties = []) {
  const status = text(application.status).toLowerCase() || SELLER_APPLICATION_STATUS.PENDING;
  const requirements = [
    { id: 'businessName', label: 'Business name', valid: text(application.businessName).length >= 2 },
    { id: 'businessType', label: 'Business type', valid: text(application.businessType).length > 0 },
    { id: 'businessAddress', label: 'Business address', valid: text(application.businessAddress).length >= 5 },
    { id: 'contactPerson', label: 'Contact person', valid: text(application.contactPerson).length >= 2 },
    { id: 'contactPhone', label: 'Contact phone', valid: validPhone(application.contactPhone || application.userPhone) },
    { id: 'contactEmail', label: 'Contact email', valid: validEmail(application.contactEmail || application.userEmail) },
    { id: 'description', label: 'Business description', valid: text(application.description).length >= 10 },
    { id: 'account', label: 'Applicant account', valid: text(application.userId || application.id).length > 0 }
  ];
  const blockers = requirements.filter((item) => !item.valid).map((item) => ({ id: item.id, message: `${item.label} is missing or invalid.` }));
  const owned = properties.filter((property) => [property.ownerId, property.sellerId, property.sellerUid].includes(application.userId || application.id));
  const propertyCounts = owned.reduce((counts, property) => {
    const propertyStatus = text(property.status).toLowerCase() || 'draft';
    counts[propertyStatus] = (counts[propertyStatus] || 0) + 1;
    return counts;
  }, {});
  const completeness = Math.round((requirements.filter((item) => item.valid).length / requirements.length) * 100);
  return {
    status,
    statusLabel: SELLER_APPLICATION_LABELS[status] || status,
    requirements,
    blockers,
    completeness,
    approvalEligible: status === SELLER_APPLICATION_STATUS.PENDING && blockers.length === 0,
    reviewable: status === SELLER_APPLICATION_STATUS.PENDING,
    associatedProperties: owned,
    propertyCounts
  };
}

export function isActionableSellerApplication(application = {}) {
  return text(application.status).toLowerCase() === SELLER_APPLICATION_STATUS.PENDING;
}
