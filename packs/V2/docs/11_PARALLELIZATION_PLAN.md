# Parallelization plan (tracks + handoffs)

This is how to run multiple agents/developers without blocking.

---

## Track 1 — Platform core (backend)
Scope:
- runs + events + streaming contracts
- worker + job system
- auth/tenancy enforcement

Primary deliverables:
- stable streaming contract fixtures
- run log correctness under concurrency
- “golden path” API surfaces

Handoffs:
- event schema used by frontend
- run detail API used by UI

---

## Track 2 — Frontend shell + Apps UI
Scope:
- navigation + routes
- Apps gallery + detail screens
- run history + run detail pages (fixtures first)

Handoffs:
- contract fixtures drive UI before backend integration
- later integrate to live endpoints

---

## Track 3 — Studio (canvas + notebook)
Scope:
- canvas component, block system, inspector, edges
- notebook pages + citations/evidence embeds
- pinning outputs to canvas

Handoffs:
- consumes contracts for evidence/insights/app outputs
- produces UI events that create artifacts via API

---

## Track 4 — Documents (bundles + versions + ingest + diff)
Scope:
- document storage and versioning
- ingest pipeline
- diff outputs
- documents UI screens

Handoffs:
- evidence created by extraction pipeline
- diffs pinned into studio

---

## Track 5 — Intelligence (CRM + insights + models + dashboards)
Scope:
- CRM entity model and UI
- insights lifecycle
- model registry + validation
- dashboards with provenance drilldown

Handoffs:
- models consume evidence
- dashboards consume validated model outputs

---

## Track 6 — Workflows
Scope:
- workflow schema + runner
- triggers + schedules
- workflow builder UI

Handoffs:
- workflows call apps, ingest, validation; consume run events

---

## Track 7 — Platform engineering (CI/CD, testing, hardening)
Scope:
- CI pipelines
- contract tests
- Playwright suite
- containerization + deploy scripts

Handoffs:
- provides scaffolding for every other track

