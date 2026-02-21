# Agent 4: V2 Unique Additions

> **Scope**: 5 domain modules + enterprise features unique to V2
> **Source**: Extracted from Claude Code conversation transcript (session a59abd46)

---

Now I have a complete picture. Let me compile the full deep analysis:

---

## V2 vs V1: Complete Delta Analysis

---

## Structural Overview

V1 has 17 epics organized across **11 ordered milestones (M0–M10)** with domain-namespaced prefixes (STORY-ORCH-NNN, STORY-DOCS-NNN, STORY-INTEL-NNN, etc.) and no wave grouping or domain modules. V2 has 14 epics organized into **14 milestones (12 milestone numbers M0–M11, with parallel splits at M5 and M6)** in strict build order, with domain-namespaced issue IDs, systematic sub-task decomposition, and a full spec-delta report.

The V1 issue set is preserved in V2's `issues_legacy_v1/` — the V2 backlog is a complete replacement, not an additive patch.

---

## PART 1 — DOMAIN MODULES (V2-Unique Revenue Verticals)

---

### EPIC-DOCUINTELLI — Document Intelligence and Corpus Analysis (M7)

- **Source:** `EPIC-DOCUINTELLI.md`, `DI-001.md`, `DI-002.md`, `BL-023.md` through `BL-030.md`
- **Concepts:**
  - **Corpora/Bundles** — first-class grouping above artifacts: `corpora` + `corpus_documents` tables with version timelines, source/date/counterparty metadata, and corpus explorer UI
  - **DocIR** — Document Intermediate Representation: structured JSON capturing text, headings, tables, page coords, structural blocks extracted from PDFs/docs. Block-level embeddings. Clause-level retrieval via locators. UI span highlighting by locator.
  - **Framework analysis** — multiple frameworks (e.g. IFRS vs internal model) can be applied to the same corpus; each produces dimension scores + pattern matches
  - **Cross-framework reconciliation** (BL-023) — compare two or more framework outputs into a reconciliation matrix: overlaps / conflicts / coverage gaps, rendered as a table with evidence drilldown
  - **Mental model prompt library** (BL-024) — versioned, schema-validated prompt templates per framework, with Pydantic + Zod output validators
  - **Dimension discovery agent** (BL-025) — emergent dimension proposal: agent scans DocIR blocks → proposes candidate dimensions with evidence examples → human-in-the-loop approval → saved to dimension library
  - **Pattern library + matcher** (BL-026) — structured pattern definitions (clauses, regex/semantic, examples); matcher runs over DocIR blocks and returns matches with locators + confidence scores; results stored as artifacts
  - **Process template engine** (BL-027) — analysis templates (frameworks + dimensions + patterns + thresholds + deliverables) that compile to LangGraph workflows for repeatable corpus analysis
  - **Anomaly detection engine** (BL-028) — input: dimension scores + pattern matches + reconciliation matrices → output: ranked anomaly list (type, severity, impacted docs, evidence locators); exportable to Decisions/tasks
  - **Dimensional visualization engine** (BL-029) — GenUI-contract-based visualizations: heatmaps, coverage matrices, timelines with hover-to-evidence and click-to-doc-span; exportable to slides and reports
  - **Corpus comparison agent** (BL-030) — corpus A vs corpus B (or version sets) → diff summary, dimension deltas, new/removed anomalies, key changes with citations; comparison view + canvas diff nodes
- **Decision Points:**
  - DocIR format choice (block granularity, page coordinates, table extraction format) — implied, not resolved in issues
  - Human-in-the-loop approval UX for dimension discovery (modal vs inline panel)
  - Pattern definition format (regex vs semantic vs hybrid)
  - Framework model: how frameworks are registered/versioned (code-based registry implied)
- **Dependencies:** `EPIC-STUDIO` (for canvas), `BL-016` (entity/citation substrate), `PLUG-002` (knowledge tools), `DI-002` (DocIR pipeline), `STUDIO-005` (diff viewer), `STUDIO-007` (workflow builder for process templates)
- **Implementation Depth:** Has detailed technical requirements — specific DB table schemas, DocIR JSON format concept, locator-based UI highlighting, LangGraph compilation for process templates. Not greenfield narrative — these are implementable specs.

---

