# Agent 3: V1 Intelligence Track Concept Decomposition

> **Scope**: 9 Intelligence Track epics from the V1 Build Pack
> **Source**: Extracted from Claude Code conversation transcript (session a59abd46)

---

Now I have all the material I need. Let me produce the full decomposition:

---

## EPIC-INTEL

### Concepts (primitive building blocks specified in the issues)

- **C1: Evidence** — First-class, immutable records of extracted facts with mandatory provenance. Each evidence record carries `source_type` (BUNDLE_VERSION, WEB_SNAPSHOT, or USER_NOTE), a content string, an optional `confidence` score (0–1), and optional `run_id` and `offset_start/offset_end` span pointers. Solves: raw extraction results are not trustworthy unless anchored to a versioned document or web snapshot.
- **C2: Insight** — A human-facing assertion ("statement") that REQUIRES at least one evidence link. Status lifecycle: DRAFT → REVIEWED → PUBLISHED → ARCHIVED. Can cross-link to CRM entity IDs and model field IDs. Carries a `stale` boolean flag. Solves: decisions need structured, reviewable assertions rather than raw LLM text.
- **C3: Stale Propagation Engine** — A dependency graph (bundle_version → evidence → insight → model fields) that marks downstream nodes stale when upstream changes (new bundle version uploaded). Produces deterministic stale badges with explanations of the upstream delta. Solves: intelligence goes out of date silently without explicit tracking.
- **C4: Review Queue** — An operational screen surfacing low-confidence evidence and conflicting items for human review. Actions: approve, edit (creates new evidence version), mark conflict, link to insight. Can later be materialized as a View App. Solves: scale-up requires human-in-the-loop triage.
- **C5: Entity and Citation System** (STORY-ENTITY-001, filed under M4/EPIC-INTEL) — Canonical entity objects (COMPANY, PERSON, ASSET, CONTRACT, OTHER) with relationship edges, citation records pointing to bundle version spans or web snapshot URLs, and a citation-buffer pattern for async linking during runs. Entity matching/merge flows with audit. Solves: provenance is fragmented without resolved real-world objects that evidence and insights can attach to.

### Decision Points

- **D1 (in C1): Source type taxonomy** — Evidence source restricted to three types: BUNDLE_VERSION, WEB_SNAPSHOT, USER_NOTE.
  - R1a: Open-ended string field (flexible but ungoverned)
  - R1b: Strict enum (current spec)
  - Likely: Strict enum enforced at schema layer; new source types gated by contract change.
- **D2 (in C5): Entity matching strategy** — How duplicate/near-duplicate entities are identified and merged.
  - R2a: Exact-match on name/external ID only
  - R2b: Heuristic matching (name similarity + attribute overlap) with UI-assisted merge
  - Likely: R2b (STORY-ENTITY-001 says "entity matching heuristics on fixtures" with unit tests)
- **D3 (in C4): Review queue as screen vs. View App** — The issue explicitly notes the queue "can later be saved as a View App."
  - R3a: Hardcoded screen (v1 default)
  - R3b: Materialise immediately as a View App
  - Likely: R3a for v1; conversion to View App deferred.
- **D4 (in C3): Stale propagation trigger** — When stale marks are written.
  - R4a: Synchronous on bundle version creation
  - R4b: Async worker job
  - Likely: R4b (depends on arq worker; TASK-INTEL-004 depends on STORY-DOCS-005 diff engine and STORY-INTEL-002)

### Dependencies

- **Internal:** C3 (stale propagation) depends on C1 (evidence) and C2 (insights) existing first. C4 (review queue) depends on C1+C2. C5 (entity/citation system) depends on C1 (evidence spans) and STORY-DOCS-004 (extraction pipeline).
- **External:**
  - EPIC-DOCUMENTS (STORY-DOCS-004 extraction spans, STORY-DOCS-005 diff engine) — both are prerequisite inputs to C1 and C3.
  - EPIC-CONTRACTS (TASK-CON-004 — bundle/version + evidence + insight schemas locked first).
  - EPIC-CRM — insight linking to CRM entities (C2 → CRM).
  - EPIC-MODELS — insight linking to model fields (C2 → Models).
  - EPIC-FE-SHELL — C4 review queue UI.

### Key Implementation Insights

- Evidence schema has `offset_start`/`offset_end` + `page` fields for sub-document span pointing — this is a character-offset provenance anchor, not just page-level.
- `confidence` field (0.0–1.0) on evidence is what drives the review queue filter; threshold is not specified — needs a configurable constant.
- Stale propagation requires a traversal over a dependency graph stored in the DB (bundle_version_id FK chains). The unit test requirement ("stale computation is deterministic and testable") implies this must be a pure function operating on persisted graph data, not LLM-driven.
- Citation buffer pattern in STORY-ENTITY-001 is async-friendly: during a run, citations are buffered and batch-linked after extraction completes. This is a non-trivial concurrency pattern.
- Insight status transitions must be audit-logged (every transition recorded), not just the current state.
- E2E acceptance: upload bundle v2 → stale badge appears on downstream insight. This is a complete vertical slice test.

