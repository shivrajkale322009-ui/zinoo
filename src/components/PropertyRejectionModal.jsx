import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, LoaderCircle, ShieldX, X } from 'lucide-react';

export default function PropertyRejectionModal({ property, seller, rejecting = false, error = '', onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const inputRef = useRef(null);
  const openerRef = useRef(null);
  const valid = reason.trim().length >= 10;

  useEffect(() => {
    if (!property && !seller) return undefined;
    openerRef.current = document.activeElement;
    inputRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !rejecting) onCancel();
      if (event.key === 'Tab') {
        const controls = [...document.querySelectorAll('.property-rejection-modal button:not(:disabled), .property-rejection-modal textarea:not(:disabled)')];
        if (!controls.length) return;
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openerRef.current?.focus?.();
    };
  }, [property, seller, rejecting, onCancel]);

  const subject = seller || property;
  const subjectType = seller ? 'seller application' : 'property submission';
  const subjectName = seller ? (seller.businessName || seller.userName || seller.name || 'this seller') : (property?.name || 'this property');
  if (!subject) return null;
  return <div className="modal-overlay property-rejection-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !rejecting) onCancel(); }}>
    <section className="modal-card property-rejection-modal" role="dialog" aria-modal="true" aria-labelledby="property-rejection-title" aria-describedby="property-rejection-description">
      <div className="modal-head"><div><span className="property-rejection-icon"><AlertTriangle size={19} /></span><h2 id="property-rejection-title">Reject {subjectType}</h2></div><button type="button" disabled={rejecting} onClick={onCancel} aria-label="Close rejection dialog"><X size={19} /></button></div>
      <p id="property-rejection-description">This will reject <strong>{subjectName}</strong>. The reason, reviewer, and review time will be preserved with the application.</p>
      <dl className="property-rejection-context"><div><dt>{seller ? 'Business' : 'Property'}</dt><dd>{subjectName}</dd></div><div><dt>{seller ? 'Applicant' : 'Seller'}</dt><dd>{seller ? (seller.contactPerson || seller.userName || 'Applicant') : (property?.sellerName || property?.developerName || 'Assigned seller')}</dd></div><div><dt>Current state</dt><dd>Pending review</dd></div></dl>
      <label htmlFor="property-rejection-reason">Rejection reason <span aria-hidden="true">*</span></label>
      <textarea ref={inputRef} id="property-rejection-reason" value={reason} disabled={rejecting} maxLength={500} aria-describedby="property-rejection-help" onChange={(event) => setReason(event.target.value)} placeholder={seller ? 'Explain why this seller application cannot be approved.' : 'Explain what must be corrected before this property can be submitted again.'} />
      <div className="property-rejection-help" id="property-rejection-help"><span>Minimum 10 characters</span><span>{reason.length}/500</span></div>
      {error && <div className="app-error" role="alert">{error}</div>}
      <footer className="property-rejection-actions"><button type="button" className="btn-secondary" disabled={rejecting} onClick={onCancel}>Cancel</button><button type="button" className="btn-primary danger" disabled={rejecting || !valid} onClick={() => onConfirm(reason.trim())}>{rejecting ? <><LoaderCircle className="button-spinner" size={17} /> Rejecting…</> : <><ShieldX size={17} /> Confirm rejection</>}</button></footer>
    </section>
  </div>;
}
