import { describe, expect, it } from 'vitest';
import { addDays, initialCardState, scheduleCard, selectDue } from '../src/shared/sm2.js';

describe('SM-2 scheduling', () => {
  it('first "good" review schedules +1 day', () => {
    const s = scheduleCard(initialCardState('2026-09-17'), 'good', '2026-09-17');
    expect(s.reps).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.dueDate).toBe('2026-09-18');
  });

  it('second successful review schedules +6 days', () => {
    let s = scheduleCard(initialCardState('2026-09-17'), 'good', '2026-09-17');
    s = scheduleCard(s, 'good', '2026-09-18');
    expect(s.reps).toBe(2);
    expect(s.intervalDays).toBe(6);
    expect(s.dueDate).toBe('2026-09-24');
  });

  it('third review multiplies interval by ease factor', () => {
    let s = scheduleCard(initialCardState('2026-09-17'), 'good', '2026-09-17');
    s = scheduleCard(s, 'good', '2026-09-18');
    s = scheduleCard(s, 'good', '2026-09-24');
    expect(s.reps).toBe(3);
    expect(s.intervalDays).toBe(Math.round(6 * s.ease));
  });

  it('"again" resets reps, increments lapses, due tomorrow', () => {
    let s = scheduleCard(initialCardState('2026-09-17'), 'good', '2026-09-17');
    s = scheduleCard(s, 'again', '2026-09-18');
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.intervalDays).toBe(1);
    expect(s.dueDate).toBe('2026-09-19');
  });

  it('"easy" raises ease more than "good"', () => {
    const good = scheduleCard(initialCardState('2026-09-17'), 'good', '2026-09-17');
    const easy = scheduleCard(initialCardState('2026-09-17'), 'easy', '2026-09-17');
    expect(easy.ease).toBeGreaterThan(good.ease);
  });

  it('ease never drops below 1.3', () => {
    let s = initialCardState('2026-09-17');
    for (let i = 0; i < 12; i += 1) {
      s = scheduleCard(s, 'hard', '2026-09-17');
    }
    expect(s.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('addDays crosses month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 6)).toBe('2027-01-06');
  });
});

describe('selectDue', () => {
  it('selects cards due today or earlier, earliest first', () => {
    const cards = [
      { id: 'a', dueDate: '2026-09-20' },
      { id: 'b', dueDate: '2026-09-15' },
      { id: 'c', dueDate: '2026-09-17' },
    ];
    const due = selectDue(cards, '2026-09-17');
    expect(due.map((c) => c.id)).toEqual(['b', 'c']);
  });
});
