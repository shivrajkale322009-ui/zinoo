import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('guest authentication overlays the buyer app instead of replacing it', async () => {
  const app = await read('../App.jsx');
  assert.match(app, /<main className="live-app view-buyer buyer-experience">[\s\S]*auth-modal-backdrop/);
  assert.match(app, /<LoginScreen\s+presentation="modal"/);
});

test('modal authentication never falls back to full-page redirect', async () => {
  const login = await read('./LoginScreen.jsx');
  assert.match(login, /presentation === 'modal' \|\| !POPUP_FALLBACK_ERRORS/);
  assert.match(login, /role=\{presentation === 'modal' \? 'dialog'/);
});

test('pending authentication preserves buyer and map context', async () => {
  const [buyer, map] = await Promise.all([
    read('./BuyerApp.jsx'),
    read('../maps/MapScreen.jsx')
  ]);
  for (const marker of ['mapFilters', 'panelMode', 'selectedProjectId', 'mobileSheetSnap']) {
    assert.match(buyer, new RegExp(marker));
  }
  assert.match(map, /zinooMapAuthContext/);
});

test('reCAPTCHA host remains mounted outside the conditional login modal', async () => {
  const [app, login] = await Promise.all([read('../App.jsx'), read('./LoginScreen.jsx')]);
  assert.match(app, /\{showLogin && <div className="auth-modal-backdrop"[\s\S]*<div id="recaptcha-container" aria-hidden="true" \/>/);
  assert.doesNotMatch(login, /id="recaptcha-container"/);
});
