# NYQST DocuIntelli — Master Platform Architecture Synthesis

**Document Type**: Master Platform Architecture Reference
**Version**: 1.0
**Date**: 2026-02-20
**Status**: AUTHORITATIVE — Primary engineering reference
**Audience**: Engineering team, VP of Engineering, domain module implementors
**Sources**: KNOWLEDGE-MAP, orchestration-extract, streaming-events-extract, entity-citation-extract, frontend-architecture-extract, SUPERAGENT-TO-NYQST-MAPPING, PLATFORM-FRAMING

---

## Executive Summary

NYQST DocuIntelli is a cognitive intelligence platform for regulated enterprise, targeting investment analysts, asset managers, and compliance officers at ~$200k/yr annual contract value. The platform is structured in three layers: (1) ten horizontal platform primitives built and proven through the Research Module — agentic runtime, generative UI, MCP tool layer, document management, provenance, context engineering, LLM integration, reactive state and streaming, agent management, and billing; (2) vertical domain modules that run on those primitives without re-implementing them — beginning with the Research Module as a proof harness, followed by Lease Critical Dates, Debt MVP, PropSygnal, and RegSygnal; and (3) an enterprise shell that wraps the platform for production regulated-enterprise deployment — SSO/OIDC, RBAC/ABAC, data residency, and compliance governance. The technology foundation is Python/FastAPI + LangGraph + MCP SDK + SQLAlchemy 2.0 async on the backend, and React 18 + Vite + @assistant-ui/react + Zustand + shadcn/ui on the frontend. A working platform kernel (Artifact/Manifest/Pointer content-addressed storage, SSE via PG LISTEN/NOTIFY, JWT auth, 11 API routers, 16 tables, 4 migrations) exists today. The critical path from current state to Research Module completion is 7 weeks; all architectural decisions are locked; specification is complete for Phases 0 through 2 with no open architectural questions blocking implementation.

---

## Three-Layer Architecture

### Layer 1: Platform Primitives (10 Components)

These are the horizontal capabilities consumed by every domain module. They are built once, proven through the Research Module, and inherited without reimplementation by all subsequent modules. Cutting any primitive affects all five domain modules downstream.

| # | Primitive | ADR | Description | Superagent Parity Status |
|---|-----------|-----|-------------|--------------------------|
| 1 | **Agentic Runtime** | ADR-003, ADR-005 | LangGraph StateGraph, Send() dynamic fan-out, supervisor/coordinator pattern, AsyncPostgresSaver checkpointing, parent_run_id child tracking | Confirmed — Send() fan-out is primary gap to close |
| 2 | **GENUI (Generative UI)** | DEC-015a/b | NYQST Markup AST (JSON AST), 18-tag GML element system with healer pipeline, rehype-to-JSX rendering, ReportRenderer, WebsitePreview | Partial — JSON AST is more general than GML, same Plotly.js |
| 3 | **MCP Tool Layer** | ADR-008, DEC-046 | MCP Python SDK, namespaced {domain}.{resource}.{action} convention, session-scoped dynamic discovery, policy-gated execution pipeline | Confirmed — architectural alignment with Superagent's first-class tool API |
| 4 | **Document Management** | ADR-004, ADR-010 | Content-addressed Artifacts (SHA-256 PK), Manifests (tree snapshots), Pointers (mutable HEAD + history), entity_type taxonomy, S3/MinIO storage | Confirmed — kernel is fully implemented and working |
| 5 | **Provenance & Citation** | DEC-009, DEC-016 | 12-type entity system, REFERENCES_FOUND events, citation buffering state machine, SourcesPanel + CitationAwareText, async entity creation via arq | Confirmed — design complete, awaiting Migration 0005a |
| 6 | **Context Engineering** | ADR-006, BL-022 | DataBrief shared state, scratchpads, contextual corpus assembly, knowledge inheritance, session/project hierarchy, RAG context injection | Confirmed — DataBrief schema extraction complete |
| 7 | **LLM Integration** | DEC-042, DEC-050 | ChatOpenAI + base_url override, LiteLLM hot-swap (DEC-042, deferred to v1.5), with_structured_output() for all JSON nodes, gpt-4o-mini default | Confirmed — streaming protocol is provider-agnostic |
| 8 | **Reactive State & Streaming** | DEC-021, DEC-007 | Dual-stream: AI SDK Data Stream Protocol (chat content) + PG LISTEN/NOTIFY SSE (run events), NDJSON envelope format, 22 confirmed + 4 proposed event types | Confirmed — production-ready, fully specified |
| 9 | **Agent Management** | ADR-003, ADR-009 | Four policy templates (exploratory/standard/regulated/audit_critical), ApprovalRequest model, APPROVAL_REQUESTED/GRANTED/DENIED events, LangGraph interrupt patterns | Partial — backend v1 complete, client-facing management UI deferred |
| 10 | **Billing & Metering** | DEC-025, BL-012 | Per-run cost tracking (cost_cents + token_usage on Run), Stripe integration, quota enforcement middleware, subscription + usage_records tables (Migration 0005c) | Partial — tables in 0005c, Stripe code ported from okestraai/DocuIntelli |

### Layer 2: Domain Modules (5 Modules)

These are vertical products that run on Layer 1 primitives. Each module contributes domain-specific agents, MCP tools, Pydantic schemas, and UI components. Infrastructure is inherited.

| Module | Timeline | Entry Point | Platform Capabilities Required Beyond Layer 1 |
|--------|----------|-------------|------------------------------------------------|
| **Research Module** | v1 (now — 7 weeks) | Internal test harness proving all 10 primitives | None — uses all 10 primitives directly |
| **Lease Critical Dates** | Post-v1 (PRD V1 wedge) | Commercial entry point ($200k/yr) | Event Engine (calendar, deadlines, alerts), Doc Processing (full Docling/OCR/DocIR pipeline) |
| **Debt MVP** | Q2 2026 | Covenant monitoring, DSCR/LTV, lender packs | Deterministic Calc Engine (100% accuracy), Event Engine, Doc Processing |
| **PropSygnal** | Post-Debt MVP | CRE market intelligence, deal screening | Deterministic Calc Engine, external market data tools |
| **RegSygnal** | Post-Debt MVP | Regulatory change detection, compliance gap analysis | Event Engine, regulatory feed integrations |

**Layer 2 Extensions** (NOT part of Superagent parity work, built in Phase 3):

