/**
 * SpeechService
 * =============
 *
 * Thin wrapper over `expo-speech` so screens don't import it directly and we
 * have one place to set our default voice settings and track "is narrating".
 *
 * MVP uses the device's built-in text-to-speech — no custom voice work, per the
 * idea brief (§3, §6). If a Memory ever has a pre-rendered `audioUrl`, play that
 * with expo-audio instead; this service only covers the TTS path.
 */

import * as Speech from 'expo-speech';

export interface NarrateOptions {
  /** BCP-47 code. Defaults to UAE English. */
  language?: string;
  /** 0.1–2.0, 1.0 = normal. We slow down slightly for a calmer read. */
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

const DEFAULTS: Required<Pick<NarrateOptions, 'language' | 'rate' | 'pitch'>> = {
  language: 'en-AE',
  rate: 0.92,
  pitch: 1.0,
};

/** Speak a story. Stops anything currently playing first. */
export function narrate(text: string, options: NarrateOptions = {}): void {
  Speech.stop();
  const { language, rate, pitch, onStart, onDone, onError } = {
    ...DEFAULTS,
    ...options,
  };
  onStart?.();
  Speech.speak(text, {
    language,
    rate,
    pitch,
    onDone: () => onDone?.(),
    onStopped: () => onDone?.(),
    onError: (e) => onError?.((e as Error)?.message ?? 'speech error'),
  });
}

export function stopNarration(): void {
  Speech.stop();
}

export function isNarrating(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

/** List of installed voices — useful for a settings screen later. */
export function listVoices(): Promise<Speech.Voice[]> {
  return Speech.getAvailableVoicesAsync();
}
