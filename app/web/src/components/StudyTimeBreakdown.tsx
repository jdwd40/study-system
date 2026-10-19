import { fmtMinutes } from '../lib/format';
import type { StudyTimeEntry } from '../types';
import { CompassMotif } from './CompassMotif';

/** Compact proportional breakdown of tracker-backed study time by course. */
export function StudyTimeBreakdown({ entries, totalMinutes }: { entries: StudyTimeEntry[]; totalMinutes: number }) {
  return (
    <div className="card studytime-card">
      <div className="studytime-head">
        <CompassMotif />
        <div>
          <p className="card-title">{fmtMinutes(totalMinutes)} tracked</p>
          <p className="card-sub">Recorded in the Habit Tracker and linked to courses — never counted here twice.</p>
        </div>
      </div>
      <div className="segbar" role="img" aria-label={`Study time by course: ${entries.map((s) => `${s.courseTitle ?? s.courseId} ${fmtMinutes(s.minutes)}`).join(', ')}`}>
        {entries.map((s, i) => (
          <span
            key={s.courseId}
            className={`segbar-seg seg-${i % 5}`}
            style={{ width: `${totalMinutes > 0 ? (s.minutes / totalMinutes) * 100 : 0}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <ul className="segbar-legend list-plain">
        {entries.map((s, i) => (
          <li key={s.courseId}>
            <span className={`segbar-dot seg-${i % 5}`} aria-hidden="true" />
            <span className="segbar-label">
              {s.courseTitle ?? s.courseId}
              {s.courseTitle === null && <span className="meta"> (id only — no matching course)</span>}
            </span>
            <span className="segbar-val">{fmtMinutes(s.minutes)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
