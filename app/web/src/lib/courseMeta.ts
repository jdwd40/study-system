import type { CourseDetail, LessonWithState, ModuleView } from '../types';

/**
 * Derived course facts shared by the Library cards and the course page.
 * Everything here is read straight off the /courses payload — nothing is
 * inferred from time or stored anywhere.
 */

/** Modules that arrived with no lesson files: planned, not studied. */
export function plannedModules(modules: ModuleView[]): ModuleView[] {
  return modules.filter((m) => m.lessons.length === 0);
}

/**
 * First lesson in tree order (modules, then lesson order) whose state is not
 * complete. null when every available lesson is complete or none exist.
 */
export function nextUpLesson(modules: ModuleView[]): { lesson: LessonWithState; module: ModuleView } | null {
  for (const module of modules) {
    for (const lesson of module.lessons) {
      if (lesson.state.status !== 'complete') return { lesson, module };
    }
  }
  return null;
}

/**
 * "Completed" is derived, never a stored status: the course has at least one
 * available lesson and every one of them is marked complete.
 */
export function isCompleted(c: Pick<CourseDetail, 'progress'>): boolean {
  return c.progress.plannedLessons > 0 && c.progress.completedLessons === c.progress.plannedLessons;
}

/** Tooltip for the average self-rating: the mean of the user's own 1–5 ratings. */
export function ratingTitle(avg: number): string {
  return `Average self-rating ${avg.toFixed(1)} of 5 — the mean of your own 1–5 ratings after each lesson, never inferred from time or reading`;
}
