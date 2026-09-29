import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPropertyDisplayModel,
  getPropertyDisplayModel,
  withPropertyDisplayModel,
  withPropertyStartingPrice
} from './propertyDisplayModel.js';

test('canonical price overrides stale legacy and display price copies', () => {
  const project = { startingPrice: 700000, priceFrom: 600000, display: { pricing: { startingPrice: 600000, pricePrefix: 'From' } } };
  assert.equal(getPropertyDisplayModel(project).pricing.startingPrice, 700000);
  const saved = withPropertyDisplayModel(project);
  assert.equal(saved.startingPrice, 700000);
  assert.equal(saved.priceFrom, 700000);
  assert.equal(saved.display.pricing.pricePrefix, 'From');
});

test('display-only legacy records still supply a price', () => {
  assert.equal(getPropertyDisplayModel({ display: { pricing: { startingPrice: 2000000 } } }).pricing.startingPrice, 2000000);
});

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

test('admin-configured verified name badge is preserved in the display model', () => {
  const display = getPropertyDisplayModel({
    name: 'Verified Meadows',
    display: { verified: { showNameBadge: true } }
  });

  assert.equal(display.verified.showNameBadge, true);
});

test('name badge stays enabled when the legacy verified flag is off', () => {
  const display = getPropertyDisplayModel({
    name: 'Admin-marked Project',
    verified: false,
    showVerifiedNameBadge: true
  });

  assert.equal(display.verified.enabled, false);
  assert.equal(display.verified.showNameBadge, true);
});

test('admin display amenities cannot replace seller-selected project amenities', () => {
  const display = getPropertyDisplayModel({
    amenities: ['Garden'],
    display: {
      amenities: {
        showOnDetails: true,
        items: [{ id: 'admin-pool', title: 'Swimming Pool', enabled: true }]
      }
    }
  });
  assert.deepEqual(display.amenities.items.map((item) => item.title), ['Garden']);
});

test('projects with no seller-selected amenities do not inherit configured defaults', () => {
  const display = getPropertyDisplayModel({
    amenities: [],
    display: { amenities: { items: [{ id: 'master', title: 'Clubhouse', enabled: true }] } }
  });
  assert.deepEqual(display.amenities.items, []);
});

test('admin authoritative name replaces a stale nested project name', () => {
  const persisted = withPropertyDisplayModel({
    name: 'New Project',
    status: 'active',
    display: {
      basic: {
        projectName: 'Old Project',
        shortTitle: 'Old Project'
      }
    }
  }, {
    authoritativeName: 'New Project',
    previousName: 'Old Project'
  });

  assert.equal(persisted.name, 'New Project');
  assert.equal(persisted.display.basic.projectName, 'New Project');
  assert.equal(persisted.display.basic.shortTitle, 'New Project');
  assert.equal(persisted.shortTitle, 'New Project');
  assert.equal(persisted.status, 'active');
});

test('admin authoritative name preserves a customized short title', () => {
  const persisted = withPropertyDisplayModel({
    name: 'New Project',
    display: {
      basic: {
        projectName: 'Old Project',
        shortTitle: 'OP Special'
      }
    }
  }, {
    authoritativeName: 'New Project',
    previousName: 'Old Project'
  });

  assert.equal(persisted.name, 'New Project');
  assert.equal(persisted.display.basic.projectName, 'New Project');
  assert.equal(persisted.display.basic.shortTitle, 'OP Special');
  assert.equal(persisted.shortTitle, 'OP Special');
});

test('ordinary normalization keeps configured name precedence', () => {
  const persisted = withPropertyDisplayModel({
    name: 'Legacy name',
    display: { basic: { projectName: 'Configured name' } }
  });

  assert.equal(persisted.name, 'Configured name');
  assert.equal(persisted.display.basic.projectName, 'Configured name');
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

test('admin price changes replace stale display pricing before persistence', () => {
  const original = {
    startingPrice: 1000000,
    priceFrom: 1000000,
    display: {
      pricing: {
        startingPrice: 1000000,
        pricePrefix: 'Starting from'
      }
    }
  };

  const edited = withPropertyStartingPrice(original, '1250000');
  const persisted = withPropertyDisplayModel(edited);

  assert.equal(persisted.startingPrice, 1250000);
  assert.equal(persisted.priceFrom, 1250000);
  assert.equal(persisted.display.pricing.startingPrice, 1250000);
});

test('property normalization preserves document file metadata', () => {
  const project = withPropertyDisplayModel({
    documents: [{
      id: 'layout-1',
      type: 'approved_layout',
      displayName: 'Approved Layout',
      url: 'https://storage.example/layout.pdf',
      fileName: 'layout.pdf',
      fileType: 'PDF',
      contentType: 'application/pdf',
      storagePath: 'project-documents/layout.pdf',
      status: 'verified'
    }]
  });

  assert.equal(project.documents[0].fileName, 'layout.pdf');
  assert.equal(project.documents[0].fileType, 'PDF');
  assert.equal(project.documents[0].contentType, 'application/pdf');
  assert.equal(project.documents[0].storagePath, 'project-documents/layout.pdf');
});

test('property normalization omits an absent optional RERA number', () => {
  const withoutRera = withPropertyDisplayModel({ name: 'Optional RERA project' });
  const withRera = withPropertyDisplayModel({ name: 'Registered project', reraNumber: 'P52100012345' });

  assert.equal(Object.hasOwn(withoutRera, 'reraNumber'), false);
  assert.equal(withRera.reraNumber, 'P52100012345');
});

test('canonical documents survive stale display configuration during editor round trips', () => {
  const project = withPropertyDisplayModel({
    documents: [{
      id: 'new-document', type: 'other', displayName: 'Renamed canonical document',
      url: 'https://storage.example/new.pdf', fileName: 'new.pdf', status: 'pending', storagePath: 'project-documents/new.pdf'
    }],
    display: {
      documents: {
        items: [{ id: 'old-document', title: 'Removed legacy document', url: 'https://storage.example/old.pdf', verified: true }]
      }
    }
  });

  assert.equal(project.display.documents.items.length, 1);
  assert.equal(project.display.documents.items[0].id, 'new-document');
  assert.equal(project.display.documents.items[0].title, 'Renamed canonical document');
  assert.equal(project.documents[0].storagePath, 'project-documents/new.pdf');
});

test('canonical photos prevent stale display photos from reappearing in buyer carousel', () => {
  const display = getPropertyDisplayModel({
    media: [{ id: 'current', downloadURL: 'https://example.com/current.jpg' }],
    display: { media: { heroImage: 'https://example.com/removed.jpg', gallery: [
      { id: 'old', url: 'https://example.com/removed.jpg', enabled: true }
    ] } }
  });
  assert.deepEqual(display.media.gallery.map((image) => image.url), ['https://example.com/current.jpg']);
  assert.equal(display.media.heroImage, 'https://example.com/current.jpg');
});

test('deleting the final canonical photo leaves no stale carousel or hero', () => {
  const display = getPropertyDisplayModel({
    media: [], thumbnail: 'https://example.com/removed.jpg',
    display: { media: { heroImage: 'https://example.com/removed.jpg', gallery: [
      { url: 'https://example.com/removed.jpg' }
    ] } }
  });
  assert.deepEqual(display.media.gallery, []);
  assert.equal(display.media.heroImage, '');
});
