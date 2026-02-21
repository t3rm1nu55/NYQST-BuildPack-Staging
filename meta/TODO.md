# V4 Build Pack — TODO

> **Objective**: See [OBJECTIVE.md](./OBJECTIVE.md)
> **Plan**: See [PLAN.md](./PLAN.md)
> **Issues**: https://github.com/t3rm1nu55/NYQST-BuildPack-V4/issues
>
> Last updated: 2026-02-21 (session 5 — Source repos populated with 294 build pack issues)

---

## Pre-Run 1: Repo & Issue Quality Audit (COMPLETE)

All repos verified, all V4 issues uplifted with template-compliant proposals.

- [x] Audit V1 repo ✓
- [x] Audit V2 repo ✓
- [x] Audit V2M repo ✓
- [x] Audit V4 repo ✓
- [x] Audit V4 issues — 30 proposals applied (session 4 Phase 4 audit)
- [x] Fix any gaps found — #46 created for missing Frontend Shell epic

---

## Source Repo Population (session 5 — COMPLETE)

294 build pack issues created in source repos from original zip import scripts.

- [x] V1: 85 build pack issues created (+ 11 meta = 96 total) in `t3rm1nu55/NYQST-BuildPack-V1`
- [x] V2: 122 build pack issues created (+ 11 meta = 133 total) in `t3rm1nu55/NYQST-BuildPack-V2`
- [x] V2M: 87 build pack issues created (+ 11 meta = 98 total) in `t3rm1nu55/NYQST-BuildPack-V2M`
- [x] Labels created in all 3 repos (V1=30, V2=78, V2M=44)
- [x] Milestones created in all 3 repos (V1=11, V2=14, V2M=10)
- [x] Issue templates applied to V1 and V2 (`.github/ISSUE_TEMPLATE/`)
- [ ] Apply label colors from `github/labels.yml` to V1 and V2
- [ ] Sonnet verification — spot-check issues match source files
- [ ] Commit new import scripts (`V1/scripts/gh_import_issues.py`, `V2/scripts/gh_import_issues.py`)

---

## Pipeline: Source → Staging → V4

- [x] **Step 1**: Populate source repos with build pack issues (294 issues)
- [ ] **Step 2**: Sonnet verification of source repo issues
- [ ] **Step 3**: Create staging repo for analysis + transform tasks
- [ ] **Step 4**: Run transforms into V4
- [ ] **Step 5**: Verify 46 V4 meta-issues still stand
- [ ] **Step 6**: Address V4 #47 (created from agent outputs — wrong approach)

---

## Status Summary

| Run | Status | Issues | Done | Remaining |
|-----|--------|--------|------|-----------|
| Run 1: Contradictions + Structure | **NOT STARTED** | #1-#15 | 0/15 | 15 |
| Run 1.5: Reviews | BLOCKED (by Run 1) | #16-#18, #45 | 0/4 | 4 |
| Run 2: Resequencing + New Scope | BLOCKED (by Run 1.5) | #19-#28, #33-#46 | 0/23 | 23 |
| Run 3: Final Spec | BLOCKED (by Run 2) | #29-#32 | 0/4 | 4 |
| **TOTAL** | | | **0/46** | **46** |

---

## Current Focus: Run 1 — Resolve Contradictions + Structural Fixes

### P0 Contradictions (must resolve first)
- [ ] **#2** Plan storage: DEC-014 (RunEvents) vs MIG-0005c (new tables)
- [ ] **#3** Entity storage: Artifact extension vs new tables
- [ ] **#6** DocIR: restore in V4 synthesis

### P1 Contradictions
- [ ] **#4** BL-024 numbering collision
- [ ] **#1** GAP item count: verify 38 vs 45
- [ ] **#8** 4-surface update rule: merge 4-step and 6-step
- [ ] **#5** 3 dropped P0-EXISTENTIAL gaps

### P2 Contradictions
- [ ] **#7** HTTP quota status code: 402 vs 429

### Epic Structural Changes
- [ ] **#9** Merge "Run Progress & Streaming" → "Orchestration"
- [ ] **#10** Fold "Decisions" → "Evidence & Intelligence"
- [ ] **#11** Merge "Skills" → "Agents & MCP"
- [ ] **#12** Split "Deliverables" → "Report Pipeline" + "Export Formats"
- [ ] **#13** Add 6 missing DAG edges
- [ ] **#14** Re-track Notebook + Analysis Canvas to Track B/C
- [ ] **#15** Split "Documents & Knowledge" → "Ingestion" + "Analysis"

