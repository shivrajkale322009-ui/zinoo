import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HIGHLIGHT_BADGE_TYPES,
  HIGHLIGHT_BADGE_CONFIG,
  HIGHLIGHT_BADGE_OPTIONS,
  normalizeHighlightBadge,
  getHighlightBadgeConfig
} from './propertyHighlightBadge.js';

test('normalizeHighlightBadge handles null, undefined, invalid, and NONE gracefully', () => {
  assert.equal(normalizeHighlightBadge(null), HIGHLIGHT_BADGE_TYPES.NONE);
  assert.equal(normalizeHighlightBadge(undefined), HIGHLIGHT_BADGE_TYPES.NONE);
  assert.equal(normalizeHighlightBadge(''), HIGHLIGHT_BADGE_TYPES.NONE);
  assert.equal(normalizeHighlightBadge('INVALID_BADGE'), HIGHLIGHT_BADGE_TYPES.NONE);
  assert.equal(normalizeHighlightBadge('NONE'), HIGHLIGHT_BADGE_TYPES.NONE);
  assert.equal(normalizeHighlightBadge('none'), HIGHLIGHT_BADGE_TYPES.NONE);
});

test('normalizeHighlightBadge accepts valid badge options case-insensitively', () => {
  assert.equal(normalizeHighlightBadge('BEST_FOR_INVESTMENT'), HIGHLIGHT_BADGE_TYPES.BEST_FOR_INVESTMENT);
  assert.equal(normalizeHighlightBadge('best_for_investment'), HIGHLIGHT_BADGE_TYPES.BEST_FOR_INVESTMENT);
  assert.equal(normalizeHighlightBadge('BANK_LOAN_AVAILABLE'), HIGHLIGHT_BADGE_TYPES.BANK_LOAN_AVAILABLE);
  assert.equal(normalizeHighlightBadge('PRIME_LOCATION'), HIGHLIGHT_BADGE_TYPES.PRIME_LOCATION);
  assert.equal(normalizeHighlightBadge('VERIFIED_PROPERTY'), HIGHLIGHT_BADGE_TYPES.VERIFIED_PROPERTY);
});

test('getHighlightBadgeConfig returns null for NONE or missing badges', () => {
  assert.equal(getHighlightBadgeConfig(undefined), null);
  assert.equal(getHighlightBadgeConfig(null), null);
  assert.equal(getHighlightBadgeConfig('NONE'), null);
});

test('getHighlightBadgeConfig returns complete metadata for active badges', () => {
  const investment = getHighlightBadgeConfig('BEST_FOR_INVESTMENT');
  assert.ok(investment);
  assert.equal(investment.label, 'Best for Investment');
  assert.ok(investment.icon);

  const bankLoan = getHighlightBadgeConfig('BANK_LOAN_AVAILABLE');
  assert.ok(bankLoan);
  assert.equal(bankLoan.label, 'Bank Loan Available');

  const prime = getHighlightBadgeConfig('PRIME_LOCATION');
  assert.ok(prime);
  assert.equal(prime.label, 'Prime Location');

  const verified = getHighlightBadgeConfig('VERIFIED_PROPERTY');
  assert.ok(verified);
  assert.equal(verified.label, 'Verified Property');
});

test('HIGHLIGHT_BADGE_OPTIONS includes all 5 options', () => {
  assert.equal(HIGHLIGHT_BADGE_OPTIONS.length, 5);
  assert.equal(HIGHLIGHT_BADGE_OPTIONS[0].id, 'NONE');
});
