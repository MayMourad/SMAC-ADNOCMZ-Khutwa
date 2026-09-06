/**
 * Mock data for UI development
 * ===========================
 *
 * Used ONLY when Firebase isn't configured yet (`isFirebaseConfigured === false`)
 * so the whole app is browsable while May sets up the backend. The hooks in
 * `src/hooks/` swap this out for live Firestore data automatically once the
 * config is present. Nothing here ships to a configured build.
 */

import { computeKhutwaScore } from '@/logic/khutwaScore';
import type { Family, Memory, TreeState } from '@/types/models';
import { CURATED_LOCATIONS } from './locations';
import { PREGENERATED_STORIES } from './stories';

export const MOCK_FAMILY: Family = {
  id: 'mock-family',
  inviteCode: 'GHAF-2026',
  createdAt: Date.parse('2026-08-01T09:00:00Z'),
  members: [
    {
      uid: 'mock-may',
      displayName: 'May',
      role: 'guardian',
      shareLocation: true,
      joinedAt: Date.parse('2026-08-01T09:00:00Z'),
    },
    {
      uid: 'mock-shamsa',
      displayName: 'Shamsa',
      role: 'member',
      shareLocation: true,
      joinedAt: Date.parse('2026-08-02T18:30:00Z'),
    },
  ],
};

/** A plausible mid-progress week so the tree shows something interesting. */
const MOCK_METRICS = {
  root: { familySteps: 5200, activeMinutes: 34, coMovementSessions: 1 },
  bloom: { memoryUnlocks: 2, storyContributions: 1, togetherMoments: 2 },
  heritage: { sitesVisited: 3, storiesPreserved: 2 },
};

export function buildMockTree(): TreeState {
  const s = computeKhutwaScore(MOCK_METRICS);
  return {
    familyId: MOCK_FAMILY.id,
    khutwaScore: s.khutwaScore,
    rootScore: s.rootScore,
    bloomScore: s.bloomScore,
    heritageScore: s.heritageScore,
    growthStage: s.growthStage,
    isBlooming: false,
    updatedAt: Date.now(),
  };
}

export const MOCK_MEMORIES: Memory[] = CURATED_LOCATIONS.map((loc, i) => ({
  id: loc.id,
  label: loc.label,
  lat: loc.lat,
  lng: loc.lng,
  radiusM: loc.radiusM,
  heritageAngle: loc.heritageAngle,
  storyText: PREGENERATED_STORIES[loc.id]?.['en-AE'] ?? '',
  audioUrl: null,
  // Pretend the first three have been unlocked already.
  unlockedBy: i < 3 ? 'mock-may' : null,
  unlockedAt: i < 3 ? Date.now() - i * 86_400_000 : null,
}));
