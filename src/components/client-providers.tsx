'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase } from '@/firebase';

export function FirebaseClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase only in the browser
    initializeFirebase();
    setReady(true);
  }, []);

  // 🔥 DO NOT THROW — EVER
  // During build or hydration, Firebase may not be ready
  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