### Unique Value (things ONLY V1 specifies that other packs drop)

- Stale propagation engine (TASK-INTEL-004): no other pack specifies this; it is a full dependency-graph staleness system.
- Review queue with approve/edit/conflict/link-to-insight actions — a human-in-the-loop triage surface.
- Confidence score on evidence driving automated queue population.
- Citation buffer pattern for async entity resolution during runs (STORY-ENTITY-001).
- Entity matching/merge flows with heuristics — entity deduplication at ingest time.
- Insight status lifecycle (DRAFT → REVIEWED → PUBLISHED → ARCHIVED) with audited transitions.

---

## EPIC-STUDIO

### Concepts

- **C1: Notebook** — A multi-page document surface. Block types: text, evidence embed, app output embed. Each block links to the provenance inspector. A citations panel shows all linked evidence and sources per page. Solves: analysts need a narrative layer on top of raw data and run outputs.
- **C2: Infinite Canvas** — A spatial, pan/zoomable workspace with blocks (nodes) and typed edges (supports / derived-from / contradicts). Canvas has a block library and an inspector panel that shows block metadata and provenance links. Solves: spatial reasoning over complex multi-source intelligence.
- **C3: Canvas Persistence** — Save/load of canvas layout (blocks, edges, x/y positions) per project to the backend. Debounced writes. v1: latest snapshot only (no version history). Solves: without persistence the canvas is a demo toy.
- **C4: Pinning** — Cross-module action to move outputs from Apps runs and document diffs into Studio surfaces. Pin app output → creates a canvas block linked to run_id. Pin diff → creates a diff block linked to bundle_version pair. Pinning can also create a notebook page/section. Solves: outputs from computation need to become reusable artefacts in the workspace.

### Decision Points

- **D1 (in C2): Canvas library choice** — Infinite canvas with pan/zoom, node/edge creation.
  - R1a: React Flow (open-source, widely used)
  - R1b: Custom canvas (full control)
  - R1c: Fabric.js / Konva
  - Likely: React Flow (issues reference "node canvas" pattern matching React Flow idioms, edge types align with React Flow nomenclature; also aligns with workflow builder in EPIC-WORKFLOWS which uses same "node canvas" language).
- **D2 (in C3): Canvas versioning approach**
  - R2a: Latest-only (v1 default, explicitly stated in TASK-STUDIO-003: "simple v1: latest only")
  - R2b: Full version history
  - Likely: R2a — spec is explicit.
- **D3 (in C1): Notebook block persistence** — Whether notebook blocks have same debounce-save or explicit save action.
  - Not explicitly decided in issues; canvas persistence story (TASK-STUDIO-003) covers canvas only.
  - Likely: notebook follows same debounce pattern since canvas sets the precedent.
- **D4 (in C2): Edge semantics** — Edge types are specified as "supports / derived-from / contradicts" — these are semantic provenance relationships, not generic graph edges.
  - R4a: Typed enum (supports / derived-from / contradicts)
  - R4b: Free-text label
  - Likely: R4a — spec is explicit.

### Dependencies

- **Internal:** C4 (pinning) depends on C2 (canvas) and C1 (notebook); C3 (persistence) depends on C2.
- **External:**
  - EPIC-CONTRACTS (contracts schema for events/provenance)
  - EPIC-FE-SHELL (routing, navigation)
  - EPIC-INTEL (evidence embeds in notebook blocks — C1 depends on evidence existing)
  - EPIC-APPS (pin app outputs — C4 depends on app runs existing)
  - EPIC-DOCUMENTS/STORY-DOCS-005 (pin diff blocks — C4 depends on diff engine output)

### Key Implementation Insights

- Canvas blocks must carry provenance links (run_id or bundle_version pair) baked in at creation time via pinning — this is not retrofittable.
- The provenance inspector is shared across notebook and canvas; it should be a standalone panel component receiving a provenance ref as props.
- Edge types (supports/derived-from/contradicts) are semantically meaningful and will need to be rendered distinctly (colour/style). They form a lightweight argument graph.
- Vitest coverage is required for canvas reducers and notebook store — implies Zustand (or similar) state management with pure reducer functions testable without DOM.
- Canvas persistence must be resilient: debounced save with retry; failures must not block the user.
- The EPIC-STUDIO epic is in M3, before M4 (intelligence). Notebook evidence-embed blocks (STORY-STUDIO-001) depend on EPIC-INTEL, creating a cross-milestone dependency that requires either mock/fixture-driven implementation or sequencing the notebook evidence blocks as a sub-feature after M4.

### Unique Value

- Infinite canvas with typed semantic edge relationships (supports/derived-from/contradicts) — a provenance argument graph.
- Evidence embed block type in notebook (not just text).
- Diff block type on canvas (pin a document diff into the workspace).
- Provenance inspector panel on every block.
- App output pinning into canvas with run linkage.

---

## EPIC-CRM

### Concepts

