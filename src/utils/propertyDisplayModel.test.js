import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPropertyDisplayModel,
  getPropertyDisplayModel,
  withPropertyDisplayModel
} from './propertyDisplayModel.js';

test('creates a nested display model from legacy project fields', () => {
  const display = createPropertyDisplayModel({
    name: 'Meadows',
    startingPrice: 1200000,
    cashbackAmount: 10000,
    amenities: ['Water', 'Roads']
  });

  assert.equal(display.basic.projectName, 'Meadows');
  assert.equal(display.pricing.startingPrice, 1200000);
  assert.equal(display.cashback.enabled, true);
  assert.equal(display.cashback.amount, 10000);
  assert.deepEqual(display.amenities.items.map((item) => item.title), ['Water', 'Roads']);
});

test('configured values override legacy fields and preserve editable arrays', () => {
  const display = getPropertyDisplayModel({
    name: 'Legacy name',
    display: {
      basic: { projectName: 'Configured name' },
      featureChips: {
        showOnCard: true,
        items: [{ id: 'chip_1', title: 'Bank Loan Available', icon: 'offer', enabled: true }]
      }
    }
  });

  assert.equal(display.basic.projectName, 'Configured name');
  assert.equal(display.featureChips.showOnCard, true);
  assert.equal(display.featureChips.items[0].title, 'Bank Loan Available');
});

test('disabled cashback is synchronized to zero in legacy compatibility fields', () => {
  const project = withPropertyDisplayModel({
    name: 'No offer',
    cashbackAmount: 25000,
    display: {
      cashback: {
        enabled: false,
        amount: 25000,
        label: 'Festival Offer',
        showOnCard: false,
        showOnDetails: false
      }
    }
  });

  assert.equal(project.display.cashback.enabled, false);
  assert.equal(project.cashbackAmount, 0);
  assert.equal(project.cashbackPerGuntha, 0);
});
