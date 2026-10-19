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

In your own notes, outline the operations assistant with an entity list, stable IDs, permitted state transitions and a one-page dashboard wireframe. Identify one source of truth for each status and one complete customer journey. No supplied project file is required.

**Key point**

Entity model; status source; attention-first dashboard.

## Key Concepts

- Entity model :: Represent enquiry, customer, task, draft, approval and event as identifiable objects before designing the dashboard.
- Stable identity and state :: Give records durable IDs, links and explicit states so the same customer journey can be traced across forms, jobs and approvals.
- Single source of truth :: Keep authoritative business status in the shared data model rather than separately updating competing copies in each component.
- Attention-first dashboard :: Surface what needs review, what failed and what is due before charts; start with one complete customer journey and add views only when useful.

## Examples

- An enquiry arrives, creates or links a customer, produces a summary and a proposed task, then appears in the “Needs approval” list.

## Takeaways

- Entity model; status source; attention-first dashboard.

## Sources and Further Reading

- **Start here (free): [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)** — Read **Primary Keys**; **Foreign Keys**. Explains how identifiers and relationships can be enforced in the data model instead of merely implied by dashboard code. **Apply:** Draw customer-to-enquiry and enquiry-to-task keys, including what happens if a referenced record is deleted.
- **Optional reference (free): [React — Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)** — Read **Avoid contradictions in state**; **Avoid duplication in state**. Shows how duplicated or contradictory client state drifts; the same discipline supports a UI that reflects authoritative API status. **Apply:** Represent the selected task by ID and identify which values should be derived instead of copied.

## Flashcards

- Q: What should determine the first dashboard view?
  A: The owner’s immediate decisions and exceptions, not the number of data visualisations possible.

## Revision Questions

- What should determine the first dashboard view?
