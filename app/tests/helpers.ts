import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Express } from 'express';
import { openDb, type Db } from '../src/server/db.js';
import { StudyRepo } from '../src/server/repo.js';
import { ContentStore } from '../src/server/contentStore.js';
import { GitSync } from '../src/server/gitSync.js';
import { LessonService } from '../src/server/lessonService.js';
import { StructureService } from '../src/server/structureService.js';
import { buildApp, type AppDeps } from '../src/server/app.js';
import { serializeCourse, serializeLesson, serializeModule } from '../src/shared/content.js';
import type { AppConfig } from '../src/server/config.js';
import type { LessonDoc } from '../src/shared/types.js';

export function tmpDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), `study-${prefix}-`));
}

export function cleanup(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

export function makeLesson(overrides: Partial<LessonDoc> = {}): LessonDoc {
  return {
    schemaVersion: 1,
    type: 'lesson',
    id: 'sse-101-lesson-one',
    title: 'Lesson One',
    courseId: 'sse',
    moduleId: 'SSE-101',
    order: 1,
    objective: 'Learn the first thing.',
    content: 'Some content.',
    keyConcepts: ['Concept A'],
    examples: ['Example A'],
    takeaways: ['Takeaway A'],
    sources: ['Source A'],
    flashcards: [
      { q: 'Q1?', a: 'A1' },
      { q: 'Q2?', a: 'A2' },
    ],
    revisionQuestions: ['RQ1?'],
    ...overrides,
  };
}

/** Write a small valid content tree: one course, one module, two lessons. */
export function writeTestTree(contentDir: string): void {
  const store = new ContentStore(contentDir);
  const course = {
    schemaVersion: 1,
    type: 'course' as const,
    id: 'sse',
    title: 'Software Systems Engineering',
    description: 'Engineering complete systems.',
    status: 'active' as const,
  };
  const module = {
    schemaVersion: 1,
    type: 'module' as const,
    id: 'SSE-101',
    title: 'Software Architecture Foundations',
    courseId: 'sse',
    order: 1,
    status: 'active' as const,
    summary: 'Foundations.',
    objectives: ['Objective A'],
  };
  const l1 = makeLesson();
  const l2 = makeLesson({ id: 'sse-101-lesson-two', title: 'Lesson Two', order: 2 });
  store.writeRaw('sse/README.md', serializeCourse(course, [{ dir: 'sse-101', title: module.title, status: 'active' }]));
  store.writeRaw(
    'sse/sse-101/README.md',
    serializeModule(module, [
      { id: l1.id, title: l1.title },
      { id: l2.id, title: l2.title },
    ]),
  );
  store.writeLesson(l1);
  store.writeLesson(l2);
}

export function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    port: 0,
    host: '127.0.0.1',
    dbPath: ':memory:',
    contentDir: tmpDir('content'),
    repoRoot: tmpDir('repo'),
    webDist: '/nonexistent',
    passwordHash: null,
    devBypass: true,
    integrationSecret: 'test-integration-secret',
    nodeEnv: 'test',
    ...overrides,
  };
}

export interface TestContext {
  deps: AppDeps;
  app: Express;
  repo: StudyRepo;
  service: LessonService;
  store: ContentStore;
  gitSync: GitSync;
  structure: StructureService;
  db: Db;
  config: AppConfig;
  cleanup: () => void;
}

export function makeTestContext(configOverrides: Partial<AppConfig> = {}, withTree = true): TestContext {
  const config = makeConfig(configOverrides);
  if (withTree) writeTestTree(config.contentDir);
  const db = openDb(':memory:');
  const repo = new StudyRepo(db);
  const store = new ContentStore(config.contentDir);
  const gitSync = new GitSync(config.repoRoot, repo);
  const service = new LessonService(repo, store);
  const structure = new StructureService(config, store, gitSync);
  const deps: AppDeps = { config, repo, store, gitSync, service, structure };
  const app = buildApp(deps);
  return {
    deps,
    app,
    repo,
    service,
    store,
    gitSync,
    structure,
    db,
    config,
    cleanup: () => {
      db.close();
      cleanup(config.contentDir);
      cleanup(config.repoRoot);
    },
  };
}

/** Parse a lesson back out of a content dir. */
export { serializeLesson };

function git(args: string[], cwd: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null' } });
}

export interface GitTestContext extends TestContext {
  work: string;
  remote: string;
  other: string;
  baseDir: string;
}

/**
 * Context whose contentDir lives inside a REAL git working clone (with a bare
 * remote and a second clone `other` for divergence scenarios). Structure and
 * content writes therefore exercise the actual pull/commit/push path.
 */
export function makeGitTestContext(): GitTestContext {
  const baseDir = tmpDir('git-ctx');
  const remote = join(baseDir, 'remote.git');
  const seed = join(baseDir, 'seed');
  mkdirSync(remote, { recursive: true });
  git(['init', '--bare', '-b', 'main', remote], baseDir);
  mkdirSync(seed, { recursive: true });
  git(['init', '-b', 'main'], seed);
  git(['config', 'user.email', 'test@example.com'], seed);
  git(['config', 'user.name', 'Test'], seed);
  mkdirSync(join(seed, 'content'), { recursive: true });
  writeTestTree(join(seed, 'content'));
  writeFileSync(join(seed, 'README.md'), '# test\n');
  git(['add', '.'], seed);
  git(['commit', '-m', 'init'], seed);
  git(['remote', 'add', 'origin', remote], seed);
  git(['push', '-u', 'origin', 'main'], seed);

  const work = join(baseDir, 'work');
  const other = join(baseDir, 'other');
  git(['clone', remote, work], baseDir);
  git(['clone', remote, other], baseDir);
  for (const dir of [work, other]) {
    git(['config', 'user.email', 'test@example.com'], dir);
    git(['config', 'user.name', 'Test'], dir);
  }

  const config = makeConfig({ contentDir: join(work, 'content'), repoRoot: work });
  const db = openDb(':memory:');
  const repo = new StudyRepo(db);
  const store = new ContentStore(config.contentDir);
  const gitSync = new GitSync(config.repoRoot, repo);
  const service = new LessonService(repo, store);
  const structure = new StructureService(config, store, gitSync);
  const deps: AppDeps = { config, repo, store, gitSync, service, structure };
  const app = buildApp(deps);
  return {
    deps,
    app,
    repo,
    service,
    store,
    gitSync,
    structure,
    db,
    config,
    work,
    remote,
    other,
    baseDir,
    cleanup: () => {
      db.close();
      cleanup(baseDir);
    },
  };
}

/** Run git inside a context working clone. */
export function gitIn(cwd: string, args: string[]): string {
  return git(args, cwd);
}
