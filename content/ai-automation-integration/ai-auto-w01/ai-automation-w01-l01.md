---
schema_version: 1
type: lesson
id: ai-automation-w01-l01
title: Find the process before the model
course_id: ai-automation-integration
module_id: AI-AUTO-W01
order: 1
estimated_minutes: 35
---

# Find the process before the model

## Objective

Understand and apply find the process before the model in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

An automation starts with a trigger, an input, a decision, an action and an owner. Write each as a separate step. Record what the person does now, how often it happens, how long it takes and what goes wrong. A useful AI step deals with ambiguous text or documents; ordinary validation, scheduling and arithmetic should remain deterministic. Establish a baseline before you change anything. If ten enquiries take 50 minutes to process, the time saving is measured against that 50 minutes, including review and error correction. A process map also makes the boundaries visible: a draft can be automated while sending it may require approval.

**Worked example**

A fictional bicycle repair shop receives an enquiry. A form captures the message; a classifier suggests repair type; a person approves the proposed reply. The owner wants fewer missed enquiries, not an impressive chatbot.

**Try it**

Map five steps for the bicycle shop. Mark each step as rule, AI, human or external system. Estimate weekly volume and current minutes per enquiry.

**Key point**

Trigger → classify → store → draft → approve; baseline first.

## Key Concepts

- Process map :: Break the current task into trigger, input, decision and action, naming the owner at each hand-off before choosing tools.
- Deterministic versus AI work :: Use ordinary code for validation, scheduling and arithmetic; reserve a model for genuinely ambiguous text or documents.
- Baseline :: Measure current volume, handling time and errors before building; include review and correction in the later comparison.
- Automation boundary :: Specify where automation stops and a person takes responsibility, such as generating a draft without authorising its delivery.

## Examples

- A fictional bicycle repair shop receives an enquiry. A form captures the message; a classifier suggests repair type; a person approves the proposed reply. The owner wants fewer missed enquiries, not an impressive chatbot.

## Takeaways

- Trigger → classify → store → draft → approve; baseline first.

## Sources and Further Reading

- **Start here (free): [GOV.UK — Learning about users and their needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs)** — Read **Understanding user needs**; **Validating user needs**. Starts from the outcome and observed problem rather than assuming the shop needs a chatbot. Government service examples are adaptable, not requirements for this pilot. **Apply:** Rewrite “build an AI receptionist” as one evidence-backed owner need.
- **Optional reference (free): [GOV.UK — Creating an experience map](https://www.gov.uk/service-manual/user-research/creating-an-experience-map)** — Read **Identify common stages**; **Build up the experience**. Shows how to turn observed events into stages, steps and service touchpoints. **Apply:** Map one enquiry and label its trigger, hand-offs and current pain point.

## Flashcards

- Q: Why collect a baseline before building?
  A: It allows a comparison of time, quality and errors after the workflow is running, so value is evidenced.

## Revision Questions

- Why collect a baseline before building?
