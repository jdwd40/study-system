import type { ReactElement } from 'react';
import type { CourseGlyph } from '../lib/courseIdentity';

/** Line glyphs on a 24×24 grid, stroked in currentColor. */
const GLYPHS: Record<CourseGlyph, ReactElement> = {
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10.5h5" /></>,
  circuit: <><path d="M4 8h5l2 4h4l2-4h3M4 16h5l2-4M15 12l2 4h3" /><circle cx="4" cy="8" r="1.4" /><circle cx="4" cy="16" r="1.4" /><circle cx="20" cy="8" r="1.4" /><circle cx="20" cy="16" r="1.4" /></>,
  column: <><path d="M5 4h14M5 20h14M8 4v16M12 4v16M16 4v16" /><path d="M6 7h12M6 17h12" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /><circle cx="12" cy="12" r="6.5" /></>,
  quill: <><path d="M20 4c-6 0-11 4-13 10l-3 6" /><path d="M20 4c0 6-4 11-10 12H8" /><path d="M11 13l4-4" /></>,
  hourglass: <><path d="M6 3h12M6 21h12M8 3v3l4 6-4 6v3M16 3v3l-4 6 4 6v3" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /><circle cx="12" cy="12" r="0.8" /></>,
};

/**
 * Rounded identity tile: course glyph + 1–2 letter monogram, coloured by the
 * `--course-accent` / `--course-accent-soft` tokens of the nearest
 * `.course-ident` ancestor. Decorative — the course title is always adjacent.
 */
export function CourseMark({ glyph, monogram, size = 'md' }: { glyph: CourseGlyph; monogram: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`course-mark course-mark-${size}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        {GLYPHS[glyph]}
      </svg>
      <span className="course-mark-mono">{monogram}</span>
    </span>
  );
}