- **C1: CRM Entity** — Canonical domain objects: COMPANY, PERSON, ASSET, CONTRACT, OTHER. Attributes stored as open JSON. Project-scoped. CRUD with tenant isolation. Solves: intelligence needs to be anchored to real-world objects, not just documents.
- **C2: Relationship Graph** — Typed edges between entities (`to_entity_id`, `relationship_type`, optional metadata). Stored as relationship records and queryable. Solves: analysts need to navigate connected entities (e.g., who owns which asset under which contract).
- **C3: Entity Detail Screen** — Frontend view: linked bundles, evidence, insights, and relationships per entity. Plus an entity list with filters. Solves: entity-centric navigation into all downstream intelligence.

### Decision Points

- **D1 (in C1): Entity type set** — Fixed enum vs. extensible.
  - R1a: Fixed enum (COMPANY, PERSON, ASSET, CONTRACT, OTHER) — current spec.
  - R1b: User-defined entity types.
  - Likely: R1a for v1; extensibility deferred.
- **D2 (in C3): Saved views / segmentation** — The epic notes "Saved views support CRM segmentation (later can be View Apps)."
  - R2a: Hardcoded filter UI
  - R2b: View App materialisation
  - Likely: R2a for v1.
- **D3: Timeline** — The frontend story STORY-CRM-002 explicitly scopes timeline in its issue title: "Frontend: CRM list + entity detail + timeline + linked items." The timeline is part of the defined scope, not an unresolved question. Implementation detail (whether time-ordered linked items or a dedicated feed) is not further specified, but the feature itself is in-scope.

### Dependencies

- **Internal:** C3 depends on C1 and C2.
- **External:**
  - EPIC-INTEL (evidence and insights link to entities — CRM depends on intelligence layer)
  - EPIC-CONTRACTS (entity schema)
  - EPIC-FE-SHELL (routing)

### Key Implementation Insights

- Relationship edges are stored as a list on the entity record in the JSON schema but must be queryable bidirectionally in the database (entity A → entity B must also surface when querying entity B).
- The STORY-CRM-002 AC explicitly requires showing "linked bundles, evidence, insights" on entity detail — this is a join across three tables driven by foreign keys from evidence/insight records to entity_id.
- Entity type enum includes "CONTRACT" as a CRM entity type (distinct from EPIC-CONTRACTS which is the schema governance epic). Do not conflate these.
- The integration test for STORY-CRM-001 covers "create entity + relationship" — relationship must be queryable immediately after creation (no async step).

### Unique Value

- CRM is fully embedded in the intelligence layer — entity detail pages show evidence and insights, not just CRM data. This is a concept no other parity-style pack includes.
- Typed relationship edges between entities stored as a graph, queryable per entity.

---

## EPIC-MODELS

### Concepts

- **C1: Model Registry** — Versioned definitions of domain schemas: model, model_version, fields, field-to-evidence requirements. Model versions are immutable after publish; editing creates a new draft. Solves: users need to define structured domain schemas (e.g., a lease deal schema) without code changes.
- **C2: Field Evidence Requirements** — Per-field declarations of what evidence types or sources are required to consider a field "covered." Solves: validation gaps (fields without evidence) become explicit and surfaced rather than silent.
- **C3: Validation Engine** — Deterministic rule evaluator. Produces validation run records: pass/fail per rule, with results linked to evidence or gaps. Run log shows validation steps. Rules are defined as part of the model definition. Solves: trustworthy intelligence requires explicit pass/fail verification against evidence.
- **C4: Impact Diff** — After a new document version is ingested, compute model field deltas: which fields changed, link each delta to evidence deltas and document diffs. Produces a consumable feed for dashboards. Solves: explainability — users need to understand *why* a model changed.
- **C5: Model Editor UI** — Schema builder UI: create/edit model drafts, publish versions, configure evidence requirements per field. Solves: non-technical domain experts can define and evolve models.

### Decision Points

- **D1 (in C3): Rule engine type** — Deterministic rule evaluation.
  - R1a: Pure Python rule evaluation (condition expressions over field values)
  - R1b: LLM-assisted rule evaluation
  - Likely: R1a — spec explicitly says "deterministic" and the unit test requirement ("rule evaluation correctness") confirms pure-function evaluation.
- **D2 (in C1): Model versioning granularity**
  - R2a: Integer version on model_version record (current spec: `version: integer, minimum: 1`)
  - R2b: Semantic versioning
  - Likely: R2a.
- **D3 (in C4): Impact diff trigger** — When impact diff runs.
  - R3a: Synchronous on bundle v2 upload
  - R3b: Background worker job triggered by BUNDLE_VERSION_CREATED event
  - Likely: R3b — TASK-MODEL-004 depends on STORY-DOCS-005, STORY-MODEL-003 (validation engine), and TASK-INTEL-004 (stale propagation), all of which are event-driven.
