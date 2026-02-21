# Testing standards (professional-level)

NYQST has three hard problems:
- event-driven streaming UI
- document pipelines and diffs
- provenance correctness (audit)

So testing must be layered and contract-driven.

---

## Test tiers

### Tier 1 — Unit (fast)
- pure functions
- schema validation
- diff algorithms
- rule evaluation
- state reducers and stores

Runs:
- on every push
- must finish in minutes

### Tier 2 — Integration (real DB/services)
- API endpoints
- migrations
- ingest pipeline against fixtures
- SSE event emission (contract fixtures)

Runs:
- on PR
- uses Docker services (Postgres/Redis/MinIO/OpenSearch)

### Tier 3 — Contract tests (schema locks)
- validate fixtures against JSON Schema/Pydantic
- validate frontend TS types and renderers can handle all events

Runs:
- on push and PR (fast)

### Tier 4 — End-to-end (Playwright)
Minimum flows:
1) golden path: create project → upload bundle → run app → pin to canvas
2) bundle versioning/diff flow
3) validation → dashboard delta drilldown

Runs:
- nightly (or on merge to main)
- also on release branches

### Tier 5 — Live provider tests (manual)
- web search APIs
- LLM calls
- Stripe (test mode)

Runs:
- manual trigger only
- strict cost caps

---

## Fixture discipline

- Fixtures are versioned and stable.
- Every contract change updates fixtures.
- Golden fixtures:
  - bundle upload set (PDF/DOCX/HTML/CSV)
  - extracted structured JSON
  - run event stream NDJSON/SSE lines
  - app config examples

---

## What “good coverage” means here

We do not chase a coverage percentage.

We cover:
- correctness of diffs
- correctness of provenance graph
- correctness of event streaming and UI reducers
- correctness of ingestion idempotency and retry behavior

---

## Quality gates

PR must pass:
- ruff + mypy (as configured)
- unit tests
- integration tests if touching API/DB
- contract tests always
- UI typecheck + component tests

Release must pass:
- Playwright suite
- load test smoke
- migration dry-run on fresh DB and an upgrade path DB

---

## Performance tests (minimum)

Add a simple harness:
- ingest 100 docs (fixtures)
- measure:
  - time-to-first-index
  - extraction throughput
  - memory peak
- SSE latency under concurrent runs (e.g. 20 clients)

---

## Security tests (baseline)

- dependency scanning (pip/npm)
- SAST (bandit/semgrep)
- secret scanning
- auth bypass tests for protected endpoints

