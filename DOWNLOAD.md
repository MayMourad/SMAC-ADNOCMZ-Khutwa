# Download Khutwa

## Open it in a browser (recommended — no install)

**<https://maymourad.github.io/SMAC-ADNOCMZ-Khutwa/>**

No Expo account, no APK, no dev server — this is the live app, built and
redeployed automatically by [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
every time `main` is pushed. It talks to the same live Firebase project as the
Android build, so signing in / creating a family / walking through the stories
and the score all work exactly the same way.

What's different on web:
- **The live step counter and background geofencing don't run** — no
  pedometer or background-location API in a browser tab. Steps this walk stays
  0; use "Log steps manually" on the Walk screen instead.
- **The heritage map works fully** — it asks the browser for location
  permission the normal way and plots it alongside the 8 landmarks.
- A few Reanimated-driven animations (spring/bounce effects) render as a
  static resting state instead of animating — everything is still there, it
  just doesn't move on web the way it does on a phone.

One-time setup this needs (already done once, only relevant if it's ever
disabled): repo **Settings → Pages → Build and deployment → Source: "GitHub
Actions"**.

---

## Android — direct APK

**Download link (public, no account needed):**

<https://expo.dev/artifacts/eas/P_Z82Z_LLAEUqIJWAqzjOWPk2WpwMH_p9vwUXzoJOnI.apk>

**Build page** (QR code + install button, EAS dashboard):
<https://expo.dev/accounts/may.mourad/projects/Khutwa/builds/edf87ef7-8588-4da0-abcd-42bd4ac77a9b>

| | |
|---|---|
| Package | `smac.adnocmz.khutwa` |
| Version | 1.0.0 (versionCode 1) |
| Expo SDK | 57 |
| Channel | `preview` |
| Size | ~118 MB |
| Built with | EAS Build (`eas.json` → `preview` profile, `buildType: apk`) |

### Install steps

1. Open the download link on an Android phone. The `.apk` downloads.
2. Tap the downloaded file.
3. Android asks to allow **"install unknown apps"** for your browser — allow it.
4. Install, then open.
5. The first launch signs in to Firebase (anonymous by default) and loads the
   family, tree, and stories — this needs an internet connection. **Any**
   connection works, including a personal phone hotspot.

### Demo-day notes

- The APK is **standalone** — no laptop, no dev server, no "same network".
- Sign in and open a family **before** the demo so it isn't doing first-time
  auth on stage.
- To show the "together bloom" without a second device, use the **"We're
  together"** button on the Walk screen.

---

## iOS / any device — Expo Go

There is no free way to install a standalone iOS app on an unregistered device
(Apple requires the $99/yr Apple Developer Program for TestFlight or ad-hoc
builds). The free route is **Expo Go**:

1. Install **Expo Go** from the App Store (or Play Store).
2. In this repo: `npx expo start --tunnel`
   (`--tunnel` routes through Expo's cloud, so it works on **any** network,
   including a hotspot — no same-network requirement.)
3. Scan the QR shown in the terminal with Expo Go.

The app runs inside the Expo Go wrapper. Background location and haptics behave
differently there, but the full UI, the animated tree, the scroll-driven sky,
tap-to-bloom, stories, scoring, and the English/Arabic toggle all work.

---

## Updating the built app without rebuilding

An EAS Update is published to the `preview` branch. JS-only changes can be
shipped into the existing APK with:

```bash
eas update --branch preview --environment preview -m "your message"
```

No new APK or reinstall needed — the app picks the update up on next launch.
