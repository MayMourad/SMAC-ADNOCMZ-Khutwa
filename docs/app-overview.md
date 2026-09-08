# Khutwa (خطوة) — App Overview & Functionality

**Tagline:** Every step waters the story.
**Download (Android APK, any device, free):** <https://expo.dev/artifacts/eas/P_Z82Z_LLAEUqIJWAqzjOWPk2WpwMH_p9vwUXzoJOnI.apk>
**Source:** <https://github.com/MayMourad/SMAC-ADNOCMZ-Khutwa>

---

## Brief

Khutwa turns an ordinary family walk into a shared ritual. A family grows one
virtual Ghaf tree together: their combined steps grow it through visible stages,
walking near places that matter to the family unlocks short spoken heritage
stories, and when family members are physically together the tree blooms. All of
it is expressed as one number — the **Khutwa Score** — built from three strands:
movement, togetherness, and heritage. Built for SMAC 2026's theme, *"AI for
Stronger Family Bonds,"* and the UAE's Year of the Family. The app is downloadable
today as an Android APK from the link above, and runs on iOS through Expo Go.

## The problem

- Families mean to spend active time together but rarely do, and the shared time
  that happens is getting shorter.
- At the same time, the everyday stories and places our elders carry go
  unrecorded.
- Movement and memory are fading together — yet step apps are individual and
  competitive, and heritage content is static and disconnected from the family.

## The idea

One family, one shared tree. The Ghaf — the UAE's national tree — survives the
desert by sending its roots deep and sheltering life around it: a natural symbol
for a family that stays connected. Every step the family takes waters it. The
walk is the reason to be together, not the goal.

## How it works (core loop)

1. A guardian creates a family and shares an invite code; members join.
2. Each member's daily steps sync to the family total (device step counter, with
   a manual log fallback).
3. The combined total grows the shared tree: seed → sprout → sapling → young →
   mature → ancient.
4. Walking inside the geofence of a curated heritage place unlocks a short
   (under a minute) story about it, read aloud on the device.
5. When two or more members are in the same place at the same time, the tree
   blooms — a small, visible, shared moment.
6. The home screen reflects all of this as the Khutwa Score.

## The Khutwa Score

A single 0–100 number, averaged from three sub-scores over a rolling 7-day
window:

- **Root** — how much the family moves (steps vs. a gentle family goal).
- **Bloom** — togetherness: bloom moments and stories unlocked together.
- **Heritage** — how many family places have been visited and preserved.

The tree's stage and bloom state come from the same data, so the picture and the
number always agree. (Details: [`khutwa-score.md`](khutwa-score.md).)

## Heritage places (initial set — Abu Dhabi)

Sheikh Zayed Grand Mosque, Qasr Al Hosn, Al Maqta Fort, Heritage Village,
Founders Memorial, Umm Al Emarat Park, Al Bateen Dhow Yard, Abu Dhabi Corniche.
Each has a curated story and a coordinate + radius; the set is built to expand to
other emirates. (See [`locations/`](locations).)

## The role of AI — narrow and responsible

AI has one job: turn a place and a family's own memory into a warm, short spoken
story. Every story is generated **ahead of time** from approved public heritage
content, reviewed by the team, and cached on the phone. The app runs no live
inference — a member's real-time location is never sent to any AI service.
Text-to-speech reads the cached story on-device. Where and how AI was used to
*build* the app is documented in [`AI-USAGE-REPORT.md`](AI-USAGE-REPORT.md), with
a prompt log in [`ai-prompt-log.md`](ai-prompt-log.md).

## Privacy & safety

- Location is processed on the device, used only to unlock nearby family stories
  and to bloom the tree when members are together.
- Location is never shared outside the family group and never sent to a third
  party or an AI service.
- Accounts can be anonymous; email sign-in is optional; each member controls
  whether they share location with the family.

## Accessibility & language

Full English and Arabic, switchable anywhere, with right-to-left text handling.
Type scale, colour contrast, and reduced-motion support are built in; all motion
falls back to a calm resting state when the OS requests it.

## Technology

- React Native + Expo (SDK 57), TypeScript, file-based routing (expo-router).
- Firebase Authentication + Cloud Firestore (region `me-central1`, Doha) for
  family, tree, and story state; security rules restrict data to family members.
- Reanimated + react-native-svg for the illustrated, animated Ghaf tree and
  oasis scenes (scroll-driven sky, tap-to-bloom).
- Lightweight custom bilingual (EN/AR) layer.
- Distribution: Android APK via EAS Build (installable from a link on any
  device); iOS via Expo Go for judging. Standalone iOS distribution requires a
  paid Apple Developer account.

## Alignment with SMAC 2026

- **Theme — "AI for Stronger Family Bonds":** the app's unit is the family, not
  the individual; AI deepens a shared experience rather than automating it away.
- **Year of the Family:** turns a daily habit into something a family keeps.
- **Rubric coverage:** a working cross-platform build, a clear real-world
  problem, transparent and responsible AI use, privacy-by-design, cultural
  grounding (Ghaf tree, UAE heritage sites), bilingual accessibility, and a
  documented, reviewable codebase.

## Team

- **May Ahmed Mourad** — AI & Data Lead (story generation pipeline, scoring,
  Firebase, bilingual layer).
- **Shamsa Faris Al Mazrouei** — Core App Lead (navigation, screens, location
  service, UI).

## Try it

- **Android — direct APK (any device, free, no account):**
  <https://expo.dev/artifacts/eas/P_Z82Z_LLAEUqIJWAqzjOWPk2WpwMH_p9vwUXzoJOnI.apk>
  — open on an Android phone, download, tap the file, allow *"install unknown
  apps"*, Install. First launch needs an internet connection (Firebase); a phone
  hotspot works. Full notes: [`../DOWNLOAD.md`](../DOWNLOAD.md).
- **Android — EAS build page (QR code + install button):**
  <https://expo.dev/accounts/may.mourad/projects/Khutwa/builds/edf87ef7-8588-4da0-abcd-42bd4ac77a9b>
- **iOS / any device — Expo Go:** install Expo Go from the App Store, then from
  the repo run `npx expo start --tunnel` and scan the QR. `--tunnel` works on any
  network. Standalone iOS distribution requires a paid Apple Developer account
  and is out of scope.
- **Code:** <https://github.com/MayMourad/SMAC-ADNOCMZ-Khutwa>

## Roadmap

More emirates and heritage places; family photo memories pinned to a place;
seasonal tree events; optional elder-recorded audio alongside the AI narration;
Android Health Connect integration.
