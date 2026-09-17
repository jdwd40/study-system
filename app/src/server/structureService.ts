import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import type { AppConfig } from './config.js';
import type { ContentStore, ContentTree } from './contentStore.js';
import type { GitSync } from './gitSync.js';
import { ServiceError } from './lessonService.js';
import { moduleDirName } from '../shared/slug.js';
import { SCHEMA_VERSION, type CourseDoc, type LessonDoc, type ModuleDoc } from '../shared/types.js';

export interface CourseInput {
  id: string;
  title: string;
  description: string;
  status?: CourseDoc['status'];
}

export interface ModuleInput {
  courseId: string;
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  order: number;
  status?: ModuleDoc['status'];
}

export type LessonContentFields = Partial<
  Pick<
    LessonDoc,
    | 'title'
    | 'order'
    | 'estimatedMinutes'
    | 'objective'
    | 'content'
    | 'keyConcepts'
    | 'examples'
    | 'takeaways'
    | 'sources'
    | 'flashcards'
    | 'revisionQuestions'
  >
>;

export interface StructureResult {
  ok: true;
  paths: string[];
}

/** Store write methods wrapped with snapshot tracking for transactional rollback. */
interface ScopedWriter {
  writeLesson: (doc: LessonDoc) => string;
  writeCourse: (doc: CourseDoc, links: { dir: string; title: string; status: string }[]) => string;
  writeModule: (doc: ModuleDoc, links: { id: string; title: string }[]) => string;
  writeContentIndex: (courses: CourseDoc[]) => string;
}

/**
 * Deliberate structure management. Every change goes through the SAME
 * transactional path as lesson content writes:
 *   pull --ff-only → write canonical Markdown → validate the WHOLE tree →
 *   regenerate index READMEs → validate again → stage canonical paths only →
 *   commit → push.
 * Validation failures roll the working tree back to its pre-change state;
 * Git failures keep the tree/commit for recovery and surface as SyncError.
 * Structure is NEVER created implicitly and never lives only in the database.
 */
export class StructureService {
  constructor(
    private readonly config: AppConfig,
    private readonly store: ContentStore,
    private readonly gitSync: GitSync,
  ) {}

  private rel(absPath: string): string {
    return relative(this.config.repoRoot, absPath).split('\\').join('/');
  }

  private tree(): ContentTree {
    return this.store.loadTree();
  }

  private static rollback(previous: Map<string, string | null>): void {
    for (const [abs, prev] of previous) {
      if (prev === null) rmSync(abs, { force: true });
      else writeFileSync(abs, prev);
    }
  }

  /**
   * Transactional canonical write. `mutate` performs the store writes via the
   * scoped writer; every written file is snapshot-tracked for rollback and
   * collected for staging.
   */
  private async apply(message: string, mutate: (w: ScopedWriter) => void): Promise<StructureResult> {
    await this.gitSync.pullFfOnly();

    const store = this.store;
    const previous = new Map<string, string | null>();
    const written: string[] = [];
    const tracked = (abs: string, write: () => string): string => {
      if (!previous.has(abs)) {
        previous.set(abs, existsSync(abs) ? readFileSync(abs, 'utf8') : null);
      }
      const out = write();
      if (!written.includes(abs)) written.push(abs);
      return out;
    };
    const w: ScopedWriter = {
      writeLesson: (doc) => tracked(store.lessonPath(doc.courseId, doc.moduleId, doc.id), () => store.writeLesson(doc)),
      writeCourse: (doc, links) => tracked(store.coursePath(doc.id), () => store.writeCourse(doc, links)),
      writeModule: (doc, links) => tracked(store.modulePath(doc.courseId, doc.id), () => store.writeModule(doc, links)),
      writeContentIndex: (courses) => tracked(store.indexPath(), () => store.writeContentIndex(courses)),
    };

    try {
      mutate(w);
      // Validate the WHOLE resulting tree before any commit. On failure the
      // written files are rolled back byte-for-byte and the error lists every issue.
      this.store.loadTree();
    } catch (err) {
      StructureService.rollback(previous);
      throw err;
    }

    const paths = written.map((abs) => this.rel(abs));
    await this.gitSync.commitAndPush(paths, message); // SyncError: tree/commit preserved for recovery
    return { ok: true, paths };
  }

  // ---- index regeneration -------------------------------------------------

