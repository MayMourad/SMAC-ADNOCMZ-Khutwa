/**
 * Pre-generated story cache
 * =========================
 *
 * The reviewed narration text for each curated location, in each supported
 * language. This is what the shipped app speaks — no runtime LLM call.
 *
 * HOW THIS FILE GETS FILLED (May owns this, per the AI-usage rules):
 *   1. Run `scripts/generate-stories.ts` — it builds the prompt for each place
 *      with `buildStoryPrompt()` from services/llm.ts and calls the cloud LLM.
 *   2. EVERY prompt + which model + the raw output goes into docs/ai-prompt-log.md.
 *   3. The team reads each story, edits for accuracy/tone, and pastes the final
 *      text below. Only reviewed text ships.
 *
 * Until then, entries can be missing — `getStory()` falls back to a placeholder.
 */

export interface StoryCacheEntry {
  /** Kept so the generator can rebuild the exact prompt from just this file. */
  meta: { label: string; heritageAngle: string };
  'en-AE'?: string;
  'ar-AE'?: string;
}

export const PREGENERATED_STORIES: Record<string, StoryCacheEntry> = {
  'qasr-al-hosn': {
    meta: {
      label: 'Qasr Al Hosn',
      heritageAngle:
        'Oldest stone building in the city — the watchtower that watched generations of families arrive.',
    },
    // TODO(May): replace with the reviewed generated narration + log the prompt.
    'en-AE':
      'As you stand here together, look up at these coral-stone walls. For '
      + 'generations this watchtower was the first thing families saw as they '
      + 'came home to the island — a sign they had arrived, and were safe. Your '
      + 'family is part of that same long line of arrivals. Take a slow walk '
      + 'around it, and ask each other: who in our family came the furthest to be here?',
  },

  // Add the remaining curated locations here as their stories are reviewed:
  //   'sheikh-zayed-grand-mosque': { meta: {...}, 'en-AE': '...' },
  //   'abu-dhabi-corniche':        { meta: {...}, 'en-AE': '...' },
  //   ...
};
