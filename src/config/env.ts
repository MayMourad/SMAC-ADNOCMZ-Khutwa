/**
 * Runtime configuration
 * =====================
 *
 * Secrets and environment-specific values are NEVER hard-coded in source and
 * NEVER committed. They come from `app.json` -> `expo.extra`, which Expo exposes
 * at runtime through `expo-constants`.
 *
 * For local development each teammate keeps real values in `app.config.local.js`
 * (git-ignored) or passes them via EAS secrets for builds. See docs/setup.md.
 *
 * If a value is missing we fail loudly in dev and fall back to a harmless
 * placeholder, so the app still boots for UI work without Firebase.
 */

import Constants from 'expo-constants';

type Extra = {
  firebase?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  /** Only used by the offline story-generation script, not the shipped app. */
  llm?: {
    provider?: string;
    model?: string;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function required(value: string | undefined, name: string): string {
  if (!value) {
    if (__DEV__) {
      console.warn(
        `[config] Missing "${name}". Add it to app.json > expo.extra. ` +
          'Using a placeholder — Firebase calls will fail until this is set.',
      );
    }
    return `MISSING_${name}`;
  }
  return value;
}

export const firebaseConfig = {
  apiKey: required(extra.firebase?.apiKey, 'firebase.apiKey'),
  authDomain: required(extra.firebase?.authDomain, 'firebase.authDomain'),
  projectId: required(extra.firebase?.projectId, 'firebase.projectId'),
  storageBucket: required(extra.firebase?.storageBucket, 'firebase.storageBucket'),
  messagingSenderId: required(
    extra.firebase?.messagingSenderId,
    'firebase.messagingSenderId',
  ),
  appId: required(extra.firebase?.appId, 'firebase.appId'),
};

/** True when Firebase looks configured. Screens can use this to show a setup hint. */
export const isFirebaseConfigured = !Object.values(firebaseConfig).some((v) =>
  v.startsWith('MISSING_'),
);

export const llmConfig = {
  provider: extra.llm?.provider ?? 'unset',
  model: extra.llm?.model ?? 'unset',
};
