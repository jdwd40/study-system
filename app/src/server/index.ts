import { existsSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';
import { loadConfig } from './config.js';
import { openDb } from './db.js';
import { StudyRepo } from './repo.js';
import { ContentStore } from './contentStore.js';
import { GitSync } from './gitSync.js';
import { LessonService } from './lessonService.js';
import { StructureService } from './structureService.js';
import { buildApp } from './app.js';

const config = loadConfig();
const db = openDb(config.dbPath);
const repo = new StudyRepo(db);
const store = new ContentStore(config.contentDir);
const gitSync = new GitSync(config.repoRoot, repo);
const service = new LessonService(repo, store);
const structure = new StructureService(config, store, gitSync);

const app = buildApp({ config, repo, store, gitSync, service, structure });

// Static frontend (production build) served under /study/ with SPA fallback.
if (existsSync(config.webDist)) {
  app.use('/study', express.static(config.webDist));
  app.get(/^\/study\/(?!api\/).*/, (_req, res) => {
    res.sendFile(join(config.webDist, 'index.html'));
  });
}

const server = app.listen(config.port, config.host, () => {
  const addr = server.address();
  const boundPort = typeof addr === 'object' && addr !== null ? addr.port : config.port;
  console.log(`study-system listening on http://${config.host}:${boundPort}/study/`);
});
