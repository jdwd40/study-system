---
schema_version: 1
type: lesson
id: ai-automation-w07-l01
title: Workflow versus agent
course_id: ai-automation-integration
module_id: AI-AUTO-W07
order: 1
estimated_minutes: 35
---

# Workflow versus agent

## Objective

Understand and apply workflow versus agent in a reliable AI automation and systems-integration workflow.

## Content

## Understand

Use a fixed workflow when the steps are known. Let a model choose among narrow tools only where the decision genuinely varies. Bound the number of steps, tool set, data visibility, time and cost. Give every state transition an owner: waiting, proposed, approved, applied, failed and cancelled. The agent may draft an action plan, but a separate executor validates and performs it. A human approval gate is a product feature when an action could contact a person, change a record or spend money. A good agent can say “I cannot determine this from the evidence.”

## Worked example

The lead assistant can choose “ask for missing postcode” or “suggest a callback,” but it cannot delete a lead or send an email without explicit approval.

## Try it

Design a state chart with six states and three allowed tools for the shop. Mark every operation needing approval.

## Key point

Bounded tool set; explicit states; separate proposal and execution.

## Key Concepts

- Bounded tool set; explicit states; separate proposal and execution.

## Examples

- The lead assistant can choose “ask for missing postcode” or “suggest a callback,” but it cannot delete a lead or send an email without explicit approval.

## Takeaways

- Bounded tool set; explicit states; separate proposal and execution.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/guides/function-calling)
- https://platform.openai.com/docs/guides/function-calling

## Flashcards

- Q: When is a deterministic workflow preferable?
  A: > When the steps and conditions are known and can be implemented and tested as rules.

## Revision Questions

- When is a deterministic workflow preferable?
