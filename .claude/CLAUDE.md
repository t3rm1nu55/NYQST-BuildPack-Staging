# NYQST-BuildPack-Staging — Project Instructions

## What This Is

Staging repo for consolidating 294 build pack issues from V1/V2/V2M into the V4 build pack.
Each staging issue is a real build pack item (story, epic, task, gap, migration step).
V4 meta-issues describe transforms to apply to these staging issues.

## Session Start

1. Read `meta/OBJECTIVE.md` — success criteria
2. Read `meta/PLAN.md` — run structure and exit criteria
3. Read `meta/TODO.md` — current status
4. Check `MAPPING.md` — key-to-issue-number lookup

## Issue Ranges

| Pack | Staging Range | Source Label | Count |
|------|---------------|-------------|-------|
| V1   | #1–#85        | `source:v1`  | 85    |
| V2   | #86–#207      | `source:v2`  | 122   |
| V2M  | #208–#294     | `source:v2m` | 87    |

## Key Lookup

Use `MAPPING.md` at repo root. Example: `BL-024` → Staging #142.
Or filter by label: `gh issue list --repo t3rm1nu55/NYQST-BuildPack-Staging --label source:v2 --limit 200`

## V4 Meta-Issues

V4 issues describe transforms (contradictions, merges, splits, additions):
`gh issue list --repo t3rm1nu55/NYQST-BuildPack-V4 --state open`

Cross-reference labels on staging issues (e.g. `v4:2`, `v4:9`) indicate which V4 meta-issue affects them.

## Repo Structure

```
MAPPING.md              ← key → staging issue # lookup
analysis/               ← agent-1..6, review-1..7, v3-synthesis (corrected)
meta/                   ← V4 OBJECTIVE, PLAN, TODO, label scheme, HTML graphs
packs/V1/               ← V1 source files (contracts, docs, issues, mockups, research)
packs/V2/               ← V2 source files (+ reference, repo_alignment)
packs/V2M/              ← V2M source files (reference, repo_audit)
methodology/            ← consolidation methodology from Standards
insights/               ← 7 design insights from Standards
scripts/                ← import script
.github/ISSUE_TEMPLATE/ ← templates for new issues
```

## Working With Issues

- **Read original spec**: `packs/{V1,V2,V2M}/issues/{KEY}.md` or `/issues/export/{key}.json`
- **Read staging issue**: `gh issue view N --repo t3rm1nu55/NYQST-BuildPack-Staging`
- **Edit staging issue**: `gh issue edit N --repo t3rm1nu55/NYQST-BuildPack-Staging ...`
- **Reference contracts**: `packs/{V1,V2}/contracts/` for JSON schemas and API routes
- **Check V4 meta-issue**: `gh issue view N --repo t3rm1nu55/NYQST-BuildPack-V4`

## Standing Rules

- Reference issues by `#N` (staging) or `V4 #N` (meta) for traceability
- Do not close V4 meta-issues without documenting the decision in the issue body
- Update `meta/TODO.md` at end of every session
- After completing any run, execute its Refresh Checkpoint (see `meta/PLAN.md`)
