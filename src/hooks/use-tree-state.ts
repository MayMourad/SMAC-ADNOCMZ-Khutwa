/**
 * useTreeState
 * ============
 *
 * The family's shared Ghaf tree, kept live. Falls back to a computed mock tree
 * when Firebase isn't configured.
 *
 * The `bloom(on)` function flips the transient "together" state. On a configured
 * project it writes to Firestore so every family member's tree blooms at once;
 * on the mock it just updates local state.
 */

import { useCallback, useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/config/env';
import { buildMockTree } from '@/data/mock';
import type { TreeState } from '@/types/models';

export function useTreeState(familyId: string | null): {
  tree: TreeState | null;
  loading: boolean;
  bloom: (on: boolean) => void;
} {
  const [tree, setTree] = useState<TreeState | null>(
    isFirebaseConfigured ? null : buildMockTree(),
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !familyId) return;
    let cancelled = false;
    let unsub = () => {};
    import('@/services/firebase').then((svc) => {
      unsub = svc.subscribeToTreeState(familyId, (t) => {
        if (cancelled) return;
        setTree(t);
        setLoading(false);
      });
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [familyId]);

  const bloom = useCallback(
    (on: boolean) => {
      setTree((prev) => (prev ? { ...prev, isBlooming: on } : prev));
      if (isFirebaseConfigured && familyId) {
        import('@/services/firebase').then((svc) => svc.setBlooming(familyId, on));
      }
    },
    [familyId],
  );

  return { tree, loading, bloom };
}
