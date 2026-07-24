import React from 'react';
import { ArrowLeft, Edit, FileText, Image as ImageIcon, MapPin, Store } from 'lucide-react';
import { getProjectDocumentLabel, normalizeProjectDocuments } from '../utils/projectDocuments';

const valueOrNA = (value) => value === undefined || value === null || value === '' ? 'N/A' : value;
const imageUrl = (item) => typeof item === 'string' ? item : item?.url || item?.downloadURL || '';

export default function AdminPropertyDetails({ property, seller, onBack, onOpenEditor }) {
  const cover = property.heroImage || property.coverImage || '';
  const thumbnail = property.thumbnailUrl || property.thumbnail || '';
  const gallery = (property.images || property.gallery || []).map(imageUrl).filter(Boolean);
  const documents = normalizeProjectDocuments(property);
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
        <button type="button" className="btn-primary" onClick={() => onOpenEditor(property.id)}><Edit size={16} /> Open Editor</button>
      </div>

      <div className="property-details-title-row">
        <div>
          <span className="admin-panel-kicker">Property Details · Read only</span>
          <h1>{property.name || 'Untitled Property'}</h1>
          <p><MapPin size={14} /> {[property.locality, property.city, property.state].filter(Boolean).join(', ') || 'Location not provided'}</p>
        </div>
        <span className={`badge badge-status-${String(property.status || 'draft').toLowerCase()}`}>{property.status || 'Draft'}</span>
      </div>

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
            <p><strong>Total Plots:</strong> {valueOrNA(property.totalPlots)}</p>
            <p><strong>Available Plots:</strong> {valueOrNA(property.availablePlots ?? property.remainingPlots)}</p>
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
