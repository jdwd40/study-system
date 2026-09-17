/** Shared domain types for Study System. Used by server and web. */

export const SCHEMA_VERSION = 1;

export type LessonStatus = 'not_started' | 'unfinished' | 'complete';
export type CourseStatus = 'active' | 'paused' | 'archived';
export type ModuleStatus = 'active' | 'queued' | 'paused';

export interface Flashcard {
  q: string;
  a: string;
}

/**
 * A key concept with an optional short, high-level explanation shown in the
 * lesson reading page popup. Canonical Markdown form:
 *   - Term :: short explanation
 * Plain "- Term" bullets remain valid and simply have no explanation.
 */
export interface KeyConcept {
  term: string;
  explanation?: string;
}

export interface LessonDoc {
  schemaVersion: number;
  type: 'lesson';
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  order: number;
  estimatedMinutes?: number;
  objective: string;
  content: string;
  keyConcepts: KeyConcept[];
  examples: string[];
  takeaways: string[];
  sources: string[];
  flashcards: Flashcard[];
  revisionQuestions: string[];
}

export interface ModuleDoc {
  schemaVersion: number;
  type: 'module';
  id: string;
  title: string;
  courseId: string;
  order: number;
  status: ModuleStatus;
  summary: string;
  objectives: string[];
}

export interface CourseDoc {
  schemaVersion: number;
  type: 'course';
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; issues: ValidationIssue[] };

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  dueDate: string; // ISO date YYYY-MM-DD
}

export interface QaEntry {
  id: number;
  lessonId: string;
  attemptId: number | null;
  question: string;
  userAnswer: string | null;
  hermesFeedback: string | null;
  result: 'correct' | 'partial' | 'incorrect' | null;
  createdAt: string;
}

export interface Attempt {
  id: number;
  lessonId: string;
  status: 'active' | 'completed' | 'switched';
  startedAt: string;
  endedAt: string | null;
}

export interface LessonState {
  lessonId: string;
  status: LessonStatus;
  userRating: number | null;
  hermesRating: number | null;
  updatedAt: string;
}

export interface CourseProgress {
  courseId: string;
  plannedLessons: number;
  completedLessons: number;
  percent: number;
}

/**
 * Tracker-backed study time for one course, aggregated from habit_links.
 * courseTitle is resolved from canonical content; it is null when the linked
 * course id no longer exists in the tree (the record is kept, never
 * fabricated or forced into a lesson).
 */
export interface StudyTimeEntry {
  courseId: string;
  courseTitle: string | null;
  minutes: number;
}
