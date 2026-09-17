---
schema_version: 1
type: lesson
id: ai-101-training-inference-and-the-ai-engineering-boundary
title: Training, Inference and the AI Engineering Boundary
course_id: ai-engineering
module_id: AI-101
order: 1
estimated_minutes: 50
---

# Training, Inference and the AI Engineering Boundary

## Objective

Distinguish training from inference, and define where AI engineering begins.

## Content

Training adjusts a model's weights using data and a loss signal; it is slow, expensive and done rarely. Inference runs the frozen model to produce outputs; it is fast, repeated and what users touch. AI engineering is overwhelmingly inference-side work: building useful, reliable systems around models others trained.

The boundary matters because the disciplines differ. Training-side questions (architecture search, loss curves, gradient dynamics) belong to research; inference-side questions (context design, latency, cost, evaluation, failure modes) belong to engineering. Context changes behaviour without touching weights; fine-tuning changes weights. Choose context first — it is cheaper, reversible and usually sufficient.

## Key Concepts

- Training :: Adjusting a model's weights using data and a loss signal; slow, expensive and done rarely. It belongs mostly to research, not day-to-day product work.
- Inference :: Running the frozen model to produce outputs; fast, repeated and what users touch. This is where almost all AI engineering happens.
- Weights :: The model's learned parameters — changed by training or fine-tuning, never by context. Prompts can steer behaviour, but they never rewrite them.
- Context versus fine-tuning :: Context changes behaviour per request without touching weights; fine-tuning changes weights. Choose context first — it is cheaper, reversible and usually sufficient; reach for fine-tuning only when evidence shows context isn't enough.
- AI engineering boundary :: AI engineering is overwhelmingly inference-side work: context design, latency, cost, evaluation and failure modes around models others trained. Knowing which side of the boundary a problem sits on tells you which discipline applies.

## Examples

- Adding documents to a prompt = context engineering; updating weights on those documents = fine-tuning
- A support-bot quality problem is usually fixed with retrieval and prompts, not retraining

## Takeaways

- Engineering happens at inference: context, cost, latency, evaluation
- Prefer context over fine-tuning until evidence demands weights

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (AI Engineering)
- Karpathy, "Intro to Large Language Models" (talk)

## Flashcards

- Q: Training vs inference in one sentence each?
  A: Training updates weights from data; inference runs frozen weights to produce outputs.
- Q: Context vs fine-tuning?
  A: Context changes behaviour per-request without touching weights; fine-tuning updates the weights themselves.

## Revision Questions

- Why is most product AI work inference-side?
- When would fine-tuning be justified over better context?
