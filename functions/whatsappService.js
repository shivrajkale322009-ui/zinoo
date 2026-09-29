const META_GRAPH_BASE = 'https://graph.facebook.com/v21.0';

const toE164 = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  return /^\+\d{8,15}$/.test(String(value || '').trim()) ? String(value).trim() : null;
};

const normalizeE164 = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return /^\d{8,15}$/.test(digits) ? `+${digits}` : null;
};

function buildTemplateComponents(template, leadName, headerMediaUrl, headerMediaId) {
  const components = [];
  const header = (template.components || []).find((part) => part.type === 'HEADER');
  if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
    let url;
    if (!headerMediaId) {
      try { url = new URL(headerMediaUrl); } catch { throw new Error('Add a public HTTPS link for this template’s header media.'); }
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Header media must use a public HTTPS link.');
    }
    const type = header.format.toLowerCase();
    components.push({ type: 'header', parameters: [{ type, [type]: headerMediaId ? { id: headerMediaId } : { link: url.href } }] });
  } else if (header && header.format !== 'TEXT') {
    throw new Error('This template header is not supported. Choose a text or media template.');
  }
  for (const part of (template.components || []).filter((part) => ['HEADER', 'BODY'].includes(part.type))) {
    const variables = [...new Set([...String(part.text || '').matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((match) => match[1]))];
    if (variables.every((name) => /^\d+$/.test(name))) variables.sort((a, b) => Number(a) - Number(b));
    if (variables.length) components.push({ type: part.type.toLowerCase(), parameters: variables.map((name) => ({ type: 'text', text: String(leadName || 'Customer').slice(0, 100), ...(/^\d+$/.test(name) ? {} : { parameter_name: name }) })) });
  }
  if ((template.components || []).some((part) => part.type === 'BUTTONS' && part.buttons?.some((button) => /\{\{/.test(button.url || '') || !['URL', 'PHONE_NUMBER', 'QUICK_REPLY'].includes(button.type)))) {
    throw new Error('This template needs button parameters that are not supported yet. Choose a template with fixed buttons.');
  }
  return components;
}

async function sendTemplate({ accessToken, phoneNumberId, recipient, template, leadName, headerMediaUrl, headerMediaId }) {
  const components = buildTemplateComponents(template, leadName, headerMediaUrl, headerMediaId);
  const response = await fetch(`${META_GRAPH_BASE}/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to: recipient.replace(/^\+/, ''), type: 'template',
      template: { name: template.metaTemplateName, language: { code: template.language }, ...(components ? { components } : {}) }
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error([payload?.error?.message || `Meta API returned ${response.status}.`, payload?.error?.error_data?.details].filter(Boolean).join(' '));
    error.transient = response.status === 429 || response.status >= 500;
    throw error;
  }
  return payload?.messages?.[0]?.id || null;
}

async function sendText({ accessToken, phoneNumberId, recipient, body }) {
  const response = await fetch(`${META_GRAPH_BASE}/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to: recipient.replace(/^\+/, ''), type: 'text',
      text: { preview_url: false, body }
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Meta API returned ${response.status}.`);
  return payload?.messages?.[0]?.id || null;
}

async function uploadTemplateImage({ accessToken, phoneNumberId, url }) {
  const source = new URL(url);
  const allowed = ['zinoo.in', 'www.zinoo.in', 'firebasestorage.googleapis.com', 'storage.googleapis.com'];
  if (source.protocol !== 'https:' || source.username || source.password || (source.port && source.port !== '443')
    || !(allowed.includes(source.hostname) || source.hostname.endsWith('.fbcdn.net') || source.hostname.endsWith('.fbsbx.com'))) {
    throw new Error('Use a header image hosted on Zinoo, Firebase Storage, or Meta.');
  }
  const response = await fetch(source, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('The header image cannot be downloaded. Its link may have expired. Choose a fresh image link.');
  const type = response.headers.get('content-type')?.split(';')[0].trim();
  if (!['image/jpeg', 'image/png'].includes(type)) throw new Error('The header image must be a JPG or PNG file.');
  const limit = 5 * 1024 * 1024;
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error('The header image must be 5 MB or smaller.');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  if (!size) throw new Error('The header image is empty.');
  const form = new FormData();
  form.set('messaging_product', 'whatsapp');
  form.set('type', type);
  form.set('file', new Blob(chunks, { type }), type === 'image/png' ? 'header.png' : 'header.jpg');
  const uploaded = await fetch(`${META_GRAPH_BASE}/${encodeURIComponent(phoneNumberId)}/media`, {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: form, signal: AbortSignal.timeout(30000),
  });
  const payload = await uploaded.json().catch(() => ({}));
  if (!uploaded.ok || !payload.id) throw new Error(payload?.error?.message || 'WhatsApp could not upload the header image.');
  return String(payload.id);
}

module.exports = { sendTemplate, sendText, toE164, normalizeE164, buildTemplateComponents, uploadTemplateImage };
