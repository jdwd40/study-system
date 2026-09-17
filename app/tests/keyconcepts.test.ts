/**
 * Key Concepts with optional inline explanations.
 *
 * Canonical Markdown format (backward compatible):
 *   - Plain term                     -> { term }
 *   - Term :: short explanation      -> { term, explanation }
 * Plain legacy bullets keep working unchanged; the UI shows a graceful
 * fallback for concepts without an explanation.
 */
import { describe, expect, it } from 'vitest';
import {
  normalizeKeyConcepts,
  parseConceptLine,
  parseLesson,
  serializeLesson,
} from '../src/shared/content.js';
import type { LessonDoc } from '../src/shared/types.js';

const LESSON = `---
schema_version: 1
type: lesson
id: sse-101-architecture-vs-implementation
title: Architecture versus Implementation
course_id: sse
module_id: SSE-101
order: 1
---

# Architecture versus Implementation

## Objective

Distinguish architecture from implementation detail.

## Content

Architecture is the set of important decisions about a system's structure.

## Key Concepts

- Software architecture :: Decisions that are expensive to change: structure, boundaries and constraints.
- Implementation detail

## Examples

- A monolith split into modules

## Takeaways

- Architecture is about important decisions

## Sources and Further Reading

- Personal Curriculum

## Flashcards

- Q: What is software architecture?
  A: The important structural decisions of a system.

## Revision Questions

- How does architecture differ from implementation?
`;

describe('parseConceptLine', () => {
  it('parses "Term :: explanation" into term and explanation', () => {
    expect(parseConceptLine('Software architecture :: Expensive-to-change decisions.')).toEqual({
      term: 'Software architecture',
      explanation: 'Expensive-to-change decisions.',
    });
  });

  it('parses a plain legacy term with no explanation', () => {
    expect(parseConceptLine('Requirements')).toEqual({ term: 'Requirements' });
  });

  it('splits only on the first " :: " so explanations may contain colons', () => {
    const parsed = parseConceptLine('Cache :: A fast store: keeps hot data close.');
    expect(parsed.term).toBe('Cache');
    expect(parsed.explanation).toBe('A fast store: keeps hot data close.');
  });

  it('treats a trailing separator with empty text as no explanation', () => {
    expect(parseConceptLine('Requirements ::')).toEqual({ term: 'Requirements' });
  });

  it('trims surrounding whitespace', () => {
    expect(parseConceptLine('  Constraints  ::  Limits that shape design.  ')).toEqual({
      term: 'Constraints',
      explanation: 'Limits that shape design.',
    });
  });
});

describe('parseLesson key concepts', () => {
  it('parses concepts with and without explanations', () => {
    const doc = parseLesson(LESSON);
    expect(doc.keyConcepts).toEqual([
      {
        term: 'Software architecture',
        explanation: 'Decisions that are expensive to change: structure, boundaries and constraints.',
      },
      { term: 'Implementation detail' },
    ]);
  });
});

describe('key concept serialisation round-trip', () => {
  it('serializeLesson output re-parses to identical concepts', () => {
    const doc = parseLesson(LESSON);
    const reparsed = parseLesson(serializeLesson(doc));
    expect(reparsed.keyConcepts).toEqual(doc.keyConcepts);
  });

  it('writes the "Term :: explanation" form only when an explanation exists', () => {
    const doc = parseLesson(LESSON);
    const out = serializeLesson(doc);
    const section = out.split('## Key Concepts')[1]!.split('## Examples')[0]!;
    expect(section).toContain(
      '- Software architecture :: Decisions that are expensive to change: structure, boundaries and constraints.',
    );
    expect(section).toContain('- Implementation detail\n');
    expect(section).not.toContain('- Implementation detail ::');
  });
});

describe('normalizeKeyConcepts', () => {
  it('accepts legacy string arrays (API backward compatibility)', () => {
    expect(normalizeKeyConcepts(['Coupling', 'Cohesion :: How related a module\'s parts are.'])).toEqual([
      { term: 'Coupling' },
      { term: 'Cohesion', explanation: "How related a module's parts are." },
    ]);
  });

  it('accepts structured concept objects', () => {
    expect(
      normalizeKeyConcepts([
        { term: 'Coupling', explanation: 'Interdependence between modules.' },
        { term: 'Cohesion' },
      ]),
    ).toEqual([
      { term: 'Coupling', explanation: 'Interdependence between modules.' },
      { term: 'Cohesion' },
    ]);
  });

  it('drops entries without a usable term and non-array input', () => {
    expect(normalizeKeyConcepts([{ explanation: 'orphan' }, 42, null, 'Valid'])).toEqual([{ term: 'Valid' }]);
    expect(normalizeKeyConcepts(undefined)).toEqual([]);
    expect(normalizeKeyConcepts('not an array')).toEqual([]);
  });

  it('drops empty explanations on structured objects', () => {
    expect(normalizeKeyConcepts([{ term: 'Coupling', explanation: '   ' }])).toEqual([{ term: 'Coupling' }]);
  });
});

describe('LessonDoc shape', () => {
  it('keyConcepts entries expose term and optional explanation', () => {
    const doc: LessonDoc = parseLesson(LESSON);
    const terms: string[] = doc.keyConcepts.map((k) => k.term);
    expect(terms).toContain('Implementation detail');
  });
});
