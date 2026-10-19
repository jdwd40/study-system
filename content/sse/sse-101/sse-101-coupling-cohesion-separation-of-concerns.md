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

Coupling is the dependency between parts: what one part must know or assume about another to work correctly. It includes API calls, shared representations, ordering assumptions and shared mutable state, not just imports. Cohesion describes how strongly a module’s responsibilities and data belong together. Keep related work together and unnecessary knowledge apart; zero coupling is neither possible nor desirable in a cooperating system.

Parnas compares decomposing a program by processing steps with decomposing it around hidden design decisions. The latter localises likely changes: callers should not need to know whether stored lines use one representation or another. A module is a responsibility assignment, not simply a file or function.[21]

Separation of concerns distinguishes responsibilities so they can be reasoned about with less interference. It does not require each concern to exist in exactly one file: security spans several layers. Abstraction presents the operations and guarantees a caller needs; information hiding conceals a changeable design decision; encapsulation controls access so callers cannot bypass the boundary. A getter that exposes a mutable array can leak the representation even if the field is private. Fowler’s collection example returns a copy and supplies explicit add/remove operations.[3]

Test a boundary against a likely change: how many independent responsibilities must understand it? File count alone misleads: a contained change may legitimately touch implementation, tests and documentation together.

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (Software Systems Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Coupling :: Dependencies and assumptions between parts, including schemas, state, call order and failure behaviour. High coupling increases the risk of coordinated change; not every change necessarily propagates.
- Cohesion :: How closely a module’s responsibilities and data serve a coherent purpose or reason to change. Several related operations can belong in one cohesive module.
- Separation of concerns :: Distinguishing responsibilities behind understandable boundaries to reduce interference. Cross-cutting concerns may need coordinated rules at several boundaries.
- Abstraction :: A useful model or contract exposing relevant operations and guarantees while omitting detail. Its semantics must fit callers’ needs.
- Information hiding :: Concealing a design decision likely to change so other modules do not encode it in their own logic.[21]
- Encapsulation :: Controlling access to state and implementation through supported operations. Access modifiers alone do not prevent leaks through mutable return values or exposed assumptions.

## Examples

- A route handler embedding SQL and table-layout assumptions is storage-coupled. A repository can hide that layout, provided it does not expose SQL-specific details under a new name.
- A mixed “utils” module of billing rules, date formatting and database helpers has weak cohesion. A focused formatting library is not bad merely because many modules use it.
- Returning an internal mutable collection permits unvalidated updates; a copy plus validated update operations can protect invariants.[3]

## Takeaways

- Evaluate coupling by knowledge and change propagation, not import counts alone.
- Group coherent responsibilities; hide likely-to-change decisions.
- Check encapsulation for representation leaks, including mutable return values.

## Sources and Further Reading

- **Start here — [D. L. Parnas — On the Criteria To Be Used in Decomposing Systems into Modules (1972, university-hosted copy)](https://www.cse.sc.edu/~mgv/csce590f20/ParnasCriteria.pdf).[21]** Read: “Expected Benefits of Modular Programming”, the two KWIC decompositions and “The Criteria”; skim implementation notation initially. Why: the original paper shows why change-hiding boundaries differ from a pipeline of processing steps. Try: Identify a representation decision several modules know; propose an interface that hides it. Access: Free university-hosted PDF of the 1972 paper; historical notation, no purchase or account needed.
- **Optional short application — [Martin Fowler — Encapsulate Collection](https://refactoring.com/catalog/encapsulateCollection.html).[3]** Read: the complete before/after “Encapsulate Collection” example. Why: makes an encapsulation leak visible in a few lines of JavaScript. Try: Explain why a public getter is not enough; sketch an update operation preserving one invariant. Access: Small example is free. Linked Refactoring web edition/full book is paid and not required.

## Flashcards

- Q: What is coupling?
  A: How much one part of a system must know about another part's details.
- Q: What is cohesion?
  A: How strongly the contents of one module belong to the same responsibility.

## Revision Questions

- Find a high-cost coupling in an app you know. What boundary would remove it?
- Why can shared "util" modules increase coupling?
