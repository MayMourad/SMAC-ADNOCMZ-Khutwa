/**
 * Khutwa Score
 * ============
 *
 * One number (0–100) that says how alive the family's shared Ghaf tree is.
 * It is the average of three sub-scores, each also 0–100:
 *
 *   Root Score      – health   – are we moving? (steps, active minutes, walking together)
 *   Bloom Score     – bonding  – are we sharing? (memories unlocked, stories added, moments together)
 *   Heritage Score  – culture  – are we connecting to place? (heritage sites visited, stories preserved)
 *
 *   Khutwa Score = Root * 0.40  +  Bloom * 0.35  +  Heritage * 0.25
 *
 * WHY THESE WEIGHTS: the competition theme is "AI for Stronger Family Bonds",
 * so bonding + culture together (0.60) outweigh raw fitness (0.40). Movement is
 * the *occasion* for bonding, not the goal — the weights encode that idea.
 *
 * HOW EACH SUB-SCORE IS BUILT:
 *   - Every input metric has a "target" — the amount that counts as a full day's
 *     contribution for that metric (e.g. 8000 family steps).
 *   - We take metric / target, cap it at 1 (you can't bank more than 100%),
 *     multiply by that metric's weight, add them up, and scale to 0–100.
 *   - So each sub-score is a transparent weighted percentage. No magic curves.
 *
 * This file is pure: no Firebase, no React, no side effects. That makes it easy
 * to unit test and easy to explain in the Q&A. See docs/khutwa-score.md for a
 * fully worked numeric example.
 */

import type { GrowthStage } from '@/types/models';

// ---------------------------------------------------------------------------
// Tunable constants — the whole scoring model lives here
// ---------------------------------------------------------------------------

/** How much each sub-score contributes to the composite Khutwa Score. Must sum to 1. */
export const SUBSCORE_WEIGHTS = {
  root: 0.4,
  bloom: 0.35,
  heritage: 0.25,
} as const;

/**
 * Root Score inputs. Targets are per DAY (the app rolls a 7-day window before
 * calling this — see logic/aggregateWeek.ts once the team writes it).
 */
export const ROOT_MODEL = {
  /** Combined steps of all family members in the window. */
  familySteps: { target: 8000, weight: 0.5 },
  /** Minutes where any member was actively walking (from health data). */
  activeMinutes: { target: 60, weight: 0.3 },
  /** Sessions where 2+ members walked together (co-located + both moving). */
  coMovementSessions: { target: 2, weight: 0.2 },
} as const;

/** Bloom Score inputs. */
export const BLOOM_MODEL = {
  /** Location stories unlocked by walking near them. */
  memoryUnlocks: { target: 3, weight: 0.4 },
  /** Voice notes / written memories a family member added to a location. */
  storyContributions: { target: 2, weight: 0.3 },
  /** Distinct "together" moments (tree bloomed because members were co-located). */
  togetherMoments: { target: 3, weight: 0.3 },
} as const;

/** Heritage Score inputs. */
export const HERITAGE_MODEL = {
  /** Distinct curated heritage sites the family has visited at least once. */
  sitesVisited: { target: 5, weight: 0.6 },
  /** Stories preserved (reviewed + saved to the family archive). */
  storiesPreserved: { target: 5, weight: 0.4 },
} as const;

// ---------------------------------------------------------------------------
// Input shapes
// ---------------------------------------------------------------------------

export interface RootInputs {
  familySteps: number;
  activeMinutes: number;
  coMovementSessions: number;
}

export interface BloomInputs {
  memoryUnlocks: number;
  storyContributions: number;
  togetherMoments: number;
}

export interface HeritageInputs {
  sitesVisited: number;
  storiesPreserved: number;
}

