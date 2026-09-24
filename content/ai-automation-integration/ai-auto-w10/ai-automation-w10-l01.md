---
schema_version: 1
type: lesson
id: ai-automation-w10-l01
title: Design the operations workflow
course_id: ai-automation-integration
module_id: AI-AUTO-W10
order: 1
estimated_minutes: 35
---

# Design the operations workflow

## Objective

Understand and apply design the operations workflow in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Project 2 adds a task list, follow-up schedule and dashboard to the intake path. Write the data model before the UI: enquiry, customer, task, draft, approval and event. Give each object a stable identifier and state. The dashboard answers owner questions: what needs attention, what failed, what is due and what has been completed. Use one shared source of truth rather than duplicating status in every component. Build a vertical slice for a single customer journey and only then add charts or filters. Pick a fictional small business with a simple repeatable workflow.

**Worked example**

An enquiry arrives, creates or links a customer, produces a summary and a proposed task, then appears in the “Needs approval” list.

**Try it**

Complete projects/02-operations-assistant.md with an entity list, state transitions and one-page dashboard wireframe.

**Key point**

Entity model; status source; attention-first dashboard.

## Key Concepts

- Entity model; status source; attention-first dashboard.

## Examples

- An enquiry arrives, creates or links a customer, produces a summary and a proposed task, then appears in the “Needs approval” list.

## Takeaways

- Entity model; status source; attention-first dashboard.

## Sources and Further Reading

- [Official documentation](https://react.dev/learn)
- https://react.dev/learn

## Flashcards

- Q: What should determine the first dashboard view?
  A: Show answer The owner’s immediate decisions and exceptions, not the number of data visualisations possible.

## Revision Questions

- What should determine the first dashboard view?
