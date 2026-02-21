# Agent 5: V2-Merged Implementation Blueprints

> **Scope**: 3 pattern files, GAPs, migrations from V2-merged Build Pack
> **Source**: Extracted from Claude Code conversation transcript (session a59abd46)

---

Now I have a thorough picture of V2-merged. Let me compile the comprehensive analysis.

---

## V2-Merged Build Pack — Deep Technical Analysis

---

### 1. Pattern Files

V2-merged contains three dedicated pattern files in `reference/patterns/`. These are the most implementation-ready artifacts in the entire pack.

---

#### `reference/patterns/BACKEND-PATTERNS.md`

**What it defines**: 6 top-level sections of Python/FastAPI/LangGraph patterns.

**Section 1 — Pydantic Schemas (planning hierarchy)**
- `PlanSet`, `Plan`, `PlanTask`: complete field-level definitions including the `previous_plan_id` linked-list chain on `Plan` and the `start_time/end_time/duration_ms` telemetry block on `PlanTask`. The `DataBrief` schema is defined with `financial_data`, `market_data`, `swot_summary`, `risk_factors`, `growth_opportunities`, `primary_sources`, `all_sources`, `data_gaps`.
- `RunEventType`: the full 22-type enum (plus 3 proposed NYQST extensions), covering lifecycle, planning, execution, messaging, deliverables (report streaming), citations, HITL browser, and clarification.
- Every event type has a concrete Pydantic model with exact `Literal["type_string"]` discriminator. Particularly detailed: `TaskUpdate` (9 fields), `NodeToolsExecutionStart` (6 fields + Unix ms timestamp), `NodeReportPreviewDelta` (streaming delta + context IDs), `NodeReportPreviewDone` (full content + `final_report` bool).
- `Message` schema: 26 fields including `hydrated_content`, `first_report_identifier`, `event_stream_artifact_id`, `error_type` enum.

