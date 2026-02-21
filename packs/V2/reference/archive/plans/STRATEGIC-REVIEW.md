---
document_id: STRATEGIC-REVIEW
version: 1
date: 2026-02-18
model: opus
inputs: [LIBRARY-REFERENCE.md, DEPENDENCY-ANALYSIS.md, DECISION-REGISTER.md, GIT-ISSUES-STRUCTURE.md, IMPLEMENTATION-PLAN.md]
feeds_into: [IMPLEMENTATION-PLAN.md restructure]
---

# Strategic Review: Pre-Implementation Audit

This is a pre-flight check. The planning work done so far is substantial and largely well-reasoned. The following analysis focuses exclusively on what is wrong, missing, contradictory, or risky -- not what is right.

---

## 1. Decision Gaps

These are decisions that **must** be locked before the first line of implementation code is written, but currently are not.

### DG-1: Chart library -- Plotly.js or Recharts?

**The gap**: LIBRARY-REFERENCE.md (LIB-13) documents Plotly.js with full API patterns, install commands, and gotchas. IMPLEMENTATION-PLAN.md Section 3.6, GIT-ISSUES BL-009, and the file manifest all reference **Recharts** as the chart rendering library. These are fundamentally different libraries with different APIs, bundle sizes, and rendering approaches.

**Why it matters**: This is not a cosmetic inconsistency. Plotly.js is ~3 MB, imperative, and DOM-based. Recharts is ~400 KB, declarative, and React-native. The chart node schema in MarkupDocument (BL-004) must emit data in the format matching whichever library is chosen. If this is not locked, BL-004, BL-005, BL-009, and BL-019 will all make conflicting assumptions.

**Options**:
- (A) **Recharts** -- lighter, React-idiomatic, simpler API. Sufficient for bar/line/pie/area. Lacks candlestick, 3D, and some advanced chart types.
- (B) **Plotly.js** (via react-plotly.js) -- heavier, more chart types, interactive. Superagent uses Plotly per the analysis docs.
- (C) **Both** -- Plotly for complex charts, Recharts for simple ones. Adds complexity.

**Recommendation**: Recharts for v1. The 10 chart Zod schemas extracted from Superagent map cleanly to Recharts chart types. Plotly's bundle size is a real concern for a Vite SPA. If candlestick/3D is needed, add Plotly later as a second renderer. But lock this now and remove the Plotly.js entry from LIBRARY-REFERENCE.md (or keep it as a "v2 candidate").

### DG-2: arq worker process deployment model

**The gap**: The plan assumes arq + Redis are "available" because Redis is in docker-compose and `jobs.py` exists. But the ground truth says "wired but background job definitions in `src/intelli/core/jobs.py`" -- this strongly implies `jobs.py` has boilerplate or minimal setup, not production worker functions. Nobody has verified whether the arq worker process is actually started by any deployment script, docker-compose service, or supervisor config.

**Why it matters**: arq requires a separate **worker process** (not just a Redis container). If no worker process is running, every `enqueue_job()` call silently drops the job. Multiple critical features depend on arq: co-generation (BL-005/006), async entity creation (BL-016), and potentially report generation itself. If arq is not actually operational, these features fail silently.

**Options**:
- (A) Verify arq worker is operational -- inspect `jobs.py`, find the process start command, test a round-trip enqueue/execute.
- (B) Add arq worker as a docker-compose service if it does not exist.
- (C) Skip arq entirely for v1 -- use FastAPI `BackgroundTasks` for lightweight async work, and run LangGraph graph execution in-process.

**Recommendation**: Verify immediately (15-minute task). If `jobs.py` is boilerplate, add the arq worker service to docker-compose as a Phase 0 task. Do NOT proceed assuming arq works without verifying.

### DG-3: LLM structured output enforcement strategy

**The gap**: Multiple features depend on LLMs producing valid JSON: BL-001 (planner produces ResearchTask list), BL-005 (report generation produces MarkupDocument JSON), BL-006 (website generation produces HTML), BL-022 (synthesis produces DataBrief). The plan mentions "structured JSON output" and "MarkupHealer" but does not specify which enforcement mechanism: OpenAI function calling, JSON mode (`response_format: { type: "json_object" }`), or Pydantic-based `with_structured_output()` from LangChain.