- **D4 (in C2): Evidence requirements enforcement** — Hard block vs. soft warning when evidence requirements not met.
  - R4a: Hard block (validation fails; no publish)
  - R4b: Soft warning (gaps surfaced; can still publish)
  - Likely: R4b — spec says "evidence coverage gaps" appear in validation results, not that they block publish.

### Dependencies

- **Internal:** C3 (validation engine) depends on C1 (model registry) and C2 (field requirements). C4 (impact diff) depends on C3 and TASK-INTEL-004. C5 (editor UI) depends on C1.
- **External:**
  - EPIC-INTEL — evidence must exist to link validation results to evidence records.
  - EPIC-CRM — model fields can link to CRM entities (CRM must exist before model fields can reference entities).
  - EPIC-DOCUMENTS/STORY-DOCS-005 — diff engine output is the upstream input to impact diff.
  - TASK-CON-002 — run_event schema needed for validation run events.
  - EPIC-DASH — impact diff feed consumed by dashboards.

### Key Implementation Insights

- `model.schema.json` has `schema: object` and `rules: array of objects` — the schema field is an open JSON blob, meaning the model schema is user-defined (not meta-typed). Rule evaluation must be written to operate on arbitrary JSON-shaped field values.
- `validation_runs: array` is on the model schema — implying validation runs are linked to the model version they ran against.
- Impact diff (TASK-MODEL-004) produces "model field delta list for v1→v2" — this is a structured diff format that must be consumable by downstream dashboard tiles and the stale propagation engine.
- The model editor UI (STORY-MODEL-002) is XL sized — it is the most complex frontend piece in this epic, requiring field-by-field evidence requirement configuration with a schema builder.
- Unit test requirement for validation is explicit: "rule evaluation correctness" on fixtures — this must be the highest-confidence test in the intelligence stack.

### Unique Value (exclusively V1)

- Versioned model registry with field-level evidence requirement declarations — not present in any other pack.
- Deterministic validation engine producing pass/fail per rule with evidence coverage gaps.
- Impact diff: structured explanation of model field changes linked to document diffs — a full explainability chain.
- Model editor UI allowing non-technical users to define domain schemas without code.
- Model version immutability after publish (draft/published lifecycle mirroring apps).

---

## EPIC-DASH

### Concepts

- **C1: Dashboard Definition** — Persisted dashboard with named tiles. Each tile references a model field and provenance rules. Supports CRUD (create/edit/reorder/remove tiles). Solves: executive users need KPI views without building them from raw data.
- **C2: Tile Data Query** — Each tile loads data by querying the model field it references; provenance links are included in the response. Solves: every number on a dashboard must be traceable to its source evidence.
- **C3: Provenance Panel** — Per-tile drilldown surface showing the model field, linked evidence records, and run lineage. Solves: "audit-first" requirement — no KPI without a chain of custody.
- **C4: Exceptions View** — An exceptions list (tiles in failed/warning state) that supports navigation directly to Studio blocks. Solves: operational monitoring — analysts need to act on anomalies, not just read them.
- **C5: Dashboard Builder UI** — Frontend builder: add/remove/reorder tiles, configure tile queries. Runtime view: live data with refresh. Solves: non-technical users configure dashboards without code.

### Decision Points

- **D1 (in C2): Tile query mechanism** — How tiles fetch live data from model fields.
  - R1a: Pre-aggregated model field values cached on model version
  - R1b: Live query against evidence/model tables on tile load
  - Likely: R1b for v1 (no caching spec is mentioned; tile queries return current model field state with provenance links).
- **D2 (in C5): Dashboard layout persistence** — How tile positions are stored.
  - R2a: Ordered list (no grid position)
  - R2b: Grid layout with x/y/w/h per tile
  - Likely: R2a for v1 (spec says "reorder tiles" not "drag-and-drop grid layout").
- **D3: Refresh semantics** — Whether dashboard refresh is manual or automatic.
  - The epic AC says "Refresh updates are explainable with deltas" but does not specify auto-refresh interval.
  - Likely: manual refresh button producing a delta diff for v1.

### Dependencies

- **Internal:** C3/C4/C5 depend on C1 and C2.
- **External:**
  - EPIC-MODELS — tiles reference model fields; dashboard data is model-derived.
  - EPIC-INTEL — provenance panel requires evidence records.
  - EPIC-STUDIO — exceptions view navigates to Studio blocks (cross-navigation dependency).
  - EPIC-FE-SHELL — routing.

### Key Implementation Insights

- `STORY-DASH-001` AC: "Provenance links included in responses" — the dashboard API must embed provenance metadata inline with tile data, not as a separate call.
- Exceptions view navigation to Studio blocks creates a runtime cross-module link (dashboard → canvas block via block ID stored on validation run or model delta).
- Dashboard persistence is in STORY-DASH-001 (backend) with a simple CRUD API — dashboard_id, list of tiles, each tile's model field ref.
- The E2E test is: create dashboard → add tile → drilldown provenance. This is a complete vertical test through models → intelligence → dashboard.

### Unique Value (exclusively V1)

