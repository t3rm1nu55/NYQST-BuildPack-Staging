# Agent 6: Cross-Pack Decision Conflicts

> **Scope**: 10 conflict areas across all build packs, with merge decisions
> **Source**: Extracted from Claude Code conversation transcript (session a59abd46)

---

I now have comprehensive data to write the full analysis. Let me compile it:

---

# Cross-Pack Decision Conflict and Divergence Analysis

## Pack Identities

- **V1** (`/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/`): 17 epics, 85 issues. Architecture-first, broad product scope. Milestone structure M0–M10 (11 milestones). Issue naming: STORY-*/TASK-*/EPIC-* with domain codes.
- **V2** (`/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/`): 14 epics, 122 issues. Wave-driven delivery, domain modules added. Milestone structure M0-P0 through M11. Issue naming: BL-*/P0-*/PLUG-*/STUDIO-*/ENT-*/OBS-*/DI-*/LEASECD-*/DEBT-*/PROP-*/REG-*.
- **V2-merged** (`/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/`): 10 epics, 87 issues. Highest quality synthesis. Milestone structure P0/M0–M6+. Five prefix types: BL-* (22, platform implementation), GAP-* (45, documentation cleanup items), NX-* (12, platform extensions), P0-* (5, stabilization fixes), MIG-* (3, database migrations). Both a milestone-gated backlog and a gap-audit layer.

---

## 1. Run/Event Model

### V1 approach
Envelope schema only: `contract_version`, `run_id`, `sequence_num`, `timestamp`, `event_type`, `payload` (open `object`). No event taxonomy defined in contracts. Taxonomy described loosely in STORY-ORCH-004 ("report preview streaming delta + done semantics") and TASK-PLAT-P0-EVENTSEQ (fix sequence race). Event types are operational/implicit.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/contracts/run_event.schema.json`, `STORY-ORCH-004.md`

### V2 approach
Same base envelope schema (unchanged). **Adds** `RUN_EVENT_TYPES.md` as a separate contract defining 9 named product events in four lifecycle groups: plan lifecycle (`plan_created`, `plan_task_status_changed`), report preview lifecycle (`report_preview_started`, `report_preview_delta`, `report_preview_completed`), provenance lifecycle (`references_found`, `citations_bound`), deliverables lifecycle (`artifact_created`, `deliverable_ready`). BL-002 specifies adding these + TS discriminated union. BL-009 specifies emitting plan events from the graph.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/contracts/RUN_EVENT_TYPES.md`, `BL-002.md`, `BL-009.md`

### V2-merged approach
BL-002 extends to **19 new event types** including SUBAGENT_DISPATCHED, SUBAGENT_COMPLETED, SUBAGENT_FAILED, CONTENT_DELTA, CLARIFICATION_NEEDED, CLARIFICATION_RECEIVED, REPORT_PREVIEW_START/DELTA/DONE, WEB_SEARCH_STARTED/COMPLETED, WEB_SCRAPE_STARTED/COMPLETED, REFERENCES_FOUND, PLAN_CREATED, PLAN_TASK_STARTED/COMPLETED/FAILED, ARTIFACT_CREATED. Named in uppercase (not snake_case). BL-001 mandates SSE stream shows `PLAN_CREATED, N x SUBAGENT_DISPATCHED, N x PLAN_TASK_*, STATE_UPDATE, CHECKPOINT`. Keeps existing `STATE_UPDATE, TOOL_CALL_*, STEP_*`. GAP-014 explicitly flags missing LangGraph-to-SSE integration contract. GAP-021 flags missing failure-state enumeration.
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/items/BL-002__bl-002-runevent-schema-extensions.md`, `GAP-014`, `GAP-021`

**Conflict type**: Evolved. V1 has no taxonomy. V2 adds 9 product events (snake_case). V2-merged expands to 19 (UPPER_CASE) and adds subagent-specific events V2 lacks.

**Naming conflict**: V2 uses `plan_task_status_changed` (single event for all status changes). V2-merged uses three distinct events: `PLAN_TASK_STARTED`, `PLAN_TASK_COMPLETED`, `PLAN_TASK_FAILED`. V2 uses `report_preview_started` / `report_preview_delta` / `report_preview_completed`. V2-merged uses `REPORT_PREVIEW_START` / `REPORT_PREVIEW_DELTA` / `REPORT_PREVIEW_DONE` (different suffix for the terminal event).

**V3 recommendation**: Use V2-merged's 19-type taxonomy with UPPER_CASE naming (consistent with Python enum convention and existing `STATE_UPDATE`). Adopt the three-event plan task pattern (`PLAN_TASK_STARTED`, `PLAN_TASK_COMPLETED`, `PLAN_TASK_FAILED`) rather than a single `plan_task_status_changed` — this makes stream consumers simpler. Use `REPORT_PREVIEW_DONE` (not `report_preview_completed`) for the terminal event. GAP-014 must be resolved by writing the explicit LangGraph → SSE mapping contract before BL-001 implementation.

---

## 2. Agent Architecture — Skill System, Tool System, MCP Integration

### V1 approach
Skills are a full top-level epic (EPIC-AGENTS) at M5 with a separate skill registry, versioning, permissions, MCP integration, and eval harness. STORY-AGENT-001 specifies: skills table with metadata (name, description, permissions, provider), versions, enablement per context pack. MCP via stdio with sandboxed HTTP (STORY-AGENT-002). EPIC-AGENTS depends on EPIC-APPS. Skills are treated as a v1 product feature.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/EPIC-AGENTS.md`, `STORY-AGENT-001.md`