**Why it matters**: Without enforcement, LLMs produce invalid JSON 5-15% of the time. At 13 parallel subagents, the probability of at least one failure per run is ~50-85%. The healer catches some errors post-hoc, but malformed JSON that fails `json.loads()` cannot even reach the healer.

**Options**:
- (A) LangChain `with_structured_output(PydanticModel)` -- binds the output schema as a function call, returns a validated Pydantic model. Cleanest.
- (B) OpenAI JSON mode + post-hoc Pydantic validation -- simpler, but schema is not enforced by the model.
- (C) Free-form + regex extraction + healer -- most brittle, maximum creative freedom for the LLM.

**Recommendation**: (A) for all structured outputs (planner, synthesis, report section generation). (C) only for website HTML generation where the output is not JSON. Add this as a locked decision (DEC-042 or similar) before Phase 1.

### DG-4: GmlComponentParser rendering approach (OQ-005 must be resolved)

**The gap**: OQ-005 asks whether `@assistant-ui/react` already handles `<gml-*>` web components in message content. This is not a "nice to know" -- it determines the entire frontend rendering architecture. If `@assistant-ui/react` does not natively parse HTML with custom elements, a completely separate rendering pipeline is needed for `hydrated_content`.

**Why it matters**: This blocks BL-009, BL-010, BL-018 slides preview, and BL-021 clarification UI -- essentially all of Phase 3 frontend work. If the answer is "custom renderer needed," that is a new M-sized task not currently in the backlog.

**Recommendation**: Resolve this in Week 1 by reading the `@assistant-ui/react` source and the existing `ChatPanel.tsx` implementation. Write a 10-line spike that renders `<gml-ViewReport>` in a message. Lock the answer before Wave 1 starts.

### DG-5: Database session management in parallel LangGraph nodes

**The gap**: The plan mentions "per-node async DB session lifecycle" in BL-001c but does not specify the pattern. LangGraph Send() nodes run in parallel within a single Python process. If they share an `AsyncSession`, you get `MissingGreenlet` errors and data corruption. If they each create their own engine, you exhaust the connection pool.

**Why it matters**: This is the hardest technical problem in the entire project. Get it wrong and the orchestrator deadlocks or corrupts data under load.

**Recommendation**: Lock the pattern: each `research_worker_node` invocation creates a new session from the shared `async_sessionmaker` (not engine). Sessions are scoped to the node function lifetime. Add this as a technical decision and include it in BL-001c acceptance criteria.

### DG-6: Migration 0005 scope -- one migration or split?

**The gap**: The plan bundles entity_type columns, message extensions (7 new columns), and billing tables (2 new tables) into a single migration. DEPENDENCY-ANALYSIS.md Risk 2 acknowledges this is risky but only suggests splitting "if conflicts arise." That is too late -- if the migration fails in Week 2, everything downstream is blocked.

**Recommendation**: Pre-decide the split strategy. If Migration 0005 touches more than 2 tables with new columns, split into 0005a (artifact entity_type + tags), 0005b (message extensions), 0005c (billing tables). Independent migrations can land independently and do not block each other.

---

## 2. Assumption Audit

