/**
 * Journey layer: XP/levels are derived only from existing records and only
 * ever grow. No streaks, no decay, nothing punitive.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LEVELS, levelFor, xpFor, XP_PER_LESSON, XP_PER_REVIEW } from '../src/shared/journey.js';
import { makeTestContext, type TestContext } from './helpers.js';

describe('journey maths (shared)', () => {
  it('XP is 100 per claimed lesson and 5 per card review', () => {
    expect(xpFor({ lessonsClaimed: 0, cardReviews: 0 })).toBe(0);
    expect(xpFor({ lessonsClaimed: 3, cardReviews: 4 })).toBe(3 * XP_PER_LESSON + 4 * XP_PER_REVIEW);
  });

  it('levels are monotonic with calm titles and a 0..1 progress to the next floor', () => {
    expect(levelFor(0)).toMatchObject({ number: 1, title: 'Apprentice', floor: 0, next: LEVELS[1]!.at, progress: 0 });
    expect(levelFor(LEVELS[1]!.at)).toMatchObject({ number: 2, title: 'Scholar' });
    const mid = levelFor(LEVELS[1]!.at + (LEVELS[2]!.at - LEVELS[1]!.at) / 2);
    expect(mid.progress).toBeCloseTo(0.5);
    const top = levelFor(LEVELS[LEVELS.length - 1]!.at + 10_000);
    expect(top).toMatchObject({ number: LEVELS.length, next: null, progress: 1 });
    for (let i = 1; i < LEVELS.length; i++) expect(LEVELS[i]!.at).toBeGreaterThan(LEVELS[i - 1]!.at);
  });
});

describe('journey block on the dashboard', () => {
  let ctx: TestContext;
  beforeEach(() => { ctx = makeTestContext(); });
  afterEach(() => ctx.cleanup());

  it('starts at zero and counts only explicitly ended lessons', () => {
    expect(ctx.service.dashboard().journey).toMatchObject({ lessonsClaimed: 0, cardReviews: 0, attemptsCompleted: 0, averageUnderstanding: null, xp: 0 });
    ctx.service.startLesson('sse-101-lesson-one');
    // Starting (or switching away) never claims anything.
    ctx.service.startLesson('sse-101-lesson-two');
    expect(ctx.service.dashboard().journey.lessonsClaimed).toBe(0);
    const ended = ctx.service.endLesson('sse-101-lesson-two', { userRating: 4 });
    expect(ended.journey).toMatchObject({ lessonsClaimed: 1, attemptsCompleted: 1, averageUnderstanding: 4, xp: XP_PER_LESSON });
    expect(ended.journey.level.title).toBe('Apprentice');
  });

  it('counts every grade press, including "again", and never goes down', () => {
    const today = new Date().toISOString().slice(0, 10);
    ctx.service.reviewFlashcard('sse-101-lesson-one#0', 'sse-101-lesson-one', 'good', today);
    ctx.service.reviewFlashcard('sse-101-lesson-one#0', 'sse-101-lesson-one', 'again', today);
    ctx.service.reviewFlashcard('sse-101-lesson-one#0', 'sse-101-lesson-one', 'good', today);
    const j = ctx.service.dashboard().journey;
    expect(j.cardReviews).toBe(3);
    expect(j.xp).toBe(3 * XP_PER_REVIEW);
  });

  it('seeds the review counter from SM-2 state recorded before the counter existed', () => {
    const today = new Date().toISOString().slice(0, 10);
    ctx.service.reviewFlashcard('sse-101-lesson-one#0', 'sse-101-lesson-one', 'good', today);
    ctx.service.reviewFlashcard('sse-101-lesson-one#1', 'sse-101-lesson-one', 'again', today);
    // Simulate a database from before the journey layer: drop the counter only.
    ctx.db.prepare("DELETE FROM kv WHERE key = 'journey.cardReviews'").run();
    expect(ctx.service.dashboard().journey.cardReviews).toBe(2);
  });
});
