const test = require('node:test');
const assert = require('node:assert/strict');
const { projectPublicProjection } = require('./publicProjectProjection');

const clone = (value) => value === undefined ? undefined : structuredClone(value);

class MemoryFirestore {
  constructor(seed = {}) {
    this.records = new Map(Object.entries(seed).map(([path, value]) => [path, clone(value)]));
  }
  collection(name) { return new MemoryCollection(this, name); }
  async runTransaction(callback) { return callback(new MemoryTransaction(this)); }
  snapshot(ref) {
    const data = this.records.get(ref.path);
    return { id: ref.id, ref, exists: data !== undefined, data: () => clone(data) };
  }
  querySnapshot(query) {
    let docs = [...this.records.entries()]
      .filter(([path]) => path.startsWith(`${query.name}/`) && path.split('/').length === 2)
      .map(([path]) => this.snapshot(new MemoryDocument(this, path)));
    for (const [field, operator, value] of query.filters) {
      assert.equal(operator, '==');
      docs = docs.filter((doc) => doc.data()?.[field] === value);
    }
    if (query.max !== null) docs = docs.slice(0, query.max);
    return { docs, empty: docs.length === 0 };
  }
}

class MemoryCollection {
  constructor(db, name, filters = [], max = null) { this.db = db; this.name = name; this.filters = filters; this.max = max; }
  doc(id) { return new MemoryDocument(this.db, `${this.name}/${id}`); }
  where(field, operator, value) { return new MemoryCollection(this.db, this.name, [...this.filters, [field, operator, value]], this.max); }
  limit(max) { return new MemoryCollection(this.db, this.name, this.filters, max); }
  async get() { return this.db.querySnapshot(this); }
}

class MemoryDocument {
  constructor(db, path) { this.db = db; this.path = path; this.id = path.split('/').at(-1); }
  async get() { return this.db.snapshot(this); }
}

class MemoryTransaction {
  constructor(db) { this.db = db; }
  async get(target) { return target instanceof MemoryDocument ? this.db.snapshot(target) : this.db.querySnapshot(target); }
  set(ref, value, options = {}) {
    const next = clone(value);
    this.db.records.set(ref.path, options.merge ? { ...(this.db.records.get(ref.path) || {}), ...next } : next);
  }
  update(ref, value) {
    if (!this.db.records.has(ref.path)) throw new Error(`Cannot update missing document ${ref.path}`);
    this.db.records.set(ref.path, { ...this.db.records.get(ref.path), ...clone(value) });
  }
  delete(ref) { this.db.records.delete(ref.path); }
}

const activeProject = (overrides = {}) => ({
  name: 'Matoshri Park', status: 'active', village: 'Kuruli', taluka: 'Khed', district: 'Pune',
  thumbnail: 'https://zinoo.in/project.webp', updatedAt: '2026-08-12T00:00:00.000Z', ...overrides
});

test('a delayed active event cannot recreate a currently deleted project', async () => {
  const db = new MemoryFirestore({
    'publicProjects/p1': { projectId: 'p1', slug: 'matoshri-park', locationSlug: 'kuruli', historicalSlugs: [] },
    'publicProjectSlugs/matoshri-park': { projectId: 'p1', canonicalSlug: 'matoshri-park', redirect: false },
    'publicLocations/kuruli': { slug: 'kuruli', identityKey: 'pune|khed|kuruli', curated: false }
  });
  await projectPublicProjection({ db, projectId: 'p1', after: activeProject() });
  assert.equal(db.records.has('projects/p1'), false);
  assert.equal(db.records.has('publicProjects/p1'), false);
  assert.equal(db.records.has('publicProjectSlugs/matoshri-park'), false);
  assert.equal(db.records.has('publicLocations/kuruli'), false);
});

test('competing slug changes leave one canonical slug and redirect every previous slug', async () => {
  const db = new MemoryFirestore({ 'projects/p1': activeProject() });
  await projectPublicProjection({ db, projectId: 'p1' });
  db.records.set('projects/p1', { ...db.records.get('projects/p1'), publicSlug: 'new-slug-a' });
  await projectPublicProjection({ db, projectId: 'p1' });
  db.records.set('projects/p1', { ...db.records.get('projects/p1'), publicSlug: 'new-slug-b' });
  await projectPublicProjection({ db, projectId: 'p1' });
  const owned = [...db.records.entries()].filter(([path, value]) => path.startsWith('publicProjectSlugs/') && value.projectId === 'p1');
  const canonical = owned.filter(([, value]) => value.redirect === false);
  assert.equal(canonical.length, 1);
  assert.equal(canonical[0][0], 'publicProjectSlugs/new-slug-b');
  assert.equal(db.records.get('publicProjectSlugs/matoshri-park').canonicalSlug, 'new-slug-b');
  assert.equal(db.records.get('publicProjectSlugs/new-slug-a').canonicalSlug, 'new-slug-b');
});

test('same location name in different districts cannot silently overwrite one location', async () => {
  const db = new MemoryFirestore({
    'projects/a': activeProject({ district: 'District A' }),
    'projects/b': activeProject({ district: 'District B' })
  });
  await projectPublicProjection({ db, projectId: 'a' });
  await projectPublicProjection({ db, projectId: 'b' });
  const locations = [...db.records.entries()].filter(([path]) => path.startsWith('publicLocations/'));
  assert.equal(locations.length, 2);
  assert.notEqual(db.records.get('projects/a').locationSlug, db.records.get('projects/b').locationSlug);
});

test('repeated projection runs preserve canonical identity and registry ownership', async () => {
  const db = new MemoryFirestore({ 'projects/p1': activeProject() });
  await projectPublicProjection({ db, projectId: 'p1' });
  const firstSlug = db.records.get('projects/p1').canonicalSlug;
  await projectPublicProjection({ db, projectId: 'p1' });
  await projectPublicProjection({ db, projectId: 'p1' });
  assert.equal(db.records.get('projects/p1').canonicalSlug, firstSlug);
  const canonical = [...db.records.values()].filter((value) => value.projectId === 'p1' && value.redirect === false);
  assert.equal(canonical.length, 1);
});

test('pending review retains approved content but marks it unavailable', async () => {
  const db = new MemoryFirestore({ 'projects/p1': activeProject({ description: 'Approved copy' }) });
  await projectPublicProjection({ db, projectId: 'p1' });
  db.records.set('projects/p1', { ...db.records.get('projects/p1'), status: 'pending', description: 'Unapproved copy' });
  await projectPublicProjection({ db, projectId: 'p1' });
  const projection = db.records.get('publicProjects/p1');
  assert.equal(projection.description, 'Approved copy');
  assert.equal(projection.status, 'unavailable');
  assert.equal(projection.available, false);
});