| Extension | Consumers | Description |
|-----------|-----------|-------------|
| Deterministic Calc Engine | Debt MVP, PropSygnal | DSCR = NOI / Debt Service — 100% accuracy guarantee, deterministic test suites, no LLM involvement |
| Event Engine | Lease CDs, Debt MVP, RegSygnal | Persistent scheduler with configurable rules, lead times, notification channels |
| Full Doc Processing | Lease CDs, Debt MVP, RegSygnal | Docling/OCR/DocIR full pipeline beyond the partial RAG upload flow |

### Layer 3: Enterprise Shell (8 Capabilities)

Cross-cutting concerns for regulated enterprise deployment. None of these are required for platform primitives or Research Module v1.

- **SSO/OIDC/SAML** — enterprise identity provider integration replacing current JWT + API key for enterprise customers
- **RBAC/ABAC** — role-based and attribute-based access control beyond current scope model
- **Multi-tenant isolation** — hard data partitioning, tenant-scoped queries, cross-tenant protection
- **Data residency / GDPR** — configurable data location, retention policies, right-to-deletion
- **Audit trails** — enterprise-grade audit beyond the run ledger (admin access, config changes, user management)
- **Compliance governance** — policy enforcement, approval chains, regulatory reporting
- **Enterprise billing** — annual contracts, invoicing, capacity-based pricing, cost center attribution
- **Notification service** — email alerts, webhook integrations, configurable notification rules

**Superagent signals for Layer 3**: workspace ID in URLs, session redemption tokens, Google SSO endpoint (`/api/sso/google/generate-url`), email preferences (`/api/preferences/email`), weekly email generation, `/api/subscribe` billing. All confirmed as production patterns.

---

## Data Flow Architecture

This section describes the complete request lifecycle from user query to rendered deliverable.

### Phase 0: Request Ingestion

```
User types query + selects DeliverableType (standard | report | website | slides | document)
  |
  v
POST /api/v1/agent/chat
  { content: "Analyze MSFT", deliverable_type: "report", conversation_id, workspace_id }
  |
  v
Backend: Create ChatMessage (id, chat_id, content, deliverable_type, creator_type="USER")
         Create Run (id, status="running", parent_message_id, cost_cents=0)
         Emit stream_start event → PG NOTIFY
  |
  v
Frontend: GET /api/chat/message/stream?message_stream_id={id}
          (ReadableStream with NDJSON envelope: {"data": {...}, "timestamp": ms})
          stream_start received → set isLoading=true, initialize runStore
```

### Phase 1: Planning (Orchestrator → Planner Node)

```
LangGraph ResearchAssistantGraph: planner_node executes
  |
  v
LLM call: gpt-4o-mini + with_structured_output(PlanSet)
  → PlanSet {
      plans: { plan_id: Plan {
        plan_tasks: { task_id: PlanTask { title, message, status: "loading" } }
      }}
    }
  |
  v
Emit: task_update event { type: "task_update", status: "loading",
                          title: "Devising Initial Research Strategy",
                          plan_set: <full PlanSet snapshot> }
  → PG NOTIFY → SSE → Frontend: setPlanSet(event.plan_set)
                                 PlanViewer renders task cards with LOADING status
```

### Phase 2: Parallel Execution (Dispatch → Research Executors)

```
dispatch_node: for each PlanTask → Send("research_executor", {task, plan_set})
  [LangGraph Send() returns immediately; orchestrator queues N parallel instances]
  |
  v
[N research_executor nodes run in parallel, each emitting:]
  node_tools_execution_start { node_id=task.id, tool_ids=[...], total_tools=K }
  update_subagent_current_action { current_action="Searching for X...", node_id }
  node_tool_event { event="tool_call_started", tool_id, node_id }
  node_tool_event { event="tool_call_completed", tool_id, metadata={result_size} }
  update_subagent_current_action { current_action="Creating notes from K sources" }
  task_update { status="success", plan_set=<updated snapshot> }
  references_found { references=[WEB_PAGE entity, EXTERNAL_API_DATA entity, ...] }
  |
  v
Frontend: Each SSE event routed to handler:
  task_update → PlanViewer card status updates (loading → success/error)
  update_subagent_current_action → TaskCard secondary text
  references_found → runStore.addReferences() → SourcesPanel tab counts update
  node_tool_event → RunTimeline phase row appends
```

### Phase 3: Meta-Reasoning + Fan-In

```
fan_in_aggregation_node: receives all task_results (Annotated[List, operator.add])
  → deduplicates sources by URL
  → collects all entity IDs
  |
  v
meta_reasoning_node: analyze completeness
  if data_gaps detected:
    emit task_update { status: "loading", title: "Considering Results and Refining Research Strategy" }
    create new Plan → dispatch_node (gap-filling loop)
  else:
    proceed to synthesis_node
  |
  v
synthesis_node: LLM call with all findings → DataBrief {
  financial_data, market_data, company_metadata,
  swot_summary, risk_factors, growth_opportunities,
  primary_sources, all_sources, data_gaps
}
  → store DataBrief as Artifact (entity_type="PLAN")
  → emit update_subagent_current_action { current_action="Synthesis complete. Preparing deliverables." }
```

### Phase 4: Deliverable Generation

```
deliverable_router: branch on deliverable_type
  |
  ├─ type="report" → Send("report_generation_node", {data_brief})
  |    |
  |    v
  |    report_generation_node: 4-stage pipeline
  |      Stage 1: Write outline (section structure)
  |      Stage 2: Build components per section (parallel Send() per section)
  |      Stage 3: Review content (iterative loops, multiple passes)
  |      Stage 4: Polish typography
  |      → Run Healer (fix structural violations)
  |      → Store as Artifact (sha256, entity_type="GENERATED_REPORT")
  |      → emit node_report_preview_start { preview_id, report_title, entity }
  |      → emit node_report_preview_delta { delta="<gml-row>..." } (streaming)
  |      → emit node_report_preview_done { content=<full GML> }
  |
  ├─ type="website" → Send("website_generation_node", {data_brief})
  |    → 7-stage pipeline (template, architecture, theme, layout, content, widgets, export)
  |    → Store as zip bundle Artifact
  |    → emit node_report_preview_* events
  |
  └─ type="text" → synthesizer (plain LLM answer, no generation)

Frontend (ReportPanel):
  node_report_preview_start → set reportContent='', isRendering=true
  node_report_preview_delta → append delta to reportContent (streaming preview)
  node_report_preview_done → set final content, isRendering=false
    → ReportRenderer: unified().use(rehypeParse).use(rehypeReact, {components}) → React elements
    → Plotly charts render from gml-chartcontainer props
    → Citations render from gml-inlinecitation → lookup in runStore.references
```

### Phase 5: Completion + Async Entity Creation

