---
document_id: COMPARISON-CHECKPOINT
version: 1
date: 2026-02-18
model: opus
inputs:
  - CODEX-ANALYSIS-SUMMARY.md
  - DIFY-ANALYSIS-SUMMARY.md
  - OUR-ANALYSIS-SUMMARY.md
  - PLATFORM-GROUND-TRUTH.md
  - DECISION-REGISTER.md
authority_ranking: [PLATFORM-GROUND-TRUTH.md, OUR-ANALYSIS-SUMMARY.md, DIFY-ANALYSIS-SUMMARY.md, CODEX-ANALYSIS-SUMMARY.md]
---

# Analysis Comparison Checkpoint

Cross-analysis of four independent assessments of the NYQST platform and Superagent parity problem. Authority ranking reflects trust level when sources conflict: Ground Truth (highest) > Our Analysis > Dify Analysis > Codex (lowest).

---

## Section 1: Alignment Map

Where do all four sources agree? These are the safest bets for the implementation plan.

| Claim | Codex | Dify Analysis | Our Analysis | Ground Truth | Verdict |
|-------|-------|---------------|--------------|--------------|---------|
| ResearchAssistantGraph exists and is functional | Yes: 3-node graph with tool loop | Yes: calls it a "2-node pipeline" (wrong count, but acknowledges existence) | Yes: 3-node graph (agent/tools/capture_sources) | Yes: 3-node StateGraph, fully implemented | **CONFIRMED** — all agree it exists; Dify analysis miscounts nodes |
| No Send() fan-out pattern in LangGraph | Yes: "No multi-agent planner->parallel executors" | Yes: "No tool calling, no branching, no loops" (overstated) | Yes: "No Send() fan-out" is the primary gap | Yes: "No `Send(` pattern found" | **CONFIRMED** — universal agreement; this is the #1 gap for Superagent parity |
| Content-addressed artifact storage is a genuine advantage | Yes: SHA-256, S3-compatible, MinIO | Yes: "genuine architectural innovation" | Yes: SHA-256 PK, immutable manifests | Yes: SHA-256 PK, media_type, size_bytes, storage_uri | **CONFIRMED** — all four recognize this as architecturally superior |
| SSE streaming via PG LISTEN/NOTIFY is production-ready | Yes: `streams.py`, 30s heartbeat | Yes: "production-ready for SSE activity panel" | Yes: streams router documented | Yes: raw asyncpg persistent connections | **CONFIRMED** — extend, don't replace |
| Run ledger is append-only event-sourced | Yes: run_events table, append-only | Yes: "25+ event types, immutable, append-only" | Yes: RunLog/RunState event-sourced architecture | Yes: RunEventType enum with 25 event types | **CONFIRMED** — foundation for activity panel and replay |
| Frontend uses @assistant-ui/react + Vercel AI SDK | Yes: ChatPanel.tsx documented | Yes: "Vercel AI SDK v3" noted as advantage | Yes: ^0.12, documented in ground truth | Yes: @assistant-ui/react ^0.12.3, ai ^6.0.57 | **CONFIRMED** — existing, keep extending |
| LLM is OpenAI-only (no Anthropic SDK) | Yes: langchain-openai + custom base_url | Implicit (not a focus) | Yes: "No Anthropic SDK" HIGH confidence | Yes: only langchain-openai, gpt-4o-mini default | **CONFIRMED** — OQ-001 in Decision Register addresses whether to add anthropic |
| Billing/Stripe is greenfield | Yes: "No deliverable selector + credit gating" | Not addressed directly | Yes: "No stripe in pyproject.toml" | Yes: cost_cents/token_usage are placeholders | **CONFIRMED** — clean start, port from okestraai/DocuIntelli |
| Auth system is fully implemented | Yes: "Dev bootstrap + API auth middleware" | Not addressed | Yes: JWT + API key, rate limiting | Yes: dual-mode (X-API-Key + Bearer JWT), scopes | **CONFIRMED** — DEC-038 locks this as-is |
| No Dockerfile exists | Not mentioned | Not mentioned | Not mentioned | Yes: "No Dockerfile found" | **CONFIRMED** by ground truth only — others didn't check |
| MCP tools are implemented | Yes: mentions MCP integration | Yes: "10 substrate MCP tools fully implemented" | Yes: MCP-native tool architecture | Yes: mcp/ directory with substrate/knowledge/run tools | **CONFIRMED** — genuine differentiator |

**Summary:** All four sources agree on the core platform shape: working research graph (single-linear), working substrate (artifacts/manifests/pointers), working SSE streaming, working auth, missing fan-out, missing billing. These claims are safe to build on.

---

