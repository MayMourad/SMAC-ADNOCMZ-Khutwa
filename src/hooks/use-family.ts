/**
 * useFamily
 * =========
 *
 * The current user's family group, kept live. Falls back to MOCK_FAMILY when
 * Firebase isn't configured.
 */

import { useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/config/env';
import { MOCK_FAMILY } from '@/data/mock';
import type { Family } from '@/types/models';

export function useFamily(uid: string | null): {
  family: Family | null;
  loading: boolean;
} {
  const [family, setFamily] = useState<Family | null>(
    isFirebaseConfigured ? null : MOCK_FAMILY,
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !uid) return;
    let unsub = () => {};
    let cancelled = false;

    (async () => {
      const svc = await import('@/services/firebase');
      const found = await svc.findFamilyForUser(uid);
      if (cancelled) return;
      setFamily(found);
      setLoading(false);
      if (found) {
        unsub = svc.subscribeToFamily(found.id, (f) => !cancelled && setFamily(f));
      }
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, [uid]);

  return { family, loading };
}
