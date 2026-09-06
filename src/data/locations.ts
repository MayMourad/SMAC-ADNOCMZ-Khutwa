/**
 * Curated heritage locations
 * ==========================
 *
 * The 5–10 real UAE places tied to the family's story (see docs/locations for
 * the narrative rationale). Each one becomes:
 *   - a `Memory` document in Firestore (seed with scripts/seed-firestore.ts),
 *   - a geofence region handed to LocationService,
 *   - a key in `data/stories.ts` for the pre-generated narration.
 *
 * COORDINATES ARE APPROXIMATE landmark centres. Before the demo, walk each site
 * (or check a map) and tighten `lat`/`lng`/`radiusM` so the geofence triggers
 * where you actually want it to. Radius 120 m is a sensible default for a large
 * landmark; drop to ~60 m for a small, precise spot.
 */

export interface CuratedLocation {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusM: number;
  heritageAngle: string;
}

export const CURATED_LOCATIONS: CuratedLocation[] = [
  {
    id: 'qasr-al-hosn',
    label: 'Qasr Al Hosn',
    lat: 24.4817,
    lng: 54.3547,
    radiusM: 120,
    heritageAngle:
      'Oldest stone building in the city — the watchtower that watched generations of families arrive.',
  },
  {
    id: 'sheikh-zayed-grand-mosque',
    label: 'Sheikh Zayed Grand Mosque',
    lat: 24.4128,
    lng: 54.475,
    radiusM: 150,
    heritageAngle:
      'A shared moment of awe and pride — first-family-visit memories, Eid gatherings.',
  },
  {
    id: 'abu-dhabi-corniche',
    label: 'Abu Dhabi Corniche',
    lat: 24.475,
    lng: 54.332,
    radiusM: 140,
    heritageAngle:
      "A generational walking spot — grandparents' evening strolls, and today's family walks.",
  },
  {
    id: 'heritage-village',
    label: 'Heritage Village',
    lat: 24.479,
    lng: 54.333,
    radiusM: 110,
    heritageAngle:
      'Pre-oil daily life — the majlis, storytelling, grandparents teaching grandchildren.',
  },
  {
    id: 'umm-al-emarat-park',
    label: 'Umm Al Emarat Park',
    lat: 24.4515,
    lng: 54.376,
    radiusM: 120,
    heritageAngle:
      "Everyday family park memories — picnics, and a child's first bike ride.",
  },
  {
    id: 'founders-memorial',
    label: "Founder's Memorial",
    lat: 24.4193,
    lng: 54.477,
    radiusM: 110,
    heritageAngle:
      "Sheikh Zayed's family values — the 'father of the nation' framing ties straight to the family-bonds theme.",
  },
  {
    id: 'al-maqta-fort',
    label: 'Al Maqta Fort',
    lat: 24.403,
    lng: 54.506,
    radiusM: 90,
    heritageAngle:
      'The old bridge crossing between island and mainland — families reuniting.',
  },
  {
    id: 'al-bateen-dhow-yard',
    label: 'Al Bateen Dhow Yard',
    lat: 24.446,
    lng: 54.33,
    radiusM: 100,
    heritageAngle:
      'Maritime heritage — pearling-era family livelihoods and passed-down trades.',
  },
];

/** Look up one curated location by id. */
export const getLocation = (id: string): CuratedLocation | undefined =>
  CURATED_LOCATIONS.find((l) => l.id === id);
