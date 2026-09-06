/**
 * useAuth
 * =======
 *
 * Exposes the current signed-in member. When Firebase isn't configured yet it
 * returns a stable fake user so the rest of the app is usable for UI work.
 *
 * The sign-in UI lives in src/screens/sign-in-screen.tsx and calls the auth
 * actions in services/firebase.ts; this hook just reflects the result via
 * `onAuthStateChanged`.
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
    let unsub = () => {};

    // Import lazily so an unconfigured / web-prerender build never inits Firebase.
    (async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const { firebaseAuth } = await import('@/services/firebase');
      unsub = onAuthStateChanged(firebaseAuth(), (fbUser) => {
        if (cancelled) return;
        setUser(
          fbUser
            ? { uid: fbUser.uid, displayName: fbUser.displayName ?? 'Member' }
            : null,
        );
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { user, loading };
}
