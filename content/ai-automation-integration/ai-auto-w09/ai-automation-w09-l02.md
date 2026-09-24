---
schema_version: 1
type: lesson
id: ai-automation-w09-l02
title: TLS, secrets and least privilege
course_id: ai-automation-integration
module_id: AI-AUTO-W09
order: 2
estimated_minutes: 35
---

# TLS, secrets and least privilege

## Objective

Understand and apply tls, secrets and least privilege in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Terminate HTTPS at a maintained reverse proxy. Use distinct service credentials and limit database roles to what each component requires. Supply secrets at runtime rather than committing them; rotate them if exposed. Lock down admin surfaces and make logs useful without spilling tokens or customer messages. A simple threat review asks who can call each endpoint, who can read each record and what happens if one credential leaks. Security here is practical engineering: the business relies on the service remaining available and customer data staying controlled.

**Worked example**

The public form can create enquiries but cannot query the whole customer table; only a signed-in owner can approve outgoing drafts.

**Try it**

Make a table for public visitor, owner, workflow service and database administrator. List allowed actions and credentials for each.

**Key point**

HTTPS; scoped credentials; protected admin; redacted logs.

## Key Concepts

- HTTPS; scoped credentials; protected admin; redacted logs.

## Examples

- The public form can create enquiries but cannot query the whole customer table; only a signed-in owner can approve outgoing drafts.

## Takeaways

- HTTPS; scoped credentials; protected admin; redacted logs.

## Sources and Further Reading

- [Official documentation](https://docs.docker.com/compose/how-tos/production/)
- https://docs.docker.com/compose/how-tos/production/

## Flashcards

- Q: Why use separate service accounts?
  A: A compromised component is then limited to its own authorised actions.

## Revision Questions

- Why use separate service accounts?
