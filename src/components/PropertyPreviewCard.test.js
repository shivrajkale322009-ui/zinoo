import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('featured cards give their media and informational content the canonical project href', async () => {
  const source = await readFile(new URL('./PropertyPreviewCard.jsx', import.meta.url), 'utf8');
  assert.match(source, /const linkFeaturedContent = isHomeFeatured && Boolean\(projectHref\)/);
  assert.match(source, /property-preview-primary-link property-preview-media-link/);
  assert.match(source, /linkFeaturedContent \? <a className="property-preview-primary-link" href=\{projectHref\}/);
  assert.match(source, /onClick=\{openCanonicalLink\}/);
});
