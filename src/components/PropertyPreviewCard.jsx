import { useState } from 'react';
import { BadgeCheck, Camera, Check, FileCheck2, Gift, Leaf, MapPin, MessageCircle, Phone } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=82';

const formatPrice = (value) => {
  if (typeof value === 'string') return value;
  const amount = Number(value) || 0;
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 ? 1 : 0)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 ? 1 : 0)} Lakh`;
  return `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
};

const formatCashback = (value) => {
  if (typeof value === 'string') return value;
  return `₹${new Intl.NumberFormat('en-IN').format(Number(value) || 0)}`;
};

const formatExactCashback = (value) => {
  const rawValue = String(value ?? '').trim();
  const numericValue = Number(rawValue.replace(/[^\d.]/g, '')) || 0;
  const amount = /lakh/i.test(rawValue) ? numericValue * 100000 : numericValue;
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(amount))}`;
};

export default function PropertyPreviewCard({
  variant,
  propertyId,
  image,
  projectName,
  location,
  startingPrice,
  cashback,
  showNameBadge = false,
  photoCount = 1,
  legalStatus = 'Non-Agriculture Zone',
  titleStatus = 'Clear Title',
  developerName,
  onDeveloperClick,
  callNumber,
  whatsappNumber,
  projectHref,
  onCall,
  onWhatsApp,
  onClick
}) {
  const isHomeFeatured = variant === 'home-featured';
  const linkFeaturedContent = isHomeFeatured && Boolean(projectHref);
  const [imageLoaded, setImageLoaded] = useState(false);
  const callHref = callNumber ? `tel:${String(callNumber).replace(/[^\d+]/g, '')}` : undefined;
  const whatsappDigits = String(whatsappNumber || callNumber || '').replace(/[^\d]/g, '');
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`I'm interested in ${projectName}`)}`
    : undefined;

  const openCard = () => onClick?.(propertyId);
  const openCanonicalLink = (event) => {
    event.stopPropagation();
    if (onClick) {
      event.preventDefault();
      openCard();
    }
  };

  const media = (
    <div className={`property-preview-media ${imageLoaded ? 'is-loaded' : ''}`}>
      <div className="property-preview-skeleton" aria-hidden="true" />
      <img
        src={image || FALLBACK_IMAGE}
        alt={projectName}
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        onLoad={() => setImageLoaded(true)}
        onError={(event) => {
          if (event.currentTarget.src !== FALLBACK_IMAGE) event.currentTarget.src = FALLBACK_IMAGE;
        }}
      />
      <span className="property-preview-count"><Camera /> {Math.max(1, Number(photoCount) || 1)}+</span>
      {cashback && Number(String(cashback).replace(/[^\d.]/g, '')) > 0 && (
        <div className="property-preview-cashback">
          <Gift />
          <span><strong>{isHomeFeatured ? formatExactCashback(cashback) : formatCashback(cashback)} Cashback</strong><small>{isHomeFeatured ? 'Book through Zinoo' : 'On Every Booking'}</small></span>
        </div>
      )}
    </div>
  );

  const projectInformation = (
    <>
      <h3>
        {linkFeaturedContent ? projectName : projectHref ? <a className="property-preview-project-link" href={projectHref} onClick={openCanonicalLink}>{projectName}</a> : projectName}
        {showNameBadge && <BadgeCheck className="property-name-verified-badge" aria-label="Verified property" />}
      </h3>
      <p className="property-preview-location"><MapPin /> {location || 'Chakan, Pune'}</p>
      <div className="property-preview-legal">
        <span className="legal"><Leaf /> {legalStatus}</span>
        <span className="title"><FileCheck2 /> {titleStatus}</span>
      </div>
      <div className="property-preview-price">{!isHomeFeatured && <small>Starting from</small>}<strong>{formatPrice(startingPrice)}</strong></div>
    </>
  );

  return (
    <article
      className={`property-preview-card${isHomeFeatured ? ' property-preview-card--home-featured' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`View ${projectName}`}
      onClick={openCard}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCard();
        }
      }}
    >
      {linkFeaturedContent ? <a className="property-preview-primary-link property-preview-media-link" href={projectHref} onClick={openCanonicalLink}>{media}</a> : media}

      <div className="property-preview-content">
        <div className="property-preview-copy">
          <span className="property-preview-label">by <button type="button" disabled={!onDeveloperClick} onClick={(event) => { event.stopPropagation(); onDeveloperClick?.(); }}>{developerName || 'Verified Developer'} <Check /></button></span>
          {linkFeaturedContent ? <a className="property-preview-primary-link" href={projectHref} onClick={openCanonicalLink}>{projectInformation}</a> : projectInformation}
        </div>
        <div className="property-preview-actions">
          <a href={callHref || '#'} aria-disabled={!callHref && !onCall} onClick={(event) => {
            event.stopPropagation();
            if (onCall) { event.preventDefault(); onCall(); }
          }}><Phone /> Call</a>
          <a className="whatsapp" href={whatsappHref || '#'} aria-disabled={!whatsappHref && !onWhatsApp} target={whatsappHref ? '_blank' : undefined} rel={whatsappHref ? 'noreferrer' : undefined} onClick={(event) => {
            event.stopPropagation();
            if (onWhatsApp) { event.preventDefault(); onWhatsApp(); }
          }}><MessageCircle /> WhatsApp</a>
        </div>
      </div>
    </article>
  );
}