## Section 2: Contradictions

### Contradiction 1: Conversation Persistence

**Topic:** Does NYQST have server-side conversation storage?

**Codex says:** YES. "Conversations table + message persistence exist" (Section 1.1). Lists `conversation_service.py` and `conversations.py` API. Migration 0004 added these tables.

**Dify analysis says:** NO. "NYQST has NO server-side conversation model. Messages live in React state only. Browser tab closes -> conversation gone." (Section 1.1, marked CRITICAL). Repeated in Section 6.1: "Zero conversations are persisted; everything is client-side React state." Lists conversations + messages as "Critical missing tables (blocks MVP)."

**Our analysis says:** YES. Ground Truth doc (which is also Doc 4 of Our Analysis) explicitly lists migration 0004 adding conversations, messages, message_feedback, and sessions tables. API routes documented. Frontend has `conversation-store.ts`.

**Ground truth says:** YES, definitively. Migration `20260201_0004_conversations_sessions_tags.py` exists. Models: `Conversation`, `Message`, `MessageFeedback` in `src/intelli/db/models/conversations.py`. Repository: `conversations.py`, `messages.py`. API router: `src/intelli/api/v1/conversations.py` with full CRUD + message endpoints. Frontend: `conversation-store.ts` (Zustand, persisted).

**Resolution:** **Dify analysis is WRONG on this point.** This is the single most consequential error across all four documents. The Dify analysis was written against an outdated or incomplete view of the codebase (likely pre-0004 migration, or based on the Kiro copy rather than the real dev copy). Migration 0004 was added 2026-02-01, and the Dify analysis either predates this or was based on a stale snapshot.

**Impact of error:** The Dify analysis builds its entire critical path around this false premise. Its Phase 1 ("Table Stakes") includes "Conversation model (conversations + messages + feedback tables)" as the first priority. This work is **already done**. The 2-3 weeks estimated for conversation persistence can be **removed from the timeline**.

---

### Contradiction 2: ResearchAssistantGraph Complexity

**Topic:** How complex is the existing research agent graph?

**Codex says:** 3-node graph (agent -> tools -> capture_sources) with tool-use loop. Tools: `search_documents`, `list_notebooks`, `get_document_info`, `compare_manifests`. Streaming chat endpoint functional.

**Dify analysis says:** "2-node pipeline: retrieve -> generate. No tool calling, no branching, no loops." Claims "MCP tools exist but are not wired into graph."

**Our analysis says:** 3-node graph (agent -> tools -> capture_sources) with real tool-use loop. Consistent with Codex.

**Ground truth says:** 3-node StateGraph with agent/tools/capture_sources nodes. ToolNode with actual tools. Conditional edges for tool loop. This is a real agent with tool calling, not a "2-node pipeline."

**Resolution:** **Dify analysis is WRONG.** The graph has 3 nodes (not 2), includes a tool-use loop with ToolNode (not "no tool calling"), and the tools listed by Codex are confirmed by ground truth. The Dify characterization of "retrieve -> generate" dramatically understates the existing capability. The graph is a real ReAct-style agent loop, not a simple RAG pipeline.

**Impact of error:** The Dify analysis treats NYQST as if it has no agent capability at all, which leads to overestimating the work needed to build agent features. The existing graph is a solid foundation that needs Send() fan-out added, not a blank slate.

---

### Contradiction 3: Database Schema Maturity

**Topic:** How many tables does NYQST have, and which are missing?

**Codex says:** Lists 16+ tables including conversations, messages, sessions, tags. Acknowledges migration 0004.

**Dify analysis says:** "NYQST has 11 tables" and lists "Conversations + Messages" as "Critical missing tables (blocks MVP)."

**Our analysis / Ground truth says:** ~16 tables across 4 migrations. Conversations, messages, message_feedback, sessions, tags all exist.

**Resolution:** **Dify analysis is WRONG on the table count (11 vs ~16) and wrong about which tables are missing.** The Dify analysis appears to have been based on the first 3 migrations only (0001-0003), missing the entire 0004 migration that added the conversation/session layer.

---

### Contradiction 4: RAG Capability

**Topic:** How limited is NYQST's RAG implementation?

**Codex says:** RAG is functional: doc parsing via Docling, OpenSearch or pgvector backends, indexing and retrieval scoped to manifest/pointer.

**Dify analysis says:** "Fixed 2000-char chunks, no reranking, pgvector is vector-only (no BM25), no hierarchical chunking, no metadata filtering, no embedding cache." Rates quality impact as "LARGE AND MEASURABLE."

**Our analysis says:** RAG is "fully implemented" but does not assess quality limitations.

