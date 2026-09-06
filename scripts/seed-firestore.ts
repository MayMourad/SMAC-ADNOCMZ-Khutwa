/**
 * seed-firestore.ts  —  DEV-ONLY, run by hand
 * ==========================================
 *
 * Writes the curated locations + their reviewed stories into the `memories`
 * collection so a fresh Firebase project has content to unlock.
 *
 * Usage:
 *   1. Fill app.json > expo.extra.firebase with your project's web config.
 *   2. Enable Anonymous sign-in in the Firebase console (Authentication).
 *   3. Publish docs/firestore.rules (they let a signed-in user create memories).
 *   4. Put any reviewed narration into src/data/stories.ts.
 *   5. npx tsx scripts/seed-firestore.ts
 *
 * Reads the Firebase config straight from app.json (not via expo-constants,
 * which only exists inside a running Expo app). Signs in anonymously so the
 * writes satisfy the security rules. Safe to re-run — it upserts by slug id.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';

import { CURATED_LOCATIONS } from '../src/data/locations';
import { PREGENERATED_STORIES } from '../src/data/stories';

function loadFirebaseConfig() {
  const appJson = JSON.parse(
    readFileSync(join(__dirname, '..', 'app.json'), 'utf8'),
  );
  const cfg = appJson?.expo?.extra?.firebase ?? {};
  const missing = ['apiKey', 'projectId', 'appId'].filter((k) => !cfg[k]);
  if (missing.length) {
    throw new Error(
      `app.json > expo.extra.firebase is missing: ${missing.join(', ')}. ` +
        'Fill it in (see docs/firebase-setup.md) and re-run.',
    );
  }
  return cfg;
}

async function main() {
  const config = loadFirebaseConfig();
  const app = getApps().length ? getApps()[0] : initializeApp(config);

  // Writes need an authenticated principal per docs/firestore.rules.
  await signInAnonymously(getAuth(app));
  const db = getFirestore(app);

  let withStory = 0;
  for (const loc of CURATED_LOCATIONS) {
    const story = PREGENERATED_STORIES[loc.id]?.['en-AE'] ?? '';
    if (story) withStory++;
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
    console.log(`  seeded memories/${loc.id}${story ? '' : '   (no story yet)'}`);
  }

  console.log(
    `\nDone — ${CURATED_LOCATIONS.length} locations (${withStory} with a story).` +
      '\nSign in from the app to create your family + tree.',
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nSeed failed:', err?.message ?? err);
    const code = String(err?.code ?? '');
    if (code.includes('configuration-not-found')) {
      console.error('→ Enable Anonymous sign-in in the Firebase console (Authentication).');
    } else if (code.includes('permission-denied')) {
      console.error('→ Publish docs/firestore.rules (Firestore console → Rules → Publish).');
    } else if (code.includes('unavailable') || code.includes('not-found')) {
      console.error('→ Create the Firestore (default) database (Firestore console → Create database).');
    }
    process.exit(1);
  });
