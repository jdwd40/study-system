import express, { type Express, type Request, type Response } from 'express';
import type { AppConfig } from './config.js';
import type { StudyRepo } from './repo.js';
import type { ContentStore } from './contentStore.js';
import { ContentError, normalizeKeyConcepts } from '../shared/content.js';
import { GitSync, SyncError } from './gitSync.js';
import { LessonService, ServiceError, londonToday } from './lessonService.js';
import { StructureService } from './structureService.js';
import {
  clearSessionCookie,
  newSessionToken,
  requireAuth,
  requireIntegration,
  sessionExpiry,
  setSessionCookie,
  verifyPassword,
  isAuthenticated,
} from './auth.js';
import { SCHEMA_VERSION, type Grade, type LessonDoc } from '../shared/types.js';

export interface AppDeps {
  config: AppConfig;
  repo: StudyRepo;
  store: ContentStore;
  gitSync: GitSync;
  service: LessonService;
  structure: StructureService;
}

export function buildApp(deps: AppDeps): Express {
  const { config, repo, service, structure } = deps;
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  const api = express.Router();
  const auth = requireAuth(config, repo);
  const integration = requireIntegration(config);

  /** Express 4 does not forward rejected promises — wrap async handlers. */
  const asyncH =
    (fn: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: (err?: unknown) => void): void => {
      fn(req, res).catch(next);
    };

  // ---- health & auth ------------------------------------------------------

  api.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'study-system', time: new Date().toISOString() });
  });

  api.post('/auth/login', (req, res) => {
    const { password } = req.body ?? {};
    if (config.devBypass) {
      const token = newSessionToken();
      repo.createSession(token, sessionExpiry());
      setSessionCookie(res, token, config.nodeEnv);
      res.json({ ok: true, devBypass: true });
      return;
    }
    if (!config.passwordHash || typeof password !== 'string' || !verifyPassword(password, config.passwordHash)) {
      res.status(401).json({ error: 'invalid password', code: 'LOGIN_FAILED' });
      return;
    }
    const token = newSessionToken();
    repo.createSession(token, sessionExpiry());
    setSessionCookie(res, token, config.nodeEnv);
    res.json({ ok: true });
  });

  api.post('/auth/logout', (req, res) => {
    const cookie = req.headers.cookie ?? '';
    const match = cookie.match(/study_session=([^;]+)/);
    if (match) repo.deleteSession(decodeURIComponent(match[1]!));
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  api.get('/auth/me', (req, res) => {
    res.json({ authenticated: isAuthenticated(req, config, repo), devBypass: config.devBypass });
  });

  // ---- read model -----------------------------------------------------------

  api.get('/dashboard', auth, (_req, res) => {
    res.json(service.dashboard());
  });

  api.get('/courses', auth, (_req, res) => {
    res.json({ courses: service.courseViews() });
  });

  api.get('/courses/:courseId', auth, (req, res) => {
    res.json(service.courseView(req.params.courseId!));
  });

  api.get('/lessons/:lessonId', auth, (req, res) => {
    const lessonId = req.params.lessonId!;
    const tree = service.tree();
    const lesson = tree.lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new ServiceError(`lesson not found: ${lessonId}`, 'NOT_FOUND', 404);
    res.json({
      lesson,
      state: repo.getLessonState(lessonId),
      activeAttempt: repo.activeAttemptForLesson(lessonId),
      attempts: repo.attemptsForLesson(lessonId),
      qa: repo.qaForLesson(lessonId),
    });
  });

  api.get('/next-lesson', auth, (req, res) => {
    res.json({ lesson: service.nextLesson(req.query.course as string | undefined) });
  });

  api.get('/search', auth, (req, res) => {
    res.json(service.search(String(req.query.q ?? '')));
  });

  api.get('/sync/events', auth, (_req, res) => {
    res.json({ events: repo.recentSyncEvents(20), lastError: repo.lastSyncError() });
  });

  // ---- lifecycle --------------------------------------------------------------

  api.post('/lessons/:lessonId/start', auth, (req, res) => {
    res.json(service.startLesson(req.params.lessonId!));
  });

  api.post('/lessons/:lessonId/end', auth, (req, res) => {
    const { userRating, hermesRating } = req.body ?? {};
    res.json(service.endLesson(req.params.lessonId!, { userRating, hermesRating: hermesRating ?? null }));
  });

  api.post('/lessons/:lessonId/ratings', auth, (req, res) => {
    const { userRating, hermesRating } = req.body ?? {};
    res.json({ state: service.recordRatings(req.params.lessonId!, userRating ?? null, hermesRating ?? null) });
  });

  api.post('/lessons/:lessonId/qa', auth, (req, res) => {
    const { question, userAnswer, hermesFeedback, result } = req.body ?? {};
    res.status(201).json(
      service.recordQa({
        lessonId: req.params.lessonId!,
        question,
        userAnswer: userAnswer ?? null,
        hermesFeedback: hermesFeedback ?? null,
        result: result ?? null,
      }),
    );
  });

  // ---- flashcards -----------------------------------------------------------------

  api.get('/flashcards', auth, (_req, res) => {
    res.json({ cards: service.allFlashcards() });
  });

  api.get('/flashcards/due', auth, (_req, res) => {
    res.json({ today: londonToday(), cards: service.dueFlashcards() });
  });

  api.post('/flashcards/review', auth, (req, res) => {
    const { cardId, lessonId, grade } = req.body ?? {};
    res.json({ state: service.reviewFlashcard(String(cardId ?? ''), String(lessonId ?? ''), grade as Grade) });
  });

  // ---- canonical content writes (manual UI + Hermes share this path) -----------------
  // Every write goes through StructureService: pull → write → FULL-tree validation →
  // index README regeneration → stage canonical paths only → commit → push.

  const lessonFields = (body: Record<string, unknown>) => ({
    ...(body.title !== undefined ? { title: String(body.title) } : {}),
    ...(body.order !== undefined ? { order: Number(body.order) } : {}),
    ...(body.estimatedMinutes !== undefined
      ? { estimatedMinutes: body.estimatedMinutes === null ? undefined : Number(body.estimatedMinutes) }
      : {}),
    ...(body.objective !== undefined ? { objective: String(body.objective) } : {}),
    ...(body.content !== undefined ? { content: String(body.content) } : {}),
    ...(body.keyConcepts !== undefined ? { keyConcepts: normalizeKeyConcepts(body.keyConcepts) } : {}),
    ...(body.examples !== undefined ? { examples: body.examples as string[] } : {}),
    ...(body.takeaways !== undefined ? { takeaways: body.takeaways as string[] } : {}),
    ...(body.sources !== undefined ? { sources: body.sources as string[] } : {}),
    ...(body.flashcards !== undefined ? { flashcards: body.flashcards as LessonDoc['flashcards'] } : {}),
    ...(body.revisionQuestions !== undefined ? { revisionQuestions: body.revisionQuestions as string[] } : {}),
  });

  api.put('/lessons/:lessonId/content', auth, asyncH(async (req, res) => {
    const result = await structure.updateLesson(req.params.lessonId!, lessonFields(req.body ?? {}));
    res.json(result);
  }));

  /** Metadata-only edit of a planned lesson (title, order, estimated minutes). */
  api.put('/lessons/:lessonId/meta', auth, asyncH(async (req, res) => {
    const body = req.body ?? {};
    const allowed = ['title', 'order', 'estimatedMinutes'] as const;
    const unknown = Object.keys(body).filter((k) => !allowed.includes(k as (typeof allowed)[number]));
    if (unknown.length > 0) {
      throw new ServiceError(`meta edit only accepts: ${allowed.join(', ')}`, 'INVALID_FIELDS', 400);
    }
    const result = await structure.updateLesson(req.params.lessonId!, lessonFields(body));
    res.json(result);
  }));

  api.post('/structure/lesson', auth, asyncH(async (req, res) => {
    const body = req.body ?? {};
    const doc: LessonDoc = {
      schemaVersion: SCHEMA_VERSION,
      type: 'lesson',
      id: String(body.id ?? ''),
      title: String(body.title ?? ''),
      courseId: String(body.courseId ?? ''),
      moduleId: String(body.moduleId ?? ''),
      order: Number(body.order ?? 0),
      estimatedMinutes: body.estimatedMinutes ?? undefined,
      objective: String(body.objective ?? ''),
      content: String(body.content ?? ''),
      keyConcepts: normalizeKeyConcepts(body.keyConcepts),
      examples: body.examples ?? [],
      takeaways: body.takeaways ?? [],
      sources: body.sources ?? [],
      flashcards: body.flashcards ?? [],
      revisionQuestions: body.revisionQuestions ?? [],
    };
    const result = await structure.createLesson(doc);
    res.status(201).json(result);
  }));

  // ---- deliberate structure management (courses/modules) ------------------------

  api.post('/structure/courses', auth, asyncH(async (req, res) => {
    const body = req.body ?? {};
    const result = await structure.createCourse({
      id: String(body.id ?? ''),
      title: String(body.title ?? ''),
      description: String(body.description ?? ''),
      status: body.status,
    });
    res.status(201).json(result);
  }));

  api.put('/courses/:courseId', auth, asyncH(async (req, res) => {
    const body = req.body ?? {};
    const result = await structure.updateCourse(req.params.courseId!, {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    });
    res.json(result);
  }));

  api.post('/structure/modules', auth, asyncH(async (req, res) => {
    const body = req.body ?? {};
    const result = await structure.createModule({
      courseId: String(body.courseId ?? ''),
      id: String(body.id ?? ''),
      title: String(body.title ?? ''),
      summary: String(body.summary ?? ''),
      objectives: Array.isArray(body.objectives) ? body.objectives.map(String) : [],
      order: Number(body.order ?? 0),
      status: body.status,
    });
    res.status(201).json(result);
  }));

  api.put('/courses/:courseId/modules/:moduleId', auth, asyncH(async (req, res) => {
    const body = req.body ?? {};
    const result = await structure.updateModule(req.params.courseId!, req.params.moduleId!, {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.summary !== undefined ? { summary: String(body.summary) } : {}),
      ...(body.objectives !== undefined ? { objectives: (body.objectives as unknown[]).map(String) } : {}),
      ...(body.order !== undefined ? { order: Number(body.order) } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    });
    res.json(result);
  }));

  // ---- Hermes integration adapter (Bearer secret, idempotent) ------------------------

  const ir = express.Router();
  ir.use(integration);

  ir.get('/next-lesson', (req, res) => {
    res.json({ lesson: service.nextLesson(req.query.course_id as string | undefined) });
  });

  ir.post('/start-lesson', (req, res) => {
    res.json(service.startLesson(String(req.body?.lesson_id ?? '')));
  });

  ir.post('/end-lesson', (req, res) => {
    const body = req.body ?? {};
    res.json(
      service.endLesson(String(body.lesson_id ?? ''), {
        userRating: body.user_rating,
        hermesRating: body.hermes_rating ?? null,
      }),
    );
  });

  ir.post('/qa', (req, res) => {
    const body = req.body ?? {};
    res.status(201).json(
      service.recordQa({
        lessonId: String(body.lesson_id ?? ''),
        question: String(body.question ?? ''),
        userAnswer: body.user_answer ?? null,
        hermesFeedback: body.hermes_feedback ?? null,
        result: body.result ?? null,
      }),
    );
  });

  ir.post('/ratings', (req, res) => {
    const body = req.body ?? {};
    res.json({
      state: service.recordRatings(String(body.lesson_id ?? ''), body.user_rating ?? null, body.hermes_rating ?? null),
    });
  });

  ir.post('/habit-link', (req, res) => {
    const body = req.body ?? {};
    const result = service.linkHabitEntry({
      courseId: body.course_id,
      habitEntryId: String(body.habit_entry_id ?? ''),
      entryDate: String(body.entry_date ?? ''),
      minutes: Number(body.minutes ?? 0),
    });
    res.status(result.created ? 201 : 200).json(result);
  });

  ir.post('/content-update', asyncH(async (req, res) => {
    const body = req.body ?? {};
    const lessonId = String(body.lesson_id ?? '');
    const changes = (body.changes ?? {}) as Record<string, unknown>;
    const result = await structure.updateLesson(lessonId, lessonFields(changes));
    res.json(result);
  }));

  ir.get('/courses', (_req, res) => {
    const tree = service.tree();
    res.json({ courses: tree.courses.map((c) => ({ id: c.id, title: c.title, status: c.status })) });
  });

  ir.get('/flashcards/due', (_req, res) => {
    res.json({ today: londonToday(), cards: service.dueFlashcards() });
  });

  ir.post('/flashcards/review', (req, res) => {
    const body = req.body ?? {};
    res.json({
      state: service.reviewFlashcard(String(body.card_id ?? ''), String(body.lesson_id ?? ''), body.grade as Grade),
    });
  });

  api.use('/integration', ir);

  // ---- errors --------------------------------------------------------------------

  app.use('/study/api', api);
  app.use('/study/api', (err: unknown, _req: Request, res: Response, _next: unknown) => {
    if (err instanceof ServiceError) {
      res.status(err.httpStatus).json({ error: err.message, code: err.code });
      return;
    }
    if (err instanceof ContentError) {
      res.status(422).json({ error: 'content validation failed', code: 'CONTENT_INVALID', issues: err.issues });
      return;
    }
    if (err instanceof SyncError) {
      res.status(502).json({ error: err.message, code: 'SYNC_ERROR', stage: err.stage });
      return;
    }
    res.status(500).json({ error: 'internal error', code: 'INTERNAL' });
  });

  return app;
}
