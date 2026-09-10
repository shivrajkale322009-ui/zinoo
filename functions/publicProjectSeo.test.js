const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createPublicProjectSeoHandler,
  renderNotFoundPage,
  renderLocationPage,
  renderProjectPage,
  renderProjectsPage,
  renderSitemap,
  sanitizePublicProject,
  slugify
} = require('./publicProjectSeo');

test('creates deterministic human-readable slugs and resolves collisions', () => {
  assert.equal(slugify('Matoshri Park Phase 2'), 'matoshri-park-phase-2');
});

test('public projection excludes ownership, contacts and operational metadata', () => {
  const source = {
    name: 'Real Project', status: 'active', village: 'Kuruli', startingPrice: 1200000,
    plotAreaMinSqFt: 1000, plotAreaMaxSqFt: 2000, amenities: ['Water', 'Road'],
    thumbnail: 'https://example.com/project.webp', ownerId: 'private-owner', sellerUid: 'private-seller',
    whatsappNumber: '919999999999', siteVisitContact: '919999999999', reviewedBy: 'admin',
    thumbnailMetadata: { uploadedBy: 'private' }, documents: [{ url: 'private' }]
  };
  const result = sanitizePublicProject(source, 'real-project');
  assert.equal(result.projectName, 'Real Project');
  assert.equal(result.startingPrice, 1200000);
  for (const privateField of ['ownerId', 'sellerUid', 'whatsappNumber', 'siteVisitContact', 'reviewedBy', 'thumbnailMetadata', 'documents']) {
    assert.equal(privateField in result, false);
  }
});

test('project HTML has unique canonical metadata and valid JSON-LD', () => {
  const project = sanitizePublicProject({
    name: 'Real Project', village: 'Kuruli', description: 'A real published project description.',
    thumbnail: 'https://example.com/project.webp', latitude: 18.7, longitude: 73.8
  }, 'real-project');
  const html = renderProjectPage(project);
  assert.match(html, /<title>Real Project \| Verified Plot Project in Kuruli \| Zinoo<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/zinoo\.in\/projects\/real-project"/);
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => JSON.parse(json));
  assert.match(html, /data-zinoo-project-handoff/);
});

test('dynamic sitemap contains only supplied public projects', () => {
  const xml = renderSitemap([{ slug: 'real-project', updatedAt: null }]);
  assert.match(xml, /https:\/\/zinoo\.in\/projects/);
  assert.match(xml, /https:\/\/zinoo\.in\/plots/);
  assert.match(xml, /https:\/\/zinoo\.in\/projects\/real-project/);
  assert.doesNotMatch(xml, /private-project/);
});

test('sold and inactive projects retain public status pages and canonical links', () => {
  for (const status of ['sold', 'inactive']) {
    const project = sanitizePublicProject({ name: 'Lifecycle Project', status, village: 'Kuruli' }, 'lifecycle-project');
    const html = renderProjectPage(project);
    assert.match(html, /https:\/\/zinoo\.in\/projects\/lifecycle-project/);
    assert.match(html, status === 'sold' ? /Sold out/ : /Currently unavailable/);
  }
});

test('project HTML links to its canonical location and nearby project', () => {
  const project = sanitizePublicProject({ name: 'Main Project', status: 'active', village: 'Kuruli' }, 'main-project');
  project.nearbyProjects = [{ slug: 'nearby-project', projectName: 'Nearby Project', location: 'Kuruli', primaryImage: '' }];
  const html = renderProjectPage(project);
  assert.match(html, /href="\/plots\/kuruli"/);
  assert.match(html, /href="\/projects\/nearby-project"/);
});

test('inventory and location pages expose crawlable canonical project links', () => {
  const project = sanitizePublicProject({ name: 'Linked Project', status: 'active', village: 'Kuruli' }, 'linked-project');
  assert.match(renderProjectsPage([project]), /href="\/projects\/linked-project"/);
  assert.match(renderLocationPage({ slug: 'kuruli', name: 'Kuruli' }, [project]), /href="\/projects\/linked-project"/);
});

test('private source fields never appear in rendered public HTML', () => {
  const project = sanitizePublicProject({ name: 'Safe Project', status: 'active', ownerId: 'PRIVATE_OWNER_VALUE', whatsappNumber: 'PRIVATE_PHONE_VALUE' }, 'safe-project');
  const html = renderProjectPage(project);
  assert.doesNotMatch(html, /PRIVATE_OWNER_VALUE|PRIVATE_PHONE_VALUE/);
});

const responseRecorder = () => {
  const record = { statusCode: 200, body: '', redirectCode: null, redirectTo: null };
  return { record, response: {
    set() { return this; }, type() { return this; }, status(code) { record.statusCode = code; return this; },
    send(body) { record.body = body; return this; }, redirect(code, target) { record.redirectCode = code; record.redirectTo = target; return this; }
  } };
};

