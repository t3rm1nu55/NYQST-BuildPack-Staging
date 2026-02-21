# Review 1: Coherence & Integration Sequencing

**Reviewer**: Opus 4.6
**Overall Score: 6.2 / 10**

---

| Area | Score | Key Issue |
|---|---|---|
| Logical coherence (epic structure) | 6/10 | Merge/split needed for 5 epics; 2 mis-tracked |
| Integration sequencing | 5/10 | 6 ordering problems, auth/evidence timing critical |
| Dependency gaps | 6/10 | 6 missing edges, Contracts node entirely absent from graph |
| Circular/impossible paths | 8/10 | No hard deadlocks, 2 soft circles resolvable |
| Wave/milestone timing | 6/10 | Evidence schema, RBAC stub, shell need promotion; GAPs need triage |

## Epics That Should Be Merged

1. **"Run Progress & Streaming" → absorb into "Orchestration"** — SSE lifecycle is inseparable from the orchestrator that emits events. BL-002 already tightly coupled to BL-001. Separate epic creates ambiguous ownership.

2. **"Skills" → merge into "Agents & MCP"** — V2-merged correctly defers skills to NX-001 (M5+). Skill registry is a sub-feature of the agent system, not an independent epic.

3. **"Decisions" (8 issues) → fold into "Evidence & Intelligence" or "Analysis Canvas"** — Too thin to be an epic.

## Epics That Should Be Split

1. **"Deliverables" (22 issues) → "Report Pipeline" + "Export Formats"** — Combines report generation, website co-gen, slides, DOCX/PDF. These are distinct wave items with different async patterns.

2. **"Documents & Knowledge" (18 issues) → "Document Ingestion" (C1-C3) + "Document Analysis" (C4-C6)** — Extraction pipeline depends on EPIC-INTEL (evidence schema), creating circular concern.

## Epics Mis-Tracked

- **Notebook**: Track A (Platform Core) → should be Track B/C (Builder/Intelligence surface)
- **Analysis Canvas**: Track A → should be Track B/C

## 6 Critical Integration Ordering Problems

1. **Auth before Agents**: Graph correct, but V3 synthesis milestones have NO early RBAC. Minimal RBAC stub (`authorize(user, action, resource)`) must exist at M0.

2. **Documents ↔ Intelligence circular dependency**: Evidence *schema* must be defined in EPIC-CONTRACTS before either epic starts. Split EPIC-INTEL into "Evidence Schema & Storage" (M1-M2) and "Intelligence Features" (M4).

3. **Frontend Shell is a phantom dependency**: Not in the DAG at all. Every feature epic with UI components implicitly depends on it.

4. **GenUI before Deliverables timing gap**: Wave 2 generates reports that nobody can see until Wave 3. Move BL-009 (ReportRenderer, fixture-driven) to Wave 1.

5. **MCP Tools before Orchestrator**: BL-003 has NO dependency on BL-001. Split "Agents & MCP" into "MCP Tool Registration" (Wave 0) and "Agent Runtime" (Wave 1).

6. **Billing before Quota Enforcement timing gap**: Orchestrator ships at M1 with no cost guard. Document two-tier cost control: Tier 1 (M1) = LangGraph state budget, Tier 2 (M4) = HTTP quota middleware.

## 6 Missing DAG Edges

1. Orchestration → Evidence & Intelligence
2. Evidence → Dashboards
3. Evidence/Models → Workflows
4. Design System → Frontend Shell
5. **Contracts → nearly everything** (CRITICAL: Contracts node entirely absent from graph)
6. Observability → Billing (token counts needed for cost computation)

## Wave Timing Fixes

### Promote Earlier
- Evidence Schema: M4 → M0
- Minimal RBAC stub: M6 → M0
- Frontend Shell: unassigned → M0
- Observability token counting hook: M6 → M1

### Defer Later
- Clarification Flow (BL-021): Wave 2 → Wave 3/M5 (DEC-047 already defers UI to v1.5)

### Parallelize Domain Modules
- M7: DocuIntelli (gates domain modules)
- M8 (parallel): LeaseCD + Debt (both use DocIR + extraction + calc engine)
- M9 (parallel): RegSygnal + PropSygnal (both use DocIR + connectors + dashboards)

## GAP Triage (38 items cannot be one sprint)

- **P0**: GAP-022 (TOCTOU race), GAP-023 (arq empty functions)
- **M0**: GAP-014 (LangGraph→SSE contract), GAP-017 (Markup AST), GAP-015 (fallback chain)
- **Ongoing**: GAP-001 through GAP-013 (documentation corrections)
- **M4+**: GAP-028 (migration content), GAP-038 (CI/CD)

## HTML Graph vs Synthesis Discrepancies

- HTML graph: 27 epics / 4 tracks / 7 layers
- Synthesis: 30 epics / 5 tracks
- Track 0 (Contracts, Standards) entirely missing from graph
- Frontend Shell missing from graph
- "Research & Query" in graph but NOT in synthesis (naming inconsistency with "Orchestration")
