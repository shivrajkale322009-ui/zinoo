import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, FileText, Image as ImageIcon, Loader2, MapPin, Plus, Save, X } from 'lucide-react';
import ProjectLocationPicker from './ProjectLocationPicker';
import PropertyMediaDocumentsManager, { InAppDocumentViewer, openDocumentPreview } from './PropertyMediaDocumentsManager';
import { getPropertyDisplayModel } from '../utils/propertyDisplayModel';
import { normalizeAmenityIds, withSelectedProjectAmenities } from '../utils/projectAmenities';
import { getProjectDocumentLabel } from '../utils/projectDocuments';
import { LAND_ZONE_OPTIONS, NA_STATUS_OPTIONS } from '../utils/projectLand';
import { getPropertyChangeAudit } from '../utils/propertyChangeAudit';
import { applyHighwayResult } from '../utils/highwayInfo';

const listOf = (v) => Array.isArray(v) ? v : typeof v === 'string' ? v.split(',').map((x) => x.trim()).filter(Boolean) : [];
const photoUrl = (v) => typeof v === 'string' ? v : v?.downloadURL || v?.url || v?.previewURL;
const statusText = (v) => v ? String(v).replace(/_/g, ' ') : 'Draft';

// UI-only V2 delegates all Firebase persistence to the existing seller/admin pipelines.
export default function PropertyDisplayEditor({ property, mode = 'edit', role = 'seller', sellers = [], user, onChange, onSubmit, onCancel, onReset, isDirty = false, onDirtyChange = () => {}, amenityOptions = [], autoDetectHighway = false, mediaUploading = '', mediaError = '', onMediaUpload, documentUploading = false, documentError = '', onDocumentUpload, onRemoveDocument, submitError = '' }) {
  const [documentViewer, setDocumentViewer] = useState(null); const [auditOpen, setAuditOpen] = useState(false); const [saving, setSaving] = useState(false); const [newAmenity, setNewAmenity] = useState('');
  const [heroUploading, setHeroUploading] = useState(false); const [heroPreview, setHeroPreview] = useState(null);
  const heroInputRef = useRef(null); const heroImageUploadRef = useRef(null); const imageInputRef = useRef(null); const imageSectionRef = useRef(null); const baseline = useRef(property);
  const display = useMemo(() => getPropertyDisplayModel(property), [property]); const documents = listOf(property.documents); const amenities = listOf(property.amenities); const selectedIds = normalizeAmenityIds(property.amenityIds);
  const options = amenityOptions.map((x) => ({ id: String(x.id), name: String(x.name || '').trim() })).filter((x) => x.id && x.name); const audit = getPropertyChangeAudit(baseline.current, property);
  const apply = (next) => { onDirtyChange(true); onChange(typeof next === 'function' ? next(property) : next); };
  const updateDisplay = (patch) => ({ ...(property.display || {}), ...patch }); const set = (key, value, aliases = {}) => apply({ ...property, [key]: value, ...aliases });
  const setName = (value) => apply({ ...property, name: value, display: updateDisplay({ basic: { ...(property.display?.basic || {}), projectName: value } }) });
  const setPrice = (value) => apply({ ...property, startingPrice: value, priceFrom: value, display: updateDisplay({ pricing: { ...(property.display?.pricing || {}), startingPrice: Number(value) || 0 } }) });
  const setCashback = (value) => apply({ ...property, cashbackPerGuntha: value, cashbackAmount: value, display: updateDisplay({ cashback: { ...(property.display?.cashback || {}), amount: Number(value) || 0, enabled: Number(value) > 0 } }) });
  const setLocation = (key, value, aliases = {}) => { const next = { ...property, [key]: value, ...aliases }; const location = [next.village, next.taluka, next.locality || next.area].filter(Boolean).join(' • '); apply({ ...next, locationLabel: location, display: updateDisplay({ basic: { ...(property.display?.basic || {}), location } }) }); };
  const setContact = (key, value, aliases = {}) => apply({ ...property, [key]: value, ...aliases, display: updateDisplay({ actions: { ...(property.display?.actions || {}), callNumber: value } }) });
  const setCoordinates = (latitude, longitude) => apply({ ...property, latitude, longitude, mapMarkerConfirmed: true, display: updateDisplay({ map: { ...(property.display?.map || {}), latitude: Number(latitude), longitude: Number(longitude), enabled: true } }) });
  const toggleAmenity = (option) => { const current = selectedIds.length ? selectedIds : amenities.map((name) => options.find((x) => x.name === name)?.id || `legacy:${name}`); const next = current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id]; const catalog = [...options, ...amenities.filter((name) => !options.some((x) => x.name === name)).map((name) => ({ id: `legacy:${name}`, name }))]; apply(withSelectedProjectAmenities(property, next, catalog)); };
  const addAmenity = (name) => {
    const cleaned = name.trim();
    if (!cleaned) return;
    if (amenities.includes(cleaned)) return;
    const nextAmenities = [...amenities, cleaned];
    apply({
      ...property,
      amenities: nextAmenities,
      amenityIds: nextAmenities.map(x => x.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    });
    setNewAmenity('');
  };
  const removeAmenity = (indexToRemove) => {
    const nextAmenities = amenities.filter((_, idx) => idx !== indexToRemove);
    apply({
      ...property,
      amenities: nextAmenities,
      amenityIds: nextAmenities.map(x => x.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    });
  };
  const setHeroImageUpload = useCallback((upload) => { heroImageUploadRef.current = upload; }, []);
  const chooseHeroImage = () => { heroInputRef.current?.click(); };

  useEffect(() => {
    if (heroPreview) {
      return () => { URL.revokeObjectURL(heroPreview); };
    }
  }, [heroPreview]);

  useEffect(() => {
    if (heroPreview && (property.thumbnail || property.heroImage || property.display?.media?.heroImage)) {
      setHeroPreview(null);
    }
  }, [property.thumbnail, property.heroImage, property.display?.media?.heroImage]);

  const handleHeroImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setHeroPreview(objectUrl);
    setHeroUploading(true);
    try {
      if (onMediaUpload) {
        await onMediaUpload(file, 'cover');
      } else if (heroImageUploadRef.current) {
        await heroImageUploadRef.current(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          apply((current) => ({
            ...current,
            thumbnail: dataUrl,
            heroImage: dataUrl,
            display: {
              ...(current.display || {}),
              media: {
                ...(current.display?.media || {}),
                heroImage: dataUrl
              }
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (uploadErr) {
      console.error('Failed to upload hero image:', uploadErr);
    } finally {
      setHeroUploading(false);
      e.target.value = '';
    }
  };

  const confirmSave = async () => { setSaving(true); try { const result = await onSubmit?.({ preventDefault() {} }); if (result !== false) { baseline.current = property; setAuditOpen(false); } } finally { setSaving(false); } };
  const field = (label, value, change, props = {}) => <label className="display-editor-field"><span>{label}{props.required && <b className="v2-required-indicator" aria-hidden="true"> *</b>}</span><input value={value ?? ''} onChange={(e) => change(e.target.value)} {...props} /></label>;
  const gallery = listOf(property.galleryImages).map(photoUrl).filter(Boolean);
  const currentHeroUrl = display.media.heroImage || property.thumbnail || property.heroImage || gallery[0];
  const hero = heroPreview || currentHeroUrl;
  const isUploadingHero = heroUploading || mediaUploading === 'cover';

  return <section className="property-display-editor property-display-editor-v2">
    <header className="v2-property-header"><button type="button" className="v2-icon-button" onClick={onCancel} aria-label="Back to properties"><ArrowLeft size={19} /></button><div><strong>{property.name || (mode === 'create' ? 'New property' : 'Property')}</strong><span className="v2-status-badge">{statusText(property.status)}</span></div><div className="v2-header-actions"><button type="button" className="btn-primary" onClick={() => setAuditOpen(true)} disabled={Boolean(mediaUploading || documentUploading || isUploadingHero)}><Save size={15} /> Save Changes</button></div></header>
    <form className="v2-property-scroll" onSubmit={(e) => { e.preventDefault(); setAuditOpen(true); }}>
      <section className="v2-hero-editor">
        <img src={hero || '/zinoo-home-hero.webp'} alt="Project cover" />
        <input ref={heroInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(isUploadingHero)} onChange={handleHeroImageChange} />
        {isUploadingHero && (
          <div className="v2-hero-loading-overlay" role="status" aria-live="polite">
            <Loader2 size={32} className="spin" />
            <span>Uploading hero image…</span>
          </div>
        )}
        <div className="v2-hero-overlay">
          <span><ImageIcon size={14} /> {Math.max(gallery.length, hero ? 1 : 0)} images</span>
          <button type="button" onClick={chooseHeroImage} disabled={Boolean(isUploadingHero)}>
            {isUploadingHero ? (
              <><Loader2 size={15} className="spin" /> Uploading…</>
            ) : (
              <><Plus size={15} /> {currentHeroUrl ? 'Change Hero Image' : 'Add Hero Image'}</>
            )}
          </button>
        </div>
      </section>
      <section className="v2-intro-section"><label className="v2-title-input"><span className="sr-only">Project Name</span><input value={property.name || ''} placeholder="Project Name" onChange={(e) => setName(e.target.value)} required /><b className="v2-required-indicator v2-title-required" aria-hidden="true">*</b></label><div className="v2-location-row"><div className="v2-location-field"><MapPin size={17} aria-hidden="true" />{field('Village', property.village, (v) => setLocation('village', v), { required: true })}</div>{field('Location', property.locality || property.area, (v) => setLocation('locality', v, { area: v }))}</div><div className="v2-price-row">{field('Price (₹)', property.startingPrice ?? property.priceFrom, setPrice, { type: 'number', min: 0 })}{field('Cashback Offered (₹)', property.cashbackPerGuntha ?? property.cashbackAmount, setCashback, { type: 'number', min: 0 })}</div><div className="v2-contact-row">{field('Contact number', property.contactNumber || property.siteVisitContact, (v) => setContact('contactNumber', v, { siteVisitContact: v, siteVisitContactNumber: v }), { type: 'tel' })}{field('WhatsApp number', property.whatsappNumber, (v) => setContact('whatsappNumber', v), { type: 'tel' })}</div></section>
      <section className="v2-content-section"><h3>Overview</h3><div className="v2-overview-grid">
        {role === 'admin' && <label><span>Seller</span><select aria-label="Property seller" value={property.sellerId || property.sellerUid || property.ownerId || ''} onChange={(event) => {
          const sellerId = event.target.value;
          if (!sellerId) return;
          apply({ ...property, ownerId: sellerId, sellerId, sellerUid: sellerId });
        }}>
          <option value="" disabled>Select seller</option>
          {(property.sellerId || property.sellerUid || property.ownerId) && !sellers.some((seller) => seller.id === (property.sellerId || property.sellerUid || property.ownerId)) && <option value={property.sellerId || property.sellerUid || property.ownerId} disabled>Current seller (unavailable)</option>}
          {[...sellers].sort((a, b) => (a.businessName || a.displayName || a.name || '').localeCompare(b.businessName || b.displayName || b.name || '')).map((seller) => <option key={seller.id} value={seller.id} disabled={seller.assignmentUnavailable}>{[seller.businessName || seller.developerName || seller.displayName || seller.name || seller.email || seller.id, seller.phoneNumber || seller.phone].filter(Boolean).join(' — ')}{seller.assignmentUnavailable ? ' (unavailable for assignment)' : ''}</option>)}
        </select></label>}<label><span>Land Zone</span><select value={property.landZone || ''} onChange={(e) => set('landZone', e.target.value)}><option value="">Select</option>{LAND_ZONE_OPTIONS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>{field('Developer', property.developer || property.developerName, (v) => set('developer', v, { developerName: v }))}<label><span>Installment</span><select value={property.installmentPurchaseAvailable ? 'yes' : 'no'} onChange={(e) => set('installmentPurchaseAvailable', e.target.value === 'yes')}><option value="yes">Available</option><option value="no">Not available</option></select></label><label><span>NA Status</span><select value={property.naStatus || ''} onChange={(e) => set('naStatus', e.target.value)}><option value="">Select</option>{NA_STATUS_OPTIONS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label></div></section>
      <section className="v2-content-section"><h3>Documents</h3>{role === 'admin' && property.id && user ? <PropertyMediaDocumentsManager property={property} user={user} onChange={apply} showMedia={false} /> : <label className="v2-add-file"><Plus size={15} /> Add document<input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" disabled={documentUploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) onDocumentUpload?.(file, 'other'); e.target.value = ''; }} /></label>}<div className="v2-document-list">{documents.map((doc, index) => <div key={doc.id || index}><FileText size={18} /><span><strong>{doc.displayName || doc.fileName || getProjectDocumentLabel(doc.type)}</strong><small>{doc.status || 'Pending'}</small></span><button type="button" onClick={() => openDocumentPreview(doc, setDocumentViewer)}>View</button>{onRemoveDocument && <button type="button" aria-label="Remove document" onClick={() => { onDirtyChange(true); onRemoveDocument(doc, index); }}><X size={15} /></button>}</div>)}</div>{documentError && <p role="alert">{documentError}</p>}</section>
      <section className="v2-content-section">
        <h3>Amenities</h3>
        <div className="v2-amenity-management">
          <div className="v2-amenity-input-group">
            <input
              type="text"
              placeholder="Enter amenity"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAmenity(newAmenity);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addAmenity(newAmenity)}
            >
              Add
            </button>
          </div>
          <div className="v2-amenity-section-title">Existing Amenities:</div>
          {amenities.length === 0 ? (
            <div className="v2-amenity-empty">No amenities added yet.</div>
          ) : (
            <div className="v2-amenity-list-chips">
              {amenities.map((item, index) => (
                <span key={index} className="amenity-chip">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="v2-content-section"><h3>About Project (optional)</h3><label className="v2-about-input"><textarea maxLength="2000" value={property.description || ''} placeholder="Tell buyers about the project" onChange={(e) => apply({ ...property, description: e.target.value, display: updateDisplay({ basic: { ...(property.display?.basic || {}), shortDescription: e.target.value }, overview: { ...(property.display?.overview || {}), body: e.target.value } }) })} /><small>{(property.description || '').length}/2000</small></label></section>
      <section className="v2-content-section" ref={imageSectionRef}><h3>Project Images</h3>{role === 'admin' && property.id && user ? <PropertyMediaDocumentsManager property={property} user={user} onChange={apply} showDocuments={false} onHeroImageUploadReady={setHeroImageUpload} /> : <><label className="v2-add-file"><Plus size={15} /> Add Media<input ref={imageInputRef} type="file" hidden multiple accept="image/jpeg,image/png,image/webp" disabled={Boolean(mediaUploading)} onChange={(e) => { [...(e.target.files || [])].forEach((file) => onMediaUpload?.(file, 'gallery')); e.target.value = ''; }} /></label><div className="v2-image-grid">{gallery.map((url, index) => <figure key={`${url}-${index}`}><img src={url} alt={`Project ${index + 1}`} /><button type="button" onClick={() => apply({ ...property, galleryImages: listOf(property.galleryImages).filter((_, i) => i !== index) })} aria-label="Remove image"><X size={14} /></button></figure>)}</div></>}{mediaError && <p role="alert">{mediaError}</p>}</section>
        <section className="v2-content-section v2-map-section"><h3>Location & Layout</h3>{field('Complete address', property.completeAddress, (v) => apply({ ...property, completeAddress: v, display: updateDisplay({ map: { ...(property.display?.map || {}), address: v } }) }))}<ProjectLocationPicker latitude={property.latitude ?? property.coords?.[0] ?? ''} longitude={property.longitude ?? property.coords?.[1] ?? ''} layoutPolygon={property.layoutPolygon} highwayName={property.highwayName} highwayDistance={property.highwayDistance} isHighwayTouch={property.isHighwayTouch} autoDetectHighway={autoDetectHighway} onChange={({ latitude, longitude }) => setCoordinates(latitude, longitude)} onHighwayChange={(result) => apply((current) => applyHighwayResult(current, result))} onLayoutChange={(geometry) => apply((current) => ({ ...current, ...geometry }))} /><label className="v2-map-confirmation"><input type="checkbox" checked={Boolean(property.mapMarkerConfirmed)} onChange={(event) => apply((current) => ({ ...current, mapMarkerConfirmed: event.target.checked }))} /> <span>I confirm this marker is the exact project entrance location.</span></label></section>
      {submitError && <p role="alert">{submitError}</p>}<footer className="sticky-action-bar-bottom"><button type="button" className="btn-secondary" onClick={mode === 'create' ? onReset : onCancel}>Cancel</button><button type="submit" className="btn-primary" disabled={Boolean(mediaUploading || documentUploading)}><Save size={16} /> Save Changes</button></footer>
    </form>
    {auditOpen && <div className="v2-audit-backdrop" role="presentation"><section className="v2-audit-modal" role="dialog" aria-modal="true" aria-labelledby="v2-audit-title"><button type="button" className="v2-audit-close" onClick={() => setAuditOpen(false)} aria-label="Close"><X size={18} /></button><h2 id="v2-audit-title">Review Changes</h2>{!audit.hasChanges ? <p>No changes detected.</p> : <>{audit.changed.length > 0 && <div><h3>Changed</h3>{audit.changed.map((x) => <p key={x.label}><strong>{x.label}</strong><span>{x.before} → {x.after}</span></p>)}</div>}{audit.added.length > 0 && <div><h3>Added</h3>{audit.added.map((x) => <p key={x}>{x}</p>)}</div>}{audit.removed.length > 0 && <div><h3>Removed</h3>{audit.removed.map((x) => <p key={x}>{x}</p>)}</div>}</>}<footer><button type="button" className="btn-secondary" onClick={() => setAuditOpen(false)}>Cancel</button><button type="button" className="btn-primary" disabled={!audit.hasChanges || saving} onClick={confirmSave}>{saving ? 'Saving…' : 'Save Changes'}</button></footer></section></div>}
    <InAppDocumentViewer document={documentViewer} onClose={() => setDocumentViewer(null)} />
  </section>;
}


