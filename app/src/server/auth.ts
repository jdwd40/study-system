import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AppConfig } from './config.js';
import type { StudyRepo } from './repo.js';

/**
 * Single-user auth boundary.
 * Password is verified against a scrypt hash supplied via environment config
 * (never stored in Git). Sessions are opaque tokens in the DB, sent as an
 * HttpOnly cookie. STUDY_DEV_BYPASS=1 (ignored when NODE_ENV=production)
 * disables the boundary for local development convenience.
 */

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });
  return `${N}:${R}:${P}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 5) return false;
  const [n, r, p, saltHex, hashHex] = parts as [string, string, string, string, string];
  const expected = Buffer.from(hashHex, 'hex');
  let actual: Buffer;
  try {
    actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
  } catch {
    return false;
  }
  return timingSafeEqual(actual, expected);
}

export function newSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function sessionExpiry(): string {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export function isAuthenticated(req: Request, config: AppConfig, repo: StudyRepo): boolean {
  if (config.devBypass) return true;
  const token = parseCookies(req.headers.cookie)['study_session'];
  if (!token) return false;
  return repo.getSession(token) !== null;
}

export function requireAuth(config: AppConfig, repo: StudyRepo) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (isAuthenticated(req, config, repo)) {
      next();
      return;
    }
    res.status(401).json({ error: 'authentication required', code: 'UNAUTHENTICATED' });
  };
}

/** Bearer-token auth for the local Hermes integration adapter. */
export function requireIntegration(config: AppConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const secret = config.integrationSecret;
    if (!secret) {
      res.status(503).json({ error: 'integration secret not configured', code: 'INTEGRATION_DISABLED' });
      return;
    }
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const a = createHash('sha256').update(token).digest();
    const b = createHash('sha256').update(secret).digest();
    if (!timingSafeEqual(a, b)) {
      res.status(401).json({ error: 'invalid integration token', code: 'UNAUTHENTICATED' });
      return;
    }
    next();
  };
}

export function setSessionCookie(res: Response, token: string, nodeEnv: string): void {
  const parts = [
    `study_session=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/study',
    'SameSite=Lax',
    `Max-Age=${30 * 24 * 60 * 60}`,
  ];
  if (nodeEnv === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', 'study_session=; HttpOnly; Path=/study; SameSite=Lax; Max-Age=0');
}
