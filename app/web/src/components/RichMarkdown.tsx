import { md } from '../lib/markdown';

/** Render a short Markdown field, including clickable links, safely. */
export function RichMarkdown({ text, className = 'rich-markdown' }: { text: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: md(text) }} />;
}
