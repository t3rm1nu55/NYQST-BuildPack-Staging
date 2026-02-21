# Success criteria

These are the objective checks that define “we built the system”.

They are grouped into: functional, quality, operations, and security.

---

## Functional success (user-visible)

A. Golden path works end-to-end:
- Create project
- Upload bundle v1
- Ingest + extraction completes
- Run an app
- Pin output + evidence to Studio
- Create insight linked to evidence
- Run validation and see results
- Dashboard shows KPIs with provenance
- Upload bundle v2 and view diffs + stale indicators
- Workflow triggers on v2 and produces a run log

B. Every artifact is traceable:
- any insight or KPI has a provenance path:
  bundle version → ingest run → extraction evidence → insight/model field → dashboard tile

C. Versioning is consistent:
- bundle versions, app versions, model versions, workflow versions are immutable once published
- runs always reference exact versions used

---

## Quality success (correctness + trust)

- No orphan claims:
  - insights require evidence links
- No silent changes:
  - model and dashboard deltas are explainable and surfaced
- Deterministic fixtures:
  - ingest/extract/diff pipelines produce stable output on golden fixtures (or stable within tolerance with explicit reasons)

---

## Performance success (baseline SLOs)

These are initial targets; tune after first production usage.

- Streaming:
  - time to first event: < 1s (p50) for typical runs
  - heartbeat interval: configurable; defaults 5–10s
- Ingest:
  - 50-page PDF ingest + chunk + index: < 2 minutes (p50) on staging hardware
- UI:
  - initial route load < 2 seconds on modern laptop (cold)
- Search:
  - retrieval query < 500ms (p95) for typical project index

---

## Testing success (professional bar)

CI must gate:
- unit tests
- integration tests (DB/services)
- contract tests (schemas + fixtures)
- UI tests (component)
- e2e (at least on merge/nightly)

Regression harness exists for:
- diff algorithms
- stale propagation
- run event streaming reducers

---

## Operational success (deployability)

- staging deploy is one-command and repeatable
- health checks and readiness exist
- migrations are safe and reversible where possible
- backup/restore procedure tested
- observability exists:
  - logs, metrics, traces
  - run correlation IDs

---

## Security success (baseline)

- strict tenant isolation tests pass
- outbound HTTP tools are sandboxed (SSRF blocked)
- file upload size limits and content-type checks enforced
- secrets never appear in logs or streamed events
- dependency + SAST scans in CI

