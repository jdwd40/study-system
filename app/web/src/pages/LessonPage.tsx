import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { ConceptConstellation } from '../components/ConceptConstellation';
import { ConceptModal } from '../components/ConceptModal';
import { CourseScene } from '../components/CourseScene';
import { CourseMark } from '../components/CourseMark';
import { Err } from '../components/Err';
import { ContentsPopover, InThisCourse, OnThisPage, scrollToSection, type LessonSection } from '../components/LessonNav';
import { Pill } from '../components/Pill';
import { RichMarkdown } from '../components/RichMarkdown';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { useData } from '../hooks/useData';
import { TEXT_SIZES, useTextSize, type TextSize } from '../hooks/useTextSize';
import { courseIdentity } from '../lib/courseIdentity';
import { md } from '../lib/markdown';
import type { CourseDetail, EndLessonResponse, JourneyView, KeyConcept, LessonDetail, LessonDoc } from '../types';
import { XP_PER_LESSON } from '../types';

const TEXT_SIZE_LABEL: Record<TextSize, string> = { small: 'Small', medium: 'Medium', large: 'Large' };
const lastSectionKey = (lessonId: string) => `study.lastSection.${lessonId}`;

/** Remount per lesson so reader state (flips, forms, nav) never leaks between lessons. */
export function LessonPage() {
  const { lessonId } = useParams();
  return <LessonReader key={lessonId} lessonId={lessonId!} />;
}

