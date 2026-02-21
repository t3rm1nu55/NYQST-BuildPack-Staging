# NYQST DocuIntelli — Master Design Reconstruction Analysis

**Generated**: 2026-02-20
**Source**: 8 inventory manifests, KNOWLEDGE-MAP.md, SUPERAGENT-TO-NYQST-MAPPING.md
**Authoritative companion**: `MASTER-INDEX.json` (same directory)

---

## Project Knowledge Statistics

| Metric | Value |
|--------|-------|
| Total files inventoried | 107 |
| Unique source manifests | 8 |
| Total design decisions (DECs) | 71+ (52 locked + 8 not-replicating + 3 testing + 7 OQ resolutions + recent additions) |
| Backlog items (BL) | 22 (BL-001 through BL-022) |
| Schemas formally defined | 22 |
| Cross-document cross-references | 21 |
| Design timeline events | 8 |
| Repos contributing files | 4 |
| JS bundles reverse-engineered | 5 |
| GML tags catalogued | 18 |
| Streaming event types documented | 22 |

**Repositories**:
- `/Users/markforster/AirTable-SuperAgent` — analysis docs + cached Superagent JS bundles
- `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126` — production dev repo (PRDs, ADRs, planning)
- `/Users/markforster/NYQST-MCP` — Dify analysis, Oracle infra plans, MCP backbone
- `/Users/markforster/Downloads` — GenUI cleanroom prototypes, PropSygnal spec, misc specs

---

## File Inventory by Category

| Category | Count | Primary Documents |
|----------|-------|-------------------|
| Plans (implementation, backlog, strategy) | 12 | IMPLEMENTATION-PLAN.md (v3), BACKLOG.md, PLATFORM-FRAMING.md, DECISION-REGISTER.md (v2), DEPENDENCY-ANALYSIS.md, LIBRARY-REFERENCE.md (v2), GIT-ISSUES-STRUCTURE.md, STRATEGIC-REVIEW.md, INTERACTION-POINTS.md, OBJECTIVES.md, PROJECT-BRIEF.md, SLICES.md, CONSISTENCY-AUDIT-PLANS.md |
| Analysis (Superagent reverse engineering) | 8 | SYSTEM-ARCHITECTURE.md, AGENTIC-SYSTEM.md, QUALITY-METHODS.md, TECHNICAL-DEEP-DIVE.md, CHAT-EXPORT-ANALYSIS.md, PLATFORM-GROUND-TRUTH.md, OUR-ANALYSIS-SUMMARY.md, ANALYSIS-COMPARISON-CHECKPOINT.md |
| Competitive Analysis | 2 | DIFY-ANALYSIS-SUMMARY.md, CODEX-ANALYSIS-SUMMARY.md |
| Context-System Reports (5-report series) | 7 | 01_observed_surface.md through 05_validation_playbook.md + README.md + 3 data files |
| GenUI Cleanroom Prototypes | 7 | genui-00 through genui-06, superagent-clean-room-analysis.txt, superagent-system-insights.txt, CLEANROOM-ANALYSIS.md |
| PRD Documents | 11 | 00_INDEX.md through 10_APPENDIX.md |
| ADR Documents | 10 | 001-data-model-strategy.md through 010-bootstrap-infrastructure.md |
| Dev Repo Planning | 3 | SUPERAGENT_PARITY_CLEAN_ROOM_PLAN.md, INTELLI_BUILD_STATUS.md, SUPERAGENT_PARITY_PLAN (in reports) |
| Dev Repo Reference | 2 | PLATFORM_REFERENCE_DESIGN.md, UI_ARCHITECTURE.md |
| MCP Research / Infra | 12 | DESIGN-KNOWLEDGE-CONTEXT-SYSTEM.md, COMPARISON-NYQST-VS-DIFY.md, NYQST-SSE-EVENT-SPECIFICATION.md, VERCEL-AI-SDK-NATIVE-COMPARISON.md, NYQST-MCP-INFRASTRUCTURE-DESIGN.md, CLOUD-COMPARISON-SUMMARY.md, ADR-011-LANGGRAPH-MCP-BRIDGE.md, ADR-011-POSTGRESQL-RLS.md, LANGGRAPH-DORMANT-CAPABILITIES.md, ADR-MCP-BACKBONE.md, common-mcp-architecture SUMMARY.md, ADR-ORACLE-INFRA.md, ADR-MCP-SERVER-DECOMPOSITION.md, mcp-specifications SUMMARY.md |
| Technical Mapping Docs | 4 | MAPPING-01 through MAPPING-04 |
| JS Bundles (reverse engineered) | 5 | _app-*.js, 591-*.js, 4d022aba-*.js, 55ccf76ff5ccbea2.css + 7 other page/framework chunks |
| Design Extraction (docs/docs) | 8 | GML_REPORT_RENDERING_PATTERNS.md, GML_CSS_EXTRACTION.md, JS_DESIGN_TOKENS.md, GENERATION_PIPELINE.md, REPORT_C_ANALYSIS.md, SUPERAGENT_REPORT_ANALYSIS.md, TAILWIND_THEME_EXTRACTION.md, FONT_AND_ASSET_EXTRACTION.md |
| Chat Exports / Sessions | 2 | 5988fe2c-*.chat, cursor_branches_from_nyqst_intelli_2301.md |
| Specs (PropSygnal, Expert Framework) | 3 | propsygnal_document_intelligence_spec.md, nyqst_expert_framework_v1.md, Superagent.html |

