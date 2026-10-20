import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import Database from 'better-sqlite3';
import { hashPassword, rotateRecoveryCodes } from './auth.js';
import { StudyRepo } from './repo.js';
import { openSync, writeFileSync, closeSync, unlinkSync } from 'node:fs';
import { isAbsolute } from 'node:path';

interface ManagedApp {
  pm_id: number;
  pm2_env: {
    pm_cwd: string;
    status: string;
    env: NodeJS.ProcessEnv;
    STUDY_PASSWORD_HASH?: string;
    STUDY_DB_PATH?: string;
  };
}

function pm2(args: string[], env = process.env): string {
  // Capture both streams: PM2 failures must never dump its secret environment.
  return execFileSync('pm2', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export async function promptPassword(input = process.stdin, output = process.stderr): Promise<string> {
  if (!input.isTTY || !output.isTTY) throw new Error('Run this command in an interactive local terminal.');
  // Readline manages terminal echo/raw mode; its output is discarded throughout.
  const silent = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const reader = createInterface({ input, output: silent, terminal: true, historySize: 0 });
  const ask = (label: string): Promise<string> => new Promise((accept, reject) => {
    const cancel = () => reject(new Error('Password reset cancelled.'));
    reader.once('close', cancel);
    reader.question('', (answer) => {
      reader.removeListener('close', cancel);
      output.write('\n');
      accept(answer);
    });
    output.write(label);
  });
  reader.on('SIGINT', () => reader.close());
  try {
    const password = await ask('New password: ');
    const confirmation = await ask('Confirm password: ');
    if (!password.trim()) throw new Error('Password must not be empty.');
    if (password !== confirmation) throw new Error('Passwords do not match.');
    return password;
  } finally {
    reader.close();
    silent.destroy();
  }
}

export function findManagedApp(): ManagedApp {
  const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  let apps: Array<ManagedApp & { name: string }>;
  try {
    apps = JSON.parse(pm2(['jlist']));
  } catch {
    throw new Error('Cannot read the local PM2 process list. Run as the server owner.');
  }
  const matches = apps.filter((app) => app.name === 'study-system' && resolve(app.pm2_env.pm_cwd) === appDir);
  const app = matches[0];
  if (matches.length !== 1 || !app || app.pm2_env.status !== 'online' || !app.pm2_env.STUDY_PASSWORD_HASH) {
    throw new Error('Expected one running study-system PM2 process for this checkout with an existing password hash.');
  }
  return app;
}

export function resetPassword(password: string, app: ManagedApp): void {
  if (!password.trim()) throw new Error('Password must not be empty.');
  if (password.length > 256) throw new Error('Password must be at most 256 characters.');
  const dbPath = resolve(app.pm2_env.pm_cwd, app.pm2_env.STUDY_DB_PATH || 'data/study.db');
  // Never create a new database/account or run schema migrations during recovery.
  const db = new Database(dbPath, { fileMustExist: true });
  try {
    const clearSessions = db.prepare('DELETE FROM sessions');
    const hasCredentials = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'auth_credentials'").get();
    if (hasCredentials) {
      db.transaction(() => {
        db.prepare('INSERT INTO auth_credentials (id, password_hash) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET password_hash = excluded.password_hash').run(hashPassword(password));
        clearSessions.run();
      }).immediate();
      return;
    }
    // Preserve the managed app's environment, without importing shell auth overrides.
    const env: NodeJS.ProcessEnv = {
      ...app.pm2_env.env,
      HOME: process.env.HOME,
      PATH: process.env.PATH,
      PM2_HOME: process.env.PM2_HOME,
      STUDY_PASSWORD_HASH: hashPassword(password),
    };
    // Pre-upgrade fallback cannot atomically coordinate DB and PM2. Revoke
    // before changing the active environment; failures must not retain sessions.
    clearSessions.run();
    try {
      pm2(['restart', String(app.pm_id), '--update-env'], env);
      pm2(['save'], env);
    } catch {
      throw new Error('PM2 update/save failed; the reset may be incomplete. Check PM2 locally before retrying.');
    }
    clearSessions.run();
  } finally {
    db.close();
  }
}

/** Explicit local-owner bootstrap; never emits recovery secrets to stdout/stderr. */
export function bootstrapRecoveryCodes(dbPath: string, outputPath: string): void {
  if (!isAbsolute(dbPath) || !isAbsolute(outputPath)) throw new Error('Absolute paths required.');
  const db = new Database(dbPath, { fileMustExist: true });
  let created = false;
  try {
    db.transaction(() => {
      const fd = openSync(outputPath, 'wx', 0o600);
      created = true;
      try {
        const codes = rotateRecoveryCodes(new StudyRepo(db));
        writeFileSync(fd, `${codes.join('\n')}\n`);
      } finally { closeSync(fd); }
    }).immediate();
  } catch (error) {
    if (created) unlinkSync(outputPath);
    throw error;
  } finally { db.close(); }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 6 && args[0] === 'admin' && args[1] === 'recovery-codes' && args[2] === '--db' && args[4] === '--output') {
    try {
      bootstrapRecoveryCodes(args[3]!, args[5]!);
      process.stderr.write('Recovery codes rotated into the protected output file. Store offline, then remove the file.\n');
    } catch {
      process.stderr.write('Recovery code rotation failed. Check existing upgraded database and a new absolute output path.\n');
      process.exitCode = 1;
    }
    return;
  }
  if (args.length !== 2 || args[0] !== 'admin' || args[1] !== 'reset-password') {
    process.stderr.write('Usage: npm run jdct -- admin reset-password\n');
    process.exitCode = 1;
    return;
  }
  let failure = 'Run this command in an interactive local terminal.';
  try {
    if (!process.stdin.isTTY || !process.stderr.isTTY) {
      throw new Error('Run this command in an interactive local terminal.');
    }
    failure = 'Cannot find the running study-system backend in local PM2. For the live site, SSH to app-vps and run from ~/study-system/app as its owner. No changes made.';
    const app = findManagedApp();
    failure = 'Password reset cancelled or passwords were empty/mismatched. No changes made.';
    const password = await promptPassword();
    failure = 'Password reset failed. Check local PM2/database access; the reset may be incomplete.';
    resetPassword(password, app);
    process.stderr.write('Admin password reset. Existing sessions invalidated. Log in with your new password.\n');
  } catch {
    // Never print thrown errors: subprocess/library diagnostics can contain secrets.
    process.stderr.write(`${failure}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) void main();
