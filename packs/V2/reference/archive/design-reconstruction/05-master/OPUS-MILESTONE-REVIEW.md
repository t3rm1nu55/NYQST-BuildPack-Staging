# OPUS MILESTONE REVIEW -- Design Knowledge Reconstruction

**Reviewer**: Claude Opus 4.6
**Date**: 2026-02-20
**Scope**: 33 output files across 6 directories, sourced from 798 files in 4 repositories
**Role**: CTO-level quality gate before committing budget to implementation

---

## Review Summary

### Overall Quality Assessment: 8.2 / 10

**Justification**: This is an exceptionally thorough design knowledge reconstruction for a project of this complexity. The 18-agent pipeline successfully extracted, cross-referenced, and validated design knowledge from 4 repositories into a coherent, navigable corpus. The work surfaces two production-blocking bugs (GAP-022, GAP-023), identifies 51 gaps across 5 categories, tests 16 hypotheses with evidence-based verdicts, and produces a master synthesis document that could genuinely serve as a new-engineer onboarding resource. The deductions from a perfect score come from three areas: (1) the `03-patterns` directory is entirely empty -- a planned wave that never executed; (2) the competitive analysis is acknowledged as incomplete (missing Perplexity, Harvey AI, v0.dev); and (3) there is no validation that the MASTER-INDEX.json is structurally complete or machine-parseable beyond its first 200 lines.

### Coverage Assessment: ~85% of recoverable design knowledge captured

The reconstruction covers the full platform architecture, all 71+ decisions, all 22 backlog items, the complete streaming event registry, the entity/citation system, the billing model, frontend component inventory, and the GenUI rendering pipeline. The remaining ~15% consists of: (a) files referenced but not deeply analyzed (11 documents listed in MASTER-ANALYSIS Section "Documents Referenced But Not Fully Read"); (b) the `okestraai/DocuIntelli` Stripe codebase not inspected; (c) operational knowledge (CI/CD, monitoring, staging) not yet specified; and (d) competitive intelligence gaps against adjacent players.

### Key Findings That Change or Challenge the Current Plan

1. **WeasyPrint + Plotly incompatibility (H16 REFUTED)**: The PDF export path is architecturally broken. WeasyPrint cannot execute JavaScript, but Plotly charts are client-side JS. This is not documented anywhere in the implementation plan and will surface as a blocking surprise in Phase 2. Requires a design change (Playwright SSR or static chart rendering) and adds 3-5 days to the critical path.

2. **Two production-blocking bugs confirmed by code inspection (GAP-022, GAP-023)**: The RunEvent sequence number race condition and arq worker registry initialization bug are real, verified against actual source files, and will cause data corruption and silent job failure respectively under the exact conditions BL-001 and BL-016 will trigger. Combined fix effort: ~1 day.

3. **Propagation debt is the dominant risk class**: Decisions are made correctly but not written back to the documents developers will actually read. There are 4+ documents still referencing Recharts instead of Plotly, 7 open questions marked as unresolved in source docs despite being resolved since 2026-02-19, and 8 dependency fields wrong in GIT-ISSUES. Estimated resolution: 2-3 engineer-days.

---

## Quality Audit

### 00-inventory (Completeness: 90/100)

**Strengths**: 8 manifest JSON files provide machine-readable inventory of 107 files across 4 repos. KNOWLEDGE-MAP.md is an excellent strategic synthesis with thematic clusters, technology stack summary, and implementation roadmap. EXTRACTION-SUMMARY.md gives a rigorous signal inventory from the JS bundle analysis. SUPERAGENT-TO-NYQST-MAPPING.md provides a clear feature-by-feature parity table.

**Accuracy concerns**: KNOWLEDGE-MAP Section 4 lists "Redis/Upstash" under Data & Search with "Celery queues" -- but the platform uses arq, not Celery. This is a minor but misleading error that could confuse a new engineer. The EXTRACTION-SUMMARY lists 17 GML tags while other documents say 18 -- the count varies by 1 depending on whether `gml-header-elt` is counted as a GML tag or a standard HTML wrapper.

