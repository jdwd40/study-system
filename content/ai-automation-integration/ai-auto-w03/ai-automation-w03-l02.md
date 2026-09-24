---
schema_version: 1
type: lesson
id: ai-automation-w03-l02
title: Webhooks, signatures and duplicates
course_id: ai-automation-integration
module_id: AI-AUTO-W03
order: 2
estimated_minutes: 35
---

# Webhooks, signatures and duplicates

## Objective

Understand and apply webhooks, signatures and duplicates in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A webhook is an incoming event, not a guarantee of exactly-once processing. Verify the provider signature according to its documentation, often against the raw request body; reject old or invalid events. Store a unique event ID and process each accepted ID only once. Acknowledge quickly, then do slow work in a background job. Replays and out-of-order events are normal. Write the transition so a delayed “created” event cannot undo a later “closed” state. Test the system by delivering the same event twice and by changing the delivery order.

**Worked example**

An enquiry platform retries event evt-42 after a network timeout. The second delivery finds the event ID already recorded; no second follow-up is created.

**Try it**

Draw the receive → verify → deduplicate → enqueue → acknowledge path. Describe what happens on a bad signature and on a duplicate.

**Key point**

Verify raw event; dedupe ID; queue slow work.

## Key Concepts

- Verify raw event; dedupe ID; queue slow work.

## Examples

- An enquiry platform retries event evt-42 after a network timeout. The second delivery finds the event ID already recorded; no second follow-up is created.

## Takeaways

- Verify raw event; dedupe ID; queue slow work.

## Sources and Further Reading

- [Official documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

## Flashcards

- Q: What does a successful webhook acknowledgement prove?
  A: It proves receipt/acceptance as defined by the endpoint, not necessarily completion of downstream work.

## Revision Questions

- What does a successful webhook acknowledgement prove?
