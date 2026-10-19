import type { ComponentType } from 'react';
import { IconLibrary, IconManage, IconReview, IconToday } from './icons';

export interface NavItem { to: string; label: string; Icon: ComponentType; end?: boolean }

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Today', Icon: IconToday, end: true },
  { to: '/library', label: 'Library', Icon: IconLibrary },
  { to: '/review', label: 'Review', Icon: IconReview },
  { to: '/manage', label: 'Manage', Icon: IconManage },
];