---

## Decision Registry Summary

All 71+ decisions organized by domain. Source of truth: `DECISION-REGISTER.md` v2.

### Strategic Scope (DEC-001 through DEC-011)

| DEC | Summary |
|-----|---------|
| DEC-001 | Cognitive ERP positioning — DocuIntelli is enterprise infrastructure, ~$200k/yr |
| DEC-002 | Event-streamed planning required — plan visible at run start, not post-hoc |
| DEC-003 | Domain-first data models (not CDM-first); CDM is integration layer only |
| DEC-004 | Index Service contract-first with pluggable backends |
| DEC-005 | LangGraph as primary orchestration runtime (not Vercel AI SDK, not custom) |
| DEC-006 | MCP as primary tool protocol with namespace convention: {domain}.{resource}.{action} |
| DEC-007 | NDJSON event schema v1 for all streaming |
| DEC-008 | NDM v1 (JSON AST) as deliverable markup format |
| DEC-009 | Entity table unifies citations, tool outputs, and deliverables |
| DEC-010 | Run ledger is canonical; LangGraph checkpoints are operational aids only |
| DEC-011 | Research module is first domain module (test harness, not the product) |

### Architecture (DEC-012 through DEC-041, DEC-060-072)

| DEC | Summary |
|-----|---------|
| DEC-015a | Backend JSON AST as deliverable markup format (split from DEC-015) |
| DEC-015b | Frontend rehype-to-JSX for rendering JSON AST (split from DEC-015) |
| DEC-040a | BL-015 and BL-008 moved to Wave 0 (from M3) |
| DEC-040b | BL-015 independence confirmed (no BL-001 prerequisite) |
| DEC-041 | Billing (BL-012) deferred to Wave 3 |
| DEC-060 | Session architecture: lightweight database session model for Phase 0 |
| DEC-061 | Document processing: tiered pipeline (Fast/Standard/Deep) with adapter pattern |
| DEC-062 | Human-in-the-loop: policy-driven LangGraph interrupts with 4 policy templates |
| DEC-063 | Code generation: OpenAPI + openapi-typescript (Pydantic is single source of truth) |
| DEC-064 | Index service: OpenSearch primary + pgvector fallback |
| DEC-065 | Bootstrap infrastructure: PostgreSQL + pgvector + Neo4j |
| DEC-066 | Virtual Team Operating System for multi-agent AI coordination |
| DEC-067 | Oracle Cloud Always Free as primary bootstrap infrastructure (MCP repo context) |
| DEC-070 | Keep Python backend with LangGraph — no TypeScript migration |
| DEC-071 | PostgreSQL RLS for database-enforced multi-tenant isolation |
| DEC-072 | MCP backbone with 7 architectural layers shared across all servers |

### Technology (DEC-042 through DEC-052) — Resolved OQs

