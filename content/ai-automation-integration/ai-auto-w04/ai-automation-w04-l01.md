---
schema_version: 1
type: lesson
id: ai-automation-w04-l01
title: n8n as an orchestrator
course_id: ai-automation-integration
module_id: AI-AUTO-W04
order: 1
estimated_minutes: 35
---

# n8n as an orchestrator

## Objective

Understand and apply n8n as an orchestrator in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A visual workflow is useful for connecting triggers, simple transforms and services. Keep business rules that need thorough testing in your TypeScript service and call it from the workflow. Name each node by what it does, not by its default type. Record inputs and outputs and whether a node can create a side effect. Test first with a manual trigger and fictional data. An n8n workflow should be understandable from left to right and expose where a human approves a draft. Do not scatter the same validation across several nodes.

**Worked example**

Form webhook → validate in Node API → classify → save record → create draft → notify owner. The classification adapter is shared by the API and tests.

**Try it**

Sketch this six-stage workflow. Label the system responsible for each stage and mark all write operations.

**Key point**

Orchestrate visibly; centralise reusable rules.

## Key Concepts

- Workflow orchestration :: Use connected nodes to make triggers, transformations and service calls visible as one left-to-right process.
- Centralised business rule :: Keep reusable validation and classification rules in a tested TypeScript service rather than duplicating them across workflow nodes.
- Node contract :: Give each node a descriptive name, expected input and output, responsible system and an explicit indication of possible write effects.
- Manual-first execution :: Use fictional data and a manual trigger while building; locate the human approval boundary before enabling automatic production triggers.

## Examples

- Form webhook → validate in Node API → classify → save record → create draft → notify owner. The classification adapter is shared by the API and tests.

## Takeaways

- Orchestrate visibly; centralise reusable rules.

## Sources and Further Reading

- **Start here (free): [n8n — Create and run workflows](https://docs.n8n.io/workflows/create/)** — Read **Create a workflow**; **Run workflows manually**; **Run workflows automatically**. Distinguishes constructing and manually testing a workflow from publishing it for automatic triggering. **Apply:** Sketch the six shop nodes and mark which remain manual during the pilot.
- **Optional reference (free): [n8n — HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)** — Read **Method**; **Authentication**; **Send Body**; **Timeout**. Shows the concrete configuration for calling a shared Node service rather than rebuilding its rules inside the visual workflow. **Apply:** Specify the validation node’s URL, body, credential and timeout without entering a real secret.

## Flashcards

- Q: Which code belongs in the Node service?
  A: Reusable validation and business rules that should be tested and applied consistently.

## Revision Questions

- Which code belongs in the Node service?
