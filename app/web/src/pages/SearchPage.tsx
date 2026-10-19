import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { SearchResults } from '../types';

export function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  useEffect(() => {
    const t = setTimeout(() => { if (q.trim()) api.get<SearchResults>(`/search?q=${encodeURIComponent(q)}`).then(setResults); else setResults(null); }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <main className="page page-narrow">
      <h1>Search</h1>
      <p className="page-sub">Courses, modules and lessons only — never your Q&amp;A or review history.</p>
      <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, modules, lessons…" aria-label="Search" />
      {results && (
        <div className="section-gap">
          {results.courses.map((c) => <p key={c.id}><Link to={`/course/${c.id}`}>{c.title}</Link> <span className="meta">course</span></p>)}
          {results.modules.map((m) => <p key={m.id}><Link to={`/course/${m.courseId}`}>{m.id} — {m.title}</Link> <span className="meta">module</span></p>)}
          {results.lessons.map((l) => <p key={l.id}><Link to={`/lesson/${l.id}`}>{l.title}</Link> <span className="meta">lesson</span></p>)}
          {results.courses.length + results.modules.length + results.lessons.length === 0 && <div className="empty">No matches.</div>}
        </div>
      )}
    </main>
  );
}
