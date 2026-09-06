/**
 * Tests for the Khutwa Score model.
 * Run with:  npm test
 *
 * The "worked example" numbers come straight from docs/khutwa-score.md — if you
 * change a target or weight in khutwaScore.ts, update both the doc and this file.
 */

import { describe, expect, it } from '@jest/globals';

import {
  bloomScore,
  clamp,
  compositeScore,
  computeKhutwaScore,
  growthStageFromScore,
  heritageScore,
  rootScore,
} from './khutwaScore';

describe('clamp', () => {
  it('keeps values inside 0–100 by default', () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(50)).toBe(50);
    expect(clamp(150)).toBe(100);
  });
});

describe('sub-scores (mock.ts inputs → docs worked example)', () => {
  it('rootScore', () => {
    expect(rootScore({ familySteps: 5200, activeMinutes: 34, coMovementSessions: 1 })).toBe(60);
  });

  it('bloomScore', () => {
    expect(bloomScore({ memoryUnlocks: 2, storyContributions: 1, togetherMoments: 2 })).toBe(62);
  });

  it('heritageScore', () => {
    expect(heritageScore({ sitesVisited: 3, storiesPreserved: 2 })).toBe(52);
  });

  it('caps each metric at its target (no banking over 100%)', () => {
    expect(
      rootScore({ familySteps: 999999, activeMinutes: 999, coMovementSessions: 99 }),
    ).toBe(100);
  });

  it('is 0 for all-zero input', () => {
    expect(rootScore({ familySteps: 0, activeMinutes: 0, coMovementSessions: 0 })).toBe(0);
  });
});

describe('compositeScore', () => {
  it('weights root 0.40 / bloom 0.35 / heritage 0.25', () => {
    expect(compositeScore({ rootScore: 60, bloomScore: 62, heritageScore: 52 })).toBe(59);
  });

  it('is 100 when every sub-score is 100', () => {
    expect(compositeScore({ rootScore: 100, bloomScore: 100, heritageScore: 100 })).toBe(100);
  });
});

describe('growthStageFromScore', () => {
  it('maps score bands to stages', () => {
    expect(growthStageFromScore(0)).toBe('seed');
    expect(growthStageFromScore(9)).toBe('seed');
    expect(growthStageFromScore(10)).toBe('sprout');
    expect(growthStageFromScore(24)).toBe('sprout');
    expect(growthStageFromScore(25)).toBe('sapling');
    expect(growthStageFromScore(44)).toBe('sapling');
    expect(growthStageFromScore(45)).toBe('young');
    expect(growthStageFromScore(59)).toBe('young');
    expect(growthStageFromScore(65)).toBe('mature');
    expect(growthStageFromScore(85)).toBe('ancient');
    expect(growthStageFromScore(100)).toBe('ancient');
  });
});

describe('computeKhutwaScore (end to end)', () => {
  it('matches the worked example', () => {
    const result = computeKhutwaScore({
      root: { familySteps: 5200, activeMinutes: 34, coMovementSessions: 1 },
      bloom: { memoryUnlocks: 2, storyContributions: 1, togetherMoments: 2 },
      heritage: { sitesVisited: 3, storiesPreserved: 2 },
    });
    expect(result).toEqual({
      rootScore: 60,
      bloomScore: 62,
      heritageScore: 52,
      khutwaScore: 59,
      growthStage: 'young',
    });
  });
});
