import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeTestContext, type TestContext } from './helpers.js';
import { ServiceError } from '../src/server/lessonService.js';

describe('lesson lifecycle', () => {
  let ctx: TestContext;
  beforeEach(() => {
    ctx = makeTestContext();
  });
  afterEach(() => ctx.cleanup());

  it('starting a lesson creates an active attempt', () => {
    const { attempt, continued } = ctx.service.startLesson('sse-101-lesson-one');
    expect(attempt.status).toBe('active');
    expect(continued).toBe(false);
    expect(ctx.repo.activeAttemptForLesson('sse-101-lesson-one')?.id).toBe(attempt.id);
  });

  it('starting the same lesson twice continues the existing attempt', () => {
    const first = ctx.service.startLesson('sse-101-lesson-one');
    const second = ctx.service.startLesson('sse-101-lesson-one');
    expect(second.continued).toBe(true);
    expect(second.attempt.id).toBe(first.attempt.id);
  });

  it('switching lessons marks the previous lesson unfinished and closes its attempt', () => {
    ctx.service.startLesson('sse-101-lesson-one');
    const result = ctx.service.startLesson('sse-101-lesson-two');
    expect(result.switchedAwayFrom).toBe('sse-101-lesson-one');
    expect(ctx.repo.getLessonState('sse-101-lesson-one').status).toBe('unfinished');
    expect(ctx.repo.attemptsForLesson('sse-101-lesson-one')[0]!.status).toBe('switched');
  });

  it('ending without an active attempt is rejected (no inactivity completion)', () => {
    expect(() => ctx.service.endLesson('sse-101-lesson-one', { userRating: 4 })).toThrow(ServiceError);
    expect(() => ctx.service.endLesson('sse-101-lesson-one', { userRating: 4 })).toThrow(/NO_ACTIVE_ATTEMPT|no active attempt/);
    expect(ctx.repo.getLessonState('sse-101-lesson-one').status).toBe('not_started');
  });

  it('ending requires a user rating', () => {
    ctx.service.startLesson('sse-101-lesson-one');
    expect(() => ctx.service.endLesson('sse-101-lesson-one', { userRating: 0 })).toThrow(/userRating/);
  });

  it('explicit end stores both ratings separately and marks complete', () => {
    ctx.service.startLesson('sse-101-lesson-one');
    const { state, attempt } = ctx.service.endLesson('sse-101-lesson-one', { userRating: 4, hermesRating: 5 });
    expect(state.status).toBe('complete');
    expect(state.userRating).toBe(4);
    expect(state.hermesRating).toBe(5);
    expect(attempt.status).toBe('completed');
    expect(attempt.endedAt).not.toBeNull();
  });

  it('retaking a completed lesson uses the same lesson id with a new attempt', () => {
    ctx.service.startLesson('sse-101-lesson-one');
    ctx.service.endLesson('sse-101-lesson-one', { userRating: 3 });
    const retake = ctx.service.startLesson('sse-101-lesson-one');
    expect(retake.continued).toBe(false);
    expect(retake.lesson.id).toBe('sse-101-lesson-one');
    expect(ctx.repo.attemptsForLesson('sse-101-lesson-one')).toHaveLength(2);
  });

  it('next lesson is the first non-complete lesson in tree order', () => {
    expect(ctx.service.nextLesson()?.id).toBe('sse-101-lesson-one');
    ctx.service.startLesson('sse-101-lesson-one');
    ctx.service.endLesson('sse-101-lesson-one', { userRating: 5 });
    expect(ctx.service.nextLesson()?.id).toBe('sse-101-lesson-two');
    ctx.service.startLesson('sse-101-lesson-two');
    ctx.service.endLesson('sse-101-lesson-two', { userRating: 5 });
    expect(ctx.service.nextLesson()).toBeNull();
  });

  it('course progress is completed / planned from the canonical tree', () => {
    expect(ctx.service.courseProgress('sse')).toEqual({
      courseId: 'sse',
      plannedLessons: 2,
      completedLessons: 0,
      percent: 0,
    });
    ctx.service.startLesson('sse-101-lesson-one');
    ctx.service.endLesson('sse-101-lesson-one', { userRating: 5 });
    expect(ctx.service.courseProgress('sse')).toEqual({
      courseId: 'sse',
      plannedLessons: 2,
      completedLessons: 1,
      percent: 50,
    });
  });

  it('weak areas use ONLY the user rating', () => {
    ctx.service.startLesson('sse-101-lesson-one');
    // Hermes thinks it went badly, user thinks it went fine → not weak.
    ctx.service.endLesson('sse-101-lesson-one', { userRating: 5, hermesRating: 1 });
    ctx.service.startLesson('sse-101-lesson-two');
    // User rates low, Hermes rates high → weak.
    ctx.service.endLesson('sse-101-lesson-two', { userRating: 2, hermesRating: 5 });
    const weak = ctx.service.dashboard().weakAreas;
    expect(weak.map((w) => w.lessonId)).toEqual(['sse-101-lesson-two']);
  });

  it('Q&A persists with attempt linkage', () => {
    const { attempt } = ctx.service.startLesson('sse-101-lesson-one');
    const qa = ctx.service.recordQa({
      lessonId: 'sse-101-lesson-one',
      question: 'What is architecture?',
      userAnswer: 'Important decisions',
      hermesFeedback: 'Correct',
      result: 'correct',
    });
    expect(qa.attemptId).toBe(attempt.id);
    expect(ctx.service.qaForLesson('sse-101-lesson-one')).toHaveLength(1);
  });

  it('starting an unknown lesson fails with NOT_FOUND', () => {
    expect(() => ctx.service.startLesson('nope')).toThrow(ServiceError);
  });
});