**Ground truth says:** RAG indexing + asking is "fully implemented." Both OpenSearch and pgvector backends exist. `rag_service.py` and `auto_index.py` are present.

**Resolution:** **Partially correct from all sides.** RAG exists and works (Codex and Ground Truth are right). The Dify analysis's specific quality criticisms (chunk size, no reranking, no hybrid search) are plausible engineering observations but were not verified against the actual `rag_service.py` code. The claim of "fixed 2000-char chunks" needs verification. The claim of "no reranking" is likely correct (no reranking library in pyproject.toml would confirm). The Dify analysis is right that RAG quality improvements would be impactful, but wrong to suggest RAG doesn't exist.

---

### Contradiction 5: Streaming Event Count

**Topic:** How many SSE event types does NYQST emit?

**Codex says:** Mentions AI SDK SSE + SSE ledger dual-stream. Does not give an exact event count.

**Dify analysis says:** "NYQST emits ~10 event types; Dify emits 25+." Then lists 14 events as "already implemented" (10 core AI SDK + 3 tool + 1 RAG citation) and 4 as "new events to implement."

**Our analysis says:** RunEventType enum has 25 event types (listed in full). 22 Superagent stream events extracted from Zod schemas.

**Ground truth says:** RunEventType has 25 entries (listed in full: RUN_STARTED through WARNING).

**Resolution:** **Dify analysis conflates two different event systems.** The "~10 event types" claim likely refers to the AI SDK SSE stream (the chat stream), which is distinct from the platform RunEventType enum (25 types). The run ledger has 25 event types. The Dify analysis is technically discussing the AI SDK chat stream events, not the platform run events. Both exist, and the Dify analysis's recommendation to add `ping`, `error`, `message-file`, `usage-update` to the chat stream is reasonable, but the framing of "NYQST emits ~10" is misleading because the platform-side event taxonomy is already rich.

---

### Contradiction 6: LangGraph Checkpointing Status

**Topic:** Is LangGraph checkpointing operational?

**Codex says:** "LangGraph checkpoints are operational for resumption" — but flags this as needing verification.

**Dify analysis says:** "Automatic checkpoint creation after every graph node (via PostgreSQL). Resume/retry from any checkpoint. Branching. Built-in interrupt()." BUT then: "this advantage is only realized if NYQST actually uses LangGraph's checkpointing and interrupt() primitives in production (current code does not)."

**Our analysis / Ground truth says:** `AsyncPostgresSaver` from `langgraph-checkpoint-postgres` is configured in `checkpointer.py`. The infrastructure exists. ApprovalRequested/Granted/Denied event types exist. But no UI for approval workflow.

**Resolution:** **Checkpointing infrastructure exists but is not exercised in production UX.** Codex's claim is technically correct (checkpointer is wired), but the Dify analysis's caveat is important: the capability exists in code but there is no user-facing path that exercises it. The ground truth confirms: "Approval workflow has backend event types but no UI yet." DEC-004 defers full pause/resume UI to v1.5.

---

### Contradiction 7: Timeline Estimates

**Topic:** How long will Superagent parity take?

**Codex says:** 6 phases, ~24 weeks (summing ranges: 2-3 + 2-4 + 2-4 + 4-6 + 6-10 + 6-12 = 22-39 weeks).

**Dify analysis says:** 4 phases, 13+ weeks.

**Our analysis / Implementation Plan says:** 4 phases, ~13 weeks (Phase 0: 1wk, Phase 1: 4wk, Phase 2: 4wk, Phase 3: 4wk).

**Ground truth implies:** Some of the Dify Phase 1 work (conversation persistence) is already done, which reduces the timeline further.

**Resolution:** See Section 5 for detailed comparison. Codex is the most pessimistic by a factor of 2x and includes features (browser-use/HITL) explicitly deferred to v2 in DEC-002. The Dify and Our Analysis timelines are roughly aligned at 13 weeks but the Dify analysis includes work that is already complete. Our analysis, grounded in the actual codebase and locked decisions, is the most realistic.

---

## Section 3: What Each Source Got Wrong

### Codex Errors

1. **Overscoped phases.** Codex includes browser-use/HITL as Phase 6 (6-12 weeks). DEC-002 explicitly defers this to v2. Including it in the timeline inflates the estimate by 6-12 weeks.

2. **"NYQST Markup v1" naming is premature.** Codex proposes "NYQST Markup v1 (clean-room) -- either JSON AST (recommended) or HTML-like tag set" but DEC-015 has already locked JSON AST. The "HTML-like tag set" option is dead.

