import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** Render Markdown to sanitised HTML. */
export function md(text: string): string {
  return DOMPurify.sanitize(marked.parse(text, { async: false }));
}