- Provenance panel on every dashboard tile tracing KPI to evidence — no other pack has this.
- Exceptions view navigating to Studio canvas blocks.
- Impact diff feed consumption by dashboards (deltas explained on refresh).
- Dashboard tiles referencing model fields directly (not generic chart definitions).

---

## EPIC-WORKFLOWS

### Concepts

- **C1: Workflow Definition** — A versioned, graph-structured definition: nodes + edges + triggers. Stored with `workflow_id`, `project_id`, `version` (integer, immutable after publish). Nodes have types (TRIGGER, ACTION, CONDITION) and operations (RUN_APP, INGEST_BUNDLE, RUN_VALIDATION, NOTIFY). Edges can carry conditions. Solves: repeatable multi-step automation needs a durable, versioned specification.
- **C2: Workflow Runner** — Executes a workflow graph deterministically using the arq worker/jobs system. Each node emits events and stores a `node_run` record. Supports per-node retries with backoff. Partial success recorded. Solves: reliable execution with node-level observability and fault tolerance.
- **C3: Trigger Dispatcher** — Fires workflow runs from two trigger types: SCHEDULE (cron) and EVENT (e.g., `BUNDLE_VERSION_CREATED`, `VALIDATION_FAILED`). Each triggered run is audited. Solves: manual-only workflows don't scale.
- **C4: Workflow Builder UI** — n8n-style visual builder on a node canvas: node palette, edge creation, node configuration panels, validation warnings, run log viewer. Supports publishing a workflow version. Solves: non-technical users build automation without YAML or code.

### Decision Points

- **D1 (in C1): Cycle policy** — STORY-WF-001 says "graph validation prevents cycles unless allowed" — the caveat "unless allowed" implies conditional cycle support.
  - R1a: Strict DAG (no cycles)
  - R1b: Allow explicit cycle nodes (loop/while pattern) with a loop limit
  - Likely: R1b is deferred; v1 is strict DAG with the escape hatch reserved.
- **D2 (in C2): Execution model** — How nodes are scheduled.
  - R2a: Sequential node execution (simple queue)
  - R2b: Parallel fan-out for independent branches
  - Likely: R2a for v1 (runner "executes deterministically"; no fan-out specified).
- **D3 (in C4): Canvas library** — Same decision as EPIC-STUDIO canvas.
  - Likely: React Flow (consistent with Studio canvas; same "node canvas" terminology).
- **D4 (in C3): Event trigger source** — Which events can trigger a workflow.
  - Specified: BUNDLE_VERSION_CREATED, VALIDATION_FAILED.
  - These must be published by the event bus (PG LISTEN/NOTIFY) and consumed by the trigger dispatcher.

### Dependencies

- **Internal:** C2 depends on C1. C3 (triggers) depends on C2 (STORY-WF-002) AND STORY-APPS-004. C4 depends on C1 (builder persists to backend).
- **External:**
  - EPIC-APPS (RUN_APP is a workflow node operation — app runner must exist).
  - EPIC-DOCUMENTS (INGEST_BUNDLE node operation).
  - EPIC-MODELS (RUN_VALIDATION node operation).
  - TASK-PLAT-P0-ARQ (arq worker must be fixed before workflow runner can run).
  - TASK-CON-002 (run_event schema for node-level events).
  - STORY-APPS-004 (trigger system shared with app triggers — WF-003 explicitly depends on APPS-004).

### Key Implementation Insights

- `workflow.schema.json` Node types: TRIGGER, ACTION, CONDITION. This is a three-node-type model; it does not include a LOOP type. Loop support would require schema extension.
- Node `op` field (RUN_APP, INGEST_BUNDLE, RUN_VALIDATION, NOTIFY) maps directly to the four primary platform operations — the workflow runner is essentially a meta-orchestrator over existing runners.
- Edge `condition` field is a string — likely a simple expression DSL (e.g., `output.status == "FAILED"`) but the expression language is not specified. This is an open decision requiring a concrete language choice (e.g., JMESPath, CEL, simple Python-safe eval).
- STORY-WF-003 (triggers) explicitly depends on STORY-WF-002 (workflow runner) AND STORY-APPS-004 (app triggers) — triggers are a shared system, not workflow-exclusive. The scheduler/dispatcher must handle both.
- Run log viewer (STORY-WF-004 AC: "View run logs per node") requires per-node-run records accessible via API — not just a single run log stream.

### Unique Value (exclusively V1)

- n8n-style visual workflow builder UI — full node canvas for non-technical automation design.
- Workflow runner as a meta-orchestrator over the platform's own node operations (RUN_APP, INGEST_BUNDLE, RUN_VALIDATION, NOTIFY).
- Typed CONDITION nodes with edge conditions (expression DSL for branching).
- Per-node retry with backoff and partial success recording.
- Workflow versioning with immutability after publish (same lifecycle as Apps and Models).
- Event trigger on VALIDATION_FAILED — automation can respond to intelligence exceptions, closing a feedback loop from Models back into Workflows.

---

## EPIC-APPS

### Concepts

