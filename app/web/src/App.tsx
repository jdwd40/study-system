import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { api, ApiError } from './api';

/* ---------- shared bits ---------- */

function Spinner() {
  return (
    <div className="spinner-wrap" role="status" aria-label="Loading">
      <div className="spinner" />
    </div>
  );
}

function Err({ error }: { error: unknown }) {
  const msg = error instanceof ApiError ? error.message : 'Something went wrong';
  const sync = error instanceof ApiError && error.code === 'SYNC_ERROR';
  return <div className={sync ? 'banner banner-warn' : 'banner banner-error'} role="alert">{sync ? `Sync problem: ${msg}` : msg}</div>;
}

function Pill({ status }: { status: string }) {
  return <span className={`pill pill-${status}`}>{status.replace('_', ' ')}</span>;
}

function Stars({ value }: { value: number | null }) {
  if (value === null) return <span className="stars stars-empty" aria-label="not rated">☆☆☆☆☆</span>;
  return <span className="stars" aria-label={`rated ${value} of 5`}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>;
}

function Bar({ percent }: { percent: number }) {
  return (
    <div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
      <div className="progress-label">{percent}% complete</div>
    </div>
  );
}

function useData<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get<T>(path).then(setData).catch(setError).finally(() => setLoading(false));
  }, [path, ...deps]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}

function md(text: string): string {
  return DOMPurify.sanitize(marked.parse(text, { async: false }));
}

/* ---------- pages ---------- */

function Login({ onLogin, devBypass }: { onLogin: () => void; devBypass: boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/login', { password });
      onLogin();
    } catch {
      setError('Incorrect password');
    }
  };
  return (
    <main className="page page-narrow">
      <h1>Study System</h1>
      <p className="page-sub">Sign in to continue.</p>
      {devBypass && <div className="banner banner-info">Development bypass is active — any password continues.</div>}
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="card">
        <label className="field">
          <span className="field-label">Password</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </label>
        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>
    </main>
  );
}