function LessonReader({ lessonId }: { lessonId: string }) {
  const { data, error, loading, reload } = useData<LessonDetail>(`/lessons/${lessonId}`);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [finishedReading, setFinishedReading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);
  const [openConcept, setOpenConcept] = useState<KeyConcept | null>(null);
  /** Set after a successful End: the rating given and the course's next lesson (fetched only then). */
  const [ended, setEnded] = useState<{ rating: number; next: LessonDoc | null | 'loading'; journey: JourneyView | null } | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [resumeSection, setResumeSection] = useState<string | null>(null);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const { textSize, setTextSize } = useTextSize();
  /**
   * Opener element captured at click time. Focus is restored post-commit via
   * the effect below — deliberately not requestAnimationFrame, which may never
   * fire in occluded/backgrounded tabs, silently dropping focus restoration.
   */
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const endDialogRef = useRef<HTMLDivElement>(null);
  const endOpenerRef = useRef<HTMLElement | null>(null);

  // End-lesson dialog: focus moves to the rating row, Escape cancels, focus returns to the opener.
  useEffect(() => {
    if (!ending) return;
    endOpenerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    endDialogRef.current?.querySelector<HTMLElement>('.rating-btn.selected, .rating-btn')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); setEnding(false); } };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const opener = endOpenerRef.current;
      endOpenerRef.current = null;
      if (opener && opener.isConnected) opener.focus();
    };
  }, [ending]);

  useEffect(() => {
    if (openConcept) return;
    const opener = returnFocusRef.current;
    returnFocusRef.current = null;
    if (opener && opener.isConnected) opener.focus();
  }, [openConcept]);

  // Arriving from the course navigation while scrolled down: start the new lesson at its top.
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const courseId = data?.lesson.courseId;
  useEffect(() => {
    if (!courseId) return;
    let alive = true;
    api.get<CourseDetail>(`/courses/${courseId}`).then((c) => { if (alive) setCourse(c); }).catch(() => { /* breadcrumb falls back to the id */ });
    return () => { alive = false; };
  }, [courseId]);

  const lessonLoaded = data?.lesson.id;
  const isComplete = data?.state.status === 'complete';
  // Last-section memory (localStorage only, never auto-scroll): read once before the observer starts writing.
  useEffect(() => {
    if (!lessonLoaded || isComplete) return;
    try {
      const v = localStorage.getItem(lastSectionKey(lessonId));
      if (v && v !== 'objective' && document.getElementById(`sec-${v}`)) setResumeSection(v);
    } catch { /* storage unavailable */ }
  }, [lessonLoaded, isComplete, lessonId]);

  // Current section for "On this page": the first section (document order) crossing the top 30% of the viewport.
  useEffect(() => {
    if (!lessonLoaded || typeof IntersectionObserver === 'undefined') return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-lesson-section]'));
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) visible.set(en.target.id, en.isIntersecting);
      const first = els.find((el) => visible.get(el.id));
      if (first) setCurrent(first.id.replace(/^sec-/, ''));
    }, { rootMargin: '0px 0px -70% 0px' });
    els.forEach((el) => io.observe(el));
    // At the very end of the page the last (short) section may never reach the band: mark it current.
    const onScroll = () => {
      const last = els[els.length - 1];
      if (last && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) setCurrent(last.id.replace(/^sec-/, ''));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [lessonLoaded]);

  useEffect(() => {
    if (!current) return;
    try { localStorage.setItem(lastSectionKey(lessonId), current); } catch { /* ignore */ }
  }, [current, lessonId]);

  if (loading && !data) return <Spinner />;
  if (error) return <Err error={error} />;
  const { lesson, state, activeAttempt, qa } = data!;

  const closeConcept = () => setOpenConcept(null);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true); setActionError(null);
    try {
      await fn();
      // Tell the shell (sidebar Continue card) that lesson progress changed.
      window.dispatchEvent(new Event('study:progress'));
      reload();
    } catch (e) { setActionError(e); } finally { setBusy(false); }
  };

  /** Keep Tab inside the End-lesson dialog (same light trap as ConceptModal). */
  const trapEndTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !endDialogRef.current) return;
    const focusables = endDialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const endLesson = () => act(async () => {
    if (userRating === null) return;
    const res = await api.post<EndLessonResponse>(`/lessons/${lesson.id}/end`, { userRating });
    setEnding(false);
    setFinishedReading(false);
    setResumeSection(null);
    try { localStorage.removeItem(lastSectionKey(lesson.id)); } catch { /* ignore */ }
    const journey = res?.journey ?? null;
    setEnded({ rating: userRating, next: 'loading', journey });
    // Refresh the course outline so the waypoint strip and rail show the claim.
    api.get<CourseDetail>(`/courses/${lesson.courseId}`).then(setCourse).catch(() => { /* keep the old outline */ });
    api.get<{ lesson: LessonDoc | null }>(`/next-lesson?course=${encodeURIComponent(lesson.courseId)}`)
      .then((r) => setEnded({ rating: userRating, next: r.lesson, journey }))
      .catch(() => setEnded({ rating: userRating, next: null, journey }));
  });

  const logQuestion = () => act(async () => {
    const question = qaQuestion.trim();
    if (!question) return;
    const body: { question: string; userAnswer?: string } = { question };
    if (qaAnswer.trim()) body.userAnswer = qaAnswer.trim();
    await api.post(`/lessons/${lesson.id}/qa`, body);
    setQaQuestion(''); setQaAnswer(''); setQaOpen(false);
  });

  const ident = courseIdentity(lesson.courseId, course?.title ?? lesson.courseId);
  const moduleView = course?.modules.find((m) => m.id === lesson.moduleId) ?? null;
  const waypoint = moduleView ? { index: moduleView.lessons.findIndex((l) => l.id === lesson.id) + 1, total: moduleView.lessons.length } : null;
  const sections: LessonSection[] = [
    { id: 'objective', label: 'Objective' },
    { id: 'content', label: 'Content' },
    ...(lesson.keyConcepts.length ? [{ id: 'concepts', label: 'Key concepts' }] : []),
    ...(lesson.examples.length ? [{ id: 'examples', label: 'Examples' }] : []),
    ...(lesson.takeaways.length ? [{ id: 'takeaways', label: 'Takeaways' }] : []),
    ...(lesson.flashcards.length ? [{ id: 'flashcards', label: 'Flashcards' }] : []),
    ...(lesson.revisionQuestions.length ? [{ id: 'revision', label: 'Revision questions' }] : []),
    ...(lesson.sources.length ? [{ id: 'sources', label: 'Sources' }] : []),
    { id: 'qa', label: 'Q&A' },
  ];
  const resumeLabel = sections.find((s) => s.id === resumeSection)?.label;

  /** The single lifecycle action. Explicit Start; the "finished reading" gate; End with a required rating; Retake when complete. */
  const lifecycle = (
    <>
      {!activeAttempt && <button className="btn btn-primary" disabled={busy} onClick={() => act(() => api.post(`/lessons/${lesson.id}/start`))}>{state.status === 'complete' ? 'Retake lesson' : 'Start lesson'}</button>}
      {activeAttempt && !finishedReading && <button className="btn btn-primary" disabled={busy} onClick={() => setFinishedReading(true)}>I've finished reading</button>}
      {activeAttempt && finishedReading && <button className="btn btn-primary" disabled={busy} onClick={() => setEnding(true)}>End lesson</button>}
    </>
  );

  return (
    <main className="page lesson reading">
      <div className="lesson-layout">
        <div className="lesson-main">
          <header className="lesson-head course-ident" style={ident.style}>
            <div className="lesson-banner" aria-hidden="true"><CourseScene scene={ident.scene} /></div>
            <p className="lesson-crumb">
              <CourseMark glyph={ident.glyph} monogram={ident.monogram} size="sm" />
              <Link to={`/course/${lesson.courseId}`} className="lesson-crumb-course">{course?.title ?? lesson.courseId}</Link>
              <span className="lesson-crumb-sep" aria-hidden="true">›</span>
              <span className="lesson-crumb-module">{moduleView?.title ?? lesson.moduleId}</span>
            </p>
            <h1>{lesson.title}</h1>
            <p className="lesson-status"><Pill status={state.status} /> <Stars value={state.userRating} /> {state.hermesRating !== null && <span className="meta">Hermes estimate: {state.hermesRating}/5</span>}</p>
            {moduleView && waypoint && waypoint.index > 0 && (
              <p className="lesson-waypoint">
                <span className="lesson-waypoint-label">Waypoint {waypoint.index} of {waypoint.total}</span>
                <span className="lesson-waypoint-dots" aria-hidden="true">
                  {moduleView.lessons.map((l) => (
                    <span key={l.id} className={`trail-dot${l.state.status === 'complete' ? ' is-claimed' : l.id === lesson.id ? ' is-next' : l.state.status === 'unfinished' ? ' is-unfinished' : ''}`} />
                  ))}
                </span>
                <span className="meta">in {moduleView.title}</span>
              </p>
            )}
            <div className="lesson-glance">
              {lesson.estimatedMinutes != null && <span>~{lesson.estimatedMinutes} min read</span>}
              <span>{lesson.keyConcepts.length} key concept{lesson.keyConcepts.length === 1 ? '' : 's'}</span>
              <span>{lesson.flashcards.length} flashcard{lesson.flashcards.length === 1 ? '' : 's'}</span>
              <span>{lesson.revisionQuestions.length} revision question{lesson.revisionQuestions.length === 1 ? '' : 's'}</span>
            </div>
            <div className="lesson-tools">
              <div className="btn-row lesson-tools-action">{lifecycle}</div>
              <div className="lesson-tools-right">
                <div className="textsize" role="group" aria-label="Text size">
                  <span className="textsize-label" aria-hidden="true">Aa</span>
                  {TEXT_SIZES.map((s) => (
                    <button key={s} type="button" className={`textsize-btn textsize-${s}`} aria-pressed={textSize === s} onClick={() => setTextSize(s)}>
                      <span aria-hidden="true">A</span><span className="sr-only">{TEXT_SIZE_LABEL[s]}</span>
                    </button>
                  ))}
                </div>
                <ContentsPopover sections={sections} current={current} course={course} lessonId={lesson.id} moduleId={lesson.moduleId} />
              </div>
            </div>
            {actionError != null && <Err error={actionError} />}
            {resumeSection && resumeLabel && (
              <p className="lesson-resume">
                <a href={`#sec-${resumeSection}`} onClick={(e) => { e.preventDefault(); scrollToSection(resumeSection); setResumeSection(null); }}>Jump to where you were: {resumeLabel}</a>
                <button type="button" className="lesson-resume-dismiss" aria-label="Dismiss" onClick={() => setResumeSection(null)}>×</button>
              </p>
            )}
          </header>

          <div className={`lesson-body text-${textSize}`}>
            <section id="sec-objective" data-lesson-section className="lesson-section">
              <div className="callout"><strong>Objective.</strong> {lesson.objective}</div>
            </section>
            <section id="sec-content" data-lesson-section className="lesson-section">
              <div className="prose" dangerouslySetInnerHTML={{ __html: md(lesson.content) }} />
            </section>
            {lesson.keyConcepts.length > 0 && (
              <section id="sec-concepts" data-lesson-section className="lesson-section">
                <h2>Key concepts</h2>
                <ConceptConstellation title={lesson.title} concepts={lesson.keyConcepts} />
                <p className="meta">Tap any concept for a quick, plain-language explainer.</p>
                <ul className="concept-grid">
                  {lesson.keyConcepts.map((k) => (
                    <li key={k.term}>
                      <button
                        type="button"
                        className={`concept-btn${k.explanation ? '' : ' concept-btn-plain'}`}
                        aria-haspopup="dialog"
                        onClick={(e) => { returnFocusRef.current = e.currentTarget; setOpenConcept(k); }}
                      >
                        <span className="concept-term">{k.term}</span>
                        <span className="concept-hint">{k.explanation ? 'Quick explainer →' : 'No explainer yet'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {lesson.examples.length > 0 && (
              <section id="sec-examples" data-lesson-section className="lesson-section">
                <h2>Examples</h2>
                <ul className="prose-list">{lesson.examples.map((e) => <li key={e}><RichMarkdown text={e} /></li>)}</ul>
              </section>
            )}
            {lesson.takeaways.length > 0 && (
              <section id="sec-takeaways" data-lesson-section className="lesson-section">
                <h2>Takeaways</h2>
                <ul className="prose-list">{lesson.takeaways.map((t) => <li key={t}><RichMarkdown text={t} /></li>)}</ul>
              </section>
            )}
            {lesson.flashcards.length > 0 && (
              <section id="sec-flashcards" data-lesson-section className="lesson-section">
                <h2>Flashcards</h2>
                {lesson.flashcards.map((f, i) => (
                  <div className="flashcard" key={i}>
                    <div className="flashcard-q"><RichMarkdown text={f.q} /></div>
                    {flipped[i] ? <div className="flashcard-a"><RichMarkdown text={f.a} /></div> : null}
                    <button className="btn btn-ghost flashcard-btn" aria-expanded={!!flipped[i]} onClick={() => setFlipped((s) => ({ ...s, [i]: !s[i] }))}>
                      {flipped[i] ? 'Hide answer' : 'Reveal answer'}
                    </button>
                  </div>
                ))}
              </section>
            )}
            {lesson.revisionQuestions.length > 0 && (
              <section id="sec-revision" data-lesson-section className="lesson-section">
                <h2>Revision questions</h2>
                <ol className="prose-list">{lesson.revisionQuestions.map((q) => <li key={q}><RichMarkdown text={q} /></li>)}</ol>
              </section>
            )}
            {lesson.sources.length > 0 && (
              <section id="sec-sources" data-lesson-section className="lesson-section">
                <h2>Sources and further reading</h2>
                <ul className="source-list">{lesson.sources.map((s) => <li key={s}><RichMarkdown text={s} /></li>)}</ul>
              </section>
            )}

            {ended ? (
              <section className="lesson-finish lesson-finish-done" aria-live="polite">
                <p className="continue-eyebrow">Waypoint claimed</p>
                <h2>Lesson ended</h2>
                <div className="lesson-claim">
                  <span className="lesson-claim-xp">+{XP_PER_LESSON} XP</span>
                  {ended.journey && (
                    <span className="lesson-claim-level">
                      Level {ended.journey.level.number} · {ended.journey.level.title} · {ended.journey.xp.toLocaleString()} XP
                      {ended.journey.level.next !== null && <span className="meta"> · {(ended.journey.level.next - ended.journey.xp).toLocaleString()} to next</span>}
                    </span>
                  )}
                </div>
                {course && course.progress.plannedLessons > 0 && (
                  <p className="lesson-claim-course">
                    <span className="meta">{course.title}: {course.progress.completedLessons} of {course.progress.plannedLessons} available lessons studied</span>
                    <span className="trail-bar"><span className="trail-bar-fill" style={{ width: `${course.progress.percent}%` }} /></span>
                  </p>
                )}
                <p>You rated your understanding <strong>{ended.rating}/5</strong> <Stars value={ended.rating} />. It's recorded on this lesson; you can retake it any time.</p>
                {ended.next === 'loading' && <p className="meta">Looking up the next lesson…</p>}
                {ended.next && ended.next !== 'loading' && (
                  <p><Link to={`/lesson/${ended.next.id}`} className="btn btn-primary lesson-next-link">Next lesson: {ended.next.title} →</Link></p>
                )}
                {ended.next === null && (
                  <p>This course has no further lessons available right now. <Link to={`/course/${lesson.courseId}`}>Back to the course page</Link>.</p>
                )}
              </section>
            ) : (
              <section className="lesson-finish">
                <h2>Finish</h2>
                {activeAttempt && finishedReading ? (
                  <p>Content complete. To finish, press <strong>End lesson</strong> and rate your understanding. The lesson never completes by itself.</p>
                ) : (
                  <p>Nothing completes automatically — {activeAttempt ? 'say when you have finished reading, then end the lesson and rate your understanding.' : state.status === 'complete' ? 'this lesson is complete; retake it whenever you like.' : 'start the lesson when you are ready, and end it yourself when you are done.'}</p>
                )}
                <div className="btn-row">{lifecycle}</div>
              </section>
            )}

            <section id="sec-qa" data-lesson-section className="lesson-section lesson-qa">
              <h2>Q&amp;A from your attempts</h2>
              {qa.length > 0 ? (
                <ul className="list-plain card">
                  {qa.map((q) => (
                    <li key={q.id}><strong>{q.question}</strong>
                      {q.userAnswer && <div className="meta">You: {q.userAnswer}</div>}
                      {q.hermesFeedback && <div className="meta">Hermes: {q.hermesFeedback}</div>}
                      {q.result && <Pill status={q.result === 'correct' ? 'complete' : q.result === 'incorrect' ? 'unfinished' : 'queued'} />}</li>
                  ))}
                </ul>
              ) : (
                <p className="meta">No questions logged for this lesson yet.</p>
              )}
              <div className="lesson-qa-log">
                <button type="button" className="btn btn-ghost" aria-expanded={qaOpen} aria-controls="lesson-qa-form" onClick={() => setQaOpen((o) => !o)}>
                  {qaOpen ? 'Close' : 'Log a question'}
                </button>
                {qaOpen && (
                  <form id="lesson-qa-form" className="lesson-qa-form" onSubmit={(e) => { e.preventDefault(); logQuestion(); }}>
                    <p className="meta">A note for later discussion — not a quiz, and nothing is graded here.</p>
                    <label className="field">
                      <span className="field-label">Question <span className="meta">(required)</span></span>
                      <textarea className="input" required value={qaQuestion} onChange={(e) => setQaQuestion(e.target.value)} placeholder="What do you want to come back to?" />
                    </label>
                    <label className="field">
                      <span className="field-label">Your answer so far <span className="meta">(optional)</span></span>
                      <textarea className="input" value={qaAnswer} onChange={(e) => setQaAnswer(e.target.value)} />
                    </label>
                    <div className="btn-row">
                      <button type="submit" className="btn btn-primary" disabled={busy || !qaQuestion.trim()}>Save note</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setQaOpen(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>

        <aside className="lesson-rail">
          <div className="lesson-rail-inner">
            <OnThisPage sections={sections} current={current} />
            <InThisCourse course={course} lessonId={lesson.id} moduleId={lesson.moduleId} />
          </div>
        </aside>
      </div>

      {openConcept && <ConceptModal concept={openConcept} lessonTitle={lesson.title} onClose={closeConcept} />}
      {ending && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="end-lesson-title" onKeyDown={trapEndTab} onClick={(e) => { if (e.target === e.currentTarget) setEnding(false); }}>
          <div className="modal" ref={endDialogRef}>
            <h2 id="end-lesson-title" style={{ marginTop: 0 }}>End lesson</h2>
            <p className="card-sub">How well do you understand this? (required)</p>
            {/* Toggle buttons with aria-pressed, so the container is a plain group (a radiogroup would expect radio children). */}
            <div className="rating-row" role="group" aria-label="Your understanding rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className={`rating-btn ${userRating === n ? 'selected' : ''}`} onClick={() => setUserRating(n)} aria-pressed={userRating === n}>{n}</button>
              ))}
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" disabled={busy || userRating === null} onClick={endLesson}>Finish</button>
              <button className="btn btn-ghost" onClick={() => setEnding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
