const { ACTIVE_STATUS, sanitizePublicProject, slugify, validSlug } = require('./publicProjectProjection');

const SITE_ORIGIN = 'https://zinoo.in';
const META_PIXEL_ID = '2252404462242027';
const PROJECT_PAGE_SIZE = 24;

const text = (value, maxLength = 500) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const formatPrice = (value) => value === null ? '' : new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(value);
const formatPlotSize = (project) => {
  if (project.plotAreaMinSqFt === null) return '';
  const min = new Intl.NumberFormat('en-IN').format(project.plotAreaMinSqFt);
  const max = project.plotAreaMaxSqFt !== null && project.plotAreaMaxSqFt !== project.plotAreaMinSqFt
    ? `–${new Intl.NumberFormat('en-IN').format(project.plotAreaMaxSqFt)}` : '';
  return `${min}${max} sq.ft.`;
};
const projectDescription = (project) => text(project.description, 155)
  || `View verified plot project details for ${project.projectName}${project.location ? ` in ${project.location}` : ' near Chakan'}, including price and plot sizes where available.`;

function pageShell({ title, description, canonical, robots = 'index,follow,max-image-preview:large', image, structuredData, body, metaEvent }) {
  const socialImage = image || `${SITE_ORIGIN}/zinoo-home-hero.webp`;
  const eventCall = metaEvent ? `fbq('track','${metaEvent.name}',${jsonLd(metaEvent.parameters)});` : '';
  return `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${escapeHtml(robots)}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:site_name" content="Zinoo"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(socialImage)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(socialImage)}"><link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"><script type="application/ld+json">${jsonLd(structuredData)}</script><script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');${eventCall}</script><style>:root{font-family:Manrope,system-ui,sans-serif;color:#172033;background:#f6f8fc}*{box-sizing:border-box}body{margin:0}a{color:#0b57d0}header,main,footer{width:min(1100px,calc(100% - 32px));margin:auto}header{display:flex;align-items:center;justify-content:space-between;padding:22px 0}header img{width:120px;height:auto}header nav{display:flex;gap:18px;flex-wrap:wrap}main{background:#fff;border:1px solid #e5eaf2;border-radius:22px;padding:clamp(22px,5vw,52px);box-shadow:0 18px 55px rgba(28,53,91,.08)}h1{font-size:clamp(2rem,5vw,3.8rem);line-height:1.08;margin:.2em 0}h2{margin-top:1.8em}.lede{font-size:1.1rem;line-height:1.7;color:#536176}.breadcrumbs{font-size:.9rem;color:#66758a}.project-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-top:30px}.project-card{display:block;color:inherit;text-decoration:none;border:1px solid #dfe6f0;border-radius:16px;overflow:hidden;background:#fff}.project-card img{width:100%;height:190px;object-fit:cover}.project-card div{padding:18px}.project-card h2{font-size:1.2rem;margin:0 0 8px}.project-card p{margin:6px 0;color:#536176}.project-hero{width:100%;max-height:520px;object-fit:cover;border-radius:18px;margin:24px 0}.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}.facts div{padding:15px;border-radius:12px;background:#f2f6fc}.facts span{display:block;color:#66758a;font-size:.82rem}.facts strong{display:block;margin-top:5px}.facts div:first-child strong{font-family:"DM Serif Display",serif;font-weight:400}.amenities{display:flex;flex-wrap:wrap;gap:9px;padding:0;list-style:none}.amenities li{background:#edf4ff;border-radius:999px;padding:8px 12px}footer{padding:28px 0;color:#66758a}@media(max-width:640px){header{align-items:flex-start;gap:12px}header nav{justify-content:flex-end}main{width:100%;border-radius:0;border-left:0;border-right:0}}</style></head><body><noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&amp;ev=PageView&amp;noscript=1" alt=""></noscript><header><a href="/" aria-label="Zinoo home"><img src="/brand/zinoo-wordmark-blue.svg" alt="Zinoo"></a><nav aria-label="Public navigation"><a href="/">Home</a><a href="/projects">Projects</a><a href="/plots">Locations</a></nav></header>${body}<footer>© ${new Date().getUTCFullYear()} Zinoo. Buyer-first, plot-focused discovery.</footer></body></html>`;
}

