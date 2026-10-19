import { useCallback, useState } from 'react';

const KEY = 'study.sidebar';

/** Desktop sidebar collapsed ('rail') state, persisted; storage failures are ignored. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try { return localStorage.getItem(KEY) === 'rail'; } catch { return false; }
  });
  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    try { localStorage.setItem(KEY, next ? 'rail' : 'open'); } catch { /* session-only */ }
  }, []);
  return { collapsed, setCollapsed };
}