### EPIC-LEASECD — Lease CD Module (M8)

- **Source:** `EPIC-LEASECD.md`, `LEASECD-001.md` through `LEASECD-004.md`
- **Concepts:**
  - **Canonical Lease Entity Model:** `leases` table (project_id, client_id, property_id optional) + child tables: `rent_steps`, `break_options`, `indexation`, `covenants`. Versioning of extracted vs user-edited values. Citation linkage on every field to source clause.
  - **Lease Extraction Skill** (LEASECD-002) — uses DocIR blocks + pattern library to locate candidate clauses; LLM extracts structured fields with locators; stores as "proposed values" awaiting user confirmation/edit. Registered as a named Skill in PLUG-005 registry.
  - **Deterministic Calculation Engine** (LEASECD-003) — inputs: structured terms (dates, rent steps, indexation rules); outputs: cashflow schedule, NPV, key dates, scenario comparisons. Explicit `explain()` per computed line item. LLM-only arithmetic explicitly rejected.
  - **Scenario Builder** — user-configurable assumptions (inflation, break exercise) driving re-computation with explain traces
  - **Term Review UI** — table with citations/locators and edit controls; proposed vs confirmed value states
  - **Export to Deliverables** — lease outputs (charts + schedules) flow into shared DataBrief → deliverable pipelines (slides, DOCX)
- **Decision Points:**
  - Whether `leases.property_id` is required or optional (currently optional — deferred to PropSygnal linkage)
  - Indexation rule modeling: CPI-linked vs fixed step vs hybrid
  - NPV discount rate source: user input, market data, or stored assumption
  - Break option exercise logic: deterministic rules or scenario analysis
- **Dependencies:** `BL-016` (entity/citation substrate), `DI-002` (DocIR extraction), `STUDIO-001` (Projects model), `BL-018` (slides deliverable), `BL-019` (DOCX deliverable), `PLUG-005` (skills registry for extraction skill)
- **Implementation Depth:** Has concrete DB schema (table names, child tables), explicit `explain()` API pattern, golden fixture testing requirement, property-based tests for edge cases. The calc engine is a non-LLM deterministic component — significant standalone engineering.

---

### EPIC-DEBT — Debt Module (M9)

- **Source:** `EPIC-DEBT.md`, `DEBT-001.md` through `DEBT-004.md`
- **Concepts:**
  - **Canonical Debt Instrument Model:** `debt_instruments`, `tranches`, `rate_terms`, `covenants`, `events` tables. Full CRUD with versioning and citation linkage.
  - **Debt Extraction Skill** (DEBT-002) — same DocIR + pattern + LLM pattern as Lease extraction skill. Proposed values with user edit flow. Registered in skills registry.
  - **Deterministic Amortization Engine** (DEBT-003) — computes: amortization schedules under fixed/floating rates, covenant ratio calculations based on financial inputs. `explain()` traces per period and per ratio. Same no-LLM-arithmetic constraint as Lease.
  - **Covenant Monitoring + Alert Rules** (DEBT-004) — alert rules stored per project with threshold configuration; covenant breach detection; dashboard with exceptions; all evidence links back to source clauses and calculation assumptions.
  - **Dashboards with Provenance** — schedule views, covenant status, exceptions list, with drilldown to cited source
- **Decision Points:**
  - Rate modeling: SOFR/LIBOR migration handling, compound vs simple interest
  - Covenant ratio definitions: who defines the formula? User-configurable or platform-defined library?
  - Alert delivery: in-app only vs email/webhook (V1 implies in-app only)
  - Tranche hierarchy depth (facilities vs tranches vs sub-tranches)
- **Dependencies:** `BL-016` (entity/citation substrate), `DI-002` (DocIR pipeline), `STUDIO-001` (Projects), `STUDIO-004` (canvas dashboards), `PLUG-005` (skills registry)
- **Implementation Depth:** Concrete schema, explicit covenant ratio computation (not just storage), `explain()` pattern mirrors Lease engine, golden fixture tests specified. Shares significant implementation pattern with LEASECD-003 — both are deterministic calc engines.

---

### EPIC-REGSYGNAL — Regulatory Intelligence (M10)