```
synthesizer_node: generate final text answer (message_delta stream)
  → emit message_delta { delta="The analysis shows..." } (token by token)
  → Frontend: CitationBuffer.feed(delta) → renders text without incomplete [citations]
  → emit ai_message { message=<full ChatMessage 26-field schema> }
  → emit done { has_async_entities_pending=true }
  |
  v
Background (arq job via Redis queue):
  create_entities_from_response: parse citations from response_text
    → look up entity by ID
    → generate entity summaries (LLM call)
    → update message.entities[] in DB
    → emit run_event { type: "ENTITY_CREATED", entity_count }
  |
  v
Frontend: done event received → setIsLoading(false), persist message to store
          "has_async_entities_pending" banner shows until arq job completes
          SourcesPanel populates with final entity set
```

### Artifact Storage Lifecycle

```
Any output artifact:
  Upload → hashlib.sha256(content) → storage_uri = "s3://bucket/{sha256}"
  Create Artifact record { sha256 PK, media_type, size_bytes, storage_uri, entity_type }
  Create Manifest { sha256, tree: { "reports/exec_summary.json": { sha256, entity_type } } }
  Create/Update Pointer { namespace, name="conversation-{id}/latest-report",
                          manifest_sha256, meta: { deliverable_type, run_id, user_query } }
  Create PointerHistory { from_manifest_sha256, to_manifest_sha256, reason="deliverable_generated" }
```

---

## Integration Contract Summary

### SSE Event Envelope (NDJSON)

Every server-sent event uses this wrapper:

```json
{ "data": { "type": "<event_type>", ...payload }, "timestamp": 1730000000000 }
```

Transport: `GET /api/chat/message/stream?message_stream_id={id}` — HTTP streaming response, `Content-Type: text/plain`, `X-Accel-Buffering: no`. Heartbeat every 20s. Client watchdog: 30s with reset on each chunk. Reconnect: exponential backoff (1s, 2s, 4s, 8s, 16s, 5 retries max).

### Complete Event Type Registry (26 Types)

**Lifecycle (4)**: `stream_start`, `heartbeat`, `done`, `ERROR`

**Text Streaming (3)**: `message_delta` (incremental token), `ai_message` (full ChatMessage), `message_is_answer`

**Planning (3)**: `task_update` (PlanSet snapshot), `pending_sources`, `chat_title_generated`

**Tool Execution (3)**: `node_tools_execution_start`, `node_tool_event`, `update_subagent_current_action`

**Deliverable Generation (3)**: `node_report_preview_start`, `node_report_preview_delta`, `node_report_preview_done`

**Citations (1)**: `references_found`

**Browser Automation (3)**: `browser_use_start`, `browser_use_stop`, `browser_use_await_user_input`

**Clarification (2)**: `clarification_needed`, `update_message_clarification_message`

**NYQST Proposed (4)**: `ping`, `error` (structured), `message-file`, `usage-update`

### Core Schemas

**PlanSet** (root execution context):
```python
PlanSet { plans: Dict[str, Plan], chat_id, workspace_id, creator_user_id, user_chat_message_id }
Plan    { plan_id, plan_tasks: Dict[str, PlanTask], status, used_sources, previous_plan_id }
PlanTask{ plan_task_id, title, message, status, start_time, end_time, notes, sources, entities }
Status  = "loading" | "success" | "error"
```

**ChatMessage** (26 fields — key fields):
```python
ChatMessage {
  id, chat_id, content, hydrated_content,
  creator_type: "AI" | "USER", deliverable_type: "WEBSITE" | "REPORT" | "DOCUMENT" | "SLIDE" | "CODE",
  is_answer, is_running, needs_clarification_message,
  event_stream_artifact_id,   # → event log artifact
  first_report_identifier,    # → primary deliverable entity UUID
  entities: Entity[],
  has_async_entities_in_progress: bool
}
```

**Entity** (12-type discriminated union):
```python
EntityType = WEB_PAGE | EXTERNAL_API_DATA | GENERATED_CONTENT | USER_QUERY_PART |
             GENERATED_REPORT | GENERATED_PRESENTATION | INTRA_ENTITY_SEARCH_RESULT |
             EXTRACTED_ENTITY | SEARCH_PLAN | KNOWLEDGE_BASE | WEBSITE | GENERATED_DOCUMENT
Entity { entity_id, entity_type, title, created_at, message_id, run_id, metadata }
```

**DataBrief** (shared research state):
```python
DataBrief {
  financial_data, market_data, company_metadata,
  swot_summary, risk_factors, growth_opportunities,
  primary_sources: Entity[], all_sources: Entity[], data_gaps: str[],
  collected_at: ISO timestamp
}
```

**Artifact / Manifest / Pointer** (kernel objects, all existing):
```python
Artifact  { sha256 PK, media_type, size_bytes, storage_uri, entity_type, entity_metadata, created_by }
Manifest  { sha256 PK, tree: JSONB, parent_sha256, entry_count, total_size_bytes, message }
Pointer   { id UUID PK, namespace, name, manifest_sha256, pointer_type, meta: JSONB, created_by }
```

