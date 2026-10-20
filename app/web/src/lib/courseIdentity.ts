import type { CSSProperties } from 'react';
import { artStyle, courseArt, type ArtScene } from './courseArt';

/**
 * Deterministic visual identity for a course: an accent hue, a 1–2 letter
 * monogram and a small line glyph, all derived from the course id/title so
 * the same course looks the same everywhere (Today, Library, course page)
 * without any stored preference.
 *
 * Colours are paired light/dark values (every pair checked for WCAG AA:
 * accent on its soft tint, accent on surface/bg). The card sets the pairs
 * inline; `.course-ident` in styles.css resolves `--course-accent` and
 * `--course-accent-soft` from the pair that matches the active theme.
 */

export type CourseHue = 'green' | 'teal' | 'blue' | 'violet' | 'amber' | 'rust' | 'slate';
export type CourseGlyph = 'book' | 'circuit' | 'column' | 'gear' | 'quill' | 'hourglass' | 'compass';

interface HuePair { light: [accent: string, soft: string]; dark: [accent: string, soft: string] }

const HUES: Record<CourseHue, HuePair> = {
  green: { light: ['#2f6f5e', '#e2efea'], dark: ['#5fb39a', '#1f3a33'] },
  teal: { light: ['#1f6f7a', '#dcf0f2'], dark: ['#5cc0cc', '#163a3f'] },
  blue: { light: ['#34659a', '#e3ecf7'], dark: ['#7fb0e6', '#1f2e40'] },
  violet: { light: ['#6a4fa3', '#ece6f6'], dark: ['#b39ad6', '#2d2640'] },
  amber: { light: ['#8a5a10', '#f8ecd3'], dark: ['#e6b85c', '#3a2f17'] },
  rust: { light: ['#a84b18', '#fbe9dc'], dark: ['#e2884f', '#3a2619'] },
  slate: { light: ['#4f5d73', '#e7eaf0'], dark: ['#a9b6cc', '#2a303b'] },
};
const HUE_ORDER: CourseHue[] = ['green', 'teal', 'blue', 'violet', 'amber', 'rust', 'slate'];
const GLYPH_ORDER: CourseGlyph[] = ['book', 'circuit', 'column', 'gear', 'quill', 'hourglass', 'compass'];

/** FNV-1a 32-bit — stable across runs and platforms. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const STOP = new Set(['the', 'of', 'and', 'a', 'an', 'for', 'to', 'in', 'on', 'with']);

/** Up to two initials from the title's significant words; falls back to the id. */
export function monogram(title: string, id = ''): string {
  const words = title.split(/[\s\-–—:/]+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const significant = words.filter((w) => !STOP.has(w.toLowerCase()));
  const pick = (significant.length > 0 ? significant : words).slice(0, 2).map((w) => w.match(/[\p{L}\p{N}]/u)![0]!);
  if (pick.length === 1 && (significant[0] ?? words[0] ?? '').length > 1) {
    // single word: first two letters read better than a lone initial
    const w = significant[0] ?? words[0]!;
    return (w[0]! + w[1]!).toUpperCase();
  }
  const m = pick.join('').toUpperCase();
  return m || id.slice(0, 2).toUpperCase() || '?';
}

export interface CourseIdentity {
  hue: CourseHue;
  glyph: CourseGlyph;
  monogram: string;
  /** Illustrated scene for this course (see courseArt.ts / CourseScene.tsx). */
  scene: ArtScene;
  /** One factual line placing the course ("Eastern Mediterranean · c. 1500–1150 BCE"); empty when unknown. */
  territory: string;
  /** Inline custom properties for an element carrying the `course-ident` class. */
  style: CSSProperties;
}

export function courseIdentity(id: string, title: string): CourseIdentity {
  const art = courseArt(id, title);
  if (art.scene !== 'atlas') {
    // Registered (or keyword-matched) course: the art palette and glyph are the identity.
    return { hue: 'green', glyph: art.glyph, monogram: monogram(title, id), scene: art.scene, territory: art.territory, style: artStyle(art.palette) };
  }
  const h = hash(id);
  const hue = HUE_ORDER[h % HUE_ORDER.length]!;
  // Use a different slice of the hash for the glyph so hue and glyph don't pair up 1:1.
  const glyph = GLYPH_ORDER[Math.floor(h / 7919) % GLYPH_ORDER.length]!;
  const pair = HUES[hue];
  const style = {
    '--course-accent-light': pair.light[0],
    '--course-accent-soft-light': pair.light[1],
    '--course-accent-dark': pair.dark[0],
    '--course-accent-soft-dark': pair.dark[1],
  } as CSSProperties;
  return { hue, glyph, monogram: monogram(title, id), scene: 'atlas', territory: '', style };
}
