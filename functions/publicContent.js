// Public editorial content registry.
//
// Keep drafts here (or move this shape to a CMS later). Only records with
// status: 'published' are eligible for a public page or the sitemap.
// Market studies must include dated sources and methodology; do not publish
// private project, seller, or buyer information in this registry.
const publicContent = [
  {
    type: 'blog',
    slug: 'buying-a-plot-in-chakan-checklist',
    status: 'draft',
    title: 'Buying a Plot in Chakan: A Practical Checklist',
    description: 'A practical checklist for buyers evaluating a plot in and around Chakan.',
    excerpt: 'Use this checklist to compare location, documents, road access and total cost before booking a plot.',
    author: 'Zinoo Editorial Team',
    publishedAt: null,
    updatedAt: null,
    sections: [
      { heading: 'Verify the exact location', paragraphs: ['Confirm the locality, approach road and the plot position during a site visit.'] },
      { heading: 'Review documents before paying', paragraphs: ['Ask a qualified professional to review the documents relevant to your purchase.'] }
    ],
    faqs: []
  },
  {
    type: 'market-study',
    slug: 'chakan-plot-market-study-2026',
    status: 'draft',
    title: 'Chakan Plot Market Study 2026',
    description: 'A dated framework for studying plot inventory, localities and buyer considerations around Chakan.',
    excerpt: 'This study is a draft until its methodology, sources and collection date have been completed.',
    author: 'Zinoo Research',
    publishedAt: null,
    updatedAt: null,
    methodology: [],
    sources: [],
    sections: [],
    faqs: []
  }
];

const PUBLIC_CONTENT_TYPES = new Set(['blog', 'market-study']);
const publishedContent = (type) => publicContent.filter((item) =>
  item.status === 'published' && (!type || item.type === type)
);
const contentBySlug = (type, slug) => publishedContent(type).find((item) => item.slug === slug) || null;

module.exports = { PUBLIC_CONTENT_TYPES, contentBySlug, publicContent, publishedContent };
