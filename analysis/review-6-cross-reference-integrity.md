# Review 6: Cross-Reference Integrity & Internal Consistency

**Reviewer**: Opus 4.6
**Overall Score: 7.3 / 10**

---

| Category | Score |
|---|---|
| Contradictions between agents | 7/10 |
| Synthesis accuracy | 6/10 |
| Naming consistency | 8/10 |
| Decision conflict resolution propagation | 7/10 |
| Completeness of coverage | 9/10 |
| Number consistency | 7/10 |
| Technology stack consistency | 9/10 |

## 15 Contradictions Found

| # | File A Says | File B Says | Severity |
|---|---|---|---|
| 1 | Agent 6: Rename V2's BL-012 → BL-024 | Agent 4: BL-024 already exists (mental model prompt library) | **HIGH** — secondary collision |
| 2 | Agent 5: DEC-014 says plans as RunEvents, NOT new tables | Agent 5: MIG-0005c creates plan_sets/plans/plan_tasks tables | **HIGH** — internal contradiction |
| 3 | Agent 5: 4-surface update = 4 code touchpoints | Agent 1: 4-surface update = 6 steps (adds fixtures + contract tests) | **MEDIUM** |
| 4 | Agent 5: DEC-045 = "$2/run budget limit" | Agent 5: DEC-045 = "Langfuse self-hosted" | **LOW** — compound decision |
| 5 | Agent 3: EPIC-STUDIO C2 has "typed edges (supports/derived-from/contradicts)" | Agent 4: STUDIO-004 Analysis Canvas has no semantic edges | **MEDIUM** |
| 6 | Agent 6: V2-merged has "45 GAP-* items" | Agent 5/Synthesis: "38 GAP items" | **MEDIUM** — count mismatch |
| 7 | Agent 5: MIG-0005B creates entity/citation tables | Agent 5/Agent 6: BL-016 says extend Artifact, NO new tables | **HIGH** — internal contradiction |
| 8 | Agent 5: QuotaMiddleware returns HTTP 402 | Agent 3: Quota middleware returns HTTP 429 | **MEDIUM** |
| 9 | Agent 4: DocIR = "single most important new technical primitive" | Synthesis: DocIR not mentioned at all | **HIGH** — dropped finding |
| 10 | Agent 1: 6 P0-EXISTENTIAL gaps | Synthesis: only 3 of 6 tracked | **MEDIUM** — 3 dropped |

## Agent Findings Dropped from Synthesis

| Dropped Finding | Source | Impact |
|---|---|---|
| DocIR as key primitive | Agent 4 | HIGH — underpins ALL domain modules |
| Plan storage contradiction (DEC-014 vs 0005c) | Agent 5 | HIGH — affects migration content |
| GAP-014 as critical blocker (LangGraph→SSE contract) | Agent 5 | HIGH — blocks BL-001/BL-002 |
| Cross-milestone risk (STUDIO M3 depends on INTEL M4) | Agent 3 | MEDIUM |
| EntityType naming drift (P0-EXISTENTIAL) | Agent 1 | MEDIUM |
| MESSAGE_DELTA duplication ambiguity (P0-EXISTENTIAL) | Agent 1 | MEDIUM |
| SSE catch-up missing (P0-EXISTENTIAL) | Agent 1 | MEDIUM |
| HTTP 402 vs 429 status code divergence | Agent 3/5 | LOW |

## Number Verification

| Metric | Stated | Actual | Match? |
|---|---|---|---|
| Epics | 30 | 30 | YES |
| Tracks | 5 | 5 | YES |
| Issues | ~424 | 418 (sum of per-epic) | CLOSE (~) |
| Tasks | ~2,970 | 2,968 (418 × 7.1) | YES |
| P0 bugs | 5 | 5 | YES |
| GAP items | 38 | 38 or 45 (conflicting) | NEEDS VERIFICATION |

## 8 Critical Items Requiring Resolution Before V3 is Actionable

1. **Plan storage architecture**: DEC-014 (plans as RunEvents) vs MIG-0005c (new tables). Pick one.
2. **MIG-0005B entity storage**: "create entity/citation tables" vs "extend Artifact, no new tables." Pick one.
3. **BL-024 numbering collision**: Renaming V2's BL-012 to BL-024 collides with existing BL-024.
4. **GAP item count**: Verify 38 vs 45 against source.
5. **HTTP quota status code**: 402 (billing quota) vs 429 (rate limiting) — may need both.
6. **4-surface update rule**: Standardize on one definitive checklist (4-step or 6-step).
7. **DocIR must appear in synthesis**: Agent 4 calls it most important primitive; synthesis omits it.
8. **3 dropped P0-EXISTENTIAL gaps**: EntityType naming drift, MESSAGE_DELTA duplication, SSE catch-up — confirm resolved or add to P0.
