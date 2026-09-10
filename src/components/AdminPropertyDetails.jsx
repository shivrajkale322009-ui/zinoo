import React from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Edit, FileText, Image as ImageIcon, LoaderCircle, MapPin, ShieldCheck, ShieldX, Store } from 'lucide-react';
import { getProjectDocumentLabel, normalizeProjectDocuments } from '../utils/projectDocuments';
import { getPropertyGovernance, SECTION_STATE } from '../utils/propertyGovernance';
import { PROPERTY_STATUS } from '../utils/projectVisibility';

const valueOrNA = (value) => value === undefined || value === null || value === '' ? 'N/A' : value;
const imageUrl = (item) => typeof item === 'string' ? item : item?.url || item?.downloadURL || '';

export default function AdminPropertyDetails({ property, seller, onBack, onOpenEditor, onApprove, onReject, workingKey = '' }) {
  const cover = property.heroImage || property.coverImage || '';
  const thumbnail = property.thumbnailUrl || property.thumbnail || '';
  const gallery = (property.images || property.gallery || []).map(imageUrl).filter(Boolean);
  const documents = normalizeProjectDocuments(property);
  const sellerAssociationValid = Boolean(seller?.id);
  const governance = getPropertyGovernance(property, { sellerAssociationValid });
  const pendingReview = governance.lifecycle.status === PROPERTY_STATUS.PENDING;
  const stateLabel = (state) => ({ complete: 'Complete', incomplete: 'Incomplete', invalid: 'Invalid', needs_review: 'Needs review', not_applicable: 'Optional' }[state] || 'Unknown');
  const amenities = [
    ['Road Access', property.roadAccess],
    ['Electricity', property.electricity],
    ['Water Supply', property.waterSupply],
    ['Drainage', property.drainage],
    ['Street Lights', property.streetLights],
    ['Compound / Boundary', property.compoundBoundary || property.layoutPolygon]
  ];

  return (
    <div className="admin-panel-section admin-property-details-view">
      <div className="admin-section-header property-details-actions">
        <button type="button" className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <button type="button" className="btn-secondary" onClick={() => onOpenEditor(property.id)}><Edit size={16} /> Edit property</button>
      </div>

      <div className="property-details-title-row">
        <div>
          <span className="admin-panel-kicker">Property Details · Read only</span>
          <h2>{property.name || 'Untitled Property'}</h2>
          <p><MapPin size={14} /> {[property.locality, property.city, property.state].filter(Boolean).join(', ') || 'Location not provided'}</p>
        </div>
        <span className={`badge badge-status-${governance.lifecycle.status}`}>{governance.lifecycle.label}</span>
      </div>

      <section className="property-governance-summary" aria-labelledby="property-readiness-title">
        <div className="property-readiness-overview"><div><span className="admin-panel-kicker">Publication readiness</span><h3 id="property-readiness-title">{governance.blockers.length ? `${governance.blockers.length} blocker${governance.blockers.length === 1 ? '' : 's'} require attention` : pendingReview ? 'Ready for an approval decision' : governance.publicationEligible ? 'Eligible for publication' : governance.lifecycle.label}</h3><p>{governance.blockers.length ? 'Resolve the blocking requirements before approval or publication.' : governance.advisories.length ? `${governance.advisories.length} non-blocking item${governance.advisories.length === 1 ? '' : 's'} still need review.` : 'Required publication data is present and structurally valid.'}</p></div><strong>{governance.completeness}%<small>content readiness</small></strong></div>
        {governance.blockers.length > 0 && <div className="property-governance-blockers" role="list" aria-label="Publication blockers">{governance.blockers.map((item) => <button type="button" role="listitem" key={item.code} onClick={() => onOpenEditor(property.id, item.section)}><AlertTriangle size={17} /><span><strong>{item.message}</strong><small>Open {item.section}</small></span><ArrowLeft size={16} className="property-fix-arrow" /></button>)}</div>}
        <div className="property-verification-grid" role="list" aria-label="Property readiness by section">{governance.sections.map((section) => <div key={section.id} role="listitem" className={`state-${section.state}`}>{section.state === SECTION_STATE.COMPLETE ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}<span><strong>{section.label}</strong><small>{section.message}</small></span><b>{stateLabel(section.state)}</b></div>)}</div>
        {property.rejectionReason && <div className="property-rejection-record" role="status"><ShieldX size={18} /><div><strong>Latest rejection reason</strong><p>{property.rejectionReason}</p></div></div>}
        {pendingReview && <div className="property-decision-actions"><button type="button" className="btn-primary" disabled={!governance.approvalEligible || workingKey === `approve-project-${property.id}`} onClick={() => onApprove({ ...property, sellerAssociationValid })}>{workingKey === `approve-project-${property.id}` ? <><LoaderCircle className="button-spinner" size={16} /> Approving…</> : <><ShieldCheck size={16} /> Approve property</>}</button><button type="button" className="btn-secondary danger" disabled={workingKey === `reject-project-${property.id}`} onClick={() => onReject({ ...property, sellerName: seller?.businessName || seller?.displayName || seller?.name })}><ShieldX size={16} /> Reject submission</button></div>}
      </section>

      <div className="property-media-overview">
        <section className="property-cover-preview">
          {cover ? <img src={cover} alt={`${property.name || 'Property'} cover`} /> : <span><ImageIcon size={28} /> No cover image</span>}
          <b>Cover Image</b>
        </section>
        <section className="property-thumbnail-preview">
          {thumbnail ? <img src={thumbnail} alt={`${property.name || 'Property'} thumbnail`} /> : <span><ImageIcon size={24} /> No thumbnail</span>}
          <b>Thumbnail</b>
        </section>
      </div>

      {gallery.length > 0 && (
        <section className="details-card property-gallery-card">
          <h3>Gallery</h3>
          <div className="property-details-gallery">
            {gallery.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`${property.name || 'Property'} gallery ${index + 1}`} />)}
          </div>
        </section>
      )}

      <div className="property-details-grid">
        <section className="details-card">
          <h3>Property Overview</h3>
          <div className="details-content">
            <p><strong>Project ID:</strong> {property.projectId || property.id}</p>
            <p><strong>Property Name:</strong> {valueOrNA(property.name)}</p>
            <p><strong>Development Stage:</strong> {valueOrNA(property.developmentStage)}</p>
          </div>
        </section>
        <section className="details-card">
          <h3>Location</h3>
          <div className="details-content">
            <p><strong>Address:</strong> {valueOrNA(property.completeAddress)}</p>
            <p><strong>Area:</strong> {valueOrNA(property.area || property.village)}</p>
            <p><strong>Locality:</strong> {valueOrNA(property.locality)}</p>
            <p><strong>City / District:</strong> {[property.city, property.district].filter(Boolean).join(', ') || 'N/A'}</p>
            <p><strong>Landmark:</strong> {valueOrNA(property.landmark)}</p>
            <p><strong>Location Status:</strong> {valueOrNA(property.locationStatus)}</p>
          </div>
        </section>
        <section className="details-card">
          <h3>Price & Area</h3>
          <div className="details-content">
            <p><strong>Starting Price:</strong> ₹{valueOrNA(property.startingPrice ?? property.priceFrom)}</p>
            <p><strong>Maximum Price:</strong> ₹{valueOrNA(property.maximumPrice)}</p>
            <p><strong>Price / sq.ft.:</strong> ₹{valueOrNA(property.pricePerSqFt)}</p>
            <p><strong>Minimum Area:</strong> {valueOrNA(property.minimumPlotArea ?? property.plotAreaMinSqFt)} {property.plotAreaUnit || 'sq.ft.'}</p>
            <p><strong>Maximum Area:</strong> {valueOrNA(property.maximumPlotArea ?? property.plotAreaMaxSqFt)} {property.plotAreaUnit || 'sq.ft.'}</p>
          </div>
        </section>
        <section className="details-card">
          <h3>Amenities</h3>
          <div className="property-amenity-chips">
            {amenities.map(([label, enabled]) => <span key={label} className={enabled ? 'available' : ''}>{label} · {enabled ? 'Yes' : 'No'}</span>)}
          </div>
          {property.nearbyFacilities && <p className="details-note"><strong>Nearby:</strong> {property.nearbyFacilities}</p>}
        </section>
        <section className="details-card details-card-wide">
          <h3>Description</h3>
          <div className="details-content"><p>{property.description || 'No description provided.'}</p></div>
        </section>
        <section className="details-card">
          <h3>Seller Information</h3>
          <div className="details-content seller-details-summary">
            <Store size={20} />
            <p><strong>Name:</strong> {seller?.displayName || seller?.name || property.developerName || property.developer || 'N/A'}</p>
            <p><strong>Business:</strong> {seller?.businessName || 'N/A'}</p>
            <p><strong>Email:</strong> {seller?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {seller?.phoneNumber || seller?.phone || property.contactNumber || 'N/A'}</p>
          </div>
        </section>
        <section className="details-card">
          <h3>Approval Status</h3>
          <div className="details-content">
            <p><strong>Listing:</strong> {valueOrNA(property.status)}</p>
            <p><strong>RERA:</strong> {valueOrNA(property.reraStatus)} {property.reraNumber ? `(${property.reraNumber})` : ''}</p>
            <p><strong>NA Status:</strong> {valueOrNA(property.naStatus)}</p>
            <p><strong>Title Status:</strong> {valueOrNA(property.titleStatus)}</p>
            <p><strong>PMRDA:</strong> {property.pmrdaApproved ? 'Approved' : 'Not confirmed'}</p>
            <p><strong>Collector:</strong> {property.collectorApproved ? 'Approved' : 'Not confirmed'}</p>
          </div>
        </section>
        <section className="details-card details-card-wide">
          <h3>Documents</h3>
          {documents.length ? (
            <div className="property-document-links">
              {documents.map((document, index) => (
                <a key={document.id || `${document.type}-${index}`} href={document.url} target="_blank" rel="noreferrer">
                  <FileText size={17} /><span><strong>{getProjectDocumentLabel(document.type)}</strong><small>{document.status || 'pending'}</small></span>
                </a>
              ))}
            </div>
          ) : <p className="no-logs">No documents uploaded.</p>}
        </section>
      </div>
    </div>
  );
}
