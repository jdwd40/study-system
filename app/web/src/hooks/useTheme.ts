import { useCallback, useEffect, useState } from 'react';

export type ThemePref = 'light' | 'dark' | 'system';
const KEY = 'study.theme';

function readStored(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* storage unavailable (private mode, blocked) — fall back to system */ }
  return 'system';
}

/** Mirrors the pre-paint script in index.html: data-theme set for an explicit choice, removed for system. */
function apply(pref: ThemePref) {
  const root = document.documentElement;
  if (pref === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', pref);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePref>(readStored);
  useEffect(() => { apply(theme); }, [theme]);
  const setTheme = useCallback((next: ThemePref) => {
    setThemeState(next);
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch { /* ignore: preference lives for this session only */ }
  }, []);
  return { theme, setTheme };
}
