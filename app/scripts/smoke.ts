/**
 * Deterministic local end-to-end smoke: starts the server against a temp DB and
 * the real content tree (dev bypass on), exercises health + core endpoints,
 * then shuts down. Requires `npm run build` first (serves web/dist if present,
 * but API smoke works without it).
 *
 * The server binds an ephemeral port (PORT=0) and the real bound port is parsed
 * from its stdout, so a stale process squatting on a fixed port can never
 * silently answer in place of the server under test.
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';

const appDir = resolve(new URL('.', import.meta.url).pathname, '..');
const dataDir = mkdtempSync(join(tmpdir(), 'study-smoke-'));

let base = '';

function req(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
}

/** Wait for the child to print its listening line, then for /health to pass on THAT port. */
async function waitForServer(proc: ChildProcess): Promise<void> {
  let stdout = '';
  proc.stdout?.on('data', (chunk) => {
    stdout += String(chunk);
  });
  let stderr = '';
  proc.stderr?.on('data', (chunk) => {
    stderr += String(chunk);
  });

  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const match = stdout.match(/listening on http:\/\/[^\s:]+:(\d+)\//);
    if (match) {
      base = `http://127.0.0.1:${match[1]}/study/api`;
      try {
        const res = await req('/health');
        if (res.ok) return;
      } catch { /* not up yet */ }
    }
    if (proc.exitCode !== null) {
      throw new Error(`server exited early with code ${proc.exitCode}: ${stderr.slice(-500)}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server did not become healthy within 20s. stdout: ${stdout.slice(-300)} stderr: ${stderr.slice(-300)}`);
}

async function main(): Promise<void> {
  const useBuilt = process.argv.includes('--built');
  const cmd = useBuilt ? 'node' : 'npx';
  const args = useBuilt ? ['dist-server/server/index.js'] : ['tsx', 'src/server/index.ts'];
  const proc = spawn(cmd, args, {
    cwd: appDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: '0',
      STUDY_DB_PATH: join(dataDir, 'smoke.db'),
      STUDY_DEV_BYPASS: '1',
      STUDY_INTEGRATION_SECRET: 'smoke-secret',
    },
    stdio: 'pipe',
  });

  try {
    await waitForServer(proc);

    const health = await req('/health');
    console.assert(health.ok, 'health');

    const courses = await (await req('/courses')).json();
    if (courses.courses.length !== 3) throw new Error(`expected 3 courses, got ${courses.courses.length}`);

    const next = await (await req('/next-lesson')).json();
    if (!next.lesson) throw new Error('next-lesson returned null');

    const start = await req(`/lessons/${next.lesson.id}/start`, { method: 'POST' });
    if (!start.ok) throw new Error('start lesson failed');

    const end = await req(`/lessons/${next.lesson.id}/end`, { method: 'POST', body: JSON.stringify({ userRating: 4 }) });
    if (!end.ok) throw new Error('end lesson failed');

    const authHeaders = { 'Content-Type': 'application/json', Authorization: 'Bearer smoke-secret' };

    const link = await req('/integration/habit-link', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ course_id: 'sse', habit_entry_id: 'smoke-1', entry_date: '2026-09-17', minutes: 25 }),
    });
    if (link.status !== 201) throw new Error(`habit-link failed: ${link.status}`);

    // Course-required error must be machine-readable for the Hermes plugin.
    const noCourse = await req('/integration/habit-link', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ habit_entry_id: 'smoke-2', entry_date: '2026-09-17', minutes: 10 }),
    });
    if (noCourse.status !== 400) throw new Error(`habit-link without course should be 400, got ${noCourse.status}`);
    const noCourseBody = await noCourse.json();
    if (noCourseBody.code !== 'COURSE_REQUIRED') throw new Error(`expected COURSE_REQUIRED, got ${noCourseBody.code}`);

    // Integration course list + due flashcards (plugin contract).
    const intCourses = await req('/integration/courses', { headers: authHeaders });
    if (!intCourses.ok) throw new Error('integration courses failed');
    const due = await req('/integration/flashcards/due', { headers: authHeaders });
    if (!due.ok) throw new Error('integration flashcards/due failed');

    const dash = await (await req('/dashboard')).json();
    if (dash.studyTime.length !== 1) throw new Error('dashboard missing linked study time');

    console.log('SMOKE OK: health, courses(3), lifecycle(start/end), habit-link(201), COURSE_REQUIRED(400), integration courses+due, dashboard study time');
  } finally {
    proc.kill('SIGKILL');
    rmSync(dataDir, { recursive: true, force: true });
  }
  process.exit(0); // the spawned server's pipes keep the loop alive otherwise
}

main().catch((err) => {
  console.error('SMOKE FAILED:', (err as Error).message);
  process.exit(1);
});
