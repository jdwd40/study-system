import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import type { SearchResults } from '../../types';

type Group = 'Go to' | 'Courses' | 'Modules' | 'Lessons';
interface Item { key: string; to?: string; run?: () => void; title: string; sub: string; group: Group }
/** Fixed navigation entries (no extra actions beyond these). */
export interface PaletteCommand { key: string; title: string; to?: string; run?: () => void; icon?: ReactNode }

function flatten(r: SearchResults): Item[] {
  return [
    ...r.courses.map((c): Item => ({ key: `c-${c.id}`, to: `/course/${c.id}`, title: c.title, sub: 'course', group: 'Courses' })),
    ...r.modules.map((m): Item => ({ key: `m-${m.id}`, to: `/course/${m.courseId}`, title: m.title, sub: m.id, group: 'Modules' })),
    ...r.lessons.map((l): Item => ({ key: `l-${l.id}`, to: `/lesson/${l.id}`, title: l.title, sub: l.id, group: 'Lessons' })),
  ];
}

/**
 * Search palette over /search?q=. Same a11y contract as ConceptModal: labelled
 * dialog, Escape/backdrop close, Tab trap, initial focus on the input; the
 * opener (AppShell) restores focus. Arrow keys move an aria-activedescendant
 * selection so focus stays in the input; Enter opens the selection.
 */
export function CommandPalette({ onClose, commands }: { onClose: () => void; commands: PaletteCommand[] }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); } };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults(null); setSearching(false); return; }
    setSearching(true);
    let alive = true;
    const t = setTimeout(() => {
      api.get<SearchResults>(`/search?q=${encodeURIComponent(term)}`)
        .then((r) => { if (alive) { setResults(r); setActive(0); } })
        .catch(() => { if (alive) setResults({ courses: [], modules: [], lessons: [] }); })
        .finally(() => { if (alive) setSearching(false); });
    }, 200);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    const nav: Item[] = commands
      .filter((c) => !term || c.title.toLowerCase().includes(term))
      .map((c) => ({ key: `nav-${c.key}`, to: c.to, run: c.run, title: c.title, sub: '', group: 'Go to' }));
    return [...nav, ...(results ? flatten(results) : [])];
  }, [results, commands, q]);
  const clamped = items.length ? Math.min(active, items.length - 1) : -1;

  useEffect(() => {
    if (clamped < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${clamped}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [clamped]);

  const go = (it: Item) => { onCloseRef.current(); if (it.run) it.run(); else if (it.to) navigate(it.to); };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) setActive((i) => (i + 1) % items.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) setActive((i) => (i - 1 + items.length) % items.length); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[clamped];
      if (it) go(it);
      else if (q.trim()) go({ key: 'full', to: `/search?q=${encodeURIComponent(q.trim())}`, title: '', sub: '', group: 'Go to' });
    }
  };

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const groups = (['Go to', 'Courses', 'Modules', 'Lessons'] as const).map((g) => ({ g, rows: items.map((it, idx) => ({ it, idx })).filter(({ it }) => it.group === g) })).filter((x) => x.rows.length);
  const fullSearchTo = `/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`;

  return (
    <div className="modal-backdrop palette-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCloseRef.current(); }} onKeyDown={trapTab}>
      <div className="palette" role="dialog" aria-modal="true" aria-labelledby="palette-title" ref={dialogRef}>
        <h2 id="palette-title" className="sr-only">Search</h2>
        <div className="palette-head">
          <input
            ref={inputRef}
            className="palette-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search courses, modules, lessons…"
            aria-label="Search"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={clamped >= 0 ? `palette-opt-${clamped}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="icon-btn palette-close" onClick={() => onCloseRef.current()} aria-label="Close search"><span aria-hidden="true">×</span></button>
        </div>
        <div className="palette-list" id="palette-list" role="listbox" aria-label="Results" ref={listRef}>
          {q.trim() && !searching && results && items.length === 0 && <p className="palette-hint">No matches.</p>}
          {groups.map(({ g, rows }) => (
            <div key={g} className="palette-group" role="group" aria-label={g}>
              <p className="palette-group-title">{g}</p>
              {rows.map(({ it, idx }) => (
                <div
                  key={it.key}
                  id={`palette-opt-${idx}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={idx === clamped}
                  className={`palette-item${it.group === 'Go to' ? ' palette-item-cmd' : ''}${idx === clamped ? ' is-active' : ''}`}
                  onMouseMove={() => { if (idx !== clamped) setActive(idx); }}
                  onClick={() => go(it)}
                >
                  <span className="palette-item-title">{it.group === 'Go to' && commands.find((c) => `nav-${c.key}` === it.key)?.icon}{it.title}</span>
                  {it.sub && <span className="palette-item-sub">{it.sub}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span className="palette-hint-inline" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>↵</kbd> open · <kbd>Esc</kbd> close</span>
          <Link to={fullSearchTo} className="palette-full-link" onClick={() => onCloseRef.current()}>Open full search →</Link>
        </div>
      </div>
    </div>
  );
}
