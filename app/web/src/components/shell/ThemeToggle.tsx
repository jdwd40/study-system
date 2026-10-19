import type { ThemePref } from '../../hooks/useTheme';
import { IconAuto, IconMoon, IconSun } from './icons';

const ORDER: ThemePref[] = ['system', 'light', 'dark'];
const LABEL: Record<ThemePref, string> = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };

/** Cycles system → light → dark. Icon shows the current choice; the label announces it. */
export function ThemeToggle({ theme, setTheme, showLabel = false }: { theme: ThemePref; setTheme: (t: ThemePref) => void; showLabel?: boolean }) {
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
  const Icon = theme === 'light' ? IconSun : theme === 'dark' ? IconMoon : IconAuto;
  return (
    <button
      type="button"
      className={showLabel ? 'shell-btn' : 'icon-btn'}
      onClick={() => setTheme(next)}
      aria-label={`${LABEL[theme]} — switch to ${LABEL[next].toLowerCase()}`}
      title={`${LABEL[theme]} (click: ${LABEL[next].toLowerCase()})`}
    >
      <Icon />
      {showLabel && <span>{LABEL[theme]}</span>}
    </button>
  );
}
