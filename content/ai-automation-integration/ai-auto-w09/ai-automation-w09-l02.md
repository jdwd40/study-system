---
schema_version: 1
type: lesson
id: ai-automation-w09-l02
title: TLS, secrets and least privilege
course_id: ai-automation-integration
module_id: AI-AUTO-W09
order: 2
estimated_minutes: 35
---

# TLS, secrets and least privilege

## Objective

Understand and apply tls, secrets and least privilege in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Terminate HTTPS at a maintained reverse proxy. Use distinct service credentials and limit database roles to what each component requires. Supply secrets at runtime rather than committing them; rotate them if exposed. Lock down admin surfaces and make logs useful without spilling tokens or customer messages. A simple threat review asks who can call each endpoint, who can read each record and what happens if one credential leaks. Security here is practical engineering: the business relies on the service remaining available and customer data staying controlled.

**Worked example**

The public form can create enquiries but cannot query the whole customer table; only a signed-in owner can approve outgoing drafts.

**Try it**

Make a table for public visitor, owner, workflow service and database administrator. List allowed actions and credentials for each.

**Key point**

HTTPS; scoped credentials; protected admin; redacted logs.

## Key Concepts

- TLS termination :: Use a maintained reverse proxy to provide HTTPS and certificate renewal; transport encryption does not by itself authorise application actions.
- Least-privilege service identity :: Give each component distinct credentials and only the database permissions and API actions needed for its role.
- Runtime secret lifecycle :: Supply secrets outside source control, restrict which service receives each one and rotate any value that has been exposed.
- Protected administration :: Require appropriate authentication and authorisation for admin and approval routes instead of exposing them with the public enquiry form.
- Threat review and redacted logs :: Ask who can call endpoints or read records and what one leaked credential enables, while keeping tokens and customer messages out of diagnostics.

## Examples

- The public form can create enquiries but cannot query the whole customer table; only a signed-in owner can approve outgoing drafts.

## Takeaways

- HTTPS; scoped credentials; protected admin; redacted logs.

## Sources and Further Reading

- **Start here (free): [Caddy — Automatic HTTPS](https://caddyserver.com/docs/automatic-https)** — Read **Activation**; **Effects**; **Hostname requirements**. Explains when automatic certificate management and HTTPS redirects activate; actual DNS and network conditions still need checking. **Apply:** Mark where HTTPS terminates and what must be true of the public hostname.
- **Optional reference (free): [Docker — Manage secrets securely in Docker Compose](https://docs.docker.com/compose/how-tos/use-secrets/)** — Read **Use secrets**; **Single-service secret injection**. Shows explicit per-service secret access through mounted files. Protect the source secret file too; this is not automatic encryption of host storage. **Apply:** Draw which of the API, workflow and database services needs each secret.
- **Optional reference (free): [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)** — Read **Enforce Least Privileges**; **Verify that Authorization Checks are Performed in the Right Location**. Links the role table to trusted server-side enforcement rather than hiding privileged buttons in the browser. **Apply:** Test that a public visitor can submit an enquiry but cannot list customers or approve a reply.

## Flashcards

- Q: Why use separate service accounts?
  A: A compromised component is then limited to its own authorised actions.

## Revision Questions

- Why use separate service accounts?