| # | Assumption | Probability Wrong | Consequence | Validation |
|---|-----------|-------------------|-------------|------------|
| A1 | arq worker process is running and processes jobs | **High** | Co-generation, async entities, and potentially report gen all fail silently | Run `docker-compose ps`, inspect `jobs.py` for `WorkerSettings`, test enqueue/execute round-trip |
| A2 | LangGraph Send() works with async DB sessions across parallel nodes | **Medium** | Deadlocks, `MissingGreenlet` errors, data corruption under fan-out | Build a minimal 3-node Send() prototype with async DB writes in Week 1 |
| A3 | `@assistant-ui/react` can render custom HTML elements in message content | **Medium** | Entire Phase 3 rendering architecture changes; GmlComponentParser scope grows | Read ChatPanel.tsx source and test with a `<gml-ViewReport>` string |
| A4 | WeasyPrint system dependencies are available in the deployment environment | **Medium** | PDF export fails in production; requires libpango, libcairo, libgdk-pixbuf | Test `weasyprint.HTML(string="<h1>test</h1>").write_pdf()` on the deployment target |
| A5 | Brave Search API free tier rate limits are sufficient for 13+ parallel queries per run | **Medium** | Research runs fail or timeout due to 429s; degraded quality | Check actual RPM limit on Brave free plan; test 15 concurrent requests |
| A6 | gpt-4o-mini produces valid structured JSON (ResearchTask, DataBrief) reliably | **Medium** | Planner and synthesis steps fail 10-20% of the time; healer cannot fix pre-parse errors | Test with `with_structured_output()` on 20 diverse research queries |
| A7 | Existing `ResearchAssistantGraph` can be extended without breaking existing functionality | **Low-Medium** | Backward-compat regression; existing users lose working research capability | Run full existing test suite after BL-001a (state extension) before proceeding |
| A8 | `parent_run_id` FK supports the child run pattern without additional indexing | **Low** | Slow queries when fetching child runs for a parent; N+1 performance issues | Check for existing index on `parent_run_id`; add one in migration 0005 if absent |
| A9 | reveal.js HTML can be reliably generated by an LLM in a single pass | **Medium** | Slides deliverable produces broken presentations; reveal.js requires exact DOM structure | Test LLM generation of a 5-slide reveal.js deck with 3 different models |
| A10 | The 7-stage website generation pipeline completes within reasonable LLM budget | **Medium-High** | A single website generation could cost $3-10 in LLM calls (7 stages x multiple LLM calls per stage) | Estimate token costs for each stage; set a hard budget ceiling per deliverable type |
| A11 | PG LISTEN/NOTIFY scales to 13+ parallel subagents emitting events simultaneously | **Low-Medium** | Event ordering issues, missed notifications, or connection saturation | Stress test: 15 concurrent NOTIFY calls with 5 listening clients |
| A12 | Migration 0005 adding 7 columns to Message table is backward-compatible with all NULL defaults | **Low** | Existing message queries break if any column has an unexpected NOT NULL constraint | Review Message model definition; ensure all new columns are nullable |

---

## 3. Architecture Risks

### AR-1: LangGraph Send() with async Postgres sessions (CRITICAL)

**Risk**: Send() dispatches N parallel nodes in a single "superstep." Each node needs an async DB session to create child runs, log events, and store artifacts. SQLAlchemy `AsyncSession` is not thread-safe and not designed for sharing across coroutines. LangGraph's internal execution model for parallel nodes is not well-documented for async DB access patterns.

**Likelihood**: Medium-High
**Impact**: High -- deadlocks, data corruption, or `MissingGreenlet` errors that only appear under parallel load
**Mitigation**:
1. Build a Send() prototype in Week 1 with 5 parallel nodes each writing to Postgres
2. Use `async_sessionmaker` with `expire_on_commit=False`, one session per node invocation
3. Pin LangGraph version and study the source for how Send() manages asyncio tasks
4. Fallback plan: if parallel DB writes are unstable, serialize the DB operations through a queue while keeping LLM calls parallel

### AR-2: SSE event ordering under parallel subagent emission

**Risk**: 13+ subagents emit PLAN_TASK_STARTED/COMPLETED events concurrently via PG NOTIFY. The SSE client receives these in the order PostgreSQL delivers them, which is not guaranteed to be the order they were emitted. The frontend PlanViewer assumes a temporal ordering (started before completed) that may not hold.

**Likelihood**: Medium
**Impact**: Medium -- garbled UI state, task cards showing "completed" before "started"
**Mitigation**:
1. Add a monotonic sequence number to each RunEvent (server-side timestamp + sequence counter)
2. Frontend sorts events by sequence number, not arrival order
3. PlanViewer tracks state machine per task: only transition forward (pending->processing->done)

### AR-3: Migration 0005 as a monolith

**Risk**: A single migration touching Artifact (entity_type, tags), Message (7 columns), and creating 2 new billing tables is a high-risk atomic operation. If any part fails, the entire migration rolls back. During development, migration conflicts between parallel developer tracks (Track 2 needing entity_type, Track 5 needing billing tables) will cause merge conflicts in the migration file.

**Likelihood**: Medium
**Impact**: Medium-High -- 2-5 day delay, merge conflicts, potential data model confusion
**Mitigation**: Split into 0005a (artifact extensions), 0005b (message extensions), 0005c (billing tables). Each can land independently.

