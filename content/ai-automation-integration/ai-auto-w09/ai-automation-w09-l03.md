---
schema_version: 1
type: lesson
id: ai-automation-w09-l03
title: Backups and recovery drill
course_id: ai-automation-integration
module_id: AI-AUTO-W09
order: 3
estimated_minutes: 35
---

# Backups and recovery drill

## Objective

Understand and apply backups and recovery drill in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

A backup is only useful if you can restore it. Decide a recovery-point target and a recovery-time target appropriate to the pilot. Back up the database and any workflow configuration needed to reproduce operations; keep a copy separate from the VPS. Test a restore to a temporary database, verify record counts and open the app against restored data. Record commands, owners and the last successful drill. A file existing on disk is not evidence of a successful backup. Do not copy real customer data into an insecure test environment.

**Worked example**

The VPS disk fails on Tuesday. A tested Monday-night backup can be restored; the owner understands that Tuesday’s entries need checking.

**Try it**

Write a recovery checklist and perform a restore using fictional data. Note the elapsed time and any missing configuration.

**Key point**

Backup, off-host copy, restore test, documented recovery.

## Key Concepts

- Recovery-point target :: State how much recent data loss the pilot can tolerate, making the backup schedule and possible missing entries explicit to the owner.
- Recovery-time target :: State how long restoration may take, then time a realistic drill rather than assuming the existence of a backup meets the target.
- Complete off-host backup :: Keep a separate copy of the database, workflow configuration and required recovery secrets such as the n8n encryption key, with appropriate protection.
- Restore verification :: Restore into an isolated environment with fictional data, check record counts and application behaviour, and record the commands, owner and last successful drill.

## Examples

- The VPS disk fails on Tuesday. A tested Monday-night backup can be restored; the owner understands that Tuesday’s entries need checking.

## Takeaways

- Backup, off-host copy, restore test, documented recovery.

## Sources and Further Reading

- **Start here (free): [PostgreSQL — SQL Dump](https://www.postgresql.org/docs/current/backup-dump.html)** — Read **SQL Dump**; **Restoring the Dump**; **Using pg_dumpall**. Explains dump/restore formats, required roles and restore error handling; a dump file alone does not prove a usable application has been recovered. **Apply:** Write a fictional-data restore checklist that checks command errors, counts and a view in the app.
- **Optional reference (free): [n8n — Back up and restore](https://docs.n8n.io/deploy/host-n8n/keep-n8n-running/backup-and-restore)** — Read **What a complete backup includes**; **What a CLI backup doesn't contain**; **Restore the full instance**. Shows why workflow exports alone are insufficient: the instance database, deployment configuration and credential encryption key can be essential. **Apply:** List every recovery artefact needed if the VPS and its local volume disappear.

## Flashcards

- Q: How do you know a backup works?
  A: Restore it in a safe environment and verify application-relevant data and configuration.

## Revision Questions

- How do you know a backup works?
