import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface AppConfig {
  port: number;
  host: string;
  dbPath: string;
  contentDir: string;
  repoRoot: string;
  webDist: string;
  /** scrypt hash string "N:r:p:saltHex:hashHex" — never the raw password. */
  passwordHash: string | null;
  devBypass: boolean;
  integrationSecret: string | null;
  nodeEnv: string;
  /** Fixed local path of the Mission Control snapshot pushed from the Hermes host. */
  missionStatePath: string;
}

const here = dirname(fileURLToPath(import.meta.url));
// src/server/config.ts (dev via tsx) or dist-server/server/config.js (built)
const appDir = resolve(here, '..', '..');
const repoRoot = resolve(appDir, '..');

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const devBypass = env.STUDY_DEV_BYPASS === '1' && nodeEnv !== 'production';
  const passwordHash = env.STUDY_PASSWORD_HASH ?? null;
  if (nodeEnv === 'production' && !passwordHash && !devBypass) {
    throw new Error('STUDY_PASSWORD_HASH is required in production (STUDY_DEV_BYPASS is ignored in production)');
  }
  return {
    port: Number(env.PORT ?? 4173),
    host: env.HOST ?? '127.0.0.1',
    dbPath: env.STUDY_DB_PATH ?? resolve(appDir, 'data', 'study.db'),
    contentDir: env.STUDY_CONTENT_DIR ?? resolve(repoRoot, 'content'),
    repoRoot: env.STUDY_REPO_ROOT ?? repoRoot,
    webDist: env.STUDY_WEB_DIST ?? resolve(appDir, 'web', 'dist'),
    passwordHash,
    devBypass,
    integrationSecret: env.STUDY_INTEGRATION_SECRET ?? null,
    missionStatePath:
      env.MISSION_CONTROL_STATE_PATH ?? resolve(homedir(), '.local', 'share', 'mission-control', 'state.json'),
    nodeEnv,
  };
}