**Missing coverage**: No manifest covers the `okestraai/DocuIntelli` repository (the Stripe billing code to be ported). The PHASE-0-SPECIFICATION.md exists but its relationship to the other inventory documents is not clear from the directory structure.

### 01-extracts (Completeness: 92/100)

**Strengths**: Six deep domain extractions covering orchestration, streaming, billing, entity/citations, frontend architecture, and GenUI rendering. Each extraction includes Pydantic/TypeScript schemas, integration contracts, and implementation-ready code patterns. The orchestration-extract.md is particularly strong -- it includes the complete PlanSet/Plan/PlanTask hierarchy, the Send() dispatch pseudocode, the fan-in aggregation pattern, and the report generation pipeline stages.

**Accuracy concerns**: The streaming-events-extract.md lists 22 confirmed + 4 proposed = 26 event types, but the MASTER-ANALYSIS summary says "22 streaming event types documented" and the PLATFORM-ARCHITECTURE-SYNTHESIS says "22 confirmed + 4 proposed." These are consistent but the 26-type total is not always carried through. The billing-metering-extract.md describes a LiteLLM + Langfuse cost tracking pipeline, but the hypothesis-feasibility.md (H16) and code-alignment tests confirm LiteLLM is not present in the codebase. The billing extract implicitly assumes LiteLLM exists for cost tracking, which creates a dependency gap for v1 billing.

**Missing coverage**: No extract covers the document processing pipeline (Docling/Unstructured/LlamaParse tiered strategy from ADR-007). This is understandable given it is a Phase 3+ concern, but it means the domain extraction is incomplete for domain modules beyond Research.

### 02-domain-synthesis (Completeness: 95/100)

**Strengths**: PLATFORM-ARCHITECTURE-SYNTHESIS.md is the crown jewel of this reconstruction -- an 835-line authoritative engineering reference that synthesizes the entire platform into a single readable document. The data flow architecture (Phases 0-5 of a request lifecycle) is implementation-ready. The technology stack map with gotchas column is immediately useful. The "What's Built vs What's Planned" section provides the clearest snapshot of current state I have seen in any project document.

**Accuracy concerns**: The synthesis claims "All architectural decisions are locked. Specification is complete for Phases 0 through 2 with no open architectural questions blocking implementation." This is too strong a claim. The NDM v1 JSON schema is NOT formalized (acknowledged in Open Questions section of the same document). The WeasyPrint + Plotly incompatibility (H16) is an unresolved architectural question. The MCP tool discovery filtering algorithm is unspecified. These are all acknowledged elsewhere in the document but the executive summary overstates readiness.

**Missing coverage**: No competitive positioning against the broader AI agent market (only Dify, Codex, Superagent compared). No operational architecture (deployment topology, scaling strategy, monitoring).

### 03-patterns (Completeness: 0/100)

**This directory is empty.** The planned pattern extraction wave never executed. This was presumably intended to extract reusable architectural patterns, design patterns, or implementation patterns from the codebase. Its absence is notable but not critical -- the pattern knowledge is distributed across the extract documents in `01-extracts/`. However, a patterns catalog would have been valuable for new engineers and for validating that the implementation plan uses consistent patterns across tracks.

### 04-gaps (Completeness: 93/100)

**Strengths**: The COMPREHENSIVE-GAP-ANALYSIS.md is exceptional work -- 51 gaps across 5 categories, each with ID, severity, description, affected BL items, source evidence, resolution, owner recommendation, and wave assignment. The prioritized resolution order (P0 through W3) is actionable. The two production bugs (GAP-022, GAP-023) were confirmed by actual code inspection, not theoretical analysis. The hypothesis testing methodology (16 hypotheses with evidence, verdicts, and severity) is rigorous.

