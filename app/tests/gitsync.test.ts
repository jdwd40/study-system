import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, tmpDir } from './helpers.js';
import { openDb } from '../src/server/db.js';
import { StudyRepo } from '../src/server/repo.js';
import { GitSync, SyncError } from '../src/server/gitSync.js';

function git(args: string[], cwd: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null' } });
}

/** Create a bare remote and a working clone with one canonical commit. */
function makeRepos(): { remote: string; work: string; other: string } {
  const base = tmpDir('git');
  const remote = join(base, 'remote.git');
  const seed = join(base, 'seed');
  mkdirSync(remote, { recursive: true });
  git(['init', '--bare', '-b', 'main', remote], base);
  mkdirSync(seed, { recursive: true });
  git(['init', '-b', 'main'], seed);
  git(['config', 'user.email', 'test@example.com'], seed);
  git(['config', 'user.name', 'Test'], seed);
  mkdirSync(join(seed, 'content'), { recursive: true });
  writeFileSync(join(seed, 'content', 'seed.md'), '# seed\n');
  writeFileSync(join(seed, 'README.md'), '# test\n');
  git(['add', '.'], seed);
  git(['commit', '-m', 'init'], seed);
  git(['remote', 'add', 'origin', remote], seed);
  git(['push', '-u', 'origin', 'main'], seed);
  const work = join(base, 'work');
  const other = join(base, 'other');
  git(['clone', remote, work], base);
  git(['clone', remote, other], base);
  for (const dir of [work, other]) {
    git(['config', 'user.email', 'test@example.com'], dir);
    git(['config', 'user.name', 'Test'], dir);
  }
  return { remote, work, other };
}

describe('git sync', () => {
  let dirs: string[] = [];
  let repo: StudyRepo;
  let db: ReturnType<typeof openDb>;

  beforeEach(() => {
    db = openDb(':memory:');
    repo = new StudyRepo(db);
  });

  afterEach(() => {
    db.close();
    for (const d of dirs) cleanup(d);
    dirs = [];
  });

  it('pull --ff-only, stage canonical paths, commit and push records ok events', async () => {
    const { work } = makeRepos();
    dirs.push(join(work, '..'));
    const sync = new GitSync(work, repo);
    await sync.pullFfOnly();
    writeFileSync(join(work, 'content', 'new-lesson.md'), '# lesson\n');
    await sync.commitAndPush(['content/new-lesson.md'], 'content: add lesson');
    const events = repo.recentSyncEvents(10);
    expect(events.filter((e) => e.status === 'ok').map((e) => e.type)).toContain('push');
    expect(git(['log', '--oneline', 'origin/main'], work)).toContain('content: add lesson');
  });

  it('refuses to stage files outside canonical content (no private files guard)', async () => {
    const { work } = makeRepos();
    dirs.push(join(work, '..'));
    const sync = new GitSync(work, repo);
    writeFileSync(join(work, '.env'), 'SECRET=x\n');
    await expect(sync.commitAndPush(['.env'], 'bad')).rejects.toThrow(SyncError);
    await expect(sync.commitAndPush(['.env'], 'bad')).rejects.toThrow(/refusing to stage/);
    expect(repo.lastSyncError()?.message).toContain('refusing to stage');
    // .env must remain untracked
    expect(git(['status', '--porcelain'], work)).toContain('?? .env');
  });

  it('push failure is recorded as an error event and the working tree is preserved', async () => {
    const { work, other } = makeRepos();
    dirs.push(join(work, '..'));
    const sync = new GitSync(work, repo);
    // Diverge the remote so push is rejected.
    writeFileSync(join(other, 'content', 'other.md'), '# other\n');
    git(['add', '.'], other);
    git(['commit', '-m', 'other change'], other);
    git(['push'], other);

    writeFileSync(join(work, 'content', 'mine.md'), '# mine\n');
    await expect(sync.commitAndPush(['content/mine.md'], 'content: mine')).rejects.toThrow(/push failed/);
    const err = repo.lastSyncError();
    expect(err).not.toBeNull();
    expect(err!.type).toBe('push');
    // Local commit + file preserved for recovery, nothing silently claimed.
    expect(existsSync(join(work, 'content', 'mine.md'))).toBe(true);
    expect(git(['log', '--oneline'], work)).toContain('content: mine');
  });

  it('pull failure (diverged) surfaces as a sync error', async () => {
    const { work, other } = makeRepos();
    dirs.push(join(work, '..'));
    const sync = new GitSync(work, repo);
    writeFileSync(join(other, 'content', 'other.md'), '# other\n');
    git(['add', '.'], other);
    git(['commit', '-m', 'remote change'], other);
    git(['push'], other);
    writeFileSync(join(work, 'content', 'local.md'), '# local\n');
    git(['add', '.'], work);
    git(['commit', '-m', 'local change'], work);
    await expect(sync.pullFfOnly()).rejects.toThrow(/pull --ff-only failed/);
    expect(repo.lastSyncError()!.type).toBe('pull');
  });
});