- **Source:** `EPIC-REGSYGNAL.md`, `REG-001.md` through `REG-003.md`
- **Concepts:**
  - **Regulatory Source Ingestion** (REG-001) — RSS/web pages/PDFs with change detection (document versioning) and metadata. Stored as artifacts + DocIR. Indexed for retrieval.
  - **Controls Framework Model** — `controls`, `policies`, `owners` tables defining internal compliance structure
  - **Obligation Extraction + Mapping** (REG-002) — extract obligations from DocIR; map to internal controls via embeddings + LLM; identify coverage gaps. Produces mapping artifacts with evidence.
  - **DocuIntelli Pattern Engine** (referenced in EPIC-REGSYGNAL description) — reuses DocuIntelli pattern library (BL-026) for obligation detection
  - **Diff Report with Citations** — regulatory update → summarized diff highlighting impacted controls, with citations to source clauses
  - **RegSygnal UI** (REG-003) — regulatory dashboard for latest updates + impacted areas; diff viewer with evidence drilldown; create decisions and tasks from UI linked to evidence
- **Decision Points:**
  - Source scheduler: polling interval, deduplication strategy for regulatory feeds
  - Obligation extraction schema: how granular (clause level vs section level)?
  - Controls framework: platform-provided templates vs user-defined from scratch?
  - Mapping confidence threshold for gap classification
- **Dependencies:** `BL-016` (entity/citation substrate), `PLUG-003` (connectors for web/RSS), `BL-020` (alert system), `DI-002` (DocIR), `STUDIO-003` (Decisions register), `BL-023` (cross-framework reconciliation from DocuIntelli)
- **Implementation Depth:** Narrative at epic level; REG-002 has technical detail on controls framework model and embedding-based mapping. REG-001 specifies versioning with diff detection. The dependency on BL-023 (reconciliation) makes RegSygnal a consumer of DocuIntelli infrastructure.

---

### EPIC-PROPSYGNAL — Commercial Property Signal Aggregation (M11)

- **Source:** `EPIC-PROPSYGNAL.md`, `PROP-001.md` through `PROP-003.md`
- **Concepts:**
  - **Asset + Portfolio Model** (PROP-001) — `assets`, `portfolios`, `asset_kpis` tables. Assets linked to projects/clients.
  - **Signal Ingestion** (PROP-002) — connectors for news feeds and market data providers; signal items stored as entities/artifacts; indexed into context packs per asset/project. Citations on all signals.
  - **Cited Insight Dashboards** (PROP-003) — GenUI charts/tables for KPIs and trends; drilldown to underlying signals and doc evidence; export to deliverables (slides)
- **Decision Points:**
  - Which market data providers to integrate first (implied by PLUG-003 connector framework)
  - KPI definition model: platform-defined standard KPIs vs user-defined formulas?
  - Signal deduplication and relevance scoring across multiple feeds
  - Asset-to-lease linkage (LEASECD → PROPSYGNAL relationship)
- **Dependencies:** `BL-016` (entity/citation substrate), `PLUG-003` (connector framework for feeds), `STUDIO-001` (Projects), `BL-029` (dimensional visualization from DocuIntelli), `BL-018` (slides deliverable)
- **Implementation Depth:** Largely narrative at the issue level. PROP-002 specifies the signal-as-entity pattern. The dependency on BL-029 for visualization creates a tight coupling to DocuIntelli visualization infrastructure.

---

## PART 2 — ENTERPRISE ADDITIONS (V2-Unique vs V1's EPIC-BILLING)

V1's `EPIC-BILLING` covers Stripe subscriptions, usage records, quota middleware, and Stripe webhooks — standard SaaS consumer billing. (V1 billing does not include invoices or a customer portal.)

### EPIC-ENTERPRISE — Enterprise Hardening (M6)

- **Source:** `EPIC-ENTERPRISE.md`, `ENT-001.md` through `ENT-005.md`

#### ENT-001 — OIDC SSO

- **Addition:** Full OIDC provider configuration (issuer, client_id, client_secret, redirect URIs), login redirect + callback flow, user provisioning from claims, workspace/tenant mapping via email domain rules or explicit invites. Repo touchpoints specified: `src/intelli/api/v1/auth.py`, new `src/intelli/services/auth/`.
- **V1 comparison:** V1 billing had no auth changes. ENT-001 replaces the existing local/API-key-only auth with a federated identity layer.

