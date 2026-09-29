import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, ChevronRight, Clock3, Download, Eye, FileText,
  Maximize2, ShieldCheck, ShieldX, SlidersHorizontal, UserRound, WalletCards, X, XCircle
} from 'lucide-react';
import SearchBar from './ui/SearchBar';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';

export const CASHBACK_STATUS = Object.freeze({
  PENDING_SELLER: 'Pending Seller Approval',
  PENDING_ADMIN: 'Pending Admin Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PAYMENT_PENDING: 'Payment Pending',
  PAID: 'Paid'
});

const money = (value) => `₹${new Intl.NumberFormat('en-IN').format(Number(value) || 0)}`;
const toDate = (value) => value?.toDate?.() || (value ? new Date(value) : null);
const datePart = (value) => {
  const date = toDate(value);
  return date && !Number.isNaN(date.valueOf()) ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};
const timePart = (value) => {
  const date = toDate(value);
  return date && !Number.isNaN(date.valueOf()) ? date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '—';
};
const stamp = (claim) => claim.createdAt || claim.submittedAt;
const requestId = (claim) => claim.cashbackRequestId || `CB-${claim.id.slice(0, 8).toUpperCase()}`;
const statusTone = (status) => status === CASHBACK_STATUS.PAID ? 'paid' : status === CASHBACK_STATUS.REJECTED ? 'rejected' : status === CASHBACK_STATUS.PENDING_SELLER || status === CASHBACK_STATUS.PENDING_ADMIN ? 'pending' : 'approved';
const shortStatus = (status) => status === CASHBACK_STATUS.PENDING_SELLER || status === CASHBACK_STATUS.PENDING_ADMIN ? 'Pending' : status === CASHBACK_STATUS.PAYMENT_PENDING ? 'Approved' : status;
const summaryIcon = (label) => label === 'Pending' ? <Clock3 /> : label === 'Approved' ? <CheckCircle2 /> : label === 'Rejected' ? <XCircle /> : <WalletCards />;

const canEmbedDocument = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:', 'blob:'].includes(url.protocol)) return false;
    // Google pages explicitly deny iframe embedding, so open them separately.
    return url.protocol === 'blob:' || !(url.hostname === 'google.com' || url.hostname.endsWith('.google.com'));
  } catch {
    return false;
  }
};

function DocumentPreview({ claim }) {
  const [expanded, setExpanded] = useState(false);
  const type = (claim.documentType || '').toLowerCase();
  const name = claim.documentName || 'Booking proof';
  const extension = name.split('.').pop()?.toLowerCase();
  const isImage = type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);
  const isPdf = type === 'application/pdf' || extension === 'pdf';
  const canEmbed = canEmbedDocument(claim.proofUrl);
  const preview = isImage ? <img src={claim.proofUrl} alt={`Preview of ${name}`} /> : isPdf && canEmbed ? <iframe src={claim.proofUrl} title={name} /> : <div className="cashback-document-fallback"><FileText size={38} /><strong>Preview unavailable</strong><span>{isPdf && claim.proofUrl ? 'This document must be opened in a separate browser tab.' : 'This file type cannot be previewed.'}</span>{claim.proofUrl && <a href={claim.proofUrl} target="_blank" rel="noopener noreferrer">Open document</a>}</div>;

  useEffect(() => {
    if (!expanded) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setExpanded(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [expanded]);

  return <article className="cashback-card cashback-document-card">
    <div className="cashback-document-heading"><div><h3>Documents</h3><p>{name}</p></div></div>
    <div className="cashback-document-preview" role="button" tabIndex={0} aria-label={`Maximize preview of ${name}`} onClick={() => setExpanded(true)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpanded(true); } }}>
      {preview}<span className="cashback-preview-maximize" aria-hidden="true"><Maximize2 size={16} /></span>
    </div>
    {expanded && <div className="cashback-document-viewer" role="dialog" aria-modal="true" aria-label={`Document preview: ${name}`} onClick={() => setExpanded(false)}><div className="cashback-document-viewer-panel" onClick={(event) => event.stopPropagation()}><header><strong>{name}</strong><button type="button" onClick={() => setExpanded(false)} aria-label="Close document preview"><X size={20} /></button></header><div>{preview}</div></div></div>}
  </article>;
}

