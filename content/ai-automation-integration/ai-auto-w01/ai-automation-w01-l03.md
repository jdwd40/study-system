---
schema_version: 1
type: lesson
id: ai-automation-w01-l03
title: Measure useful outcomes
course_id: ai-automation-integration
module_id: AI-AUTO-W01
order: 3
estimated_minutes: 35
---

# Measure useful outcomes

## Objective

Understand and apply measure useful outcomes in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A working call is not a successful automation. Measure extraction accuracy, percentage requiring human correction, time from enquiry to draft, weekly operating cost, failures and duplicate actions. Choose a small dataset of representative examples, including awkward messages and missing details. A baseline and a target make the pilot falsifiable: for example, “at least 18 of 20 test enquiries receive the right category, and nobody is sent a reply without review.” Record the test cases in a file so prompt changes can be compared. Separate subjective writing quality from exact fields such as contact preference or appointment date.

**Worked example**

On 20 fictional enquiries, the first version categorises 15 correctly. The shop prioritises avoiding missed urgent bike repairs, so the next iteration targets urgent-case recall rather than prettier wording.

**Try it**

Write three measurable acceptance criteria for the shop. Create five test cases: clear, vague, multi-issue, urgent and adversarial.

**Key point**

Quality, speed, cost, correction rate and missed cases.

## Key Concepts

- Quality, speed, cost, correction rate and missed cases. :: Measures business-relevant quality, latency, cost, corrections, and missed cases together; speed alone can hide errors or extra review work.

## Examples

- On 20 fictional enquiries, the first version categorises 15 correctly. The shop prioritises avoiding missed urgent bike repairs, so the next iteration targets urgent-case recall rather than prettier wording.

## Takeaways

- Quality, speed, cost, correction rate and missed cases.

## Sources and Further Reading

- [Official documentation](https://developers.openai.com/api/docs/quickstart)

## Flashcards

- Q: Is “the summary feels helpful” a sufficient metric?
  A: No. Define an observable rubric and compare performance on saved examples.

## Revision Questions

- Is “the summary feels helpful” a sufficient metric?
