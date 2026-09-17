---
schema_version: 1
type: lesson
id: sse-101-monoliths-and-modular-monoliths
title: "Designing for Change: Monoliths and Modular Monoliths"
course_id: sse
module_id: SSE-101
order: 6
estimated_minutes: 55
---

# Designing for Change: Monoliths and Modular Monoliths

## Objective

Compare a simple monolith with a modular monolith, and design for likely change without premature distribution.

## Content

A monolith deploys as one unit; a modular monolith also enforces internal boundaries — separate modules with explicit interfaces and controlled dependencies. The modular monolith keeps monolith simplicity (one deploy, easy refactoring) while buying most of the change-isolation that services promise.

Design for likely change, not imaginable change. Identify which parts change together and separate those that change for different reasons. Distribution (services) is a tax paid in network failure, operational cost and consistency pain; pay it only when scaling or team boundaries demand it.

## Key Concepts

- Monolith
- Modular monolith
- Change isolation
- Premature distribution
- Module extraction path

## Examples

- Coins: one Node process with clear module boundaries beats five services at current scale
- A module with a clean interface can be extracted into a service later — the boundary is the real investment

## Takeaways

- Internal boundaries give most service benefits without distribution costs
- Design for change frequency and reason, not fashion

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (Software Systems Engineering)
- Fowler, "Monolith First"

## Flashcards

- Q: What does a modular monolith buy over a plain monolith?
  A: Enforced internal boundaries: change isolation and a future extraction path, with one deploy.
- Q: What is the tax of distribution?
  A: Network failure modes, operational cost and consistency complexity.

## Revision Questions

- Which module in an app you know would be extracted first, and why?
- What signals justify paying the distribution tax?
