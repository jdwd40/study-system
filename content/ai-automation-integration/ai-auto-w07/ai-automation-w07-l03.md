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

- Step, time, spend and side-effect limits.

## Examples

- A tool times out after creating a task. The agent retries using the same operation ID; the executor returns the existing task rather than creating another.

## Takeaways

- Step, time, spend and side-effect limits.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/guides/function-calling)
- https://platform.openai.com/docs/guides/function-calling

## Flashcards

- Q: What prevents retrying a successful but timed-out side effect twice?
  A: An idempotency or operation ID checked by the executor before another write.

## Revision Questions

- What prevents retrying a successful but timed-out side effect twice?
