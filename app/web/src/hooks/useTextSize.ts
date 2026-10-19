import { useCallback, useState } from 'react';

export type TextSize = 'small' | 'medium' | 'large';
export const TEXT_SIZES: TextSize[] = ['small', 'medium', 'large'];
const KEY = 'study.textSize';

function readStored(): TextSize {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'small' || v === 'medium' || v === 'large') return v;
  } catch { /* storage unavailable — medium for this session */ }
  return 'medium';
}

/**
 * Reader text size (lesson prose only, never the shell). Persisted in
 * localStorage `study.textSize`; medium is the default and matches the base
 * reading measure (1.05rem / 1.65).
 */
export function useTextSize() {
  const [textSize, setState] = useState<TextSize>(readStored);
  const setTextSize = useCallback((next: TextSize) => {
    setState(next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
  }, []);
  return { textSize, setTextSize };
}
