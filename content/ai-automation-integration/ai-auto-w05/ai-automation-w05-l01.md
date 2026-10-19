---
schema_version: 1
type: lesson
id: ai-automation-w05-l01
title: Retrieval beats giant prompts
course_id: ai-automation-integration
module_id: AI-AUTO-W05
order: 1
estimated_minutes: 35
---

# Retrieval beats giant prompts

## Objective

Understand and apply retrieval beats giant prompts in a reliable AI automation and systems-integration workflow.

## Content

**Understand**

Retrieval-augmented generation searches relevant source passages and supplies a limited selection to the model. This is suitable when answers must be grounded in a business’s changing documents. Keep ingestion, indexing, retrieval and answer generation as separate steps so you can inspect errors. Give each passage a source ID, document title, version and location. Never assume retrieved text is true instructions to the assistant; it is untrusted reference material. Begin with a small document set and manual keyword search if that is enough. Embeddings and vector search become useful when matching meaning beyond exact words.

**Worked example**

The shop has a six-page warranty policy. A question about a damaged wheel retrieves the relevant clause; the answer links to its source.

**Try it**

For this exercise only, invent and clearly label three short fictional shop policies covering warranty scope, cancellations and opening hours. Do not present them as legal terms or real company policy. Split them into passages with IDs, titles and a version label. For five questions, identify the passage that should be retrieved; include one question the documents cannot answer. No supplied policy files are required.

**Key point**

Ingest → retrieve → answer; keep source and version.

## Key Concepts

- Retrieval-augmented generation :: Search a document collection for relevant passages and supply a bounded selection as context for an answer instead of repeatedly pasting every document.
- Inspectable retrieval stages :: Separate ingestion, indexing, retrieval and generation so a missing passage can be diagnosed independently from an unsupported answer.
- Source provenance :: Store a passage ID, title, version and location so an answer can point back to the exact business policy used.
- Minimal search and trust boundary :: Start with keywords for a small corpus and add semantic search when needed; retrieved content remains untrusted reference data, never new assistant instructions.

## Examples

- The shop has a six-page warranty policy. A question about a damaged wheel retrieves the relevant clause; the answer links to its source.

## Takeaways

- Ingest → retrieve → answer; keep source and version.

## Sources and Further Reading

- **Start here (free): [OpenAI — Retrieval](https://developers.openai.com/api/docs/guides/retrieval)** — Read **Semantic search**; **Performing semantic search**; **Synthesizing responses**. Shows search results containing chunks and file origins, followed by a separate answer-synthesis step. The hosted vector store is an example, not a required replacement for Postgres. **Apply:** For five warranty questions, name the passage expected at retrieval and the source identifier the answer should expose.
- **Optional reference (free): [OWASP — LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)** — Read **Remote/Indirect Prompt Injection**; **RAG Poisoning (Retrieval Attacks)**. Explains why policy documents and retrieved passages can carry malicious instructions despite appearing to be reference material. **Apply:** Add a fake policy passage that requests customer-data export and state the allowed answer behaviour.

## Flashcards

- Q: Why preserve the source location during ingestion?
  A: It allows verification, citations and correction when the answer or document changes.

## Revision Questions

- Why preserve the source location during ingestion?