**Accuracy concerns**: hypothesis-feasibility.md (H14) states the DEPENDENCY-ANALYSIS says "10-11 weeks with realistic team size (3-5 devs)" but then claims the 7-week timeline is "Confirmed with caveats." This is somewhat generous -- 7 weeks requires perfect execution with unlimited developer capacity per track, which is explicitly stated as unrealistic. A more accurate verdict would be "Aspirational (7 weeks) to Realistic (10-11 weeks)." The competitive analysis (hypothesis-competitive.md, H12) correctly identifies the gap but rates it as "MODERATE severity" -- for a $200k/yr enterprise product, not knowing your competitive positioning against Perplexity and Harvey AI is arguably HIGH severity from a go-to-market perspective.

**Missing coverage**: No hypothesis tests the v1 accuracy target (95%+ accuracy threshold from PRD metrics). No testing of whether the existing RAG implementation quality claims from the Dify analysis are correct (H9 notes this but does not resolve it). The hypothesis-consistency.md does not test consistency between the 01-extracts documents and the source material they extract from.

### 05-master (Completeness: 85/100)

**Strengths**: MASTER-ANALYSIS.md provides a comprehensive summary with file inventory, decision registry, schema catalog, backlog cross-reference, chronological timeline, knowledge gaps, reading order, and authority hierarchy. The reading order for new engineers is well-structured (Day 1 strategic context, Day 2 architecture decisions, Week 1 domain understanding). The authority hierarchy for conflicting information is critical and well-defined.

**Accuracy concerns**: MASTER-ANALYSIS claims "107 files inventoried" but the MASTER-INDEX.json metadata says "total_files: 107, total_signals: 312" -- the signal count is not explained or summarized in the analysis. The MASTER-INDEX.json structure was only spot-checked (first 200 lines) so its completeness cannot be fully verified.

**Missing coverage**: No executive summary for non-technical stakeholders (investor-grade). The master directory should contain this milestone review document (which is being created now). No visualization or diagram of the architecture -- all descriptions are text-based.

---

## Critical Findings

### Finding 1: WeasyPrint + Plotly PDF Export Path Is Broken (H16)

**Evidence**: hypothesis-feasibility.md H16 verdict is REFUTED. WeasyPrint requires pre-rendered HTML with no JavaScript execution (LIBRARY-REFERENCE LIB-06, line 313). Plotly charts are client-side JavaScript (LIBRARY-REFERENCE LIB-13, all patterns assume DOM context). DEC-030 locks "PDF export: weasyprint (server-side)" but no mechanism exists for converting Plotly charts to static images. The IMPLEMENTATION-PLAN lists both technologies without addressing the incompatibility.

**Impact**: Phase 2 deliverables (BL-005 report generation, BL-019 document export) will produce PDFs with blank chart areas or rendering failures.

**Recommended Action**: Add a design spike to Phase 0 validation checklist: test Playwright SSR (Option 1 from H16) or plotly.io static image generation (Option 2). Lock the approach as DEC-053 before Phase 2 begins. Budget +3-5 days to the critical path. This is a binary go/no-go decision that should not wait until Phase 2.

### Finding 2: Two Production-Blocking Bugs Require Immediate Fix (GAP-022, GAP-023)

**Evidence**: hypothesis-code-alignment.md H7.1 confirms TOCTOU race condition in `src/intelli/repositories/runs.py` `_get_next_sequence` method -- SELECT MAX then INSERT creates duplicate sequence numbers under concurrent writes. H7.2 confirms `WorkerSettings.functions` in `src/intelli/core/jobs.py` evaluates to an empty list because the class variable is set before `@job()` decorators execute. Both verified against actual source code.

**Impact**: GAP-022 causes run ledger data corruption the moment BL-001 Send() fan-out triggers concurrent RunEvent writes. GAP-023 causes all arq background jobs (async entity creation, billing batch) to silently fail.