3. **Unresolved infrastructure decisions that are already resolved.** Codex lists streaming protocol, web search provider, browser automation, model providers as "need your input." DEC-020 (AI SDK, not NDJSON), DEC-032 (Brave Search), DEC-002 (browser deferred), and OQ-001 (model provider still open but narrowed) have mostly resolved these.

4. **"Docling is used for PDF/DOCX/HTML parsing" flagged as needing verification.** This is a reasonable caution, but it is a minor detail, not a critical architectural claim.

5. **"Entity & citation substrate" as a standalone phase (Phase 2, 2-4 weeks).** DEC-016 resolved this: extend Artifact with entity_type field, no new entity table. This collapses Codex's Phase 2 into a migration + API change, not a multi-week phase.

6. **Timeline is 2x too long** even for the v1 scope. 24 weeks for the same scope that our plan targets in 13 weeks. The Codex estimate assumes more greenfield work than exists.

### Dify Analysis Errors or Mischaracterisations

1. **CRITICAL: "NYQST has NO server-side conversation model."** This is factually wrong. Migration 0004 (2026-02-01) added conversations, messages, message_feedback, sessions, and tags. This error propagates through the entire document: Sections 1.1, 1.6, 3.1, 6.1, 7 (Phase 1), and the Appendix all treat conversation persistence as the #1 priority gap. **It is not a gap at all.**

2. **"ResearchAssistantGraph is a 2-node pipeline: retrieve -> generate."** Wrong. It is a 3-node StateGraph with a ToolNode (real tool calling), conditional edges, and a capture_sources node. It is a ReAct-style agent loop, not a "retrieve -> generate" pipeline.

3. **"No tool calling, no branching, no loops."** Wrong on tool calling (ToolNode exists with 4 tools), wrong on loops (conditional edges loop back from capture_sources to agent). Correct on branching (no Send() fan-out) and correct that the graph is single-linear.

4. **"NYQST has 11 tables."** Wrong. NYQST has ~16 tables. The Dify analysis missed migration 0004 entirely.

5. **"Conversations + Messages" listed as "Critical missing tables (blocks MVP)."** Wrong. These tables exist.

6. **"Message feedback" listed as missing.** Wrong. `message_feedback` table exists (migration 0004). Frontend has `message-feedback.tsx`.

7. **"Current auto-index-on-miss approach works for small collections."** Not verified — this characterization of the RAG indexing strategy needs checking against `auto_index.py`.

8. **Framing NYQST as "early-stage prototype."** This is an understatement. NYQST has 16 tables, 11 API routers, a working LangGraph agent, full auth, SSE streaming, MCP tools, and a React frontend with chat, citations, run timeline, and workbench. This is a functioning platform, not a prototype.

9. **TypeScript migration analysis (Section 5.3) is a strawman.** Nobody proposed migrating to TypeScript. The 7-9 week rewrite estimate and risk assessment, while accurate, address a question that was never asked. This is wasted analysis space.

### Our Analysis Gaps or Uncertainties

1. **Exact LLM model used by Superagent** — "likely GPT-4, not Claude" is marked LOW confidence. Still unverified.

2. **System prompts for Superagent agents** — server-side only, cannot extract from client bundles. This is a genuine blind spot.

3. **v0.app integration details** — "inferred from metadata, not confirmed." DEC-034 sidesteps this by using direct LLM code generation instead.

4. **RAG quality benchmarks** — Our analysis says RAG is "fully implemented" but does not assess quality. The Dify analysis's quality criticisms (chunk size, reranking, hybrid search) are plausible and worth investigating, even though the Dify analysis got the platform facts wrong.

5. **Our analysis does not quantify the existing frontend maturity.** It lists components but does not assess polish level or UX gaps. Codex's observation that the UI is "not yet at polished consumer product level" is probably correct.

6. **Cost model for parallel fan-out runs** — OQ-004 in the Decision Register addresses this but it remains unresolved. Our analysis identifies the need for fan-out but doesn't estimate cost implications.

---

## Section 4: What Each Source Got Right That Others Missed

### Codex: Unique Valuable Insights

1. **Infrastructure swap matrix** (Section 3.2). Codex's systematic enumeration of every subsystem with "current default / parity requirement / decision needed" is the most thorough infrastructure assessment. None of the other sources provide this level of infrastructure decision tracking.

2. **Intentional divergences list** (Section 3.3). Explicitly calling out that NYQST differs from Superagent by design (framework, markup, streaming protocol) and framing these as "accept unless strong reason not to" is a useful framing that prevents scope creep.

3. **Run replay UX concept.** Codex identifies durable run replay as a feature gap and proposes "Replay run using stored run_events." Our analysis confirms the backend supports this (ReplayStream implementation), but Codex is the only source that frames it as a user-facing feature opportunity.

