import { Link } from 'react-router-dom';
import { courseIdentity } from '../lib/courseIdentity';
import { isCompleted, plannedModules, ratingTitle } from '../lib/courseMeta';
import { fmtMinutes } from '../lib/format';
import type { CourseDetail } from '../types';
import { Bar } from './Bar';
import { CourseMark } from './CourseMark';
import { Pill } from './Pill';
import { Stars } from './Stars';

/**
 * Library course card. Same head/bar/meta structure as Today's cards (mark +
 * title, accent-filled bar, pill + "X of Y available lessons studied"), plus
 * the description, module count and the average self-rating.
 */
export function CourseCard({ c }: { c: CourseDetail }) {
  const ident = courseIdentity(c.id, c.title);
  const hasLessons = c.progress.plannedLessons > 0;
  const planned = plannedModules(c.modules).length;
  const completed = isCompleted(c);
  return (
    <Link to={`/course/${c.id}`} className={`card course-card course-ident${c.status === 'archived' ? ' course-card-muted' : ''}`} style={{ color: 'inherit', ...ident.style }}>
      <div className="course-card-head">
        <CourseMark glyph={ident.glyph} monogram={ident.monogram} />
        <p className="card-title">{c.title}</p>
      </div>
      {c.description && <p className="card-sub course-card-desc" title={c.description}>{c.description}</p>}
      {hasLessons && <Bar percent={c.progress.percent} label={false} />}
      <p className="card-sub course-card-meta">
        <Pill status={c.status} />
        {completed && <Pill status="complete" />}
        <span>
          {hasLessons ? <>{c.progress.completedLessons} of {c.progress.plannedLessons} available lessons studied</> : 'No lessons yet'}
        </span>
      </p>
      <p className="card-sub course-card-modules">
        {c.modules.length} module{c.modules.length === 1 ? '' : 's'}
        {planned > 0 && <> · {planned} planned with no lessons yet</>}
      </p>
      {c.studyMinutes > 0 && <p className="card-sub studytime-line">{fmtMinutes(c.studyMinutes)} tracked via Habit Tracker</p>}
      {c.averageUserRating !== null && (
        <p className="card-sub course-card-rating" title={ratingTitle(c.averageUserRating)}>
          <Stars value={Math.round(c.averageUserRating)} />
          <span className="meta">{c.averageUserRating.toFixed(1)}/5 self-rated</span>
        </p>
      )}
    </Link>
  );
}
