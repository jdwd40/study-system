import { Link } from 'react-router-dom';
import { pickContinueTarget } from '../../lib/continueTarget';
import type { DashboardData } from '../../types';
import { IconPlay } from './icons';

/**
 * Sidebar "Continue" card. Uses the same selection as Today's hero card
 * (active attempt → most recent unfinished attempt → first unfinished) but
 * never fetches /next-lesson: with no local candidate it renders nothing.
 */
export function ContinueCard({ dashboard, collapsed = false }: { dashboard: DashboardData; collapsed?: boolean }) {
  const target = pickContinueTarget(dashboard);
  if (!target) return null;
  const label = `${target.label}: ${target.lesson.title}`;
  return (
    <Link to={`/lesson/${target.lesson.id}`} className="continue-card" aria-label={label} title={collapsed ? label : undefined}>
      <span className="continue-eyebrow">{target.reason === 'resume' ? 'Continue' : target.label}</span>
      <span className="continue-title">{target.lesson.title}</span>
      <span className="continue-cta"><IconPlay /><span>{target.reason === 'resume' ? 'Back to lesson' : 'Open lesson'}</span></span>
    </Link>
  );
}
