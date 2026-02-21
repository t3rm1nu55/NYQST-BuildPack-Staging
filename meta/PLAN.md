# V4 Build Pack — Consolidation Plan

> **Objective**: See [OBJECTIVE.md](./OBJECTIVE.md)
> **TODO**: See [TODO.md](./TODO.md)
> **Issues**: https://github.com/t3rm1nu55/NYQST-BuildPack-V4/issues

---

## Plan Overview

4 runs, each gated by the previous. No run starts until its predecessor's outputs are verified.

```
Run 1 (Contradictions + Structure) ──→ Run 1.5 (Reviews) ──→ Run 2 (Resequencing) ──→ Run 3 (Final Spec)
     15 issues                              4 issues              22 issues                4 issues
                                                                                     TOTAL: 45 issues
```

---

## Run 1: Resolve Contradictions + Structural Fixes
**Gate**: All 8 contradictions resolved, epic structure corrected
**GitHub Issues**: #1-#15
**Estimated effort**: 1 session (parallel opus agents for decisions)

### 1.1 Resolve 8 Contradictions (Issues #1-#8)
- [ ] #1 Plan storage: DEC-014 (RunEvents) vs MIG-0005c (new tables) → PICK ONE
- [ ] #2 Entity storage: Artifact extension vs new tables → PICK ONE (recommendation: relational for mutable)
- [ ] #3 BL-024 numbering collision → assign new ID
- [ ] #4 GAP item count: verify 38 vs 45 against V2M source
- [ ] #5 HTTP quota status code: 402 vs 429 → may need both
- [ ] #6 4-surface update rule: merge into one checklist
- [ ] #7 DocIR: restore in V4 as platform primitive
- [ ] #8 3 dropped P0-EXISTENTIAL gaps: confirm resolved or add to P0

### 1.2 Epic Structural Changes (Issues #9-#15)
- [ ] #9 Merge "Run Progress & Streaming" into "Orchestration"
- [ ] #10 Merge "Skills" into "Agents & MCP"
- [ ] #11 Fold "Decisions" into "Evidence & Intelligence"
- [ ] #12 Split "Deliverables" into "Report Pipeline" + "Export Formats"
- [ ] #13 Split "Documents & Knowledge" into "Ingestion" + "Analysis"
- [ ] #14 Re-track Notebook and Analysis Canvas from Track A to Track B/C
- [ ] #15 Add 6 missing DAG edges + Contracts/FE Shell as foundation nodes

### Run 1 Exit Criteria
- [ ] All 8 contradiction issues closed with explicit decisions documented
- [ ] Revised epic list produced (should be ~27-28 after merges/splits)
- [ ] Updated DAG sketch (text-based, not HTML yet) with corrected edges
- [ ] Decisions added to DECISION-REGISTER draft

### Run 1 Refresh Checkpoint
After completing Run 1:
1. Re-read [OBJECTIVE.md](./OBJECTIVE.md) — are we still aligned with success criteria?
2. Update [TODO.md](./TODO.md) — mark Run 1 items done, refresh Run 1.5 items
3. Review V4 GitHub issues — close resolved, update descriptions if decisions changed scope
4. Check: did any Run 1 decision invalidate a Run 2 assumption?

---

## Run 1.5: Additional Reviews
**Gate**: Run 1 complete (contradictions resolved, structure corrected)
**GitHub Issues**: #16-#18, #45
**Estimated effort**: 1 session (parallel opus agents)

### 1.5.1 Migration Path Review (Issue #16)
- [ ] Map current codebase (4 migrations, 12 routers, 16 tables, 3-node graph) to V4
- [ ] What extends vs what must be replaced
- [ ] V2M's repo_alignment/01_SPEC_DELTA.md as starting point
- [ ] Define actual first PR

