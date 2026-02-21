# Agent 2: V1 Platform Track Concept Decomposition

> **Scope**: 8 Platform Track epics from the V1 Build Pack
> **Source**: Extracted from Claude Code conversation transcript (session a59abd46)
>
> **Note**: V4 issue #4 has the title "8 epics with 43 concepts, 26 decisions" — these counts are arithmetically wrong. The analysis body correctly sums to 45 concepts and 29 decisions across the 8 epics. The title counts should not be used as reference totals.

---

Now I have comprehensive data on all 8 epics. Let me produce the full decomposition.

---

## EPIC-PLATFORM

### Concepts (primitive building blocks specified in the issues)

- **C1: Deterministic local startup** — One-command reproducible dev environment (`run.sh`, `validate.sh`, `start-worker.sh`, `.env.example`). Solves the "works on my machine" problem that blocks parallel agent work.

- **C2: arq Worker Registry Fix** — `WorkerSettings.functions` is evaluated at import time as a snapshot; registered jobs are never seen by a running worker. Fix makes the registry dynamic so workers pick up all registered functions at boot. Solves silent sync fallback where jobs appear to run but are actually executed inline.

- **C3: RunEvent Sequence Number Atomicity** — `append_event` under concurrency races on `sequence_num`, producing `IntegrityError` and breaking fan-out. Fix: atomic insert using a subquery (e.g., `SELECT COALESCE(MAX(sequence_num),0)+1 FROM run_events WHERE run_id=?`) with bounded retry on conflict. Ensures 10 concurrent appenders produce contiguous, unique sequence numbers 1..N.

- **C4: tenant_id on Run** — Run records have no direct tenant foreign key; billing, quotas, and audit must join through `created_by` user. Fix: add `tenant_id` FK column to the Run table, populate at run creation, add index for aggregation queries. Enables direct tenant-scoped run filtering.

- **C5: CI pipeline split (unit / integration / live)** — Three pytest marker tiers: `unit` (on push, no services), `integration` (on PR, full Docker services stack), `live` (manual-dispatch only, real API keys). Solves flaky CI caused by tests requiring real secrets or external services.

- **C6: Streaming protocol alignment (SSE / NDJSON + heartbeat + reconnect)** — Production streaming needs: configurable server-side heartbeat when idle; client watchdog with exponential backoff reconnect; consistent framing choice (SSE via EventSource or NDJSON over fetch); `done` event includes `has_async_entities_pending` flag; fixtures covering heartbeat and reconnect scenarios.

