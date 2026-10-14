# Firestore rules tests

36 checks against [`../docs/firestore.rules`](../docs/firestore.rules), run in the local Firestore emulator. They cover outsiders (can't read, list or join families), joining with an invite code, what members can and can't change, and the read-only curated stories.

Needs Node.js, Java 11+ and the Firebase CLI (`npm i -g firebase-tools`).

```bash
cd firestore-tests
npm install
npm test
```

Expected result: `36 passed, 0 failed`.
