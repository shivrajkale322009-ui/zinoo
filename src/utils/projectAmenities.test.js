import test from 'node:test';
import assert from 'node:assert/strict';
import { projectAmenityNames, withSelectedProjectAmenities } from './projectAmenities.js';

test('buyer amenities remain specific to each project', () => {
  const projectA = { id: 'a', amenities: ['Garden', 'CCTV', 'Street Lights'] };
  const projectB = { id: 'b', amenities: ['Clubhouse'] };
  assert.deepEqual(projectAmenityNames(projectA), ['Garden', 'CCTV', 'Street Lights']);
  assert.deepEqual(projectAmenityNames(projectB), ['Clubhouse']);
});

test('master catalog entries do not appear unless selected for the project', () => {
  const catalog = [
    { id: 'garden', name: 'Garden' },
    { id: 'pool', name: 'Swimming Pool' },
    { id: 'cctv', name: 'CCTV' }
  ];
  const saved = withSelectedProjectAmenities({}, ['garden', 'cctv'], catalog);
  assert.deepEqual(saved.amenityIds, ['garden', 'cctv']);
  assert.deepEqual(saved.amenities, ['Garden', 'CCTV']);
});

test('stable amenity IDs survive catalog renames and removals', () => {
  const existing = { amenityIds: ['play'], amenities: ["Children's Play Area"] };
  const renamed = withSelectedProjectAmenities(existing, ['play'], [{ id: 'play', name: 'Kids Play Area' }]);
  const unavailable = withSelectedProjectAmenities(existing, ['play'], []);
  assert.deepEqual(renamed, { amenityIds: ['play'], amenities: ['Kids Play Area'] });
  assert.deepEqual(unavailable, existing);
});
