import { getProjectCoordinates } from './projectVisibility';
import { normalizeProjectDocuments } from './projectDocuments';

const entry = (key, label, section, detail = '') => ({ key, label, section, detail });
const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

export function getProjectCompleteness(project) {
  const missingRequired = [];
  const invalidFields = [];
  const missingRecommended = [];
  const coordinates = getProjectCoordinates(project);
  const documents = normalizeProjectDocuments(project);

  if (!hasText(project?.name)) missingRequired.push(entry('name', 'Project name', 'Basic details'));
  if (!hasText(project?.ownerId || project?.sellerUid)) missingRequired.push(entry('owner', 'Seller owner', 'Ownership'));
  if (!hasText(project?.village)) missingRequired.push(entry('village', 'Village / location name', 'Location'));
  if (!coordinates) missingRequired.push(entry('location', 'Exact project location', 'Location'));
  if (!positive(project?.startingPrice ?? project?.priceFrom)) missingRequired.push(entry('startingPrice', 'Starting price', 'Pricing'));
  if (!positive(project?.cashbackPerGuntha ?? project?.cashbackAmount)) missingRequired.push(entry('cashbackPerGuntha', 'Cashback per Guntha', 'Pricing'));
  if (!hasText(project?.landZone)) missingRequired.push(entry('landZone', 'Land Zone', 'Land details'));
  if (!hasText(project?.naStatus)) missingRequired.push(entry('naStatus', 'NA Status', 'Land details'));
  if (!hasText(project?.thumbnail || project?.heroImage)) missingRequired.push(entry('mainImage', 'Main project image', 'Media'));
  if (!hasText(project?.whatsappNumber) && !hasText(project?.siteVisitContact)) missingRequired.push(entry('contact', 'Project contact method', 'Business details'));

  if (!hasText(project?.description)) missingRecommended.push(entry('description', 'Project description', 'Basic details'));
  if (!hasText(project?.area)) missingRecommended.push(entry('area', 'Nearby landmark', 'Location'));
  if (!Array.isArray(project?.amenities) && !hasText(project?.amenities)) missingRecommended.push(entry('amenities', 'Amenities', 'Basic details'));
  if (!project?.layoutPolygon) missingRecommended.push(entry('layoutPolygon', 'Project boundary polygon', 'Layout'));

  const unverifiedDocuments = documents.filter((document) => document.status !== 'verified')
    .map((document) => entry(document.type, document.type.replace(/_/g, ' '), 'Documents', document.status || 'pending'));
  const completedChecks = 11 - missingRequired.length;
  const score = Math.max(0, Math.min(100, Math.round((completedChecks / 11) * 100) - invalidFields.length * 8));

  return { isComplete: missingRequired.length === 0 && invalidFields.length === 0, score, missingRequired, invalidFields, missingRecommended, unverifiedDocuments, warnings: [] };
}
