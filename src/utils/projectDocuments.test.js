import assert from 'node:assert/strict';
import test from 'node:test';
import { getProjectDocumentPreviewKind, normalizeProjectDocuments } from './projectDocuments.js';

test('infers PDF metadata from encoded Firebase Storage URLs', () => {
  const [document] = normalizeProjectDocuments({
    documents: [{
      displayName: 'JAY GANESH Layout 252',
      url: 'https://firebasestorage.googleapis.com/v0/b/druvio/o/project-documents%2Fowner%2Flayout-252.pdf?alt=media'
    }]
  });

  assert.equal(document.fileType, 'PDF');
  assert.equal(document.contentType, 'application/pdf');
  assert.equal(document.mimeType, 'application/pdf');
});

test('routes presentations externally instead of attempting an in-app frame', () => {
  assert.equal(getProjectDocumentPreviewKind({
    displayName: 'Untitled presentation (1)',
    url: 'https://firebasestorage.googleapis.com/v0/b/druvio/o/project-documents%2Fpresentation.pptx?alt=media'
  }), 'external');
});

test('keeps PDFs and images in the native in-app preview', () => {
  assert.equal(getProjectDocumentPreviewKind({
    url: 'https://storage.example/layout.pdf',
    contentType: 'application/pdf'
  }), 'pdf');
  assert.equal(getProjectDocumentPreviewKind({
    url: 'https://storage.example/site-photo.jpg',
    contentType: 'image/jpeg'
  }), 'image');
});
