import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { ConceptModal } from '../components/ConceptModal';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { RichMarkdown } from '../components/RichMarkdown';
import { Spinner } from '../components/Spinner';
import { Stars } from '../components/Stars';
import { useData } from '../hooks/useData';
import { md } from '../lib/markdown';
import type { KeyConcept, LessonDetail } from '../types';

export function LessonPage() {
  const { lessonId } = useParams();
  const { data, error, loading, reload } = useData<LessonDetail>(`/lessons/${lessonId}`);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [finishedReading, setFinishedReading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);
  const [openConcept, setOpenConcept] = useState<KeyConcept | null>(null);
  /**
   * Opener element captured at click time. Focus is restored post-commit via
   * the effect below — deliberately not requestAnimationFrame, which may never
   * fire in occluded/backgrounded tabs, silently dropping focus restoration.
   */
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (openConcept) return;
    const opener = returnFocusRef.current;
    returnFocusRef.current = null;
    if (opener && opener.isConnected) opener.focus();
  }, [openConcept]);

  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const { lesson, state, activeAttempt, qa } = data!;

  const closeConcept = () => setOpenConcept(null);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true); setActionError(null);
    try { await fn(); reload(); } catch (e) { setActionError(e); } finally { setBusy(false); }
  };

  return (
    <main className="page page-narrow reading">
      <p className="meta">{lesson.courseId} · {lesson.moduleId}</p>
      <h1>{lesson.title}</h1>
      <p><Pill status={state.status} /> <Stars value={state.userRating} /> {state.hermesRating !== null && <span className="meta">Hermes estimate: {state.hermesRating}/5</span>}</p>
      <div className="lesson-glance">
        {lesson.estimatedMinutes != null && <span>~{lesson.estimatedMinutes} min read</span>}
        <span>{lesson.keyConcepts.length} key concept{lesson.keyConcepts.length === 1 ? '' : 's'}</span>
        <span>{lesson.flashcards.length} flashcard{lesson.flashcards.length === 1 ? '' : 's'}</span>
        <span>{lesson.revisionQuestions.length} revision question{lesson.revisionQuestions.length === 1 ? '' : 's'}</span>
      </div>
      {actionError != null && <Err error={actionError} />}
      <div className="btn-row" style={{ margin: '1rem 0' }}>
        {!activeAttempt && <button className="btn btn-primary" disabled={busy} onClick={() => act(() => api.post(`/lessons/${lesson.id}/start`))}>{state.status === 'complete' ? 'Retake lesson' : 'Start lesson'}</button>}
        {activeAttempt && !finishedReading && <button className="btn btn-primary" disabled={busy} onClick={() => setFinishedReading(true)}>I've finished reading</button>}
        {activeAttempt && finishedReading && <button className="btn btn-primary" disabled={busy} onClick={() => setEnding(true)}>End lesson</button>}
      </div>
      {activeAttempt && finishedReading && (
        <div className="banner banner-info">Content complete. To finish, say <strong>end lesson</strong> (or press End lesson) and rate your understanding. The lesson never completes by itself.</div>
      )}
      <div className="callout"><strong>Objective.</strong> {lesson.objective}</div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: md(lesson.content) }} />
      <h2>Key concepts</h2>
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
      <h2>Examples</h2>
      <ul>{lesson.examples.map((e) => <li key={e}><RichMarkdown text={e} /></li>)}</ul>
      <h2>Takeaways</h2>
      <ul>{lesson.takeaways.map((t) => <li key={t}><RichMarkdown text={t} /></li>)}</ul>
      <h2>Flashcards</h2>
      {lesson.flashcards.map((f, i) => (
        <div className="flashcard" key={i}>
          <div className="flashcard-q"><RichMarkdown text={f.q} /></div>
          {flipped[i] ? <div className="flashcard-a"><RichMarkdown text={f.a} /></div> : null}
          <button className="btn btn-ghost" style={{ marginTop: '0.5rem', padding: '0.45rem 0.9rem' }}
            aria-expanded={!!flipped[i]} onClick={() => setFlipped((s) => ({ ...s, [i]: !s[i] }))}>
            {flipped[i] ? 'Hide answer' : 'Reveal answer'}
          </button>
        </div>
      ))}
      <h2>Revision questions</h2>
      <ol>{lesson.revisionQuestions.map((q) => <li key={q}><RichMarkdown text={q} /></li>)}</ol>
      <h2>Sources and further reading</h2>
      <ul className="source-list">{lesson.sources.map((s) => <li key={s}><RichMarkdown text={s} /></li>)}</ul>
      {qa.length > 0 && (
        <>
          <h2>Q&amp;A from your attempts</h2>
          <ul className="list-plain card">
            {qa.map((q) => (
              <li key={q.id}><strong>{q.question}</strong>
                {q.userAnswer && <div className="meta">You: {q.userAnswer}</div>}
                {q.hermesFeedback && <div className="meta">Hermes: {q.hermesFeedback}</div>}
                {q.result && <Pill status={q.result === 'correct' ? 'complete' : q.result === 'incorrect' ? 'unfinished' : 'queued'} />}</li>
            ))}
          </ul>
        </>
      )}
      {openConcept && <ConceptModal concept={openConcept} lessonTitle={lesson.title} onClose={closeConcept} />}
      {ending && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="End lesson">
          <div className="modal">
            <h2 style={{ marginTop: 0 }}>End lesson</h2>
            <p className="card-sub">How well do you understand this? (required)</p>
            <div className="rating-row" role="radiogroup" aria-label="Your understanding rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`rating-btn ${userRating === n ? 'selected' : ''}`} onClick={() => setUserRating(n)} aria-pressed={userRating === n}>{n}</button>
              ))}
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" disabled={busy || userRating === null}
                onClick={() => act(async () => { await api.post(`/lessons/${lesson.id}/end`, { userRating }); setEnding(false); })}>Finish</button>
              <button className="btn btn-ghost" onClick={() => setEnding(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