### V2 approach
EPIC-PLUGINS (M5-PLUGINS) replaces EPIC-AGENTS. Covers MCP tool registry + discovery, connector credential storage, tool enablement policies, and skills registry (packaged subgraphs). BL-003 wires Brave/Tavily + Jina Reader as LangChain tools initially with MCP wrappers later. `MCP_TOOL_SPEC.md` defines `{domain}.{resource}.{action}` naming, scope hierarchy (workspace → project → app → task/run), safe/unsafe classification. PLUG-001 through PLUG-005 handle registry, connectors, OAuth, UI, skills packaging.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/issues/EPIC-PLUGINS.md`, `contracts/MCP_TOOL_SPEC.md`, `BL-003.md`

### V2-merged approach
Skills deferred to M5+ as NX-001 (Skills framework v1). Tools treated as NX-002 (Tool directory UI). Connectors as NX-003 (Composio + n8n). For core build, BL-003 wires Brave/Jina as **MCP tools** registered directly in the MCP server (`src/intelli/mcp/server.py`) — not LangChain tools with MCP wrappers later. This is an important distinction: V2-merged commits to native MCP registration from day one. GAP-018 flags the unspecified MCP tool discovery algorithm.
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/items/BL-003__bl-003-web-research-mcp-tools.md`, `issues/epics/m5-platform-extensions.md`

**Conflict type**: Contradictory on scope timing; evolved on approach.

**V1 vs V2/V2-merged conflict**: V1 places EPIC-AGENTS (full skill registry, eval harness, MCP, agent management) at M5 as a blocker before orchestration. V2 and V2-merged reverse the dependency: build the orchestrator first (Wave 0), then add skills/tools infrastructure later as platform extensions. This is the correct prioritization for MVP — V1 has the dependency arrow backwards.

**V2 vs V2-merged conflict**: V2 says "implement as LangChain tools, MCP wrappers later." V2-merged says register natively as MCP tools from day one. These are contradictory. V2-merged is architecturally correct (aligns with DEC-046).

**V3 recommendation**: V2-merged approach. Native MCP registration from day one for BL-003. Skills registry as NX-001 (post-MVP). EPIC-AGENTS from V1 should be broken apart: MCP tool contract (M0) → tool registry + research tools (M1-orchestrator) → full skill packaging (M5+).

---

## 3. Orchestration — LangGraph, PlanSet, Fan-Out

### V1 approach
EPIC-ORCH at M5 with STORY-ORCH-001 (PlanSet schemas/persistence) and STORY-ORCH-002/003/004 (clarification, preview). PlanSet is stored and linked to run_id with explicit ordering. Milestone M5 is late (after Studio, Documents, Evidence, CRM, Models). The `04_ORCHESTRATION_GRAPH_DESIGN.md` research doc describes the full DAG: init → planner → Send() fan-out workers → gather → clarify? → synth → meta → router → generators. This is the most architecturally detailed orchestration specification in any pack.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/EPIC-ORCH.md`, `research/NYQST_Platform_Proposal_Docs/04_ORCHESTRATION_GRAPH_DESIGN.md`

### V2 approach
Orchestration promoted to Wave 0 (M1-W0). BL-001 specifies planner → dispatch → worker(subgraph) → fan-in synth → generator. Uses `Send("worker", task)` fan-out. Workers are `create_react_agent()` wrappers. Fan-in produces DataBrief. Keeps AI SDK streaming contract. BL-007 adds PlanSet persistence (Option A: JSONB on runs, or Option B: new table). BL-017 adds meta-reasoning in Wave 2 ("validate citations, detect low-confidence claims"). BL-022 is Wave 3 (shared data brief). The dependency chain is inverted: BL-022 (DataBrief schema design) is listed downstream of BL-001, which is incorrect.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/issues/BL-001.md`, `BL-007.md`, `BL-017.md`, `BL-022.md`

### V2-merged approach
BL-001 (M1-Orchestrator) corrects the dependency: `BL-022 (DataBrief design) PRECEDES BL-001`. BL-001 blocked by BL-002 only. BL-022 is "design phase" with no blockers, and explicitly noted as needing to feed BL-001's ResearchState. Fan-in structure same as V2 but adds `SUBAGENT_DISPATCHED` / `SUBAGENT_COMPLETED` events. BL-017 (Meta-Reasoning Node) moved to M1-Orchestrator alongside BL-001 (not Wave 2). The meta-reasoning scope changes: V2 says "validate citations, detect low-confidence claims"; V2-merged says "evaluate plan vs results, identify data gaps/failed tasks/incomplete coverage, dispatch recovery tasks."
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/items/BL-001__bl-001-research-orchestrator-graph.md`, `BL-017`, `BL-022`, `GAP-011`

**Conflict type**: Evolved (V1→V2, major re-prioritization), then conflicting details within V2 vs V2-merged.

**Critical conflicts**:
- BL-022 dependency direction is wrong in V2 (downstream of BL-001). V2-merged correctly reverses it. **V3 must use V2-merged direction.**
- BL-017 scope: V2 frames it as "citation validation"; V2-merged frames it as "gap detection + recovery dispatch." V2-merged is architecturally richer.
- BL-017 milestone: V2 places it in Wave 2; V2-merged places it in M1-Orchestrator (earlier). V2-merged is correct since recovery dispatch must be part of the initial orchestrator.

**V3 recommendation**: V2-merged's orchestration approach. Correct dependency order: BL-022 schema design → BL-002 event types → BL-001 orchestrator graph. BL-017 at M1-Orchestrator. V1's research doc `04_ORCHESTRATION_GRAPH_DESIGN.md` is the best architectural reference and should be cited in BL-001's implementation spec.

---

## 4. GenUI/Rendering — GML, Component Registry, Chart Library

### V1 approach
EPIC-GENUI at M3 ("Studio"). STORY-GENUI-001 specifies "at least 20 primitives used in spec," component registry, descriptor schema. STORY-GENUI-002: GML/rehype pipeline (markdown+tags → React components). STORY-GENUI-003: "Chart rendering support (Plotly or chosen lib) + theming" — the library is listed as undecided. No formal GML tag spec. Rendering pipeline deferred to late milestone.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/EPIC-GENUI.md`, `STORY-GENUI-001/002/003`

