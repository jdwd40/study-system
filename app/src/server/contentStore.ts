import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import {
  ContentError,
  parseCourse,
  parseLesson,
  parseModule,
  serializeCourse,
  serializeLesson,
  serializeModule,
} from '../shared/content.js';
import { isSafeRelativePath, isValidCourseId, isValidModuleId, isValidSlug, moduleDirName } from '../shared/slug.js';
import type { CourseDoc, LessonDoc, ModuleDoc, ValidationIssue } from '../shared/types.js';

export interface ContentTree {
  courses: CourseDoc[];
  modules: ModuleDoc[];
  lessons: LessonDoc[];
}

/**
 * Filesystem access to the canonical content tree.
 * Layout: content/<courseId>/README.md, content/<courseId>/<moduleDir>/README.md,
 * content/<courseId>/<moduleDir>/<lessonId>.md
 */
export class ContentStore {
  constructor(readonly contentDir: string) {}

  private safeJoin(rel: string): string {
    if (!isSafeRelativePath(rel)) throw new ContentError(`unsafe path: ${rel}`);
    const abs = resolve(this.contentDir, rel);
    const root = resolve(this.contentDir);
    if (abs !== root && !abs.startsWith(root + sep)) throw new ContentError(`path escapes content root: ${rel}`);
    return abs;
  }

  coursePath(courseId: string): string {
    return this.safeJoin(join(courseId, 'README.md'));
  }

  modulePath(courseId: string, moduleId: string): string {
    return this.safeJoin(join(courseId, moduleDirName(moduleId), 'README.md'));
  }

  lessonPath(courseId: string, moduleId: string, lessonId: string): string {
    return this.safeJoin(join(courseId, moduleDirName(moduleId), `${lessonId}.md`));
  }

  /** The content-tree course index (content/README.md). */
  indexPath(): string {
    return this.safeJoin('README.md');
  }

  /** Load and fully validate the whole tree. Throws ContentError listing every issue. */
  loadTree(): ContentTree {
    const issues: ValidationIssue[] = [];
    const courses: CourseDoc[] = [];
    const modules: ModuleDoc[] = [];
    const lessons: LessonDoc[] = [];
    const seenIds = new Map<string, string>();

    const claimId = (id: string, path: string) => {
      const existing = seenIds.get(id);
      if (existing) issues.push({ path, message: `duplicate id "${id}" also used by ${existing}` });
      else seenIds.set(id, path);
    };

    if (!existsSync(this.contentDir)) {
      return { courses, modules, lessons };
    }

    for (const courseEntry of readdirSync(this.contentDir, { withFileTypes: true })) {
      if (!courseEntry.isDirectory()) continue;
      const courseId = courseEntry.name;
      if (!isValidCourseId(courseId)) {
        issues.push({ path: courseId, message: `course directory "${courseId}" is not a valid course id` });
        continue;
      }
      const courseReadme = join(courseId, 'README.md');
      try {
        const course = parseCourse(readFileSync(this.safeJoin(courseReadme), 'utf8'), courseReadme);
        if (course.id !== courseId) {
          issues.push({ path: courseReadme, message: `course id "${course.id}" must match directory "${courseId}"` });
        }
        claimId(course.id, courseReadme);
        courses.push(course);
      } catch (err) {
        issues.push(...(err as ContentError).issues);
        continue;
      }

      const courseDir = join(this.contentDir, courseId);
      for (const modEntry of readdirSync(courseDir, { withFileTypes: true })) {
        if (!modEntry.isDirectory()) continue;
        const moduleDir = modEntry.name;
        const moduleReadme = join(courseId, moduleDir, 'README.md');
        let module: ModuleDoc;
        try {
          module = parseModule(readFileSync(this.safeJoin(moduleReadme), 'utf8'), moduleReadme);
          if (moduleDirName(module.id) !== moduleDir) {
            issues.push({ path: moduleReadme, message: `module id "${module.id}" must match directory "${moduleDir}"` });
          }
          if (module.courseId !== courseId) {
            issues.push({ path: moduleReadme, message: `module course_id "${module.courseId}" must match "${courseId}"` });
          }
          claimId(module.id, moduleReadme);
          modules.push(module);
        } catch (err) {
          issues.push(...(err as ContentError).issues);
          continue;
        }

        const modDirAbs = join(courseDir, moduleDir);
        for (const file of readdirSync(modDirAbs, { withFileTypes: true })) {
          if (!file.isFile() || !file.name.endsWith('.md') || file.name === 'README.md') continue;
          const lessonPath = join(courseId, moduleDir, file.name);
          try {
            const lesson = parseLesson(readFileSync(this.safeJoin(lessonPath), 'utf8'), lessonPath);
            if (`${lesson.id}.md` !== file.name) {
              issues.push({ path: lessonPath, message: `lesson id "${lesson.id}" must match filename "${file.name}"` });
            }
            if (lesson.courseId !== courseId || lesson.moduleId !== module.id) {
              issues.push({
                path: lessonPath,
                message: `lesson course_id/module_id must match its location (${courseId}/${module.id})`,
              });
            }
            claimId(lesson.id, lessonPath);
            lessons.push(lesson);
          } catch (err) {
            issues.push(...(err as ContentError).issues);
          }
        }
      }
    }

    if (issues.length > 0) throw new ContentError('content tree validation failed', issues);
    courses.sort((a, b) => a.id.localeCompare(b.id));
    modules.sort((a, b) => a.courseId.localeCompare(b.courseId) || a.order - b.order);
    lessons.sort((a, b) => a.courseId.localeCompare(b.courseId) || a.moduleId.localeCompare(b.moduleId) || a.order - b.order);
    return { courses, modules, lessons };
  }

