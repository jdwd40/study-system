import type { StudyRepo } from './repo.js';
import type { ContentStore, ContentTree } from './contentStore.js';
import { initialCardState, scheduleCard, selectDue } from '../shared/sm2.js';
import type {
  Attempt,
  CourseDoc,
  CourseProgress,
  Flashcard,
  Grade,
  LessonDoc,
  LessonState,
  ModuleDoc,
  QaEntry,
} from '../shared/types.js';

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly httpStatus = 400,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export interface CourseView extends CourseDoc {
  modules: (ModuleDoc & { lessons: (LessonDoc & { state: LessonState })[] })[];
  progress: CourseProgress;
  averageUserRating: number | null;
}

export class LessonService {
  constructor(
    private readonly repo: StudyRepo,
    private readonly store: ContentStore,
  ) {}

  tree(): ContentTree {
    return this.store.loadTree();
  }

  private mustLesson(lessonId: string): LessonDoc {
    const lesson = this.tree().lessons.find((l) => l.id === lessonId);
    if (!lesson) throw new ServiceError(`lesson not found: ${lessonId}`, 'NOT_FOUND', 404);
    return lesson;
  }

  // ---- structure ----------------------------------------------------------

  courseView(courseId: string): CourseView {
    const tree = this.tree();
    const course = tree.courses.find((c) => c.id === courseId);
    if (!course) throw new ServiceError(`course not found: ${courseId}`, 'NOT_FOUND', 404);
    return this.buildCourseView(course, tree);
  }

  courseViews(): CourseView[] {
    const tree = this.tree();
    return tree.courses.map((c) => this.buildCourseView(c, tree));
  }

  private buildCourseView(course: CourseDoc, tree: ContentTree): CourseView {
    const modules = tree.modules
      .filter((m) => m.courseId === course.id)
      .map((m) => ({
        ...m,
        lessons: tree.lessons
          .filter((l) => l.courseId === course.id && l.moduleId === m.id)
          .map((l) => ({ ...l, state: this.repo.getLessonState(l.id) })),
      }));
    const progress = this.courseProgress(course.id, tree);
    const ratings = modules
      .flatMap((m) => m.lessons)
      .map((l) => l.state.userRating)
      .filter((r): r is number => r !== null);
    return {
      ...course,
      modules,
      progress,
      averageUserRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    };
  }

  courseProgress(courseId: string, tree?: ContentTree): CourseProgress {
    const t = tree ?? this.tree();
    const planned = t.lessons.filter((l) => l.courseId === courseId);
    const completed = planned.filter((l) => this.repo.getLessonState(l.id).status === 'complete');
    return {
      courseId,
      plannedLessons: planned.length,
      completedLessons: completed.length,
      percent: planned.length === 0 ? 0 : Math.round((completed.length / planned.length) * 100),
    };
  }

  /** First not-complete lesson in established tree order. Never invents structure. */
  nextLesson(courseId?: string): LessonDoc | null {
    const tree = this.tree();
    const courses = tree.courses.filter((c) => c.status === 'active' && (!courseId || c.id === courseId));
    for (const course of courses) {
      const modules = tree.modules.filter((m) => m.courseId === course.id);
      for (const module of modules) {
        const lessons = tree.lessons.filter((l) => l.moduleId === module.id && l.courseId === course.id);
        for (const lesson of lessons) {
          if (this.repo.getLessonState(lesson.id).status !== 'complete') return lesson;
        }
      }
    }
    return null;
  }

  // ---- lifecycle ------------------------------------------------------------

  /**
   * Start (or continue) a lesson. Switching away from another lesson's active
   * attempt marks that attempt 'switched' and its lesson 'unfinished'.
   * Inactivity never ends an attempt.
   */
  startLesson(lessonId: string): { attempt: Attempt; lesson: LessonDoc; continued: boolean; switchedAwayFrom: string | null } {
    const lesson = this.mustLesson(lessonId);
    const existing = this.repo.activeAttemptForLesson(lessonId);
    if (existing) return { attempt: existing, lesson, continued: true, switchedAwayFrom: null };

    let switchedAwayFrom: string | null = null;
    const active = this.repo.getActiveAttempt();
    if (active && active.lessonId !== lessonId) {
      this.repo.closeAttempt(active.id, 'switched');
      this.repo.setLessonStatus(active.lessonId, 'unfinished');
      switchedAwayFrom = active.lessonId;
    }
    const attempt = this.repo.createAttempt(lessonId);
    return { attempt, lesson, continued: false, switchedAwayFrom };
  }

