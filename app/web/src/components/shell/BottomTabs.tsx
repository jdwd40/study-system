import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';

/** <900px: four fixed tabs with safe-area padding. */
export function BottomTabs() {
  return (
    <nav className="tabbar" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="tab">
          <Icon />
          <span className="tab-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
