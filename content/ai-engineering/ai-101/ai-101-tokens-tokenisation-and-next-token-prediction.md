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

A text tokeniser converts text into token IDs from a vocabulary paired with the model. Tokens may represent words, subword pieces, bytes or characters, punctuation, whitespace and special control markers. Models process numeric representations of these IDs, not words as humans recognise them. Character-level tokenisers do exist; it is inaccurate to say models never read character tokens. Splits depend on the specific tokeniser, language and text, so count with the actual model’s tokeniser rather than relying on an English words-to-tokens rule of thumb.[16]

In a causal language model, the current sequence is transformed into scores for possible next tokens and then a probability distribution. A decoding rule selects a token; append it and repeat until a stopping condition. This describes autoregressive text generation, not every kind of model or the whole surrounding chat/tool system. The original Transformer paper explains learned token vectors, attention and the decoder output projection plus softmax; it describes an encoder-decoder translation model, not a modern chat product.[22]

Decoding matters. Greedy decoding selects the highest-scoring token. With sampling enabled, temperature rescales scores: a lower positive value makes the distribution sharper, and a higher value flatter. Top-p retains a small high-probability candidate set whose cumulative probability reaches the chosen threshold, then samples from the renormalised set. These settings affect variation, not a guaranteed truthfulness or reasoning level; lower temperature is not a guarantee of identical outputs across implementations.[23]

The context window limits the working token sequence for a particular model and serving configuration. Budget for instructions, history, retrieved text, tool messages and generated tokens as applicable; some systems also have a separate output cap. Knowledge learned in weights is different from information present in the current context. Long context is not guaranteed reliable recall, and applications must decide what to truncate, summarise or retrieve when a conversation grows.

Curriculum provenance (internal, not external evidence): Personal Curriculum — Hermes Master Document (AI Engineering) sets the lesson scope. The named external readings support the explanations; optional depth is not required to complete the lesson.

## Key Concepts

- Token :: An item represented by an ID in a model-compatible vocabulary; it can be a subword, byte, character, whitespace/punctuation unit or special marker. A token is not necessarily a word or a fixed number of characters.
- Tokenisation :: Model-specific conversion between text and token IDs. Preprocessing and chat templates can add or alter tokens, so use the intended model’s tokeniser for real counts.[16]
- Vocabulary :: The token inventory and ID mapping expected by a model. Different tokenisers can assign different splits and IDs to the same text.
- Next-token prediction :: For a causal language model, estimating a distribution for the next token conditional on available prior context. Iterated decoding generates a sequence; it is not a definition of all neural models.[22]
- Sampling (temperature, top-p) :: Temperature reshapes relative probabilities; top-p limits the candidate set by cumulative probability. Both differ from choosing the maximum-probability token greedily.[23]
- Context window :: The supported working sequence length, subject to model and serving limits. It is distinct from learned knowledge and does not promise that every included fact will be used correctly.
- Attention :: A learned operation combining value vectors using weights derived from query/key compatibility. Causal masking prevents access to future tokens; attention is not a guarantee of factual understanding.[22]

## Examples

- Compare ordinary prose, a long identifier and a non-English sentence with the same tokeniser. Record the actual token pieces rather than assuming “unbelievable” has one fixed split.
- Sketch generation as “sequence → next-token scores → decoding choice → longer sequence”; mark where temperature and top-p act.
- Before adding retrieved passages, inventory all message types and reserve output capacity according to the API’s documented limits.

## Takeaways

- Token IDs and counts depend on the model’s tokeniser and input formatting.
- Causal generation iterates prediction and decoding; sampling is a separate choice.
- Context is finite working information, not the entirety of learned knowledge or guaranteed recall.

## Sources and Further Reading

- **Start here — [Hugging Face LLM Course — Tokenizers](https://huggingface.co/learn/llm-course/chapter2/4).[16]** Read: “Word-based”, “Character-based” and “Subword tokenization”, then “Encoding” on matching the model’s rules and vocabulary. Why: shows why neither “one token = one word” nor “models never use characters” is reliable. Try: Use its example to explain why a rare word may split; compare one identifier and one prose phrase without guessing counts. Access: Free public reading; no account needed.
- **Optional hands-on depth — [Hugging Face — How to generate text: using different decoding methods for language generation with Transformers](https://huggingface.co/blog/how-to-generate).[23]** Read: “Greedy Search”, “Sampling” (temperature) and “Top-p (nucleus) sampling”; skip installation if only reading. Why: shows the difference between the predicted distribution and the decoding algorithm. Try: Describe which changes if you keep the model and prompt fixed but switch greedy decoding to top-p sampling. Access: Free article; examples use library APIs that may evolve. Running examples may require local model downloads/compute; reading needs no account.
- **Optional original-source depth — [Vaswani et al. — Attention Is All You Need](https://arxiv.org/pdf/1706.03762).[22]** Read: section 3.2, “Attention”, especially causal masking in 3.2.3; section 3.4, “Embeddings and Softmax”, and 3.5, “Positional Encoding”. Why: connects token IDs to learned vectors, attention and next-token probabilities without presenting the original translation model as a chat LLM. Try: Trace a token ID to its vector representation and then to an output probability; explain why position information is needed. Access: Free arXiv PDF; mathematical details are optional. Read the named sections, not the entire paper.

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
