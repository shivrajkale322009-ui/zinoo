import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  BadgeCheck,
  FileCheck2,
  Image as ImageIcon,
  Info,
  Layers,
  Leaf,
  MapPin,
  Sparkles,
  WalletCards
} from 'lucide-react';
import CashbackBadge from '../../CashbackBadge';
import PropertyHighlightBadge from '../../PropertyHighlightBadge';
import BuyerDetailSection from './BuyerDetailSection';
import { getLandZoneLabel, getNaStatusLabel } from '../../../utils/projectLand';

export default function BuyerProjectDetails({
  selectedProject,
  selectedDisplay,
  selectedGallery,
  galleryIndex,
  onGalleryIndexChange,
  projectScrollTop,
  heroPrice,
  onScroll,
  appBar,
  contactActions,
  documentsSection,
  bottomActions,
  onNeedFinancing,
  previewEditor
}) {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [heroDragX, setHeroDragX] = useState(0);
  const heroGestureRef = useRef(null);
  const heroVideoRefs = useRef(new Map());
  const heroImages = useMemo(() => {
    const galleryMedia = selectedGallery.filter((item) => item.downloadURL);
    const heroUrl = selectedDisplay.media.heroImage;
    if (heroUrl && !galleryMedia.some((item) => item.downloadURL === heroUrl)) {
      return [{ id: 'hero', downloadURL: heroUrl, mediaType: 'image' }, ...galleryMedia];
    }
    return galleryMedia.length ? galleryMedia : [{ id: 'fallback', downloadURL: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85', mediaType: 'image' }];
  }, [selectedDisplay.media.heroImage, selectedGallery]);
  const activeHeroIndex = Math.min(galleryIndex, heroImages.length - 1);
  useEffect(() => {
    [activeHeroIndex - 1, activeHeroIndex + 1].forEach((index) => {
      const media = heroImages[index];
      if (media?.downloadURL && media.mediaType !== 'video') { const image = new Image(); image.src = media.downloadURL; }
    });
  }, [activeHeroIndex, heroImages]);
  // A slide remains mounted during the carousel transition. Pause any video
  // that has just moved off-screen so mixed photo/video carousels never play
  // more than one property's media track at a time.
  useEffect(() => {
    heroVideoRefs.current.forEach((video, index) => {
      if (index !== activeHeroIndex) video?.pause();
    });
  }, [activeHeroIndex, heroImages]);
  const finishHeroGesture = (event) => {
    const gesture = heroGestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dragX = gesture.dragX || 0;
    if (gesture.direction === 'horizontal' && Math.abs(dragX) > 44) {
      const nextIndex = dragX < 0
        ? Math.min(activeHeroIndex + 1, heroImages.length - 1)
        : Math.max(activeHeroIndex - 1, 0);
      onGalleryIndexChange(nextIndex);
    }
    heroGestureRef.current = null;
    setHeroDragX(0);
  };
  const overviewItems = [
    { label: 'Land Zone', value: getLandZoneLabel(selectedProject), icon: Leaf },
    { label: 'Developer', value: selectedProject.developerName || selectedProject.developer || selectedProject.sellerName || 'Not specified', icon: Building2 },
    { label: 'Installment', value: selectedProject.installmentPurchaseAvailable ? 'Available' : 'Not available', icon: WalletCards },
    { label: 'NA Status', value: getNaStatusLabel(selectedProject), icon: FileCheck2 }
  ];
  const about = selectedDisplay.overview.body || selectedDisplay.basic.shortDescription;
  const visibleAmenities = selectedDisplay.amenities.showOnDetails
    ? selectedDisplay.amenities.items.filter((item) => item.enabled)
    : [];
  return (
    <div
      className="buyer-side-panel-content project-panel-content"
      onScroll={onScroll}
      style={{ '--project-scroll': Math.min(projectScrollTop / 120, 1) }}
    >
      <div className={`premium-project-details reference-property-details ${projectScrollTop > 28 ? 'project-header-scrolled' : ''}`} key={selectedProject.id}>
          {appBar}
          <section
            className={`premium-project-hero reference-hero-carousel${heroImages[activeHeroIndex]?.mediaType === 'video' ? ' has-active-video' : ''}${heroGestureRef.current?.direction === 'horizontal' ? ' is-swiping' : ''}`}
            onPointerDown={(event) => { if (event.target.closest?.('.reference-hero-video-frame')) return; heroGestureRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, direction: null, dragX: 0 }; }}
            onPointerMove={(event) => {
              const gesture = heroGestureRef.current;
              if (!gesture || gesture.pointerId !== event.pointerId) return;
              const dx = event.clientX - gesture.startX;
              const dy = event.clientY - gesture.startY;
              if (!gesture.direction && Math.max(Math.abs(dx), Math.abs(dy)) > 8) gesture.direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
              if (gesture.direction !== 'horizontal') return;
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
              gesture.dragX = Math.max(-90, Math.min(90, dx));
              setHeroDragX(gesture.dragX);
            }}
            onPointerUp={(event) => { if (!event.target.closest?.('.reference-hero-video-frame')) finishHeroGesture(event); }}
            onPointerCancel={(event) => { if (!event.target.closest?.('.reference-hero-video-frame')) finishHeroGesture(event); }}
          >
            <div className="reference-hero-carousel-track" style={{ transform: `translate3d(calc(${-activeHeroIndex * 100}% + ${heroDragX}px), 0, 0)` }}>
              {heroImages.map((image, index) => (
                <div className="reference-hero-slide" key={image.id || image.downloadURL || index}>
                  {image.mediaType !== 'video' && <span className="reference-hero-slide-backdrop" style={{ backgroundImage: `url(${image.downloadURL})` }} aria-hidden="true" />}
                  {image.mediaType === 'video'
                    ? <>{index === activeHeroIndex && <video className="reference-hero-video-backdrop" src={image.downloadURL} muted loop playsInline preload="metadata" aria-hidden="true" />}<div className="reference-hero-video-frame"><video ref={(node) => { if (node) heroVideoRefs.current.set(index, node); else heroVideoRefs.current.delete(index); }} className="reference-hero-video" src={image.downloadURL} controls playsInline preload="metadata" aria-label={`${selectedDisplay.basic.projectName} video ${index + 1}`} onPointerDown={(event) => event.stopPropagation()} onPointerMove={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()} onLoadedMetadata={(event) => { const { videoWidth, videoHeight } = event.currentTarget; if (videoWidth && videoHeight) event.currentTarget.parentElement?.style.setProperty('--video-aspect', `${videoWidth} / ${videoHeight}`); }} /></div></>
                    : <img src={image.downloadURL} alt={`${selectedDisplay.basic.projectName} photo ${index + 1}`} draggable="false" />}
                </div>
              ))}
            </div>
            <div className="premium-project-hero-scrim" />
            <PropertyHighlightBadge badgeType={selectedProject?.highlightBadge || selectedDisplay?.highlightBadge} isHero />
            <div className="reference-gallery-count"><ImageIcon size={14} /> {activeHeroIndex + 1}/{heroImages.length}</div>
            {previewEditor?.editing && <div className="preview-gallery-controls"><label title="Add photo"><ImageIcon size={15} /><input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) previewEditor.addMedia(file, 'gallery'); event.target.value = ''; }} /></label><label title="Add video"><span>+</span><input type="file" hidden accept="video/mp4,video/webm" onChange={(event) => { const file = event.target.files?.[0]; if (file) previewEditor.addMedia(file, 'video'); event.target.value = ''; }} /></label>{previewEditor.removeMedia && <button type="button" title="Remove current media" onClick={() => previewEditor.removeMedia(activeHeroIndex)} aria-label="Remove current media">×</button>}</div>}
            {heroImages.length > 1 && (
              <div className="reference-gallery-pagination" aria-label={`Photo ${activeHeroIndex + 1} of ${heroImages.length}`}>
                {heroImages.map((image, index) => (
                  <button
                    type="button"
                    key={image.id || image.downloadURL || index}
                    className={index === activeHeroIndex ? 'is-active' : ''}
                    onClick={() => onGalleryIndexChange(index)}
                    aria-label={`Show photo ${index + 1}`}
                    aria-current={index === activeHeroIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="premium-project-body reference-project-body">
            <section className="reference-property-intro">
              <div className="reference-property-heading">
                <div>
                  <div className="reference-project-name-line">
                    {previewEditor?.editing ? <input className="preview-inline-input preview-project-title" aria-label="Project name" value={selectedProject.name || ''} onChange={(event) => previewEditor.setField('name', event.target.value)} /> : <h1>{selectedDisplay.basic.projectName}</h1>}
                    {selectedDisplay.verified.showNameBadge && <BadgeCheck className="property-name-verified-badge" aria-label="Verified property" />}
                  </div>
                  {(selectedDisplay.basic.location || previewEditor?.editing) && <p><MapPin size={15} /> {previewEditor?.editing ? <input className="preview-inline-input" aria-label="Project location" value={previewEditor.locationValue} onChange={(event) => previewEditor.setLocation(event.target.value)} /> : selectedDisplay.basic.location}</p>}
                  <div className="reference-price-line">
                    {previewEditor?.editing ? <span className="preview-price-editor"><span>₹</span><input type="number" min="0" aria-label="Starting price" value={selectedProject.startingPrice ?? ''} onChange={(event) => previewEditor.setField('startingPrice', event.target.value, { priceFrom: event.target.value })} /><small>starting from</small></span> : <strong>{heroPrice}</strong>}
                    {previewEditor?.editing && <span className="preview-cashback-editor"><input type="number" min="0" aria-label="Cashback per guntha" value={selectedProject.cashbackPerGuntha ?? selectedProject.cashbackAmount ?? ''} onChange={(event) => previewEditor.setField('cashbackPerGuntha', event.target.value, { cashbackAmount: event.target.value })} /><small>cashback</small></span>}
                    {selectedDisplay.cashback.enabled && selectedDisplay.cashback.showOnDetails && <CashbackBadge amount={selectedDisplay.cashback.amount} label={selectedDisplay.cashback.label} color={selectedDisplay.cashback.badgeColor} />}
                  </div>
                </div>
              </div>
              {contactActions}
            </section>

            <BuyerDetailSection title="Overview" icon={Layers} className="google-project-overview" key={`overview-${selectedProject.id}`}>
              <dl className="buyer-overview-rows">
                {overviewItems.map(({ label, value, icon: Icon }) => (
                  <div className="buyer-overview-row" key={label}>
                    <dt><Icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{label === 'Installment' && !previewEditor?.editing ? 'Financing' : label}</span></dt>
                    <dd>
                      {previewEditor?.editing
                        ? previewEditor.overviewControl(label, value)
                        : label === 'Installment'
                          ? <button type="button" className="buyer-overview-financing" onClick={onNeedFinancing}>Need Financing</button>
                          : value}
                    </dd>
                  </div>
                ))}
                {previewEditor?.editing && <>
                  <div className="buyer-overview-row">
                    <dt><WalletCards size={18} aria-hidden="true" /><span>Bank Loan</span></dt>
                    <dd><label className="preview-toggle"><input type="checkbox" checked={Boolean(selectedProject.bankLoan)} onChange={(event) => previewEditor.setField('bankLoan', event.target.checked)} /> Bank loan</label></dd>
                  </div>
                  <div className="buyer-overview-row">
                    <dt><Building2 size={18} aria-hidden="true" /><span>Available Plots</span></dt>
                    <dd><input className="preview-inline-input" aria-label="Available plots" type="number" min="0" value={selectedProject.remainingPlots ?? ''} onChange={(event) => previewEditor.setField('remainingPlots', event.target.value)} /></dd>
                  </div>
                </>}
              </dl>
            </BuyerDetailSection>

            {documentsSection}

            <BuyerDetailSection title="Amenities" icon={Sparkles} className="reference-amenities-section" key={`amenities-${selectedProject.id}`}>
              {visibleAmenities.length > 0 || previewEditor?.editing ? <div className="google-amenity-chips">{visibleAmenities.map((item) => previewEditor?.editing ? <label className="preview-amenity-chip" key={item.id}><input type="checkbox" checked onChange={() => previewEditor.toggleAmenity(item.title)} /><Leaf size={16} /> {item.title}</label> : <span key={item.id}><Leaf size={16} /> {item.title}</span>)}{previewEditor?.editing && previewEditor.availableAmenities.map((name) => <label className="preview-amenity-chip" key={name}><input type="checkbox" onChange={() => previewEditor.toggleAmenity(name)} /> <Leaf size={16} /> {name}</label>)}</div>
                : <p className="buyer-detail-empty">No amenities listed yet. Contact us on WhatsApp for details.</p>}
            </BuyerDetailSection>

            {about && (
              <BuyerDetailSection title="About" icon={Info} className="google-project-about" key={`about-${selectedProject.id}`}>
                {previewEditor?.editing ? (
                  <textarea
                    className="preview-inline-textarea"
                    aria-label="About project"
                    value={selectedProject.description || ''}
                    onChange={(event) => previewEditor.setField('description', event.target.value)}
                  />
                ) : (
                  <p className="buyer-project-about-text">
                    {about}
                  </p>
                )}
              </BuyerDetailSection>
            )}

          </div>
        </div>
      {bottomActions}
    </div>
  );
}

