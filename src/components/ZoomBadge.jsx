import React, { memo } from 'react';
import './ZoomBadge.css';

const normalizeZoom = (zoom) => {
  const value = Number(zoom);
  return Number.isFinite(value) ? value.toFixed(1) : null;
};

function ZoomBadge({ zoom, className = '' }) {
  const level = normalizeZoom(zoom);
  if (level === null) return null;

  return (
    <div className={`map-zoom-badge ${className}`.trim()} aria-live="polite" aria-label={`Map zoom level ${level}`}>
      <span key={level}>Z{level}</span>
    </div>
  );
}

export default memo(ZoomBadge);
