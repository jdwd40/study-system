import type { Db } from './db.js';
import type { Attempt, CardState, LessonState, LessonStatus, QaEntry } from '../shared/types.js';

function now(): string {
  return new Date().toISOString();
}

export interface HabitLink {
  id: number;
  courseId: string;
  habitEntryId: string;
  entryDate: string;
  minutes: number;
  createdAt: string;
}

export interface SyncEvent {
  id: number;
  type: string;
  status: 'ok' | 'error';
  message: string | null;
  createdAt: string;
}

interface LessonStateRow {
  lesson_id: string;
  status: LessonStatus;
  user_rating: number | null;
  hermes_rating: number | null;
  updated_at: string;
}

interface AttemptRow {
  id: number;
  lesson_id: string;
  status: 'active' | 'completed' | 'switched';
  started_at: string;
  ended_at: string | null;
}

interface QaRow {
  id: number;
  lesson_id: string;
  attempt_id: number | null;
  question: string;
  user_answer: string | null;
  hermes_feedback: string | null;
  result: 'correct' | 'partial' | 'incorrect' | null;
  created_at: string;
}

interface CardRow {
  card_id: string;
  lesson_id: string;
  ease: number;
  interval_days: number;
  reps: number;
  lapses: number;
  due_date: string;
  last_reviewed_at: string | null;
}

interface HabitLinkRow {
  id: number;
  course_id: string;
  habit_entry_id: string;
  entry_date: string;
  minutes: number;
  created_at: string;
}

interface SyncEventRow {
  id: number;
  type: string;
  status: 'ok' | 'error';
  message: string | null;
  created_at: string;
}

function toLessonState(r: LessonStateRow): LessonState {
  return {
    lessonId: r.lesson_id,
    status: r.status,
    userRating: r.user_rating,
    hermesRating: r.hermes_rating,
    updatedAt: r.updated_at,
  };
}

function toAttempt(r: AttemptRow): Attempt {
  return { id: r.id, lessonId: r.lesson_id, status: r.status, startedAt: r.started_at, endedAt: r.ended_at };
}

function toQa(r: QaRow): QaEntry {
  return {
    id: r.id,
    lessonId: r.lesson_id,
    attemptId: r.attempt_id,
    question: r.question,
    userAnswer: r.user_answer,
    hermesFeedback: r.hermes_feedback,
    result: r.result,
    createdAt: r.created_at,
  };
}

function toCard(r: CardRow): CardState & { cardId: string; lessonId: string; lastReviewedAt: string | null } {
  return {
    cardId: r.card_id,
    lessonId: r.lesson_id,
    ease: r.ease,
    intervalDays: r.interval_days,
    reps: r.reps,
    lapses: r.lapses,
    dueDate: r.due_date,
    lastReviewedAt: r.last_reviewed_at,
  };
}

function toHabitLink(r: HabitLinkRow): HabitLink {
  return {
    id: r.id,
    courseId: r.course_id,
    habitEntryId: r.habit_entry_id,
    entryDate: r.entry_date,
    minutes: r.minutes,
    createdAt: r.created_at,
  };
}

export class StudyRepo {
  constructor(private readonly db: Db) {}

  // ---- lesson state -------------------------------------------------------

  getLessonState(lessonId: string): LessonState {
    const row = this.db.prepare('SELECT * FROM lesson_state WHERE lesson_id = ?').get(lessonId) as
      | LessonStateRow
      | undefined;
    if (row) return toLessonState(row);
    return { lessonId, status: 'not_started', userRating: null, hermesRating: null, updatedAt: now() };
  }

  allLessonStates(): LessonState[] {
    const rows = this.db.prepare('SELECT * FROM lesson_state').all() as LessonStateRow[];
    return rows.map(toLessonState);
  }

