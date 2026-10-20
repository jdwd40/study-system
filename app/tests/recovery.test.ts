import { spawnSync } from 'node:child_process';
import { StudyRepo } from '../src/server/repo.js';
import { bootstrapRecoveryCodes } from '../src/server/jdct.js';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { openDb } from '../src/server/db.js';
import { tmpDir, cleanup } from './helpers.js';
import request from 'supertest';
import { afterEach, expect, it, vi } from 'vitest';
import { hashPassword, recoveryDigest, rotateRecoveryCodes } from '../src/server/auth.js';
import { buildApp } from '../src/server/app.js';
import { makeTestContext } from './helpers.js';

const contexts: ReturnType<typeof makeTestContext>[] = [];
afterEach(() => { for (const ctx of contexts.splice(0)) ctx.cleanup(); });
function context() {
  const ctx = makeTestContext({ devBypass: false, passwordHash: hashPassword('old password') });
  contexts.push(ctx);
  return ctx;
}
async function login(app: ReturnType<typeof buildApp>, password = 'old password') {
  const response = await request(app).post('/study/api/auth/login').send({ password });
  expect(response.status).toBe(200);
  return response.headers['set-cookie']![0]!;
}

it('recovers with an authenticated one-time code, replacing the password durably and revoking sessions', async () => {
  const ctx = context();
  const cookie = await login(ctx.app);
  const rotation = await request(ctx.app).post('/study/api/auth/recovery-codes').set('Cookie', cookie).send({ password: 'old password' });
  expect(rotation.status).toBe(200);
  expect(rotation.headers['cache-control']).toBe('no-store');
  expect(rotation.body.codes).toHaveLength(10);
  expect(new Set(rotation.body.codes).size).toBe(10);
  for (const code of rotation.body.codes) expect(code).toMatch(/^[a-f0-9]{32}$/);
  const code = rotation.body.codes[0];
  expect(JSON.stringify(ctx.db.prepare('SELECT * FROM recovery_codes').all())).not.toContain(code);
  const recovered = await request(ctx.app).post('/study/api/auth/recover').send({ code, password: 'new password long' });
  expect(recovered.status).toBe(200);
  expect((await request(ctx.app).get('/study/api/auth/me').set('Cookie', cookie)).body.authenticated).toBe(false);
  expect((await request(ctx.app).post('/study/api/auth/login').send({ password: 'old password' })).status).toBe(401);
  await login(buildApp(ctx.deps), 'new password long');
  expect((await request(ctx.app).post('/study/api/auth/recover').send({ code, password: 'another password' })).status).toBe(401);
});

it('rejects unauthenticated rotation and wrong passwords without replacing codes', async () => {
  const ctx = context();
  const original = rotateRecoveryCodes(ctx.repo);
  expect((await request(ctx.app).post('/study/api/auth/recovery-codes').send({ password: 'old password' })).status).toBe(401);
  const cookie = await login(ctx.app);
  expect((await request(ctx.app).post('/study/api/auth/recovery-codes').set('Cookie', cookie).send({ password: 'wrong' })).status).toBe(401);
  expect(ctx.db.prepare('SELECT digest FROM recovery_codes WHERE digest = ?').get(recoveryDigest(original[0]!))).toBeDefined();
  const rotated = await request(ctx.app).post('/study/api/auth/recovery-codes').set('Cookie', cookie).send({ password: 'old password' });
  expect(rotated.status).toBe(200);
  expect((await request(ctx.app).post('/study/api/auth/recover').send({ code: original[0], password: 'new long password' })).status).toBe(401);
  expect((await request(ctx.app).get('/study/api/auth/recovery-codes').set('Cookie', cookie)).status).toBe(404);
});

