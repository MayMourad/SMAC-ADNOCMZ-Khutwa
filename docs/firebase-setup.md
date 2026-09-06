# Firebase setup — step by step

Do this once. It takes ~10 minutes. One teammate creates the project and adds
the other as an editor. You do **not** need a credit card (Spark/free plan is
enough for the demo).

The Firebase **web config** (apiKey, authDomain, …) is not a secret — it ships
inside every Firebase web/mobile app and only identifies the project. Access is
controlled by the Security Rules, not by hiding this. So it's fine to put it in
`app.json` and commit it, **as long as you deploy the rules in
`docs/firestore.rules`** (step 6).

---

## 1. Create the project

1. Go to <https://console.firebase.google.com> and sign in with a Google account
   the team controls (use a name the judges recognise — same convention as your
   GitHub).
2. **Add project** → name it `khutwa-smac2026` (or similar) → Continue.
3. Google Analytics: **turn it off** (not needed, less to configure) → Create
   project → wait for it to finish → Continue.

## 2. Add a Web app

1. On the project overview, click the **`</>`** (Web) icon.
2. App nickname: `khutwa` → **do not** check "Firebase Hosting" → Register app.
3. You'll see a code block with `const firebaseConfig = { … }`. **Copy those
   six values.** (You can get them again later under ⚙️ → Project settings →
   General → Your apps → SDK setup and configuration.)
4. Skip the SDK install steps it shows → Continue to console.

## 3. Enable Authentication

1. Left sidebar → **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Email/Password** → Save.
3. Enable **Anonymous** as well (used by the "Continue without an account"
   button) → Save.

## 4. Create the Firestore database

1. Left sidebar → **Build → Firestore Database**.
2. Click **Create database**. You must complete this whole wizard — just opening
   the page enables the API but does **not** create the database.
3. **Production mode** (we paste real rules next) → Next.
4. Location: pick `eur3 (europe-west)` or the nearest region → **Enable**.
5. Wait until you see the empty **Data** table for `(default)` — that's the
   database created.

## 5. Give the config to the app

Paste the six values into `app.json` → `expo.extra.firebase` (they're currently
empty strings):

```jsonc
"extra": {
  "firebase": {
    "apiKey": "AIza…",
    "authDomain": "khutwa-smac2026.firebaseapp.com",
    "projectId": "khutwa-smac2026",
    "storageBucket": "khutwa-smac2026.appspot.com",
    "messagingSenderId": "1234567890",
    "appId": "1:1234567890:web:abcdef…"
  }
}
```

Then restart Expo (`npx expo start -c`). The app will now use real Firebase
instead of mock data — you'll get the sign-in screen on first launch.

## 6. Deploy the security rules

Firestore Console → **Rules** tab → replace everything with the contents of
`docs/firestore.rules` → **Publish**.

(Optional, if you install the Firebase CLI: `npm i -g firebase-tools`,
`firebase login`, `firebase init firestore` pointing at `docs/firestore.rules`,
then `firebase deploy --only firestore:rules`.)

## 7. Seed the location memories

Needs steps 3 (Anonymous sign-in on), 4 (database created) and 6 (rules
published) done first — the script signs in anonymously and the published rules
let a signed-in user create `memories`.

```bash
npx tsx scripts/seed-firestore.ts
```

This writes the 8 curated places into the `memories` collection.

## 8. Add your teammate

Firebase Console → ⚙️ → **Users and permissions** → **Add member** → enter their
Google email → role **Editor** → Add.

---

## Checklist

- [ ] Project created, Analytics off
- [ ] Web app registered, 6 config values copied
- [ ] Email/Password **and** Anonymous sign-in enabled
- [ ] Firestore database created (production mode)
- [ ] `app.json > expo.extra.firebase` filled in
- [ ] `docs/firestore.rules` published in the console
- [ ] `npx tsx scripts/seed-firestore.ts` run
- [ ] Teammate added as Editor
