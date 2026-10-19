---
schema_version: 1
type: lesson
id: ai-automation-w11-l03
title: Proposal, data and acceptance
course_id: ai-automation-integration
module_id: AI-AUTO-W11
order: 3
estimated_minutes: 35
---

# Proposal, data and acceptance

## Objective

Understand and apply proposal, data and acceptance in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A short proposal names the problem, present process, limited pilot, deliverables, responsibilities, timeline, acceptance tests and support arrangements. Specify who provides API access, who owns accounts and data, where information is processed and who approves outbound actions. Include the failure and fallback path. Use a change request for new integrations or extra workflows. Discuss privacy and data handling early, especially if messages contain personal information. The proposal should be understandable to the owner without model terminology; technical details can sit in an appendix.

**Worked example**

The shop pilot includes one form, one dashboard, one weekly report and manual approval of every outgoing draft. Booking and payment integrations are out of scope.

**Try it**

Draft a one-page proposal for a fictional business using these headings: problem, current process, bounded pilot, deliverables and exclusions, data/account ownership, human approvals, timeline, five acceptance tests, failure/fallback route, support and handover owner. Keep legal terms proportionate and seek qualified advice where needed; no supplied proposal template is required.

**Key point**

Scope, roles, data, fallback, tests, support.

## Key Concepts

- Bounded proposal :: Describe the current problem, pilot deliverables, exclusions, timeline and change-request route in language the business owner can check.
- Responsibility and account ownership :: Name who supplies API access, owns accounts and data, maintains the service and approves outbound actions.
- Processing agreement :: Specify what information is processed, where and by whom, reviewing the applicable privacy and processor responsibilities before real messages are used.
- Acceptance and fallback :: Agree observable normal and failure tests, manual fallback and support arrangements so both parties know what delivery and recovery mean.

## Examples

- The shop pilot includes one form, one dashboard, one weekly report and manual approval of every outgoing draft. Booking and payment integrations are out of scope.

## Takeaways

- Scope, roles, data, fallback, tests, support.

## Sources and Further Reading

- **Start here (free): [GOV.UK — Writing user stories](https://www.gov.uk/service-manual/agile-delivery/writing-user-stories)** — Read **Acceptance criteria**. Defines observable outcomes as a checklist and links them to evidence, helping avoid vague contractual claims such as “AI works well”. **Apply:** Write five owner-verifiable pilot tests including duplicate handling and a provider outage.
- **Optional reference (free): [ICO — What needs to be included in the contract?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/contracts-and-liabilities-between-controllers-and-processors-multi/what-needs-to-be-included-in-the-contract/)** — Read **What details about the processing must the contract include?**; **What are the minimum required terms?**; **End-of-contract provisions**. Details controller/processor contract requirements, including processing purpose and deletion/return. A short pilot proposal does not replace an applicable data-processing contract or tailored legal advice. **Apply:** Identify the parties, data, duration, sub-processors and end-of-pilot deletion/export questions to resolve.

## Flashcards

- Q: What belongs in acceptance criteria?
  A: Observable behaviour for normal, failure and exceptional cases that both parties can verify.

## Revision Questions

- What belongs in acceptance criteria?