### AR-4: Co-generation race condition

**Risk**: When `deliverable_type=website`, the system generates a website manifest AND dispatches a companion report via arq. The AI message `hydrated_content` references both `<gml-ViewWebsite>` and `<gml-ViewReport>`. If the report background job has not completed when the frontend renders the message, the report artifact does not exist yet. The `GET /api/v1/artifacts/{sha256}/content` call returns 404.

**Likelihood**: High -- background jobs take 30-120 seconds; the message renders immediately
**Impact**: Medium -- broken UI for the first 30-120 seconds after message delivery
**Mitigation**:
1. Emit `ARTIFACT_CREATED` event when the companion report is ready; frontend waits for it
2. ReportRenderer shows a loading/pending state when artifact is not yet available
3. Use `has_async_entities_in_progress` flag to signal "not done yet" to the frontend
4. Consider: generate the report FIRST, then the website, to avoid the race entirely (reverses the co-generation order)

### AR-5: WeasyPrint deployment constraints

**Risk**: WeasyPrint requires system-level C libraries (libpango, libcairo, libgdk-pixbuf, libffi, libglib). These are not Python packages -- they must be installed at the OS level. If the production deployment is containerized (likely, given docker-compose), the Dockerfile must include these. If not containerized (bare metal, serverless), installation is environment-specific.

**Likelihood**: Medium
**Impact**: Medium -- PDF export works in dev but fails in production/CI
**Mitigation**:
1. Add WeasyPrint system dependencies to the Dockerfile immediately (Phase 0)
2. Add a CI step that runs `weasyprint.HTML(string="test").write_pdf()` to catch missing deps early
3. Document the exact `apt-get install` or `brew install` commands

### AR-6: LLM cost explosion with deep research runs

**Risk**: A research run with 13 parallel subagents, each making 3-5 tool calls with LLM reasoning, followed by report generation (4 passes), website generation (7 stages), and meta-reasoning, could consume 200K-500K tokens. At gpt-4o pricing ($2.50/1M input, $10/1M output), a single run could cost $2-5. The billing model charges users $0.50/run for overage -- the platform loses money on every deep run.

**Likelihood**: High
**Impact**: High -- unsustainable unit economics; potential for runaway costs in development
**Mitigation**:
1. Lock OQ-004: gpt-4o-mini for fan-out workers (10x cheaper), gpt-4o only for planner/synthesis/meta-reasoning
2. Set a hard token budget per run (e.g., 300K tokens max)
3. Add per-node token tracking to DataBrief for cost visibility
4. Log actual costs in `Run.cost_cents` and monitor before launch

### AR-7: Scope of existing `ResearchAssistantGraph` modification

**Risk**: The plan says "extend, not replace" the existing graph. But adding 6+ new nodes (planner, fan_out, research_worker, fan_in, synthesis, deliverable_router) around the existing 3-node loop fundamentally changes the graph topology. The existing entry point (agent -> tools_condition -> tools -> capture_sources -> agent) must now become a sub-loop within `research_worker_node`. This is architecturally closer to a "wrap and redirect" than an "extend."

**Likelihood**: Low-Medium
**Impact**: Medium -- if the wrapping breaks existing non-research uses of the graph, other features regress
**Mitigation**:
1. Add a conditional entry point: if `deliverable_type` is set, enter the new planner path; if not, use the existing agent loop unchanged
2. Test the "no deliverable_type" path passes all existing tests
3. Consider: the research orchestrator could be a separate compiled subgraph that is registered as a node in the existing graph, preserving the original graph topology entirely

---

## 4. Inter-document Contradictions

### C-1: Plotly.js vs. Recharts (BLOCKING)

**LIBRARY-REFERENCE.md** (LIB-13) documents Plotly.js as the chart library with full patterns.
**GIT-ISSUES** (BL-009) specifies "CHART nodes render as Recharts charts."
**IMPLEMENTATION-PLAN.md** Section 3.6 references "recharts" and the file manifest adds "recharts (if absent)" to package.json.

These are different libraries. One document must be wrong. The DECISION-REGISTER does not contain a locked decision on chart library choice.

### C-2: BL-003 dependency -- independent or blocked by BL-001?

