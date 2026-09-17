/**
 * Focused responsive/accessibility assertions for the web stylesheet and shell.
 *
 * These are static guards, not a browser: they verify the mobile (<=640px)
 * rules exist, that muted palette colors meet WCAG AA contrast (4.5:1) against
 * the surfaces they render on, and that the header nav can never clip its
 * labels (e.g. "Library") — the regression the browser pass caught at 412px.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appDir = resolve(new URL('.', import.meta.url).pathname, '..');
const css = readFileSync(resolve(appDir, 'web/src/styles.css'), 'utf8');
const appTsx = readFileSync(resolve(appDir, 'web/src/App.tsx'), 'utf8');

/* ---------- WCAG contrast helpers ---------- */

function hexToLuminance(hex: string): number {
  const m = hex.replace('#', '');
  const chan = [0, 2, 4].map((i) => {
    const s = parseInt(m.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * chan[0]! + 0.7152 * chan[1]! + 0.0722 * chan[2]!;
}

function contrast(fg: string, bg: string): number {
  const [l1, l2] = [hexToLuminance(fg), hexToLuminance(bg)].sort((a, b) => b - a);
  return (l1! + 0.05) / (l2! + 0.05);
}

function cssVar(name: string): string {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`CSS variable --${name} not found`);
  return m[1]!;
}

/* ---------- media-query block extraction ---------- */

/** Concatenate the bodies of every `@media (max-width: 640px)` block. */
function mobileBlock(): string {
  const blocks: string[] = [];
  const re = /@media\s*\(max-width:\s*640px\)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    blocks.push(css.slice(start, i - 1));
  }
  return blocks.join('\n');
}

/** Extract the rule body for a selector inside a stylesheet chunk. */
function ruleBody(chunk: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = chunk.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return m ? m[1]! : '';
}

const mobile = mobileBlock();

describe('responsive stylesheet guards', () => {
  it('defines a <=640px mobile block', () => {
    expect(mobile.length).toBeGreaterThan(0);
  });

  it('muted ink colors meet WCAG AA (4.5:1) on their surfaces', () => {
    const bg = cssVar('bg');
    const surface = cssVar('surface');
    const surfaceSoft = cssVar('surface-soft');
    const inkSoft = cssVar('ink-soft');
    const inkFaint = cssVar('ink-faint');
    // .meta / pills / chevrons / empty stars use ink-faint on bg, surface and surface-soft
    for (const surfaceCol of [bg, surface, surfaceSoft]) {
      expect(contrast(inkFaint, surfaceCol)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(inkSoft, surfaceCol)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('mobile header wraps so the nav gets a full-width row', () => {
    expect(ruleBody(mobile, '.topbar-inner')).toContain('flex-wrap: wrap');
    const nav = ruleBody(mobile, '.nav');
    expect(nav).toContain('flex-basis: 100%');
    expect(nav).toContain('order: 3');
  });

  it('mobile nav fits without scrolling: equal-width links, compact type', () => {
    const nav = ruleBody(mobile, '.nav');
    expect(nav).toContain('overflow-x: visible');
    const link = ruleBody(mobile, '.nav a');
    expect(link).toContain('flex: 1 1 0');
    expect(link).toMatch(/font-size:\s*0\.8rem/);
    // Labels stay untruncated everywhere.
    expect(ruleBody(css, '.nav a')).toContain('white-space: nowrap');
    expect(css).not.toContain('text-overflow: ellipsis');
  });

  it('mobile touch targets are at least 44px tall', () => {
    for (const selector of ['.nav a', '.logout-btn', '.btn-sm']) {
      expect(ruleBody(mobile, selector)).toContain('min-height: 44px');
    }
    // Desktop base controls already meet 44px.
    for (const selector of ['.btn', '.grade-btn']) {
      expect(ruleBody(css, selector)).toContain('min-height: 44px');
    }
    // rating buttons are fixed-size 44px squares.
    expect(ruleBody(css, '.rating-btn')).toMatch(/height:\s*44px/);
  });

  it('manage rows stack cleanly on mobile: main content full width, actions wrap', () => {
    expect(ruleBody(mobile, '.manage-main')).toContain('flex: 1 1 100%');
    expect(ruleBody(css, '.manage-row')).toContain('flex-wrap: wrap');
  });

  it('mobile metadata and stars are bumped to readable sizes', () => {
    expect(ruleBody(mobile, '.meta')).toContain('font-size: 0.85rem');
    expect(ruleBody(mobile, '.stars')).toContain('font-size: 1rem');
  });
});

describe('app shell responsive markup', () => {
  it('keeps full nav labels including "Library"', () => {
    expect(appTsx).toContain('<NavLink to="/library">Library</NavLink>');
  });

  it('manage rows use the stacking-friendly .manage-main class', () => {
    expect(appTsx.match(/className="manage-main"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(appTsx).toContain('card-title manage-main');
  });

  it('no interactive control in the markup overrides min-height below 44px', () => {
    const bad = appTsx.match(/minHeight:\s*'([0-9]+)px'/g) ?? [];
    for (const b of bad) {
      expect(parseInt(b.replace(/\D/g, ''), 10)).toBeGreaterThanOrEqual(44);
    }
  });
});
