import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Db = Database.Database;

export function openDb(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

export function migrate(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_state (
      lesson_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','unfinished','complete')),
      user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
      hermes_rating INTEGER CHECK (hermes_rating BETWEEN 1 AND 5),
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','switched')),
      started_at TEXT NOT NULL,
      ended_at TEXT
    );
    CREATE TABLE IF NOT EXISTS qa_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id TEXT NOT NULL,
      attempt_id INTEGER REFERENCES attempts(id),
      question TEXT NOT NULL,
      user_answer TEXT,
      hermes_feedback TEXT,
      result TEXT CHECK (result IN ('correct','partial','incorrect')),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS flashcard_state (
      card_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      ease REAL NOT NULL,
      interval_days INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      lapses INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      last_reviewed_at TEXT,
      PRIMARY KEY (card_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS habit_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id TEXT NOT NULL,
      habit_entry_id TEXT NOT NULL UNIQUE,
      entry_date TEXT NOT NULL,
      minutes INTEGER NOT NULL CHECK (minutes > 0),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('ok','error')),
      message TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
