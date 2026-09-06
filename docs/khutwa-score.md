# Khutwa Score — how the number is built

Code: `src/logic/khutwaScore.ts` (pure functions, no I/O).

## The model in one paragraph

The Khutwa Score is a 0–100 number that is the weighted average of three
sub-scores, each also 0–100:

```
Khutwa Score = Root × 0.40  +  Bloom × 0.35  +  Heritage × 0.25
```

Bonding + culture together (0.60) outweigh raw fitness (0.40) because the
competition theme is *stronger family bonds* — movement is the occasion, not the
goal.

## How each sub-score is built

Every input metric has a **target** = "a full contribution for that metric".
For each metric we take `min(1, value / target)`, multiply by the metric's
weight, sum them, and scale to 0–100. No hidden curves.

### Root (health) — targets are per rolling 7-day window

| Metric | Target | Weight |
|---|---|---|
| Combined family steps | 8000 | 0.50 |
| Active minutes (any member) | 60 | 0.30 |
| Co-movement sessions (2+ members walking together) | 2 | 0.20 |

### Bloom (bonding)

| Metric | Target | Weight |
|---|---|---|
| Memory unlocks | 3 | 0.40 |
| Story contributions (voice/text added to a place) | 2 | 0.30 |
| Together-moments (tree bloomed) | 3 | 0.30 |

### Heritage (culture)

| Metric | Target | Weight |
|---|---|---|
| Distinct heritage sites visited | 5 | 0.60 |
| Stories preserved (reviewed + saved) | 5 | 0.40 |

## Growth stages

`growthStageFromScore(khutwaScore)`:

| Score | Stage |
|---|---|
| 0–9 | seed |
| 10–24 | sprout |
| 25–44 | sapling |
| 45–64 | young |
| 65–84 | mature |
| 85–100 | ancient |

Early stages come fast (encouraging); `ancient` is deliberately hard.

## Worked example (the values in `src/data/mock.ts`)

Inputs:

```
root     = { familySteps: 5200, activeMinutes: 34, coMovementSessions: 1 }
bloom    = { memoryUnlocks: 2,  storyContributions: 1, togetherMoments: 2 }
heritage = { sitesVisited: 3,   storiesPreserved: 2 }
```

**Root**
- steps: min(1, 5200/8000) = 0.650 × 0.50 = 0.325
- active min: min(1, 34/60) = 0.567 × 0.30 = 0.170
- co-movement: min(1, 1/2) = 0.500 × 0.20 = 0.100
- sum = 0.595 → **Root = 60**

**Bloom**
- unlocks: min(1, 2/3) = 0.667 × 0.40 = 0.267
- contributions: min(1, 1/2) = 0.500 × 0.30 = 0.150
- together: min(1, 2/3) = 0.667 × 0.30 = 0.200
- sum = 0.617 → **Bloom = 62**

**Heritage**
- sites: min(1, 3/5) = 0.600 × 0.60 = 0.360
- preserved: min(1, 2/5) = 0.400 × 0.40 = 0.160
- sum = 0.520 → **Heritage = 52**

**Composite**
- 60 × 0.40 + 62 × 0.35 + 52 × 0.25 = 24.0 + 21.7 + 13.0 = 58.7 → **Khutwa Score = 59**
- 59 → growth stage **young**

(Rounding is applied to each sub-score before combining, so hand-calc and code
match to ±1.)

## Testing note

These are pure functions — add `src/logic/khutwaScore.test.ts` with your test
runner of choice (e.g. `jest-expo`) and assert the worked example above.
