import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar } from '../components/Bar';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { useData } from '../hooks/useData';
import { fmtMinutes } from '../lib/format';
import type { CourseDetail } from '../types';

export function CoursePage() {
  const { courseId } = useParams();
  const { data, error, loading } = useData<CourseDetail>(`/courses/${courseId}`);
  const [open, setOpen] = useState<string | null>(null);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const c = data!;
  return (
    <main className="page">
      <h1>{c.title}</h1>
      <p className="page-sub">{c.description}</p>
      <div className="course-meta card">
        <span><Pill status={c.status} /></span>
        <span>{c.progress.completedLessons}/{c.progress.plannedLessons} lessons complete</span>
        {c.studyMinutes > 0 && <span>{fmtMinutes(c.studyMinutes)} tracked via Habit Tracker</span>}
      </div>
      <Bar percent={c.progress.percent} />
      <div className="section-gap">
        {c.modules.map((m) => {
          const expanded = open === m.id;
          return (
            <div className="accordion" key={m.id}>
              <button className="accordion-trigger" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : m.id)}>
                <span>{m.id} — {m.title} <Pill status={m.status} /></span>
                <span className="accordion-chevron" aria-hidden>▸</span>
              </button>
              {expanded && (
                <div className="accordion-panel">
                  <p className="card-sub" style={{ padding: '0.5rem 0.75rem' }}>{m.summary}</p>
                  {m.lessons.length === 0 ? (
                    <p className="meta" style={{ padding: '0 0.75rem 0.5rem' }}>No lessons yet — structure is added only by explicit action.</p>
                  ) : m.lessons.map((l) => (
                    <Link to={`/lesson/${l.id}`} key={l.id} className="lesson-row">
                      <span className="lesson-row-title">{l.order}. {l.title}</span>
                      <Stars value={l.state.userRating} />
                      <Pill status={l.state.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
