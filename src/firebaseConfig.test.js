import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('uses the authoritative Firebase Web Auth domain', async () => {
  const source = await readFile(new URL('./firebaseConfig.js', import.meta.url), 'utf8');
  assert.match(source, /authDomain:\s*["']druvio\.firebaseapp\.com["']/);
  assert.doesNotMatch(source, /authDomain:\s*["']zinoo\.in["']/);
});

test('initializes durable Auth before Firestore without redirect-unsafe IndexedDB persistence', async () => {
  const source = await readFile(new URL('./firebaseConfig.js', import.meta.url), 'utf8');
  const authInitialization = source.indexOf('authInstance = initializeAuth(app');
  const firestoreInitialization = source.indexOf('firestoreInstance = initializeFirestore(app');

  assert.ok(authInitialization >= 0, 'Firebase Auth must be explicitly initialized');
  assert.ok(firestoreInitialization > authInitialization, 'Firebase Auth must initialize before Firestore');
  assert.match(source, /persistence:\s*browserLocalPersistence/);
  assert.doesNotMatch(source, /indexedDBLocalPersistence/);
});

test('uses one canonical browser Firebase app and Auth instance', async () => {
  const source = await readFile(new URL('./firebaseConfig.js', import.meta.url), 'utf8');
  assert.match(source, /getApps\(\)\.length\s*\?\s*getApp\(\)\s*:\s*initializeApp\(firebaseConfig\)/);
  assert.match(source, /export const auth = authInstance/);
  assert.equal((source.match(/initializeApp\(firebaseConfig\)/g) || []).length, 1);
});
