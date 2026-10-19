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

- Outcome metrics :: Measure accuracy, correction rate, latency, failures, duplicate effects and operating cost together; a successful API response proves none of these by itself.
- Representative evaluation set :: Save ordinary, awkward and incomplete enquiries with expected outcomes so changes can be compared on the same inputs.
- Acceptance criterion :: State an observable target and a safety constraint before testing, such as correct categories plus no unreviewed outgoing replies.
- Error-sensitive scoring :: Track missed urgent cases separately from overall accuracy, and use a rubric for subjective reply quality rather than confusing it with exact-field correctness.

## Examples

- On 20 fictional enquiries, the first version categorises 15 correctly. The shop prioritises avoiding missed urgent bike repairs, so the next iteration targets urgent-case recall rather than prettier wording.

## Takeaways

- Quality, speed, cost, correction rate and missed cases.

## Sources and Further Reading

- **Start here (free): [GOV.UK — Measuring the success of your service](https://www.gov.uk/service-manual/measuring-success/measuring-the-success-of-your-service)** — Read **Measuring transactions**; **Measuring an end-to-end journey or non-transactional website**. Combines performance data with user research and task-completion timing instead of relying on a single activity count. **Apply:** Choose one quality measure and one end-to-end timing measure for the shop.
- **Optional reference (free): [OpenAI — Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)** — Read **Design your eval process**; **Handle edge cases**. Explains objectives, datasets and edge cases for repeatable model evaluation; example thresholds are not universal targets. **Apply:** Add vague and urgent enquiries to a saved test set with explicit expected behaviour.

## Flashcards

- Q: Is “the summary feels helpful” a sufficient metric?
  A: No. Define an observable rubric and compare performance on saved examples.

## Revision Questions

- Is “the summary feels helpful” a sufficient metric?
