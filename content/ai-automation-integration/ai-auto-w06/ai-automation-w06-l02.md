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

- Fixed cases; retrieval hit rate; faithfulness; negative cases.

## Examples

- The assistant answers 18 of 20 common questions but fabricates two unsupported answers. Those two failures are critical despite the high overall percentage.

## Takeaways

- Fixed cases; retrieval hit rate; faithfulness; negative cases.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/guides/evals)
- https://platform.openai.com/docs/guides/evals

## Flashcards

- Q: Why score retrieval and answer generation separately?
  A: They fail for different reasons and need different fixes.

## Revision Questions

- Why score retrieval and answer generation separately?