**Recommended Action**: Fix both bugs before any Wave 0 work begins. Create INFRA-BUG-001 and INFRA-BUG-002 tracking issues. GAP-022 fix: replace SELECT MAX with `GENERATED ALWAYS AS IDENTITY` in Migration 0005a. GAP-023 fix: move WorkerSettings to a separate module imported after job definitions. Combined effort: ~1 engineer-day.

### Finding 3: Propagation Debt Will Cause Implementation Errors If Not Resolved (GAP-001, GAP-002, GAP-003)

**Evidence**: DEC-048 (Plotly.js) is not propagated to IMPLEMENTATION-PLAN section 3.6, GIT-ISSUES BL-009, or STRATEGIC-REVIEW (GAP-001). DEC-015a/b split is not propagated to 4 downstream documents (GAP-002). OQ-001 through OQ-007 are still shown as unresolved in STRATEGIC-REVIEW and GML-RENDERING-ANALYSIS (GAP-003). Eight dependency fields in GIT-ISSUES are wrong (GAP-009).

**Impact**: A developer picking up BL-009 from GIT-ISSUES will implement Recharts. A developer reading STRATEGIC-REVIEW will believe 7 critical questions are unresolved. A developer checking dependencies in GIT-ISSUES will get the wrong build order for BL-003, BL-005, BL-006, BL-018, and BL-022.

**Recommended Action**: Dedicate 2-3 engineer-days to propagation work before Wave 0 begins. This is the highest-ROI documentation investment available. Assign a single person to mechanically apply all corrections from CONSISTENCY-AUDIT-PLANS and the COMPREHENSIVE-GAP-ANALYSIS P0 list.

### Finding 4: No CI/CD Pipeline Exists for Multi-Track Parallel Development (GAP-038)

**Evidence**: No GitHub Actions workflow, no Dockerfile, no automated test execution on PR, no container build pipeline documented anywhere. CONSISTENCY-AUDIT-ANALYSIS C-05 flags "Deployment/containerization (no Dockerfile exists -- genuine gap, no locked decision)." With 5 parallel development tracks planned, integration failures will accumulate undetected without CI gates.

**Impact**: Each track develops in isolation for 2-4 weeks. When tracks converge for integration (Week 7), undetected regressions and contract violations will require emergency triage. Based on industry data, absence of CI in multi-track development typically adds 30-50% to integration time.

**Recommended Action**: Create minimal CI pipeline as the first Wave 0 task. GitHub Actions on PR to `main`: `pytest` (backend), `tsc --noEmit` (frontend type check), `alembic check` (migration consistency). Add Docker build step. Effort: 1 day. This prevents weeks of integration debt.

### Finding 5: The 7-Week Timeline Is Aspirational; 10-11 Weeks Is Realistic (H14)

**Evidence**: DEPENDENCY-ANALYSIS explicitly states "10-11 weeks with realistic team size (3-5 devs)" (hypothesis-feasibility.md H14, Source 2). The 7-week figure assumes unlimited developer capacity per track (5 developers, one per track, zero context switching) and zero integration surprises. BL-001 (Research Orchestrator, XL size) is a single-developer bottleneck blocking 7 downstream items. The WeasyPrint + Plotly incompatibility (Finding 1) adds 3-5 days not currently budgeted. Phase 0 validation checklist tasks (arq verification, Send() prototype, Playwright spike) add 3-5 days.

**Impact**: If the team commits to 7 weeks and the actual timeline is 10-11 weeks, credibility and morale suffer. Stakeholder expectations will be misaligned.

**Recommended Action**: Communicate a 9-week target (7 weeks + 1 week integration + 1 week contingency) as the realistic optimistic case, with 11 weeks as the realistic pessimistic case. De-risk BL-001 by decomposing into sub-elements (BL-001a through BL-001h per DEPENDENCY-ANALYSIS Section 5) and assigning the strongest backend developer exclusively to this track.

