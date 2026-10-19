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

An embedding is a learned numeric vector representing an item such as a token, sentence, document or image. For a retrieval model trained to put related texts near each other, geometry can be a useful proxy for semantic relevance; it is not a guarantee of meaning or truth. Static word embeddings and contextual token representations are not automatically interchangeable with sentence/document vectors produced for search. Google’s embedding-space examples show both useful relationships and limits of a single static representation for a word.[18]

In dense semantic search, prepare document chunks, encode them with an appropriate retrieval model, and index their vectors with identifiers and metadata. Encode the query into the compatible space and retrieve high-scoring candidates. A short question matched to a longer passage is an asymmetric task; choose a model and query/document encoding instructions suited to it. Match model/version, dimension, preprocessing and similarity metric. Equal vector length does not make unrelated embedding spaces comparable; raw vectors from unaligned models need a deliberate alignment or re-embedding, not blind mixing.[19]

Cosine similarity compares vector direction using the dot product divided by the product of vector lengths. Higher cosine means greater directional similarity, not higher factual confidence. Cosine is one scoring choice, not the definition of nearest-neighbour search. Faiss explains how normalising both query and stored vectors allows cosine ranking through inner-product search; using an unnormalised dot product is not generally the same thing.[20]

A basic retrieval-augmented generation (RAG) application adds retrieved passages to a generator’s input. That serving step can use fixed weights, but RAG is not inherently “no training”: the original Lewis et al. paper fine-tunes retrieval and generation components.[24] Retrieval may also use keyword or hybrid search. Good retrieval supports grounding; it does not ensure that an answer is correct. Check relevant-passage recall, chunk truncation, freshness, permissions and whether the answer actually follows its evidence.

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (AI Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Embedding :: A learned vector representation of an item. Relationships in its geometry reflect model training and task; they need not correspond perfectly to human semantic judgements.[18]
- Vector space :: The coordinate system and dimension in which vectors are compared. Query and document encoders must produce compatible representations; equal dimension alone is insufficient.
- Cosine similarity :: A directional comparison obtained by dividing a dot product by vector lengths. Normalisation matters when substituting inner-product search, and similarity is not a truth score.[20]
- Semantic search :: Retrieving candidates using learned semantic relationships, potentially despite different wording. It can miss exact identifiers or domain-specific meanings; evaluate against real queries.[19]
- Query/document encoding :: Preparing short queries and longer passages according to a compatible retrieval model’s instructions. Symmetric similarity and asymmetric question-to-passage search are different tasks.[19]
- Retrieval-augmented generation :: Conditioning generation on retrieved external information. A fixed-weight retrieval-to-context pipeline is one implementation; RAG may also include trained retrievers or fine-tuned generators.[24]

## Examples

- “How do I reset my password?” may retrieve “account credential recovery” despite no shared words; verify this on the chosen model rather than treating it as a guaranteed result.
- Store the embedding model/version and encoding settings with the index. On a model change, plan re-embedding or a validated compatible migration rather than comparing unrelated vectors.
- A highly similar but outdated policy can produce a wrong answer. Keep source dates and access permissions with chunks, and inspect the retrieved passages before blaming the generator.

## Takeaways

- Embeddings are useful learned representations, not universal meaning coordinates.
- Compatible encoding and the intended metric are prerequisites for meaningful ranking.
- RAG supplies evidence candidates; retrieval and answer faithfulness both need evaluation.

## Sources and Further Reading

- **Start here — [Google ML Crash Course — Embeddings: Translating to a lower-dimensional space](https://developers.google.com/machine-learning/crash-course/embeddings/embedding-space).[18]** Read: the embedding-space examples and the discussion of static word2vec representations with multiple word meanings. Why: provides a visual introduction without assuming similarity always captures meaning correctly. Try: Explain why one vector for “bank” can be inadequate; distinguish a word vector from a document-search embedding. Access: Free public reading; no account needed.
- **Optional practical depth — [Sentence Transformers — Semantic Search](https://sbert.net/examples/applications/semantic-search/README.html).[19]** Read: “Background”, “Symmetric vs. Asymmetric Semantic Search” and “Manual Implementation”. Why: gives the actual encode-query/encode-document/retrieve workflow and model-selection distinction. Try: Choose whether FAQ duplicate detection and question-to-manual search are symmetric or asymmetric. Access: Free public reading; no account needed.
- **Optional metric check — [Faiss — MetricType and distances](https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances).[20]** Read: “METRIC_INNER_PRODUCT” and “How can I index vectors for cosine similarity?”. Why: prevents a common error: assuming raw inner product always gives cosine ranking. Try: Write a checklist covering the metric plus normalisation of both stored and query vectors. Access: Free public reading; no account needed.
- **Optional original-source depth — [Patrick Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/pdf/2005.11401).[24]** Read: abstract, section 1 and Figure 1; skip the optimisation derivation. Why: shows that the original RAG combines parametric and retrieved memory and includes fine-tuning, unlike a fixed-weight toy pipeline. Try: Compare the paper’s jointly learned components with a retrieve-and-add-to-prompt application; identify which components change weights. Access: Free arXiv PDF. Full experimental details are optional; the abstract, introduction and figure are enough here.

## Flashcards

- Q: What does an embedding encode?
  A: Meaning as a position in a high-dimensional vector space; similar meanings sit close together.
- Q: What is RAG in three steps?
  A: Embed documents, retrieve nearest neighbours to the query embedding, place them in the model's context.

## Revision Questions

- Why can't you mix vectors from different embedding models?
- Where in RAG could quality silently degrade?
