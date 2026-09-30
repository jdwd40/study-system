import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import type { AppConfig } from './config.js';

/**
 * Explicit proxy to the private jdct-tasks service (TASK_API_URL).
 *
 * Hard rules:
 *  - explicit routes only — no wildcard forwarding, no client-chosen URLs;
 *  - the upstream URL is server config and never reaches the browser;
 *  - no cookies/authorization forwarded upstream (the task service has no auth
 *    of its own; it is reachable only on the private tailnet);
 *  - no redirect following, 5s timeout, upstream network failure → 502;
 *  - TASK_API_URL unset → 503, so the UI never mistakes a missing service
 *    for an empty task list.
 */

/** Path IDs must be plain decimal positive-integer syntax AND a safe integer —
 *  only digits are ever interpolated into the upstream path, so no escape. */
function taskId(raw: string): string | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? raw : null;
}

/** Personal data: never shared-cacheable, varies by session cookie. Runs
 *  before auth so 401s carry the same headers. */
const privacy: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Cookie');
  next();
};

/**
 * CSRF guard for writes. The custom X-JDCT-Request header alone blocks simple
 * cross-site requests (browsers won't send it without a CORS preflight, and we
 * change no CORS headers). When an Origin header is present it must match this
 * host exactly; anything else — cross-site, malformed, or the literal "null" —
 * is rejected.
 */
const csrf: RequestHandler = (req, res, next) => {
  if (req.headers['x-jdct-request'] !== '1') {
    res.status(403).json({ error: 'missing X-JDCT-Request header', code: 'CSRF_REJECTED' });
    return;
  }
  const origin = req.headers.origin;
  if (origin !== undefined) {
    const forwarded = req.headers['x-forwarded-proto'];
    const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req.protocol;
    if (origin !== `${proto}://${req.headers.host ?? ''}`) {
      res.status(403).json({ error: 'origin mismatch', code: 'CSRF_REJECTED' });
      return;
    }
  }
  next();
};

const idGuard: RequestHandler = (req, res, next) => {
  const id = taskId(req.params.id ?? '');
  if (id === null) {
    res.status(400).json({ error: 'id must be a positive integer', code: 'TASK_ID_INVALID' });
    return;
  }
  req.params.id = id;
  next();
};

async function proxy(
  config: AppConfig,
  req: Request,
  res: Response,
  method: string,
  upstreamPath: string,
  withBody: boolean,
): Promise<void> {
  if (!config.taskApiUrl) {
    res.status(503).json({ error: 'task service is not configured', code: 'TASKS_NOT_CONFIGURED' });
    return;
  }
  let upstream: globalThis.Response;
  try {
    upstream = await fetch(`${config.taskApiUrl}${upstreamPath}`, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
      headers: withBody
        ? { 'content-type': 'application/json', accept: 'application/json' }
        : { accept: 'application/json' },
      body: withBody ? JSON.stringify(req.body ?? {}) : undefined,
    });
  } catch {
    // Network failure/timeout: sanitized — no upstream URL or internals leak.
    res.status(502).json({ error: 'task service unavailable', code: 'TASK_UPSTREAM' });
    return;
  }
  // Pass through status and body verbatim (our own service always speaks JSON;
  // Express strips the body/entity headers automatically on 204).
  const body = await upstream.text();
  res.status(upstream.status).type('application/json').send(body);
}

/** Express 4 does not forward rejected promises — wrap async handlers. */
const asyncH =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };

export function taskProxyRoutes(config: AppConfig, auth: RequestHandler): Router {
  const router = Router();
  const h = (method: string, path: (req: Request) => string, withBody: boolean) =>
    asyncH((req, res) => proxy(config, req, res, method, path(req), withBody));

  router.get('/tasks', privacy, auth, h('GET', () => '/api/tasks', false));
  router.post('/tasks', privacy, auth, csrf, h('POST', () => '/api/tasks', true));
  // reorder before /:id so PUT /tasks/reorder can never be read as an ID route.
  router.put('/tasks/reorder', privacy, auth, csrf, h('PUT', () => '/api/tasks/reorder', true));
  router.patch('/tasks/:id', privacy, auth, csrf, idGuard, h('PATCH', (req) => `/api/tasks/${req.params.id}`, true));
  router.delete('/tasks/:id', privacy, auth, csrf, idGuard, h('DELETE', (req) => `/api/tasks/${req.params.id}`, false));
  router.post('/obsidian/scan', privacy, auth, csrf, h('POST', () => '/api/obsidian/scan', false));
  return router;
}
