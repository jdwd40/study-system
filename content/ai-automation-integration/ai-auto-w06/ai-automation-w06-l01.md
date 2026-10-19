---
schema_version: 1
type: lesson
id: ai-automation-w06-l01
title: Cited answers and abstention
course_id: ai-automation-integration
module_id: AI-AUTO-W06
order: 1
estimated_minutes: 35
---

# Cited answers and abstention

## Objective

Understand and apply cited answers and abstention in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A grounded answer should distinguish source facts from interpretation. Require a source ID for each material claim and show a readable title and section to the user. Check that cited passages actually contain the claimed fact; a plausible citation may still be wrong. When documents disagree, report the conflict and the versions rather than silently choosing. When no passage supports the answer, say so and route the question to a person. Avoid a universal “confidence percentage” unless you have calibrated it against labelled data. Retrieval quality and answer faithfulness are separate measurements.

**Worked example**

The older policy says 14 days; the current policy says 30 days. A correct answer cites the current policy and notes the older version if it was retrieved.

**Try it**

Write expected answers for five policy questions: clear, unsupported, conflicting, outdated and multi-part. Specify their citations.

**Key point**

Citations must support claims; abstain when evidence is absent.

## Key Concepts

- Claim-level citation :: Attach a readable source title, section and passage ID to each material factual claim; merely displaying a plausible link does not establish support.
- Faithfulness :: Check whether the cited evidence actually entails the answer’s claims, separately from whether retrieval found a useful passage.
- Version conflict :: Expose disagreement between source versions and identify which is current rather than silently merging incompatible policies.
- Evidence-based abstention :: Say that the available documents do not support an answer and route to a person when necessary; do not replace missing evidence with an uncalibrated confidence percentage.

## Examples

- The older policy says 14 days; the current policy says 30 days. A correct answer cites the current policy and notes the older version if it was retrieved.

## Takeaways

- Citations must support claims; abstain when evidence is absent.

## Sources and Further Reading

- **Start here (free): [Ragas — Faithfulness](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)** — Read **Faithfulness**; **How It’s Calculated**. Breaks answer evaluation into claims supported by retrieved context. Use the claim-checking idea manually; running an automated model judge is optional and not itself proof of truth. **Apply:** Underline each claim in a policy answer and link it to words in the cited passage.
- **Optional reference (free): [OpenAI — Retrieval: synthesizing responses](https://developers.openai.com/api/docs/guides/retrieval)** — Read **Synthesizing responses**. Shows the boundary where retrieved evidence is supplied for answer generation; your application still needs citation checks and an unsupported-answer policy. **Apply:** Write an instruction for an absent warranty clause that requires abstention rather than an invented policy.

## Flashcards

- Q: What should the assistant do when no retrieved passage supports an answer?
  A: Abstain or ask for human review instead of inventing a policy.

## Revision Questions

- What should the assistant do when no retrieved passage supports an answer?
