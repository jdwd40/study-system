import { Link } from 'react-router-dom';
import type { DashboardData } from '../../types';
import { IconPlay } from './icons';

/** Sidebar "Continue" card: only when an attempt is active (dashboard.resume). */
export function ContinueCard({ resume, collapsed = false }: { resume: DashboardData['resume']; collapsed?: boolean }) {
  if (!resume?.lesson) return null;
  const label = `Continue: ${resume.lesson.title}`;
  return (
    <Link to={`/lesson/${resume.lesson.id}`} className="continue-card" aria-label={label} title={collapsed ? label : undefined}>
      <span className="continue-eyebrow">Continue</span>
      <span className="continue-title">{resume.lesson.title}</span>
      <span className="continue-cta"><IconPlay /><span>Back to lesson</span></span>
    </Link>
  );
}