### V2 approach
BL-004 (GenUI descriptor + base renderer) at Wave 1 (M2-W1). Defines GenUI as JSON descriptors (v0: TextBlock, Table, Callout, Metric, ChartPlaceholder, CitationList) validated with Zod. Renderer maps to React via shadcn primitives. BL-005 adds GML ReportPanel (separate from GenUI) with parser, healer, citation slots. `GENUI_CONTRACT.md` defines 6 component types with `chart.kind` as bar|line|scatter|heatmap — no chart library named. `GML_TAG_SPEC.md` defines 5 allowlisted tags (gml-section, gml-callout, gml-table, gml-chart, gml-citations). DEC-015 split into DEC-015a (backend JSON AST) and DEC-015b (frontend rehype-to-JSX) is referenced but not fully propagated.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/contracts/GENUI_CONTRACT.md`, `GML_TAG_SPEC.md`, `BL-004.md`, `BL-005.md`

### V2-merged approach
BL-004 promoted to M0 Foundation (not Wave 1) — it is a prerequisite for everything. BL-004 scope is renamed to **NYQST Markup AST Schema** (Pydantic, backend), not GenUI descriptors (frontend). Defines 18 node types in `MarkupNodeType` enum. This is DEC-015a (backend JSON AST). BL-005 is renamed to **Report Generation Node** (backend pipeline, not frontend ReportPanel). BL-009 is renamed to **ReportRenderer Component** (frontend). GAP-001 explicitly flags that **BL-009 still specifies Recharts** — a critical documentation error. GAP-002 flags that DEC-015 split is not propagated. GAP-013 flags that the `<answer>...</answer>` XML wrapper stripping is unspecified.
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/items/BL-004__bl-004-nyqst-markup-ast-schema.md`, `BL-005`, `BL-009`, `GAP-001`, `GAP-002`, `GAP-013`

**Conflict type**: Contradictory — multiple serious conflicts.

**Critical conflicts**:

1. **Chart library**: V1 says "Plotly or chosen." V2 GENUI_CONTRACT says nothing. V2-merged BL-009 says **Recharts** in its acceptance criteria (`"CHART nodes render as Recharts charts"`). GAP-001 flags this as a critical error because DEC-048 locks **Plotly.js (react-plotly.js)** based on Superagent bundle analysis. V2-merged simultaneously contains the wrong spec (BL-009 AC) AND the GAP item flagging the error. **V3 must use Plotly.js (react-plotly.js).**

2. **BL-004 scope divergence**: V2 BL-004 = frontend GenUI descriptor renderer. V2-merged BL-004 = backend Pydantic Markup AST schema. These are different deliverables in the same issue number. V2-merged is correct because the AST schema is the foundation that BL-005 and BL-009 depend on.

3. **BL-005 scope divergence**: V2 BL-005 = frontend ReportPanel (GML renderer + healer). V2-merged BL-005 = backend Report Generation Node (4-pass LLM pipeline). Completely different items in the same number.

4. **BL-009 scope divergence**: V2 BL-009 = backend plan events emission. V2-merged BL-009 = frontend ReportRenderer component. Again, completely different.

5. **GML tag count**: V2 `GML_TAG_SPEC.md` defines 5 tags. V2-merged BL-017/GAP-033 references 17-18 GML tags from Superagent analysis. V2's spec is likely insufficient.

**V3 recommendation**: Use V2-merged's scope assignments. Rename issues clearly to avoid numbering collision confusion. BL-004 = Markup AST Schema (backend Pydantic), BL-005 = Report Generation Node (backend), BL-009 = ReportRenderer Component (frontend, using Plotly.js). Adopt V2's `GML_TAG_SPEC.md` as a starting point but expand to ~18 tags. Write a formal `<answer>` wrapper stripping contract before any implementation.

---

## 5. Deliverables — Generation Pipeline, Streaming, Artifact Storage

### V1 approach
EPIC-DELIVERABLES at M5. STORY-DELIV-001 (deliverable selection UI + artifact persistence), STORY-DELIV-002 (co-generation with pending entities flag). Deliverables include reports, websites, and "co-generation." No slide deck or document pipeline specified separately. Provenance and versioning mentioned but pipeline stages are high-level.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/EPIC-DELIVERABLES.md`, `STORY-DELIV-001/002.md`

### V2 approach
Deliverables split across Wave 1 (ReportPanel, preview streaming) and Wave 2 (full pipelines). BL-015 = DeliverableStore + per-message deliverable selection with DB migration (`messages.deliverable_type`). BL-016 = Entity/Citation substrate (Wave 2). BL-018 = Slides (Reveal-based). BL-019 = DOCX/PDF pipeline + BL-019a = Website pipeline. All in Wave 2/3. Co-generation via arq jobs. BL-014 = context management + inheritance.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/issues/INDEX.md` (M3-W2 section)