### Dify Analysis: Unique Valuable Insights

1. **RAG quality improvement specifics.** Despite getting platform facts wrong, the Dify analysis provides the most detailed RAG quality improvement roadmap: configurable chunking, reranking (Cohere/Jina), hybrid search (vector + BM25), embedding cache, hierarchical chunking. These are specific, actionable, and correctly prioritized by impact.

2. **SSE event specification.** The recommended 18-event catalog (Section 4.1) with specific event-to-LangGraph mapping table (Section 4.2) is the most concrete event design across all sources. The distinction between "events to adopt" and "events to reject" is particularly useful.

3. **AI SDK comparison verdict.** The analysis of Python backend vs. TypeScript AI SDK, while addressing a question nobody asked, does provide a well-reasoned justification for the current architecture. The "200-line adapter tax" framing is a useful mental model.

4. **Document processing status machine pattern.** The recommendation to add explicit state tracking for document indexing (waiting -> parsing -> cleaning -> splitting -> indexing -> completed) is not covered by other sources and is a real production need.

5. **Frontend state management layers.** The Zustand + TanStack React Query + Context separation pattern is a concrete recommendation for when state management complexity grows.

### Our Analysis: Unique Valuable Insights

1. **GML healer algorithm verbatim extraction.** No other source has the actual healer logic: unified/hast visitor pattern, width-constraint validation, mutations applied in reverse order. This is implementation-ready.

2. **18 GML tags with exact width constraint rules.** The WIDGET_WIDTHS map with parent constraints is extracted from minified bundle code. This is the specification for our markup renderer.

3. **10 chart types with full Plotly rendering logic.** Including gradient fills, trend detection, color palettes, error bar types. This is directly implementable.

4. **Citation buffering state machine.** Character-by-character parsing with `[`/`]` delimiters, documented from bundle code. Essential for streaming citation rendering.

5. **Data brief consolidation pattern.** The MSFT $281.7B figure measured identically in 5 separate files proves the shared-data-brief architecture. This is not a guess; it is a measured fact.

6. **PlanSet/Plan/PlanTask linked-list model.** Extracted from Zod schemas with exact field lists. This is the specification for our plan storage (DEC-014 stores plans as RunEvents, but the data model comes from here).

7. **Pricing model.** $20/month Pro, 200 runs/month, $0.50/run overage. 1 run = 1 AI generation (reads free). This directly informs our billing implementation (DEC-025, DEC-036).

### Ground Truth: Unique Valuable Insights

1. **Exact migration history.** Knowing that the next migration is 0005 prevents conflicts. No other source is precise about this.

2. **RunEventType complete enum.** The full 25-entry enum (including APPROVAL_REQUESTED/GRANTED/DENIED, CHECKPOINT, STATE_UPDATE) is only fully listed in ground truth.

3. **No Dockerfile.** Only ground truth identifies this deployment gap.

4. **arq background jobs are wired.** `arq>=0.26.0` + redis exists for background job processing. This is the infrastructure for DEC-017 (async entity creation via arq workers).

5. **Docker-compose does NOT include OpenSearch.** pgvector is built-in but OpenSearch requires external setup. This affects developer onboarding.

6. **Pointer model has `meta` JSONB.** Artifact does NOT have metadata JSONB, but Pointer does. This nuance matters for DEC-016 (extending Artifact with entity_type).

---

## Section 5: Scope Comparison

### Timeline Comparison Table

| Dimension | Codex | Dify Analysis | Our Plan | Ground Truth Implied |
|-----------|-------|---------------|----------|---------------------|
| Total phases | 6 | 4 | 4 (Phase 0-3) | N/A |
| Total weeks | ~24 (22-39 range) | 13+ | ~13 | Shorter than 13 (some work already done) |
| Conversation persistence | Not a separate phase (already exists) | Phase 1, Weeks 1-4 (2-3 weeks) | Not a phase (already exists) | Already done (migration 0004) |
| RAG improvements | Not explicit | Phase 2, Weeks 5-8 (4-6 weeks) | Phase 2 | Real need, timeline TBD |
| Orchestration (fan-out) | Phase 1 (2-3 weeks) | Phase 3, Weeks 9-12 | Phase 1 (4 weeks) | #1 gap, should be early |
| Report/Document deliverables | Phase 4 (4-6 weeks) | Not explicit phase | Phase 2-3 | Real need |
| Slides/Website deliverables | Phase 5 (6-10 weeks) | Not addressed | Phase 3 | Lower priority |
| Browser-use/HITL | Phase 6 (6-12 weeks) | Not addressed | Deferred to v2 | Deferred (DEC-002) |
| Billing | Not explicit | Not addressed | Phase 2 | Greenfield, port from DocuIntelli |

