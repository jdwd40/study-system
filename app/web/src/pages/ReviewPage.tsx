import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Err } from '../components/Err';
import { RichMarkdown } from '../components/RichMarkdown';
import { Spinner } from '../components/Spinner';
import { useData } from '../hooks/useData';
import type { FlashcardCard, FlashcardsResponse, Grade } from '../types';

/**
 * Flashcard review.
 *
 * Two modes, both client-only state over the unchanged GET /flashcards payload:
 *  - short session (`?session=N`, 1..50): the first N cards of the filtered
 *    queue are frozen when the session starts; grading advances to the next
 *    ungraded card and a summary appears once every card has a grade.
 *  - full queue (no param): the live filtered queue minus cards graded this
 *    visit; the summary appears when it runs out.
 * Previous/Next are always available in both modes. Each grade press posts
 * exactly one review; SM-2 and stored ratings are untouched.
 */

const GRADES: { g: Grade; label: string; key: string }[] = [
  { g: 'again', label: 'Again', key: '1' },
  { g: 'hard', label: 'Hard', key: '2' },
  { g: 'good', label: 'Good', key: '3' },
  { g: 'easy', label: 'Easy', key: '4' },
];
const DEFAULT_SESSION = 10;
const MAX_SESSION = 50;

export function parseSessionParam(raw: string | null): number | null {
  if (raw === null || raw === '') return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > MAX_SESSION) return null;
  return n;
}

