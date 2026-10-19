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

- Context-preserving chunk :: Keep related conditions, exceptions and headings together so a retrieved passage can answer the question without losing essential context.
- Embedding similarity :: Map text to a vector for semantic ranking; a nearby vector indicates similarity, not that a passage is true or sufficient evidence.
- Versioned re-indexing :: Associate chunks with a document version and remove or replace obsolete chunks when the source changes.
- Retrieval holdout :: Use questions not used to tune the system to compare chunk size, overlap and ranking against expected evidence.
- Hybrid search :: Combine keyword matching for exact phrases with semantic search for paraphrases when evaluation shows either alone misses useful passages.

## Examples

- A refund exception is split away from its condition; a search returns the exception alone. Keeping the paragraph and heading together fixes this retrieval error.

## Takeaways

- Chunk by meaning; version data; evaluate retrieval.

## Sources and Further Reading

- **Start here (free): [OpenAI — Retrieval: chunking](https://developers.openai.com/api/docs/guides/retrieval)** — Read **Chunking**; **Ranking**. Gives concrete chunk-size, overlap and ranking controls to contrast with your heading-based split; provider defaults are not universally optimal. **Apply:** Compare two chunk boundaries for a refund exception and record which preserves its condition.
- **Optional reference (free): [pgvector — Hybrid search](https://github.com/pgvector/pgvector)** — Read **Hybrid Search**. Shows combining vector search with PostgreSQL full-text search when exact words and semantic matches both matter. **Apply:** Choose one exact refund phrase and one paraphrased question to test against both retrieval methods.

## Flashcards

- Q: Why can the nearest vector still be the wrong evidence?
  A: Semantic closeness is a ranking signal, not a guarantee that the passage answers the specific question.

## Revision Questions

- Why can the nearest vector still be the wrong evidence?