| DEC | Summary |
|-----|---------|
| DEC-042 | LiteLLM multi-provider hot-swap — OpenAI-only in v1, hot-swap ready |
| DEC-043 | GML in separate ReportPanel; rehype-to-JSX for rendering |
| DEC-044 | Website deliverable: iframe-only in v1 (no full static hosting yet) |
| DEC-045 | Langfuse self-hosted for observability; LangGraph state budget $2/run |
| DEC-046 | MCP search tools: Brave/Tavily hot-swap (supersedes DEC-032) |
| DEC-047 | Clarification UI deferred to v1.5 |
| DEC-048 | Plotly.js (react-plotly.js) confirmed for charts — NOT Recharts |
| DEC-049 | LangSmith Studio (rebranded Oct 2025) + graph-as-code; no visual editor |
| DEC-050 | LangChain with_structured_output() for all JSON nodes |
| DEC-051 | Per-node async sessions from shared async_sessionmaker |
| DEC-052 | Migration 0005 split into 0005a (DB schema) + 0005b (LangGraph) + 0005c (indices) |

### Not Replicating (8 decisions)

v0.app, Firecrawl, FactSet, Ory Kratos, PostHog, Sanity CMS, OneSignal, scheduled tasks (v1).

---

## Schema Catalog Summary

| Schema Name | Type | Key Fields / Notes | Primary Source |
|-------------|------|--------------------|---------------|
| ResearchState | Pydantic | messages, context_pointer_id, manifest_sha256, sources, error, run_id | PLATFORM-GROUND-TRUTH.md |
| ResearchTask | Pydantic | task_id, title, status, message, previous_task_id | IMPLEMENTATION-PLAN.md |
| TaskResult | Pydantic | task_id, status, artifacts, sources, error | IMPLEMENTATION-PLAN.md |
| DataBrief | Pydantic | run_id, topic, data_points, sources | IMPLEMENTATION-PLAN.md |
| RunEventType | Python Enum | 25 total types from RUN_STARTED to WARNING | PLATFORM-GROUND-TRUTH.md |
| MarkupDocument | Pydantic | JSON AST (NDM v1); schema sketched, needs formalization | IMPLEMENTATION-PLAN.md |
| MarkupNode | Discriminated Union | 18 node types | IMPLEMENTATION-PLAN.md |
| PlanSet | Pydantic | chat_id, workspace_id, plans: Record<str, Plan> | AGENTIC-SYSTEM.md |
| Plan | Pydantic | id, title, status, previous_plan_id, used_sources, plan_tasks | TECHNICAL-DEEP-DIVE.md |
| PlanTask | Pydantic | id, title, status enum (5 states), message, previous_task_id | TECHNICAL-DEEP-DIVE.md |
| StreamEvent | Zod Discriminated Union | 22 event types; exact field lists available | 02_streaming_protocol.md |
| Entity | Zod Discriminated Union | 12 types (WEB_PAGE through GENERATED_DOCUMENT) | SYSTEM-ARCHITECTURE.md |
| ChatMessage | Pydantic | 18 fields including deliverable_type, hydrated_content, entities | CHAT-EXPORT-ANALYSIS.md |
| Artifact | SQLAlchemy | sha256 PK, media_type, size_bytes, storage_uri, reference_count | PLATFORM-GROUND-TRUTH.md |
| Manifest | SQLAlchemy | sha256 PK, tree JSONB, parent_sha256, entry_count, total_size_bytes | PLATFORM-GROUND-TRUTH.md |
| Pointer | SQLAlchemy | UUID, namespace, name, manifest_sha256 FK, pointer_type, meta JSONB | PLATFORM-GROUND-TRUTH.md |
| Run | SQLAlchemy | UUID, run_type, status, input_manifest, output_manifest, cost_cents | PLATFORM-GROUND-TRUTH.md |
| ChartObject | Zod | data (DataTrace[]), layout (LayoutConfig), title, citation; 10 chart types | TECHNICAL-DEEP-DIVE.md |
| GMLComponentRegistry | Zod Map | 18 tags; 4 categories: view, layout, content, data-viz | GML_REPORT_RENDERING_PATTERNS.md |
| DocIR | Pydantic | Canonical document intermediate representation; immutable artifact | 007-document-processing-pipeline.md |
| ComponentDescriptor | TypeScript Interface | type, props, children, key, when, unless, bind, repeat, on | genui-02-renderer.tsx |
| NyqstMCPServer | Python Class | 7 layers: Transport/Auth/Database/DataModel/Vector/Agentic/Methods | ADR-MCP-BACKBONE.md |

