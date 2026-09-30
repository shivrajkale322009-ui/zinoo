import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { templateMedia } from '../utils/whatsappTemplateMedia';

export default function WhatsAppTemplatePreview({ template, headerMediaUrl = '', defaultImageUrl = '', onMediaChange, onReadyChange }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [override, setOverride] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [failedImage, setFailedImage] = useState('');
  useEffect(() => {
    let active = true;
    setResult(null);
    setError('');
    httpsCallable(functions, 'getWhatsAppTemplatePreview')({ templateId: template.id })
      .then(({ data }) => { if (active) setResult({ ...data, templateId: template.id }); })
      .catch(() => { if (active) setError('Unable to load the message preview from Meta.'); });
    return () => { active = false; };
  }, [template.id, attempt]);
  const current = result?.templateId === template.id ? result : null;
  const media = templateMedia(current);
  const defaultMediaUrl = media.format === 'IMAGE' && defaultImageUrl ? defaultImageUrl : media.url;
  const effectiveUrl = onMediaChange ? (override ? manualUrl.trim() : defaultMediaUrl) : headerMediaUrl;
  const validUrl = (() => { try { const url = new URL(effectiveUrl); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; } })();
  useEffect(() => {
    onMediaChange?.(effectiveUrl);
    onReadyChange?.(Boolean(current) && (!media.required || (validUrl && failedImage !== effectiveUrl)));
  }, [effectiveUrl, current, media.required, validUrl, failedImage, onMediaChange, onReadyChange]);
  const components = current?.components || [];
  const hasVariables = components.some((part) => /\{\{[^}]+\}\}/.test(part.text || '') || part.buttons?.some((button) => /\{\{[^}]+\}\}/.test(button.url || '')));
  const previewText = (value) => String(value || '').replace(/\{\{\s*customer_name\s*\}\}/gi, 'Mahendra Pawar').replace(/\{\{\s*name\s*\}\}/gi, 'Mahendra Pawar').replace(/\{\{[^}]+\}\}/g, 'Sample lead');
  return <section className="whatsapp-message-preview" aria-label="WhatsApp message preview">
    <header><strong>Message preview</strong><small>{template.name} · {template.language}</small></header>
    {current && media.required && onMediaChange && <div>
      {!override && defaultMediaUrl && <p>{media.format === 'IMAGE' && defaultImageUrl ? 'Using your campaign header image.' : 'Using the media from your Meta template automatically.'}</p>}
      {!defaultMediaUrl && <p>Meta did not provide a reusable media link. Add a public HTTPS link below.</p>}
      {defaultMediaUrl && <label><input type="checkbox" checked={override} onChange={(event) => setOverride(event.target.checked)} /> Use different media</label>}
      {(override || !defaultMediaUrl) && <label>Header media link<input type="url" value={manualUrl} onChange={(event) => { setOverride(true); setManualUrl(event.target.value); }} placeholder="https://your-site.com/campaign-image.jpg" /></label>}
    </div>}
    {error ? <div role="alert"><p>{error}</p><button type="button" className="btn-secondary" onClick={() => setAttempt((value) => value + 1)}>Retry preview</button></div>
      : !current ? <p role="status">Loading message from Meta…</p>
        : <><div className="whatsapp-preview-bubble">
          {components.map((part, index) => {
            if (part.type === 'HEADER') return part.format === 'TEXT' ? <strong className="whatsapp-preview-header" key={index}>{previewText(part.text)}</strong> : part.format === 'IMAGE' && validUrl && failedImage !== effectiveUrl ? <img key={index} src={effectiveUrl} alt="Campaign header" style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 12 }} onError={() => setFailedImage(effectiveUrl)} /> : <div className="whatsapp-preview-media" key={index}><span>▧</span><small>{failedImage && failedImage === effectiveUrl ? 'Image unavailable. Use a different media link.' : `${String(part.format || 'MEDIA').toLowerCase()} header`}</small></div>;
            if (part.type === 'BODY') return <p className="whatsapp-preview-body" key={index}>{previewText(part.text)}</p>;
            if (part.type === 'FOOTER') return <small className="whatsapp-preview-footer" key={index}>{previewText(part.text)}</small>;
            if (part.type === 'BUTTONS') return <div className="whatsapp-preview-buttons" key={index}>{part.buttons?.map((button, buttonIndex) => <div key={buttonIndex}><span>{button.type === 'URL' ? '↗ ' : button.type === 'PHONE_NUMBER' ? '☎ ' : '↩ '}{button.text}</span></div>)}</div>;
            return <p key={index}>Preview unavailable for {part.type?.toLowerCase() || 'this component'}.</p>;
          })}
          {!components.length && <p>Meta returned no message content for this template.</p>}
        </div><small>Content from Meta. Appearance may vary by device.{hasVariables && ' Variables are shown as placeholders.'}</small></>}
  </section>;
}
