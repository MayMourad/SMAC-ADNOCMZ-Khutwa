/**
 * unlock-all-memories.ts  —  DEV-ONLY, run by hand
 * ===============================================
 *
 * Marks every doc in the `memories` collection as unlocked, so the Stories
 * screen shows all narrations. Use this for the demo build / submission video
 * where you can't physically walk to each location to unlock it.
 *
 * In the real app a memory unlocks when a family walks into its geofence
 * (LocationService -> unlockMemory). This script just fast-forwards that for
 * a demo. Re-runnable; it only touches docs that are still locked.
 *
 * Usage:
 *   npx tsx scripts/unlock-all-memories.ts
 *
 * Reads the Firebase config from app.json and signs in anonymously so the
 * writes satisfy docs/firestore.rules (signed-in user may update memories).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { collection, getDocs, getFirestore, Timestamp, updateDoc } from 'firebase/firestore';

function loadFirebaseConfig() {
  const appJson = JSON.parse(readFileSync(join(__dirname, '..', 'app.json'), 'utf8'));
  const cfg = appJson?.expo?.extra?.firebase ?? {};
  const missing = ['apiKey', 'projectId', 'appId'].filter((k) => !cfg[k]);
  if (missing.length) {
    throw new Error(`app.json > expo.extra.firebase is missing: ${missing.join(', ')}.`);
  }
  return cfg;
}

async function main() {
  const config = loadFirebaseConfig();
  const app = getApps().length ? getApps()[0] : initializeApp(config);
  const { user } = await signInAnonymously(getAuth(app));
  const db = getFirestore(app);

  const snap = await getDocs(collection(db, 'memories'));
  if (snap.empty) {
    console.log('No memories found — run scripts/seed-firestore.ts first.');
    return;
  }

  let unlocked = 0;
  let already = 0;
  for (const d of snap.docs) {
    if (d.data().unlockedAt) {
      already++;
      console.log(`  memories/${d.id}   already unlocked`);
      continue;
    }
    await updateDoc(d.ref, { unlockedBy: user.uid, unlockedAt: Timestamp.now() });
    unlocked++;
    console.log(`  memories/${d.id}   unlocked`);
  }

  console.log(`\nDone — ${unlocked} unlocked, ${already} were already unlocked.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nUnlock failed:', err?.message ?? err);
    process.exit(1);
  });
