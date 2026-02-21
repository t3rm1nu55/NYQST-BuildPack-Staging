---
document_id: OUR-ANALYSIS-SUMMARY
version: 1
date: 2026-02-18
source_documents: 6 analysis files from `/Users/markforster/AirTable-SuperAgent/docs/analysis/`
purpose: Compact structured summary of Superagent platform and NYQST platform research
---

# Consolidated Analysis Summary

## Doc 1: System Architecture (SYSTEM-ARCHITECTURE.md)

**Key Findings:**
- Next.js frontend with custom **GML (Gradient Markup Language)** rendering system, not standard HTML
- NDJSON streaming protocol over HTTP (not WebSockets) — 22 event types with Zod validation
- Multi-agent orchestration model with plan/node/tool hierarchical execution IDs
- v0.app integration for website/presentation/document code generation
- Entity-first architecture: citations, artifacts, and tool outputs are first-class storage objects

**Critical Facts:**
- 16 confirmed routes (landing, chat, tasks, reports, content-library, admin, etc.)
- 22 discriminated union stream events with precise field lists
- 18 GML tags (layout: 4, content: 8, viewers: 4, meta: 2)
- 10 chart types supported in Plotly.js (line, bar, scatter, bubble, candlestick, histogram, box, stacked_bar, clustered_column, donut)
- HSLA 6-color teal palette for data visualization
- 9+ external data providers (Brave, Firecrawl, Polygon, Crunchbase, Quartr, FRED, Kalshi, etc.)
- Ory Kratos authentication with OIDC
- Durable execution: ReplayStream implementation confirms event-sourced architecture with replay capability

**Architectural Decisions Implied:**
- Structured output is non-negotiable: LLM must emit valid GML, not free-form HTML
- Healing/validator system allows forgiving markup generation — LLM doesn't need perfect nesting
- Multi-path rendering (chat UI via Plotly + GML healer, export UI via v0.app + Recharts/D3)
- Streaming-first UX: all long operations show real-time progress, not static "Loading..." states
- Entity-backed citations prevent broken references and enable deduplication

**Confidence:** HIGH — 13 route confirmations, 22 event types extracted from Zod schemas, GML component registry documented, chart schemas reverse-engineered from bundle code

---

## Doc 2: Agentic System (AGENTIC-SYSTEM.md)

**Key Findings:**
- Hierarchical planner → fan-out executors → synthesizer → deliverable generator pattern
- LangGraph-style architecture with `Send()` fan-out for parallel workstream execution
- 14+ parallel research tasks observed in single run (screenshot evidence)
- Meta-reasoning: system evaluates research quality and adaptively launches gap-filling plans
- Tool failure handling: FactSet failure → SEC filings fallback (adaptive, not rigid retry)
- Durable replay mechanism: all execution state event-sourced, can replay from event log

**Critical Facts:**
- PlanSet/Plan/PlanTask linked-list structure (previous_task_id, previous_plan_id for ordering)
- 4 primary agent roles: Planner, Research Executor, Synthesizer, Deliverable Generator
- 4 specialized sub-agents for report generation: Standards, Feature (4 parallel), Integration
- Plan task states: LOADING → PROCESSING → CREATING NOTES → SUCCESS (error recovery possible)
- Tool batching: `node_tools_execution_start` indicates batch, `total_tools` count provided upfront
- Multi-stage orchestration with iteration: Initial plan → Results evaluation → Gap-filling plan → Synthesis
- Event-sourced state: RunLog with append-only events, materialized RunState for queries

**Architectural Decisions Implied:**
- Parallel dispatch is critical: single linear executor insufficient for Superagent parity
- State must be event-sourced (not imperative): enables replay, pause/resume, time-travel debugging
- Error resilience: single tool failure doesn't cascade; system identifies gaps and re-executes
- Adaptive planning: static vs. dynamic depending on result quality assessment
- Multi-agent code generation: Standards → Parallel → Integration phases (not free-form LLM generation)

**Confidence:** HIGH (screenshot evidence: task cards with states, activity panel showing 14 workstreams) — MEDIUM for exact internal orchestration logic (no backend code visibility)

---

