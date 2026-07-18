export const PROJECT_DOCUMENT_TYPES = {
  seven_twelve_extract: { label: '7/12 Extract', required: true },
  approved_layout: { label: 'Approved Layout', required: true },
  zone_certificate: { label: 'Zone Certificate', required: true },
  na_order: { label: 'NA Order', required: false },
  title_search_report: { label: 'Title Search Report', required: false },
  property_card: { label: 'Property Card', required: false },
  mutation_entry: { label: 'Mutation Entry', required: false },
  sale_deed: { label: 'Sale Deed', required: false },
  development_agreement: { label: 'Development Agreement', required: false },
  rera_certificate: { label: 'RERA Certificate', required: false },
  government_approval: { label: 'Government Approval', required: false },
  other: { label: 'Other Document', required: false }
};

export const PROJECT_DOCUMENT_OPTIONS = Object.entries(PROJECT_DOCUMENT_TYPES).map(([value, config]) => ({
  value,
  label: config.label
}));

export const getProjectDocumentLabel = (type) => PROJECT_DOCUMENT_TYPES[type]?.label || PROJECT_DOCUMENT_TYPES.other.label;

export const normalizeProjectDocuments = (project) => {
  const projectRecord = project && typeof project === 'object' ? project : {};
  const documents = [projectRecord.documents, projectRecord.projectDocuments, projectRecord.legalDocuments]
    .filter(Array.isArray)
    .flat();
  const normalized = documents
    .filter((document) => document && typeof document === 'object')
    .map((document) => ({
      ...document,
      url: typeof document.url === 'string'
        ? document.url.trim()
        : typeof document.documentUrl === 'string'
          ? document.documentUrl.trim()
          : typeof document.fileUrl === 'string'
            ? document.fileUrl.trim()
            : ''
    }))
    .filter((document) => document.url)
    .map((document) => ({
      type: PROJECT_DOCUMENT_TYPES[document.type] ? document.type : 'other',
      url: document.url,
      status: document.status === 'verified' || document.verified === true ? 'verified' : 'pending',
      updatedAt: document.updatedAt || document.verifiedAt || null
    }));

  if (!normalized.some((document) => document.type === 'approved_layout') && typeof projectRecord.layoutPlanUrl === 'string' && projectRecord.layoutPlanUrl.trim()) {
    normalized.push({
      type: 'approved_layout',
      url: projectRecord.layoutPlanUrl.trim(),
      status: 'pending',
      updatedAt: null
    });
  }

  return normalized;
};

export const getVerifiedDocumentCount = (project) =>
  normalizeProjectDocuments(project).filter((document) => document.status === 'verified').length;

export const formatDocumentDate = (value) => {
  if (!value) return '';
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};
