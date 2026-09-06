/**
 * scoreSync
 * =========
 *
 * Closes the loop: read the week's raw activity from Firestore, aggregate it,
 * compute the Khutwa Score, and write `treeState/{familyId}`.
 *
 *   recomputeTree(familyId)
 *     -> listStepsSince + listMemories + getWeekStats
 *     -> aggregateWeek()            (pure, logic/aggregateWeek.ts)
 *     -> computeKhutwaScore()       (pure, logic/khutwaScore.ts)
 *     -> writeTreeState()
 *
 * Call it after anything that changes the inputs: a memory unlock, a "together"
 * check-in, a step sync. It's cheap and idempotent — safe to over-call.
 *
 * In mock mode (no Firebase) it's a no-op; the mock tree in `data/mock.ts` is
 * already computed from `computeKhutwaScore`.
 */

import { isFirebaseConfigured } from '@/config/env';
import { aggregateWeek, isoDaysAgo } from '@/logic/aggregateWeek';
import { computeKhutwaScore } from '@/logic/khutwaScore';
import type { TreeState } from '@/types/models';

import {
  getTreeState,
  getWeekStats,
  listMemories,
  listStepsSince,
  writeTreeState,
} from './firebase';

export async function recomputeTree(familyId: string): Promise<TreeState | null> {
  if (!isFirebaseConfigured) return null;

  const [steps, memories, stats, prev] = await Promise.all([
    listStepsSince(familyId, isoDaysAgo(7)),
    listMemories(),
    getWeekStats(familyId),
    getTreeState(familyId),
  ]);

  const inputs = aggregateWeek({ steps, memories, stats });
  const breakdown = computeKhutwaScore(inputs);

  const next: TreeState = {
    familyId,
    khutwaScore: breakdown.khutwaScore,
    rootScore: breakdown.rootScore,
    bloomScore: breakdown.bloomScore,
    heritageScore: breakdown.heritageScore,
    growthStage: breakdown.growthStage,
    // keep the transient bloom flag the Walk screen manages
    isBlooming: prev?.isBlooming ?? false,
    updatedAt: Date.now(),
  };

  await writeTreeState(next);
  return next;
}
