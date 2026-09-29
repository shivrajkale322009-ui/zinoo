const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTemplateComponents, sendTemplate } = require('./whatsappService');
const { uploadTemplateImage } = require('./whatsappService');

test('uploads an image without leaking credentials to its source and sends using its ID', async (t) => {
  const calls = [];
  t.mock.method(global, 'fetch', async (url, options) => {
    calls.push({ url: String(url), options });
    if (calls.length === 1) return new Response(new Uint8Array([255, 216, 255]), { headers: { 'content-type': 'image/jpeg' } });
    return new Response(JSON.stringify({ id: '12345' }));
  });
  const id = await uploadTemplateImage({ accessToken: 'test-token', phoneNumberId: '123', url: 'https://zinoo.in/header.jpg' });
  assert.equal(id, '12345');
  assert.equal(calls[0].options.headers, undefined);
  assert.equal(calls[0].options.redirect, 'error');
  assert.equal(calls[1].options.body.get('messaging_product'), 'whatsapp');
  assert.equal(calls[1].options.body.get('file').type, 'image/jpeg');
  assert.deepEqual(buildTemplateComponents(template, 'Name', '', id)[0].parameters[0].image, { id: '12345' });
});

test('rejects inaccessible, oversized, and unsupported image sources before uploading', async (t) => {
  let uploads = 0;
  let response = new Response('', { status: 403 });
  t.mock.method(global, 'fetch', async (_url, options) => {
    if (options.method === 'POST') uploads++;
    return response;
  });
  const args = { url: 'https://zinoo.in/header.jpg', phoneNumberId: '123' };
  await assert.rejects(uploadTemplateImage({ ...args, url: 'https://127.0.0.1/image' }), /hosted/);
  await assert.rejects(uploadTemplateImage(args), /expired/);
  response = new Response('<html>login</html>', { headers: { 'content-type': 'text/html' } });
  await assert.rejects(uploadTemplateImage(args), /JPG or PNG/);
  response = new Response(new Uint8Array(5 * 1024 * 1024 + 1), { headers: { 'content-type': 'image/png' } });
  await assert.rejects(uploadTemplateImage(args), /5 MB/);
  assert.equal(uploads, 0);
});

const template = { metaTemplateName: 'marketing_v1', language: 'en', components: [
  { type: 'HEADER', format: 'IMAGE' },
  { type: 'BODY', text: 'Hello {{customer_name}}' },
] };

test('media template includes image and named recipient parameter', () => {
  assert.deepEqual(buildTemplateComponents(template, 'Customer One', 'https://example.com/image.jpg'), [
    { type: 'header', parameters: [{ type: 'image', image: { link: 'https://example.com/image.jpg' } }] },
    { type: 'body', parameters: [{ type: 'text', text: 'Customer One', parameter_name: 'customer_name' }] },
  ]);
});
test('missing and invalid media fail before sending', async () => {
  for (const link of ['', 'http://example.com/a.jpg', 'not-a-url']) {
    await assert.rejects(sendTemplate({ template, recipient: '+919876543210', headerMediaUrl: link }), /HTTPS/);
  }
});
test('positional placeholders are deduplicated and ordered', () => {
  assert.deepEqual(buildTemplateComponents({ components: [{ type: 'BODY', text: '{{2}} {{1}} {{1}}' }] }, 'Name'), [
    { type: 'body', parameters: [{ type: 'text', text: 'Name' }, { type: 'text', text: 'Name' }] },
  ]);
});
test('plain templates remain valid and dynamic buttons fail clearly', () => {
  assert.deepEqual(buildTemplateComponents({ components: [{ type: 'BODY', text: 'Hello' }] }), []);
  assert.throws(() => buildTemplateComponents({ components: [{ type: 'BUTTONS', buttons: [{ type: 'URL', url: 'https://example.com/{{1}}' }] }] }), /button parameters/);
});
test('sender posts media payload and retains Meta error details', async (t) => {
  let payload;
  t.mock.method(global, 'fetch', async (_url, options) => {
    payload = JSON.parse(options.body);
    return { ok: false, status: 400, json: async () => ({ error: { message: '(#100) Invalid parameter', error_data: { details: 'Header image is invalid' } } }) };
  });
  await assert.rejects(sendTemplate({ template, recipient: '+919876543210', headerMediaUrl: 'https://example.com/image.jpg', leadName: 'Name' }), /Header image is invalid/);
  assert.equal(payload.template.components[0].parameters[0].image.link, 'https://example.com/image.jpg');
  assert.equal(payload.to, '919876543210');
});
