/**
 * useMemories
 * ===========
 *
 * The list of curated location memories, kept live. Falls back to MOCK_MEMORIES
 * when Firebase isn't configured.
 */

import { useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/config/env';
import { MOCK_MEMORIES } from '@/data/mock';
import type { Memory } from '@/types/models';

export function useMemories(): Memory[] {
  const [memories, setMemories] = useState<Memory[]>(
    isFirebaseConfigured ? [] : MOCK_MEMORIES,
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    let unsub = () => {};
    import('@/services/firebase').then((svc) => {
      unsub = svc.subscribeToMemories((list) => !cancelled && setMemories(list));
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return memories;
}
