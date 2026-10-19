import { useState } from 'react';
import { api } from '../../api';
import type { CourseDetail, CourseStatus } from '../../types';
import { Err } from '../Err';
import { Field } from '../Field';
import { Modal } from '../Modal';

export function CourseForm({ initial, onDone, onClose }: { initial: CourseDetail | null; onDone: () => void; onClose: () => void }) {
  const [form, setForm] = useState<{ id: string; title: string; description: string; status: CourseStatus }>({
    id: initial?.id ?? '', title: initial?.title ?? '', description: initial?.description ?? '', status: initial?.status ?? 'active',
  });
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
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })}>
            <option value="active">active</option><option value="paused">paused</option><option value="archived">archived</option>
          </select>
        </Field>
        <button className="btn btn-primary" type="submit" disabled={busy}>{initial ? 'Save course' : 'Create course'}</button>
      </form>
    </Modal>
  );
}
