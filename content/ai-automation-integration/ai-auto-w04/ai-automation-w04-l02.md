---
schema_version: 1
type: lesson
id: ai-automation-w04-l02
title: Credentials, failures and execution history
course_id: ai-automation-integration
module_id: AI-AUTO-W04
order: 2
estimated_minutes: 35
---

# Credentials, failures and execution history

## Objective

Understand and apply credentials, failures and execution history in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Store credentials in the workflow tool’s credential mechanism and restrict instance access. Review execution history: many tools retain payloads that may contain personal information. Decide what to redact and how long data should persist. Configure a separate error path that reports workflow ID, failed stage and event ID without dumping full messages. A workflow is incomplete until you can explain its failure path and safely rerun an affected event. Protect public webhooks with provider authentication or a server gate; a hidden URL is not authentication.

**Worked example**

The notification node fails after the enquiry row was saved. The record remains pending, the failure is visible and a rerun does not create a second record.

**Try it**

Write a failure checklist for each workflow node: saved state, retry policy, person to notify and safe rerun method.

**Key point**

Credential scope; error path; retention; safe reruns.

## Key Concepts

- Credential scope; error path; retention; safe reruns. :: Separates credential scope from workflow logic, preserves useful failure history without sensitive data, and makes reruns safe and intentional.

## Examples

- The notification node fails after the enquiry row was saved. The record remains pending, the failure is visible and a rerun does not create a second record.

## Takeaways

- Credential scope; error path; retention; safe reruns.

## Sources and Further Reading

- [Official documentation](https://docs.n8n.io/)
- https://docs.n8n.io/

## Flashcards

- Q: Why inspect workflow execution retention?
  A: Stored execution payloads can contain customer details and may persist longer than intended.

## Revision Questions

- Why inspect workflow execution retention?
