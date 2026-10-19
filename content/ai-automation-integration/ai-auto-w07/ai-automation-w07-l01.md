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

**Understand**

Use a fixed workflow when the steps are known. Let a model choose among narrow tools only where the decision genuinely varies. Bound the number of steps, tool set, data visibility, time and cost. Give every state transition an owner: waiting, proposed, approved, applied, failed and cancelled. The agent may draft an action plan, but a separate executor validates and performs it. A human approval gate is a product feature when an action could contact a person, change a record or spend money. A good agent can say “I cannot determine this from the evidence.”

**Worked example**

The lead assistant can choose “ask for missing postcode” or “suggest a callback,” but it cannot delete a lead or send an email without explicit approval.

**Try it**

Design a state chart with six states and three allowed tools for the shop. Mark every operation needing approval.

**Key point**

Bounded tool set; explicit states; separate proposal and execution.

## Key Concepts

- Workflow versus agent :: Use fixed code paths when steps are known; use model-selected tools only where the next action genuinely needs flexible judgement.
- Bounded agency :: Limit available tools, visible data, steps, runtime and cost rather than granting an open-ended mandate to complete the task.
- Explicit state machine :: Represent waiting, proposed, approved, applied, failed and cancelled states with allowed transitions and a responsible owner.
- Proposal/executor separation :: Let the model suggest a plan while a separate executor validates permissions and applies approved actions; consequential operations retain a human gate.

## Examples

- The lead assistant can choose “ask for missing postcode” or “suggest a callback,” but it cannot delete a lead or send an email without explicit approval.

## Takeaways

- Bounded tool set; explicit states; separate proposal and execution.

## Sources and Further Reading

- **Start here (free): [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)** — Read **What are agents?**; **When (and when not) to use agents**; **Agents**. Distinguishes predefined workflows from model-directed processes and explains why simpler solutions and stopping conditions are often preferable. **Apply:** Decide which shop decisions genuinely need model choice and which should remain rules.
- **Optional reference (free): [OpenAI — Function calling](https://developers.openai.com/api/docs/guides/function-calling)** — Read **The tool calling flow**; **Tool choice**. Shows the concrete model-to-application tool boundary and controls over the tools offered to the model. Tool choice is not an authorisation system. **Apply:** Allow only three narrow tools and draw where proposed actions become validated execution.

## Flashcards

- Q: When is a deterministic workflow preferable?
  A: When the steps and conditions are known and can be implemented and tested as rules.

## Revision Questions

- When is a deterministic workflow preferable?
