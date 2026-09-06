/**
 * Pre-generated story cache
 * =========================
 *
 * The narration text for each curated location, in each supported language.
 * This is what the shipped app speaks — no runtime LLM call.
 *
 * PROVENANCE: the English drafts below were generated with Claude (Sonnet 5)
 * on 2026-09-07 using the prompt in `services/llm.ts` (STORY_PROMPT_TEMPLATE)
 * filled per location. See docs/ai-prompt-log.md — Log 4 for the prompts and
 * how they were used.
 *
 * >>> STATUS: AI-DRAFTED, NOT YET TEAM-REVIEWED. <<<
 * Before the demo the team must read each one aloud, check every factual claim,
 * adjust tone, and be able to explain each story in the Q&A. Replace this notice
 * with "team-reviewed <date>" once done. Arabic (`ar-AE`) is still to do.
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
    'en-AE':
      'As you stand here together, look up at these pale coral-stone walls. ' +
      'For many generations this was the first thing families saw as they came ' +
      'home across the water — a sign they had arrived safely. Your family is ' +
      'part of that same long line of homecomings. Walk slowly around it, and ' +
      'ask one another: who among us travelled the farthest to be here today?',
  },

  'sheikh-zayed-grand-mosque': {
    meta: {
      label: 'Sheikh Zayed Grand Mosque',
      heritageAngle:
        'A shared moment of awe and pride — first-family-visit memories, Eid gatherings.',
    },
    'en-AE':
      'Stand quietly for a moment and let the size of this place settle over ' +
      'you. Families come here on ordinary evenings and on the mornings of ' +
      "Eid, small children holding a parent's hand under the white domes. " +
      'Whatever brought your family here today, you are adding your visit to ' +
      'thousands of others. Before you move on, tell each other one thing that ' +
      'made you pause.',
  },

  'abu-dhabi-corniche': {
    meta: {
      label: 'Abu Dhabi Corniche',
      heritageAngle:
        "A generational walking spot — grandparents' evening strolls, and today's family walks.",
    },
    'en-AE':
      'This long stretch of shore has been a family walking place for as long ' +
      'as anyone can remember — grandparents took their evening strolls here, ' +
      'and now you are taking yours. The sea on one side, the city on the ' +
      'other, and the same soft light at the end of the day. Keep walking a ' +
      'little further together, and share a memory of a walk you took long ago.',
  },

  'heritage-village': {
    meta: {
      label: 'Heritage Village',
      heritageAngle:
        'Pre-oil daily life — the majlis, storytelling, grandparents teaching grandchildren.',
    },
    'en-AE':
      'Step in slowly. This is a picture of daily life before the towers — the ' +
      'low majlis where elders sat, the tools of trades passed from parent to ' +
      'child, the stories told after dark. Families learned who they were by ' +
      'listening here. As you look around, let the oldest person with you tell ' +
      'the youngest one thing about how your own family used to live.',
  },

  'umm-al-emarat-park': {
    meta: {
      label: 'Umm Al Emarat Park',
      heritageAngle:
        "Everyday family park memories — picnics, and a child's first bike ride.",
    },
    'en-AE':
      'This is a park for ordinary family days — spread blankets, shared food, ' +
      'a child wobbling forward on a first bike while everyone calls out ' +
      'encouragement. Nothing here is grand, and that is the point; these are ' +
      'the afternoons families remember most. Find a patch of shade together, ' +
      'sit for a while, and let someone recall a small, happy day like this one.',
  },

  'founders-memorial': {
    meta: {
      label: "Founder's Memorial",
      heritageAngle:
        "Sheikh Zayed's family values — the 'father of the nation' framing ties straight to the family-bonds theme.",
    },
    'en-AE':
      'Take your time along this quiet path. The man remembered here spoke ' +
      'often about family as the root of everything else — that a strong ' +
      'country begins with people who care for one another at home. As you ' +
      'walk toward the portrait, think about what your family passes down: a ' +
      'habit, a saying, a kindness. Name one of those things aloud to each ' +
      'other before you leave.',
  },

  'al-maqta-fort': {
    meta: {
      label: 'Al Maqta Fort',
      heritageAngle:
        'The old bridge crossing between island and mainland — families reuniting.',
    },
    'en-AE':
      'Look out toward the old crossing. For a long time this narrow point was ' +
      'the way onto the island, watched over by this small fort — the place ' +
      'where travelling families were finally back with the ones waiting for ' +
      'them. You crossed your own roads to arrive here together today. Stand ' +
      'where the old bridge met the land, and remember a time your family came ' +
      'back together after being apart.',
  },

  'al-bateen-dhow-yard': {
    meta: {
      label: 'Al Bateen Dhow Yard',
      heritageAngle:
        'Maritime heritage — pearling-era family livelihoods and passed-down trades.',
    },
    'en-AE':
      'Breathe in the smell of wood and sea. Boats are still shaped by hand ' +
      'here, the way they were when whole families made their living from the ' +
      'water and taught the craft to their children. A trade, like a family, ' +
      'is something you keep alive by passing it on. Watch the builders for a ' +
      'moment, then talk together about a skill someone in your family handed ' +
      'down to you.',
  },
};