> **Correction**: STORY-STREAM-001 (#88) is grouped here but is not a child of EPIC-PLATFORM. It is at milestone M1 (Contracts locked + UI shell), labeled `phase:1-contracts`, and lists EPIC-PLATFORM as a *dependency* (not a parent). STORY-STREAM-001 is a contracts-phase story that depends on EPIC-PLATFORM primitives; it is a cross-epic dependency, not an EPIC-PLATFORM primitive itself.

### Decision Points

- **D1 (in C6): Streaming framing protocol**
  - R1a: SSE (EventSource) — native browser reconnect, standard protocol, but limited binary support and requires SSE-capable reverse proxy config
  - R1b: NDJSON over fetch — more control, works with any HTTP/2 proxy, but requires custom client reconnect logic
  - Likely: Issues reference "NDJSON/SSE" with parity; existing repo uses PG LISTEN/NOTIFY + SSE; keep SSE for browser clients, NDJSON as server-to-server option. The streaming story (STORY-STREAM-001) says "choose framing" implying it is not yet locked.

- **D2 (in C5): CI service orchestration**
  - R2a: `docker compose` in CI for Postgres/Redis/MinIO/OpenSearch
  - R2b: Managed CI services (GitHub Actions service containers per service)
  - Likely: docs/09_CI_CD.md explicitly lists Docker services — Postgres, Redis, MinIO, OpenSearch — implying `docker compose` or service containers.

- **D3 (in C3): Atomic sequence_num strategy**
  - R3a: Subquery `MAX(sequence_num)+1` with retry on unique constraint violation (optimistic)
  - R3b: Pessimistic row lock on run record
  - Likely: Issues say "atomic insert with sequence subquery, with bounded retries" — optimistic with retry.

### Dependencies

- C1 has no upstream dependencies (first gate)
- C2 depends on: Redis running (C1)
- C3 depends on: existing DB schema for `run_events`
- C4 depends on: existing DB migration tooling (Alembic)
- C5 depends on: C1 (services startable), C2 (worker testable), C3 (concurrency testable)
- C6 depends on: EPIC-CONTRACTS (run_event schema, TASK-CON-002)
- External deps: None — this is the root epic

### Key Implementation Insights

- Worker fix pattern: `WorkerSettings.functions` must be a callable/dynamic reference, not a list literal evaluated at import time
- `append_event` fix: `INSERT INTO run_events (..., sequence_num) SELECT ..., COALESCE(MAX(sequence_num),0)+1 FROM run_events WHERE run_id=$1` — uniqueness constraint on `(run_id, sequence_num)` causes a serializable conflict that triggers retry
- `tenant_id` migration: requires backfill from `created_by` → user → tenant; must be reversible
- Script layout: `scripts/dev/run.sh`, `scripts/dev/validate.sh`, `scripts/dev/start-worker.sh`
- `validate.sh` must cover: deps install, migrations, `/health/ready` returns 200, `pytest -m unit`, `pytest -m integration`, `npm run typecheck`, `npm run build`
- CI jobs in `ci.yml`: (1) backend lint+unit (ruff, mypy, pytest -m unit), (2) backend integration (docker services + migrations + pytest -m integration), (3) contracts (JSON schema + fixture validation + TS typecheck), (4) frontend (typecheck + vitest)
- Live workflow `live.yml` is `workflow_dispatch` only — never automated
- `e2e.yml` runs on nightly schedule and release branches — executes Playwright end-to-end tests (specified in docs/09_CI_CD.md; omitted from original analysis)

> **Correction**: Original analysis only listed `ci.yml` and `live.yml`. docs/09_CI_CD.md specifies three pipelines; `e2e.yml` (nightly + release branches, Playwright) was omitted.

---

## EPIC-FE-SHELL

### Concepts (primitive building blocks specified in the issues)

- **C1: App shell layout** — Persistent left nav + top bar project selector + route placeholders as the container for all module screens. Routes: Projects, Apps, Studio, Documents, CRM, Models, Dashboards, Workflows, Runs, Settings. Solves screen isolation — without a shell, teams build pages that don't integrate.

- **C2: Project selector (context state)** — Top bar component that changes active project context in frontend state (Zustand store). At minimum switches `project_id` in state; later wires to API. Scopes all subsequent data fetches.

- **C3: Loading / empty / error skeletons** — Every route renders three standard states: loading skeleton, empty state, error boundary. Enforces UX consistency and prevents blank screens during backend integration.

- **C4: Apps gallery + detail screens (fixture-driven)** — Apps gallery: cards showing type/status/triggers/last run. App detail with tabs: Run (inputs + context toggles + run button), Configure, Runs (history list), Outputs (artifacts list), Permissions. All backed by contract fixtures initially, swapping to live API later.

- **C5: Runs list + Run detail timeline (fixture-driven)** — Runs list: kind/status/duration/cost. Run detail: ordered event timeline renderer consuming `run_event` fixture streams. Must handle unknown event types gracefully. Sidebar shows produced artifacts. Error/warning events visually distinct.

- **C6: Mockup dev route** — `/mockups` route (dev-only, excluded from prod build) that renders `NyqstPortalMockupV2.tsx` as an in-app reference. Solves designer-developer gap by keeping the reference implementation visible and compilable.

- **C7: TypeScript type generation pipeline** — JSON schema → TS types pipeline (e.g., `json-schema-to-typescript`) so frontend types stay in sync with contracts. CI diff check fails if generated output differs from committed files. Dev-time runtime assertion helpers for event payload shapes.

> **Correction**: C7 (TypeScript type generation + dev assertions) duplicates STORY-CON-005, which belongs only to EPIC-CONTRACTS (labeled `track:testing`, `phase:1-contracts`). STORY-CON-005 has been removed from EPIC-FE-SHELL; see EPIC-CONTRACTS C6 for the authoritative entry.

### Decision Points

- **D1 (in C4 + C5): Fixture-first vs. API-first screen development**
  - R1a: Build screens against contract fixture data; swap to API when ready — enables parallel FE/BE work
  - R1b: Build screens directly against API — blocks frontend on backend
  - Likely: All stories explicitly specify "fixture-driven" then "swap to API" — fixture-first is the mandated pattern

- **D2 (in C7): Type generation approach**
  - R2a: `json-schema-to-typescript` (quicktype or json-schema-to-ts) to auto-generate from JSON schemas
  - R2b: Hand-author TS types matching JSON schema
  - Likely: STORY-CON-005 says "typegen pipeline (JSON schema → TS)" — automated generation is intended; CI diff check enforces freshness. See EPIC-CONTRACTS C6 (STORY-CON-005 lives there, not here).

- **D3 (in C1): Routing library**
  - R3a: React Router v6 (TanStack Router alternative)
  - R3b: TanStack Router
  - Likely: Not explicitly stated in issues; existing Vite + React stack likely already has one; follow existing repo convention

### Dependencies

- C1 depends on: EPIC-CONTRACTS (stable route map requires knowing module list)
- C4 depends on: C1 (shell), TASK-CON-003 (app + context_pack fixtures)
- C5 depends on: C1 (shell), TASK-CON-002 (run_event fixtures)
- C6 depends on: C1 (shell routes exist)
- C7 depends on: TASK-CON-002, TASK-CON-003, TASK-CON-004
- External deps: EPIC-CONTRACTS (must be locked first)

### Key Implementation Insights

- Reference implementation: `mockups/NyqstPortalMockupV2.tsx` — integrate as `/mockups` route compiled against repo shadcn paths
- Test tooling: Vitest for component tests, Playwright for smoke navigation
- App type enum (from schema): `VIEW`, `AGENT`, `ANALYSIS`, `WORKFLOW`
- App detail tabs: Run / Configure / Runs / Outputs / Permissions
- Run detail must handle unknown event types gracefully (forward-compatible renderer)
- Runs list columns: kind, status, duration, cost
- Route names from epic AC: Projects, Apps, Studio, Documents, CRM, Models, Dashboards, Workflows, Runs, Settings
- Project selector changes `project_id` in Zustand store; all data hooks derive from this

---

## EPIC-GENUI

### Concepts (primitive building blocks specified in the issues)

- **C1: Component Registry** — A registry of at least 20 named UI primitives (e.g., Text, Table, Badge, Card, List, Metric, Divider, Chart, Citation, etc.) addressable by string key. Each primitive has a strict descriptor schema defining allowed props and binding expressions. Descriptors validated at runtime in dev (fail fast). Solves the problem that hard-coded components cannot support arbitrary agent output shapes.

- **C2: Descriptor/Renderer Engine** — Takes a JSON descriptor tree and renders it to React. Supports conditional rendering, repeat/map patterns, and data bindings (property references from a data context object). The engine is the "interpreter" — GenUI descriptors are like a restricted DSL. Decouples agent output format from React component tree.

- **C3: GML Tag Pipeline (rehype-to-JSX)** — Agent outputs arrive as markdown with embedded GML tags (custom XML-like tags: e.g., `<nyqst:chart>`, `<nyqst:table>`, `<nyqst:citation>`). Pipeline: `unified` → `rehype-parse` → GML tag mapping → React components via `rehype-react`. At least 10 core tags in v1. Unsafe HTML sanitized (no raw `<script>`, `<iframe>` etc). Rendering errors degrade gracefully (show error placeholder, not crash). Solves: agent markdown outputs need to embed interactive components.

- **C4: Chart Rendering (Plotly.js / react-plotly.js)** — Chart components driven by JSON descriptors specifying chart type + data + layout. Required types for early dashboards: at minimum 5 (bar, line, scatter, pie, table/heatmap). Themed consistently with app (token mapping from shadcn theme to Plotly layout). Supports responsive layout. Solves: dashboards and deliverables need charts that are serializable and reproducible.

### Decision Points

- **D1 (in C4): Chart library**
  - R1a: Plotly.js via `react-plotly.js` — full featured, serializable config, supports 3D, heavy bundle
  - R1b: Recharts — lighter, React-native, less config-driven
  - Likely: Memory doc explicitly states "Chart library: Plotly.js (react-plotly.js) — Recharts references are WRONG." STORY-GENUI-003 says "Plotly or chosen lib" but existing decision is Plotly.

- **D2 (in C3): GML rendering approach**
  - R2a: `rehype-to-JSX` pipeline (unified/rehype-parse/rehype-react stack)
  - R2b: Custom markdown parser with tag extensions
  - Likely: STORY-GENUI-002 explicitly says "rehype-to-JSX pipeline mapping GML tags to components"; library list includes `unified`, `rehype-parse`, `rehype-react`

- **D3 (in C1): Descriptor schema format**
  - R3a: JSON Schema validated descriptors (strict, additionalProperties: false)
  - R3b: TypeScript interfaces only (no runtime validation)
  - Likely: STORY-GENUI-001 says "Descriptors are validated at runtime in dev" — implies JSON Schema or Zod runtime validation

- **D4 (in C2): Renderer placement**
  - R4a: Separate `ReportPanel` component for GML output (distinct from chat panel)
  - R4b: Inline in existing `CitationAwareText` / output panels
  - Likely: Memory doc says "GML in separate ReportPanel" (DEC-043)

### Dependencies

- C1 depends on: EPIC-FE-SHELL (shell must exist for renderer to live in), EPIC-CONTRACTS
- C2 depends on: C1 (registry must exist first)
- C3 depends on: C1 (components must be registered to map tags to)
- C4 depends on: C1 (registry entry for Chart component)
- External deps: EPIC-FE-SHELL, EPIC-CONTRACTS; EPIC-DELIVERABLES and EPIC-DOCUMENTS consume GenUI output

### Key Implementation Insights

- Library deps: `react-plotly.js`, `unified`, `rehype-parse`, `rehype-react` — must be added to frontend package.json
- GML tag set to support at minimum 10 core tags in v1 (exact tags: `<nyqst:chart>`, `<nyqst:table>`, `<nyqst:citation>`, `<nyqst:metric>`, `<nyqst:badge>`, `<nyqst:card>`, `<nyqst:list>`, `<nyqst:link>`, `<nyqst:heading>`, `<nyqst:alert>` — inferred from 18-tag analysis in memory)
- Descriptor schema must explicitly list all allowed props; extra props rejected in dev
- Renderer must treat unknown descriptors as passthrough/error component — never crash
- Chart descriptors must be serializable — stored as part of deliverable artifacts
- Acceptance: registry supports "at least 20 primitives used in spec"; GML handles "at least 10 core tags"
- Test approach: Vitest component tests for each primitive; unit tests for tag parser; E2E for streamed GenUI blocks in output panel

---

## EPIC-ORCH

### Concepts (primitive building blocks specified in the issues)

- **C1: PlanSet / Plan / PlanTask Schema + Persistence** — First-class planning objects persisted to DB and linked to `run_id`. PlanSet contains one or more Plans; Plan contains ordered PlanTasks. Tasks have stable IDs and explicit ordering (linked-list or positional index). Updates appended as events and reconcilable into current plan state. Enables audit replay and UI plan viewer.

- **C2: LangGraph Fan-Out Orchestrator** — LangGraph `StateGraph` with: planning node (emits `PlanSet`), fan-out via `Send()` or conditional routing to concurrent subagent nodes (per-node async DB sessions from shared `async_sessionmaker`), aggregation node. Each node uses `with_structured_output()` for all JSON outputs. Runs end-to-end on fixtures without external calls. Reference app: Research Notebook.

- **C3: Event Emission Chain** — Orchestrator emits structured `RunEvent` objects covering: `planning_started`, `task_update` (per subagent step), `pending_sources`, `references_found`, `tool_call`, `tool_result`, `report_preview_delta`, `report_preview_done`, `clarification_needed`, `run_done`. Events map to `run_event.schema.json` envelope.

- **C4: Clarification Flow** — A run can pause by emitting `clarification_needed` event with prompt text. UI renders prompt and collects user response. Response submitted via API (`POST /runs/{run_id}/clarification`). Run resumes from paused state. Audit log includes prompt + response. Requires LangGraph interrupt/resume capability.

- **C5: Report Preview Streaming (delta + done semantics)** — Server streams `report_preview_delta` events (incremental text chunks). Client accumulates into buffer. On `report_preview_done` event, client replaces buffer with canonical final content (no duplication). Final report stored as artifact linked to run. Preview can be pinned to Studio.

### Decision Points

- **D1 (in C2): Fan-out mechanism**
  - R1a: LangGraph `Send()` for true dynamic fan-out (sends to named node with per-task state)
  - R1b: Parallel Python tasks / asyncio.gather outside LangGraph
  - Likely: Issues say "fan-out tasks run concurrently with per-node sessions" and reference `Send()` — but memory doc notes "No Send() fan-out — primary platform gap." The ORCH epic explicitly targets implementing this. Send() is the target design.

- **D2 (in C2): Per-node DB session strategy**
  - R2a: Per-node async sessions from shared `async_sessionmaker` (DEC-051)
  - R2b: Single session passed through graph state
  - Likely: DEC-051 is decided: "Per-node async sessions from shared async_sessionmaker"

- **D3 (in C2): Structured output**
  - R3a: LangChain `with_structured_output()` for all JSON nodes (DEC-050)
  - R3b: Manual JSON parsing with retry
  - Likely: DEC-050 is decided: `with_structured_output()` for all JSON nodes

- **D4 (in C4): Run pause/resume mechanism**
  - R4a: LangGraph built-in interrupt/resume (checkpoint-based)
  - R4b: Custom state machine in DB (run status = AWAITING_CLARIFICATION)
  - Likely: LangGraph has native checkpoint-based interrupt support; issues describe `clarification_needed` event + resume API — implies LangGraph interrupt pattern

- **D5 (in C1): PlanTask ordering strategy**
  - R5a: Linked-list (each task references `next_task_id`)
  - R5b: Explicit positional index (`position: int`)
  - Likely: STORY-ORCH-001 says "linked list or explicit ordering" — not decided; positional index is simpler and easier to query

### Dependencies

- C1 depends on: EPIC-CONTRACTS (run_event schema, app schema), EPIC-ORCH (orchestration framework)

> **Correction**: Original analysis stated STORY-ORCH-001 depends on EPIC-PLATFORM. The actual issue #89 body specifies `Depends on: EPIC-ORCH, EPIC-CONTRACTS` — there is no explicit EPIC-PLATFORM dependency listed. Corrected to match the actual issue.
- C2 depends on: C1 (PlanSet must exist), STORY-AGENT-002 (MCP tool runner), STORY-APPS-003 (app runner)
- C3 depends on: C1 (schemas), TASK-CON-002 (run_event fixtures)
- C4 depends on: C2 (orchestrator must be running), STORY-FE-003 (Runs screens)
- C5 depends on: C2 (orchestrator emits deltas), TASK-CON-002
- External deps: EPIC-PLATFORM, EPIC-CONTRACTS, EPIC-AGENTS (referenced but not in scope of 8-epic set)

### Key Implementation Insights

- Existing graph: `ResearchAssistantGraph` (3-node StateGraph) — extend, do not replace
- LangGraph pattern: planning node → `Send()` fan-out to `subagent` node N times → aggregation node → report generation node
- `with_structured_output()` usage: wrap LLM calls for planning node (outputs `PlanSet`) and aggregation node (outputs structured report)
- Event emission: each node calls `await append_event(session, run_id, event_type, payload)` — async, atomic with sequence fix from EPIC-PLATFORM
- Clarification: LangGraph `interrupt()` at clarification decision point; stored checkpoint in Postgres (LangGraph checkpointer); resume via `POST .../clarification` which calls `graph.ainvoke(Command(resume=response))`
- Delta streaming: backend yields `report_preview_delta` events with `{"delta": "chunk"}` payload; client concatenates; `report_preview_done` has `{"final": "full_text"}` — client replaces buffer with final
- Test acceptance: orchestrator on fixtures (no real LLM calls) yields deterministic event stream; contract tests validate each event payload; E2E: plan viewer updates real-time

---

## EPIC-DOCUMENTS

### Concepts (primitive building blocks specified in the issues)

- **C1: Bundle + BundleVersion data model** — `bundles` table (bundle_id, project_id, tenant_id, name, bundle_type, tags) and `bundle_versions` table (bundle_version_id, bundle_id, version: integer, status: PENDING/PROCESSING/COMPLETED/FAILED, artifact_ids[], ingest_run_id, extraction_output_artifact_id, index_status, metrics). Version increments enforced per bundle (no gaps). Links to artifact storage and ingest runs. Migrations reversible.

- **C2: Upload API + Artifact Storage** — `POST /projects/{project_id}/bundles/{bundle_id}/versions` accepts file upload, creates `bundle_version` record + stores raw files as artifacts (S3/MinIO with per-tenant prefix isolation). Deduplication by content hash — hash-addressed storage surfaces duplicates. Large upload limits configurable and enforced with clear error messages. All writes strictly tenant/project scoped.

- **C3: Ingest Pipeline (parse → normalize → chunk/index)** — Async worker job (arq) triggered on bundle version creation. Emits structured RunEvents (start/step/progress/complete) for observability. Pipeline stages: file parsing (PDF/DOCX/HTML/CSV), text normalization, chunking, vector index upsert (OpenSearch or pgvector). Normalized text artifact created and linked to `bundle_version`. Pipeline is resumable and idempotent.

- **C4: Extraction Pipeline (structured JSON + evidence spans)** — Stage following ingest. Runs LLM extraction producing structured JSON artifact (schema varies by bundle_type). Creates `Evidence` records with: source type (`BUNDLE_VERSION`), bundle_version_id, artifact_id, page, offset_start, offset_end, content, confidence (0..1), run_id. Failures degrade gracefully (partial output + error events surfaced). Extraction is idempotent and re-runnable.

- **C5: Diff Engine (document / extraction / impact)** — Three diff dimensions computed across bundle versions: (1) document diff — changed text passages; (2) extraction diff — field-level deltas and confidence changes between structured JSON outputs; (3) impact diff — stale insights and changed model fields downstream. Diff outputs representable as artifacts and pinneable to canvas. Exposed via `GET /bundles/{bundle_id}/compare?vA=&vB=`.

- **C6: Documents UI** — Bundles list with basic search/filter. Bundle detail with version list and processing status. Compare view with diff tabs: doc / extraction / impact. Pin-to-Studio button (calls stub handler initially). Backed by contract fixtures initially, wired to API in integration phase.

### Decision Points

- **D1 (in C3): Vector index backend**
  - R1a: OpenSearch — full-text + vector hybrid, matches CI service list (OpenSearch in docker compose)
  - R1b: pgvector — no extra service, simpler ops, PostgreSQL-native
  - Likely: STORY-DOCS-003 says "(OpenSearch or pgvector)" — undecided at issue level; CI docs list OpenSearch in service containers, suggesting OpenSearch is the target

- **D2 (in C2): Artifact storage backend**
  - R2a: MinIO (local dev) with S3-compatible SDK (boto3/aiobotocore)
  - R2b: Local filesystem for dev, S3 for prod
  - Likely: CI docs list MinIO in docker compose services; existing repo uses MinIO — S3-compatible abstraction with MinIO locally

- **D3 (in C4): Extraction model**
  - R3a: LLM extraction (gpt-4o-mini default, base_url override for hot-swap)
  - R3b: Rule-based extraction only
  - Likely: Platform uses ChatOpenAI with base_url override; LLM extraction is the target

- **D4 (in C5): Diff algorithm**
  - R4a: Myers diff (character/word level) for document text; field-level JSON diff for extraction
  - R4b: Semantic diff (embedding similarity)
  - Likely: Issues specify "document diff highlights changed passages" and "field-level deltas" — Myers-style text diff + structural JSON diff; semantic diff is a future enhancement

### Dependencies

- C1 depends on: EPIC-PLATFORM (migrations, DB), TASK-CON-004 (bundle schema fixtures)
- C2 depends on: C1 (bundle_version table must exist)
- C3 depends on: C2 (upload must complete first), TASK-PLAT-P0-ARQ (worker must work)
- C4 depends on: C3 (normalized text must exist), EPIC-INTEL (evidence schema/storage)
- C5 depends on: C4 (extraction outputs from two versions), EPIC-MODELS (model impact diff)
- C6 depends on: STORY-FE-001 (shell), TASK-CON-004, C1 (backend API must exist for integration)
- External deps: EPIC-CONTRACTS, EPIC-PLATFORM; C4 pulls in EPIC-INTEL; C5 pulls in EPIC-MODELS

### Key Implementation Insights

- Bundle version status FSM: `PENDING → PROCESSING → COMPLETED | FAILED`
- Content-addressed artifact storage: SHA-256 hash of file content used as storage key; deduplication is an index lookup before write
- Ingest is a worker job: `ingest_bundle_version(bundle_version_id)` enqueued on version creation; emits RunEvents including progress percentage
- Evidence schema fields: `source_type`, `bundle_version_id`, `artifact_id`, `page`, `offset_start`, `offset_end`, `content`, `confidence`, `run_id`
- Document diff: expose as side-by-side or unified diff with highlighted changed passages; store as artifact for later pinning
- Extraction diff must show: which fields changed, previous vs. new value, confidence delta
- Impact diff must list: insights with stale=true, model fields whose source evidence changed
- Golden fixture set: PDF/DOCX/HTML/CSV fixture docs for integration tests; v1 + v2 versions for diff tests
- API diff endpoint: `GET /projects/{project_id}/bundles/{bundle_id}/compare?vA=1&vB=2`

---

## EPIC-DELIVERABLES

### Concepts (primitive building blocks specified in the issues)

- **C1: Deliverable Type Selection UI** — User selects a deliverable type (report, website, dashboard export, etc.) from a menu/dialog and triggers generation. The selection UI shows available types per app context. Calls `POST /projects/{project_id}/deliverables` which creates a Run and returns run_id + deliverable_id. Generation events are visible in the run timeline.

- **C2: Report Generation Pipeline + Artifact Persistence** — Backend pipeline that generates a report artifact from orchestrator outputs. Preview streams via `report_preview_delta` events (see EPIC-ORCH C5). Final artifact stored (likely Markdown or rendered HTML/PDF) and linked to the run. `report_preview_done` event triggers artifact write. Artifact is viewable and downloadable via signed URL.

- **C3: Website Co-Generation with Pending Entities Flag** — Some deliverables (website generation) require async sub-jobs that cannot complete synchronously (e.g., entity extraction jobs kicked off during report). The `done` event includes `has_async_entities_pending: true` when these sub-jobs are in flight. Frontend polls or listens until all pending entities resolve. Implemented as arq async jobs. UI shows a pending indicator rather than marking complete prematurely.

- **C4: Deliverable Versioning + Diff + Pin-to-Studio** — Each generation run creates a new deliverable version. Deliverable versions are diffable (content diff between versions). Versions can be pinned to Studio infinite canvas for side-by-side comparison. Enables iterative refinement workflow.

### Decision Points

- **D1 (in C2): Report format**
  - R1a: Markdown stored as artifact, rendered via GML/rehype pipeline in frontend
  - R1b: Pre-rendered HTML stored as artifact, displayed in iframe (DEC-044 says website iframe-only v1)
  - Likely: Reports rendered via GML/rehype pipeline (EPIC-GENUI); websites via iframe (DEC-044). Two different rendering paths.

- **D2 (in C3): Async pending resolution mechanism**
  - R2a: Frontend polls `GET /deliverables/{id}` until `pending_entities: false`
  - R2b: SSE stream kept open until all entities resolve
  - Likely: STORY-DELIV-002 says "UI polls until complete" — polling is the specified approach

- **D3 (in C1): Deliverable type taxonomy**
  - R3a: Fixed enum: REPORT, WEBSITE, DASHBOARD, EXPORT
  - R3b: App-defined output mappings (from `app.schema.json` `OutputMapping.output_type`)
  - Likely: App schema has `OutputMapping.output_type` enum: `NOTEBOOK_PAGE`, `CANVAS_BLOCK`, `EVIDENCE`, `INSIGHT`, `MODEL_UPDATE`, `DASHBOARD_REFRESH`, `ARTIFACT` — deliverables are a separate concept mapped at the `/deliverables` endpoint

### Dependencies

- C1 depends on: EPIC-ORCH (run creation), STORY-APPS-003 (app runner), EPIC-GENUI (preview rendering)
- C2 depends on: EPIC-ORCH C5 (report preview delta events), TASK-CON-002 (event schema)
- C3 depends on: TASK-PLAT-P0-ARQ (worker must be reliable), TASK-CON-002
- C4 depends on: EPIC-GENUI (rendering), EPIC-ORCH (run linkage)
- External deps: EPIC-ORCH (hard dependency — orchestrator must run before deliverables can generate), EPIC-GENUI, EPIC-APPS (referenced STORY-APPS-003)

### Key Implementation Insights

- Deliverable API: `POST /projects/{project_id}/deliverables` creates Run + deliverable record; returns `{deliverable_id, run_id}`
- Download: `GET /deliverables/{id}/download` returns signed URL (not raw bytes in response body)
- `has_async_entities_pending` field: present in `done` event payload when co-generation jobs are still in flight; frontend must not mark deliverable "complete" until this is false
- Co-generation jobs scheduled via arq at end of main pipeline run; each job emits its own RunEvents
- Acceptance criteria: "Website co-generation supported with async pending entities flag" — this is the core distinguishing pattern for websites vs. reports
- Pin-to-Studio: deliverable version stored as canvas block; provenance inspector shows run_id + inputs

---

## EPIC-CONTRACTS

### Concepts (primitive building blocks specified in the issues)

- **C1: Contract Governance Rules** — Formal versioning policy for all schemas: `contract_version` field on every schema; backward-compatible additions increment minor; breaking changes increment major. `contracts/00_index.md` defines the policy. Fixtures folder with golden examples. Contract test runner in CI. Change discipline: update JSON schema + fixtures + Pydantic models + frontend types + tests — all in same PR.

- **C2: run_event schema + fixtures** — `contracts/run_event.schema.json` defines the event envelope: `contract_version`, `run_id`, `sequence_num` (int ≥ 1), `timestamp` (ISO datetime), `event_type` (string), `payload` (object). Fixtures: at minimum 3 NDJSON/SSE fixture streams: ingest run, app run, validation run. Frontend must render fixture stream without runtime errors.

- **C3: app + context_pack schemas + fixtures** — `app.schema.json` defines full app definition with type enum (`VIEW/AGENT/ANALYSIS/WORKFLOW`), status (`DRAFT/PUBLISHED/ARCHIVED`), inputs (7 field kinds), context_pack reference, engine (4 engine types), outputs array (`OutputMapping`), triggers (3 types). `context_pack.schema.json` defines sources (project_context_blocks, bundle_versions, crm_entities, model_versions, web_enabled, skills_enabled) + permissions (allow_web, allow_write_models, allow_create_artifacts). At minimum 4 template fixtures: Research Notebook, Lease Review, Weekly Refresh, Bundle Review Queue.

- **C4: bundle/version + evidence + insight schemas + fixtures** — `bundle.schema.json`: bundle with versions array, each version has status FSM, artifact_ids, ingest_run_id, extraction_output_artifact_id. `evidence.schema.json`: source types (`BUNDLE_VERSION/WEB_SNAPSHOT/USER_NOTE`), content, confidence 0..1, run linkage. `insight.schema.json`: statement, status lifecycle (`DRAFT/REVIEWED/PUBLISHED/ARCHIVED`), evidence_ids array, stale boolean, linked_crm_entity_ids, linked_model_fields. Fixtures include v1/v2 bundle + evidence with spans + insight with stale flag example.

- **C5: Additional schemas** — `crm.schema.json` (entity_type enum: COMPANY/PERSON/ASSET/CONTRACT/OTHER, attributes object, relationships array with to/relationship_type), `model.schema.json` (versioned domain model with schema + rules + validation_runs), `workflow.schema.json` (nodes with TRIGGER/ACTION/CONDITION types, ops: RUN_APP/INGEST_BUNDLE/RUN_VALIDATION/NOTIFY, edges with condition, triggers).

- **C6: TypeScript type generation + dev assertions** — Automated pipeline: JSON Schema → TS types. CI diff check fails if generated types differ from committed output. Dev-time runtime assertion helpers validate event payload shapes at runtime in dev mode (fail fast, not silent).

### Decision Points

- **D1 (in C1): Schema source of truth**
  - R1a: Pydantic models as source → JSON Schema exported (via `model.model_json_schema()`)
  - R1b: JSON Schema files as authoritative → Pydantic generated from them
  - Likely: `docs/08_CONTRACTS_OVERVIEW.md` says "Pydantic models as the source of truth; JSON Schema exported from Pydantic **or authored directly**" — Pydantic → JSON Schema → TS types is the primary direction, but JSON Schema may also be authored directly. Original analysis omitted the "or authored directly" alternative.

- **D2 (in C6): TS type generation tool**
  - R2a: `json-schema-to-typescript` (npm package)
  - R2b: `quicktype` (multi-language)
  - Likely: STORY-CON-005 says "Add a typegen pipeline (JSON schema → TS)" — tool not specified; `json-schema-to-typescript` is the standard choice

- **D3 (in C2): Fixture stream format**
  - R3a: NDJSON files (one JSON object per line)
  - R3b: SSE-formatted text files
  - Likely: TASK-CON-002 says "NDJSON/SSE" — both formats as fixtures, NDJSON for programmatic testing, SSE for browser-realistic testing

### Dependencies

- C1 has no upstream dependencies — must be first
- C2 depends on: C1 (governance rules must exist)
- C3 depends on: C1
- C4 depends on: C1
- C5 depends on: C1
- C6 depends on: C2, C3, C4 (schemas must exist before typegen), EPIC-FE-SHELL (frontend must exist to use types)
- External deps: EPIC-PLATFORM (must be baseline stable before contracts locked, so CI can run contract tests)

### Key Implementation Insights

- All 9 schemas defined and present: app, context_pack, bundle, run_event, evidence, insight, crm, model, workflow
- All schemas use `contract_version: "1.0.0"` (const)
- `app.schema.json` uses `$ref: "context_pack.schema.json"` for context_pack field — cross-schema reference
- Fixture discipline: every schema change requires fixture update in same PR; golden fixtures are versioned in `fixtures/` folder
- Backend implementation pattern: Pydantic model → `model_json_schema()` → save to `contracts/` → run contract tests
- Frontend implementation pattern: run typegen script → commit output → CI diff check catches drift
- App engine types: `AGENT/WORKFLOW/QUERY/PIPELINE` — maps to different runtime handlers
- Trigger types across app + workflow: `MANUAL/SCHEDULE/EVENT`; event type examples: `BUNDLE_VERSION_CREATED`, `VALIDATION_FAILED`
- API conventions (from `api_routes.md`): all routes tenant-scoped by auth; project-scoped with `project_id`; pagination via `?limit=&cursor=`; streaming at `/runs/{run_id}/events/stream`
- CI contract job: validate JSON schemas themselves (JSON Schema meta-validation), validate fixtures against schemas, verify TS compile

---

## EPIC-PROD

### Concepts (primitive building blocks specified in the issues)

- **C1: Containerization (API + Worker Dockerfiles)** — Separate Dockerfiles for `api` service and `worker` service. Entrypoints handle environment config via env vars (12-factor). Production compose or k8s manifests. Health endpoints (`/health/ready`) and readiness checks. `docker build` must succeed in CI as a build gate. Containers must run against external services (Postgres, Redis, MinIO, OpenSearch) without local docker-compose infra.

- **C2: Observability Baseline (structured logs + metrics + traces)** — OpenTelemetry (or equivalent) instrumentation. Every HTTP request gets a correlation ID (propagated to logs and events). Runs have trace/span linkage (run_id → span). Key metrics exported: ingest duration, run duration, SSE latency, error rates. Structured JSON logging (not print statements). Dashboards for key metrics (Grafana or equivalent). Backend: trace appears in collector; metrics endpoint returns data.

- **C3: Security Baseline (rate limits, payload size limits, SSRF)** — Upload size limits enforced (configurable via env var, default e.g. 50MB). Rate limiting on expensive endpoints (upload, run creation, LLM-hitting routes). Outbound HTTP (web tools / MCP) blocks private IP ranges (10.x, 172.16.x, 192.168.x, 127.x, 169.254.x) and disallowed schemes (file://, gopher://). Strict URL validation with timeouts. SAST + dependency scanning in CI.

- **C4: Backup/Restore + Retention Policy** — Automated Postgres backups in staging (pg_dump or WAL streaming). Object storage backup/sync for MinIO/S3. Restore procedure documented and tested (DR drill). Retention policy defined for: run records, run_events, artifacts (e.g., keep 90 days for runs, indefinite for artifacts with explicit delete). Runbook documents step-by-step restore to staging.

- **C5: Performance Smoke Tests (SLOs)** — Minimum load test harness: ingest 100 fixture docs (measure time-to-first-index, extraction throughput, memory peak). SSE latency under 20 concurrent run streams. Performance gates in CI for release branches. Capacity guidance documented.

  > **Note**: C5 is synthesized from docs and epic acceptance criteria — no dedicated story exists for Performance Smoke Tests.

- **C6: Secrets Management + Environment Config** — No real secrets in repo. CI uses GitHub Actions secrets. Staging/prod uses secret manager (Vault or cloud-native). `.env.example` documents all required env vars. `REDIS_URL` required (no silent default to localhost). `DATABASE_URL`, `S3_*`, `OPENAI_API_KEY` all required.

  > **Note**: C6 is synthesized from docs and epic acceptance criteria — no dedicated story exists for Secrets Management.

- **C7: Migration Safety** — Every migration has `upgrade` + `downgrade`. CI includes migration check: apply to fresh DB, run minimal queries, downgrade. Data backfill notes required when migration modifies existing data. Migration review is a PR gate (same weight as code review).

  > **Note**: C7 is synthesized from docs and epic acceptance criteria — no dedicated story exists for Migration Safety. Only C1 (STORY-PROD-001) through C4 (STORY-PROD-004) have dedicated backing stories.

### Decision Points

- **D1 (in C2): Observability stack**
  - R1a: OpenTelemetry SDK → Jaeger/Tempo for traces, Prometheus for metrics, Loki for logs
  - R1b: Datadog / New Relic SaaS agent
  - Likely: STORY-PROD-002 says "OpenTelemetry (or equivalent)" — open source stack implied; self-hosted preferred for a regulated enterprise product. Langfuse self-hosted also mentioned (DEC-045) for LLM-specific tracing.

- **D2 (in C1): Container orchestration**
  - R2a: Docker Compose (production-style compose with resource limits)
  - R2b: Kubernetes with Helm chart
  - Likely: Issues say "docker compose/k8s manifests as chosen" — not decided. Minimum is Docker Compose for staging; k8s optional. Staging deploy spec says "rolling deploy with health checks."

- **D3 (in C3): Rate limiting implementation**
  - R3a: Redis-backed rate limiting (token bucket / sliding window via Redis)
  - R3b: Middleware-level rate limiting (slowapi for FastAPI)
  - Likely: Redis is already in the stack; Redis-backed rate limiting (slowapi + Redis backend) is natural

- **D4 (in C4): Backup mechanism**
  - R4a: `pg_dump` cron job + S3 upload
  - R4b: WAL streaming to S3 (pg_basebackup + WAL archiving)
  - Likely: Issues say "backup strategy for Postgres and object storage" without specifying; pg_dump is simpler for staging; WAL streaming for production

### Dependencies

- C1 depends on: all feature epics complete (EPIC-DOCUMENTS, EPIC-STUDIO, EPIC-APPS, EPIC-MODELS, EPIC-WORKFLOWS per epic spec)
- C2 depends on: C1 (containers must exist to instrument)
- C3 depends on: STORY-AGENT-002 (MCP HTTP tool must exist — SSRF applies there), C1
- C4 depends on: C1 (containers running for DR drill)
- C5 depends on: EPIC-DOCUMENTS (ingest pipeline must exist to load test), C1
- C6 depends on: EPIC-PLATFORM C1 (env scripts), all feature epics that introduce new env vars
- C7 depends on: EPIC-PLATFORM (migration toolchain), all feature epics that add migrations
- External deps: EPIC-PLATFORM (baseline CI must work); all feature epics must be complete before full prod hardening — this is the last milestone (M10)

### Key Implementation Insights

- Dockerfile pattern: multi-stage build (build stage installs deps; runtime stage copies only needed artifacts); non-root user; `ENTRYPOINT` calls `uvicorn` (API) or `arq` (worker)
- Health check: `GET /health/ready` returns 200 with `{status: "ok", db: "ok", redis: "ok"}` — checks all critical service connections
- SSRF blocklist: private IPv4 ranges + loopback + link-local; implement as a custom `httpx` transport wrapper (used by all outbound MCP/web tool calls)
- OpenTelemetry instrumentation: `opentelemetry-instrumentation-fastapi`, `opentelemetry-instrumentation-sqlalchemy`, `opentelemetry-instrumentation-redis`
- `correlation_id` middleware: generate UUID per request if not present in `X-Request-ID` header; inject into logging context and response header
- SLO minimums: ingest 100 docs, SSE latency under concurrent 20 clients — exact thresholds not specified in issues, need to be defined before load test
- Retention policy enforcement: background job or cron workflow that deletes expired run_events; soft-delete pattern for runs
- Security scanning: `bandit` (Python SAST), `semgrep` with rulesets, `pip-audit` + `npm audit` in CI; secret scanning via `detect-secrets` or GitHub native secret scanning
- Deploy runbook minimum contents: start deploy, verify health, rollback procedure, verify rollback
agentId: ae7b02e (for resuming to continue this agent's work if needed)
<usage>total_tokens: 77887
tool_uses: 61
duration_ms: 309801</usage>

---
## Corrections (applied 2026-02-21, session 5 verification)
- STORY-CON-005 removed from EPIC-FE-SHELL (belongs only to EPIC-CONTRACTS)
- STORY-STREAM-001 clarified as cross-epic dependency, not EPIC-PLATFORM child (it's M1/contracts-phase)
- EPIC-PROD C5/C6/C7 flagged as synthesized from docs/AC with no backing stories
- Added e2e.yml pipeline (nightly Playwright, missing from original)
- STORY-ORCH-001 dependency corrected: depends on EPIC-ORCH + EPIC-CONTRACTS (not EPIC-PLATFORM)
- Added "or authored directly" to Pydantic source-of-truth claim
- Noted V4 #4 title counts (43/26) don't match body totals (45/29)
