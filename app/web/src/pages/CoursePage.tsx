import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar } from '../components/Bar';
import { CourseMark } from '../components/CourseMark';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { useData } from '../hooks/useData';
import { courseIdentity } from '../lib/courseIdentity';
import { isCompleted, nextUpLesson, plannedModules, ratingTitle } from '../lib/courseMeta';
import { fmtMinutes } from '../lib/format';
import type { CourseDetail, ModuleView } from '../types';

export function CoursePage() {
  const { courseId } = useParams();
  const { data, error, loading } = useData<CourseDetail>(`/courses/${courseId}`);
  // null = defaults (only the "Next up" module open); the user's toggles layer on top.
  const [open, setOpen] = useState<Record<string, boolean> | null>(null);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const c = data!;
  const ident = courseIdentity(c.id, c.title);
  const hasLessons = c.progress.plannedLessons > 0;
  const planned = plannedModules(c.modules).length;
  const next = nextUpLesson(c.modules);
  const defaults: Record<string, boolean> = next ? { [next.module.id]: true } : {};
  const isOpen = (m: ModuleView) => !!(open ?? defaults)[m.id];
  const toggle = (m: ModuleView) => setOpen((prev) => { const base = prev ?? defaults; return { ...base, [m.id]: !base[m.id] }; });

  return (
    <main className={`page course-page course-ident${c.status === 'archived' ? ' course-page-muted' : ''}`} style={ident.style}>
      <header className="course-head">
        <CourseMark glyph={ident.glyph} monogram={ident.monogram} size="lg" />
        <div className="course-head-text">
          <div className="course-head-row">
            <h1>{c.title}</h1>
            <Pill status={c.status} />
            {isCompleted(c) && <Pill status="complete" />}
          </div>
          {c.description && <p className="page-sub course-head-desc">{c.description}</p>}
        </div>
      </header>

      <div className="course-meta card">
        <span>{hasLessons ? <>{c.progress.completedLessons} of {c.progress.plannedLessons} available lessons studied</> : 'No lessons yet'}</span>
        <span>{c.modules.length} module{c.modules.length === 1 ? '' : 's'}{planned > 0 && <> ({planned} planned, no lessons yet)</>}</span>
        {c.studyMinutes > 0 && <span>{fmtMinutes(c.studyMinutes)} tracked via Habit Tracker</span>}
        {c.averageUserRating !== null && (
          <span className="course-meta-rating" title={ratingTitle(c.averageUserRating)}>
            <Stars value={Math.round(c.averageUserRating)} /> {c.averageUserRating.toFixed(1)}/5 self-rated
          </span>
        )}
      </div>
      {hasLessons && <Bar percent={c.progress.percent} />}

      <p className="course-nextup">
        <span className="course-nextup-label">Next up</span>
        {next ? (
          <Link to={`/lesson/${next.lesson.id}`} className="course-nextup-link">
            {next.lesson.title} <span className="meta">· {next.module.title}</span>
          </Link>
        ) : hasLessons ? <span>All available lessons studied</span> : <span>No lessons yet</span>}
      </p>

      <div className="module-list">
        {c.modules.map((m) => {
          const expanded = isOpen(m);
          const panelId = `module-${m.id}`;
          return (
            <section className="module" key={m.id} aria-labelledby={`${panelId}-title`}>
              <button type="button" className="accordion-trigger module-trigger" aria-expanded={expanded} aria-controls={panelId} onClick={() => toggle(m)}>
                <span className="accordion-chevron" aria-hidden>▸</span>
                <span className="module-head">
                  <span className="module-id">{m.id}</span>
                  <span className="module-title" id={`${panelId}-title`}>{m.title}</span>
                  <span className="module-head-meta">
                    <Pill status={m.status} />
                    {m.objectives.length > 0 && <span className="meta">{m.objectives.length} objective{m.objectives.length === 1 ? '' : 's'}</span>}
                    <span className="meta">{m.lessons.length === 0 ? 'Planned — no lessons yet' : `${m.lessons.length} lesson${m.lessons.length === 1 ? '' : 's'}`}</span>
                  </span>
                </span>
              </button>
              {expanded && (
                <div className="module-panel" id={panelId}>
                  {m.summary && <p className="card-sub module-summary">{m.summary}</p>}
                  {m.lessons.length === 0 ? (
                    <p className="meta module-planned">Planned — no lessons yet. Structure is added only by explicit action.</p>
                  ) : (
                    <ul className="list-plain lesson-list">
                      {m.lessons.map((l) => {
                        const isNext = next?.lesson.id === l.id;
                        return (
                          <li key={l.id}>
                            <Link to={`/lesson/${l.id}`} className={`lesson-row${isNext ? ' lesson-row-next' : ''}`}>
                              <span className="lesson-row-order">{l.order}</span>
                              <span className="lesson-row-title">{l.title}</span>
                              <span className="lesson-row-meta">
                                {l.estimatedMinutes !== undefined && <span className="meta">{fmtMinutes(l.estimatedMinutes)}</span>}
                                <Stars value={l.state.userRating} />
                                <Pill status={l.state.status} />
                                {isNext && <span className="next-up-mark">Next up</span>}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
