/**
 * One-off seed generator: writes the initial canonical content tree from the
 * established curriculum outlines (Study/02, 03, 04 indexes + module notes).
 * Only public curriculum structure and distilled outlines are emitted — never
 * session notes, assessments, mastery, dates, Q&A, or personal ratings.
 *
 * Run from app/:  tsx scripts/seed-content.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { serializeCourse, serializeLesson, serializeModule } from '../src/shared/content.js';
import type { CourseDoc, LessonDoc, ModuleDoc } from '../src/shared/types.js';
import { moduleDirName } from '../src/shared/slug.js';

import { dirname } from 'node:path';

const OUT = resolve(new URL('.', import.meta.url).pathname, '..', '..', 'content');

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

interface CourseSeed { doc: CourseDoc; purpose: string }
interface ModuleSeed { doc: ModuleDoc }
interface LessonSeed { id: string; title: string; minutes: number; objective: string; content: string; concepts: string[]; examples: string[]; takeaways: string[]; sources: string[]; cards: [string, string][]; questions: string[] }

const courses: CourseSeed[] = [
  {
    doc: { schemaVersion: 1, type: 'course', id: 'sse', title: 'Software Systems Engineering', description: 'Move from building applications to engineering complete modern software systems: architecture, constraints, trade-offs, data, failure, security, operations and evolution.', status: 'active' },
    purpose: 'Assumes programming, JavaScript, Python, Node.js, React, APIs, basic databases, Git and web development. Prepares for AI-driven development by treating models, agents, retrieval and evaluation as components in larger systems.',
  },
  {
    doc: { schemaVersion: 1, type: 'course', id: 'ai-engineering', title: 'AI Engineering', description: 'Build, deploy, evaluate, secure and operate useful AI systems; theory and mathematics introduced when they support practical understanding.', status: 'active' },
    purpose: 'A practical engineering course covering foundations, LLM engineering, agents, evaluation, retrieval, infrastructure, production operation and safety.',
  },
  {
    doc: { schemaVersion: 1, type: 'course', id: 'bronze-age-collapse', title: 'Bronze Age Collapse', description: 'The Late Bronze Age system before, during and after collapse, studied through evidence, competing explanations and historical method.', status: 'active' },
    purpose: 'Central question: was the collapse a single event, or a cascading failure of an interconnected system? Distinguishes primary evidence, consensus, likely and contested interpretation, and speculation.',
  },
];

const modules: ModuleSeed[] = [
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-101', title: 'Software Architecture Foundations', courseId: 'sse', order: 1, status: 'active', summary: 'Architecture as structure, boundaries, constraints and important decisions; reasoning about coupling, cohesion, debt and trade-offs.', objectives: ['Explain architecture as the structure, boundaries, constraints and important decisions of a system', 'Distinguish architecture from implementation detail; functional versus non-functional requirements', 'Reason about coupling, cohesion, abstraction, encapsulation, modularity, interfaces and dependency direction', 'Identify technical debt and make explicit architecture trade-offs', 'Compare a monolith with a modular monolith and design for likely change'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-201', title: 'Application and Service Architecture', courseId: 'sse', order: 2, status: 'queued', summary: 'Structuring applications and services: layers, boundaries, APIs and service decomposition.', objectives: ['Design application and service boundaries', 'Reason about API contracts and service decomposition'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-301', title: 'Data Systems', courseId: 'sse', order: 3, status: 'queued', summary: 'Data modelling, storage engines, consistency and the data layer of a system.', objectives: ['Model data for real systems', 'Reason about consistency, integrity and storage trade-offs'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-401', title: 'Distributed Systems Foundations', courseId: 'sse', order: 4, status: 'queued', summary: 'Distributed-systems thinking: partial failure, latency, consistency and coordination.', objectives: ['Reason about partial failure and network realities', 'Understand consistency and coordination basics'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-501', title: 'Messaging and Event-Driven Systems', courseId: 'sse', order: 5, status: 'queued', summary: 'Queues, events, streams and asynchronous system design.', objectives: ['Design with queues and events', 'Understand delivery semantics and backpressure'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-601', title: 'Performance and Scalability', courseId: 'sse', order: 6, status: 'queued', summary: 'Measuring and reasoning about performance; scaling strategies and their costs.', objectives: ['Measure before optimising', 'Reason about scaling strategies and trade-offs'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-701', title: 'Reliability and Resilience', courseId: 'sse', order: 7, status: 'queued', summary: 'Failure modes, redundancy, graceful degradation and recovery.', objectives: ['Identify failure modes', 'Design for graceful degradation and recovery'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-801', title: 'Observability and Production Operations', courseId: 'sse', order: 8, status: 'queued', summary: 'Logs, metrics, traces, alerting and operating systems in production.', objectives: ['Instrument systems with logs, metrics and traces', 'Operate and debug production systems'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-901', title: 'Security Architecture', courseId: 'sse', order: 9, status: 'queued', summary: 'Threat modelling, trust boundaries, authentication, authorisation and secure defaults.', objectives: ['Threat-model a system', 'Design trust boundaries and secure defaults'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-1001', title: 'Deployment and Infrastructure', courseId: 'sse', order: 10, status: 'queued', summary: 'Deployment pipelines, infrastructure choices, environments and release safety.', objectives: ['Design deployment pipelines', 'Reason about infrastructure and release safety'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-1101', title: 'System Design', courseId: 'sse', order: 11, status: 'queued', summary: 'Synthesis: designing complete systems from requirements through trade-off analysis.', objectives: ['Design complete systems from requirements', 'Defend design decisions with explicit trade-offs'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-1201', title: 'AI-Native Software Systems', courseId: 'sse', order: 12, status: 'queued', summary: 'Models, agents, retrieval, evaluation and tool execution as components in larger systems.', objectives: ['Integrate AI components into system architecture', 'Reason about non-determinism and evaluation in design'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'SSE-1301', title: 'Architecture Evolution and Engineering Judgement', courseId: 'sse', order: 13, status: 'queued', summary: 'Evolving architecture over time; reversibility, fitness functions and judgement.', objectives: ['Evolve architecture safely over time', 'Develop explicit engineering judgement'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-101', title: 'Modern AI and ML Foundations', courseId: 'ai-engineering', order: 1, status: 'active', summary: 'Working understanding of neural networks, training versus inference, embeddings, transformers, attention, tokens, context windows, sampling, fine-tuning and quantisation.', objectives: ['Distinguish training from inference and context from fine-tuning', 'Explain tokens, tokenisation and next-token prediction', 'Understand embeddings, transformers, attention and context windows', 'Understand sampling, fine-tuning concepts and quantisation'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-JIT-MATHS', title: 'Just-in-Time Mathematics', courseId: 'ai-engineering', order: 2, status: 'queued', summary: 'Mathematics introduced exactly when a practical AI concept needs it: linear algebra, probability, calculus and information ideas.', objectives: ['Learn mathematics just-in-time against practical need', 'Connect vectors, probability and optimisation to AI systems'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-201', title: 'LLM Engineering', courseId: 'ai-engineering', order: 3, status: 'queued', summary: 'Prompting, structured output, tool use, context management and model selection.', objectives: ['Engineer prompts and structured outputs', 'Manage context, tools and model selection'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-301', title: 'Agent Engineering', courseId: 'ai-engineering', order: 4, status: 'queued', summary: 'Building agents: loops, tools, memory, planning and failure handling.', objectives: ['Design agent loops and tool contracts', 'Handle agent memory, planning and failure'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-401', title: 'Evaluation and Reliability', courseId: 'ai-engineering', order: 5, status: 'queued', summary: 'Evaluating AI systems: benchmarks, task-level evals, regression suites and reliability.', objectives: ['Design task-level evaluations', 'Build regression suites and reliability practices'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-501', title: 'Data and Retrieval Systems', courseId: 'ai-engineering', order: 6, status: 'queued', summary: 'Data pipelines, embeddings stores, retrieval-augmented generation and freshness.', objectives: ['Build retrieval pipelines', 'Reason about data quality and freshness'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-601', title: 'AI Infrastructure', courseId: 'ai-engineering', order: 7, status: 'queued', summary: 'Serving, GPUs, batching, cost and latency engineering for AI workloads.', objectives: ['Serve models with latency and cost constraints', 'Reason about AI infrastructure choices'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-701', title: 'Production AI Systems', courseId: 'ai-engineering', order: 8, status: 'queued', summary: 'Operating AI features in production: monitoring, guardrails, rollout and iteration.', objectives: ['Operate AI features safely in production', 'Design guardrails and rollout strategies'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-801', title: 'AI Safety, Security and Governance', courseId: 'ai-engineering', order: 9, status: 'queued', summary: 'Prompt injection, data leakage, misuse, policy and governance for AI systems.', objectives: ['Mitigate prompt injection and data leakage', 'Apply governance to AI features'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'AI-901', title: 'Advanced Agent and Orchestration Systems', courseId: 'ai-engineering', order: 10, status: 'queued', summary: 'Multi-agent orchestration, delegation, verification and long-running autonomous work.', objectives: ['Orchestrate multi-agent systems', 'Verify and gate autonomous work'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'HIST-A101', title: 'The Late Bronze Age World', courseId: 'bronze-age-collapse', order: 1, status: 'active', summary: 'The interconnected palace-economy world of Egypt, Mycenaean Greece, the Hittites, Assyria, Babylon, the Levant and Cyprus: trade, diplomacy, bronze and warfare.', objectives: ['Map the major Late Bronze Age powers and their interdependence', 'Understand trade networks, diplomacy and bronze resource dependency', 'Distinguish primary evidence from consensus, interpretation and speculation'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'HIST-A201', title: 'The Collapse, c. 1200 BCE', courseId: 'bronze-age-collapse', order: 2, status: 'queued', summary: 'The destruction horizon, the Sea Peoples question, and the evidence for cascading failure.', objectives: ['Survey the destruction horizon c. 1200 BCE', 'Weigh competing explanations for the collapse'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'HIST-A301', title: 'After the Collapse', courseId: 'bronze-age-collapse', order: 3, status: 'queued', summary: 'The post-collapse world: what survived, what vanished, and the long transition to the Iron Age.', objectives: ['Trace continuity and discontinuity after the collapse', 'Understand the transition to the Iron Age'] } },
  { doc: { schemaVersion: 1, type: 'module', id: 'HIST-A401', title: 'Historical Method: Bronze Age Collapse', courseId: 'bronze-age-collapse', order: 4, status: 'queued', summary: 'How historians argue from scarce evidence: source criticism, historiography and the limits of certainty.', objectives: ['Grade evidence and source types', 'Read historiographical disagreement productively'] } },
];

function lesson(courseId: string, moduleId: string, order: number, s: LessonSeed): LessonDoc {
  return {
    schemaVersion: 1, type: 'lesson', id: s.id, title: s.title, courseId, moduleId, order,
    estimatedMinutes: s.minutes, objective: s.objective, content: s.content,
    keyConcepts: s.concepts, examples: s.examples, takeaways: s.takeaways, sources: s.sources,
    flashcards: s.cards.map(([q, a]) => ({ q, a })), revisionQuestions: s.questions,
  };
}

const SSE = 'Personal Curriculum — Hermes Master Document (Software Systems Engineering)';
const AIE = 'Personal Curriculum — Hermes Master Document (AI Engineering)';
const BAC = 'Personal Curriculum — Hermes Master Document (Bronze Age Collapse)';

const lessons: LessonDoc[] = [
  lesson('sse', 'SSE-101', 1, {
    id: 'sse-101-architecture-vs-implementation', title: 'Architecture versus Implementation', minutes: 45,
    objective: 'Distinguish architecture from implementation detail, and frame work as requirements under constraints.',
    content: 'Architecture is the set of decisions that are expensive to change: structure, boundaries, constraints and the reasoning behind them. Implementation is everything that can change inside those boundaries without altering the system\'s essential shape.\n\nRequirements drive architecture. Functional requirements say what the system must do; non-functional requirements — performance, reliability, security, operability — constrain how it may do it, and usually decide between candidate architectures.',
    concepts: ['Software architecture', 'Implementation detail', 'Functional requirements', 'Non-functional requirements', 'Constraints'],
    examples: ['Choosing a modular monolith over microservices is architectural; picking a ORM query style is implementation', 'A 200 ms latency budget is a non-functional requirement that can force a cache boundary'],
    takeaways: ['Architecture = important, expensive-to-change decisions', 'Non-functional requirements drive most architectural choices', 'If a decision is cheap to reverse, it is probably implementation'],
    sources: [SSE, 'Martin, Clean Architecture (2017) — chapters on boundaries'],
    cards: [['What makes a decision architectural?', 'It is expensive to change later and shapes the system\'s structure or boundaries.'], ['Which requirements usually decide between architectures?', 'Non-functional requirements: performance, reliability, security, operability.']],
    questions: ['Give one decision in a project you know that is architectural, and one that is implementation. Why?', 'How can a non-functional requirement force a structural boundary?'],
  }),
  lesson('sse', 'SSE-101', 2, {
    id: 'sse-101-functional-and-non-functional-requirements', title: 'Functional and Non-Functional Requirements', minutes: 40,
    objective: 'Capture requirements precisely enough that architecture can be reasoned about.',
    content: 'A functional requirement describes behaviour: "the user can reset their password". A non-functional requirement describes a quality the behaviour must have: "password reset completes within two seconds under normal load".\n\nVague qualities are not requirements. "Fast" is not testable; "p95 read latency under 300 ms at 100 rps" is. Architecture work begins by making qualities explicit and measurable, because every boundary and technology choice trades one quality against another.',
    concepts: ['Functional requirement', 'Non-functional requirement', 'Measurability', 'Quality trade-offs'],
    examples: ['"The system must be reliable" → "99.9% monthly availability, recovery within 15 minutes"', '"Secure" → "all API mutation requires an authenticated session; secrets never logged"'],
    takeaways: ['Qualities must be measurable to guide design', 'Every architectural choice trades qualities against each other'],
    sources: [SSE, 'Bass, Clements, Kazman, Software Architecture in Practice'],
    cards: [['Turn "the site must be fast" into a requirement.', 'A measurable target, e.g. p95 page load under 2 s at expected peak load.'], ['Who decides which qualities matter most?', 'The stakeholders\' priorities, made explicit before design.']],
    questions: ['Why is an unmeasurable quality useless for architecture?', 'Pick an app you maintain: write one functional and one measurable non-functional requirement for it.'],
  }),
  lesson('sse', 'SSE-101', 3, {
    id: 'sse-101-coupling-cohesion-separation-of-concerns', title: 'Coupling, Cohesion and Separation of Concerns', minutes: 50,
    objective: 'Reason about coupling and cohesion, and apply abstraction and encapsulation to separate concerns.',
    content: 'Coupling measures how much one part of a system must know about another. Cohesion measures how strongly the things inside one part belong together. Good structure minimises the first and maximises the second.\n\nSeparation of concerns assigns each responsibility to exactly one place. Abstraction hides detail behind a stable contract; encapsulation stops outside code from depending on what is hidden. Together they let parts change independently — the practical definition of maintainability.',
    concepts: ['Coupling', 'Cohesion', 'Separation of concerns', 'Abstraction', 'Encapsulation'],
    examples: ['A route handler that builds SQL strings is coupled to storage details; a repository interface restores encapsulation', 'A "utils" module that everything imports is low cohesion hiding as reuse'],
    takeaways: ['Low coupling, high cohesion is the compass for structure', 'Change-locality is the test: how many files must change for one new requirement?'],
    sources: [SSE, 'Parnas, "On the Criteria to Be Used in Decomposing Systems into Modules" (1972)'],
    cards: [['What is coupling?', 'How much one part of a system must know about another part\'s details.'], ['What is cohesion?', 'How strongly the contents of one module belong to the same responsibility.']],
    questions: ['Find a high-cost coupling in an app you know. What boundary would remove it?', 'Why can shared "util" modules increase coupling?'],
  }),
  lesson('sse', 'SSE-101', 4, {
    id: 'sse-101-modules-interfaces-dependency-direction', title: 'Modules, Interfaces and Dependency Direction', minutes: 50,
    objective: 'Define modules by responsibility, connect them with explicit interfaces, and control dependency direction.',
    content: 'A module is a unit with one responsibility and a boundary that hides how it fulfils it. An interface is the contract at that boundary: what callers may rely on, and nothing more.\n\nDependency direction is a design choice, not an accident. High-level policy should not depend on low-level detail; point dependencies toward stability. When detail must be called, invert the dependency: the policy defines the interface, the detail implements it.',
    concepts: ['Module boundary', 'Interface/contract', 'Dependency direction', 'Dependency inversion', 'Stability'],
    examples: ['Billing policy defines a PaymentGateway interface; Stripe adapter implements it — policy never imports Stripe', 'A core domain module that imports Express is a reversed dependency'],
    takeaways: ['Interfaces define what may be depended upon', 'Point dependencies toward stable policy, away from volatile detail'],
    sources: [SSE, 'Martin, Clean Architecture — the Dependency Rule'],
    cards: [['What is dependency inversion?', 'High-level policy owns the interface; low-level detail implements it, reversing the dependency.'], ['Why depend toward stability?', 'Changes in volatile detail then never force changes in stable policy.']],
    questions: ['In an app you know, which way do dependencies point between HTTP handlers and domain logic?', 'When would you NOT invert a dependency?'],
  }),
  lesson('sse', 'SSE-101', 5, {
    id: 'sse-101-technical-debt-and-trade-offs', title: 'Technical Debt and Architecture Trade-offs', minutes: 45,
    objective: 'Recognise technical debt as a trade-off with interest, and make architecture trade-offs explicit.',
    content: 'Technical debt is a deliberate or accidental shortcut whose cost is paid later as slower change. Like financial debt it can be rational: shipping now at the cost of interest later is sometimes correct. What makes debt dangerous is taking it invisibly.\n\nThere are no best architectures, only trade-offs fit to context. Every decision optimises some qualities at the expense of others. Professional practice is stating the trade-off in the open: what we gain, what we give up, what would make us revisit.',
    concepts: ['Technical debt', 'Interest', 'Explicit trade-off', 'Reversibility', 'Architecture decision record'],
    examples: ['Skipping an outbox to ship faster: gain speed now, pay when dual-write inconsistency appears', 'A one-line ADR: "Chose modular monolith; gives up independent scaling; revisit if any module exceeds 30% of traffic"'],
    takeaways: ['Debt is fine when deliberate, visible and serviced', 'Record trade-offs as decisions, not vibes'],
    sources: [SSE, 'Fowler, "Technical Debt Quadrant"'],
    cards: [['When is technical debt rational?', 'When taken deliberately, with the trade-off and repayment conditions made visible.'], ['What belongs in an architecture decision record?', 'The decision, context, options, the trade-off accepted, and what would trigger revisiting.']],
    questions: ['Name one debt item in your own code: what is the interest payment?', 'Why does "best practice" fail as an architecture argument?'],
  }),
  lesson('sse', 'SSE-101', 6, {
    id: 'sse-101-monoliths-and-modular-monoliths', title: 'Designing for Change: Monoliths and Modular Monoliths', minutes: 55,
    objective: 'Compare a simple monolith with a modular monolith, and design for likely change without premature distribution.',
    content: 'A monolith deploys as one unit; a modular monolith also enforces internal boundaries — separate modules with explicit interfaces and controlled dependencies. The modular monolith keeps monolith simplicity (one deploy, easy refactoring) while buying most of the change-isolation that services promise.\n\nDesign for likely change, not imaginable change. Identify which parts change together and separate those that change for different reasons. Distribution (services) is a tax paid in network failure, operational cost and consistency pain; pay it only when scaling or team boundaries demand it.',
    concepts: ['Monolith', 'Modular monolith', 'Change isolation', 'Premature distribution', 'Module extraction path'],
    examples: ['Coins: one Node process with clear module boundaries beats five services at current scale', 'A module with a clean interface can be extracted into a service later — the boundary is the real investment'],
    takeaways: ['Internal boundaries give most service benefits without distribution costs', 'Design for change frequency and reason, not fashion'],
    sources: [SSE, 'Fowler, "Monolith First"'],
    cards: [['What does a modular monolith buy over a plain monolith?', 'Enforced internal boundaries: change isolation and a future extraction path, with one deploy.'], ['What is the tax of distribution?', 'Network failure modes, operational cost and consistency complexity.']],
    questions: ['Which module in an app you know would be extracted first, and why?', 'What signals justify paying the distribution tax?'],
  }),
  lesson('ai-engineering', 'AI-101', 1, {
    id: 'ai-101-training-inference-and-the-ai-engineering-boundary', title: 'Training, Inference and the AI Engineering Boundary', minutes: 50,
    objective: 'Distinguish training from inference, and define where AI engineering begins.',
    content: 'Training adjusts a model\'s weights using data and a loss signal; it is slow, expensive and done rarely. Inference runs the frozen model to produce outputs; it is fast, repeated and what users touch. AI engineering is overwhelmingly inference-side work: building useful, reliable systems around models others trained.\n\nThe boundary matters because the disciplines differ. Training-side questions (architecture search, loss curves, gradient dynamics) belong to research; inference-side questions (context design, latency, cost, evaluation, failure modes) belong to engineering. Context changes behaviour without touching weights; fine-tuning changes weights. Choose context first — it is cheaper, reversible and usually sufficient.',
    concepts: ['Training', 'Inference', 'Weights', 'Context versus fine-tuning', 'AI engineering boundary'],
    examples: ['Adding documents to a prompt = context engineering; updating weights on those documents = fine-tuning', 'A support-bot quality problem is usually fixed with retrieval and prompts, not retraining'],
    takeaways: ['Engineering happens at inference: context, cost, latency, evaluation', 'Prefer context over fine-tuning until evidence demands weights'],
    sources: [AIE, 'Karpathy, "Intro to Large Language Models" (talk)'],
    cards: [['Training vs inference in one sentence each?', 'Training updates weights from data; inference runs frozen weights to produce outputs.'], ['Context vs fine-tuning?', 'Context changes behaviour per-request without touching weights; fine-tuning updates the weights themselves.']],
    questions: ['Why is most product AI work inference-side?', 'When would fine-tuning be justified over better context?'],
  }),
  lesson('ai-engineering', 'AI-101', 2, {
    id: 'ai-101-tokens-tokenisation-and-next-token-prediction', title: 'Tokens, Tokenisation and Next-Token Prediction', minutes: 50,
    objective: 'Understand tokens, tokenisation and why LLMs are next-token predictors.',
    content: 'Models do not read characters or words; they read tokens — chunks of text (word pieces, punctuation, spaces) drawn from a fixed vocabulary built by a tokeniser. Roughly, 100 tokens ≈ 75 English words, but code, other languages and unusual formatting tokenise very differently, which is why token counts — not characters — define cost and context limits.\n\nAt heart an LLM does one thing: given a sequence of tokens, output a probability distribution over the next token. Everything else — dialogue, code, reasoning — emerges from iterating that single prediction and feeding the result back in. Sampling (temperature, top-p) chooses how deterministically we pick from that distribution. The context window is the hard bound on how many tokens the model can see at once; everything the model "knows" about your problem must fit inside it.',
    concepts: ['Token', 'Tokenisation', 'Vocabulary', 'Next-token prediction', 'Sampling (temperature, top-p)', 'Context window'],
    examples: ['"unbelievable" may split into un-believ-able; a rare identifier may cost many tokens', 'Chat = repeatedly appending the sampled token and predicting the next'],
    takeaways: ['Tokens are the unit of cost, context and behaviour', 'LLMs iterate one prediction: distribution over the next token', 'Sampling controls how adventurous that pick is'],
    sources: [AIE, 'OpenAI Tokenizer tool (tiktoken)', 'Karpathy, "Let\'s build the GPT Tokenizer"'],
    cards: [['What is a token?', 'A chunk of text from a fixed vocabulary — the model\'s actual input/output unit.'], ['What is next-token prediction?', 'Outputting a probability distribution over the next token given all previous tokens.'], ['What does temperature control?', 'How deterministically sampling picks from the distribution; lower = more predictable.']],
    questions: ['Why do token counts, not characters, bound the context window?', 'How does a chat response emerge from a single-step predictor?'],
  }),
  lesson('ai-engineering', 'AI-101', 3, {
    id: 'ai-101-embeddings-and-vector-representations', title: 'Embeddings and Vector Representations', minutes: 55,
    objective: 'Understand embeddings as meaning-bearing vectors and their role in retrieval.',
    content: 'An embedding model maps text to a high-dimensional vector such that semantic similarity becomes geometric proximity: texts about the same thing land near each other even with no shared words. This is what makes "search by meaning" possible.\n\nEmbeddings power retrieval: embed documents once, embed the query at runtime, find nearest neighbours (cosine similarity), and put the results into the model\'s context. That pipeline — retrieval-augmented generation — grounds answers in your data without fine-tuning. The embedding space is fixed by the model that made it; mixing vectors from different embedding models is meaningless.',
    concepts: ['Embedding', 'Vector space', 'Cosine similarity', 'Semantic search', 'Retrieval-augmented generation'],
    examples: ['"How do I reset my password?" retrieves "account credential recovery" with zero shared words', 'A vector DB stores document embeddings; a query embedding finds the k nearest'],
    takeaways: ['Embeddings turn meaning into geometry', 'RAG = embed, retrieve nearest, stuff context — no weight changes'],
    sources: [AIE, 'OpenAI embeddings guide', 'Johnson, Douze, Jégou — FAISS (nearest-neighbour search)'],
    cards: [['What does an embedding encode?', 'Meaning as a position in a high-dimensional vector space; similar meanings sit close together.'], ['What is RAG in three steps?', 'Embed documents, retrieve nearest neighbours to the query embedding, place them in the model\'s context.']],
    questions: ['Why can\'t you mix vectors from different embedding models?', 'Where in RAG could quality silently degrade?'],
  }),
  lesson('bronze-age-collapse', 'HIST-A101', 1, {
    id: 'hist-a101-mapping-the-late-bronze-age-world', title: 'Mapping the Late Bronze Age World and Egypt\'s Role', minutes: 40,
    objective: 'Map the major Late Bronze Age powers and the interdependence of the palace-economy system.',
    content: 'Around 1300 BCE the eastern Mediterranean formed an interconnected system of palace-centred states: New Kingdom Egypt, the Hittite Empire, Assyria and Babylon, Mycenaean Greece, the cities of Canaan and the Levant, and copper-rich Cyprus. Palace economies concentrated redistribution, craft and long-distance trade.\n\nThe system\'s defining dependency was bronze: copper largely from Cyprus, tin from distant sources to the east. Diplomatic letters (the Amarna archive, consensus primary evidence) show a "club of great powers" trading gifts, grain and marriage alliances. Interdependence brought prosperity — and, as later lessons examine, a shared vulnerability: disruption to trade or to one major node could propagate through the whole network.',
    concepts: ['Palace economy', 'Great powers\' club', 'Amarna letters', 'Bronze supply chain (copper/tin)', 'Interdependence', 'Evidence grading'],
    examples: ['Cyprus (Alashiya) shipping copper to Egypt — attested in Amarna correspondence (primary evidence)', 'Ugarit as a Levantine trade hub linking inland powers to the sea'],
    takeaways: ['The LBA world was a network, not isolated kingdoms', 'Bronze made long-distance supply chains strategically vital', 'Always separate what sources attest from what historians infer'],
    sources: [BAC, 'Cline, 1177 B.C.: The Year Civilization Collapsed', 'Moran, The Amarna Letters'],
    cards: [['What made bronze a strategic vulnerability?', 'It required both copper (Cyprus) and tin (distant east), so long-distance trade disruption threatened every palace economy.'], ['What are the Amarna letters?', 'Primary-source diplomatic correspondence between Egypt and other great powers, c. 1360–1330 BCE.']],
    questions: ['Which single commodity dependency did all LBA palaces share, and why?', 'Give one claim about this period that is primary evidence, and one that is interpretation.'],
  }),
  lesson('bronze-age-collapse', 'HIST-A101', 2, {
    id: 'hist-a101-hittite-egyptian-rivalry-and-the-levantine-corridor', title: 'Hittite–Egyptian Rivalry and the Levantine Corridor', minutes: 30,
    objective: 'Understand Hittite–Egyptian competition for the Levant and how rivalry was managed within the system.',
    content: 'The Levantine corridor — Canaan and coastal Syria — was the contested buffer between Egyptian and Hittite spheres. Control meant trade routes, tribute and military depth. The rivalry peaked at Kadesh (c. 1274 BCE), which Egyptian records present as triumph; the evidence supports a costly stalemate (contested interpretation versus Ramesside propaganda as primary source).\n\nNotably, the rivalry ended in system-maintenance: the Egyptian–Hittite peace treaty (c. 1259 BCE), surviving in both Egyptian and Hittite versions — rare paired primary evidence — shows the great powers managing competition diplomatically rather than destroying each other. The Levant stayed divided into client states whose loyalty shifted with great-power pressure.',
    concepts: ['Levantine corridor', 'Battle of Kadesh', 'Propaganda versus evidence', 'Egyptian–Hittite peace treaty', 'Client states'],
    examples: ['Kadesh inscriptions as triumphal narrative — primary evidence for what Egypt claimed, not for what happened', 'The treaty of c. 1259 BCE surviving in two languages — unusually strong evidence'],
    takeaways: ['The Levant was the system\'s contested hinge', 'Great powers preferred managed rivalry to mutual destruction', 'Read victory monuments as claims, not facts'],
    sources: [BAC, 'Bryce, The Kingdom of the Hittites', 'Cline, 1177 B.C. — chapters on the great powers'],
    cards: [['Why was the Levantine corridor strategic?', 'It held the trade routes and buffer zone between the Egyptian and Hittite spheres.'], ['Why is the Egyptian–Hittite treaty strong evidence?', 'It survives in both sides\' versions, letting claims be cross-checked.']],
    questions: ['Why should Kadesh be read as propaganda before fact?', 'What does the peace treaty suggest about the system\'s stability mechanisms?'],
  }),
];

function main(): void {
  mkdirSync(OUT, { recursive: true });
  for (const { doc, purpose } of courses) {
    const links = modules.filter((m) => m.doc.courseId === doc.id).map((m) => ({ dir: moduleDirName(m.doc.id), title: `${m.doc.id} — ${m.doc.title}`, status: m.doc.status }));
    const body = serializeCourse(doc, links).replace('\n## Modules\n', `\n${purpose}\n\n## Modules\n`);
    write(join(OUT, doc.id, 'README.md'), body);
  }
  for (const { doc } of modules) {
    const lessonLinks = lessons.filter((l) => l.moduleId === doc.id).map((l) => ({ id: l.id, title: l.title }));
    write(join(OUT, doc.courseId, moduleDirName(doc.id), 'README.md'), serializeModule(doc, lessonLinks));
  }
  for (const l of lessons) {
    write(join(OUT, l.courseId, moduleDirName(l.moduleId), `${l.id}.md`), serializeLesson(l));
  }
  write(join(OUT, 'README.md'), `# Canonical Study Content\n\nClean Markdown curriculum content. Course → module → lesson hierarchy. Schema version 1.\n\n- [Software Systems Engineering](./sse/README.md)\n- [AI Engineering](./ai-engineering/README.md)\n- [Bronze Age Collapse](./bronze-age-collapse/README.md)\n\nRules: no progress, ratings, attempts, Q&A, review state, dates or personal tracking in this tree — those live in the app's private runtime database. Validate with \`npm run validate:content\` in \`app/\`.\n`);
  write(join(OUT, 'schema.json'), JSON.stringify({ schema_version: 1, types: ['course', 'module', 'lesson'] }, null, 2) + '\n');
  console.log(`seeded ${courses.length} courses, ${modules.length} modules, ${lessons.length} lessons → ${OUT}`);
}

main();
