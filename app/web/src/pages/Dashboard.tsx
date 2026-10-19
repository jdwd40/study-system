import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Bar } from '../components/Bar';
import { CourseMark } from '../components/CourseMark';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { StudyTimeBreakdown } from '../components/StudyTimeBreakdown';
import { useData } from '../hooks/useData';
import { CONTINUE_LABELS, pickContinueTarget, type ContinueTarget } from '../lib/continueTarget';
import { courseIdentity } from '../lib/courseIdentity';
import { fmtMinutes } from '../lib/format';
import type { CourseStatus, CourseSummary, DashboardData, LessonDoc } from '../types';

const COURSE_ORDER: Record<CourseStatus, number> = { active: 0, paused: 1, archived: 2 };

function todayLine(): string {
  // "Sunday 19 October" — day-first, no year; it's today, the year is implied.
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function Dashboard() {
  const { data, error, loading } = useData<DashboardData>('/dashboard');
  // Fallback only: fetched when the dashboard payload has no local candidate
  // (no active attempt, nothing unfinished). undefined = not asked yet.
  const [nextLesson, setNextLesson] = useState<LessonDoc | null | undefined>(undefined);
  const localTarget = data ? pickContinueTarget(data) : null;
  const needsNext = !!data && !localTarget;
  useEffect(() => {
    if (!needsNext) return;
    let alive = true;
    api.get<{ lesson: LessonDoc | null }>('/next-lesson')
      .then((r) => { if (alive) setNextLesson(r.lesson); })
      .catch(() => { if (alive) setNextLesson(null); });
    return () => { alive = false; };
  }, [needsNext]);

  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const d = data!;
  const target: ContinueTarget | null = localTarget
    ?? (nextLesson ? { lesson: nextLesson, reason: 'next', label: CONTINUE_LABELS.next, status: 'not_started' } : null);
  const courseOf = (lesson: LessonDoc) => d.courses.find((c) => c.id === lesson.courseId);
  const courses = [...d.courses].sort((a, b) => COURSE_ORDER[a.status] - COURSE_ORDER[b.status]);

  return (
    <main className="page today">
      <h1>Today</h1>
      <p className="page-sub">{todayLine()}</p>
      {d.lastSyncError && (
        <div className="banner banner-warn" role="alert">
          Last content sync failed ({d.lastSyncError.type}): {d.lastSyncError.message}
        </div>
      )}

      <section className="today-hero" aria-label="Continue studying">
        {target ? <ContinueHero target={target} course={courseOf(target.lesson)} />
          : needsNext && nextLesson === undefined ? <div className="card continue-hero continue-hero-empty"><Spinner /></div>
          : (
            <div className="card continue-hero continue-hero-empty">
              <p className="continue-eyebrow">Continue studying</p>
              <p className="card-title">Nothing in progress.</p>
              <p className="card-sub">Pick a lesson from the <Link to="/library">Library</Link> whenever you're ready.</p>
            </div>
          )}
        <ReviseCard due={d.dueFlashcards} />
      </section>

      <h2>Your courses</h2>
      {courses.length === 0 ? <div className="empty">No courses yet.</div> : (
        <div className="grid grid-cards course-grid">
          {courses.map((c) => <CourseCard key={c.id} c={c} />)}
        </div>
      )}

      <div className="today-two">
        <section>
          <h2>Weak areas <span className="meta">(based only on your own ratings)</span></h2>
          <p className="section-note">Ratings are your own 1–5 self-assessment after each lesson — never inferred from time spent or reading.</p>
          {d.weakAreas.length === 0 ? <div className="empty empty-sm">No weak areas — nothing rated 2 or below.</div> : (
            <ul className="list-plain card">
              {d.weakAreas.map((w) => <li key={w.lessonId}><Link to={`/lesson/${w.lessonId}`}>{w.title}</Link> <Stars value={w.userRating} /></li>)}
            </ul>
          )}
        </section>
        <section>
          <h2>Recent activity</h2>
          {d.recentActivity.length === 0 ? <div className="empty empty-sm">Nothing yet. Start a lesson from the <Link to="/library">Course Library</Link>.</div> : (
            <ul className="list-plain card">
              {d.recentActivity.map((a) => (
                <li key={a.id}><Link to={`/lesson/${a.lessonId}`}>{a.lessonTitle}</Link> <Pill status={a.status} /> <span className="meta">{a.startedAt.slice(0, 10)}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <h2>Study time <span className="meta">(via Habit Tracker — separate from lesson completion)</span></h2>
      {d.studyTime.length === 0 ? <div className="empty">No linked study time yet.</div> : (
        <StudyTimeBreakdown entries={d.studyTime} totalMinutes={d.studyTimeTotalMinutes} />
      )}
    </main>
  );
}

function ContinueHero({ target, course }: { target: ContinueTarget; course: CourseSummary | undefined }) {
  const ident = courseIdentity(target.lesson.courseId, course?.title ?? target.lesson.courseId);
  const cta = target.reason === 'resume' ? 'Back to lesson' : target.reason === 'next' ? 'Start lesson' : 'Open lesson';
  return (
    <article className="card continue-hero course-ident" style={ident.style}>
      <p className="continue-eyebrow">{target.label}</p>
      <div className="continue-hero-course">
        <CourseMark glyph={ident.glyph} monogram={ident.monogram} size="sm" />
        {course ? <Link to={`/course/${course.id}`} className="continue-hero-courselink">{course.title}</Link> : <span>{target.lesson.courseId}</span>}
      </div>
      <p className="continue-hero-title">{target.lesson.title}</p>
      <p className="continue-hero-meta">
        <Pill status={target.status} />
        {target.lesson.estimatedMinutes !== undefined && <span className="meta">about {fmtMinutes(target.lesson.estimatedMinutes)}</span>}
      </p>
      <Link to={`/lesson/${target.lesson.id}`} className="btn btn-primary continue-hero-btn">{cta}</Link>
    </article>
  );
}

function ReviseCard({ due }: { due: number }) {
  return (
    <aside className="card revise-card" aria-label="Revise">
      <p className="continue-eyebrow">Revise</p>
      {due === 0 ? (
        <>
          <p className="card-title">Nothing due — nice.</p>
          <p className="card-sub"><Link to="/review">Open full queue</Link></p>
        </>
      ) : (
        <>
          <p className="card-title revise-count">{due} card{due === 1 ? '' : 's'} due</p>
          <Link to="/review?session=10" className="btn btn-ghost revise-btn">Revise {Math.min(due, 10)} card{Math.min(due, 10) === 1 ? '' : 's'}</Link>
          <p className="card-sub"><Link to="/review">Open full queue</Link></p>
        </>
      )}
    </aside>
  );
}

function CourseCard({ c }: { c: CourseSummary }) {
  const ident = courseIdentity(c.id, c.title);
  const hasLessons = c.progress.plannedLessons > 0;
  return (
    <Link to={`/course/${c.id}`} className={`card course-card course-ident${c.status === 'archived' ? ' course-card-muted' : ''}`} style={{ color: 'inherit', ...ident.style }}>
      <div className="course-card-head">
        <CourseMark glyph={ident.glyph} monogram={ident.monogram} />
        <p className="card-title">{c.title}</p>
      </div>
      {hasLessons && <Bar percent={c.progress.percent} label={false} />}
      <p className="card-sub course-card-meta">
        <Pill status={c.status} />
        <span>
          {hasLessons ? <>{c.progress.completedLessons} of {c.progress.plannedLessons} available lessons studied</> : 'No lessons yet'}
          {c.averageUserRating !== null && <> · avg understanding {c.averageUserRating.toFixed(1)}/5</>}
        </span>
      </p>
      {c.studyMinutes > 0 && <p className="card-sub studytime-line">{fmtMinutes(c.studyMinutes)} tracked via Habit Tracker</p>}
    </Link>
  );
}
