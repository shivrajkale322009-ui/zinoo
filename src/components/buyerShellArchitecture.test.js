import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('desktop buyer shell keeps one persistent header across buyer destinations', async () => {
  const buyer = await read('./BuyerApp.jsx');
  assert.match(buyer, /\['home', 'map', 'saved', 'nearby', 'support', 'developer'\]/);
  assert.match(buyer, /!isAndroidLayout \|\| panelMode !== 'project'/);
  assert.match(buyer, /<DesktopHeader/);
});

test('home remains the existing feed and the map only mounts for the map destination', async () => {
  const [buyer, home] = await Promise.all([
    read('./BuyerApp.jsx'),
    read('./Buyer/Home/BuyerHomeScreen.jsx')
  ]);
  assert.match(buyer, /activeScreen === 'map' && \(\s*<div className=\{`buyer-map-canvas/);
  assert.match(buyer, /activeScreen === 'home' && \(\s*<BuyerHomeScreen>/);
  assert.match(buyer, /useState\(false\);\s*const enableInteractiveMap/);
  assert.match(home, /<FeedBannerCarousel \/>[\s\S]*\{children\}/);
});

test('desktop and tablet content scrolls inside persistent shell boundaries', async () => {
  const styles = await read('../styles/zinoo-design-system-v1.css');
  const shell = styles.slice(styles.lastIndexOf('/* Persistent buyer application shell.'));
  assert.match(shell, /@media \(min-width: 769px\)/);
  assert.match(shell, /--buyer-shell-top: 82px/);
  assert.match(shell, /--buyer-shell-rail: 80px/);
  assert.match(shell, /\.buyer-map-nav[\s\S]*top: var\(--buyer-shell-top\)/);
  assert.match(shell, /\.buyer-home-screen[\s\S]*overflow-y: auto/);
  assert.doesNotMatch(shell, /buyer-mobile-nav/);
});

test('map uses only the viewport remaining below the toolbar and beside the rail', async () => {
  const [buyer, styles, map] = await Promise.all([
    read('./BuyerApp.jsx'),
    read('../styles/zinoo-design-system-v1.css'),
    read('../maps/MapScreen.jsx')
  ]);
  const shell = styles.slice(styles.lastIndexOf('/* Persistent buyer application shell.'));
  assert.match(shell, /\.buyer-map-first-root\.buyer-screen-map \.buyer-map-canvas/);
  assert.match(shell, /position: absolute !important/);
  assert.match(shell, /--buyer-map-content-top: var\(--buyer-shell-top\)/);
  assert.match(shell, /inset: var\(--buyer-map-content-top\) 0 0 var\(--buyer-shell-rail\) !important/);
  assert.match(shell, /height: calc\(100dvh - var\(--buyer-map-content-top\)\) !important/);
  assert.match(shell, /width: calc\(100vw - var\(--buyer-shell-rail\)\) !important/);
  assert.match(shell, /\.buyer-map-first-root\.buyer-screen-map \.buyer-slide-panel[\s\S]*max-height: calc\(100dvh - var\(--buyer-map-content-top\) - 16px\)/);
  assert.match(buyer, /loadVisibleProjects=\{false\}/);
  assert.doesNotMatch(map, /projects in this area/i);
});

test('a mobile map marker opens the existing project sheet as a compact preview', async () => {
  const buyer = await read('./BuyerApp.jsx');
  assert.match(buyer, /const handleMapProjectSelect[\s\S]*fromMapMarker: isAndroidLayout[\s\S]*mobileSheetSnap: isAndroidLayout \? 'collapsed' : 'expanded'/);
  assert.match(buyer, /mapMarkerPreviewProjectId === String\(routeProject\.id \|\| ''\) \? 'collapsed' : 'expanded'/);
  assert.match(buyer, /routeStatus !== 'ready' \|\| !routeProject \|\| routeProject\.slug !== routeSlug/);
  assert.match(buyer, /padding-top:env\(safe-area-inset-top, 0px\)/);
  assert.match(buyer, /const intendedTopGap = Math\.max\(16, getSafeAreaInsetTop\(\)\);\s*const full = Math\.max\(compact, navTop - intendedTopGap\);/);
});

test('an open mobile property sheet owns the bottom edge and hides primary navigation', async () => {
  const [buyer, styles] = await Promise.all([
    read('./BuyerApp.jsx'),
    read('../index.css')
  ]);
  assert.match(buyer, /const panelOpen = activeScreen === 'map' && panelMode === 'project' && Boolean\(selectedProject\);/);
  assert.match(buyer, /\{isAndroidLayout && !panelOpen && activeScreen !== 'cashback' && \(\s*<BuyerMobileNavigation/);
  assert.match(buyer, /const navTop = viewportHeight;\s*const navHeight = 0;/);
  assert.match(buyer, /style=\{isAndroidLayout && panelOpen \? \{ '--sheet-bottom-px': '0px' \} : undefined\}/);
  assert.match(styles, /bottom: var\(--sheet-bottom-px, 0px\) !important;/);
  assert.match(styles, /max-height: calc\(100dvh - var\(--sheet-bottom-px, 0px\)\) !important;/);
});



