/**
 * Trending score algorithm — produces a value in [0, 100].
 *
 * Four independent components are summed, each capped at their maximum:
 *
 *   Activity  (0–50)  Exponential-decay weighted sum of signal weights,
 *                     normalised so diminishing returns kick in naturally.
 *                     Half-life of a signal is ~14 days (λ = 0.05).
 *
 *   Volume    (0–15)  Total number of signals ever recorded. Rewards
 *                     consistent coverage, not just a single viral event.
 *
 *   Recency   (0–20)  Days since launch (or DB creation). Freshly
 *                     launched startups start with a full recency bonus
 *                     that decays over ~6 months (half-life 173 days).
 *
 *   Stars     (0–15)  Peak GitHub star count extracted from
 *                     GITHUB_STARS_SPIKE signal titles. Rewards repos
 *                     with proven community traction.
 */

const MS_PER_DAY = 1_000 * 60 * 60 * 24;

// Component 1 — activity
const DECAY_LAMBDA = 0.05;    // signal half-life ≈ 14 days
const ACTIVITY_SCALE = 25;    // raw score at which activityPts = 50 × (1-e⁻¹) ≈ 31.6

// Component 2 — volume
const VOLUME_SCALE = 10;      // signals for ~63% of max volume points

// Component 3 — recency
const RECENCY_LAMBDA = 0.004; // launch freshness half-life ≈ 173 days

// Component 4 — GitHub stars
const STAR_SCALE = 2_000;     // stars for ~63% of max star points

export interface ScoredSignal {
  type: string;
  weight: number;
  occurredAt: Date;
  title: string;
}

export interface ScoreInput {
  signals: ScoredSignal[];
  launchDate: Date | null;
  createdAt: Date;
}

export interface ScoreBreakdown {
  /** Final clamped score in [0, 100] */
  total: number;
  /** Signal recency × weight component, max 50 */
  activity: number;
  /** Signal count component, max 15 */
  volume: number;
  /** Launch freshness component, max 20 */
  recency: number;
  /** GitHub star velocity component, max 15 */
  stars: number;
}

/** Returns the full breakdown so individual components can be displayed. */
export function computeScoreBreakdown(input: ScoreInput): ScoreBreakdown {
  const now = Date.now();

  // 1. Signal activity — exponential decay sum normalised to 0–50
  const rawDecay = input.signals.reduce((sum, s) => {
    const daysSince = (now - s.occurredAt.getTime()) / MS_PER_DAY;
    return sum + s.weight * Math.exp(-DECAY_LAMBDA * daysSince);
  }, 0);
  const activity = r1(50 * (1 - Math.exp(-rawDecay / ACTIVITY_SCALE)));

  // 2. Signal volume — normalised to 0–15
  const volume = r1(15 * (1 - Math.exp(-input.signals.length / VOLUME_SCALE)));

  // 3. Launch recency — freshness bonus, normalised to 0–20
  const referenceDate = input.launchDate ?? input.createdAt;
  const ageDays = (now - referenceDate.getTime()) / MS_PER_DAY;
  const recency = r1(20 * Math.exp(-RECENCY_LAMBDA * ageDays));

  // 4. GitHub star velocity — peak stars from spike signals, normalised to 0–15
  const stars = r1(computeStarScore(input.signals));

  const total = r1(Math.min(100, Math.max(0, activity + volume + recency + stars)));
  return { total, activity, volume, recency, stars };
}

/** Convenience wrapper when only the final score is needed. */
export function computeTrendingScore(input: ScoreInput): number {
  return computeScoreBreakdown(input).total;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function computeStarScore(signals: ScoredSignal[]): number {
  const spikes = signals.filter((s) => s.type === "GITHUB_STARS_SPIKE");
  if (spikes.length === 0) return 0;

  let maxStars = 0;
  for (const s of spikes) {
    // Title format: "1,234 stars on GitHub"
    const match = s.title.match(/^([\d,]+)\s+stars/);
    if (match) {
      const count = parseInt(match[1].replace(/,/g, ""), 10);
      if (count > maxStars) maxStars = count;
    }
  }

  // Has a spike signal but star count couldn't be parsed → partial credit
  if (maxStars === 0) return 3;

  return 15 * (1 - Math.exp(-maxStars / STAR_SCALE));
}

/** Round to 1 decimal place. */
function r1(n: number): number {
  return Math.round(n * 10) / 10;
}
