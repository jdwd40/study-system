import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';
import type { DashboardData } from '../types';

/**
 * Lightweight /dashboard read for the shell (Continue card, sync pill).
 * Fetches once per navigation, but never while on Today (`/`), where the
 * Dashboard page already fetches the same payload; the last known data is
 * kept so the shell doesn't blink between routes.
 */
export function useDashboardPeek(): DashboardData | null {
  const { pathname } = useLocation();
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => {
    let alive = true;
    const peek = () => { api.get<DashboardData>('/dashboard').then((d) => { if (alive) setData(d); }).catch(() => { /* shell extras are optional */ }); };
    if (pathname !== '/') peek();
    // LessonPage announces a successful start/end so the Continue card never keeps
    // pointing at a lesson that was just completed (also while on Today, where this
    // hook otherwise stays idle).
    window.addEventListener('study:progress', peek);
    return () => { alive = false; window.removeEventListener('study:progress', peek); };
  }, [pathname]);
  return data;
}
