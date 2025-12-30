'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

/**
 * Listens for Firebase permission errors.
 * ✅ Client-safe
 * ✅ Build-safe
 * ✅ Never throws (prevents white screen crashes)
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error?: FirestorePermissionError) => {
      if (!error) return;

      // ❗ Log only — NEVER throw in client components
      console.warn('🔥 Firestore permission error:', {
        code: error.code,
        message: error.message,
      });

      // OPTIONAL (later if you want):
      // router.push('/login');
      // toast({ title: 'Permission denied', description: error.message });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Renders nothing
  return null;
}

