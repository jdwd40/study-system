# Hermes Integration — Study System

Executable Hermes plugin bridging Hermes to the Study System HTTP integration
API. The existing Habit Tracker plugin is NOT modified; study time is logged
there first and then linked to a course here. Stdlib-only (no dependencies).

## Contents

- `plugin.yaml` — plugin manifest (Hermes local plugin conventions).
- `__init__.py` — registers the `study_system` toolset (10 tools).
- `study_client.py` — stdlib `urllib` HTTP client; errors carry the server's
  machine-readable `code`.
- `tests/test_plugin.py` — deterministic contract tests against a stub HTTP
  server (no real Study System, no network).

## Configuration (environment, never in Git)

| Variable | Required | Purpose |
|---|---|---|
| `STUDY_SYSTEM_URL` | no (default `http://127.0.0.1:4173`) | Study System base URL |
| `STUDY_INTEGRATION_SECRET` | yes | Bearer token; must match the server's `STUDY_INTEGRATION_SECRET` |

## Install (manual, controller-owned)

The package is repo-contained. To enable it in Hermes, copy (or symlink) this
directory into the Hermes plugins directory and set the env vars for the
Hermes process:

```sh
cp -r integrations/hermes-plugin ~/.hermes/plugins/study-system
# or: ln -s "$PWD/integrations/hermes-plugin" ~/.hermes/plugins/study-system
hermes plugins list        # verify study-system is discovered and enabled
```

Do not put the secret in `plugin.yaml` or any committed file. This repository
does not install the plugin for you — installing/changing Hermes global state
is a separate, explicitly approved step.

## Tools (toolset `study_system`)

| Tool | Endpoint | Notes |
|---|---|---|
| `list_courses` | GET `.../integration/courses` | id/title/status; resolve names → ids |
| `next_lesson` | GET `.../next-lesson?course_id=` | first not-complete lesson in tree order; never invents structure |
| `start_lesson` | POST `.../start-lesson` | creates/continues attempt; switching marks old lesson `unfinished` |
| `end_lesson` | POST `.../end-lesson` | requires user rating 1–5; 409 `NO_ACTIVE_ATTEMPT` unless started |
| `rate_lesson` | POST `.../ratings` | separate user/Hermes 1–5 scales |
| `record_qa` | POST `.../qa` | result ∈ correct/partial/incorrect |
| `due_flashcards` | GET `.../flashcards/due` | Europe/London today |
| `review_flashcard` | POST `.../flashcards/review` | grade again/hard/good/easy |
| `update_lesson_content` | POST `.../content-update` | explicit canonical edit; validated + synced to Git; 422 `CONTENT_INVALID`, 502 `SYNC_ERROR` |
| `link_study_time` | POST `.../habit-link` | course-level link; 400 `COURSE_REQUIRED` without a course |

All tool responses are JSON strings: `{"success": true, "data": ...}` or
`{"success": false, "error": ..., "code": ...}`.

## Boundary rules

- Authenticated with `Authorization: Bearer $STUDY_INTEGRATION_SECRET`
  (external config, never in Git).
- The plugin never puts Q&A, ratings, attempts or tracking data into canonical
  Markdown or Git. Canonical edits go only through `update_lesson_content`
  (explicit user request), validated and synced transactionally server-side.

## Habit Tracker flow (course-level study time)

1. User reports study time → log it with the existing `habit_tracker.log_time`
   tool (category `study`, `project="Study System"`, subject = course title).
2. Call `link_study_time` with the returned Habit Tracker entry id, the course
   id, the Europe/London entry date, and minutes.
3. If `course_id` is missing, the tool returns
   `{"success": false, "code": "COURSE_REQUIRED", "courses": [...]}` — ask the
   user which course, using the returned options. Never guess.
4. Calls are idempotent on `habit_entry_id` (201 created / 200 replay).

Course mapping: "Software Systems Engineering" →
`sse`; "AI Engineering" → `ai-engineering`; "History: Bronze Age Collapse" →
`bronze-age-collapse`; "Industrial Revolution" → `industrial-revolution`.
Computer Architecture maps to `computer-architecture` for historical time links,
but remains archived supporting knowledge and is never selected as an active lesson.

## Tests

```sh
cd integrations/hermes-plugin
python3 -m unittest discover -s tests   # or: pytest tests/
```

## Example (curl, equivalent of the plugin boundary)

```sh
curl -s -X POST "$STUDY_SYSTEM_URL/study/api/integration/start-lesson" \
  -H "Authorization: Bearer $STUDY_INTEGRATION_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"lesson_id":"ai-101-embeddings-and-vector-representations"}'
```