### Which Estimate is Most Realistic?

**Codex is too long** by approximately 2x. Reasons:
1. Includes browser-use/HITL (deferred to v2 by DEC-002) = -6 to -12 weeks.
2. "Entity & citation substrate" as a multi-week phase is collapsed by DEC-016 (add entity_type field to Artifact, no new table) = -2 to -4 weeks.
3. Assumes more greenfield work than exists (conversations, sessions, messages already implemented).
4. Phase duration ranges are wide (e.g., "6-10 weeks" for slides/website) suggesting low confidence in estimates.

**Dify analysis is closest to our plan in weeks (13) but misallocates effort.** Phase 1 includes 2-3 weeks for conversation persistence that is already done. If that is removed, the effective timeline for remaining work is ~10-11 weeks, which is more aggressive than our plan.

**Our plan (13 weeks, 4 phases) is the most realistic** because:
1. It is grounded in the actual codebase (ground truth).
2. It accounts for existing capabilities (conversations, sessions, auth, SSE, RAG).
3. It has locked decisions that eliminate ambiguity (42 DEC entries).
4. Fan-out orchestration is correctly prioritized as Phase 1 (the actual hard problem).

**Ground truth implies the timeline could be shorter than 13 weeks** because:
- Conversation persistence exists (saves 2-3 weeks vs. Dify plan).
- SSE infrastructure is production-ready (no rebuild needed).
- arq background workers are wired (async entity creation is infrastructure-ready).
- Auth is complete (no auth work needed).
- However, the hard problems (fan-out orchestration, GML healer, deliverable pipelines) are genuinely complex and 13 weeks is reasonable for those.

---

## Section 6: Strategic Decision Points Unresolved Across All Sources

Ordered by impact on the implementation plan.

### 1. LLM Provider for Orchestrator (OQ-001) -- HIGHEST IMPACT

**Why it matters:** The planner and meta-reasoning nodes are the most critical new code. Model choice affects quality, cost, and latency of every research run.

**What sources say:**
- Codex: flags as "need your input" but doesn't recommend
- Dify: not addressed
- Our analysis: notes "No Anthropic SDK" as HIGH confidence fact
- Ground truth: only langchain-openai exists; custom base_url override is supported

