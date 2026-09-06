/**
 * Khutwa data model
 * =================
 *
 * Every document we store in Firestore has a matching TypeScript type here.
 * Keep this file as the single source of truth: if the shape of a Firestore
 * document changes, change it here first, then follow the compiler errors.
 *
 * Firestore layout (collections are lowercase plural, one document per entity):
 *
 *   families/{familyId}                      -> Family
 *   families/{familyId}/steps/{yyyy-mm-dd}   -> DailyStepEntry   (one per member per day, see id note below)
 *   treeState/{familyId}                     -> TreeState        (one tree per family, so we reuse familyId as the doc id)
 *   memories/{memoryId}                      -> Memory
 *
 * We deliberately keep the tree as its own top-level collection (`treeState`)
 * rather than nesting it under the family, because the home-screen widget reads
 * ONLY the tree and we don't want it to pull the whole family document.
 */

/**
 * Firestore stores dates as its own Timestamp type. In app code we mostly work
 * with epoch milliseconds (a plain number) because it is trivial to compare and
 * serialise. `services/firebase.ts` has helpers to convert both ways.
 */
export type EpochMillis = number;

/** An ISO calendar date with no time part, e.g. "2026-09-06". Used as a step-doc id. */
export type IsoDate = string;

// ---------------------------------------------------------------------------
// Family + members
// ---------------------------------------------------------------------------

/** What a member is allowed to do. Guardians can manage privacy for everyone. */
export type FamilyRole = 'guardian' | 'member';

export interface FamilyMember {
  /** Firebase Auth uid. Also the key we use anywhere a member is referenced. */
  uid: string;
  /** Shown on the Family screen and in "unlocked by" labels. */
  displayName: string;
  role: FamilyRole;
  /**
   * Privacy switch (see the Privacy & Safety section of the brief).
   * When false, this member's device never contributes location to the family:
   * no geofence check-ins, no "together" detection. Steps still count.
   * A guardian controls this flag for members whose role is 'member'.
   */
  shareLocation: boolean;
  /** When this member joined the family group. */
  joinedAt: EpochMillis;
}

export interface Family {
  /** Firestore document id (auto-generated). */
  id: string;
  /** Short human-typeable code used to invite the second/third member. */
  inviteCode: string;
  /** All linked members. Kept as an array because a family is tiny (2–3 people). */
  members: FamilyMember[];
  /**
   * Flat mirror of `members[].uid`. Firestore can't query "array of objects
   * contains value", so this powers `findFamilyForUser` (array-contains) and the
   * security rules. Always write it alongside `members`.
   */
  memberUids: string[];
  createdAt: EpochMillis;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

/** Where a step count came from. Real builds prefer the platform health store. */
export type StepSource = 'healthkit' | 'googlefit' | 'expo-pedometer' | 'manual';

/**
 * One member's step total for one calendar day.
 * Document id convention: `${uid}_${isoDate}` so re-syncing the same day
 * overwrites instead of duplicating.
 */
export interface DailyStepEntry {
  uid: string;
  date: IsoDate;
  steps: number;
  source: StepSource;
  /** Last time this row was written by the member's device. */
  syncedAt: EpochMillis;
}

// ---------------------------------------------------------------------------
// Tree state
// ---------------------------------------------------------------------------

/**
 * Visible growth stages of the shared Ghaf tree. `growthStageFromScore()` in
 * `logic/khutwaScore.ts` maps a composite score onto one of these.
 * The Home screen picks the tree artwork purely from this string.
 */
export type GrowthStage =
  | 'seed'
  | 'sprout'
  | 'sapling'
  | 'young'
  | 'mature'
  | 'ancient';

export interface TreeState {
  /** Same value as the owning family's id (one tree per family). */
  familyId: string;

  /** Composite 0–100 score. Derived, but stored so the widget can read one field. */
  khutwaScore: number;

  /** The three sub-scores that feed the composite (each 0–100). */
  rootScore: number; // health: steps, active minutes, co-movement sessions
  bloomScore: number; // bonding: memory unlocks, story contributions, together-moments
  heritageScore: number; // culture: heritage sites visited, stories preserved

  growthStage: GrowthStage;

  /**
   * True while family members are currently physically together (or checked in
   * together). Drives the "together bloom" visual. This is transient state that
   * `LocationService` / the Walk screen flips on and off.
   */
  isBlooming: boolean;

  updatedAt: EpochMillis;
}

// ---------------------------------------------------------------------------
// Memories (location-tied stories)
// ---------------------------------------------------------------------------

/**
 * A place tied to a family memory. The team curates 5–10 of these up front
 * (see `docs/locations`). Each carries a pre-generated, reviewed story that is
 * cached on-device, so the demo never depends on live inference or internet.
 */
export interface Memory {
  /** Firestore document id. Also the `locationId` used by LocationService. */
  id: string;

  /** Short label shown in lists, e.g. "Qasr Al Hosn". */
  label: string;

  /** Geofence centre + trigger radius in metres (typically 80–150 m). */
  lat: number;
  lng: number;
  radiusM: number;

  /**
   * The heritage / family-bonding angle the story leans on. This is the seed
   * we give the LLM when pre-generating (kept so the prompt log is complete).
   */
  heritageAngle: string;

  /** The reviewed, pre-generated narration text. Spoken via expo-speech. */
  storyText: string;

  /** Optional pre-rendered narration audio. Null for MVP (we use device TTS). */
  audioUrl: string | null;

  /** uid of the member whose device first entered the geofence, or null if locked. */
  unlockedBy: string | null;
  /** When it was unlocked, or null if still locked. */
  unlockedAt: EpochMillis | null;
}

// ---------------------------------------------------------------------------
// Convenience view-model types (not stored — assembled in the app)
// ---------------------------------------------------------------------------

/** Everything the Home screen needs in one object. */
export interface HomeViewModel {
  family: Family;
  tree: TreeState;
  unlockedCount: number;
  totalMemories: number;
}