### 1.5.2 Data Model Review (Issue #17)
- [ ] Schema walkthrough: 16+ tables, FKs, indexes
- [ ] Artifact extension viability for each entity type
- [ ] Missing indexes for UI query patterns
- [ ] Expected: 3-5 missing indexes, 2-3 Artifact misfit cases

### 1.5.3 Cost Model Analysis (Issue #18)
- [ ] LLM cost per run type (research, extraction, report generation)
- [ ] Infrastructure cost per tenant per month
- [ ] Margin at 10 customers, at 50 customers
- [ ] Validate $200k/yr enterprise pricing
- [ ] Validate $2/run budget limit vs actual costs

### 1.5.4 Enterprise Procurement Gaps (Issue #45)
- [ ] SOC 2 readiness assessment (audit artifacts, control mapping)
- [ ] DAST/encryption spec (TLS, at-rest encryption, key management)
- [ ] SLA framework (uptime targets, incident response, RTO/RPO)

### Run 1.5 Exit Criteria
- [ ] Data model review findings documented, schema corrections identified
- [ ] Cost model spreadsheet validates pricing or flags issues
- [ ] Migration path document shows clear current→V4 delta
- [ ] Enterprise procurement gaps have mitigation plan or are assigned to EPIC-ENTERPRISE
- [ ] Any findings that affect Run 2 scope are flagged

### Run 1.5 Refresh Checkpoint
After completing Run 1.5:
1. Re-read [OBJECTIVE.md](./OBJECTIVE.md) — did cost model change our priorities?
2. Update [TODO.md](./TODO.md) — mark Run 1.5 done, refresh Run 2 items with new data
3. If cost model shows pricing is unviable, STOP and reconsider before Run 2
4. If data model review finds Artifact model is unviable for entities, update Run 2 scope

---

## Run 2: Commercial Resequencing + New Scope
**Gate**: Run 1 + Run 1.5 complete
**GitHub Issues**: #19-#28, #33-#44
**Estimated effort**: 2-3 sessions (parallel agents for epic design)

### 2.1 Commercial Resequencing
- [ ] #19 Create Wave 0.5: Lease CD MVP (8-10 issues from 4 epics)
- [ ] #22 Reorder domain modules: LeaseCD → DocuIntelli → Debt||RegSygnal → PropSygnal
- [ ] #21 Split ENT into Alpha (with wedge) / Beta (M6)
- [ ] #20 Cut platform scope 30% (GenUI, Workflows, Studio, Apps)
- [ ] #41 Fix wave timing: promote Evidence Schema/RBAC stub/Frontend Shell to M0, defer Clarification Flow

### 2.2 New Scope
- [ ] #24 Add EPIC-NOTIFICATIONS (consider Novu)
- [ ] #26 Add EPIC-EXPORT with Excel generation (CRITICAL — PRD requires lender pack)
- [ ] #23 Add EPIC-COLLABORATION
- [ ] #44 Add EPIC-ONBOARDING (no first-run experience specified)
- [ ] #25 Design 6 shared primitives (Versioned Entity CRUD, Screen Skeleton, Diff Viewer, Calc Engine, Extraction Skill, Provenance Display)

### 2.3 Gap Integration
- [ ] #27 Fold 34 MCP/agentic gaps into revised epic structure
- [ ] #28 Fix SSE tenant isolation (P0 security)
- [ ] #33 Add 11 missing screens to product spec
- [ ] #34 Add 9 missing CRE industry integrations (Yardi, Argus, SharePoint as P0)
- [ ] #43 Resolve 4 under-specified epics (PropSygnal, RegSygnal, Decisions, Design System)

### 2.4 Risk Management
- [ ] #36 Document PG LISTEN/NOTIFY scaling risk and Redis migration path
- [ ] #37 Abstract LangGraph Send() behind interface to prevent platform lock-in
- [ ] #38 Manage 3 scope creep vectors (DocuIntelli concepts, GenUI DSL, Workflow DSL)
- [ ] #40 Fix 6 critical integration ordering problems from coherence review