## Doc 3: Quality Methods (QUALITY-METHODS.md)

**Key Findings:**
- **Structured output constraints** enforce output quality at generation time (Zod schemas + GML tags)
- **Healer/validator system** auto-corrects malformed GML post-generation (no LLM retry loop needed)
- **Multi-stage pipelines** with iterative review passes: outline → components → review (×N) → polish
- **Data brief pattern**: single source of truth shared across all downstream generators (ensures cross-file consistency)
- **Dual-status UX**: primary action + substep text + continuous progress bar (keeps users engaged for 2min+ waits)

**Critical Facts:**
- 7-stage website generation pipeline: template assembly → architecture → theme → layout → content → widgets → atomic export
- Website output uniformity: 8/10 widgets cluster 506-685 LOC (±60 LOC), proving system-prompt enforcement
- Report C contains MSFT $281.7B figure identically in 5 separate files — proves shared data brief, zero manual copy-paste
- "Reviewing content..." substep appears multiple times (iterative quality checks, not one-shot)
- FactSet failure triggers meta-reasoning: "Fill data gaps from FactSet failures by gathering from SEC filings..."
- Component scaffold pattern (7 section structure) is byte-identical across 10 widgets — LLM is tightly constrained
- shadcn/ui frozen bundle: 181KB, 57 components, byte-identical across reports (no versioning drift)
- System prompts not in client bundles (server-side only), but implied structure: GML tags required + citation binding required

**Architectural Decisions Implied:**
- Quality is built into constraints, not left to review loops
- Output token budgets matter: ~600 LOC per component, ~550K total per report
- Consistency > perfection: shared data brief ensures accuracy, not manual review
- Progress communication is a feature: users will tolerate long waits if they see real progress
- Fallback strategies must be transparent: users see "filling gaps from FactSet failures" in activity panel (builds trust)

**Confidence:** HIGH (measured file sizes, byte-comparisons, timestamp evidence) — MEDIUM (review pass mechanism and system prompt structure inferred, not directly observed)

---

## Doc 4: Platform Ground Truth (PLATFORM-GROUND-TRUTH.md)

**Key Findings (NYQST Platform - Our Implementation Base):**
- **ResearchAssistantGraph is fully implemented** (NOT empty as previously assumed) — 3-node graph: agent → tools → capture_sources
- **Four migrations exist** (NOT three): 0004 added sessions, conversations, messages, message_feedback, tags (2026-02-01)
- **LangGraph is production-ready** but single-linear (no `Send()` fan-out pattern yet) — this is the PRIMARY gap for Superagent parity
- **PostgreSQL + asyncpg streaming** (LISTEN/NOTIFY) is production-ready for SSE activity panel
- **Full auth system in place**: JWT bearer + API key, tenant/user model, rate limiting
- **16 tables** already migrated covering auth, artifacts, manifests, pointers, runs, events, rag, sessions, conversations
- **No Anthropic SDK**: only `langchain-openai` — full OpenAI compatibility with custom base_url override support

**Critical Facts:**
- Artifact model: SHA256 PK, media_type, size_bytes, storage_uri — NO entity_type column (still needs adding)
- Manifest model: tree JSONB with parent_sha256 linking (immutable snapshots)
- Pointer model: manifest_sha256 FK, namespace/name keying, metadata JSONB
- RunEventType enum has APPROVAL_REQUESTED/GRANTED/DENIED already (human-in-loop events exist)
- 11 API routers registered: agent, artifacts, auth, conversations, health, manifests, pointers, rag, runs, sessions, streams, tags
- Streams router uses PG LISTEN/NOTIFY (GET /api/v1/streams/runs/{run_id} returns SSE stream)
- Frontend: @assistant-ui/react ^0.12, Zustand stores, React Router, react-query, ResizablePanels

