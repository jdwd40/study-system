import type { CSSProperties } from 'react';
import type { CourseGlyph } from './courseIdentity';

/**
 * Course art registry: the explicit, subject-specific identity of each
 * course — which illustrated scene it gets, its palette, and a short
 * "territory" line for the atlas framing. Keyed by course id, with a title
 * keyword fallback so a renamed or new course still lands on something
 * thematically right; anything else falls back to the generic atlas scene
 * and the hashed identity from courseIdentity.ts.
 *
 * Colours are light/dark pairs checked for WCAG AA (accent on its soft
 * tint and on the page surfaces); the scene also gets a secondary accent
 * for warmth (`--art-second`) that is decorative only.
 */

export type ArtScene = 'map' | 'engine' | 'die' | 'blueprint' | 'model' | 'pipeline' | 'desk' | 'atlas';

export interface ArtPalette {
  light: { accent: string; soft: string; second: string };
  dark: { accent: string; soft: string; second: string };
}

export interface CourseArt {
  scene: ArtScene;
  glyph: CourseGlyph;
  /** One factual line placing the course on the map (shown under the title). */
  territory: string;
  palette: ArtPalette;
}

const PALETTES: Record<ArtScene, ArtPalette> = {
  map: { light: { accent: '#8f4e22', soft: '#f6e8d9', second: '#3f6f82' }, dark: { accent: '#e5a86f', soft: '#3a2a1d', second: '#7fb5c9' } },
  engine: { light: { accent: '#4b5566', soft: '#e8ebf0', second: '#b3541e' }, dark: { accent: '#b4c0d2', soft: '#2a3038', second: '#e2884f' } },
  die: { light: { accent: '#2d5f8e', soft: '#e0eaf6', second: '#d9a441' }, dark: { accent: '#86b7ea', soft: '#1e2f43', second: '#e6b85c' } },
  blueprint: { light: { accent: '#1f6f7a', soft: '#dbf0f2', second: '#b3541e' }, dark: { accent: '#62c3cf', soft: '#163a3f', second: '#e2884f' } },
  model: { light: { accent: '#5a4a9f', soft: '#ebe6f8', second: '#2f8f7a' }, dark: { accent: '#b7a0dc', soft: '#2c2541', second: '#5fd0b4' } },
  pipeline: { light: { accent: '#3a5bb8', soft: '#e3e9fb', second: '#d9a441' }, dark: { accent: '#93abf2', soft: '#232b4c', second: '#e6b85c' } },
  desk: { light: { accent: '#8a5a10', soft: '#f8ecd3', second: '#6b4a3a' }, dark: { accent: '#e6b85c', soft: '#3a2f17', second: '#d7a98f' } },
  atlas: { light: { accent: '#2f6f5e', soft: '#e2efea', second: '#d9a441' }, dark: { accent: '#5fb39a', soft: '#1f3a33', second: '#e6b85c' } },
};

const BY_ID: Record<string, Omit<CourseArt, 'palette'>> = {
  'bronze-age-collapse': { scene: 'map', glyph: 'column', territory: 'Eastern Mediterranean · c. 1500–1150 BCE' },
  'industrial-revolution': { scene: 'engine', glyph: 'gear', territory: 'Britain and beyond · 1700s–1800s' },
  'computer-architecture': { scene: 'die', glyph: 'circuit', territory: 'From transistor to datacentre' },
  sse: { scene: 'blueprint', glyph: 'compass', territory: 'Architecture · data · failure · operations' },
  'ai-engineering': { scene: 'model', glyph: 'circuit', territory: 'Models · agents · evaluation · infrastructure' },
  'ai-automation-integration': { scene: 'pipeline', glyph: 'gear', territory: 'Workflows · integrations · approvals' },
  'foundations-of-writing': { scene: 'desk', glyph: 'quill', territory: 'Purpose · reader · draft · revision' },
};

/** Title keywords → scene, for courses not in the registry. First match wins. */
const BY_KEYWORD: [RegExp, ArtScene, CourseGlyph][] = [
  [/\b(bronze|antiquity|ancient|empire|history|historical|medieval|rome|roman|greece|greek)\b/i, 'map', 'column'],
  [/\b(industrial|revolution|steam|victorian|engineering history)\b/i, 'engine', 'gear'],
  [/\b(architecture|hardware|processor|cpu|gpu|memory|systems? programming)\b/i, 'die', 'circuit'],
  [/\b(software|systems?|distributed|backend|infrastructure|devops|cloud)\b/i, 'blueprint', 'compass'],
  [/\b(ai|machine learning|ml|neural|llm|deep learning|agents?)\b/i, 'model', 'circuit'],
  [/\b(automation|workflow|integration|n8n|zapier|pipeline)\b/i, 'pipeline', 'gear'],
  [/\b(writing|writer|essay|fiction|prose|journalism|rhetoric)\b/i, 'desk', 'quill'],
];

export function courseArt(id: string, title: string): CourseArt {
  const known = BY_ID[id];
  if (known) return { ...known, palette: PALETTES[known.scene] };
  for (const [re, scene, glyph] of BY_KEYWORD) {
    if (re.test(title)) return { scene, glyph, territory: '', palette: PALETTES[scene] };
  }
  return { scene: 'atlas', glyph: 'compass', territory: '', palette: PALETTES.atlas };
}

/** Inline custom properties for an element carrying the `course-ident` class. */
export function artStyle(p: ArtPalette): CSSProperties {
  return {
    '--course-accent-light': p.light.accent,
    '--course-accent-soft-light': p.light.soft,
    '--course-second-light': p.light.second,
    '--course-accent-dark': p.dark.accent,
    '--course-accent-soft-dark': p.dark.soft,
    '--course-second-dark': p.dark.second,
  } as CSSProperties;
}

export const ALL_SCENES: readonly ArtScene[] = ['map', 'engine', 'die', 'blueprint', 'model', 'pipeline', 'desk', 'atlas'];
export function paletteFor(scene: ArtScene): ArtPalette { return PALETTES[scene]; }
