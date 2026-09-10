import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';
import { clearAuthDiagnostics } from '../utils/authDiagnostics.js';

export const MANAGED_SELLER_CONTEXT_KEY = 'flinok-managed-seller-context';

const PROFILE_CACHE_PREFIX = 'flinok:startup:profile:';
const PENDING_PROPERTY_INTENT_KEY = 'flinokPendingPropertyIntent';

const clearAuthSessionStorage = (uid) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(MANAGED_SELLER_CONTEXT_KEY);
    window.sessionStorage.removeItem(PENDING_PROPERTY_INTENT_KEY);
  } catch {
    // Restricted storage must not prevent Firebase sign-out.
  }
  try {
    if (uid) window.localStorage.removeItem(`${PROFILE_CACHE_PREFIX}${uid}`);
  } catch {
    // Restricted storage must not prevent Firebase sign-out.
  }
  clearAuthDiagnostics();
};

export const logoutUser = async ({ uid = auth.currentUser?.uid } = {}) => {
  clearAuthSessionStorage(uid);
  await signOut(auth);
};
