import { CourseCard } from '../components/CourseCard';
import { Err } from '../components/Err';
import { Spinner } from '../components/Spinner';
import { useData } from '../hooks/useData';
import { LIBRARY_FILTERS, useLibraryFilter, type LibraryFilter } from '../hooks/useLibraryFilter';
import { isCompleted } from '../lib/courseMeta';
import type { CourseDetail, CourseStatus, CoursesResponse } from '../types';

const COURSE_ORDER: Record<CourseStatus, number> = { active: 0, paused: 1, archived: 2 };
const FILTER_LABELS: Record<LibraryFilter, string> = { all: 'All', active: 'Active', paused: 'Paused', archived: 'Archived', completed: 'Completed' };

function matches(c: CourseDetail, f: LibraryFilter): boolean {
  if (f === 'all') return true;
  if (f === 'completed') return isCompleted(c);
  return c.status === f;
}

export function Library() {
  const { data, error, loading } = useData<CoursesResponse>('/courses');
  const { filter, setFilter } = useLibraryFilter();
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const all = [...data!.courses].sort((a, b) => COURSE_ORDER[a.status] - COURSE_ORDER[b.status]);
  const counts = Object.fromEntries(LIBRARY_FILTERS.map((f) => [f, all.filter((c) => matches(c, f)).length])) as Record<LibraryFilter, number>;
  // "Completed" is derived (all available lessons studied), so the chip only
  // exists when at least one course qualifies; a stale stored choice falls back.
  const chips = LIBRARY_FILTERS.filter((f) => f !== 'completed' || counts.completed > 0);
  const active: LibraryFilter = chips.includes(filter) ? filter : 'all';
  const courses = all.filter((c) => matches(c, active));

  return (
    <main className="page library">
      <h1>Library</h1>
      <p className="page-sub">Your atlas of courses — every territory, and how far you&apos;ve travelled in each.</p>
      <div className="filter-chips" role="group" aria-label="Filter by status">
        {chips.map((f) => (
          <button key={f} type="button" className="filter-chip" aria-pressed={active === f} onClick={() => setFilter(f)}>
            {FILTER_LABELS[f]} <span className="filter-chip-count">{counts[f]}</span>
          </button>
        ))}
      </div>
      {courses.length === 0 ? (
        <div className="empty">{all.length === 0 ? 'No courses yet.' : `No ${FILTER_LABELS[active].toLowerCase()} courses.`}</div>
      ) : (
        <div className="grid grid-cards course-grid">
          {courses.map((c) => <CourseCard key={c.id} c={c} />)}
        </div>
      )}
    </main>
  );
}
