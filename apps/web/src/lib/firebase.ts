// ============================================================================
// Firebase Client SDK — initialized once, used throughout the app
// Falls back to DEMO MODE when credentials are not configured.
// ============================================================================

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True when Firebase env vars are not set — app runs with mock data */
export const isDemoMode =
  !firebaseConfig.apiKey || firebaseConfig.apiKey === '';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
  if (isDemoMode) {
    console.warn(
      '[TeeSync] No Firebase credentials found — running in DEMO MODE with mock data.'
    );
    return null;
  }
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }
  auth = getAuth(app);
  db = getFirestore(app);
  return { app, auth, db };
}

export function getFirebaseApp() {
  if (isDemoMode) return null as unknown as FirebaseApp;
  if (!app) initializeFirebase();
  return app;
}

export function getFirebaseAuth() {
  if (isDemoMode) return null as unknown as Auth;
  if (!auth) initializeFirebase();
  return auth;
}

export function getFirebaseDb() {
  if (isDemoMode) return null as unknown as Firestore;
  if (!db) initializeFirebase();
  return db;
}
