import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeTestContext, type TestContext } from './helpers.js';

describe('tracker-backed study time presentation', () => {
  let ctx: TestContext;
  beforeEach(() => {
    ctx = makeTestContext();
  });
  afterEach(() => ctx.cleanup());

  const link = (courseId: string, habitEntryId: string, entryDate: string, minutes: number) =>
    ctx.service.linkHabitEntry({ courseId, habitEntryId, entryDate, minutes });

  it('dashboard maps course ids to human-readable titles and reports a total', () => {
    link('sse', 'ht-1', '2026-09-15', 60);
    link('sse', 'ht-2', '2026-09-16', 30);

    const d = ctx.service.dashboard();
    expect(d.studyTime).toEqual([{ courseId: 'sse', courseTitle: 'Software Systems Engineering', minutes: 90 }]);
    expect(d.studyTimeTotalMinutes).toBe(90);
  });

  it('dashboard study time is all-time: entries older than 30 days still count', () => {
    link('sse', 'ht-old', '2020-01-01', 45);
    const d = ctx.service.dashboard();
    expect(d.studyTimeTotalMinutes).toBe(45);
  });

  it('course views carry live tracker-backed minutes from habit_links', () => {
    link('sse', 'ht-3', '2026-09-17', 75);
    expect(ctx.service.courseView('sse').studyMinutes).toBe(75);
    expect(ctx.service.courseViews().find((c) => c.id === 'sse')!.studyMinutes).toBe(75);
    // dashboard course cards expose the same number
    expect(ctx.service.dashboard().courses.find((c: { id: string }) => c.id === 'sse')!.studyMinutes).toBe(75);
  });

  it('a course with no linked time reports zero, never a fabricated number', () => {
    expect(ctx.service.courseView('sse').studyMinutes).toBe(0);
    expect(ctx.service.dashboard().studyTime).toEqual([]);
    expect(ctx.service.dashboard().studyTimeTotalMinutes).toBe(0);
  });

  it('unmatched course ids are kept with a null title — never forced into lessons or fabricated', () => {
    // Bypass service validation to simulate a link whose course was later removed from content.
    ctx.repo.linkHabitEntry({ courseId: 'removed-course', habitEntryId: 'ht-orphan', entryDate: '2026-09-17', minutes: 20 });
    link('sse', 'ht-4', '2026-09-17', 60);

    const d = ctx.service.dashboard();
    const orphan = d.studyTime.find((s) => s.courseId === 'removed-course');
    expect(orphan).toBeDefined();
    expect(orphan!.courseTitle).toBeNull();
    expect(orphan!.minutes).toBe(20);
    expect(d.studyTimeTotalMinutes).toBe(80);
    // The orphan never appears as a lesson or course.
    expect(d.courses.some((c: { id: string }) => c.id === 'removed-course')).toBe(false);
    expect(ctx.service.tree().lessons.some((l) => l.courseId === 'removed-course')).toBe(false);
  });

  it('largest course sorts first in the dashboard breakdown', () => {
    link('sse', 'ht-5', '2026-09-17', 30);
    ctx.repo.linkHabitEntry({ courseId: 'zzz-other', habitEntryId: 'ht-6', entryDate: '2026-09-17', minutes: 120 });
    const d = ctx.service.dashboard();
    expect(d.studyTime.map((s) => s.courseId)).toEqual(['zzz-other', 'sse']);
  });

  it('HTTP dashboard contract includes titles and total', async () => {
    link('sse', 'ht-7', '2026-09-17', 90);
    const res = await request(ctx.app).get('/study/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.studyTime).toEqual([{ courseId: 'sse', courseTitle: 'Software Systems Engineering', minutes: 90 }]);
    expect(res.body.studyTimeTotalMinutes).toBe(90);
    expect(res.body.courses[0].studyMinutes).toBe(90);
  });

  it('HTTP course view contract includes studyMinutes', async () => {
    link('sse', 'ht-8', '2026-09-17', 25);
    const res = await request(ctx.app).get('/study/api/courses/sse');
    expect(res.status).toBe(200);
    expect(res.body.studyMinutes).toBe(25);
  });
});