- **C1: App Schema** — A versioned, publishable unit of repeatable work. Types: VIEW, AGENT, ANALYSIS, WORKFLOW. Fields: `inputs` (typed input fields with kinds: TEXT, NUMBER, DATE, SELECT, MULTISELECT, BOOLEAN, JSON), `context_pack` (source + permission boundaries), `engine` (engine_type: AGENT, WORKFLOW, QUERY, PIPELINE + ref), `outputs` (output mappings), `triggers`. Status: DRAFT → PUBLISHED → ARCHIVED. Solves: repeatability requires a governed, versioned specification.
- **C2: App Builder Wizard** — Multi-step wizard UI: basics → type → inputs → context pack → engine → outputs → triggers → publish. Templates prefill. Validation prevents publishing invalid configs. Solves: without a builder, Apps remain developer-only.
- **C3: App Runner** — Creates a Run record, executes the engine (dispatches to agent/workflow/query/pipeline), streams run events, persists output mappings (NOTEBOOK_PAGE, CANVAS_BLOCK, EVIDENCE, INSIGHT, MODEL_UPDATE, DASHBOARD_REFRESH, ARTIFACT). Failures produce run status FAILED with error events. Solves: Apps must run and produce artifacts, not just exist as configs.
- **C4: Triggers** — Schedule (cron) and event-based (BUNDLE_VERSION_CREATED) triggers that invoke the app runner with specified inputs and context pack. Audited with run logs. Solves: repeatability requires automation beyond manual execution.
- **C5: App Diff UI** — Compares two app_version configs: changed inputs, context pack, engine, outputs, triggers. Each run links back to the exact app_version it ran against. Solves: version accountability.
- **C6: Context Pack** — The permission and source boundary for an app run. Sources: project_context_blocks, bundle_versions, crm_entities, model_versions, web_enabled, skills_enabled. Permissions: allow_web, allow_write_models, allow_create_artifacts. Solves: agents need a defined, auditable scope rather than open access.

### Decision Points

- **D1 (in C1): App type enum** — VIEW, AGENT, ANALYSIS, WORKFLOW.
  - The WORKFLOW type within an App implies an App can wrap a Workflow (meta-nesting). This creates a distinction between a Workflow (EPIC-WORKFLOWS graph executor) and an App of type WORKFLOW (which may just call the workflow runner via the engine ref). The relationship between App engine_type:WORKFLOW and EPIC-WORKFLOWS is not fully disambiguated.
  - Likely: App type WORKFLOW = App whose engine dispatches to the workflow runner; the two systems are complementary not competing.
- **D2 (in C3): Output mapping targets** — Seven output types: NOTEBOOK_PAGE, CANVAS_BLOCK, EVIDENCE, INSIGHT, MODEL_UPDATE, DASHBOARD_REFRESH, ARTIFACT.
  - This means the app runner must be able to write to six different subsystems. Sequencing matters: MODEL_UPDATE and DASHBOARD_REFRESH can only work after EPIC-MODELS and EPIC-DASH exist.
  - v1 likely defers MODEL_UPDATE and DASHBOARD_REFRESH to M6/M7.
- **D3 (in C6): Context pack web access** — `web_enabled: boolean` + `allow_web: boolean` (two separate flags).
  - R3a: Single flag
  - R3b: Two-layer (source declares web; permission confirms it) — current spec.
  - Likely: R3b. `web_enabled` = sources include web; `allow_web` = permission gate.
- **D4 (in C2): Diff preview before publish** — "optional v1" in STORY-APPS-002.
  - Likely: deferred to a follow-up; TASK-APPS-005 (app diff UI) is separate and medium priority.

### Dependencies

- **Internal:** C2 depends on C1. C3 depends on C1 + TASK-CON-002. C4 depends on C3. C5 depends on C1 + C2. C6 is embedded in C1.
- **External:**
  - EPIC-CONTRACTS (TASK-CON-003: app + context_pack schemas locked)
  - EPIC-FE-SHELL (routing)
  - EPIC-STUDIO (outputs can pin to canvas/notebook — STUDIO must exist for those output mappings to resolve)
  - EPIC-WORKFLOWS (App triggers share trigger dispatcher with workflow triggers — STORY-APPS-004 is depended upon by STORY-WF-003)
  - EPIC-PLATFORM (baseline, arq worker)

### Key Implementation Insights

- Output mapping `output_type: MODEL_UPDATE` is particularly powerful — an App run can directly update a model field. This requires careful write-path design to ensure provenance is preserved (the update must carry run_id and evidence_ids).
- `inputs[].source` field allows SELECT/MULTISELECT inputs to be data-sourced from BUNDLES, CRM_ENTITIES, or MODEL_VERSIONS — the builder must implement dynamic dropdown population from live API calls.
- App versions are immutable post-publish (STORY-APPS-001 AC: "Published app versions immutable") — all runs reference an app_version, never the current draft.
- Run events are sequenced (`sequence_num: integer, minimum: 1`) and must be ordered when replayed — the race condition fix (TASK-PLAT-P0-EVENTSEQ) is a P0 blocker for App runner correctness.
- Engine type QUERY is undefined beyond "reference to query id" — this may be a direct SQL/GraphQL query executor that does not go through LangGraph. It is underspecified.