#### ENT-002 — RBAC/ABAC Policy Engine

- **Addition:** Role-based access (viewer/editor/admin) at workspace/project/app level plus fine-grained ABAC scope checks on `tenant_id`, `project_id`, `app_id`. Middleware/dependency in every router. UI guards (hide/disable by role). New `src/intelli/security/` module.
- **V1 comparison:** V1 had no RBAC. This is a cross-cutting concern that touches all 11 existing API routers.

#### ENT-003 — Audit Log Expansion

- **Addition:** Extends the existing partial audit log to cover: login/logout, document upload/download, run start/stop, tool calls, deliverable exports, permission changes. New `/api/v1/audit` admin-only endpoints. Admin UI page with filtering.
- **V1 comparison:** V1 had no audit infrastructure at all.

#### ENT-004 — Usage Metering + Stripe (Enterprise Tier)

- **Addition vs V1:** V1 EPIC-BILLING = consumer Stripe subscriptions. ENT-004 = enterprise metering: records usage at the granular event level (tokens in/out, tool calls, search requests, storage bytes), aggregates per tenant daily/monthly, enforces quotas via middleware. Stripe is the billing backend but the commercial model is enterprise contract + quota enforcement, not consumer self-serve plans.
- **Key difference:** ENT-004 requires quota rejection middleware — V1 had no quota enforcement. (Note: a claim that ENT-004 explicitly references "Build Guide v5 Platform Primitive #10" is **unverified** — this reference was not found in the GitHub issue body for V2 #117.)

#### ENT-005 — Data Retention, Deletion, and GDPR Export

- **Addition:** Entirely absent from V1. Retention policy configuration per tenant. Deletion workflows for documents, artifacts, runs, conversations with tombstones for audit. Tenant data export bundle endpoint/job. Directly addresses regulated financial client requirements.

---

## PART 3 — SUB-TASK DECOMPOSITION PATTERN

V1 used STORY-/TASK- naming (with domain-namespaced prefixes such as STORY-ORCH-NNN) but no sub-issues. V2 introduces a consistent two-level decomposition pattern:

**Pattern:** `BL-NNN` (parent story) → `BL-NNNa`, `BL-NNNb`, `BL-NNNc`, `BL-NNNd` (child tasks)

Sub-tasks are decomposed along these axes:

| Axis | Example |
|---|---|
| DB migration | BL-016a: migrations for entities/citations |
| API layer | BL-016b: API endpoints + RBAC |
| UI components | BL-016c: CitationPopover, CitationList |
| Event emission | BL-016d: emit references_found/citations_bound events |
| Schema/contract | BL-005a: GML tag set + parsing rules |
| Parser/renderer | BL-005b: incremental GML parser |
| Backend heal endpoint | BL-005c: LLM repair endpoint |
| Library selection | STUDIO-004a: canvas library evaluation |
| Persistence | STUDIO-004b: canvas persistence API |
| Node types | STUDIO-004c: v1 node type implementations |
| Security primitive | PLUG-003a: secrets storage abstraction |
| OAuth flow | PLUG-003b: generic OAuth endpoints |
| First implementation | PLUG-003c: first production connector |

The decomposition granularity is: each sub-task = independently assignable to an agent/engineer, deployable alone, with its own acceptance criteria. Sub-tasks map to 1–3 day units of work.

Issues without sub-tasks are either atomic (P0-001 through P0-005 are self-contained fixes) or domain module issues where the domain is itself the unit of parallelism.

---

## PART 4 — WAVE STRUCTURE AND SEQUENCING LOGIC

V2 imposes a strict milestone ordering with an explicit gate before each wave:

```
M0-P0       → fix blocking bugs first (arq, event race, tenant_id, Redis, CI)
M1-W0       → orchestration: planner + Send() fan-out + run events contract
M2-W1       → GenUI + GML ReportPanel + PlanViewer UI
M3-W2       → deliverables pipelines + context inheritance + entity/citation substrate + hybrid RAG
M4-W3       → UX polish: generation overlay + clarification flow + shared DataBrief
M5-PLUGINS  → MCP tool registry + connectors + skills registry + Studio surfaces
M5-STUDIO   → (parallel with PLUGINS) Projects/CRM/Decisions/Canvas/Apps/Workflows
M6-ENTERPRISE → SSO + RBAC + audit + billing + GDPR
M6-OBS      → (parallel with ENTERPRISE) tracing + metrics + evals CI + load tests
M7-DOCUINTELLI → first deep domain module (exercises all platform primitives)
M8-LEASECD  → V1 wedge product (commercial lease cashflow)
M9-DEBT     → debt module
M10-REGSYGNAL → regulatory intelligence
M11-PROPSYGNAL → property signal aggregation
```

**Sequencing logic:**
- M0 gates everything: without P0 fixes, concurrent agent work will collide on run event sequencing and miss jobs
- M1 (orchestration) gates M2 (UI can't render plans without plan events)
- M2 gates M3 (deliverables need ReportPanel architecture in place)
- M3 gates M4 (overlay needs artifacts from deliverable store)
- M5 (PLUGINS + STUDIO) can run in parallel after M4 because they consume M3 primitives
- M6 (ENTERPRISE + OBS) runs after M5 because RBAC touches all M5 surfaces
- M7–M11 (domain modules) run sequentially by dependency: DocuIntelli first (provides DocIR for all others), then Lease CD (uses DocIR + calc engine pattern that Debt reuses), then Debt, RegSygnal, PropSygnal last (depends on connectors from M5 + visualization from M7)

**Critical cross-cutting dependency:** `BL-016` (entity/citation substrate, M3) is a hard dependency for all four domain modules (M8–M11). This is the single highest-leverage platform primitive for the revenue verticals.

---

## PART 5 — NEW CONCEPTS NOT IN V1

### P0 Stabilization Epics (EPIC-P0)

V1 had no concept of blocking bugs or a stabilization milestone. V2 explicitly gates all work behind five concrete bug fixes with specific repo file touchpoints — this is an architectural change in how the backlog is organized.

### EPIC-OBS — Observability, Evals, and Production Readiness (M6)

- **Source:** `EPIC-OBS.md`, `OBS-001.md` through `OBS-004.md`
- V1 had `EPIC-PROD` (2 stories: deployment hardening, monitoring) — much thinner
- V2 adds: LangSmith/Langfuse/OTel tracing provider abstraction with trace IDs in UI; Prometheus metrics endpoint (`/healthz`, `/readyz`, queue depth, token usage, OpenSearch latency); golden prompt eval harness wired into CI with PR-blocking failures; locust/k6 load test harness for concurrent run stability. The eval CI gate is entirely new.

### Repo Alignment Artifacts (V2-unique directory)

- `repo_alignment/00_REPO_INVENTORY.md` — inventory of what the current repo contains
- `repo_alignment/01_SPEC_DELTA.md` — explicit keep/change/add mapping between current repo and Build Guide v5
- This structure did not exist in V1. It enables agents to start from the actual codebase state rather than a greenfield assumption.

### DocIR (Document Intermediate Representation)

The concept of a normalized, block-structured, coordinate-tagged document representation is entirely absent from V1. V1 had RAG chunking. V2 introduces DocIR as a platform primitive that underpins Lease extraction, Debt extraction, RegSygnal obligation extraction, and all DocuIntelli analysis. This is the single most important new technical primitive.

### Skills Registry (PLUG-005)

- V1 had no concept of packaged, versioned, tested subgraphs as registry entries
- V2 defines: Skill manifest (id, name, description, inputs/outputs schema, required tools, permissions, eval tests); code-based registry with optional DB publishing; CLI scaffolding; minimum 3 registered skills at launch (WebResearch, DocSummarize, TableExtract)
- Skills are explicitly the bridge between platform primitives and domain modules: Lease extraction and Debt extraction are both registered skills

### Analysis Canvas (STUDIO-004)

V1's `EPIC-STUDIO` had a STORY-STUDIO-004 (#61: "Pinning: pin app outputs and diffs into canvas + notebook"). V2's canvas is a different concept: an infinite 2D spatial canvas (React Flow or custom engine) for composing analysis artifacts, not a workflow DAG editor. Node types: Note, Artifact, ReportSnippet, ChartPlaceholder, Decision. The workflow DAG editor (STUDIO-007) is a separate surface. (Note: V1's workflow builder is STORY-WF-004 under EPIC-WORKFLOWS, not STORY-STUDIO-004.)

### Workflow Builder as DAG → LangGraph Compilation (STUDIO-007)

- V1 had `EPIC-WORKFLOWS` covering Superagent-style workflow definitions
- V2 STUDIO-007 specifies: user-defined DAG of skills/tools/subgraphs compiles to LangGraph; execution under the same run ledger; triggering via manual now, schedules/webhooks later
- The compile-to-LangGraph step is a new architectural pattern not present in V1

### Context Inheritance with Background Indexing (BL-014)

V1 had no context pack concept. V2 BL-014 specifies a four-level inheritance model (task → app → project → workspace) with background embeddings jobs and precedence-based retrieval merging. Sub-tasks break this into: DB model for ContextPacks, indexing arq jobs, retrieval merge rules, and UI context manager.

### Hybrid RAG + Reranking (RAG-001)

V1 had basic vector search. V2 adds: BM25 + kNN hybrid queries in OpenSearch, metadata filters (doc_id, notebook_id, corpus_id, tags, date ranges), optional cross-encoder or LLM reranker with budget limits. Plus RAG-002: admin retrieval test console with chunk previews and tuning controls.

### Shared DataBrief (BL-022)

V1 had no persisted intermediate output. V2 BL-022 defines DataBrief as a named, persisted object that is built by the fan-in synthesis node and reused across deliverables in the same run. This prevents duplicate LLM synthesis calls when generating slides + DOCX + website from the same research run.

### Clarification Flow (BL-021)

V1 had no interruption mechanism. V2 specifies a structured clarification flow that interrupts runs on ambiguous or low-confidence prompts, presents structured questions to the user, and resumes the run with resolved constraints.

---

## Summary Table: V2-Unique Additions by Category

| Category | V2 Additions | V1 Equivalent |
|---|---|---|
| Milestone structure | 14 milestones (M0–M11 + parallel splits at M5/M6) | 11 ordered milestones (M0–M10), domain-namespaced prefixes |
| Sub-task decomposition | a/b/c/d subtasks per story | None |
| Repo alignment | `repo_alignment/` directory | None |
| Domain modules | LEASECD, DEBT, REGSYGNAL, PROPSYGNAL, DOCUINTELLI | None |
| DocIR primitive | Block-structured doc representation | RAG chunking only |
| Entity/citation substrate | BL-016 (content-addressed, immutable) | Not specified |
| Skills registry | PLUG-005 (manifest, tests, CLI) | None |
| Connector framework | PLUG-003 (OAuth, secrets, sync jobs) | None |
| Canvas | Infinite 2D spatial canvas (STUDIO-004) | Workflow editor concept |
| DAG→LangGraph compiler | STUDIO-007 | Superagent-style workflows |
| Enterprise auth | OIDC SSO + RBAC/ABAC (ENT-001/002) | None |
| Audit log | Coverage + admin UI (ENT-003) | None |
| GDPR / data retention | ENT-005 | None |
| Observability | Tracing + metrics + eval CI + load test (OBS) | Thin EPIC-PROD |
| Hybrid RAG | BM25+kNN + reranker + filters | Vector only |
| Context inheritance | 4-level ContextPacks with background indexing | None |
| DataBrief persistence | BL-022 shared across deliverables | None |
| Clarification flow | BL-021 structured interrupt + resume | None |
| P0 bug gates | arq, event race, tenant_id, Redis, CI | None |
agentId: a6598ed (for resuming to continue this agent's work if needed)

---
## Corrections (applied 2026-02-21, session 5 verification)
- CRITICAL: V1 is NOT flat — it has 11 ordered milestones (M0-M10) and domain-namespaced prefixes. All "flat/no ordering" characterizations corrected.
- STORY-STUDIO-004 is "Pinning" not "workflow builder" — V1 workflow builder is STORY-WF-004 under EPIC-WORKFLOWS
- V2 milestone count corrected: 14 milestone objects, 12 numbers (M0-M11) with parallel splits at M5 and M6
- ENT-004 Build Guide v5 reference marked as unverified (not found in GitHub issue body)
- V1 billing: removed unsubstantiated "invoices" and "customer portal" claims
<usage>total_tokens: 84470
tool_uses: 90
duration_ms: 244117</usage>
