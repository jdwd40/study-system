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

- Server-side secret :: Keep the provider API key in server configuration, never in browser code or logs; it grants access under the service identity.
- Typed provider adapter :: Hide provider-specific models, parameters and errors behind a small interface so the rest of the app receives a stable result.
- Bounded external call :: Limit input length and waiting time, support cancellation, and handle rate limits or provider errors without treating the model as always available.
- Privacy-aware diagnostics :: Use an opaque request identifier and error class to trace a failure without logging the entire customer message.
- Stub-first development :: Build the form and storage against a fake adapter with fictional inputs before introducing a paid, nondeterministic dependency.

## Examples

- For the shop, a function accepts a message and returns a short issue summary. A local fake implementation returns a fixed summary so the form and storage can be developed without API spend.

## Takeaways

- Server-side secret; typed adapter; timeout; small inputs; stub first.

## Sources and Further Reading

- **Start here (free): [OpenAI — Developer quickstart](https://developers.openai.com/api/docs/quickstart)** — Read **Create and export an API key**; **Install the OpenAI SDK and Run an API Call**. Read the JavaScript tab for the current server-side SDK shape; reading is free, but executing a real API call can cost money. **Apply:** Write a fake summariseEnquiry adapter matching the result shape you want before adding the SDK.
- **Optional reference (free): [Node.js — Global objects: cancellation](https://nodejs.org/api/globals.html)** — Read **Static method: AbortSignal.timeout(delay)**; **Static method: AbortSignal.any(signals)**. Explains deadline signals and combining cancellation sources for a bounded network request. Check support in your installed Node version. **Apply:** Describe how a timeout and a user cancellation produce distinct adapter outcomes.

## Flashcards

- Q: Why keep the provider call behind an adapter?
  A: It isolates changes in provider, model and error format from the business workflow.

## Revision Questions

- Why keep the provider call behind an adapter?
