import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AccountDeletionService } from './accountDeletionService.js';

describe('AccountDeletionService API Contract', () => {
  test('exports required service methods', () => {
    assert.strictEqual(typeof AccountDeletionService.deleteFirestoreData, 'function');
    assert.strictEqual(typeof AccountDeletionService.deleteStorageData, 'function');
    assert.strictEqual(typeof AccountDeletionService.deleteFirebaseUser, 'function');
    assert.strictEqual(typeof AccountDeletionService.deleteEverything, 'function');
    assert.strictEqual(typeof AccountDeletionService.reauthenticateUser, 'function');
  });

  test('validates user ID requirements', async () => {
    await assert.rejects(
      async () => AccountDeletionService.deleteFirestoreData(''),
      { message: 'User ID is required for Firestore data deletion.' }
    );

    await assert.rejects(
      async () => AccountDeletionService.deleteStorageData(''),
      { message: 'User ID is required for storage data deletion.' }
    );
  });
});