it('leaves codes and sessions untouched for invalid input and consumes only one racing request', async () => {
  const ctx = context();
  const code = rotateRecoveryCodes(ctx.repo)[0]!;
  const cookie = await login(ctx.app);
  for (const password of ['', 'short', ' '.repeat(12), 'x'.repeat(257), {}, null]) {
    const failed = await request(ctx.app).post('/study/api/auth/recover').send({ code, password });
    expect(failed.status).toBe(401);
    expect(failed.body).toEqual({ error: 'invalid credentials', code: 'RECOVERY_FAILED' });
  }
  expect((await request(ctx.app).get('/study/api/auth/me').set('Cookie', cookie)).body.authenticated).toBe(true);
  const results = await Promise.all(['new long password A', 'new long password B'].map((password) => request(ctx.app).post('/study/api/auth/recover').send({ code, password })));
  expect(results.map((r) => r.status).sort()).toEqual([200, 401]);
  expect(ctx.db.prepare('SELECT * FROM recovery_codes').all()).toHaveLength(9);
});

it('rolls back code consumption and session revocation when credential replacement fails', () => {
  const ctx = context();
  const code = rotateRecoveryCodes(ctx.repo)[0]!;
  ctx.repo.createSession('existing', '2099-01-01T00:00:00Z');
  ctx.db.exec("CREATE TRIGGER fail_credentials BEFORE INSERT ON auth_credentials BEGIN SELECT RAISE(ABORT, 'test failure'); END");
  expect(() => ctx.repo.recoverPassword(recoveryDigest(code), hashPassword('new long password'))).toThrow('test failure');
  expect(ctx.repo.getSession('existing')).not.toBeNull();
  expect(ctx.repo.passwordHash(ctx.config.passwordHash)).toBe(ctx.config.passwordHash);
  ctx.db.exec('DROP TRIGGER fail_credentials');
  expect(ctx.repo.recoverPassword(recoveryDigest(code), hashPassword('new long password'))).toBe(true);
});

it('keeps the recovered credential across database reopen and idempotent migration with stale environment fallback', async () => {
  const ctx = context();
  const dir = tmpDir('recovery-reboot');
  const path = join(dir, 'study.db');
  let db = openDb(path);
  try {
    let repo = new StudyRepo(db);
    expect(repo.passwordHash(ctx.config.passwordHash)).toBe(ctx.config.passwordHash);
    const code = rotateRecoveryCodes(repo)[0]!;
    const app = buildApp({ ...ctx.deps, repo });
    expect((await request(app).post('/study/api/auth/recover').send({ code, password: 'persistent password' })).status).toBe(200);
    db.close();
    db = openDb(path);
    repo = new StudyRepo(db);
    const restarted = buildApp({ ...ctx.deps, repo });
    await login(restarted, 'persistent password');
    expect((await request(restarted).post('/study/api/auth/login').send({ password: 'old password' })).status).toBe(401);
    expect(repo.allowAuthAttempt('/probe', 0)).toBe(true);
    for (let i = 1; i < 20; i++) repo.allowAuthAttempt('/probe', 0);
    expect(repo.allowAuthAttempt('/probe', 1)).toBe(false);
    expect(repo.allowAuthAttempt('/probe', 900_000)).toBe(true);
  } finally { db.close(); cleanup(dir); }
});

