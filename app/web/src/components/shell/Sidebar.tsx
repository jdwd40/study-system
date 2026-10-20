import { Link, NavLink } from 'react-router-dom';
import type { ThemePref } from '../../hooks/useTheme';
import type { DashboardData } from '../../types';
import { ContinueCard } from './ContinueCard';
import { IconCollapse, IconExpand, IconManage, IconSearch, IconSignOut } from './icons';
import { NAV_ITEMS } from './navItems';
import { ThemeToggle } from './ThemeToggle';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Sidebar({ dashboard, onSearch, theme, setTheme, onSignOut, collapsed, setCollapsed }: {
  dashboard: DashboardData | null;
  onSearch: () => void;
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  onSignOut: () => void;
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
}) {
  // In the icon rail, visible labels are hidden; every control keeps an accessible name via aria-label + title.
  const lab = (label: string) => (collapsed ? { 'aria-label': label, title: label } : {});
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <Link to="/" className="brand sidebar-brand" aria-label="Study System — Today" title="Study System">{collapsed ? 'S' : 'Study System'}</Link>
        <button
          type="button"
          className="icon-btn sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <IconExpand /> : <IconCollapse />}
        </button>
      </div>
      {dashboard && <ContinueCard dashboard={dashboard} collapsed={collapsed} />}
      <nav className="sidenav" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="sidenav-link" {...lab(label)}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button type="button" className="shell-btn search-btn" onClick={onSearch} aria-keyshortcuts="Control+K Meta+K" {...lab('Search')}>
        <IconSearch />
        <span>Search</span>
        <kbd aria-hidden="true">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <div className="sidebar-footer">
        {dashboard?.lastSyncError && (
          <Link to="/" className="sync-pill" aria-label="Last content sync failed — details on Today" title={`Last content sync failed (${dashboard.lastSyncError.type})`}>
            <span className="sync-dot" aria-hidden="true" /><span className="sync-pill-label">Sync failed</span>
          </Link>
        )}
        <ThemeToggle theme={theme} setTheme={setTheme} showLabel />
        <NavLink to="/account" className="shell-btn" aria-label="Account" title="Account"><IconManage /><span>Account</span></NavLink>
        <button type="button" className="shell-btn" onClick={onSignOut} {...lab('Sign out')}><IconSignOut /><span>Sign out</span></button>
      </div>
    </aside>
  );
}
