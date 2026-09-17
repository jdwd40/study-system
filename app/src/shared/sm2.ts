/**
 * Deterministic SM-2-like spaced repetition scheduling.
 * `today` is always injected (ISO date) so scheduling is pure and testable.
 */
import type { CardState, Grade } from './types.js';

const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function initialCardState(today: string): CardState {
  return { ease: DEFAULT_EASE, intervalDays: 0, reps: 0, lapses: 0, dueDate: today };
}

export function scheduleCard(state: CardState, grade: Grade, today: string): CardState {
  const q = QUALITY[grade];
  let { ease, intervalDays, reps, lapses } = state;

  if (q < 3) {
    reps = 0;
    lapses += 1;
    intervalDays = 1;
  } else {
    ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ease < MIN_EASE) ease = MIN_EASE;
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round(intervalDays * ease));
  }

  return { ease, intervalDays, reps, lapses, dueDate: addDays(today, intervalDays) };
}

/** Due selection: cards whose due date is today or earlier, earliest first. */
export function selectDue<T extends { dueDate: string }>(cards: T[], today: string): T[] {
  return cards.filter((c) => c.dueDate <= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
