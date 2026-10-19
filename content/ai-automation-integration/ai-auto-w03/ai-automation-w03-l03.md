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

- Bounded retry :: Retry transient failures with an attempt limit, backoff and jitter; invalid input or denied permission requires correction, not endless repetition.
- Durable job state :: Keep an operation key, attempt count, last error and terminal failed state so work can outlive the HTTP request and remain recoverable.
- Idempotent execution :: Reuse one operation identifier across attempts and make the executor avoid repeating an already completed side effect.
- Structured observability :: Record request or job ID, status, duration and error class without unnecessary personal payloads so failures can be traced.
- Actionable alert and runbook :: Alert on stuck queues, bursts of failures and overdue approvals, with a named owner and safe recovery instructions.

## Examples

- An email provider returns 429. The draft remains pending and the send job is retried later; a 400 invalid address is routed for human correction.

## Takeaways

- Bounded retries; idempotency; structured events; dead-letter state.

## Sources and Further Reading

- **Start here (free): [AWS Builders’ Library — Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)** — Read **Retries and backoff**; **Jitter**. Explains how unbounded or synchronised retries amplify an outage and why side effects require care. **Apply:** Define an attempt limit and retry delay policy for a rate-limited email job.
- **Optional reference (free): [GOV.UK — Monitoring the status of your service](https://www.gov.uk/service-manual/technology/monitoring-the-status-of-your-service)** — Read **Metrics to monitor**; **Writing alerts**; **Processing and recording issues**. Connects useful monitoring to understandable alerts, issue ownership and operational documentation. **Apply:** Draft an alert and three-step runbook for a queue whose oldest pending job is overdue.

## Flashcards

- Q: Why should a 400 validation failure not be retried indefinitely?
  A: The same invalid request will fail repeatedly until the input is corrected.

## Revision Questions

- Why should a 400 validation failure not be retried indefinitely?
