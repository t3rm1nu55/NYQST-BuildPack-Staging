# Gap analysis + patchset (high-leverage fixes)

This document does four things:

1. Identifies correctness and execution-speed risks in the current plan (even if the high-level design is good).
2. Proposes pragmatic fixes that *do not require re-architecting* the project.
3. Provides a patchset you can apply immediately (`PATCHSET.diff`) to eliminate the worst footguns.
4. Lists the up-front work you should do before parallelizing the team.

If you ignore everything else: implement the patchset items marked **P0-EXISTENTIAL**.

---

## 1) Correctness gaps (logical errors / contradictions)

### 1.1 P0-EXISTENTIAL: arq WorkerSettings.functions registration fix is wrong as written

Your plan proposes:

```py
class WorkerSettings:
    @staticmethod
    def functions():
        return list(_job_registry.values())
```

But arq loads WorkerSettings and passes `functions` as-is to the Worker constructor. That means `functions` must already be an iterable of callables, not a function. If you supply a function, you’ll get either:
- a runtime error, or
- a worker that starts but does not execute jobs.

Fix (compatible with arq CLI loader semantics):

- define jobs first (so decorators populate your registry)
- assign `WorkerSettings.functions = list(_job_registry.values())` *after* job definitions

Or use a dict-style settings object.

Also: arq is pessimistic about execution: jobs may run more than once. Therefore *every* job you enqueue must be idempotent (see §2.3).

References:
- arq docs (job execution caveats): https://arq-docs.helpmanual.io/
- arq worker loads settings `functions` directly: https://github.com/python-arq/arq/blob/main/arq/worker.py

### 1.2 P0-EXISTENTIAL: RunEvent sequencing must be deterministic under fan-out

Your current P0-2 fix uses `max(seq)+1` in a subquery + retries. This is better than the explicit SELECT+insert, but it still races: two concurrent transactions compute the same max and collide.

Retry loops are not a stable foundation for your core event log. They will surface as “random” missing/duplicated UI events, because your UI is live and concurrent writes are common after Send() fan-out.

Recommended fix: choose **one** of these.

Option A (recommended): per-run counter table

- Add `run_event_counters(run_id PK, next_seq int not null)`
- Allocate with atomic UPSERT increment:
  - `INSERT (run_id, next_seq) VALUES (:run_id, 1)`
  - `ON CONFLICT (run_id) DO UPDATE SET next_seq = run_event_counters.next_seq + 1`
  - `RETURNING next_seq`

Then insert RunEvent with that sequence number.

Option B: advisory lock per run (xact lock)
- `SELECT pg_advisory_xact_lock(hash(run_id))`
- then `SELECT max(seq)+1` + insert
- serializes event writes per run but guarantees order.

(Option A usually performs better and is easier to reason about.)

### 1.3 P0: Tenant linkage on runs (good) but order/conflict needs tightening

Your P0-3 is correct: billing and quota need tenant_id on Run.

But your plan embeds it in Migration 0005b, while also labeling it as P0. That creates confusion for execution order.

Recommendation: treat it as part of “Foundation schema” (Wave 0) and stop calling it P0 unless you will land the migration before any wave work.

### 1.4 P0: EntityType naming drift already exists (will explode later)

In the plan, the discriminated union includes `WEB_PAGE`, but in the migration plan you propose `WEB_SOURCE`. You also mention `GENERATED_WEBSITE`, but later list `WEBSITE`.

This will cause:
- queries that miss entities (SourcesPanel empty)
- inconsistent filtering in API
- broken citation binding

Fix: lock the enum now (single canonical list), and write a tiny contract test that rejects unknown values.

### 1.5 Streaming: MESSAGE_DELTA vs “chat stream” duplication is unclear

You define two SSE streams: “chat + run events”. You also add `MESSAGE_DELTA` as a RunEvent type.

If you stream assistant text in two places, you will eventually:
- double render
- double charge (if usage is attached)
- desync cancellation/retry logic

Pick a single source of truth:

- Option A: assistant text deltas are on chat stream; run events are for “system events”.
- Option B: everything (including assistant deltas) is a run event; chat stream is derived from event log.

Option A is simpler short-term, but Option B yields replay and audit. If you keep Option A, do not persist MESSAGE_DELTA as a RunEvent.

### 1.6 SSE: LISTEN/NOTIFY without catch-up is a reliability bug

Your plan uses Postgres LISTEN/NOTIFY and calls it “production-ready”. That’s only true if:

- every event is persisted (you do)
- clients can reconnect and request “events after X”
- server uses DB backfill on reconnect, not NOTIFY only

You need an explicit contract:

- client sends `Last-Event-ID: <seq>` OR query param `after_seq=<seq>`
- server returns all persisted events with seq > after_seq
- server sends periodic `ping` events to keep connections alive
- server supports “gap detection” and can resync.

If you do not define this now, the PlanViewer will randomly show missing tasks.

