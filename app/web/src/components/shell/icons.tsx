import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false,
};

export const IconToday = () => <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
export const IconLibrary = () => <svg {...base}><path d="M4 5h5v14H4zM10 5h5v14h-5zM16 6l4 1-3 12-4-1z" /></svg>;
export const IconReview = () => <svg {...base}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M7 3v3M17 3v3M3 11h18" /></svg>;
export const IconManage = () => <svg {...base}><path d="M4 7h16M4 12h10M4 17h7" /><circle cx="18" cy="15" r="3" /></svg>;
export const IconSearch = () => <svg {...base}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg>;
export const IconSun = () => <svg {...base}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
export const IconMoon = () => <svg {...base}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>;
export const IconAuto = () => <svg {...base}><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" /></svg>;
export const IconSignOut = () => <svg {...base}><path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" /></svg>;
export const IconPlay = () => <svg {...base}><path d="M7 5v14l11-7z" fill="currentColor" stroke="none" /></svg>;
export const IconCollapse = () => <svg {...base}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 10l-2 2 2 2" /></svg>;
export const IconExpand = () => <svg {...base}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M13 10l2 2-2 2" /></svg>;
