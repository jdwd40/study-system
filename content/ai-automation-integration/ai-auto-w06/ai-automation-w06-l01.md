---
schema_version: 1
type: lesson
id: ai-automation-w06-l01
title: Cited answers and abstention
course_id: ai-automation-integration
module_id: AI-AUTO-W06
order: 1
estimated_minutes: 35
---

# Cited answers and abstention

## Objective

Understand and apply cited answers and abstention in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A grounded answer should distinguish source facts from interpretation. Require a source ID for each material claim and show a readable title and section to the user. Check that cited passages actually contain the claimed fact; a plausible citation may still be wrong. When documents disagree, report the conflict and the versions rather than silently choosing. When no passage supports the answer, say so and route the question to a person. Avoid a universal “confidence percentage” unless you have calibrated it against labelled data. Retrieval quality and answer faithfulness are separate measurements.

**Worked example**

The older policy says 14 days; the current policy says 30 days. A correct answer cites the current policy and notes the older version if it was retrieved.

**Try it**

Write expected answers for five policy questions: clear, unsupported, conflicting, outdated and multi-part. Specify their citations.

**Key point**

Citations must support claims; abstain when evidence is absent.

## Key Concepts

- Citations must support claims; abstain when evidence is absent.

## Examples

- The older policy says 14 days; the current policy says 30 days. A correct answer cites the current policy and notes the older version if it was retrieved.

## Takeaways

- Citations must support claims; abstain when evidence is absent.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/guides/evals)
- https://platform.openai.com/docs/guides/evals

## Flashcards

- Q: What should the assistant do when no retrieved passage supports an answer?
  A: Abstain or ask for human review instead of inventing a policy.

## Revision Questions

- What should the assistant do when no retrieved passage supports an answer?
