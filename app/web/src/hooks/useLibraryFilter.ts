import { useCallback, useState } from 'react';

export type LibraryFilter = 'all' | 'active' | 'paused' | 'archived' | 'completed';
export const LIBRARY_FILTERS: LibraryFilter[] = ['all', 'active', 'paused', 'archived', 'completed'];
const KEY = 'study.libraryFilter';

function isFilter(v: unknown): v is LibraryFilter {
  return typeof v === 'string' && (LIBRARY_FILTERS as string[]).includes(v);
}

function readStored(): LibraryFilter {
  try {
    const v = localStorage.getItem(KEY);
    if (isFilter(v)) return v;
  } catch { /* storage unavailable — "all" for this session */ }
  return 'all';
}

/** Library status chip, persisted in localStorage `study.libraryFilter`. */
export function useLibraryFilter() {
  const [filter, setState] = useState<LibraryFilter>(readStored);
  const setFilter = useCallback((next: LibraryFilter) => {
    setState(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  }, []);
  return { filter, setFilter };
}
