# Khutwa (خطوة)
### "Every Step Waters the Story."

**SMAC 2026 — Smart Mobile App Contest**
Theme: AI for a Stronger Family Bonds

---

## Team

| Name | Role | GitHub |
|---|---|---|
| May Ahmed Mourad | AI & Data Lead | MayMourad |
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

See `/docs/idea-brief.md` for the full refined idea brief, scope rationale, and cut/future features.

## Tech Stack

- **Framework:** React Native (Expo, managed workflow)
- **Steps/movement:** `expo-sensors`
- **Geofencing/location:** `expo-location`
- **Text-to-speech:** `expo-speech`
- **Backend/data:** Firebase (Auth + Firestore)
- **AI story generation:** cloud LLM API, used during development to pre-generate cached stories (see `/docs/ai-prompt-log.md`)
- **Builds:** EAS Build

## AI Usage Disclosure

Per competition rules, all AI usage during development is logged with prompts in `/docs/ai-prompt-log.md`. This includes:
- Prompts used to generate the in-app location stories (a core app feature, not a dev shortcut)
- Prompts used to get development/coding assistance from AI tools

No AI tool was used to generate the application as a whole; all code is written and understood by the team.

## Getting Started

```bash
# Clone the repo
git clone <github.com/MayMourad/SMAC-ADNOCMZ-Khutwa>
cd khutwa

# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

Requires the Expo Go app (for quick device testing) or an EAS development build. See `/docs/setup.md` for full environment setup instructions.

## Project Structure

```
/src        — app source code (screens, components, logic)
/assets     — images, tree stage assets, cached audio
/docs       — idea brief, AI prompt log, setup notes
```

## Status

🚧 In active development for SMAC 2026 — Submission: Sept 8, 2026 · Demo Day: Sept 16, 2026
