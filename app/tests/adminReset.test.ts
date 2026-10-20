import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { PassThrough } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { hashPassword, verifyPassword } from '../src/server/auth.js';
import { findManagedApp, promptPassword, resetPassword } from '../src/server/jdct.js';
import { loadConfig } from '../src/server/config.js';
import { openDb } from '../src/server/db.js';
import { StudyRepo } from '../src/server/repo.js';
import { buildApp } from '../src/server/app.js';
import { makeTestContext, tmpDir, cleanup } from './helpers.js';

vi.mock('node:child_process', async (original) => ({
  ...await original<typeof import('node:child_process')>(),
  execFileSync: vi.fn(),
}));

afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });

function terminal() {
  vi.stubEnv('TERM', 'xterm');
  const input = Object.assign(new PassThrough(), { isTTY: true, setRawMode: vi.fn(), isRaw: false });
  const output = Object.assign(new PassThrough(), { isTTY: true });
  let displayed = '';
  output.on('data', (chunk) => { displayed += chunk.toString(); });
  return { input, output, displayed: () => displayed };
}

describe('hidden terminal password confirmation', () => {
  it('hides both entries, supports editing and restores the terminal', async () => {
    const term = terminal();
    const pending = promptPassword(term.input as unknown as NodeJS.ReadStream, term.output as unknown as NodeJS.WriteStream);
    await new Promise<void>((done) => setImmediate(done));
    for (const character of 'secret-x') term.input.write(character);
    term.input.write('\x7f');
    term.input.write('\r');
    await Promise.resolve();
    for (const character of 'secret-\r') term.input.write(character);
    await expect(pending).resolves.toBe('secret-');
    expect(term.displayed()).toBe('New password: \nConfirm password: \n');
    expect(term.input.setRawMode).toHaveBeenLastCalledWith(false);
    expect(term.input.listenerCount('keypress')).toBe(0);
  });

  it.each([['first', 'second'], ['', ''], ['   ', '   ']])('rejects mismatched or blank input', async (first, second) => {
    const term = terminal();
    const pending = promptPassword(term.input as unknown as NodeJS.ReadStream, term.output as unknown as NodeJS.WriteStream);
    term.input.write(`${first}\r`);
    await Promise.resolve();
    term.input.write(`${second}\r`);
    await expect(pending).rejects.toThrow();
    expect(term.displayed()).toBe('New password: \nConfirm password: \n');
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it.each(['\x03', '\x04'])('cancels on interrupt/EOF and restores terminal mode', async (key) => {
    const term = terminal();
    const pending = promptPassword(term.input as unknown as NodeJS.ReadStream, term.output as unknown as NodeJS.WriteStream);
    term.input.write(key);
    await expect(pending).rejects.toThrow('cancelled');
    expect(term.input.setRawMode).toHaveBeenLastCalledWith(false);
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it.each(['input', 'output'] as const)('rejects redirected %s before reading secrets', async (stream) => {
    const term = terminal();
    term[stream].isTTY = false;
    await expect(promptPassword(term.input as unknown as NodeJS.ReadStream, term.output as unknown as NodeJS.WriteStream)).rejects.toThrow('terminal');
    expect(term.displayed()).toBe('');
  });
});

function managedApp(dbPath: string) {
  const oldHash = hashPassword('old password');
  return {
    name: 'study-system', pm_id: 42,
    pm2_env: {
      pm_cwd: resolve('.'), status: 'online', STUDY_PASSWORD_HASH: oldHash, STUDY_DB_PATH: dbPath,
      env: { NODE_ENV: 'production', STUDY_PASSWORD_HASH: oldHash, STUDY_DB_PATH: dbPath, STUDY_INTEGRATION_SECRET: 'test-only-secret' },
    },
  };
}

describe('local existing PM2 credential reset', () => {
  it('rejects passwords exceeding the login bound before opening a database', () => {
    expect(() => resetPassword('x'.repeat(257), managedApp('/unused'))).toThrow('256');
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('targets only the existing running backend in this checkout', () => {
    const app = managedApp('/unused');
    vi.mocked(execFileSync).mockReturnValue(JSON.stringify([app]));
    expect(findManagedApp()).toEqual(app);
    for (const record of [[], [app, app], [{ ...app, pm2_env: { ...app.pm2_env, pm_cwd: '/other' } }],
      [{ ...app, pm2_env: { ...app.pm2_env, status: 'stopped' } }],
      [{ ...app, pm2_env: { ...app.pm2_env, STUDY_PASSWORD_HASH: undefined } }]]) {
      vi.mocked(execFileSync).mockReturnValue(JSON.stringify(record));
      expect(findManagedApp).toThrow();
    }
  });

  it('uses the existing scrypt verifier, persists the hash, revokes sessions and supports normal login', async () => {
    const dir = tmpDir('reset');
    const dbPath = join(dir, 'study.db');
    const db = openDb(dbPath);
    const repo = new StudyRepo(db);
    const managed = managedApp(dbPath);
    const ctx = makeTestContext({ devBypass: false, passwordHash: managed.pm2_env.STUDY_PASSWORD_HASH });
    const app = buildApp({ ...ctx.deps, repo });
    vi.stubEnv('STUDY_DEV_BYPASS', '1');
    vi.mocked(execFileSync).mockImplementation((_file, args, options) => {
      if (args?.[0] === 'restart') {
        const env = (options as { env: NodeJS.ProcessEnv }).env;
        expect(env.STUDY_DEV_BYPASS).toBeUndefined();
        expect(env.STUDY_INTEGRATION_SECRET).toBe('test-only-secret');
        ctx.config.passwordHash = loadConfig(env).passwordHash;
      }
      return '';
    });
    try {
      const before = await request(app).post('/study/api/auth/login').send({ password: 'old password' });
      const cookie = before.headers['set-cookie']![0]!;
      expect((await request(app).get('/study/api/auth/me').set('Cookie', cookie)).body.authenticated).toBe(true);
      const untouched = db.prepare('SELECT * FROM kv').all();
      resetPassword('new password 🔒', managed);
      expect(verifyPassword('new password 🔒', repo.passwordHash(ctx.config.passwordHash)!)).toBe(true);
      expect(verifyPassword('old password', repo.passwordHash(ctx.config.passwordHash)!)).toBe(false);
      expect((await request(app).get('/study/api/auth/me').set('Cookie', cookie)).body.authenticated).toBe(false);
      expect((await request(app).post('/study/api/auth/login').send({ password: 'old password' })).status).toBe(401);
      const login = await request(app).post('/study/api/auth/login').send({ password: 'new password 🔒' });
      expect(login.status).toBe(200);
      expect((await request(app).get('/study/api/auth/me').set('Cookie', login.headers['set-cookie']![0]!)).body.authenticated).toBe(true);
      expect(db.prepare('SELECT * FROM kv').all()).toEqual(untouched);
      const calls = vi.mocked(execFileSync).mock.calls;
      expect(calls).toHaveLength(0);
      expect(ctx.config.passwordHash).toBe(managed.pm2_env.STUDY_PASSWORD_HASH);
    } finally { db.close(); ctx.cleanup(); cleanup(dir); }
  });

  it('resets a database credential override without reverting to stale PM2 credentials', async () => {
    const dir = tmpDir('reset-override');
    const dbPath = join(dir, 'study.db');
    const db = openDb(dbPath);
    try {
      db.prepare('INSERT INTO auth_credentials VALUES (1, ?)').run(hashPassword('recovered password'));
      const repo = new StudyRepo(db);
      repo.createSession('existing', '2099-01-01T00:00:00Z');
      resetPassword('new owner password', managedApp(dbPath));
      expect(verifyPassword('new owner password', repo.passwordHash(null)!)).toBe(true);
      expect(repo.getSession('existing')).toBeNull();
      expect(execFileSync).not.toHaveBeenCalled();
    } finally { db.close(); cleanup(dir); }
  });

  it.each(['restart', 'save'])('refuses missing databases and reports a PM2 %s failure safely', (failingStep) => {
    const dir = tmpDir('reset-failure');
    const dbPath = join(dir, 'study.db');
    try {
      expect(() => resetPassword('new password', managedApp(dbPath))).toThrow();
      expect(execFileSync).not.toHaveBeenCalled();
      const db = openDb(dbPath);
      db.exec('DROP TABLE auth_credentials'); // Explicit pre-upgrade fallback only.
      const repo = new StudyRepo(db);
      repo.createSession('test-token', '2099-01-01T00:00:00Z');
      vi.mocked(execFileSync).mockImplementation((_file, args) => {
        expect(repo.getSession('test-token')).toBeNull();
        if (args?.[0] === failingStep) throw new Error('sensitive subprocess output');
        return '';
      });
      try {
        expect(() => resetPassword('new password', managedApp(dbPath))).toThrow('PM2 update/save failed');
        expect(repo.getSession('test-token')).toBeNull();
        expect(vi.mocked(execFileSync).mock.calls.map((call) => call[1])).toEqual(failingStep === 'restart' ? [['restart', '42', '--update-env']] : [['restart', '42', '--update-env'], ['save']]);
      } finally { db.close(); }
    } finally { cleanup(dir); }
  });
});
