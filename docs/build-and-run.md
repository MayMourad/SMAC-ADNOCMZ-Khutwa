# Build & run

## 1. Development (fastest, for testing)

```bash
npm install
npx expo start
```

Then on your phone open **Expo Go** (App Store / Play Store) and scan the QR
code. The app connects to the live Firebase project immediately — you'll see the
sign-in screen.

Limitations in Expo Go:
- **Geofencing runs only while the app is open** (foreground). A real build adds
  OS background geofencing so a story can be ready when you arrive.
- Everything else — auth, family, tree, score, TTS narration, the "together"
  bloom, manual step entry — works.

Checks:
```bash
npm run typecheck    # tsc --noEmit
npm test             # jest: khutwaScore + aggregateWeek
```

## 2. Android — installable APK (free)

This is the "downloadable app on your phone" deliverable. No Play Store, no fee.

```bash
npm i -g eas-cli
eas login                                   # free Expo account
eas build -p android --profile preview
```

- First run asks to create an EAS project — say yes; it writes
  `extra.eas.projectId` into `app.json` (commit that).
- Build runs in Expo's cloud (~10–20 min). When it finishes the CLI prints a
  URL with a **`.apk`** download.
- Send the APK to an Android phone (email / Drive / USB), open it, allow
  "install from unknown sources", install.

Rebuild after code changes: run the same `eas build` command again.

## 3. iOS (no fully-free path to a physical iPhone)

Apple requires a signing certificate to run a custom build on a device. Options,
cheapest first:

| Option | Cost | Needs | Notes |
|---|---|---|---|
| **Expo Go** | free | nothing | Works now. No background geofencing. Good enough for testing and a backup demo. |
| **Free Xcode provisioning** | free | a Mac + your Apple ID | `npx expo run:ios --device` from the Mac, installs over USB. App **expires after 7 days**, re-install to renew. |
| **EAS build, ad-hoc** | free-ish | Apple ID + register each test device's UDID | `eas build -p ios --profile preview`; free Apple accounts have tight limits and 7-day expiry. |
| **EAS build, proper** | $99/yr | paid Apple Developer account | `eas build -p ios --profile preview` → installable `.ipa` / TestFlight. |

Given the deadline, use **Expo Go on the iPhones** for iOS and the **Android
APK** as the submitted installable app.

## 4. Config that lives in the build

- `app.json > expo.extra.firebase` — the Firebase web config (already filled).
- `app.json > ios.bundleIdentifier` / `android.package` — `smac.adnocmz.khutwa`.
- `app.json > plugins` — `expo-location` (permission strings + background),
  `expo-sensors` (motion permission), `expo-splash-screen`, `expo-router`.
- Firestore security rules live in `docs/firestore.rules`; deploy with
  `firebase deploy --only firestore:rules` (see `docs/firebase-setup.md`).

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| App shows mock data / "May · Shamsa" with no sign-in | `expo.extra.firebase` is empty or `npx expo start -c` not run after editing it |
| `permission-denied` in console | Firestore rules not deployed, or Anonymous / Email sign-in not enabled in the Firebase console |
| `eas build` can't find a project | run `eas init` (or answer "yes" on first build) and commit the `projectId` |
| Geofence never triggers on device | you're outside the radius, or on Expo Go the app was backgrounded — reopen it |
| Pedometer shows 0 on Android | Android has no historical step API here; use the manual "Log steps" field, or wire Health Connect later |
