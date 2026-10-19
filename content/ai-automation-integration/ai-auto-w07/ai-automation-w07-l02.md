---
schema_version: 1
type: lesson
id: ai-automation-w07-l02
title: Permissions and human approval
course_id: ai-automation-integration
module_id: AI-AUTO-W07
order: 2
estimated_minutes: 35
---

# Permissions and human approval

## Objective

Understand and apply permissions and human approval in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Approval must refer to the exact content and operation being approved. Store a snapshot or version so a draft cannot change after a person signs off. Show the recipient, contents, side effects and any attachments. Recheck permissions and current state at execution time; approval from an old state may no longer be valid. Give a reviewer a reject and edit route. Audit only what is needed: actor, action ID, timestamp, outcome and reference to approved content. For outgoing messages, favour a draft-only default in the first pilot.

**Worked example**

The owner approves a quote draft. Before sending, the customer record changes and the quote amount differs. The system blocks the stale approval.

**Try it**

Draw the approve flow: create snapshot, display, approve, revalidate, execute, record outcome. Define two conditions that invalidate approval.

**Key point**

Approve exact version; revalidate before side effects.

## Key Concepts

- Approval snapshot :: Bind approval to an exact version of the recipient, content, attachments and operation so later edits cannot silently inherit permission.
- Informed review :: Show the proposed side effects and evidence clearly, with edit and reject routes; draft-only is a safe first-pilot default.
- Execution-time revalidation :: Recheck permissions and current state immediately before acting, invalidating stale approval when significant data has changed.
- Minimal action audit :: Record actor, action ID, timestamp, outcome and a reference to the approved version without unnecessarily copying sensitive content into logs.

## Examples

- The owner approves a quote draft. Before sending, the customer record changes and the quote amount differs. The system blocks the stale approval.

## Takeaways

- Approve exact version; revalidate before side effects.

## Sources and Further Reading

- **Start here (free): [OWASP — Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)** — Read **1.1 Transaction authorization method has to allow a user to identify and acknowledge significant transaction data**; **2.6 Transaction data should be protected against modification**; **2.8 System should check each transaction execution and make sure it has been properly authorized**. The transaction examples are financial, but the exact-content and final-gate principles transfer directly to approving an outgoing quote or reply. **Apply:** Specify which quote changes invalidate approval and where the executor checks the approved snapshot.
- **Optional reference (free): [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)** — Read **Verify that Authorization Checks are Performed in the Right Location**; **Implement Appropriate Logging**. Explains why a UI approval control must be backed by trusted server-side checks and an appropriate audit trail. **Apply:** Write a test that calls the send endpoint without going through the review screen.

## Flashcards

- Q: Why revalidate after approval?
  A: State and permissions may change between the review and the actual side effect.

## Revision Questions

- Why revalidate after approval?
