import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

test('loads the scoped admin system after the legacy and shared design styles', () => {
  const main = source('../main.jsx');
  const legacyIndex = main.indexOf("import './index.css'");
  const sharedSystem = main.indexOf("import './styles/zinoo-design-system-v1.css'");
  const adminSystem = main.indexOf("import './styles/admin-system.css'");

  assert.ok(legacyIndex >= 0);
  assert.ok(sharedSystem > legacyIndex);
  assert.ok(adminSystem > sharedSystem);
});

test('keeps the new admin foundation free of emergency cascade patches', () => {
  const css = source('./admin-system.css');
  assert.doesNotMatch(css, /!important/);
  assert.doesNotMatch(css, /margin(?:-left|-right)?\s*:\s*-/);
  assert.match(css, /\.admin-shell\s*\{/);
});

test('uses purpose-built mobile review lists for both approval workflows', () => {
  const admin = source('../components/AdminPanel.jsx');
  assert.match(admin, /aria-label="Pending seller requests"/);
  assert.match(admin, /aria-label="Properties awaiting review"/);
  assert.match(admin, /aria-label="Active projects"/);
});

test('keeps high-frequency admin lists focused on task-relevant information', () => {
  const admin = source('../components/AdminPanel.jsx');
  assert.doesNotMatch(admin, /<small>Buyer<\/small>/);
  assert.match(admin, /admin-property-card-seller/);
  assert.match(admin, /admin-mobile-seller-meta/);
  assert.match(admin, /View Profile/);
});

test('provides a mobile-native cashback list instead of relying on table scrolling', () => {
  const cashback = source('../components/CashbackWorkspace.jsx');
  const css = source('./admin-system.css');
  assert.match(cashback, /cashback-mobile-list/);
  assert.match(cashback, /cashback-mobile-row/);
  assert.match(css, /\.admin-shell \.cashback-table-wrap \{ display: none; \}/);
  assert.match(css, /\.admin-shell \.cashback-mobile-list\[hidden\] \{ display: grid;/);
});

test('keeps one clear mobile gutter owner for admin workspaces', () => {
  const css = source('./admin-system.css');
  const legacy = source('../index.css');
  assert.match(css, /\.backoffice-experience \.live-app-content\s*\{[^}]*padding-right:\s*0;[^}]*padding-left:\s*0;/s);
  assert.match(css, /\.admin-shell \.cashback-workspace \{ padding: 0; \}/);
  assert.doesNotMatch(legacy, /\.admin-buyers-section\s*\{[^}]*!important/s);
  assert.match(css, /\.enterprise-section-form > \.form-section\.enterprise-active-section\s*\{[^}]*border-radius:\s*var\(--admin-radius-card\);/s);
  assert.match(css, /\.admin-property-edit-workspace\s*\{[^}]*width:\s*100%;[^}]*min-width:\s*0;/s);
});

test('uses one shared 768px admin breakpoint and the blue primary token', () => {
  const css = source('./admin-system.css');
  assert.equal((css.match(/@media \(max-width: 768px\)/g) || []).length, 1);
  assert.match(css, /--admin-primary:\s*#2563eb;/);
  assert.match(css, /--admin-control-height:\s*44px;/);
});
