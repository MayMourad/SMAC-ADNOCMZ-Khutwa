# AI Usage Log — Khutwa

Per the SMAC 2026 rules, every use of an AI tool during development is recorded
here: what it was asked, which tool/model, and how the output was used. Two kinds
of usage are logged:

1. **Story generation** — prompts used to pre-generate the in-app location
   narrations (a core app feature).
2. **Development assistance** — prompts used to get coding/design help.

The team reviewed, edited, and understands all AI-assisted output. No AI tool
generated the application as a whole.

---

## Template for each entry

```
### Log N: <short title>
- Date:
- Tool / model:
- Type: story-generation | dev-assistance
- Prompt(s): <verbatim or link to the shared chat>
- What we got back: <summary>
- How it was used: <what we kept, changed, rejected, and why>
- Files touched:
```

---

### Log 1: Idea refinement and GitHub setup
- Date: 2026-09-05
- Tool / model: Claude (claude.ai)
- Type: dev-assistance
- Prompt(s): https://claude.ai/share/aaa176dc-8fd8-40ad-9b02-c63818b76071
- What we got back: a refined idea brief, MVP scope, metrics naming (Khutwa
  Score / Root / Bloom / Heritage), tech-stack recommendation, rubric alignment.
- How it was used: adopted the scoping and the metric names; wrote our own
  `docs/idea-brief.md` and `README.md` from it.
- Files touched: `README.md`, `docs/idea-brief.md`, `docs/locations`

### Log 2: Project scaffold (structure, service stubs, score logic)
- Date: 2026-09-06
- Tool / model: Claude Sonnet 5 (Claude Code)
- Type: dev-assistance
- Prompt(s): "Scaffold the Khutwa Expo app" — request covered: folder structure
  (`screens/services/components/hooks/types/logic/data`), a Firebase config stub
  + typed Firestore helpers for `families / treeState / memories / steps`, a
  4-tab bottom nav (Home / Walk / Stories / Family), a `LocationService`
  wrapping `expo-location` geofencing with an `onEnterRegion` callback and a
  foreground fallback, a `StoryService` stub (`getStory(locationId, context)`
  returning cached/placeholder text, no runtime LLM call), the Khutwa Score
  pure functions (sub-scores → composite → growth stage), data-model types, and
  supporting docs.
- What we got back: the file tree under `src/` (types, config, services, logic,
  data, hooks, components, screens), route files under `src/app/`, updated
  `app.json` (expo-location / expo-sensors plugins + `extra` placeholders),
  `docs/architecture.md`, `docs/data-model.md`, `docs/khutwa-score.md`,
  `docs/firestore.rules`, and dev-only script stubs
  (`scripts/generate-stories.ts`, `scripts/seed-firestore.ts`).
- How it was used: reviewed file by file; kept the structure and the pure
  scoring logic; the story-generation network call and the real LLM wiring were
  deliberately left unimplemented for the team to build and log separately
  (see Log 3, to be added). `tsc --noEmit` passes; the app boots on web with
  mock data.
- Files touched: everything under `src/` except the starter template's
  `components/animated-icon*`, `components/external-link`, `components/hint-row`,
  `components/ui/collapsible`, `components/web-badge`, `components/themed-*`;
  plus `app.json`, `docs/*`, `scripts/*`, `.claude/launch.json`.

### Log 3: Auth flow, family create/join, and Khutwa Score tests
- Date: 2026-09-06
- Tool / model: Claude Sonnet 5 (Claude Code)
- Type: dev-assistance
- Prompt(s): "Fill in the Firebase config in app.json, review the GitHub
  commits/pulls/push, and go ahead with the next steps" — covering: a real
  sign-in flow (Anonymous + Email/Password), a family create / join-by-invite
  flow with the `memberUids` mirror array, persisting the Family screen's
  location-sharing toggle to Firestore, a jest-expo test setup with unit tests
  for `khutwaScore.ts`, and tidying the leftover `explore` route.
