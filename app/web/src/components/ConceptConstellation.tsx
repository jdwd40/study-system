import type { KeyConcept } from '../types';

/**
 * Decorative concept map for a lesson: the lesson at the centre, each key
 * concept on a ring around it, joined by spokes. Pure SVG generated from the
 * lesson's own key concepts — a visual anchor for the section, not a
 * replacement for the clickable concept list below it (aria-hidden).
 */
export function ConceptConstellation({ title, concepts }: { title: string; concepts: KeyConcept[] }) {
  const items = concepts.slice(0, 8);
  if (items.length < 2) return null;
  const W = 640; const H = 300; const cx = W / 2; const cy = H / 2;
  const rx = 150; const ry = 100;
  const trunc = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
  // Centre label: up to two short lines of the lesson title, else a neutral label.
  const words = title.split(/\s+/);
  const lines: string[] = [];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if (cur !== undefined && (cur + ' ' + w).length <= 13) lines[lines.length - 1] = cur + ' ' + w;
    else if (lines.length < 2 && w.length <= 13) lines.push(w);
    else { lines.length = 0; break; }
  }
  const centre = lines.length > 0 && lines.join(' ') === title ? lines : ['This', 'lesson'];
  const pts = items.map((k, i) => {
    const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2;
    return { k, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), a };
  });
  return (
    <figure className="constellation" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} focusable="false">
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="var(--course-accent, var(--accent))" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
        {pts.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--course-accent, var(--accent))" strokeWidth="1" opacity="0.35" />
        ))}
        <circle cx={cx} cy={cy} r="34" fill="var(--course-accent, var(--accent))" />
        <circle cx={cx} cy={cy} r="40" fill="none" stroke="var(--course-accent, var(--accent))" strokeWidth="1" opacity="0.4" />
        {centre.map((line, i) => (
          <text key={i} x={cx} y={cy + (centre.length === 1 ? 4 : i === 0 ? -2 : 11)} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--on-accent)">{line}</text>
        ))}
        {pts.map((p, i) => {
          const right = Math.cos(p.a) > 0.2; const left = Math.cos(p.a) < -0.2;
          const anchor = right ? 'start' : left ? 'end' : 'middle';
          const dx = right ? 10 : left ? -10 : 0;
          const dy = Math.sin(p.a) < -0.6 ? -10 : Math.sin(p.a) > 0.6 ? 18 : 4;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--surface)" stroke="var(--course-accent, var(--accent))" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="2" fill="var(--course-second, var(--star))" />
              <text x={p.x + dx} y={p.y + dy} textAnchor={anchor} fontSize="12" fontWeight="600" fill="var(--ink)">{trunc(p.k.term, 20)}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