function renderProjectPage(project) {
  const canonical = `${SITE_ORIGIN}/projects/${project.slug}`;
  const locationLabel = project.location || project.locality || project.village || 'Chakan';
  const title = `${project.projectName} | Verified Plot Project in ${locationLabel} | Zinoo`;
  const description = projectDescription(project);
  const facts = [
    project.startingPrice !== null && ['Starting price', formatPrice(project.startingPrice)],
    formatPlotSize(project) && ['Plot sizes', formatPlotSize(project)],
    project.remainingPlots !== null && ['Available plots', String(project.remainingPlots)],
    project.landZone && ['Land zone', project.landZone.replace(/_/g, ' ')],
    project.naStatus && ['NA status', project.naStatus.replace(/_/g, ' ')],
    project.highwayName && ['Connectivity', project.isHighwayTouch ? `${project.highwayName} touch` : project.highwayName],
    project.developerName && ['Developer', project.developerName]
  ].filter(Boolean);
  const place = { '@type': 'Place', name: project.projectName, description, url: canonical };
  if (project.primaryImage) place.image = [project.primaryImage, ...project.galleryImages];
  if (project.latitude !== null && project.longitude !== null) place.geo = { '@type': 'GeoCoordinates', latitude: project.latitude, longitude: project.longitude };
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: title, description, mainEntity: place },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Plots', item: `${SITE_ORIGIN}/plots` },
        ...(project.locationSlug ? [{ '@type': 'ListItem', position: 3, name: project.locationName || project.location, item: `${SITE_ORIGIN}/plots/${project.locationSlug}` }] : []),
        { '@type': 'ListItem', position: project.locationSlug ? 4 : 3, name: project.projectName, item: canonical }
      ] }
    ]
  };
  const locationPath = project.locationSlug ? `/plots/${encodeURIComponent(project.locationSlug)}` : '/plots';
  const unavailable = project.status !== ACTIVE_STATUS
    ? `<section aria-label="Project availability"><h2>${project.status === 'sold' ? 'Sold out' : 'Currently unavailable'}</h2><p class="lede">This project is not currently accepting new availability enquiries. Explore other active projects nearby.</p></section>` : '';
  const nearby = Array.isArray(project.nearbyProjects) && project.nearbyProjects.length
    ? `<section><h2>Nearby projects</h2><div class="project-grid">${project.nearbyProjects.map((item) => `<a class="project-card" href="/projects/${encodeURIComponent(item.slug)}">${item.primaryImage ? `<img src="${escapeHtml(item.primaryImage)}" alt="${escapeHtml(`${item.projectName} project view`)}" loading="lazy">` : ''}<div><h3>${escapeHtml(item.projectName)}</h3><p>${escapeHtml(item.location || '')}</p></div></a>`).join('')}</div></section>` : '';
  const locationCrumb = project.locationSlug ? `<a href="${locationPath}">${escapeHtml(project.locationName || project.village || project.locality || 'Plots')}</a>` : '<a href="/plots">Plots</a>';
  const documents = Array.isArray(project.publicDocuments) && project.publicDocuments.length
    ? `<section><h2>Project plans and documents</h2><ul>${project.publicDocuments.map((document) => `<li><a href="${escapeHtml(document.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(document.title)}</a></li>`).join('')}</ul></section>` : '';
  const body = `<main><p class="breadcrumbs"><a href="/">Home</a> / <a href="/plots">Plots</a> / ${locationCrumb} / ${escapeHtml(project.projectName)}</p><h1>${escapeHtml(project.projectName)}</h1>${project.location ? `<p class="lede"><a href="${locationPath}">${escapeHtml(project.location)}</a></p>` : ''}${unavailable}${project.primaryImage ? `<img class="project-hero" src="${escapeHtml(project.primaryImage)}" alt="${escapeHtml(`${project.projectName} project view`)}" decoding="async" fetchpriority="high">` : ''}${facts.length ? `<section aria-labelledby="project-facts"><h2 id="project-facts">Project details</h2><div class="facts">${facts.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div></section>` : ''}${project.description ? `<section><h2>About this project</h2><p class="lede">${escapeHtml(project.description)}</p></section>` : ''}${project.amenities.length ? `<section><h2>Amenities</h2><ul class="amenities">${project.amenities.map((amenity) => `<li>${escapeHtml(amenity)}</li>`).join('')}</ul></section>` : ''}${documents}${project.galleryImages.length ? `<section><h2>Project gallery</h2><div class="project-grid">${project.galleryImages.map((image, index) => `<img src="${escapeHtml(image)}" alt="${escapeHtml(`${project.projectName} view ${index + 2}`)}" loading="lazy" decoding="async">`).join('')}</div></section>` : ''}${nearby}<p><a href="/projects">← View all published projects</a></p></main>`;
  const html = pageShell({
    title,
    description,
    canonical,
    image: project.primaryImage,
    structuredData,
    body,
    metaEvent: {
      name: 'ViewContent',
      parameters: {
        content_type: 'product',
        content_name: project.projectName,
        content_ids: [project.slug]
      }
    }
  });
  // Preserve this complete server page for crawlers/no-JS clients, then load the
  // deployed Vite application at the same canonical URL for interactive users.
  const handoff = `<script data-zinoo-project-handoff>(function(){if(!window.fetch)return;fetch('/index.html',{cache:'no-store',credentials:'same-origin'}).then(function(response){if(!response.ok)throw new Error('app shell unavailable');return response.text();}).then(function(appShell){document.open();document.write(appShell);document.close();}).catch(function(){/* retain server page */});})();</script>`;
  return html.replace('</body></html>', `${handoff}</body></html>`);
}

