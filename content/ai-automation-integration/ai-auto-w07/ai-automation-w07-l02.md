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

## Understand

Approval must refer to the exact content and operation being approved. Store a snapshot or version so a draft cannot change after a person signs off. Show the recipient, contents, side effects and any attachments. Recheck permissions and current state at execution time; approval from an old state may no longer be valid. Give a reviewer a reject and edit route. Audit only what is needed: actor, action ID, timestamp, outcome and reference to approved content. For outgoing messages, favour a draft-only default in the first pilot.

## Worked example

The owner approves a quote draft. Before sending, the customer record changes and the quote amount differs. The system blocks the stale approval.

## Try it

Draw the approve flow: create snapshot, display, approve, revalidate, execute, record outcome. Define two conditions that invalidate approval.

## Key point

Approve exact version; revalidate before side effects.

## Key Concepts

- Approve exact version; revalidate before side effects.

## Examples

- The owner approves a quote draft. Before sending, the customer record changes and the quote amount differs. The system blocks the stale approval.

## Takeaways

- Approve exact version; revalidate before side effects.

## Sources and Further Reading

- [Official documentation](https://platform.openai.com/docs/guides/function-calling)
- https://platform.openai.com/docs/guides/function-calling

## Flashcards

- Q: Why revalidate after approval?
  A: > State and permissions may change between the review and the actual side effect.

## Revision Questions

- Why revalidate after approval?
