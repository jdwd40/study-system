---
schema_version: 1
type: lesson
id: sse-101-functional-and-non-functional-requirements
title: Functional and Non-Functional Requirements
course_id: sse
module_id: SSE-101
order: 2
estimated_minutes: 40
---

# Functional and Non-Functional Requirements

## Objective

Capture requirements precisely enough that architecture can be reasoned about.

## Content

A functional requirement describes required behaviour: “a registered user can request a password-reset link”. A quality requirement describes how well, under what conditions, or with what safeguards the system behaves. The categories overlap: authentication and authorisation require behaviour as well as security properties. “Non-functional” does not mean optional.

“Fast” is a useful starting goal, but not yet a checkable acceptance criterion. Refine it into a quality-attribute scenario: source of stimulus, stimulus, environment, affected artifact, response and response measure. For example: clients submit catalogue reads to the API at an agreed peak workload; the API returns results with p95 end-to-end latency below 300 ms over a defined window. Specify request mix, data volume, measurement point and error treatment before comparing designs.[1]

An indicator is what you measure; an objective is its target. Percentiles expose slow requests a mean can hide, but a p95 target does not constrain every request or the slowest tail. Availability needs a definition of success, a denominator and a window.[2]

Prioritise requirements with stakeholders. Some choices improve several qualities together; others create tensions, such as stricter consistency versus response time during a dependency failure. Record the trade-off that actually applies rather than assuming every decision necessarily worsens another quality.

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (Software Systems Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Functional requirement :: Required behaviour expressed through an actor, trigger, inputs, outputs and rules; for example, issuing a reset link to an eligible account.
- Non-functional requirement :: A required quality such as latency, availability, security or modifiability, with conditions and observable criteria. Security often includes functional rules too.
- Measurability :: An agreed observation, workload and acceptance criterion that make a requirement checkable. A number without a measurement method can still be ambiguous.
- Quality-attribute scenario :: A stimulus and its source, environment, affected artifact, required response and response measure. It connects a quality goal to a test or review.[1]
- SLI and SLO :: A service-level indicator is a defined measurement, such as successful-request fraction; a service-level objective is its target under stated conditions and a window.[2]
- Quality trade-offs :: Context-specific tensions among qualities, functionality and cost. Compare alternatives against prioritised requirements rather than universal slogans.

## Examples

- “Reliable” → “At least 99.9% of eligible API requests succeed per calendar month; classify invalid client requests explicitly.” Recovery time is a separate requirement.
- “Fast” → “At the agreed 100-request-per-second read workload and representative dataset, p95 client-observed latency is below 300 ms during a 30-minute test; timeouts count as failures.” These are illustrative targets, not defaults.
- “Secure” → “Unauthenticated mutations are rejected and tested; permissions are checked for each operation; reset tokens are excluded from logs.”

## Takeaways

- Turn vague quality goals into scenarios with conditions and acceptance criteria.
- Define what a metric measures before choosing its target.
- Rank stakeholder priorities and test the trade-offs that apply.

## Sources and Further Reading

- **Start here — [arc42 — How to specify quality requirements](https://quality.arc42.org/articles/specify-quality-requirements).[1]** Read: the quality-attribute scenario template with six elements and its worked scenario formats. Why: turns adjectives into testable responses under explicit conditions. Try: Rewrite “password reset must be fast” using the six scenario elements. Access: Free public reading; no account needed.
- **Optional practical depth — [Google SRE — Service Level Objectives](https://sre.google/sre-book/service-level-objectives).[2]** Read: “Indicators”, “Objectives” and the discussion of distributions and percentiles. Why: separates a measurement from its target and explains why averages can conceal poor experience. Try: Define a latency indicator and objective, including measurement point and window. Access: Free public reading; no account needed.
- **Optional book depth — [Bass, Clements and Kazman — Software Architecture in Practice (4th ed.), publisher contents](https://www.informit.com/store/software-architecture-in-practice-9780136886099).[12]** Read: Software Architecture in Practice, 4th edition, section 3.3, “Specifying Quality Attribute Requirements: Quality Attribute Scenarios”. Why: provides the fuller framework behind the free arc42 explanation. Try: Write a modifiability scenario: who requests which change, under what conditions, at what acceptable effort? Access: Publisher contents inspected; full section not fetched. Book requires purchase or library access; free readings suffice.

## Flashcards

- Q: Turn "the site must be fast" into a requirement.
  A: A measurable target, e.g. p95 page load under 2 s at expected peak load.
- Q: Who decides which qualities matter most?
  A: The stakeholders' priorities, made explicit before design.

## Revision Questions

- How would you turn a vague quality goal into a testable architecture requirement?
- Pick an app you maintain: write one functional and one measurable non-functional requirement for it.
