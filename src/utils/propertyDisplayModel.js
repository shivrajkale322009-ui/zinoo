const asText = (value, fallback = '') => value === undefined || value === null ? fallback : String(value);
const asNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const asArray = (value) => Array.isArray(value) ? value : [];
const id = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const DISPLAY_ICON_OPTIONS = Object.freeze([
  'leaf', 'document', 'shield', 'route', 'size', 'plots', 'location',
  'map', 'calendar', 'eye', 'clock', 'developer', 'star', 'offer'
]);

export const createDisplayItem = (type = 'feature') => ({
  id: id(type),
  title: '',
  value: '',
  icon: type === 'stat' ? 'size' : 'leaf',
  enabled: true
});

export function createPropertyDisplayModel(project = {}) {
  const legacyGallery = asArray(project.images || project.gallery).map((image, index) => ({
    id: image?.id || `legacy_image_${index}`,
    url: typeof image === 'string' ? image : image?.downloadURL || image?.url || '',
    alt: image?.alt || '',
    cover: index === 0,
    enabled: true,
    order: index
  })).filter((image) => image.url);

  const legacyDocuments = asArray(project.documents).map((document, index) => ({
    id: document.id || `legacy_document_${index}`,
    title: document.displayName || document.title || document.fileName || 'Project document',
    verified: document.verified === true || document.status === 'verified',
    url: document.downloadURL || document.url || '',
    documentType: document.type || 'other',
    showOnDetails: document.showOnDetails !== false,
    enabled: document.enabled !== false,
    order: index
  }));

  const amenities = (Array.isArray(project.amenities)
    ? project.amenities
    : asText(project.amenities).split(','))
    .map((title, index) => ({ id: `legacy_amenity_${index}`, title: asText(title).trim(), enabled: true }))
    .filter((item) => item.title);

  const plotMin = project.plotAreaMinSqFt ?? project.minimumPlotArea ?? project.sizeMin;
  const plotMax = project.plotAreaMaxSqFt ?? project.maximumPlotArea ?? project.sizeMax;
  const plotValue = plotMin && plotMax && Number(plotMin) !== Number(plotMax)
    ? `${new Intl.NumberFormat('en-IN').format(plotMin)}–${new Intl.NumberFormat('en-IN').format(plotMax)} sq.ft.`
    : plotMin ? `${new Intl.NumberFormat('en-IN').format(plotMin)} sq.ft.` : '';

  const cashbackAmount = asNumber(project.cashbackPerGuntha ?? project.cashbackAmount);

  return {
    schemaVersion: 1,
    basic: {
      projectName: asText(project.name),
      shortTitle: asText(project.shortTitle || project.name),
      shortDescription: asText(project.shortDescription || project.description),
      location: asText(project.locationLabel || [project.village, project.taluka, project.area].filter(Boolean).join(' • ')),
      village: asText(project.village),
      taluka: asText(project.taluka),
      district: asText(project.district)
    },
    pricing: {
      startingPrice: asNumber(project.priceFrom ?? project.startingPrice),
      pricePrefix: asText(project.pricePrefix, 'Starting from')
    },
    media: {
      heroImage: asText(project.thumbnail || project.heroImage),
      heroBadge: asText(project.heroBadge, 'Verified'),
      gallery: legacyGallery
    },
    verified: {
      enabled: project.verified !== false,
      label: asText(project.verifiedLabel, 'Verified'),
      showOnCard: true,
      showOnDetails: true
    },
    cashback: {
      enabled: cashbackAmount > 0,
      amount: cashbackAmount,
      label: asText(project.cashbackLabel, 'Cashback'),
      badgeColor: asText(project.cashbackBadgeColor, '#15803d'),
      showOnCard: cashbackAmount > 0,
      showOnDetails: cashbackAmount > 0
    },
    rating: {
      enabled: Boolean(project.DruvioScore || project.druvioScore),
      value: asNumber(project.DruvioScore ?? project.druvioScore),
      reviewCount: asNumber(project.reviewCount ?? project.weeklyViews ?? project.views),
      showOnCard: false,
      showOnDetails: true
    },
    featureChips: {
      showOnCard: false,
      showOnDetails: true,
      order: 10,
      items: [
        project.landZone && { id: 'land_zone', title: asText(project.landZone).replace(/_/g, ' '), icon: 'leaf', enabled: true },
        project.naStatus && { id: 'na_status', title: asText(project.naStatus).replace(/_/g, ' '), icon: 'document', enabled: true },
        legacyDocuments.some((document) => document.verified) && { id: 'verified_documents', title: 'Verified Documents', icon: 'shield', enabled: true },
        project.distance && { id: 'distance', title: `${project.distance} km away`, icon: 'route', enabled: true }
      ].filter(Boolean)
    },
    quickStats: {
      showOnCard: false,
      showOnDetails: true,
      order: 20,
      items: [
        { id: 'plot_size', title: 'Plot Size', value: plotValue, icon: 'size', enabled: Boolean(plotValue) },
        { id: 'plots_left', title: 'Plots Left', value: asText(project.remainingPlots), icon: 'plots', enabled: project.remainingPlots !== undefined },
        { id: 'land_zone_stat', title: 'Land Zone', value: asText(project.landZone).replace(/_/g, ' '), icon: 'leaf', enabled: Boolean(project.landZone) },
        { id: 'na_status_stat', title: 'NA Status', value: asText(project.naStatus).replace(/_/g, ' '), icon: 'document', enabled: Boolean(project.naStatus) }
      ]
    },
    overview: {
      enabled: true,
      title: 'Overview',
      body: asText(project.description),
      showOnCard: false,
      showOnDetails: true,
      order: 30
    },
    amenities: {
      showOnCard: false,
      showOnDetails: true,
      order: 60,
      items: amenities
    },
    documents: {
      showOnCard: false,
      showOnDetails: true,
      order: 50,
      items: legacyDocuments
    },
    map: {
      enabled: Boolean(project.googleMapsLink || (project.latitude && project.longitude)),
      latitude: asNumber(project.latitude ?? project.location?.lat),
      longitude: asNumber(project.longitude ?? project.location?.lng),
      address: asText(project.completeAddress || project.locationLabel || [project.village, project.taluka, project.district, project.area].filter(Boolean).join(', ')),
      googleMapsLink: asText(project.googleMapsLink),
      directionsLink: asText(project.directionsLink || project.googleMapsLink),
      showOnCard: true,
      showOnDetails: true,
      order: 40
    },
    trust: {
      showOnCard: false,
      showOnDetails: true,
      order: 70,
      items: [
        { id: 'rera', title: 'RERA', value: asText(project.reraNumber), icon: 'shield', enabled: Boolean(project.reraNumber) },
        { id: 'views', title: 'Views', value: asText(project.weeklyViews ?? project.views), icon: 'eye', enabled: project.weeklyViews !== undefined || project.views !== undefined },
        { id: 'updated', title: 'Updated', value: asText(project.updated || project.updatedDate), icon: 'clock', enabled: Boolean(project.updated || project.updatedDate) },
        { id: 'developer', title: 'Developer', value: asText(project.developerName || project.developer), icon: 'developer', enabled: Boolean(project.developerName || project.developer) }
      ]
    },
    actions: {
      showOnCard: true,
      showOnDetails: true,
      callNumber: asText(project.salesContact || project.siteVisitContact || project.whatsappNumber || project.contactNumber),
      showCall: true,
      showMap: true,
      showFavourite: true,
      showShare: true,
      showViewDetails: true,
      showBookVisit: true,
      showViewLayout: true,
      viewDetailsLabel: 'View Details',
      callLabel: 'Call',
      mapLabel: 'View on Map',
      bookVisitLabel: 'Book Site Visit',
      viewLayoutLabel: 'View Layout'
    },
    visibility: {
      displayOrder: ['basic', 'pricing', 'cashback', 'featureChips', 'quickStats', 'overview', 'gallery', 'map', 'documents', 'amenities', 'trust', 'actions']
    }
  };
}

