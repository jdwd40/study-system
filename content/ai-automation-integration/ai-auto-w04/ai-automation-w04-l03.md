---
schema_version: 1
type: lesson
id: ai-automation-w04-l03
title: Complete the first enquiry pipeline
course_id: ai-automation-integration
module_id: AI-AUTO-W04
order: 3
estimated_minutes: 35
---

# Complete the first enquiry pipeline

## Objective

Understand and apply complete the first enquiry pipeline in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Bring together form input, deterministic validation, AI classification, database persistence, draft creation and notification. Start with mock records and a fake model. Add the real model only after the workflow succeeds on normal and error examples. Time the process before and after, including the owner’s review time. Document what remains manual and where duplicate events are stopped. If the cost or error rate outweighs the benefit, simplify the design; a useful pilot can be a classifier and draft helper without autonomous sending.

**Worked example**

Ten fictional requests pass through. Eight need no category correction; two are flagged for review. The owner sees one pending item per request.

**Try it**

Run ten sample enquiries, repeat one event and simulate one failed external call. Save screenshots or logs proving the three outcomes.

**Key point**

Working pipeline + failure evidence + before/after measure.

## Key Concepts

- Working pipeline + failure evidence + before/after measure. :: A useful first pipeline is complete end to end, demonstrates normal and failure paths, and compares results with a measured baseline.

## Examples

- Ten fictional requests pass through. Eight need no category correction; two are flagged for review. The owner sees one pending item per request.

## Takeaways

- Working pipeline + failure evidence + before/after measure.

## Sources and Further Reading

- [Official documentation](https://docs.n8n.io/)
- https://docs.n8n.io/

## Flashcards

- Q: What evidence proves this week’s workflow is useful?
  A: Repeatable test cases, no duplicate effects, visible failures and a measured improvement against baseline.

## Revision Questions

- What evidence proves this week’s workflow is useful?
