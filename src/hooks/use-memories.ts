/**
 * useMemories
 * ===========
 *
 * The list of curated location memories, kept live. Falls back to MOCK_MEMORIES
 * when Firebase isn't configured.
 *
 * Waits for a signed-in user before subscribing — the `memories` read rule
 * requires auth, and attaching the listener before auth restores would throw a
 * transient permission error on every cold load.
 */

import { useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/config/env';
import { MOCK_MEMORIES } from '@/data/mock';
import { useAuth } from '@/hooks/use-auth';
import type { Memory } from '@/types/models';

export function useMemories(): Memory[] {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>(
    isFirebaseConfigured ? [] : MOCK_MEMORIES,
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    let cancelled = false;
    let unsub = () => {};
    import('@/services/firebase').then((svc) => {
      if (cancelled) return;
      unsub = svc.subscribeToMemories((list) => !cancelled && setMemories(list));
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [user]);

  return memories;
}
