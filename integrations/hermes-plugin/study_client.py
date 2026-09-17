"""Stdlib HTTP client for the Study System integration API.

Configuration is external — never hardcode secrets:
  STUDY_SYSTEM_URL          base URL, default http://127.0.0.1:4173
  STUDY_INTEGRATION_SECRET  bearer token (required; must match the server's env)

All errors raise StudyClientError carrying the server's machine-readable
`code` (e.g. COURSE_REQUIRED, NO_ACTIVE_ATTEMPT, CONTENT_INVALID, SYNC_ERROR)
so callers can react deterministically instead of parsing prose.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request


class StudyClientError(Exception):
    def __init__(self, message: str, code: str | None = None, status: int | None = None):
        super().__init__(message)
        self.code = code
        self.status = status


class StudyClient:
    def __init__(self, base_url: str | None = None, secret: str | None = None, timeout: float = 15.0):
        self.base_url = (base_url or os.environ.get("STUDY_SYSTEM_URL") or "http://127.0.0.1:4173").rstrip("/")
        self.secret = secret if secret is not None else os.environ.get("STUDY_INTEGRATION_SECRET")
        self.timeout = timeout

    def _request(self, method: str, path: str, body: dict | None = None, query: dict | None = None) -> dict:
        if not self.secret:
            raise StudyClientError(
                "STUDY_INTEGRATION_SECRET is not set — configure the plugin environment first",
                code="CONFIG_MISSING",
            )
        url = f"{self.base_url}/study/api/integration{path}"
        if query:
            url += "?" + urllib.parse.urlencode({k: v for k, v in query.items() if v is not None})
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(
            url,
            data=data,
            method=method,
            headers={
                "Authorization": f"Bearer {self.secret}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as res:
                return json.loads(res.read().decode())
        except urllib.error.HTTPError as exc:
            payload: dict = {}
            try:
                payload = json.loads(exc.read().decode())
            except Exception:
                pass
            raise StudyClientError(
                payload.get("error", f"HTTP {exc.code}"),
                code=payload.get("code"),
                status=exc.code,
            ) from exc
        except urllib.error.URLError as exc:
            raise StudyClientError(f"study system unreachable at {self.base_url}: {exc.reason}", code="UNREACHABLE") from exc

    # ---- course / lesson flow -------------------------------------------------

    def list_courses(self) -> dict:
        return self._request("GET", "/courses")

    def next_lesson(self, course_id: str | None = None) -> dict:
        return self._request("GET", "/next-lesson", query={"course_id": course_id})

    def start_lesson(self, lesson_id: str) -> dict:
        return self._request("POST", "/start-lesson", {"lesson_id": lesson_id})

    def end_lesson(self, lesson_id: str, user_rating: int, hermes_rating: int | None = None) -> dict:
        body: dict = {"lesson_id": lesson_id, "user_rating": user_rating}
        if hermes_rating is not None:
            body["hermes_rating"] = hermes_rating
        return self._request("POST", "/end-lesson", body)

    def record_ratings(self, lesson_id: str, user_rating: int | None = None, hermes_rating: int | None = None) -> dict:
        body: dict = {"lesson_id": lesson_id}
        if user_rating is not None:
            body["user_rating"] = user_rating
        if hermes_rating is not None:
            body["hermes_rating"] = hermes_rating
        return self._request("POST", "/ratings", body)

    def record_qa(
        self,
        lesson_id: str,
        question: str,
        user_answer: str | None = None,
        hermes_feedback: str | None = None,
        result: str | None = None,
    ) -> dict:
        body: dict = {"lesson_id": lesson_id, "question": question}
        if user_answer is not None:
            body["user_answer"] = user_answer
        if hermes_feedback is not None:
            body["hermes_feedback"] = hermes_feedback
        if result is not None:
            body["result"] = result
        return self._request("POST", "/qa", body)

    # ---- flashcards -------------------------------------------------------------

    def due_flashcards(self) -> dict:
        return self._request("GET", "/flashcards/due")

    def review_flashcard(self, card_id: str, lesson_id: str, grade: str) -> dict:
        return self._request("POST", "/flashcards/review", {"card_id": card_id, "lesson_id": lesson_id, "grade": grade})

    # ---- canonical content + habit links -----------------------------------------

    def update_content(self, lesson_id: str, changes: dict) -> dict:
        return self._request("POST", "/content-update", {"lesson_id": lesson_id, "changes": changes})

    def habit_link(self, habit_entry_id: str, entry_date: str, minutes: int, course_id: str | None = None) -> dict:
        body: dict = {"habit_entry_id": habit_entry_id, "entry_date": entry_date, "minutes": minutes}
        if course_id:
            body["course_id"] = course_id
        return self._request("POST", "/habit-link", body)
