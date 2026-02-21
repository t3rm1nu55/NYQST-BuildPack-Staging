# NYQST Build Pack v2 — extended issues + repo alignment

This pack is a working backlog and alignment bundle generated from:
- The “Production Intelligence Build Guide v5” (compressed spec)
- The clean-room Dify/Superagent pattern analysis in the archive
- The current `nyqst-intelli-230126-main` repo state (code + docs)

What you get:
1) A repo capability matrix and an alignment report (what exists, what’s missing, what diverges).
2) An expanded GitHub-issue backlog (BL items + migrations + P0 fixes + gaps + extensions).
3) Machine-readable exports for importing issues into GitHub.

Key principle:
Do not assume an epic is “done” because starter code exists. Most epics are *partial* until they meet the success criteria in Build Guide v5.

## Folder map

- `reference/`
  - Build Guide v5 (compressed)
  - Implementation plan + backlog
  - Clean-room patterns (backend/frontend/integration)
  - Gap analysis + platform ground truth
  - Repo PRD/planning/ADR docs (copied for convenience)

- `repo_audit/`
  - `CAPABILITY_MATRIX.md` (+ CSV)
  - `REPO_ALIGNMENT.md`
  - `RUN_EVENT_CONTRACT_DIFF.md`

- `issues/`
  - `INDEX.md` (generated index by milestone)
  - `epics/` (one file per milestone)
  - `items/` (one Markdown file per issue body)
  - `export/issues.json` + `export/issues.csv`

- `scripts/`
  - `gh_import_issues.py` (creates issues via `gh issue create`)
  - `gh_setup_labels_milestones.md` (labels/milestones list)

## How to use

1) Read `repo_audit/REPO_ALIGNMENT.md` and `repo_audit/CAPABILITY_MATRIX.md`.
2) Triage milestones in this order:
   - `P0: Stabilization`
   - `M0: Foundation`
   - `M1: Agents & Streaming`
   - `M2: Planner & Entities`
   - `M3: Deliverables`
   - `M4: Hardening & Launch`
3) Create GitHub milestones + labels (see `scripts/gh_setup_labels_milestones.md`).
4) Import issues:
   - `python scripts/gh_import_issues.py --repo OWNER/REPO --dry-run`
   - then run without `--dry-run`

## Notes on alignment

- The repo already has Vercel AI SDK streaming wired (`POST /api/v1/agent/chat`) and a run-event SSE stream (`GET /api/v1/streams/runs/{run_id}`).
- The biggest “contract gap” is RunEvent v1: the typed 22-event union + 4-surface rollout described in the build guide is not implemented yet.
- Multi-tenancy (tenant_id on core tables), billing, and entity/citation persistence are missing and should be treated as foundation, not polish.

