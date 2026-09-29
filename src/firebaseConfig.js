// Zinoo – Firebase Configuration & SDK Initialization
import { getApp, getApps, initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";
import {
  browserPopupRedirectResolver,
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  initializeAuth
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, initializeFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { authTrace, sanitizeAuthDiagnosticMessage } from "./utils/authDiagnostics.js";

const isLocalDevelopmentHost = typeof window !== 'undefined'
  && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const firebaseConfig = {
  apiKey: "AIzaSyDNbtexxjQhhxtjc9kGmlqm1cMyN3W-t84",
  // Keep this aligned with the authoritative Firebase Web app SDK config.
  // The custom public domain can host the app without replacing Auth's domain.
  authDomain: "druvio.firebaseapp.com",
  projectId: "druvio",
  storageBucket: "druvio.firebasestorage.app",
  messagingSenderId: "23103959226",
  appId: "1:23103959226:web:7a333301896a8e5bce9283",
  measurementId: "G-JY2H8DJQW4"
};
export const firebaseProjectId = firebaseConfig.projectId;
export const firebaseConfigDiagnostics = Object.freeze({
  apiKey: Boolean(firebaseConfig.apiKey),
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: Boolean(firebaseConfig.messagingSenderId),
  appId: Boolean(firebaseConfig.appId)
});

// Initialize Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
if (app.options.projectId !== firebaseConfig.projectId) {
  throw new Error(`Firebase project mismatch: expected ${firebaseConfig.projectId}, received ${app.options.projectId || 'missing'}.`);
}

// Initialize Auth before dependent Firebase services. localStorage keeps the
// session durable across reloads without the IndexedDB adapter's pagehide /
// visibility-close race during OAuth redirects.
let authInstance;
if (typeof window === 'undefined') {
  authInstance = getAuth(app);
} else try {
  authInstance = initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver
  });
  authTrace('Firebase Auth initialized', {
    mode: 'initializeAuth',
    requestedPersistence: ['localStorage'],
    authDomain: firebaseConfig.authDomain,
    origin: window.location.origin,
    localDevelopmentAuthDomain: isLocalDevelopmentHost
  });
} catch (error) {
  authTrace('Firebase Auth initialization ERROR', {
    name: error?.name || 'Error',
    code: error?.code || 'unknown',
    message: sanitizeAuthDiagnosticMessage(error?.message),
    fallback: 'getAuth',
    authDomain: firebaseConfig.authDomain,
    localDevelopmentAuthDomain: isLocalDevelopmentHost
  });
  authInstance = getAuth(app);
}

// Keep account authorization server-backed. Persistent Firestore caching can
// retain an old "missing" users/{uid} result across permission changes and
// incorrectly downgrade an Admin/Seller account to Buyer mode.
const firestoreSettings = {
  // Let the SDK choose the compatible fallback transport when a network
  // cannot sustain Firestore's normal streaming listener.
  experimentalAutoDetectLongPolling: true
};
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, firestoreSettings, "default");
} catch (_) {
  firestoreInstance = getFirestore(app, "default");
}
let marketingFirestoreInstance;
try {
  marketingFirestoreInstance = initializeFirestore(app, firestoreSettings, "(default)");
} catch (_) {
  marketingFirestoreInstance = getFirestore(app, "(default)");
}

// Export individual Firebase services
export const auth = authInstance;
// Enterprise database: marketplace, accounts, leads, and all primary data.
export const db = firestoreInstance;
// Standard database: approved WhatsApp templates, campaigns, and recipients.
export const marketingDb = marketingFirestoreInstance;
export const functions = getFunctions(app, "us-central1");
export const storage = getStorage(app);
const viteEnv = import.meta.env || {};
// Opt-in only: local verification must never redirect ordinary development or
// production traffic away from the configured Firebase project.
const useEmulators = viteEnv.DEV && viteEnv.VITE_USE_FIREBASE_EMULATORS === 'true';
// Preserve this export for login modules retained during Vite hot reload.
// Localhost alone never enables emulation.
export const usesFirebaseEmulators = useEmulators;
if (useEmulators) {
  const emulatorHost = viteEnv.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorHost, 8080);
  connectFunctionsEmulator(functions, emulatorHost, 5001);
  connectStorageEmulator(storage, emulatorHost, 9199);
}
export let analytics = null;
export let performance = null;
if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
  const initializeAnalytics = async () => {
    if (!navigator.onLine) return;
    try {
      const { getAnalytics } = await import('firebase/analytics');
      analytics = getAnalytics(app);
    } catch (_) {
      // Analytics is optional and must never delay or interrupt startup.
    }
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(initializeAnalytics, { timeout: 2500 });
  else window.setTimeout(initializeAnalytics, 1200);

  const initializePerformance = async () => {
    if (!navigator.onLine) return;
    try {
      const { getPerformance } = await import('firebase/performance');
      performance = getPerformance(app);
    } catch (_) {
      // Performance Monitoring is optional and must never interrupt startup.
    }
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(initializePerformance, { timeout: 2500 });
  else window.setTimeout(initializePerformance, 1200);
}

export default app;
