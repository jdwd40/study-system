import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { StudyRepo } from './repo.js';

const execFileP = promisify(execFile);

export class SyncError extends Error {
  constructor(
    message: string,
    readonly stage: 'pull' | 'stage' | 'commit' | 'push' | 'guard',
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

/** Paths Git sync is allowed to stage: canonical content, root README, nothing else. */
const ALLOWED_STAGE = /^(content\/|README\.md$)/;

async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileP('git', args, { cwd, maxBuffer: 16 * 1024 * 1024 });
  return stdout;
}

/**
 * Transactional Git synchronisation for canonical content.
 * Pull --ff-only before modifying; stage only canonical paths; commit and push;
 * every failure is recorded as a sync event and surfaced — never silently.
 */
export class GitSync {
  constructor(
    readonly repoRoot: string,
    private readonly repo: StudyRepo,
  ) {}

  async pullFfOnly(): Promise<void> {
    try {
      await git(['pull', '--ff-only'], this.repoRoot);
      this.repo.recordSyncEvent('pull', 'ok', null);
    } catch (err) {
      const message = `git pull --ff-only failed: ${(err as Error).message}`;
      this.repo.recordSyncEvent('pull', 'error', message);
      throw new SyncError(message, 'pull');
    }
  }

  /** Stage exactly the given paths (guarded), commit, push. Throws SyncError on any failure. */
  async commitAndPush(paths: string[], message: string): Promise<void> {
    for (const p of paths) {
      if (!ALLOWED_STAGE.test(p) || p.includes('..')) {
        const msg = `refusing to stage non-canonical path: ${p}`;
        this.repo.recordSyncEvent('push', 'error', msg);
        throw new SyncError(msg, 'guard');
      }
    }
    try {
      await git(['add', '--', ...paths], this.repoRoot);
    } catch (err) {
      const msg = `git add failed: ${(err as Error).message}`;
      this.repo.recordSyncEvent('push', 'error', msg);
      throw new SyncError(msg, 'stage');
    }

    // Defense in depth: inspect the staged set and refuse anything outside canonical paths.
    const staged = await git(['diff', '--cached', '--name-only'], this.repoRoot);
    const stagedFiles = staged.split('\n').filter((l) => l.trim() !== '');
    const illegal = stagedFiles.filter((f) => !ALLOWED_STAGE.test(f));
    if (illegal.length > 0) {
      const msg = `staged files outside canonical content refused: ${illegal.join(', ')}`;
      this.repo.recordSyncEvent('push', 'error', msg);
      throw new SyncError(msg, 'guard');
    }
    if (stagedFiles.length === 0) {
      this.repo.recordSyncEvent('push', 'ok', 'nothing to commit');
      return;
    }

    try {
      await git(['commit', '-m', message], this.repoRoot);
    } catch (err) {
      const msg = `git commit failed: ${(err as Error).message}`;
      this.repo.recordSyncEvent('push', 'error', msg);
      throw new SyncError(msg, 'commit');
    }

    try {
      await git(['push'], this.repoRoot);
      this.repo.recordSyncEvent('push', 'ok', message);
    } catch (err) {
      // Working tree and local commit are preserved for recovery; surface the failure.
      const msg = `git push failed (local commit preserved for recovery): ${(err as Error).message}`;
      this.repo.recordSyncEvent('push', 'error', msg);
      throw new SyncError(msg, 'push');
    }
  }
}
