import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HIGHLIGHT_BADGE_TYPES,
  HIGHLIGHT_BADGE_CONFIG,
  getHighlightBadgeConfig,
  normalizeHighlightBadge
} from '../utils/propertyHighlightBadge.js';
import { withPropertyDisplayModel, getPropertyDisplayModel } from '../utils/propertyDisplayModel.js';

test('property display model defaults highlightBadge to NONE for legacy records', () => {
  const model = getPropertyDisplayModel({ name: 'Test Project' });
  assert.equal(model.highlightBadge, 'NONE');

  const withModel = withPropertyDisplayModel({ name: 'Test Project' });
  assert.equal(withModel.highlightBadge, 'NONE');
  assert.equal(withModel.display.highlightBadge, 'NONE');
});

test('property display model preserves configured highlightBadge', () => {
  const property = {
    name: 'Mangalmurti Colony',
    startingPrice: 2800000,
    highlightBadge: 'BANK_LOAN_AVAILABLE'
  };

  const model = withPropertyDisplayModel(property);
  assert.equal(model.highlightBadge, 'BANK_LOAN_AVAILABLE');
  assert.equal(model.display.highlightBadge, 'BANK_LOAN_AVAILABLE');
});

test('all required highlight badge options have valid labels and configurations', () => {
  const required = [
    { type: 'BEST_FOR_INVESTMENT', label: 'Best for Investment' },
    { type: 'BANK_LOAN_AVAILABLE', label: 'Bank Loan Available' },
    { type: 'PRIME_LOCATION', label: 'Prime Location' },
    { type: 'VERIFIED_PROPERTY', label: 'Verified Property' }
  ];

  required.forEach(({ type, label }) => {
    const config = getHighlightBadgeConfig(type);
    assert.ok(config, `Missing config for ${type}`);
    assert.equal(config.label, label);
    assert.ok(config.icon, `Missing icon for ${type}`);
    assert.ok(config.className, `Missing className for ${type}`);
  });
});
