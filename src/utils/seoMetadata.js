const PUBLIC_TITLE = 'Zinoo | Verified Plots & Residential Projects in Chakan';
const PUBLIC_DESCRIPTION = 'Explore verified residential plots and plotted projects in Chakan with Zinoo. Compare locations, prices, plot sizes and project details.';
const PUBLIC_URL = 'https://zinoo.in/';
const PUBLIC_IMAGE = 'https://zinoo.in/zinoo-home-hero.webp';

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
};

const setCanonical = (href) => {
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = href;
};

export const applyApplicationSeoState = ({ isPublicPage, project = null, projectSlug = '' }) => {
  const projectUrl = projectSlug ? `https://zinoo.in/projects/${encodeURIComponent(projectSlug)}` : '';
  const projectName = project?.projectName || project?.name || '';
  const projectLocation = project?.location || project?.locationLabel || project?.village || '';
  const title = projectName
    ? `${projectName}${projectLocation ? ` | ${projectLocation}` : ''} | Zinoo`
    : isPublicPage ? PUBLIC_TITLE : 'Zinoo | Secure Account';
  const description = projectName
    ? (project.description || `Explore ${projectName}${projectLocation ? ` in ${projectLocation}` : ''} on Zinoo.`)
    : isPublicPage ? PUBLIC_DESCRIPTION : 'Secure Zinoo account and application workspace.';
  const robots = isPublicPage
    ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'noindex,nofollow,noarchive';

  document.title = title;
  setCanonical(projectUrl || PUBLIC_URL);
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: projectUrl || PUBLIC_URL });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: PUBLIC_IMAGE });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: PUBLIC_IMAGE });

  const structuredData = document.getElementById('zinoo-public-structured-data');
  if (structuredData) {
    structuredData.type = isPublicPage ? 'application/ld+json' : 'application/json';
    if (projectName && projectUrl) {
      const place = {
        '@type': 'Place',
        name: projectName,
        description,
        url: projectUrl,
        ...(project.primaryImage || project.heroImage ? { image: [project.primaryImage || project.heroImage, ...(project.galleryImages || [])].filter(Boolean) } : {})
      };
      structuredData.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebPage', '@id': `${projectUrl}#webpage`, url: projectUrl, name: title, description, mainEntity: place },
          { '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: PUBLIC_URL },
            { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://zinoo.in/projects' },
            { '@type': 'ListItem', position: 3, name: projectName, item: projectUrl }
          ] }
        ]
      });
    }
  }
};
