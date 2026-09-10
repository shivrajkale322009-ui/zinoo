/**
 * AccountDeletionService
 * 
 * Production-ready service responsible for deleting user data across
 * Firestore, Firebase Storage, and Firebase Authentication in compliance with
 * Google Play's User Data policy.
 */

import {
  deleteUser,
  reauthenticateWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { logoutUser } from './authSessionService.js';
import {
  ref,
  listAll,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig.js';

/**
 * Deletes all files recursively under a specific Storage prefix reference.
 * @param {import('firebase/storage').StorageReference} folderRef
 */
async function deleteFolderRecursive(folderRef) {
  try {
    const res = await listAll(folderRef);
    // Delete all items in current folder
    const itemDeletions = res.items.map((itemRef) =>
      deleteObject(itemRef).catch((err) => {
        if (err?.code !== 'storage/object-not-found') {
          console.warn(`[AccountDeletionService] Storage item delete warning for ${itemRef.fullPath}:`, err);
        }
      })
    );
    await Promise.all(itemDeletions);

    // Recursively delete sub-folders
    for (const prefixRef of res.prefixes) {
      await deleteFolderRecursive(prefixRef);
    }
  } catch (err) {
    if (err?.code !== 'storage/object-not-found' && err?.code !== 'storage/unauthorized') {
      console.warn(`[AccountDeletionService] Storage list warning for ${folderRef.fullPath}:`, err);
    }
  }
}

export const AccountDeletionService = {
  /**
   * Deletes all user files owned by userId from Firebase Storage.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async deleteStorageData(userId) {
    if (!userId) throw new Error('User ID is required for storage data deletion.');

    const storagePaths = [
      `cashback-claims/${userId}`,
      `project-documents/${userId}`,
      `project-media/${userId}`,
      `avatars/${userId}`,
      `profile-photos/${userId}`,
      `users/${userId}`
    ];

    for (const path of storagePaths) {
      const folderRef = ref(storage, path);
      await deleteFolderRecursive(folderRef);
    }
  },

  /**
   * Deletes all Firestore documents associated with userId across all collections.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async deleteFirestoreData(userId) {
    if (!userId) throw new Error('User ID is required for Firestore data deletion.');

    // 1. Direct key document deletions
    const directDocRefs = [
      doc(db, 'users', userId),
      doc(db, 'sellerRequests', userId),
      doc(db, 'featuredDevelopers', userId)
    ];

    for (const docRef of directDocRefs) {
      try {
        await deleteDoc(docRef);
      } catch (err) {
        console.warn(`[AccountDeletionService] Warning deleting doc ${docRef.path}:`, err);
      }
    }

    // 2. Collection query-based deletions
    const queryConfigs = [
      { coll: 'leads', field: 'createdBy' },
      { coll: 'leads', field: 'userId' },
      { coll: 'visits', field: 'createdBy' },
      { coll: 'visits', field: 'userId' },
      { coll: 'notifications', field: 'recipientId' },
      { coll: 'notifications', field: 'userId' },
      { coll: 'projects', field: 'ownerId' },
      { coll: 'projects', field: 'sellerUid' },
      { coll: 'projects', field: 'createdBy' },
      { coll: 'layouts', field: 'createdBy' }
    ];

    for (const { coll, field } of queryConfigs) {
      try {
        const q = query(collection(db, coll), where(field, '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
          await batch.commit();
        }
      } catch (err) {
        console.warn(`[AccountDeletionService] Warning querying/deleting in ${coll} where ${field}==${userId}:`, err);
      }
    }
  },

  /**
   * Deletes the user account from Firebase Authentication.
   * @param {import('firebase/auth').User} user
   * @returns {Promise<void>}
   */
  async deleteFirebaseUser(user) {
    const currentUser = user || auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found for deletion.');
    }

    try {
      await deleteUser(currentUser);
    } catch (err) {
      if (err?.code === 'auth/requires-recent-login') {
        const reauthError = new Error('Re-authentication required. Please sign in again to complete account deletion.');
        reauthError.code = 'auth/requires-recent-login';
        throw reauthError;
      }
      throw err;
    }
  },

  /**
   * Prompts the user to re-authenticate using Google Sign-In.
   * @param {import('firebase/auth').User} user
   * @returns {Promise<void>}
   */
  async reauthenticateUser(user) {
    const currentUser = user || auth.currentUser;
    if (!currentUser) throw new Error('No user context available for re-authentication.');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await reauthenticateWithPopup(currentUser, provider);
  },

  /**
   * Master deletion method: deletes storage data, firestore data, clears local storage,
   * deletes the Firebase Auth account, and signs out.
   * @param {import('firebase/auth').User} [user]
   * @returns {Promise<void>}
   */
  async deleteEverything(user) {
    const currentUser = user || auth.currentUser;
    if (!currentUser) throw new Error('User must be signed in to perform account deletion.');

    const userId = currentUser.uid;

    // Step 1: Delete all user storage data
    await this.deleteStorageData(userId);

    // Step 2: Delete all user Firestore data
    await this.deleteFirestoreData(userId);

    // Step 3: Clear local storage cache / preferences
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove = [
          'flinok-language',
          'flinok-theme',
          'flinokSupportRequests',
          'flinok_recent_searches',
          'buyer_saved_properties'
        ];
        keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      }
    } catch (err) {
      console.warn('[AccountDeletionService] Non-fatal error clearing localStorage:', err);
    }

    // Step 4: Delete the Firebase Auth user account
    await this.deleteFirebaseUser(currentUser);

    // Step 5: Ensure sign out
    try {
      await logoutUser({ uid: userId });
    } catch (_) {
      // User is already deleted, ignore signout error
    }
  }
};

export default AccountDeletionService;