**DEPENDENCY-ANALYSIS.md** correctly identifies that BL-003 tools (Brave/Jina wrappers) can be built independently, with only the orchestrator integration requiring BL-001. It places BL-003 standalone work in Wave 0.
**GIT-ISSUES** (BL-003) lists `Blocked By: BL-001` without qualification.
**IMPLEMENTATION-PLAN.md** shows BL-003 in Phase 1 (Weeks 3-5).

The DEPENDENCY-ANALYSIS correction is right -- BL-003 tools have zero platform dependencies. The GIT-ISSUES and IMPLEMENTATION-PLAN should reflect the split.

### C-3: BL-022 dependency direction

**BACKLOG.md** (via GIT-ISSUES) lists BL-022 as `Blocked By: BL-001`.
**DEPENDENCY-ANALYSIS.md** correctly identifies this as backwards: BL-022 (DataBrief design) should FEED INTO BL-001, not depend on it. The design portion has no dependencies.
**GIT-ISSUES** still shows `Blocked By: BL-001`.

This contradiction is acknowledged in DEPENDENCY-ANALYSIS but not corrected in GIT-ISSUES.

### C-4: BL-008 dependency on BL-015

**DEPENDENCY-ANALYSIS.md** adds BL-015 as a weak dependency of BL-008.
**GIT-ISSUES** (BL-008) lists `Blocked By: None` and `Blocks: None`.

BL-008 writes to `useDeliverableStore()` (BL-015). The issue should reflect this.

### C-5: BL-012 listed as "no dependencies" in GIT-ISSUES

**GIT-ISSUES** (BL-012): `Blocked By: None (independent track; billing tables land in migration 0005 during Phase 0)`.
**DEPENDENCY-ANALYSIS.md**: `BL-012 needs Migration 0005` (explicitly added as a correction).

The parenthetical in GIT-ISSUES acknowledges the migration dependency but the `Blocked By` field says "None." This is misleading.

### C-6: BL-016 claims "arq + Redis already configured" in GIT-ISSUES

**GIT-ISSUES** (BL-016) technical notes: "Async job in: `src/intelli/core/jobs.py` (arq + Redis already configured)."
**PLATFORM-GROUND-TRUTH.md**: "arq>=0.26.0 + redis wired but background job definitions in `src/intelli/core/jobs.py`."

The word "wired" is ambiguous. "Already configured" implies it works. "Wired but background job definitions" implies boilerplate exists but may not be operational. This is Assumption A1 and must be verified.

### C-7: Milestone/Phase mapping inconsistency

**GIT-ISSUES** milestones place BL-008 (DeliverableSelector) and BL-015 (DeliverableStore) in **M3: Frontend** (Phase 3, Weeks 9-11).
**DEPENDENCY-ANALYSIS.md** places both in **Wave 0** (Week 1) as first-movers with no dependencies.

These items can and should start in Week 1 per the dependency analysis, but they are tagged for a Phase 3 milestone. The phasing in GIT-ISSUES follows a waterfall-ish "all frontend in Phase 3" structure that contradicts the parallel-track execution model in DEPENDENCY-ANALYSIS.

### C-8: 13-week vs. 7-week timeline

**IMPLEMENTATION-PLAN.md**: "Total: 13 weeks."
**DEPENDENCY-ANALYSIS.md**: "7 weeks minimum with unlimited developers, 10-11 weeks realistic."

The 13-week plan uses a sequential phase model. The 7-week model uses a parallel-track model. These are different execution strategies. The plan must pick one. The 5-track parallel model from DEPENDENCY-ANALYSIS is more efficient but requires 4-5 developers.

---

## 5. Scope Creep Vectors

### SC-1: Website generation quality spiral
The 7-stage pipeline (plan, scaffold, content, style, data viz, review, bundle) is already ambitious. Once stakeholders see generated websites, they will want: responsive design, dark mode, better typography, animations, interactive elements, multi-page navigation. Each "improvement" adds an LLM pass. **Lock**: v1 websites are single-page, static HTML. No responsive, no animations, no multi-page.

### SC-2: Meta-reasoning recovery depth
BL-017 meta-reasoning can dispatch "recovery tasks" when it finds gaps. If recovery tasks also fail or find new gaps, the meta-reasoning node runs again. The `meta_reasoning_done` flag prevents infinite loops but allows one recovery round. Stakeholders may want "recursive meta-reasoning." **Lock**: v1 allows exactly one recovery round. No recursive meta-reasoning.