---

## Backlog Item Cross-Reference Map

Which documents reference which BL items. `BACKLOG.md` and `IMPLEMENTATION-PLAN.md` reference all 22 items and are excluded from per-item listings.

| BL Item | Name | Size | Wave | Also Referenced In |
|---------|------|------|------|--------------------|
| BL-001 | Research Orchestrator (fan-out/fan-in) | XL | 1 | DEPENDENCY-ANALYSIS, GIT-ISSUES, PLATFORM-FRAMING, SLICES, DECISION-REGISTER, MAPPING-01 |
| BL-002 | Migration 0005a (DB schema) | M | 0 | DEPENDENCY-ANALYSIS, GIT-ISSUES |
| BL-003 | Web Search MCP Tools (Brave/Tavily) | M | 0 | DEPENDENCY-ANALYSIS, GIT-ISSUES, INTERACTION-POINTS, SLICES (standalone, no BL-001 dep) |
| BL-004 | Planner Node (structured PlanSet output) | L | 1 | DEPENDENCY-ANALYSIS |
| BL-005 | Report Generator (NDM v1 / JSON AST) | L | 2 | DEPENDENCY-ANALYSIS, GIT-ISSUES, SLICES |
| BL-006 | PDF/DOCX Export (WeasyPrint/python-docx) | M | 2 | DEPENDENCY-ANALYSIS |
| BL-007 | Slides Generator (PPTX) | M | 2 | DEPENDENCY-ANALYSIS |
| BL-008 | ReportPanel / DeliverableViewer | M | 0 | DEPENDENCY-ANALYSIS, GIT-ISSUES, SLICES, CONSISTENCY-AUDIT (moved from M3) |
| BL-009 | Citation System (entity-bound) | M | 1 | DEPENDENCY-ANALYSIS, DECISION-REGISTER |
| BL-010 | Context Engineering (token budget) | M | 1 | DEPENDENCY-ANALYSIS |
| BL-011 | Streaming / SSE (NDJSON + PG NOTIFY) | M | 2 | DEPENDENCY-ANALYSIS |
| BL-012 | Billing / Stripe Integration | L | 3 | DEPENDENCY-ANALYSIS, GIT-ISSUES, INTERACTION-POINTS, DECISION-REGISTER |
| BL-013 | Multi-Agent Executor (parallel subgraph) | L | 1 | DEPENDENCY-ANALYSIS |
| BL-014 | Document Upload + RAG | M | 1 | DEPENDENCY-ANALYSIS, DECISION-REGISTER |
| BL-015 | Frontend Chat UI (assistant-ui/react) | M | 0 | DEPENDENCY-ANALYSIS, GIT-ISSUES, SLICES, CONSISTENCY-AUDIT, DECISION-REGISTER |
| BL-016 | Run Timeline / Activity Panel | M | 2 | DEPENDENCY-ANALYSIS |
| BL-017 | Plan Viewer Panel | M | 1 | DEPENDENCY-ANALYSIS, DECISION-REGISTER, SLICES |
| BL-018 | Migration 0005b (LangGraph checkpointer) | S | 0 | DEPENDENCY-ANALYSIS, CONSISTENCY-AUDIT |
| BL-019 | Website Deliverable (iframe-only) | M | 2 | DEPENDENCY-ANALYSIS, INTERACTION-POINTS, SLICES |
| BL-020 | Deliverable Selector UI | S | 2 | DEPENDENCY-ANALYSIS |
| BL-021 | Agent Management UI | M | 3 | DEPENDENCY-ANALYSIS, GIT-ISSUES, SLICES, DECISION-REGISTER |
| BL-022 | Observability / Langfuse | M | 0 | DEPENDENCY-ANALYSIS, GIT-ISSUES, CONSISTENCY-AUDIT, SLICES (must PRECEDE BL-001) |

**Critical dependency corrections** (applied in DEPENDENCY-ANALYSIS.md and reflected in BACKLOG.md v2026-02-20):
1. BL-003 is standalone (no BL-001 dependency)
2. BL-022 must PRECEDE BL-001 (arrow inverted)
3. BL-005/006/018 need Migration 0005
4. BL-012 needs Migration 0005
5. BL-008 weakly depends on BL-015
6. BL-011 depends on BL-016

---

## Chronological Design Timeline

