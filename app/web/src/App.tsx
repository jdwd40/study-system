import { useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './api';
import { RecoverySettings } from './Recovery';
import { AppShell } from './components/shell/AppShell';
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
  const signOut = useCallback(async () => { await api.post('/auth/logout'); setMe({ authenticated: false, devBypass: false }); navigate('/'); }, [navigate]);
  if (me === null) return <Spinner />;
  if (!me.authenticated) return <Login onLogin={check} devBypass={me.devBypass} />;
  return (
    <AppShell onSignOut={signOut}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/account" element={<RecoverySettings />} />
        <Route path="*" element={<main className="page"><div className="empty">Page not found. <Link to="/">Back to Today</Link>.</div></main>} />
      </Routes>
    </AppShell>
  );
}