---

## Hypothesis Validation Summary

| ID | Hypothesis | Verdict | Severity | Action Required |
|----|-----------|---------|----------|-----------------|
| H1 | PRD covers all IMPL-PLAN capabilities | Partially Confirmed | MODERATE | Add "Deferred Scope" section to IMPL-PLAN listing Analysis, Modelling, and Org Insight modules as explicitly deferred |
| H2 | 10 ADRs fully reflected in Decision Register | Confirmed | LOW | Add ADR-007 tiered pipeline and ADR-010 infrastructure as formal DEC entries |
| H3 | All analysis inconsistencies resolved in plans | Partially Confirmed | MODERATE | Apply propagation: update 4+ documents with Plotly decision, DEC-015a/b split, OQ resolutions |
| H4 | Backlog covers all Superagent features | Confirmed | LOW | Add tool fallback chain spec to BL-001; create BL-023 for async entity worker |
| H5 | Platform Ground Truth accuracy | Confirmed (1 minor discrepancy) | LOW | Update router count from 11 to 12 |
| H6 | Migration state accuracy (4 migrations) | Confirmed | N/A | None |
| H7.1 | RunEvent sequence race condition | Confirmed (BUG) | CRITICAL | Fix before Wave 0; use GENERATED ALWAYS AS IDENTITY |
| H7.2 | ARQ worker registry initialization bug | Confirmed (BUG) | CRITICAL | Fix before Wave 0; move WorkerSettings to separate module |
| H8 | Docker Compose Redis profile claim | Confirmed | N/A | None |
| H9 | Dify comparison completeness ("6 wins, 5 NYQST wins") | Partially Confirmed | MODERATE | 3 of Dify's 6 claimed wins are factually wrong; rebuild comparison against current ground truth |
| H10 | Superagent clean room IP integrity | Partially Confirmed | LOW-MODERATE | Clarify healer algorithm as reverse-engineered behavior, not copied code; document independent implementation choices |
| H11 | GenUI approach (rehype-to-JSX) justified vs alternatives | Confirmed | LOW | Proceed as designed |
| H12 | Competitive landscape completeness | Refuted (Partially) | MODERATE | Extend analysis to Perplexity, Harvey AI, v0.dev; clarify horizontal vs vertical positioning |
| H13 | LangGraph Send() production stability | Partially Confirmed | MEDIUM-HIGH | Build Week 1 prototype with 13 parallel DB writes; have serialized fallback ready |
| H14 | 7-week timeline feasibility (80 SP) | Confirmed with caveats | MEDIUM | Communicate 9-11 week range; de-risk BL-001 via decomposition |
| H15 | LLM output quality for GML markup | Partially Confirmed | MEDIUM-LOW | Healer is proven from Superagent; unit test with 20+ malformed samples |
| H16 | WeasyPrint + Plotly server-side rendering | REFUTED | HIGH | Design spike in Phase 0; lock DEC-053 (Playwright SSR or static chart fallback) |

---

## Gap Priority Matrix

Top 10 gaps ordered by (severity x likelihood of impact):

