import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useDashboardPeek } from '../../hooks/useDashboardPeek';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { useTheme } from '../../hooks/useTheme';
import { BottomTabs } from './BottomTabs';
import { CommandPalette, type PaletteCommand } from './CommandPalette';
import { IconMoon, IconSearch, IconSun } from './icons';
import { NAV_ITEMS } from './navItems';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * Authenticated layout: sidebar (>=900px) or top bar + bottom tabs (<900px),
 * plus the Ctrl/Cmd+K search palette. Focus returns to whatever opened the
 * palette once it closes (same post-commit effect pattern as LessonPage).
 */
export function AppShell({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
  const { theme, setTheme } = useTheme();
  const dashboard = useDashboardPeek();
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openPalette = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!paletteOpen) openPalette();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [paletteOpen, openPalette]);

  useEffect(() => {
    if (paletteOpen) return;
    const opener = returnFocusRef.current;
    returnFocusRef.current = null;
    if (opener && opener.isConnected) opener.focus();
  }, [paletteOpen]);

  const commands = useMemo<PaletteCommand[]>(() => {
    const dark = theme === 'dark' || (theme === 'system' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
    return [
      ...NAV_ITEMS.map(({ to, label, Icon }) => ({ key: to, title: label, to, icon: <Icon /> })),
      { key: 'search', title: 'Open full search', to: '/search', icon: <IconSearch /> },
      { key: 'theme', title: dark ? 'Toggle theme: switch to light' : 'Toggle theme: switch to dark', run: () => setTheme(dark ? 'light' : 'dark'), icon: dark ? <IconSun /> : <IconMoon /> },
    ];
  }, [theme, setTheme]);

  return (
    <div className={`app-shell${collapsed ? ' rail' : ''}`}>
      <Sidebar dashboard={dashboard} onSearch={openPalette} theme={theme} setTheme={setTheme} onSignOut={onSignOut} collapsed={collapsed} setCollapsed={setCollapsed} />
      <TopBar onSearch={openPalette} theme={theme} setTheme={setTheme} onSignOut={onSignOut} />
      <div className="app-main">{children}</div>
      <BottomTabs />
      {paletteOpen && <CommandPalette onClose={closePalette} commands={commands} />}
    </div>
  );
}
