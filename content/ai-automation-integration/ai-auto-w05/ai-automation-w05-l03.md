---
schema_version: 1
type: lesson
id: ai-automation-w05-l03
title: Postgres and pgvector in context
course_id: ai-automation-integration
module_id: AI-AUTO-W05
order: 3
estimated_minutes: 35
---

# Postgres and pgvector in context

## Objective

Understand and apply postgres and pgvector in context in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

PostgreSQL can hold documents, metadata and application records; pgvector adds vector similarity search if needed. Begin with a table for documents and a table for chunks with document ID, location, text and optional embedding. Filter by tenant and permissions before using retrieved passages in an answer. For a tiny corpus, exact search or ordinary PostgreSQL text search may be sufficient. Approximate indexes trade recall for speed and should be introduced only when measurements justify them. Keep the retrieval query parameterised and cap results and text sent to the model.

**Worked example**

Two shop locations have different repair policies. A signed-in employee searches only the location they are permitted to see, then receives up to four matching chunks.

**Try it**

Draw documents and chunks tables with keys and metadata. State how location permissions and deleted documents affect queries.

**Key point**

Metadata, permission filter, bounded retrieval, measure first.

## Key Concepts

- Metadata, permission filter, bounded retrieval, measure first. :: Uses metadata and permission filters before similarity search, bounds retrieved context, and measures retrieval quality before tuning vector settings.

## Examples

- Two shop locations have different repair policies. A signed-in employee searches only the location they are permitted to see, then receives up to four matching chunks.

## Takeaways

- Metadata, permission filter, bounded retrieval, measure first.

## Sources and Further Reading

- [Official documentation](https://github.com/pgvector/pgvector)
- https://github.com/pgvector/pgvector

## Flashcards

- Q: Should an embedding match override access checks?
  A: No. Apply permissions and tenant boundaries before passages reach the model.

## Revision Questions

- Should an embedding match override access checks?
