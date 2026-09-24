---
schema_version: 1
type: lesson
id: ai-automation-w08-l02
title: Build with a vertical slice
course_id: ai-automation-integration
module_id: AI-AUTO-W08
order: 2
estimated_minutes: 35
---

# Build with a vertical slice

## Objective

Understand and apply build with a vertical slice in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A vertical slice proves one request can cross form, API, data store, model adapter and UI. First use a fake model and a fake email sender, then add production integrations individually. Keep record creation and draft generation separate so a model failure does not discard an enquiry. Use database constraints for unique external IDs and status transitions. Test the user-visible flow and the critical invariants, not every line of plumbing. Record the exact steps to run it locally and reset fictional data for a demonstration.

**Worked example**

A new form entry persists immediately. The model times out; the UI shows “needs review” and the original text remains available.

**Try it**

Implement or diagram the smallest end-to-end path and walk through normal, timeout and duplicate submissions.

**Key point**

Persist first; fake integrations; prove one complete path.

## Key Concepts

- Persist first; fake integrations; prove one complete path.

## Examples

- A new form entry persists immediately. The model times out; the UI shows “needs review” and the original text remains available.

## Takeaways

- Persist first; fake integrations; prove one complete path.

## Sources and Further Reading

- [Official documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/)
- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/

## Flashcards

- Q: Why save the enquiry before calling the model?
  A: The original business event is retained even if enrichment fails.

## Revision Questions

- Why save the enquiry before calling the model?
