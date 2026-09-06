/**
 * Firebase service
 * ================
 *
 * Single place where the Firebase app, Auth, and Firestore are created, plus
 * small typed helpers for reading/writing our four collections and the auth
 * actions the sign-in flow needs.
 *
 * We use the plain `firebase` JS SDK (not @react-native-firebase) because the
 * project runs in Expo's managed workflow / Expo Go, which the JS SDK supports
 * with no native build step.
 *
 * LAZY INIT: nothing here runs at import time. `firebaseApp/Auth/Db()` create
 * their instance on first use. This matters because Expo's static web export
 * pre-renders routes in Node, where the React-Native-only auth persistence
 * helper doesn't exist — so we only touch Firebase when a screen actually calls
 * one of these functions.
 *
 * WHAT THE TEAM STILL NEEDS TO DO:
 *   1. Create a Firebase project (see docs/firebase-setup.md).
 *   2. Put the web config into app.json > expo.extra.firebase.
 *   3. Publish docs/firestore.rules in the Firestore console.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  // @ts-expect-error – getReactNativePersistence is exported by firebase/auth at
  // runtime (native build) but is missing from the published types in firebase 12.
  getReactNativePersistence,
  initializeAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';

import { firebaseConfig } from '@/config/env';
import { isoDaysAgo } from '@/logic/aggregateWeek';
import { growthStageFromScore } from '@/logic/khutwaScore';
import {
  EMPTY_WEEK_STATS,
  type DailyStepEntry,
  type EpochMillis,
  type Family,
  type FamilyMember,
  type Memory,
  type TreeState,
  type WeekStats,
} from '@/types/models';

type WeekStatKey = keyof typeof EMPTY_WEEK_STATS;

// ---------------------------------------------------------------------------
// Lazy singletons
// ---------------------------------------------------------------------------

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

function firebaseApp(): FirebaseApp {
  return (_app ??= getApps().length ? getApp() : initializeApp(firebaseConfig));
}

/** Auth instance. On device it persists the session via AsyncStorage. */
export function firebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth =
    Platform.OS === 'web'
      ? getAuth(firebaseApp())
      : initializeAuth(firebaseApp(), {
          persistence: getReactNativePersistence(AsyncStorage),
        });
  return _auth;
}

export function firebaseDb(): Firestore {
  return (_db ??= getFirestore(firebaseApp()));
}

// ---------------------------------------------------------------------------
// Auth actions
// ---------------------------------------------------------------------------
//
// Two ways in: anonymous (one tap, good for a demo) or email/password (so the
// same person can sign in on a second device). `useAuth()` listens for the
// result via onAuthStateChanged, so screens just call these.

