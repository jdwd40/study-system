/** Validate the canonical content tree. Exit 1 with all issues listed on failure. */
import { resolve } from 'node:path';
import { ContentStore } from '../src/server/contentStore.js';
import { ContentError } from '../src/shared/content.js';

const contentDir = process.env.STUDY_CONTENT_DIR ?? resolve(new URL('.', import.meta.url).pathname, '..', '..', 'content');
const store = new ContentStore(contentDir);
try {
  const tree = store.loadTree();
  console.log(`content OK: ${tree.courses.length} courses, ${tree.modules.length} modules, ${tree.lessons.length} lessons (${contentDir})`);
} catch (err) {
  if (err instanceof ContentError) {
    console.error(`content validation failed (${contentDir}):`);
    for (const issue of err.issues) console.error(`  ${issue.path}: ${issue.message}`);
    process.exit(1);
  }
  throw err;
}
