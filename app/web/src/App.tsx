import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './api';
import { Spinner } from './components/Spinner';
import { CoursePage } from './pages/CoursePage';
import { Dashboard } from './pages/Dashboard';
import { LessonPage } from './pages/LessonPage';
import { Library } from './pages/Library';
import { Login } from './pages/Login';
import { ManagePage } from './pages/ManagePage';
import { ReviewPage } from './pages/ReviewPage';
import { SearchPage } from './pages/SearchPage';
import type { AuthMe } from './types';

/* ---------- shell ---------- */

export default function App() {
  const [me, setMe] = useState<AuthMe | null>(null);
  const navigate = useNavigate();
  const check = useCallback(() => { api.get<AuthMe>('/auth/me').then(setMe).catch(() => setMe({ authenticated: false, devBypass: false })); }, []);
  useEffect(() => {
    check();
    const onUnauth = () => setMe({ authenticated: false, devBypass: false });
    window.addEventListener('study:unauthenticated', onUnauth);
    return () => window.removeEventListener('study:unauthenticated', onUnauth);
  }, [check]);
  if (me === null) return <Spinner />;
  if (!me.authenticated) return <Login onLogin={check} devBypass={me.devBypass} />;
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">Study System</Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/library">Library</NavLink>
            <NavLink to="/review">Review</NavLink>
            <NavLink to="/manage">Manage</NavLink>
            <NavLink to="/search">Search</NavLink>
          </nav>
          <button className="logout-btn" onClick={async () => { await api.post('/auth/logout'); setMe({ authenticated: false, devBypass: false }); navigate('/'); }}>Sign out</button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<main className="page"><div className="empty">Page not found. <Link to="/">Back to dashboard</Link>.</div></main>} />
      </Routes>
    </div>
  );
}
