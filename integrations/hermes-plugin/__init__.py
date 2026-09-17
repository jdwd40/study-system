"""Study System plugin — Hermes tool registrations.

Registers the `study_system` toolset. The plugin is a thin, stdlib-only bridge
to the Study System HTTP integration API; the Habit Tracker plugin is NOT
modified — study time is logged there first (habit_tracker.log_time), then
linked to a course here so the Study System dashboard can attribute it.

Config (environment, never in Git):
  STUDY_SYSTEM_URL          default http://127.0.0.1:4173
  STUDY_INTEGRATION_SECRET  bearer token shared with the Study System server
"""

from __future__ import annotations

import json
import os
import sys

_PLUGIN_DIR = os.path.dirname(os.path.abspath(__file__))
if _PLUGIN_DIR not in sys.path:
    sys.path.insert(0, _PLUGIN_DIR)

from study_client import StudyClient, StudyClientError  # noqa: E402

TOOLSET = "study_system"


def _client() -> StudyClient:
    return StudyClient()


def _ok(payload) -> str:
    return json.dumps({"success": True, "data": payload}, default=str)


def _err(message: str, code: str | None = None, extra: dict | None = None) -> str:
    payload = {"success": False, "error": message}
    if code:
        payload["code"] = code
    if extra:
        payload.update(extra)
    return json.dumps(payload, default=str)


def _run(fn, *args, **kwargs) -> str:
    try:
        return _ok(fn(*args, **kwargs))
    except StudyClientError as exc:
        return _err(str(exc), code=exc.code)
    except Exception as exc:  # never leak a traceback into the conversation
        return _err(f"{type(exc).__name__}: {exc}")


def _schema(description: str, properties: dict, required=None) -> dict:
    return {
        "name": "",  # filled at registration
        "description": description,
        "parameters": {"type": "object", "properties": properties, "required": required or []},
    }


_LESSON_ID = {"type": "string", "description": "Canonical lesson id, e.g. sse-101-architecture-vs-implementation."}
_RATING = {"type": "integer", "description": "Understanding rating 1-5.", "minimum": 1, "maximum": 5}


def _link_study_time(args: dict) -> str:
    """Link a Habit Tracker entry to a course. Never guesses the course."""
    client = _client()
    try:
        result = client.habit_link(
            habit_entry_id=args.get("habit_entry_id", ""),
            entry_date=args.get("entry_date", ""),
            minutes=int(args.get("minutes") or 0),
            course_id=args.get("course_id") or None,
        )
        return _ok(result)
    except StudyClientError as exc:
        if exc.code == "COURSE_REQUIRED":
            # Machine-readable course-required error, enriched with the valid
            # options so Hermes asks the user instead of guessing.
            try:
                courses = client.list_courses().get("courses", [])
            except StudyClientError:
                courses = []
            return _err(
                str(exc) + " Ask the user which course this study time belongs to.",
                code="COURSE_REQUIRED",
                extra={"courses": courses},
            )
        return _err(str(exc), code=exc.code)
    except Exception as exc:
        return _err(f"{type(exc).__name__}: {exc}")


