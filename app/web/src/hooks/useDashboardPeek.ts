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
    if (pathname === '/') return;
    let alive = true;
    api.get<DashboardData>('/dashboard').then((d) => { if (alive) setData(d); }).catch(() => { /* shell extras are optional */ });
    return () => { alive = false; };
  }, [pathname]);
  return data;
}
