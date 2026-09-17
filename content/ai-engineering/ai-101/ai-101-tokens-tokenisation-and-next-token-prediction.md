---
schema_version: 1
type: lesson
id: ai-101-tokens-tokenisation-and-next-token-prediction
title: Tokens, Tokenisation and Next-Token Prediction
course_id: ai-engineering
module_id: AI-101
order: 2
estimated_minutes: 50
---

# Tokens, Tokenisation and Next-Token Prediction

## Objective

Understand tokens, tokenisation and why LLMs are next-token predictors.

## Content

Models do not read characters or words; they read tokens — chunks of text (word pieces, punctuation, spaces) drawn from a fixed vocabulary built by a tokeniser. Roughly, 100 tokens ≈ 75 English words, but code, other languages and unusual formatting tokenise very differently, which is why token counts — not characters — define cost and context limits.

At heart an LLM does one thing: given a sequence of tokens, output a probability distribution over the next token. Everything else — dialogue, code, reasoning — emerges from iterating that single prediction and feeding the result back in. Sampling (temperature, top-p) chooses how deterministically we pick from that distribution. The context window is the hard bound on how many tokens the model can see at once; everything the model "knows" about your problem must fit inside it.

## Key Concepts

- Token
- Tokenisation
- Vocabulary
- Next-token prediction
- Sampling (temperature, top-p)
- Context window

## Examples

- "unbelievable" may split into un-believ-able; a rare identifier may cost many tokens
- Chat = repeatedly appending the sampled token and predicting the next

## Takeaways

- Tokens are the unit of cost, context and behaviour
- LLMs iterate one prediction: distribution over the next token
- Sampling controls how adventurous that pick is

## Sources and Further Reading

- Personal Curriculum — Hermes Master Document (AI Engineering)
- OpenAI Tokenizer tool (tiktoken)
- Karpathy, "Let's build the GPT Tokenizer"

## Flashcards

- Q: What is a token?
  A: A chunk of text from a fixed vocabulary — the model's actual input/output unit.
- Q: What is next-token prediction?
  A: Outputting a probability distribution over the next token given all previous tokens.
- Q: What does temperature control?
  A: How deterministically sampling picks from the distribution; lower = more predictable.

## Revision Questions

- Why do token counts, not characters, bound the context window?
- How does a chat response emerge from a single-step predictor?