function renderProjectsPage(projects, nextCursor = '', currentCursor = '') {
  const canonical = `${SITE_ORIGIN}/projects${currentCursor ? `?after=${encodeURIComponent(currentCursor)}` : ''}`;
  const title = 'Verified Plot Projects | Zinoo';
  const description = 'Browse verified plotted projects available through Zinoo. Compare locations, prices, plot sizes and current availability.';
  const cards = projects.map((project) => `<a class="project-card" href="/projects/${encodeURIComponent(project.slug)}">${project.primaryImage ? `<img src="${escapeHtml(project.primaryImage)}" alt="${escapeHtml(`${project.projectName} project view`)}" loading="lazy">` : ''}<div><h2>${escapeHtml(project.projectName)}</h2><p>${escapeHtml(project.location || '')}</p>${project.startingPrice !== null ? `<p><strong>${escapeHtml(formatPrice(project.startingPrice))}</strong></p>` : ''}${project.status !== ACTIVE_STATUS ? `<p>${project.status === 'sold' ? 'Sold out' : 'Currently unavailable'}</p>` : ''}</div></a>`).join('');
  const next = nextCursor ? `<p><a href="/projects?after=${encodeURIComponent(nextCursor)}">Next projects →</a></p>` : '';
  const structuredData = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: canonical, description,
    mainEntity: { '@type': 'ItemList', itemListElement: projects.map((project, index) => ({ '@type': 'ListItem', position: index + 1, name: project.projectName, url: `${SITE_ORIGIN}/projects/${project.slug}` })) } };
  return pageShell({ title, description, canonical, structuredData, body: `<main><p class="breadcrumbs"><a href="/">Home</a> / Projects</p><h1>Verified Plot Projects</h1><p class="lede">Explore Zinoo's published project inventory.</p><section class="project-grid">${cards}</section>${next}</main>` });
}

function renderPlotsPage(locations) {
  const canonical = `${SITE_ORIGIN}/plots`;
  const title = 'Plots by Location | Zinoo';
  const description = 'Explore verified plot projects by location with Zinoo.';
  const cards = locations.map((location) => `<a class="project-card" href="/plots/${encodeURIComponent(location.slug)}"><div><h2>${escapeHtml(location.name)}</h2><p>${escapeHtml([location.taluka, location.district].filter(Boolean).join(', '))}</p></div></a>`).join('');
  return pageShell({ title, description, canonical, structuredData: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: canonical }, body: `<main><p class="breadcrumbs"><a href="/">Home</a> / Plots</p><h1>Explore plots by location</h1><p class="lede">Browse locations with published Zinoo projects.</p><section class="project-grid">${cards}</section></main>` });
}

