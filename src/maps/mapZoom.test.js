import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { getProjectMarkerState } from './mapZoom.js';
import { CLUSTER_RADIUS_PX, CLUSTER_HEIGHT_PX, buildScreenSpaceClusters, createClusterRepresentations, createStablePropertyClusters } from './markerCollision.js';

const project = { id: 'project-1', name: 'Test Project', startingPrice: 1000000 };

test('shows the price marker starting at zoom 14', () => {
  assert.equal(getProjectMarkerState({ zoom: 13.9, project }).mode, 'price-only');
  assert.equal(getProjectMarkerState({ zoom: 14, project }).mode, 'full-label');
  assert.equal(getProjectMarkerState({ zoom: 14.1, project }).mode, 'full-label');
});

test('keeps cluster membership and anchors stable across input order and camera context', () => {
  const entries = [
    { project: { id: 'a' }, position: { lat: 18.75, lng: 73.85 } },
    { project: { id: 'b' }, position: { lat: 18.751, lng: 73.851 } }
  ];
  const groups = createStablePropertyClusters(entries, 12);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].kind, 'cluster');
  assert.deepEqual(createStablePropertyClusters([...entries].reverse(), 12), groups);
  assert.equal(createStablePropertyClusters(entries, 19).length, 2);
  assert.equal(createStablePropertyClusters([entries[0]], 12)[0].kind, 'single');
  assert.deepEqual(createStablePropertyClusters([entries[0]], 12)[0].position, entries[0].position);
});

test('keeps individual price markers visible below zoom 14', () => {
  assert.equal(getProjectMarkerState({ zoom: 12, project }).mode, 'price-only');
});

test('keeps the selected layout attached after map camera changes', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.match(source, /keepSelectedLayoutVisible = \(\) => polygonRef\.current\?\.setMap\(map\)/);
  assert.match(source, /map\.addListener\('idle', keepSelectedLayoutVisible\)/);
});

test('renders a layout selected before the asynchronous map is ready', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.match(source, /selected on first render is not skipped/);
  assert.match(source, /\[activeLayout, editingLayout, drawPolygon, clearPolygon, selectedProject, mapReady, layerVisibility\.layouts\]/);
});

test('uses the native marker footprint for mobile collision checks', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.match(source, /const isMobileMap = mapSize\.clientWidth < 768/);
  assert.match(source, /MOBILE_LABEL_WIDTH/);
  assert.match(source, /MOBILE_LABEL_HEIGHT/);
});

const entry = (id, x, y) => ({ project: { id, name: id }, x, y });

test('keeps a single marker at its geographic anchor', () => {
  const [representation] = createClusterRepresentations([entry('a', 0, 0)]);
  assert.equal(representation.kind, 'single');
  assert.equal(representation.entries.length, 1);
});

test('clusters two markers whose footprints overlap more than twenty-five percent', () => {
  const [representation] = createClusterRepresentations([entry('b', 25, 0), entry('a', 0, 0)]);
  assert.equal(CLUSTER_RADIUS_PX, 35);
  assert.equal(representation.kind, 'cluster');
  assert.deepEqual(representation.entries.map(({ project }) => project.id), ['a', 'b']);
});

test('does not merge markers that are vertically apart despite a similar horizontal distance', () => {
  const representations = createClusterRepresentations([entry('a', 0, 0), entry('b', 0, CLUSTER_HEIGHT_PX + 1)]);
  assert.deepEqual(representations.map(({ kind }) => kind), ['single', 'single']);
});

test('keeps touching, below-threshold, and exactly twenty-five-percent overlaps separate', () => {
  for (const x of [35, 28, 26.25]) {
    assert.equal(createClusterRepresentations([entry('a', 0, 0), entry('b', x, 0)]).length, 2);
  }
  assert.equal(createClusterRepresentations([entry('a', 0, 0), entry('b', 26.2, 0)]).length, 1);
});

test('uses shared area for diagonal and vertical overlaps', () => {
  assert.equal(createClusterRepresentations([entry('a', 0, 0), entry('b', 15, 18)]).length, 2);
  assert.equal(createClusterRepresentations([entry('a', 0, 0), entry('b', 15, 17)]).length, 1);
  assert.equal(createClusterRepresentations([entry('a', 0, 0), entry('b', 0, 24)]).length, 2);
  assert.equal(createClusterRepresentations([entry('a', 0, 0), entry('b', 0, 23)]).length, 1);
});

test('uses one cluster for nearby projects', () => {
  const [representation] = createClusterRepresentations([entry('a', 0, 0), entry('b', 10, 4), entry('c', 18, 8)]);
  assert.equal(representation.kind, 'cluster');
  assert.equal(representation.entries.length, 3);
});

