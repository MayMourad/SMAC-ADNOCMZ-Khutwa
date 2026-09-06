import { describe, expect, it } from '@jest/globals';

import type { DailyStepEntry, Memory, WeekStats } from '@/types/models';
import { aggregateWeek, isWithinWindow, isoDaysAgo, WINDOW_DAYS } from './aggregateWeek';

const NOW = Date.parse('2026-09-06T12:00:00Z');
const DAY = 86_400_000;

const step = (uid: string, date: string, steps: number): DailyStepEntry => ({
  uid,
  date,
  steps,
  source: 'manual',
  syncedAt: NOW,
});

const memory = (id: string, unlockedAt: number | null, storyText = 'a story'): Memory => ({
  id,
  label: id,
  lat: 0,
  lng: 0,
  radiusM: 100,
  heritageAngle: '',
  storyText,
  audioUrl: null,
  unlockedBy: unlockedAt ? 'u1' : null,
  unlockedAt,
});

const stats: WeekStats = {
  togetherMoments: 2,
  coMovementSessions: 1,
  activeMinutes: 40,
  storyContributions: 1,
  weekStartedOn: isoDaysAgo(3, NOW),
  updatedAt: NOW,
};

describe('isoDaysAgo / isWithinWindow', () => {
  it('formats an ISO date N days back', () => {
    expect(isoDaysAgo(0, NOW)).toBe('2026-09-06');
    expect(isoDaysAgo(7, NOW)).toBe('2026-08-30');
  });

  it('window is the last 7 calendar days', () => {
    expect(isWithinWindow('2026-09-06', NOW)).toBe(true);
    expect(isWithinWindow('2026-08-30', NOW)).toBe(true);
    expect(isWithinWindow('2026-08-29', NOW)).toBe(false);
  });
});

describe('aggregateWeek', () => {
  const steps = [
    step('may', '2026-09-06', 3000),
    step('shamsa', '2026-09-05', 2500),
    step('may', '2026-08-20', 9999), // outside the window — ignored
  ];
  const memories = [
    memory('qasr-al-hosn', NOW - 2 * DAY), // unlocked this week
    memory('corniche', NOW - 30 * DAY), // unlocked long ago
    memory('locked-site', null), // still locked
    memory('no-story', NOW - 20 * DAY, ''), // unlocked long ago, no story text
  ];

  const result = aggregateWeek({ steps, memories, stats, now: NOW });

  it('sums only in-window family steps', () => {
    expect(result.root.familySteps).toBe(5500);
  });

  it('passes week-stat counters into root and bloom', () => {
    expect(result.root.activeMinutes).toBe(40);
    expect(result.root.coMovementSessions).toBe(1);
    expect(result.bloom.togetherMoments).toBe(2);
    expect(result.bloom.storyContributions).toBe(1);
  });

  it('counts memory unlocks only within the window', () => {
    expect(result.bloom.memoryUnlocks).toBe(1);
  });

  it('counts all-time distinct sites visited', () => {
    expect(result.heritage.sitesVisited).toBe(3); // qasr, corniche, no-story
  });

  it('counts stories preserved as unlocked memories that have text', () => {
    expect(result.heritage.storiesPreserved).toBe(2); // qasr + corniche
  });

  it('WINDOW_DAYS is 7', () => {
    expect(WINDOW_DAYS).toBe(7);
  });
});