function Timeline({ claim }) {
  const rejected = claim.status === CASHBACK_STATUS.REJECTED;
  const sellerRejected = Boolean(claim.sellerRejectionReason);
  const adminRejected = Boolean(claim.adminRejectionReason);
  const steps = [
    ['Request Submitted', true, stamp(claim)],
    [sellerRejected ? 'Rejected by Seller' : 'Seller Approval', sellerRejected ? 'rejected' : Boolean(claim.sellerReviewedAt), claim.sellerReviewedAt],
    [adminRejected ? 'Rejected by Admin' : 'Admin Review', adminRejected ? 'rejected' : Boolean(claim.adminReviewedAt), claim.adminReviewedAt],
    ['Payment Pending', [CASHBACK_STATUS.PAYMENT_PENDING, CASHBACK_STATUS.PAID].includes(claim.status)],
    ['Cashback Paid', claim.status === CASHBACK_STATUS.PAID]
  ];
  return <ol className="cashback-timeline">{steps.map(([label, state, eventDate]) => (
    <li key={label} className={state === 'rejected' ? 'rejected' : state ? 'done' : rejected ? 'stopped' : ''}>
      <span>{state === 'rejected' ? '×' : state ? '✓' : '○'}</span><div><strong>{label}</strong>{eventDate && <small>{datePart(eventDate)} · {timePart(eventDate)}</small>}</div>
    </li>
  ))}</ol>;
}

