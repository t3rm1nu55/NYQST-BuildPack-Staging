# Dependencies and ordering

This document is for planning parallel execution without breaking contracts.

Rule: **lock contracts early**, then allow parallel build against them.

---

## Dependency layers

Layer 0 — Repo baseline (must be stable)
- services run locally
- migrations run
- unit + integration tests pass
- CI green

Layer 1 — Core primitives
- tenancy/auth
- artifacts + storage
- runs + events
- streaming contracts
- job runner (worker) stable

Layer 2 — Work objects
- bundles + versions + ingest pipeline
- evidence + insights
- apps + app runs
- notebook + canvas (skeleton)

Layer 3 — Intelligence systems
- CRM entities + relationships
- models + validation
- dashboards + provenance
- workflows + triggers

Layer 4 — Production hardening
- containerization and deploy
- observability and alerting
- security controls
- performance and load testing
- backup/restore, migrations, SRE runbooks

---

## Ordering DAG (Mermaid)

```mermaid
graph TD
  A[Baseline + P0 fixes + CI] --> B[Core contracts: events, app schema, bundle schema]
  B --> C[Apps backend + run logs]
  B --> D[Studio shell: notebook + canvas]
  B --> E[Documents: bundles + versions + ingest]
  E --> F[Evidence + insights]
  C --> G[App outputs to Studio]
  F --> H[CRM linkages]
  H --> I[Models + validation]
  I --> J[Dashboards w/ provenance]
  C --> K[Workflows (run app as node)]
  E --> K
  I --> K
  A --> L[Production hardening (parallel late)]
  J --> L
  K --> L
```

---

## Parallel tracks (recommended)

Track A — Core backend
- P0 fixes
- events + streaming
- runs + audit
- worker + queues

Track B — Documents backend
- bundles + versions
- ingest pipeline
- diff algorithms

Track C — Intelligence backend
- evidence + insights
- CRM entities + relationships
- model registry + validation

Track D — Frontend foundations
- navigation + routing
- Apps screens
- Studio shell (canvas + notebook)
- Documents screens

Track E — Workflow system
- workflow schema + runner
- workflow builder UI
- triggers/scheduler

Track F — Testing + platform engineering
- contract tests
- e2e harness + fixtures
- CI/CD + preview environments
- security + performance harness

---

## “Contract first” set (must be completed before most parallel work)

- Event types and payload shapes (SSE/RunEvent)
- Artifact/entity types and provenance rules
- Bundle/version schema and ingestion run outputs
- App schema: inputs, context pack, outputs mapping, triggers
- Core API route naming and pagination conventions

See `contracts/00_index.md`.