---

## EPIC-AGENTS

### Concepts

- **C1: Skill Registry** — Versioned skill records with: name, description, permissions (web, storage, write_models, etc.), provider, version. Skills can be enabled/disabled per app/context_pack. Audit records skill usage in runs. Solves: agents must not have arbitrary power; every tool invocation must be controlled and auditable.
- **C2: MCP Tool Runner** — Executes MCP tool processes via stdio transport. Wraps HTTP client with allowlist, timeouts, and rate limits (SSRF protection). Captures tool I/O as TOOL_CALL_* run events with PII redaction. Failure surfaces as WARNING/ERROR events without crashing the run. Solves: hot-swappable tool providers need a safe, sandboxed execution layer.
- **C3: Agent/Skills Management UI** — Settings subpages: list skills with permissions and versions, enable/disable per project or context pack, show last-used and recent runs. Solves: admin users need operational visibility and control over agent capabilities.
- **C4: Evals Harness** — Evaluation framework that runs core app templates on fixed fixtures in CI (mocked providers) and live manual pipeline (real providers). Checks structured outputs and required events. Reports deltas and failures. Enforces cost caps for live evals. Solves: agent quality regressions caught before production.

### Decision Points

- **D1 (in C2): MCP transport protocol**
  - R1a: stdio (current spec — "stdio tool runner")
  - R1b: SSE/HTTP (MCP also supports HTTP transport)
  - Likely: stdio for v1; HTTP transport deferred.
- **D2 (in C2): SSRF protection mechanism**
  - R2a: IP allowlist only
  - R2b: Allowlist + timeouts + size limits + rate limits (current spec)
  - Likely: R2b — multiple layers specified.
- **D3 (in C2): Redaction scope** — "Tool invocation emits TOOL_CALL_* events with redaction." What is redacted is unspecified.
  - Likely: API keys, PII patterns (email, SSN formats) stripped from tool I/O before writing to run_events.
- **D4 (in C4): Evals framework library** — "LangSmith-style" evaluation.
  - R4a: LangSmith/LangFuse integration
  - R4b: Custom fixture runner (CI-compatible)
  - Likely: Custom fixture runner for CI (mocked); LangSmith/LangFuse as optional live eval backend — consistent with DEC-045 (Langfuse self-hosted) in project memory.

### Dependencies

- **Internal:** C2 depends on C1 (permissions are resolved from skill registry before tool invocation). C3 depends on C1. C4 depends on STORY-APPS-003 (app runner) and C2.
- **External:**
  - EPIC-APPS — skills are enabled per app/context_pack; the App schema's `context_pack.sources.skills_enabled` references skills from C1.
  - EPIC-CONTRACTS (skill schema contracts)

### Key Implementation Insights

- MCP tool processes are external processes launched via stdio. The runner must manage process lifecycle (spawn, stdin/stdout pipe, timeout/kill). Process isolation is the key security boundary.
- `TOOL_CALL_STARTED` / `TOOL_CALL_COMPLETED` / `TOOL_CALL_FAILED` event types implied by "TOOL_CALL_*" pattern — these must be defined in the run_event schema (TASK-CON-002).
- Skill permissions list: web, storage, write_models — these map directly to context_pack permission fields (`allow_web`, `allow_write_models`, `allow_create_artifacts`). The permission check at invocation time must cross-reference both the skill's declared permissions and the context_pack's allowed permissions.
- Security test ("SSRF attempt blocked") is an explicit acceptance criterion in STORY-AGENT-002 — this is not optional.
- Live eval pipeline requires "cost caps" — implies a token/cost counter per eval run that aborts if budget exceeded. This must be configurable (not hardcoded).
- Evals report "deltas" — implies evals compare current run output against a golden fixture, not just pass/fail. Delta format not specified.

### Unique Value (exclusively V1 vs. other packs)

- MCP stdio tool runner with multi-layer SSRF sandboxing and run-event I/O capture.
- Skill registry with declared permission model cross-checked against context_pack permissions at invocation time.
- Evals harness running on fixed fixtures in CI with delta reporting and live eval cost caps.
- TOOL_CALL_* event stream with PII redaction baked into the invocation path.

---

## EPIC-BILLING

### Concepts

- **C1: Billing Data Model** — Two tables: `subscriptions` (tenant-linked, plan, status) and `usage_records` (per-run, cost/tokens, tenant, created_at). Migrations with FKs and indexes. Solves: quota and billing require a durable ledger. Note: STORY-BILL-001 carries a `size:S` (small) label — the data model itself is a contained unit of work despite the broader billing epic's scope.
- **C2: Usage Recording** — Service that creates a usage record when a run completes, linked to tenant. Aggregates per-month. Idempotent on retries (no duplication). Solves: accurate per-run cost tracking for quota enforcement and billing.
- **C3: Quota Middleware** — FastAPI middleware that checks cumulative usage against plan quota before allowing a new run. Returns 429 with clear error message when exceeded. Solves: abuse prevention and plan enforcement.
- **C4: Stripe Integration** — Checkout flow creates customer/subscription in test mode. Webhook endpoint reads raw body and verifies Stripe signature. Updates subscription status on events. Solves: production monetization via external payment processor.

