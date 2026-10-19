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

- Deployment boundary :: Expose only required public routes through a reverse proxy while keeping the database and other internal services off public ports.
- Reproducible stack :: Describe Node, PostgreSQL, n8n and proxy services in Compose with explicit production configuration and runtime secrets outside source control.
- Persistent state :: Store database data on a persistent volume so recreating a service container does not discard business records.
- Liveness versus readiness :: A responding health endpoint can show the process is alive; readiness must also consider dependencies required to handle work.
- Operational recovery :: Document restart, logs, update and rollback steps and test the service after reboot rather than assuming a running container means a working system.

## Examples

- After reboot, the services restart and the public enquiry form works. The database is not exposed as a public port.

## Takeaways

- Small stack; internal DB; health; restart; rollback.

## Sources and Further Reading

- **Start here (free): [Docker — Use Compose in production](https://docs.docker.com/compose/how-tos/production/)** — Read **Modify your Compose file for production**; **Deploying changes**; **Running Compose on a single server**. Explains production-specific configuration and controlled service recreation for a small single-host deployment. **Apply:** Annotate the stack diagram with production-only settings, persistent storage and the service-update command boundary.
- **Optional reference (free): [Docker — Control startup and shutdown order in Compose](https://docs.docker.com/compose/how-tos/startup-order/)** — Read **Control startup**; **Example**. Shows that container start is not readiness and how a dependency healthcheck can gate startup. It does not replace ongoing application failure handling. **Apply:** Describe what the form should show while PostgreSQL is starting and after it becomes ready.

## Flashcards

- Q: What is the purpose of a readiness check?
  A: To indicate whether the service can actually handle work that depends on required components.

## Revision Questions

- What is the purpose of a readiness check?