export interface KhutwaScoreBreakdown {
  rootScore: number;
  bloomScore: number;
  heritageScore: number;
  khutwaScore: number;
  growthStage: GrowthStage;
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/** Keep a number inside [min, max]. */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Turn a set of {value, target, weight} metrics into a 0–100 sub-score.
 * Each metric contributes at most `weight` (as a fraction of 1); the sum is
 * scaled to 0–100 and rounded. Guards against target <= 0.
 */
function weightedPercentage(
  metrics: { value: number; target: number; weight: number }[],
): number {
  const fraction = metrics.reduce((sum, m) => {
    if (m.target <= 0) return sum;
    const ratio = Math.min(1, Math.max(0, m.value / m.target));
    return sum + ratio * m.weight;
  }, 0);
  return Math.round(clamp(fraction * 100));
}

// ---------------------------------------------------------------------------
// Sub-scores
// ---------------------------------------------------------------------------

export function rootScore(inputs: RootInputs): number {
  return weightedPercentage([
    { value: inputs.familySteps, ...ROOT_MODEL.familySteps },
    { value: inputs.activeMinutes, ...ROOT_MODEL.activeMinutes },
    { value: inputs.coMovementSessions, ...ROOT_MODEL.coMovementSessions },
  ]);
}

export function bloomScore(inputs: BloomInputs): number {
  return weightedPercentage([
    { value: inputs.memoryUnlocks, ...BLOOM_MODEL.memoryUnlocks },
    { value: inputs.storyContributions, ...BLOOM_MODEL.storyContributions },
    { value: inputs.togetherMoments, ...BLOOM_MODEL.togetherMoments },
  ]);
}

export function heritageScore(inputs: HeritageInputs): number {
  return weightedPercentage([
    { value: inputs.sitesVisited, ...HERITAGE_MODEL.sitesVisited },
    { value: inputs.storiesPreserved, ...HERITAGE_MODEL.storiesPreserved },
  ]);
}

// ---------------------------------------------------------------------------
// Composite + growth stage
// ---------------------------------------------------------------------------

/**
 * Combine three already-computed sub-scores into the composite Khutwa Score.
 * Kept separate from `computeKhutwaScore` so the UI can also call it with
 * scores it already has (e.g. animating a change).
 */
export function compositeScore(sub: {
  rootScore: number;
  bloomScore: number;
  heritageScore: number;
}): number {
  return Math.round(
    clamp(
      sub.rootScore * SUBSCORE_WEIGHTS.root +
        sub.bloomScore * SUBSCORE_WEIGHTS.bloom +
        sub.heritageScore * SUBSCORE_WEIGHTS.heritage,
    ),
  );
}

/**
 * Map a composite score onto a visible tree stage. Thresholds are spaced so the
 * early stages come quickly (encouraging) and the last stage is genuinely hard.
 */
export function growthStageFromScore(khutwaScore: number): GrowthStage {
  const s = clamp(khutwaScore);
  if (s < 10) return 'seed';
  if (s < 25) return 'sprout';
  if (s < 45) return 'sapling';
  if (s < 65) return 'young';
  if (s < 85) return 'mature';
  return 'ancient';
}

// ---------------------------------------------------------------------------
// One-call entry point
// ---------------------------------------------------------------------------

/**
 * Compute everything at once from raw family metrics.
 * This is what a Cloud Function (or the app, for MVP) calls before writing
 * `treeState/{familyId}`.
 */
export function computeKhutwaScore(inputs: {
  root: RootInputs;
  bloom: BloomInputs;
  heritage: HeritageInputs;
}): KhutwaScoreBreakdown {
  const root = rootScore(inputs.root);
  const bloom = bloomScore(inputs.bloom);
  const heritage = heritageScore(inputs.heritage);
  const khutwaScore = compositeScore({
    rootScore: root,
    bloomScore: bloom,
    heritageScore: heritage,
  });

  return {
    rootScore: root,
    bloomScore: bloom,
    heritageScore: heritage,
    khutwaScore,
    growthStage: growthStageFromScore(khutwaScore),
  };
}
