# NYQST Build Pack (v1)

This zip is a starter pack to take NYQST from “spec + mockups” to a parallelizable, professional build program.

It contains:
- Dependency-aware **build stages** (baseline → production hardening)
- A GitHub issue backlog (**epics → stories → tasks**) with acceptance criteria and test plans
- **Contracts** (schemas + streaming event conventions) so frontend/backend can work in parallel
- **Dev environment**, coding standards, testing strategy, CI/CD guidance
- Two UI mock options:
  - **React mock** (drop-in): `mockups/NyqstPortalMockupV2.tsx`
  - **Standalone HTML** (no build tools): `mockups/standalone/index.html`

Included research inputs:
- `research/COMPRESSED-BUILD-SPEC.md`
- `research/NYQST_Platform_Proposal_Docs/*` (extracted)
- the original proposal zip

Also included:
- `docs/13_CROSSWALK_TO_COMPRESSED_BUILD_SPEC.md` mapping the compressed spec domains to epics/issues.

---

## How to use this pack in your repo

1) Copy in:
- `docs/`
- `contracts/`
- `github/`
- `issues/`
- `mockups/`
- `scripts/`

2) Create GitHub labels + milestones:
- labels: `github/labels.yml`
- milestones: `github/MILESTONES.md`

3) Upload issues:
- primary: agents ingest `issues/issues.json`
- optional: `python scripts/render_gh_issue_commands.py --repo OWNER/REPO > gh_issues.sh`

4) Start parallel work:
- use `docs/11_PARALLELIZATION_PLAN.md`
- begin with Stage 0 and Stage 1 in `docs/04_BUILD_STAGES_TO_PROD.md`

---

## What “done” looks like

Production-ready means:
- multi-tenant, auditable system
- robust document versioning + diffing
- notebook + infinite canvas analysis
- apps (configured work units) and workflows (automation)
- models + validation + dashboards with provenance
- professional CI (unit/integration/contract/e2e), observability, security hardening, and deploy pipeline

See `docs/04_BUILD_STAGES_TO_PROD.md`.