| Date | Event | Files Created | Significance |
|------|-------|---------------|--------------|
| 2026-01-25 | PRD suite v1.0 created | 11 | Product requirements locked: Cognitive ERP, PropSygnal, RegSygnal, 9 personas, 3 horizons |
| 2026-01-26 | 10 ADRs locked (001-010) | 10 | All foundational architecture decisions made: LangGraph, MCP, Index Service, HITL, Bootstrap |
| 2026-02-01 | Migration 0004 applied (conversation layer) | 0 | Critical milestone: conversation persistence added. Dify analysis predates this — explains its 6 errors |
| 2026-02-04 | ADR-010 locked (PostgreSQL + pgvector + Neo4j) | 0 | Bootstrap infra finalized; Oracle Cloud alternative explored in NYQST-MCP repo separately |
| 2026-02-16 | Build status documented; 5-phase clean-room parity plan | 2 | Snapshot of actual gaps: no multi-agent, no deliverables. Parity plan defines execution path |
| 2026-02-16 | 4 technical mapping documents (MAPPING-01 through 04) | 4 | Technical specs for research orchestrator, deliverables, UI modules, billing/testing |
| 2026-02-19 | 7 OQs resolved; 11 new DECs; IMPL-PLAN v3; DEC-REG v2; LIB-REF v2; PLATFORM-FRAMING | 5 | Platform framing session: all open questions closed. Superagent parity = Platform Primitives (not research module) |
| 2026-02-20 | 8 inventory manifests; KNOWLEDGE-MAP; SUPERAGENT-TO-NYQST-MAPPING; MASTER-INDEX | 10 | This session: full catalog with cross-references, timeline, gap analysis |

---

## Knowledge Gaps Identified

### Documents Referenced But Not Fully Read

These files appear in `superseded_by` or `cross_references` fields but were not deeply analyzed:

| File | Referenced From | Expected Content |
|------|----------------|-----------------|
| `2026-02-16-MAPPING-02-DELIVERABLES-ARTIFACTS.md` | BACKLOG.md | Report/Document/Slides/Website types; artifact storage; export formats (PDF/DOCX/PPTX) |
| `2026-02-16-MAPPING-03-UI-MODULES.md` | BACKLOG.md | Sources/Files/Activity pane unification; citation hover/click patterns |
| `2026-02-16-MAPPING-04-BILLING-TESTING.md` | BACKLOG.md | Cost tracking; multi-agent parallelism billing; integration test strategy |
| `nyqst_expert_framework_v1.md` | root-misc-manifest | Expert decision procedures, governance, provenance linkage |
| `SCREENSHOT_ANALYSIS.md` | root-misc-manifest | Visual UI hierarchy, spacing, component application examples |
| `docs/analysis/LANGSMITH-COST-EVAL-RESEARCH.md` | LIBRARY-REFERENCE.md | Langfuse self-hosted recommendation source |
| `docs/analysis/GML-RENDERING-ANALYSIS.md` | LIBRARY-REFERENCE.md | GML rendering, rehype-to-JSX approach |
| `docs/analysis/GRAPH-EDITOR-RESEARCH.md` | LIBRARY-REFERENCE.md | No OSS editor for Send(); LangSmith Studio free |
| `INDEX_CONTRACT.md` | 004-index-service-architecture.md | Contract definition for Index Service (ingest/search/explain) |
| `VIRTUAL_TEAM_OPERATING_SYSTEM.md` | 003-virtual-team-architecture.md | Full specification of Virtual Team OS |
| `PLATFORM_FOUNDATION.md` | PLATFORM_REFERENCE_DESIGN.md | Implementation sequence for platform foundation |

### Schemas Sketched But Not Formalized

| Schema | Status | Needed By | Gap |
|--------|--------|-----------|-----|
| MarkupDocument (NDM v1) | Sketched in SUPERAGENT_PARITY_PLAN §3.4 | BL-005 (Report Generator) | Exact JSON AST field schema; node type enum; nesting rules |
| Entity reference algorithm | Sketched conceptually | BL-009 (Citation System) | Edge cases: citations vs tool outputs vs deliverables |
| MCP tool discovery filter | Described in ADR-008 | BL-003 (Web Search Tools) | Algorithm: "is tool X relevant to session Y?" |
| Policy evaluation order | 4 templates in ADR-009 | BL-017 (Plan Viewer) | Conflict resolution when multiple templates apply |
| IndexProfile schema | Named profiles in ADR-004 | BL-010 (Context Engineering) | Exact profile configuration format |

