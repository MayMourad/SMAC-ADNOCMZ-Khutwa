/**
 * seed-firestore.ts  —  DEV-ONLY, run by hand
 * ==========================================
 *
 * Writes the curated locations + their reviewed stories into the `memories`
 * collection so a fresh Firebase project has content to unlock.
 *
 * Usage:
 *   1. Fill app.json > expo.extra.firebase with your project's web config.
 *   2. Make sure `src/data/stories.ts` has the reviewed narration.
 *   3. `npx tsx scripts/seed-firestore.ts`
 *
 * Safe to re-run: it uses `setDoc` with the location slug as the id, so it
 * upserts rather than duplicating.
 */

import { doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';

import { firebaseConfig } from '../src/config/env';
import { CURATED_LOCATIONS } from '../src/data/locations';
import { PREGENERATED_STORIES } from '../src/data/stories';

async function main() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  for (const loc of CURATED_LOCATIONS) {
    const story = PREGENERATED_STORIES[loc.id]?.['en-AE'] ?? '';
    await setDoc(doc(db, 'memories', loc.id), {
      label: loc.label,
      lat: loc.lat,
      lng: loc.lng,
      radiusM: loc.radiusM,
      heritageAngle: loc.heritageAngle,
      storyText: story,
      audioUrl: null,
      unlockedBy: null,
      unlockedAt: null,
      seededAt: Timestamp.now(),
    });
    console.log(`seeded memories/${loc.id}${story ? '' : '  (no story yet)'}`);
  }

  console.log('\nDone. Add a family + treeState from the app once you sign in.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