const mergeSection = (fallback, configured) => ({
  ...fallback,
  ...(configured || {}),
  ...(fallback.items ? { items: asArray(configured?.items).length ? configured.items : fallback.items } : {}),
  ...(fallback.gallery ? { gallery: asArray(configured?.gallery).length ? configured.gallery : fallback.gallery } : {})
});

export function getPropertyDisplayModel(project = {}) {
  const fallback = createPropertyDisplayModel(project);
  const configured = project.display;
  if (!configured || typeof configured !== 'object') return fallback;

  return {
    ...fallback,
    ...configured,
    basic: mergeSection(fallback.basic, configured.basic),
    pricing: mergeSection(fallback.pricing, configured.pricing),
    media: mergeSection(fallback.media, configured.media),
    verified: mergeSection(fallback.verified, configured.verified),
    cashback: mergeSection(fallback.cashback, configured.cashback),
    rating: mergeSection(fallback.rating, configured.rating),
    featureChips: mergeSection(fallback.featureChips, configured.featureChips),
    quickStats: mergeSection(fallback.quickStats, configured.quickStats),
    overview: mergeSection(fallback.overview, configured.overview),
    amenities: mergeSection(fallback.amenities, configured.amenities),
    documents: mergeSection(fallback.documents, configured.documents),
    map: mergeSection(fallback.map, configured.map),
    trust: mergeSection(fallback.trust, configured.trust),
    actions: mergeSection(fallback.actions, configured.actions),
    visibility: mergeSection(fallback.visibility, configured.visibility)
  };
}

export function withPropertyDisplayModel(project = {}) {
  const display = getPropertyDisplayModel(project);
  return {
    ...project,
    display,
    name: display.basic.projectName || project.name,
    shortTitle: display.basic.shortTitle,
    shortDescription: display.basic.shortDescription,
    startingPrice: display.pricing.startingPrice,
    priceFrom: display.pricing.startingPrice,
    thumbnail: display.media.heroImage || project.thumbnail,
    heroImage: display.media.heroImage || project.heroImage,
    verified: display.verified.enabled,
    village: display.basic.village,
    taluka: display.basic.taluka,
    district: display.basic.district,
    cashbackAmount: display.cashback.enabled ? display.cashback.amount : 0,
    cashbackPerGuntha: display.cashback.enabled ? display.cashback.amount : 0,
    reraNumber: display.trust.items.find((item) => item.id === 'rera')?.value || project.reraNumber,
    developer: display.trust.items.find((item) => item.id === 'developer')?.value || project.developer,
    latitude: display.map.latitude,
    longitude: display.map.longitude,
    googleMapsLink: display.map.googleMapsLink,
    directionsLink: display.map.directionsLink,
    amenities: display.amenities.items.filter((item) => item.enabled).map((item) => item.title),
    documents: display.documents.items.map((item) => ({
      id: item.id,
      displayName: item.title,
      title: item.title,
      verified: item.verified,
      status: item.verified ? 'verified' : 'pending',
      downloadURL: item.url,
      url: item.url,
      type: item.documentType,
      showOnDetails: item.showOnDetails,
      enabled: item.enabled,
      order: item.order
    }))
  };
}
