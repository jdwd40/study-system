---
schema_version: 1
type: lesson
id: ai-101-embeddings-and-vector-representations
title: Embeddings and Vector Representations
course_id: ai-engineering
module_id: AI-101
order: 3
estimated_minutes: 55
---

# Embeddings and Vector Representations

## Objective

Understand embeddings as meaning-bearing vectors and their role in retrieval.

## Content

An embedding model maps text to a high-dimensional vector such that semantic similarity becomes geometric proximity: texts about the same thing land near each other even with no shared words. This is what makes "search by meaning" possible.

Embeddings power retrieval: embed documents once, embed the query at runtime, find nearest neighbours (cosine similarity), and put the results into the model's context. That pipeline — retrieval-augmented generation — grounds answers in your data without fine-tuning. The embedding space is fixed by the model that made it; mixing vectors from different embedding models is meaningless.

## Key Concepts

- Embedding
- Vector space
- Cosine similarity
- Semantic search
- Retrieval-augmented generation

## Examples

- "How do I reset my password?" retrieves "account credential recovery" with zero shared words
- A vector DB stores document embeddings; a query embedding finds the k nearest

## Takeaways

- Embeddings turn meaning into geometry
- RAG = embed, retrieve nearest, stuff context — no weight changes

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (AI Engineering)
- OpenAI embeddings guide
- Johnson, Douze, Jégou — FAISS (nearest-neighbour search)

## Flashcards

- Q: What does an embedding encode?
  A: Meaning as a position in a high-dimensional vector space; similar meanings sit close together.
- Q: What is RAG in three steps?
  A: Embed documents, retrieve nearest neighbours to the query embedding, place them in the model's context.

## Revision Questions

- Why can't you mix vectors from different embedding models?
- Where in RAG could quality silently degrade?
