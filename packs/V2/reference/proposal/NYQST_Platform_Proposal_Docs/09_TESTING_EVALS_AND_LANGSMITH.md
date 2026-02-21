# Testing, evals, and LangSmith (stop regressions before they ship)

Your marker tiers (unit/integration/live) are good. This doc makes them operational and adds two critical layers:

- contract tests (schema + stream)
- evaluation tests for agent quality (LangSmith datasets)

---

## 1) Test pyramid (what you actually need)

### 1.1 Unit tests (fast, deterministic)

- schema validation (Pydantic models)
- MarkupHealer behavior (hoist/remove)
- sequence allocator behavior
- tool adapter validation
- skill loader selection logic

### 1.2 Integration tests (DB + API)

- migrations up/down on fresh DB
- event write + SSE backfill correctness
- orchestrator with mocked LLM
- artifact store integration (MinIO)
- billing CRUD and webhook signature verification (with test payload)

### 1.3 Contract tests (critical)

Contracts are your “glue” between backend and frontend. You need tests that fail if contract drifts.

Contract tests include:

- Backend: `run_events` payloads validate and match OpenAPI/JSON schema
- Frontend: generated TS types compile and accept sample events
- Replay tests: given sample_events.json, UI derived state matches expected snapshots

### 1.4 End-to-end tests (small number)

- 1 report run
- 1 website run (with co-gen)
- 1 slides run
- 1 clarification run
- 1 cancellation run

Keep E2E small. Make them reliable.

### 1.5 Live tests (manual trigger)

- Brave search concurrency
- Jina scrape sanity
- full run with real model under budget cap

---

## 2) Concurrency tests (mandatory for Send fan-out)

You already plan a Send prototype. Extend it:

- run N workers concurrently
- each emits K events
- assert:
  - sequences are unique and increasing
  - no IntegrityError
  - SSE backfill returns the correct set
  - UI can replay without gaps

This is the one place you should be “paranoid”.

---

## 3) Streaming protocol tests

Test:
- client connects with after_seq=0, receives full history
- client reconnects with after_seq=<last>, receives no duplicates
- server sends ping events
- if NOTIFY drops, backfill still works

Write a test client that reads SSE lines and reconstructs events.

---

## 4) LLM mocking strategy

You plan “minimal mocking” (DEC-070). That’s fine, but you must be surgical:

- mock the LLM at the boundary:
  - return deterministic PlanSet JSON
  - return deterministic DataBrief JSON
  - return deterministic MarkupDocument JSON

Avoid mocking deeper internal layers.

---

## 5) Agent quality evaluation (LangSmith)

LangSmith provides tracing and evaluation harnesses for LLM applications.

Tracing env vars setup:
- https://support.langchain.com/articles/3567245886-how-do-i-set-up-langsmith-api-key-environment-variables
Observability quickstart:
- https://docs.langchain.com/langsmith/observability-quickstart

Professional pattern:

1) Create a small dataset of prompts:
- 10 representative queries
- includes “hard” ones (ambiguous, needs clarification, limited sources)

2) Define evaluation criteria:
- citation coverage (>= X citations)
- factuality (manual or model-graded)
- structure validity (markup schema passes)
- latency (time to plan created, time to first preview)

3) Run evals on every release (not every PR).

4) Store eval results and diff over time.

---

## 6) Golden artifacts

Create “golden runs” that are stored and replayed:

- `tests/fixtures/run_events_golden.json`
- `tests/fixtures/markup_golden.json`

Use them to catch regressions in:
- UI rendering
- schema changes
- progress mapping

---

## 7) Frontend testing specifics

- Zustand stores: unit tests for reducers/selectors
- PlanViewer: render from sample event stream and snapshot card states
- SourcesPanel: test pending → cited transition
- ReportPanel: test that GML tags render to expected components
- performance: ensure large event list doesn’t lock UI (basic benchmark)

---

## 8) CI organization (recommendation)

On push:
- backend unit tests
- lint/format
- contract schema validation

On PR:
- backend integration tests (DB)
- frontend typecheck + vitest
- contract tests

Manual:
- live tests (real APIs)
- e2e with real model (budget capped)

---

## 9) Budget controls for live tests

You already define $0.50/test and max_tokens=2000.

Also:
- hard stop if cost estimate exceeds budget
- store cost per test to trend over time

---

## 10) Definition of Done for “agent features”

Any agent feature PR must include:
- at least 1 unit test
- at least 1 integration test or fixture
- updated skill docs if behavior changed
- updated sample event fixture if new events used

