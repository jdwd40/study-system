import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseDetail } from '../types';

export interface LessonSection {
  id: string;
  label: string;
}

/** Scroll to a section honouring prefers-reduced-motion; the href stays for keyboard/AT. */
export function scrollToSection(id: string) {
  const el = document.getElementById(`sec-${id}`);
  if (!el) return;
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** "On this page": one link per section that exists; current one highlighted. */
export function OnThisPage({ sections, current, onPick }: { sections: LessonSection[]; current: string | null; onPick?: () => void }) {
  return (
    <nav className="lesson-toc" aria-label="On this page">
      <p className="lesson-nav-title">On this page</p>
      <ul className="list-plain">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#sec-${s.id}`}
              className={`lesson-toc-link${current === s.id ? ' is-current' : ''}`}
              aria-current={current === s.id ? 'location' : undefined}
              onClick={(e) => { e.preventDefault(); scrollToSection(s.id); onPick?.(); }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * "In this course": the module containing the current lesson starts expanded,
 * the others collapsed (toggle); every lesson is a plain link — free movement,
 * nothing gated.
 */
export function InThisCourse({ course, lessonId, moduleId, onPick }: { course: CourseDetail | null; lessonId: string; moduleId: string; onPick?: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ [moduleId]: true });
  if (!course) return null;
  return (
    <nav className="lesson-coursenav" aria-label="In this course">
      <p className="lesson-nav-title">In this course</p>
      <ul className="list-plain">
        {course.modules.map((m) => {
          const expanded = !!open[m.id];
          const panelId = `coursenav-${m.id}`;
          return (
            <li key={m.id} className="lesson-coursenav-module">
              <button
                type="button"
                className={`lesson-coursenav-toggle${m.id === moduleId ? ' is-here' : ''}`}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen((s) => ({ ...s, [m.id]: !s[m.id] }))}
              >
                <span className="accordion-chevron" aria-hidden="true">▸</span>
                <span className="lesson-coursenav-modtitle">{m.title}</span>
                <span className="lesson-coursenav-count">{m.lessons.length}</span>
              </button>
              {expanded && (
                <ul className="list-plain lesson-coursenav-lessons" id={panelId}>
                  {m.lessons.length === 0 && <li className="lesson-coursenav-empty">Planned — no lessons yet</li>}
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        to={`/lesson/${l.id}`}
                        className={`lesson-coursenav-link${l.id === lessonId ? ' is-current' : ''}${l.state.status === 'complete' ? ' is-complete' : ''}`}
                        aria-current={l.id === lessonId ? 'page' : undefined}
                        onClick={onPick}
                      >
                        <span className="lesson-coursenav-order">{l.order}</span>
                        <span className="lesson-coursenav-title">{l.title}</span>
                        {l.state.status === 'complete' && <span className="lesson-coursenav-done" aria-label="complete">✓</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Below 1100px the rail is hidden; this compact "Contents" button opens a
 * small disclosure popover with the same two lists. Not a modal: Escape,
 * outside click or picking a link closes it.
 */
export function ContentsPopover(props: { sections: LessonSection[]; current: string | null; course: CourseDetail | null; lessonId: string; moduleId: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const close = () => setOpen(false);
  return (
    <div className="lesson-contents" ref={wrapRef}>
      <button
        type="button"
        className="btn btn-ghost lesson-contents-btn"
        aria-expanded={open}
        aria-controls="lesson-contents-pop"
        onClick={() => setOpen((o) => !o)}
        ref={btnRef}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
        Contents
      </button>
      {open && (
        <div className="lesson-contents-pop" id="lesson-contents-pop">
          <OnThisPage sections={props.sections} current={props.current} onPick={close} />
          <InThisCourse course={props.course} lessonId={props.lessonId} moduleId={props.moduleId} onPick={close} />
        </div>
      )}
    </div>
  );
}
