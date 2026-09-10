import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where
} from 'firebase/firestore';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'zinoo-rules-test',
    firestore: { rules: await readFile(resolve(root, 'firestore.rules'), 'utf8') }
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'publicProjects', 'visible'), { projectName: 'Visible', slug: 'visible', publicVisibility: true, status: 'active' }),
      setDoc(doc(db, 'publicProjects', 'hidden'), { projectName: 'Hidden', slug: 'hidden', publicVisibility: false, status: 'active' }),
      setDoc(doc(db, 'publicProjects', 'inactive'), { projectName: 'Inactive', slug: 'inactive', publicVisibility: true, status: 'inactive' }),
      setDoc(doc(db, 'publicLocations', 'kuruli'), { name: 'Kuruli', slug: 'kuruli' }),
      setDoc(doc(db, 'publicProjectSlugs', 'visible'), { projectId: 'visible' }),
      setDoc(doc(db, 'users', 'seller-user'), { role: 'seller', permissions: { seller: true, admin: false } }),
      setDoc(doc(db, 'users', 'admin-user'), { role: 'admin', permissions: { seller: true, admin: true } }),
      setDoc(doc(db, 'users', 'private-user'), { role: 'buyer' }),
      setDoc(doc(db, 'amenityCatalog', 'garden'), { name: 'Garden', isActive: true }),
      setDoc(doc(db, 'amenityCatalog', 'pool'), { name: 'Swimming Pool', isActive: false }),
      setDoc(doc(db, 'projects', 'seller-project'), {
        ownerId: 'seller-user', sellerUid: 'seller-user', name: 'Seller Project', status: 'pending',
        createdBy: 'seller-user', createdByRole: 'seller'
      }),
      setDoc(doc(db, 'projects', 'other-project'), {
        ownerId: 'another-user', sellerUid: 'another-user', name: 'Other Project', status: 'pending',
        createdBy: 'another-user', createdByRole: 'seller'
      }),
      setDoc(doc(db, 'projects', 'active-project'), {
        ownerId: 'another-user', sellerUid: 'another-user', name: 'Active Project', status: 'active',
        createdBy: 'another-user', createdByRole: 'seller'
      }),
      setDoc(doc(db, 'layouts', 'public-layout'), { projectId: 'active-project', name: 'Master Layout' }),
      setDoc(doc(db, 'layouts', 'private-layout'), { projectId: 'seller-project', name: 'Draft Layout' }),
      ...['leads', 'cashbacks', 'notifications', 'sellerRequests', 'propertyAuditLogs', 'cashbackAuditLogs']
        .map((name) => setDoc(doc(db, name, 'private-record'), { ownerId: 'private-user' }))
    ]);
  });
});

after(async () => environment?.cleanup());

test('unauthenticated clients read only explicitly public projections and locations', async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, 'publicProjects', 'visible')));
  await assertFails(getDoc(doc(db, 'publicProjects', 'hidden')));
  await assertFails(getDoc(doc(db, 'publicProjects', 'inactive')));
  const visibleQuery = await assertSucceeds(getDocs(query(
    collection(db, 'publicProjects'),
    where('slug', '==', 'visible'),
    where('publicVisibility', '==', true),
    where('status', '==', 'active')
  )));
  assert.equal(visibleQuery.size, 1);
  await assertFails(getDocs(query(collection(db, 'publicProjects'), where('slug', '==', 'visible'))));
  await assertSucceeds(getDoc(doc(db, 'publicLocations', 'kuruli')));
});

test('unauthenticated clients cannot read private collections or slug registry', async () => {
  const db = environment.unauthenticatedContext().firestore();
  for (const name of [
    'projects', 'users', 'leads', 'cashbacks', 'notifications', 'sellerRequests',
    'propertyAuditLogs', 'cashbackAuditLogs', 'publicProjectSlugs', 'amenityCatalog'
  ]) await assertFails(getDoc(doc(db, name, name === 'projects' ? 'seller-project' : name === 'users' ? 'private-user' : name === 'publicProjectSlugs' ? 'visible' : 'private-record')));
});

test('unauthenticated clients can view layouts only for active public projects', async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, 'layouts', 'public-layout')));
  await assertFails(getDoc(doc(db, 'layouts', 'private-layout')));
});

test('amenity master catalog is hidden from buyers and writable only by admins', async () => {
  const buyerDb = environment.authenticatedContext('private-user').firestore();
  const sellerDb = environment.authenticatedContext('seller-user').firestore();
  const adminDb = environment.authenticatedContext('admin-user').firestore();

  await assertFails(getDoc(doc(buyerDb, 'amenityCatalog', 'garden')));
  await assertSucceeds(getDocs(query(collection(sellerDb, 'amenityCatalog'), where('isActive', '==', true))));
  await assertFails(getDoc(doc(sellerDb, 'amenityCatalog', 'pool')));
  await assertFails(setDoc(doc(sellerDb, 'amenityCatalog', 'seller-created'), {
    name: 'Seller Amenity', isActive: true, createdAt: Timestamp.now(), updatedAt: Timestamp.now()
  }));
  await assertSucceeds(setDoc(doc(adminDb, 'amenityCatalog', 'clubhouse'), {
    name: 'Clubhouse', isActive: true, createdAt: Timestamp.now(), updatedAt: Timestamp.now()
  }));
});

test('public projection collections reject client writes', async () => {
  const db = environment.unauthenticatedContext().firestore();
  for (const name of ['publicProjects', 'publicLocations', 'publicProjectSlugs']) {
    await assertFails(setDoc(doc(db, name, 'client-write'), { publicVisibility: true }));
  }
});

test('existing seller and admin project permissions remain intact', async () => {
  const sellerDb = environment.authenticatedContext('seller-user').firestore();
  const adminDb = environment.authenticatedContext('admin-user').firestore();
  await assertSucceeds(getDoc(doc(sellerDb, 'projects', 'seller-project')));
  await assertFails(getDoc(doc(sellerDb, 'projects', 'other-project')));
  await assertSucceeds(setDoc(doc(sellerDb, 'projects', 'new-seller-project'), {
    ownerId: 'seller-user', sellerUid: 'seller-user', name: 'New Seller Project', status: 'pending',
    createdBy: 'seller-user', createdByRole: 'seller'
  }));
  await assertSucceeds(getDoc(doc(adminDb, 'projects', 'other-project')));
});

test('admins can update legacy projects that do not yet have sellerUid', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'projects', 'legacy-project'), {
      ownerId: 'seller-user', sellerId: 'seller-user', name: 'Legacy Project',
      status: 'pending', createdBy: 'seller-user', createdByRole: 'seller'
    });
  });

  const adminDb = environment.authenticatedContext('admin-user').firestore();
  await assertSucceeds(setDoc(doc(adminDb, 'projects', 'legacy-project'), {
    ownerId: 'seller-user', sellerId: 'seller-user', name: 'Updated Legacy Project',
    status: 'pending', createdBy: 'seller-user', createdByRole: 'seller'
  }));
});