function Dashboard() {
  const { data, error, loading } = useData<any>('/dashboard');
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const d = data!;
  return (
    <main className="page">
      <h1>Dashboard</h1>
      <p className="page-sub">Where you are, at a glance.</p>
      {d.lastSyncError && (
        <div className="banner banner-warn" role="alert">
          Last content sync failed ({d.lastSyncError.type}): {d.lastSyncError.message}
        </div>
      )}
      {d.resume?.lesson && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--accent)' }}>
          <p className="card-title">Resume: <Link to={`/lesson/${d.resume.lesson.id}`}>{d.resume.lesson.title}</Link></p>
          <p className="card-sub">You have an active session on this lesson.</p>
        </div>
      )}
      {d.unfinished.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p className="card-title">Unfinished</p>
          <ul className="list-plain">
            {d.unfinished.map((u: any) => (
              <li key={u.lesson.id}><Link to={`/lesson/${u.lesson.id}`}>{u.lesson.title}</Link> <Pill status="unfinished" /></li>
            ))}
          </ul>
        </div>
      )}
      <h2>Courses</h2>
      <div className="grid grid-cards">
        {d.courses.map((c: any) => (
          <Link to={`/course/${c.id}`} key={c.id} className="card" style={{ color: 'inherit' }}>
            <p className="card-title">{c.title} <Pill status={c.status} /></p>
            <Bar percent={c.progress.percent} />
            <p className="card-sub">{c.progress.completedLessons}/{c.progress.plannedLessons} lessons
              {c.averageUserRating !== null && <> · avg understanding {c.averageUserRating.toFixed(1)}/5</>}</p>
          </Link>
        ))}
      </div>
      <h2>Study time (last 30 days, via Habit Tracker)</h2>
      {d.studyTime.length === 0 ? <div className="empty">No linked study time yet.</div> : (
        <div className="grid grid-cards">
          {d.studyTime.map((s: any) => <div className="card" key={s.courseId}><p className="card-title">{s.courseId}</p><p className="card-sub">{s.minutes} min</p></div>)}
        </div>
      )}
      <h2>Weak areas <span className="meta">(based only on your own ratings)</span></h2>
      {d.weakAreas.length === 0 ? <div className="empty">No weak areas — nothing rated 2 or below.</div> : (
        <ul className="list-plain card">
          {d.weakAreas.map((w: any) => <li key={w.lessonId}><Link to={`/lesson/${w.lessonId}`}>{w.title}</Link> <Stars value={w.userRating} /></li>)}
        </ul>
      )}
      <h2>Revision</h2>
      <p><Link to="/review">{d.dueFlashcards} flashcard{d.dueFlashcards === 1 ? '' : 's'} due →</Link></p>
      <h2>Recent activity</h2>
      {d.recentActivity.length === 0 ? <div className="empty">Nothing yet. Start a lesson from the <Link to="/library">Course Library</Link>.</div> : (
        <ul className="list-plain card">
          {d.recentActivity.map((a: any) => (
            <li key={a.id}><Link to={`/lesson/${a.lessonId}`}>{a.lessonTitle}</Link> <Pill status={a.status} /> <span className="meta">{a.startedAt.slice(0, 10)}</span></li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Library() {
  const { data, error, loading } = useData<any>('/courses');
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  return (
    <main className="page">
      <h1>Course Library</h1>
      <p className="page-sub">All courses, active and paused.</p>
      <div className="grid grid-cards">
        {data!.courses.map((c: any) => (
          <Link to={`/course/${c.id}`} key={c.id} className="card" style={{ color: 'inherit' }}>
            <p className="card-title">{c.title}</p>
            <p className="card-sub">{c.description}</p>
            <Bar percent={c.progress.percent} />
            <p className="card-sub"><Pill status={c.status} /> {c.modules.length} modules
              {c.averageUserRating !== null && <> · <Stars value={Math.round(c.averageUserRating)} /></>}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

function CoursePage() {
  const { courseId } = useParams();
  const { data, error, loading } = useData<any>(`/courses/${courseId}`);
  const [open, setOpen] = useState<string | null>(null);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const c = data!;
  return (
    <main className="page">
      <h1>{c.title}</h1>
      <p className="page-sub">{c.description}</p>
      <Bar percent={c.progress.percent} />
      <div className="section-gap">
        {c.modules.map((m: any) => {
          const expanded = open === m.id;
          return (
            <div className="accordion" key={m.id}>
              <button className="accordion-trigger" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : m.id)}>
                <span>{m.id} — {m.title} <Pill status={m.status} /></span>
                <span className="accordion-chevron" aria-hidden>▸</span>
              </button>
              {expanded && (
                <div className="accordion-panel">
                  <p className="card-sub" style={{ padding: '0.5rem 0.75rem' }}>{m.summary}</p>
                  {m.lessons.length === 0 ? (
                    <p className="meta" style={{ padding: '0 0.75rem 0.5rem' }}>No lessons yet — structure is added only by explicit action.</p>
                  ) : m.lessons.map((l: any) => (
                    <Link to={`/lesson/${l.id}`} key={l.id} className="lesson-row">
                      <span className="lesson-row-title">{l.order}. {l.title}</span>
                      <Stars value={l.state.userRating} />
                      <Pill status={l.state.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

function LessonPage() {
  const { lessonId } = useParams();
  const { data, error, loading, reload } = useData<any>(`/lessons/${lessonId}`);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [finishedReading, setFinishedReading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const { lesson, state, activeAttempt, qa } = data!;

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true); setActionError(null);
    try { await fn(); reload(); } catch (e) { setActionError(e); } finally { setBusy(false); }
  };

  return (
    <main className="page page-narrow reading">
      <p className="meta">{lesson.courseId} · {lesson.moduleId}</p>
      <h1>{lesson.title}</h1>
      <p><Pill status={state.status} /> <Stars value={state.userRating} /> {state.hermesRating !== null && <span className="meta">Hermes estimate: {state.hermesRating}/5</span>}</p>
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
      <ul className="concept-grid">{lesson.keyConcepts.map((k: string) => <li key={k}>{k}</li>)}</ul>
      <h2>Examples</h2>
      <ul>{lesson.examples.map((e: string) => <li key={e}>{e}</li>)}</ul>
      <h2>Takeaways</h2>
      <ul>{lesson.takeaways.map((t: string) => <li key={t}>{t}</li>)}</ul>
      <h2>Flashcards</h2>
      {lesson.flashcards.map((f: any, i: number) => (
        <div className="flashcard" key={i}>
          <div className="flashcard-q">{f.q}</div>
          {flipped[i] ? <div className="flashcard-a">{f.a}</div> : null}
          <button className="btn btn-ghost" style={{ marginTop: '0.5rem', padding: '0.45rem 0.9rem' }}
            aria-expanded={!!flipped[i]} onClick={() => setFlipped((s) => ({ ...s, [i]: !s[i] }))}>
            {flipped[i] ? 'Hide answer' : 'Reveal answer'}
          </button>
        </div>
      ))}
      <h2>Revision questions</h2>
      <ol>{lesson.revisionQuestions.map((q: string) => <li key={q}>{q}</li>)}</ol>
      <h2>Sources and further reading</h2>
      <ul>{lesson.sources.map((s: string) => <li key={s}>{s}</li>)}</ul>
      {qa.length > 0 && (
        <>
          <h2>Q&amp;A from your attempts</h2>
          <ul className="list-plain card">
            {qa.map((q: any) => (
              <li key={q.id}><strong>{q.question}</strong>
                {q.userAnswer && <div className="meta">You: {q.userAnswer}</div>}
                {q.hermesFeedback && <div className="meta">Hermes: {q.hermesFeedback}</div>}
                {q.result && <Pill status={q.result === 'correct' ? 'complete' : q.result === 'incorrect' ? 'unfinished' : 'queued'} />}</li>
            ))}
          </ul>
        </>
      )}
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

function ReviewPage() {
  const { data, error, loading, reload } = useData<any>('/flashcards');
  const [dueOnly, setDueOnly] = useState(true);
  const [lessonFilter, setLessonFilter] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const today = new Date().toISOString().slice(0, 10);
  let cards: any[] = data!.cards;
  if (dueOnly) cards = cards.filter((c) => c.dueDate <= today);
  if (lessonFilter) cards = cards.filter((c) => c.lessonId === lessonFilter);
  const card = cards[Math.min(idx, Math.max(cards.length - 1, 0))];
  const lessons: string[] = Array.from(new Set(data!.cards.map((c: any) => c.lessonId)));
  const grade = async (g: string) => {
    await api.post('/flashcards/review', { cardId: card.cardId, lessonId: card.lessonId, grade: g });
    setFlipped(false); setIdx((i) => i + 1); reload();
  };
  return (
    <main className="page page-narrow">
      <h1>Revision &amp; Flashcards</h1>
      <p className="page-sub">Due suggestions first — browse anything, in any order.</p>
      <div className="filter-row">
        <select className="input" value={lessonFilter} onChange={(e) => { setLessonFilter(e.target.value); setIdx(0); }} aria-label="Filter by lesson">
          <option value="">All lessons</option>
          {lessons.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button className={`btn ${dueOnly ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setDueOnly(!dueOnly); setIdx(0); }}>{dueOnly ? 'Showing due only' : 'Showing all'}</button>
      </div>
      {!card ? <div className="empty">No cards here. Nothing due — good state to be in.</div> : (
        <div className="card">
          <p className="meta">{card.lessonTitle} · card {Math.min(idx, Math.max(cards.length - 1, 0)) + 1} of {cards.length} {card.isNew && '· new'}</p>
          <div className="flashcard">
            <div className="flashcard-q">{card.q}</div>
            {flipped && <div className="flashcard-a">{card.a}</div>}
          </div>
          {!flipped ? (
            <button className="btn btn-primary" onClick={() => setFlipped(true)}>Reveal</button>
          ) : (
            <div className="grade-row">
              <button className="grade-btn grade-again" onClick={() => grade('again')}>Again</button>
              <button className="grade-btn grade-hard" onClick={() => grade('hard')}>Hard</button>
              <button className="grade-btn grade-good" onClick={() => grade('good')}>Good</button>
              <button className="grade-btn grade-easy" onClick={() => grade('easy')}>Easy</button>
            </div>
          )}
          <div className="btn-row" style={{ marginTop: '0.75rem' }}>
            <button className="btn btn-ghost" disabled={idx === 0} onClick={() => { setIdx(idx - 1); setFlipped(false); }}>← Previous</button>
            <button className="btn btn-ghost" disabled={idx >= cards.length - 1} onClick={() => { setIdx(idx + 1); setFlipped(false); }}>Next →</button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- manage (structure) ---------- */

const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const unlines = (a: string[]) => a.join('\n');
const cardsToText = (cards: { q: string; a: string }[]) => cards.map((c) => `Q: ${c.q} | A: ${c.a}`).join('\n');
const textToCards = (s: string) =>
  lines(s).map((l) => {
    const m = l.match(/^Q:\s*(.+?)\s*\|\s*A:\s*(.+)$/);
    return m ? { q: m[1]!, a: m[2]! } : { q: l, a: '' };
  }).filter((c) => c.q && c.a);

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
        <div className="btn-row" style={{ marginTop: '1rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span className="field-label">{label}</span>{children}</label>;
}

function CourseForm({ initial, onDone, onClose }: { initial: any | null; onDone: () => void; onClose: () => void }) {
  const [form, setForm] = useState({ id: initial?.id ?? '', title: initial?.title ?? '', description: initial?.description ?? '', status: initial?.status ?? 'active' });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      if (initial) await api.put(`/courses/${initial.id}`, { title: form.title, description: form.description, status: form.status });
      else await api.post('/structure/courses', form);
      onDone(); onClose();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal title={initial ? `Edit course ${initial.id}` : 'New course'} onClose={onClose}>
      {error != null && <Err error={error} />}
      <form onSubmit={submit}>
        {!initial && <Field label="Course id (lowercase slug, permanent)"><input className="input" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. philosophy" required /></Field>}
        <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Description"><textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></Field>
        <Field label="Status">
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">active</option><option value="paused">paused</option><option value="archived">archived</option>
          </select>
        </Field>
        <button className="btn btn-primary" type="submit" disabled={busy}>{initial ? 'Save course' : 'Create course'}</button>
      </form>
    </Modal>
  );
}

function ModuleForm({ courseId, initial, courses, onDone, onClose }: { courseId: string; initial: any | null; courses: any[]; onDone: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    courseId: initial?.courseId ?? courseId,
    id: initial?.id ?? '', title: initial?.title ?? '', summary: initial?.summary ?? '',
    objectives: unlines(initial?.objectives ?? []), order: initial?.order ?? 1, status: initial?.status ?? 'queued',
  });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      if (initial) {
        await api.put(`/courses/${initial.courseId}/modules/${initial.id}`, {
          title: form.title, summary: form.summary, objectives: lines(form.objectives), order: Number(form.order), status: form.status,
        });
      } else {
        await api.post('/structure/modules', {
          courseId: form.courseId, id: form.id, title: form.title, summary: form.summary,
          objectives: lines(form.objectives), order: Number(form.order), status: form.status,
        });
      }
      onDone(); onClose();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal title={initial ? `Edit module ${initial.id}` : 'New module'} onClose={onClose}>
      {error != null && <Err error={error} />}
      <form onSubmit={submit}>
        {!initial && (
          <>
            <Field label="Course">
              <select className="input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
                {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </Field>
            <Field label="Module id (permanent, e.g. SSE-201)"><input className="input" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required /></Field>
          </>
        )}
        <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Summary"><textarea className="input" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required /></Field>
        <Field label="Learning objectives (one per line)"><textarea className="input" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} required /></Field>
        <Field label="Order"><input className="input" type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} required /></Field>
        <Field label="Status">
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">active</option><option value="queued">queued</option><option value="paused">paused</option>
          </select>
        </Field>
        <button className="btn btn-primary" type="submit" disabled={busy}>{initial ? 'Save module' : 'Create module'}</button>
      </form>
    </Modal>
  );
}

function LessonForm({ courseId, moduleId, modules, initial, onDone, onClose }: { courseId: string; moduleId: string; modules: any[]; initial: any | null; onDone: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id ?? '', title: initial?.title ?? '',
    courseId: initial?.courseId ?? courseId, moduleId: initial?.moduleId ?? moduleId,
    order: initial?.order ?? 1, estimatedMinutes: initial?.estimatedMinutes ?? '',
    objective: initial?.objective ?? '', content: initial?.content ?? '',
    keyConcepts: unlines(initial?.keyConcepts ?? []), examples: unlines(initial?.examples ?? []),
    takeaways: unlines(initial?.takeaways ?? []), sources: unlines(initial?.sources ?? []),
    flashcards: cardsToText(initial?.flashcards ?? []), revisionQuestions: unlines(initial?.revisionQuestions ?? []),
  });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    const payload = {
      title: form.title, order: Number(form.order),
      ...(form.estimatedMinutes !== '' ? { estimatedMinutes: Number(form.estimatedMinutes) } : {}),
      objective: form.objective, content: form.content,
      keyConcepts: lines(form.keyConcepts), examples: lines(form.examples), takeaways: lines(form.takeaways),
      sources: lines(form.sources), flashcards: textToCards(form.flashcards), revisionQuestions: lines(form.revisionQuestions),
    };
    try {
      if (initial) await api.put(`/lessons/${initial.id}/content`, payload);
      else await api.post('/structure/lesson', { ...payload, id: form.id, courseId: form.courseId, moduleId: form.moduleId });
      onDone(); onClose();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal title={initial ? `Edit lesson ${initial.id}` : 'Plan new lesson'} onClose={onClose} wide>
      {error != null && <Err error={error} />}
      <form onSubmit={submit}>
        {!initial && (
          <>
            <Field label="Module">
              <select className="input" value={`${form.courseId}|${form.moduleId}`}
                onChange={(e) => { const [cid, mid] = e.target.value.split('|'); setForm({ ...form, courseId: cid!, moduleId: mid! }); }}>
                {modules.map((m: any) => <option key={`${m.courseId}|${m.id}`} value={`${m.courseId}|${m.id}`}>{m.courseId} · {m.id} — {m.title}</option>)}
              </select>
            </Field>
            <Field label="Lesson id (lowercase slug, permanent)"><input className="input" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. sse-201-solid-principles" required /></Field>
          </>
        )}
        <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <div className="form-grid">
          <Field label="Order"><input className="input" type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} required /></Field>
          <Field label="Estimated minutes (optional)"><input className="input" type="number" min={0} value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
        </div>
        <Field label="Objective"><textarea className="input" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} required /></Field>
        <Field label="Content (Markdown)"><textarea className="input input-tall" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></Field>
        <Field label="Key concepts (one per line)"><textarea className="input" value={form.keyConcepts} onChange={(e) => setForm({ ...form, keyConcepts: e.target.value })} /></Field>
        <Field label="Examples (one per line)"><textarea className="input" value={form.examples} onChange={(e) => setForm({ ...form, examples: e.target.value })} /></Field>
        <Field label="Takeaways (one per line)"><textarea className="input" value={form.takeaways} onChange={(e) => setForm({ ...form, takeaways: e.target.value })} /></Field>
        <Field label="Sources and further reading (one per line)"><textarea className="input" value={form.sources} onChange={(e) => setForm({ ...form, sources: e.target.value })} /></Field>
        <Field label="Flashcards (one per line: Q: question | A: answer)"><textarea className="input" value={form.flashcards} onChange={(e) => setForm({ ...form, flashcards: e.target.value })} placeholder="Q: What is coupling? | A: The degree of interdependence between modules." required /></Field>
        <Field label="Revision questions (one per line)"><textarea className="input" value={form.revisionQuestions} onChange={(e) => setForm({ ...form, revisionQuestions: e.target.value })} required /></Field>
        <button className="btn btn-primary" type="submit" disabled={busy}>{initial ? 'Save lesson' : 'Create lesson'}</button>
      </form>
    </Modal>
  );
}

function ManagePage() {
  const { data, error, loading, reload } = useData<any>('/courses');
  const [modal, setModal] = useState<{ kind: 'course' | 'module' | 'lesson'; courseId?: string; moduleId?: string; initial?: any } | null>(null);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const courses: any[] = data!.courses;
  const allModules = courses.flatMap((c: any) => c.modules.map((m: any) => ({ ...m, courseId: c.id })));
  return (
    <main className="page">
      <h1>Manage Curriculum</h1>
      <p className="page-sub">Deliberate structure changes only. Every save validates the whole tree and syncs canonical Markdown to Git — nothing here lives only in the database.</p>
      <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
        <button className="btn btn-primary" onClick={() => setModal({ kind: 'course' })}>+ New course</button>
      </div>
      <div className="section-gap" style={{ marginTop: 0 }}>
        {courses.map((c: any) => (
          <div className="card" key={c.id} style={{ marginBottom: '1rem' }}>
            <div className="manage-row">
              <p className="card-title manage-main" style={{ margin: 0 }}>{c.title} <Pill status={c.status} /></p>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'course', initial: c })}>Edit course</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'module', courseId: c.id })}>+ Module</button>
            </div>
            <p className="card-sub">{c.description}</p>
            {c.modules.map((m: any) => (
              <div key={m.id} className="manage-module">
                <div className="manage-row">
                  <span className="manage-main"><strong>{m.id}</strong> — {m.title} <Pill status={m.status} /> <span className="meta">order {m.order}</span></span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'module', courseId: c.id, initial: m })}>Edit module</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'lesson', courseId: c.id, moduleId: m.id })}>+ Lesson</button>
                </div>
                {m.lessons.length > 0 && (
                  <ul className="list-plain" style={{ marginLeft: '0.5rem' }}>
                    {m.lessons.map((l: any) => (
                      <li key={l.id} className="manage-row">
                        <span className="manage-main">{l.order}. {l.title} <span className="meta">{l.id}{l.estimatedMinutes ? ` · ~${l.estimatedMinutes} min` : ''}</span></span>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'lesson', courseId: c.id, moduleId: m.id, initial: l })}>Edit lesson</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {modal?.kind === 'course' && <CourseForm initial={modal.initial ?? null} onDone={reload} onClose={() => setModal(null)} />}
      {modal?.kind === 'module' && <ModuleForm courseId={modal.courseId!} initial={modal.initial ?? null} courses={courses} onDone={reload} onClose={() => setModal(null)} />}
      {modal?.kind === 'lesson' && <LessonForm courseId={modal.courseId!} moduleId={modal.moduleId!} modules={allModules} initial={modal.initial ?? null} onDone={reload} onClose={() => setModal(null)} />}
    </main>
  );
}

function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any>(null);
  useEffect(() => {
    const t = setTimeout(() => { if (q.trim()) api.get(`/search?q=${encodeURIComponent(q)}`).then(setResults); else setResults(null); }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <main className="page page-narrow">
      <h1>Search</h1>
      <p className="page-sub">Courses, modules and lessons only — never your Q&amp;A or review history.</p>
      <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, modules, lessons…" aria-label="Search" />
      {results && (
        <div className="section-gap">
          {results.courses.map((c: any) => <p key={c.id}><Link to={`/course/${c.id}`}>{c.title}</Link> <span className="meta">course</span></p>)}
          {results.modules.map((m: any) => <p key={m.id}><Link to={`/course/${m.courseId}`}>{m.id} — {m.title}</Link> <span className="meta">module</span></p>)}
          {results.lessons.map((l: any) => <p key={l.id}><Link to={`/lesson/${l.id}`}>{l.title}</Link> <span className="meta">lesson</span></p>)}
          {results.courses.length + results.modules.length + results.lessons.length === 0 && <div className="empty">No matches.</div>}
        </div>
      )}
    </main>
  );
}

/* ---------- shell ---------- */

export default function App() {
  const [me, setMe] = useState<{ authenticated: boolean; devBypass: boolean } | null>(null);
  const navigate = useNavigate();
  const check = useCallback(() => { api.get<{ authenticated: boolean; devBypass: boolean }>('/auth/me').then(setMe).catch(() => setMe({ authenticated: false, devBypass: false })); }, []);
  useEffect(() => {
    check();
    const onUnauth = () => setMe({ authenticated: false, devBypass: false });
    window.addEventListener('study:unauthenticated', onUnauth);
    return () => window.removeEventListener('study:unauthenticated', onUnauth);
  }, [check]);
  if (me === null) return <Spinner />;
  if (!me.authenticated) return <Login onLogin={check} devBypass={me.devBypass} />;
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">Study System</Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/library">Library</NavLink>
            <NavLink to="/review">Review</NavLink>
            <NavLink to="/manage">Manage</NavLink>
            <NavLink to="/search">Search</NavLink>
          </nav>
          <button className="logout-btn" onClick={async () => { await api.post('/auth/logout'); setMe({ authenticated: false, devBypass: false }); navigate('/'); }}>Sign out</button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<main className="page"><div className="empty">Page not found. <Link to="/">Back to dashboard</Link>.</div></main>} />
      </Routes>
    </div>
  );
}
