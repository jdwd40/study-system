---
schema_version: 1
type: lesson
id: ai-automation-w06-l02
title: Evaluate a retrieval system
course_id: ai-automation-integration
module_id: AI-AUTO-W06
order: 2
estimated_minutes: 35
---

# Evaluate a retrieval system

## Objective

Understand and apply evaluate a retrieval system in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Create a fixed question set with expected source passages and expected answer behaviour. Score retrieval hit rate separately from answer faithfulness: a good passage may be ignored, and a fluent answer may cite nothing useful. Include negative questions for which the corpus has no answer, document conflicts and phrasing different from the source. Review actual errors by category: missing source, poor chunk, wrong rank, unsupported claim or permission leak. Change one variable, rerun the same tests and save the results. Do not tune only to examples you already showed to the model.

**Worked example**

The assistant answers 18 of 20 common questions but fabricates two unsupported answers. Those two failures are critical despite the high overall percentage.

**Try it**

Build a 20-case evaluation sheet with question, expected passage, allowed answer, observed answer and failure class.

**Key point**

Fixed cases; retrieval hit rate; faithfulness; negative cases.

## Key Concepts

- Labelled question set :: Save questions with expected source passages and allowed answer behaviour so retrieval changes can be evaluated consistently.
- Retrieval versus generation scoring :: Measure whether relevant evidence was retrieved separately from whether the answer faithfully used it; each failure needs a different fix.
- Negative and boundary case :: Include absent answers, conflicting versions, paraphrases and permission-restricted material, not only questions the system can answer easily.
- Failure taxonomy :: Classify errors as missing source, broken chunk, poor ranking, unsupported answer or permission leak to choose the next targeted change.
- Holdout and controlled comparison :: Change one meaningful variable, rerun fixed cases and keep results; avoid tuning solely to examples already shown to the model.

## Examples

- The assistant answers 18 of 20 common questions but fabricates two unsupported answers. Those two failures are critical despite the high overall percentage.

## Takeaways

- Fixed cases; retrieval hit rate; faithfulness; negative cases.

## Sources and Further Reading

- **Start here (free): [OpenAI — Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)** — Read **Example: Q&A over docs**; **Handle edge cases**. Provides a document-Q&A evaluation design and a reason to include adversarial and unusual inputs; adapt the example goals to your own risk tolerance. **Apply:** Create five rows of the 20-case sheet, including unsupported and permission-boundary questions.
- **Optional reference (free): [Ragas — Context Recall](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_recall/)** — Read **Context Recall**; **ID BasedContext Recall**. Explains checking retrieved evidence against a reference; ID-based recall is useful when expected passage identifiers are known. This is not identical to the simpler per-question hit rate. **Apply:** For one question, list all required passage IDs and which were actually retrieved.
- **Optional reference (free): [Ragas — Faithfulness](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/)** — Read **How It’s Calculated**. Separately scores supported answer claims, helping diagnose a fluent answer that ignores otherwise correct retrieved context. **Apply:** Classify one failure as retrieval miss or unsupported generation and identify the appropriate fix.

## Flashcards

- Q: Why score retrieval and answer generation separately?
  A: They fail for different reasons and need different fixes.

## Revision Questions

- Why score retrieval and answer generation separately?
