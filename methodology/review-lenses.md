# 7 Review Lenses for Build Pack Quality

Proven across V3→V4 consolidation. Run all 7 before locking any build pack.

## Lens 1: Coherence & Integration Sequencing

**Question**: Do epics depend on each other in the right order? Are merges/splits needed?

**Checks**:
- Epic boundaries clean (no overlapping responsibilities)
- Dependency DAG has no missing edges
- Foundation nodes exist (contracts, FE shell, standards)
- No epic starts before its dependencies are available
- Track assignments make sense (builder vs intelligence vs enterprise)

**Agent**: Opus. Input: full epic list + DAG + milestone assignment.

## Lens 2: Priority & Commercial Ordering

**Question**: Does the plan produce revenue at the earliest possible milestone?

**Checks**:
- Wedge product milestone (should be ≤ M2)
- Effort allocation: revenue tracks vs platform tracks (target: ≥40% on revenue)
- Every milestone boundary delivers usable customer value
- Platform features scoped to what wedge needs, not full generality
- Domain module ordering reflects market priority

**Agent**: Opus. Input: milestone plan + epic assignments + effort estimates.

## Lens 3: Feature Completeness

**Question**: Is the feature set sufficient for the target market?

**Checks**:
- All screens mapped (list, detail, create, edit, settings for each entity)
- Industry integrations present (specific to domain)
- Table-stakes features (notifications, export, collaboration, onboarding)
- Each domain module at sufficient concept depth
- Competitive parity on basic features

**Agent**: Opus. Input: full epic decomposition + PRD + competitor analysis.

## Lens 4: MCP & Agentic Architecture

**Question**: Is the agentic/MCP build-out complete and secure?

**Checks**:
- MCP tools: discovery, versioning, permissions, error handling
- Agent lifecycle: spawn, monitor, cancel, retry, fan-out
- Context engineering: token budgets, retrieval, inheritance
- LLM integration: multi-provider, structured output, cost tracking
- Security: tool injection, tenant isolation, rate limiting, PII handling

**Agent**: Opus. Input: agentic epic specs + existing codebase capabilities.

## Lens 5: Standards & Quality Framework

**Question**: Are engineering standards production-grade?

**Checks**:
- Testing tiers defined with specific tools and triggers
- CI/CD pipeline specified (jobs, gates, environments)
- Security threat model (attack vectors, mitigations)
- Definition of Done (PR-level + milestone-level)
- Golden fixtures and contract testing
- Enterprise procurement requirements (SOC 2, SLAs, etc.)

**Agent**: Opus. Input: standards section of build pack.

## Lens 6: Cross-Reference Integrity

**Question**: Are all sources consistent with each other and the synthesis?

**Checks**:
- No contradictions between source documents
- Synthesis preserves all findings from inputs (nothing silently dropped)
- Counts match (gap items, epics, issues)
- Naming consistent (same entity = same name everywhere)
- Decision register entries match actual plan content

**Agent**: Opus. Input: all source documents + synthesis.

## Lens 7: Meta-Review (Design Efficiency & Risks)

**Question**: What did we miss? What can we simplify?

**Checks**:
- Shared primitives hiding in multiple epics
- Duplicate work across epics
- Over-engineering to cut (simpler v1 alternatives)
- Build-vs-buy opportunities
- Architectural bets that could fail
- Scope creep vectors
- Performance cliffs
- Vendor lock-in risks
- What other reviews would help

**Agent**: Opus. Input: all 6 prior reviews + full build pack.

## Scoring

Each lens produces a score out of 10. Targets before locking:
- Coherence: 8+
- Commercial: 8+
- Completeness: 7+
- MCP/Agentic: 6+
- Standards: 8+
- Cross-Reference: 8+
- Meta: qualitative (no numeric target)

## Dispatch Pattern

Run lenses 1-6 in parallel (independent). Run lens 7 after 1-6 complete (it synthesizes them).
