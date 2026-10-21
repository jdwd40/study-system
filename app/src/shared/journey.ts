/**
 * Journey layer: a gentle XP/level view over records the app already keeps.
 * Everything here is derived from existing data — lessons the learner has
 * explicitly ended ("claimed") and flashcard reviews — and only ever grows.
 * No streaks, no decay, no penalties.
 */

export interface JourneyTotals {
  /** Lessons whose state is `complete` (explicitly ended with a rating). */
  lessonsClaimed: number;
  /** Flashcard grade presses, all time (monotonic counter). */
  cardReviews: number;
  /** Attempts closed as completed, all time. */
  attemptsCompleted: number;
  /** Mean of the learner's own 1–5 ratings over rated lessons, or null. */
  averageUnderstanding: number | null;
}

export const XP_PER_LESSON = 100;
export const XP_PER_REVIEW = 5;

export interface LevelDef {
  title: string;
  /** XP floor for this level. */
  at: number;
}

/** Calm, scholarly titles; thresholds widen gently so later levels take longer. */
export const LEVELS: readonly LevelDef[] = [
  { title: 'Apprentice', at: 0 },
  { title: 'Scholar', at: 300 },
  { title: 'Cartographer', at: 800 },
  { title: 'Archivist', at: 1600 },
  { title: 'Sage', at: 3000 },
  { title: 'Luminary', at: 5000 },
];

export function xpFor(t: Pick<JourneyTotals, 'lessonsClaimed' | 'cardReviews'>): number {
  return t.lessonsClaimed * XP_PER_LESSON + t.cardReviews * XP_PER_REVIEW;
}

export interface LevelView {
  /** 1-based level number. */
  number: number;
  title: string;
  xp: number;
  /** XP floor of the current level. */
  floor: number;
  /** XP floor of the next level, or null at the top. */
  next: number | null;
  /** 0..1 progress from floor to next (1 at the top level). */
  progress: number;
}

export function levelFor(xp: number): LevelView {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]!.at) idx = i;
  const floor = LEVELS[idx]!.at;
  const next = LEVELS[idx + 1]?.at ?? null;
  const progress = next === null ? 1 : Math.min(1, Math.max(0, (xp - floor) / (next - floor)));
  return { number: idx + 1, title: LEVELS[idx]!.title, xp, floor, next, progress };
}

export interface JourneyView extends JourneyTotals {
  xp: number;
  level: LevelView;
}

export function journeyView(t: JourneyTotals): JourneyView {
  const xp = xpFor(t);
  return { ...t, xp, level: levelFor(xp) };
}
