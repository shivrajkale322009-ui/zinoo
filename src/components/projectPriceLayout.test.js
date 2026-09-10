import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const styles = () => readFile(new URL('../index.css', import.meta.url), 'utf8');

test('property detail price keeps intrinsic width and cannot break character by character', async () => {
  const css = await styles();
  assert.match(css, /\.reference-property-details \.reference-price-line > strong \{[^}]*flex:\s*0 0 auto;/s);
  assert.match(css, /\.reference-property-details \.reference-price-line > strong \{[^}]*min-width:\s*max-content;/s);
  assert.match(css, /\.reference-property-details \.reference-price-line > strong \{[^}]*overflow-wrap:\s*normal;/s);
  assert.match(css, /\.reference-property-details \.reference-price-line > strong \{[^}]*white-space:\s*nowrap;/s);
  assert.match(css, /\.reference-property-details \.reference-price-line > strong \{[^}]*word-break:\s*normal;/s);
});

test('full mobile details keep contact actions below the identity and price row', async () => {
  const css = await styles();
  assert.match(css, /\.map-property-bottom-sheet\.sheet-full \.reference-property-intro \{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/s);
  assert.match(css, /\.reference-property-details \.google-hero-contact-actions \{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s);
});
