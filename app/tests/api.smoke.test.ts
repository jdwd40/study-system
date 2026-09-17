import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeTestContext, type TestContext } from './helpers.js';

describe('API smoke', () => {
  let ctx: TestContext;
  beforeEach(() => {
    ctx = makeTestContext();
  });
  afterEach(() => ctx.cleanup());

  it('health, courses, lesson lifecycle and flashcards over HTTP', async () => {
    const health = await request(ctx.app).get('/study/api/health');
    expect(health.status).toBe(200);

    const courses = await request(ctx.app).get('/study/api/courses');
    expect(courses.status).toBe(200);
    expect(courses.body.courses[0].id).toBe('sse');
    expect(courses.body.courses[0].progress.plannedLessons).toBe(2);

    const start = await request(ctx.app).post('/study/api/lessons/sse-101-lesson-one/start');
    expect(start.status).toBe(200);
    expect(start.body.attempt.status).toBe('active');

    const lesson = await request(ctx.app).get('/study/api/lessons/sse-101-lesson-one');
    expect(lesson.body.activeAttempt).not.toBeNull();
    expect(lesson.body.lesson.flashcards).toHaveLength(2);

    const qa = await request(ctx.app)
      .post('/study/api/lessons/sse-101-lesson-one/qa')
      .send({ question: 'Q?', userAnswer: 'A', hermesFeedback: 'good', result: 'correct' });
    expect(qa.status).toBe(201);

    const end = await request(ctx.app)
      .post('/study/api/lessons/sse-101-lesson-one/end')
      .send({ userRating: 4, hermesRating: 4 });
    expect(end.status).toBe(200);
    expect(end.body.state.status).toBe('complete');

    const review = await request(ctx.app)
      .post('/study/api/flashcards/review')
      .send({ cardId: 'sse-101-lesson-one#0', lessonId: 'sse-101-lesson-one', grade: 'good' });
    expect(review.status).toBe(200);
    expect(review.body.state.reps).toBe(1);

    const due = await request(ctx.app).get('/study/api/flashcards/due');
    expect(due.status).toBe(200);
    expect(due.body.cards.some((c: { cardId: string }) => c.cardId === 'sse-101-lesson-one#1')).toBe(true);

    const dashboard = await request(ctx.app).get('/study/api/dashboard');
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.courses[0].progress.completedLessons).toBe(1);

    const search = await request(ctx.app).get('/study/api/search?q=lesson');
    expect(search.body.lessons.length).toBe(2);
  });

  it('integration habit-link requires course and is idempotent over HTTP', async () => {
    const headers = { Authorization: 'Bearer test-integration-secret' };
    const missing = await request(ctx.app)
      .post('/study/api/integration/habit-link')
      .set(headers)
      .send({ habit_entry_id: 'e1', entry_date: '2026-09-17', minutes: 30 });
    expect(missing.status).toBe(400);
    expect(missing.body.code).toBe('COURSE_REQUIRED');

    const first = await request(ctx.app)
      .post('/study/api/integration/habit-link')
      .set(headers)
      .send({ course_id: 'sse', habit_entry_id: 'e1', entry_date: '2026-09-17', minutes: 30 });
    expect(first.status).toBe(201);
    const dupe = await request(ctx.app)
      .post('/study/api/integration/habit-link')
      .set(headers)
      .send({ course_id: 'sse', habit_entry_id: 'e1', entry_date: '2026-09-17', minutes: 30 });
    expect(dupe.status).toBe(200);
    expect(dupe.body.created).toBe(false);
  });

  it('integration end-lesson enforces explicit end requirement', async () => {
    const headers = { Authorization: 'Bearer test-integration-secret' };
    const res = await request(ctx.app)
      .post('/study/api/integration/end-lesson')
      .set(headers)
      .send({ lesson_id: 'sse-101-lesson-one', user_rating: 5 });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('NO_ACTIVE_ATTEMPT');
  });

  it('unknown lesson returns 404 with error body', async () => {
    const res = await request(ctx.app).get('/study/api/lessons/nope');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
