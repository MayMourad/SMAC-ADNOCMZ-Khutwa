/**
 * generate-stories.ts  —  DEV-ONLY, run by hand, never bundled into the app
 * ========================================================================
 *
 * Pre-generates the narration for each curated location using ONE cloud LLM,
 * then writes a draft file the team reviews before pasting into
 * `src/data/stories.ts`.
 *
 * This script is where the "AI as a supporting tool" usage happens for the
 * story feature. EVERY prompt and the model used MUST be copied into
 * `docs/ai-prompt-log.md` (see the template there).
 *
 * Usage (May owns this):
 *   1. Put your API key in an env var, e.g. `LLM_API_KEY` (never commit it).
 *   2. Fill in `callModel()` below for your provider (Gemini / OpenAI / Claude).
 *   3. `npx tsx scripts/generate-stories.ts > docs/generated-stories.draft.json`
 *   4. Review every story, edit for accuracy/tone, paste finals into data/stories.ts,
 *      and log the prompts.
 *
 * It is intentionally left unimplemented at the network layer so no key or
 * provider choice is baked in yet.
 */

import { CURATED_LOCATIONS } from '../src/data/locations';
import { buildStoryPrompt } from '../src/services/llm';

type Lang = 'en-AE' | 'ar-AE';
const LANGUAGES: Lang[] = ['en-AE'];

const FAMILY_CONTEXT = {
  familyName: 'the Al Mazrouei family',
  presentMembers: ['May', 'Shamsa'],
  familyNote: '',
};

/** TODO(May): implement for your chosen provider. Log the model name you use. */
async function callModel(_prompt: string): Promise<string> {
  throw new Error(
    'callModel() is not implemented yet. Wire your cloud LLM here and record ' +
      'the prompt + model in docs/ai-prompt-log.md.',
  );
}

async function main() {
  const out: Record<string, Record<string, string>> = {};

  for (const loc of CURATED_LOCATIONS) {
    out[loc.id] = {};
    for (const language of LANGUAGES) {
      const prompt = buildStoryPrompt(
        { label: loc.label, heritageAngle: loc.heritageAngle },
        { ...FAMILY_CONTEXT, language },
      );
      // Print the prompt so it can be copied straight into the AI prompt log.
      console.error(`\n----- PROMPT (${loc.id} / ${language}) -----\n${prompt}\n`);
      out[loc.id][language] = await callModel(prompt);
    }
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
