import { describe, expect, it } from 'vitest';
import {
  ContentError,
  parseCourse,
  parseLesson,
  parseModule,
  serializeLesson,
} from '../src/shared/content.js';
import { isSafeRelativePath } from '../src/shared/slug.js';

const VALID_LESSON = `---
schema_version: 1
type: lesson
id: sse-101-architecture-vs-implementation
title: Architecture versus Implementation
course_id: sse
module_id: SSE-101
order: 1
estimated_minutes: 45
---

# Architecture versus Implementation

## Objective

Distinguish architecture from implementation detail.

## Content

Architecture is the set of important decisions about a system's structure.

## Key Concepts

- Software architecture
- Requirements

## Examples

- A monolith split into modules

## Takeaways

- Architecture is about important decisions

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document

## Flashcards

- Q: What is software architecture?
  A: The important structural decisions of a system.
- Q: What is implementation detail?
  A: Decisions that can change without affecting system structure.

## Revision Questions

- How does architecture differ from implementation?
`;

describe('parseLesson', () => {
  it('parses a valid lesson with all sections', () => {
    const doc = parseLesson(VALID_LESSON);
    expect(doc.id).toBe('sse-101-architecture-vs-implementation');
    expect(doc.courseId).toBe('sse');
    expect(doc.moduleId).toBe('SSE-101');
    expect(doc.order).toBe(1);
    expect(doc.flashcards).toHaveLength(2);
    expect(doc.flashcards[0]).toEqual({
      q: 'What is software architecture?',
      a: 'The important structural decisions of a system.',
    });
    expect(doc.revisionQuestions).toEqual(['How does architecture differ from implementation?']);
    expect(doc.keyConcepts).toContain('Software architecture');
  });

  it('rejects private/runtime front matter fields', () => {
    const raw = VALID_LESSON.replace('order: 1', 'order: 1\nuser_rating: 4\nprogress_percent: 50');
    expect(() => parseLesson(raw)).toThrow(ContentError);
    try {
      parseLesson(raw);
      expect.unreachable();
    } catch (err) {
      const issues = (err as ContentError).issues;
      expect(issues.some((i) => i.message.includes('user_rating'))).toBe(true);
      expect(issues.some((i) => i.message.includes('progress_percent'))).toBe(true);
    }
  });

  it('rejects missing required sections', () => {
    const raw = VALID_LESSON.replace(/## Flashcards[\s\S]*?(?=## Revision Questions)/, '');
    try {
      parseLesson(raw);
      expect.unreachable();
    } catch (err) {
      expect((err as ContentError).issues.some((i) => i.message.includes('Flashcards'))).toBe(true);
    }
  });

  it('rejects wrong schema_version', () => {
    const raw = VALID_LESSON.replace('schema_version: 1', 'schema_version: 99');
    expect(() => parseLesson(raw)).toThrow(/schema_version/);
  });

  it('rejects invalid slug ids', () => {
    const raw = VALID_LESSON.replace('id: sse-101-architecture-vs-implementation', 'id: ../escape');
    expect(() => parseLesson(raw)).toThrow(/slug/);
  });

  it('rejects H1 that does not match title', () => {
    const raw = VALID_LESSON.replace('# Architecture versus Implementation', '# Something Else');
    expect(() => parseLesson(raw)).toThrow(/H1/);
  });

  it('rejects flashcard questions without answers', () => {
    const raw = VALID_LESSON.replace('  A: Decisions that can change without affecting system structure.\n', '');
    try {
      parseLesson(raw);
      expect.unreachable();
    } catch (err) {
      expect((err as ContentError).issues.some((i) => i.message.includes('missing its indented'))).toBe(true);
    }
  });
});

describe('serialisation round-trip', () => {
  it('serializeLesson output re-parses to the same document', () => {
    const doc = parseLesson(VALID_LESSON);
    const reparsed = parseLesson(serializeLesson(doc));
    expect(reparsed).toEqual(doc);
  });
});

describe('parseModule', () => {
  const VALID_MODULE = `---
schema_version: 1
type: module
id: SSE-101
title: Software Architecture Foundations
course_id: sse
order: 1
status: active
summary: Reason about architecture, constraints and trade-offs.
objectives:
  - Explain architecture as structure and decisions
  - Distinguish architecture from implementation
---

# SSE-101 — Software Architecture Foundations
`;
  it('parses a valid module', () => {
    const doc = parseModule(VALID_MODULE);
    expect(doc.id).toBe('SSE-101');
    expect(doc.objectives).toHaveLength(2);
    expect(doc.status).toBe('active');
  });

  it('rejects private fields on modules', () => {
    const raw = VALID_MODULE.replace('status: active', 'status: active\nmastery: STRONG\nprogress_percent: 20');
    expect(() => parseModule(raw)).toThrow(ContentError);
  });

  it('rejects invalid status', () => {
    const raw = VALID_MODULE.replace('status: active', 'status: whatever');
    expect(() => parseModule(raw)).toThrow(/status/);
  });
});

describe('parseCourse', () => {
  const VALID_COURSE = `---
schema_version: 1
type: course
id: sse
title: Software Systems Engineering
description: Engineering complete modern software systems.
status: active
---

# Software Systems Engineering
`;
  it('parses a valid course', () => {
    expect(parseCourse(VALID_COURSE).id).toBe('sse');
  });

  it('rejects tracking fields on courses', () => {
    const raw = VALID_COURSE.replace('status: active', 'status: active\ncurrent_lesson: foo\nupdated: 2026-09-12');
    expect(() => parseCourse(raw)).toThrow(ContentError);
  });
});

describe('path safety', () => {
  it('rejects traversal segments', () => {
    expect(isSafeRelativePath('../secret')).toBe(false);
    expect(isSafeRelativePath('sse/../../etc/passwd')).toBe(false);
    expect(isSafeRelativePath('sse/sse-101/lesson.md')).toBe(true);
  });
});