### Documents That Are Duplicates

| Duplicate | Original | Note |
|-----------|----------|------|
| `propsygnal_document_intelligence_spec_1.md` | `propsygnal_document_intelligence_spec.md` | Identical content, v0.1 revision label |

### Orphaned References

These items are mentioned in planning documents but have no corresponding analysis or spec document:

| Item | Mentioned In | Status |
|------|-------------|--------|
| CONSISTENCY-AUDIT-ANALYSIS.md | MEMORY.md | Listed in "Completed Documents" but not in any manifest |
| PRD-ADR-VISION-DIGEST.md | MEMORY.md | Listed as key file but not inventoried |
| AGENTIC-SYSTEM.md (from nyqst-intelli dev repo) | devrepo-docs-manifest | Different from AirTable-SuperAgent/docs/analysis/AGENTIC-SYSTEM.md |
| Slice CLAUDE.md team briefs (10 files) | SLICES.md | Approved but not yet created |
| GIT-ISSUES-STRUCTURE.md dependency fields | CONSISTENCY-AUDIT-PLANS.md | 8 corrections needed, not yet applied |

### Pending Work Not Yet Complete

| Item | Source | Blocking |
|------|--------|---------|
| 10 CLAUDE.md team briefs in dev repo | SLICES.md (approved, pending creation) | Team slice implementation |
| 8 dependency field corrections in GIT-ISSUES-STRUCTURE.md | CONSISTENCY-AUDIT-PLANS.md | Clean GitHub issue creation |
| NDM v1 exact JSON schema | SUPERAGENT_PARITY_PLAN | BL-005 implementation |
| Entity reference algorithm edge cases | MAPPING-01 | BL-009 implementation |

---

## Recommended Reading Order

For a new engineer joining the project. Organized by phase of onboarding.

### Day 1: Strategic Context (2-3 hours)

1. **`PLATFORM-FRAMING.md`** — Start here. This is the single most important document. Explains why Superagent parity = Platform Primitives, not a research product. Prevents the most common misframing.
   - Path: `/Users/markforster/AirTable-SuperAgent/docs/plans/PLATFORM-FRAMING.md`

2. **`01_EXECUTIVE_SUMMARY.md`** — Cognitive ERP thesis, $200k/yr commercial model, the 30 Graduates Problem.
   - Path: `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/docs/prd/01_EXECUTIVE_SUMMARY.md`

3. **`PLATFORM-GROUND-TRUTH.md`** — What actually exists in the codebase today: 16 tables, 11 routers, 3-node LangGraph, 4 migrations. Read this before reading any analysis document to calibrate expectations.
   - Path: `/Users/markforster/AirTable-SuperAgent/docs/analysis/PLATFORM-GROUND-TRUTH.md`

### Day 2: Architecture Decisions (3-4 hours)

4. **`06_ARCHITECTURE.md`** — 7 core principles; kernel objects; LangGraph boundary. This is the architectural constitution.
   - Path: `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/docs/prd/06_ARCHITECTURE.md`

5. **`DECISION-REGISTER.md` v2** — All 71+ decisions in one place. Skim the full list; deep-read DEC-042 through DEC-052 (most recent, resolved all OQs).
   - Path: `/Users/markforster/AirTable-SuperAgent/docs/plans/DECISION-REGISTER.md`

6. **`IMPLEMENTATION-PLAN.md` v3** — 4-wave execution model, 5 parallel tracks, 7-week critical path. Your primary execution reference.
   - Path: `/Users/markforster/AirTable-SuperAgent/docs/plans/IMPLEMENTATION-PLAN.md`

### Week 1: Domain Understanding (variable, read as needed)

7. **Superagent ground truth** (read in order):
   - `reports/02_streaming_protocol.md` — 22 event types, exact field schemas
   - `docs/analysis/TECHNICAL-DEEP-DIVE.md` — GML healer, chart rendering, citation buffering (all verbatim from production bundles)
   - `docs/analysis/SYSTEM-ARCHITECTURE.md` — Full platform stack overview