function renderLocationPage(location, projects) {
  const canonical = `${SITE_ORIGIN}/plots/${location.slug}`;
  const title = `Plots in ${location.name} | Verified Projects | Zinoo`;
  const description = location.description || `Explore verified plot projects in ${location.name}${location.district ? `, ${location.district}` : ''}.`;
  const cards = projects.map((project) => `<a class="project-card" href="/projects/${encodeURIComponent(project.slug)}">${project.primaryImage ? `<img src="${escapeHtml(project.primaryImage)}" alt="${escapeHtml(`${project.projectName} project view`)}" loading="lazy">` : ''}<div><h2>${escapeHtml(project.projectName)}</h2><p>${escapeHtml(project.location || '')}</p></div></a>`).join('');
  const structuredData = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', url: canonical, name: title, description },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Plots', item: `${SITE_ORIGIN}/plots` },
      { '@type': 'ListItem', position: 3, name: location.name, item: canonical }
    ] }
  ] };
  return pageShell({ title, description, canonical, structuredData, body: `<main><p class="breadcrumbs"><a href="/">Home</a> / <a href="/plots">Plots</a> / ${escapeHtml(location.name)}</p><h1>Plots in ${escapeHtml(location.name)}</h1><p class="lede">${escapeHtml(description)}</p>${projects.length ? `<section class="project-grid">${cards}</section>` : '<p>No active projects are currently available in this location.</p>'}</main>` });
}

function renderNotFoundPage() {
  return pageShell({
    title: 'Project Not Found | Zinoo',
    description: 'The requested Zinoo project page is not available.',
    canonical: `${SITE_ORIGIN}/projects`,
    robots: 'noindex,nofollow',
    structuredData: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Project Not Found' },
    body: '<main><h1>Project not found</h1><p class="lede">This project is unavailable, unpublished or the address is incorrect.</p><p><a href="/projects">View published projects</a></p></main>'
  });
}

