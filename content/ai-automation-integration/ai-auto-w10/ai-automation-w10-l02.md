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

- Show source, proposal and state; accessible actions.

## Examples

- The owner sees a task suggestion but the source lacks a date. The UI labels the date unknown and prompts for it before scheduling.

## Takeaways

- Show source, proposal and state; accessible actions.

## Sources and Further Reading

- [Official documentation](https://react.dev/learn)
- https://react.dev/learn

## Flashcards

- Q: How should a missing customer date be displayed?
  A: Show answer As unknown or requiring input; never as an invented value that looks confirmed.

## Revision Questions

- How should a missing customer date be displayed?