### 2.5 Evaluation
- [ ] #35 Address 6 competitive feature gaps vs Dify/n8n/LangFlow
- [ ] #39 Evaluate build-vs-buy for Notifications (Novu), Scheduling (Temporal), Feature Flags (Unleash)
- [ ] #42 Fix graph vs synthesis discrepancies (3 naming/track mismatches, Track 0 missing)

### Run 2 Exit Criteria
- [ ] Revised V4 epic list with issue counts per epic
- [ ] Wave 0.5 fully specified (issues, acceptance criteria, dependencies)
- [ ] 6 shared primitive specs (interface, usage points, estimated savings)
- [ ] All 34 MCP/agentic gaps assigned to specific epics and milestones
- [ ] 5 new epics (Notifications, Export, Collaboration, Onboarding + shared primitives) have concept decomposition at same depth as LeaseCD
- [ ] All 11 missing screens assigned to epics
- [ ] 9 CRE integrations prioritised (P0/P1/P2) and assigned to milestones
- [ ] 4 under-specified epics brought to parity depth
- [ ] Risk mitigations documented (PG scaling ADR, Send() abstraction, scope caps)
- [ ] Build-vs-buy decisions made for Notifications, Scheduling, Feature Flags

### Run 2 Refresh Checkpoint
After completing Run 2:
1. Re-read [OBJECTIVE.md](./OBJECTIVE.md) — does the revised plan meet all 8 success criteria?
2. Update [TODO.md](./TODO.md) — mark Run 2 done, prepare Run 3
3. Count issues: did shared primitives actually save 110-160 issues?
4. Check: can a customer USE the product at Wave 0.5 boundary?
5. Run an efficiency sweep (per insight-003): any NEW shared primitives from the added epics?
6. Review V4 GitHub issues — close completed, update any that changed during Run 2

---

## Run 3: Final Specification
**Gate**: Run 2 complete
**GitHub Issues**: #29-#32
**Estimated effort**: 1 session

### 3.1 Final Deliverables
- [ ] #29 Updated dependency DAG HTML (corrected nodes, edges, Track 0 visible)
- [ ] #30 Epic × maturity table (0-10 grid with revised epics)
- [ ] #31 Milestone-by-milestone narrative ("what ships and who can use it")
- [ ] #32 Consolidated decision register additions

### 3.2 Quality Gate
- [ ] Re-run coherence review on final V4 → target 8+/10
- [ ] Re-run commercial review on final V4 → target 8+/10
- [ ] Cross-reference integrity check on final V4
- [ ] All V4 GitHub issues either closed or explicitly deferred with rationale

### Run 3 Exit Criteria
- [ ] V4 Build Pack locked and committed to repo
- [ ] All P0 issues closed
- [ ] Milestone narrative shows customer value at every wave boundary
- [ ] Review scores meet targets (Coherence 8+, Commercial 8+)

### Run 3 Refresh Checkpoint
After completing Run 3:
1. Re-read [OBJECTIVE.md](./OBJECTIVE.md) — final alignment check
2. Update [TODO.md](./TODO.md) — mark all items done or deferred
3. Create new insight files for anything learned during consolidation
4. Archive: commit final state to V4 repo, close remaining issues
5. Prepare handoff: what does the implementation team need to start coding?

---

## Standing Rules (Apply Every Session)

1. **Start every session** by reading: OBJECTIVE.md → PLAN.md → TODO.md (in that order)
2. **End every session** by updating TODO.md with current status
3. **After completing any run**, execute its Refresh Checkpoint
4. **After any epic planning pass**, run efficiency sweep (per insight-003)
5. **When resolving contradictions**, document the decision and rationale in the issue before closing
6. **When context compacts**, the GitHub issues + these files are the recovery mechanism
7. **Reference V4 issues by number** (e.g., "per #19") in all discussion to maintain traceability
