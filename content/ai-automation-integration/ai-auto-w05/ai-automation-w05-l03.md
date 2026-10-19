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

- Document/chunk data model :: Keep documents and their chunks linked by stable identifiers, storing text, location, version metadata and an optional embedding.
- Permission-constrained retrieval :: Enforce tenant and user access before passages enter model context; a semantic match must never grant access to another location’s documents.
- Exact versus approximate search :: Use exact or ordinary text search for a small corpus first; approximate vector indexes can improve speed while reducing recall.
- Filtering and recall :: Apply an authorised SQL predicate, but do not assume the index physically filters before similarity scanning; approximate pgvector scans can return fewer eligible results and need measurement.
- Bounded query :: Parameterise retrieval inputs and cap the number and length of returned passages to control injection risk, latency and context cost.

## Examples

- Two shop locations have different repair policies. A signed-in employee searches only the location they are permitted to see, then receives up to four matching chunks.

## Takeaways

- Metadata, permission filter, bounded retrieval, measure first.

## Sources and Further Reading

- **Start here (free): [pgvector — Indexing, filtering and multitenancy](https://github.com/pgvector/pgvector)** — Read **Indexing**; **Filtering**; **Multitenancy**. Documents exact-search defaults, approximate-index trade-offs and the important fact that approximate-index filtering occurs after the index scan. **Apply:** Sketch an authorised location filter and explain why fewer than four eligible chunks might be returned.
- **Optional reference (free): [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)** — Read **Row Security Policies**. Explains row-level access policies, default-deny behaviour when enabled without policies, and owner bypass caveats. **Apply:** Describe a cross-location denial test and which non-owner database role should run it.

## Flashcards

- Q: Should an embedding match override access checks?
  A: No. Apply permissions and tenant boundaries before passages reach the model.

## Revision Questions

- Should an embedding match override access checks?
