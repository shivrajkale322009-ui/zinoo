import React from 'react';
import { MapPin, Phone } from 'lucide-react';

export default function PropertyActionRow({ projectName, callHref, mapUrl, showCall = true, showMap = true, callLabel, mapLabel }) {
  return (
    <div className="property-action-row" aria-label={`${projectName} contact actions`}>
      {showCall && (callHref ? (
        <a
          href={callHref}
          className="property-action-button"
          onClick={(event) => event.stopPropagation()}
          aria-label={`Call about ${projectName}`}
        >
          <Phone size={17} />
          <span>{callLabel}</span>
        </a>
      ) : (
        <button type="button" className="property-action-button" disabled>
          <Phone size={17} />
          <span>{callLabel}</span>
        </button>
      ))}
      {showMap && (mapUrl ? (
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="property-action-button"
          onClick={(event) => event.stopPropagation()}
          aria-label={`View ${projectName} on map`}
        >
          <MapPin size={17} />
          <span>{mapLabel}</span>
        </a>
      ) : (
        <button type="button" className="property-action-button" disabled>
          <MapPin size={17} />
          <span>{mapLabel}</span>
        </button>
      ))}
    </div>
  );
}