**Section 2 — SQLAlchemy Models**
- `Artifact` extension for Migration 0005a: adds `entity_type` (String(100), nullable) and `entity_id` (UUID, nullable) to the existing SHA-256-keyed `artifacts` table. Note: the pattern file shows `entity_metadata JSONB` but the actual GitHub issue MIG-0005A (#17) specifies `entity_id UUID` (a foreign key pointer). Includes comment showing allowed `entity_type` values: `WEB_SOURCE | API_DATA | GENERATED_CONTENT | USER_INPUT | REPORT | SLIDES | SEARCH_RESULT | EXTRACTED_DATA | PLAN | KNOWLEDGE | WEBSITE | DOCUMENT`.
- `Subscription` model (Migration 0005b): full field set including Stripe identifiers, plan name, billing interval enum (`month/year`), status lifecycle enum (`active/canceled/past_due/incomplete/unpaid`), denormalized entitlements (`monthly_runs_limit`, `is_trial`, `trial_ends_at`), and period dates.
- `UsageRecord` model: per-run usage tracking with `feature_name`, `quantity`, integer-cents cost fields, `status` enum (`pending/billed/refunded`), `billing_event_id` (Stripe invoice line item), and metadata JSONB.
- `Manifest` and `Pointer` models provided as "already complete — reference only" — useful for cross-checking existing code.

**Section 3 — LangGraph Patterns**
- `ResearchState` TypedDict: complete with `Annotated[List[TaskResult], operator.add]` for parallel task accumulation, `Annotated[int, operator.add]` for the `cost_cents_spent` budget accumulator (DEC-045), and `budget_exceeded: bool` for the conditional edge to END.
- Full fan-out dispatch pattern: `dispatch_node` returning `[Send("research_executor", {...}) for task in all_tasks]` with all SSE events emitted (NodeToolsExecutionStart before dispatch, NodeToolEvent per tool, UpdateSubagentCurrentAction). The graph wiring is explicit: START → planner → dispatch → research_executor → fan_in → synthesize → report_generator → END.
- `llm.with_structured_output(PlanSet).invoke(prompt)` pattern (DEC-050), and `async for chunk in llm.astream(prompt)` for streaming report nodes.
- Per-node session pattern (DEC-051): `async with async_session_factory() as session: async with session.begin():` inside every parallel node.

**Section 4 — Service Layer**
- `emit_run_event` using `asyncpg.Pool` with atomic INSERT + `pg_notify("run:{run_id}", payload)`. Transaction guarantees: PG NOTIFY only fires on commit.
- `BillingService` class: complete `check_quota`, `record_run_start`, `finalize_run`, and `generate_monthly_invoice` methods with full SQL queries. Overage rate: 50 cents/run (professional plan only). Month-start calculation is explicit.
- `EntityService.store_entity`: idempotent SHA-256-based deduplication, `reference_count` increment on collision.

**Section 5 — API Route Patterns**
- SSE streaming route: replay past events from DB, then `await conn.add_listener(channel, ...)` with 25-second heartbeat timeout and clean UNLISTEN on disconnect.
- Stripe webhook: raw body pattern (`await request.body()` before any JSON parsing), `match event.type` switch, `handle_subscription_updated` with race condition guard (fallback to customer_id if sub_id lookup fails).
- `QuotaMiddleware`: intercepts `POST /api/v1/runs` only, checks quota, raises HTTP 402 with structured `{"code": "quota_exceeded"}`.
- Dual-mode auth: JWT (local HS256 decode) + API key (SHA-256 hash lookup), returning `UserContext(user_id, tenant_id, auth_method)`.

**Reusability**: Extremely high. These patterns are direct implementations for BL-001 (fan-out graph), BL-002 (event schemas), BL-012 (billing service), BL-013 (quota middleware), BL-016 (entity service), and all SSE infrastructure.

---

#### `reference/patterns/FRONTEND-PATTERNS.md`

**What it defines**: TypeScript/React patterns targeting `@assistant-ui/react` + Zustand + Plotly.js.

**Section 1 — GenUI Primitive Registry (27 components)**
- Complete Zod schemas and React implementations for all 27 primitives across six categories: primitive (Text, Heading, Button, Badge, Avatar, Icon, Divider, Spacer), feedback (Skeleton, Spinner, StatusDot, Progress, Toast, EmptyState), container (Card, Row, Column, Grid, ScrollArea, Collapsible, Modal, Tabs), data (Metric, Table, Chart, Markdown), media (Iframe).
- Each has explicit Tailwind class patterns. `Button` has four `variant` values and exact Tailwind strings. `Metric` includes `sentiment` (positive/negative/neutral) mapped to Tailwind color classes. `Chart` uses `React.lazy(() => import('react-plotly.js'))` with Suspense.
- All components are registered to `primitiveRegistry` with a `category` field enabling filtered renders.

**Section 2 — GenUI Renderer**
- `ComponentDescriptor` interface: `type`, `props`, `children`, `key`, conditional rendering via `when`/`unless` (state path evaluation), data binding via `bind` (state path), `repeat` (source array + `as` variable name), event handling via `on` (event → action ID map).
- `renderDescriptor` function: two-tier lookup (pattern registry → primitive registry), string interpolation (props starting with `$` resolved as state paths), recursive child rendering, Zod validation in dev mode.
- `resolveStatePath`: dot-notation path resolver supporting numeric index access.

**Section 3 — GenUI Pattern Registry (17 composed patterns)**
- Chat patterns: `ChatMessage` (role, content, attachments, badges, timestamp), `ChatInput` (streaming-aware stop/send button swap), `ChatList`.
- Report patterns: `ReportHeader` (gradient card + collapsible TOC), `InsightCallout` (amber bg callout), `SourceCard` (favicon + source type badge + domain), `FileCard`.
- Progress patterns: `PlanProgress` (per-phase status dots with pulse animation for active phases), `BrowserAgentBanner`.
- Chrome: `PageHeader`, `NavSidebar`.
- Deliverable: `WebsitePreview`.
- Billing: `UsageMeter` (used/limit/planName).
- Data: `MetricGrid`, `DataTable`, `ChartPanel`.

**Section 4 — GenUI Streaming Tools (7 AI SDK tool definitions)**
- `updateResearchPlan`: replaces `task_update` SSE event for GenUI mode.
- `streamReportSection`: replaces `node_report_preview_*` trio.
- `reportSources`: replaces `pending_sources`/`references_found`.
- `askClarification`: client-side tool requiring `addToolOutput()`.
- `browserAgentAction`: replaces browser HITL events.
- `setChatTitle`: replaces `chat_title_generated`.
- `renderUI`: universal `ComponentDescriptor` renderer — the key extensibility primitive.
- Client-side tool part renderer: complete `switch(part.type)` with all 7 tool states handled.

**Section 5 — Zustand Stores**
- `useDeliverableStore` (BL-015): `selectedType`, `previewMode`, `currentPreviewContent`, `isGenerating`, `generationProgress (0-100)`, `startGeneration`, `completeGeneration`. Path: `ui/src/stores/deliverableStore.ts`.
- `useRunStore` (enhanced): `ReportSlice` nested slice with `reportContent`, `updateContent` (appender), `clearReport`. `RunState` has `pendingAsyncEntities: Record<string, 'pending' | 'done'>`.
- `usePlanStore` (BL-007): `updateTask` with deep immutable update of `plan_tasks` nested in `plans`. Path: `ui/src/stores/plan-store.ts`.

**Section 6 — rehype-to-JSX Pipeline (DEC-015b)**
- `unified().use(rehypeParse, { fragment: true }).use(rehypeReact, { createElement, Fragment, components: GML_COMPONENTS })`.
- All 18 GML tag implementations: `gml-row`, `gml-primarycolumn` (with three width presets: full=896px, twothirds=600px, half=448px), `gml-sidebarcolumn`, `gml-halfcolumn`, `gml-chartcontainer`, `gml-blockquote`, `gml-header-elt`, `gml-infoblockmetric` (label/value/unit/trend/trendPercent), `gml-infoblockevent`, `gml-infoblockstockticker`, `gml-downloadfile`, `gml-viewreport`, `gml-viewwebsite` (DEC-044: sandboxed iframe, height=600px), `gml-viewpresentation`, `gml-viewgenerateddocument`, `gml-gradientinsightbox` (four `type` variants: insight/warning/error/success), `gml-inlinecitation`, `gml-components`. Path: `ui/src/lib/gml-renderer.ts`.

**Section 7 — Chart Rendering (Plotly.js, 10 types)**
- HSLA palette: 8 named colors each as `hsla(H, S%, L%, 0.8)`.
- Default layout: `{ autosize: true, margin: {t:30,r:10,b:40,l:50}, font: {family:'Inter,sans-serif', size:12}, paper_bgcolor:'transparent', plot_bgcolor:'transparent', legend:{orientation:'h', y:-0.2} }`.
- Trace builder functions for: bar, line (with fill), donut (hole=0.4), candlestick (financial — the key reason Recharts was rejected), stacked bar, clustered column.
- `buildChartSpec(type, data, overrides)` dispatcher function.

**Section 8 — SSE Hook (`useRunStream`)**
- `EventSource` at `/api/v1/runs/${id}/stream` with full switch on all event types, connecting `node_report_preview_*` to `DeliverableStore`, `task_update` to `PlanStore`, `done`/`ERROR` to status. Path: `ui/src/hooks/useRunStream.ts`.

**Section 9 — Component Specs (BL-007, BL-008, BL-010, BL-020)**
- `DeliverableSelector`: segmented control (not dropdown), connected to `useDeliverableStore`. Path: `ui/src/components/chat/DeliverableSelector.tsx`.
- PlanViewer task card ASCII art spec: numbered tasks, CAPS status strings, M:SS elapsed timer, color-coded left border.
- `GenerationOverlay`: single continuous progress bar (explicitly NOT reset per substep). Path: `ui/src/components/generation/GenerationOverlay.tsx`.
- `WebsitePreview`: `loadWebsite(sha256) → URL.createObjectURL(blob)` → sandboxed iframe (DEC-044: no public unauthenticated route). Path: `ui/src/components/deliverables/WebsitePreview.tsx`.

**Reusability**: High. These patterns are direct implementations for BL-007, BL-008, BL-009, BL-010, BL-015, BL-020, and all GML rendering work.

---

#### `reference/patterns/INTEGRATION-PATTERNS.md`

**What it defines**: End-to-end contracts connecting backend, frontend, and infrastructure.

**Section 1 — Event Contract**
- Complete TypeScript `RunEvent` discriminated union mirroring all Pydantic models (Section 1.2). All field names use `snake_case` to match Python exactly.
- Four-surface rollout checklist: every new event type requires changes to (1) `RunEventType` enum in `enums.py`, (2) `LedgerService` emission in the LangGraph node, (3) TypeScript union variant in `run-events.ts`, (4) `switch` case in `useRunStream` hook. A worked `usage-update` example is provided.

**Section 2 — Entity Lifecycle (9-step flow)**
- Tool executes → `EntityService.store_entity` → sha256 computed → `ReferencesFound` event emitted → frontend `entities Map` updated → LLM generates `<gml-inlinecitation identifier="..."/>` → GML renderer resolves identifier → `InlineCitation` component renders → user clicks → `SourcesPanel` opens.
- `CitationBuffer` class for streaming safety: prevents flashing incomplete `[citation]` text by buffering until `]` or `\n` closes the bracket.

**Section 3 — Billing Flow (6-step sequence)**
- QuotaMiddleware → `record_run_start` → LangGraph budget accumulator → `finalize_run` → monthly invoice → Stripe webhook. Quota decision tree shows five failure cases (no subscription, canceled, past_due, trial expired, limit reached with sandbox vs professional branching).
- `STRIPE_PLANS` config: sandbox free tier (10 runs/month), professional $20/month (200 runs + $0.50 overage), professional annual $192/year.

**Section 4 — Deliverable Pipeline (8-step end-to-end)**
- DeliverableSelector → POST with `deliverable_type` → LangGraph routes by `state.deliverable_type` → synthesis_node → generator node → 7a (REPORT: GML streaming + Artifact + Pointer) / 7b (WEBSITE: arq job + references_found on completion) → frontend renderer.
- WEBSITE uses `arq_pool.enqueue_job("generate_website", ...)` with full worker function signature.
- `store_deliverable_artifact`: builds Artifact → Manifest → Pointer chain with `PointerHistory` audit entry.

**Section 5 — Auth Flow (dual-mode)**
- Interactive: JWT access token + refresh pattern, stored in Zustand auth-store persisted to localStorage.
- Programmatic: API key SHA-256 hashed, stored in `api_keys` table.
- `workspace_id == tenant_id` mapping explicitly stated.
- Multi-tenant isolation rule: every query must include `.where(X.tenant_id == current_user.tenant_id)`.

**Section 6 — Co-generation Pattern**
- `dispatch_website_generation` enqueues arq job, returns job ID.
- `generate_companion_deliverables`: report synchronous (streams), website async (arq), both from same `DataBrief`. `done` event has `has_async_entities_pending=True` when WEBSITE requested.

**Section 7 — SSE Lifecycle Sequence Diagram**
- Full ASCII sequence: POST /runs → 200 {run_id} → GET /runs/{id}/stream → LISTEN → stream_start → task_updates → node_tool_events → heartbeat (every 25s) → references_found → preview_start → preview_delta (per token) → preview_done → ai_message → done → UNLISTEN.
- Exponential backoff reconnect: `Math.min(1000 * 2 ** retryCount, 30000)`, max 5 retries.

**Section 8 — Migration Sequencing**
- 0005a: `entity_type` + `entity_id` on artifacts table. Required by BL-016, BL-004, BL-005. (Note: pattern file says `entity_metadata JSONB`; GitHub issue MIG-0005A (#17) specifies `entity_id UUID`.)
- 0005b: `subscriptions` + `usage_records` tables. Required by BL-012, BL-013. Prerequisite: 0005a.
- 0005c: `plan_sets`, `plans`, `plan_tasks` tables. Required by BL-007, BL-019. Prerequisite: 0005b.

**Section 10 — Complete Dependency/Implementation Order Table** (18 BL item rows with corrected dependencies)

**Section 11 — Design Decision Quick Reference** (14 decisions as a lookup table)

**Reusability**: Maximum. This file is the end-to-end wiring specification. Every backend-frontend interface passes through contracts defined here.

---

### 2. Dependency Corrections

V2-merged explicitly corrects six dependency errors from V1/V2, plus identifies eight `blocked_by` field errors in the issue tracker. These are the authoritative corrections:

| Correction | V1/V2 Error | V2-merged Correct Dependency | Reasoning |
|---|---|---|---|
| 1 | BL-003 lists BL-001 as blocker | BL-003 is **independent** (Wave 0 standalone); BL-001 only needed for integration wiring | Brave/Jina API wrappers need no orchestrator — they are tool functions testable alone |
| 2 | BL-022 shows as downstream of BL-001 (`BL-022 ← BL-001`) | `BL-022 (design) → BL-001` — DataBrief schema **precedes** orchestrator | BL-001's `ResearchState` TypedDict requires the `data_brief` field type to be locked first |
| 3 | BL-005, BL-006, BL-018 omit Migration 0005 | All three have **hard dependency on Migration 0005** | Deliverable pipelines write `entity_type` to artifacts — that column only exists after 0005a |
| 4 | BL-012 acknowledges Migration 0005 informally | Migration 0005c is a **formal hard dependency** | Billing tables (`subscriptions`, `usage_records`) are created in 0005c |
| 5 | BL-008 listed independently | BL-008 has **weak dependency on BL-015** | DeliverableSelector reads from DeliverableStore |
| 6 | BL-011 listed without BL-016 dep | BL-011 has **hard dependency on BL-016** | SourcesPanel needs the entity API endpoint that BL-016 creates |

Two additional corrections specific to V2-merged vs planning docs:

- **BL-015 and BL-008 milestone assignment**: Both were in M3 (`phase:3-frontend`) but have no blockers — corrected to M0 (`phase:0-foundation`) by GAP-010.
- **Router count**: PLATFORM-GROUND-TRUTH states "11 routers"; direct inspection confirmed **12 routers** (tags router added in migration 0004) — GAP-012.

---

### 3. Implementation Sequence

V2-merged defines four waves. The implementation plan's Mermaid DAG is the authoritative build order:

**P0 (Stabilization — before any feature code):**
1. Fix arq worker `WorkerSettings.functions` class variable evaluated at module import (GAP-023, P0-001). Fix: move `WorkerSettings` to separate module loaded after all `@job()` decorators.
2. Fix `RunEvent._get_next_sequence` TOCTOU race in `src/intelli/repositories/runs.py` (GAP-022, P0-002). Fix: replace `SELECT MAX + INSERT` with `GENERATED ALWAYS AS IDENTITY` column.
3. Make local stack boot reliably — Redis profile, env defaults (P0-003).
4. Update all documentation corrections (GAP-001 through GAP-013): propagate Plotly.js (not Recharts), DEC-015a/b split, OQ resolutions, dependency graph corrections.

**Wave 0 (Foundation — all parallelizable):**
- BL-002: RunEvent schema extensions (19 new types added to enum + `LedgerService` helpers). No dependencies.
- BL-004: NYQST Markup AST schema (`MarkupDocument`, 18 node types, `MarkupHealer`). No dependencies.
- BL-015: DeliverableStore Zustand slice. No dependencies.
- BL-022 (design only): DataBrief schema locked. No dependencies.
- BL-003 (standalone): Brave Search + Jina Reader MCP tools. No dependencies.
- Migration 0005a/b/c: schema migrations. No feature dependencies.

**Wave 1 (Core Platform):**
- BL-001 (XL): Research orchestrator graph extension. Requires BL-002 + BL-022 (design).
- BL-007: PlanViewer component. Requires BL-002 (task_update SSE).
- BL-008: DeliverableSelector. Requires BL-015 (weak).
- BL-009 (fixtures only): ReportRenderer with static MarkupDocument. Requires BL-004.
- BL-012: Stripe billing. Requires Migration 0005c.
- BL-014: Enhanced RunTimeline. Requires BL-002.
- BL-016 (service): Entity/citation service. Requires BL-002 + Migration 0005a.
- BL-020: GenerationOverlay. Requires BL-002.

**Wave 2 (Deliverables):**
- BL-005: Report generation node (4-pass pipeline). Requires BL-001, BL-004, Migration 0005.
- BL-006: Website generation pipeline. Requires BL-001, Migration 0005.
- BL-013: Quota middleware. Requires BL-012.
- BL-017: Meta-reasoning node. Requires BL-001.
- BL-018: Slides pipeline. Requires BL-001, Migration 0005.
- BL-021: Clarification flow. Requires BL-001, BL-002.
- BL-022 (integration): DataBrief integration testing. Requires BL-001.
- BL-003 (integration): Tool integration wiring. Requires BL-001.

**Wave 3 (Polish):**
- BL-009 (integration): ReportRenderer with live data. Requires BL-005.
- BL-010: WebsitePreview (iframe + blob URL). Requires BL-006.
- BL-011: Enhanced SourcesPanel. Requires BL-016 + BL-003.
- BL-016 (citation binding): Citation IDs in reports. Requires BL-005.
- BL-019: Document export (PDF/DOCX via weasyprint). Requires BL-004 + BL-005.

---

### 4. Technology Decisions Locked In V2-Merged

| Area | Decision | DEC-ID |
|---|---|---|
| Chart library | `react-plotly.js` (NOT Recharts; candlestick required for financial data) | DEC-048 |
| GML backend | `MarkupDocument` Pydantic JSON AST, backend only | DEC-015a |
| GML frontend | `unified` + `rehype-parse` + `rehype-react` pipeline (skip JSON AST intermediate) | DEC-015b |
| LLM structured output | `llm.with_structured_output(PydanticModel)` for all JSON-producing nodes | DEC-050 |
| DB sessions in parallel nodes | Per-node `async_sessionmaker`, `expire_on_commit=False`, scoped to node function | DEC-051 |
| Migration split | 0005a (artifact entity_type), 0005b (message extensions), 0005c (billing tables) | DEC-052 |
| LLM provider | `ChatOpenAI` with `base_url` override; OpenAI-only for v1; LiteLLM as proxy for cost data | DEC-042 |
| GML render location | Separate `ReportPanel`, NOT inside `@assistant-ui/react` Thread | DEC-043 |
| Website preview | iframe-only, no public unauthenticated URL, blob URL from artifact API | DEC-044 |
| Budget enforcement | `$2/run` hard limit via `cost_cents_spent: Annotated[int, operator.add]` in LangGraph state + conditional edge to END | DEC-045 |
| Search tools | MCP protocol, hot-swap Brave/Tavily without code changes | DEC-046 |
| Clarification UI | Deferred to v1.5; v1 includes schema only + text banner | DEC-047 |
| Graph debugging | LangSmith Studio (free tier) + `graph.get_graph().draw_mermaid()`; no visual editor | DEC-049 |
| Observability | Langfuse self-hosted (MIT) + LangGraph state token accumulator | DEC-045/037 |
| Web scraping | Jina Reader API (`https://r.jina.ai/{url}`) | DEC-033 |
| PDF export | `weasyprint` (server-side) | DEC-030 |
| Slides format | `reveal.js` HTML bundle | DEC-031 |
| Billing source | Port from `okestraai/DocuIntelli` (public GitHub), adapt Supabase → SQLAlchemy | DEC-036 |
| Cost storage | Integer cents always; never float | Constraint in BACKEND-PATTERNS |
| Billing unit | 1 run = 1 AI message; reads free; retries not double-billed | DEC-025 |
| Plans persistence | Stored as `RunEvent` entries, NOT a new table | DEC-014 |

---

### 5. GAP Cleanup Tickets (45 items)

All 45 GAP items are filed as issues. The highest-priority ones with concrete resolution specs:

**CRITICAL severity:**
- **GAP-001** (Plotly vs Recharts): 4 documents still specify Recharts after DEC-048 locked Plotly. Must fix IMPLEMENTATION-PLAN section 3.6, BL-009 acceptance criteria, STRATEGIC-REVIEW, LIBRARY-REFERENCE LIB-13 before BL-009 implementation.
- **GAP-002** (GML split not propagated): DEC-015 was split into 015a/015b but GML-RENDERING-ANALYSIS and cross-references still show the old undivided decision. Blocks BL-004 and BL-009.
- **GAP-003** (7 OQs still appear open): OQ-001 through OQ-007 resolved in DECISION-REGISTER v2 but STRATEGIC-REVIEW, GML-RENDERING-ANALYSIS, and CODEX-ANALYSIS still show them as open.
- **GAP-014** (No LangGraph→SSE event contract): No locked specification for which LangGraph hook (on_tool_start, on_chat_model_stream, etc.) maps to which SSE event type. Identified as "Phase 0 deliverable per KNOWLEDGE-MAP but not yet produced." Blocks BL-001 and BL-002.
- **GAP-022** (TOCTOU race in `_get_next_sequence`): In `src/intelli/repositories/runs.py`, `SELECT MAX(sequence_num) then INSERT with MAX+1` will cause unique constraint violations under concurrent fan-out. Fix: use `GENERATED ALWAYS AS IDENTITY`. Must fix before BL-001.
- **GAP-023** (arq worker empty functions list): `WorkerSettings.functions` evaluated at class definition time before `@job()` decorators run. Worker silently ignores all job submissions. In `src/intelli/core/jobs.py`. Fix: move `WorkerSettings` to separate module. Must fix before BL-016 or any arq-dependent work.

**HIGH severity:**
- **GAP-015** (No fallback chain spec in BL-001): Tool failure cascade (primary → fallback_used event → secondary → all_tools_failed) not in BL-001 spec. Algorithm needed before BL-001 implementation.
- **GAP-016** (No dedicated backlog item for async entity worker): DEC-017 specifies arq worker but no standalone BL item. Recommended: create BL-023.
- **GAP-017** (NDM v1 JSON schema not formalized): MarkupDocument node types sketched but not locked. Blocks BL-004.
- **GAP-018** (MCP tool discovery filtering algorithm unspecified): How orchestrator selects tools per PlanTask context not defined. Blocks BL-001 + BL-003.

**MEDIUM severity (documentation corrections):**
- **GAP-009**: 8 blocked-by field errors in issue tracker (BL-003, BL-005, BL-006, BL-008, BL-012, BL-016, BL-018, BL-022) — mechanical fix, values specified.
- **GAP-010**: BL-015 and BL-008 in wrong milestone (M3 not M0) — move to `phase:0-foundation`.
- **GAP-011**: BL-022 dependency arrow backwards in IMPLEMENTATION-PLAN — flip direction.
- **GAP-028**: Migration 0005a/b/c content not specified anywhere. Resolution specifies: (a) subscriptions + usage_records + entity_type column + tags extensions; (b) RunState planning hierarchy fields + cost accumulator; (c) entity lookup + usage aggregation + run timeline indices.

**Operational gaps:**
- **GAP-038** (No CI/CD): No pipeline documented for `nyqst-intelli-230126`. Needs contract tests on push, integration tests on PR merge, E2E weekly.
- **GAP-025** (Langfuse not wired): `agents/observability.py` exists but not connected. Blocks cost data for billing.
- **GAP-026** (MCP search design gap): DEC-046 locks MCP hot-swap but algorithm for Brave vs Tavily selection not specified.

---

### 6. File Path References

V2-merged references these actual source file paths in the target repo (`/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126`):

**Backend — existing (do not replace):**
- `src/intelli/agents/graphs/research_assistant.py` — ResearchAssistantGraph (3-node loop, extend this)
- `src/intelli/api/middleware/auth.py` — JWT + API key auth
- `src/intelli/db/models/auth.py` — auth models
- `src/intelli/services/substrate/artifact_service.py` — artifact service
- `src/intelli/api/v1/artifacts.py` — artifacts router
- `src/intelli/services/substrate/manifest_service.py` — manifest service
- `src/intelli/api/v1/manifests.py` — manifests router
- `src/intelli/repositories/pointers.py` — pointer repository
- `src/intelli/api/v1/pointers.py` — pointers router
- `src/intelli/services/knowledge/rag_service.py` — RAG service
- `src/intelli/api/v1/rag.py` — RAG router
- `src/intelli/services/runs/ledger_service.py` — run event ledger
- `src/intelli/api/v1/runs.py` — runs router
- `src/intelli/api/v1/streams.py` — SSE streaming (PG LISTEN/NOTIFY)
- `src/intelli/core/pubsub.py` — PubSub infrastructure
- `src/intelli/db/checkpointer.py` — AsyncPostgresSaver
- `src/intelli/db/models/conversations.py` — conversations/messages/message_feedback
- `src/intelli/api/v1/conversations.py` — conversations router
- `src/intelli/db/models/runs.py` — Run model (has `parent_run_id`, `cost_cents`, `token_usage` JSONB)
- `src/intelli/api/v1/sessions.py` — sessions router
- `src/intelli/db/models/tags.py` — tags model
- `src/intelli/api/v1/tags.py` — tags router
- `src/intelli/agents/tools/research_tools.py` — existing MCP knowledge tools
- `src/intelli/mcp/tools/knowledge_tools.py` — MCP tool definitions
- `src/intelli/agents/observability.py` — Langfuse hook (config-wired, not connected)
- `src/intelli/core/jobs.py` — arq worker (has P0-002 bug: empty functions list)
- `src/intelli/repositories/runs.py` — run repository (has P0-001 bug: TOCTOU race)

**Backend — to create:**
- `src/intelli/schemas/markup.py` — MarkupDocument AST (BL-004)
- `src/intelli/agents/graphs/nodes/report_generation.py` — report generation node (BL-005)
- `src/intelli/mcp/tools/research_tools.py` — Brave/Jina tools (BL-003; distinct from `agents/tools/research_tools.py`)
- `src/intelli/mcp/server.py` — MCP server registration (register BL-003 tools here)
- `src/intelli/api/v1/billing.py` — billing router (BL-012)
- `src/intelli/services/billing/stripe_service.py` — Stripe service (BL-012)
- `src/intelli/services/billing/subscription_service.py` — subscription service (BL-012)
- `src/intelli/services/billing/usage_service.py` — usage service (BL-012)
- `src/intelli/db/models/billing.py` — billing ORM models (BL-012)
- `src/intelli/core/worker_settings.py` — WorkerSettings separated from jobs.py (P0-002 fix)
- `src/intelli/config/stripe_config.py` — Stripe plan config (STRIPE_PLANS dict)

**Frontend — existing:**
- `ui/src/pages/ResearchPage.tsx` — research workspace
- `ui/src/providers/assistant-runtime.tsx` — @assistant-ui/react runtime wiring
- `ui/src/hooks/use-sse.ts` — SSE event hook
- `ui/src/stores/auth-store.ts`, `conversation-store.ts`, `workbench-store.ts`, `run-store.ts`, `tour-store.ts` — 5 existing Zustand stores
- `ui/src/components/chat/CitationAwareText.tsx`, `CitationLink.tsx`, `SourcesPanel.tsx`, `SourcesSidebar.tsx` — citation components (partially built)

**Frontend — to create:**
- `ui/src/stores/deliverableStore.ts` — DeliverableStore (BL-015)
- `ui/src/stores/plan-store.ts` — PlanStore (BL-007)
- `ui/src/hooks/useRunStream.ts` — SSE hook with full event handler
- `ui/src/lib/gml-renderer.ts` — rehype-to-JSX pipeline (DEC-015b)
- `ui/src/components/reports/ReportRenderer.tsx` — recursive MarkupNode renderer (BL-009)
- `ui/src/types/markup.ts` — TypeScript MarkupDocument types (BL-009)
- `ui/src/components/chat/GmlComponentParser.tsx` — `<gml-*>` tag extractor (BL-009)
- `ui/src/components/chat/DeliverableSelector.tsx` — segmented control (BL-008)
- `ui/src/components/generation/GenerationOverlay.tsx` — progress overlay (BL-020)
- `ui/src/components/deliverables/WebsitePreview.tsx` — iframe + blob URL (BL-010)
- `ui/src/types/run-events.ts` — full TypeScript `RunEvent` discriminated union

**Migrations:**
- `src/intelli/db/migrations/versions/20260201_0004_conversations_sessions_tags.py` — last applied
- Next: `0005a`, `0005b`, `0005c` (new files to create)

---

### 7. Migration Specifications

**Migration 0005a — Artifact entity typing**
- Table: `artifacts`
- Add: `entity_type VARCHAR(100) NULLABLE` — allowed values: `WEB_SOURCE`, `API_DATA`, `GENERATED_CONTENT`, `USER_INPUT`, `REPORT`, `SLIDES`, `SEARCH_RESULT`, `EXTRACTED_DATA`, `PLAN`, `KNOWLEDGE`, `WEBSITE`, `DOCUMENT`
- Add: `entity_id UUID NULLABLE` — foreign key pointer (not a JSONB blob); links artifact to entity record. Note: the original analysis incorrectly stated `entity_metadata JSONB`; the actual GitHub issue MIG-0005A (#17) specifies `entity_id UUID`.
- Prerequisite: migrations 0001–0004 complete
- Required by: BL-016 (entity service), BL-004/BL-005 (report pipeline), BL-006 (website pipeline)

**Migration 0005b — Entity + Citation tables** (per GitHub issue MIG-0005B #18)
- Note: This analysis originally described 0005b as billing tables (`subscriptions` + `usage_records`). The actual GitHub issue MIG-0005B (#18) assigns Entity + Citation tables (`entities`, `citations`) to 0005b. This is an internal V2M contradiction between the pattern files and the GitHub issues — the pattern files (BACKEND-PATTERNS.md, INTEGRATION-PATTERNS.md) use a different table assignment than the GitHub issues. Flag: **internal V2M contradiction**.
- Create table: `subscriptions` — columns: `id UUID PK`, `tenant_id UUID FK`, `stripe_customer_id VARCHAR(255) UNIQUE`, `stripe_subscription_id VARCHAR(255) UNIQUE NULLABLE`, `plan_name VARCHAR(50)` (sandbox/professional/team), `billing_interval ENUM(month,year)`, `status ENUM(active,canceled,past_due,incomplete,unpaid)`, `monthly_runs_limit INTEGER`, `is_trial BOOLEAN`, `trial_ends_at DATETIME NULLABLE`, `started_at DATETIME`, `current_period_start DATETIME NULLABLE`, `current_period_end DATETIME NULLABLE`, `canceled_at DATETIME NULLABLE`, timestamps.
- Create table: `usage_records` — columns: `id UUID PK`, `subscription_id UUID FK subscriptions`, `tenant_id UUID FK tenant`, `run_id UUID FK runs NULLABLE`, `message_id VARCHAR(36) NULLABLE`, `feature_name VARCHAR(100)` (research_run|report_generation), `quantity INTEGER`, `input_tokens INTEGER`, `output_tokens INTEGER`, `total_tokens INTEGER`, `cost_cents INTEGER` (never float), `status ENUM(pending,billed,refunded)`, `billing_event_id VARCHAR(255) NULLABLE` (Stripe invoice line item), `metadata JSONB`, timestamps + index on `created_at`.
- Prerequisite: 0005a complete
- Required by: BL-012, BL-013

**Migration 0005c — Billing + metering tables** (per GitHub issue MIG-0005C #19)
- Note: The actual GitHub issue MIG-0005C (#19) assigns Billing + metering tables (`billing_accounts`, `usage_meters`, `quotas`) to 0005c, not the plan/RunState content described below. The following description follows the pattern file interpretation; the GitHub issue assignment differs. See internal V2M contradiction note above.

**Migration 0005c (pattern file interpretation) — Plan/RunState extensions**
- Per the IMPLEMENTATION-PLAN (DEC-014): plans stored as `RunEvent` entries, NOT new tables. However GAP-028 notes that BL-007 (PlanViewer) and BL-019 (plan persistence) reference a `plan_sets` / `plans` / `plan_tasks` table structure. The resolution spec in GAP-028 assigns "RunState extensions (planning_hierarchy fields, cost accumulator fields)" to 0005b, and "indices for entity lookup, usage aggregation, run timeline queries" to 0005c.
- Required by: BL-007, BL-019

Note: There is a minor discrepancy between INTEGRATION-PATTERNS.md (0005c creates plan tables) and IMPLEMENTATION-PLAN DEC-014 (plans stored as RunEvents). The IMPLEMENTATION-PLAN's DEC-014 is the locked decision: plans do NOT get new tables. The 0005c content from GAP-028's resolution is indices + RunState column extensions, not plan entity tables.

---

### 8. NX-* Extension Items (NOT covered in original analysis)

**OMISSION NOTE**: The original analysis did not cover the 12 NX-* (next-generation/extension) issues. These exist in the V2M repo as GitHub issues #87–#98 and span M5+ and M6+ milestones. They are listed here for completeness; detailed analysis was not performed.

| Issue | ID | Title |
|---|---|---|
| #87 | NX-001 | Skills framework |
| #88 | NX-002 | Tool directory UI |
| #89 | NX-003 | Connector platform |
| #90 | NX-004 | Research Notebook |
| #91 | NX-005 | Apps system |
| #92 | NX-006 | Analysis canvas |
| #93 | NX-007 | Structured diffing |
| #94 | NX-008 | Agent management UI |
| #95 | NX-009 | Observability baseline |
| #96 | NX-010 | Security hardening |
| #97 | NX-011 | Knowledge base manager |
| #98 | NX-012 | NDJSON streaming |

These items were not included in the Wave 0–3 implementation sequence or any dependency analysis in this document. They should be addressed in a separate future-scope analysis pass.

---

## Corrections (applied 2026-02-21, session 5 verification)
- CRITICAL: GAP count corrected from 38 to 45 (GAP-001 through GAP-045)
- MIG-0005b/c: noted internal V2M contradiction between pattern files and GitHub issues
- MIG-0005a: corrected entity_metadata JSONB → entity_id UUID
- BACKEND-PATTERNS.md: corrected "nine categories" → 6 top-level sections
- INTEGRATION-PATTERNS.md: corrected section 9 → section 10, 22 BL items → 18, 13 decisions → 14
- Added NX-* section: 12 extension items (NX-001 through NX-012) were missing from original analysis

agentId: a11971a (for resuming to continue this agent's work if needed)
<usage>total_tokens: 121172
tool_uses: 33
duration_ms: 287696</usage>