it.each([
  ['environment', 'login'], ['override', 'login'],
  ['environment', 'recovery-codes'], ['override', 'recovery-codes'],
])('rejects stale %s credential proof for %s after a separate-process reset', async (source, route) => {
  const ctx = context();
  const dir = tmpDir('login-reset-race');
  const path = join(dir, 'study.db');
  const db = openDb(path);
  const repo = new StudyRepo(db);
  if (source === 'override') db.prepare('INSERT INTO auth_credentials VALUES (1, ?)').run(ctx.config.passwordHash);
  const originalCodes = rotateRecoveryCodes(repo);
  const app = buildApp({ ...ctx.deps, repo });
  const cookie = await login(app);
  const original = repo.passwordHash.bind(repo);
  vi.spyOn(repo, 'passwordHash').mockImplementationOnce((fallback) => {
    const observed = original(fallback);
    // Deterministic scheduling: another process commits after the credential read,
    // before this request completes its password proof or creates a session.
    const child = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', `
      import { resetPassword } from './src/server/jdct.ts';
      resetPassword('replacement password long', {
        pm_id: 0,
        pm2_env: { pm_cwd: process.cwd(), STUDY_DB_PATH: process.argv[1], env: {} },
      });
    `, path], { encoding: 'utf8', env: { ...process.env, PATH: '' } });
    expect(child.status).toBe(0);
    return observed;
  });
  try {
    const response = await request(app).post(`/study/api/auth/${route}`).set('Cookie', cookie).send({ password: 'old password' });
    expect(response.status).toBe(401);
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(response.body.codes).toBeUndefined();
    expect(db.prepare('SELECT * FROM sessions').all()).toHaveLength(0);
    expect(db.prepare('SELECT digest FROM recovery_codes ORDER BY digest').all()).toEqual(originalCodes.map((code) => ({ digest: recoveryDigest(code) })).sort((a, b) => a.digest.localeCompare(b.digest)));
  } finally { db.close(); cleanup(dir); }
});

it('bounds password verification before accepting oversized existing credentials', async () => {
  const ctx = context();
  ctx.config.passwordHash = hashPassword('x'.repeat(257));
  expect((await request(ctx.app).post('/study/api/auth/login').send({ password: 'x'.repeat(257) })).status).toBe(401);
});

it('bootstraps codes into an exclusive owner-only file without creating a missing database', () => {
  const dir = tmpDir('recovery-bootstrap');
  const dbPath = join(dir, 'study.db');
  const output = join(dir, 'codes');
  try {
    expect(() => bootstrapRecoveryCodes(dbPath, output)).toThrow();
    expect(existsSync(dbPath)).toBe(false);
    const db = openDb(dbPath);
    db.close();
    expect(bootstrapRecoveryCodes(dbPath, output)).toBeUndefined();
    expect(statSync(output).mode & 0o777).toBe(0o600);
    const codes = readFileSync(output, 'utf8').trim().split('\n');
    expect(codes).toHaveLength(10);
    expect(() => bootstrapRecoveryCodes(dbPath, output)).toThrow();
    const reopened = openDb(dbPath);
    try {
      const state = JSON.stringify(reopened.prepare('SELECT * FROM recovery_codes').all());
      for (const code of codes) expect(state).not.toContain(code);
      expect(reopened.prepare('SELECT * FROM recovery_codes').all()).toHaveLength(10);
    } finally { reopened.close(); }
  } finally { cleanup(dir); }
});

it('executes the operator bootstrap command without disclosing codes in captured output', () => {
  const dir = tmpDir('recovery-cli');
  const dbPath = join(dir, 'study.db');
  const output = join(dir, 'codes');
  const db = openDb(dbPath);
  db.close();
  try {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/server/jdct.ts', 'admin', 'recovery-codes', '--db', dbPath, '--output', output], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
    const codes = readFileSync(output, 'utf8').trim().split('\n');
    expect(codes).toHaveLength(10);
    for (const code of codes) expect(result.stderr.includes(code)).toBe(false);
  } finally { cleanup(dir); }
});

it('throttles recovery attempts durably across app rebuilds', async () => {
  const ctx = context();
  for (let i = 0; i < 20; i++) {
    expect((await request(ctx.app).post('/study/api/auth/recover').send({ code: 'invalid', password: 'long enough password' })).status).toBe(401);
  }
  const blocked = await request(buildApp(ctx.deps)).post('/study/api/auth/recover').send({ code: 'invalid', password: 'long enough password' });
  expect(blocked.status).toBe(429);
  expect(blocked.headers['retry-after']).toBeDefined();
  for (const route of ['recover/', 'RECOVER']) {
    expect((await request(ctx.app).post(`/study/api/auth/${route}`).send({ code: 'invalid', password: 'long enough password' })).status).toBe(429);
  }
});

it('rejects cross-site and non-JSON auth writes before changing state', async () => {
  const ctx = context();
  for (const route of ['login', 'recover', 'recovery-codes', 'logout']) {
    expect((await request(ctx.app).post(`/study/api/auth/${route}`).set('Origin', 'https://attacker.example').send({ password: 'old password' })).status).toBe(403);
    expect((await request(ctx.app).post(`/study/api/auth/${route}`).set('Sec-Fetch-Site', 'cross-site').send({ password: 'old password' })).status).toBe(403);
    expect((await request(ctx.app).post(`/study/api/auth/${route}`).type('form').send({ password: 'old password' })).status).toBe(415);
  }
});
