import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Bar } from '../components/Bar';
import { CourseMark } from '../components/CourseMark';
import { CourseScene } from '../components/CourseScene';
import { Err } from '../components/Err';
import { JourneyCard } from '../components/JourneyCard';
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
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
      <h1>{greeting()}</h1>
      <p className="page-sub">{todayLine()} · Level {d.journey.level.number} {d.journey.level.title}</p>
      {d.lastSyncError && (
        <div className="banner banner-warn" role="alert">
          Last content sync failed ({d.lastSyncError.type}): {d.lastSyncError.message}
        </div>
      )}

      <section className="today-hero" aria-label="Continue your journey">
        {target ? <ContinueHero target={target} course={courseOf(target.lesson)} />
          : needsNext && nextLesson === undefined ? <div className="card continue-hero continue-hero-empty"><Spinner /></div>
          : (
            <div className="card continue-hero continue-hero-empty">
              <p className="continue-eyebrow">Continue your journey</p>
              <p className="card-title">Nothing in progress.</p>
              <p className="card-sub">Pick a lesson from the <Link to="/library">Library</Link> whenever you're ready.</p>
            </div>
          )}
        <div className="today-side">
          <JourneyCard journey={d.journey} />
          <ReviseCard due={d.dueFlashcards} />
        </div>
      </section>

      <h2>Your courses</h2>
      {courses.length === 0 ? <div className="empty">No courses yet.</div> : (
        <div className="grid grid-cards course-grid">
          {courses.map((c) => <CourseCard key={c.id} c={c} />)}
        </div>
      )}

      <div className="today-two">
        <section>
          <h2>Worth revisiting <span className="meta">(based only on your own ratings)</span></h2>
          <p className="section-note">Ratings are your own 1–5 self-assessment after each lesson — never inferred from time spent or reading.</p>
          {d.weakAreas.length === 0 ? <div className="empty empty-sm">No weak areas — nothing rated 2 or below.</div> : (
            <ul className="list-plain card">
              {d.weakAreas.map((w) => <li key={w.lessonId}><Link to={`/lesson/${w.lessonId}`}>{w.title}</Link> <Stars value={w.userRating} /></li>)}
            </ul>
          )}
        </section>
        <section>
          <h2>Recent steps</h2>
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
  const meet = target.lesson.keyConcepts.slice(0, 4).map((k) => k.term);
  return (
    <article className="card continue-hero course-ident" style={ident.style}>
      <div className="continue-hero-art"><CourseScene scene={ident.scene} /></div>
      <div className="continue-hero-body">
        <p className="continue-eyebrow">Continue your journey · {target.label}</p>
        <div className="continue-hero-course">
          <CourseMark glyph={ident.glyph} monogram={ident.monogram} size="sm" />
          <span className="continue-hero-coursetext">
            {course ? <Link to={`/course/${course.id}`} className="continue-hero-courselink">{course.title}</Link> : <span>{target.lesson.courseId}</span>}
            {ident.territory && <span className="continue-hero-territory">{ident.territory}</span>}
          </span>
        </div>
        <p className="continue-hero-title">{target.lesson.title}</p>
        <p className="continue-hero-meta">
          <Pill status={target.status} />
          {target.lesson.estimatedMinutes !== undefined && <span className="meta">about {fmtMinutes(target.lesson.estimatedMinutes)}</span>}
          {course && course.progress.plannedLessons > 0 && <span className="meta">{course.progress.completedLessons} of {course.progress.plannedLessons} available lessons studied</span>}
        </p>
        {meet.length > 0 && (
          <p className="continue-hero-meet">
            <span className="continue-hero-meet-label">You'll meet</span>
            {meet.map((t) => <span key={t} className="concept-chip">{t}</span>)}
          </p>
        )}
        <Link to={`/lesson/${target.lesson.id}`} className="btn btn-primary continue-hero-btn">{cta} →</Link>
      </div>
    </article>
  );
}

function ReviseCard({ due }: { due: number }) {
  const n = Math.min(due, 10);
  return (
    <aside className="card revise-card" aria-label="Revise">
      <p className="continue-eyebrow">Revision run</p>
      {due === 0 ? (
        <>
          <p className="card-title">Nothing due — nice.</p>
          <p className="card-sub"><Link to="/review">Open full queue</Link></p>
        </>
      ) : (
        <>
          <p className="card-title revise-count">{due} card{due === 1 ? '' : 's'} due</p>
          <Link to="/review?session=10" className="btn btn-ghost revise-btn">Run {n} card{n === 1 ? '' : 's'} · +{n * 5} XP</Link>
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
      <div className="course-card-art"><CourseScene scene={ident.scene} /></div>
      <div className="course-card-body">
        <div className="course-card-head">
          <CourseMark glyph={ident.glyph} monogram={ident.monogram} />
          <div className="course-card-titles">
            <p className="card-title">{c.title}</p>
            {ident.territory && <p className="course-card-territory">{ident.territory}</p>}
          </div>
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
      </div>
    </Link>
  );
}
