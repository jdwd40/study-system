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

- Managed credential :: Store connection secrets in the tool’s credential mechanism, limit their scope and protect access to the workflow instance.
- Execution retention :: Decide which execution payloads to save, what to redact and when to prune them; history may contain customer messages.
- Separate error path :: Report workflow, failed stage and event identifiers through a failure workflow without dumping the full customer payload.
- Safe rerun :: Inspect saved state before replaying an event so a failure after persistence does not create a second enquiry or notification.
- Authenticated webhook boundary :: Protect public triggers with provider authentication or a server gate; obscurity of a webhook URL is not access control.

## Examples

- The notification node fails after the enquiry row was saved. The record remains pending, the failure is visible and a rerun does not create a second record.

## Takeaways

- Credential scope; error path; retention; safe reruns.

## Sources and Further Reading

- **Start here (free): [n8n — Handle errors gracefully](https://docs.n8n.io/flow-logic/error-handling/)** — Read **How do I set up an error workflow?**; **What data does an error workflow receive?**. Shows how Error Trigger workflows receive failure information and how to route an actionable alert. **Apply:** Choose the identifiers to include when notification fails after the enquiry was stored.
- **Optional reference (free): [n8n — Manage execution data](https://docs.n8n.io/hosting/scaling/execution-data/)** — Read **Reduce saved data**; **Enable executions pruning**. Documents saving and pruning controls; saving errors can still retain sensitive inputs, so retention is a deliberate choice. **Apply:** Write the minimum useful history and retention policy for the shop pilot.
- **Optional reference (free): [n8n — Create and edit credentials](https://docs.n8n.io/credentials/add-edit-credentials/)** — Read **Create a credential**; **Allowed HTTP request domains**. Explains reusable credential records and restrictions on where an HTTP Request node can use them. **Apply:** Name a service credential by purpose and list its allowed API domains.

## Flashcards

- Q: Why inspect workflow execution retention?
  A: Stored execution payloads can contain customer details and may persist longer than intended.

## Revision Questions

- Why inspect workflow execution retention?