### V2-merged approach
BL-015 (DeliverableStore Zustand) and BL-008 (DeliverableSelector component) promoted to **M0 Foundation** — GAP-010 explicitly flags their previous misplacement at M3 as "all frontend in Phase 3 waterfall thinking." BL-015 is a 6th Zustand store tracking `selectedType`, `activePreview`, `isGenerating`, `generationPhase`, `generationProgress`, `hasAsyncEntitiesInProgress`. BL-016 = Entity/Citation Substrate at M2 (uses Artifact extension with `entity_type` column, not new tables). BL-005 = Report Generation Node at M2 (4-pass: outline → parallel section gen → review → assembly). BL-018/019/006 at M2. GAP-028 flags that Migration 0005 content is unspecified across 3 sub-migrations.
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/items/BL-015__bl-015-deliverablestore-zustand.md`, `BL-008`, `BL-016`, `GAP-028`

**Conflict type**: Evolved with important scheduling corrections.

**BL-015/BL-008 conflict**: V2 places BL-015 at M3-W2 and uses BL-015b (#106) as the DeliverableSelector at M3-W2. V2-merged correctly moves both BL-015 (DeliverableStore) and BL-008 (DeliverableSelector, #97 PlanViewer in V2 at M2-W1) to M0. Note: V2's BL-008 is actually the PlanViewer component at M2-W1, not a deliverable selector — the analysis must not conflate V2's BL-008 with V2M's BL-008. V2's deliverable selector is BL-015b (#106) at M3-W2. GAP-010 explains the V2-merged promotion. **V3 must use V2-merged placement.**

**Entity/Citation architecture conflict**: V2 BL-016 specifies a new `entities` table + `citations` table (new DB model). V2-merged BL-016 specifies extending the `Artifact` model with `entity_type` column and `tags["canonical_id"]` for deduplication — "extend Artifact with entity_type field (not new table) -- avoids schema proliferation." These are different data models. The V2-merged approach is correct for avoiding schema proliferation and aligns with existing content-addressed artifact substrate.

**V3 recommendation**: V2-merged's approach throughout. Move BL-008 and BL-015 to M0. Use Artifact extension (not new entities table) for entity substrate. Specify Migration 0005 sub-content before any implementation begins.

---

## 6. Frontend Architecture — Component Library, State Management, Routing

### V1 approach
EPIC-FE-SHELL at M1. STORY-FE-001 (app shell: routing, nav, project selector). Left nav routes: Projects, Apps, Studio, Documents, CRM, Models, Dashboards, Workflows, Runs, Settings — 10 modules. Fixture-driven screens. Playwright smoke tests. Vitest component tests. Uses mockups/NyqstPortalMockupV2.tsx as reference. No specific state management library named beyond implicit Zustand usage.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/EPIC-FE-SHELL.md`, `STORY-FE-001.md`

### V2 approach
No dedicated FE-SHELL epic. Frontend work is distributed across waves. BL-004b, BL-005*, BL-008, BL-010, BL-011, BL-015, BL-015b, BL-016c cover frontend concerns. BL-015 = DeliverableStore + DeliverableSelector. Context management UI (BL-014d) added. Studio surfaces (STUDIO-001 through STUDIO-007) as their own milestone. Full RBAC/ABAC enforcement in ENT-002. Zustand stores explicitly referenced (5 existing + new deliverable-store). React + shadcn/ui confirmed.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/issues/INDEX.md`

### V2-merged approach
M3: Frontend epic groups 7 issues: BL-007 (PlanViewer), BL-009 (ReportRenderer), BL-010 (WebsitePreview), BL-011 (Enhanced SourcesPanel), BL-014 (Enhanced RunTimeline), BL-020 (Generation Progress Overlay), BL-021 (Clarification Flow). M0 Foundation includes BL-008 (DeliverableSelector) and BL-015 (DeliverableStore) as early frontend items. BL-015 explicitly names 6 Zustand stores and their files. Routing/nav not explicitly addressed in a single story — V1's STORY-FE-001 has no direct equivalent in V2-merged.
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/epics/m3-frontend.md`, `BL-015`

**Conflict type**: V1 regression in V2/V2-merged. V1 EPIC-FE-SHELL with its early shell, routing, and all-screens-with-skeletons story has no equivalent in V2 or V2-merged. Both later packs assume the shell already exists.

**V3 recommendation**: Restore a version of V1's STORY-FE-001 as a P0/M0 item. The shell routing, nav, and skeleton screens are prerequisites for all frontend work in any pack and were simply assumed to already be done in V2/V2-merged. Also: the mockup route reference in V1 (`TASK-FE-004`) has no equivalent in V2/V2-merged and should be preserved.

---

## 7. Auth/Permissions — JWT vs Sessions, RBAC, Tenant Isolation

### V1 approach
Auth treated as a Layer 1 primitive in the dependency model. `TASK-PLAT-P0-TENANTRUN` adds `tenant_id` FK to Run at P0. Security doc specifies: "enforce tenant_id on every query," "deny-by-default in data access layer." Enterprise auth (SSO/RBAC) not addressed in early milestones. STORY-PLAT-002 mentions "CI: unit/integration/contract/live split + secrets discipline."
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/TASK-PLAT-P0-TENANTRUN.md`, `docs/10_SECURITY_GOVERNANCE.md`

### V2 approach
P0-003 adds `tenant_id` to Run model and API filtering. EPIC-ENTERPRISE (M6) covers OIDC SSO, RBAC/ABAC, audit logs, billing/metering. ENT-001 = OIDC SSO. ENT-002 = RBAC/ABAC policy engine enforced across APIs and UI. ENT-003 = audit log expansion. ENT-005 = data retention/deletion/export (GDPR baseline). Security doc identical to V1. Context inheritance (`CONTEXT_INHERITANCE.md`) defines 4-scope hierarchy.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/issues/EPIC-ENTERPRISE.md`, `contracts/CONTEXT_INHERITANCE.md`

