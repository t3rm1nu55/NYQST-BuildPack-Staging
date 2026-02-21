# Build Backlog

> **Living document** — updated every revision cycle
> **Principle**: Use existing intelli components first. Flag tradeoffs for new ones.

---

## Backlog Items

### BL-001: Research Orchestrator Graph
**Component**: `src/intelli/agents/graphs/research_orchestrator.py`
**Existing**: LangGraph research_assistant.py (single agent loop)
**Change**: Extend to planner → fan-out → fan-in → synthesizer → deliverable
**Spec**: MAPPING-01
**Dependencies**: BL-002 (RunEvent extensions)
**Status**: Planned

### BL-002: RunEvent Schema Extensions
**Component**: Existing RunEvent model
**Existing**: STATE_UPDATE, TOOL_CALL_*, STEP_*
**Change**: Add PLAN_CREATED, SUBAGENT_*, CONTENT_DELTA, ARTIFACT_CREATED, CLARIFICATION_NEEDED
**Spec**: MAPPING-01
**Dependencies**: None
**Status**: Planned

### BL-003: Web Research MCP Tools
**Component**: New tools in agent graph
**Existing**: search_documents, list_notebooks, get_document_info
**Change**: Add research.web.search (Brave), research.web.scrape (Jina)
**Spec**: MAPPING-01
**Dependencies**: None (standalone); BL-001 (integration wiring)
**Status**: Planned

### BL-004: NYQST Markup AST Schema
**Component**: New Pydantic models
**Existing**: None
**Change**: MarkupNode model with 18 node types + healer/validator
**Spec**: MAPPING-02
**Dependencies**: None
**Status**: Planned

### BL-005: Report Generation Node
**Component**: LangGraph deliverable node
**Existing**: None
**Change**: Research results → synthesis → NYQST Markup AST → Artifact
**Spec**: MAPPING-02
**Dependencies**: BL-001, BL-004, Migration 0005
**Status**: Planned

### BL-006: Website Generation Pipeline
**Component**: LangGraph deliverable node
**Existing**: Artifact/Manifest storage (working)
**Change**: LLM → file bundle → Manifest → preview
**Spec**: MAPPING-02
**Dependencies**: BL-001, Migration 0005
**Status**: Planned

### BL-007: PlanViewer Component
**Component**: `ui/src/components/plans/PlanViewer.tsx`
**Existing**: RunTimeline (basic)
**Change**: Phase indicator + task cards with progress
**Spec**: MAPPING-03
**Dependencies**: BL-002
**Status**: Planned

### BL-008: DeliverableSelector Component
**Component**: `ui/src/components/chat/DeliverableSelector.tsx`
**Existing**: ChatPanel composer
**Change**: Segmented control for Report|Website|Slides|Document
**Spec**: MAPPING-03
**Dependencies**: BL-015 (weak)
**Status**: Planned

### BL-009: ReportRenderer Component
**Component**: `ui/src/components/reports/ReportRenderer.tsx`
**Existing**: None
**Change**: Recursive MarkupNode → React element renderer
**Spec**: MAPPING-03
**Dependencies**: BL-004
**Status**: Planned

### BL-010: WebsitePreview Component
**Component**: `ui/src/components/deliverables/WebsitePreview.tsx`
**Existing**: Artifact API (working)
**Change**: Fetch artifacts → blob URL → sandboxed iframe
**Spec**: MAPPING-03
**Dependencies**: BL-006
**Status**: Planned

### BL-011: Enhanced SourcesPanel
**Component**: Extend existing SourcesPanel
**Existing**: RAG document sources (working)
**Change**: Add web sources tab (URL, title, favicon, relevance, snippet)
**Spec**: MAPPING-03
**Dependencies**: BL-003, BL-016
**Status**: Planned

