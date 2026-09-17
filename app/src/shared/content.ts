/**
 * Canonical content parsing, serialisation and validation.
 *
 * Canonical content is clean Markdown with YAML front matter. Mutable progress,
 * ratings, attempts, Q&A, review state and personal tracking are NEVER valid in
 * canonical files: front matter uses strict allowlists per document type, so any
 * private/runtime field is rejected.
 */
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import {
  SCHEMA_VERSION,
  type CourseDoc,
  type Flashcard,
  type KeyConcept,
  type LessonDoc,
  type ModuleDoc,
  type ValidationIssue,
  type ValidationResult,
} from './types.js';
import { isValidCourseId, isValidModuleId, isValidSlug } from './slug.js';

export const LESSON_SECTIONS = [
  'Objective',
  'Content',
  'Key Concepts',
  'Examples',
  'Takeaways',
  'Sources and Further Reading',
  'Flashcards',
  'Revision Questions',
] as const;

const LESSON_FM_KEYS = new Set([
  'schema_version',
  'type',
  'id',
  'title',
  'course_id',
  'module_id',
  'order',
  'estimated_minutes',
]);
const MODULE_FM_KEYS = new Set([
  'schema_version',
  'type',
  'id',
  'title',
  'course_id',
  'order',
  'status',
  'summary',
  'objectives',
]);
const COURSE_FM_KEYS = new Set(['schema_version', 'type', 'id', 'title', 'description', 'status']);

export class ContentError extends Error {
  issues: ValidationIssue[];
  constructor(message: string, issues: ValidationIssue[] = []) {
    super(issues.length > 0 ? `${message}: ${issues.map((i) => i.message).join('; ')}` : message);
    this.name = 'ContentError';
    this.issues = issues;
  }
}

interface ParsedMarkdown {
  frontMatter: Record<string, unknown>;
  body: string;
}

/** Split a Markdown file into YAML front matter and body. */
export function splitFrontMatter(raw: string, path = '<memory>'): ParsedMarkdown {
  const text = raw.replace(/^\uFEFF/, '');
  if (!text.startsWith('---\n')) {
    throw new ContentError('missing YAML front matter', [{ path, message: 'file must start with --- front matter block' }]);
  }
  const end = text.indexOf('\n---', 4);
  if (end === -1) {
    throw new ContentError('unterminated front matter', [{ path, message: 'front matter closing --- not found' }]);
  }
  const fmText = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\r?\n/, '');
  let data: unknown;
  try {
    data = parseYaml(fmText);
  } catch (err) {
    throw new ContentError('invalid YAML front matter', [
      { path, message: `YAML parse error: ${(err as Error).message}` },
    ]);
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ContentError('front matter must be a mapping', [{ path, message: 'front matter must be a YAML mapping' }]);
  }
  return { frontMatter: data as Record<string, unknown>, body };
}

function rejectUnknownKeys(
  fm: Record<string, unknown>,
  allowed: Set<string>,
  path: string,
  issues: ValidationIssue[],
): void {
  for (const key of Object.keys(fm)) {
    if (!allowed.has(key)) {
      issues.push({
        path,
        message: `unsupported or private field "${key}" in front matter (mutable progress, ratings, attempts, Q&A, review state and tracking data are not allowed in canonical content)`,
      });
    }
  }
}

function requireString(
  fm: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): string | null {
  const value = fm[key];
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push({ path, message: `front matter field "${key}" must be a non-empty string` });
    return null;
  }
  return value;
}

function requireInt(
  fm: Record<string, unknown>,
  key: string,
  path: string,
  issues: ValidationIssue[],
): number | null {
  const value = fm[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    issues.push({ path, message: `front matter field "${key}" must be a non-negative integer` });
    return null;
  }
  return value;
}

/** Split a Markdown body into a map of H2 heading -> section text. */
export function splitSections(body: string): { h1: string | null; sections: Map<string, string> } {
  const lines = body.split('\n');
  let h1: string | null = null;
  const sections = new Map<string, string>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current !== null) sections.set(current, buf.join('\n').trim());
    buf = [];
  };
  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    const h1m = line.match(/^# (.+)$/);
    if (h1m && h1 === null) {
      h1 = h1m[1]!.trim();
      continue;
    }
    if (h2) {
      flush();
      current = h2[1]!.trim();
      continue;
    }
    if (current !== null) buf.push(line);
  }
  flush();
  return { h1, sections };
}