### V2-merged approach
P0-004 adds `tenant_id` to **core tables** (runs, artifacts, manifests, pointers) — broader scope than V2's P0-003 which only covers the Run model. NX-010 = Security hardening for agentic connectors (M5+). GAP-043 flags missing RLS strategy for database, tenant isolation guarantee for SSE streams, and LangGraph checkpoint isolation by tenant as an unspecified compliance requirement. GAP-034/035 flag JWT vs session cookies ambiguity and SSO design gap. GAP-042 flags missing staging environment.
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/items/GAP-043`, `GAP-034`, `GAP-035`

**Conflict type**: Evolved. V2-merged is strictly better.

**Key divergence on P0-004 scope**: V2 P0-003 adds `tenant_id` only to Run. V2-merged P0-004 adds `tenant_id` to all four core tables (runs, artifacts, manifests, pointers). The broader scope is correct — tenant isolation must span the entire content-addressed substrate, not just runs.

**V3 recommendation**: V2-merged P0-004 scope. GAP-043 must produce a concrete RLS + SSE tenant isolation spec before M1 work begins. V2's EPIC-ENTERPRISE (M6) is the right milestone for OIDC/RBAC — do not pull it earlier.

---

## 8. Database — Migration Strategy, Naming Conventions, Relationship Patterns

### V1 approach
Migrations mentioned in context of P0 fixes and billing. No explicit migration numbering or sub-migration strategy. Naming: snake_case tables, subscriptions/usage_records for billing. Billing at M9 (late). No explicit schema for entities/citations.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/STORY-BILL-001.md`

### V2 approach
Migration 0005 referenced as a monolithic migration that covers billing tables (subscriptions, usage_records) and entity/citation tables. BL-016a adds `entities` + `citations` as new tables (separate from Artifact). BL-015a adds `messages.deliverable_type` migration. Multiple items depend on Migration 0005. DEC-052 split into 0005a/b/c but V2 doesn't fully reflect this.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/issues/INDEX.md`

### V2-merged approach
Migration 0005 explicitly split into MIG-0005A (substrate metadata: `entity_type`/`entity_id` columns on Artifact), MIG-0005B (entity + citation tables), MIG-0005C (billing + metering tables) — three distinct migration issues at M0/M1. BL-016 uses Artifact extension with `entity_type` column (not new entities table) — contradicts V2's BL-016a which creates a new `entities` table. GAP-028 flags that sub-migration content is still unspecified. GAP-007 flags missing infrastructure decision for PostgreSQL + pgvector + Neo4j + Redis. GAP-009 flags 8 incorrect blocked-by fields in V2's GIT-ISSUES (specifically BL-003 incorrectly lists BL-001 as blocker).
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/epics/m0-foundation.md`, `GAP-028`, `GAP-009`

**Conflict type**: Contradictory on entity storage architecture.

**Critical conflict**: V2 BL-016 creates new `entities` + `citations` tables. V2-merged BL-016 extends the existing `Artifact` model with `entity_type` column and uses `tags["canonical_id"]` for deduplication. These are fundamentally different data models. Also: MIG-0005B creates `entities` and `citations` tables (V2-merged M0 Foundation) but BL-016's technical notes say "extend Artifact with entity_type field (not new table)." There is an internal inconsistency within V2-merged itself — MIG-0005B adds entity+citation tables, but BL-016 says no new tables.

**V3 recommendation**: Resolve the V2-merged internal inconsistency by deciding: either extend Artifact (simpler, less schema proliferation) OR create new entity/citation tables (cleaner separation). Given V2-merged's explicit statement "avoids schema proliferation," use the Artifact extension approach and update MIG-0005B accordingly. The three-part migration split (0005A/B/C) is correct and should be retained. Write explicit content specs for each sub-migration before any work starts.

---

## 9. Billing — Stripe Integration, Metering Model

### V1 approach
EPIC-BILLING at M9 (second-to-last milestone). Priority: low. STORY-BILL-001 through STORY-BILL-004 cover: migration, usage recording on run completion, quota middleware, Stripe integration in test mode. Stripe is "optional if enabled." Usage tracked per run, linked to tenant/project. Simple model.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/issues/EPIC-BILLING.md`, `STORY-BILL-001/004.md`

### V2 approach
Billing merged into EPIC-ENTERPRISE (M6) as ENT-004 (billing/metering: usage records per tenant, tokens, tools, storage, Stripe integration). Stripe is mandatory, not optional. More comprehensive: tracks tokens + tools + storage, not just runs. Quota enforcement tied to RBAC system.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/issues/EPIC-ENTERPRISE.md`, `ENT-004.md`

### V2-merged approach
BL-012 = **Billing System** at M4 (not M6 or M9). Priority: high. Ports Stripe code from `okestraai/DocuIntelli`. Specific plan structure: free=5 runs/month + 2 reports, pro=$20/month with 200 runs + $0.50/run overage. BL-013 = Quota Enforcement Middleware at M4. Billing unit: 1 run = 1 AI message generation; reads are free. Requires MIG-0005C (billing tables: subscriptions, usage_records at M1). GAP-029 flags that DocuIntelli source hasn't been audited for correctness. GAP-024 flags that LiteLLM (required for Langfuse cost tracking) is not yet in place.
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/items/BL-012__bl-012-billing-system.md`, `GAP-029`, `GAP-024`