### Run 1 Exit Checklist
- [ ] All 8 contradiction issues closed with decisions documented
- [ ] Revised epic list (~27-28 epics) produced
- [ ] Updated DAG sketch with corrected edges
- [ ] Decisions added to register draft
- [ ] Re-read OBJECTIVE.md for alignment
- [ ] Update this TODO
- [ ] Review V4 GitHub issues

---

## Upcoming: Run 1.5 — Reviews (blocked by Run 1)

- [ ] **#16** Migration Path Review (current codebase → V4 delta)
- [ ] **#17** Data Model Review (schema walkthrough, Artifact viability, missing indexes)
- [ ] **#18** Cost Model Analysis (LLM cost/run, infra cost/tenant, pricing validation)
- [ ] **#45** Enterprise Procurement Gaps (SOC 2, DAST, SLA framework)

---

## Upcoming: Run 2 — Resequencing + New Scope (blocked by Run 1.5)

### Commercial Resequencing
- [ ] **#19** Wave 0.5: Lease CD MVP (demo in 8 weeks)
- [ ] **#22** Domain module reorder (LeaseCD first)
- [ ] **#21** ENT Alpha/Beta split
- [ ] **#20** Platform scope cut 30%
- [ ] **#41** Fix wave timing (promote Evidence Schema/RBAC stub/FE Shell to M0)

### New Scope
- [ ] **#24** EPIC-NOTIFICATIONS (consider Novu)
- [ ] **#26** EPIC-EXPORT (Excel — CRITICAL for lender pack)
- [ ] **#23** EPIC-COLLABORATION
- [ ] **#44** EPIC-ONBOARDING (no first-run experience specified)
- [ ] **#46** EPIC-FRONTEND-SHELL (restore V1 STORY-FE-001, ~12 issues, M0)
- [ ] **#25** 6 shared primitives design (saves 110-160 issues)

### Gap Integration
- [ ] **#27** Fold 34 MCP/agentic gaps
- [ ] **#28** SSE tenant isolation fix (P0 security)
- [ ] **#33** Add 11 missing screens to product spec
- [ ] **#34** Add 9 CRE integrations (Yardi, Argus, SharePoint as P0)
- [ ] **#43** Resolve 4 under-specified epics (PropSygnal, RegSygnal, Decisions, Design System)

### Risk Management
- [ ] **#36** PG LISTEN/NOTIFY scaling risk → Redis migration ADR
- [ ] **#37** Abstract LangGraph Send() behind interface
- [ ] **#38** Cap 3 scope creep vectors (DocuIntelli, GenUI DSL, Workflow DSL)
- [ ] **#40** Fix 6 integration ordering problems

### Evaluation
- [ ] **#35** 6 competitive feature gaps vs Dify/n8n/LangFlow
- [ ] **#39** Build-vs-buy: Notifications, Scheduling, Feature Flags
- [ ] **#42** Fix graph vs synthesis discrepancies

---

## Upcoming: Run 3 — Final Spec (blocked by Run 2)

- [ ] **#29** Milestone narrative ("what ships and who can use it")
- [ ] **#30** Decision register additions
- [ ] **#31** Epic × maturity table (0-10)
- [ ] **#32** Updated dependency DAG HTML
- [ ] Re-run coherence review → target 8+
- [ ] Re-run commercial review → target 8+
- [ ] Cross-reference integrity check

---

## Standing Reminders

- **Session start**: Read OBJECTIVE.md → PLAN.md → TODO.md
- **Session end**: Update this file
- **After any run**: Execute Refresh Checkpoint (see PLAN.md)
- **After epic planning**: Efficiency sweep (insight-003)
- **Context recovery**: GitHub issues + these 3 files = full state

---

## Context Recovery Quick Reference

If starting a new session after context loss:

1. Read these 3 files: OBJECTIVE.md, PLAN.md, TODO.md (all at /Users/markforster/NYQST-BuildPacks/V4/)
2. Check V4 issues: `gh issue list --repo t3rm1nu55/NYQST-BuildPack-V4 --state open`
3. Read latest review files at: /Users/markforster/AirTable-SuperAgent/docs/analysis/v3-merge/
4. Read insights at: /Users/markforster/AirTable-SuperAgent/docs/insights/
5. Read memory at: /Users/markforster/.claude/projects/-Users-markforster-AirTable-SuperAgent/memory/MEMORY.md
6. V1/V2/V2M source packs at: /Users/markforster/NYQST-BuildPacks/{V1,V2,V2M}
