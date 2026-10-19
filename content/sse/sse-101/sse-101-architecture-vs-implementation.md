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

Architecture concerns the significant structures, boundaries, relationships and decisions of a system, plus why they fit its requirements. “Expensive to change” is a useful warning sign, not a complete definition: an important security boundary remains architectural even when good design makes it easy to revise. An awkward local function is not automatically architecture because it is costly to rewrite. Significance depends on the system and its stakeholders.[10]

Implementation supplies the algorithms, queries and code that realise the design. The distinction is contextual: an ORM query style may be local detail, but transaction boundaries or tenant isolation in those queries can affect the whole system. Judge a choice by its effects on other components, externally visible behaviour and important qualities.

Start with required behaviour, quality goals and hard constraints. Behaviour shapes architecture too: payments, audit trails or offline editing imply different responsibilities and data flows. Qualities help compare designs; constraints rule out options, such as a fixed budget, legal data-location rule or supported platform. Record significant choices with their context and consequences so later engineers can reassess the reasoning, rather than preserving a decision blindly.[7]

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (Software Systems Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Software architecture :: Significant structures, boundaries, relationships and decisions that shape how a system meets its requirements. Change cost is a clue to significance, not its only test.
- Implementation detail :: A choice whose effects can remain local while contracts and important system qualities are preserved. A local choice can become architectural when its impact spreads.
- Functional requirements :: Capabilities and behaviour the system must provide, including inputs, outputs and rules. They influence responsibilities and data flow as well as feature lists.
- Non-functional requirements :: Required qualities such as performance, reliability, security and modifiability. Express them as testable scenarios to compare designs.
- Constraints :: Non-negotiable limits on design, such as budget, regulation or a mandated platform. Distinguish a hard constraint from a negotiable target and record its owner.

## Examples

- Choosing one deployment unit rather than independent services is architectural; renaming a local query variable usually is not. A query that bypasses tenant isolation is not merely a style choice.
- A latency budget may motivate a cache, a query improvement or a changed workflow. Measure the bottleneck before assuming a new boundary is necessary.
- Sketch a support system’s HTTP entry points, account data and notification responsibilities; identify which decisions protect user privacy.

## Takeaways

- Architecture is significant design in context, not simply every difficult-to-change choice.
- Behaviour, qualities and hard constraints all shape design.
- Keep important choices understandable and revisable; record why, not only what.

## Sources and Further Reading

- **Start here — [Martin Fowler — Software Architecture Guide](https://martinfowler.com/architecture).[10]** Read: “What is architecture?” and “Why does architecture matter?”. Why: grounds significance in shared understanding rather than a rigid architecture/implementation split. Try: Classify two choices in an app you know; explain who is affected and why each matters. Access: Free public reading; no account needed.
- **Optional practice — [Michael Nygard — Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions).[7]** Read: “Decision” and the ADR fields “Context”, “Decision” and “Consequences”. Why: shows how to preserve the rationale behind a design choice. Try: Write a five-sentence record of a boundary choice, including a negative consequence. Access: Free public reading; no account needed.
- **Optional book depth — [Robert C. Martin — Clean Architecture (2017), publisher contents](https://www.informit.com/store/clean-architecture-a-craftsmans-guide-to-software-9780134494166).[11]** Read: Clean Architecture (2017), chapter 17, “Boundaries: Drawing Lines”, especially “Which Lines Do You Draw, and When Do You Draw Them?”. Why: offers a longer, opinionated treatment of which details to isolate. Try: Choose a boundary and state the change it protects against and its implementation cost. Access: Publisher contents inspected, not the full chapter. Book requires purchase or library access; free readings are sufficient.

## Flashcards

- Q: What makes a decision architectural?
  A: It is expensive to change later and shapes the system's structure or boundaries.
- Q: Which requirements usually decide between architectures?
  A: Non-functional requirements: performance, reliability, security, operability.

## Revision Questions

- Give one decision in a project you know that is architectural, and one that is implementation. Why?
- How can a non-functional requirement force a structural boundary?
