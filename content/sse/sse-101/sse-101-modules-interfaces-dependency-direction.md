---
schema_version: 1
type: lesson
id: sse-101-modules-interfaces-dependency-direction
title: Modules, Interfaces and Dependency Direction
course_id: sse
module_id: SSE-101
order: 4
estimated_minutes: 50
---

# Modules, Interfaces and Dependency Direction

## Objective

Define modules by responsibility, connect them with explicit interfaces, and control dependency direction.

## Content

A module groups coherent responsibilities behind a boundary that hides implementation decisions. A useful interface states more than method names: callers need input/output meaning, errors, side effects and relevant timing or consistency guarantees. Changing an undocumented assumption may still break callers; preserving a type signature alone does not establish compatibility.

Distinguish source-code dependency from runtime control flow. Billing policy may call a payment adapter at runtime without importing that provider’s SDK. Define a small PaymentGateway contract in the policy boundary; the adapter imports and implements it. Application startup supplies the concrete adapter. This reverses the source dependency at the boundary while calls still flow outward at runtime, as Martin’s “Crossing boundaries” example demonstrates.[4]

Dependency inversion is the design principle; dependency injection is one wiring technique. Passing a dependency into a constructor or function can help separate configuration from use, but injecting a concrete provider class does not by itself invert the dependency. A framework or container is not required.[5]

Depend on contracts that are stable relative to callers’ needs, and isolate details expected to vary. This reduces change propagation; it does not guarantee it disappears. If a provider introduces asynchronous settlement or a new authentication requirement that the contract cannot represent, the contract, adapter and policy may all need revision. Invert a dependency where volatility, testing or substitutability justify the extra boundary, not for every helper function.

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (Software Systems Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Module boundary :: A limit around coherent responsibilities and hidden decisions, enforced through supported entry points and dependency rules. A directory name alone does not enforce it.
- Interface/contract :: The operations and behavioural guarantees callers may rely on: data meaning, errors, side effects and relevant constraints, not only signatures.
- Dependency direction :: Which component’s source code names or imports another component’s definitions. It need not match the direction of runtime calls.[4]
- Dependency inversion :: Making high-level policy and low-level details depend on an abstraction suited to policy, with details implementing that abstraction. It limits dependence on provider-specific mechanisms, not all future change.
- Dependency injection :: Supplying a collaborator from outside rather than constructing it inside the consumer. It is a wiring technique, not synonymous with dependency inversion.[5]
- Stability :: Relative resistance to change in a contract and its meaning. A stable interface absorbs compatible implementation changes; changed requirements or semantics can still ripple across it.

## Examples

- Billing policy owns PaymentGateway. A Stripe adapter implements it and translates provider errors into agreed outcomes; application startup injects the adapter. Policy does not import the Stripe SDK.
- If the contract assumes immediate payment success but a replacement provider returns pending settlement, substitution requires a design review, not merely a new class.
- Keep Express request/response objects in the HTTP adapter; pass domain-relevant data into policy. Injecting an Express object would not remove the dependency.

## Takeaways

- Separate runtime calls, source dependencies and dependency wiring.
- Own contracts at the boundary whose needs they express; include behavioural semantics.
- Inversion reduces ripple effects, but changing contracts or assumptions can still require coordinated work.

## Sources and Further Reading

- **Start here — [Robert C. Martin — The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).[4]** Read: “The Dependency Rule”, “Crossing boundaries” and “What data crosses the boundaries”. Why: shows how calls can flow outward while source dependencies point toward policy. Try: Draw source-import arrows separately from runtime-call arrows for a payment operation. Access: Free public reading; no account needed.
- **Optional implementation depth — [Martin Fowler — Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html).[5]** Read: “A Naive Example”, “Constructor Injection with PicoContainer” and “Separating Configuration from Use”; ignore old container setup details. Why: distinguishes constructing collaborators from using them and makes the wiring problem concrete. Try: Rewrite the movie-finder idea as a function receiving a repository; identify where the concrete repository is created. Access: Free public reading; no account needed.
- **Optional book depth — [Robert C. Martin — Clean Architecture (2017), publisher contents](https://www.informit.com/store/clean-architecture-a-craftsmans-guide-to-software-9780134494166).[11]** Read: Clean Architecture (2017), chapter 22, “The Clean Architecture”, especially “The Dependency Rule” and “A Typical Scenario”. Why: extends the free article’s boundary argument; compare its opinionated rule with your actual change risks. Try: State one provider change your contract can absorb and one that would force a contract revision. Access: Publisher contents inspected, not the full chapter. Full book requires purchase or library access; free article is sufficient.

## Flashcards

- Q: What is dependency inversion?
  A: High-level policy owns the interface; low-level detail implements it, reversing the dependency.
- Q: Why depend toward stability?
  A: Changes in volatile detail then never force changes in stable policy.

## Revision Questions

- In an app you know, which way do dependencies point between HTTP handlers and domain logic?
- When would you NOT invert a dependency?
