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

A monolith is an application deployed as one unit; it can still run as several replicas. “Monolith” says little about internal quality. A modular monolith deliberately groups responsibilities, defines interfaces and controls dependencies inside that deployment unit. Boundaries can be reinforced with import rules, tests and data-access ownership rather than directories alone.

Internal modularity can improve change isolation and make refactoring easier, but it does not provide all service properties. Modules still share a release and often a process, so they lack independent deployment, process-level fault isolation and independent scaling. A monolith is not always easy to operate merely because it has one deployment artifact.

Fowler’s “Monolith First” argues that learning boundaries before distributing them can be valuable, but explicitly describes the evidence as limited and warns that an arbitrary monolith cannot simply be split later.[8] Good boundaries preserve an option, not a guaranteed cheap extraction. Moving a module into a service changes a local call into a remote interaction and requires revisiting data ownership, transactions, failures, latency and operations.

Microservices add a complexity premium; whether it is justified depends on the problem.[9] Independent release needs, measured scaling bottlenecks, fault isolation, security isolation or team ownership may justify distribution. First check whether profiling, clearer internal boundaries or scaling the whole application resolves the need more simply. Design for plausible changes supported by evidence, not every imaginable future.

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (Software Systems Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Monolith :: An application deployed as one unit, potentially with multiple replicas. It may be well structured or tightly tangled; deployment shape does not determine modularity.
- Modular monolith :: A single-deployment application with explicit internal module interfaces and controlled code/data dependencies. Modularity needs enforcement, not just folders.
- Change isolation :: Limiting the spread of a change through stable contracts and coherent ownership. Shared contracts, data or business rules can still require coordinated changes.
- Premature distribution :: Introducing remote boundaries before their benefits justify network failures, operational overhead and consistency complexity. The judgement depends on requirements, not a universal size threshold.
- Module extraction path :: A possible future migration from an internal module to a service. Clean interfaces help, but extraction still needs decisions about data, failure handling, deployment and observability.[8]
- Deployment versus modularity :: Deployment units describe how software is released and run; modules describe responsibility and dependency boundaries. These are separate design dimensions.

## Examples

- Hypothetical Node application: billing and notifications expose public functions; direct cross-module table access and private imports are rejected in tests. It remains one deployment with a shared process failure domain.
- Before extracting notifications, inventory shared transactions and direct reads of account tables; a clean function signature does not remove those dependencies.
- If one workload creates measured resource contention, compare whole-app replication, an isolated worker and a separate service against cost and failure requirements.

## Takeaways

- Internal modularity can improve change locality without introducing remote calls.
- It does not provide independent deployment, scaling or fault isolation.
- Treat later extraction as an option with migration costs; justify distribution with requirements and evidence.

## Sources and Further Reading

- **Start here — [Martin Fowler — Monolith First](https://martinfowler.com/bliki/MonolithFirst.html).[8]** Read: the argument about boundary discovery, the concluding evidence caveat and note 1 on extracting an arbitrary monolith. Why: explains the monolith-first judgement while making its limits explicit. Try: Name one boundary you do not yet understand well enough to turn into a service. Access: Free public reading; no account needed.
- **Optional decision depth — [Martin Fowler — Microservice Premium](https://martinfowler.com/bliki/MicroservicePremium.html).[9]** Read: the full short article and its discussion of system complexity versus the microservice premium. Why: helps decide when distribution overhead may buy enough benefit. Try: Write one observable requirement that could justify extraction and one cheaper alternative to test first. Access: Free public reading; no account needed.

## Flashcards

- Q: What does a modular monolith buy over a plain monolith?
  A: Enforced internal boundaries: change isolation and a future extraction path, with one deploy.
- Q: What is the tax of distribution?
  A: Network failure modes, operational cost and consistency complexity.

## Revision Questions

- Which module in an app you know would be extracted first, and why?
- What signals justify paying the distribution tax?