export async function signInAnon(): Promise<void> {
  await signInAnonymously(firebaseAuth());
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(
    firebaseAuth(),
    email.trim(),
    password,
  );
  if (displayName.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<void> {
  await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth());
}

// ---------------------------------------------------------------------------
// Timestamp <-> epoch-millis helpers
// ---------------------------------------------------------------------------

export const toMillis = (ts: Timestamp | number): EpochMillis =>
  ts instanceof Timestamp ? ts.toMillis() : ts;

export const fromMillis = (ms: EpochMillis): Timestamp => Timestamp.fromMillis(ms);

// ---------------------------------------------------------------------------
// Collection references (functions, so nothing runs before firebaseDb() is ready)
// ---------------------------------------------------------------------------

const familiesCol = () => collection(firebaseDb(), 'families');
const memoriesCol = () => collection(firebaseDb(), 'memories');
const treeDoc = (familyId: string) => doc(firebaseDb(), 'treeState', familyId);
const stepsCol = (familyId: string) =>
  collection(firebaseDb(), 'families', familyId, 'steps');
const weekStatsDoc = (familyId: string) =>
  doc(firebaseDb(), 'families', familyId, 'stats', 'week');

// ---------------------------------------------------------------------------
// Family
// ---------------------------------------------------------------------------

/** Human-typeable invite code, e.g. "GHAF-7QK2". Avoids ambiguous chars. */
export function makeInviteCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let tail = '';
  for (let i = 0; i < 4; i++) {
    tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `GHAF-${tail}`;
}

/**
 * Low-level create. Prefer `bootstrapFamily` from the app — it also creates the
 * tree document so the Home screen has something to read.
 */
export async function createFamily(
  input: Omit<Family, 'id' | 'createdAt' | 'memberUids'>,
): Promise<string> {
  const ref = await addDoc(familiesCol(), {
    ...input,
    memberUids: input.members.map((m) => m.uid),
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

/**
 * Create a brand-new family for `uid` (as guardian) plus its starting tree.
 * Returns the new familyId.
 */
export async function bootstrapFamily(
  uid: string,
  displayName: string,
): Promise<string> {
  const founder: FamilyMember = {
    uid,
    displayName: displayName.trim() || 'Member',
    role: 'guardian',
    shareLocation: true,
    joinedAt: Date.now(),
  };
  const familyId = await createFamily({
    inviteCode: makeInviteCode(),
    members: [founder],
  });
  await initTreeState(familyId);
  await getWeekStats(familyId); // creates the week-stats doc with zeros
  return familyId;
}

/**
 * Add `uid` to the family that owns `inviteCode`. Throws if the code is unknown
 * or the family is already full (3 members).
 */
export async function joinFamilyByCode(
  inviteCode: string,
  uid: string,
  displayName: string,
): Promise<string> {
  const q = query(
    familiesCol(),
    where('inviteCode', '==', inviteCode.trim().toUpperCase()),
  );
  const snap = await getDocs(q);
  const found = snap.docs[0];
  if (!found) throw new Error('That invite code does not match any family.');

  const family = found.data() as Family;
  if (family.members.some((m) => m.uid === uid)) return found.id; // already in
  if (family.members.length >= 3) throw new Error('This family is already full.');

  const member: FamilyMember = {
    uid,
    displayName: displayName.trim() || 'Member',
    role: 'member',
    shareLocation: true,
    joinedAt: Date.now(),
  };
  await updateDoc(found.ref, {
    members: [...family.members, member],
    memberUids: [...family.memberUids, uid],
  });
  return found.id;
}

/** Toggle one member's location-sharing flag (read-modify-write the array). */
export async function setMemberShareLocation(
  familyId: string,
  uid: string,
  shareLocation: boolean,
): Promise<void> {
  const ref = doc(familiesCol(), familyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const members = (snap.data().members as FamilyMember[]).map((m) =>
    m.uid === uid ? { ...m, shareLocation } : m,
  );
  await updateDoc(ref, { members });
}

export async function getFamily(familyId: string): Promise<Family | null> {
  const snap = await getDoc(doc(familiesCol(), familyId));
  if (!snap.exists()) return null;
  const raw = snap.data();
  return { id: snap.id, ...raw, createdAt: toMillis(raw.createdAt) } as Family;
}

/** Find the family a user belongs to via the flat `memberUids` mirror array. */
export async function findFamilyForUser(uid: string): Promise<Family | null> {
  const q = query(familiesCol(), where('memberUids', 'array-contains', uid));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  const raw = first.data();
  return { id: first.id, ...raw, createdAt: toMillis(raw.createdAt) } as Family;
}

export function subscribeToFamily(
  familyId: string,
  onChange: (family: Family | null) => void,
): () => void {
  return onSnapshot(doc(familiesCol(), familyId), (snap) => {
    if (!snap.exists()) return onChange(null);
    const raw = snap.data();
    onChange({ id: snap.id, ...raw, createdAt: toMillis(raw.createdAt) } as Family);
  });
}

// ---------------------------------------------------------------------------
// Tree state
// ---------------------------------------------------------------------------

/** Create the starting tree document for a new family (all scores at 0). */
export async function initTreeState(familyId: string): Promise<void> {
  const seed: TreeState = {
    familyId,
    khutwaScore: 0,
    rootScore: 0,
    bloomScore: 0,
    heritageScore: 0,
    growthStage: growthStageFromScore(0),
    isBlooming: false,
    updatedAt: Date.now(),
  };
  await setDoc(treeDoc(familyId), { ...seed, updatedAt: Timestamp.now() });
}

export async function getTreeState(familyId: string): Promise<TreeState | null> {
  const snap = await getDoc(treeDoc(familyId));
  if (!snap.exists()) return null;
  const raw = snap.data();
  return { ...raw, updatedAt: toMillis(raw.updatedAt) } as TreeState;
}

/** Overwrite the whole tree document (used after recomputing the score). */
export async function writeTreeState(state: TreeState): Promise<void> {
  await setDoc(treeDoc(state.familyId), {
    ...state,
    updatedAt: Timestamp.now(),
  });
}

/** Flip just the transient "together bloom" flag without touching the score. */
export async function setBlooming(
  familyId: string,
  isBlooming: boolean,
): Promise<void> {
  await updateDoc(treeDoc(familyId), { isBlooming, updatedAt: Timestamp.now() });
}

export function subscribeToTreeState(
  familyId: string,
  onChange: (tree: TreeState | null) => void,
): () => void {
  return onSnapshot(treeDoc(familyId), (snap) => {
    if (!snap.exists()) return onChange(null);
    const raw = snap.data();
    onChange({ ...raw, updatedAt: toMillis(raw.updatedAt) } as TreeState);
  });
}

// ---------------------------------------------------------------------------
// Week stats (rolling counters that feed the Khutwa Score)
// ---------------------------------------------------------------------------

/**
 * Read the current week-stats doc, creating it (zeroed) if missing. Also does a
 * lazy weekly reset: if the stored week started more than 7 days ago, the
 * counters are cleared and the window start is moved to today.
 */
export async function getWeekStats(familyId: string): Promise<WeekStats> {
  const ref = weekStatsDoc(familyId);
  const snap = await getDoc(ref);
  const today = new Date().toISOString().slice(0, 10);

  if (!snap.exists()) {
    const fresh: WeekStats = {
      ...EMPTY_WEEK_STATS,
      weekStartedOn: today,
      updatedAt: Date.now(),
    };
    await setDoc(ref, { ...fresh, updatedAt: Timestamp.now() });
    return fresh;
  }

  const raw = snap.data() as WeekStats;
  if (raw.weekStartedOn < isoDaysAgo(7)) {
    const reset: WeekStats = {
      ...EMPTY_WEEK_STATS,
      weekStartedOn: today,
      updatedAt: Date.now(),
    };
    await setDoc(ref, { ...reset, updatedAt: Timestamp.now() });
    return reset;
  }
  return { ...raw, updatedAt: toMillis(raw.updatedAt) };
}

/** Add `by` (default 1) to one week-stat counter. */
export async function bumpWeekStat(
  familyId: string,
  key: WeekStatKey,
  by = 1,
): Promise<void> {
  const current = await getWeekStats(familyId);
  await updateDoc(weekStatsDoc(familyId), {
    [key]: (current[key] as number) + by,
    updatedAt: Timestamp.now(),
  });
}

// ---------------------------------------------------------------------------
// Memories
// ---------------------------------------------------------------------------

export async function listMemories(): Promise<Memory[]> {
  const snap = await getDocs(memoriesCol());
  return snap.docs.map((d) => {
    const raw = d.data();
    return {
      id: d.id,
      ...raw,
      unlockedAt: raw.unlockedAt ? toMillis(raw.unlockedAt) : null,
    } as Memory;
  });
}

/** Mark a memory as unlocked by a member. No-op if it was already unlocked. */
export async function unlockMemory(memoryId: string, uid: string): Promise<void> {
  const ref = doc(memoriesCol(), memoryId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().unlockedAt) return; // first unlock wins
  await updateDoc(ref, { unlockedBy: uid, unlockedAt: Timestamp.now() });
}

export function subscribeToMemories(
  onChange: (memories: Memory[]) => void,
): () => void {
  return onSnapshot(memoriesCol(), (snap) => {
    onChange(
      snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          unlockedAt: raw.unlockedAt ? toMillis(raw.unlockedAt) : null,
        } as Memory;
      }),
    );
  });
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

/** Upsert one member's step total for one day. Doc id keeps it idempotent. */
export async function syncDailySteps(
  familyId: string,
  entry: DailyStepEntry,
): Promise<void> {
  await setDoc(doc(stepsCol(familyId), `${entry.uid}_${entry.date}`), {
    ...entry,
    syncedAt: Timestamp.now(),
  });
}

export async function listStepsSince(
  familyId: string,
  sinceIsoDate: string,
): Promise<DailyStepEntry[]> {
  const q = query(stepsCol(familyId), where('date', '>=', sinceIsoDate));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const raw = d.data();
    return { ...raw, syncedAt: toMillis(raw.syncedAt) } as DailyStepEntry;
  });
}
