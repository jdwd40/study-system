import { useState } from 'react';
import { api } from '../../api';
import { lines, unlines } from '../../lib/manageText';
import type { CourseDetail, ModuleDoc, ModuleStatus } from '../../types';
import { Err } from '../Err';
import { Field } from '../Field';
import { Modal } from '../Modal';

export function ModuleForm({ courseId, initial, courses, onDone, onClose }: { courseId: string; initial: ModuleDoc | null; courses: CourseDetail[]; onDone: () => void; onClose: () => void }) {
  const [form, setForm] = useState<{ courseId: string; id: string; title: string; summary: string; objectives: string; order: number; status: ModuleStatus }>({
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
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
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
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ModuleStatus })}>
            <option value="active">active</option><option value="queued">queued</option><option value="paused">paused</option>
          </select>
        </Field>
        <button className="btn btn-primary" type="submit" disabled={busy}>{initial ? 'Save module' : 'Create module'}</button>
      </form>
    </Modal>
  );
}