test('does not turn a transitive proximity chain into one long cluster', () => {
  const [representation] = createClusterRepresentations([entry('a', 0, 0), entry('b', 20, 0), entry('c', 40, 0)]);
  assert.equal(representation.kind, 'cluster');
  assert.deepEqual(representation.entries.map(({ project }) => project.id), ['a', 'b']);
  assert.deepEqual(createClusterRepresentations([entry('a', 0, 0), entry('b', 20, 0), entry('c', 40, 0)]).map((group) => group.entries.map(({ project }) => project.id)), [['a', 'b'], ['c']]);
});

test('keeps dense 18- and 30-property areas as compact clusters', () => {
  const dense = (count) => Array.from({ length: count }, (_, index) => entry(`project-${String(index).padStart(2, '0')}`, index % 8, Math.floor(index / 8) * 5));
  assert.equal(createClusterRepresentations(dense(18))[0].kind, 'cluster');
  assert.equal(createClusterRepresentations(dense(18))[0].entries.length, 18);
  assert.equal(createClusterRepresentations(dense(30))[0].kind, 'cluster');
  assert.equal(createClusterRepresentations(dense(30))[0].entries.length, 30);
});

test('keeps projects beyond the screen-space radius as individual markers', () => {
  const representations = createClusterRepresentations([entry('a', 0, 0), entry('b', 65, 0)]);
  assert.deepEqual(representations.map(({ kind }) => kind), ['single', 'single']);
});

test('groups screen-space proximity independently of geographic units', () => {
  const groups = buildScreenSpaceClusters([entry('a', 0, 0), entry('b', 25, 0), entry('c', 100, 0)]);
  assert.deepEqual(groups.map((group) => group.map(({ project }) => project.id)), [['a', 'b'], ['c']]);
});

test('gives price-only markers compact, content-sized dimensions', () => {
  const css = fs.readFileSync(new URL('./mapScreen.css', import.meta.url), 'utf8');
  assert.match(css, /\.zinoo-project-marker-price-only \{[^}]*width: max-content[^}]*min-width: 40px[^}]*min-height: 25px/);
});

test('keeps full-label price markers content-sized at zoom 14 and above', () => {
  const css = fs.readFileSync(new URL('./mapScreen.css', import.meta.url), 'utf8');
  assert.match(css, /\.zinoo-project-marker-full-label \{[^}]*width: max-content[^}]*min-width: 40px[^}]*min-height: 25px/);
});

test('includes the price-marker tail in the native Advanced Marker anchor box', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.match(source, /anchor\.className = 'zinoo-project-marker-anchor'/);
  assert.match(source, /tail\.className = 'zinoo-project-marker-tail'/);
  assert.match(source, /anchorTop: '-100%'/);
  const css = fs.readFileSync(new URL('./mapScreen.css', import.meta.url), 'utf8');
  assert.match(css, /\.zinoo-project-marker-anchor \{[\s\S]*flex-direction: column/);
  assert.match(css, /\.zinoo-project-marker-tail \{[\s\S]*width: 10px;[\s\S]*height: 5px;[\s\S]*clip-path/);
  assert.doesNotMatch(css, /\.zinoo-project-marker-tail \{[\s\S]*margin-top:/);
  const markerRule = css.match(/\.zinoo-project-marker \{([\s\S]*?)\n\}/)?.[1] || '';
  assert.doesNotMatch(markerRule, /transition: transform/);
});

test('defers React zoom and marker work until the native map camera is idle', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /addListener\('zoom_changed'/);
  assert.match(source, /idleListener = map\.addListener\('idle',[\s\S]*settleZoomState\(\)/);
  assert.match(source, /isFractionalZoomEnabled: true/);
});

test('uses the Advanced Marker DOM click event for accessible project selection', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  const lifecycle = fs.readFileSync(new URL('./persistentMarkers.js', import.meta.url), 'utf8');
  assert.match(source, /gmpClickable: true/);
  assert.match(lifecycle, /marker\.addEventListener\('gmp-click'/);
  assert.doesNotMatch(lifecycle, /marker\.addListener\('click'/);
  assert.doesNotMatch(source, /marker\.addListener\('click'/);
});

test('uses required collision behavior so Google Maps does not hide a project marker', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.match(source, /const collisionBehavior = window\.google\.maps\.CollisionBehavior\?\.REQUIRED/);
  assert.doesNotMatch(source, /OPTIONAL_AND_HIDES_LOWER_PRIORITY/);
});
