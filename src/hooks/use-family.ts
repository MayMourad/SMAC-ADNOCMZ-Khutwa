/**
 * useFamily
 * =========
 *
 * The current user's family group, kept live. Falls back to MOCK_FAMILY when
 * Firebase isn't configured.
 *
 * `family === null` with `loading === false` means "signed in but not in a
 * family yet" — the AuthGate shows the family-setup screen in that case.
 * Call `reload()` after creating or joining a family to pick it up.
 */

import { useCallback, useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/config/env';
import { MOCK_FAMILY } from '@/data/mock';
import type { Family } from '@/types/models';

export function useFamily(uid: string | null): {
  family: Family | null;
  loading: boolean;
  reload: () => void;
} {
  const [family, setFamily] = useState<Family | null>(
    isFirebaseConfigured ? null : MOCK_FAMILY,
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    if (!uid) {
      // No user yet (signed out) — nothing to load.
      setFamily(null);
      setLoading(false);
      return;
    }
    let unsub = () => {};
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const svc = await import('@/services/firebase');
        const found = await svc.findFamilyForUser(uid);
        if (cancelled) return;
        setFamily(found);
        setLoading(false);
        if (found) {
          unsub = svc.subscribeToFamily(found.id, (f) => !cancelled && setFamily(f));
        }
      } catch (err) {
        // Usually a transient permission error while auth settles on cold load —
        // the family subscription (once attached) recovers on its own.
        if (!cancelled) {
          console.warn('[useFamily]', (err as Error)?.message ?? err);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, [uid, nonce]);

  return { family, loading, reload };
}
