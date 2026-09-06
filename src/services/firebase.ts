/**
 * Firebase service
 * ================
 *
 * Single place where the Firebase app, Auth, and Firestore are created, plus
 * small typed helpers for reading/writing our four collections.
 *
 * We use the plain `firebase` JS SDK (not @react-native-firebase) because the
 * project runs in Expo's managed workflow / Expo Go, which the JS SDK supports
 * with no native build step.
 *
 * WHAT THE TEAM STILL NEEDS TO DO:
 *   1. Create a Firebase project, enable Email/Password (or Anonymous) auth and
 *      Cloud Firestore.
 *   2. Put the web app config into app.json > expo.extra.firebase (see config/env.ts).
 *   3. Add Firestore security rules so a member can only read/write their own
 *      family's documents (draft rules in docs/firestore.rules).
 *
 * Everything below is real, working plumbing — only the credentials are missing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
// @ts-expect-error – getReactNativePersistence is exported by firebase/auth at
// runtime but is missing from the published types in firebase 12.x.
import { getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
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
import type {
  DailyStepEntry,
  EpochMillis,
  Family,
  Memory,
  TreeState,
} from '@/types/models';

// ---------------------------------------------------------------------------
// App / Auth / Firestore singletons
// ---------------------------------------------------------------------------

/** Re-use the app across Fast Refresh reloads instead of re-initialising. */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * `initializeAuth` with AsyncStorage persistence keeps the user signed in
 * between app launches on device. On web we let Firebase pick its default.
 */
export const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db: Firestore = getFirestore(app);

// ---------------------------------------------------------------------------
// Timestamp <-> epoch-millis helpers
// ---------------------------------------------------------------------------

export const toMillis = (ts: Timestamp | number): EpochMillis =>
  ts instanceof Timestamp ? ts.toMillis() : ts;

export const fromMillis = (ms: EpochMillis): Timestamp => Timestamp.fromMillis(ms);

// ---------------------------------------------------------------------------
// Collection references (typed by name only — Firestore has no generics here)
// ---------------------------------------------------------------------------

const familiesCol = collection(db, 'families');
const memoriesCol = collection(db, 'memories');
const treeDoc = (familyId: string) => doc(db, 'treeState', familyId);
const stepsCol = (familyId: string) => collection(db, 'families', familyId, 'steps');

// ---------------------------------------------------------------------------
// Family
// ---------------------------------------------------------------------------

/** Create a new family with the given first member as guardian. */
export async function createFamily(
  input: Omit<Family, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(familiesCol, {
    ...input,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getFamily(familyId: string): Promise<Family | null> {
  const snap = await getDoc(doc(familiesCol, familyId));
  if (!snap.exists()) return null;
  const raw = snap.data();
  return { id: snap.id, ...raw, createdAt: toMillis(raw.createdAt) } as Family;
}

/** Find the family a user belongs to by scanning member uids. */
export async function findFamilyForUser(uid: string): Promise<Family | null> {
  // Firestore can't query "array of objects contains uid" directly, so we keep a
  // flat `memberUids` mirror array on the family doc for this lookup.
  const q = query(familiesCol, where('memberUids', 'array-contains', uid));
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
  return onSnapshot(doc(familiesCol, familyId), (snap) => {
    if (!snap.exists()) return onChange(null);
    const raw = snap.data();
    onChange({ id: snap.id, ...raw, createdAt: toMillis(raw.createdAt) } as Family);
  });
}

// ---------------------------------------------------------------------------
// Tree state
// ---------------------------------------------------------------------------

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
// Memories
// ---------------------------------------------------------------------------

export async function listMemories(): Promise<Memory[]> {
  const snap = await getDocs(memoriesCol);
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
export async function unlockMemory(
  memoryId: string,
  uid: string,
): Promise<void> {
  const ref = doc(memoriesCol, memoryId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().unlockedAt) return; // first unlock wins
  await updateDoc(ref, { unlockedBy: uid, unlockedAt: Timestamp.now() });
}

export function subscribeToMemories(
  onChange: (memories: Memory[]) => void,
): () => void {
  return onSnapshot(memoriesCol, (snap) => {
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
