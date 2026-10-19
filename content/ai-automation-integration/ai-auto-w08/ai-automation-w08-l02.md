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

- Vertical slice :: Prove one request crosses the form, API, persistent store, model adapter and review UI before polishing separate components.
- Fake integration :: Use deterministic fake model and email implementations first, then introduce real external services individually so failures stay attributable.
- Persist-before-enrichment :: Save the original enquiry independently from model output so a timeout leaves a recoverable record marked for review.
- Database invariant :: Use uniqueness and allowed-state checks as appropriate, while enforcing legal state transitions in application or transaction logic; a simple field constraint alone cannot validate transition history.
- Reproducible user-flow test :: Test normal, timeout and duplicate submissions through visible behaviour and document local start/reset steps using fictional data.

## Examples

- A new form entry persists immediately. The model times out; the UI shows “needs review” and the original text remains available.

## Takeaways

- Persist first; fake integrations; prove one complete path.

## Sources and Further Reading

- **Start here (free): [Playwright — Best Practices](https://playwright.dev/docs/best-practices)** — Read **Test user-visible behavior**; **Avoid testing third-party dependencies**; **Testing with a database**. Shows how to test the owner-visible journey with controlled data and stubbed external services rather than depending on live providers. **Apply:** Define assertions that the original message survives a model timeout and a repeated event creates only one record.
- **Optional reference (free): [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)** — Read **Unique Constraints**; **Check Constraints**. Explains database-enforced row invariants and limits of CHECK expressions. Transition checks still need suitable transaction/application logic. **Apply:** Choose a unique external-event key and a valid-status constraint for the lead table.

## Flashcards

- Q: Why save the enquiry before calling the model?
  A: The original business event is retained even if enrichment fails.

## Revision Questions

- Why save the enquiry before calling the model?
