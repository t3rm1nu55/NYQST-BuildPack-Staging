# Crosswalk: COMPRESSED-BUILD-SPEC → this build pack

Your `research/COMPRESSED-BUILD-SPEC.md` is a dense “pattern library + implementation path”.
This build pack translates that into:
- contracts (schemas)
- user flows (UI)
- dependency DAG
- an issue backlog you can import into GitHub

This crosswalk tells agents where to look.

---

## Domain A — Streaming protocol and state chain

Spec focus:
- NDJSON/SSE framing
- heartbeat + watchdog
- done semantics
- event ordering and idempotency
- client-side buffering (report_preview_delta etc.)

Build pack mapping:
- Issues:
  - `TASK-CON-002` (run_event schema + fixture streams)
  - `STORY-STREAM-001` (heartbeat/reconnect/done semantics)
  - `TASK-PLAT-P0-EVENTSEQ` (sequence_num concurrency)
- Docs:
  - `docs/07_TESTING_STRATEGY.md` (contract fixtures)
  - `contracts/run_event.schema.json`

---

## Domain B — Orchestration patterns (LangGraph “plan → tasks → tools → report”)

Spec focus:
- PlanSet/Plan/PlanTask
- fan-out + per-node sessions
- tool call logging + event emission
- clarification loop
- report preview delta buffering

Build pack mapping:
- Epics:
  - `EPIC-ORCH`
- Issues:
  - `STORY-ORCH-001` (PlanSet schemas + persistence)
  - `STORY-ORCH-002` (LangGraph orchestrator for Research Notebook)
  - `STORY-ORCH-003` (clarification loop)
  - `STORY-ORCH-004` (report preview streaming)
- Docs:
  - `docs/02_USER_FLOWS_MASTER.md` (Flow 0, 3, 7)

---

## Domain C — UI / UX state machine for streamed runs

Spec focus:
- resilient reducers for event types
- partial previews and “final replace”
- progress panels, timeline, outputs binding

Build pack mapping:
- Epics:
  - `EPIC-FE-SHELL`
  - `EPIC-GENUI`
- Issues:
  - `STORY-FE-003` (run timeline renderer)
  - `STORY-STREAM-001` (client watchdog)
- Mock:
  - `mockups/NyqstPortalMockupV2.tsx` (screen skeleton and patterns)

---

## Domain D — Entity & citation system

Spec focus:
- entities and citations as durable primitives
- citation buffers (async creation)
- entity matching / merge

Build pack mapping:
- Epic:
  - `EPIC-INTEL`
- Issues:
  - `STORY-ENTITY-001` (entities + citations + buffers + matching)
  - `STORY-INTEL-001` (evidence provenance enforcement)
- Contracts:
  - `contracts/evidence.schema.json` (source spans)
  - (extend with citation schema as you implement)

---

## Domain E — Dify-style “Apps” concept

Spec focus:
- app definition and versioning
- “configured view / agent / analysis”
- triggers and re-runs
- output mapping and provenance

Build pack mapping:
- Epic:
  - `EPIC-APPS`
- Issues:
  - `STORY-APPS-001` (apps + versions + runs model)
  - `STORY-APPS-002` (builder wizard)
  - `STORY-APPS-003` (runner)
  - `STORY-APPS-004` (triggers)
  - `TASK-APPS-005` (app diff)
- Contract:
  - `contracts/app.schema.json`
  - `contracts/context_pack.schema.json`

---

## Domain F — n8n-style workflows

Spec focus:
- node graphs
- triggers/schedules
- node logs and retries
- templates and reusable flows

Build pack mapping:
- Epic:
  - `EPIC-WORKFLOWS`
- Issues:
  - `STORY-WF-001` .. `STORY-WF-004`

---

## Domain G — NotebookLM-style research over web + local docs

Spec focus:
- documents as sources
- chunking/indexing
- note-taking with citations
- diffing and versioning

Build pack mapping:
- Epics:
  - `EPIC-DOCUMENTS`
  - `EPIC-STUDIO`
- Issues:
  - `STORY-DOCS-001` .. `STORY-DOCS-006`
  - `STORY-STUDIO-001` .. `STORY-STUDIO-004`
- Docs:
  - `docs/02_USER_FLOWS_MASTER.md` Flow 1 and Flow 4

---

## Domain H — Collaborative editing (“Claude cowork” style)

Spec focus:
- shared drafts
- review states
- change tracking
- rapid iteration loops

Build pack mapping:
- Implemented as a combination of:
  - Insights lifecycle (`STORY-INTEL-002`)
  - Review queue (`STORY-INTEL-003`)
  - Versioning (Apps, Models, Bundles)
- Recommended follow-on issue (optional):
  - add real-time collaboration later if required; start with versioned edits and review states.

---

## Domain I — Backend service patterns, security, ops

Spec focus:
- DB migrations discipline
- worker/job execution
- safe tool execution
- multi-tenant enforcement
- billing/usage

Build pack mapping:
- Epics:
  - `EPIC-PLATFORM`
  - `EPIC-PROD`
  - `EPIC-BILLING`
- Issues:
  - P0 fixes (`TASK-PLAT-P0-*`)
  - production hardening stories (`STORY-PROD-*`)

