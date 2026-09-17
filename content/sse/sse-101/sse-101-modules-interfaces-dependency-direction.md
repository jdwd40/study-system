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

A module is a unit with one responsibility and a boundary that hides how it fulfils it. An interface is the contract at that boundary: what callers may rely on, and nothing more.

Dependency direction is a design choice, not an accident. High-level policy should not depend on low-level detail; point dependencies toward stability. When detail must be called, invert the dependency: the policy defines the interface, the detail implements it.

## Key Concepts

- Module boundary
- Interface/contract
- Dependency direction
- Dependency inversion
- Stability

## Examples

- Billing policy defines a PaymentGateway interface; Stripe adapter implements it — policy never imports Stripe
- A core domain module that imports Express is a reversed dependency

## Takeaways

- Interfaces define what may be depended upon
- Point dependencies toward stable policy, away from volatile detail

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (Software Systems Engineering)
- Martin, Clean Architecture — the Dependency Rule

## Flashcards

- Q: What is dependency inversion?
  A: High-level policy owns the interface; low-level detail implements it, reversing the dependency.
- Q: Why depend toward stability?
  A: Changes in volatile detail then never force changes in stable policy.

## Revision Questions

- In an app you know, which way do dependencies point between HTTP handlers and domain logic?
- When would you NOT invert a dependency?