**Conflict type**: Contradictory on scope and timing.

**Critical conflicts**:
- V1: Billing at M9, optional Stripe. V2: Billing at M6, mandatory, token+tool metering. V2-merged: Billing at M4, mandatory, run-based billing from DocuIntelli port with specific price points.
- BL-012 in V2 is "Planner prompt library + heuristics" (a completely different issue). BL-012 in V2-merged is "Billing System." This is a direct numbering collision.
- Metering model: V2 meters tokens + tools + storage. V2-merged meters runs (1 run = 1 message generation). These are irreconcilable without a strategic decision.

**Additional numbering collisions (V2 vs V2-merged)**:
- P0-003: V2 = "Add tenant_id to Run model" vs V2M = "Make local stack boot reliably." These are completely different issues under the same identifier.
- P0-004: V2 = "Make Redis always-on in dev compose" vs V2M = "Add tenant_id to core tables." Again, different issues under the same identifier. Note that V2-merged's P0-004 subsumes V2's P0-003 scope (tenant_id) while V2's P0-004 is an infrastructure concern that becomes a separate unlabeled prerequisite in V2-merged.

**V3 recommendation**: BL-012 number collision must be resolved — rename one. On metering model: for a $200k/yr enterprise product, run-based billing (V2-merged) is simpler to understand and audit; token metering (V2) is more granular but harder to predict. Recommend V2-merged's run-based model for v1 with token tracking as observability-only (via Langfuse), upgradeable to token billing in v2. Milestone: M4 (V2-merged) is correct — billing cannot be M9.

---

## 10. Milestone/Wave Structure — How Work Is Sequenced

### V1 structure
11 milestones (M0–M10). Horizontal: M0=baseline, M1=contracts+UI shell, M2=documents, M3=studio, M4=evidence+CRM, M5=apps+agents+deliverables, M6=models, M7=dashboards, M8=workflows, M9=billing, M10=hardening. EPIC dependencies are mostly explicit. 6 parallel tracks (A=core backend, B=documents, C=intelligence, D=frontend, E=workflow, F=testing). No wave concept. Ordering DAG clearly defined in `03_DEPENDENCIES_AND_ORDERING.md`.
Source: `/tmp/nyqst_assess/v1/NYQST_BUILD_PACK/github/MILESTONES.md`, `docs/03_DEPENDENCIES_AND_ORDERING.md`

### V2 structure
14 milestones (M0 through M11, with parallel splits at M5 and M6). Wave-based for core work: P0=stabilization, M1-W0=orchestrator, M2-W1=GenUI+rendering, M3-W2=deliverables, M4-W3=polish. Then milestone-based for platform extensions: M5-STUDIO, M5-PLUGINS, M6-ENTERPRISE, M6-OBS. Then domain modules: M7-DOCUINTELLI through M11-PROPSYGNAL. Waves are time-boxed; milestones are scope-based. Both DAG and wave concepts present.
Source: `/tmp/nyqst_assess/v2/NYQST_BUILD_PACK_V2/github/MILESTONES.md`

### V2-merged structure
10 milestones: P0=stabilization, M0=foundation, M1=agents+streaming (1 issue), M1=orchestrator (4 issues), M2=deliverables (5 issues), M3=frontend (7 issues), M4=billing+polish (2 issues), M5+=platform extensions (6 issues), M6+=product modules (6 issues). Plus 45 GAP-* cleanup issues. Simpler than V2 — no wave labels, just milestone labels. Notably M1 is split into two sub-milestones with different focuses. Total core build issues: 22 (BL-* items) + 8 (M0 foundation including migrations) + 3 (P0).
Source: `/tmp/nyqst_assess/v2_1/NYQST_BUILD_PACK_V2/issues/INDEX.md`

**Conflict type**: Evolved — V1 is the broadest product roadmap, V2 adds wave structure, V2-merged streamlines to a focused execution plan.

**Key divergence**: V1 and V2 include full product scope (Studio, Documents, Workflows, Models, Dashboards, CRM, Billing) in the milestone structure. V2-merged focuses tightly on the research harness primitives (BL-001 through BL-022) and delegates everything else to M5+/M6+ NX-* items. This means V2-merged's milestones represent the minimum viable platform, while V1 and V2 represent the full product roadmap.

**V3 recommendation**: Adopt V2-merged's tight execution structure for M0–M4 (the implementation backlog). Adopt V2's milestone labels for M5+ domain modules and enterprise work. The 45 GAP items from V2-merged should be treated as a P0-adjacent cleanup sprint before any BL-* work starts.

---

## Unique-to-One-Pack Insights

### Only in V1
- **STORY-FE-001**: Explicit app shell routing + nav + all-screen-skeletons story. V2/V2-merged assume this is done.
- **TASK-FE-004**: Mockup route integration (dev-only NyqstPortalMockupV2.tsx route). Unique development scaffold.
- **EPIC-DOCUMENTS** (full M2 epic with STORY-DOCS-001 through STORY-DOCS-006): Bundles, versions, ingest pipeline, extraction, diff engine, frontend screens. V2-merged defers all of this to NX-011 (Knowledge base manager). V1 is the only pack with a full documents implementation plan.
- **EPIC-DASH** (M7): Dashboard builder + provenance drilldowns. Not present in V2-merged at all.
- **EPIC-WORKFLOWS** (M8, n8n-like): Workflow builder, node canvas, scheduler. Mentioned in V2-merged as NX-012 but not specified.
- **EPIC-INTEL** (M4): Evidence + insights + review queue + stale propagation. No equivalent in V2-merged core build.
- **CRM** as a standalone epic: STORY-CRM-001/002. Only V1 has this explicitly scoped.
- **STORY-CON-001**: Contract governance + versioning rules + fixtures discipline. V2-merged has no equivalent governance story.
- **STORY-STREAM-001**: Streaming protocol alignment (NDJSON/SSE), heartbeat, reconnect. V2-merged treats this as part of BL-002 but doesn't give it its own story.

