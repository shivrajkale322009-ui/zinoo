import React from 'react';
import { getHighlightBadgeConfig } from '../utils/propertyHighlightBadge';

export default function PropertyHighlightBadge({ badgeType, className = '', isHero = false }) {
  const config = getHighlightBadgeConfig(badgeType);
  if (!config) return null;

  const Icon = config.icon;
  const classes = [
    'property-highlight-badge',
    config.className,
    isHero ? 'property-highlight-badge-hero' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} role="status" aria-label={config.label}>
      {Icon && <Icon size={14} strokeWidth={2.2} className="property-highlight-badge-icon" aria-hidden="true" />}
      <span className="property-highlight-badge-label">{config.label}</span>
    </span>
  );
}
