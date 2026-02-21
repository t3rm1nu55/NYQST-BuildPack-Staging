# Build stages to a production system

This is the staged plan from “repo ready” to “production hardened”.

Each stage has:
- objective
- output
- acceptance criteria (objective checks)
- minimal test gating

---

## Stage 0 — Baseline + platform hygiene

Objective:
- the existing system runs locally and has a repeatable validation script
- CI is green with deterministic tests

Outputs:
- validated local env setup
- CI pipeline with unit/integration split
- P0 fixes (worker, event ordering, tenancy linkage)

Acceptance criteria:
- `docker compose up` starts infra
- backend + frontend boot with one command
- migrations apply cleanly to fresh DB
- `pytest -m unit` + `pytest -m integration` pass in CI
- arq worker actually processes jobs (round trip)
- concurrent event append cannot race (sequence numbers correct)

---

## Stage 1 — Contracts locked + minimal vertical slice

Objective:
- frontend and backend can proceed independently against stable contracts

Outputs:
- versioned contracts in `contracts/`
- app schema v1
- run event schema v1
- bundle/version schema v1
- UI shell with Projects + Apps + Studio skeleton

Acceptance criteria:
- mock app run can stream events into UI
- run detail page renders a complete event timeline from fixtures
- app outputs can be pinned to canvas with a provenance inspector (fixture-based ok)

Tests:
- contract tests validate fixtures against JSON schema
- frontend component tests for screens + stores
- backend unit tests for Pydantic schema validation

---

## Stage 2 — Documents system (bundles, versions, ingest, diff)

Objective:
- NotebookLM-grade document management that drives all downstream intelligence

Outputs:
- bundles + versions API
- ingest pipeline (parse → normalize → chunk/index → extract)
- diff surfaces (document, extraction, impact)

Acceptance criteria:
- upload bundle v1 and get extracted outputs
- upload v2 and view diffs
- diff can be pinned to canvas
- ingestion run log is viewable as Run detail

Tests:
- integration tests on ingest pipeline with fixtures
- unit tests for diff algorithms
- e2e test for upload + diff view

---

## Stage 3 — Evidence + insights + provenance

Objective:
- everything is auditable; claims always trace to sources

Outputs:
- evidence objects with source spans/web snapshots
- insight lifecycle (draft/reviewed/published)
- stale detection when upstream changes
- review queue views (low confidence, conflicts)

Acceptance criteria:
- evidence always links to bundle version or web snapshot
- insights require evidence links
- after uploading bundle v2, stale insights are flagged

Tests:
- unit tests for stale propagation
- integration tests for evidence/insight CRUD
- e2e: create insight and observe stale after doc change

---

## Stage 4 — Apps + agents + context packs (Dify-style)

Objective:
- packaged work units users can re-run and schedule

Outputs:
- app builder (wizard) + versioning
- app runner (agent/workflow/view)
- context packs (project context + selected bundles + CRM + model versions)
- output mapping (notebook/canvas/insights/models)

Acceptance criteria:
- create app from template, publish, run, see run history
- re-run old version and compare outputs
- pin app outputs to canvas, show provenance

Tests:
- integration: app run creates artifacts + run log
- contract: app run events schema enforced
- e2e: create + run app

---

## Stage 5 — CRM

Objective:
- entities are first-class and link to docs/evidence/insights

Outputs:
- entity model + relationship graph
- entity timelines
- views/saved queries (View Apps)

Acceptance criteria:
- create/update entities
- link evidence/insights to entities
- entity detail shows linked docs and insights

Tests:
- integration: relationship queries
- e2e: link evidence to entity and view in CRM

---

## Stage 6 — Models + validation

Objective:
- validate extracted intelligence and track deltas

Outputs:
- model registry + versioning
- rule/validation framework
- validation runs and results
- model impact diff (from doc changes)

Acceptance criteria:
- define a model schema
- run validation; see pass/fail + evidence coverage gaps
- doc update triggers changed model field(s) explanation

Tests:
- unit: rule evaluation
- integration: validation run storage + linkage
- e2e: doc change → model delta visible

---

## Stage 7 — Dashboards

Objective:
- trustworthy KPIs with drilldown provenance

Outputs:
- dashboard builder
- provenance-first tiles (every number has evidence)
- exceptions list and drilldown
- refresh model (manual + scheduled)

Acceptance criteria:
- build dashboard with at least 5 tile types
- drilldown shows evidence + runs + bundles
- when model values change, dashboard indicates deltas and why

Tests:
- e2e: dashboard create + refresh + drilldown

---

## Stage 8 — Workflows (n8n-like)

Objective:
- automate the system: ingest → extract → validate → dashboards → notify

Outputs:
- workflow schema + runner
- workflow builder UI
- triggers:
  - schedule
  - new bundle version
  - validation failure
- node logs, retries, partial success

Acceptance criteria:
- build a workflow that runs on new bundle version and triggers validation
- node-by-node logs visible; failure does not lose audit trace

Tests:
- integration: workflow runner and trigger firing
- e2e: new bundle version triggers workflow

---

## Stage 9 — Production hardening

Objective:
- deployable, secure, observable, performant

Outputs:
- containerization (app + worker)
- environment config (staging/prod)
- secrets management
- audit retention + backups
- observability: logs, metrics, traces
- performance testing and capacity guidance
- security: rate limits, input validation, supply chain scanning

Acceptance criteria:
- one-command deploy to staging
- health checks and rollbacks
- load test passes minimum SLOs for:
  - ingestion throughput
  - streaming responsiveness
- security checks pass (SAST + dependency scans)