### BL-012: Billing System
**Component**: `src/intelli/api/v1/billing.py` + service
**Existing**: None (port from okestraai/DocuIntelli)
**Change**: Stripe checkout, webhooks, subscriptions, usage tracking
**Spec**: MAPPING-04
**Dependencies**: Migration 0005
**Status**: Planned

### BL-013: Quota Enforcement Middleware
**Component**: FastAPI middleware on Run creation
**Existing**: None
**Change**: Check usage_records vs plan limits before allowing new Runs
**Spec**: MAPPING-04
**Dependencies**: BL-012
**Status**: Planned

### BL-014: Enhanced RunTimeline
**Component**: Extend existing RunTimeline
**Existing**: Tool calls, LLM calls, retrieval events (working)
**Change**: Group by plan phases, show subagent cards with progress
**Spec**: MAPPING-03
**Dependencies**: BL-002
**Status**: Planned

### BL-015: DeliverableStore (Zustand)
**Component**: `ui/src/stores/deliverableStore.ts`
**Existing**: None
**Change**: Selected type + active preview state
**Spec**: MAPPING-03
**Dependencies**: None
**Status**: Planned

### BL-016: Entity/Citation Substrate
**Component**: Extend Artifact model + new CitationEntity model
**Existing**: Artifact/Manifest/Pointer kernel (content-addressed, working)
**Change**: Add typed entity metadata layer (12 Superagent types → mapped to our types: WEB_SOURCE, API_DATA, GENERATED_CONTENT, KNOWLEDGE_BASE, etc.). Citation binding via RunEvent `references_found` → entity lookup by identifier in renderer.
**Spec**: OBJ-1 §10 (Entity Model), OBJ-3 §A1.3 (Citation Binding)
**Tradeoff**: Our Artifact kernel stores blobs. Entities are typed metadata wrappers. Options: (a) extend Artifact with `entity_type` field, (b) new thin EntityRef table pointing to Artifacts. Option (a) preferred — avoids new table.
**Dependencies**: BL-002, Migration 0005
**Status**: Planned

### BL-017: Meta-Reasoning Node
**Component**: New node in research orchestrator graph
**Existing**: None
**Change**: After fan-in, evaluate research quality: identify data gaps, failed tools, incomplete coverage. Dispatch targeted recovery plan with fallback data sources. Key quality differentiator observed in Superagent (FactSet→SEC fallback pattern).
**Spec**: OBJ-2 §B.5 (Meta-Reasoning), OBJ-3 §C1.2 (Meta-Research Quality Check)
**Tradeoff**: Adds 30-60s latency per run. Worth it — dramatically improves quality. Can be skipped for simple queries via planner heuristic.
**Dependencies**: BL-001 (orchestrator must exist first)
**Status**: Planned

### BL-018: Slides Deliverable Pipeline
**Component**: LangGraph deliverable node + viewer component
**Existing**: None
**Change**: LLM → slide deck (JSON AST or reveal.js/HTML) → Artifact → presentation viewer. In v1 scope (PROJECT-BRIEF) but had no backlog item.
**Spec**: MAPPING-02, OBJ-1 §10.1 (GENERATED_PRESENTATION entity type)
**Dependencies**: BL-001, Migration 0005
**Status**: Planned

### BL-019: Document Deliverable (PDF/DOCX Export)
**Component**: Export pipeline from NYQST Markup AST
**Existing**: Docling (document processing/OCR — could potentially help with export too)
**Change**: MarkupNode AST → PDF (via weasyprint/reportlab) and/or DOCX (via python-docx). Download endpoint. In v1 scope but had no backlog item.
**Spec**: MAPPING-02, OBJ-1 §10.1 (GENERATED_DOCUMENT entity type)
**Tradeoff**: Could use (a) server-side PDF gen (weasyprint), (b) client-side (jsPDF), (c) headless browser render-to-PDF. Option (a) preferred — more control, no client dependency.
**Dependencies**: BL-004 (needs Markup AST), BL-005 (report gen feeds export)
**Status**: Planned

