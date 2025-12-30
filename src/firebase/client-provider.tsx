'use client';

import { ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<{
    firebaseApp: any;
    auth: any;
    firestore: any;
  } | null>(null);

  useEffect(() => {
    // 🔒 Ensure client-only execution
    if (typeof window === 'undefined') return;

    try {
      // Lazy import to avoid build-time execution
      const { initializeFirebase } = require('@/firebase');
      const initialized = initializeFirebase();

      // If Firebase failed silently, don't crash
      if (
        !initialized ||
        !initialized.firebaseApp ||
        !initialized.auth ||
        !initialized.firestore
      ) {
        console.warn('Firebase initialized with missing services.');
        setServices(null);
        return;
      }

      setServices(initialized);
    } catch (err) {
      // ❗ Never throw — build must NEVER fail
      console.warn('Firebase initialization skipped:', err);
      setServices(null);
    }
  }, []);

  // ⛔ During build / hydration → render nothing
  if (!services) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
