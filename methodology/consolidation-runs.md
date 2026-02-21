# Consolidation Runs

Gated process for turning raw agent outputs + reviews into a locked build pack.

## Structure

4 runs, each gated by the previous. No run starts until predecessor outputs are verified.

```
Run 1 (Contradictions + Structure) → Run 1.5 (Reviews) → Run 2 (Resequencing) → Run 3 (Final Spec)
```

## Run 1: Resolve Contradictions + Structural Fixes

**Purpose**: Eliminate internal inconsistencies, correct epic structure.

**Input**: Cross-reference integrity audit findings, coherence review findings.

**Work**:
- Resolve all contradictions (data model, naming collisions, count discrepancies, semantic conflicts)
- Execute epic merges/splits identified by coherence review
- Correct DAG edges and foundation node gaps

**Exit Criteria**:
- All contradiction issues closed with explicit decisions documented
- Revised epic list produced (count should decrease from merges, increase from splits)
- Updated DAG sketch with corrected edges
- Decisions added to decision register draft

## Run 1.5: Additional Reviews

**Purpose**: Validate assumptions that affect downstream planning.

**Input**: Run 1 outputs (clean epic structure, resolved contradictions).

**Work**:
- Data Model Review (schema viability, missing indexes, FK constraints)
- Cost Model Analysis (LLM cost/run, infra cost/tenant, pricing validation)
- Migration Path Review (current codebase → target delta, what extends vs replaces)
- Any domain-specific reviews flagged by meta-review

**Exit Criteria**:
- Each review documented with findings and recommendations
- Any findings that invalidate Run 2 assumptions are flagged
- GO/NO-GO decision on pricing model

## Run 2: Commercial Resequencing + New Scope

**Purpose**: Reorder for revenue, add missing scope, integrate gaps.

**Input**: Run 1.5 outputs (validated data model, confirmed pricing, migration path).

**Work**:
- Commercial resequencing (wedge product first, domain modules reordered)
- Scope adjustments (cut over-engineering, add missing features)
- New epic design (at same depth as existing epics)
- Gap integration (fold all identified gaps into epic structure)
- Risk management (scaling risks, lock-in, scope creep vectors)
- Build-vs-buy evaluation

**Exit Criteria**:
- Revised epic list with issue counts per epic
- Wedge product fully specified
- Shared primitive specs (interface, usage points, estimated savings)
- All gaps assigned to specific epics and milestones
- Risk mitigations documented
- Build-vs-buy decisions made

## Run 3: Final Specification

**Purpose**: Produce lockable build pack with quality scores meeting targets.

**Input**: Run 2 outputs (commercially sequenced, gap-integrated, risk-managed plan).

**Work**:
- Updated dependency DAG (HTML visualization)
- Epic × maturity table
- Milestone narrative ("what ships and who can use it")
- Decision register additions
- Quality gate: re-run all review lenses, target 8+/10

**Exit Criteria**:
- Build pack locked and committed
- All P0 issues closed
- Review scores meet targets
- Milestone narrative shows customer value at every boundary

## Standing Rules

1. **Start every session** by reading: OBJECTIVE.md → PLAN.md → TODO.md
2. **End every session** by updating TODO.md
3. **After completing any run**, execute its Refresh Checkpoint (see refresh-checkpoints.md)
4. **After any epic planning pass**, run efficiency sweep (see efficiency-sweep.md)
5. **When resolving contradictions**, document decision + rationale in the issue before closing
6. **Reference issues by number** in all discussion to maintain traceability
