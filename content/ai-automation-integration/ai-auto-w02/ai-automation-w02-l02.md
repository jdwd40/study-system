---
schema_version: 1
type: lesson
id: ai-automation-w02-l02
title: Tool calling is a request for code to act
course_id: ai-automation-integration
module_id: AI-AUTO-W02
order: 2
estimated_minutes: 35
---

# Tool calling is a request for code to act

## Objective

Understand and apply tool calling is a request for code to act in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A model may propose a function name and arguments. Your application decides whether to run the function. Validate arguments, user identity, permissions and current state before every call. Allow-list the available tools and make side effects narrow. A read-only lookup is less consequential than creating a CRM record or sending a message. Treat model output as untrusted data even when it looks plausible. Preserve an audit entry showing which action was proposed, who approved it and whether it completed. The same distinction applies to “agents”: model reasoning may select actions, but code must enforce what is permitted.

**Worked example**

The shop assistant may look up opening hours but cannot email a customer until the owner presses Approve. An unrecognised function name is rejected.

**Try it**

Design lookupOpeningHours and draftReply tools. For each, list input validation, permissions, allowed side effects and failure response.

**Key point**

Allow-list tools; validate arguments; separate reads from writes.

## Key Concepts

- Allow-list tools; validate arguments; separate reads from writes.

## Examples

- The shop assistant may look up opening hours but cannot email a customer until the owner presses Approve. An unrecognised function name is rejected.

## Takeaways

- Allow-list tools; validate arguments; separate reads from writes.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/guides/structured-outputs)
- https://platform.openai.com/docs/guides/structured-outputs

## Flashcards

- Q: Who is responsible for deciding whether a model-proposed tool runs?
  A: The application, after validation and authorisation; the model only proposes.

## Revision Questions

- Who is responsible for deciding whether a model-proposed tool runs?