### SC-3: Chart type proliferation
The analysis documents identify 10 chart types from Superagent (bar, scatter, line, bubble, histogram, box, candlestick, pie, donut, funnel). Supporting all 10 in ReportRenderer is a significant frontend effort. **Lock**: v1 supports 5 chart types: bar, line, pie, scatter, table. Others render as data tables with a "chart type not supported" note.

### SC-4: Clarification flow expansion
DEC-004 says "schema now, defer full UI to v1.5." But BL-021 in GIT-ISSUES has full acceptance criteria for pause/resume/ClarificationPrompt.tsx. OQ-007 asks whether to pull forward into Phase 3. This is a scope creep vector disguised as an open question. **Lock**: v1 includes the schema and backend pause/resume. Frontend shows a text banner "This run needs your input" with a text input. No rich clarification UI.

### SC-5: Billing feature expansion
The plan scopes billing as checkout + webhook + usage tracking + quota. Once billing is operational, requests for: usage dashboards, cost breakdowns per run, billing alerts, team/org billing, invoice history, plan comparison page. **Lock**: v1 billing has 5 API endpoints. No billing dashboard UI beyond a simple "Current Plan" card and "X of Y runs used" indicator.

### SC-6: Document upload + RAG
DEC-001 lists "Document upload + RAG" as v1 scope, but no BL item exists for it. No issue, no acceptance criteria, no sub-elements. This is either already working (existing capability) or a missing backlog item.

**Must clarify**: Is document upload + RAG already working in the platform? If so, no new work needed. If not, this is a missing BL item (likely L complexity) that should either be added or explicitly deferred.

---

## 6. What is Missing

### M-1: Observability / Logging strategy

The plan mentions DEC-037 (use existing Langfuse) but provides no specifics on:
- How LangGraph node execution is traced (LangSmith? Langfuse callbacks? Custom?)
- How to debug a failed 13-subagent run (which subagent failed? what was its tool call history?)
- Log levels and structured logging format for background workers
- How to correlate a parent run's SSE events with child run logs

**Needed**: A short section in the implementation plan specifying: (a) Langfuse callback integration on all LLM calls, (b) structured logging with `run_id` and `parent_run_id` correlation, (c) a "run debug" API that returns the full event timeline for a run and its children.

### M-2: Error recovery for long-running runs

A research run takes 2-5 minutes. What happens when:
- A single subagent fails (network error, LLM timeout)?
- The arq worker process crashes mid-run?
- The user's browser disconnects during SSE streaming?
- The LLM returns a 429 rate limit error mid-fan-out?

The plan has `PLAN_TASK_FAILED` events but no retry strategy. LangGraph's `AsyncPostgresSaver` provides checkpointing, but the plan does not specify how to resume from a checkpoint after a crash.

**Needed**: (a) Per-subagent retry policy (max 2 retries with exponential backoff), (b) run-level timeout (max 10 minutes), (c) graceful degradation (if 2 of 13 subagents fail, proceed with 11 results), (d) checkpoint-based resume endpoint.

### M-3: Rate limiting / concurrency limits per user

No mention of:
- Maximum concurrent runs per user (what if a user starts 5 research runs simultaneously?)
- Maximum concurrent subagents across all users (Brave Search and Jina have global rate limits)
- LLM API rate limiting (OpenAI has per-org TPM limits)

A single deep research run consumes 13+ LLM calls and 13+ web search calls. Two concurrent users could exhaust API rate limits.

**Needed**: (a) Max 2 concurrent runs per user, (b) global Brave/Jina request pool with semaphore, (c) LLM call rate limiter shared across all workers.

### M-4: Data retention / artifact cleanup

Generated websites (multi-file bundles), reports, slides, and entity artifacts accumulate. The plan mentions "cleanup_old_runs" as a cron job in the arq library reference but this is a code example, not a plan item.

**Needed**: (a) Retention policy (30 days? 90 days? user-configurable?), (b) artifact cleanup cron job in BL items, (c) storage size monitoring, (d) orphaned artifact detection.

### M-5: API versioning

