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

- Webhook authenticity :: Verify the provider’s signature against the required original payload and timestamp rules; a familiar-looking event body is not proof of origin.
- Durable deduplication :: Record a stable event ID with concurrency-safe uniqueness and make processing repeatable so retried deliveries do not repeat business effects.
- Acknowledgement boundary :: Durably accept or enqueue verified work before acknowledging quickly; a success response need not mean downstream work has finished.
- Out-of-order delivery :: Validate state transitions when delayed events arrive so an older created event cannot overwrite a later closed state.

## Examples

- An enquiry platform retries event evt-42 after a network timeout. The second delivery finds the event ID already recorded; no second follow-up is created.

## Takeaways

- Verify raw event; dedupe ID; queue slow work.

## Sources and Further Reading

- **Start here (free): [Stripe — Receive events in your webhook endpoint](https://docs.stripe.com/webhooks)** — Read **Verify the signature**; **Preventing replay attacks**; **Handle duplicate events**; **Event ordering**. Provides concrete signed-payload, replay and delivery semantics; adapt the pattern to your actual provider’s signature rules. **Apply:** Trace one valid, one tampered and one repeated event through verify, record, enqueue and acknowledge.
- **Optional reference (free): [Stripe API — Idempotent requests](https://docs.stripe.com/api/idempotent_requests)** — Read **Idempotent requests**. Explains stable request keys for repeated writes; outbound request idempotency complements rather than replaces inbound event deduplication. **Apply:** Choose a separate stable operation key for the follow-up created from evt-42.

## Flashcards

- Q: What does a successful webhook acknowledgement prove?
  A: It proves receipt/acceptance as defined by the endpoint, not necessarily completion of downstream work.

## Revision Questions

- What does a successful webhook acknowledgement prove?