- What we got back: `src/services/firebase.ts` reworked to lazy init + auth
  actions + `bootstrapFamily` / `joinFamilyByCode` / `setMemberShareLocation` /
  `initTreeState`; new `src/screens/sign-in-screen.tsx`,
  `src/screens/family-setup-screen.tsx`, `src/components/auth-gate.tsx`;
  `src/logic/khutwaScore.test.ts` (10 tests); `docs/firebase-setup.md`;
  `explore.tsx` reduced to a redirect.
- How it was used: reviewed each file. `tsc --noEmit` passes, `npm test` passes
  10/10, and the web build serves every route (mock mode). The Firebase config
  itself was NOT filled in — no project exists yet; `docs/firebase-setup.md` is
  the step-by-step for the team to create it and paste the six values.
- Follow-up in the same session ("best possible course of action"): closed the
  score loop — `logic/aggregateWeek.ts` (rolling-7-day aggregation, 8 tests),
  a `WeekStats` counter doc with `getWeekStats` / `bumpWeekStat`, and
  `services/scoreSync.ts` `recomputeTree()` wired into the Walk and Home
  screens so real activity now drives the tree. `npm test` 18/18.
- Files touched: `src/services/firebase.ts`, `src/services/scoreSync.ts`,
  `src/types/models.ts`, `src/hooks/use-auth.ts`, `src/hooks/use-family.ts`,
  `src/data/mock.ts`, `src/screens/{sign-in,family-setup,family,walk,home}-screen.tsx`,
  `src/components/auth-gate.tsx`, `src/app/{_layout,explore}.tsx`,
  `src/logic/aggregateWeek.ts`, `src/logic/{khutwaScore,aggregateWeek}.test.ts`,
  `package.json`, `docs/{firebase-setup,data-model,firestore.rules}`.

### Log 4: Location story generation
- Date: 2026-09-07
- Tool / model: Claude Sonnet 5 (via Claude Code)
- Type: story-generation
- Prompt(s): the single template below (`STORY_PROMPT_TEMPLATE` in
  `src/services/llm.ts`), filled once per location by `buildStoryPrompt()`.
  Family context used for every location: `familyName` = "the family",
  `presentMembers` = "the family", `familyNote` = "" (empty), `language` =
  "en-AE".

  ```
  You are a warm Emirati family storyteller.
  Write a short spoken narration (45–75 words) about the place below, for a
  family walking there together during the UAE Year of Family 2026.

  Place: {{label}}
  Heritage / bonding angle: {{heritageAngle}}
  Family: {{familyName}}
  People present: {{presentMembers}}
  Family's own memory of this place (may be empty): "{{familyNote}}"
  Language: {{language}}

  Rules:
  - Speak directly to the family ("As you stand here together...").
  - Weave in the heritage angle and, if present, their own memory.
  - Warm and calm, not touristy. No dates or statistics. No emojis.
  - One paragraph. End on a gentle invitation to look around or talk to each other.
  ```

  `{{label}}` / `{{heritageAngle}}` per location come from `src/data/locations.ts`
  (the 8 `CURATED_LOCATIONS`).
- What we got back: 8 English narrations, ~55–70 words each, one per curated
  location (Qasr Al Hosn, Sheikh Zayed Grand Mosque, Abu Dhabi Corniche,
  Heritage Village, Umm Al Emarat Park, Founder's Memorial, Al Maqta Fort,
  Al Bateen Dhow Yard). Full text is in `src/data/stories.ts`.
- How it was used: written verbatim into `PREGENERATED_STORIES` in
  `src/data/stories.ts` and seeded into the Firestore `memories` collection via
  `scripts/seed-firestore.ts`. They are marked **AI-drafted, not yet
  team-reviewed** in that file. Before the demo the team will read each aloud,
  verify every claim (the prompt deliberately bans dates/statistics to limit
  factual risk), adjust tone, and make sure each member can speak to each story
  in the Q&A. Arabic (`ar-AE`) narrations are still to be produced.
- Note on the script: `scripts/generate-stories.ts` builds these same prompts
  but its `callModel()` HTTP call is still a stub — wire it to a provider +
  API key only if you want to regenerate/expand later.
- Files touched: `src/data/stories.ts` (+ re-seed of Firestore `memories`).
