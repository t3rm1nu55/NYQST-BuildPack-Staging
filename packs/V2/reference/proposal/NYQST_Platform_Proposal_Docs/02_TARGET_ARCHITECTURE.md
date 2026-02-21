# Target architecture (pragmatic, local-first, production-shaped)

This is the architecture that gives you:

- deterministic replayable run history (event-sourced-ish)
- “fast feel” streaming UI with reconnection
- safe concurrency for fan-out agents
- a clean tool/provider boundary (MCP-ready)
- an obvious path to containerization later without redesign

It is compatible with your DEC-053 “local app + local worker” topology.

---

## 1) Component model

### 1.1 Services

Backend (FastAPI)
- API authentication (JWT + API key)
- Run lifecycle: create/run/cancel/query
- RunEvent persistence (append-only)
- SSE streams (chat + run events) with backfill
- Artifact and manifest APIs
- Entity queries (via Artifact.entity_type)
- Billing endpoints and webhooks
- Export endpoints

Worker (arq)
- non-interactive background jobs:
  - website co-generation companion report
  - entity extraction / citation binding (if async)
  - exports that require heavy CPU (PDF rendering with chart images)
- MUST be idempotent.

Infrastructure (docker-compose)
- Postgres (+ pgvector)
- Redis (arq)
- MinIO (S3 artifact store)
- OpenSearch (index backend) (or pgvector only)

Frontend (React + Vite)
- assistant-ui components for chat primitives
- event-driven run UI: PlanViewer, RunTimeline, SourcesPanel
- deliverable previews: ReportPanel, WebsitePreview (iframe), Slides viewer
- export actions and download flows

---

## 2) The central backbone: persisted RunEvent log

Treat RunEvents as the system’s canonical history:

- every important state transition emits a RunEvent
- UI renders from events (live stream + replay)
- debugging and audits are built-in

Key properties:

- events are immutable, append-only
- ordering is strict per run via `sequence_num` allocator
- NOTIFY is best-effort; replay is always possible via DB query
- event payload is versioned and validated

---

## 3) Data model

### 3.1 Runs

`runs`
- id
- tenant_id (indexed)
- created_by
- status
- cost_cents, token_usage
- parent_run_id (optional)
- started_at, completed_at
- thread_id (optional, recommended: set = run_id for 1:1 mapping)

### 3.2 RunEvents

`run_events`
- run_id
- sequence_num (strictly increasing per run)
- event_type (enum)
- payload (jsonb)
- timestamp
- duration_ms (optional)

Constraints:
- unique (run_id, sequence_num)

### 3.3 Artifacts

Artifacts are content-addressed objects in MinIO, referenced by id/sha.

Add:
- `entity_type` (string enum)
- `tags` (jsonb metadata)

### 3.4 Jobs (recommended minimal table)

`jobs`
- id
- job_key (unique)
- run_id
- job_type
- status (pending, running, success, error)
- result_artifact_id (optional)
- error (optional)
- created_at, updated_at

This gives idempotency and visibility.

---

## 4) Runtime topology

```mermaid
flowchart LR
  subgraph infra[Docker Compose - Infra]
    pg[(Postgres + pgvector)]
    redis[(Redis)]
    minio[(MinIO S3)]
    os[(OpenSearch)]
  end

  api[FastAPI (uvicorn)]
  ui[React/Vite]
  worker[arq worker]

  ui <-->|HTTP + SSE| api
  api <-->|SQL| pg
  api <-->|S3| minio
  api <-->|HTTP| os
  api <-->|enqueue jobs| redis
  worker <-->|dequeue jobs| redis
  worker <-->|SQL| pg
  worker <-->|S3| minio
```

---

## 5) Request flows

### 5.1 Start run (chat)

1. UI sends POST `/api/v1/agent/chat` with:
   - conversation_id
   - user message content
   - deliverable_type (on USER msg)
2. API:
   - creates Run (tenant_id set)
   - emits RUN_STARTED event
   - starts LangGraph execution with config.thread_id = run_id (recommended)
3. API opens SSE stream(s):
   - chat stream: assistant message deltas (or derived)
   - run events stream: plan/task/progress/system events

### 5.2 Reconnect / resume (SSE)

- UI reconnects with `Last-Event-ID` = last seen sequence_num
- API queries run_events where seq > last and streams back before switching to live NOTIFY follow
- This makes UI robust to refreshes, tab suspends, or transient network issues

### 5.3 Clarification

- graph calls `interrupt(payload)` in clarification node
- API returns CLARIFICATION_NEEDED event (and ends stream)
- UI collects user input
- UI POSTs `/agent/resume` with thread_id + response
- API resumes graph with `Command(resume=...)`

### 5.4 Website co-generation (async)

- website generation node stores website bundle artifact
- API emits ARTIFACT_CREATED + WEBSITE_GENERATION_DONE events
- API enqueues job `generate_companion_report`
- worker:
  - checks job_key (idempotent)
  - generates report
  - stores report artifact
  - emits ARTIFACT_CREATED

---

## 6) Where LangServe fits (optional)

You already have a FastAPI app. LangServe can be used in two optional ways:

- Deploy graph/runnables as a separate service (later)
- Provide a standard REST surface for “runnables” that might be called by other services

For v1, avoid introducing it unless you need:
- multi-tenant routing to multiple graph versions
- a standard “runnable registry” API
- auto-generated clients

LangServe is integrated with FastAPI and uses pydantic validation:
- https://github.com/langchain-ai/langserve

---

## 7) Production shape vs local-first

Local-first is good. But keep production constraints in mind:

- state persistence (checkpointer) must be durable (Postgres is fine)
- event log must be deterministic (counter allocator)
- reconnect semantics must be defined (SSE backfill)
- secrets must not leak (redaction + env discipline)
- background jobs must be idempotent (jobs table)

If you do those, containerization becomes packaging, not redesign.

