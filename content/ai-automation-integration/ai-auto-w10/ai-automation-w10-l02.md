---
schema_version: 1
type: lesson
id: ai-automation-w10-l02
title: React review interface
course_id: ai-automation-integration
module_id: AI-AUTO-W10
order: 2
estimated_minutes: 35
---

# React review interface

## Objective

Understand and apply react review interface in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

The interface should make model suggestions easy to verify. Show the original enquiry next to extracted details and a proposed response. Visually separate generated text from saved facts and indicate missing or uncertain fields. Give clear approve, edit and reject actions with confirmation for meaningful side effects. Provide useful loading, empty and error states and keyboard-accessible controls. A dashboard is a thin layer over a well-defined API; its job is to reduce review effort, not hide uncertainty. Test the workflow on a narrow phone screen as well as desktop.

**Worked example**

The owner sees a task suggestion but the source lacks a date. The UI labels the date unknown and prompts for it before scheduling.

**Try it**

Sketch mobile and desktop versions of a review card. For each action, name the API request and immediate UI feedback.

**Key point**

Show source, proposal and state; accessible actions.

## Key Concepts

- Evidence/proposal separation :: Display the source enquiry beside extracted details and draft text, distinguishing saved facts from generated suggestions.
- Explicit uncertainty :: Label absent or uncertain fields as unknown or needing input rather than presenting an invented date as confirmed.
- Review action contract :: Give approve, edit and reject controls clear API operations and feedback, with confirmation where an action has meaningful side effects.
- Complete accessible UI state :: Provide loading, empty and error states as well as success, support keyboard interaction and check the review flow on both phone and desktop.

## Examples

- The owner sees a task suggestion but the source lacks a date. The UI labels the date unknown and prompts for it before scheduling.

## Takeaways

- Show source, proposal and state; accessible actions.

## Sources and Further Reading

- **Start here (free): [React — Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)** — Read **Step 1: Identify your component’s different visual states**; **Step 2: Determine what triggers those state changes**. Shows how to design empty, submitting, success and error states before wiring event logic. **Apply:** List the review card states after approve succeeds, fails or is still pending.
- **Optional reference (free): [W3C WAI-ARIA APG — Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)** — Read **Keyboard Interaction**; **WAI-ARIA Roles, States, and Properties**. Specifies activation, accessible naming and focus expectations; prefer native buttons rather than implementing a clickable div. **Apply:** Walk through approve and reject using only the keyboard and note where focus should remain or move.

## Flashcards

- Q: How should a missing customer date be displayed?
  A: As unknown or requiring input; never as an invented value that looks confirmed.

## Revision Questions

- How should a missing customer date be displayed?
