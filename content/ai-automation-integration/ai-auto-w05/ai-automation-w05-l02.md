---
schema_version: 1
type: lesson
id: ai-automation-w05-l02
title: Chunking and embeddings
course_id: ai-automation-integration
module_id: AI-AUTO-W05
order: 2
estimated_minutes: 35
---

# Chunking and embeddings

## Objective

Understand and apply chunking and embeddings in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A chunk should preserve enough context to answer a question without dragging in unrelated sections. Split at headings and paragraphs before arbitrary character limits; keep headings with their text. Track document version and delete or replace old chunks during re-indexing. An embedding maps text into a vector; similarity search finds close vectors, but similarity does not establish truth. Use a small holdout set of questions to compare chunk size, overlap and ranking. If a short exact phrase matters, combine keyword search with semantic search.

**Worked example**

A refund exception is split away from its condition; a search returns the exception alone. Keeping the paragraph and heading together fixes this retrieval error.

**Try it**

Chunk the provided refund policy twice: by fixed length and by heading. Compare which method preserves the exception and its condition.

**Key point**

Chunk by meaning; version data; evaluate retrieval.

## Key Concepts

- Chunk by meaning; version data; evaluate retrieval.

## Examples

- A refund exception is split away from its condition; a search returns the exception alone. Keeping the paragraph and heading together fixes this retrieval error.

## Takeaways

- Chunk by meaning; version data; evaluate retrieval.

## Sources and Further Reading

- [Official documentation](https://github.com/pgvector/pgvector)
- https://github.com/pgvector/pgvector

## Flashcards

- Q: Why can the nearest vector still be the wrong evidence?
  A: Show answer Semantic closeness is a ranking signal, not a guarantee that the passage answers the specific question.

## Revision Questions

- Why can the nearest vector still be the wrong evidence?
