'use client';

import React, {
  DependencyList,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/* ---------------------------------------------------------------- */
/* Types                                                            */
/* ---------------------------------------------------------------- */

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/* ---------------------------------------------------------------- */
/* Context                                                          */
/* ---------------------------------------------------------------- */

export const FirebaseContext = createContext<FirebaseContextState>({
  areServicesAvailable: false,
  firebaseApp: null,
  firestore: null,
  auth: null,
  user: null,
  isUserLoading: false,
  userError: null,
});

/* ---------------------------------------------------------------- */
/* Provider                                                         */
/* ---------------------------------------------------------------- */

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: false,
    userError: null,
  });

  // 🔐 Subscribe to auth ONLY if auth exists
  useEffect(() => {
    if (!auth) {
      setUserAuthState({
        user: null,
        isUserLoading: false,
        userError: null,
      });
      return;
    }

    setUserAuthState({
      user: null,
      isUserLoading: true,
      userError: null,
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserAuthState({
          user: firebaseUser,
          isUserLoading: false,
          userError: null,
        });
      },
      (error) => {
        console.warn('Firebase auth listener error:', error);
        setUserAuthState({
          user: null,
          isUserLoading: false,
          userError: error,
        });
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo<FirebaseContextState>(() => {
    const servicesAvailable = Boolean(firebaseApp && firestore && auth);

    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp,
      firestore,
      auth,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/* ---------------------------------------------------------------- */
/* Hooks — SAFE (NEVER THROW)                                        */
/* ---------------------------------------------------------------- */

export const useFirebase = (): FirebaseServicesAndUser => {
  return useContext(FirebaseContext);
};

export const useAuth = (): Auth | null => {
  return useContext(FirebaseContext).auth;
};

export const useFirestore = (): Firestore | null => {
  return useContext(FirebaseContext).firestore;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  return useContext(FirebaseContext).firebaseApp;
};

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useContext(FirebaseContext);
  return { user, isUserLoading, userError };
};

/* ---------------------------------------------------------------- */
/* Optional helper                                                   */
/* ---------------------------------------------------------------- */

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(
  factory: () => T,
  deps: DependencyList
): T | MemoFirebase<T> {
  const memoized = useMemo(factory, deps);

  if (typeof memoized === 'object' && memoized !== null) {
    (memoized as MemoFirebase<T>).__memo = true;
  }

  return memoized;
};
