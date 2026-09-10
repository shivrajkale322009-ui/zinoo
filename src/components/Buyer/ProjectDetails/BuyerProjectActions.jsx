import React from 'react';
import {
  Heart,
  LayoutGrid,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  X
} from 'lucide-react';

export default function BuyerProjectActions({
  variant,
  actions,
  showMap,
  saved,
  callHref,
  order,
  onShare,
  onSave,
  onClose,
  onViewLayout,
  onDirections,
  onWhatsApp,
  onRequireAuth,
  previewEditor
}) {
  if (variant === 'header') {
    return (
      <div className="premium-project-hero-actions" aria-label="Project actions">
        <button type="button" onClick={onShare} aria-label="Share project"><Share2 size={18} /></button>
        <button type="button" onClick={onSave} aria-label={saved ? 'Remove from saved projects' : 'Save project'}>
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <button type="button" onClick={onClose} aria-label="Close project details"><X size={20} /></button>
      </div>
    );
  }

  if (variant === 'contact') {
    return (
      <div className="google-hero-contact-actions">
        {previewEditor?.editing && <input className="preview-inline-input preview-contact-input" type="tel" aria-label="Developer contact number" value={previewEditor.contactNumber} onChange={(event) => previewEditor.setField('contactNumber', event.target.value, { whatsappNumber: event.target.value, siteVisitContact: event.target.value, siteVisitContactNumber: event.target.value })} />}
        {actions.showCall && actions.callNumber && <a href={callHref} onClick={onRequireAuth ? (event) => { event.preventDefault(); onRequireAuth(); } : undefined}><Phone size={18} /> Call</a>}
        <button type="button" className="whatsapp" onClick={onWhatsApp}><MessageCircle size={18} /> WhatsApp</button>
      </div>
    );
  }

  return (
    <section className="reference-bottom-cta" aria-label="Project actions">
      {actions.showViewLayout && <button type="button" onClick={onViewLayout}><LayoutGrid size={19} /> View Layout</button>}
      {actions.showMap && showMap && <button type="button" className="reference-map-action" onClick={onDirections}><Navigation size={19} /> Open in Map</button>}
    </section>
  );
}
