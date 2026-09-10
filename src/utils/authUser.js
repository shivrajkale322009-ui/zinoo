import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { authFailureDetails, authTrace } from './authDiagnostics.js';

export async function ensureUserDoc(db, user) {
  authTrace('USER_PROFILE_LOAD_START', { flow: 'profile', sdk: 'firebase/firestore', uidPresent: Boolean(user?.uid) });
  try {
    const ref = doc(db, 'users', user.uid);
    const result = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (snap.exists()) return { profile: snap.data(), existing: true };

      const profile = {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        permissions: { buyer: true, seller: false, admin: false },
        createdAt: serverTimestamp()
      };
      transaction.set(ref, profile);
      return { profile, existing: false };
    });
    authTrace('USER_PROFILE_LOAD_SUCCESS', { flow: 'profile', sdk: 'firebase/firestore', existing: result.existing });
    return result.profile;
  } catch (error) {
    authTrace('USER_PROFILE_LOAD_FAILED', authFailureDetails(error, { flow: 'profile', sdk: 'firebase/firestore' }));
    throw error;
  }
}
