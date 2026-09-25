import { closeSync, openSync, readSync, statSync } from 'node:fs';
import type { AppConfig } from './config.js';
import type { LessonService } from './lessonService.js';
import type { LessonDoc } from '../shared/types.js';

/**
 * Mission Control snapshot reader + /study/api/mission-control payload builder.
 *
 * The snapshot is produced off-host by the Mission Control exporter and pushed
 * to a fixed local path. This reader is defensive by contract: it never throws,
 * never leaks filesystem paths or raw I/O/JSON parser errors, reads at most
 * SNAPSHOT_MAX_BYTES, and bounds every string/array/number so a malformed or
 * hostile file cannot crash the process or create an unbounded API response.
 */

export const SNAPSHOT_MAX_BYTES = 1024 * 1024; // 1 MiB
export const STALE_AFTER_MS = 15 * 60 * 1000; // 15 minutes

/** Fixed, sanitized unavailability vocabulary — safe to expose publicly. */
export const MISSION_REASONS = {
  notFound: 'snapshot-not-found',
  unreadable: 'snapshot-unreadable',
  tooLarge: 'snapshot-too-large',
  invalidJson: 'snapshot-invalid-json',
  invalidShape: 'snapshot-invalid-shape',
} as const;

export type MissionReason = (typeof MISSION_REASONS)[keyof typeof MISSION_REASONS];

export interface SnapshotUnavailable {
  available: false;
  reason: MissionReason;
}

export interface SnapshotAvailable {
  available: true;
  stale: boolean;
  ageSeconds: number | null;
  snapshot: Record<string, unknown>;
}

export type SnapshotResult = SnapshotUnavailable | SnapshotAvailable;

const MAX_STRING = 500;
const MAX_ARRAY = 100;
const MAX_DEPTH = 8;
const MAX_KEYS = 60;

function boundString(value: string): string {
  return value.length > MAX_STRING ? value.slice(0, MAX_STRING) : value;
}

/** Recursively clamp a parsed JSON value to bounded, response-safe shapes. */
function boundValue(value: unknown, depth: number): unknown {
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') return boundString(value);
  if (depth >= MAX_DEPTH) return null;
  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY).map((item) => boundValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).slice(0, MAX_KEYS)) {
      out[boundString(key)] = boundValue((value as Record<string, unknown>)[key], depth + 1);
    }
    return out;
  }
  return null;
}

/** Read up to `maxBytes + 1` bytes so oversize is detected even when stat lies. */
function readCapped(path: string, maxBytes: number): Buffer {
  const fd = openSync(path, 'r');
  try {
    const buffer = Buffer.alloc(maxBytes + 1);
    const bytesRead = readSync(fd, buffer, 0, maxBytes + 1, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    closeSync(fd);
  }
}

export function readMissionSnapshot(path: string, now: Date = new Date()): SnapshotResult {
  let stat;
  try {
    stat = statSync(path);
  } catch {
    return { available: false, reason: MISSION_REASONS.notFound };
  }
  if (!stat.isFile()) return { available: false, reason: MISSION_REASONS.notFound };
  if (stat.size > SNAPSHOT_MAX_BYTES) return { available: false, reason: MISSION_REASONS.tooLarge };

  let raw: Buffer;
  try {
    raw = readCapped(path, SNAPSHOT_MAX_BYTES);
  } catch {
    return { available: false, reason: MISSION_REASONS.unreadable };
  }
  if (raw.length > SNAPSHOT_MAX_BYTES) return { available: false, reason: MISSION_REASONS.tooLarge };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString('utf8'));
  } catch {
    return { available: false, reason: MISSION_REASONS.invalidJson };
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { available: false, reason: MISSION_REASONS.invalidShape };
  }

  const snapshot = boundValue(parsed, 0) as Record<string, unknown>;
  const generatedAt = typeof snapshot.generatedAt === 'string' ? Date.parse(snapshot.generatedAt) : NaN;
  const ageSeconds = Number.isNaN(generatedAt) ? null : Math.max(0, Math.round((now.getTime() - generatedAt) / 1000));
  const stale = ageSeconds === null || ageSeconds * 1000 > STALE_AFTER_MS;
  return { available: true, stale, ageSeconds, snapshot };
}

interface LessonSummary {
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  estimatedMinutes: number | null;
}

function lessonSummary(lesson: LessonDoc | null | undefined): LessonSummary | null {
  if (!lesson) return null;
  return {
    id: lesson.id,
    title: lesson.title,
    courseId: lesson.courseId,
    moduleId: lesson.moduleId,
    estimatedMinutes: lesson.estimatedMinutes ?? null,
  };
}

/**
 * Authenticated Mission Control payload. Study data is derived from the
 * canonical LessonService; personal data comes from the bounded snapshot.
 */
export function missionControlPayload(service: LessonService, config: AppConfig, now: Date = new Date()) {
  const personal = readMissionSnapshot(config.missionStatePath, now);
  const dashboard = service.dashboard();
  return {
    generatedAt: now.toISOString(),
    personal,
    study: {
      nextLesson: lessonSummary(service.nextLesson()),
      resume: dashboard.resume
        ? {
            lessonId: dashboard.resume.attempt.lessonId,
            lessonTitle: dashboard.resume.lesson?.title ?? null,
            startedAt: dashboard.resume.attempt.startedAt,
          }
        : null,
      unfinishedCount: dashboard.unfinished.length,
      dueFlashcards: dashboard.dueFlashcards,
      courses: dashboard.courses.map((course) => ({
        id: course.id,
        title: course.title,
        status: course.status,
        progress: course.progress,
        studyMinutes: course.studyMinutes,
        nextLesson: lessonSummary(service.nextLesson(course.id)),
      })),
    },
  };
}
