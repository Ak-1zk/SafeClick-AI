'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initialize Firebase ONLY on the client.
 * Prevents Next.js build / prerender crashes.
 */
export function initializeFirebase() {
  // ⛔ Do NOT initialize Firebase on the server
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      // Try automatic initialization (Firebase App Hosting / prod)
      firebaseApp = initializeApp();
    } catch (error) {
      // Fallback to manual config (local dev / Vercel)
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic Firebase initialization failed. Falling back to firebaseConfig.',
          error
        );
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

/**
 * Safely return Firebase SDKs
 */
export function getSdks(firebaseApp: FirebaseApp): {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

// Re-exports (unchanged)
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

