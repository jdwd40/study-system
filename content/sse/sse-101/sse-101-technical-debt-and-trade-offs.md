---
schema_version: 1
type: lesson
id: sse-101-technical-debt-and-trade-offs
title: Technical Debt and Architecture Trade-offs
course_id: sse
module_id: SSE-101
order: 5
estimated_minutes: 45
---

# Technical Debt and Architecture Trade-offs

## Objective

Recognise technical debt as a trade-off with interest, and make architecture trade-offs explicit.

## Content

Technical debt is a deliberate or accidental shortcut whose cost is paid later as slower change. Like financial debt it can be rational: shipping now at the cost of interest later is sometimes correct. What makes debt dangerous is taking it invisibly.

There are no best architectures, only trade-offs fit to context. Every decision optimises some qualities at the expense of others. Professional practice is stating the trade-off in the open: what we gain, what we give up, what would make us revisit.

## Key Concepts

- Technical debt :: A deliberate or accidental shortcut whose cost is paid later as slower change.
- Interest :: The ongoing cost of debt, paid as slower change until the debt is serviced.
- Explicit trade-off :: Stating in the open what a decision gains, what it gives up, and what would make you revisit it.
- Reversibility :: How easily a decision can be revisited; a stated revisit trigger keeps a trade-off honest.
- Architecture decision record :: A short record of the decision, context, options, the trade-off accepted, and what would trigger revisiting.

## Examples

- Skipping an outbox to ship faster: gain speed now, pay when dual-write inconsistency appears
- A one-line ADR: "Chose modular monolith; gives up independent scaling; revisit if any module exceeds 30% of traffic"

## Takeaways

- Debt is fine when deliberate, visible and serviced
- Record trade-offs as decisions, not vibes

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (Software Systems Engineering)
- Fowler, "Technical Debt Quadrant"

## Flashcards

- Q: When is technical debt rational?
  A: When taken deliberately, with the trade-off and repayment conditions made visible.
- Q: What belongs in an architecture decision record?
  A: The decision, context, options, the trade-off accepted, and what would trigger revisiting.

## Revision Questions

- Name one debt item in your own code: what is the interest payment?
- Why does "best practice" fail as an architecture argument?
