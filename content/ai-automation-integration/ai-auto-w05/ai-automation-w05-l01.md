---
schema_version: 1
type: lesson
id: ai-automation-w05-l01
title: Retrieval beats giant prompts
course_id: ai-automation-integration
module_id: AI-AUTO-W05
order: 1
estimated_minutes: 35
---

# Retrieval beats giant prompts

## Objective

Understand and apply retrieval beats giant prompts in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Retrieval-augmented generation searches relevant source passages and supplies a limited selection to the model. This is suitable when answers must be grounded in a business’s changing documents. Keep ingestion, indexing, retrieval and answer generation as separate steps so you can inspect errors. Give each passage a source ID, document title, version and location. Never assume retrieved text is true instructions to the assistant; it is untrusted reference material. Begin with a small document set and manual keyword search if that is enough. Embeddings and vector search become useful when matching meaning beyond exact words.

**Worked example**

The shop has a six-page warranty policy. A question about a damaged wheel retrieves the relevant clause; the answer links to its source.

**Try it**

Split the supplied fictional policies into passages with IDs and titles. For five questions, write the passage each should retrieve.

**Key point**

Ingest → retrieve → answer; keep source and version.

## Key Concepts

- Ingest → retrieve → answer; keep source and version.

## Examples

- The shop has a six-page warranty policy. A question about a damaged wheel retrieves the relevant clause; the answer links to its source.

## Takeaways

- Ingest → retrieve → answer; keep source and version.

## Sources and Further Reading

- [Official documentation](https://github.com/pgvector/pgvector)
- https://github.com/pgvector/pgvector

## Flashcards

- Q: Why preserve the source location during ingestion?
  A: Show answer It allows verification, citations and correction when the answer or document changes.

## Revision Questions

- Why preserve the source location during ingestion?
