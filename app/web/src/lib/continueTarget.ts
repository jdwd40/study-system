import type { DashboardData, LessonDoc, LessonStatus } from '../types';

export type ContinueReason = 'resume' | 'recent' | 'unfinished' | 'next';

export interface ContinueTarget {
  lesson: LessonDoc;
  reason: ContinueReason;
  /** Short eyebrow label for the card ("Resume", "Pick up where you left off", ...). */
  label: string;
  status: LessonStatus | 'active';
}

export const CONTINUE_LABELS: Record<ContinueReason, string> = {
  resume: 'Resume',
  recent: 'Pick up where you left off',
  unfinished: 'Continue',
  next: 'Start next',
};

/**
 * Where the learner actually is, from the dashboard payload alone:
 *   1. the active attempt's lesson (`resume`) — "Resume";
 *   2. else the most recent attempt (`recentActivity`, newest first) whose
 *      lesson is still unfinished (confirmed against `unfinished`) —
 *      "Pick up where you left off";
 *   3. else the first unfinished lesson — "Continue".
 * Returns null when none of these apply; the Today page then asks
 * `GET /next-lesson` ("Start next"), the sidebar shows nothing.
 * Never assumes the first incomplete lesson is the last one studied.
 */
export function pickContinueTarget(d: DashboardData): ContinueTarget | null {
  if (d.resume?.lesson) {
    return { lesson: d.resume.lesson, reason: 'resume', label: CONTINUE_LABELS.resume, status: 'active' };
  }
  const unfinishedById = new Map(d.unfinished.map((u) => [u.lesson.id, u.lesson]));
  for (const a of d.recentActivity) {
    const lesson = unfinishedById.get(a.lessonId);
    if (lesson) return { lesson, reason: 'recent', label: CONTINUE_LABELS.recent, status: 'unfinished' };
  }
  const first = d.unfinished[0];
  if (first) return { lesson: first.lesson, reason: 'unfinished', label: CONTINUE_LABELS.unfinished, status: 'unfinished' };
  return null;
}
