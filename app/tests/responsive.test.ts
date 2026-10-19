/**
 * Focused responsive/accessibility assertions for the web stylesheet and shell.
 *
 * These are static guards, not a browser: they verify the mobile (<=640px)
 * rules exist, that muted palette colors meet WCAG AA contrast (4.5:1) against
 * the surfaces they render on, and that the shell navigation (sidebar >=900px,
 * bottom tab bar below) can never clip its labels (e.g. "Library") — the
 * regression the browser pass caught at 412px.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appDir = resolve(new URL('.', import.meta.url).pathname, '..');
const css = readFileSync(resolve(appDir, 'web/src/styles.css'), 'utf8');

/** Every .tsx file under web/src (sorted, recursive), concatenated. */
function tsxSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxSources(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}
const appTsx = tsxSources(resolve(appDir, 'web/src')).map((f) => readFileSync(f, 'utf8')).join('\n');

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

/** Concatenate the bodies of every `@media (max-width: <px>px)` block. */
function mediaBlock(maxWidthPx: number): string {
  const blocks: string[] = [];
  const re = new RegExp(`@media\\s*\\(max-width:\\s*${maxWidthPx}px\\)\\s*\\{`, 'g');
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

const mobile = mediaBlock(640);
/** Shell breakpoint: below 900px the sidebar hides and the tab bar shows. */
const shellMobile = mediaBlock(899);

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

  it('shell switches below 900px: sidebar hidden, top bar and tab bar shown', () => {
    expect(shellMobile.length).toBeGreaterThan(0);
    expect(ruleBody(shellMobile, '.sidebar')).toContain('display: none');
    expect(ruleBody(shellMobile, '.mobile-bar')).toContain('display: flex');
    expect(ruleBody(shellMobile, '.tabbar')).toContain('display: flex');
    // Page content is never hidden under the fixed tab bar (safe-area aware).
    expect(ruleBody(shellMobile, '.page')).toMatch(/padding-bottom:\s*calc\(.*env\(safe-area-inset-bottom/);
    expect(ruleBody(css, '.tabbar')).toContain('env(safe-area-inset-bottom');
  });

  it('bottom tabs fit without scrolling: equal-width tabs, labels never clipped', () => {
    const tab = ruleBody(css, '.tab');
    expect(tab).toContain('flex: 1 1 0');
    expect(tab).toContain('min-height: 44px');
    expect(tab).toContain('white-space: nowrap');
    expect(css).not.toContain('text-overflow: ellipsis');
    expect(ruleBody(css, '.sidenav-link')).toContain('min-height: 44px');
  });

  it('mobile touch targets are at least 44px tall', () => {
    for (const selector of ['.btn-sm']) {
      expect(ruleBody(mobile, selector)).toContain('min-height: 44px');
    }
    // Shell controls (icon buttons, sidebar buttons, brand) are 44px at every width.
    expect(ruleBody(css, '.icon-btn')).toMatch(/height:\s*44px/);
    expect(ruleBody(css, '.shell-btn')).toContain('min-height: 44px');
    expect(ruleBody(css, '.brand')).toContain('min-height: 44px');
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

describe('visual polish guards', () => {
  it('archived status has a deliberate muted pill with AA contrast on its fill', () => {
    const body = ruleBody(css, '.pill-archived');
    expect(body).not.toBe('');
    expect(body).toContain('background: var(--line)');
    const colorDecl = body.match(/color:\s*(#[0-9a-fA-F]{6}|var\(--([a-z-]+)\))/);
    expect(colorDecl).not.toBeNull();
    const color = colorDecl![2] ? cssVar(colorDecl![2]) : colorDecl![1]!;
    expect(contrast(color, cssVar('line'))).toBeGreaterThanOrEqual(4.5);
  });

  it('course card headers are a flex row: title wraps, pill keeps its shape', () => {
    const head = ruleBody(css, '.course-card-head');
    expect(head).toContain('display: flex');
    expect(head).toContain('align-items: flex-start');
    const title = ruleBody(css, '.course-card-head .card-title');
    expect(title).toContain('min-width: 0');
    expect(title).toContain('overflow-wrap: break-word');
    expect(ruleBody(css, '.course-card-head .pill')).toContain('flex-shrink: 0');
    expect(appTsx).toContain('className="course-card-head"');
    // Phase 3: on Today the pill moved out of the head to the meta line
    // (long titles were squeezed between mark and pill); it keeps its shape there.
    expect(ruleBody(css, '.course-card-meta .pill')).toContain('flex-shrink: 0');
    expect(appTsx).toContain('No lessons yet');
  });

  it('lesson completion and tracker time are labelled as distinct metrics', () => {
    expect(appTsx).toContain('% of lessons complete');
    // Phase 3 (operator brief 2026-10-19): the progress audit found that
    // plannedLessons counts lesson files that exist, so Today's course cards
    // say "X of Y available lessons studied" instead of "lessons complete".
    expect(appTsx).toContain('available lessons studied');
    expect(appTsx).toContain('tracked via Habit Tracker');
  });

  it('Today lists courses (active first) before the secondary study-time report', () => {
    // Phase 3 (operator brief 2026-10-19): the operator asked for courses to
    // come before study-time reporting, with study time kept but secondary.
    // This inverts the earlier "study time above the course grid" guard; the
    // heading is now "Your courses".
    const studyIdx = appTsx.indexOf('<h2>Study time');
    const coursesIdx = appTsx.indexOf('<h2>Your courses</h2>');
    expect(studyIdx).toBeGreaterThan(-1);
    expect(coursesIdx).toBeGreaterThan(-1);
    expect(coursesIdx).toBeLessThan(studyIdx);
  });

  it('Today and the sidebar share one continue-selection helper (no /next-lesson in the shell)', () => {
    const continueCard = readFileSync(resolve(appDir, 'web/src/components/shell/ContinueCard.tsx'), 'utf8');
    const dashboard = readFileSync(resolve(appDir, 'web/src/pages/Dashboard.tsx'), 'utf8');
    expect(continueCard).toContain('pickContinueTarget(');
    expect(dashboard).toContain('pickContinueTarget(');
    expect(continueCard).not.toContain("'/next-lesson'");
    expect(dashboard).toContain("'/next-lesson'");
  });

  it('Today hero row stacks below 900px and sits side by side above it', () => {
    expect(ruleBody(css, '.today-hero')).toContain('grid-template-columns: minmax(0, 1fr)');
    const desktop = css.match(/@media \(min-width: 900px\) \{\s*\.today-hero \{([^}]*)\}/);
    expect(desktop?.[1]).toContain('minmax(240px, 1fr)');
    // Course accent is applied to edges and marks only, never a full card background.
    expect(ruleBody(css, '.continue-hero')).toContain('border-left: 4px solid var(--course-accent');
    expect(ruleBody(css, '.continue-hero')).not.toContain('background');
  });
});

describe('app shell responsive markup', () => {
  it('keeps the four full nav labels, rendered as both sidebar links and bottom tabs', () => {
    const nav = readFileSync(resolve(appDir, 'web/src/components/shell/navItems.ts'), 'utf8');
    for (const label of ['Today', 'Library', 'Review', 'Manage']) expect(nav).toContain(`label: '${label}'`);
    expect(nav.match(/label: '/g)?.length).toBe(4);
    expect(appTsx).toContain('className="sidenav-link"');
    expect(appTsx).toContain('className="tab"');
  });

  it('search palette is a labelled modal dialog with a full-search fallback', () => {
    expect(appTsx).toContain('aria-modal="true" aria-labelledby="palette-title"');
    expect(appTsx).toContain('Open full search');
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

describe('lesson reader guards (phase 4)', () => {
  const lessonTsx = readFileSync(resolve(appDir, 'web/src/pages/LessonPage.tsx'), 'utf8');
  const navTsx = readFileSync(resolve(appDir, 'web/src/components/LessonNav.tsx'), 'utf8');
  const textSizeTs = readFileSync(resolve(appDir, 'web/src/hooks/useTextSize.ts'), 'utf8');

  it('reading column is a 68ch measure at 1.05rem/1.65', () => {
    expect(ruleBody(css, '.lesson-main')).toContain('max-width: 68ch');
    const body = ruleBody(css, '.lesson-body');
    expect(body).toContain('font-size: 1.05rem');
    expect(body).toContain('line-height: 1.65');
  });

  it('Aa text size: three classes on the reading container only, persisted in study.textSize', () => {
    for (const size of ['small', 'medium', 'large']) expect(ruleBody(css, `.lesson-body.text-${size}`)).toContain('font-size');
    expect(lessonTsx).toContain('className={`lesson-body text-${textSize}`}');
    expect(textSizeTs).toContain("'study.textSize'");
    expect(textSizeTs).toContain('try {');
    // The control must not touch the shell: no text-size class is applied to html/body/main.
    expect(lessonTsx).not.toMatch(/document\.(documentElement|body)\.classList/);
    expect(ruleBody(css, '.textsize')).toContain('min-height: 44px');
  });

  it('"On this page" navigation: landmark, current-section tracking, sticky rail at >=1100px, popover below', () => {
    expect(navTsx).toContain('aria-label="On this page"');
    expect(navTsx).toContain('aria-label="In this course"');
    expect(navTsx).toContain("aria-current={current === s.id ? 'location' : undefined}");
    expect(lessonTsx).toContain('data-lesson-section');
    expect(lessonTsx).toContain('new IntersectionObserver(');
    expect(ruleBody(css, '.lesson-rail')).toContain('display: none');
    const wide = css.match(/@media \(min-width: 1100px\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(ruleBody(wide, '.lesson-rail')).toContain('position: sticky');
    expect(ruleBody(wide, '.lesson-contents')).toContain('display: none');
    expect(navTsx).toContain('aria-controls="lesson-contents-pop"');
    // No fixed/sticky bottom action bar on the reader — the end-of-content block is the mobile action.
    expect(css).not.toMatch(/\.lesson[a-z-]*\s*\{[^}]*position:\s*fixed/);
  });

  it('lifecycle button appears in the header and in the end-of-content Finish block (after Sources, before Q&A)', () => {
    expect(lessonTsx).toContain("'Retake lesson' : 'Start lesson'");
    expect(lessonTsx).toContain("I've finished reading");
    expect(lessonTsx).toContain('>End lesson</button>');
    const headerIdx = lessonTsx.indexOf('<div className="btn-row lesson-tools-action">{lifecycle}</div>');
    const sourcesIdx = lessonTsx.indexOf('id="sec-sources"');
    const finishIdx = lessonTsx.indexOf('<section className="lesson-finish">');
    const finishBtnIdx = lessonTsx.indexOf('<div className="btn-row">{lifecycle}</div>', finishIdx);
    const qaIdx = lessonTsx.indexOf('id="sec-qa"');
    expect(headerIdx).toBeGreaterThan(-1);
    expect(sourcesIdx).toBeGreaterThan(headerIdx);
    expect(finishIdx).toBeGreaterThan(sourcesIdx);
    expect(finishBtnIdx).toBeGreaterThan(finishIdx);
    expect(qaIdx).toBeGreaterThan(finishBtnIdx);
    expect(lessonTsx).toContain('Nothing completes automatically');
  });

  it('never calls /end without a userRating, and fetches /next-lesson only after a successful end', () => {
    const endCalls = lessonTsx.match(/\/end`/g) ?? [];
    expect(endCalls).toHaveLength(1);
    expect(lessonTsx).toContain('if (userRating === null) return;\n    await api.post(`/lessons/${lesson.id}/end`, { userRating });');
    expect(lessonTsx).toContain('disabled={busy || userRating === null}');
    const endIdx = lessonTsx.indexOf('/end`');
    const nextIdx = lessonTsx.indexOf('/next-lesson?course=');
    expect(nextIdx).toBeGreaterThan(endIdx);
    expect(lessonTsx.match(/\/next-lesson/g)).toHaveLength(1);
    // Q&A logging uses the server's body shape and is labelled as a note, not a quiz.
    expect(lessonTsx).toContain('/qa`, body)');
    expect(lessonTsx).toContain('not a quiz');
  });
});