### API Endpoint Map

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/agent/chat` | POST | Submit user message, start run | Existing |
| `/api/chat/message/stream` | GET | SSE event stream per message | Existing |
| `/api/v1/streams/runs/{run_id}` | GET | Run lifecycle event stream | Existing |
| `/api/v1/artifacts` | POST | Upload artifact (multipart) | Existing |
| `/api/v1/artifacts/{sha256}/content` | GET | Download artifact content | Existing |
| `/api/chat/retry` | POST | Retry failed message | Existing |
| `/api/chat/trace-link` | GET | LangSmith trace URL | Planned |
| `/api/feature-flags` | GET | Feature flag evaluation | Planned |
| `/api/session/redeem-token` | POST | Invite/access token redemption | Planned |
| `/api/chat/user-message/generate-title` | POST | Auto-title generation | Planned |
| `/api/browser-profile/*` | GET/POST | Browser session management | Phase 4 |

---

## Technology Stack Map

### Backend Runtime

| Library | Version | Role | Why Chosen | Gotchas |
|---------|---------|------|------------|---------|
| Python | 3.14 | Runtime | Platform baseline | 3.14 is very recent — confirm package compatibility |
| FastAPI | 0.115+ | REST API, WebSocket, SSE | ASGI, async-native, Pydantic v2 integration | Use `StreamingResponse` not `EventSourceResponse` for NDJSON |
| SQLAlchemy | 2.0 async | ORM | Async sessions, type annotations | Per-node async sessions from shared `async_sessionmaker` (DEC-051) |
| Pydantic v2 | 2.x | Validation, OpenAPI schema | Single source of truth for types | v2 breaking changes from v1; use `model_validate()` not `parse_obj()` |
| LangGraph | 0.2+ | Orchestration, checkpointing | StateGraph + Send() fan-out + LangSmith integration | LangGraph checkpoints are operational aids, NOT source of truth |
| LangChain | 0.2+ | Parsers, splitters, embeddings, `with_structured_output()` | Ecosystem maturity, OpenAI integration | `with_structured_output()` required for ALL JSON nodes (DEC-050) |
| MCP Python SDK | 0.8+ | Tool protocol | Standardised discovery, schema, transport | Session-scoped dynamic discovery; context filtering algorithm TBD |
| arq | 0.25+ | Background job queue | Async Redis-based task queue | Requires Redis; retry via `Retry(max_tries=3, backoff=2)` |

### Data & Search

| Library / Service | Version | Role | Why Chosen | Gotchas |
|---|---|---|---|---|
| PostgreSQL | 16+ | Primary RDBMS, PG LISTEN/NOTIFY | ACID, async notify for SSE, pgvector | Enable pgvector extension explicitly |
| pgvector | 0.8+ | Semantic search fallback | pgvector is dev fallback; OpenSearch is production | `VECTOR(1536)` column type for OpenAI embedding dimensions |
| OpenSearch | 2.13+ | Hybrid search production (BM25+kNN) | Dify validated pgvector at scale; OpenSearch for production | Self-hosted; sizing TBD |
| Neo4j Aura | free tier | Graph for domain ontologies | Purpose-fit for CRE knowledge graph (PropSygnal, RegSygnal) | Free tier limits TBD; upgrade plan needed |
| Redis / Upstash | 7+ | Cache, arq job queues | arq requires Redis | Upstash for serverless; Redis Docker for local dev |
| S3 / MinIO | — | Artifact binary storage | Content-addressed, immutable, reference-counted | MinIO for local dev; S3 for production |

### Document Processing

| Library | Version | Role | Why Chosen | Gotchas |
|---------|---------|------|------------|---------|
| Docling | 2.3+ | Primary document parser (100+ formats) | Best-in-class multi-format support | Research Module: partial RAG use only. Full pipeline for domain modules |
| Unstructured | 0.15+ | Fallback parser (CSV/JSON/Email) | Broad format coverage as fallback | Heavier dependency; use only when Docling insufficient |
| LlamaParse | optional | Heavy extraction (paid API) | Best-in-class PDF table extraction | Cost per page; gate behind feature flag |
| OpenAI `text-embedding-3-small` | — | Vector embeddings (1536-dim) | Default; base_url override for hot-swap | 1536 dimensions → `VECTOR(1536)` in pgvector |

### LLM Integration

| Library | Version | Role | Why Chosen | Gotchas |
|---------|---------|------|------------|---------|
| langchain-openai | 0.2+ | ChatOpenAI, embeddings | Primary LLM interface | `base_url` override enables model routing |
| OpenAI API | — | Default LLM provider | gpt-4o-mini default; gpt-4o for complex nodes | Single provider for v1; LiteLLM for v1.5+ hot-swap |
| LiteLLM | — | Multi-provider hot-swap (DEC-042) | Future: Anthropic/Claude, Mistral, etc. | Deferred to v1.5; design is provider-agnostic |
| Langfuse | self-hosted | Observability, trace storage, cost tracking | Self-hosted avoids vendor lock-in; $2/run state budget (DEC-045) | Sizing and backup strategy TBD |
| LangSmith Studio | free tier | Graph inspection, visual debugging | Renamed from LangGraph Studio (Oct 2025) | Free tier; graph-as-code not visual editor (DEC-049) |

### Frontend Runtime

| Library | Version | Role | Why Chosen | Gotchas |
|---------|---------|------|------------|---------|
| React | 18.3+ | Component framework | Concurrent features, SSE support | React 19 available but not yet adopted |
| TypeScript | 5.6+ | Type safety | Single source of truth via openapi-typescript codegen | Strict mode required |
| Vite | 5.2+ | Build, dev server, HMR | Fast cold start; ESM-native | Proxy config needed for SSE in dev |
| TailwindCSS | v4 | Styling | Superagent uses v4; design token system matches | v4 breaking changes from v3; `@3xl:` container query breakpoint |

### Frontend Libraries

| Library | Version | Role | Why Chosen | Gotchas |
|---------|---------|------|------------|---------|
| @assistant-ui/react | 0.2.1+ | Chat UI (Thread, Composer, streaming) | Production-quality chat UI; handles AI SDK Data Stream Protocol | Custom adapter needed for NYQST backend |
| shadcn/ui | — | Component library (button, badge, card, tabs, etc.) | Tailwind-native; copy-owned components | Components are copied into codebase; no automatic updates |
| Zustand | 4.5+ | State management | Simpler than Recoil; sufficient for platform primitives | Superagent uses Recoil; NYQST uses Zustand — correct choice (DEC-035) |
| react-plotly.js | 2.13+ | Charts | Plotly.js chosen (DEC-048) — NOT Recharts | `react-plotly.js` is the wrapper; `plotly.js` is the engine |
| unified | 11+ | Text processing pipeline for GML rendering | Ecosystem: parse → transform → generate | Required for rehype pipeline |
| rehype-parse | 9+ | HTML/GML parser | Parses GML HTML string → HAST | `fragment: true` option for GML fragments |
| rehype-react | 13+ | HAST → React elements | Component map maps gml-* tags to React components | DEC-015b; NOT custom AST reconstruction |
| Zod | 3+ | Runtime schema validation for SSE events | Type-safe event parsing; discriminated union | Required for `StreamEvent` discriminated union |

### DevOps & Observability

| Tool | Version | Role | Gotchas |
|------|---------|------|---------|
| Docker | 28+ | Containerization | Apple Silicon (ARM) image compatibility |
| PostgreSQL Docker | 16-pgvector | Local dev DB with pgvector | Enable pgvector extension in init script |
| Neo4j Docker | — | Local dev graph DB | Cypher query language |
| Redis Docker | 7-alpine | Local dev queue/cache | Persist data if needed for dev stability |
| MinIO Docker | — | Local dev object storage | S3-compatible API |
| GitHub CLI (gh) | authenticated | Issues, PRs, CI | Used for bulk issue creation |

---

## Component Dependency Graph

### Backend Component Build Order

```
Migration 0005a (artifact entity_type)
  → Entity Service CRUD (EntityService class)
  → Research Tools (search_web, with entity creation)
  → RunEvent Schema Extensions (BL-002: ENTITY_CREATED, REFERENCES_FOUND, etc.)
  ↓
Migration 0005b (message extensions: run_event_id, parent_message_id, async entity flag)
  → DataBrief Schema (BL-022)
  → Planner Node (LLM → PlanSet structured output)
  → Research Executor Node (fan-out via Send())
  → Fan-In Aggregation Node
  → Meta-Reasoning Node
  → Synthesis Node → DataBrief artifact
  ↓
Research Orchestrator Graph (BL-001) [CRITICAL PATH — depends on all above]
  → EventEmitter infrastructure (async-safe, dual DB+stream)
  → Fan-Out dispatch (Send() pattern)
  → Task telemetry (node_tools_execution_start, node_tool_event, update_subagent_current_action)
  ↓
Report Generation Node (BL-005) [depends on BL-001 + Migration 0005]
  → GML markup generation (18-tag system)
  → Healer/validator pipeline (VALID_LOCATIONS rules)
  → Artifact storage + Manifest + Pointer
  → node_report_preview_* SSE events
  ↓
Website Generation Node (BL-006) [depends on BL-001 + Migration 0005]
  → 7-stage generation pipeline
  → Bundle as zip Artifact
  ↓
MCP Search Tools (BL-003) [INDEPENDENT — no BL-001 dependency]
  → Brave Search integration (primary)
  → Tavily hot-swap (DEC-046)
  → WEB_PAGE entity creation
  ↓
Billing (BL-012, Migration 0005c) [INDEPENDENT]
  → Stripe Stripe webhooks, subscription table
  → Quota enforcement middleware (BL-013)
```

**CRITICAL CORRECTION**: BL-022 (DataBrief) must PRECEDE BL-001 (Orchestrator). BL-003 (MCP Tools) is INDEPENDENT of BL-001. These were incorrectly ordered in earlier dependency analysis.

### Frontend Component Build Order

```
deliverableStore.ts (BL-015) [INDEPENDENT]
  |
  v
DeliverableSelector.tsx (BL-008) [depends on deliverableStore]
  |
  v
GenerationOverlay.tsx (BL-020) [INDEPENDENT — depends on runStore only]
  |
  v
PlanViewer.tsx (BL-007) [depends on runStore + SSE task_update events]
  |
  v
EnhancedRunTimeline.tsx (BL-014) [extends existing RunTimeline + embeds PlanViewer]
  |
  v
ReportRenderer.tsx (BL-009) [depends on unified + rehype-parse + rehype-react npm install]
  |   (GML component map: 18 tags → React components)
  v
WebsitePreview.tsx (BL-010) [depends on artifact API + blob URL]
  |
  v
Enhanced SourcesPanel (BL-011) [extends existing + adds web/api/generated tabs]
```

**Estimated frontend build time**: ~10 working days for all 8 new components + store.

### Migration Dependency Order

```
0001 → 0002 → 0003 → 0004 → 0005a (artifact entity_type)
                                 → 0005b (message extensions)
                                 → 0005c (billing tables)
```

Migrations 0005a/b/c can land independently in sequence but must all precede Report Generation (BL-005) and Website Generation (BL-006).

---

## Critical Path Analysis

### 7-Week Critical Path (from IMPLEMENTATION-PLAN v3)

The critical path is the Research Orchestrator (BL-001). All work that is NOT on the critical path can execute in parallel tracks.

**Week 1–2: Phase 0 — Event Contract & Instrumentation**
- Migration 0005a/b (artifact entity_type, message extensions)
- RunEvent schema extensions (BL-002)
- DataBrief schema (BL-022) [MUST precede BL-001]
- NYQST Event Contract v1 (types + payload schemas)
- Stable IDs for tool calls and nodes (persisted, not ephemeral)
- Extend RunTimeline to group by node/tool (BL-014 partial)
- Minimal Plan panel frontend (right sidebar, task list + status + action)

**Acceptance gate**: For any run, see plan → nodes → tools → artifacts in single UI; events sufficient for replay.

**Week 3–4: Phase 1 — Planning Layer & Multi-Agent Executor**
- PlanSet/Plan/PlanTask Pydantic models
- Planner node emitting PlanSet before execution
- Fan-out dispatch via LangGraph Send() (THIS IS THE PRIMARY PLATFORM GAP)
- Parallel research_executor nodes (LangGraph subgraphs)
- Fan-in aggregation (Annotated[List, operator.add] reducer)
- Meta-reasoning node (gap detection → adaptive re-planning)
- PlanViewer frontend component (BL-007)

**Acceptance gate**: Complex request → multi-task plan; tasks progress independently; UI legible.

**Week 5–6: Phase 2 — Deliverables v1**
- Report generation node: 4-stage pipeline (outline → components → review → polish)
- GML healer/validator pipeline (VALID_LOCATIONS enforcement)
- Deliverable SSE events (node_report_preview_start/delta/done)
- ReportRenderer frontend (BL-009): rehype pipeline + 18 GML component implementations
- DeliverableSelector + deliverableStore (BL-008, BL-015)
- WebsitePreview iframe (BL-010)
- Enhanced SourcesPanel (BL-011)

**Acceptance gate**: User requests report → high-quality, structured, readable with citations and viewer.

**Parallel Track (Weeks 1–4): MCP Search Tools (BL-003)**
- Brave Search API integration
- WEB_PAGE entity creation
- MCP namespacing and session-scoped discovery
- Tavily hot-swap capability (DEC-046)

**Parallel Track (Weeks 2–6): Billing (BL-012, BL-013)**
- Migration 0005c (subscription + usage_records)
- Stripe webhook integration (ported from okestraai/DocuIntelli)
- Quota enforcement middleware

**Why Send() fan-out is the critical path**: Dynamic parallel dispatch via `Send()` is the primary capability gap. The existing ResearchAssistantGraph is a 3-node StateGraph without fan-out. Every subsequent deliverable, every domain module, and every multi-agent workflow depends on this pattern working correctly. Phase 0 de-risks Phase 1 by proving streaming + visibility first.

---

## Risk Register Summary

| # | Risk | Severity | Probability | Current Mitigation | Residual Gap |
|---|------|----------|-------------|-------------------|--------------|
| R1 | **Send() fan-out complexity** — LangGraph dynamic parallelism is the most complex orchestration primitive; state management across N parallel executors is error-prone | HIGH | MEDIUM | Phase 0 streaming proof first; LANGGRAPH-DORMANT-CAPABILITIES research done; pseudocode complete | No production validation yet; fan-in state accumulation must be tested at scale |
| R2 | **LLM output quality for GML** — GML generation requires structured XML-like output; LLMs frequently produce malformed nesting | HIGH | HIGH | Healer/validator pipeline handles 95% of structural issues automatically; avoids retry loops | Healer rules (VALID_LOCATIONS) need unit tests covering all 18 tag types |
| R3 | **DataBrief consistency** — All numeric values (revenue, growth rates) must be identical across report, website, and slides; single source of truth is critical | HIGH | LOW | DataBrief is canonical; all generators consume it; no parallel LLM calls for facts | DataBrief must be stored as artifact before any generator starts |
| R4 | **SSE stream reliability at scale** — 30s watchdog, heartbeat, reconnect logic must be production-grade; partial events during reconnect create citation binding issues | MEDIUM | MEDIUM | Client-side watchdog + exponential backoff fully specified and coded; heartbeat every 20s | PG LISTEN/NOTIFY performance under high concurrent connections untested |
| R5 | **Neo4j free tier limits** — PropSygnal/RegSygnal require graph; Aura free tier has storage limits | MEDIUM | MEDIUM | pgvector as fallback for dev; upgrade path planned | Upgrade/fallback plan not yet formalized |
| R6 | **Search provider cost & availability** — Brave API pricing at scale; Tavily hot-swap requires tested abstraction | MEDIUM | MEDIUM | DEC-046 hot-swap design; MCP abstraction isolates provider choice | Cost comparison (Brave vs Tavily at production volume) not yet done |
| R7 | **Migration 0005 split sequencing** — Three sub-migrations (0005a/b/c) must land in order without breaking existing system | LOW | LOW | Split rationale documented; each is independently reversible; downgrade() functions specified | Need integration test that 0005b message extensions don't break existing message reads |

**Platform-level risks from PRD (top 3 of 17):**
- Accuracy below 95% threshold (primary trust risk — entire platform value proposition)
- LLM cost overrun ($2/run budget in DEC-045 must be enforced)
- Enterprise procurement cycle > 6 months blocking initial revenue

---

## Decision Index

All 52+ decisions are organized below by domain. Rationale summaries focus on the "why" not the "what."

### Strategic Positioning (DEC-001–005)

| ID | Decision | Rationale |
|----|----------|-----------|
| DEC-001 | Cognitive ERP positioning; $200k/yr enterprise pricing | Intelligence is commodity; ontologies are assets; positions as infrastructure not tools |
| DEC-002 | Event-streamed planning required | Users must see agent reasoning to build trust; opacity destroys adoption |
| DEC-003 | Domain-first data models (not CDM-first) | Commercial entities (leases, covenants, regulations) first; integration layer after |
| DEC-004 | Index Service contract with pluggable backends (OpenSearch + pgvector) | Contract-first; dev uses pgvector, production uses OpenSearch hybrid search |
| DEC-005 | LangGraph as orchestration runtime | Clear boundary: LangGraph (workflow execution), kernel (trust/audit) |

### Architecture Fundamentals (DEC-006–015)

| ID | Decision | Rationale |
|----|----------|-----------|
| DEC-006 | MCP Python SDK 0.8+ for tool protocol | Standard discovery, schema, transport; multi-agent framework flexibility |
| DEC-007 | NDJSON event schema v1 | Every event: `{data: {...}, timestamp: ms}` — replay-safe, observable, testable |
| DEC-008 | NDM v1 (JSON AST) for deliverables | Format-agnostic; more general than GML; rehype ecosystem composes freely |
| DEC-009 | Entity table for citations (12-type discriminated union) | Every source reference is typed, durable, and addressable by ID |
| DEC-010 | Run ledger as canonical state (append-only) | Replays, audits, replications drive from ledger, not LangGraph checkpoints |
| DEC-011–014 | Platform modules, HITL templates, tool catalog | Research + 4 domain modules; 4 governance policy templates |
| DEC-015a | Backend emits JSON AST (not GML string) for report content | LLM generates structured JSON; healer operates on typed nodes |
| DEC-015b | Frontend uses rehype-to-JSX pipeline (not custom AST) | unified + rehype-parse + rehype-react; GML HTML → HAST → React; DEC-043 separation |

### Infrastructure (DEC-016–030)

| ID | Decision | Rationale |
|----|----------|-----------|
| DEC-016 | Artifact gets `entity_type` + `entity_metadata` columns (Migration 0005a) | Maps 12 Superagent entity types to NYQST artifact substrate without new table |
| DEC-017 | Async entity creation via arq + Redis | Synthesis response returns quickly; entity summarization is background work |
| DEC-018–020 | Platform metrics, user personas, delivery strategy | 5 metrics (accuracy > trust > efficiency > adoption > growth) |
| DEC-021 | Dual SSE streams (chat content vs run lifecycle events) | Clean separation: chat stream is request-response; run stream is orchestrator-driven |
| DEC-022 | `<answer>` wrapper format for final response | Disambiguates answer from reasoning steps in message content |
| DEC-023 | `deliverable_type` belongs on Message, not Conversation | User can request different types per message; one deliverable per user message |
| DEC-024 | Co-generation (WEBSITE + REPORT simultaneously) | User sees both; simultaneous generation improves UX |
| DEC-025 | Per-run billing metering | Run cost_cents + token_usage tracked; Stripe integration for SaaS billing |
| DEC-026–030 | Search tool catalog, rate limiting, auth architecture | Brave primary, Tavily fallback; JWT + API-key dual auth |

### Implementation (DEC-031–041)

| ID | Decision | Rationale |
|----|----------|-----------|
| DEC-031 | 7-week critical path with 5 parallel tracks | Dependency-driven; BL-001 orchestrator is the bottleneck |
| DEC-032 | SUPERSEDED by DEC-046 | Originally tool selection decision; MCP abstraction replaces |
| DEC-033–041 | Library selections, dependency corrections, auth flow | Various library and dependency clarifications |
| DEC-040 | GML healer/fixer pipeline mandatory | Avoids expensive LLM retries; 95% of structural issues auto-fixed |
| DEC-041 | Immutable artifact + soft-delete pointer | Artifacts never deleted; pointers are soft-deleted; reference counting for GC |

### Recent Decisions (DEC-042–052 + DEC-015a/b)

| ID | Decision | Rationale |
|----|----------|-----------|
| DEC-042 | LiteLLM multi-provider hot-swap (deferred to v1.5, OpenAI-only v1) | Design is provider-agnostic now; hot-swap implementation not blocking v1 |
| DEC-043 | GML rendered in separate ReportPanel from @assistant-ui Thread | GML is a structured document, not a chat message; different rendering pipeline |
| DEC-044 | Website deliverable as iframe-only in v1 | No public `/website/[id]` route; blob URL sandbox; deployment deferred |
| DEC-045 | Langfuse self-hosted + $2/run LangGraph state budget | Self-hosted avoids vendor lock-in; budget enforcement in LangGraph state |
| DEC-046 | MCP search (Brave primary, Tavily hot-swap) — supersedes DEC-032 | Provider-agnostic; cost comparison pending |
| DEC-047 | Clarification UI deferred to v1.5 | Backend flag and event exist; frontend UI deferred |
| DEC-048 | Plotly.js (react-plotly.js) — NOT Recharts | Superagent uses Plotly.js confirmed; Recharts references are wrong |
| DEC-049 | LangSmith Studio + graph-as-code — no visual editor | LangSmith Studio is the Oct 2025 rename of LangGraph Studio; free tier |
| DEC-050 | LangChain `with_structured_output()` for ALL JSON nodes | Eliminates manual JSON parsing; schema-enforced outputs |
| DEC-051 | Per-node async sessions from shared `async_sessionmaker` | Prevents session sharing across concurrent fan-out nodes; prevents deadlock |
| DEC-052 | Migration 0005 split into 0005a/b/c | Independent landing; lower risk per migration |

---

## What's Built vs What's Planned

### Currently Working (Platform Kernel)

The following components are fully implemented and tested in `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126`:

| Component | Description | Location |
|-----------|-------------|----------|
| **Content-addressed kernel** | Artifact/Manifest/Pointer with full CRUD and history | `src/intelli/db/models/` |
| **SSE via PG LISTEN/NOTIFY** | Production-ready event streaming | `src/intelli/api/v1/streams/` |
| **JWT + API-key auth** | Full authentication, session management | `src/intelli/api/v1/auth/` |
| **11 API routers** | Artifacts, manifests, pointers, runs, sessions, users, etc. | `src/intelli/api/v1/` |
| **16 database tables** | Users, tenants, conversations, messages, runs, run_events, artifacts, manifests, pointers, pointer_history, rag_chunks, etc. | `migrations/` |
| **4 migrations (0001–0004)** | Schema history complete through current state | `migrations/versions/` |
| **ResearchAssistantGraph** | 3-node StateGraph (existing, extend don't replace) | `src/intelli/agents/graphs/` |
| **Frontend chat UI** | @assistant-ui/react Thread, Composer, ChatPanel | `ui/src/components/chat/` |
| **Existing frontend components** | RunTimeline, ArtifactViewer, ManifestViewer, PointerViewer, SourcesPanel, CitationAwareText | `ui/src/components/` |
| **5 Zustand stores** | auth-store, conversation-store, workbench-store, run-store, tour-store | `ui/src/stores/` |

### Migration 0005 (Ready to Implement)

Three sub-migrations fully specified, not yet applied:

- **0005a**: `entity_type` + `entity_metadata` columns on `artifacts` table
- **0005b**: `run_event_id`, `parent_message_id` on `messages`; `has_async_entities_in_progress` on `conversations`
- **0005c**: `subscriptions` + `usage_records` billing tables (Stripe)

### Phase 0 (Weeks 1–2 — Event Contract)

New work, fully specified:

- NYQST Run Event Contract v1 (22 event types + 4 proposed, all Pydantic schemas complete)
- Stable node/tool IDs (persisted to DB, not ephemeral)
- EventEmitter class (async-safe dual DB+stream emission)
- DataBrief Pydantic schema (BL-022)
- RunEvent schema extensions (BL-002): 14 new event types in RunEventType enum
- Minimal PlanViewer panel frontend

### Phase 1 (Weeks 3–4 — Planning + Fan-Out)

New work, design complete, no code yet:

- PlanSet/Plan/PlanTask Pydantic models (schemas in orchestration-extract.md)
- Planner node with `with_structured_output(PlanSet)`
- Send() dispatch node (pseudocode in orchestration-extract.md, Section 2.1)
- research_executor node with tool telemetry
- fan_in_aggregation_node with `Annotated[List, operator.add]` reducer
- meta_reasoning_node with adaptive re-planning
- PlanViewer.tsx (BL-007, component hierarchy specified)
- Enhanced RunTimeline.tsx (BL-014)

### Phase 2 (Weeks 5–6 — Deliverables)

New work, design complete, no code yet:

- Report generation node (4-stage: outline, components, review, polish)
- GML healer/validator pipeline (VALID_LOCATIONS rules in orchestration-extract.md, Section 3.2)
- node_report_preview_start/delta/done SSE emission
- ReportRenderer.tsx (BL-009, rehype pipeline + 18 GML components)
- DeliverableSelector.tsx (BL-008)
- deliverableStore.ts (BL-015)
- WebsitePreview.tsx (BL-010)
- Enhanced SourcesPanel.tsx (BL-011)
- GenerationOverlay.tsx (BL-020)

### Phase 3 (Weeks 7–12 — Search + Citations)

Design specified, not yet extracted:

- MCP Brave Search integration (WEB_PAGE entity creation)
- Entity Service CRUD (EntityService class skeleton in entity-citation-extract.md)
- Citation parser utility (backend)
- CitationBuffer state machine (frontend — TypeScript class in streaming-events-extract.md)
- Source drawer with entity previews

### Phase 4 (Weeks 13–18 — HITL + Browser)

Design partial — LangGraph interrupt patterns specified, browser automation deferred:

- LangGraph interrupt + approval flow (APPROVAL_REQUESTED/GRANTED/DENIED events exist)
- Clarification UI (deferred to v1.5 per DEC-047)
- Browser session service (Phase 4 — browser_use_* events specified)

### Not Yet Designed (Post-v1)

- Lease Critical Dates extraction agents and MCP tools
- Docling full pipeline (OCR, DocIR)
- Event engine (calendar, deadlines, alerts)
- Deterministic calculation engine (DSCR, LTV, ICR)
- Enterprise shell (SSO, RBAC, multi-tenant isolation)
- Insights table and organizational knowledge reuse (schema specified, Phase 2+)
- LiteLLM hot-swap implementation (DEC-042, v1.5)

---

## Competitive Positioning

### vs. Dify

| Dimension | Dify | NYQST DocuIntelli |
|-----------|------|-------------------|
| **Architecture** | Visual workflow builder, drag-drop nodes, API integrations | Code-first platform primitives, domain module registry, event-sourced kernel |
| **Target Market** | SMB, developer tools, general-purpose agent workflows | Regulated mid-cap enterprise, CRE/debt/compliance verticals |
| **Knowledge System** | Per-session RAG; no organizational learning | Cross-session Insights table (Phase 2); semantic retrieval by embedding; scope-based inheritance |
| **Provenance** | Limited; no content-addressed storage | Full: SHA-256 artifacts, manifest trees, pointer history, citation IDs, run ledger |
| **State Management** | Zustand + Jotai + Context (6 layers, complex) | Zustand + Context (3 layers, simpler) |
| **Streaming** | Vercel AI SDK native | Custom NDJSON SSE with heartbeat/watchdog; PG LISTEN/NOTIFY |
| **Conversation persistence** | Session-only | Full conversations table; multi-turn state |
| **Conversation branching** | Tree structure (ChatItemInTree) | parent_message_id FK (simpler, extensible) |
| **Billing** | OSS; no metering visible | Stripe + per-run cost_cents + token_usage metering built-in |
| **NYQST Advantage** | — | Content-addressed artifacts, full provenance, organizational insights, regulated enterprise features |
| **Dify Advantage** | — | Mature visual editor, broader OSS adoption, more connector catalog |

**Key finding**: Dify confirmed that pgvector scales at production volume (PostgreSQL validation). Dify is wrong on conversation persistence (sessions only) and multi-agent capability (limited vs. NYQST's Send() fan-out). Dify was used to validate 6 technical approaches while NYQST maintains 5 strategic advantages.

### vs. Codex (OpenAI)

| Dimension | Codex | NYQST DocuIntelli |
|-----------|-------|-------------------|
| **Scope** | 6 phases, 24-week timeline (Codex analysis says too long) | 7-week critical path to Research Module v1 |
| **Focus** | Code generation and developer productivity | Domain intelligence for regulated enterprise |
| **Deliverables** | Code, tests, PRs | Reports, websites, slides, documents, extraction outputs, calculations |
| **Trust model** | Developer reviews output | Provenance-first; every claim is citable; every calculation is auditable |
| **Competitive gap** | Cannot address regulated enterprise compliance requirements | Designed for it from first principles |

**Key finding**: Codex's 24-week estimate for comparable capability was flagged as too conservative. NYQST's 7-week critical path is achievable because the platform kernel already exists.

### vs. Superagent

Superagent is the reference implementation NYQST is studied against, not a competitor. Key differences:

| Dimension | Superagent (production) | NYQST DocuIntelli |
|-----------|------------------------|-------------------|
| **Domain** | General-purpose business research (CRE, financial) | Regulated enterprise with domain-specific vertical modules |
| **Markup** | GML (custom XML, 18 tags) | JSON AST → rehype (more general, Markdown-compatible) |
| **State management** | Recoil (atoms + selectors) | Zustand (simpler; DEC-035 confirmed correct choice) |
| **Entity versioning** | Implicit (download URL) | Explicit: Manifest trees + Pointer history |
| **Collaborative editing** | Single-user sessions | Planned: session sharing + role-based editing (Layer 3) |
| **Data provenance** | Citation links only | Full: artifact SHA-256 + run ledger + citation IDs |
| **PII handling** | Not visible | Planned: data residency + encryption (DEC-038) |
| **Rate limiting** | Not visible in frontend | Built-in: quota enforcement middleware (BL-013) |

**Parity status**: 7 of 9 Superagent event categories confirmed (✓). GENUI is PARTIAL (JSON AST vs GML — NYQST approach is superior). Domain modules (Research vs Lease CDs) are where NYQST diverges purposefully.

---

## Open Questions and Unresolved Items

### Needed Before Phase 1 Implementation

- [ ] **NDM v1 exact JSON schema** — Sketched in SUPERAGENT_PARITY_PLAN §3.4; needs formal Pydantic model definition with all node types and validation rules before report_generation_node can be built
- [ ] **Entity reference algorithm edge cases** — How to handle: same URL cited by two tasks? Tool outputs that generate entities? Deliverables that cite other deliverables? Citation ID collision?
- [ ] **MCP tool discovery filtering algorithm** — Context-scoped tool discovery is designed (ADR-008) but the filtering algorithm ("is tool X relevant to session Y?") needs specification
- [ ] **Policy evaluation order** — ADR-009 defines 4 templates; conflict resolution when a request matches multiple templates is unspecified
- [ ] **14-task parallel limit** — Observed in Superagent screenshots; is this a hard limit, soft heuristic, or adaptive? Sets fan-out queue sizing

### Deferred to v1.5+

- [ ] **LiteLLM hot-swap implementation** — DEC-042; design is provider-agnostic; code not yet written
- [ ] **Feature flag system UI** — DEC-047; backend only in v1 (`/api/feature-flags` endpoint)
- [ ] **Clarification UI** — DEC-047; `clarification_needed` event exists; frontend prompt UI deferred
- [ ] **Agent reasoning transparency** — Showing agent's step-by-step reasoning in UI
- [ ] **Collaborative session sharing** — Enterprise feature; role-based editing on shared sessions

### External Dependencies (Unresolved)

- [ ] **Search provider cost comparison** — Brave API pricing vs Tavily at production volume; determines which is default
- [ ] **Langfuse self-hosted deployment** — Sizing, backup strategy, retention policy; needed before Phase 5 production hardening
- [ ] **Neo4j Aura free tier limits** — Storage capacity and query limits; upgrade/fallback plan before PropSygnal starts
- [ ] **OpenSearch cluster sizing** — For production hybrid search; pgvector is dev fallback only

### Known Corrections Applied (Do Not Revert)

These are confirmed corrections to earlier documentation. All are synchronized in IMPLEMENTATION-PLAN v3.

1. **Chart library**: react-plotly.js (NOT Recharts) — DEC-048
2. **State management**: Zustand (NOT Recoil) — DEC-035; Recoil is Superagent's choice
3. **BL-022 dependency**: DataBrief MUST precede BL-001 (orchestrator); was previously listed as following
4. **BL-003 independence**: MCP Search Tools have NO dependency on BL-001 orchestrator; can build in parallel
5. **Migration 0005 split**: 0005a/b/c — NOT monolithic 0005 (DEC-052)
6. **DEC-015 split**: 0015a (backend JSON AST) + 0015b (frontend rehype-to-JSX) — was one decision
7. **LangGraph Studio rename**: Now called "LangSmith Studio" (rebranded October 2025) — DEC-049
8. **DEC-032 superseded**: MCP search abstraction (DEC-046) replaces earlier tool selection decision

---

*This document synthesizes 29 development repository documents (11 PRD + 10 ADR + 8 planning/reference), 150+ supporting analysis files, and 5 deep domain extraction documents. It represents the authoritative technical reference for the NYQST DocuIntelli platform as of 2026-02-20. All architectural decisions are locked. Specification is complete for Phases 0–2. The primary open question is NDM v1 exact JSON schema — resolve this before starting report_generation_node.*

*Last Updated: 2026-02-20*
*Source Manifest: /Users/markforster/AirTable-SuperAgent/docs/design-reconstruction/00-inventory/KNOWLEDGE-MAP.md*
