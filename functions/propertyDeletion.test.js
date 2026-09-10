const test = require('node:test');
const assert = require('node:assert/strict');
const {
  collectCandidateStoragePaths,
  pathFromDownloadUrl,
  propertyStoragePrefixes
} = require('./propertyDeletion');

test('collects property media and document paths without unrelated URLs', () => {
  const paths = [...collectCandidateStoragePaths({
    thumbnailPath: 'project-media/seller/property-1/hero.webp',
    documents: [{ storagePath: 'project-documents/seller/property-1/layout.pdf' }],
    websiteUrl: 'https://example.com'
  })];
  assert.deepEqual(paths.sort(), [
    'project-documents/seller/property-1/layout.pdf',
    'project-media/seller/property-1/hero.webp'
  ]);
});

test('extracts encoded Firebase Storage object paths', () => {
  assert.equal(
    pathFromDownloadUrl('https://firebasestorage.googleapis.com/v0/b/druvio/o/project-documents%2Fowner%2Fproperty%2Flayout.pdf?alt=media'),
    'project-documents/owner/property/layout.pdf'
  );
});

test('builds property-scoped prefixes for each owner', () => {
  assert.deepEqual(propertyStoragePrefixes('property-1', ['seller-1']), [
    'project-media/seller-1/property-1/',
    'project-documents/seller-1/property-1/'
  ]);
});
