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

- Stateful reminders; cancellation; idempotent sends; real metrics. :: Reminders need durable state, cancellation, and idempotent sending; measure corrections, failures, response time, and outcomes rather than volume alone.

## Examples

- A customer books a repair before a proposed callback time. The pending callback is cancelled; no awkward automated reminder is sent.

## Takeaways

- Stateful reminders; cancellation; idempotent sends; real metrics.

## Sources and Further Reading

- [Official documentation](https://react.dev/learn)
- https://react.dev/learn

## Flashcards

- Q: Why track corrections as well as time saved?
  A: An apparently faster workflow may cost more time or trust when its mistakes are fixed.

## Revision Questions

- Why track corrections as well as time saved?