**Suggested resolution:** Option (A) from OQ-001 -- add `langchain-anthropic` for planner/meta-reasoning, keep gpt-4o-mini for fan-out workers. Rationale: Claude excels at instruction following and structured output, which is exactly what the planner node needs. The existing base_url override means an OpenAI-compatible Claude proxy (via Amazon Bedrock or Anthropic API's OpenAI compatibility) is also viable without adding a new dependency.

### 2. Per-Run Cost Budget (OQ-004) -- HIGH IMPACT

**Why it matters:** 13+ parallel subagents on gpt-4o could cost $0.50-$2.00 per run. At $0.50/run overage billing (our pricing model from DEC-025), some runs could lose money.

**What sources say:**
- Codex: not addressed
- Dify: not addressed (Dify's model is single-agent, not parallel)
- Our analysis: identifies 13+ parallel tasks from screenshots but doesn't estimate cost
- Ground truth: cost_cents and token_usage fields exist on Run model

**Suggested resolution:** Option (C) from OQ-004 -- user-configurable model per node type, with gpt-4o-mini default for fan-out workers and gpt-4o/Claude for orchestrator. Add a hard cost ceiling per run (e.g., $2.00) with automatic graceful degradation (switch to mini if ceiling is approaching).

### 3. Hydrated Content Rendering (OQ-005) -- HIGH IMPACT

**Why it matters:** This determines how deliverables (reports, websites, slides) render in the chat UI. Get this wrong and the entire deliverable UX breaks.

**What sources say:**
- Codex: proposes "NYQST Markup v1" but doesn't address rendering integration
- Dify: not addressed (Dify doesn't have deliverable rendering)
- Our analysis: documents `<answer>` wrapper + `<gml-*>` tags from chat export
- Ground truth: ChatPanel.tsx uses @assistant-ui/react; tool-uis.tsx has makeAssistantToolUI

**Suggested resolution:** Option (B) from OQ-005 -- custom HydratedContentRenderer that parses the `<answer>` wrapper and mounts deliverable web components. The @assistant-ui/react renderer is designed for chat messages, not for complex deliverable rendering with embedded viewers. A dedicated renderer provides cleaner separation.

### 4. RAG Quality Improvements -- MEDIUM IMPACT

**Why it matters:** Directly affects output quality for research-heavy workflows.

**What sources say:**
- Codex: says RAG works but doesn't assess quality
- Dify: provides detailed quality improvement roadmap (reranking, hybrid search, configurable chunks)
- Our analysis: says RAG is "fully implemented" without quality assessment
- Ground truth: both OpenSearch and pgvector backends exist

**Suggested resolution:** Verify current chunk size and search configuration in `rag_service.py`. If chunks are indeed 2000 chars, make configurable. Add reranking as a Phase 2 improvement (Cohere API is straightforward). Hybrid search on pgvector path (add BM25 via pg_trgm or tsvector) is medium effort, high reward.

### 5. Website Public URL in v1 (OQ-003) -- LOW-MEDIUM IMPACT

**Why it matters:** Superagent serves generated websites at unauthenticated public URLs. If users expect to share generated websites, iframe-only preview is insufficient.

**Suggested resolution:** Option (A) for v1 -- iframe-only preview. Public URL hosting requires CDN infrastructure, unauthenticated route middleware, and abuse prevention. These are deployment concerns, not product concerns. Defer to v1.5 unless user feedback demands it.

### 6. OpenSearch vs. pgvector Default -- LOW IMPACT (for v1)

**Why it matters:** Docker-compose doesn't include OpenSearch, so developers default to pgvector. If production uses OpenSearch, there is a dev/prod parity gap.

**What sources say:**
- Codex: "OpenSearch preferred; pgvector fallback"
- Ground truth: "docker-compose does NOT include OpenSearch"
- Implementation plan: not explicitly addressed

**Suggested resolution:** Default to pgvector for v1 development and deployment. Add OpenSearch container to docker-compose as optional. Both backends are implemented; the choice is operational, not architectural.

---

## Section 7: Revised Ground Truth (Synthesis)

The 10 most important facts about the platform and problem, ranked by confidence.

### Fact 1: The NYQST platform is a functioning system, not a prototype.
**Confidence: CERTAIN.**
16 tables, 11 API routers, full auth, working LangGraph agent, SSE streaming, MCP tools, React frontend with chat/citations/run-timeline/workbench. All four sources confirm major subsystems work. The Dify analysis's characterization of "early-stage prototype" is incorrect.

### Fact 2: Parallel fan-out (Send() pattern) is the #1 technical gap for Superagent parity.
**Confidence: CERTAIN.**
All four sources agree. The existing ResearchAssistantGraph is single-linear. Superagent runs 13+ parallel workstreams. Adding a supervisor/coordinator pattern with Send() dispatch is the most important implementation task.

### Fact 3: Conversation persistence already exists.
**Confidence: CERTAIN.**
Migration 0004 (2026-02-01) added conversations, messages, message_feedback, sessions, tags. Full CRUD API. Frontend store. The Dify analysis's claim that this is missing is wrong.

### Fact 4: The content-addressed substrate (artifacts/manifests/pointers) is architecturally sound and a genuine differentiator.
**Confidence: CERTAIN.**
All four sources agree. SHA-256 content addressing, immutable manifest DAGs, mutable pointer heads. No other platform in the comparison space has this.

### Fact 5: The existing ResearchAssistantGraph is a real ReAct-style agent, not a simple pipeline.
**Confidence: CERTAIN.**
3-node StateGraph with ToolNode, conditional edges, 4 tools (search_documents, list_notebooks, get_document_info, compare_manifests). The Dify analysis's "2-node pipeline" characterization is incorrect.

### Fact 6: Superagent uses a GML (Gradient Markup Language) tag system with a healer for structured output.
**Confidence: HIGH.**
18 tags with width constraints, healer algorithm extracted from minified JS. The healer is not optional — it corrects LLM output at render time. Our implementation needs an equivalent (DEC-040: Pydantic validator + AST repair).

### Fact 7: The streaming architecture is dual-stream: AI SDK SSE for chat + PG LISTEN/NOTIFY SSE for platform events.
**Confidence: HIGH.**
Confirmed by Codex, ground truth, and locked in DEC-020/DEC-021. Superagent uses unified NDJSON, but our dual-stream approach delivers equivalent semantics.

### Fact 8: Billing is greenfield but the data model is ready.
**Confidence: HIGH.**
No Stripe dependency. Run model has cost_cents and token_usage fields. Pricing model confirmed: $20/month, 200 runs, $0.50/run overage. Port from okestraai/DocuIntelli (DEC-036).

### Fact 9: RAG works but quality improvements (reranking, hybrid search, configurable chunking) would measurably improve output.
**Confidence: MEDIUM-HIGH.**
RAG is functional (all sources agree). Quality limitations (from Dify analysis) are plausible but not verified against actual code. Reranking adding 10-30% precision is a well-established benchmark finding, not specific to this codebase.

### Fact 10: The 13-week implementation timeline is achievable for v1 scope.
**Confidence: MEDIUM.**
Based on: existing capabilities reduce scope, locked decisions eliminate ambiguity, hard problems (fan-out, deliverables, GML) are well-specified. Risk factors: single developer velocity unknown, LLM provider decision (OQ-001) blocks Phase 1, RAG quality scope is elastic.

---

## Section 8: Implications for the Implementation Plan

### Implication 1: Remove "Conversation Persistence" from Phase 1 scope.

The Dify analysis's Phase 1 includes 2-3 weeks for conversation persistence. This is already done. Any plan or backlog item that treats conversation storage as new work should be marked "COMPLETED - migration 0004." The implementation plan should start directly with the actual hard problem: fan-out orchestration.

**Action:** Review BL-* items in BACKLOG.md. Any item involving "add conversations table" or "implement message persistence" is already done. Verify that the existing conversations API and frontend store meet the requirements for the deliverable UX, but do not re-implement them.

### Implication 2: The Dify analysis's RAG quality roadmap should be adopted, but reprioritised.

The Dify analysis provides the most detailed RAG improvement roadmap across all sources. Even though it got platform facts wrong, the quality recommendations (configurable chunking, reranking, hybrid search, embedding cache) are sound engineering. However, these should be Phase 2 work, not Phase 1. Fan-out orchestration is the bigger gap.

**Action:** Add "RAG quality improvements" as a Phase 2 workstream with three items: (1) verify current chunk configuration in rag_service.py, (2) add reranking via Cohere API, (3) evaluate hybrid search on pgvector path. Estimate: 2-3 weeks, not the Dify analysis's 4-6 weeks (because the RAG infrastructure already works).

### Implication 3: Codex's timeline should be discarded and its scope items re-evaluated.

Codex's 24-week estimate is 2x our plan and includes deferred features (browser-use). However, Codex's infrastructure swap matrix and intentional divergences list are valuable reference documents. The Codex analysis should be treated as a requirements catalog, not a project plan.

**Action:** Extract the "Infrastructure swap matrix" (Section 3.2) and "Intentional divergences" (Section 3.3) from the Codex analysis into a standalone reference. Discard the phased plan. Mark already-resolved decisions from the Decision Register against Codex's "unresolved" items.

### Implication 4: The GML healer implementation (from Our Analysis) should be prioritised alongside fan-out orchestration.

Without the healer, deliverable rendering will be brittle. The healer is what makes Superagent's LLM output acceptable — it corrects structural violations at render time. Our analysis has the exact algorithm. DEC-040 locks this as "Pydantic validator + AST repair logic in Python."

**Action:** Schedule GML healer implementation in Phase 1 alongside fan-out orchestration. These are independent workstreams: fan-out is backend/LangGraph, healer is a pure-Python validation module. They can proceed in parallel.

### Implication 5: Validate Dify analysis's specific RAG claims against actual code before planning.

The Dify analysis makes specific claims about NYQST's RAG limitations (2000-char chunks, no reranking, no BM25) that are plausible but unverified. Before committing to a RAG improvement roadmap, read `rag_service.py` and `auto_index.py` to confirm or deny these claims. The Dify analysis was wrong about 6 major platform facts; its RAG claims need independent verification.

**Action:** Dispatch a targeted code review of `src/intelli/services/knowledge/rag_service.py` and `src/intelli/services/indexing/auto_index.py` to verify: (a) chunk size configuration, (b) reranking presence, (c) search method (vector-only vs. hybrid). Report findings before committing to RAG improvements in the backlog.

---

## Appendix: Error Summary by Source

| Source | Critical Errors | Minor Errors | Unique Value |
|--------|----------------|--------------|--------------|
| Codex | Timeline 2x too long; includes deferred scope | Unresolved items already resolved by DEC register | Infrastructure swap matrix; intentional divergences |
| Dify Analysis | "No conversation persistence" (WRONG); "2-node pipeline" (WRONG); "11 tables" (WRONG); "prototype" framing (WRONG) | SSE event count conflation; TypeScript migration strawman | RAG quality roadmap; SSE event specification; document processing state machine |
| Our Analysis | None critical | Exact Superagent LLM model unverified; RAG quality not assessed | GML healer algorithm; chart schemas; citation state machine; pricing model |
| Ground Truth | None (authoritative) | None identified | Migration history; RunEventType enum; Docker-compose contents; arq wiring |

---

**Generated:** 2026-02-18
**Analyst:** Claude Opus 4.6
**Method:** Cross-referencing four independent analyses against authoritative ground truth, with explicit contradiction tracking and error attribution