### Decision Points

- **D1 (in C4): Stripe vs. alternative processor** — "Optional" Stripe per STORY-BILL-004 ("if enabled").
  - R1a: Stripe only
  - R1b: Pluggable payment processor
  - Likely: Stripe v1 in test mode; architecture should allow swap.
- **D2 (in C3): Quota check granularity**
  - R2a: Per-tenant global quota
  - R2b: Per-project quota
  - Likely: R2a — "over-limit tenant gets 429" (tenant-level granularity in AC).
- **D3 (in C2): Usage metrics** — Cost or tokens or both.
  - The story says "record cost/tokens per run" — both dimensions, but aggregation currency unspecified.
  - Likely: tokens as the primary metered unit; cost derived from token * rate.
- **D4 (in C4): Webhook signature verification** — "raw bytes" specified explicitly.
  - This is a known Stripe footgun: must read raw request body before any JSON parsing.
  - Non-negotiable; spec is explicit.

### Dependencies

- **Internal:** C2 depends on C1. C3 depends on C2. C4 depends on C1 (subscriptions table).
- **External:**
  - EPIC-PLATFORM (TASK-PLAT-P0-TENANTRUN — tenant_id must exist on runs before usage records can link to tenants)
  - EPIC-CONTRACTS (run_event schema — usage recording triggers on run completion event)

### Key Implementation Insights

- STORY-BILL-001 explicitly requires `autogenerate import wiring works` — implies SQLAlchemy `alembic autogenerate` must pick up the new ORM models; the migration import chain must be correct.
- Quota middleware must be applied before run creation endpoint, not inside the runner — to block the run before any compute starts.
- Usage aggregation "per month" requires either a DB aggregate query or a separate monthly rollup job. Not specified which.
- Stripe webhook: raw body requirement means FastAPI must capture `Request.body()` before routing to Pydantic model parsing. Common FastAPI pattern requires a background dependency or route-level raw body capture.
- STORY-BILL-004 is optional ("if enabled") and is a live-only test — it will not be covered in CI integration tests.

### Unique Value (V1 vs. other packs)

- Usage recording per run (tokens + cost) as a first-class billing ledger — not just a counter.
- Quota middleware as a hard gate at the API layer (429) before compute starts.
- Stripe webhook with raw-body signature verification explicitly specified as a hard requirement.
- Monthly usage aggregation built into the usage service.

---

## Cross-Epic Summary: V1-Exclusive Intelligence Stack

The following epics represent capabilities that V1 specifies and other build packs drop entirely:

| Epic | V1-Exclusive Core |
|---|---|
| EPIC-INTEL | Stale propagation engine, evidence confidence scoring, review queue, insight lifecycle, entity/citation buffer |
| EPIC-MODELS | Versioned model registry, field evidence requirements, deterministic validation engine, impact diff |
| EPIC-DASH | Provenance-linked dashboard tiles, exceptions navigation to Studio, delta-explained refresh |
| EPIC-WORKFLOWS | n8n-style visual workflow builder, meta-orchestrator node ops, typed condition nodes, VALIDATION_FAILED event trigger |
| EPIC-STUDIO | Semantic canvas edge types (supports/derived-from/contradicts), diff-block pinning, provenance inspector per block |
| EPIC-CRM | Evidence/insight-linked entity detail pages, typed relationship graph |

The dependency chain for the V1-exclusive stack is strictly ordered: EPIC-INTEL → EPIC-CRM → EPIC-MODELS → EPIC-DASH, with EPIC-WORKFLOWS depending on EPIC-MODELS and EPIC-APPS, and EPIC-STUDIO usable from M3 but requiring EPIC-INTEL for evidence-embed blocks. All six epics depend on EPIC-INTEL as the foundational provenance layer.
agentId: aa2c2b0 (for resuming to continue this agent's work if needed)
<usage>total_tokens: 72426
tool_uses: 59
duration_ms: 284997</usage>

---
## Corrections (applied 2026-02-21, session 5 verification)
- TASK-INTEL-004: added missing dependency on STORY-INTEL-002 (issue #65 depends on both STORY-DOCS-005 and STORY-INTEL-002)
- TASK-MODEL-004: added missing dependency on STORY-MODEL-003 (issue #75 depends on STORY-DOCS-005, STORY-MODEL-003, and TASK-INTEL-004)
- STORY-CRM-002: timeline is explicitly scoped in issue title, not unresolved
- STORY-WF-003: added missing dependency on STORY-WF-002 (issue #78 depends on both STORY-WF-002 and STORY-APPS-004)
- STORY-BILL-001: noted actual size label is S (small)
