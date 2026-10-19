---
schema_version: 1
type: lesson
id: ai-automation-w07-l03
title: Cost and loop controls
course_id: ai-automation-integration
module_id: AI-AUTO-W07
order: 3
estimated_minutes: 35
---

# Cost and loop controls

## Objective

Understand and apply cost and loop controls in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

An agent that repeats a failed step can rack up cost and cause repeated side effects. Set maximum tool calls, duration and spend per enquiry. Mark a tool call with a stable operation ID so retries cannot duplicate a send or update. Distinguish a tool error from missing evidence, and stop with a visible reason when limits are reached. Keep a compact trace of each decision for debugging without leaking secrets. Compare the agent with a fixed-rule baseline: if it is slower and no more accurate, keep the simpler approach.

**Worked example**

A tool times out after creating a task. The agent retries using the same operation ID; the executor returns the existing task rather than creating another.

**Try it**

Write budgets for one enquiry: maximum calls, runtime, estimated API cost and allowed write actions. Add a stop condition.

**Key point**

Step, time, spend and side-effect limits.

## Key Concepts

- Per-enquiry budget :: Set explicit maximum tool calls, elapsed time, estimated spend and allowed writes so a repeating agent cannot consume unbounded resources.
- Stable operation ID :: Reuse the same operation identifier after a timeout so an executor can return the existing result instead of repeating a completed write.
- Visible stop condition :: Distinguish tool failure from missing evidence and stop with an understandable reason when limits or evidence requirements prevent further action.
- Compact trace :: Keep identifiers, decisions and outcomes sufficient for diagnosis while excluding credentials and unnecessary customer content.
- Rule-based comparator :: Compare accuracy, latency and cost with a fixed workflow and retain the simpler design unless the agent demonstrates a worthwhile improvement.

## Examples

- A tool times out after creating a task. The agent retries using the same operation ID; the executor returns the existing task rather than creating another.

## Takeaways

- Step, time, spend and side-effect limits.

## Sources and Further Reading

- **Start here (free): [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)** — Read **Agents**; **When (and when not) to use agents**. Discusses stopping conditions such as iteration limits and the latency/cost trade-off of agency; use this to justify explicit local budgets. **Apply:** Choose one hard stop and a fixed-rule baseline for the enquiry assistant.
- **Optional reference (free): [Stripe API — Idempotent requests](https://docs.stripe.com/api/idempotent_requests)** — Read **Idempotent requests**. Explains retrying a write with the same key and the provider-specific lifetime and parameter rules; implement the equivalent guarantee in your executor rather than assuming it exists. **Apply:** Describe how a timed-out createTask call returns the original task on retry.

## Flashcards

- Q: What prevents retrying a successful but timed-out side effect twice?
  A: An idempotency or operation ID checked by the executor before another write.

## Revision Questions

- What prevents retrying a successful but timed-out side effect twice?
