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
| `app/` | expo-router route files. Each is a 1-line re-export of a screen. `_layout.tsx` sets the theme + renders the tab bar. |
| `screens/` | The actual screen components (`home-screen.tsx`, `walk-screen.tsx`, `stories-screen.tsx`, `family-screen.tsx`). |
| `components/` | Reusable UI: `ghaf-tree`, `score-bar`, `app-tabs` (+ `.web`), plus the starter template's themed primitives. |
| `hooks/` | Data hooks that pick **live Firestore** or **mock data** automatically based on `isFirebaseConfigured`. |
| `services/` | The only files that touch Firebase / device APIs. See below. |
| `logic/` | Pure functions, no I/O. `khutwaScore.ts` — the whole scoring model. |
| `data/` | Static content: `locations.ts` (curated sites), `stories.ts` (pre-generated narration cache), `mock.ts` (dev fallback). |
| `types/` | `models.ts` — the shape of every Firestore document. Single source of truth. |
| `config/` | `env.ts` — reads secrets from `app.json > expo.extra`, never hard-coded. |

## Services

| Service | Wraps | Key functions |
|---|---|---|
| `firebase.ts` | `firebase/app`, `firebase/auth`, `firebase/firestore` | `createFamily`, `findFamilyForUser`, `subscribeToTreeState`, `writeTreeState`, `setBlooming`, `listMemories`, `unlockMemory`, `syncDailySteps` |
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

## What's still stubbed (see commit plan / TODOs in code)

- Real sign-in screen (hooks already react to `onAuthStateChanged`).
- Firestore seed + security rules deploy (`scripts/seed-firestore.ts`, `docs/firestore.rules`).
- `data/stories.ts` filled with reviewed narration for all curated sites.
- Persisting the Family screen's `shareLocation` toggle to Firestore.
- Weekly metric aggregation feeding `computeKhutwaScore` (a Cloud Function or an
  on-device roll-up).
