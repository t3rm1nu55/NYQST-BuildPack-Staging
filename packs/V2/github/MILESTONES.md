# Milestones (v2)

These milestones match the v2 issue backlog in `issues/`. Use them directly in GitHub or map them onto your internal roadmap.

## M0-P0 — Repo stabilization

- Fix arq worker function registration
- Fix run_event sequencing race
- Add tenant_id to runs
- Make Redis always-on in dev compose
- Add CI on PR

## M1-W0 — Wave 0: orchestrated research harness

- Planner → fan-out workers → synth DataBrief
- RunEvent contract extensions (plan/report/citation events)
- Web research tools + provenance

## M2-W1 — Wave 1: GenUI + ReportPanel + plan UX

- GenUI descriptor validation + renderer
- GML ReportPanel + healer
- Report preview streaming
- PlanSet persistence + PlanViewer

## M3-W2 — Wave 2: deliverables + context

- Deliverable selection per message + DeliverableStore
- Entity/Citation substrate
- Context packs + inheritance + background indexing
- Slides + website + document generation pipelines
- RAG quality improvements (hybrid + rerank + filters)

## M4-W3 — Wave 3: polish

- Generation overlay
- Clarification loop
- Shared DataBrief reuse across deliverables

## M5-STUDIO — Studio surfaces

- Projects + CRM clients + Decisions
- Analysis canvas + diff viewer
- Apps and workflow builder MVP

## M5-PLUGINS — MCP tools + connectors + skills

- Tool registry + enablement per scope
- Connector framework + one production connector
- Skills registry + packaging

## M6-ENTERPRISE — Enterprise baseline

- OIDC SSO
- RBAC/ABAC enforcement
- Audit log coverage + UI
- Billing/metering and quotas
- Data export/deletion

## M6-OBS — Observability and evals

- Tracing integration
- Metrics and health endpoints
- Evals in CI + nightly suite
- Load testing harness

## M7-DOCUINTELLI — DocuIntelli module

- Corpus/bundles + DocIR pipeline
- Cross-framework reconciliation, dimension discovery, anomaly detection, visualization

## M8-LEASECD — Lease CD module

- Lease extraction + deterministic cashflow engine + UI

## M9-DEBT — Debt module

- Term extraction + deterministic amortization/covenant engine + dashboards

## M10-REGSYGNAL — RegSygnal module

- Regulatory ingestion + mapping + dashboards

## M11-PROPSYGNAL — PropSygnal module

- Asset model + signal ingestion + dashboards