### Only in V2
- **CONTEXT_INHERITANCE.md** contract: 4-scope hierarchy (workspace → project → app → task/run), precedence rules, ContextPack schema, retrieval policy. This is a first-class contract in V2 but only referenced implicitly in V2-merged (BL-014 context management).
- **RAG-001/RAG-002**: Hybrid retrieval (vector + keyword) + reranking + metadata filters + knowledge base UI. V2-merged defers this to NX-011.
- **BL-013** (Docs/Notebooks integration into research runs) and **BL-014** (full context management with inheritance and background indexing) as Wave 2 stories.
- **Domain modules** (M7–M11: DocuIntelli, LeaseCDs, Debt, RegSygnal, PropSygnal) with their own epics and stories. V1 has no domain modules. V2-merged has domain modules only as NX-004 through NX-011 high-level items.
- **BL-017** (Wave 2) as "Meta-reasoning node: validate citations, detect low-confidence claims, suggest repairs" — the citation validation framing.
- **Separate EPIC-OBS** (M6-OBS) with OBS-001 through OBS-004: tracing, metrics, evals in CI, load testing. V1 folds this into EPIC-PROD.

### Only in V2-merged
- **45 GAP items** as a first-class milestone. This is the unique contribution — a comprehensive audit of documentation inconsistencies, critical bugs (TOCTOU race, ARQ worker registration failure), and open decisions that must be resolved before implementation. No other pack has this.
- **P0-001/P0-002**: Explicit ARQ worker registration bug (GAP-023) and sequence_num TOCTOU race (GAP-022). These are concrete code-level bugs discovered by direct codebase inspection.
- **P0-004/P0-005**: `tenant_id` on all four core tables (not just Run), plus production Dockerfiles + minimal CI as a P0 item.
- **MIG-0005A/B/C**: Explicit three-part migration split as standalone issues in M0.
- **BL-022** (DataBrief design preceding BL-001): The correct dependency reversal. V2 has BL-022 downstream; V2-merged has it upstream.
- **NX-012**: Optional NDJSON fetch streaming alongside SSE (Superagent-style).
- **`<answer>` wrapper stripping spec** (GAP-013): The requirement to specify where DEC-022's XML wrapper gets stripped before GML rendering reaches the frontend. Unique insight.

---

## Evolutions (Where V2/V2-merged Improved on V1)

