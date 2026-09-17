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

- Software architecture
- Implementation detail
- Functional requirements
- Non-functional requirements
- Constraints

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
