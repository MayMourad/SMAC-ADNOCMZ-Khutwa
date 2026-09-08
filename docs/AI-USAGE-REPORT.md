# Khutwa — AI Usage Report

**Team:** May Ahmed Mourad (MayMourad) · Shamsa Faris Al Mazrouei (sfarismaz)
**Competition:** SMAC 2026 — Smart Mobile App Contest
**Prepared:** 8 September 2026

This report documents every use of AI in building Khutwa, as required by the
competition rules. A turn-by-turn log with the actual prompts is kept in
[`docs/ai-prompt-log.md`](ai-prompt-log.md); this file is the summary.

---

## 1. Tools used

| Tool | Purpose |
|---|---|
| **Claude (Sonnet 5), via Claude Code** | Development assistant — scaffolding, the Firebase/service layer, the scoring logic, the UI redesign, and generating the pre-written location narrations. |
| Firebase Console / EAS CLI | Not AI — standard project setup. |

No AI tool was used to *design the idea* (that is the team's) and every AI-assisted
file was reviewed by the team; both members can explain the whole codebase.

---

## 2. How AI was used, by area

### 2.1 In-app content — location narrations (a product feature)

The eight heritage-site stories the app narrates were **pre-generated with Claude**
using one fixed prompt template, then reviewed and edited by the team. The app
does **not** call an LLM at runtime — it plays reviewed, cached text via the
device's text-to-speech.

- Prompt template: `STORY_PROMPT_TEMPLATE` in `src/services/llm.ts`
- Generated text: `src/data/stories.ts` (English); Arabic still to be produced
- Full prompts + how each story was used: `docs/ai-prompt-log.md`, Log 4

### 2.2 Development assistance

Claude Code was used as a pair-programming assistant across the build. Each
working session is logged (`docs/ai-prompt-log.md`, Logs 2–4 and after). In
summary, AI helped produce, and the team reviewed:

| Session | What AI helped with | Files |
|---|---|---|
| Scaffold | Expo project structure, data-model types, service stubs (`firebase`, `location`, `steps`, `speech`, `llm`), 4-tab navigation, Khutwa Score functions | `src/**` (initial), `docs/architecture.md`, `docs/data-model.md`, `docs/khutwa-score.md` |
| Auth + data | Anonymous/email sign-in, family create/join by invite code, Firestore security rules, weekly score aggregation, `recomputeTree` | `src/services/firebase.ts`, `src/services/scoreSync.ts`, `src/logic/aggregateWeek.ts`, `docs/firestore.rules` |
| Testing | jest-expo setup + unit tests for the scoring logic | `src/logic/*.test.ts` |
| Build config | `eas.json`, `app.json` identifiers, `docs/build-and-run.md` | build config |
| UI/UX redesign | "Oasis" design system (colours, type), shared components, illustrated animated Ghaf tree, all six screens rebuilt, English/Arabic i18n + RTL | `src/constants/theme.ts`, `src/components/**`, `src/screens/**`, `src/i18n/**` |

### 2.3 Submission assets (this document set)

Claude also drafted the image-generation prompt, the image-to-video prompt, and
the voice-over script used to produce the 2–3 minute submission video (see
[`docs/video-assets.md`](video-assets.md)). Those drafts were reviewed and
adjusted by the team.

---

## 3. What AI did **not** do

- It did not originate the concept, the metrics model, or the choice of heritage
  locations — those are the team's.
- It did not make any git commits under a team member's name as if that member
  wrote the code; commits that were AI-assisted carry a `Co-Authored-By: Claude`
  trailer, and the team has read every file.
- It is not called at runtime by the shipped app.

---

## 4. Verification

- `npm run typecheck` — passes
- `npm test` — passes (scoring logic)
- The app builds and runs (`docs/build-and-run.md`)
- The team can walk through any file on request during the Q&A.
