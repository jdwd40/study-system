import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { makeTestContext, type TestContext } from './helpers.js';

const UPSTREAM = 'http://tasks.test';
const WRITE = { 'X-JDCT-Request': '1' };

const jsonUpstream = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const sampleTask = { id: 1, title: 'Write tests', progress: null, position: 100, source: 'api', created_at: 't' };

describe('jdct-tasks proxy', () => {
  let ctx: TestContext;
  beforeEach(() => {
    ctx = makeTestContext({ taskApiUrl: UPSTREAM });
  });
  afterEach(() => {
    ctx.cleanup();
    vi.unstubAllGlobals();
  });

  it('rejects unauthenticated requests on every task route', async () => {
    const unauth = makeTestContext({ devBypass: false, taskApiUrl: UPSTREAM });
    const agent = request(unauth.app);
    try {
      const calls = [
        agent.get('/study/api/tasks'),
        agent.post('/study/api/tasks').send({ title: 'x' }).set(WRITE),
        agent.patch('/study/api/tasks/1').send({ progress: 50 }).set(WRITE),
        agent.delete('/study/api/tasks/1').set(WRITE),
        agent.put('/study/api/tasks/reorder').send({ taskIds: [1] }).set(WRITE),
        agent.post('/study/api/obsidian/scan').set(WRITE),
      ];
      for (const call of calls) {
        const res = await call;
        expect(res.status).toBe(401);
        expect(res.body.code).toBe('UNAUTHENTICATED');
        expect(res.headers['cache-control']).toBe('private, no-store');
        expect(res.headers.vary).toBe('Cookie');
      }
    } finally {
      unauth.cleanup();
    }
  });

  it('returns 503 when TASK_API_URL is not configured', async () => {
    const bare = makeTestContext();
    try {
      const res = await request(bare.app).get('/study/api/tasks');
      expect(res.status).toBe(503);
      expect(res.body.code).toBe('TASKS_NOT_CONFIGURED');
    } finally {
      bare.cleanup();
    }
  });

  it('rejects writes without the X-JDCT-Request header and never calls upstream', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = await request(ctx.app).post('/study/api/tasks').send({ title: 'x' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CSRF_REJECTED');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a cross-site, malformed, or null Origin', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonUpstream(201, sampleTask));
    vi.stubGlobal('fetch', fetchMock);
    for (const origin of ['https://evil.example', 'not a url', 'null']) {
      const res = await request(ctx.app)
        .post('/study/api/tasks')
        .set(WRITE)
        .set('Host', 'study.test')
        .set('Origin', origin)
        .send({ title: 'x' });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CSRF_REJECTED');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts a matching Origin, honouring the nginx-forwarded proto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonUpstream(201, sampleTask));
    vi.stubGlobal('fetch', fetchMock);
    const ok = await request(ctx.app)
      .post('/study/api/tasks')
      .set(WRITE)
      .set('Host', 'study.test')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'https://study.test')
      .send({ title: 'x' });
    expect(ok.status).toBe(201);
    const wrongProto = await request(ctx.app)
      .post('/study/api/tasks')
      .set(WRITE)
      .set('Host', 'study.test')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'http://study.test')
      .send({ title: 'x' });
    expect(wrongProto.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes GET through without forwarding cookies or authorization upstream', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonUpstream(200, { tasks: [sampleTask] }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await request(ctx.app)
      .get('/study/api/tasks')
      .set('Cookie', 'study_session=secret')
      .set('Authorization', 'Bearer secret');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers.vary).toBe('Cookie');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${UPSTREAM}/api/tasks`);
    expect(init.method).toBe('GET');
    expect(init.redirect).toBe('error');
    expect(init.body).toBeUndefined();
    const headers = init.headers as Record<string, string>;
    expect(headers.cookie).toBeUndefined();
    expect(headers.authorization).toBeUndefined();
  });

  it('forwards JSON bodies on writes and passes status/body back', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonUpstream(201, { ...sampleTask, id: 7 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await request(ctx.app).post('/study/api/tasks').set(WRITE).send({ title: 'Write tests' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(7);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['content-type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ title: 'Write tests' }));
  });

  it('passes a 204 delete through with no body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await request(ctx.app).delete('/study/api/tasks/5').set(WRITE);
    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${UPSTREAM}/api/tasks/5`);
    expect(init.method).toBe('DELETE');
  });

  it('routes PUT /tasks/reorder to the reorder endpoint, never an id route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonUpstream(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await request(ctx.app).put('/study/api/tasks/reorder').set(WRITE).send({ taskIds: [2, 1] });
    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${UPSTREAM}/api/tasks/reorder`);
    expect(init.body).toBe(JSON.stringify({ taskIds: [2, 1] }));
  });

  it('rejects unsafe task ids before touching upstream', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    for (const id of ['abc', '0', '-1', '1e0', '1%2F2']) {
      const res = await request(ctx.app).patch(`/study/api/tasks/${id}`).set(WRITE).send({ progress: 50 });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('TASK_ID_INVALID');
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps upstream network failure/timeout to a sanitized 502', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error(`connect ECONNREFUSED ${UPSTREAM}`));
    vi.stubGlobal('fetch', fetchMock);
    const res = await request(ctx.app).get('/study/api/tasks');
    expect(res.status).toBe(502);
    expect(res.body.code).toBe('TASK_UPSTREAM');
    expect(JSON.stringify(res.body)).not.toContain(UPSTREAM);
    expect(res.headers['cache-control']).toBe('private, no-store');
  });

  it('proxies the manual Obsidian scan without a body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonUpstream(200, { files: 12, imported: 3, skipped: 9 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await request(ctx.app).post('/study/api/obsidian/scan').set(WRITE);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ files: 12, imported: 3, skipped: 9 });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${UPSTREAM}/api/obsidian/scan`);
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });
});
