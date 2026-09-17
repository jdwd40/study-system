import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { gitIn, makeGitTestContext, makeLesson, type GitTestContext } from './helpers.js';

describe('structure management over HTTP with real git sync', () => {
  let ctx: GitTestContext;
  beforeEach(() => {
    ctx = makeGitTestContext();
  });
  afterEach(() => ctx.cleanup());

  const remoteLog = () => gitIn(ctx.work, ['log', '--oneline', 'origin/main']);

  it('creates a course: README + content index written, tree valid, pushed', async () => {
    const res = await request(ctx.app)
      .post('/study/api/structure/courses')
      .send({ id: 'philosophy', title: 'Philosophy', description: 'Big questions.', status: 'active' });
    expect(res.status).toBe(201);
    expect(res.body.paths).toContain('content/philosophy/README.md');
    expect(res.body.paths).toContain('content/README.md');

    const readme = readFileSync(join(ctx.config.contentDir, 'philosophy', 'README.md'), 'utf8');
    expect(readme).toContain('id: philosophy');
    expect(readme).toContain('# Philosophy');
    const index = readFileSync(join(ctx.config.contentDir, 'README.md'), 'utf8');
    expect(index).toContain('[Philosophy](./philosophy/README.md)');
    // No private/runtime fields in canonical Markdown
    expect(readme).not.toMatch(/rating|progress|attempt|review|mastery/i);
    expect(remoteLog()).toContain('content: create course philosophy');
    // Full tree still validates
    expect(ctx.store.loadTree().courses.map((c) => c.id)).toEqual(['philosophy', 'sse']);
  });

  it('rejects a duplicate course id with 409 and writes nothing', async () => {
    const before = remoteLog();
    const res = await request(ctx.app)
      .post('/study/api/structure/courses')
      .send({ id: 'sse', title: 'Dupe', description: 'Dupe.' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE_ID');
    expect(remoteLog()).toBe(before);
  });

  it('edits a course title/description/status and refreshes the content index', async () => {
    const res = await request(ctx.app)
      .put('/study/api/courses/sse')
      .send({ title: 'Software Systems Engineering (revised)', status: 'paused' });
    expect(res.status).toBe(200);
    const readme = readFileSync(join(ctx.config.contentDir, 'sse', 'README.md'), 'utf8');
    expect(readme).toContain('Software Systems Engineering (revised)');
    expect(readme).toContain('status: paused');
    const index = readFileSync(join(ctx.config.contentDir, 'README.md'), 'utf8');
    expect(index).toContain('[Software Systems Engineering (revised)](./sse/README.md)');
    expect(remoteLog()).toContain('content: update course sse');
  });

  it('editing an unknown course returns 404', async () => {
    const res = await request(ctx.app).put('/study/api/courses/nope').send({ title: 'X' });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('creates a module: module README written, course README index regenerated, pushed', async () => {
    const res = await request(ctx.app)
      .post('/study/api/structure/modules')
      .send({
        courseId: 'sse',
        id: 'SSE-201',
        title: 'Design Principles',
        summary: 'SOLID and friends.',
        objectives: ['Explain coupling', 'Explain cohesion'],
        order: 2,
        status: 'queued',
      });
    expect(res.status).toBe(201);
    expect(res.body.paths).toContain('content/sse/sse-201/README.md');
    expect(res.body.paths).toContain('content/sse/README.md');

    const moduleReadme = readFileSync(join(ctx.config.contentDir, 'sse', 'sse-201', 'README.md'), 'utf8');
    expect(moduleReadme).toContain('id: SSE-201');
    expect(moduleReadme).toContain('status: queued');
    expect(moduleReadme).toContain('No lessons yet');
    const courseReadme = readFileSync(join(ctx.config.contentDir, 'sse', 'README.md'), 'utf8');
    expect(courseReadme).toContain('[Design Principles](./sse-201/README.md) — queued');
    expect(remoteLog()).toContain('content: create module SSE-201');
  });

  it('creating a module in an unknown course returns 404', async () => {
    const res = await request(ctx.app)
      .post('/study/api/structure/modules')
      .send({ courseId: 'nope', id: 'X-1', title: 'X', summary: 'X.', objectives: ['x'], order: 1 });
    expect(res.status).toBe(404);
  });

  it('edits a module (order/status/summary/objectives) and keeps the course index coherent', async () => {
    const res = await request(ctx.app)
      .put('/study/api/courses/sse/modules/SSE-101')
      .send({ status: 'paused', summary: 'Updated summary.', objectives: ['New objective'] });
    expect(res.status).toBe(200);
    const moduleReadme = readFileSync(join(ctx.config.contentDir, 'sse', 'sse-101', 'README.md'), 'utf8');
    expect(moduleReadme).toContain('status: paused');
    expect(moduleReadme).toContain('Updated summary.');
    expect(moduleReadme).toContain('- New objective');
    const courseReadme = readFileSync(join(ctx.config.contentDir, 'sse', 'README.md'), 'utf8');
    expect(courseReadme).toContain('— paused');
  });

  it('creates a lesson in a module and regenerates the module lesson index', async () => {
    const lesson = makeLesson({ id: 'sse-101-lesson-three', title: 'Lesson Three', order: 3 });
    const res = await request(ctx.app).post('/study/api/structure/lesson').send(lesson);
    expect(res.status).toBe(201);
    expect(res.body.paths).toContain('content/sse/sse-101/sse-101-lesson-three.md');
    expect(res.body.paths).toContain('content/sse/sse-101/README.md');

    const moduleReadme = readFileSync(join(ctx.config.contentDir, 'sse', 'sse-101', 'README.md'), 'utf8');
    expect(moduleReadme).toContain('[Lesson Three](./sse-101-lesson-three.md)');
    expect(remoteLog()).toContain('content: create lesson sse-101-lesson-three');
  });

  it('creating a lesson in an unknown module returns 404 and writes nothing', async () => {
    const before = remoteLog();
    const lesson = makeLesson({ id: 'orphan-lesson', moduleId: 'SSE-999' });
    const res = await request(ctx.app).post('/study/api/structure/lesson').send(lesson);
    expect(res.status).toBe(404);
    expect(remoteLog()).toBe(before);
    expect(existsSync(join(ctx.config.contentDir, 'sse', 'sse-999'))).toBe(false);
  });

  it('edits lesson content and planned metadata; module index reflects the new title', async () => {
    const res = await request(ctx.app)
      .put('/study/api/lessons/sse-101-lesson-one/content')
      .send({ title: 'Lesson One (revised)', order: 5, estimatedMinutes: 30, content: 'Rewritten content.' });
    expect(res.status).toBe(200);
    const raw = readFileSync(join(ctx.config.contentDir, 'sse', 'sse-101', 'sse-101-lesson-one.md'), 'utf8');
    expect(raw).toContain('title: Lesson One (revised)');
    expect(raw).toContain('order: 5');
    expect(raw).toContain('estimated_minutes: 30');
    expect(raw).toContain('Rewritten content.');
    const moduleReadme = readFileSync(join(ctx.config.contentDir, 'sse', 'sse-101', 'README.md'), 'utf8');
    expect(moduleReadme).toContain('[Lesson One (revised)](./sse-101-lesson-one.md)');
  });

  it('meta-only edit rejects content fields', async () => {
    const res = await request(ctx.app)
      .put('/study/api/lessons/sse-101-lesson-one/meta')
      .send({ title: 'New title', content: 'not allowed here' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_FIELDS');
  });

  it('meta-only edit updates title/order/estimatedMinutes', async () => {
    const res = await request(ctx.app)
      .put('/study/api/lessons/sse-101-lesson-one/meta')
      .send({ order: 7, estimatedMinutes: 20 });
    expect(res.status).toBe(200);
    const raw = readFileSync(join(ctx.config.contentDir, 'sse', 'sse-101', 'sse-101-lesson-one.md'), 'utf8');
    expect(raw).toContain('order: 7');
    expect(raw).toContain('estimated_minutes: 20');
    // Objective/content untouched
    expect(raw).toContain('Learn the first thing.');
  });

  it('rejects invalid structure input with 422 and rolls the tree back', async () => {
    const before = remoteLog();
    const res = await request(ctx.app)
      .post('/study/api/structure/modules')
      .send({ courseId: 'sse', id: 'bad id!', title: 'Bad', summary: 'Bad.', objectives: ['x'], order: 1 });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('CONTENT_INVALID');
    expect(remoteLog()).toBe(before);
    expect(existsSync(join(ctx.config.contentDir, 'sse', 'bad id!'))).toBe(false);
  });

  it('full-tree validation: an unrelated broken file blocks any canonical write and the tree rolls back', async () => {
    // Corrupt a DIFFERENT lesson on disk (simulates a bad manual edit pulled from git).
    const otherLesson = join(ctx.config.contentDir, 'sse', 'sse-101', 'sse-101-lesson-two.md');
    writeFileSync(otherLesson, readFileSync(otherLesson, 'utf8').replace('order: 2', 'order: 2\nuser_rating: 5'));
    gitIn(ctx.work, ['add', '.']);
    gitIn(ctx.work, ['commit', '-m', 'corrupt lesson two']);
    gitIn(ctx.work, ['push']);

    const res = await request(ctx.app)
      .post('/study/api/structure/courses')
      .send({ id: 'philosophy', title: 'Philosophy', description: 'Big questions.' });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('CONTENT_INVALID');
    expect(JSON.stringify(res.body.issues)).toContain('user_rating');
    // Rollback: the half-created course must not survive on disk.
    expect(existsSync(join(ctx.config.contentDir, 'philosophy'))).toBe(false);
    // The corrupt file is left as-is (it came from git) and no new commit happened.
    expect(remoteLog()).toContain('corrupt lesson two');
    expect(remoteLog()).not.toContain('create course');
  });

  it('pull failure (diverged remote) surfaces as SYNC_ERROR and nothing is written', async () => {
    // Diverge: remote moves on AND the work clone has its own local commit.
    writeFileSync(join(ctx.other, 'content', 'elsewhere.md'), '# elsewhere\n');
    gitIn(ctx.other, ['add', '.']);
    gitIn(ctx.other, ['commit', '-m', 'other change']);
    gitIn(ctx.other, ['push']);
    writeFileSync(join(ctx.work, 'content', 'local.md'), '# local\n');
    gitIn(ctx.work, ['add', '.']);
    gitIn(ctx.work, ['commit', '-m', 'local change']);

    const res = await request(ctx.app)
      .post('/study/api/structure/courses')
      .send({ id: 'philosophy', title: 'Philosophy', description: 'Big questions.' });
    expect(res.status).toBe(502);
    expect(res.body.code).toBe('SYNC_ERROR');
    expect(res.body.stage).toBe('pull');
    // Nothing written, error recorded, no silent success.
    expect(existsSync(join(ctx.config.contentDir, 'philosophy'))).toBe(false);
    expect(ctx.repo.lastSyncError()?.type).toBe('pull');
    expect(remoteLog()).not.toContain('create course');
  });

  it('structure endpoints require authentication', async () => {
    const strict = makeGitTestContext();
    try {
      strict.config.devBypass = false;
      const res = await request(strict.app)
        .post('/study/api/structure/courses')
        .send({ id: 'x', title: 'X', description: 'X.' });
      expect(res.status).toBe(401);
    } finally {
      strict.cleanup();
    }
  });
});
