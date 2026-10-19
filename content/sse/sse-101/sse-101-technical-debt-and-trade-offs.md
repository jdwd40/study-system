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

Technical debt is a design or implementation condition that makes later work more costly than it needs to be. It can arise from a conscious shortcut, weak practices or learning that reveals a better design. Fowler’s quadrant separates deliberate from inadvertent debt and prudent from reckless debt; deliberate does not automatically mean prudent.[6]

The debt metaphor distinguishes principal (work to improve the design) from interest (extra effort or risk incurred while working with it). Interest is uneven: a rarely changed module may cost little, while a frequently modified integration creates repeated rework. Not every bug is technical debt, and not every imperfection deserves repayment. Compare expected future costs, safety and opportunity cost before scheduling cleanup.[6]

Architecture decisions balance requirements under constraints. There may be a best option for a stated set of priorities, but no context-free best architecture. A useful record explains the problem, alternatives, chosen action, consequences and what evidence would trigger review. Some decisions improve several qualities at once; identify actual tensions rather than inventing a sacrifice for every choice.

Nygard’s architecture decision record (ADR) keeps context, decision, status and consequences in a short document. If a decision is replaced, mark the original as superseded rather than deleting its history. Alternatives and revisit triggers are useful additions for this lesson, not mandatory fields of every ADR format.[7]

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (Software Systems Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Technical debt :: A condition in the design or implementation that increases future change cost. It may be deliberate or inadvertent, prudent or reckless, and can become visible through learning.[6]
- Principal and interest :: Principal is the effort to reduce the debt; interest is its additional ongoing change effort or risk. Interest varies with which parts of the system are exercised and changed.
- Explicit trade-off :: A stated comparison of options against prioritised requirements, including gains, costs, risks and assumptions. It makes the reasoning open to challenge.
- Reversibility :: The effort and risk of changing course, including code, data migration, rollout and coordination. A feature flag does not make persisted-data changes automatically reversible.
- Architecture decision record :: A short, versioned record of an important choice and its context, status and consequences. Keep superseded records; add alternatives and a review trigger where useful.[7]

## Examples

- Shipping a dual write to a database and queue without an atomic handoff creates an inconsistency risk. A deliberate shortcut is not acceptable merely because it is recorded: evaluate the consequences and safeguards first.
- ADR sketch: “Keep one deployment because current operations are manageable; independent module scaling is unavailable. Review if measurements show a module exhausting shared capacity and simpler optimisations fail.” This is a trigger to investigate, not automatic approval for services.
- For one debt item, record the next change it obstructs, the extra work it causes, and whether a small containment fix is cheaper than a rewrite.

## Takeaways

- Deliberate debt can still be reckless; evaluate consequences, not just intent.
- Repay debt where expected interest or risk justifies the cost.
- Keep decision rationale and revisit it when assumptions change.

## Sources and Further Reading

- **Start here — [Martin Fowler — Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html).[6]** Read: the full short article, especially the prudent/reckless and deliberate/inadvertent distinctions and the low-interest example. Why: avoids treating all shortcuts as rational or all imperfect code as urgent cleanup. Try: Classify one debt item in the quadrant and identify a concrete interest payment. Access: Free public reading; no account needed.
- **Optional practical depth — [Michael Nygard — Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions).[7]** Read: “Decision”, the template fields and “Consequences”; note the treatment of superseded decisions. Why: gives the original lightweight ADR proposal and explains preserving decision history. Try: Write a short ADR with one rejected option, one downside and a measurable review trigger. Access: Free public reading; no account needed.

## Flashcards

- Q: When is technical debt rational?
  A: When taken deliberately, with the trade-off and repayment conditions made visible.
- Q: What belongs in an architecture decision record?
  A: The decision, context, options, the trade-off accepted, and what would trigger revisiting.

## Revision Questions

- Name one debt item in your own code: what is the interest payment?
- Why does "best practice" fail as an architecture argument?
