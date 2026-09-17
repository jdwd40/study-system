"""Deterministic local contract tests for the study-system Hermes plugin.

Runs against a stub HTTP server (stdlib http.server) — no real Study System,
no network. Run with either:
  python3 -m unittest discover -s tests   (from integrations/hermes-plugin/)
  pytest tests/
"""

from __future__ import annotations

import importlib.util
import json
import os
import sys
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

PLUGIN_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load_plugin():
    spec = importlib.util.spec_from_file_location("study_system_plugin", os.path.join(PLUGIN_DIR, "__init__.py"))
    module = importlib.util.module_from_spec(spec)
    sys.modules["study_system_plugin"] = module
    spec.loader.exec_module(module)
    return module


# ---- stub Study System server -------------------------------------------------

ROUTES: dict[tuple[str, str], tuple[int, dict]] = {
    ("GET", "/study/api/integration/courses"): (200, {"courses": [{"id": "sse", "title": "SSE", "status": "active"}]}),
    ("GET", "/study/api/integration/next-lesson"): (200, {"lesson": {"id": "l1", "title": "Lesson One"}}),
    ("POST", "/study/api/integration/start-lesson"): (200, {"attempt": {"id": 1, "status": "active"}}),
    ("POST", "/study/api/integration/end-lesson"): (409, {"error": "no active attempt", "code": "NO_ACTIVE_ATTEMPT"}),
    ("POST", "/study/api/integration/ratings"): (200, {"state": {"userRating": 4}}),
    ("POST", "/study/api/integration/qa"): (201, {"id": 7}),
    ("GET", "/study/api/integration/flashcards/due"): (200, {"today": "2026-09-17", "cards": [{"cardId": "l1#0", "lessonId": "l1"}]}),
    ("POST", "/study/api/integration/flashcards/review"): (200, {"state": {"reps": 1}}),
    ("POST", "/study/api/integration/content-update"): (422, {"error": "content validation failed", "code": "CONTENT_INVALID", "issues": []}),
    ("POST", "/study/api/integration/habit-link"): (400, {"error": "courseId is required", "code": "COURSE_REQUIRED"}),
}

REQUESTS: list[dict] = []


class StubHandler(BaseHTTPRequestHandler):
    def _handle(self):
        REQUESTS.append({"method": self.command, "path": self.path, "authorization": self.headers.get("Authorization")})
        key = (self.command, self.path.split("?")[0])
        status, payload = ROUTES.get(key, (404, {"error": "not found", "code": "NOT_FOUND"}))
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    do_GET = _handle
    do_POST = _handle

    def log_message(self, *args):  # keep test output clean
        pass


class FakeCtx:
    def __init__(self):
        self.tools: dict[str, dict] = {}

    def register_tool(self, name, toolset, schema, handler, description, emoji=None):
        self.tools[name] = {"toolset": toolset, "schema": schema, "handler": handler}


class PluginTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), StubHandler)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.plugin = _load_plugin()
        cls.ctx = FakeCtx()
        cls.plugin.register(cls.ctx)
        os.environ["STUDY_SYSTEM_URL"] = f"http://127.0.0.1:{cls.port}"
        os.environ["STUDY_INTEGRATION_SECRET"] = "test-secret"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        os.environ.pop("STUDY_SYSTEM_URL", None)
        os.environ.pop("STUDY_INTEGRATION_SECRET", None)

    def setUp(self):
        REQUESTS.clear()

    def call(self, tool: str, args: dict) -> dict:
        return json.loads(self.ctx.tools[tool]["handler"](args))

    def test_registers_study_system_toolset_with_expected_tools(self):
        expected = {
            "list_courses", "next_lesson", "start_lesson", "end_lesson", "rate_lesson",
            "record_qa", "due_flashcards", "review_flashcard", "update_lesson_content", "link_study_time",
        }
        self.assertEqual(set(self.ctx.tools), expected)
        for tool in self.ctx.tools.values():
            self.assertEqual(tool["toolset"], "study_system")

    def test_sends_bearer_auth_header(self):
        result = self.call("next_lesson", {})
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["lesson"]["id"], "l1")
        self.assertEqual(REQUESTS[0]["authorization"], "Bearer test-secret")

    def test_end_lesson_conflict_is_machine_readable(self):
        result = self.call("end_lesson", {"lesson_id": "l1", "user_rating": 4})
        self.assertFalse(result["success"])
        self.assertEqual(result["code"], "NO_ACTIVE_ATTEMPT")

    def test_habit_link_without_course_returns_course_required_with_options(self):
        result = self.call("link_study_time", {"habit_entry_id": "e1", "entry_date": "2026-09-17", "minutes": 30})
        self.assertFalse(result["success"])
        self.assertEqual(result["code"], "COURSE_REQUIRED")
        self.assertIn("courses", result)
        self.assertEqual(result["courses"][0]["id"], "sse")
        self.assertIn("ask the user", result["error"].lower())

    def test_content_update_surfaces_validation_error(self):
        result = self.call("update_lesson_content", {"lesson_id": "l1", "changes": {"title": "X"}})
        self.assertFalse(result["success"])
        self.assertEqual(result["code"], "CONTENT_INVALID")

    def test_flashcard_review_posts_grade(self):
        result = self.call("review_flashcard", {"card_id": "l1#0", "lesson_id": "l1", "grade": "good"})
        self.assertTrue(result["success"])
        self.assertEqual(REQUESTS[0]["method"], "POST")

    def test_missing_secret_is_a_clear_config_error_and_makes_no_http_call(self):
        os.environ.pop("STUDY_INTEGRATION_SECRET")
        try:
            result = self.call("next_lesson", {})
            self.assertFalse(result["success"])
            self.assertEqual(result["code"], "CONFIG_MISSING")
            self.assertEqual(REQUESTS, [])
        finally:
            os.environ["STUDY_INTEGRATION_SECRET"] = "test-secret"


if __name__ == "__main__":
    unittest.main()
