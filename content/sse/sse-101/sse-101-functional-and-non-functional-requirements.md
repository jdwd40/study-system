---
schema_version: 1
type: lesson
id: sse-101-functional-and-non-functional-requirements
title: Functional and Non-Functional Requirements
course_id: sse
module_id: SSE-101
order: 2
estimated_minutes: 40
---

# Functional and Non-Functional Requirements

## Objective

Capture requirements precisely enough that architecture can be reasoned about.

## Content

A functional requirement describes behaviour: "the user can reset their password". A non-functional requirement describes a quality the behaviour must have: "password reset completes within two seconds under normal load".

Vague qualities are not requirements. "Fast" is not testable; "p95 read latency under 300 ms at 100 rps" is. Architecture work begins by making qualities explicit and measurable, because every boundary and technology choice trades one quality against another.

## Key Concepts

- Functional requirement :: Describes behaviour: "the user can reset their password".
- Non-functional requirement :: Describes a quality the behaviour must have: "password reset completes within two seconds under normal load".
- Measurability :: A quality only guides design when it is testable — "p95 read latency under 300 ms at 100 rps", not "fast".
- Quality trade-offs :: Every boundary and technology choice trades one quality against another.

## Examples

- "The system must be reliable" → "99.9% monthly availability, recovery within 15 minutes"
- "Secure" → "all API mutation requires an authenticated session; secrets never logged"

## Takeaways

- Qualities must be measurable to guide design
- Every architectural choice trades qualities against each other

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (Software Systems Engineering)
- Bass, Clements, Kazman, Software Architecture in Practice

## Flashcards

- Q: Turn "the site must be fast" into a requirement.
  A: A measurable target, e.g. p95 page load under 2 s at expected peak load.
- Q: Who decides which qualities matter most?
  A: The stakeholders' priorities, made explicit before design.

## Revision Questions

- Why is an unmeasurable quality useless for architecture?
- Pick an app you maintain: write one functional and one measurable non-functional requirement for it.
