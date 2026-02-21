# NYQST-BuildPack-Staging

Staging repo for consolidating **294 build pack issues** from three source packs (V1, V2, V2M) into the V4 unified build pack for DocuIntelli — a Cognitive ERP platform for regulated enterprise.

## Issue Distribution

| Pack | Issues | Range | Source Label |
|------|--------|-------|-------------|
| V1   | 85     | #1–#85 | `source:v1` |
| V2   | 122    | #86–#207 | `source:v2` |
| V2M  | 87     | #208–#294 | `source:v2m` |

## Quick Start

- **Find an issue by key**: See [MAPPING.md](./MAPPING.md) (e.g. `BL-024` → #142)
- **Filter by pack**: `gh issue list --label source:v1 --limit 100`
- **Filter by V4 meta-issue**: `gh issue list --label v4:9 --limit 50`
- **Read original spec**: `packs/{V1,V2,V2M}/issues/{KEY}.md`

## Related Repos

| Repo | Purpose |
|------|---------|
| [NYQST-BuildPack-V4](https://github.com/t3rm1nu55/NYQST-BuildPack-V4) | 46 meta-issues (transforms, contradictions, structural changes) |
| [NYQST-BuildPack-V1](https://github.com/t3rm1nu55/NYQST-BuildPack-V1) | Source pack: 17 epics, standards framework |
| [NYQST-BuildPack-V2](https://github.com/t3rm1nu55/NYQST-BuildPack-V2) | Source pack: domain modules, enterprise shell |
| [NYQST-BuildPack-V2M](https://github.com/t3rm1nu55/NYQST-BuildPack-V2M) | Source pack: implementation patterns, 45 GAPs |

## Repo Structure

```
MAPPING.md              ← key → staging issue # lookup (294 entries)
analysis/               ← agent analyses (corrected) + 7 review lenses
meta/                   ← V4 OBJECTIVE, PLAN, TODO, label scheme, dependency graph
packs/V1/               ← contracts, docs (15 standards), issues, mockups, research
packs/V2/               ← contracts (+ MCP/GenUI specs), docs, reference, repo_alignment
packs/V2M/              ← reference (decision register, impl plan), repo_audit
methodology/            ← consolidation methodology (8 guides)
insights/               ← 7 design insights
scripts/                ← baseline import script
```
