---
schema_version: 1
type: lesson
id: sse-101-architecture-vs-implementation
title: Architecture versus Implementation
course_id: sse
module_id: SSE-101
order: 1
estimated_minutes: 45
---

# Architecture versus Implementation

## Objective

Distinguish architecture from implementation detail, and frame work as requirements under constraints.

## Content

Architecture is the set of decisions that are expensive to change: structure, boundaries, constraints and the reasoning behind them. Implementation is everything that can change inside those boundaries without altering the system's essential shape.

Requirements drive architecture. Functional requirements say what the system must do; non-functional requirements — performance, reliability, security, operability — constrain how it may do it, and usually decide between candidate architectures.

## Key Concepts

- Software architecture :: The decisions that are expensive to change: structure, boundaries, constraints and the reasoning behind them. If a decision is cheap to reverse, it is probably implementation instead.
- Implementation detail :: What can change inside the boundaries without altering the system's essential shape. These decisions stay local, so they can be revisited cheaply.
- Functional requirements :: What the system must do — its behaviour. They define the work, but rarely choose between designs on their own.
- Non-functional requirements :: Qualities constraining how the system may do it — performance, reliability, security, operability. They usually decide between candidate architectures.
- Constraints :: The limits that shape design; non-functional requirements usually decide between candidate architectures. A single hard limit, like a 200 ms latency budget, can force a whole new boundary.

## Examples

- Choosing a modular monolith over microservices is architectural; picking a ORM query style is implementation
- A 200 ms latency budget is a non-functional requirement that can force a cache boundary

## Takeaways

- Architecture = important, expensive-to-change decisions
- Non-functional requirements drive most architectural choices
- If a decision is cheap to reverse, it is probably implementation

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (Software Systems Engineering)
- Martin, Clean Architecture (2017) — chapters on boundaries

## Flashcards

- Q: What makes a decision architectural?
  A: It is expensive to change later and shapes the system's structure or boundaries.
- Q: Which requirements usually decide between architectures?
  A: Non-functional requirements: performance, reliability, security, operability.

## Revision Questions

- Give one decision in a project you know that is architectural, and one that is implementation. Why?
- How can a non-functional requirement force a structural boundary?