  private moduleLinks(tree: ContentTree, courseId: string, moduleId: string): { id: string; title: string }[] {
    return tree.lessons
      .filter((l) => l.courseId === courseId && l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
      .map((l) => ({ id: l.id, title: l.title }));
  }

  private courseLinks(tree: ContentTree, courseId: string): { dir: string; title: string; status: string }[] {
    return tree.modules
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
      .map((m) => ({ dir: moduleDirName(m.id), title: m.title, status: m.status }));
  }

  /** Rewrite a module README's lesson index from the given tree. */
  private refreshModuleIndex(w: ScopedWriter, tree: ContentTree, courseId: string, moduleId: string): void {
    const module = tree.modules.find((m) => m.courseId === courseId && m.id === moduleId);
    if (!module) return; // module README itself was just written by the caller
    w.writeModule(module, this.moduleLinks(tree, courseId, moduleId));
  }

  /** Rewrite a course README's module index from the given tree. */
  private refreshCourseIndex(w: ScopedWriter, tree: ContentTree, courseId: string): void {
    const course = tree.courses.find((c) => c.id === courseId);
    if (!course) return; // course README itself was just written by the caller
    w.writeCourse(course, this.courseLinks(tree, courseId));
  }

  // ---- courses --------------------------------------------------------------

  async createCourse(input: CourseInput): Promise<StructureResult> {
    const tree = this.tree();
    if (tree.courses.some((c) => c.id === input.id)) {
      throw new ServiceError(`course id already exists: ${input.id}`, 'DUPLICATE_ID', 409);
    }
    const doc: CourseDoc = {
      schemaVersion: SCHEMA_VERSION,
      type: 'course',
      id: input.id,
      title: input.title,
      description: input.description,
      status: input.status ?? 'active',
    };
    return this.apply(`content: create course ${doc.id}`, (w) => {
      w.writeCourse(doc, []);
      w.writeContentIndex([...tree.courses, doc]);
    });
  }

  async updateCourse(courseId: string, changes: Partial<Omit<CourseInput, 'id'>>): Promise<StructureResult> {
    const tree = this.tree();
    const existing = tree.courses.find((c) => c.id === courseId);
    if (!existing) throw new ServiceError(`course not found: ${courseId}`, 'NOT_FOUND', 404);
    const doc: CourseDoc = {
      ...existing,
      title: changes.title ?? existing.title,
      description: changes.description ?? existing.description,
      status: changes.status ?? existing.status,
    };
    return this.apply(`content: update course ${courseId}`, (w) => {
      w.writeCourse(doc, this.courseLinks(tree, courseId));
      w.writeContentIndex(tree.courses.map((c) => (c.id === courseId ? doc : c)));
    });
  }

  // ---- modules --------------------------------------------------------------

  async createModule(input: ModuleInput): Promise<StructureResult> {
    const tree = this.tree();
    if (!tree.courses.some((c) => c.id === input.courseId)) {
      throw new ServiceError(`course not found: ${input.courseId}`, 'NOT_FOUND', 404);
    }
    if (tree.modules.some((m) => m.id === input.id)) {
      throw new ServiceError(`module id already exists: ${input.id}`, 'DUPLICATE_ID', 409);
    }
    const doc: ModuleDoc = {
      schemaVersion: SCHEMA_VERSION,
      type: 'module',
      id: input.id,
      title: input.title,
      courseId: input.courseId,
      order: input.order,
      status: input.status ?? 'queued',
      summary: input.summary,
      objectives: input.objectives,
    };
    return this.apply(`content: create module ${doc.id}`, (w) => {
      w.writeModule(doc, []);
      this.refreshCourseIndex(w, { ...tree, modules: [...tree.modules, doc] }, doc.courseId);
    });
  }

  async updateModule(
    courseId: string,
    moduleId: string,
    changes: Partial<Omit<ModuleInput, 'id' | 'courseId'>>,
  ): Promise<StructureResult> {
    const tree = this.tree();
    const existing = tree.modules.find((m) => m.courseId === courseId && m.id === moduleId);
    if (!existing) throw new ServiceError(`module not found: ${courseId}/${moduleId}`, 'NOT_FOUND', 404);
    const doc: ModuleDoc = {
      ...existing,
      title: changes.title ?? existing.title,
      summary: changes.summary ?? existing.summary,
      objectives: changes.objectives ?? existing.objectives,
      order: changes.order ?? existing.order,
      status: changes.status ?? existing.status,
    };
    return this.apply(`content: update module ${moduleId}`, (w) => {
      w.writeModule(doc, this.moduleLinks(tree, courseId, moduleId));
      this.refreshCourseIndex(
        w,
        { ...tree, modules: tree.modules.map((m) => (m.courseId === courseId && m.id === moduleId ? doc : m)) },
        courseId,
      );
    });
  }

  // ---- lessons ----------------------------------------------------------------

  async createLesson(doc: LessonDoc): Promise<StructureResult> {
    const tree = this.tree();
    if (tree.lessons.some((l) => l.id === doc.id)) {
      throw new ServiceError(`lesson id already exists: ${doc.id}`, 'DUPLICATE_ID', 409);
    }
    if (!tree.modules.some((m) => m.courseId === doc.courseId && m.id === doc.moduleId)) {
      throw new ServiceError(`module not found: ${doc.courseId}/${doc.moduleId}`, 'NOT_FOUND', 404);
    }
    return this.apply(`content: create lesson ${doc.id}`, (w) => {
      w.writeLesson(doc);
      this.refreshModuleIndex(w, { ...tree, lessons: [...tree.lessons, doc] }, doc.courseId, doc.moduleId);
    });
  }

  async updateLesson(lessonId: string, changes: LessonContentFields): Promise<StructureResult> {
    const tree = this.tree();
    const existing = tree.lessons.find((l) => l.id === lessonId);
    if (!existing) throw new ServiceError(`lesson not found: ${lessonId}`, 'NOT_FOUND', 404);
    const doc: LessonDoc = { ...existing, ...changes, id: existing.id, courseId: existing.courseId, moduleId: existing.moduleId };
    return this.apply(`content: update lesson ${lessonId}`, (w) => {
      w.writeLesson(doc);
      this.refreshModuleIndex(
        w,
        { ...tree, lessons: tree.lessons.map((l) => (l.id === lessonId ? doc : l)) },
        doc.courseId,
        doc.moduleId,
      );
    });
  }
}
