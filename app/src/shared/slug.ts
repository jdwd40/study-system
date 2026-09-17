const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,95}$/;
const MODULE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/;
const COURSE_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function isValidSlug(value: string): boolean {
  return SLUG_RE.test(value);
}

export function isValidModuleId(value: string): boolean {
  return MODULE_ID_RE.test(value) && !value.includes('..');
}

export function isValidCourseId(value: string): boolean {
  return COURSE_ID_RE.test(value);
}

/** Directory name for a module inside a course directory. */
export function moduleDirName(moduleId: string): string {
  return moduleId.toLowerCase();
}

/** True when a relative path stays inside the content tree (no traversal). */
export function isSafeRelativePath(rel: string): boolean {
  if (rel.includes('\0')) return false;
  const parts = rel.split('/');
  return parts.every((p) => p !== '..' && p !== '' && p !== '.');
}
