# Khutwa — Firestore data model

The TypeScript types live in `src/types/models.ts`. This doc explains the
collection layout, the id conventions, and the one non-obvious field.

## Collections

```
families/{familyId}                      -> Family
families/{familyId}/steps/{uid}_{date}   -> DailyStepEntry
treeState/{familyId}                     -> TreeState        (doc id == familyId)
memories/{memoryId}                      -> Memory
```

### families/{familyId} — `Family`

| Field | Type | Notes |
|---|---|---|
| `inviteCode` | string | Short code (e.g. `GHAF-2026`) shown on the Family screen. |
| `members` | `FamilyMember[]` | 2–3 entries. Each: `uid`, `displayName`, `role` (`guardian`\|`member`), `shareLocation`, `joinedAt`. |
| `memberUids` | `string[]` | **Mirror of `members[].uid`.** Firestore can't do "array of objects contains value", so this flat array powers `findFamilyForUser` via `array-contains`. Keep it in sync whenever `members` changes. |
| `createdAt` | Timestamp | |

### families/{familyId}/steps/{uid}_{date} — `DailyStepEntry`

One row per member per calendar day. Doc id `${uid}_${date}` (date = `YYYY-MM-DD`)
so re-syncing the same day overwrites instead of duplicating.

| Field | Type | Notes |
|---|---|---|
| `uid` | string | |
| `date` | string | ISO date, also in the doc id. Queried with `where('date', '>=', since)`. |
| `steps` | number | |
| `source` | `'healthkit'\|'googlefit'\|'expo-pedometer'\|'manual'` | |
| `syncedAt` | Timestamp | |

### treeState/{familyId} — `TreeState`

One tree per family, so we reuse `familyId` as the document id (no lookup needed).
The Home widget reads only this document.

| Field | Type | Notes |
|---|---|---|
| `familyId` | string | Same as doc id. |
| `khutwaScore` | number | 0–100 composite. Stored (not just derived) so the widget reads one field. |
| `rootScore` / `bloomScore` / `heritageScore` | number | 0–100 sub-scores. |
| `growthStage` | `GrowthStage` | `seed\|sprout\|sapling\|young\|mature\|ancient`. Drives the tree art. |
| `isBlooming` | boolean | Transient "family is together right now" flag. Toggled from the Walk screen. |
| `updatedAt` | Timestamp | |

### memories/{memoryId} — `Memory`

Curated place + its pre-generated story. Seed from `src/data/locations.ts` +
`src/data/stories.ts` via `scripts/seed-firestore.ts`. Doc id = the location's
slug (e.g. `qasr-al-hosn`), which is also the `locationId` LocationService uses.

| Field | Type | Notes |
|---|---|---|
| `label` | string | e.g. "Qasr Al Hosn". |
| `lat` / `lng` / `radiusM` | number | Geofence centre + trigger radius. |
| `heritageAngle` | string | The bonding/heritage seed for the story prompt. |
| `storyText` | string | Reviewed narration. Spoken via device TTS. |
| `audioUrl` | string \| null | Null for MVP. |
| `unlockedBy` | string \| null | uid of the first member to arrive. |
| `unlockedAt` | Timestamp \| null | Null while locked. First unlock wins. |

## Indexes

- `families`: single-field `array-contains` on `memberUids` (automatic).
- `families/*/steps`: single-field range on `date` (automatic).
- No composite indexes needed for the MVP queries.

## Access rules

See `docs/firestore.rules`. Summary: a signed-in user can read/write a family
document and its sub-collections only if their uid is in that family's
`memberUids`; `memories` are readable by any signed-in user and writable only for
the `unlockedBy` / `unlockedAt` fields.
