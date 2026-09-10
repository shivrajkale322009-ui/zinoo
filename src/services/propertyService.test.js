import test from 'node:test';
import assert from 'node:assert/strict';
import { isDeleteConfirmationValid } from '../utils/deletePropertyConfirmation.js';

test('requires the exact DELETE confirmation while ignoring surrounding spaces', () => {
  assert.equal(isDeleteConfirmationValid('DELETE'), true);
  assert.equal(isDeleteConfirmationValid('  DELETE  '), true);
  assert.equal(isDeleteConfirmationValid('delete'), false);
  assert.equal(isDeleteConfirmationValid('DELETE PROPERTY'), false);
  assert.equal(isDeleteConfirmationValid(''), false);
});
