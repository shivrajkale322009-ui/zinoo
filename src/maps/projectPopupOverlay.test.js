import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { normalizePopupUrl } from './projectPopupOverlay.js';

test('popup URL normalization rejects executable and unsupported protocols', () => {
  assert.equal(normalizePopupUrl('javascript:alert(1)'), '');
  assert.equal(normalizePopupUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.equal(normalizePopupUrl('ftp://example.com/file'), '');
});

test('popup URL normalization permits expected web and local asset URLs', () => {
  assert.equal(normalizePopupUrl('https://maps.google.com/?q=1,2'), 'https://maps.google.com/?q=1,2');
  assert.equal(normalizePopupUrl('/images/project.webp', { allowRelative: true }), '/images/project.webp');
  assert.equal(normalizePopupUrl('/images/project.webp'), '');
});

test('popup implementation does not render project data through innerHTML', async () => {
  const source = await readFile(new URL('./projectPopupOverlay.js', import.meta.url), 'utf8');
  assert.equal(source.includes('.innerHTML'), false);
  assert.match(source, /textContent/);
});

test('verified projects show a check badge before the popup property name', async () => {
  const source = await readFile(new URL('./projectPopupOverlay.js', import.meta.url), 'utf8');
  assert.match(source, /const createVerifiedBadge = \(\) =>/);
  assert.match(source, /if \(project\.verified !== false\) heading\.appendChild\(createVerifiedBadge\(\)\)/);
});
