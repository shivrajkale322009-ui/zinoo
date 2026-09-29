import test from 'node:test';
import assert from 'node:assert/strict';
import { templateMedia } from './whatsappTemplateMedia.js';

test('extracts reusable HTTPS sample media, skipping upload handles and unsafe URLs', () => {
  const result = templateMedia({ components: [{ type: 'HEADER', format: 'IMAGE', example: {
    header_handle: ['4::upload-handle', 'http://example.com/photo.jpg', 'https://user:password@example.com/photo.jpg', 'https://cdn.example.com/photo.jpg?token=sample'],
  } }] });
  assert.deepEqual(result, { required: true, format: 'IMAGE', url: 'https://cdn.example.com/photo.jpg?token=sample' });
});

test('media without a reusable sample requires a manual image', () => {
  assert.deepEqual(templateMedia({ components: [{ type: 'HEADER', format: 'IMAGE' }] }), { required: true, format: 'IMAGE', url: '' });
});

test('plain and text-header templates do not require media', () => {
  assert.equal(templateMedia({ components: [{ type: 'HEADER', format: 'TEXT', text: 'Hello' }] }).required, false);
  assert.equal(templateMedia(null).required, false);
});
