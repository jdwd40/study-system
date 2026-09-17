import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { makeTestContext, type TestContext } from './helpers.js';
import { hashPassword } from '../src/server/auth.js';

describe('auth boundary', () => {
  let ctx: TestContext;
  afterEach(() => ctx.cleanup());

  describe('production-style password auth', () => {
    beforeEach(() => {
      ctx = makeTestContext({ devBypass: false, passwordHash: hashPassword('correct horse') });
    });

    it('rejects unauthenticated API access with 401', async () => {
      const res = await request(ctx.app).get('/study/api/courses');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHENTICATED');
    });

    it('health endpoint is public', async () => {
      const res = await request(ctx.app).get('/study/api/health');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('rejects a wrong password', async () => {
      const res = await request(ctx.app).post('/study/api/auth/login').send({ password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('accepts the right password and then authorises via session cookie', async () => {
      const login = await request(ctx.app).post('/study/api/auth/login').send({ password: 'correct horse' });
      expect(login.status).toBe(200);
      const cookie = login.headers['set-cookie']![0]!;
      expect(cookie).toContain('HttpOnly');
      const authed = await request(ctx.app).get('/study/api/courses').set('Cookie', cookie);
      expect(authed.status).toBe(200);
      const me = await request(ctx.app).get('/study/api/auth/me').set('Cookie', cookie);
      expect(me.body.authenticated).toBe(true);
      const out = await request(ctx.app).post('/study/api/auth/logout').set('Cookie', cookie);
      expect(out.status).toBe(200);
      const after = await request(ctx.app).get('/study/api/courses').set('Cookie', cookie);
      expect(after.status).toBe(401);
    });
  });

  describe('dev bypass', () => {
    beforeEach(() => {
      ctx = makeTestContext({ devBypass: true });
    });

    it('allows API access without login', async () => {
      const res = await request(ctx.app).get('/study/api/courses');
      expect(res.status).toBe(200);
    });

    it('reports devBypass on /auth/me', async () => {
      const res = await request(ctx.app).get('/study/api/auth/me');
      expect(res.body).toEqual({ authenticated: true, devBypass: true });
    });
  });

  describe('integration auth', () => {
    beforeEach(() => {
      ctx = makeTestContext();
    });

    it('rejects integration calls without the bearer secret', async () => {
      const res = await request(ctx.app).get('/study/api/integration/next-lesson');
      expect(res.status).toBe(401);
    });

    it('rejects a wrong bearer secret', async () => {
      const res = await request(ctx.app)
        .get('/study/api/integration/next-lesson')
        .set('Authorization', 'Bearer wrong');
      expect(res.status).toBe(401);
    });

    it('accepts the configured bearer secret', async () => {
      const res = await request(ctx.app)
        .get('/study/api/integration/next-lesson')
        .set('Authorization', 'Bearer test-integration-secret');
      expect(res.status).toBe(200);
      expect(res.body.lesson.id).toBe('sse-101-lesson-one');
    });

    it('returns 503 when no integration secret is configured', async () => {
      ctx.cleanup();
      ctx = makeTestContext({ integrationSecret: null });
      const res = await request(ctx.app)
        .get('/study/api/integration/next-lesson')
        .set('Authorization', 'Bearer anything');
      expect(res.status).toBe(503);
    });
  });
});