/** Parse "- Item" bullet lines from a section. */
export function parseBullets(section: string): string[] {
  return section
    .split('\n')
    .map((l) => l.match(/^\s*[-*] (.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => m[1]!.trim())
    .filter((s) => s.length > 0);
}

/**
 * Parse one key-concept line in the canonical form:
 *   "Term"                      -> { term }
 *   "Term :: short explanation" -> { term, explanation }
 * Only the first "::" splits term from explanation, so explanations may
 * contain colons. A trailing separator with empty text counts as no
 * explanation. Plain legacy bullets parse unchanged.
 */
export function parseConceptLine(line: string): KeyConcept {
  const text = line.trim();
  const idx = text.indexOf('::');
  if (idx === -1) return { term: text };
  const term = text.slice(0, idx).trim();
  const explanation = text.slice(idx + 2).trim();
  return explanation ? { term, explanation } : { term };
}

/** Serialise one concept to its canonical bullet text (no leading "- "). */
export function conceptToBullet(concept: KeyConcept): string {
  const explanation = concept.explanation?.trim();
  return explanation ? `${concept.term} :: ${explanation}` : concept.term;
}

/**
 * Normalise arbitrary API input into KeyConcept[].
 * Accepts legacy string arrays (parsed with parseConceptLine) and structured
 * { term, explanation } objects; entries without a usable term are dropped.
 */
export function normalizeKeyConcepts(input: unknown): KeyConcept[] {
  if (!Array.isArray(input)) return [];
  const out: KeyConcept[] = [];
  for (const item of input) {
    if (typeof item === 'string') {
      const concept = parseConceptLine(item);
      if (concept.term) out.push(concept);
      continue;
    }
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      const raw = item as Record<string, unknown>;
      const term = typeof raw['term'] === 'string' ? raw['term'].trim() : '';
      if (!term) continue;
      const explanation =
        typeof raw['explanation'] === 'string' ? raw['explanation'].trim() : '';
      out.push(explanation ? { term, explanation } : { term });
    }
  }
  return out;
}

/** Parse flashcards: "- Q: question" followed by an indented "A: answer" line. */
export function parseFlashcards(section: string, path: string, issues: ValidationIssue[]): Flashcard[] {
  const cards: Flashcard[] = [];
  const lines = section.split('\n');
  let i = 0;
  while (i < lines.length) {
    const qm = lines[i]!.match(/^\s*[-*] Q:\s*(.+)$/);
    if (qm) {
      const next = lines[i + 1] ?? '';
      const am = next.match(/^\s+A:\s*(.+)$/);
      if (!am) {
        issues.push({ path, message: `flashcard question "${qm[1]!.slice(0, 40)}…" is missing its indented "A:" line` });
      } else {
        cards.push({ q: qm[1]!.trim(), a: am[1]!.trim() });
        i += 1;
      }
    }
    i += 1;
  }
  return cards;
}

function checkSchemaVersion(fm: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  if (fm['schema_version'] !== SCHEMA_VERSION) {
    issues.push({ path, message: `schema_version must be ${SCHEMA_VERSION}` });
  }
}

/** Validate + parse a canonical lesson document. Throws ContentError on failure. */
export function parseLesson(raw: string, path = '<memory>'): LessonDoc {
  const issues: ValidationIssue[] = [];
  const { frontMatter: fm, body } = splitFrontMatter(raw, path);
  rejectUnknownKeys(fm, LESSON_FM_KEYS, path, issues);
  checkSchemaVersion(fm, path, issues);
  if (fm['type'] !== 'lesson') issues.push({ path, message: 'front matter type must be "lesson"' });

  const id = requireString(fm, 'id', path, issues);
  const title = requireString(fm, 'title', path, issues);
  const courseId = requireString(fm, 'course_id', path, issues);
  const moduleId = requireString(fm, 'module_id', path, issues);
  const order = requireInt(fm, 'order', path, issues);

  if (id && !isValidSlug(id)) issues.push({ path, message: `lesson id "${id}" is not a valid slug` });
  if (courseId && !isValidCourseId(courseId)) issues.push({ path, message: `course_id "${courseId}" is not valid` });
  if (moduleId && !isValidModuleId(moduleId)) issues.push({ path, message: `module_id "${moduleId}" is not valid` });
  if (fm['estimated_minutes'] !== undefined) requireInt(fm, 'estimated_minutes', path, issues);

  const { h1, sections } = splitSections(body);
  if (title && h1 !== title) issues.push({ path, message: `H1 heading must equal title "${title}"` });
  for (const section of LESSON_SECTIONS) {
    if (!sections.has(section)) issues.push({ path, message: `missing required section "## ${section}"` });
  }

  const flashcards = parseFlashcards(sections.get('Flashcards') ?? '', path, issues);
  if (sections.has('Flashcards') && flashcards.length === 0) {
    issues.push({ path, message: 'Flashcards section must contain at least one "- Q:/A:" pair' });
  }
  const revisionQuestions = parseBullets(sections.get('Revision Questions') ?? '');
  if (sections.has('Revision Questions') && revisionQuestions.length === 0) {
    issues.push({ path, message: 'Revision Questions section must contain at least one bullet' });
  }

  if (issues.length > 0) throw new ContentError(`invalid lesson: ${path}`, issues);

  return {
    schemaVersion: SCHEMA_VERSION,
    type: 'lesson',
    id: id!,
    title: title!,
    courseId: courseId!,
    moduleId: moduleId!,
    order: order!,
    estimatedMinutes:
      typeof fm['estimated_minutes'] === 'number' ? (fm['estimated_minutes'] as number) : undefined,
    objective: sections.get('Objective') ?? '',
    content: sections.get('Content') ?? '',
    keyConcepts: parseBullets(sections.get('Key Concepts') ?? '').map(parseConceptLine),
    examples: parseBullets(sections.get('Examples') ?? ''),
    takeaways: parseBullets(sections.get('Takeaways') ?? ''),
    sources: parseBullets(sections.get('Sources and Further Reading') ?? ''),
    flashcards,
    revisionQuestions,
  };
}

/** Validate + parse a canonical module README. Throws ContentError on failure. */
export function parseModule(raw: string, path = '<memory>'): ModuleDoc {
  const issues: ValidationIssue[] = [];
  const { frontMatter: fm } = splitFrontMatter(raw, path);
  rejectUnknownKeys(fm, MODULE_FM_KEYS, path, issues);
  checkSchemaVersion(fm, path, issues);
  if (fm['type'] !== 'module') issues.push({ path, message: 'front matter type must be "module"' });

  const id = requireString(fm, 'id', path, issues);
  const title = requireString(fm, 'title', path, issues);
  const courseId = requireString(fm, 'course_id', path, issues);
  const order = requireInt(fm, 'order', path, issues);
  const summary = requireString(fm, 'summary', path, issues);
  const status = requireString(fm, 'status', path, issues);
  if (status && !['active', 'queued', 'paused'].includes(status)) {
    issues.push({ path, message: `module status "${status}" must be active|queued|paused` });
  }
  if (id && !isValidModuleId(id)) issues.push({ path, message: `module id "${id}" is not valid` });
  if (courseId && !isValidCourseId(courseId)) issues.push({ path, message: `course_id "${courseId}" is not valid` });
  const objectives = fm['objectives'];
  if (!Array.isArray(objectives) || objectives.some((o) => typeof o !== 'string')) {
    issues.push({ path, message: 'objectives must be a list of strings' });
  }
  if (issues.length > 0) throw new ContentError(`invalid module: ${path}`, issues);
  return {
    schemaVersion: SCHEMA_VERSION,
    type: 'module',
    id: id!,
    title: title!,
    courseId: courseId!,
    order: order!,
    status: status as ModuleDoc['status'],
    summary: summary!,
    objectives: objectives as string[],
  };
}

/** Validate + parse a canonical course README. Throws ContentError on failure. */
export function parseCourse(raw: string, path = '<memory>'): CourseDoc {
  const issues: ValidationIssue[] = [];
  const { frontMatter: fm } = splitFrontMatter(raw, path);
  rejectUnknownKeys(fm, COURSE_FM_KEYS, path, issues);
  checkSchemaVersion(fm, path, issues);
  if (fm['type'] !== 'course') issues.push({ path, message: 'front matter type must be "course"' });

  const id = requireString(fm, 'id', path, issues);
  const title = requireString(fm, 'title', path, issues);
  const description = requireString(fm, 'description', path, issues);
  const status = requireString(fm, 'status', path, issues);
  if (status && !['active', 'paused', 'archived'].includes(status)) {
    issues.push({ path, message: `course status "${status}" must be active|paused|archived` });
  }
  if (id && !isValidCourseId(id)) issues.push({ path, message: `course id "${id}" is not valid` });
  if (issues.length > 0) throw new ContentError(`invalid course: ${path}`, issues);
  return {
    schemaVersion: SCHEMA_VERSION,
    type: 'course',
    id: id!,
    title: title!,
    description: description!,
    status: status as CourseDoc['status'],
  };
}

// ---------------------------------------------------------------------------
// Serialisation
// ---------------------------------------------------------------------------

function fmBlock(fields: Record<string, unknown>): string {
  return `---\n${stringifyYaml(fields).trim()}\n---\n`;
}

export function serializeLesson(doc: LessonDoc): string {
  const fm: Record<string, unknown> = {
    schema_version: doc.schemaVersion,
    type: 'lesson',
    id: doc.id,
    title: doc.title,
    course_id: doc.courseId,
    module_id: doc.moduleId,
    order: doc.order,
  };
  if (doc.estimatedMinutes !== undefined) fm['estimated_minutes'] = doc.estimatedMinutes;
  const bullets = (items: string[]) => items.map((i) => `- ${i}`).join('\n');
  const conceptBullets = (items: KeyConcept[]) => items.map((i) => `- ${conceptToBullet(i)}`).join('\n');
  const cards = doc.flashcards.map((c) => `- Q: ${c.q}\n  A: ${c.a}`).join('\n');
  return (
    fmBlock(fm) +
    `\n# ${doc.title}\n\n## Objective\n\n${doc.objective}\n\n## Content\n\n${doc.content}\n\n` +
    `## Key Concepts\n\n${conceptBullets(doc.keyConcepts)}\n\n## Examples\n\n${bullets(doc.examples)}\n\n` +
    `## Takeaways\n\n${bullets(doc.takeaways)}\n\n## Sources and Further Reading\n\n${bullets(doc.sources)}\n\n` +
    `## Flashcards\n\n${cards}\n\n## Revision Questions\n\n${bullets(doc.revisionQuestions)}\n`
  );
}

export function serializeModule(doc: ModuleDoc, lessonLinks: { id: string; title: string }[]): string {
  const fm = {
    schema_version: doc.schemaVersion,
    type: 'module',
    id: doc.id,
    title: doc.title,
    course_id: doc.courseId,
    order: doc.order,
    status: doc.status,
    summary: doc.summary,
    objectives: doc.objectives,
  };
  const lessons =
    lessonLinks.length > 0
      ? lessonLinks.map((l) => `- [${l.title}](./${l.id}.md)`).join('\n')
      : '_No lessons yet. Lessons are added only by explicit manual or Hermes-requested structure changes._';
  const objectives = doc.objectives.map((o) => `- ${o}`).join('\n');
  return (
    fmBlock(fm) +
    `\n# ${doc.title}\n\n${doc.summary}\n\n## Learning Objectives\n\n${objectives}\n\n## Lessons\n\n${lessons}\n`
  );
}

export function serializeCourse(doc: CourseDoc, moduleLinks: { dir: string; title: string; status: string }[]): string {
  const fm = {
    schema_version: doc.schemaVersion,
    type: 'course',
    id: doc.id,
    title: doc.title,
    description: doc.description,
    status: doc.status,
  };
  const modules = moduleLinks.map((m) => `- [${m.title}](./${m.dir}/README.md) — ${m.status}`).join('\n');
  return fmBlock(fm) + `\n# ${doc.title}\n\n${doc.description}\n\n## Modules\n\n${modules}\n`;
}

/** Aggregate tree-level validation result from per-file issues. */
export function collectIssues(issues: ValidationIssue[]): ValidationResult {
  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}