  /**
   * Explicitly end the active attempt for a lesson. Requires both a live active
   * attempt and a user rating; marks the lesson complete. There is no
   * inactivity-based or automatic completion path.
   */
  endLesson(
    lessonId: string,
    ratings: { userRating: number; hermesRating?: number | null },
  ): { attempt: Attempt; state: LessonState } {
    this.mustLesson(lessonId);
    const { userRating, hermesRating = null } = ratings;
    if (!Number.isInteger(userRating) || userRating < 1 || userRating > 5) {
      throw new ServiceError('userRating (1-5) is required to end a lesson', 'RATING_REQUIRED', 400);
    }
    const active = this.repo.activeAttemptForLesson(lessonId);
    if (!active) {
      throw new ServiceError(
        'no active attempt for this lesson — a lesson can only end after an explicit start, and never by inactivity',
        'NO_ACTIVE_ATTEMPT',
        409,
      );
    }
    if (hermesRating !== null && (!Number.isInteger(hermesRating) || hermesRating < 1 || hermesRating > 5)) {
      throw new ServiceError('hermesRating must be 1-5', 'RATING_INVALID', 400);
    }
    this.repo.setLessonRatings(lessonId, userRating, hermesRating);
    this.repo.setLessonStatus(lessonId, 'complete');
    const attempt = this.repo.closeAttempt(active.id, 'completed');
    return { attempt, state: this.repo.getLessonState(lessonId) };
  }

  recordRatings(lessonId: string, userRating: number | null, hermesRating: number | null): LessonState {
    this.mustLesson(lessonId);
    if (userRating === null && hermesRating === null) {
      throw new ServiceError('at least one rating is required', 'RATING_REQUIRED', 400);
    }
    return this.repo.setLessonRatings(lessonId, userRating, hermesRating);
  }

  // ---- Q&A ------------------------------------------------------------------

  recordQa(entry: {
    lessonId: string;
    question: string;
    userAnswer?: string | null;
    hermesFeedback?: string | null;
    result?: 'correct' | 'partial' | 'incorrect' | null;
  }): QaEntry {
    this.mustLesson(entry.lessonId);
    if (!entry.question || entry.question.trim() === '') {
      throw new ServiceError('question is required', 'QUESTION_REQUIRED', 400);
    }
    const attempt = this.repo.activeAttemptForLesson(entry.lessonId);
    return this.repo.addQa({
      lessonId: entry.lessonId,
      attemptId: attempt ? attempt.id : null,
      question: entry.question,
      userAnswer: entry.userAnswer ?? null,
      hermesFeedback: entry.hermesFeedback ?? null,
      result: entry.result ?? null,
    });
  }

  qaForLesson(lessonId: string): QaEntry[] {
    this.mustLesson(lessonId);
    return this.repo.qaForLesson(lessonId);
  }

  // ---- flashcards -------------------------------------------------------------

  cardId(lessonId: string, index: number): string {
    return `${lessonId}#${index}`;
  }

  allFlashcards(): { cardId: string; lessonId: string; lessonTitle: string; q: string; a: string; dueDate: string; isNew: boolean }[] {
    const today = londonToday();
    const out: { cardId: string; lessonId: string; lessonTitle: string; q: string; a: string; dueDate: string; isNew: boolean }[] = [];
    for (const lesson of this.tree().lessons) {
      lesson.flashcards.forEach((card: Flashcard, index: number) => {
        const cardId = this.cardId(lesson.id, index);
        const state = this.repo.getCardState(cardId, lesson.id);
        out.push({
          cardId,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          q: card.q,
          a: card.a,
          dueDate: state ? state.dueDate : today,
          isNew: state === null,
        });
      });
    }
    return out;
  }

  dueFlashcards(today = londonToday()): ReturnType<LessonService['allFlashcards']> {
    return selectDue(this.allFlashcards(), today);
  }