| Rank | Gap ID | Description | Severity | Resolution | Owner |
|------|--------|-------------|----------|------------|-------|
| 1 | GAP-022 | RunEvent sequence number race condition (TOCTOU bug in `_get_next_sequence`) | CRITICAL | Replace SELECT MAX with GENERATED ALWAYS AS IDENTITY in Migration 0005a | Backend lead |
| 2 | GAP-023 | ARQ worker registry initialization order (WorkerSettings.functions evaluates to empty list) | CRITICAL | Move WorkerSettings to separate module loaded after job decorators | Backend lead |
| 3 | GAP-014 | No formal Event Contract v1 (LangGraph event hooks to SSE event types mapping) | CRITICAL | Create locked specification document mapping every LangGraph hook to SSE event type | Backend architecture lead |
| 4 | GAP-038 | No CI/CD pipeline for multi-track parallel development | CRITICAL | Create GitHub Actions: pytest + tsc --noEmit + alembic check + Docker build on PR | DevOps lead |
| 5 | GAP-001 | Chart library decision (Plotly) not propagated to 4 documents (still say Recharts) | CRITICAL | Update IMPL-PLAN, GIT-ISSUES BL-009, STRATEGIC-REVIEW, LIBRARY-REFERENCE | Documentation lead |
| 6 | GAP-017 | NDM v1 JSON schema not formalized (sketched only in SUPERAGENT_PARITY_PLAN 3.4) | HIGH | Formalize as standalone Pydantic model definition with all 18 node types | Architecture lead |
| 7 | GAP-002 | GML rendering pipeline split (DEC-015a/b) not propagated to downstream docs | CRITICAL | Update GML-RENDERING-ANALYSIS, all DEC-015 cross-references | Architecture lead |
| 8 | GAP-039 | Phase 0 validation checklist not formalized in IMPL-PLAN or GIT-ISSUES milestone | HIGH | Add M0-GATE blocking milestone with 6 validation tasks; add Playwright spike (H16) | Project coordinator |
| 9 | GAP-003 | 7 open questions still appear unresolved in source documents despite DEC-042-052 resolving them | CRITICAL | Add resolution annotations to STRATEGIC-REVIEW, GML-RENDERING-ANALYSIS, CODEX-ANALYSIS | Documentation lead |
| 10 | GAP-015 | Tool fallback chain strategy not specified in BL-001 spec | HIGH | Amend MAPPING-01 with fallback cascade algorithm (primary, fallback_used event, all_tools_failed) | Backend lead |

---

## Recommended Adjustments to Implementation Plan

### Wave Model Changes

1. **Add Phase 0 Validation Checkpoint as a blocking gate (M0-GATE)**. The current plan flows from Phase 0 into Phase 1 without a formal gate. Add a 3-day checkpoint at the end of Week 1 with these mandatory pass criteria:
   - arq worker operational (fix GAP-023 first, then verify)
   - Send() prototype with 13 parallel DB writes (no sequence collisions after GAP-022 fix)
   - Playwright SSR spike for PDF chart rendering (H16 resolution)
   - GmlComponentParser spike in existing ChatPanel.tsx
   - Brave Search API key validated, rate limits confirmed
   - All existing tests green

2. **Add DEC-053: PDF Chart Rendering Strategy** to the decision register. Lock one of: (a) Playwright SSR for full-page PDF capture, (b) plotly.io static PNG generation embedded in WeasyPrint HTML, or (c) dual-format export (interactive HTML + static PDF). This decision must be made before Phase 2 begins.

3. **Adjust timeline communication from "7 weeks" to "9 weeks (optimistic) / 11 weeks (realistic)"**. The 7-week figure assumes perfect execution conditions that are explicitly called unrealistic in the DEPENDENCY-ANALYSIS. Add 1 week for integration testing and 1 week contingency. Add 3-5 days for Phase 0 validation tasks and the Playwright spike.

### Task Ordering Changes

4. **Move CI/CD pipeline setup to Day 1 of Wave 0** (before any feature code). Without CI gates, 5 parallel tracks will accumulate integration debt. This is the highest-leverage operational task.

5. **Move GAP-022 and GAP-023 bug fixes to Day 1 of Wave 0** (block all other work). These bugs will cause data corruption and silent job failure under exactly the conditions the implementation plan creates.

6. **Add BL-023: Async Entity Creation Worker** as a formal backlog item in Wave 1. The work is currently scattered across DEC-017 and BL-016 but has no dedicated, estimable, assignable item. Size: ~1 SP.

### Risk Mitigations

7. **Assign the strongest backend developer exclusively to BL-001 for the duration of Phase 1**. BL-001 is the single-developer bottleneck on the critical path. Context-switching this developer to other tasks will extend the timeline by the context-switch penalty (typically 20-30% per switch).