1. **Orchestration prioritization**: V1 placed orchestration at M5 (late). V2/V2-merged moved it to Wave 0/M1 (earliest non-P0 work). Correct.
2. **P0 specificity**: V1 P0 is vague (TASK-PLAT-P0-ARQ, TASK-PLAT-P0-EVENTSEQ). V2-merged P0 items name specific bugs (ARQ functions list empty, TOCTOU race) with reproduction-level detail.
3. **Domain module roadmap**: V2 adds DocuIntelli, LeaseCDs, Debt, RegSygnal, PropSygnal. V1 has none.
4. **tenant_id scope**: V2-merged extends to all four core tables vs. V1/V2's Run-only approach.
5. **Gap audit**: V2-merged's 45 GAP items are a unique and high-value addition.
6. **BL-022 dependency correction**: V2-merged reverses the dependency direction.
7. **Migration granularity**: V2-merged splits Migration 0005 into three addressable issues.
8. **Frontend item promotion**: V2-merged moves BL-008 and BL-015 to M0 (from V2's M3).

---

## Regressions (Where V2/V2-merged Lost Something from V1)

1. **EPIC-FE-SHELL / STORY-FE-001**: V1's explicit app shell story (routing, nav, all screens with skeletons) is absent from V2 and V2-merged. Both assume this is done, but no issue captures it.
2. **EPIC-DOCUMENTS full spec**: V1 has 6 detailed stories (docs-001 through docs-006). V2 has BL-013/014. V2-merged has only NX-011 (knowledge base manager) as a high-level item. Full document pipeline is under-specified in both V2 packs.
3. **STORY-CON-001 (contract governance)**: V1's explicit story about versioning rules, fixtures discipline, and TS type generation from contracts has no direct equivalent. Contracts discipline gets lost.
4. **STORY-STREAM-001 (streaming protocol)**: V1's explicit NDJSON/SSE alignment + heartbeat + reconnect story is absorbed into BL-002 in V2-merged but loses standalone visibility.
5. **EPIC-DASH (dashboards)**: Present in V1 (M7), absent from V2-merged core build entirely.
6. **EPIC-WORKFLOWS full spec**: V1 has STORY-WF-001 through STORY-WF-004. V2 has STUDIO-007. V2-merged has NX-005 only.
7. **STORY-INTEL (evidence/insights) and EPIC-CRM**: Full standalone epics in V1. V2-merged folds into NX-004 (Research Notebook) without the same level of evidence/insight lifecycle specification.
8. **Eval harness (STORY-AGENT-004)**: V1's dedicated evaluation harness story is absent from V2-merged core build (only mentioned in NX-009 observability).

---

## Naming Conflicts (Same Concept, Different Names)

| Concept | V1 name | V2 name | V2-merged name |
|---|---|---|---|
| Plan status event | (implicit in STORY-ORCH-004) | `plan_task_status_changed` | `PLAN_TASK_STARTED` / `PLAN_TASK_COMPLETED` / `PLAN_TASK_FAILED` |
| Report stream end event | `report_preview_completed` (V2 contract) | `report_preview_completed` | `REPORT_PREVIEW_DONE` |
| Worker issue | STORY-AGENT-002 (MCP integration) | BL-003 (web research tools) | BL-003 (Web Research MCP Tools) |
| Plan storage story | STORY-ORCH-001 | BL-007 (PlanSet persistence) | (PlanViewer component — different scope) |
| Frontend deliverable selector | (none) | BL-015b (DeliverableSelector) | BL-008 (DeliverableSelector Component) |
| Frontend deliverable state | (none) | BL-015 (DeliverableStore) | BL-015 (DeliverableStore Zustand) |
| GML rendering pipeline | STORY-GENUI-002 | BL-005 (ReportPanel frontend) | BL-009 (ReportRenderer Component) |
| Backend report pipeline | STORY-ORCH-004 | BL-006 (preview deltas stream) | BL-005 (Report Generation Node backend) |
| Document markup schema | (implicit in contracts) | BL-004 (GenUI descriptor frontend) | BL-004 (NYQST Markup AST Schema backend) |
| Billing story | STORY-BILL-004 (Stripe) | ENT-004 (enterprise billing) | BL-012 (Billing System) |
| Prompt quality | (none) | BL-012 (Planner prompt library) | BL-012 (Billing System — collision!) |
| tenant_id on Run | TASK-PLAT-P0-TENANTRUN | P0-003 (Add tenant_id to Run model) | P0-003 (Make local stack boot reliably — collision!) |
| Redis dev compose | (none) | P0-004 (Make Redis always-on in dev compose) | P0-004 (Add tenant_id to core tables — collision!) |
| Agent architecture epic | EPIC-AGENTS | EPIC-PLUGINS | NX-001 (Skills), NX-002 (Tool UI), NX-003 (Connectors) |
| Provenance entity storage | STORY-ENTITY-001 (V1 EPIC-INTEL) | BL-016 (new entities/citations tables) | BL-016 (Artifact extension with entity_type) |
| Production hardening | EPIC-PROD (M10) | (folded into EPIC-OBS + EPIC-ENTERPRISE) | GAP-038 (CI/CD), GAP-042 (staging), NX-009 (observability) |

---

## Summary Table for V3 Merge Decisions

| Area | Decision |
|---|---|
| Run event taxonomy | Use V2-merged's 19 UPPER_CASE types; adopt three-event plan task pattern |
| Run event envelope | Use V1/V2 base schema (unchanged across all packs) |
| Orchestration sequence | BL-022 → BL-002 → BL-001 (V2-merged direction) |
| BL-017 scope + timing | V2-merged: gap detection + recovery, M1-Orchestrator |
| Chart library | Plotly.js / react-plotly.js (DEC-048, V2-merged GAP-001 resolution) |
| BL-004 scope | V2-merged: backend Pydantic Markup AST (18 node types), M0 Foundation |
| BL-005 scope | V2-merged: backend 4-pass Report Generation Node, M2 |
| BL-009 scope | V2-merged: frontend ReportRenderer Component, M3 |
| GML tag count | Target ~18 tags (Superagent analysis), not V2's 5 |
| BL-008 + BL-015 milestone | V2-merged: M0 Foundation (not M3) |
| Entity/citation storage | V2-merged: Artifact extension approach (not new tables). Resolve MIG-0005B internal inconsistency |
| Migration 0005 | Three-part split (0005A/B/C), write content specs for each before implementation |
| P0-004 tenant_id scope | V2-merged: all four core tables |
| Billing milestone | M4 (V2-merged), not M6 or M9 |
| Billing model | V2-merged: run-based (1 run = 1 generation) for v1 |
| BL-012 numbering collision | Rename V2's "Planner prompt library" to a distinct ID |
| Frontend shell | Restore V1's STORY-FE-001 as an M0 or P0 item |
| ARQ bugs | V2-merged P0-001 (functions list) + P0-002 (TOCTOU race) — implement before all else |
| GAP items | Treat 45 GAP-* issues as a P0-adjacent cleanup sprint before any BL-* implementation |
| Domain modules | V2's structure (M7–M11) for DocuIntelli, LeaseCDs, Debt, RegSygnal, PropSygnal |
| Contract governance | Restore V1's STORY-CON-001 as a locked contract discipline story |
| Documents pipeline | V1's 6-story STORY-DOCS-001/006 spec should be preserved for M2+ product scope |
agentId: a17f9d4 (for resuming to continue this agent's work if needed)

---
## Corrections (applied 2026-02-21, session 5 verification)
- V2 event count corrected: 14 → 9 (per RUN_EVENT_TYPES.md contract)
- V2 milestone count corrected: 11 → 14 (parallel splits at M5 and M6)
- BL-008 placement corrected: V2 BL-008 is at M2-W1 (PlanViewer), not M3
- V1 milestone count corrected: 10 → 11 (M0 through M10 inclusive)
- Added missed P0-003/P0-004 numbering collisions between V2 and V2M
- V2M track description corrected: 3 tracks → 5 prefix types (BL, GAP, NX, P0, MIG)
<usage>total_tokens: 136782
tool_uses: 93
duration_ms: 395037</usage>