  setLessonStatus(lessonId: string, status: LessonStatus): LessonState {
    this.db
      .prepare(
        `INSERT INTO lesson_state (lesson_id, status, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(lesson_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
      )
      .run(lessonId, status, now());
    return this.getLessonState(lessonId);
  }

  setLessonRatings(lessonId: string, userRating: number | null, hermesRating: number | null): LessonState {
    if (userRating !== null && (userRating < 1 || userRating > 5)) throw new Error('user rating must be 1-5');
    if (hermesRating !== null && (hermesRating < 1 || hermesRating > 5)) throw new Error('hermes rating must be 1-5');
    this.db
      .prepare(
        `INSERT INTO lesson_state (lesson_id, user_rating, hermes_rating, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(lesson_id) DO UPDATE SET
           user_rating = COALESCE(excluded.user_rating, lesson_state.user_rating),
           hermes_rating = COALESCE(excluded.hermes_rating, lesson_state.hermes_rating),
           updated_at = excluded.updated_at`,
      )
      .run(lessonId, userRating, hermesRating, now());
    return this.getLessonState(lessonId);
  }

  // ---- attempts -----------------------------------------------------------

  createAttempt(lessonId: string): Attempt {
    const res = this.db
      .prepare("INSERT INTO attempts (lesson_id, status, started_at) VALUES (?, 'active', ?)")
      .run(lessonId, now());
    return this.getAttempt(Number(res.lastInsertRowid))!;
  }

  getAttempt(id: number): Attempt | null {
    const row = this.db.prepare('SELECT * FROM attempts WHERE id = ?').get(id) as AttemptRow | undefined;
    return row ? toAttempt(row) : null;
  }

  getActiveAttempt(): Attempt | null {
    const row = this.db.prepare("SELECT * FROM attempts WHERE status = 'active' ORDER BY id DESC LIMIT 1").get() as
      | AttemptRow
      | undefined;
    return row ? toAttempt(row) : null;
  }

  activeAttemptForLesson(lessonId: string): Attempt | null {
    const row = this.db
      .prepare("SELECT * FROM attempts WHERE lesson_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1")
      .get(lessonId) as AttemptRow | undefined;
    return row ? toAttempt(row) : null;
  }

  closeAttempt(id: number, status: 'completed' | 'switched'): Attempt {
    this.db.prepare('UPDATE attempts SET status = ?, ended_at = ? WHERE id = ?').run(status, now(), id);
    return this.getAttempt(id)!;
  }

  attemptsForLesson(lessonId: string): Attempt[] {
    const rows = this.db
      .prepare('SELECT * FROM attempts WHERE lesson_id = ? ORDER BY id DESC')
      .all(lessonId) as AttemptRow[];
    return rows.map(toAttempt);
  }

  recentAttempts(limit: number): Attempt[] {
    const rows = this.db.prepare('SELECT * FROM attempts ORDER BY id DESC LIMIT ?').all(limit) as AttemptRow[];
    return rows.map(toAttempt);
  }

  // ---- Q&A ----------------------------------------------------------------

  addQa(entry: {
    lessonId: string;
    attemptId: number | null;
    question: string;
    userAnswer: string | null;
    hermesFeedback: string | null;
    result: 'correct' | 'partial' | 'incorrect' | null;
  }): QaEntry {
    const res = this.db
      .prepare(
        `INSERT INTO qa_entries (lesson_id, attempt_id, question, user_answer, hermes_feedback, result, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(entry.lessonId, entry.attemptId, entry.question, entry.userAnswer, entry.hermesFeedback, entry.result, now());
    const row = this.db.prepare('SELECT * FROM qa_entries WHERE id = ?').get(Number(res.lastInsertRowid)) as QaRow;
    return toQa(row);
  }

  qaForLesson(lessonId: string): QaEntry[] {
    const rows = this.db
      .prepare('SELECT * FROM qa_entries WHERE lesson_id = ? ORDER BY id ASC')
      .all(lessonId) as QaRow[];
    return rows.map(toQa);
  }

  // ---- flashcards ---------------------------------------------------------

  getCardState(cardId: string, lessonId: string): (CardState & { cardId: string; lessonId: string }) | null {
    const row = this.db
      .prepare('SELECT * FROM flashcard_state WHERE card_id = ? AND lesson_id = ?')
      .get(cardId, lessonId) as CardRow | undefined;
    return row ? toCard(row) : null;
  }

  saveCardState(cardId: string, lessonId: string, state: CardState): void {
    this.db
      .prepare(
        `INSERT INTO flashcard_state (card_id, lesson_id, ease, interval_days, reps, lapses, due_date, last_reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(card_id, lesson_id) DO UPDATE SET
           ease = excluded.ease, interval_days = excluded.interval_days, reps = excluded.reps,
           lapses = excluded.lapses, due_date = excluded.due_date, last_reviewed_at = excluded.last_reviewed_at`,
      )
      .run(cardId, lessonId, state.ease, state.intervalDays, state.reps, state.lapses, state.dueDate, now());
  }

  allCardStates(): (CardState & { cardId: string; lessonId: string })[] {
    const rows = this.db.prepare('SELECT * FROM flashcard_state').all() as CardRow[];
    return rows.map(toCard);
  }

  // ---- habit tracker links --------------------------------------------------

  /** Idempotent: the same habit entry id never creates a second link or double-counts minutes. */
  linkHabitEntry(link: { courseId: string; habitEntryId: string; entryDate: string; minutes: number }): {
    created: boolean;
    link: HabitLink;
  } {
    const existing = this.db
      .prepare('SELECT * FROM habit_links WHERE habit_entry_id = ?')
      .get(link.habitEntryId) as HabitLinkRow | undefined;
    if (existing) return { created: false, link: toHabitLink(existing) };
    const res = this.db
      .prepare('INSERT INTO habit_links (course_id, habit_entry_id, entry_date, minutes, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(link.courseId, link.habitEntryId, link.entryDate, link.minutes, now());
    const row = this.db.prepare('SELECT * FROM habit_links WHERE id = ?').get(Number(res.lastInsertRowid)) as HabitLinkRow;
    return { created: true, link: toHabitLink(row) };
  }

  habitLinks(): HabitLink[] {
    const rows = this.db.prepare('SELECT * FROM habit_links ORDER BY entry_date DESC, id DESC').all() as HabitLinkRow[];
    return rows.map(toHabitLink);
  }

  /** Study minutes per course for the last `days` days, from linked Habit Tracker entries. */
  studyMinutesByCourse(sinceDate: string): { courseId: string; minutes: number }[] {
    const rows = this.db
      .prepare('SELECT course_id AS courseId, SUM(minutes) AS minutes FROM habit_links WHERE entry_date >= ? GROUP BY course_id')
      .all(sinceDate) as { courseId: string; minutes: number }[];
    return rows;
  }

  // ---- sync events ----------------------------------------------------------

  recordSyncEvent(type: string, status: 'ok' | 'error', message: string | null): SyncEvent {
    const res = this.db
      .prepare('INSERT INTO sync_events (type, status, message, created_at) VALUES (?, ?, ?, ?)')
      .run(type, status, message, now());
    const row = this.db.prepare('SELECT * FROM sync_events WHERE id = ?').get(Number(res.lastInsertRowid)) as SyncEventRow;
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      message: row.message,
      createdAt: row.created_at,
    };
  }

  recentSyncEvents(limit: number): SyncEvent[] {
    const rows = this.db.prepare('SELECT * FROM sync_events ORDER BY id DESC LIMIT ?').all(limit) as SyncEventRow[];
    return rows.map((r) => ({ id: r.id, type: r.type, status: r.status, message: r.message, createdAt: r.created_at }));
  }

  lastSyncError(): SyncEvent | null {
    const row = this.db
      .prepare("SELECT * FROM sync_events WHERE status = 'error' ORDER BY id DESC LIMIT 1")
      .get() as SyncEventRow | undefined;
    return row ? { id: row.id, type: row.type, status: row.status, message: row.message, createdAt: row.created_at } : null;
  }

  // ---- sessions ---------------------------------------------------------------

  createSession(token: string, expiresAt: string): void {
    this.db.prepare('INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)').run(token, now(), expiresAt);
  }

  getSession(token: string): { token: string; expiresAt: string } | null {
    const row = this.db.prepare('SELECT token, expires_at AS expiresAt FROM sessions WHERE token = ?').get(token) as
      | { token: string; expiresAt: string }
      | undefined;
    if (!row) return null;
    if (row.expiresAt < now()) {
      this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return null;
    }
    return row;
  }

  deleteSession(token: string): void {
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
}
