import { BadgeCheck, Landmark, MapPin, TrendingUp, Home } from 'lucide-react';

export const HIGHLIGHT_BADGE_TYPES = Object.freeze({
  NONE: 'NONE',
  BEST_FOR_INVESTMENT: 'BEST_FOR_INVESTMENT',
  BANK_LOAN_AVAILABLE: 'BANK_LOAN_AVAILABLE',
  PRIME_LOCATION: 'PRIME_LOCATION',
  BEST_FOR_RESIDENTIAL: 'BEST_FOR_RESIDENTIAL',
  VERIFIED_PROPERTY: 'VERIFIED_PROPERTY'
});

export const HIGHLIGHT_BADGE_CONFIG = Object.freeze({
  [HIGHLIGHT_BADGE_TYPES.NONE]: {
    id: HIGHLIGHT_BADGE_TYPES.NONE,
    label: 'None',
    description: 'No highlight badge shown on property',
    icon: null,
    className: 'property-highlight-badge--none'
  },
  [HIGHLIGHT_BADGE_TYPES.BEST_FOR_INVESTMENT]: {
    id: HIGHLIGHT_BADGE_TYPES.BEST_FOR_INVESTMENT,
    label: 'Best for Investment',
    description: 'High capital appreciation and investment appeal',
    icon: TrendingUp,
    className: 'property-highlight-badge--best-for-investment'
  },
  [HIGHLIGHT_BADGE_TYPES.BANK_LOAN_AVAILABLE]: {
    id: HIGHLIGHT_BADGE_TYPES.BANK_LOAN_AVAILABLE,
    label: 'Bank Loan Available',
    description: 'Approved for bank loan and EMI financing options',
    icon: Landmark,
    className: 'property-highlight-badge--bank-loan-available'
  },
  [HIGHLIGHT_BADGE_TYPES.PRIME_LOCATION]: {
    id: HIGHLIGHT_BADGE_TYPES.PRIME_LOCATION,
    label: 'Prime Location',
    description: 'High connectivity, close to key junctions & amenities',
    icon: MapPin,
    className: 'property-highlight-badge--prime-location'
  },
  [HIGHLIGHT_BADGE_TYPES.VERIFIED_PROPERTY]: {
    id: HIGHLIGHT_BADGE_TYPES.VERIFIED_PROPERTY,
    label: 'Verified Property',
    description: '100% verified documentation and clear title',
    icon: BadgeCheck,
    className: 'property-highlight-badge--verified-property'
  },
  [HIGHLIGHT_BADGE_TYPES.BEST_FOR_RESIDENTIAL]: {
    id: HIGHLIGHT_BADGE_TYPES.BEST_FOR_RESIDENTIAL,
    label: 'Best for Residential Purpose',
    description: 'Suitable for residential use',
    icon: Home,
    className: 'property-highlight-badge--best-for-residential'
  }
});

export const HIGHLIGHT_BADGE_OPTIONS = Object.freeze([
  HIGHLIGHT_BADGE_CONFIG[HIGHLIGHT_BADGE_TYPES.NONE],
  HIGHLIGHT_BADGE_CONFIG[HIGHLIGHT_BADGE_TYPES.BEST_FOR_INVESTMENT],
  HIGHLIGHT_BADGE_CONFIG[HIGHLIGHT_BADGE_TYPES.BANK_LOAN_AVAILABLE],
  HIGHLIGHT_BADGE_CONFIG[HIGHLIGHT_BADGE_TYPES.PRIME_LOCATION],
  HIGHLIGHT_BADGE_CONFIG[HIGHLIGHT_BADGE_TYPES.VERIFIED_PROPERTY],
  HIGHLIGHT_BADGE_CONFIG[HIGHLIGHT_BADGE_TYPES.BEST_FOR_RESIDENTIAL]
]);

export function normalizeHighlightBadge(value) {
  if (!value || typeof value !== 'string') return HIGHLIGHT_BADGE_TYPES.NONE;
  const upper = value.trim().toUpperCase();
  return HIGHLIGHT_BADGE_CONFIG[upper] ? upper : HIGHLIGHT_BADGE_TYPES.NONE;
}

export function getHighlightBadgeConfig(badgeType) {
  const normalized = normalizeHighlightBadge(badgeType);
  if (normalized === HIGHLIGHT_BADGE_TYPES.NONE) {
    return null;
  }
  return HIGHLIGHT_BADGE_CONFIG[normalized] || null;
}
