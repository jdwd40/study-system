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

## Understand

A visual workflow is useful for connecting triggers, simple transforms and services. Keep business rules that need thorough testing in your TypeScript service and call it from the workflow. Name each node by what it does, not by its default type. Record inputs and outputs and whether a node can create a side effect. Test first with a manual trigger and fictional data. An n8n workflow should be understandable from left to right and expose where a human approves a draft. Do not scatter the same validation across several nodes.

## Worked example

Form webhook → validate in Node API → classify → save record → create draft → notify owner. The classification adapter is shared by the API and tests.

## Try it

Sketch this six-stage workflow. Label the system responsible for each stage and mark all write operations.

## Key point

Orchestrate visibly; centralise reusable rules.

## Key Concepts

- Orchestrate visibly; centralise reusable rules.

## Examples

- Form webhook → validate in Node API → classify → save record → create draft → notify owner. The classification adapter is shared by the API and tests.

## Takeaways

- Orchestrate visibly; centralise reusable rules.

## Sources and Further Reading

- [Official documentation](https://docs.n8n.io/)
- https://docs.n8n.io/

## Flashcards

- Q: Which code belongs in the Node service?
  A: > Reusable validation and business rules that should be tested and applied consistently.

## Revision Questions

- Which code belongs in the Node service?
