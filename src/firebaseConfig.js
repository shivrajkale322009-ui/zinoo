// Druvio – Firebase Configuration & SDK Initialization
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDNbtexxjQhhxtjc9kGmlqm1cMyN3W-t84",
  authDomain: "druvio.firebaseapp.com",
  projectId: "druvio",
  storageBucket: "druvio.firebasestorage.app",
  messagingSenderId: "23103959226",
  appId: "1:23103959226:web:7a333301896a8e5bce9283",
  measurementId: "G-JY2H8DJQW4"
};

// Initialize Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export individual Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