  getLesson(lessonId: string): LessonDoc | null {
    return this.loadTree().lessons.find((l) => l.id === lessonId) ?? null;
  }

  getCourse(courseId: string): CourseDoc | null {
    return this.loadTree().courses.find((c) => c.id === courseId) ?? null;
  }

  getModule(courseId: string, moduleId: string): ModuleDoc | null {
    return this.loadTree().modules.find((m) => m.courseId === courseId && m.id === moduleId) ?? null;
  }

  /** Validate-then-write a lesson file. Validation always happens before any write. */
  writeLesson(doc: LessonDoc): string {
    if (!isValidSlug(doc.id)) throw new ContentError(`invalid lesson id: ${doc.id}`);
    if (!isValidCourseId(doc.courseId)) throw new ContentError(`invalid course id: ${doc.courseId}`);
    if (!isValidModuleId(doc.moduleId)) throw new ContentError(`invalid module id: ${doc.moduleId}`);
    const raw = serializeLesson(doc);
    parseLesson(raw, `${doc.courseId}/${moduleDirName(doc.moduleId)}/${doc.id}.md`); // validate before write
    const abs = this.lessonPath(doc.courseId, doc.moduleId, doc.id);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, raw);
    return abs;
  }

  /** Validate-then-write a course README with its module index links. */
  writeCourse(doc: CourseDoc, moduleLinks: { dir: string; title: string; status: string }[]): string {
    if (!isValidCourseId(doc.id)) throw new ContentError(`invalid course id: ${doc.id}`);
    const raw = serializeCourse(doc, moduleLinks);
    parseCourse(raw, `${doc.id}/README.md`); // validate before write
    const abs = this.coursePath(doc.id);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, raw);
    return abs;
  }

  /** Validate-then-write a module README with its lesson index links. */
  writeModule(doc: ModuleDoc, lessonLinks: { id: string; title: string }[]): string {
    if (!isValidModuleId(doc.id)) throw new ContentError(`invalid module id: ${doc.id}`);
    if (!isValidCourseId(doc.courseId)) throw new ContentError(`invalid course id: ${doc.courseId}`);
    const raw = serializeModule(doc, lessonLinks);
    parseModule(raw, `${doc.courseId}/${moduleDirName(doc.id)}/README.md`); // validate before write
    const abs = this.modulePath(doc.courseId, doc.id);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, raw);
    return abs;
  }

  /**
   * Regenerate the content-tree course index (content/README.md) from the
   * validated tree. Only course titles and links — never runtime data.
   */
  writeContentIndex(courses: CourseDoc[]): string {
    const links = courses
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((c) => `- [${c.title}](./${c.id}/README.md)`)
      .join('\n');
    const raw =
      '# Canonical Study Content\n\n' +
      'Clean Markdown curriculum content. Course → module → lesson hierarchy. Schema version 1.\n\n' +
      `${links}\n\n` +
      'Rules: no progress, ratings, attempts, Q&A, review state, dates or personal tracking in this tree — ' +
      "those live in the app's private runtime database. Validate with `npm run validate:content` in `app/`.\n";
    const abs = this.indexPath();
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, raw);
    return abs;
  }

  /** Read a content file as UTF-8, or null when it does not exist (for snapshots). */
  readRaw(relPath: string): string | null {
    const abs = this.safeJoin(relPath);
    return existsSync(abs) ? readFileSync(abs, 'utf8') : null;
  }

  /** Remove a content file (used only to roll back a failed transactional change). */
  removeRaw(relPath: string): void {
    rmSync(this.safeJoin(relPath), { force: true });
  }

  writeRaw(relPath: string, content: string): string {
    const abs = this.safeJoin(relPath);
    mkdirSync(resolve(abs, '..'), { recursive: true });
    writeFileSync(abs, content);
    return abs;
  }
}