_TOOLS = [
    (
        "list_courses",
        "List Study System courses (id, title, status). Use to resolve a course name to its id "
        "before linking study time or fetching the next lesson.",
        _schema("", {}),
        lambda a: _client().list_courses(),
    ),
    (
        "next_lesson",
        "Get the next not-complete lesson in canonical tree order ('what should I study next?'). "
        "Optionally scoped to a course_id. Never invents structure; null when the course is finished.",
        _schema("", {"course_id": {"type": "string", "description": "Optional course id, e.g. sse."}}),
        lambda a: _client().next_lesson(a.get("course_id") or None),
    ),
    (
        "start_lesson",
        "Start (or continue) a lesson attempt. Switching away from another lesson marks it "
        "unfinished; inactivity never ends anything.",
        _schema("", {"lesson_id": _LESSON_ID}, required=["lesson_id"]),
        lambda a: _client().start_lesson(a.get("lesson_id", "")),
    ),
    (
        "end_lesson",
        "Explicitly end the active lesson attempt. Requires the user's own understanding rating "
        "(1-5) — always ask the user, never invent it. Fails with NO_ACTIVE_ATTEMPT unless the "
        "lesson was started first. Completion is always explicit.",
        _schema("", {
            "lesson_id": _LESSON_ID,
            "user_rating": {**_RATING, "description": "USER's understanding rating 1-5 (required; ask them)."},
            "hermes_rating": {**_RATING, "description": "Optional Hermes estimate 1-5, stored separately."},
        }, required=["lesson_id", "user_rating"]),
        lambda a: _client().end_lesson(a.get("lesson_id", ""), int(a.get("user_rating") or 0), a.get("hermes_rating")),
    ),
    (
        "rate_lesson",
        "Record or update understanding ratings for a lesson without ending it. At least one of "
        "user_rating / hermes_rating is required.",
        _schema("", {"lesson_id": _LESSON_ID, "user_rating": _RATING, "hermes_rating": _RATING}, required=["lesson_id"]),
        lambda a: _client().record_ratings(a.get("lesson_id", ""), a.get("user_rating"), a.get("hermes_rating")),
    ),
    (
        "record_qa",
        "Record a Q&A exchange for a lesson (question, the user's answer, Hermes feedback, and "
        "result correct/partial/incorrect).",
        _schema("", {
            "lesson_id": _LESSON_ID,
            "question": {"type": "string"},
            "user_answer": {"type": "string"},
            "hermes_feedback": {"type": "string"},
            "result": {"type": "string", "enum": ["correct", "partial", "incorrect"]},
        }, required=["lesson_id", "question"]),
        lambda a: _client().record_qa(
            a.get("lesson_id", ""), a.get("question", ""),
            a.get("user_answer"), a.get("hermes_feedback"), a.get("result")),
    ),
    (
        "due_flashcards",
        "List flashcards due today (Europe/London) across all lessons, with card ids for review.",
        _schema("", {}),
        lambda a: _client().due_flashcards(),
    ),
    (
        "review_flashcard",
        "Grade a flashcard review: again/hard/good/easy. Schedules the next review (SM-2-like).",
        _schema("", {
            "card_id": {"type": "string", "description": "Card id from due_flashcards, e.g. sse-101-x#0."},
            "lesson_id": _LESSON_ID,
            "grade": {"type": "string", "enum": ["again", "hard", "good", "easy"]},
        }, required=["card_id", "lesson_id", "grade"]),
        lambda a: _client().review_flashcard(a.get("card_id", ""), a.get("lesson_id", ""), a.get("grade", "")),
    ),
    (
        "update_lesson_content",
        "EXPLICIT canonical content update for a lesson, only when the user asked for the content "
        "to change. changes is an object with any of: title, order, estimatedMinutes, objective, "
        "content, keyConcepts, examples, takeaways, sources, flashcards, revisionQuestions. "
        "Validated and synced to Git server-side; fails with CONTENT_INVALID or SYNC_ERROR.",
        _schema("", {
            "lesson_id": _LESSON_ID,
            "changes": {"type": "object", "description": "Fields to update (allowlisted)."},
        }, required=["lesson_id", "changes"]),
        lambda a: _client().update_content(a.get("lesson_id", ""), a.get("changes") or {}),
    ),
    (
        "link_study_time",
        "Link a Habit Tracker time entry to a Study System course so study time is attributed "
        "per course. Flow: log time with habit_tracker.log_time first, then call this with the "
        "returned entry id. course_id is REQUIRED — if omitted the tool returns COURSE_REQUIRED "
        "with the list of valid courses; ask the user, never guess. Idempotent on habit_entry_id.",
        _schema("", {
            "habit_entry_id": {"type": "string", "description": "Habit Tracker entry id from log_time."},
            "entry_date": {"type": "string", "description": "Europe/London date YYYY-MM-DD of the entry."},
            "minutes": {"type": "integer", "description": "Minutes studied (must match the entry)."},
            "course_id": {"type": "string", "description": "Study System course id, e.g. sse. Required."},
        }, required=["habit_entry_id", "entry_date", "minutes"]),
        _link_study_time,
    ),
]


def register(ctx) -> None:
    for name, description, schema, fn in _TOOLS:
        schema = dict(schema, name=name, description=description)
        ctx.register_tool(
            name=name,
            toolset=TOOLSET,
            schema=schema,
            handler=lambda args, _fn=fn, **_: _run(_fn, args) if _fn is not _link_study_time else _fn(args),
            description=description.split(".")[0] + ".",
            emoji="📚",
        )
