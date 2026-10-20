import { Link } from 'react-router-dom';
import type { ThemePref } from '../../hooks/useTheme';
import { IconManage, IconSearch, IconSignOut } from './icons';
import { ThemeToggle } from './ThemeToggle';

/** <900px header: brand, search (opens the palette), theme, sign out. */
export function TopBar({ onSearch, theme, setTheme, onSignOut }: { onSearch: () => void; theme: ThemePref; setTheme: (t: ThemePref) => void; onSignOut: () => void }) {
  return (
    <header className="mobile-bar">
      <Link to="/" className="brand">Study System</Link>
      <div className="mobile-bar-actions">
        <button type="button" className="icon-btn" onClick={onSearch} aria-label="Search" aria-keyshortcuts="Control+K Meta+K"><IconSearch /></button>
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <Link to="/account" className="icon-btn" aria-label="Account" title="Account"><IconManage /></Link>
        <button type="button" className="icon-btn" onClick={onSignOut} aria-label="Sign out"><IconSignOut /></button>
      </div>
    </header>
  );
}