**Architectural Decisions Implied:**
- Extend existing graph, don't replace it — ResearchAssistantGraph is the foundation
- Fan-out (parallel workstreams) requires adding `Send()` supervisor node or secondary graph
- Billing/Stripe is clean greenfield — no conflicts with existing cost_cents/token_usage fields
- OpenSearch backend is optional — pgvector is built-in (docker-compose doesn't include OpenSearch; must be external)
- Approval workflow has backend event types but no UI yet — widget building is the missing piece
- No Dockerfile → deployment needs containerization strategy

**Confidence:** HIGH (direct code inspection of real dev copy) — this is the GROUND TRUTH baseline

---

## Doc 5: Chat Export Analysis (CHAT-EXPORT-ANALYSIS.md)

**Key Findings:**
- **Deliverable_type lives on USER message**, not chat-level (different messages can request different types)
- **Website + Report co-generation**: single WEBSITE request produces both gml-ViewWebsite AND gml-ViewReport in output
- **First_report_identifier** field on AI message points to primary deliverable (the report UUID)
- **<answer> XML wrapper** is the boundary: LLM output wrapped in `<answer>...</answer>`, parsed by frontend
- **Async entity creation** is decoupled from main response: `has_async_entities_in_progress` flag tracks completion
- **Event stream artifact ID** (`event_stream_artifact_id`) is the key to the full run log (tool calls, planning, etc.)

**Critical Facts:**
- Pricing: $20/month Pro, 200 runs/month included, $0.50/run overage, 30-day free trial
- **1 run = 1 AI generation** (not 1 chat session) — billing unit is the generation cycle
- Feature flags enabled (v1 scope): websiteDeliverable, documentDeliverable, slideDeliverable, codeDeliverable, enhancedReport, multiSectionReportStreaming, fileUpload
- Deferred: customReportTemplate, editableReport, tableOfContents
- Public URL patterns: `/website/[id]`, `/report/preview/[id]`, `/share/[id]` are unauthenticated
- Session lifetime: 60 days (2026-02-16 → 2026-04-17)
- Ory Kratos auth with OIDC, Google OAuth enabled
- CMS: Sanity (projectId: 4jpbu6z4, dataset: production)
- Analytics: PostHog + Google Tag Manager
- 29-minute wall-clock time for complex WEBSITE run (highly involved prompt across "every lifecycle stage... every market participant...")
- Clarification follow-up response: 226ms (fast path, reuses artifacts, no new research)

**Architectural Decisions Implied:**
- Response format is strict: `<answer>...</answer>` wrapper is not optional, parser depends on it
- Deliverable types are user-selectable per message, not chat-wide settings
- Co-generated deliverables (website + report) are expected, not exceptional
- Entity/citation creation is async post-processing, not inline
- Reads are free, only generations are billable (important for revenue model)
- Public hosting of generated websites implies robust S3/CDN infrastructure
- Session/workspace model is multi-tenant (workspace_id in headers, auth scopes)

**Confidence:** HIGH (direct HTML export from production, SSR-rendered data schemas) — some backend details (event stream contents) require API access to observe fully

---

## Doc 6: Technical Deep-Dive (TECHNICAL-DEEP-DIVE.md)

**Key Findings:**
- **GML Healer algorithm**: `unified/hast` visitor pattern, width-constraint validation, mutations collected then applied in reverse
- **18 GML tags with exact width rules**: gml-chartcontainer MUST be in gml-primarycolumn; gml-infoblockmetric MUST be in gml-sidebarcolumn
- **10 chart types with full rendering logic**: bar, scatter, line (gradient fill + trend color), bubble, histogram, box, candlestick, stacked_bar (barmode:"stack"), clustered_column (barmode:"group"), donut
- **Citation buffering state machine**: character-by-character parsing, `[` enters citation, `]` or `\n` exits, ready pointer doesn't advance while in citation
- **Stream connection with exponential backoff**: 5 retries max, delays 1s/2s/4s/8s/16s; 30s watchdog timer reset on each chunk; heartbeat sent every 20s to keep-alive

**Critical Facts:**
- WIDGET_WIDTHS map (18 tags with exact parent constraints, extracted from minified bundle)
- HEALING_BEHAVIOR enum: "hoist" (move to valid ancestor) or "remove" (discard if no valid placement)
- Healer target search: walk ancestors from innermost outward, then check gml-row siblings as fallback
- Mutations applied in REVERSE order to preserve array indexes
- LINE charts: trend detection (first vs last value), green gradient fill for positive, red for negative
- STACKED_BAR and CLUSTERED_COLUMN use 2-color teal palette, cycle by index % palette.length
- DONUT charts use 6-color teal palette
- Plotly config: `{displayModeBar: false, displaylogo: false}` (clean UI, no toolbar)
- Chart x-axis type auto-detection: number → ISO date (via Date.parse) → category fallback
- Error bars: "constant"/"percent" type OR "data" type (pulls from DataPoint.error_x_value fields)
- 22 event types with exact Zod field lists (extracted from bundle minified definitions)
- NDJSON envelope: `{data: <event>, timestamp: <milliseconds>}`
- Replay timing: 5ms between events (fast playback, heartbeats skipped)
- Stream timeout: 30 seconds idle triggers abort; retry delays exponential up to 16s
- PlanSet schema: linked-list structure with previous_plan_id, plan_tasks as Record<id, PlanTask>

**Architectural Decisions Implied:**
- GML healer is **not optional**: LLM generates imperfect markup, healer fixes structural violations at render time
- Chart rendering is **fully deterministic**: no interactive color pickers, palette is system-enforced
- Stream protocol is **transport-agnostic**: NDJSON can stream over HTTP, not restricted to WebSockets
- Citation buffering is **character-by-character** (not line-by-line): citations can span multiple `message_delta` events
- Exponential backoff with 30s watchdog is **aggressive recovery**: prioritizes responsiveness over reliability
- Replay is **forensic-grade**: can reproduce entire execution from event log for debugging

**Confidence:** HIGH (exact code extracted from minified bundle, verbatim algorithms) — for some deep internals (e.g., unified/hast pipeline setup), MEDIUM (logic reconstructed from usage patterns)

---

# Cross-Cutting Themes

## Theme 1: Structured Output > Prompting
All six documents converge on the same pattern: **don't ask LLM for perfect output, constrain the output space and heal/validate post-generation**. GML tags, Zod schemas, chart type enums — these are not optional suggestions, they are enforced constraints. The healer system handles imperfect markup. This is fundamentally different from naive LLM prompting.

## Theme 2: Event-Sourced Execution
Three documents (Agentic System, Platform Ground Truth, Technical Deep-Dive) confirm: execution is **append-only event logs**, not imperative state mutations. This enables replay, pause/resume, time-travel debugging. The RunEvent table and ReplayStream implementation are the concrete realization of this pattern.

## Theme 3: Transparency = Trust
Quality Methods and Chat Export Analysis both emphasize **showing work to users**: activity panel with parallel workstreams, substep progress updates, visible fallback strategies ("filling gaps from FactSet failures"). This is NOT a bug in the UX — it's intentional trust-building.

## Theme 4: Data Brief Consolidation
Quality Methods proves it with byte-comparisons; Chat Export and Agentic System support it with co-generation findings: **all downstream generators reference a single shared data brief** from the research phase. This ensures cross-file consistency without manual review.

## Theme 5: Multi-Agent as Composition, Not Orchestration
Report generation stages (Standards → 4 Parallel → Integration) are **agent-as-service**: each agent commits its output (feature branch), integration agent merges and validates. This is fundamentally different from a single monolithic LLM call. The 300-second end-to-end time is mostly sequential (not 1200s / 4 agents in parallel) because phases are sequential.

## Theme 6: Streaming-First UX
All chat-facing systems prioritize **real-time feedback over hidden computation**. Progress bars update, substeps change, new task cards appear. Long operations (2min+) are tolerable if the UI continuously shows progress.

---

# Most Confident Findings (Ground Truth for Comparisons)

1. **22 stream event types with exact field lists** (Zod extraction) — HIGH confidence
2. **18 GML tags with width constraint rules** (minified code extraction) — HIGH confidence
3. **10 chart types supported** (enum extraction + rendering logic) — HIGH confidence
4. **4-node LangGraph (agent → tools → capture_sources)** exists in NYQST (code inspection) — HIGH confidence
5. **PlanSet/Plan/PlanTask linked-list model** (Zod + chat export) — HIGH confidence
6. **NDJSON envelope format** (`{data, timestamp}`) — HIGH confidence
7. **Event-sourced architecture** (ReplayStream implementation) — HIGH confidence
8. **Citation buffering state machine** (character-by-character, `[`/`]` delimiters) — HIGH confidence
9. **Exponential backoff retry** (1s, 2s, 4s, 8s, 16s) — HIGH confidence
10. **Data brief pattern** (MSFT $281.7B measured identically in 5 files) — HIGH confidence
11. **Async entity creation** (`has_async_entities_in_progress` flag) — HIGH confidence
12. **No Anthropic SDK in NYQST** (langchain-openai only) — HIGH confidence
13. **Full auth system exists** (JWT + API key, rate limiting, scopes) — HIGH confidence
14. **9+ external data providers** (API names in tool schemas) — MEDIUM-HIGH confidence

---

# Lowest Confidence / Needs Verification

1. **Exact LLM model used by Superagent** (likely GPT-4, not Claude) — inferred, not confirmed
2. **System prompts for planner/research/synthesizer agents** — not in client bundles, server-side only
3. **How deliverable type influences orchestration** (WEBSITE vs REPORT vs CODE) — MEDIUM confidence from feature flags, exact dispatch logic unknown
4. **FactSet vs alternative sources selection criteria** — inferred from single gap-filling example, not systematic
5. **Cost model and token tracking** (cost_cents field in Run) — MEDIUM confidence; field exists but implementation unknown
6. **Exact v0.app integration** (is it same company? API contract? rate limits?) — inferred from metadata, not confirmed
7. **Report generation phase selection** (Monolithic vs Coordinator vs Four-tier) — patterns confirmed, selection criteria unknown
8. **How max output token limits are enforced** (~550K ceiling inferred) — measured from 3 examples, not formal limit documented
9. **Approval workflow user-facing UI** (backend events exist, UI not visible) — schema-only evidence
10. **Stripe billing implementation** (cost tracking fields exist) — inferred from schema, not confirmed in running code

---

# Recommended Verification Strategy

**For HIGH-confidence items**: Use as ground truth in design documents. No further verification needed.

**For MEDIUM items**:
- Run DevTools network tab on live Superagent session to capture actual streaming NDJSON
- Monitor event sequence to confirm PlanSet/Plan/PlanTask structure in real-time
- Inspect actual event_stream_artifact_id payload to see tool call logs

**For LOW items**:
- Query Superagent support or documentation for model identity (GPT-4 vs Claude)
- Request system prompt samples (if Superagent publishes them)
- Decompile Android/iOS apps if available (may contain additional signals)
- Monitor several WEBSITE/REPORT/CODE/DOCUMENT requests to see if orchestration differs

---

# Usage in Implementation

## For NYQST Platform Planning
- **Use Doc 4 (Platform Ground Truth) as the foundation**: ResearchAssistantGraph exists, extend it with `Send()` fan-out
- **Use Docs 1, 2, 6 as specification**: stream events, GML healing, chart rendering are non-negotiable
- **Use Doc 3 as UX pattern library**: data brief pattern, dual-status progress, iterative review
- **Use Doc 5 as schema baseline**: Message.deliverable_type, Entity discriminated union, co-generated artifacts

## For Quality Decisions
- **Implement structured output first** (Zod schemas enforced on LLM output)
- **Build the healer before building the LLM** (it's the safety net)
- **Shared data brief pattern is cost-effective**: replaces manual review with deterministic consistency
- **Progress UX is non-negotiable**: users will wait 2 min if they see real-time progress

## For Integration Testing
- **Stream protocol**: Use NDJSON example payloads from Doc 6 to mock events; test citationbuffer + healer on real GML output
- **GML rendering**: Test healer with malformed markup (unclosed tags, wrong parent types)
- **Chat export**: Verify that deliverable_type is per-message, not per-chat; confirm co-generation
- **Event sourcing**: Replay run event logs to verify determinism

---

**Generated:** 2026-02-18
**Analyst:** Claude Haiku 4.5 (synthesis) based on Opus 4.6 analysis work
**Confidence Methodology:** HIGH=multiple independent sources or direct code; MEDIUM=single source + logic; LOW=inferred pattern or speculative

