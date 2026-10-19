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

- End-to-end pipeline :: Prove that input, validation, classification, persistence, drafting and notification work together rather than counting isolated successful nodes.
- Fake-to-real integration :: Start with mock records and a fake model, then add the paid dependency after normal and error cases are repeatable.
- Failure and duplicate evidence :: Demonstrate one repeated event and one failed external call, checking that state remains visible and business effects are not duplicated.
- Net pilot benefit :: Compare before-and-after handling time including owner review, errors and running costs; simplify the workflow if the benefit is not demonstrated.

## Examples

- Ten fictional requests pass through. Eight need no category correction; two are flagged for review. The owner sees one pending item per request.

## Takeaways

- Working pipeline + failure evidence + before/after measure.

## Sources and Further Reading

- **Start here (free): [n8n — Handle errors gracefully](https://docs.n8n.io/flow-logic/error-handling/)** — Read **How do I make a workflow fail on purpose with the Stop and Error node?**. Provides a deliberate failure mechanism to test the pipeline’s error route rather than relying on an accidental outage. **Apply:** Inject one controlled failure and record the pending enquiry and visible alert.
- **Optional reference (free): [GOV.UK — Measuring the success of your service](https://www.gov.uk/service-manual/measuring-success/measuring-the-success-of-your-service)** — Read **Measuring an end-to-end journey or non-transactional website**. Shows how task completion and elapsed time can be compared across repeated whole journeys. **Apply:** Time the same sample enquiries manually and through the pipeline, including approval time.

## Flashcards

- Q: What evidence proves this week’s workflow is useful?
  A: Repeatable test cases, no duplicate effects, visible failures and a measured improvement against baseline.

## Revision Questions

- What evidence proves this week’s workflow is useful?
