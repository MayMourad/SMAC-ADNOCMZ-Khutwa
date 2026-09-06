/**
 * StoryService
 * ============
 *
 * Turns a location + a bit of family context into a short, warm, spoken-style
 * story about that place.
 *
 * IMPORTANT DESIGN DECISION (from the idea brief, §3 and §6):
 *   Stories are PRE-GENERATED during development, reviewed by the team, and
 *   cached on-device. The shipped app does NOT call an LLM at runtime. This
 *   keeps the demo offline-safe and gives us a clean, complete prompt log.
 *
 * So this service resolves a story in three steps:
 *   1. Look in the on-device cache of reviewed stories (assets/stories/*.json,
 *      loaded via `data/stories.ts`).
 *   2. If not found and a dev-time generator is wired up, call it (May will add
 *      this in `scripts/generate-stories.ts` and log every prompt).
 *   3. Otherwise return a clearly-labelled placeholder so UI work can continue.
 *
 * The prompt template lives here as an exported constant precisely so it can be
 * copied verbatim into docs/ai-prompt-log.md.
 */

import { PREGENERATED_STORIES } from '@/data/stories';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FamilyStoryContext {
  /** e.g. "the Al Mazrouei family" — used to personalise the greeting. */
  familyName: string;
  /** First names of members who are present, for a "you and Shamsa" touch. */
  presentMembers: string[];
  /** Optional short memory the family attached to this place (text or transcript). */
  familyNote?: string;
  /** BCP-47 language for the narration, e.g. "en-AE" or "ar-AE". */
  language: 'en-AE' | 'ar-AE';
}

export interface StoryResult {
  locationId: string;
  text: string;
  /** Where the text came from — useful to show a badge in dev. */
  source: 'cache' | 'generated' | 'placeholder';
  language: string;
}

// ---------------------------------------------------------------------------
// Prompt template (documented in docs/ai-prompt-log.md)
// ---------------------------------------------------------------------------

/**
 * Fill this with a location's details + family context to pre-generate a story.
 * Keep it short and constrained: the AI's job here is narrow on purpose.
 */
export const STORY_PROMPT_TEMPLATE = `You are a warm Emirati family storyteller.
Write a short spoken narration (45–75 words) about the place below, for a family
walking there together during the UAE Year of Family 2026.

Place: {{label}}
Heritage / bonding angle: {{heritageAngle}}
Family: {{familyName}}
People present: {{presentMembers}}
Family's own memory of this place (may be empty): "{{familyNote}}"
Language: {{language}}

Rules:
- Speak directly to the family ("As you stand here together...").
- Weave in the heritage angle and, if present, their own memory.
- Warm and calm, not touristy. No dates or statistics. No emojis.
- One paragraph. End on a gentle invitation to look around or talk to each other.`;

/** Build the exact prompt string for a given place + context. */
export function buildStoryPrompt(
  place: { label: string; heritageAngle: string },
  ctx: FamilyStoryContext,
): string {
  return STORY_PROMPT_TEMPLATE.replace('{{label}}', place.label)
    .replace('{{heritageAngle}}', place.heritageAngle)
    .replace('{{familyName}}', ctx.familyName)
    .replace('{{presentMembers}}', ctx.presentMembers.join(', ') || 'the family')
    .replace('{{familyNote}}', ctx.familyNote ?? '')
    .replace('{{language}}', ctx.language);
}

// ---------------------------------------------------------------------------
// Optional dev-time generator hook
// ---------------------------------------------------------------------------

/**
 * May wires the real cloud LLM call here (or in scripts/generate-stories.ts).
 * Leaving it as an injectable function keeps the API key and the network call
 * OUT of the shipped app bundle. When null, step 2 is skipped.
 *
 * Example wiring (dev only):
 *   setStoryGenerator(async (prompt) => callClaude(prompt));
 */
type StoryGenerator = (prompt: string) => Promise<string>;
let storyGenerator: StoryGenerator | null = null;

export function setStoryGenerator(fn: StoryGenerator | null): void {
  storyGenerator = fn;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the narration text for a location. Never throws — always resolves to
 * something speakable so the Walk screen stays robust.
 */
export async function getStory(
  locationId: string,
  context: FamilyStoryContext,
): Promise<StoryResult> {
  // 1. On-device reviewed cache (the normal path in the shipped app).
  const cached = PREGENERATED_STORIES[locationId]?.[context.language];
  if (cached) {
    return { locationId, text: cached, source: 'cache', language: context.language };
  }

  // 2. Dev-time generator, only if the team injected one.
  if (storyGenerator) {
    try {
      const place = PREGENERATED_STORIES[locationId]?.meta ?? {
        label: locationId,
        heritageAngle: '',
      };
      const text = await storyGenerator(buildStoryPrompt(place, context));
      return { locationId, text, source: 'generated', language: context.language };
    } catch (e) {
      console.warn('[StoryService] generator failed:', (e as Error).message);
    }
  }

  // 3. Placeholder so UI development is never blocked.
  return {
    locationId,
    source: 'placeholder',
    language: context.language,
    text:
      `[[ placeholder story for "${locationId}" ]] As you stand here together, ` +
      `imagine the families who passed through this place long before you. ` +
      `Take a moment, look around, and share one thing each of you notices.`,
  };
}
