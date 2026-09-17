import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { makeTestContext, type TestContext } from './helpers.js';
import { ServiceError } from '../src/server/lessonService.js';

describe('habit tracker course-level linking', () => {
  let ctx: TestContext;
  beforeEach(() => {
    ctx = makeTestContext();
  });
  afterEach(() => ctx.cleanup());

  it('links a habit entry to a course', () => {
    const { created, link } = ctx.service.linkHabitEntry({
      courseId: 'sse',
      habitEntryId: 'ht-1001',
      entryDate: '2026-09-17',
      minutes: 45,
    });
    expect(created).toBe(true);
    expect(link.courseId).toBe('sse');
    expect(link.minutes).toBe(45);
  });

  it('rejects linking without a course — never guesses', () => {
    expect(() =>
      ctx.service.linkHabitEntry({ habitEntryId: 'ht-1002', entryDate: '2026-09-17', minutes: 30 }),
    ).toThrow(/COURSE_REQUIRED|courseId is required/);
  });

  it('rejects an unknown course', () => {
    expect(() =>
      ctx.service.linkHabitEntry({ courseId: 'nope', habitEntryId: 'ht-1003', entryDate: '2026-09-17', minutes: 30 }),
    ).toThrow(ServiceError);
  });

  it('is idempotent: re-linking the same entry never double-counts', () => {
    const first = ctx.service.linkHabitEntry({
      courseId: 'sse',
      habitEntryId: 'ht-1004',
      entryDate: '2026-09-17',
      minutes: 30,
    });
    const second = ctx.service.linkHabitEntry({
      courseId: 'sse',
      habitEntryId: 'ht-1004',
      entryDate: '2026-09-17',
      minutes: 30,
    });
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(ctx.repo.habitLinks()).toHaveLength(1);
    const totals = ctx.repo.studyMinutesByCourse('2026-01-01');
    expect(totals).toEqual([{ courseId: 'sse', minutes: 30 }]);
  });

  it('rejects malformed dates and non-positive minutes', () => {
    expect(() =>
      ctx.service.linkHabitEntry({ courseId: 'sse', habitEntryId: 'ht-1005', entryDate: '17/09/2026', minutes: 30 }),
    ).toThrow(/entryDate/);
    expect(() =>
      ctx.service.linkHabitEntry({ courseId: 'sse', habitEntryId: 'ht-1006', entryDate: '2026-09-17', minutes: 0 }),
    ).toThrow(/positive minutes/);
  });
});

describe('search scope', () => {
  let ctx: TestContext;
  beforeEach(() => {
    ctx = makeTestContext();
  });
  afterEach(() => ctx.cleanup());

  it('searches courses, modules and lessons by title', () => {
    const result = ctx.service.search('architecture');
    expect(result.courses).toHaveLength(0);
    expect(result.modules.map((m) => m.id)).toEqual(['SSE-101']);
    expect(result.lessons).toHaveLength(0);
    expect(ctx.service.search('lesson one').lessons.map((l) => l.id)).toEqual(['sse-101-lesson-one']);
    expect(ctx.service.search('software').courses.map((c) => c.id)).toEqual(['sse']);
  });

  it('never returns Q&A, flashcards or chat history', () => {
    ctx.service.startLesson('sse-101-lesson-one');
    ctx.service.recordQa({ lessonId: 'sse-101-lesson-one', question: 'unique-zebra-question' });
    const result = ctx.service.search('unique-zebra-question');
    expect(result.courses).toHaveLength(0);
    expect(result.modules).toHaveLength(0);
    expect(result.lessons).toHaveLength(0);
    expect(Object.keys(result).sort()).toEqual(['courses', 'lessons', 'modules']);
  });
});
