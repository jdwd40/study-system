---
schema_version: 1
type: lesson
id: sse-101-coupling-cohesion-separation-of-concerns
title: Coupling, Cohesion and Separation of Concerns
course_id: sse
module_id: SSE-101
order: 3
estimated_minutes: 50
---

# Coupling, Cohesion and Separation of Concerns

## Objective

Reason about coupling and cohesion, and apply abstraction and encapsulation to separate concerns.

## Content

Coupling measures how much one part of a system must know about another. Cohesion measures how strongly the things inside one part belong together. Good structure minimises the first and maximises the second.

Separation of concerns assigns each responsibility to exactly one place. Abstraction hides detail behind a stable contract; encapsulation stops outside code from depending on what is hidden. Together they let parts change independently — the practical definition of maintainability.

## Key Concepts

- Coupling :: How much one part of a system must know about another part's details. High coupling means one change forces many others.
- Cohesion :: How strongly the contents of one module belong to the same responsibility. High cohesion keeps related change in one place.
- Separation of concerns :: Assigning each responsibility to exactly one place. It is what makes low coupling and high cohesion achievable in practice.
- Abstraction :: Hiding detail behind a stable contract. Callers depend on the contract, so the hidden detail can change freely.
- Encapsulation :: Stopping outside code from depending on what is hidden. Without it, callers sneak around the contract and coupling creeps back.

## Examples

- A route handler that builds SQL strings is coupled to storage details; a repository interface restores encapsulation
- A "utils" module that everything imports is low cohesion hiding as reuse

## Takeaways

- Low coupling, high cohesion is the compass for structure
- Change-locality is the test: how many files must change for one new requirement?

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (Software Systems Engineering)
- Parnas, "On the Criteria to Be Used in Decomposing Systems into Modules" (1972)

## Flashcards

- Q: What is coupling?
  A: How much one part of a system must know about another part's details.
- Q: What is cohesion?
  A: How strongly the contents of one module belong to the same responsibility.

## Revision Questions

- Find a high-cost coupling in an app you know. What boundary would remove it?
- Why can shared "util" modules increase coupling?
