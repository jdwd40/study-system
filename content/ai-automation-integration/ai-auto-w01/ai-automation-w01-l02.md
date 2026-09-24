---
schema_version: 1
type: lesson
id: ai-automation-w01-l02
title: Call a model from TypeScript
course_id: ai-automation-integration
module_id: AI-AUTO-W01
order: 2
estimated_minutes: 35
---

# Call a model from TypeScript

## Objective

Understand and apply call a model from typescript in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Treat a model API as an unreliable external dependency: it has credentials, usage costs, latency, request limits and occasional errors. Keep API keys on the server. Wrap the provider call behind one small function so the rest of your app receives a stable shape. Limit input length, set a timeout, handle cancellation and record an opaque request ID. Never log an entire customer message merely to debug a failure. First build with hard-coded fictional data; then swap the stub for a real API call. Check current provider documentation for exact parameters and supported models rather than copying old examples.

**Worked example**

For the shop, a function accepts a message and returns a short issue summary. A local fake implementation returns a fixed summary so the form and storage can be developed without API spend.

**Try it**

Sketch an interface for summariseEnquiry(input) and list success, timeout, invalid credentials and rate-limit outcomes. Implement a fake before attempting a paid call.

**Key point**

Server-side secret; typed adapter; timeout; small inputs; stub first.

## Key Concepts

- Server-side secret; typed adapter; timeout; small inputs; stub first.

## Examples

- For the shop, a function accepts a message and returns a short issue summary. A local fake implementation returns a fixed summary so the form and storage can be developed without API spend.

## Takeaways

- Server-side secret; typed adapter; timeout; small inputs; stub first.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/quickstart/make-your-first-api-request)
- https://platform.openai.com/docs/quickstart/make-your-first-api-request

## Flashcards

- Q: Why keep the provider call behind an adapter?
  A: Show answer It isolates changes in provider, model and error format from the business workflow.

## Revision Questions

- Why keep the provider call behind an adapter?
