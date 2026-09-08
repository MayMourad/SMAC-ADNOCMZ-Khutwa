# Khutwa (خطوة)
### "Every Step Waters the Story."

**SMAC 2026 — Smart Mobile App Contest**
Theme: AI for a Stronger Family Bonds

---

## 📥 Download & Try It

**Android APK — any device, no account, free:**

> **https://expo.dev/artifacts/eas/P_Z82Z_LLAEUqIJWAqzjOWPk2WpwMH_p9vwUXzoJOnI.apk**

**EXPO Go for iOS**
> **https://expo.dev/accounts/may.mourad/projects/Khutwa/builds/edf87ef7-8588-4da0-abcd-42bd4ac77a9b**

Open the link on an Android phone → download → tap the file → allow *"install unknown
apps"* → Install. First launch needs an internet connection (Firebase); a phone
hotspot is fine.

- **Build page (QR code + install button):** https://expo.dev/accounts/may.mourad/projects/Khutwa/builds/edf87ef7-8588-4da0-abcd-42bd4ac77a9b
- **Full install notes + iOS / Expo Go route:** [`DOWNLOAD.md`](DOWNLOAD.md)
- **App overview & functionality brief:** [`docs/app-overview.md`](docs/app-overview.md)

---

## Team

| Name | Role | GitHub |
|---|---|---|
| May Ahmed Mourad | AI & Data Lead| MayMourad |
| Shamsa Faris Al Mazrouei | Core App Lead | sfarismaz |

## The Idea

Khutwa turns a family's everyday walks into a living, shared Ghaf tree that grows with their collective steps and blooms with short AI-narrated memories of the places they've been together — built for the UAE Year of Family 2026.

Families link into one shared group. As they move, their combined steps grow a tree that lives on the home screen. When a family member is near a place tied to a family memory, the app unlocks a short, AI-narrated story about that spot. When multiple family members are physically together, the tree visibly blooms — turning ordinary movement into a shared, meaningful ritual.

## Core Features (MVP)

- **Family group & steps** — family members link into a shared group; step counts contribute to one shared tree.
- **Shared tree widget** — grows in visible stages tied to cumulative family steps.
- **Location stories** — a curated set of real family/heritage locations, each with a short AI-narrated story generated ahead of time and cached on-device.
- **Geofence trigger + narration** — the app detects proximity to a stored location and plays its story via text-to-speech.
- **"Together" bloom state** — when family members are co-located, the tree visibly blooms.
- **Privacy-first by design** — location data stays on-device by default; nothing is shared outside the family group; parental control over what younger members' accounts record.
- **English & Arabic** — full in-app language toggle (خطوة), with right-aligned Arabic text.
- **"Oasis" visual design** — warm sand-and-Ghaf-green palette, Rubik + Fraunces type, an illustrated growth-stage tree that sways and glows when the family is together.

See `/docs/idea-brief.md` for the full refined idea brief, scope rationale, and cut/future features.

## Tech Stack

- **Framework:** React Native (Expo, managed workflow)
- **UI/motion:** `react-native-svg`, `react-native-reanimated`, `expo-linear-gradient`, `lucide-react-native`, `@expo-google-fonts` (Rubik + Fraunces)
- **i18n:** custom lightweight table (`src/i18n`) with persisted EN/AR toggle + soft RTL
- **Steps/movement:** `expo-sensors`
- **Geofencing/location:** `expo-location`
- **Text-to-speech:** `expo-speech`
- **Backend/data:** Firebase (Auth + Firestore)
- **AI story generation:** cloud LLM, used during development to pre-generate cached stories (see `/docs/ai-prompt-log.md`)
- **Builds:** EAS Build (`eas.json`)

## Locations
- **Abu Dhabi:** Featuring 8 locations across the Emirate of Abu Dhabi (see `/docs/locations`)


## AI Usage Disclosure

Per competition rules, every use of AI during development is logged with the
prompts in [`docs/ai-prompt-log.md`](docs/ai-prompt-log.md). This covers:

- **Story generation** — the prompt template and per-location prompts used to
  pre-generate the in-app narrations (a core app feature). The generated text is
  team-reviewed before shipping.
- **Development assistance** — Claude (via Claude Code) was used as a coding
  assistant across the build: scaffolding, the Firebase/service layer, the
  scoring logic, and setup. Each session is logged with what was asked and how
  the output was used.

The team has reviewed the codebase and can explain every part of it in the Q&A.

## Run it (development)

```bash
git clone https://github.com/MayMourad/SMAC-ADNOCMZ-Khutwa.git
cd SMAC-ADNOCMZ-Khutwa
npm install
npx expo start          # then scan the QR with Expo Go (iOS/Android)
```

Firebase is already configured in `app.json`; the app connects to the live
`smac-adnocmz-khutwa` project on first launch (you'll get the sign-in screen).
In Expo Go, geofencing runs in the foreground only — a full build adds
background geofencing. Full environment notes: [`docs/build-and-run.md`](docs/build-and-run.md).

```bash
npm run typecheck       # tsc, no emit
npm test                # jest — Khutwa Score + weekly aggregation
```

## Build an installable app

```bash
npm i -g eas-cli
eas login               # free Expo account
eas build -p android --profile preview     # -> installable .apk link
```

`eas.json` defines `development` / `preview` / `production` profiles. Android
`preview` produces a sideloadable APK (no store, no fee). iOS requires an Apple
Developer account or a Mac for free provisioning — see
[`docs/build-and-run.md`](docs/build-and-run.md).

## Project Structure

```
src/
  app/         expo-router routes (thin re-exports of screens) + _layout
  screens/     Home · Walk · Stories · Family · SignIn · FamilySetup
  components/  GhafTree, ScoreBar, AppTabs, AuthOverlay, ErrorBoundary, themed primitives
  hooks/       use-auth / use-family / use-tree-state / use-memories
               (auto-switch between live Firestore and mock data)
  services/    firebase · location · steps · speech · llm · scoreSync  (only these touch I/O)
  logic/       khutwaScore.ts + aggregateWeek.ts — pure, unit-tested
  data/        locations.ts · stories.ts (pre-generated cache) · mock.ts
  types/       models.ts — shape of every Firestore document
  config/      env.ts — reads config from app.json > expo.extra
docs/          architecture · data-model · khutwa-score · firebase-setup ·
               build-and-run · firestore.rules · ai-prompt-log · idea-brief
scripts/       dev-only: generate-stories.ts · seed-firestore.ts
```

See [`docs/architecture.md`](docs/architecture.md) for how the pieces fit together.

## Status

🚧 Active development for SMAC 2026 — Submission: Sept 8, 2026 · Demo Day: Sept 16, 2026

Working: Firebase auth (email + anonymous), family create/join by invite code,
shared tree + Khutwa Score from real weekly activity, 8 seeded heritage
locations with narrations, geofence-triggered TTS, "together" bloom, privacy
controls. See [`docs/architecture.md`](docs/architecture.md) for what's still
stubbed.