  reviewFlashcard(cardId: string, lessonId: string, grade: Grade, today = londonToday()) {
    const lesson = this.mustLesson(lessonId);
    const index = Number(cardId.split('#')[1]);
    if (!Number.isInteger(index) || !lesson.flashcards[index]) {
      throw new ServiceError(`flashcard not found: ${cardId}`, 'NOT_FOUND', 404);
    }
    if (!['again', 'hard', 'good', 'easy'].includes(grade)) {
      throw new ServiceError('grade must be again|hard|good|easy', 'GRADE_INVALID', 400);
    }
    const current = this.repo.getCardState(cardId, lessonId) ?? initialCardState(today);
    const next = scheduleCard(current, grade, today);
    this.repo.saveCardState(cardId, lessonId, next);
    return next;
  }

  // ---- dashboard --------------------------------------------------------------

  dashboard() {
    const tree = this.tree();
    const courses = this.courseViews();
    const active = this.repo.getActiveAttempt();
    const unfinished = this.repo
      .allLessonStates()
      .filter((s) => s.status === 'unfinished')
      .map((s) => ({ state: s, lesson: tree.lessons.find((l) => l.id === s.lessonId) }))
      .filter((x) => x.lesson);

    // Weak areas are based ONLY on the user's own understanding rating.
    const weakAreas = this.repo
      .allLessonStates()
      .filter((s) => s.userRating !== null && s.userRating <= 2)
      .map((s) => ({
        lessonId: s.lessonId,
        title: tree.lessons.find((l) => l.id === s.lessonId)?.title ?? s.lessonId,
        userRating: s.userRating,
      }));

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const studyTime = this.repo.studyMinutesByCourse(since);
    const trend = this.repo
      .allLessonStates()
      .filter((s) => s.userRating !== null)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
      .map((s) => ({ lessonId: s.lessonId, userRating: s.userRating, at: s.updatedAt }));

    const recentActivity = this.repo.recentAttempts(10).map((a) => ({
      ...a,
      lessonTitle: tree.lessons.find((l) => l.id === a.lessonId)?.title ?? a.lessonId,
    }));

    return {
      resume: active
        ? { attempt: active, lesson: tree.lessons.find((l) => l.id === active.lessonId) ?? null }
        : null,
      unfinished,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        progress: c.progress,
        averageUserRating: c.averageUserRating,
      })),
      weakAreas,
      studyTime,
      understandingTrend: trend,
      recentActivity,
      dueFlashcards: this.dueFlashcards().length,
      lastSyncError: this.repo.lastSyncError(),
    };
  }

  // ---- search -----------------------------------------------------------------

  /** Search only courses, modules and lessons. Never Q&A, flashcards or chat history. */
  search(query: string) {
    const q = query.trim().toLowerCase();
    if (q === '') return { courses: [], modules: [], lessons: [] };
    const tree = this.tree();
    const match = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(q));
    return {
      courses: tree.courses.filter((c) => match(c.title, c.description, c.id)),
      modules: tree.modules.filter((m) => match(m.title, m.summary, m.id)),
      lessons: tree.lessons.filter((l) => match(l.title, l.objective, l.id)),
    };
  }

  // ---- habit tracker link --------------------------------------------------------

  linkHabitEntry(input: { courseId?: string; habitEntryId: string; entryDate: string; minutes: number }) {
    if (!input.courseId || input.courseId.trim() === '') {
      throw new ServiceError(
        'courseId is required to link a study entry — study time is course-level and is never guessed',
        'COURSE_REQUIRED',
        400,
      );
    }
    if (!this.tree().courses.some((c) => c.id === input.courseId)) {
      throw new ServiceError(`course not found: ${input.courseId}`, 'NOT_FOUND', 404);
    }
    if (!input.habitEntryId || !/^\d{4}-\d{2}-\d{2}$/.test(input.entryDate) || !(input.minutes > 0)) {
      throw new ServiceError('habitEntryId, entryDate (YYYY-MM-DD) and positive minutes are required', 'INVALID_LINK', 400);
    }
    return this.repo.linkHabitEntry({
      courseId: input.courseId,
      habitEntryId: input.habitEntryId,
      entryDate: input.entryDate,
      minutes: input.minutes,
    });
  }
}

/** Europe/London calendar date, matching the Habit Tracker day-boundary contract. */
export function londonToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
}
