# Khutwa — Architecture

A one-page map of how the app is put together, so either teammate can answer
"where does X live and why" in the Q&A.

## Big picture

```
        ┌─────────────────────────────────────────────┐
        │                  UI (screens)               │
        │  Home · Walk · Stories · Family              │
        └───────────────┬─────────────────────────────┘
                        │ hooks (use-auth, use-family,
                        │        use-tree-state, use-memories)
        ┌───────────────▼─────────────────────────────┐
        │                 services                    │
        │  firebase · location · steps · speech · llm  │
        └───────────────┬─────────────────────────────┘
                        │
        ┌───────────────▼───────────┐   ┌─────────────┐
        │ Firebase (Auth+Firestore) │   │ device APIs │
        │  families / treeState /    │   │ GPS · pedo  │
        │  memories / steps          │   │ · TTS       │
        └────────────────────────────┘   └─────────────┘
```

Rule of thumb: **screens never import `firebase/*` or `expo-*` directly.** They
go through a hook or a service. That keeps each screen small and testable and
means we can swap an implementation (e.g. pedometer → HealthKit) in one file.

## Folder map (`src/`)

| Folder | What's in it |
|---|---|
| `app/` | expo-router route files. Each is a 1-line re-export of a screen. `_layout.tsx` sets the theme, keeps `<AppTabs/>` mounted, and paints `<AuthOverlay/>` on top; it also exports `ErrorBoundary`. |
| `screens/` | The screen components: `home` / `walk` / `stories` / `family`, plus `sign-in` and `family-setup` (shown by the auth overlay). |
| `components/` | Reusable UI: `ghaf-tree`, `score-bar`, `app-tabs` (+ `.web`), `auth-gate` (the `AuthOverlay`), `route-error-boundary`, plus the starter template's themed primitives. |
| `hooks/` | Data hooks that pick **live Firestore** or **mock data** automatically based on `isFirebaseConfigured`. |
| `services/` | The only files that touch Firebase / device APIs. See below. |
| `logic/` | Pure functions, no I/O, unit-tested. `khutwaScore.ts` (the scoring model) and `aggregateWeek.ts` (raw activity → score inputs over a 7-day window). |
| `data/` | Static content: `locations.ts` (curated sites), `stories.ts` (pre-generated narration cache), `mock.ts` (dev fallback). |
| `types/` | `models.ts` — the shape of every Firestore document. Single source of truth. |
| `config/` | `env.ts` — reads secrets from `app.json > expo.extra`, never hard-coded. |

## Services

| Service | Wraps | Key functions |
|---|---|---|
| `firebase.ts` | `firebase/app`, `firebase/auth`, `firebase/firestore` (lazy init) | auth: `signInAnon` / `signInWithEmail` / `signUpWithEmail` / `signOutUser`; family: `bootstrapFamily`, `joinFamilyByCode`, `findFamilyForUser`, `setMemberShareLocation`; tree: `subscribeToTreeState`, `writeTreeState`, `initTreeState`, `setBlooming`; `getWeekStats` / `bumpWeekStat`; `listMemories`, `unlockMemory`, `syncDailySteps` |
| `scoreSync.ts` | *(orchestration only)* | `recomputeTree(familyId)` — read week → `aggregateWeek` → `computeKhutwaScore` → `writeTreeState` |
| `location.ts` | `expo-location`, `expo-task-manager` | `requestPermissions`, `startGeofencing(regions)`, `stopGeofencing`, `onEnterRegion(cb)`, `distanceMeters`, `areTogether` |
| `steps.ts` | `expo-sensors` Pedometer | `readTodaySteps`, `watchSteps`, `manualSteps` |
| `speech.ts` | `expo-speech` | `narrate(text)`, `stopNarration` |
| `llm.ts` | *(no runtime network)* | `getStory(locationId, ctx)`, `buildStoryPrompt`, `STORY_PROMPT_TEMPLATE` |

## Two runtime modes

**Expo Go (quick testing):** foreground-only. Geofencing falls back to polling
`watchPositionAsync` while a screen is open. Fine for demoing the trigger while
standing near a place.

**Custom dev build (`eas build --profile development`):** real OS background
geofencing via `Location.startGeofencingAsync` + the `TaskManager` task defined
in `location.ts`. Needed for "a story is ready when you arrive" without the app
open. `startGeofencing()` picks the right path automatically.

## The AI story pipeline (important for the rubric)

1. Team curates 5–10 real locations → `data/locations.ts`.
2. `scripts/generate-stories.ts` builds a prompt per location with
   `buildStoryPrompt()` and calls **one cloud LLM, during development only**.
3. Every prompt + model + raw output is recorded in `docs/ai-prompt-log.md`.
4. Team reviews/edits each story → pastes final text into `data/stories.ts`.
5. The shipped app reads only that cache and speaks it with device TTS.
   **No LLM call happens at runtime.**

## Done

- Firebase project live (`smac-adnocmz-khutwa`), rules deployed, 8 memories seeded.
- Sign-in (email + anonymous), family create / join by invite code.
- Family `shareLocation` toggle persists to Firestore.
- Weekly aggregation (`aggregateWeek.ts`) feeds `computeKhutwaScore`; the tree
  recomputes from real activity (`scoreSync.recomputeTree`), called on Home open
  and after unlocks / "together" check-ins / manual step logs.
- 8 AI-drafted narrations in `data/stories.ts` + Firestore.

## What's still stubbed / to do

- **Story review + Arabic** — `data/stories.ts` narrations are AI-drafted, not
  team-reviewed; `ar-AE` not written.
- **`generate-stories.ts` `callModel()`** — HTTP LLM call is a stub (wire a
  provider + key only to regenerate later).
- **`recomputeTree` runs client-side** — fine for the MVP; a Cloud Function
  would own it in production (and lock `treeState` writes to `if false`).
- **Android historical steps** — `steps.ts` returns null on Android; use the
  manual entry field or wire Health Connect.
- **On-device Gemma / real-time voice / procedural tree** — deliberately out of
  scope (see `docs/idea-brief.md` "cut from MVP").