8. **Your domain ADRs** (pick by track):
   - Backend engineers: `005-agent-runtime-framework.md`, `008-mcp-tool-architecture.md`, `004-index-service-architecture.md`
   - Frontend engineers: `002-code-generation-strategy.md`, `UI_ARCHITECTURE.md`, `genui-02-renderer.tsx`
   - Platform/infra: `010-bootstrap-infrastructure.md`, `ADR-011-POSTGRESQL-RLS-MULTI-TENANCY.md`, `ADR-MCP-BACKBONE.md`

9. **`BACKLOG.md`** — All 22 BL items. Find your items, understand their dependencies.

10. **`DEPENDENCY-ANALYSIS.md`** — Read the sub-element DAG for your BL item if it's one of: BL-001, BL-005, BL-006, BL-012, BL-016.

### Week 2: Product Context (read if working on domain modules)

11. **`03_PLATFORM.md`** — 6 modules spec; 13 ADR Notes; long-running agent patterns.
12. **`04_PRODUCTS.md`** — PropSygnal 5 product areas; RegSygnal 3 areas; two implementation packages.
13. **`05_USERS.md`** — 9 personas; trust hierarchy; pain points.
14. **`propsygnal_document_intelligence_spec.md`** — Deep domain spec: provenance-first, Hohfeld logic, ontology governance.

### Reference Documents (as needed)

- **`LIBRARY-REFERENCE.md` v2** — Before using any library. 21 libraries with patterns, gotchas, install commands.
- **`PLATFORM_REFERENCE_DESIGN.md`** — When architecting a new module. 11-section comprehensive spec.
- **`SUPERAGENT-TO-NYQST-MAPPING.md`** — When implementing a primitive. Shows what Superagent does vs what NYQST targets.
- **`OUR-ANALYSIS-SUMMARY.md`** — When you need a quick Superagent ground truth. 14 high-confidence facts ranked.
- **`INTERACTION-POINTS.md`** — When working on external integrations. Service boundaries registry.

### Read With Caution (known errors or outdated)

- **`DIFY-ANALYSIS-SUMMARY.md`** — Contains 6 critical errors (conversation persistence, graph complexity, table count). Use only for RAG quality roadmap section and SSE event spec section.
- **`CODEX-ANALYSIS-SUMMARY.md`** — Timeline is 2x too long. Infrastructure swap matrix is useful; timeline estimates are not.
- **`ANALYSIS-COMPARISON-CHECKPOINT.md`** — Read this BEFORE the above two to understand which parts to trust.

---

## Authority Hierarchy for Conflicting Information

When sources conflict, use this ranking (highest to lowest authority):

1. **Production JS bundles** (`TECHNICAL-DEEP-DIVE.md`) — Verbatim extraction. Cannot be wrong about what Superagent does today.
2. **`PLATFORM-GROUND-TRUTH.md`** — Direct codebase inspection of nyqst-intelli-230126.
3. **`OUR-ANALYSIS-SUMMARY.md`** — Synthesized from 6 analysis documents.
4. **`DECISION-REGISTER.md` v2** — Locked decisions (immutable unless explicitly superseded).
5. **`IMPLEMENTATION-PLAN.md` v3** — Execution plan (current working version).
6. **`DIFY-ANALYSIS-SUMMARY.md`** — Use with caution; 6 known critical errors.
7. **`CODEX-ANALYSIS-SUMMARY.md`** — Useful for infrastructure swap matrix; timeline not reliable.

**Specific corrections to remember**:
- Chart library: **Plotly.js** (NOT Recharts). Confirmed in superagent-js-manifest and LIBRARY-REFERENCE.md v2.
- Frontend state: **Zustand** (NOT Recoil). Recoil is Superagent's; NYQST uses Zustand.
- Migration count: **4 migrations** (0001-0004 done, 0005 next). Dify analysis said conversation persistence was missing — it was already done in migration 0004.
- LangGraph Studio renamed: now **LangSmith Studio** (Oct 2025).
- BL-022 dependency: **precedes BL-001** (not the other way around).

---

*Last Updated*: 2026-02-20
*Generated from*: 8 inventory manifests + KNOWLEDGE-MAP.md + SUPERAGENT-TO-NYQST-MAPPING.md
*Companion file*: `MASTER-INDEX.json` (same directory — machine-readable full index)