const handlerDb = ({ registry = {}, projects = {}, locations = {} } = {}) => ({
  collection(name) {
    const records = name === 'publicProjectSlugs' ? registry : name === 'publicLocations' ? locations : projects;
    const makeQuery = (filters = [], max = null) => ({
      doc(id) { return { get: async () => {
        const value = records[id];
        return { exists: Boolean(value), data: () => value };
      } }; },
      where(field, operator, value) { assert.equal(operator, '=='); return makeQuery([...filters, [field, value]], max); },
      orderBy() { return makeQuery(filters, max); },
      limit(value) { return makeQuery(filters, value); },
      startAfter() { return makeQuery(filters, max); },
      async get() {
        let entries = Object.entries(records).filter(([, value]) => filters.every(([field, expected]) => value[field] === expected));
        if (max !== null) entries = entries.slice(0, max);
        const docs = entries.map(([id, value]) => ({ id, data: () => value }));
        return { docs, empty: docs.length === 0 };
      }
    });
    return makeQuery();
  }
});

test('direct project lookup returns 200, old slug redirects, and invalid slug returns 404', async () => {
  const project = sanitizePublicProject({ name: 'Canonical Project', status: 'active' }, 'canonical-project');
  const db = handlerDb({ registry: {
    'canonical-project': { projectId: 'p1', canonicalSlug: 'canonical-project', redirect: false },
    'old-project': { projectId: 'p1', canonicalSlug: 'canonical-project', redirect: true }
  }, projects: { p1: project } });
  const handler = createPublicProjectSeoHandler(db);
  const canonical = responseRecorder();
  await handler({ originalUrl: '/projects/canonical-project' }, canonical.response);
  assert.equal(canonical.record.statusCode, 200);
  assert.match(canonical.record.body, /Canonical Project/);
  const trailingSlash = responseRecorder();
  await handler({ originalUrl: '/projects/canonical-project/' }, trailingSlash.response);
  assert.equal(trailingSlash.record.statusCode, 200);
  assert.match(trailingSlash.record.body, /rel="canonical" href="https:\/\/zinoo\.in\/projects\/canonical-project"/);
  const old = responseRecorder();
  await handler({ originalUrl: '/projects/old-project' }, old.response);
  assert.equal(old.record.redirectCode, 308);
  assert.equal(old.record.redirectTo, '/projects/canonical-project');
  const missing = responseRecorder();
  await handler({ originalUrl: '/projects/missing-project' }, missing.response);
  assert.equal(missing.record.statusCode, 404);
});

test('nearby query returns active projects even when sold and inactive projects share the location', async () => {
  const main = sanitizePublicProject({ name: 'Main Project', status: 'active', village: 'Kuruli' }, 'main-project');
  const sold = sanitizePublicProject({ name: 'Sold Project', status: 'sold', village: 'Kuruli' }, 'sold-project');
  const inactive = sanitizePublicProject({ name: 'Inactive Project', status: 'inactive', village: 'Kuruli' }, 'inactive-project');
  const activeC = sanitizePublicProject({ name: 'Active Project C', status: 'active', village: 'Kuruli' }, 'active-c');
  const activeD = sanitizePublicProject({ name: 'Active Project D', status: 'active', village: 'Kuruli' }, 'active-d');
  const db = handlerDb({
    registry: { 'main-project': { projectId: 'main', canonicalSlug: 'main-project', redirect: false } },
    projects: { main, sold, inactive, activeC, activeD }
  });
  const result = responseRecorder();
  await createPublicProjectSeoHandler(db)({ originalUrl: '/projects/main-project' }, result.response);
  assert.equal(result.record.statusCode, 200);
  assert.match(result.record.body, /Active Project C/);
  assert.match(result.record.body, /Active Project D/);
  assert.doesNotMatch(result.record.body, /Sold Project|Inactive Project/);
});

test('empty non-curated locations return 404 while curated locations remain available', async () => {
  const db = handlerDb({
    locations: {
      empty: { slug: 'empty', name: 'Empty', curated: false },
      curated: { slug: 'curated', name: 'Curated', curated: true }
    }
  });
  const handler = createPublicProjectSeoHandler(db);
  const empty = responseRecorder();
  await handler({ originalUrl: '/plots/empty' }, empty.response);
  assert.equal(empty.record.statusCode, 404);
  const curated = responseRecorder();
  await handler({ originalUrl: '/plots/curated' }, curated.response);
  assert.equal(curated.record.statusCode, 200);
});

test('invalid project response is noindex', () => {
  const html = renderNotFoundPage();
  assert.match(html, /name="robots" content="noindex,nofollow"/);
});

test('project content is escaped in HTML and JSON-LD', () => {
  const project = sanitizePublicProject({
    name: '<script>alert(1)</script>',
    description: '<img src=x onerror=alert(1)>',
    thumbnail: 'javascript:alert(1)'
  }, 'safe-project');
  const html = renderProjectPage(project);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /<img src=x onerror/);
  assert.doesNotMatch(html, /javascript:alert/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('server-rendered pages initialize the Meta Pixel and PageView exactly once', () => {
  const project = sanitizePublicProject({ name: 'Real Project' }, 'real-project');
  const html = renderProjectPage(project);
  assert.equal((html.match(/fbq\('init','2252404462242027'\)/g) || []).length, 1);
  assert.equal((html.match(/fbq\('track','PageView'\)/g) || []).length, 1);
  assert.equal((html.match(/fbq\('track','ViewContent'/g) || []).length, 1);
  assert.match(html, /"content_name":"Real Project"/);
  assert.match(html, /"content_ids":\["real-project"\]/);
});
