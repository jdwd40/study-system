import { Link } from 'react-router-dom';
import { Bar } from '../components/Bar';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { StudyTimeBreakdown } from '../components/StudyTimeBreakdown';
import { useData } from '../hooks/useData';
import { fmtMinutes } from '../lib/format';
import type { DashboardData } from '../types';

export function Dashboard() {
  const { data, error, loading } = useData<DashboardData>('/dashboard');
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const d = data!;
  return (
    <main className="page">
      <h1>Dashboard</h1>
      <p className="page-sub">Where you are, at a glance.</p>
      {d.lastSyncError && (
        <div className="banner banner-warn" role="alert">
          Last content sync failed ({d.lastSyncError.type}): {d.lastSyncError.message}
        </div>
      )}
      {d.resume?.lesson && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--accent)' }}>
          <p className="card-title">Resume: <Link to={`/lesson/${d.resume.lesson.id}`}>{d.resume.lesson.title}</Link></p>
          <p className="card-sub">You have an active session on this lesson.</p>
        </div>
      )}
      {d.unfinished.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p className="card-title">Unfinished</p>
          <ul className="list-plain">
            {d.unfinished.map((u) => (
              <li key={u.lesson.id}><Link to={`/lesson/${u.lesson.id}`}>{u.lesson.title}</Link> <Pill status="unfinished" /></li>
            ))}
          </ul>
        </div>
      )}
      <h2>Study time <span className="meta">(via Habit Tracker — separate from lesson completion)</span></h2>
      {d.studyTime.length === 0 ? <div className="empty">No linked study time yet.</div> : (
        <StudyTimeBreakdown entries={d.studyTime} totalMinutes={d.studyTimeTotalMinutes} />
      )}
      <h2>Courses</h2>
      <div className="grid grid-cards">
        {d.courses.map((c) => (
          <Link to={`/course/${c.id}`} key={c.id} className="card course-card" style={{ color: 'inherit' }}>
            <div className="course-card-head">
              <p className="card-title">{c.title}</p>
              <Pill status={c.status} />
            </div>
            <Bar percent={c.progress.percent} />
            <p className="card-sub">{c.progress.completedLessons}/{c.progress.plannedLessons} lessons complete
              {c.averageUserRating !== null && <> · avg understanding {c.averageUserRating.toFixed(1)}/5</>}</p>
            {c.studyMinutes > 0 && <p className="card-sub studytime-line">{fmtMinutes(c.studyMinutes)} tracked via Habit Tracker</p>}
          </Link>
        ))}
      </div>
      <h2>Weak areas <span className="meta">(based only on your own ratings)</span></h2>
      {d.weakAreas.length === 0 ? <div className="empty">No weak areas — nothing rated 2 or below.</div> : (
        <ul className="list-plain card">
          {d.weakAreas.map((w) => <li key={w.lessonId}><Link to={`/lesson/${w.lessonId}`}>{w.title}</Link> <Stars value={w.userRating} /></li>)}
        </ul>
      )}
      <h2>Revision</h2>
      <p><Link to="/review">{d.dueFlashcards} flashcard{d.dueFlashcards === 1 ? '' : 's'} due →</Link></p>
      <h2>Recent activity</h2>
      {d.recentActivity.length === 0 ? <div className="empty">Nothing yet. Start a lesson from the <Link to="/library">Course Library</Link>.</div> : (
        <ul className="list-plain card">
          {d.recentActivity.map((a) => (
            <li key={a.id}><Link to={`/lesson/${a.lessonId}`}>{a.lessonTitle}</Link> <Pill status={a.status} /> <span className="meta">{a.startedAt.slice(0, 10)}</span></li>
          ))}
        </ul>
      )}
    </main>
  );
}
