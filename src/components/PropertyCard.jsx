import React from 'react';
import { Check, Heart, MapPin, Share2 } from 'lucide-react';
import CashbackBadge from './CashbackBadge';
import PropertyActionRow from './PropertyActionRow';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

export default function PropertyCard({
  project,
  display,
  formatPrice,
  isFavourite,
  onFavouriteToggle,
  onShare,
  onViewDetails
}) {
  const openDetails = () => onViewDetails(project);
  const callHref = display.actions.callNumber ? `tel:${String(display.actions.callNumber).replace(/[^\d+]/g, '')}` : '';
  const mapUrl = display.map.directionsLink || display.map.googleMapsLink || (
    display.map.latitude && display.map.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${display.map.latitude},${display.map.longitude}`
      : ''
  );
  const enabledCardSections = display.visibility.displayOrder.filter((section) => {
    const value = display[section];
    return value && value.showOnCard !== false;
  });

  return (
    <article
      className="feed-project-card property-card-collapsed"
      role="button"
      tabIndex={0}
      aria-label={`View ${project.name}`}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetails();
        }
      }}
    >
      <div className="card-banner">
        <img src={display.media.heroImage || FALLBACK_IMAGE} alt={display.basic.projectName} />
        {display.verified.enabled && display.verified.showOnCard && <div className="verified-card-badge"><Check size={12} /> {display.verified.label}</div>}
        <div className="property-card-image-actions" aria-label={`${project.name} quick actions`}>
          {display.actions.showShare && <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onShare(project);
            }}
            aria-label={`Share ${project.name}`}
          >
            <Share2 size={17} />
          </button>}
          {display.actions.showFavourite && <button
            type="button"
            className={isFavourite ? 'saved' : ''}
            onClick={(event) => {
              event.stopPropagation();
              onFavouriteToggle(project.id);
            }}
            aria-label={isFavourite ? `Remove ${project.name} from favourites` : `Add ${project.name} to favourites`}
            aria-pressed={isFavourite}
          >
            <Heart size={17} fill={isFavourite ? 'currentColor' : 'none'} />
          </button>}
        </div>
      </div>

      <div className="card-info">
        <h3>{display.basic.shortTitle || display.basic.projectName}</h3>
        {display.basic.location && <p className="card-loc"><MapPin size={10} /> {display.basic.location}</p>}
        <div className="property-card-price-row">
          <div>
            <span>{display.pricing.pricePrefix}</span>
            <strong>{formatPrice(display.pricing.startingPrice)}</strong>
          </div>
          {display.cashback.enabled && display.cashback.showOnCard && <CashbackBadge amount={display.cashback.amount} label={display.cashback.label} color={display.cashback.badgeColor} />}
        </div>
        {enabledCardSections.includes('featureChips') && (
          <div className="property-card-config-items">
            {display.featureChips.items.filter((item) => item.enabled).map((item) => <span key={item.id}>{item.title}</span>)}
          </div>
        )}
        {enabledCardSections.includes('quickStats') && (
          <div className="property-card-config-stats">
            {display.quickStats.items.filter((item) => item.enabled).map((item) => <div key={item.id}><small>{item.title}</small><strong>{item.value}</strong></div>)}
          </div>
        )}
        {display.actions.showViewDetails && <button
          type="button"
          className="buyer-card-view-button"
          onClick={(event) => {
            event.stopPropagation();
            openDetails();
          }}
        >
          {display.actions.viewDetailsLabel}
        </button>}
        {display.actions.showOnCard !== false && <PropertyActionRow projectName={display.basic.projectName} callHref={callHref} mapUrl={mapUrl} showCall={display.actions.showCall} showMap={display.actions.showMap && display.map.showOnCard} callLabel={display.actions.callLabel} mapLabel={display.actions.mapLabel} />}
      </div>
    </article>
  );
}
