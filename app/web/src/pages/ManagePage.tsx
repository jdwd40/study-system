import { useState } from 'react';
import { Err } from '../components/Err';
import { Pill } from '../components/Pill';
import { Spinner } from '../components/Spinner';
import { CourseForm } from '../components/manage/CourseForm';
import { LessonForm } from '../components/manage/LessonForm';
import { ModuleForm } from '../components/manage/ModuleForm';
import { useData } from '../hooks/useData';
import type { CourseDetail, CoursesResponse, LessonWithState, ModuleView } from '../types';

type ManageModal =
  | { kind: 'course'; initial?: CourseDetail }
  | { kind: 'module'; courseId: string; initial?: ModuleView }
  | { kind: 'lesson'; courseId: string; moduleId: string; initial?: LessonWithState };

export function ManagePage() {
  const { data, error, loading, reload } = useData<CoursesResponse>('/courses');
  const [modal, setModal] = useState<ManageModal | null>(null);
  if (loading) return <Spinner />;
  if (error) return <Err error={error} />;
  const courses: CourseDetail[] = data!.courses;
  const allModules = courses.flatMap((c) => c.modules.map((m) => ({ ...m, courseId: c.id })));
  return (
    <main className="page">
      <h1>Manage Curriculum</h1>
      <p className="page-sub">Deliberate structure changes only. Every save validates the whole tree and syncs canonical Markdown to Git — nothing here lives only in the database.</p>
      <div className="btn-row" style={{ marginBottom: '1.25rem' }}>
        <button className="btn btn-primary" onClick={() => setModal({ kind: 'course' })}>+ New course</button>
      </div>
      <div className="section-gap" style={{ marginTop: 0 }}>
        {courses.map((c) => (
          <div className="card" key={c.id} style={{ marginBottom: '1rem' }}>
            <div className="manage-row">
              <p className="card-title manage-main" style={{ margin: 0 }}>{c.title} <Pill status={c.status} /></p>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'course', initial: c })}>Edit course</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'module', courseId: c.id })}>+ Module</button>
            </div>
            <p className="card-sub">{c.description}</p>
            {c.modules.map((m) => (
              <div key={m.id} className="manage-module">
                <div className="manage-row">
                  <span className="manage-main"><strong>{m.id}</strong> — {m.title} <Pill status={m.status} /> <span className="meta">order {m.order}</span></span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'module', courseId: c.id, initial: m })}>Edit module</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: 'lesson', courseId: c.id, moduleId: m.id })}>+ Lesson</button>
                </div>
                {m.lessons.length > 0 && (
                  <ul className="list-plain" style={{ marginLeft: '0.5rem' }}>
                    {m.lessons.map((l) => (
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
      {modal?.kind === 'module' && <ModuleForm courseId={modal.courseId} initial={modal.initial ?? null} courses={courses} onDone={reload} onClose={() => setModal(null)} />}
      {modal?.kind === 'lesson' && <LessonForm courseId={modal.courseId} moduleId={modal.moduleId} modules={allModules} initial={modal.initial ?? null} onDone={reload} onClose={() => setModal(null)} />}
    </main>
  );
}