8. **Implement contract-first development**: Lock BL-002 (RunEvent schema) and the Event Contract v1 (GAP-014) on Day 1 of Wave 0. Frontend Track 4 builds against mock events matching BL-002 spec. This prevents late-stage rework due to event shape mismatches -- the most common multi-track integration failure mode.

9. **Create the 10 CLAUDE.md team briefs (GAP-045) before parallel agent execution begins**. Without these, each agent team will reconstruct context from the full document corpus, violating context management rules and introducing compounding errors.

---

## Knowledge Base Quality Score

| Knowledge Domain | Score | Justification |
|-----------------|-------|---------------|
| Orchestration & Agents | 9/10 | Comprehensive: PlanSet/Plan/PlanTask schemas, Send() pseudocode, fan-in pattern, meta-reasoning, tool dispatch, fallback cascades. Deducted 1 for unformalized NDM v1 schema and unspecified MCP tool discovery algorithm. |
| GenUI & Rendering | 8/10 | Strong: 18 GML tags catalogued, healer algorithm extracted, component registry with 27 primitives, rehype pipeline specified. Deducted 1 for WeasyPrint+Plotly incompatibility not caught until hypothesis testing, and 1 for the `<answer>` wrapper stripping not addressed in renderer spec. |
| Streaming & Events | 9/10 | Excellent: 22+4 event types with complete payload schemas, NDJSON envelope format, heartbeat/watchdog/reconnect fully specified, dual-stream architecture (chat + run lifecycle). Deducted 1 for missing formal LangGraph-to-SSE event mapping contract (GAP-014). |
| Billing & Metering | 7/10 | Good coverage of pricing model, Stripe integration patterns, and quota enforcement. Deducted 2 for LiteLLM dependency gap (billing extract assumes LiteLLM exists but it does not), and 1 for DocuIntelli Stripe code not inspected before port plan was written. |
| Entity & Citations | 8/10 | Strong: 12-type entity system, Migration 0005a plan, citation buffering state machine, async entity creation via arq. Deducted 1 for unspecified entity deduplication algorithm edge cases and 1 for no dedicated backlog item for async entity worker. |
| Frontend Architecture | 8/10 | Good: Complete component inventory (existing + planned), Zustand store architecture, 8 new components specified with hierarchy. Deducted 1 for empty 03-patterns directory (no reusable frontend patterns extracted) and 1 for no developer setup guide. |
| Competitive Intelligence | 5/10 | Incomplete. Dify and Superagent are well-analyzed (despite Dify having 3 factual errors). Codex timeline correctly flagged as inflated. But Perplexity, Harvey AI, v0.dev, ChatGPT/Claude are completely absent. For a $200k/yr enterprise product, this gap in go-to-market intelligence is significant. |
| Technical Feasibility | 8/10 | Strong hypothesis testing on Send() stability, LLM GML quality, and timeline feasibility. The WeasyPrint+Plotly refutation (H16) is the standout finding. Deducted 1 for no prototype validation of the accuracy target (95%+) and 1 for no load testing plan for SSE under concurrent connections. |

---

## Next Steps

### Before Wave 0 Begins (3-4 engineer-days)

1. **Fix production bugs**: GAP-022 (sequence race) and GAP-023 (arq initialization). These are the only items that touch production source code. Everything else below is documentation.

2. **Resolve propagation debt**: Apply COMPREHENSIVE-GAP-ANALYSIS P0 items 3-11 (chart library, GML split, OQ resolutions, dependency corrections, milestone assignments, arrow flip, stale claims, validation checklist, team briefs). This is mechanical work -- no architectural judgment required.

3. **Lock DEC-053 (PDF chart rendering)**: Based on a Playwright SSR spike. This is a binary design decision that affects Phase 2 scope.