The plan adds 5+ new endpoints (`/billing/*`, `/runs/{id}/entities`, `/runs/{id}/clarify`, `/artifacts/{sha256}/export`). All are under `/api/v1/`. No discussion of what happens when v2 is needed.

**Assessment**: Not blocking for v1, but worth a sentence: "All new endpoints are under `/api/v1/`. No versioning strategy beyond prefix is needed for v1."

### M-6: Frontend state management for multi-stream SSE

The plan specifies two parallel SSE streams (DEC-021): chat (AI SDK) + run events (PG LISTEN/NOTIFY). The frontend must:
- Manage two concurrent EventSource connections
- Handle reconnection for each independently
- Merge events from both streams into a coherent UI state
- Handle the case where one stream delivers faster than the other

The existing `use-sse.ts` hook handles one stream. No design exists for dual-stream coordination.

**Needed**: A frontend architecture note specifying how dual-stream state is managed, probably via Zustand middleware that merges events from both sources.

### M-7: Testing infrastructure for parallel LangGraph execution

DEC-050 says "real LLM calls, minimal mocking." Testing a 13-subagent fan-out with real LLM calls takes 2-5 minutes and costs $0.50-2.00 per test run. Running this in CI on every push is impractical.

**Needed**: A tiered test strategy: (a) unit tests mock the LLM but test graph topology/state transitions, (b) contract tests verify LLM output shapes with `max_tokens=500` and gpt-4o-mini, (c) integration tests run full fan-out with 3 subagents (not 13) on PR merge only, (d) E2E tests with full 13-subagent runs weekly.

### M-8: Graceful degradation when external APIs are unavailable

Brave Search and Jina Reader are external dependencies. What happens when:
- Brave Search is down? (Subagents cannot research.)
- Jina Reader is down? (Subagents can search but cannot read sources.)
- Both are down? (Research degrades to LLM knowledge only.)

**Needed**: (a) Timeout + fallback behavior per external API, (b) "degraded mode" flag in DataBrief indicating research quality, (c) user-visible indication when external sources were unavailable.

---

## 7. Go / No-Go Assessment

**Assessment: CONDITIONAL GO.** The plan is approximately 85% ready. The analysis and planning work is thorough and the dependency analysis is excellent. However, the following 5 items MUST be resolved before a developer writes implementation code:

### Must-Resolve Before Code Starts

1. **Lock the chart library (DG-1).** Recharts or Plotly. This affects BL-004 (schema), BL-005 (report gen), BL-009 (renderer), and BL-019 (export). Cannot proceed with conflicting assumptions.

2. **Verify arq worker is operational (DG-2/A1).** Inspect `jobs.py`, check for WorkerSettings, test enqueue/execute. If not operational, add arq worker service to docker-compose as a Phase 0 deliverable. 15-minute task.

3. **Resolve OQ-005: GmlComponentParser rendering approach (DG-4).** Read `ChatPanel.tsx` and `@assistant-ui/react` source. Spike a `<gml-ViewReport>` render. This determines the entire Phase 3 frontend architecture.

4. **Build a Send() prototype (A2).** Before BL-001 starts, build a minimal 3-node Send() graph with async Postgres writes. Validate that parallel nodes can each create DB records without deadlocking. 1-day task.

5. **Lock OQ-004: LLM model selection per node type.** gpt-4o-mini for workers, gpt-4o for planner/synthesis/meta-reasoning. Or all gpt-4o-mini. This affects cost projections, billing model viability, and output quality expectations. Cannot be deferred.

### Should-Resolve in Week 1 (Not Blocking But High Value)

- OQ-001 (LLM provider: add langchain-anthropic or stay OpenAI-only)
- OQ-002 (Slides viewer: reuse WebsitePreview or dedicated component)
- Migration 0005 split strategy
- Dual-stream SSE frontend architecture design
- Error recovery / retry policy for subagents

---

## 8. Recommendations for the Plan Restructure

### Sections to Add

1. **"Technical Prototypes Required" section** -- List the validation spikes that must be completed before full implementation: Send() prototype, GmlComponentParser spike, WeasyPrint deployment test, arq worker verification.

2. **"Error Handling and Recovery" section** -- Per-subagent retry policy, run-level timeout, graceful degradation with partial results, checkpoint resume strategy.

