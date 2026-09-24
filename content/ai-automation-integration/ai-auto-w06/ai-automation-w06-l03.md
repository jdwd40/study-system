---
schema_version: 1
type: lesson
id: ai-automation-w06-l03
title: Business data, permissions and retention
course_id: ai-automation-integration
module_id: AI-AUTO-W06
order: 3
estimated_minutes: 35
---

# Business data, permissions and retention

## Objective

Understand and apply business data, permissions and retention in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Treat customer data and internal documents as information with owners, permissions and retention rules. Use fictional or consented sample data during study. Before sending real client content to any model provider, agree what may be processed, review provider terms and data handling, and apply the organisation’s privacy requirements. Collect only fields needed for the workflow; avoid logging full messages when IDs and error classes suffice. Document deletion and re-indexing so removed policies no longer appear in answers. For UK client work, read current ICO guidance and seek appropriate advice for the actual business.

**Worked example**

An employee leaves. Their access is revoked in the app and document retrieval immediately respects it; the answer cache must also be considered.

**Try it**

Make a data inventory: source, purpose, who can read it, external processors, retention and deletion path.

**Key point**

Purpose, least data, permissions, retention, deletion.

## Key Concepts

- Purpose, least data, permissions, retention, deletion. :: Collects only data needed for the stated purpose, enforces access and deletion rules, and retains it only while justified.

## Examples

- An employee leaves. Their access is revoked in the app and document retrieval immediately respects it; the answer cache must also be considered.

## Takeaways

- Purpose, least data, permissions, retention, deletion.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/guides/evals)
- https://platform.openai.com/docs/guides/evals

## Flashcards

- Q: What should happen when a source document is deleted?
  A: Its chunks and search representation should be removed or invalidated so it cannot keep appearing in answers.

## Revision Questions

- What should happen when a source document is deleted?
