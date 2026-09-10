import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { getProjectMarkerState } from './mapZoom.js';
import { CLUSTER_RADIUS_PX, buildScreenSpaceClusters, createClusterRepresentations } from './markerCollision.js';

const project = { id: 'project-1', name: 'Test Project', startingPrice: 1000000 };

test('shows the price marker starting at zoom 14', () => {
  assert.equal(getProjectMarkerState({ zoom: 13.9, project }).mode, 'price-only');
  assert.equal(getProjectMarkerState({ zoom: 14, project }).mode, 'full-label');
  assert.equal(getProjectMarkerState({ zoom: 14.1, project }).mode, 'full-label');
});

test('renders markers only at their saved coordinates without clustering or camera panning', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.match(source, /const position = pointFor\(project\);/);
  assert.doesNotMatch(source, /createClusterRepresentations|CLUSTER_RADIUS_PX|centroidFor|focusPositionForPopup/);
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
  assert.match(source, /\[activeLayout, editingLayout, drawPolygon, clearPolygon, selectedProject, mapReady\]/);
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

test('clusters two projects inside the 64px screen-space radius', () => {
  const [representation] = createClusterRepresentations([entry('b', 40, 0), entry('a', 0, 0)]);
  assert.equal(CLUSTER_RADIUS_PX, 64);
  assert.equal(representation.kind, 'cluster');
  assert.deepEqual(representation.entries.map(({ project }) => project.id), ['a', 'b']);
});

test('uses one cluster for nearby projects', () => {
  const [representation] = createClusterRepresentations([entry('a', 0, 0), entry('b', 10, 4), entry('c', 18, 8)]);
  assert.equal(representation.kind, 'cluster');
  assert.equal(representation.entries.length, 3);
});

test('turns a transitive proximity chain into one cluster', () => {
  const [representation] = createClusterRepresentations([entry('a', 0, 0), entry('b', 40, 0), entry('c', 80, 0)]);
  assert.equal(representation.kind, 'cluster');
  assert.deepEqual(representation.entries.map(({ project }) => project.id), ['a', 'b', 'c']);
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
  const groups = buildScreenSpaceClusters([entry('a', 0, 0), entry('b', 63, 0), entry('c', 128, 0)]);
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
  assert.match(source, /gmpClickable: true,[\s\S]*marker\.addEventListener\('gmp-click'/);
  assert.doesNotMatch(source, /marker\.addListener\('click'/);
});

test('uses required collision behavior so Google Maps does not hide a project marker', () => {
  const source = fs.readFileSync(new URL('./MapScreen.jsx', import.meta.url), 'utf8');
  assert.match(source, /const collisionBehavior = window\.google\.maps\.CollisionBehavior\?\.REQUIRED/);
  assert.doesNotMatch(source, /OPTIONAL_AND_HIDES_LOWER_PRIORITY/);
});