function renderSitemap(projects, locations = []) {
  const urls = [
    { loc: `${SITE_ORIGIN}/` },
    { loc: `${SITE_ORIGIN}/projects` },
    { loc: `${SITE_ORIGIN}/plots` },
    { loc: `${SITE_ORIGIN}/privacy-policy` },
    ...locations.map((location) => ({ loc: `${SITE_ORIGIN}/plots/${location.slug}`, lastmod: location.updatedAt?.toDate?.()?.toISOString?.().slice(0, 10) })),
    ...projects.map((project) => ({
      loc: `${SITE_ORIGIN}/projects/${project.slug}`,
      lastmod: project.updatedAt?.toDate?.()?.toISOString?.().slice(0, 10)
    }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ loc, lastmod }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`;
}

function createPublicProjectSeoHandler(db) {
  return async (request, response) => {
    try {
      const requestUrl = new URL(request.originalUrl || request.url, SITE_ORIGIN);
      const path = requestUrl.pathname.replace(/\/+$/, '') || '/';
      response.set('Cache-Control', 'public, max-age=300, s-maxage=900');
      if (path === '/plots-in-chakan') return response.redirect(308, '/plots/chakan');
      if (path === '/api/public-projects') {
        const snapshot = await db.collection('publicProjects').where('status', '==', ACTIVE_STATUS).orderBy('slug').limit(12).get();
        return response.type('application/json').status(200).send({ projects: snapshot.docs.map((doc) => doc.data()) });
      }
      if (path === '/sitemap.xml') {
        const [projectSnapshot, locationSnapshot] = await Promise.all([
          db.collection('publicProjects').get(), db.collection('publicLocations').get()
        ]);
        const projects = projectSnapshot.docs.map((doc) => doc.data());
        const usedLocations = new Set(projects.map((project) => project.locationSlug).filter(Boolean));
        const locations = locationSnapshot.docs.map((doc) => doc.data())
          .filter((location) => location.curated === true || usedLocations.has(location.slug));
        const xml = renderSitemap(projects, locations);
        return response.type('application/xml').status(200).send(xml);
      }
      if (path === '/projects') {
        const after = text(requestUrl.searchParams.get('after'), 90);
        let query = db.collection('publicProjects').orderBy('slug').limit(PROJECT_PAGE_SIZE + 1);
        if (validSlug(after)) query = query.startAfter(after);
        const snapshot = await query.get();
        const records = snapshot.docs.map((doc) => doc.data());
        const hasNext = records.length > PROJECT_PAGE_SIZE;
        const projects = records.slice(0, PROJECT_PAGE_SIZE);
        return response.type('html').status(200).send(renderProjectsPage(projects, hasNext ? projects.at(-1)?.slug : '', after));
      }
      if (path === '/plots') {
        const snapshot = await db.collection('publicLocations').orderBy('name').limit(500).get();
        return response.type('html').status(200).send(renderPlotsPage(snapshot.docs.map((doc) => doc.data())));
      }
      const locationMatch = path.match(/^\/plots\/([a-z0-9-]+)$/);
      if (locationMatch) {
        const locationSnapshot = await db.collection('publicLocations').doc(locationMatch[1]).get();
        if (!locationSnapshot.exists && locationMatch[1] !== 'chakan') return response.type('html').status(404).send(renderNotFoundPage());
        const projectQuery = locationMatch[1] === 'chakan'
          ? db.collection('publicProjects').where('status', '==', ACTIVE_STATUS).limit(100)
          : db.collection('publicProjects').where('locationSlug', '==', locationMatch[1]).limit(100);
        const projectSnapshot = await projectQuery.get();
        const location = locationSnapshot.exists ? locationSnapshot.data() : {
          id: 'chakan', slug: 'chakan', name: 'Chakan', taluka: 'Khed', district: 'Pune', state: 'Maharashtra', country: 'India',
          description: 'Explore currently published plot projects around Chakan and nearby localities.'
        };
        if (projectSnapshot.empty && location.curated !== true && locationMatch[1] !== 'chakan') {
          return response.type('html').status(404).send(renderNotFoundPage());
        }
        return response.type('html').status(200).send(renderLocationPage(location, projectSnapshot.docs.map((doc) => doc.data())));
      }
      const match = path.match(/^\/projects\/([a-z0-9-]+)$/);
      if (match) {
        const slug = match[1];
        const registry = await db.collection('publicProjectSlugs').doc(slug).get();
        if (!registry.exists) return response.type('html').status(404).send(renderNotFoundPage());
        const registryData = registry.data();
        if (registryData.redirect && registryData.canonicalSlug !== slug) return response.redirect(308, `/projects/${encodeURIComponent(registryData.canonicalSlug)}`);
        const projectSnapshot = await db.collection('publicProjects').doc(registryData.projectId).get();
        if (!projectSnapshot.exists) return response.type('html').status(404).send(renderNotFoundPage());
        const project = projectSnapshot.data();
        const nearbySnapshot = project.locationSlug
          ? await db.collection('publicProjects')
            .where('locationSlug', '==', project.locationSlug)
            .where('status', '==', ACTIVE_STATUS)
            .limit(4).get()
          : null;
        project.locationName = project.village || project.locality || project.location;
        project.nearbyProjects = nearbySnapshot ? nearbySnapshot.docs.map((doc) => doc.data()).filter((item) => item.slug !== project.slug).slice(0, 3) : [];
        return response.type('html').status(200).send(renderProjectPage(project));
      }
      return response.type('html').status(404).send(renderNotFoundPage());
    } catch (error) {
      console.error('[Zinoo Public SEO] Rendering failed', { message: error?.message });
      return response.set('Cache-Control', 'no-store').type('html').status(503).send(pageShell({
        title: 'Projects Temporarily Unavailable | Zinoo',
        description: 'Zinoo project information is temporarily unavailable.',
        canonical: `${SITE_ORIGIN}/projects`,
        robots: 'noindex,nofollow',
        structuredData: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Projects Temporarily Unavailable' },
        body: '<main><h1>Projects temporarily unavailable</h1><p>Please try again shortly.</p></main>'
      }));
    }
  };
}

module.exports = {
  ACTIVE_STATUS,
  createPublicProjectSeoHandler,
  renderLocationPage,
  renderNotFoundPage,
  renderPlotsPage,
  renderProjectPage,
  renderProjectsPage,
  renderSitemap,
  sanitizePublicProject,
  slugify
};
