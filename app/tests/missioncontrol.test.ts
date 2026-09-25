import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeTestContext, type TestContext } from './helpers.js';
import { hashPassword } from '../src/server/auth.js';
import { loadConfig } from '../src/server/config.js';
import {
  MISSION_REASONS,
  SNAPSHOT_MAX_BYTES,
  STALE_AFTER_MS,
} from '../src/server/missionControl.js';

function fixtureSnapshot(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sources: { habits: { available: true } },
    habits: {
      available: true,
      daily_target_minutes: 240,
      today: { date: '2026-09-25', total_minutes: 90, target_minutes: 240, habits: [] },
    },
    tasks: { open: [{ text: 'Ship mission control', section: 'Current' }], done: [], openCount: 1 },
    goals: { active: ['Freelance web income'] },
    projects: [{ name: 'Coins', status: 'live', openItem: 'playtest' }],
    codingJobs: [{ tool: 'codex', pid: 1234, elapsedSeconds: 42 }],
    githubIssues: [{ number: 7, title: 'Bug', repository: 'jdwd40/fcoins_y', url: 'https://example.com/7', updatedAt: '2026-09-24T10:00:00Z' }],
    ...overrides,
  };
}

describe('mission-control config', () => {
  it('defaults missionStatePath under the user home', () => {
    const config = loadConfig({ NODE_ENV: 'development' });
    expect(config.missionStatePath.endsWith(join('.local', 'share', 'mission-control', 'state.json'))).toBe(true);
  });

  it('honours MISSION_CONTROL_STATE_PATH', () => {
    const config = loadConfig({ NODE_ENV: 'development', MISSION_CONTROL_STATE_PATH: '/tmp/custom-state.json' });
    expect(config.missionStatePath).toBe('/tmp/custom-state.json');
  });
});

describe('GET /study/api/mission-control', () => {
  let ctx: TestContext;
  afterEach(() => ctx.cleanup());

  describe('auth boundary', () => {
    beforeEach(() => {
      ctx = makeTestContext({ devBypass: false, passwordHash: hashPassword('correct horse') });
    });

    it('rejects unauthenticated requests with the deliberate 401 JSON', async () => {
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'authentication required', code: 'UNAUTHENTICATED' });
    });

    it('serves authenticated requests', async () => {
      const login = await request(ctx.app).post('/study/api/auth/login').send({ password: 'correct horse' });
      const cookie = login.headers['set-cookie']![0]!;
      const res = await request(ctx.app).get('/study/api/mission-control').set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });

  describe('snapshot states', () => {
    it('merges a valid fresh snapshot with canonical study data', async () => {
      ctx = makeTestContext();
      writeFileSync(ctx.config.missionStatePath, JSON.stringify(fixtureSnapshot()), { mode: 0o600 });
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(typeof res.body.generatedAt).toBe('string');

      expect(res.body.personal.available).toBe(true);
      expect(res.body.personal.stale).toBe(false);
      expect(res.body.personal.snapshot.tasks.openCount).toBe(1);
      expect(res.body.personal.snapshot.habits.daily_target_minutes).toBe(240);

      // Study data is derived from the canonical LessonService tree, never the snapshot.
      expect(res.body.study.nextLesson.id).toBe('sse-101-lesson-one');
      expect(res.body.study.nextLesson.title).toBe('Lesson One');
      expect(res.body.study.resume).toBeNull();
      expect(res.body.study.unfinishedCount).toBe(0);
      expect(typeof res.body.study.dueFlashcards).toBe('number');
      expect(res.body.study.courses).toHaveLength(1);
      const course = res.body.study.courses[0];
      expect(course.id).toBe('sse');
      expect(course.title).toBe('Software Systems Engineering');
      expect(course.status).toBe('active');
      expect(course.progress.plannedLessons).toBe(2);
      expect(typeof course.studyMinutes).toBe('number');
      expect(course.nextLesson.id).toBe('sse-101-lesson-one');
    });

    it('reports a missing snapshot safely and still serves study data', async () => {
      ctx = makeTestContext(); // default missionStatePath does not exist
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(res.body.personal.available).toBe(false);
      expect(res.body.personal.reason).toBe(MISSION_REASONS.notFound);
      expect(res.body.study.nextLesson.id).toBe('sse-101-lesson-one');
    });

    it('reports invalid JSON safely without leaking paths or parser errors', async () => {
      ctx = makeTestContext();
      writeFileSync(ctx.config.missionStatePath, '{not json', 'utf8');
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(res.body.personal.available).toBe(false);
      expect(res.body.personal.reason).toBe(MISSION_REASONS.invalidJson);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain(ctx.config.missionStatePath);
      expect(body).not.toContain('Unexpected token');
    });

    it('reports an oversized snapshot safely', async () => {
      ctx = makeTestContext();
      writeFileSync(ctx.config.missionStatePath, ' '.repeat(SNAPSHOT_MAX_BYTES + 16), 'utf8');
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(res.body.personal.available).toBe(false);
      expect(res.body.personal.reason).toBe(MISSION_REASONS.tooLarge);
    });

    it('reports a structurally invalid snapshot safely', async () => {
      ctx = makeTestContext();
      writeFileSync(ctx.config.missionStatePath, JSON.stringify([1, 2, 3]), 'utf8');
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(res.body.personal.available).toBe(false);
      expect(res.body.personal.reason).toBe(MISSION_REASONS.invalidShape);
    });

    it('marks snapshots older than 15 minutes stale but still returns bounded data', async () => {
      ctx = makeTestContext();
      const old = new Date(Date.now() - STALE_AFTER_MS - 60_000).toISOString();
      writeFileSync(ctx.config.missionStatePath, JSON.stringify(fixtureSnapshot({ generatedAt: old })), 'utf8');
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(res.body.personal.available).toBe(true);
      expect(res.body.personal.stale).toBe(true);
      expect(res.body.personal.snapshot.tasks.openCount).toBe(1);
    });

    it('bounds oversized arrays and strings from a hostile snapshot', async () => {
      ctx = makeTestContext();
      const hostile = fixtureSnapshot({
        tasks: {
          open: Array.from({ length: 500 }, (_, i) => ({ text: `task ${i}`, section: 's' })),
          openCount: 500,
        },
        goals: { active: ['x'.repeat(10_000)] },
        githubIssues: Array.from({ length: 900 }, (_, i) => ({ number: i, title: 't' })),
      });
      writeFileSync(ctx.config.missionStatePath, JSON.stringify(hostile), 'utf8');
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(res.body.personal.available).toBe(true);
      const snap = res.body.personal.snapshot;
      expect(snap.tasks.open.length).toBeLessThanOrEqual(100);
      expect(snap.githubIssues.length).toBeLessThanOrEqual(100);
      expect(snap.goals.active[0].length).toBeLessThanOrEqual(500);
      expect(JSON.stringify(res.body).length).toBeLessThan(SNAPSHOT_MAX_BYTES);
    });

    it('never crashes on non-finite numbers or deep nesting', async () => {
      ctx = makeTestContext();
      let deep: Record<string, unknown> = { value: 'leaf' };
      for (let i = 0; i < 40; i += 1) deep = { nested: deep };
      const weird = fixtureSnapshot({ deep, habits: { total: 'not-a-number' } });
      writeFileSync(ctx.config.missionStatePath, JSON.stringify(weird), 'utf8');
      const res = await request(ctx.app).get('/study/api/mission-control');
      expect(res.status).toBe(200);
      expect(res.body.personal.available).toBe(true);
    });
  });
});
