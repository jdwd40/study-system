import { Link } from 'react-router-dom';
import { Bar } from '../components/Bar';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { useData } from '../hooks/useData';
import { fmtMinutes } from '../lib/format';
import type { CoursesResponse } from '../types';

export function Library() {
  const { data, error, loading } = useData<CoursesResponse>('/courses');
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  return (
    <main className="page">
      <h1>Course Library</h1>
      <p className="page-sub">All courses, active and paused.</p>
      <div className="grid grid-cards">
        {data!.courses.map((c) => (
          <Link to={`/course/${c.id}`} key={c.id} className="card course-card" style={{ color: 'inherit' }}>
            <p className="card-title">{c.title}</p>
            <p className="card-sub">{c.description}</p>
            <Bar percent={c.progress.percent} />
            <p className="card-sub"><Pill status={c.status} /> {c.modules.length} modules
              {c.studyMinutes > 0 && <> · {fmtMinutes(c.studyMinutes)} tracked</>}
              {c.averageUserRating !== null && <> · <Stars value={Math.round(c.averageUserRating)} /></>}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
