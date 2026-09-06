/**
 * useAuth
 * =======
 *
 * Exposes the current signed-in member. When Firebase isn't configured yet it
 * returns a stable fake user so the rest of the app is usable for UI work.
 *
 * TEAM TODO: build a real sign-in screen (Email/Password or Anonymous) that
 * calls `signInWithEmailAndPassword` / `signInAnonymously` from firebase/auth.
 * This hook already reacts to that via `onAuthStateChanged`.
 */

import { useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/config/env';

export interface AuthUser {
  uid: string;
  displayName: string;
}

const FAKE_USER: AuthUser = { uid: 'mock-may', displayName: 'May' };

export function useAuth(): { user: AuthUser | null; loading: boolean } {
  const [user, setUser] = useState<AuthUser | null>(
    isFirebaseConfigured ? null : FAKE_USER,
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    // Import lazily so an unconfigured project never touches firebase/auth.
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      import('@/services/firebase').then(({ auth }) => {
        const unsub = onAuthStateChanged(auth, (fbUser) => {
          if (cancelled) return;
          setUser(
            fbUser
              ? { uid: fbUser.uid, displayName: fbUser.displayName ?? 'Member' }
              : null,
          );
          setLoading(false);
        });
        // store unsub on cleanup
        return unsub;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
