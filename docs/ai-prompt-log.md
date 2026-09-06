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

### Log 3: Location story generation
- Date: _pending_
- Tool / model: _pending — record the exact model, e.g. gemini-2.5-flash / gpt-4o / claude-sonnet-5_
- Type: story-generation
- Prompt(s): _the output of `scripts/generate-stories.ts` prints each prompt to
  stderr — paste them here verbatim_
- What we got back: _per-location draft narrations_
- How it was used: _which stories kept as-is, which edited (and how), which
  regenerated_
- Files touched: `src/data/stories.ts`