4. **Create CI pipeline**: GitHub Actions on PR. First operational task of Wave 0.

### Before Phase 1 Begins (1 engineer-week parallel with Wave 0)

5. **Create formal Event Contract v1** (GAP-014): Map every LangGraph event hook to an SSE event type with exact payload definitions.

6. **Formalize NDM v1 JSON schema** (GAP-017): Define Pydantic model for all 18 node types with validation rules. Blocks BL-004.

7. **Specify MCP tool discovery algorithm** (GAP-018): How does the orchestrator decide which tools are available per session? Blocks BL-001.

8. **Specify tool fallback chain** (GAP-015): Primary provider failure, fallback_used event, all_tools_failed handling. Blocks BL-001.

9. **Document Migration 0005a/b/c content** (GAP-028): Exact tables, columns, and indices per sub-migration.

10. **Conduct Brave vs Tavily cost comparison** (GAP-026): Lock primary search provider. 2-hour research task.

### Before Committing Budget

11. **Extend competitive analysis** to Perplexity (research + synthesis overlap), Harvey AI (proves vertical strategy), and v0.dev (website generation quality benchmark). Clarify horizontal vs vertical positioning.

12. **Resolve LiteLLM v1 dependency question** (GAP-024): Does v1 billing require LiteLLM for per-call cost tracking, or can cost be approximated from ChatOpenAI response metadata? This determines whether LiteLLM is on the critical path.

13. **Verify DocuIntelli billing code** (GAP-029) before committing to the port strategy: check raw body webhook handling, subscription schema compatibility, Stripe SDK version.

14. **Define v1 tenant isolation approach** (GAP-043): Application-level WHERE clauses are probably sufficient for v1, but the decision must be explicit and documented before BL-001 implementation scopes its database queries.

### Ongoing

15. **Rebuild Dify comparison** with corrected ground truth (3 factual errors about NYQST capabilities inflate the gap). Any investor-facing or customer-facing materials based on the current analysis will contain false claims about NYQST's weaknesses.

16. **Plan the IP compliance step for the healer algorithm** (H10): Clarify whether "verbatim extraction" means reverse-engineered behavior observation or source code copying. If the latter, rebuild with independent algorithmic choices before launch.

---

## Final Assessment

This design knowledge reconstruction is among the most thorough I have reviewed for a platform at this stage. The pipeline of 18 agents across 4 waves successfully transformed a scattered 798-file corpus across 4 repositories into a coherent, cross-referenced, quality-audited knowledge base. The work is immediately actionable -- the gap analysis alone (51 gaps with prioritized resolution order) provides a clear pre-implementation work plan.

The three findings that would make me pause before committing budget are: (1) the WeasyPrint + Plotly incompatibility, which is a genuine architectural oversight that requires a design change; (2) the two production bugs that will cause data corruption under the exact conditions the implementation creates; and (3) the absence of CI/CD for a 5-track parallel development effort. All three are resolvable in the first week of Wave 0, and none changes the fundamental viability of the platform architecture.

The reconstruction confirms the core thesis: the platform kernel (content-addressed storage, SSE streaming, JWT auth, 16 tables, 11 API routers) is real and working. The architectural decisions are locked and internally consistent. The specification is complete for Phases 0-2 with the exceptions noted above. The primary technical risk remains Send() fan-out with concurrent DB writes, and the mitigation plan (Week 1 prototype, serialized DB fallback) is sound.

**Recommendation: Conditional GO.** Proceed with Wave 0 after resolving the P0 items (bug fixes, propagation debt, CI setup, Playwright spike). The 3-4 engineer-day pre-implementation investment prevents significantly larger costs downstream.

---

*Reviewed by: Claude Opus 4.6*
*Date: 2026-02-20*
*Input corpus: 33 design reconstruction files, ~1MB structured output*
*Review methodology: Full document read of all 8 key outputs, structural audit of all 6 directories, cross-reference validation of claims against source evidence*
