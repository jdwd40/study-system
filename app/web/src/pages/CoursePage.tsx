import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CourseMark } from '../components/CourseMark';
import { CourseScene } from '../components/CourseScene';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { useData } from '../hooks/useData';
import { courseIdentity } from '../lib/courseIdentity';
import { isCompleted, nextUpLesson, plannedModules, ratingTitle } from '../lib/courseMeta';
import { fmtMinutes } from '../lib/format';
import type { CourseDetail, LessonWithState, ModuleView } from '../types';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
const roman = (n: number) => ROMAN[n - 1] ?? String(n);

type StepKind = 'claimed' | 'next' | 'unfinished' | 'ahead';
function stepKind(l: LessonWithState, nextId: string | undefined): StepKind {
  if (l.state.status === 'complete') return 'claimed';
  if (l.id === nextId) return 'next';
  if (l.state.status === 'unfinished') return 'unfinished';
  return 'ahead';
}

/**
 * Course page as a journey: art banner, identity header, a journey summary
 * with the next step, then the trail — one region per module, one waypoint
 * per lesson. Claimed waypoints are filled, the next step is marked, and
 * planned modules with no lessons show as unmapped territory. Nothing is
 * locked: every lesson stays a plain link.
 */
export function CoursePage() {
  const { courseId } = useParams();
  const { data, error, loading } = useData<CourseDetail>(`/courses/${courseId}`);
  // null = defaults (regions with the next step or unfinished work open); the user's toggles layer on top.
  const [open, setOpen] = useState<Record<string, boolean> | null>(null);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const c = data!;
  const ident = courseIdentity(c.id, c.title);
  const hasLessons = c.progress.plannedLessons > 0;
  const planned = plannedModules(c.modules).length;
  const next = nextUpLesson(c.modules);
  const completed = isCompleted(c);
  const modulesClaimed = c.modules.filter((m) => m.lessons.length > 0 && m.lessons.every((l) => l.state.status === 'complete')).length;
  const mapped = c.modules.length - planned;
  const defaults: Record<string, boolean> = {};
  for (const m of c.modules) {
    if (m.id === next?.module.id || m.lessons.some((l) => l.state.status === 'unfinished')) defaults[m.id] = true;
  }
  const isOpen = (m: ModuleView) => !!(open ?? defaults)[m.id];
  const toggle = (m: ModuleView) => setOpen((prev) => { const base = prev ?? defaults; return { ...base, [m.id]: !base[m.id] }; });

  return (
    <main className={`page course-page course-ident${c.status === 'archived' ? ' course-page-muted' : ''}`} style={ident.style}>
      <div className="course-banner" aria-hidden="true"><CourseScene scene={ident.scene} /></div>
      <header className="course-head">
        <CourseMark glyph={ident.glyph} monogram={ident.monogram} size="lg" />
        <div className="course-head-text">
          <div className="course-head-row">
            <h1>{c.title}</h1>
            <Pill status={c.status} />
            {completed && <Pill status="complete" />}
          </div>
          {ident.territory && <p className="course-territory">{ident.territory}</p>}
          {c.description && <p className="page-sub course-head-desc">{c.description}</p>}
        </div>
      </header>

      <section className="card course-journey" aria-label="Journey">
        <div className="course-journey-progress">
          <p className="continue-eyebrow">Your journey here</p>
          <p className="course-journey-big">
            {hasLessons ? <><strong>{c.progress.completedLessons}</strong> of {c.progress.plannedLessons} waypoints claimed</> : 'No waypoints mapped yet'}
          </p>
          {hasLessons && (
            <div className="trail-bar" role="progressbar" aria-label="Lessons studied" aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.progress.percent}>
              <div className="trail-bar-fill" style={{ width: `${c.progress.percent}%` }} />
            </div>
          )}
          <p className="course-journey-meta">
            <span>{hasLessons ? <>{c.progress.percent}% of available lessons studied</> : 'No lessons yet'}</span>
            <span>{modulesClaimed} of {mapped} mapped region{mapped === 1 ? '' : 's'} claimed{planned > 0 && <> · {planned} unmapped</>}</span>
            {c.studyMinutes > 0 && <span>{fmtMinutes(c.studyMinutes)} tracked via Habit Tracker</span>}
            {c.averageUserRating !== null && (
              <span className="course-meta-rating" title={ratingTitle(c.averageUserRating)}>
                <Stars value={Math.round(c.averageUserRating)} /> {c.averageUserRating.toFixed(1)}/5 self-rated
              </span>
            )}
          </p>
        </div>
        <div className="course-journey-next">
          {next ? (
            <>
              <p className="continue-eyebrow">Next step</p>
              <p className="course-journey-next-title">{next.lesson.title}</p>
              <p className="meta">{next.module.title}{next.lesson.estimatedMinutes !== undefined && <> · about {fmtMinutes(next.lesson.estimatedMinutes)}</>}</p>
              <Link to={`/lesson/${next.lesson.id}`} className="btn btn-primary course-journey-btn">
                {next.lesson.state.status === 'unfinished' ? 'Continue' : 'Set out'} →
              </Link>
            </>
          ) : hasLessons ? (
            <>
              <p className="continue-eyebrow">Territory claimed</p>
              <p className="course-journey-next-title">Every available lesson studied.</p>
              <p className="meta">Retake any lesson from the trail, or revise its cards.</p>
              <Link to="/review" className="btn btn-ghost course-journey-btn">Open revision</Link>
            </>
          ) : (
            <>
              <p className="continue-eyebrow">Unmapped</p>
              <p className="course-journey-next-title">No lessons yet.</p>
              <p className="meta">Structure is added only by explicit action on the Manage page.</p>
            </>
          )}
        </div>
      </section>

      <h2 className="trail-heading">The trail</h2>
      <ol className="trail list-plain">
        {c.modules.map((m, i) => {
          const isPlanned = m.lessons.length === 0;
          const claimedCount = m.lessons.filter((l) => l.state.status === 'complete').length;
          const regionClaimed = !isPlanned && claimedCount === m.lessons.length;
          const hasNext = m.id === next?.module.id;
          const expanded = !isPlanned && isOpen(m);
          const panelId = `region-${m.id}`;
          const cls = `trail-region${isPlanned ? ' is-planned' : ''}${regionClaimed ? ' is-claimed' : ''}${hasNext ? ' is-next' : ''}`;
          return (
            <li className={cls} key={m.id}>
              <button type="button" className="trail-region-head" aria-expanded={isPlanned ? undefined : expanded} aria-controls={isPlanned ? undefined : panelId} disabled={isPlanned} onClick={() => toggle(m)}>
                <span className="trail-region-marker" aria-hidden="true">{regionClaimed ? '✓' : roman(i + 1)}</span>
                <span className="trail-region-text">
                  <span className="trail-region-title">{m.title}</span>
                  <span className="trail-region-meta">
                    <span className="module-id">{m.id}</span>
                    <Pill status={m.status} />
                    {isPlanned ? <span className="meta">Unmapped — planned, no lessons yet</span>
                      : <span className="meta">{claimedCount} of {m.lessons.length} claimed{m.objectives.length > 0 && <> · {m.objectives.length} objective{m.objectives.length === 1 ? '' : 's'}</>}</span>}
                    {hasNext && !expanded && <span className="next-up-mark">Next step</span>}
                  </span>
                  {!isPlanned && !expanded && (
                    <span className="trail-dots" aria-hidden="true">
                      {m.lessons.map((l) => <span key={l.id} className={`trail-dot is-${stepKind(l, next?.lesson.id)}`} />)}
                    </span>
                  )}
                </span>
                {!isPlanned && <span className="accordion-chevron" aria-hidden="true">▸</span>}
              </button>
              {expanded && (
                <div className="trail-region-panel" id={panelId}>
                  {m.summary && <p className="card-sub module-summary">{m.summary}</p>}
                  <ol className="trail-steps list-plain">
                    {m.lessons.map((l) => {
                      const kind = stepKind(l, next?.lesson.id);
                      return (
                        <li key={l.id} className={`trail-step is-${kind}`}>
                          <Link to={`/lesson/${l.id}`} className="trail-step-link">
                            <span className="trail-node" aria-hidden="true">
                              {kind === 'claimed' ? <svg viewBox="0 0 16 16" width="12" height="12"><path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                : kind === 'next' ? <span className="trail-node-flag" /> : <span className="trail-node-n">{l.order}</span>}
                            </span>
                            <span className="trail-step-text">
                              <span className="trail-step-title">{l.title}</span>
                              <span className="trail-step-meta">
                                {kind === 'next' && <span className="next-up-mark">Next step</span>}
                                {kind === 'claimed' && <span className="trail-claimed">Claimed</span>}
                                <Pill status={l.state.status} />
                                {l.estimatedMinutes !== undefined && <span className="meta">{fmtMinutes(l.estimatedMinutes)}</span>}
                                <Stars value={l.state.userRating} />
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