export default function CashbackWorkspace({ role, cashbacks = [], onBack }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [working, setWorking] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rejectionRemark, setRejectionRemark] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const claims = useMemo(() => [...cashbacks].sort((a, b) => (toDate(stamp(b))?.valueOf() || 0) - (toDate(stamp(a))?.valueOf() || 0)), [cashbacks]);
  const visible = claims.filter((claim) => {
    const text = `${claim.buyerName} ${claim.project || claim.propertyName} ${requestId(claim)} ${claim.status}`.toLowerCase();
    return (filter === 'All' || claim.status === filter) && text.includes(search.toLowerCase());
  });
  const counts = {
    pendingSeller: claims.filter((c) => c.status === CASHBACK_STATUS.PENDING_SELLER).length,
    pendingAdmin: claims.filter((c) => c.status === CASHBACK_STATUS.PENDING_ADMIN).length,
    approved: claims.filter((c) => [CASHBACK_STATUS.APPROVED, CASHBACK_STATUS.PAYMENT_PENDING].includes(c.status)).length,
    rejected: claims.filter((c) => c.status === CASHBACK_STATUS.REJECTED).length,
    paid: claims.filter((c) => c.status === CASHBACK_STATUS.PAID).length
  };

  const act = async (claim, action, rejectionReason = '') => {
    setMessage(''); setError('');
    const payload = { cashbackId: claim.id, action };
    if (action === 'reject') {
      const reason = rejectionReason.trim();
      if (!reason) { setError('A rejection remark is required.'); return; }
      payload.reason = reason;
    }
    if (action === 'approve' && role === 'admin') {
      payload.adminNotes = window.prompt('Internal admin notes (optional):') || '';
    }
    if (action === 'mark_paid') {
      const transactionReference = window.prompt('Transaction reference (required):');
      if (!transactionReference?.trim()) return;
      const paymentMethod = window.prompt('Payment method (required):', 'Bank Transfer');
      if (!paymentMethod?.trim()) return;
      const paymentDate = window.prompt('Payment date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
      if (!paymentDate) return;
      Object.assign(payload, { transactionReference: transactionReference.trim(), paymentMethod: paymentMethod.trim(), paymentDate });
    }
    setWorking(`${claim.id}:${action}`);
    try {
      await httpsCallable(functions, 'manageCashbackRequest')(payload);
      setMessage(`Cashback request ${action === 'mark_paid' ? 'marked paid' : `${action}d`} successfully.`);
      if (action === 'reject') {
        setSelected((current) => current ? { ...current, status: CASHBACK_STATUS.REJECTED, ...(role === 'seller' ? { sellerRejectionReason: payload.reason, sellerReviewedAt: new Date() } : { adminRejectionReason: payload.reason, adminReviewedAt: new Date() }) } : current);
        setRejectionRemark('');
        setShowRejectionForm(false);
      }
    } catch (actionError) {
      setError(actionError?.message || 'Unable to update this request.');
    } finally { setWorking(''); }
  };

  const summary = role === 'admin'
    ? [['Pending Seller', counts.pendingSeller], ['Pending Admin', counts.pendingAdmin], ['Paid', counts.paid], ['Total Pending', money(claims.filter(c => c.status !== CASHBACK_STATUS.PAID && c.status !== CASHBACK_STATUS.REJECTED).reduce((s, c) => s + Number(c.cashbackAmount || 0), 0))]]
    : [['Pending', counts.pendingSeller], ['Approved', counts.pendingAdmin + counts.approved], ['Rejected', counts.rejected], ['Paid', counts.paid]];

  if (selected && claims.some((claim) => claim.id === selected.id)) return <section className="cashback-workspace cashback-details">
    {message && <div className="app-success">{message}</div>}{error && <div className="app-error">{error}</div>}
    <div className="cashback-detail-heading cashback-detail-title"><button type="button" className="cashback-detail-back" onClick={() => setSelected(null)} aria-label="Back to cashback requests"><ArrowLeft size={20} /></button><h2>{selected.project || selected.propertyName}</h2></div>
    <div className="cashback-detail-grid">
      <article className="cashback-card"><h3>Property information</h3><dl><div><dt>Cashback ID</dt><dd>{requestId(selected)}</dd></div><div><dt>Property</dt><dd>{selected.project || selected.propertyName}</dd></div><div><dt>Cashback</dt><dd>{money(selected.cashbackAmount)}</dd></div><div><dt>Status</dt><dd><span className={`cashback-status ${statusTone(selected.status)}`}>{selected.status}</span></dd></div></dl></article>
      <article className="cashback-card"><h3>Progress</h3><Timeline claim={selected} /></article>
      {role === 'admin' && <article className="cashback-card"><h3>Buyer & seller</h3><dl><div><dt>Buyer</dt><dd>{selected.buyerName || '—'}</dd></div><div><dt>Phone</dt><dd>{selected.buyerPhone || '—'}</dd></div><div><dt>Email</dt><dd>{selected.buyerEmail || '—'}</dd></div><div><dt>Seller</dt><dd>{selected.sellerName || selected.projectOwnerId || '—'}</dd></div></dl></article>}
      {(selected.sellerRejectionReason || selected.adminRejectionReason) && <article className="cashback-card cashback-remarks"><h3>Remarks</h3>{selected.sellerRejectionReason && <p><strong>Seller:</strong> {selected.sellerRejectionReason}</p>}{selected.adminRejectionReason && <p><strong>Admin:</strong> {selected.adminRejectionReason}</p>}</article>}
      {selected.proofUrl && <DocumentPreview claim={selected} />}
      {selected.status === CASHBACK_STATUS.PAID && <article className="cashback-card"><h3>Payment information</h3><dl><div><dt>Amount paid</dt><dd>{money(selected.cashbackAmount)}</dd></div><div><dt>Payment date</dt><dd>{selected.paymentDate || datePart(selected.paidAt)}</dd></div><div><dt>Transaction reference</dt><dd>{selected.transactionReference}</dd></div><div><dt>Method</dt><dd>{selected.paymentMethod}</dd></div></dl></article>}
    </div>
    {((role === 'seller' && selected.status === CASHBACK_STATUS.PENDING_SELLER) || (role === 'admin' && selected.status === CASHBACK_STATUS.PENDING_ADMIN)) && <>
      {showRejectionForm && <div className="cashback-rejection-form"><label htmlFor="cashback-rejection-remark">Rejection remark <span>*</span></label><textarea id="cashback-rejection-remark" value={rejectionRemark} onChange={(event) => setRejectionRemark(event.target.value)} maxLength={500} placeholder="Explain why this cashback claim is being rejected" autoFocus /><small>{rejectionRemark.length}/500</small></div>}
      <div className="cashback-actions">{!showRejectionForm && <button disabled={working} onClick={() => act(selected, 'approve')} className="btn-primary"><ShieldCheck size={16} /> Approve</button>}{!showRejectionForm ? <button disabled={working} onClick={() => { setError(''); setShowRejectionForm(true); }} className="btn-secondary danger"><ShieldX size={16} /> Reject</button> : <><button disabled={working || !rejectionRemark.trim()} onClick={() => act(selected, 'reject', rejectionRemark)} className="btn-primary danger"><ShieldX size={16} /> Confirm rejection</button><button disabled={working} onClick={() => { setShowRejectionForm(false); setRejectionRemark(''); setError(''); }} className="btn-secondary">Cancel</button></>}</div>
    </>}
    {role === 'admin' && [CASHBACK_STATUS.APPROVED, CASHBACK_STATUS.PAYMENT_PENDING].includes(selected.status) && <div className="cashback-actions"><button disabled={working} onClick={() => act(selected, 'mark_paid')} className="btn-primary"><WalletCards size={16} /> Mark paid</button></div>}
  </section>;

  return <section className="cashback-workspace">
    <div className="cashback-workspace-heading">{onBack && <button type="button" className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /></button>}<div><span>{role === 'buyer' ? 'Your rewards' : `${role} workspace`}</span><h2>{role === 'buyer' ? 'Cashback History' : role === 'seller' ? 'Cashback Requests' : 'Cashback Management'}</h2></div></div>
    {message && <div className="app-success">{message}</div>}{error && <div className="app-error">{error}</div>}
    {role !== 'buyer' && <div className="cashback-summary">{summary.map(([label, value]) => <article key={label}><i>{summaryIcon(label)}</i><div><span>{label}</span><strong>{value}</strong></div></article>)}</div>}
    <div className="cashback-toolbar"><SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer, property or ID" trailingWidget={<SlidersHorizontal size={20} />} /><select value={filter} onChange={e => setFilter(e.target.value)}><option value="All">All Requests</option>{Object.values(CASHBACK_STATUS).map(status => <option key={status}>{status}</option>)}</select>{role === 'admin' && <button type="button" className="btn-secondary" onClick={() => { const rows = [['Cashback ID', 'Buyer', 'Seller', 'Property', 'Area', 'Amount', 'Status', 'Submitted'], ...visible.map(c => [requestId(c), c.buyerName, c.sellerName || c.projectOwnerId, c.project, c.purchasedAreaSqFt, c.cashbackAmount, c.status, datePart(stamp(c))])]; const blob = new Blob([rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cashback-report.csv'; a.click(); URL.revokeObjectURL(url); }}><Download size={16} /> Export</button>}</div>
    {!visible.length ? <div className="cashback-empty"><Clock3 size={30} /><h3>No cashback requests</h3><p>Submitted requests will appear here instantly.</p></div> :
      <>
        <div className="cashback-mobile-list" hidden role="list" aria-label="Cashback requests">
          {visible.map((claim) => (
            <button key={claim.id} type="button" role="listitem" className="cashback-mobile-row" onClick={() => setSelected(claim)} aria-label={`View cashback request for ${claim.project || claim.propertyName || 'property'}`}>
              <span className="cashback-mobile-copy">
                <strong>{claim.project || claim.propertyName || 'Unnamed property'}</strong>
                <small>{role !== 'buyer' ? `${claim.buyerName || 'Unknown buyer'} · ` : ''}{requestId(claim)}</small>
                <small>{claim.purchasedAreaSqFt || claim.propertyArea || '—'} sq.ft · {datePart(stamp(claim))}</small>
              </span>
              <span className="cashback-mobile-value">
                <strong>{money(claim.cashbackAmount)}</strong>
                <span className={`cashback-status ${statusTone(claim.status)}`}>{shortStatus(claim.status)}</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="cashback-table-wrap"><table className="cashback-table"><thead><tr>{role !== 'buyer' && <th>Buyer</th>}<th>Request</th><th>Property</th><th>Area</th><th>Cashback</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{visible.map(claim => <tr key={claim.id}>{role !== 'buyer' && <td className="cashback-buyer"><i><UserRound /></i><strong>{claim.buyerName || '—'}</strong></td>}<td className="cashback-request-id"><strong>{requestId(claim)}</strong></td><td className="cashback-property"><strong>{claim.project || claim.propertyName || '—'}</strong></td><td className="cashback-area">{claim.purchasedAreaSqFt || claim.propertyArea || '—'} sq.ft</td><td className="cashback-amount"><strong>{money(claim.cashbackAmount)}</strong></td><td className="cashback-date">{datePart(stamp(claim))}<small>{timePart(stamp(claim))}</small></td><td className="cashback-state"><span className={`cashback-status ${statusTone(claim.status)}`}>{shortStatus(claim.status)}</span></td><td className="cashback-open"><button className="cashback-view" onClick={() => setSelected(claim)} aria-label="View request"><Eye size={17} /><ChevronRight size={22} /></button></td></tr>)}</tbody></table></div>
        <p className="cashback-result-count">Showing {visible.length} of {claims.length} requests</p>
      </>}
  </section>;
}
