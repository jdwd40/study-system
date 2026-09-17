/**
 * Static guards for key-concept dialog focus restoration.
 *
 * Regression: focus previously returned to the opener via a term-keyed ref map
 * plus requestAnimationFrame after close. rAF callbacks may never fire in
 * occluded/backgrounded tabs, which silently dropped focus restoration and
 * stranded keyboard users on <body>. The fix captures the exact opener element
 * at click time and refocuses it in a post-commit effect once the dialog
 * unmounts. These guards pin that mechanism (browser-verified separately).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appDir = resolve(new URL('.', import.meta.url).pathname, '..');
const appTsx = readFileSync(resolve(appDir, 'web/src/App.tsx'), 'utf8');

describe('concept dialog focus restoration', () => {
  it('captures the exact opener element at click time', () => {
    expect(appTsx).toContain('returnFocusRef.current = e.currentTarget; setOpenConcept(k)');
  });

  it('restores focus in a post-commit effect keyed on openConcept', () => {
    expect(appTsx).toMatch(/useEffect\(\(\) => \{\s*if \(openConcept\) return;\s*const opener = returnFocusRef\.current;/);
    expect(appTsx).toContain('[openConcept]');
  });

  it('does not rely on requestAnimationFrame for focus restoration', () => {
    expect(appTsx).not.toContain('requestAnimationFrame(');
  });

  it('guards against an unmounted opener before focusing', () => {
    expect(appTsx).toContain('opener.isConnected');
  });
});
