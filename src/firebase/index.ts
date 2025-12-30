'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Initialize Firebase ONLY on the client.
 * This file MUST NEVER throw — even with missing env vars.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
} {
  // ⛔ Never run Firebase on the server
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  let firebaseApp: FirebaseApp | null = null;

  try {
    if (!getApps().length) {
      // 🔹 Attempt automatic initialization (Firebase App Hosting)
      try {
        firebaseApp = initializeApp();
      } catch {
        // 🔹 Manual fallback (Vercel / local)
        const { firebaseConfig } = require('@/firebase/config');

        // If config is missing, silently skip
        if (!firebaseConfig || !firebaseConfig.apiKey) {
          console.warn('Firebase config missing. Skipping Firebase init.');
          return {
            firebaseApp: null,
            auth: null,
            firestore: null,
          };
        }

        firebaseApp = initializeApp(firebaseConfig);
      }
    } else {
      firebaseApp = getApp();
    }

    // 🔐 Safely return SDKs
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp),
    };
  } catch (err) {
    // ❗ NEVER throw — this prevents build crashes
    console.warn('Firebase initialization failed safely:', err);

    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }
}

/* ------------------------------------------------ */
/* Re-exports (safe — do not modify)                 */
/* ------------------------------------------------ */

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