3. **"Cost Model" section** -- Estimated LLM token consumption per run type (simple query, deep research, report gen, website gen). Per-run cost projection at gpt-4o vs gpt-4o-mini. Comparison with billing price point ($0.50/run overage) to validate unit economics.

4. **"Concurrency and Rate Limiting" section** -- Max concurrent runs per user, global API rate pool, LLM TPM budgeting across workers.

5. **"Observability" section** -- Langfuse callback wiring, structured logging with run correlation, run debug API.

6. **"Frontend Dual-Stream Architecture" section** -- How the two SSE streams (AI SDK + platform events) are coordinated in the frontend.

### What to Emphasize

- The parallel-track execution model from DEPENDENCY-ANALYSIS.md, not the sequential 13-week phase model. The restructured plan should use the 5-track model as the primary timeline.
- BL-001 decomposition into sub-elements. The sub-element DAG from DEPENDENCY-ANALYSIS.md is more useful than the monolithic BL-001 issue.
- SSE event contracts as the interface between backend and frontend tracks. Lock these in Week 1.

### Decisions to Force (OQ Resolution)

| OQ | Recommended Resolution | Rationale |
|----|----------------------|-----------|
| OQ-001 | Stay OpenAI-only for v1. Use gpt-4o for planner/meta-reasoning, gpt-4o-mini for workers. | Avoids new dependency; `base_url` override already supports proxy routing. Add langchain-anthropic in v1.1 after core works. |
| OQ-002 | Reuse `WebsitePreview` (iframe) for slides. No dedicated `gml-ViewSlides`. | reveal.js is HTML in an iframe, same as websites. Slides tag = `<gml-ViewWebsite type="slides">` with a prop, not a new component. |
| OQ-003 | iframe-only for v1. No public `/website/[id]` route. | Adding unauthenticated routes is a security surface expansion. Defer to v1.1. |
| OQ-004 | gpt-4o-mini default for fan-out workers. gpt-4o for planner, synthesis, meta-reasoning only. | Controls cost to ~$0.10-0.30/run. Makes the $0.50/run overage price sustainable. |
| OQ-005 | Custom GmlComponentParser needed. `@assistant-ui/react` does not natively handle custom HTML elements. | Based on library design -- it renders message parts, not arbitrary HTML. Validate with spike but plan for custom parser. |
| OQ-006 | Brave Search confirmed. Proceed. | Already documented as LIB-15 with full integration patterns. |
| OQ-007 | Keep clarification UI deferred to v1.5. Schema + backend checkpoint in v1, minimal text-input UI only. | Full clarification UX is complex. The backend infra (AsyncPostgresSaver) is free. The UI can wait. |

### What to Explicitly Exclude from v1 Scope

Add a "v1 Exclusions" section to the implementation plan with:

- Recursive meta-reasoning (one recovery round max)
- Multi-page websites (single-page only)
- Responsive/animated websites
- Advanced chart types (candlestick, 3D, funnel)
- Rich clarification UI (simple text input only)
- Billing dashboard UI (beyond plan status card)
- Public website URLs (`/website/[id]`)
- Document upload + RAG (clarify: if already working, no new work; if not, defer)
- Data retention automation (manual cleanup in v1)
- API versioning strategy
- Custom report templates (`customReportTemplateUIEnabled = false`)
- Editable report UI (`editableReportUIEnabled = false`)
- Table of contents UI (`tableOfContentsUIEnabled = false`)

### Structural Changes

1. **Replace the sequential phase model with the parallel-track model.** The 5-track structure from DEPENDENCY-ANALYSIS.md is the actual execution plan. The "Phase 0-4" milestones can remain as integration checkpoints, but the weekly plan should follow tracks.

2. **Merge DEPENDENCY-ANALYSIS corrections into GIT-ISSUES.** BL-003, BL-022, BL-008, BL-012 dependency fields are wrong in GIT-ISSUES.

3. **Add sub-issues for BL-001 to the GitHub project.** The XL epic needs its sub-elements (001a-001h) as separate trackable issues.

4. **Add a "Week 1 Validation Checklist" section.** Items that must be verified before Wave 1 starts: arq worker, Send() prototype, GmlComponentParser spike, WeasyPrint deps, Brave API rate limits, existing test suite green.

---

## Revision Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-18 | Agent (claude-opus-4-6) | Initial strategic review |