### BL-020: Generation Progress Overlay
**Component**: `ui/src/components/generation/GenerationOverlay.tsx`
**Existing**: None
**Change**: Full-screen overlay with dual-status display (primary action + substep), continuous progress bar, "Generating output..." UX. Maps to `node_report_preview_start/delta/done` RunEvents. Key UX pattern — users tolerate 2min waits with visible progress.
**Spec**: OBJ-3 §B1.1 (Dual-Status Display), OBJ-1 Screenshot Analysis
**Dependencies**: BL-002 (needs REPORT_PREVIEW_* RunEvent types)
**Status**: Planned

### BL-021: Clarification Flow
**Component**: Orchestrator node + chat UI handler
**Existing**: None
**Change**: Mid-run pause via `CLARIFICATION_NEEDED` RunEvent. Agent asks user for input, run suspends, user responds, run resumes. Superagent uses this for ambiguous queries.
**Spec**: OBJ-2 §E.1 (clarification_needed event type)
**Tradeoff**: Complex — requires run suspension/resumption, client-side flow interrupt. Could defer to v1.5 if timeline is tight. Recommend at least the RunEvent schema now (BL-002 already includes it) with UI handler in Phase 3+.
**Dependencies**: BL-001, BL-002
**Status**: Planned (v1, UI may slip to v1.5)

### BL-022: Shared Data Brief
**Component**: Orchestrator state / intermediate artifact
**Existing**: RunEvent ledger (append-only, could store brief as event)
**Change**: Research phase produces structured data brief (entities, key facts, financial figures). All downstream generators reference same brief for consistency. Superagent achieves 100% data consistency (e.g., same $281.7B across 5+ files) via this pattern.
**Spec**: OBJ-3 §C2.1 (Data Consistency), OBJ-3 §A5 Recommendations
**Tradeoff**: Brief could be (a) LangGraph state field passed to downstream nodes, (b) stored as RunEvent, (c) stored as Artifact. Option (a) is simplest — LangGraph state carries it naturally.
**Dependencies**: None (design); BL-001 (integration)
**Status**: Planned

---

## Interaction Points (cross-ref INTERACTION-POINTS.md)
- [ ] Brave Search API integration
- [ ] Jina Reader API integration
- [ ] Stripe API integration (checkout, webhooks)
- [ ] Website hosting deployment target (TBD)
- [ ] Existing genui-dashboards-v2 service
- [ ] Existing wiki-propresearch service
- [ ] Financial data APIs (pattern, not specific providers — see EXT-008)
- [ ] Report preview streaming events (internal boundary — see DB-006)

---

## Tradeoffs Log
| Item | Decision | Rationale | Flagged |
|------|----------|-----------|---------|
| BL-016 | Extend Artifact with entity_type vs new table | Avoids schema proliferation, kernel already flexible | 2026-02-16 |
| BL-017 | Include meta-reasoning in v1 | 30-60s latency trade for dramatic quality improvement | 2026-02-16 |
| BL-019 | Server-side PDF over client-side | More control, no browser dependency, consistent output | 2026-02-16 |
| BL-021 | Schema now, UI may defer to v1.5 | Complex client flow, but schema needed regardless | 2026-02-16 |
| v0.app | NOT replicating | Direct LLM code gen instead — avoids external dependency | 2026-02-16 |
| Financial APIs | Pattern not providers | We add data connector pattern, user configures sources | 2026-02-16 |

---

## Revision Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-02-16 | Initial backlog from Mappings 01-04 | Project setup |
| 2026-02-16 | Added BL-016 through BL-022 + Tradeoffs Log | OBJ-1/2/3 cross-reference findings |
| 2026-02-20 | Corrected dependencies for BL-003, BL-005, BL-006, BL-008, BL-011, BL-012, BL-016, BL-018, BL-022 | DEPENDENCY-ANALYSIS.md corrections |
