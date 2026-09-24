---
schema_version: 1
type: lesson
id: ai-automation-w03-l03
title: Retries, queues and observability
course_id: ai-automation-integration
module_id: AI-AUTO-W03
order: 3
estimated_minutes: 35
---

# Retries, queues and observability

## Objective

Understand and apply retries, queues and observability in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Transient failures may warrant a bounded retry with backoff and jitter; invalid input or denied permission will not improve by retrying. Queue work when it may outlive the HTTP request. Give each job an idempotency key, attempt count, last error and a terminal failed state. Record structured events containing request ID, status, duration and error class, while avoiding unnecessary personal data. Alert on the small number of things that matter: a stuck queue, a burst of failures and an overdue human approval. Make recovery instructions part of the workflow design.

**Worked example**

An email provider returns 429. The draft remains pending and the send job is retried later; a 400 invalid address is routed for human correction.

**Try it**

Classify five failures as retry, review or stop. Write a one-paragraph runbook for a queue that has stopped processing.

**Key point**

Bounded retries; idempotency; structured events; dead-letter state.

## Key Concepts

- Bounded retries; idempotency; structured events; dead-letter state. :: Retries transient failures only within bounds, makes work idempotent, and emits structured events so stuck or permanently failed jobs are visible.

## Examples

- An email provider returns 429. The draft remains pending and the send job is retried later; a 400 invalid address is routed for human correction.

## Takeaways

- Bounded retries; idempotency; structured events; dead-letter state.

## Sources and Further Reading

- [Official documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

## Flashcards

- Q: Why should a 400 validation failure not be retried indefinitely?
  A: The same invalid request will fail repeatedly until the input is corrected.

## Revision Questions

- Why should a 400 validation failure not be retried indefinitely?
