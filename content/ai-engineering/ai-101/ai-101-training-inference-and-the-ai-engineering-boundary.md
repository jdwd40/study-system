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

A neural network is a parameterised computation: layers transform numeric inputs using learned weights and nonlinear operations. Training computes predictions, measures mismatch with a loss function, and uses an optimiser to update parameters. A loss is a learning signal, not a direct measure of every product quality: lower training loss does not by itself prove that a support assistant is safe or useful.

Pretraining learns broad patterns from a large dataset; fine-tuning continues training from an existing model for a more specific objective or domain. Both change learned parameters, although some fine-tuning methods update only a subset or added adapter parameters. Hugging Face distinguishes these stages and explains self-supervised language modelling, where targets can be derived from the text rather than manually labelled.[13]

Inference applies a trained model to an input. In ordinary serving, that request does not update its learned parameters. Intermediate activations, cached attention state and stored conversation history can change without being weight updates. Training is not necessarily rare and inference is not necessarily fast: production models can be retrained frequently, and a large or long-running inference can be expensive. Google treats training frequency and batch-versus-on-demand inference as separate choices.[14][15]

For this course, AI engineering focuses on useful systems around models: data and context, integration, evaluation, latency, cost, reliability and operations. This is a teaching emphasis, not a research/engineering wall; product teams also engineer fine-tuning pipelines. Start with a measured baseline and a small held-out test set. Try context or retrieval when needed information is missing; consider fine-tuning when repeated task behaviour remains inadequate and suitable training data, evaluation and operational capacity exist. Longer prompts also have cost and latency, so context is not automatically the cheapest or sufficient solution.

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (AI Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Neural network :: A layered, parameterised function that transforms numeric inputs into representations and predictions. Training learns useful parameter values rather than hand-writing every decision rule.
- Training :: Optimising learned parameters against a data-derived objective, usually through repeated loss computation and updates. Its cost and frequency depend on model, data and update strategy.
- Loss function :: A numerical objective measuring a training error or preference to optimise. It is a proxy for desired behaviour and must be complemented by evaluation on relevant examples.
- Inference :: Applying a trained model to inputs to produce outputs; ordinary serving does not update weights. It can run on demand or in batches and can be slow or costly.[15]
- Weights :: Learned model parameters. Prompts change computation and outputs without directly rewriting those parameters; external memory and caches are not the same as learned weights.
- Context versus fine-tuning :: Context supplies information for a particular invocation; fine-tuning updates learned parameters or trainable adapters across examples. They can be combined and should be compared through task evaluation.
- AI engineering boundary :: This course emphasises building and operating model-based products, not training a foundation model from scratch. Evaluation, data, integration and sometimes fine-tuning are engineering work too.

## Examples

- Adding a policy document to a prompt changes context. Optimising an adapter on demonstrations is fine-tuning. Saving a chat message in a database is persistence, not either kind of parameter update.
- A support bot misses a newly changed refund rule: first check whether the rule reaches retrieval and context before deciding that weights need updating.
- For a repetitive formatting task, compare a clearer prompt and schema validation with fine-tuning on checked examples; measure task success and serving cost rather than assuming one approach wins.

## Takeaways

- Training updates learned parameters; ordinary inference uses them without a training update.
- Loss, product quality and operational cost are different things to measure.
- Choose context, retrieval or fine-tuning from the observed failure and evaluation evidence.

## Sources and Further Reading

- **Start here — [Hugging Face LLM Course — How do Transformers work?](https://huggingface.co/learn/llm-course/chapter1/4).[13]** Read: “Transformers are language models” and “Transfer Learning”, including the pretraining-versus-fine-tuning explanation. Why: explains how broad pretrained capability differs from task adaptation. Try: Classify adding a document, changing a prompt and updating an adapter by whether learned parameters change. Access: Free public reading; no account needed.
- **Optional correction and practice — [Google ML Crash Course — Static versus dynamic training](https://developers.google.com/machine-learning/crash-course/production-ml-systems/static-vs-dynamic-training).[14]** Read: the definitions, comparison table and monitoring examples for static versus dynamic training. Why: corrects the idea that training must be rare or solely a research activity. Try: Choose a plausible retraining cadence for one changing dataset and name a signal that would trigger review. Access: Free public reading; no account needed.
- **Optional operational depth — [Google ML Crash Course — Static versus dynamic inference](https://developers.google.com/machine-learning/crash-course/production-ml-systems/static-vs-dynamic-inference).[15]** Read: the definitions and advantages/disadvantages of static versus dynamic inference. Why: separates when predictions are computed from how often a model is trained. Try: Compare precomputing document embeddings with answering a new user query on demand; identify one latency and freshness trade-off. Access: Free public reading; no account needed.

## Flashcards

- Q: Training vs inference in one sentence each?
  A: Training updates weights from data; inference runs frozen weights to produce outputs.
- Q: Context vs fine-tuning?
  A: Context changes behaviour per-request without touching weights; fine-tuning updates the weights themselves.

## Revision Questions

- Which product responsibilities sit around inference, and which might require a training pipeline?
- When would fine-tuning be justified over better context?
