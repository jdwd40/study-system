# Study System

Standalone personal study application: canonical curriculum content in Git,
private runtime state (progress, ratings, attempts, Q&A, flashcard scheduling,
Habit Tracker links, sync events) in an app-owned SQLite database outside Git.

## Layout

- `content/` — canonical public Markdown: `content/<course>/<module>/<lesson>.md`
  with YAML front matter (schema version 1, see `content/schema.json`). Course and
  module `README.md` files make GitHub browsing pleasant. No progress, ratings,
  attempts, Q&A, review state, dates or personal tracking ever live here.
- `app/` — TypeScript Node (Express) backend + React/Vite frontend, single Node
  process serving `/study/` with API under `/study/api/`.
- `integrations/hermes-plugin/` — executable Hermes plugin package (toolset
  `study_system`) bridging Hermes to the integration API; see its README.

## Development

```sh
cd app
npm install
cp .env.example .env        # for local dev set STUDY_DEV_BYPASS=1
npm run dev                 # server on :4173 (API), vite on :5174 (UI, proxied)
```

Scripts: `test` (vitest), `typecheck`, `lint`, `build` (server tsc + vite),
`validate:content`, `smoke` (deterministic local end-to-end; `--built` to run
against the compiled server), `seed:outline` (reserved), `start` (production).

## Environment

See `app/.env.example`. Production requires `STUDY_PASSWORD_HASH` (scrypt string,
generate with the command in the example file) and ignores `STUDY_DEV_BYPASS`.
The Hermes adapter requires `STUDY_INTEGRATION_SECRET`.

## Canonical content rules

Every write (web UI or Hermes) goes through the same transactional structure
service: pull `--ff-only` → write canonical Markdown → validate the WHOLE
resulting tree (not just the edited file) → regenerate the affected index
READMEs (module lesson lists, course module lists, content course index) →
stage only `content/**` + root `README.md` → commit → push → record a sync
event. Validation failures roll the working tree back byte-for-byte; Git
failures surface as sync errors with the working tree and local commit
preserved for recovery — nothing claims success silently. Front matter uses
strict allowlists, so private/runtime fields (ratings, progress, Q&A, dates,
mastery) are rejected on every document type.

## Manual structure management

The Manage page (`/study/manage`, authenticated) creates and edits structure
deliberately — nothing is auto-created and nothing lives only in the database:

- Courses: create (`POST /study/api/structure/courses`) and edit title,
  description, status (`PUT /study/api/courses/:courseId`).
- Modules: create (`POST /study/api/structure/modules`) and edit title,
  summary, objectives, order, status
  (`PUT /study/api/courses/:courseId/modules/:moduleId`).
- Lessons: plan/create with full content (`POST /study/api/structure/lesson`),
  edit content (`PUT /study/api/lessons/:lessonId/content`), edit planned
  metadata only — title/order/estimated minutes
  (`PUT /study/api/lessons/:lessonId/meta`).

Ids are permanent (validation rejects unsafe or mismatched ids); duplicates
return 409. Teaching behavior always reads the canonical tree — structure
changes take effect only after the tree validates and syncs.

## Lesson lifecycle

Start creates an attempt; switching away marks the old lesson Unfinished;
inactivity never ends anything. Ending is explicit only (requires the active
attempt and a user understanding rating 1–5; Hermes estimate stored separately).
Retaking reuses the same canonical lesson id with a new attempt. When content is
finished the app prompts to `end lesson` — it never auto-completes.

## Spaced repetition

Deterministic SM-2-like scheduling (Again/Hard/Good/Easy → quality 1/3/4/5,
ease floor 1.3, intervals 1 → 6 → ×ease). Due selection by date, Europe/London
today. Manual browsing of any card is always allowed; order is never forced.

## Habit Tracker integration

Study time stays in the Habit Tracker (single source of truth). The integration
adapter links Habit Tracker entry ids to courses (`habit_links` table);
linking without a course is rejected (`COURSE_REQUIRED`). Calls are idempotent
on `habit_entry_id`. The repo-contained Hermes plugin in
`integrations/hermes-plugin/` registers the `study_system` toolset (next/start/
end lesson, ratings, Q&A, flashcard review, explicit content update,
course-level time link); install/configuration is documented in its README.

## Database backup/restore

The only runtime state is the SQLite file at `STUDY_DB_PATH`
(default `app/data/study.db`):

```sh
# backup
sqlite3 app/data/study.db ".backup 'study-backup-$(date +%F).db'"
# restore: stop the app, replace the db file with the backup, start the app.
```

Canonical content is in Git — restore via `git checkout -- content/`.

## Git sync recovery

Sync failures are recorded in `sync_events` (visible on the dashboard and
`GET /study/api/sync/events`). The working tree is always preserved. Recovery:

```sh
cd <repo>
git status                 # inspect what was staged/committed
git pull --rebase          # resolve conflicts if the remote moved on
npm run validate:content   # in app/, must pass before retrying
git push                   # retry the push manually
```

## Deployment

Single Node process behind the existing Nginx host (controller chooses the route,
e.g. `https://jdwd40.com/study/`):

```sh
cd app && npm ci && npm run build
NODE_ENV=production STUDY_PASSWORD_HASH=... STUDY_INTEGRATION_SECRET=... npm start
```

Requires the content tree to be a Git checkout with push credentials configured
(for canonical sync). DB and content paths are configurable via environment.

## Seeded content status

Seeded from the Obsidian curriculum outlines: 5 courses
(Software Systems Engineering, AI Engineering, Bronze Age Collapse, Industrial Revolution,
and archived Computer Architecture), 39 modules, and 11 fully written lessons (all
of SSE-101, three AI-101 lessons, and two HIST-A101 lessons). Industrial Revolution
is paused/queued; Computer Architecture is archived supporting knowledge rather than
an active course. Recorded Habit Tracker time may still be linked to either course
without making it active.

Remaining work: module lesson lists for modules beyond the first of each course
are planned in module READMEs but not yet expanded into lesson files — add via
the UI or the Hermes structure endpoints.
