import { useState } from 'react';
import { api } from '../../api';
import { cardsToText, conceptsToText, lines, textToCards, unlines } from '../../lib/manageText';
import type { LessonDoc, ModuleDoc } from '../../types';
import { Err } from '../Err';
import { Field } from '../Field';
import { Modal } from '../Modal';

export function LessonForm({ courseId, moduleId, modules, initial, onDone, onClose }: { courseId: string; moduleId: string; modules: ModuleDoc[]; initial: LessonDoc | null; onDone: () => void; onClose: () => void }) {
  const [form, setForm] = useState<{
    id: string; title: string; courseId: string; moduleId: string; order: number; estimatedMinutes: number | '';
    objective: string; content: string; keyConcepts: string; examples: string; takeaways: string; sources: string;
    flashcards: string; revisionQuestions: string;
  }>({
    id: initial?.id ?? '', title: initial?.title ?? '',
    courseId: initial?.courseId ?? courseId, moduleId: initial?.moduleId ?? moduleId,
    order: initial?.order ?? 1, estimatedMinutes: initial?.estimatedMinutes ?? '',
    objective: initial?.objective ?? '', content: initial?.content ?? '',
    keyConcepts: conceptsToText(initial?.keyConcepts ?? []), examples: unlines(initial?.examples ?? []),
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
                {modules.map((m) => <option key={`${m.courseId}|${m.id}`} value={`${m.courseId}|${m.id}`}>{m.courseId} · {m.id} — {m.title}</option>)}
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
        <Field label="Key concepts (one per line, optional 'Term :: short explanation')"><textarea className="input" value={form.keyConcepts} onChange={(e) => setForm({ ...form, keyConcepts: e.target.value })} placeholder={'Software architecture\nCoupling :: How much one part must know about another.'} /></Field>
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
