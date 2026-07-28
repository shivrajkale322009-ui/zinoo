import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Clock3, Download, Eye, FileText, Search,
  ShieldCheck, ShieldX, WalletCards, XCircle
} from 'lucide-react';
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

function Timeline({ claim }) {
  const rejected = claim.status === CASHBACK_STATUS.REJECTED;
  const steps = [
    ['Request Submitted', true],
    ['Seller Approval', Boolean(claim.sellerReviewedAt) && !claim.sellerRejectionReason],
    ['Admin Review', Boolean(claim.adminReviewedAt) && !claim.adminRejectionReason],
    ['Payment Pending', [CASHBACK_STATUS.PAYMENT_PENDING, CASHBACK_STATUS.PAID].includes(claim.status)],
    ['Cashback Paid', claim.status === CASHBACK_STATUS.PAID]
  ];
  return <ol className="cashback-timeline">{steps.map(([label, done], index) => (
    <li key={label} className={done ? 'done' : rejected && !done ? 'stopped' : ''}>
      <span>{done ? '✓' : '○'}</span><div><strong>{label}</strong>{index === 0 && <small>{datePart(stamp(claim))} · {timePart(stamp(claim))}</small>}</div>
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

  const act = async (claim, action) => {
    setMessage(''); setError('');
    const payload = { cashbackId: claim.id, action };
    if (action === 'reject') {
      const reason = window.prompt('Rejection reason (required):');
      if (!reason?.trim()) return;
      payload.reason = reason.trim();
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
    } catch (actionError) {
      setError(actionError?.message || 'Unable to update this request.');
    } finally { setWorking(''); }
  };

  const summary = role === 'admin'
    ? [['Pending Seller', counts.pendingSeller], ['Pending Admin', counts.pendingAdmin], ['Approved', counts.approved], ['Rejected', counts.rejected], ['Paid', counts.paid], ['Total Paid', money(claims.filter(c => c.status === CASHBACK_STATUS.PAID).reduce((s, c) => s + Number(c.cashbackAmount || 0), 0))], ['Total Pending', money(claims.filter(c => c.status !== CASHBACK_STATUS.PAID && c.status !== CASHBACK_STATUS.REJECTED).reduce((s, c) => s + Number(c.cashbackAmount || 0), 0))]]
    : [['Pending', counts.pendingSeller], ['Approved', counts.pendingAdmin + counts.approved], ['Rejected', counts.rejected], ['Paid', counts.paid]];

  if (selected) return <section className="cashback-workspace cashback-details">
    <button type="button" className="btn-secondary" onClick={() => setSelected(null)}><ArrowLeft size={16} /> Back to requests</button>
    <div className="cashback-detail-heading"><div><span>{requestId(selected)}</span><h2>{selected.project || selected.propertyName}</h2><p>{selected.purchasedAreaSqFt || selected.propertyArea || 0} sq.ft · {money(selected.cashbackAmount)}</p></div><span className={`cashback-status ${statusTone(selected.status)}`}>{selected.status}</span></div>
    <div className="cashback-detail-grid">
      <article className="cashback-card"><h3>Property information</h3><dl><div><dt>Property</dt><dd>{selected.project || selected.propertyName}</dd></div><div><dt>Area</dt><dd>{selected.purchasedAreaSqFt || selected.propertyArea || 0} sq.ft</dd></div><div><dt>Cashback</dt><dd>{money(selected.cashbackAmount)}</dd></div></dl></article>
      <article className="cashback-card"><h3>Progress</h3><Timeline claim={selected} /></article>
      {role === 'admin' && <article className="cashback-card"><h3>Buyer & seller</h3><dl><div><dt>Buyer</dt><dd>{selected.buyerName || '—'}</dd></div><div><dt>Phone</dt><dd>{selected.buyerPhone || '—'}</dd></div><div><dt>Email</dt><dd>{selected.buyerEmail || '—'}</dd></div><div><dt>Seller</dt><dd>{selected.sellerName || selected.projectOwnerId || '—'}</dd></div></dl></article>}
      <article className="cashback-card"><h3>Responses</h3><p><strong>Seller:</strong> {selected.sellerRejectionReason ? `Rejected — ${selected.sellerRejectionReason}` : selected.sellerReviewedAt ? `Approved · ${datePart(selected.sellerReviewedAt)} ${timePart(selected.sellerReviewedAt)}` : 'Pending'}</p><p><strong>Admin:</strong> {selected.adminRejectionReason ? `Rejected — ${selected.adminRejectionReason}` : selected.adminReviewedAt ? `Approved · ${datePart(selected.adminReviewedAt)} ${timePart(selected.adminReviewedAt)}` : 'Pending'}</p>{selected.adminNotes && <p><strong>Admin notes:</strong> {selected.adminNotes}</p>}</article>
      {selected.proofUrl && <article className="cashback-card"><h3>Documents</h3><a className="btn-secondary" href={selected.proofUrl} target="_blank" rel="noreferrer"><FileText size={16} /> View booking proof</a></article>}
      {selected.status === CASHBACK_STATUS.PAID && <article className="cashback-card"><h3>Payment information</h3><dl><div><dt>Amount paid</dt><dd>{money(selected.cashbackAmount)}</dd></div><div><dt>Payment date</dt><dd>{selected.paymentDate || datePart(selected.paidAt)}</dd></div><div><dt>Transaction reference</dt><dd>{selected.transactionReference}</dd></div><div><dt>Method</dt><dd>{selected.paymentMethod}</dd></div></dl></article>}
    </div>
    {role === 'seller' && selected.status === CASHBACK_STATUS.PENDING_SELLER && <div className="cashback-actions"><button disabled={working} onClick={() => act(selected, 'approve')} className="btn-primary"><ShieldCheck size={16} /> Approve</button><button disabled={working} onClick={() => act(selected, 'reject')} className="btn-secondary"><ShieldX size={16} /> Reject</button></div>}
    {role === 'admin' && selected.status === CASHBACK_STATUS.PENDING_ADMIN && <div className="cashback-actions"><button disabled={working} onClick={() => act(selected, 'approve')} className="btn-primary"><ShieldCheck size={16} /> Approve</button><button disabled={working} onClick={() => act(selected, 'reject')} className="btn-secondary"><ShieldX size={16} /> Reject</button></div>}
    {role === 'admin' && [CASHBACK_STATUS.APPROVED, CASHBACK_STATUS.PAYMENT_PENDING].includes(selected.status) && <div className="cashback-actions"><button disabled={working} onClick={() => act(selected, 'mark_paid')} className="btn-primary"><WalletCards size={16} /> Mark paid</button></div>}
  </section>;

  return <section className="cashback-workspace">
    <div className="cashback-workspace-heading">{onBack && <button type="button" className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /></button>}<div><span>{role === 'buyer' ? 'Your rewards' : `${role} workspace`}</span><h2>{role === 'buyer' ? 'Cashback History' : role === 'seller' ? 'Cashback Requests' : 'Cashback Management'}</h2></div></div>
    {message && <div className="app-success">{message}</div>}{error && <div className="app-error">{error}</div>}
    {role !== 'buyer' && <div className="cashback-summary">{summary.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>}
    <div className="cashback-toolbar"><label><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer, property or ID" /></label><select value={filter} onChange={e => setFilter(e.target.value)}><option>All</option>{Object.values(CASHBACK_STATUS).map(status => <option key={status}>{status}</option>)}</select>{role === 'admin' && <button type="button" className="btn-secondary" onClick={() => { const rows = [['Cashback ID', 'Buyer', 'Seller', 'Property', 'Area', 'Amount', 'Status', 'Submitted'], ...visible.map(c => [requestId(c), c.buyerName, c.sellerName || c.projectOwnerId, c.project, c.purchasedAreaSqFt, c.cashbackAmount, c.status, datePart(stamp(c))])]; const blob = new Blob([rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cashback-report.csv'; a.click(); URL.revokeObjectURL(url); }}><Download size={16} /> Export</button>}</div>
    {!visible.length ? <div className="cashback-empty"><Clock3 size={30} /><h3>No cashback requests</h3><p>Submitted requests will appear here instantly.</p></div> :
      <div className="cashback-table-wrap"><table className="cashback-table"><thead><tr>{role !== 'buyer' && <th>Buyer</th>}<th>Request</th><th>Property</th><th>Area</th><th>Cashback</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{visible.map(claim => <tr key={claim.id}>{role !== 'buyer' && <td>{claim.buyerName || '—'}</td>}<td><strong>{requestId(claim)}</strong></td><td>{claim.project || claim.propertyName}</td><td>{claim.purchasedAreaSqFt || claim.propertyArea || 0} sq.ft</td><td>{money(claim.cashbackAmount)}</td><td>{datePart(stamp(claim))}<small>{timePart(stamp(claim))}</small></td><td><span className={`cashback-status ${statusTone(claim.status)}`}>{claim.status}</span></td><td><button className="cashback-view" onClick={() => setSelected(claim)} aria-label="View request"><Eye size={17} /></button></td></tr>)}</tbody></table></div>}
  </section>;
}
