---
schema_version: 1
type: lesson
id: ai-automation-w03-l01
title: HTTP APIs and auth boundaries
course_id: ai-automation-integration
module_id: AI-AUTO-W03
order: 1
estimated_minutes: 35
---

# HTTP APIs and auth boundaries

## Objective

Understand and apply http apis and auth boundaries in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

An API contract states method, path, request fields, status codes and response shape. Decide which system owns each datum before wiring services together. Distinguish a user token, service credential and webhook secret; each has different scope. Limit credentials to the smallest needed permissions and do not put secrets in browser bundles. OAuth is for delegated access to a user-owned service; an API key may be suitable for server-to-server access where the provider supports it. Document what to do when credentials expire, a provider rejects a call or a request only partly succeeds.

**Worked example**

POST /enquiries accepts contact and message, validates them, stores a pending row and returns an identifier. It does not claim an email was sent.

**Try it**

Draft a contract for POST /enquiries, GET /enquiries/:id and POST /enquiries/:id/approve with example success and failure responses.

**Key point**

Explicit contracts; correct credential scope; honest status.

## Key Concepts

- Explicit contracts; correct credential scope; honest status.

## Examples

- POST /enquiries accepts contact and message, validates them, stores a pending row and returns an identifier. It does not claim an email was sent.

## Takeaways

- Explicit contracts; correct credential scope; honest status.

## Sources and Further Reading

- [Official documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

## Flashcards

- Q: Why should a browser not hold a private service API key?
  A: Show answer Anyone who can inspect the bundle or requests can copy it and use the service identity.

## Revision Questions

- Why should a browser not hold a private service API key?
