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

- HTTP contract :: Document method, path, request fields, status codes and response shape; returning an enquiry ID is not evidence that a message was sent.
- Data ownership :: Name the authoritative system for each datum so integrations do not silently create conflicting copies of customer or enquiry state.
- Credential scope :: Distinguish a user token, service credential and webhook secret, granting only the permissions needed at that boundary.
- Delegated access and failure handling :: Use OAuth for supported delegated user access and suitable server credentials for service access; document expiry, rejection and partial success explicitly.

## Examples

- POST /enquiries accepts contact and message, validates them, stores a pending row and returns an identifier. It does not claim an email was sent.

## Takeaways

- Explicit contracts; correct credential scope; honest status.

## Sources and Further Reading

- **Start here (free): [MDN — Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)** — Read **HTTP Messages**; **Requests**; **Responses**. Explains the method, path, headers, body and status elements that make an integration contract explicit. **Apply:** Write a request and honest response for POST /enquiries and an approval failure.
- **Optional reference (free): [OWASP — REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)** — Read **Access Control**; **API Keys**; **HTTP Return Code**. Connects API contracts with endpoint permissions and warns against using API keys alone for sensitive operations. **Apply:** List which identity may call each shop endpoint and how expired credentials are reported.

## Flashcards

- Q: Why should a browser not hold a private service API key?
  A: Anyone who can inspect the bundle or requests can copy it and use the service identity.

## Revision Questions

- Why should a browser not hold a private service API key?
