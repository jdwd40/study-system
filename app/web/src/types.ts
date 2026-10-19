/**
 * Web-side shapes of the JSON the API returns. These mirror what the server
 * builds (see src/server/lessonService.ts and src/server/app.ts) but are
 * declared here so the web bundle never imports server code. Shared domain
 * types come from src/shared/types.ts.
 */
import type {
  Attempt,
  CourseDoc,
  CourseProgress,
  LessonDoc,
  LessonState,
  ModuleDoc,
  QaEntry,
  StudyTimeEntry,
} from '../../src/shared/types.js';

export type {
  Attempt,
  CourseDoc,
  CourseProgress,
  CourseStatus,
  Flashcard,
  Grade,
  KeyConcept,
  LessonDoc,
  LessonState,
  LessonStatus,
  ModuleDoc,
  ModuleStatus,
  QaEntry,
  StudyTimeEntry,
} from '../../src/shared/types.js';

/* ---------- auth ---------- */

export interface AuthMe {
  authenticated: boolean;
  devBypass: boolean;
}

/* ---------- courses ---------- */

export interface LessonWithState extends LessonDoc {
  state: LessonState;
}

export interface ModuleView extends ModuleDoc {
  lessons: LessonWithState[];
}

/** GET /courses/:courseId and each item of GET /courses (server CourseView). */
export interface CourseDetail extends CourseDoc {
  modules: ModuleView[];
  progress: CourseProgress;
  averageUserRating: number | null;
  /** All-time tracker-backed study minutes for this course (from habit_links). */
  studyMinutes: number;
}

export interface CoursesResponse {
  courses: CourseDetail[];
}

/** Trimmed course entry on the dashboard (no modules). */
export type CourseSummary = Pick<
  CourseDetail,
  'id' | 'title' | 'description' | 'status' | 'progress' | 'averageUserRating' | 'studyMinutes'
>;

/* ---------- dashboard ---------- */

export interface SyncEvent {
  id: number;
  type: string;
  status: 'ok' | 'error';
  message: string | null;
  createdAt: string;
}

export interface WeakArea {
  lessonId: string;
  title: string;
  userRating: number | null;
}

export interface UnderstandingTrendPoint {
  lessonId: string;
  userRating: number | null;
  at: string;
}

export interface RecentActivityEntry extends Attempt {
  lessonTitle: string;
}

export interface DashboardData {
  resume: { attempt: Attempt; lesson: LessonDoc | null } | null;
  unfinished: { state: LessonState; lesson: LessonDoc }[];
  courses: CourseSummary[];
  weakAreas: WeakArea[];
  studyTime: StudyTimeEntry[];
  studyTimeTotalMinutes: number;
  understandingTrend: UnderstandingTrendPoint[];
  recentActivity: RecentActivityEntry[];
  dueFlashcards: number;
  lastSyncError: SyncEvent | null;
}

/* ---------- lesson ---------- */

/** GET /lessons/:lessonId */
export interface LessonDetail {
  lesson: LessonDoc;
  state: LessonState;
  activeAttempt: Attempt | null;
  attempts: Attempt[];
  qa: QaEntry[];
}

/* ---------- flashcards ---------- */

export interface FlashcardCard {
  cardId: string;
  lessonId: string;
  lessonTitle: string;
  q: string;
  a: string;
  dueDate: string;
  isNew: boolean;
}

export interface FlashcardsResponse {
  cards: FlashcardCard[];
}

/* ---------- search ---------- */

export interface SearchResults {
  courses: CourseDoc[];
  modules: ModuleDoc[];
  lessons: LessonDoc[];
}
