# Repo alignment notes (what exists, what diverges, what to reuse)

Generated: 2026-02-20 (Europe/London)

## Snapshot of what exists in the repo

Backend (FastAPI):

- Routers under `/api/v1`: health_router, auth_router, agent_router, artifacts_router, conversations_router, manifests_router, pointers_router, rag_router, runs_router, sessions_router, streams_router, tags_router

- Run ledger persisted in Postgres (`runs`, `run_events`) and a PG LISTEN/NOTIFY-based run event stream (`/api/v1/streams/runs/{run_id}`).

- Chat stream endpoint exists (`POST /api/v1/agent/chat`) and already emits Vercel AI SDK Data Stream Protocol via a LangGraph adapter.

- Artifact kernel exists: Artifact/Manifest/Pointer services with MinIO backend.

- RAG/OpenSearch service exists; MCP server scaffold exists.

Frontend (React/Vite):

- Research workspace page exists (`ResearchPage`) using `@assistant-ui/react` + `@assistant-ui/react-ai-sdk` transport.

- RunTimeline component exists and subscribes to both historical events (`GET /api/v1/runs/{run_id}/events`) and the live stream.

- Notebooks and Documents workspace pages exist (starter implementations). Projects/Clients/Analysis pages are placeholders.

- Package deps already include `ai` / `@ai-sdk/react` (Vercel AI SDK), and assistant-ui.

## Where the repo diverges from Build Guide v5 (and why it matters)

1) Run event contract is not the Build Guide v5 22-type union.

- Current DB enum values (26): run_started, run_paused, run_resumed, run_completed, run_failed, run_cancelled, step_started, step_completed, tool_call_started, tool_call_completed, llm_request, llm_response, retrieval_query, retrieval_result, artifact_emitted, manifest_created, pointer_moved, checkpoint, state_update, user_input, approval_requested, approval_granted, approval_denied, comment_added, error, warning.

- Build Guide v5 expects: `stream_start/stream_end`, `message_delta`, `node_*`, `artifact_*` readiness events, and `billing_event`, with a strict 4-surface contract (DB enum + Pydantic + TS union + stream handler).

- Net: the timeline renderer and downstream UI logic will remain “stringly typed” unless we normalize the contract.


2) Orchestrator graph is a starter; not the multi-node planner/fan-out/synthesizer described in the build guide.

- Current graph is essentially: agent → tools → agent (single-thread) with basic tool telemetry.

- Build Guide wants a plan-first workflow with explicit tasks, parallel dispatch, and synthesis into structured deliverables.


3) Multi-tenancy is incomplete at the core-table level.

- Tenant models exist, but core tables like `runs` and `artifacts` do not carry `tenant_id` today.

- This blocks proper isolation, quotas, and enterprise controls.


4) Billing is not implemented as a system.

- There are token/cost fields on `Run`, but no metering pipeline, Stripe integration, quotas, or `billing_event` events.


5) Entity + citation system does not exist.

- The agent can emit a “sources” chunk in the chat stream, but there’s no persistence layer for entities/claims/citations tied to artifacts.


6) Docker/prod deployment scaffolding is missing.

- Dockerfile present: False. Compose present: True.

- Without containerization, reproducible deploy + CI parity will be painful.

## What to reuse vs what to refactor

Keep and extend (high leverage):

- `LangGraphToAISDKAdapter` + assistant-ui runtime wiring. Don’t rip this out; extend it.

- Artifact/Manifest/Pointer services (good primitives). Extend metadata + add missing entity links.

- PG LISTEN/NOTIFY streaming infra (already works). Adjust payload contract and per-run channeling if needed.

- Notebooks/Documents UI as scaffolding for the “workspace” concept.


Refactor (to hit Build Guide success criteria):

- Run event type contract (normalize + create typed TS union + renderer map).

- Agent graph: introduce planner + fan-out + synthesis + structured outputs.

- Add tenant_id everywhere that matters; enforce in queries.

- Implement billing/metering and surface it in run events + UI.

- Build the entity/citation store; stop treating sources as an ephemeral chat-only artifact.

## Practical sequencing (minimize rework)

- Do P0 “repo won’t run reliably” fixes first (arq worker settings, run_event sequence race, docker-compose redis profile, etc.).

- Next, lock contracts: RunEvent v1 + DataBrief + MarkupDocument + stream handler (4-surface).

- Then, build the planner/fanout graph and make it emit contract-correct run events.

- Only after that, invest heavily in UI plan/report panels—otherwise you’ll redo renderers every time the event contract shifts.

## UI surface inventory (repo)

Pages under `ui/src/pages/`:

- AnalysisPage.tsx

- ClientsPage.tsx

- DecisionsPage.tsx

- ModulePlaceholder.tsx

- NotebookPage.tsx

- NotebooksPage.tsx

- OverviewPage.tsx

- ProjectsPage.tsx

- ResearchPage.tsx
