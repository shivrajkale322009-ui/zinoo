import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProjectMetaParameters, trackMetaEvent } from './metaPixel.js';

test('builds public project parameters without copying private fields', () => {
  const parameters = buildProjectMetaParameters({
    id: 'project-123',
    name: 'Chakan Green Park',
    phone: '919999999999',
    sellerUid: 'private-seller'
  });

  assert.deepEqual(parameters, {
    content_type: 'product',
    content_name: 'Chakan Green Park',
    content_ids: ['project-123']
  });
  assert.equal('phone' in parameters, false);
  assert.equal('sellerUid' in parameters, false);
});

test('does not throw or report success when the Pixel is unavailable', () => {
  assert.equal(trackMetaEvent('ViewContent', {}, undefined), false);
});

test('sends one requested event to the existing Pixel function', () => {
  const calls = [];
  const sent = trackMetaEvent('Lead', { content_category: 'site_visit' }, (...args) => calls.push(args));
  assert.equal(sent, true);
  assert.deepEqual(calls, [['track', 'Lead', { content_category: 'site_visit' }]]);
});
