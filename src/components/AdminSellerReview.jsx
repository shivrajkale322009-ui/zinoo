import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Building, CheckCircle, Mail, MapPin, Phone, ShieldCheck, ShieldX, UserRound } from 'lucide-react';
import { getSellerApplicationGovernance } from '../utils/sellerGovernance.js';

export default function AdminSellerReview({ application, properties = [], workingKey = '', onBack, onApprove, onReject, onOpenProperty }) {
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  const governance = useMemo(() => getSellerApplicationGovernance(application, properties), [application, properties]);
  const approving = workingKey === `approve-request-${application.id}`;
  const propertyEntries = Object.entries(governance.propertyCounts);

  return <section className="admin-account-profile admin-seller-review" aria-labelledby="seller-review-title">
    <div className="admin-section-header"><button type="button" className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back to applications</button></div>
    <header className="admin-account-profile-header">
      <span className="admin-account-avatar" aria-hidden="true"><UserRound /></span>
      <div><span className="admin-panel-kicker">Seller application</span><h1 id="seller-review-title">{application.businessName || application.userName || 'Unnamed applicant'}</h1><p>{application.contactPerson || application.userName || 'Contact not provided'} · ID {application.id}</p></div>
      <span className={`badge badge-status-${governance.status}`}>{governance.statusLabel}</span>
    </header>

    <section className="property-governance-summary" aria-labelledby="seller-readiness-title">
      <div className="property-governance-heading"><div><span>Approval readiness</span><h2 id="seller-readiness-title">{governance.approvalEligible ? 'Ready for an admin decision' : `${governance.blockers.length} blocker${governance.blockers.length === 1 ? '' : 's'} remaining`}</h2></div><strong>{governance.completeness}%</strong></div>
      <div className="property-governance-progress" role="progressbar" aria-label="Seller application completeness" aria-valuemin="0" aria-valuemax="100" aria-valuenow={governance.completeness}><i style={{ width: `${governance.completeness}%` }} /></div>
      {governance.blockers.length > 0 && <div className="property-governance-blockers" role="alert"><strong><AlertTriangle size={16} /> Approval blocked</strong>{governance.blockers.map((blocker) => <span key={blocker.id}>{blocker.message}</span>)}</div>}
      <div className="property-verification-grid">{governance.requirements.map((requirement) => <div key={requirement.id} className={requirement.valid ? 'is-complete' : 'is-invalid'}><span>{requirement.label}</span><strong>{requirement.valid ? <><CheckCircle size={15} /> Present and valid</> : <><AlertTriangle size={15} /> Missing or invalid</>}</strong></div>)}</div>
    </section>

    <section className="admin-profile-section-title"><div><h2>Seller information</h2><p>Submitted information supporting this decision. Presence does not imply independent verification.</p></div></section>
    <div className="admin-mobile-review-meta admin-seller-review-facts">
      <span><small>Business type</small><strong><Building size={14} /> {application.businessType || 'Not provided'}</strong></span>
      <span><small>Contact</small><strong><Phone size={14} /> {application.contactPhone || application.userPhone || 'Not provided'}</strong></span>
      <span><small>Email</small><strong><Mail size={14} /> {application.contactEmail || application.userEmail || 'Not provided'}</strong></span>
      <span><small>Address</small><strong><MapPin size={14} /> {application.businessAddress || 'Not provided'}</strong></span>
    </div>
    <section className="admin-seller-description"><h2>Business description</h2><p>{application.description || 'No description provided.'}</p></section>

    <section className="admin-profile-section-title"><div><h2>Associated properties</h2><p>Properties linked through ownerId, sellerId, or sellerUid. Seller approval does not publish them.</p></div><span>{governance.associatedProperties.length}</span></section>
    {propertyEntries.length > 0 && <div className="admin-mobile-seller-facts">{propertyEntries.map(([status, count]) => <div key={status}><span>{status}</span><strong>{count}</strong></div>)}</div>}
    <div className="admin-related-properties-grid">{governance.associatedProperties.length ? governance.associatedProperties.map((property) => <article key={property.id} className="admin-related-property-card"><div><span className={`badge badge-status-${String(property.status || 'draft').toLowerCase()}`}>{property.status || 'Draft'}</span><h3>{property.name || 'Untitled property'}</h3><button type="button" className="btn-secondary" onClick={() => onOpenProperty?.(property)}>View property</button></div></article>) : <div className="admin-empty-state-card"><Building size={28} /><h3>No associated properties</h3><p>This is expected before seller approval; properties are not an approval requirement.</p></div>}</div>

    {governance.reviewable && <footer className="property-decision-actions">
      {confirmingApproval ? <div className="admin-seller-approval-confirm" role="alert"><div><strong>Approve this seller account?</strong><p>This grants Seller workspace access. It does not verify identity evidence or publish associated properties.</p></div><button type="button" className="btn-secondary" disabled={approving} onClick={() => setConfirmingApproval(false)}>Cancel</button><button type="button" className="btn-primary" disabled={!governance.approvalEligible || approving} onClick={() => onApprove(application)}><ShieldCheck size={16} /> {approving ? 'Approving…' : 'Confirm approval'}</button></div> : <button type="button" className="btn-primary" disabled={!governance.approvalEligible} onClick={() => setConfirmingApproval(true)}><ShieldCheck size={16} /> Approve seller</button>}
      <button type="button" className="btn-secondary danger" onClick={() => onReject(application)}><ShieldX size={16} /> Reject application</button>
    </footer>}
  </section>;
}