/** True when a keyboard event originates in a text-entry or choice control. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'OPTION';
}

type GradeCounts = Record<Grade, number>;
const zeroCounts = (): GradeCounts => ({ again: 0, hard: 0, good: 0, easy: 0 });

export function ReviewPage() {
  const { data, error, loading, reload } = useData<FlashcardsResponse>('/flashcards');
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionSize = parseSessionParam(searchParams.get('session'));

  const [dueOnly, setDueOnly] = useState(true);
  const [lessonFilter, setLessonFilter] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [postError, setPostError] = useState<unknown>(null);
  const [browseOpen, setBrowseOpen] = useState(false);

  /** Frozen card ids for the current short session (null in full-queue mode or before the first pick). */
  const [sessionIds, setSessionIds] = useState<string[] | null>(null);
  /** Latest grade given to each card this visit (drives completion + per-card note). */
  const [graded, setGraded] = useState<Record<string, Grade>>({});
  /** Counts per grade press this session (what the summary reports). */
  const [counts, setCounts] = useState<GradeCounts>(zeroCounts);
  const [done, setDone] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const allCards = useMemo(() => data?.cards ?? [], [data]);
  const byId = useMemo(() => new Map(allCards.map((c) => [c.cardId, c])), [allCards]);
  const dueTotal = useMemo(() => allCards.filter((c) => c.dueDate <= today).length, [allCards, today]);

  /** Live filtered queue in API order. */
  const pool = useMemo(() => {
    let cards: FlashcardCard[] = allCards;
    if (dueOnly) cards = cards.filter((c) => c.dueDate <= today);
    if (lessonFilter) cards = cards.filter((c) => c.lessonId === lessonFilter);
    return cards;
  }, [allCards, dueOnly, lessonFilter, today]);

  /** Lesson filter options: readable titles, de-duplicated by lesson, sorted. */
  const lessons = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of allCards) if (!seen.has(c.lessonId)) seen.set(c.lessonId, c.lessonTitle);
    return Array.from(seen, ([id, title]) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title));
  }, [allCards]);

  // Freeze a short session from the pool whenever one is requested and none is frozen yet.
  useEffect(() => {
    if (sessionSize === null) { if (sessionIds !== null) setSessionIds(null); return; }
    if (sessionIds !== null || allCards.length === 0) return;
    setSessionIds(pool.filter((c) => !graded[c.cardId]).slice(0, sessionSize).map((c) => c.cardId));
    setIdx(0); setFlipped(false); setDone(false);
  }, [sessionSize, sessionIds, pool, allCards.length, graded]);

  const list: FlashcardCard[] = useMemo(() => {
    if (sessionSize !== null) return (sessionIds ?? []).map((id) => byId.get(id)).filter((c): c is FlashcardCard => !!c);
    return pool.filter((c) => !graded[c.cardId]);
  }, [sessionSize, sessionIds, byId, pool, graded]);

  const gradedCount = Object.keys(graded).length;
  const total = sessionSize !== null ? list.length : list.length + gradedCount;
  const safeIdx = Math.min(idx, Math.max(list.length - 1, 0));
  const card = list[safeIdx];
  const progress = total === 0 ? 0 : Math.min(1, gradedCount / total);
  const remainingDue = Math.max(0, dueTotal - Object.keys(graded).filter((id) => (byId.get(id)?.dueDate ?? '') <= today).length);

  const resetPosition = () => { setIdx(0); setFlipped(false); setDone(false); setSessionIds(null); };

  const setSession = (n: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (n === null) next.delete('session'); else next.set('session', String(n));
    setSearchParams(next, { replace: true });
    resetPosition();
  };

  const startAnother = () => {
    setGraded({}); setCounts(zeroCounts());
    // Cards graded this visit are excluded from the next pick via `graded`; clear it only
    // after the pick, so reseed from the current pool minus what was just reviewed.
    const picked = pool.filter((c) => !graded[c.cardId]).slice(0, sessionSize ?? DEFAULT_SESSION).map((c) => c.cardId);
    if (sessionSize === null) setSession(DEFAULT_SESSION);
    setSessionIds(picked); setIdx(0); setFlipped(false); setDone(false);
  };

  const go = useCallback((delta: number) => {
    setIdx((i) => Math.min(Math.max(i + delta, 0), Math.max(list.length - 1, 0)));
    setFlipped(false);
  }, [list.length]);

  const grade = useCallback(async (g: Grade) => {
    if (!card || busy) return;
    setBusy(true); setPostError(null);
    try {
      await api.post('/flashcards/review', { cardId: card.cardId, lessonId: card.lessonId, grade: g });
    } catch (e) {
      setPostError(e); setBusy(false); return;
    }
    const nextGraded = { ...graded, [card.cardId]: g };
    setGraded(nextGraded);
    setCounts((c) => ({ ...c, [g]: c[g] + 1 }));
    setFlipped(false);
    if (sessionSize !== null) {
      // Advance to the next ungraded card (forward first, then from the top); none left → summary.
      const order = [...list.slice(safeIdx + 1), ...list.slice(0, safeIdx)];
      const next = order.find((c) => !nextGraded[c.cardId]);
      if (!next) setDone(true); else setIdx(list.findIndex((c) => c.cardId === next.cardId));
    } else {
      // The graded card leaves the list, so the same index now points at the next card.
      if (list.length - 1 === 0) setDone(true); else setIdx(Math.min(safeIdx, list.length - 2));
    }
    setBusy(false);
    reload();
  }, [card, busy, graded, sessionSize, list, safeIdx, reload]);

  // Keyboard: Space/Enter reveal, 1–4 grade (when revealed), ←/→ browse. Never while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[role="dialog"]')) return;
      const onButton = e.target instanceof HTMLElement && !!e.target.closest('button, a, summary');
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); return; }
      if (!card || done) return;
      if ((e.key === ' ' || e.key === 'Enter') && !flipped) {
        if (onButton) return; // let the focused control act on its own
        e.preventDefault(); setFlipped(true); return;
      }
      if (flipped) {
        const hit = GRADES.find((x) => x.key === e.key);
        if (hit) { e.preventDefault(); void grade(hit.g); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, done, flipped, go, grade]);

  if (loading && !data) return <Spinner />;
  if (error) return <Err error={error} />;

  const modeLabel = sessionSize !== null ? `Short session · ${total} card${total === 1 ? '' : 's'}` : 'Full queue';
  const reviewedTotal = counts.again + counts.hard + counts.good + counts.easy;
  const showSummary = done && reviewedTotal > 0;
  const currentGrade = card ? graded[card.cardId] : undefined;

  return (
    <main className="page page-narrow review">
      <h1>Revision &amp; Flashcards</h1>
      <p className="page-sub">Due suggestions first — browse anything, in any order.</p>

      <header className="review-head card" aria-label="Session">
        <div className="review-head-row">
          <div className="review-mode">
            <p className="continue-eyebrow">{modeLabel}</p>
            <p className="review-stats">
              {total > 0 && !showSummary && <span className="review-pos">{safeIdx + 1} of {total}</span>}
              <span className="review-due">{dueTotal} due today</span>
            </p>
          </div>
          {sessionSize !== null ? (
            <button type="button" className="btn btn-ghost review-toggle" onClick={() => setSession(null)}>Switch to full queue</button>
          ) : (
            <button type="button" className="btn btn-ghost review-toggle" onClick={() => setSession(DEFAULT_SESSION)}>Make it a short session of {DEFAULT_SESSION}</button>
          )}
        </div>
        <div className="review-progress" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <div className="review-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </header>

      <div className="filter-row review-filters">
        <select className="input" value={lessonFilter} onChange={(e) => { setLessonFilter(e.target.value); resetPosition(); }} aria-label="Filter by lesson">
          <option value="">All lessons</option>
          {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <button type="button" className={`btn ${dueOnly ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={dueOnly} onClick={() => { setDueOnly(!dueOnly); resetPosition(); }}>{dueOnly ? 'Showing due only' : 'Showing all'}</button>
      </div>

      {showSummary ? (
        <section className="card review-summary" aria-labelledby="review-summary-title">
          <p className="continue-eyebrow">{sessionSize !== null ? 'Session complete' : 'Queue finished'}</p>
          <h2 id="review-summary-title">You reviewed {reviewedTotal} card{reviewedTotal === 1 ? '' : 's'}</h2>
          <ul className="review-summary-grades list-plain">
            {GRADES.map((x) => (
              <li key={x.g} className={`review-summary-grade grade-${x.g}`}>
                <span className="review-summary-n">{counts[x.g]}</span>
                <span className="review-summary-l">{x.label}</span>
              </li>
            ))}
          </ul>
          <p className="meta">{remainingDue > 0 ? `${remainingDue} still due today — whenever suits.` : 'Nothing else due today.'}</p>
          <div className="btn-row">
            {remainingDue > 0 && <button type="button" className="btn btn-primary" onClick={startAnother}>Review {Math.min(sessionSize ?? DEFAULT_SESSION, remainingDue)} more</button>}
            <Link to="/" className="btn btn-ghost">Back to Today</Link>
            {sessionSize !== null && <button type="button" className="btn btn-ghost" onClick={() => setSession(null)}>Open full queue</button>}
          </div>
        </section>
      ) : !card ? (
        <div className="empty">
          No cards here. {dueOnly ? 'Nothing due — good state to be in.' : 'Try another lesson filter.'}
          {dueOnly && allCards.length > 0 && <p className="review-empty-sub"><button type="button" className="btn btn-ghost" onClick={() => { setDueOnly(false); resetPosition(); }}>Browse all cards anyway</button></p>}
        </div>
      ) : (
        <article className="card review-card" aria-label="Flashcard">
          <p className="meta review-card-meta">
            <span className="review-card-lesson">{card.lessonTitle}</span>
            {card.isNew && <span className="pill review-new">new</span>}
            {currentGrade && <span className="review-graded-note">graded {currentGrade} this session</span>}
          </p>
          <div className="review-q"><RichMarkdown text={card.q} /></div>
          {flipped && (
            <div className="review-a">
              <RichMarkdown text={card.a} />
            </div>
          )}
          {!flipped ? (
            <button type="button" className="btn btn-primary review-reveal" onClick={() => setFlipped(true)}>Reveal <kbd>Space</kbd></button>
          ) : (
            <div className="grade-row" role="group" aria-label="Grade this card">
              {GRADES.map((x) => (
                <button key={x.g} type="button" className={`grade-btn grade-${x.g}`} disabled={busy} onClick={() => grade(x.g)}>
                  <span className="grade-label">{x.label}</span>
                  <kbd aria-hidden="true">{x.key}</kbd>
                </button>
              ))}
            </div>
          )}
          {postError ? <div className="review-post-error"><Err error={postError} /></div> : null}
          <div className="review-nav">
            <div className="btn-row">
              <button type="button" className="btn btn-ghost" disabled={safeIdx === 0} onClick={() => go(-1)}>← Previous</button>
              <button type="button" className="btn btn-ghost" disabled={safeIdx >= list.length - 1} onClick={() => go(1)}>Next →</button>
            </div>
            <p className="review-keys" aria-label="Keyboard shortcuts">
              <kbd>Space</kbd> reveal · <kbd>1</kbd>–<kbd>4</kbd> grade · <kbd>←</kbd> <kbd>→</kbd> browse
            </p>
          </div>
          <details className="review-help">
            <summary>What do the ratings mean?</summary>
            <ul>
              <li><strong>Again</strong> — I didn't know it; show it again soon.</li>
              <li><strong>Hard</strong> — I got there, but slowly or shakily.</li>
              <li><strong>Good</strong> — I recalled it with normal effort.</li>
              <li><strong>Easy</strong> — instant recall; wait longer before the next look.</li>
            </ul>
            <p>Scheduling is SM-2-style: intervals grow with Good and Easy, and reset with Again.</p>
            <p>These card grades are separate from the 1–5 self-rating you give a lesson when you end it — that one records your own sense of understanding the lesson as a whole.</p>
          </details>
        </article>
      )}

      {list.length > 1 && !showSummary && (
        <div className="review-browse">
          <button type="button" className="btn btn-ghost review-browse-toggle" aria-expanded={browseOpen} aria-controls="review-browse-list" onClick={() => setBrowseOpen((o) => !o)}>
            {browseOpen ? 'Hide card list' : `Browse all ${list.length} cards`}
          </button>
          {browseOpen && (
            <ol id="review-browse-list" className="review-browse-list list-plain">
              {list.map((c, i) => (
                <li key={c.cardId}>
                  <button type="button" className={`review-browse-item${i === safeIdx ? ' is-current' : ''}${graded[c.cardId] ? ' is-graded' : ''}`} aria-current={i === safeIdx ? 'true' : undefined} onClick={() => { setIdx(i); setFlipped(false); setBrowseOpen(false); }}>
                    <span className="review-browse-n">{i + 1}</span>
                    <span className="review-browse-q">{c.q}</span>
                    {graded[c.cardId] && <span className="review-browse-g">{graded[c.cardId]}</span>}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </main>
  );
}
