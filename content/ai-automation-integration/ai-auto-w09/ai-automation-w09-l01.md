---
schema_version: 1
type: lesson
id: ai-automation-w09-l01
title: Deploy on a small VPS
course_id: ai-automation-integration
module_id: AI-AUTO-W09
order: 1
estimated_minutes: 35
---

# Deploy on a small VPS

## Objective

Understand and apply deploy on a small vps in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A small deployment can use a Node service, PostgreSQL, n8n and a reverse proxy on a VPS. Define a network boundary and expose only the public routes needed. Prefer a Compose file, persistent database volume, explicit health checks and separate configuration for production. Keep API and database credentials outside source control. A health endpoint should prove the service process responds; a deeper readiness check can verify dependencies. Know how to update the service, view logs and roll back a bad release. The size of the server is less important than knowing its recovery path.

**Worked example**

After reboot, the services restart and the public enquiry form works. The database is not exposed as a public port.

**Try it**

Draw your deployment and mark public ports, internal services, volumes, credentials and backup destination.

**Key point**

Small stack; internal DB; health; restart; rollback.

## Key Concepts

- Small stack; internal DB; health; restart; rollback. :: Keeps deployment small and private by default: internal database, health checks, restart procedure, and a tested rollback path.

## Examples

- After reboot, the services restart and the public enquiry form works. The database is not exposed as a public port.

## Takeaways

- Small stack; internal DB; health; restart; rollback.

## Sources and Further Reading

- [Official documentation](https://docs.docker.com/compose/how-tos/production/)
- https://docs.docker.com/compose/how-tos/production/

## Flashcards

- Q: What is the purpose of a readiness check?
  A: To indicate whether the service can actually handle work that depends on required components.

## Revision Questions

- What is the purpose of a readiness check?
