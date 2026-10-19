---
schema_version: 1
type: lesson
id: ai-automation-w10-l03
title: Follow-ups and operating metrics
course_id: ai-automation-integration
module_id: AI-AUTO-W10
order: 3
estimated_minutes: 35
---

# Follow-ups and operating metrics

## Objective

Understand and apply follow-ups and operating metrics in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A reminder is a scheduled event tied to a specific customer and action. Store due time, timezone, owner, state and cancellation rule. Make the send operation idempotent and ensure editing or closing an enquiry cancels stale reminders. Measure queue age, missed follow-ups, human review time and user correction rate. Record cost per completed case rather than just model calls. A high automation percentage is not useful if important mistakes are hidden. Build an admin view for overdue items and a runbook for temporary provider outages.

**Worked example**

A customer books a repair before a proposed callback time. The pending callback is cancelled; no awkward automated reminder is sent.

**Try it**

Test due, cancelled, duplicate and failed reminders. Update the project brief with actual measurements from the sample run.

**Key point**

Stateful reminders; cancellation; idempotent sends; real metrics.

## Key Concepts

- Durable reminder :: Store the customer/action link, due time, timezone, owner and state so scheduled work remains understandable across restarts.
- Cancellation rule :: Editing or closing an enquiry must invalidate stale reminders, with a state recheck before sending.
- Idempotent send :: Use a stable operation identifier so duplicate schedule ticks or retries cannot send the same reminder twice.
- Outcome and unit-cost metrics :: Measure queue age, missed follow-ups, review effort, corrections and cost per completed case; a high automated-action count can hide expensive mistakes.
- Exception operations :: Provide an overdue-items view and a provider-outage runbook so owners can see and recover failed follow-ups.

## Examples

- A customer books a repair before a proposed callback time. The pending callback is cancelled; no awkward automated reminder is sent.

## Takeaways

- Stateful reminders; cancellation; idempotent sends; real metrics.

## Sources and Further Reading

- **Start here (free): [n8n — Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)** — Read **Schedule Trigger**; **Custom (Cron) interval**. Explains published scheduled workflows and timezone selection. A trigger only starts a check; your database must still own due/cancelled/sent state. **Apply:** Specify a timezone and the query that selects due reminders without reactivating cancelled ones.
- **Optional reference (free): [Stripe API — Idempotent requests](https://docs.stripe.com/api/idempotent_requests)** — Read **Idempotent requests**. Provides a concrete stable-key retry pattern to apply to reminder writes; check the actual sending provider’s semantics rather than assuming Stripe rules transfer. **Apply:** Choose the operation ID for one reminder and test two attempts against it.
- **Optional reference (free): [GOV.UK — Measuring cost per transaction](https://www.gov.uk/service-manual/measuring-success/measuring-cost-per-transaction)** — Read **How to calculate cost per transaction**; **What to include in your ‘total cost’**. Includes support and operating costs, not just API usage, when measuring a completed service outcome. Government reporting/accounting rules are not a pricing mandate for your pilot. **Apply:** Calculate a sample cost-per-completed-case sheet that includes human review and failed attempts.

## Flashcards

- Q: Why track corrections as well as time saved?
  A: An apparently faster workflow may cost more time or trust when its mistakes are fixed.

## Revision Questions

- Why track corrections as well as time saved?
