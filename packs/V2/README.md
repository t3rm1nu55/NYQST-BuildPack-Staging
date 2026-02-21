# NYQST Build Pack (v2)

This pack is designed to let multiple agents/engineers build NYQST in parallel **starting from the repo snapshot you provided** (`nyqst-intelli-230126-main`) while staying aligned to **NYQST Platform — Production Intelligence Build Guide v5**.

What’s new vs v1:
- A **repo alignment inventory** and a concrete **spec↔repo delta report** (`repo_alignment/`)
- A refreshed GitHub backlog (**v2**) with:
  - P0 repo fixes
  - Wave-based build sequence (BL-001…)
  - Studio surfaces (Projects / CRM / Decisions / Analysis canvas / Apps / Workflows)
  - Tools/connectors/skills (MCP)
  - Enterprise hardening (SSO/RBAC/audit/billing)
  - Domain module epics (Lease CD, Debt, RegSygnal, PropSygnal, DocuIntelli)
- The original v1 backlog is preserved in `issues_legacy_v1/` for reference.

---

## Pack contents

- `reference/`
  - `NYQST_Platform_Production_Intelligence_Build_Guide_v5.md` (the authoritative spec you provided)
  - `archive/` (clean-room analyses of Dify/SuperAgent and related planning docs)
  - `proposal/` (original proposal docs)
- `repo_alignment/`
  - `00_REPO_INVENTORY.md` (what’s already in the repo)
  - `01_SPEC_DELTA.md` (what to keep vs what to add/change)
- `issues/`
  - `issues.json` (v2 backlog: epics → stories/tasks with acceptance criteria + tests + dependencies)
  - `INDEX.md` (human-readable index)
- `issues_legacy_v1/` (previous backlog, unmodified)
- `docs/` (stage plan, parallelization, standards)
- `contracts/` (schemas, event conventions, GML/GenUI contracts)
- `mockups/` (UI mockups; add more as the Studio UX is refined)
- `github/` (labels/milestones import templates)
- `scripts/` (helpers for issue import/rendering)

---

## How to use this in the GitHub repo

1) Copy folders into the repo (or link them):
- `docs/`, `contracts/`, `issues/`, `github/`, `mockups/`, `scripts/`, `repo_alignment/`, `reference/` (optional)

2) Create labels + milestones:
- labels: `github/labels.yml`
- milestones: `github/MILESTONES.md`

3) Upload issues:
- primary: ingest `issues/issues.json`
- keep the legacy backlog out of GitHub unless you explicitly want it.

4) Start parallel work:
- Start with **M0-P0** (`issues/INDEX.md`) to unblock everything else.
- Then Wave 0 and Wave 1 (planner/fan-out + run events + GenUI/ReportPanel).

---

## What “done” looks like

Production-ready means:
- multi-tenant, auditable, role-based access
- provenance/citations everywhere (reports, decisions, dashboards)
- notebook + context packs + background indexing
- infinite analysis canvas linking artifacts, diffs, and decisions
- apps (configured work units) and workflows (automation)
- deliverables: report + website + slides + document exports
- professional CI, evals, tracing/metrics, and hardening

See `docs/04_BUILD_STAGES_TO_PROD.md`.
