---
schema_version: 1
type: lesson
id: ai-automation-w06-l03
title: Business data, permissions and retention
course_id: ai-automation-integration
module_id: AI-AUTO-W06
order: 3
estimated_minutes: 35
---

# Business data, permissions and retention

## Objective

Understand and apply business data, permissions and retention in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Treat customer data and internal documents as information with owners, permissions and retention rules. Use fictional or consented sample data during study. Before sending real client content to any model provider, agree what may be processed, review provider terms and data handling, and apply the organisation’s privacy requirements. Collect only fields needed for the workflow; avoid logging full messages when IDs and error classes suffice. Document deletion and re-indexing so removed policies no longer appear in answers. For UK client work, read current ICO guidance and seek appropriate advice for the actual business.

**Worked example**

An employee leaves. Their access is revoked in the app and document retrieval immediately respects it; the answer cache must also be considered.

**Try it**

Make a data inventory: source, purpose, who can read it, external processors, retention and deletion path.

**Key point**

Purpose, least data, permissions, retention, deletion.

## Key Concepts

- Purpose and data minimisation :: Name the business purpose and owner for each data item and collect only fields needed for that workflow.
- Access boundary :: Apply current permissions to records, retrieved passages and cached answers; revocation must not leave an alternative path to restricted content.
- External processing review :: Before using real client messages, agree permitted processing and review provider terms, data handling and organisational privacy requirements.
- Retention and deletion path :: Define how long messages and logs persist and how deletion invalidates source documents, chunks, search representations and cached answers.
- Safe study data :: Use fictional examples or appropriately authorised sample data and seek suitable advice for real UK data-protection decisions rather than assuming study permission covers production use.

## Examples

- An employee leaves. Their access is revoked in the app and document retrieval immediately respects it; the answer cache must also be considered.

## Takeaways

- Purpose, least data, permissions, retention, deletion.

## Sources and Further Reading

- **Start here (free): [ICO — A guide to the data protection principles](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/)** — Read **What are the principles?**. Grounds the inventory in purpose limitation, data minimisation, storage limitation, security and accountability. Guidance is not a substitute for advice on the actual client arrangement. **Apply:** For each inventory row, justify its purpose, readers and retention period.
- **Optional reference (free): [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)** — Read **Enforce Least Privileges**; **Validate the Permissions on Every Request**. Turns document ownership and access revocation into checks enforced on every request, not just a one-time login. **Apply:** Test a former employee against document retrieval and an existing answer cache.

## Flashcards

- Q: What should happen when a source document is deleted?
  A: Its chunks and search representation should be removed or invalidated so it cannot keep appearing in answers.

## Revision Questions

- What should happen when a source document is deleted?
