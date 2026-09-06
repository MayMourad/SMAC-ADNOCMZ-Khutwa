/**
 * Weekly aggregation
 * ==================
 *
 * `computeKhutwaScore` (khutwaScore.ts) needs three tidy input bundles. This
 * file builds those bundles from the raw things we actually store:
 *
 *   - step rows            (families/{id}/steps)     -> familySteps
 *   - memory documents     (memories)                -> memoryUnlocks, sitesVisited, storiesPreserved
 *   - a small week-stats   (families/{id}/stats/week) -> the counters we can't
 *     derive after the fact (together-moments, co-movement sessions, active
 *     minutes, story contributions)
 *
 * Pure: no Firebase, no React. `services/scoreSync.ts` does the I/O and calls
 * this. Everything is measured over a rolling 7-day window ending "now".
 */

import type { DailyStepEntry, Memory, WeekStats } from '@/types/models';
import type { BloomInputs, HeritageInputs, RootInputs } from './khutwaScore';

export const WINDOW_DAYS = 7;
const DAY_MS = 86_400_000;

/** ISO date (YYYY-MM-DD) for `days` days before `now`. Used to query step rows. */
export function isoDaysAgo(days: number, now: number = Date.now()): string {
  return new Date(now - days * DAY_MS).toISOString().slice(0, 10);
}

/** True if an ISO date string falls inside the last `WINDOW_DAYS` days. */
export function isWithinWindow(iso: string, now: number = Date.now()): boolean {
  return iso >= isoDaysAgo(WINDOW_DAYS, now);
}

export function aggregateWeek(input: {
  steps: DailyStepEntry[];
  memories: Memory[];
  stats: WeekStats;
  now?: number;
}): { root: RootInputs; bloom: BloomInputs; heritage: HeritageInputs } {
  const { steps, memories, stats, now = Date.now() } = input;

  // --- Root: movement ----------------------------------------------------
  const familySteps = steps
    .filter((s) => isWithinWindow(s.date, now))
    .reduce((sum, s) => sum + (s.steps || 0), 0);

  // --- Bloom: bonding --------------------------------------------------
  const memoryUnlocks = memories.filter(
    (m) => m.unlockedAt != null && m.unlockedAt >= now - WINDOW_DAYS * DAY_MS,
  ).length;

  // --- Heritage: culture (all-time, not just this week) --------------
  const unlocked = memories.filter((m) => m.unlockedAt != null);
  const sitesVisited = new Set(unlocked.map((m) => m.id)).size;
  // For the MVP an unlocked-and-reviewed memory == a "story preserved".
  const storiesPreserved = unlocked.filter((m) => m.storyText.trim().length > 0).length;

  return {
    root: {
      familySteps,
      activeMinutes: stats.activeMinutes,
      coMovementSessions: stats.coMovementSessions,
    },
    bloom: {
      memoryUnlocks,
      storyContributions: stats.storyContributions,
      togetherMoments: stats.togetherMoments,
    },
    heritage: { sitesVisited, storiesPreserved },
  };
}