---

## 2) Engineering gaps (professional build hygiene)

### 2.1 Contracts need code generation (do not hand-maintain TS mirrors)

You propose writing `ui/src/types/run-events.ts` manually. That will drift.

Professional approach:
- generate OpenAPI from FastAPI/Pydantic (already happens)
- generate TypeScript types from OpenAPI or from Pydantic JSON Schema
- enforce in CI: run codegen and fail if `git diff` changes.

This becomes the “contract test” layer and pays for itself immediately.

### 2.2 Define “Definition of Done” and enforce it

You have labels and PR sizing. Missing: a single DoD checklist used everywhere:

- tests added/updated
- migrations have downgrade + tested on clean DB
- event type changes updated all 4 surfaces
- UI changes include screenshot/GIF
- no TODOs without issues

Put it into issue templates and PR templates.

### 2.3 arq idempotency (mandatory)

arq warns jobs may execute more than once. Your job layer needs idempotency keys and/or dedupe constraints.

Pattern:
- create `jobs` table with `job_key` unique and status
- job_key format: `{run_id}:{job_type}:{artifact_kind}`
- worker begins by inserting job_key row; if conflict → return “already done”
- mark success/failure
- optionally store artifact_id created by the job

Do this before Wave 2 (co-generation + async entities).

### 2.4 Run cancellation strategy is not specified

You have `RUN_CANCELLED`, but nothing defines how cancellation propagates:

- What does “Stop” mean in LangGraph? (cancel tasks? stop new Send? cancel background jobs?)
- How do you mark partial deliverables?
- How does UI reflect “cancelled with partial output”?

You need:
- API endpoint: `POST /runs/{run_id}/cancel`
- cancellation token in state
- nodes check cancellation between tool calls
- background jobs check cancellation before expensive work
- UI: “Stopped” with list of completed tasks and partial artifacts.

### 2.5 Up-front work checklist (do this before Wave 0 parallelization)

Repository & developer experience
- Add `Makefile` or `justfile` that wraps:
  - `make dev` (infra + api + ui)
  - `make test` (unit + integration)
  - `make lint` (ruff + mypy + eslint)
  - `make codegen` (TS types)
- Add `pre-commit` hooks (ruff, format, eslint, typecheck).
- Pin versions for LangGraph/LangChain (Send stability, interrupt semantics).
- Add `CODEOWNERS` for `src/intelli/agents/**`, `src/intelli/db/**`, `ui/**`.

Contracts
- One `contracts/` directory:
  - `run_events.schema.json`
  - `entity_types.json`
  - `sample_events.json`
- CI job validates both Python and UI against it.

Observability
- Add correlation IDs:
  - `run_id`, `thread_id`, `conversation_id`, `tenant_id`
- Add structured logging (JSON in prod, pretty in dev).
- Decide: LangSmith tracing always-on in dev; controlled in CI.

Security hygiene
- Add SSRF protection for web scraping
- Add API key redaction in logs
- Add rate limiting (Brave) centrally.

---

## 3) Patchset overview

`PATCHSET.diff` includes:

P0-EXISTENTIAL
- arq WorkerSettings registration fix (compatible with arq)
- event sequencing: counter table allocator + migration + repository update
- SSE resume/catch-up contract

P0-HIGH
- idempotency scaffold for jobs (minimal)
- entity_type canonicalization guard

P0-PRODUCT
- cancellation endpoint + event emission

P0-DEVEX
- PR template checklists
- contract test skeleton

---

## 4) What you should change in the plan wording (non-code)

These are documentation-level fixes that prevent misunderstandings when multiple devs execute.

1) Rename “P0 fixes must resolve before any wave” → “P0: apply patchset and re-baseline”
   - P0 includes schema changes and code; treat it as pre-wave.

2) Add an explicit “Vertical Slice Gate” after Wave 1
   - orchestrator + PlanViewer + a minimal report preview must work end-to-end.

3) Add “SSE catch-up semantics” to BL-002/BL-014 deliverables
   - it’s not optional if you want reliable UI.

4) Add “idempotency required” to BL-006/BL-016/BL-019 (anything using arq)
   - make it acceptance criteria.

---

## 5) References (implementation-grounding)

LangGraph Send and conditional edges:
- https://docs.langchain.com/oss/python/langgraph/graph-api
- https://reference.langchain.com/python/langgraph/graphs/

LangGraph interrupts/resume:
- https://docs.langchain.com/oss/python/langgraph/interrupts

AI SDK stream protocol (optional compatibility):
- https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol

MCP spec:
- https://modelcontextprotocol.io/specification/2025-06-18

Agent Skills spec:
- https://agentskills.io/specification

assistant-ui:
- runtimes/external-store: https://www.assistant-ui.com/docs/runtimes/custom/external-store
- sources UI primitive: https://www.assistant-ui.com/docs/ui/sources

