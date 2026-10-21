import { LEVELS, type JourneyView } from '../types';

/**
 * Level and XP at a glance. Everything shown is derived from records the
 * app already keeps (lessons explicitly ended, flashcard grades); there are
 * no streaks and nothing ever goes down.
 */
export function JourneyCard({ journey }: { journey: JourneyView }) {
  const { level } = journey;
  const toNext = level.next === null ? null : level.next - level.xp;
  return (
    <aside className="card journey-card" aria-label="Your journey">
      <div className="journey-card-head">
        <span className="journey-level-badge" aria-hidden="true">{level.number}</span>
        <div className="journey-card-text">
          <p className="continue-eyebrow">Level {level.number}</p>
          <p className="journey-level-title">{level.title}</p>
        </div>
        <p className="journey-xp"><strong>{journey.xp.toLocaleString()}</strong> XP</p>
      </div>
      <div className="journey-bar" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)}>
        <div className="journey-bar-fill" style={{ width: `${Math.max(2, level.progress * 100)}%` }} />
      </div>
      <p className="journey-next meta">
        {toNext === null ? 'Top level reached — keep exploring.' : <>{toNext.toLocaleString()} XP to {nextTitle(level.number)}</>}
      </p>
      <dl className="journey-stats">
        <div><dt>Lessons claimed</dt><dd>{journey.lessonsClaimed}</dd></div>
        <div><dt>Cards reviewed</dt><dd>{journey.cardReviews}</dd></div>
        <div><dt>Understanding</dt><dd>{journey.averageUnderstanding === null ? '—' : `${journey.averageUnderstanding.toFixed(1)}/5`}</dd></div>
      </dl>
      <p className="journey-foot meta">100 XP per lesson claimed · 5 XP per card reviewed </p>
    </aside>
  );
}

function nextTitle(current: number): string {
  // Titles live in shared/journey.ts; indexing via the exported list keeps them in one place.
  return NEXT_TITLES[current] ?? 'the next level';
}
const NEXT_TITLES: Record<number, string> = Object.fromEntries(LEVELS.map((l, i) => [i, l.title]));
