---
document_id: GIT-ISSUES
version: 1
date: 2026-02-20
inputs: [BACKLOG.md, IMPLEMENTATION-PLAN.md]
target_repo: nyqst-intelli-230126
---

# GitHub Issues Project Management Structure

> Complete specification for creating all GitHub Issues, labels, milestones, and project board configuration for the Superagent Parity implementation backlog (22 items, BL-001 through BL-022).

---

## 1. Label Taxonomy

### Type Labels

| Name | Color | Description |
|------|-------|-------------|
| `type:feature` | `#0E8A16` | New feature implementation |
| `type:infrastructure` | `#D93F0B` | Schema, migration, or platform infrastructure |
| `type:frontend` | `#1D76DB` | React/UI component work |
| `type:backend` | `#5319E7` | Python/FastAPI backend logic |
| `type:integration` | `#FBCA04` | External API or service integration |
| `type:billing` | `#B60205` | Stripe billing and quota enforcement |
| `type:test` | `#C5DEF5` | Test suite or test infrastructure |
| `type:docs` | `#0075CA` | Documentation updates |

### Phase Labels

| Name | Color | Description |
|------|-------|-------------|
| `phase:0-foundation` | `#BFD4F2` | Phase 0: Schema, migration, environment (Weeks 1-2) |
| `phase:1-orchestrator` | `#D4C5F9` | Phase 1: Research orchestrator fan-out (Weeks 3-5) |
| `phase:2-deliverables` | `#FEF2C0` | Phase 2: Report, website, slides, export pipelines (Weeks 6-8) |
| `phase:3-frontend` | `#C2E0C6` | Phase 3: React UI components and views (Weeks 9-11) |
| `phase:4-billing` | `#F9D0C4` | Phase 4: Billing, quota, production hardening (Weeks 12-13) |

### Priority Labels

| Name | Color | Description |
|------|-------|-------------|
| `priority:critical-path` | `#B60205` | On the critical dependency chain; blocks other work |
| `priority:high` | `#D93F0B` | Important but not on the longest path |
| `priority:medium` | `#FBCA04` | Standard priority; can be reordered within phase |
| `priority:low` | `#0E8A16` | Nice to have; can slip without impact |

### Track Labels

| Name | Color | Description |
|------|-------|-------------|
| `track:orchestrator` | `#7057FF` | Research orchestrator graph and agent nodes |
| `track:frontend` | `#008672` | React components and Zustand stores |
| `track:billing` | `#E4E669` | Stripe integration and quota enforcement |
| `track:deliverables` | `#FF7619` | Report, website, slides, document generation |
| `track:infrastructure` | `#6F42C1` | Schema, models, migrations, services |

### Size Labels (Story Point Equivalents)

| Name | Color | Description |
|------|-------|-------------|
| `size:XS` | `#EDEDED` | ~1 story point: trivial change, < 2 hours |
| `size:S` | `#D4C5F9` | ~2 story points: small task, half day |
| `size:M` | `#BFD4F2` | ~3 story points: moderate task, 1-2 days |
| `size:L` | `#FEF2C0` | ~5 story points: large task, 3-5 days |
| `size:XL` | `#F9D0C4` | ~8 story points: epic-level, full week+ |

### Status Labels

| Name | Color | Description |
|------|-------|-------------|
| `status:blocked` | `#B60205` | Waiting on another issue to complete |
| `status:ready-to-start` | `#0E8A16` | All dependencies met; can begin work |
| `status:in-review` | `#FBCA04` | PR submitted; awaiting review |

---

## 2. Milestones

| Milestone | Title | Description | Due Date | Key Deliverables |
|-----------|-------|-------------|----------|------------------|
| M0 | M0: Foundation | Schema extensions, migration 0005, Markup AST models, dev environment verification. All schema work lands here so later phases build on stable ground. | 2026-03-14 | RunEvent types, MarkupDocument AST, migration 0005, env config |
| M1 | M1: Orchestrator | Extend ResearchAssistantGraph with planner, Send() fan-out, web tools, meta-reasoning, synthesis, and shared data brief. Backend-only; verified via SSE stream. | 2026-04-04 | Working orchestrator with parallel research workers, web search, meta-reasoning |
| M2 | M2: Deliverables | Report, website, slides generation pipelines and PDF/DOCX export. Entity/citation substrate. All backend deliverable nodes operational. | 2026-04-25 | Report gen, website gen, slides gen, doc export, entity service |
| M3 | M3: Frontend | PlanViewer, DeliverableSelector, ReportRenderer, WebsitePreview, GenerationOverlay, enhanced SourcesPanel and RunTimeline, clarification flow UI. | 2026-05-16 | Full frontend UX for research-to-deliverable flow |
| M4 | M4: Billing & Polish | Stripe billing system, quota enforcement middleware, production hardening, observability, and final E2E testing. | 2026-05-30 | Billing operational, quota enforced, production-ready |

---

## 3. Issue Definitions

### Wave 0: No Dependencies (can start immediately)

---

#### [BL-002] RunEvent Schema Extensions
**Labels:** `type:infrastructure`, `phase:0-foundation`, `priority:critical-path`, `track:infrastructure`, `size:S`
**Milestone:** M0: Foundation
**Blocked By:** None
**Blocks:** BL-001, BL-007, BL-014, BL-016, BL-020, BL-021

**Body:**
## Overview
Extend the existing RunEvent type enum with 19 new event types covering planning, subagent fan-out, streaming content, artifacts, clarification, report generation progress, and web research events. This is the foundational schema change that all orchestrator and frontend work depends on.

## Acceptance Criteria
- [ ] All 19 new event types added to `RunEventType` enum in both `schemas/runs.py` and `db/models/runs.py`
- [ ] Typed `log_*` helper methods added to `LedgerService` for each new event type, following existing `async def log_*(self, run_id, ...) -> RunEvent` pattern
- [ ] All new event types round-trip through the ledger (create, read back)
- [ ] New events appear correctly in the SSE stream via PG LISTEN/NOTIFY
- [ ] Existing event types and all existing tests remain unaffected
- [ ] Payload shapes documented as Python TypedDict or Pydantic models

## Technical Notes
- Existing types to keep: STATE_UPDATE, TOOL_CALL_*, STEP_*
- New types: PLAN_CREATED, PLAN_TASK_STARTED, PLAN_TASK_COMPLETED, PLAN_TASK_FAILED, SUBAGENT_DISPATCHED, SUBAGENT_COMPLETED, SUBAGENT_FAILED, CONTENT_DELTA, ARTIFACT_CREATED, CLARIFICATION_NEEDED, CLARIFICATION_RECEIVED, REPORT_PREVIEW_START, REPORT_PREVIEW_DELTA, REPORT_PREVIEW_DONE, WEB_SEARCH_STARTED, WEB_SEARCH_COMPLETED, WEB_SCRAPE_STARTED, WEB_SCRAPE_COMPLETED, REFERENCES_FOUND
- Files to modify: `src/intelli/schemas/runs.py`, `src/intelli/db/models/runs.py`, `src/intelli/services/runs/ledger_service.py`
- See IMPLEMENTATION-PLAN.md Section 0.2 for full payload schemas

## References
- BACKLOG.md: BL-002
- IMPLEMENTATION-PLAN.md: Section 0.2

---

#### [BL-004] NYQST Markup AST Schema
**Labels:** `type:infrastructure`, `phase:0-foundation`, `priority:critical-path`, `track:deliverables`, `size:M`
**Milestone:** M0: Foundation
**Blocked By:** None
**Blocks:** BL-005, BL-009, BL-019

**Body:**
## Overview
Create the Pydantic model definitions for the NYQST Markup AST -- a document tree with 18 node types that represents structured reports. This is the intermediate representation between LLM output and rendered deliverables. Includes a MarkupHealer that auto-repairs invalid trees.

## Acceptance Criteria
- [ ] `MarkupNodeType` enum with all 18 node types (document, section, columns, column, heading, paragraph, blockquote, table, table_row, table_cell, chart, image, list, list_item, code_block, inline, metric_card, callout)
- [ ] `MarkupNode` model with type, attrs, children, text, and citation_ids fields
- [ ] `MarkupDocument` model with version, title, nodes, and metadata
- [ ] `MarkupHealer.heal()` coerces unknown node types to PARAGRAPH
- [ ] `MarkupHealer.validate()` returns list of validation warnings
- [ ] Round-trip `JSON -> MarkupDocument -> JSON` is stable (idempotent)
- [ ] `MarkupDocument.model_validate(json)` works for all 18 node types

## Technical Notes
- Net-new file: `src/intelli/schemas/markup.py`
- Chart node attrs: chart_type, data, config
- Heading node attrs: level (1-6)
- Inline node attrs: bold, italic, code, href, citation_id
- Metric_card node attrs: label, value, delta, trend
- Callout node attrs: type (info/warn/error/success)
- See IMPLEMENTATION-PLAN.md Section 0.3 for full schema

## References
- BACKLOG.md: BL-004
- IMPLEMENTATION-PLAN.md: Section 0.3

---

#### [BL-008] DeliverableSelector Component
**Labels:** `type:frontend`, `phase:0-foundation`, `priority:medium`, `track:frontend`, `size:S`
**Milestone:** M0: Foundation
**Blocked By:** BL-015 (weak — DeliverableSelector writes to useDeliverableStore)
**Blocks:** None

**Body:**
## Overview
Create a segmented control component positioned above the chat composer that lets users select the deliverable type (Report, Website, Slides, Document) before submitting a research query. Selection is stored in the DeliverableStore and included as `deliverable_type` on the user message payload.

## Acceptance Criteria
- [ ] Segmented control renders with 4 options: Report | Website | Slides | Document
- [ ] Each segment has an appropriate Lucide icon (FileText, Globe, Presentation, FileDown)
- [ ] Selection updates `useDeliverableStore().selectedType`
- [ ] Chat submit handler includes `deliverable_type` in the message request payload
- [ ] Selector auto-clears after submission (follow-up messages send `null`)
- [ ] Uses existing shadcn/ui ToggleGroup component

## Technical Notes
- Net-new file: `ui/src/components/chat/DeliverableSelector.tsx`
- Modify existing chat submit handler in ChatPanel.tsx to include deliverable_type
- Per chat export analysis: `deliverable_type` is on the user Message, not the Conversation
- Follow-up messages without explicit selection default to null

## References
- BACKLOG.md: BL-008
- IMPLEMENTATION-PLAN.md: Section 3.2

---

#### [BL-015] DeliverableStore (Zustand)
**Labels:** `type:frontend`, `phase:0-foundation`, `priority:medium`, `track:frontend`, `size:XS`
**Milestone:** M0: Foundation
**Blocked By:** None
**Blocks:** None

**Body:**
## Overview
Create the 6th Zustand store to manage deliverable selection state and active preview state. Tracks which deliverable type is selected, whether generation is in progress, current generation phase label, and async entity creation status.

## Acceptance Criteria
- [ ] Store interface includes: selectedType, activePreview (artifactSha256, manifestSha256, isGenerating, generationPhase, generationProgress, hasAsyncEntitiesInProgress)
- [ ] All action methods typed: setSelectedType, setGenerationPhase, setActiveArtifact, setAsyncEntitiesInProgress, clearPreview
- [ ] Store compiles with no TypeScript errors
- [ ] Exported correctly alongside existing 5 stores

## Technical Notes
- Net-new file: `ui/src/stores/deliverable-store.ts`
- Existing stores: auth-store.ts, conversation-store.ts, workbench-store.ts, run-store.ts, tour-store.ts
- `generationProgress` is 0-100 numeric
- `generationPhase` is human-readable string like "Writing outline..." or "Building components..."

## References
- BACKLOG.md: BL-015
- IMPLEMENTATION-PLAN.md: Section 3.1

---

#### [BL-012] Billing System
**Labels:** `type:billing`, `phase:4-billing`, `priority:high`, `track:billing`, `size:L`
**Milestone:** M4: Billing & Polish
**Blocked By:** Migration 0005c (billing tables)
**Blocks:** BL-013

**Body:**
## Overview
Port and adapt the Stripe billing system from okestraai/DocuIntelli to the NYQST platform. Implements checkout sessions, webhook processing, subscription management, and per-run usage tracking. Billing unit: 1 run = 1 AI message generation; reads are free.

## Acceptance Criteria
- [ ] `POST /api/v1/billing/checkout` creates a Stripe checkout session for Pro plan ($20/month)
- [ ] `POST /api/v1/billing/webhook` processes Stripe events with signature verification (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed)
- [ ] `GET /api/v1/billing/subscription` returns current plan, status, and period end date
- [ ] `GET /api/v1/billing/usage` returns run count for current billing period
- [ ] `POST /api/v1/billing/portal` returns Stripe customer portal URL
- [ ] Usage record created per run creation (not per retry -- check retry_attempts)
- [ ] Plan limits enforced: free=5 runs/month + 2 reports, pro=200 runs/month + $0.50/run overage

## Technical Notes
- Source: okestraai/DocuIntelli (public GitHub) -- port Stripe code, adapt from Supabase to SQLAlchemy
- New files: `src/intelli/api/v1/billing.py`, `src/intelli/services/billing/{stripe_service,subscription_service,usage_service}.py`, `src/intelli/db/models/billing.py`
- Billing tables (subscriptions, usage_records) already created in migration 0005 (Phase 0)
- Existing `Run.cost_cents` and `Run.token_usage` JSONB fields available for cost tracking
- Config vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID

### Sub-Issues

#### [BL-012a] Billing ORM Models and Schemas
**Labels:** `type:infrastructure`, `phase:4-billing`, `priority:high`, `track:billing`, `size:S`
- Create SQLAlchemy models for subscriptions and usage_records tables (already in migration 0005)
- Create Pydantic request/response schemas for billing endpoints

#### [BL-012b] Stripe Service Layer
**Labels:** `type:integration`, `phase:4-billing`, `priority:high`, `track:billing`, `size:M`
- Implement StripeService: create_checkout_session, create_portal_session, construct_webhook_event
- Implement SubscriptionService: create/update/cancel subscription from webhook events
- Implement UsageService: record_usage, get_period_usage, check_quota

#### [BL-012c] Billing API Routes
**Labels:** `type:backend`, `phase:4-billing`, `priority:high`, `track:billing`, `size:S`
- Create all 5 billing endpoints in billing.py router
- Register router in `api/v1/__init__.py`
- Webhook endpoint: no JWT auth, Stripe signature verification only

#### [BL-012d] Billing Integration Tests
**Labels:** `type:test`, `phase:4-billing`, `priority:high`, `track:billing`, `size:S`
- Mock Stripe webhook payloads, verify subscription state transitions
- Test usage recording per run
- Test quota checking logic

## References
- BACKLOG.md: BL-012
- IMPLEMENTATION-PLAN.md: Section 4.1
- Source repo: okestraai/DocuIntelli

---

### Wave 1: Depends on Wave 0 items

---

#### [BL-001] Research Orchestrator Graph
**Labels:** `type:feature`, `phase:1-orchestrator`, `priority:critical-path`, `track:orchestrator`, `size:XL`
**Milestone:** M1: Orchestrator
**Blocked By:** BL-002
**Blocks:** BL-003, BL-005, BL-006, BL-017, BL-018, BL-021, BL-022

**Body:**
## Overview
Extend the existing ResearchAssistantGraph (not replace it) with a planner node, Send() fan-out to parallel research workers, fan-in aggregation, synthesis node, and deliverable router. This transforms the current single-agent loop into a multi-workstream orchestrator that mirrors Superagent's 13+ parallel task pattern. The existing agent/tools/capture_sources loop is preserved and wrapped by the new research_worker_node.

## Acceptance Criteria
- [ ] Planner node decomposes query into 3-13 ResearchTask dicts and emits PLAN_CREATED event
- [ ] Fan-out dispatches Send() per task, each creating a child Run with parent_run_id FK
- [ ] Research workers execute in parallel using existing agent+tools loop
- [ ] Fan-in node aggregates all TaskResult dicts
- [ ] Synthesis node produces structured DataBrief in graph state
- [ ] Deliverable router routes by deliverable_type to appropriate generation node
- [ ] SSE stream shows: PLAN_CREATED, N x SUBAGENT_DISPATCHED, N x PLAN_TASK_*, STATE_UPDATE, CHECKPOINT
- [ ] AI message hydrated_content contains `<gml-View*>` components
- [ ] Failed tasks emit PLAN_TASK_FAILED without crashing the run
- [ ] All existing graph tests continue to pass

## Technical Notes
- Extends: `src/intelli/agents/graphs/research_assistant.py`
- Existing graph: agent -> (tools_condition) -> tools -> capture_sources -> agent (loop)
- New nodes: planner_node, fan_out, research_worker_node, fan_in_node, synthesis_node, deliverable_router
- Entry point: modify existing `POST /agent/chat` or add `POST /api/v1/runs/research`
- research_worker_node creates child Run via `Run(parent_run_id=state["run_id"])` -- self-referential FK
- LLM system prompt must enforce `<answer>...</answer>` wrapping with `<gml-*>` component refs
- See IMPLEMENTATION-PLAN.md Section 1.2 for full graph diagram

### Sub-Issues

#### [BL-001a] ResearchState Extension
**Labels:** `type:infrastructure`, `phase:1-orchestrator`, `priority:critical-path`, `track:orchestrator`, `size:S`
- Extend ResearchState dataclass with: query, deliverable_type, plan, task_results, data_brief, web_sources, meta_reasoning_done, clarification_pending, output_artifact_sha256, child_run_ids
- All new fields must have defaults (backward-compatible)

#### [BL-001b] Planner Node
**Labels:** `type:feature`, `phase:1-orchestrator`, `priority:critical-path`, `track:orchestrator`, `size:M`
- LLM call to decompose query + deliverable_type into ResearchTask list
- Emit PLAN_CREATED event via LedgerService
- System prompt for structured JSON output of task decomposition

#### [BL-001c] Fan-Out / Fan-In Infrastructure
**Labels:** `type:feature`, `phase:1-orchestrator`, `priority:critical-path`, `track:orchestrator`, `size:L`
- Fan-out: returns `[Send("research_worker_node", {...}) for t in plan]`
- Research worker node: wraps existing agent+tools loop, creates child Run with parent_run_id
- Fan-in: accumulates TaskResult dicts, emits SUBAGENT_COMPLETED per task
- Handle per-node async DB session lifecycle (no shared session across parallel nodes)

#### [BL-001d] Synthesis Node and Deliverable Router
**Labels:** `type:feature`, `phase:1-orchestrator`, `priority:critical-path`, `track:orchestrator`, `size:M`
- Synthesis: LLM call to produce DataBrief from all TaskResults
- Deliverable router: conditional edge routing by state["deliverable_type"]
- Wire to placeholder nodes for report/website/slides/document (implemented in Phase 2)

#### [BL-001e] Integration Tests and Event Verification
**Labels:** `type:test`, `phase:1-orchestrator`, `priority:high`, `track:orchestrator`, `size:M`
- End-to-end test with real LLM: submit query, verify full event sequence in SSE
- Verify DataBrief populated in final state
- Verify child Run records have correct parent_run_id
- Contract test: ResearchState backward-compat with existing tests

## References
- BACKLOG.md: BL-001
- IMPLEMENTATION-PLAN.md: Sections 1.1, 1.2

---

#### [BL-007] PlanViewer Component
**Labels:** `type:frontend`, `phase:3-frontend`, `priority:high`, `track:frontend`, `size:M`
**Milestone:** M3: Frontend
**Blocked By:** BL-002
**Blocks:** None

**Body:**
## Overview
Create a plan visualization component showing numbered task cards with live status indicators, inspired by Superagent's activity panel. Tasks are grouped by phase and update in real-time via SSE events. Renders in a new "Plan" tab within the existing DetailsPanel.

## Acceptance Criteria
- [ ] Task cards appear immediately on receiving PLAN_CREATED event
- [ ] Each card shows: numbered badge, task name, phase grouping header
- [ ] Status updates live: pending (gray) -> processing (amber) -> completed (green) / failed (red)
- [ ] Failed tasks show error message in tooltip
- [ ] Duration shown on completed tasks
- [ ] Renders in new "Plan" tab in DetailsPanel.tsx
- [ ] Empty state when no plan exists for the current run

## Technical Notes
- Net-new file: `ui/src/components/plans/PlanViewer.tsx`
- Data source: PLAN_CREATED (initial list), PLAN_TASK_STARTED/COMPLETED/FAILED (live updates)
- Modify: `ui/src/components/workbench/DetailsPanel.tsx` to add Plan tab
- Event wiring via existing `use-sse.ts` hook
- Left border color indicates status; visual style per IMPLEMENTATION-PLAN.md Section 3.4

## References
- BACKLOG.md: BL-007
- IMPLEMENTATION-PLAN.md: Section 3.4

---

#### [BL-014] Enhanced RunTimeline
**Labels:** `type:frontend`, `phase:3-frontend`, `priority:medium`, `track:frontend`, `size:M`
**Milestone:** M3: Frontend
**Blocked By:** BL-002
**Blocks:** None

**Body:**
## Overview
Enhance the existing RunTimeline/TimelinePanel to render all 19 new BL-002 event types with proper icons, labels, phase grouping, and subagent task cards. The timeline should remain flat for runs without a plan and group by phases when PLAN_CREATED is present.

## Acceptance Criteria
- [ ] All 19 new event types have distinct icons and human-readable labels (no raw enum fallback)
- [ ] Events grouped under collapsible phase headers when PLAN_CREATED is present
- [ ] Subagent task rows show compact card with task name, duration, tool call count
- [ ] CONTENT_DELTA events collapsed by default (expandable)
- [ ] Child run events surfaced inline under parent subagent card
- [ ] Timeline remains flat for runs without a plan (backward compatible)

## Technical Notes
- Check which file is active: `ui/src/components/workbench/TimelinePanel.tsx` vs `components/runs/RunTimeline.tsx`
- Extends existing component -- do not create a new timeline
- Phase grouping uses the phases array from PLAN_CREATED event payload

## References
- BACKLOG.md: BL-014
- IMPLEMENTATION-PLAN.md: Section 3.5

---

#### [BL-020] Generation Progress Overlay
**Labels:** `type:frontend`, `phase:3-frontend`, `priority:high`, `track:frontend`, `size:M`
**Milestone:** M3: Frontend
**Blocked By:** BL-002
**Blocks:** None

**Body:**
## Overview
Create a full-screen overlay that shows generation progress with dual-status display (primary action + substep), continuous progress indicator, and phase labels. Users tolerate 2+ minute waits when they see visible progress. Also handles the "Creating notes..." secondary state for async entity creation.

## Acceptance Criteria
- [ ] Overlay appears on REPORT_PREVIEW_START event, hides on REPORT_PREVIEW_DONE
- [ ] Shows deliverable type ("Generating your report...", "Building your website...")
- [ ] Phase label updates in real-time from REPORT_PREVIEW_DELTA payload
- [ ] Animated spinner and indeterminate progress bar displayed
- [ ] Secondary "Creating notes..." indicator shown while hasAsyncEntitiesInProgress is true
- [ ] Updates DeliverableStore: isGenerating, generationPhase, generationProgress
- [ ] Sets activePreview.artifactSha256 on REPORT_PREVIEW_DONE

## Technical Notes
- Net-new file: `ui/src/components/generation/GenerationOverlay.tsx`
- Wired to existing SSE via `use-sse.ts` hook -- do NOT add a new streaming mechanism
- Integrates with DeliverableStore (BL-015) for state management
- See IMPLEMENTATION-PLAN.md Section 3.3 for visual mockup

## References
- BACKLOG.md: BL-020
- IMPLEMENTATION-PLAN.md: Section 3.3

---

#### [BL-016] Entity/Citation Substrate
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:high`, `track:infrastructure`, `size:M`
**Milestone:** M2: Deliverables
**Blocked By:** BL-002, Migration 0005a (entity_type + tags columns)
**Blocks:** BL-011

**Body:**
## Overview
Complete the entity/citation service layer on top of the Artifact model. Migration 0005 (Phase 0) adds entity_type and tags columns to Artifact. This task builds the service that creates entity artifacts from REFERENCES_FOUND events, provides deduplication via URL hashing, and exposes a per-run entities API endpoint. Entity creation runs asynchronously via the existing arq + Redis job queue.

> **Note:** BL-005 is a soft dependency for citation-binding integration testing only.

## Acceptance Criteria
- [ ] `create_entity_artifact(url, title, snippet, entity_type)` helper in ArtifactService
- [ ] Deduplication: entity artifacts keyed by sha256 of canonical URL in `tags["canonical_id"]`
- [ ] Async entity creation: REFERENCES_FOUND event dispatches arq background job
- [ ] `GET /api/v1/runs/{run_id}/entities` returns entities grouped by entity_type
- [ ] Citation IDs in generated reports resolve to entity artifacts
- [ ] Existing artifact operations unaffected

## Technical Notes
- Extends: `src/intelli/services/substrate/artifact_service.py`
- New endpoint in: `src/intelli/api/v1/runs.py`
- Async job in: `src/intelli/core/jobs.py` (arq + Redis already configured)
- ArtifactEntityType enum: WEB_SOURCE, API_DATA, GENERATED_CONTENT, GENERATED_REPORT, GENERATED_WEBSITE, GENERATED_PRESENTATION, GENERATED_DOCUMENT, KNOWLEDGE_BASE, USER_UPLOAD, CITATION_BUNDLE
- Decision: extend Artifact with entity_type field (not new table) -- avoids schema proliferation

## References
- BACKLOG.md: BL-016
- IMPLEMENTATION-PLAN.md: Section 2.2

---

### Wave 2: Depends on BL-001 (orchestrator) and/or BL-004 (markup AST)

---

#### [BL-003] Web Research MCP Tools
**Labels:** `type:integration`, `phase:1-orchestrator`, `priority:critical-path`, `track:orchestrator`, `size:M`
**Milestone:** M1: Orchestrator
**Blocked By:** None (standalone tools); BL-001 (integration wiring into orchestrator)
**Blocks:** BL-011

**Body:**
## Overview
Add web research tools (Brave Search and Jina Reader) to the agent's tool arsenal. These are registered as MCP tools alongside the existing search_documents, list_notebooks, get_document_info, and compare_manifests. Each invocation emits the corresponding WEB_SEARCH_* / WEB_SCRAPE_* RunEvents via the ledger.

> **Note:** Brave/Jina API wrappers can be built and tested independently in Wave 0. Integration into research_worker_node requires BL-001 (Wave 2).

## Acceptance Criteria
- [ ] `brave_web_search(query, count)` returns search results from Brave Search API
- [ ] `jina_web_scrape(url)` returns cleaned text content from Jina Reader API
- [ ] Both tools registered in MCP server alongside existing tools
- [ ] WEB_SEARCH_STARTED/COMPLETED events emitted on each search invocation
- [ ] WEB_SCRAPE_STARTED/COMPLETED events emitted on each scrape invocation
- [ ] Timeouts configured: 15s for Brave, 30s for Jina
- [ ] API keys read from config: BRAVE_SEARCH_API_KEY, JINA_API_KEY

## Technical Notes
- Net-new MCP registration file: `src/intelli/mcp/tools/research_tools.py` (distinct from `agents/tools/research_tools.py`)
- Register in `src/intelli/mcp/server.py`
- Brave endpoint: `https://api.search.brave.com/res/v1/web/search`
- Jina endpoint: `https://r.jina.ai/{url}`
- Uses httpx.AsyncClient for both
- See IMPLEMENTATION-PLAN.md Section 1.3 for implementation detail

## References
- BACKLOG.md: BL-003
- IMPLEMENTATION-PLAN.md: Section 1.3

---

#### [BL-022] Shared Data Brief
**Labels:** `type:feature`, `phase:1-orchestrator`, `priority:high`, `track:orchestrator`, `size:S`
**Milestone:** M1: Orchestrator
**Blocked By:** None (design phase)
**Blocks:** None

**Body:**
## Overview
Design and implement the shared data brief -- a structured intermediate representation produced by the synthesis node that all downstream generators reference for data consistency. This is a LangGraph state field, not a new table. The brief ensures 100% data consistency (same numbers across all deliverable files), mirroring Superagent's pattern.

> **Note:** DataBrief schema design must precede BL-001 (feeds into ResearchState). Integration testing requires BL-001.

## Acceptance Criteria
- [ ] DataBrief shape defined: key_facts, entities (name/type/value/source_url), financial_figures (label/value/unit/source_url), summary
- [ ] DataBrief populated by synthesis_node from aggregated TaskResults
- [ ] DataBrief appears in final graph state after a test run
- [ ] Downstream deliverable nodes receive DataBrief via state (not re-fetched)
- [ ] Existing graph tests unaffected

## Technical Notes
- DataBrief is a dict in `ResearchState.data_brief` (LangGraph state field)
- Option (a) chosen: state carries it naturally, no new table or artifact needed
- Synthesis node uses LLM to extract structured facts from raw TaskResults
- See IMPLEMENTATION-PLAN.md Section 1.1 for DataBrief shape

## References
- BACKLOG.md: BL-022
- IMPLEMENTATION-PLAN.md: Section 1.1

---

#### [BL-017] Meta-Reasoning Node
**Labels:** `type:feature`, `phase:1-orchestrator`, `priority:high`, `track:orchestrator`, `size:M`
**Milestone:** M1: Orchestrator
**Blocked By:** BL-001
**Blocks:** None

**Body:**
## Overview
Add a meta-reasoning node to the orchestrator graph that evaluates research quality after fan-in. Identifies data gaps, failed tasks, and incomplete coverage, then dispatches targeted recovery tasks. Adds 30-60s latency but dramatically improves output quality. Includes a skip heuristic for simple queries.

## Acceptance Criteria
- [ ] Meta-reasoning LLM call evaluates TaskResults against original plan
- [ ] Identifies three categories: data gaps, failed tasks, incomplete coverage
- [ ] When gaps found: dispatches recovery tasks via same Send() pattern
- [ ] When no gaps: routes directly to synthesis node
- [ ] Skip heuristic: bypasses for `len(plan) <= 2` or explicit config flag
- [ ] STATE_UPDATE event emitted with quality assessment payload
- [ ] Latency overhead logged (target: < 30s for meta-reasoning LLM call)

## Technical Notes
- Extends: `src/intelli/agents/graphs/research_assistant.py` (new node in graph)
- Recovery dispatch reuses research_worker_node
- Prompt pattern: system prompt evaluates plan vs results, returns JSON list of follow-up tasks (empty = no gaps)
- `state["meta_reasoning_done"]` prevents infinite loops
- See IMPLEMENTATION-PLAN.md Section 1.4 for prompt template

## References
- BACKLOG.md: BL-017
- IMPLEMENTATION-PLAN.md: Section 1.4

---

#### [BL-005] Report Generation Node
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:critical-path`, `track:deliverables`, `size:L`
**Milestone:** M2: Deliverables
**Blocked By:** BL-001, BL-004, Migration 0005a
**Blocks:** BL-016, BL-019, BL-009

**Body:**
## Overview
Create the report generation pipeline as a LangGraph node. Transforms research results via 4 passes (outline, section generation, review, assembly) into a MarkupDocument AST stored as an Artifact. Also handles co-generation (website requests produce a companion report). The report generation node is the primary deliverable pipeline.

## Acceptance Criteria
- [ ] 4-pass pipeline: outline -> parallel section generation -> review pass -> assembly + storage
- [ ] Output is a valid MarkupDocument JSON passing MarkupHealer.validate()
- [ ] Stored as Artifact with entity_type=GENERATED_REPORT
- [ ] AI message hydrated_content contains `<gml-ViewReport props='{"identifier": "{sha256}"}'>`
- [ ] message.first_report_identifier set to artifact sha256
- [ ] Citation IDs in document reference entities from data brief
- [ ] REPORT_PREVIEW_START/DELTA/DONE events emitted at appropriate stages
- [ ] Co-generation: triggered as companion when deliverable_type="website"

## Technical Notes
- Net-new file: `src/intelli/agents/graphs/nodes/report_generation.py`
- Parallel section gen uses Send() per section from outline
- MarkupHealer runs as safety net before storage
- Co-generation triggered via arq job queue when deliverable_type="website"
- Answer format: `<answer>...<gml-ViewReport props='{"identifier":"..."}'>...</answer>`
- See IMPLEMENTATION-PLAN.md Section 2.1 for full pipeline detail

### Sub-Issues

#### [BL-005a] Report Outline Pass
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:critical-path`, `track:deliverables`, `size:S`
- LLM call: DataBrief + query -> section outline
- Emit REPORT_PREVIEW_START event
- Output: list of section headings with assigned TaskResult data

#### [BL-005b] Parallel Section Generation
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:critical-path`, `track:deliverables`, `size:M`
- Send() per section from outline
- Each section LLM call produces MarkupNode subtree
- Citation IDs embedded from data_brief entities
- REPORT_PREVIEW_DELTA emitted per section

#### [BL-005c] Review Pass and Assembly
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:high`, `track:deliverables`, `size:M`
- LLM review of full draft, targeted section rewrites
- Assembly: MarkupDocument construction, MarkupHealer validation
- Store as Artifact, set message.first_report_identifier
- Emit REPORT_PREVIEW_DONE + ARTIFACT_CREATED

## References
- BACKLOG.md: BL-005
- IMPLEMENTATION-PLAN.md: Section 2.1

---

#### [BL-006] Website Generation Pipeline
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:high`, `track:deliverables`, `size:L`
**Milestone:** M2: Deliverables
**Blocked By:** BL-001, Migration 0005a
**Blocks:** BL-010

**Body:**
## Overview
Create a 7-stage website generation pipeline as a LangGraph node. Produces a multi-file website bundle (HTML/CSS/JS) stored as a Manifest of Artifacts. Includes co-generation of a companion report. Follows Superagent's observed sequence: planning, scaffolding, content, styling, data viz, review, bundle.

## Acceptance Criteria
- [ ] 7-stage pipeline: planning -> scaffolding -> content -> styling -> data viz -> review -> bundle
- [ ] Output stored as Manifest with individual files as Artifacts
- [ ] Root Artifact tagged entity_type=GENERATED_WEBSITE
- [ ] Manifest includes at minimum: index.html, styles.css
- [ ] `GET /api/v1/manifests/{sha256}` returns the bundle tree
- [ ] AI message hydrated_content includes both `<gml-ViewWebsite>` and `<gml-ViewReport>`
- [ ] REPORT_PREVIEW_START/DELTA per stage, MANIFEST_CREATED, REPORT_PREVIEW_DONE events emitted
- [ ] Co-generation: also triggers report generation (companion artifact)

## Technical Notes
- Net-new file: `src/intelli/agents/graphs/nodes/website_generation.py`
- Uses existing Artifact/Manifest storage (already working)
- Each file = separate Artifact; Manifest groups them into bundle
- Co-generation pattern: both gml-ViewWebsite and gml-ViewReport in AI response (confirmed from chat export)
- See IMPLEMENTATION-PLAN.md Section 2.3 for full pipeline detail

### Sub-Issues

#### [BL-006a] Website Planning and Scaffolding (Stages 1-2)
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:high`, `track:deliverables`, `size:M`
- LLM determines page structure and tech stack
- Generates HTML/CSS/JS skeleton per page
- Emits REPORT_PREVIEW_START and REPORT_PREVIEW_DELTA events

#### [BL-006b] Content, Styling, and Data Viz (Stages 3-5)
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:high`, `track:deliverables`, `size:M`
- Fill sections from DataBrief, refine CSS/typography
- Embed charts and tables from research data
- REPORT_PREVIEW_DELTA per stage

#### [BL-006c] Review, Bundle, and Co-Generation (Stages 6-7)
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:high`, `track:deliverables`, `size:M`
- LLM critique and fix pass
- Assemble Manifest: each file as Artifact, root = index.html
- Trigger companion report generation via arq
- Emit MANIFEST_CREATED and REPORT_PREVIEW_DONE

## References
- BACKLOG.md: BL-006
- IMPLEMENTATION-PLAN.md: Section 2.3

---

#### [BL-018] Slides Deliverable Pipeline
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:medium`, `track:deliverables`, `size:M`
**Milestone:** M2: Deliverables
**Blocked By:** BL-001, Migration 0005a
**Blocks:** None

**Body:**
## Overview
Create a slides generation pipeline producing a reveal.js HTML bundle from research results. 4-stage process: outline, per-slide content, assembly, and artifact storage. Output is a single HTML file artifact viewable in an iframe.

## Acceptance Criteria
- [ ] 4-stage pipeline: outline -> per-slide content -> reveal.js assembly -> artifact storage
- [ ] Output stored as single Artifact with entity_type=GENERATED_PRESENTATION
- [ ] Artifact content is valid reveal.js HTML
- [ ] AI message hydrated_content includes gml-ViewSlides (or gml-ViewWebsite -- decide before implementation)
- [ ] `GET /api/v1/artifacts/{sha256}/content` returns the HTML

## Technical Notes
- Net-new file: `src/intelli/agents/graphs/nodes/slides_generation.py`
- AD-3 decision: reveal.js HTML format (consistent with web artifact pattern)
- Single HTML file artifact (not multi-file Manifest)
- See IMPLEMENTATION-PLAN.md Section 2.4

## References
- BACKLOG.md: BL-018
- IMPLEMENTATION-PLAN.md: Section 2.4

---

#### [BL-021] Clarification Flow
**Labels:** `type:feature`, `phase:3-frontend`, `priority:medium`, `track:orchestrator`, `size:M`
**Milestone:** M3: Frontend
**Blocked By:** BL-001, BL-002
**Blocks:** None

**Body:**
## Overview
Implement mid-run pause/resume via CLARIFICATION_NEEDED events. When the planner detects an ambiguous query, it emits the event, pauses the graph (checkpointed via existing AsyncPostgresSaver), and waits for user input. The ClarificationPrompt component renders in the chat UI, and POST /api/v1/runs/{run_id}/clarify resumes the graph from checkpoint.

## Acceptance Criteria
- [ ] Ambiguous query triggers CLARIFICATION_NEEDED event with question and context payload
- [ ] Run status set to PAUSED; graph checkpointed via AsyncPostgresSaver
- [ ] `POST /api/v1/runs/{run_id}/clarify` accepts answer, logs CLARIFICATION_RECEIVED, resumes graph
- [ ] ClarificationPrompt.tsx appears in chat UI when CLARIFICATION_NEEDED received on active run SSE
- [ ] After answer submitted, run resumes from checkpoint and completes normally
- [ ] `message.needs_clarification_message` populated on pause, cleared on resume

## Technical Notes
- Server side: conditional route after planner_node; reuse existing AsyncPostgresSaver from db/checkpointer.py
- Client side: net-new `ui/src/components/chat/ClarificationPrompt.tsx`
- New endpoint: `POST /api/v1/runs/{run_id}/clarify` in runs.py
- CLARIFICATION_NEEDED and CLARIFICATION_RECEIVED already in BL-002 event types
- Note: full UI may slip to v1.5 per BACKLOG.md tradeoff log, but schema is ready
- See IMPLEMENTATION-PLAN.md Section 3.9

## References
- BACKLOG.md: BL-021
- IMPLEMENTATION-PLAN.md: Section 3.9

---

#### [BL-019] Document Deliverable (PDF/DOCX Export)
**Labels:** `type:feature`, `phase:2-deliverables`, `priority:medium`, `track:deliverables`, `size:M`
**Milestone:** M2: Deliverables
**Blocked By:** BL-004, BL-005
**Blocks:** None

**Body:**
## Overview
Build an export pipeline that converts MarkupDocument AST to PDF (via weasyprint) and DOCX (via python-docx). Provides a new API endpoint that loads a report artifact, deserializes the MarkupDocument, renders to the requested format, stores the output as a new Artifact, and returns a download URL.

## Acceptance Criteria
- [ ] `POST /api/v1/artifacts/{sha256}/export` with `{"format": "pdf"}` returns valid PDF
- [ ] `POST /api/v1/artifacts/{sha256}/export` with `{"format": "docx"}` returns valid DOCX
- [ ] PDF preserves heading hierarchy, tables, and at least one chart rendered as image
- [ ] DOCX preserves heading hierarchy and table structure
- [ ] Output stored as new Artifact with appropriate entity_type (GENERATED_DOCUMENT)
- [ ] Response includes download URL for the generated file

## Technical Notes
- Net-new files: `src/intelli/services/export/document_export.py`, `src/intelli/services/export/markup_to_html.py`
- New endpoint in: `src/intelli/api/v1/artifacts.py`
- Pipeline: MarkupDocument -> HTML (markup_to_html) -> weasyprint -> PDF bytes
- Pipeline: MarkupDocument -> python-docx Document -> bytes
- Dependencies to add: `weasyprint>=62.0`, `python-docx>=1.1.0`
- AD-4 decision: weasyprint (server-side, CSS-driven)
- See IMPLEMENTATION-PLAN.md Section 2.5

## References
- BACKLOG.md: BL-019
- IMPLEMENTATION-PLAN.md: Section 2.5

---

### Wave 3: Depends on Wave 2 items

---

#### [BL-009] ReportRenderer Component
**Labels:** `type:frontend`, `phase:3-frontend`, `priority:critical-path`, `track:frontend`, `size:L`
**Milestone:** M3: Frontend
**Blocked By:** BL-004, BL-005
**Blocks:** None

**Body:**
## Overview
Build a recursive React renderer that transforms MarkupDocument JSON into React elements for all 18 node types. Triggered by `<gml-ViewReport>` tags in AI message hydrated_content. Includes a GmlComponentParser that walks hydrated_content, extracts `<gml-*>` tags, and renders the appropriate React component.

## Acceptance Criteria
- [ ] All 18 MarkupNodeType values render without errors
- [ ] CHART nodes render as Recharts charts (bar, line, pie, etc.)
- [ ] METRIC_CARD nodes render as styled KPI cards with label, value, delta, trend
- [ ] TABLE nodes render as structured HTML tables
- [ ] Citation numbers render as inline superscripts using existing CitationLink.tsx
- [ ] Unknown node types fall back gracefully (render as paragraph)
- [ ] GmlComponentParser extracts `<gml-ViewReport>` from hydrated_content and launches ReportRenderer
- [ ] Data fetched from `GET /api/v1/artifacts/{sha256}/content`

## Technical Notes
- Net-new files: `ui/src/components/reports/ReportRenderer.tsx`, `ui/src/types/markup.ts`, `ui/src/components/chat/GmlComponentParser.tsx`
- Chart rendering: recharts (add to package.json if absent)
- Code blocks: react-syntax-highlighter (add if absent)
- Citations: extend existing CitationLink.tsx, do not replace
- See IMPLEMENTATION-PLAN.md Section 3.6 for TypeScript types

## References
- BACKLOG.md: BL-009
- IMPLEMENTATION-PLAN.md: Section 3.6

---

#### [BL-010] WebsitePreview Component
**Labels:** `type:frontend`, `phase:3-frontend`, `priority:medium`, `track:frontend`, `size:M`
**Milestone:** M3: Frontend
**Blocked By:** BL-006
**Blocks:** None

**Body:**
## Overview
Create a website preview component that fetches a generated website Manifest, loads the index.html as a blob URL, and renders it in a sandboxed iframe. Triggered by `<gml-ViewWebsite>` tags in AI message hydrated_content.

## Acceptance Criteria
- [ ] Fetches Manifest via `GET /api/v1/manifests/{sha256}`
- [ ] Locates index.html entry in Manifest tree
- [ ] Loads artifact content, creates blob URL, renders in sandboxed iframe
- [ ] iframe sandbox: `allow-scripts allow-same-origin`
- [ ] Blob URL properly revoked on component unmount (no memory leak)
- [ ] Loading state shown while fetching manifest and artifact

## Technical Notes
- Net-new file: `ui/src/components/deliverables/WebsitePreview.tsx`
- Uses existing Manifest and Artifact APIs (already working)
- Triggered by GmlComponentParser when it encounters `<gml-ViewWebsite>` tag
- See IMPLEMENTATION-PLAN.md Section 3.8

## References
- BACKLOG.md: BL-010
- IMPLEMENTATION-PLAN.md: Section 3.8

---

#### [BL-011] Enhanced SourcesPanel
**Labels:** `type:frontend`, `phase:3-frontend`, `priority:medium`, `track:frontend`, `size:M`
**Milestone:** M3: Frontend
**Blocked By:** BL-003, BL-016
**Blocks:** None

**Body:**
## Overview
Enhance the existing SourcesPanel component to add a "Web Sources" tab alongside the existing RAG documents tab. Web sources are fetched from the entity API endpoint and display favicon, title, URL, snippet, and relevance badge. The existing SourcesPanel.tsx, SourcesContext.tsx, and use-thread-sources.ts hook are preserved and extended.

## Acceptance Criteria
- [ ] "Web Sources" tab appears when run has WEB_SOURCE entity artifacts
- [ ] Each source displays: favicon (via Google favicons API), title, URL, snippet
- [ ] Relevance badge shown per source
- [ ] Click opens source URL in new tab
- [ ] Count badge on tab shows source count
- [ ] Existing RAG sources tab completely unaffected
- [ ] Data fetched from `GET /api/v1/runs/{run_id}/entities?entity_type=web_source`

## Technical Notes
- Extends existing: `ui/src/components/chat/SourcesPanel.tsx`
- Understand existing SourcesContext.tsx and use-thread-sources.ts data shape before modifying
- Favicon URL pattern: `https://www.google.com/s2/favicons?domain={domain}`
- See IMPLEMENTATION-PLAN.md Section 3.7
- Sources panel needs entity API endpoint from BL-016 for web_source entities.

## References
- BACKLOG.md: BL-011
- IMPLEMENTATION-PLAN.md: Section 3.7

---

#### [BL-013] Quota Enforcement Middleware
**Labels:** `type:billing`, `phase:4-billing`, `priority:high`, `track:billing`, `size:S`
**Milestone:** M4: Billing & Polish
**Blocked By:** BL-012
**Blocks:** None

**Body:**
## Overview
Create a FastAPI dependency that checks usage quota before allowing new run creation. Loads the user's subscription, queries current-period usage, compares against plan limits, and returns HTTP 429 when quota is exceeded. Pro accounts allow overage at $0.50/run.

## Acceptance Criteria
- [ ] FastAPI `Depends()` function on run creation endpoints
- [ ] Free account at limit returns HTTP 429 with `{"error": "quota_exceeded", "limit": N, "current": N}`
- [ ] Pro account within limit allows run creation
- [ ] Pro account overage tracked for billing (via Stripe metered billing or manual invoice)
- [ ] Usage record created after successful run creation (not on retry)
- [ ] No quota check on read operations (GET endpoints)

## Technical Notes
- Net-new file: `src/intelli/api/middleware/quota_middleware.py`
- Plan limits: free=5 runs/month + 2 reports, pro=200 runs/month + $0.50/run overage
- Query usage_records table for current billing period
- Frontend should show toast on 429 quota exceeded

## References
- BACKLOG.md: BL-013
- IMPLEMENTATION-PLAN.md: Section 4.2

---

## 4. GitHub CLI Commands

### Label Creation

```bash
# Type labels
gh label create "type:feature" --color "0E8A16" --description "New feature implementation"
gh label create "type:infrastructure" --color "D93F0B" --description "Schema, migration, or platform infrastructure"
gh label create "type:frontend" --color "1D76DB" --description "React/UI component work"
gh label create "type:backend" --color "5319E7" --description "Python/FastAPI backend logic"
gh label create "type:integration" --color "FBCA04" --description "External API or service integration"
gh label create "type:billing" --color "B60205" --description "Stripe billing and quota enforcement"
gh label create "type:test" --color "C5DEF5" --description "Test suite or test infrastructure"
gh label create "type:docs" --color "0075CA" --description "Documentation updates"

# Phase labels
gh label create "phase:0-foundation" --color "BFD4F2" --description "Phase 0: Schema, migration, environment (Weeks 1-2)"
gh label create "phase:1-orchestrator" --color "D4C5F9" --description "Phase 1: Research orchestrator fan-out (Weeks 3-5)"
gh label create "phase:2-deliverables" --color "FEF2C0" --description "Phase 2: Report, website, slides, export pipelines (Weeks 6-8)"
gh label create "phase:3-frontend" --color "C2E0C6" --description "Phase 3: React UI components and views (Weeks 9-11)"
gh label create "phase:4-billing" --color "F9D0C4" --description "Phase 4: Billing, quota, production hardening (Weeks 12-13)"

# Priority labels
gh label create "priority:critical-path" --color "B60205" --description "On the critical dependency chain; blocks other work"
gh label create "priority:high" --color "D93F0B" --description "Important but not on the longest path"
gh label create "priority:medium" --color "FBCA04" --description "Standard priority; can be reordered within phase"
gh label create "priority:low" --color "0E8A16" --description "Nice to have; can slip without impact"

# Track labels
gh label create "track:orchestrator" --color "7057FF" --description "Research orchestrator graph and agent nodes"
gh label create "track:frontend" --color "008672" --description "React components and Zustand stores"
gh label create "track:billing" --color "E4E669" --description "Stripe integration and quota enforcement"
gh label create "track:deliverables" --color "FF7619" --description "Report, website, slides, document generation"
gh label create "track:infrastructure" --color "6F42C1" --description "Schema, models, migrations, services"

# Size labels
gh label create "size:XS" --color "EDEDED" --description "~1 story point: trivial change, < 2 hours"
gh label create "size:S" --color "D4C5F9" --description "~2 story points: small task, half day"
gh label create "size:M" --color "BFD4F2" --description "~3 story points: moderate task, 1-2 days"
gh label create "size:L" --color "FEF2C0" --description "~5 story points: large task, 3-5 days"
gh label create "size:XL" --color "F9D0C4" --description "~8 story points: epic-level, full week+"

# Status labels
gh label create "status:blocked" --color "B60205" --description "Waiting on another issue to complete"
gh label create "status:ready-to-start" --color "0E8A16" --description "All dependencies met; can begin work"
gh label create "status:in-review" --color "FBCA04" --description "PR submitted; awaiting review"
```

### Milestone Creation

```bash
gh milestone create "M0: Foundation" \
  --description "Phase 0: Schema extensions, migration 0005, Markup AST models, dev environment verification. All schema work lands here. (Weeks 1-2)" \
  --due-date "2026-03-14"

gh milestone create "M1: Orchestrator" \
  --description "Phase 1: Extend ResearchAssistantGraph with planner, Send() fan-out, web tools, meta-reasoning, synthesis, and shared data brief. Backend-only; verified via SSE stream. (Weeks 3-5)" \
  --due-date "2026-04-04"

gh milestone create "M2: Deliverables" \
  --description "Phase 2: Report, website, slides generation pipelines and PDF/DOCX export. Entity/citation substrate. All backend deliverable nodes operational. (Weeks 6-8)" \
  --due-date "2026-04-25"

gh milestone create "M3: Frontend" \
  --description "Phase 3: PlanViewer, DeliverableSelector, ReportRenderer, WebsitePreview, GenerationOverlay, enhanced SourcesPanel and RunTimeline, clarification flow UI. (Weeks 9-11)" \
  --due-date "2026-05-16"

gh milestone create "M4: Billing & Polish" \
  --description "Phase 4: Stripe billing system, quota enforcement middleware, production hardening, observability, and final E2E testing. (Weeks 12-13)" \
  --due-date "2026-05-30"
```

### Issue Creation Examples (3 real examples with full commands)

**Example 1: BL-002 (Wave 0, critical path, infrastructure)**

```bash
gh issue create \
  --title "[BL-002] RunEvent Schema Extensions" \
  --label "type:infrastructure,phase:0-foundation,priority:critical-path,track:infrastructure,size:S,status:ready-to-start" \
  --milestone "M0: Foundation" \
  --body "$(cat <<'EOF'
## Overview
Extend the existing RunEvent type enum with 19 new event types covering planning, subagent fan-out, streaming content, artifacts, clarification, report generation progress, and web research events. This is the foundational schema change that all orchestrator and frontend work depends on.

## Acceptance Criteria
- [ ] All 19 new event types added to `RunEventType` enum in both `schemas/runs.py` and `db/models/runs.py`
- [ ] Typed `log_*` helper methods added to `LedgerService` for each new event type
- [ ] All new event types round-trip through the ledger (create, read back)
- [ ] New events appear correctly in the SSE stream via PG LISTEN/NOTIFY
- [ ] Existing event types and all existing tests remain unaffected
- [ ] Payload shapes documented as Python TypedDict or Pydantic models

## Technical Notes
- Files to modify: `src/intelli/schemas/runs.py`, `src/intelli/db/models/runs.py`, `src/intelli/services/runs/ledger_service.py`
- New types: PLAN_CREATED, PLAN_TASK_STARTED, PLAN_TASK_COMPLETED, PLAN_TASK_FAILED, SUBAGENT_DISPATCHED, SUBAGENT_COMPLETED, SUBAGENT_FAILED, CONTENT_DELTA, ARTIFACT_CREATED, CLARIFICATION_NEEDED, CLARIFICATION_RECEIVED, REPORT_PREVIEW_START, REPORT_PREVIEW_DELTA, REPORT_PREVIEW_DONE, WEB_SEARCH_STARTED, WEB_SEARCH_COMPLETED, WEB_SCRAPE_STARTED, WEB_SCRAPE_COMPLETED, REFERENCES_FOUND
- See IMPLEMENTATION-PLAN.md Section 0.2 for full payload schemas

## Dependencies
- **Blocked by:** None
- **Blocks:** #BL-001, #BL-007, #BL-014, #BL-016, #BL-020, #BL-021

## References
- BACKLOG.md: BL-002
- IMPLEMENTATION-PLAN.md: Section 0.2
EOF
)"
```

**Example 2: BL-001 (Wave 1, XL epic, orchestrator track)**

```bash
gh issue create \
  --title "[BL-001] Research Orchestrator Graph" \
  --label "type:feature,phase:1-orchestrator,priority:critical-path,track:orchestrator,size:XL,status:blocked" \
  --milestone "M1: Orchestrator" \
  --body "$(cat <<'EOF'
## Overview
Extend the existing ResearchAssistantGraph (not replace it) with a planner node, Send() fan-out to parallel research workers, fan-in aggregation, synthesis node, and deliverable router. This transforms the current single-agent loop into a multi-workstream orchestrator that mirrors Superagent's 13+ parallel task pattern.

## Acceptance Criteria
- [ ] Planner node decomposes query into 3-13 ResearchTask dicts and emits PLAN_CREATED event
- [ ] Fan-out dispatches Send() per task, each creating a child Run with parent_run_id FK
- [ ] Research workers execute in parallel using existing agent+tools loop
- [ ] Fan-in node aggregates all TaskResult dicts
- [ ] Synthesis node produces structured DataBrief in graph state
- [ ] Deliverable router routes by deliverable_type to appropriate generation node
- [ ] SSE stream shows: PLAN_CREATED, N x SUBAGENT_DISPATCHED, N x PLAN_TASK_*, STATE_UPDATE
- [ ] AI message hydrated_content contains `<gml-View*>` components
- [ ] Failed tasks emit PLAN_TASK_FAILED without crashing the run
- [ ] All existing graph tests continue to pass

## Sub-Issues
- [ ] [BL-001a] ResearchState Extension
- [ ] [BL-001b] Planner Node
- [ ] [BL-001c] Fan-Out / Fan-In Infrastructure
- [ ] [BL-001d] Synthesis Node and Deliverable Router
- [ ] [BL-001e] Integration Tests and Event Verification

## Technical Notes
- Extends: `src/intelli/agents/graphs/research_assistant.py`
- Existing graph: agent -> (tools_condition) -> tools -> capture_sources -> agent (loop)
- New nodes: planner_node, fan_out, research_worker_node, fan_in_node, synthesis_node, deliverable_router
- research_worker_node creates child Run via `Run(parent_run_id=state["run_id"])`
- See IMPLEMENTATION-PLAN.md Sections 1.1, 1.2 for full graph diagram

## Dependencies
- **Blocked by:** BL-002
- **Blocks:** BL-003, BL-005, BL-006, BL-017, BL-018, BL-021, BL-022

## References
- BACKLOG.md: BL-001
- IMPLEMENTATION-PLAN.md: Sections 1.1, 1.2
EOF
)"
```

**Example 3: BL-009 (Wave 3, frontend track, large)**

```bash
gh issue create \
  --title "[BL-009] ReportRenderer Component" \
  --label "type:frontend,phase:3-frontend,priority:critical-path,track:frontend,size:L,status:blocked" \
  --milestone "M3: Frontend" \
  --body "$(cat <<'EOF'
## Overview
Build a recursive React renderer that transforms MarkupDocument JSON into React elements for all 18 node types. Triggered by `<gml-ViewReport>` tags in AI message hydrated_content. Includes a GmlComponentParser that walks hydrated_content, extracts `<gml-*>` tags, and renders the appropriate React component.

## Acceptance Criteria
- [ ] All 18 MarkupNodeType values render without errors
- [ ] CHART nodes render as Recharts charts (bar, line, pie, etc.)
- [ ] METRIC_CARD nodes render as styled KPI cards with label, value, delta, trend
- [ ] TABLE nodes render as structured HTML tables
- [ ] Citation numbers render as inline superscripts using existing CitationLink.tsx
- [ ] Unknown node types fall back gracefully (render as paragraph)
- [ ] GmlComponentParser extracts `<gml-ViewReport>` from hydrated_content
- [ ] Data fetched from `GET /api/v1/artifacts/{sha256}/content`

## Technical Notes
- Net-new files: `ui/src/components/reports/ReportRenderer.tsx`, `ui/src/types/markup.ts`, `ui/src/components/chat/GmlComponentParser.tsx`
- Chart rendering: recharts (add to package.json if absent)
- Code blocks: react-syntax-highlighter (add if absent)
- Citations: extend existing CitationLink.tsx, do not replace
- See IMPLEMENTATION-PLAN.md Section 3.6 for TypeScript types

## Dependencies
- **Blocked by:** BL-004, BL-005
- **Blocks:** None

## References
- BACKLOG.md: BL-009
- IMPLEMENTATION-PLAN.md: Section 3.6
EOF
)"
```

### Bulk Creation Script

```bash
#!/usr/bin/env bash
# bulk-create-issues.sh
# Creates all 22 BL issues in dependency order (Wave 0 first, then Wave 1, etc.)
# Run from the nyqst-intelli-230126 repository root.
#
# Prerequisites:
#   1. gh CLI authenticated (gh auth status)
#   2. Labels created (run label creation commands above)
#   3. Milestones created (run milestone creation commands above)
#
# Usage: bash bulk-create-issues.sh 2>&1 | tee issue-creation.log

set -euo pipefail

# Map BL-IDs to GitHub issue numbers as they are created
declare -A ISSUE_MAP

create_issue() {
  local bl_id="$1"
  local title="$2"
  local labels="$3"
  local milestone="$4"
  local body="$5"

  echo "Creating issue: ${title}..."
  local issue_url
  issue_url=$(gh issue create \
    --title "${title}" \
    --label "${labels}" \
    --milestone "${milestone}" \
    --body "${body}" \
    2>&1 | tail -1)

  # Extract issue number from URL
  local issue_num
  issue_num=$(echo "${issue_url}" | grep -oE '[0-9]+$')
  ISSUE_MAP["${bl_id}"]="${issue_num}"
  echo "  -> Created #${issue_num} for ${bl_id}"
  sleep 1  # Rate limit courtesy
}

echo "=========================================="
echo "WAVE 0: No dependencies (can start immediately)"
echo "=========================================="

create_issue "BL-002" \
  "[BL-002] RunEvent Schema Extensions" \
  "type:infrastructure,phase:0-foundation,priority:critical-path,track:infrastructure,size:S,status:ready-to-start" \
  "M0: Foundation" \
  "$(cat <<'BODY'
## Overview
Extend RunEvent type enum with 19 new event types for planning, subagent fan-out, content streaming, artifacts, clarification, report progress, and web research.

## Acceptance Criteria
- [ ] 19 new event types in both schemas/runs.py and db/models/runs.py
- [ ] Typed log_* helpers in LedgerService
- [ ] Round-trip through ledger and SSE stream
- [ ] Existing tests unaffected

## Dependencies
- **Blocked by:** None
- **Blocks:** BL-001, BL-007, BL-014, BL-016, BL-020, BL-021
BODY
)"

create_issue "BL-004" \
  "[BL-004] NYQST Markup AST Schema" \
  "type:infrastructure,phase:0-foundation,priority:critical-path,track:deliverables,size:M,status:ready-to-start" \
  "M0: Foundation" \
  "$(cat <<'BODY'
## Overview
Pydantic models for the NYQST Markup AST document tree with 18 node types plus MarkupHealer.

## Acceptance Criteria
- [ ] 18 node types in MarkupNodeType enum
- [ ] MarkupNode, MarkupDocument models
- [ ] MarkupHealer.heal() and validate()
- [ ] Round-trip JSON stability

## Dependencies
- **Blocked by:** None
- **Blocks:** BL-005, BL-009, BL-019
BODY
)"

create_issue "BL-008" \
  "[BL-008] DeliverableSelector Component" \
  "type:frontend,phase:0-foundation,priority:medium,track:frontend,size:S,status:ready-to-start" \
  "M0: Foundation" \
  "$(cat <<'BODY'
## Overview
Segmented control for deliverable type selection (Report|Website|Slides|Document) above the chat composer.

## Acceptance Criteria
- [ ] 4-segment toggle with Lucide icons
- [ ] Syncs to DeliverableStore
- [ ] deliverable_type included in message payload
- [ ] Auto-clears after submission

## Dependencies
- **Blocked by:** BL-015 (weak — DeliverableSelector writes to useDeliverableStore)
- **Blocks:** None
BODY
)"

create_issue "BL-015" \
  "[BL-015] DeliverableStore (Zustand)" \
  "type:frontend,phase:0-foundation,priority:medium,track:frontend,size:XS,status:ready-to-start" \
  "M0: Foundation" \
  "$(cat <<'BODY'
## Overview
6th Zustand store for deliverable selection and generation progress state.

## Acceptance Criteria
- [ ] selectedType, activePreview state shape
- [ ] All action methods typed
- [ ] Compiles, exports correctly

## Dependencies
- **Blocked by:** None
- **Blocks:** None
BODY
)"

create_issue "BL-012" \
  "[BL-012] Billing System" \
  "type:billing,phase:4-billing,priority:high,track:billing,size:L" \
  "M4: Billing & Polish" \
  "$(cat <<'BODY'
## Overview
Stripe billing: checkout, webhooks, subscriptions, usage tracking. Port from okestraai/DocuIntelli.

## Acceptance Criteria
- [ ] Checkout session creation
- [ ] Webhook processing with signature verification
- [ ] Subscription and usage endpoints
- [ ] Usage record per run (not retry)

## Dependencies
- **Blocked by:** Migration 0005c (billing tables)
- **Blocks:** BL-013
BODY
)"

echo ""
echo "=========================================="
echo "WAVE 1: Depends on Wave 0"
echo "=========================================="

create_issue "BL-001" \
  "[BL-001] Research Orchestrator Graph" \
  "type:feature,phase:1-orchestrator,priority:critical-path,track:orchestrator,size:XL,status:blocked" \
  "M1: Orchestrator" \
  "$(cat <<'BODY'
## Overview
Extend ResearchAssistantGraph with planner, Send() fan-out, fan-in, synthesis, and deliverable router.

## Acceptance Criteria
- [ ] Planner -> fan-out -> parallel workers -> fan-in -> synthesis -> deliverable router
- [ ] PLAN_CREATED and SUBAGENT_* events in SSE
- [ ] DataBrief populated in final state
- [ ] Child Runs with parent_run_id
- [ ] Existing tests pass

## Dependencies
- **Blocked by:** BL-002 (#${ISSUE_MAP[BL-002]})
- **Blocks:** BL-003, BL-005, BL-006, BL-017, BL-018, BL-021, BL-022
BODY
)"

create_issue "BL-007" \
  "[BL-007] PlanViewer Component" \
  "type:frontend,phase:3-frontend,priority:high,track:frontend,size:M,status:blocked" \
  "M3: Frontend" \
  "$(cat <<'BODY'
## Overview
Numbered task cards with live status indicators in a Plan tab in DetailsPanel.

## Acceptance Criteria
- [ ] Cards on PLAN_CREATED, live status updates
- [ ] Phase grouping, error tooltips, duration display
- [ ] New Plan tab in DetailsPanel

## Dependencies
- **Blocked by:** BL-002 (#${ISSUE_MAP[BL-002]})
- **Blocks:** None
BODY
)"

create_issue "BL-014" \
  "[BL-014] Enhanced RunTimeline" \
  "type:frontend,phase:3-frontend,priority:medium,track:frontend,size:M,status:blocked" \
  "M3: Frontend" \
  "$(cat <<'BODY'
## Overview
Enhance RunTimeline with icons/labels for 19 new event types, phase grouping, and subagent cards.

## Acceptance Criteria
- [ ] All new event types have icons and labels
- [ ] Phase grouping when PLAN_CREATED present
- [ ] Backward compatible for non-plan runs

## Dependencies
- **Blocked by:** BL-002 (#${ISSUE_MAP[BL-002]})
- **Blocks:** None
BODY
)"

create_issue "BL-020" \
  "[BL-020] Generation Progress Overlay" \
  "type:frontend,phase:3-frontend,priority:high,track:frontend,size:M,status:blocked" \
  "M3: Frontend" \
  "$(cat <<'BODY'
## Overview
Full-screen overlay with dual-status display and progress during deliverable generation.

## Acceptance Criteria
- [ ] Show on REPORT_PREVIEW_START, hide on DONE
- [ ] Phase label updates from DELTA events
- [ ] Async entity "Creating notes..." indicator

## Dependencies
- **Blocked by:** BL-002 (#${ISSUE_MAP[BL-002]})
- **Blocks:** None
BODY
)"

create_issue "BL-016" \
  "[BL-016] Entity/Citation Substrate" \
  "type:feature,phase:2-deliverables,priority:high,track:infrastructure,size:M,status:blocked" \
  "M2: Deliverables" \
  "$(cat <<'BODY'
## Overview
Entity/citation service layer: create entity artifacts from REFERENCES_FOUND events, dedup, per-run entities API.

## Acceptance Criteria
- [ ] create_entity_artifact helper
- [ ] Async creation via arq job
- [ ] GET /api/v1/runs/{run_id}/entities endpoint
- [ ] Citation IDs resolve to entities

## Dependencies
- **Blocked by:** BL-002 (#${ISSUE_MAP[BL-002]}), Migration 0005a (entity_type + tags columns)
- **Blocks:** BL-011

> **Note:** BL-005 is a soft dependency for citation-binding integration testing only.
BODY
)"

echo ""
echo "=========================================="
echo "WAVE 2: Depends on BL-001 and/or BL-004"
echo "=========================================="

create_issue "BL-003" \
  "[BL-003] Web Research MCP Tools" \
  "type:integration,phase:1-orchestrator,priority:critical-path,track:orchestrator,size:M,status:blocked" \
  "M1: Orchestrator" \
  "$(cat <<'BODY'
## Overview
Brave Search and Jina Reader MCP tools for web research with RunEvent emission.

## Acceptance Criteria
- [ ] brave_web_search returns results
- [ ] jina_web_scrape returns cleaned text
- [ ] Both registered in MCP server
- [ ] WEB_SEARCH_*/WEB_SCRAPE_* events emitted

## Dependencies
- **Blocked by:** None (standalone tools); BL-001 (integration wiring into orchestrator)
- **Blocks:** BL-011

> **Note:** Brave/Jina API wrappers can be built and tested independently in Wave 0. Integration into research_worker_node requires BL-001 (Wave 2).
BODY
)"

create_issue "BL-022" \
  "[BL-022] Shared Data Brief" \
  "type:feature,phase:1-orchestrator,priority:high,track:orchestrator,size:S,status:blocked" \
  "M1: Orchestrator" \
  "$(cat <<'BODY'
## Overview
Structured data brief as LangGraph state field for cross-deliverable data consistency.

## Acceptance Criteria
- [ ] DataBrief shape: key_facts, entities, financial_figures, summary
- [ ] Populated by synthesis_node
- [ ] Available in final state
- [ ] Downstream nodes reference without re-fetch

## Dependencies
- **Blocked by:** None (design phase)
- **Blocks:** None

> **Note:** DataBrief schema design must precede BL-001 (feeds into ResearchState). Integration testing requires BL-001.
BODY
)"

create_issue "BL-017" \
  "[BL-017] Meta-Reasoning Node" \
  "type:feature,phase:1-orchestrator,priority:high,track:orchestrator,size:M,status:blocked" \
  "M1: Orchestrator" \
  "$(cat <<'BODY'
## Overview
Research quality evaluator node with recovery dispatch for data gaps and failed tasks.

## Acceptance Criteria
- [ ] Evaluates plan vs results, identifies gaps
- [ ] Dispatches recovery tasks when gaps found
- [ ] Skip heuristic for simple queries
- [ ] Latency < 30s for meta-reasoning call

## Dependencies
- **Blocked by:** BL-001 (#${ISSUE_MAP[BL-001]})
- **Blocks:** None
BODY
)"

create_issue "BL-005" \
  "[BL-005] Report Generation Node" \
  "type:feature,phase:2-deliverables,priority:critical-path,track:deliverables,size:L,status:blocked" \
  "M2: Deliverables" \
  "$(cat <<'BODY'
## Overview
4-pass report generation: outline, parallel sections, review, assembly into MarkupDocument artifact.

## Acceptance Criteria
- [ ] Valid MarkupDocument passing MarkupHealer.validate()
- [ ] Stored as GENERATED_REPORT artifact
- [ ] hydrated_content contains gml-ViewReport
- [ ] Citation IDs reference data brief entities
- [ ] Co-generation for website requests

## Dependencies
- **Blocked by:** BL-001 (#${ISSUE_MAP[BL-001]}), BL-004 (#${ISSUE_MAP[BL-004]}), Migration 0005a
- **Blocks:** BL-016, BL-019, BL-009
BODY
)"

create_issue "BL-006" \
  "[BL-006] Website Generation Pipeline" \
  "type:feature,phase:2-deliverables,priority:high,track:deliverables,size:L,status:blocked" \
  "M2: Deliverables" \
  "$(cat <<'BODY'
## Overview
7-stage website generation producing multi-file HTML/CSS/JS bundle as Manifest with co-generation.

## Acceptance Criteria
- [ ] 7-stage pipeline: planning through bundle
- [ ] Manifest with index.html + styles.css minimum
- [ ] Both gml-ViewWebsite and gml-ViewReport in response
- [ ] entity_type=GENERATED_WEBSITE

## Dependencies
- **Blocked by:** BL-001 (#${ISSUE_MAP[BL-001]}), Migration 0005a
- **Blocks:** BL-010
BODY
)"

create_issue "BL-018" \
  "[BL-018] Slides Deliverable Pipeline" \
  "type:feature,phase:2-deliverables,priority:medium,track:deliverables,size:M,status:blocked" \
  "M2: Deliverables" \
  "$(cat <<'BODY'
## Overview
Slides generation producing reveal.js HTML bundle from research results.

## Acceptance Criteria
- [ ] 4-stage pipeline: outline, content, assembly, storage
- [ ] Valid reveal.js HTML as single artifact
- [ ] entity_type=GENERATED_PRESENTATION

## Dependencies
- **Blocked by:** BL-001 (#${ISSUE_MAP[BL-001]}), Migration 0005a
- **Blocks:** None
BODY
)"

create_issue "BL-021" \
  "[BL-021] Clarification Flow" \
  "type:feature,phase:3-frontend,priority:medium,track:orchestrator,size:M,status:blocked" \
  "M3: Frontend" \
  "$(cat <<'BODY'
## Overview
Mid-run pause/resume via CLARIFICATION_NEEDED events with AsyncPostgresSaver checkpoint.

## Acceptance Criteria
- [ ] CLARIFICATION_NEEDED pauses run
- [ ] POST /api/v1/runs/{run_id}/clarify resumes
- [ ] ClarificationPrompt.tsx in chat UI
- [ ] needs_clarification_message populated

## Dependencies
- **Blocked by:** BL-001 (#${ISSUE_MAP[BL-001]}), BL-002 (#${ISSUE_MAP[BL-002]})
- **Blocks:** None
BODY
)"

create_issue "BL-019" \
  "[BL-019] Document Deliverable (PDF/DOCX Export)" \
  "type:feature,phase:2-deliverables,priority:medium,track:deliverables,size:M,status:blocked" \
  "M2: Deliverables" \
  "$(cat <<'BODY'
## Overview
Export pipeline: MarkupDocument AST to PDF (weasyprint) and DOCX (python-docx).

## Acceptance Criteria
- [ ] POST /api/v1/artifacts/{sha256}/export with format=pdf returns valid PDF
- [ ] format=docx returns valid DOCX
- [ ] Preserves heading hierarchy, tables, charts (as images in PDF)
- [ ] Output stored as new artifact

## Dependencies
- **Blocked by:** BL-004 (#${ISSUE_MAP[BL-004]}), BL-005 (#${ISSUE_MAP[BL-005]})
- **Blocks:** None
BODY
)"

echo ""
echo "=========================================="
echo "WAVE 3: Depends on Wave 2"
echo "=========================================="

create_issue "BL-009" \
  "[BL-009] ReportRenderer Component" \
  "type:frontend,phase:3-frontend,priority:critical-path,track:frontend,size:L,status:blocked" \
  "M3: Frontend" \
  "$(cat <<'BODY'
## Overview
Recursive React renderer for MarkupDocument JSON with 18 node types and GmlComponentParser.

## Acceptance Criteria
- [ ] All 18 node types render
- [ ] Charts via Recharts, code via react-syntax-highlighter
- [ ] Citations via existing CitationLink.tsx
- [ ] GmlComponentParser extracts gml-ViewReport tags

## Dependencies
- **Blocked by:** BL-004 (#${ISSUE_MAP[BL-004]}), BL-005 (#${ISSUE_MAP[BL-005]})
- **Blocks:** None
BODY
)"

create_issue "BL-010" \
  "[BL-010] WebsitePreview Component" \
  "type:frontend,phase:3-frontend,priority:medium,track:frontend,size:M,status:blocked" \
  "M3: Frontend" \
  "$(cat <<'BODY'
## Overview
Website preview via sandboxed iframe loading Manifest bundle as blob URL.

## Acceptance Criteria
- [ ] Fetches Manifest, loads index.html as blob URL
- [ ] Sandboxed iframe rendering
- [ ] Blob URL revoked on unmount
- [ ] Loading state during fetch

## Dependencies
- **Blocked by:** BL-006 (#${ISSUE_MAP[BL-006]})
- **Blocks:** None
BODY
)"

create_issue "BL-011" \
  "[BL-011] Enhanced SourcesPanel" \
  "type:frontend,phase:3-frontend,priority:medium,track:frontend,size:M,status:blocked" \
  "M3: Frontend" \
  "$(cat <<'BODY'
## Overview
Add Web Sources tab to existing SourcesPanel with favicon, title, URL, snippet per source.

## Acceptance Criteria
- [ ] Web Sources tab when WEB_SOURCE entities exist
- [ ] Favicon, title, URL, snippet display
- [ ] Count badge, click-to-open
- [ ] Existing RAG tab unaffected

## Dependencies
- **Blocked by:** BL-003 (#${ISSUE_MAP[BL-003]}), BL-016 (#${ISSUE_MAP[BL-016]})
- **Blocks:** None
BODY
)"

create_issue "BL-013" \
  "[BL-013] Quota Enforcement Middleware" \
  "type:billing,phase:4-billing,priority:high,track:billing,size:S,status:blocked" \
  "M4: Billing & Polish" \
  "$(cat <<'BODY'
## Overview
FastAPI Depends() quota check on run creation: 429 when quota exceeded.

## Acceptance Criteria
- [ ] Free at limit -> 429
- [ ] Pro within limit -> allowed
- [ ] Pro overage tracked
- [ ] No check on read ops

## Dependencies
- **Blocked by:** BL-012 (#${ISSUE_MAP[BL-012]})
- **Blocks:** None
BODY
)"

echo ""
echo "=========================================="
echo "DONE: All 22 issues created"
echo "=========================================="
echo ""
echo "Issue Map:"
for bl_id in $(echo "${!ISSUE_MAP[@]}" | tr ' ' '\n' | sort); do
  echo "  ${bl_id} -> #${ISSUE_MAP[${bl_id}]}"
done
```

---

## 5. GitHub Project Board Structure

### Project Setup

Create a GitHub Projects (v2) board named **"Superagent Parity"** in the repository.

### Custom Fields

| Field Name | Field Type | Options |
|------------|-----------|---------|
| Status | Single select | Backlog, Ready, In Progress, In Review, Done, Blocked |
| Phase | Single select | 0-Foundation, 1-Orchestrator, 2-Deliverables, 3-Frontend, 4-Billing |
| Track | Single select | Orchestrator, Frontend, Billing, Deliverables, Infrastructure |
| Size | Number | 1, 2, 3, 5, 8 (story points) |
| Priority | Single select | Critical Path, High, Medium, Low |
| Wave | Number | 0, 1, 2, 3 (dependency wave) |
| BL-ID | Text | BL-001 through BL-022 |

### Views

#### View 1: Sprint Board (default)
- **Layout:** Board
- **Group by:** Status
- **Columns:** Backlog | Ready | In Progress | In Review | Done | Blocked
- **Sort within columns:** Priority (Critical Path first), then Size (largest first)
- **Filter:** None (shows all)

#### View 2: By Phase
- **Layout:** Board
- **Group by:** Phase
- **Columns:** 0-Foundation | 1-Orchestrator | 2-Deliverables | 3-Frontend | 4-Billing
- **Sort within columns:** Priority, then Size
- **Use case:** Sprint planning -- see what is in each milestone

#### View 3: By Track
- **Layout:** Board
- **Group by:** Track
- **Columns:** Orchestrator | Frontend | Billing | Deliverables | Infrastructure
- **Sort within columns:** Phase (ascending), then Priority
- **Use case:** Team assignment -- each dev owns a track

#### View 4: Dependency Map
- **Layout:** Table
- **Columns visible:** BL-ID, Title, Status, Wave, Phase, Blocked By (text field), Priority
- **Sort:** Wave (ascending), then Priority
- **Filter:** Status != Done
- **Use case:** Identify what can start next, what is blocked

#### View 5: Burndown (By Size)
- **Layout:** Table
- **Columns visible:** BL-ID, Title, Size, Status, Phase
- **Group by:** Status
- **Use case:** Track total story points remaining per status

### Automation Rules

| Trigger | Action |
|---------|--------|
| Issue added to project | Set Status = "Backlog" |
| Pull request linked to issue | Set Status = "In Progress" |
| Pull request marked ready for review | Set Status = "In Review" |
| Pull request merged | Set Status = "Done" |
| Label `status:blocked` added | Set Status = "Blocked" |
| Label `status:blocked` removed | Set Status = "Ready" |
| Label `status:ready-to-start` added | Set Status = "Ready" |

### Setup Commands

```bash
# Create the project (v2)
gh project create --title "Superagent Parity" --owner $(gh repo view --json owner -q '.owner.login')

# Note: Custom fields and views must be configured via the GitHub web UI
# or the GraphQL API. The gh CLI does not yet support project field creation.
# See: https://docs.github.com/en/issues/planning-and-tracking-with-projects
```

---

## 6. Dependency Tracking Strategy

### Approach: Multi-Layer Dependency Tracking

GitHub Issues does not have native dependency enforcement. We use three complementary strategies:

#### Layer 1: Issue Body "Dependencies" Section

Every issue includes a structured Dependencies section:

```markdown
## Dependencies
- **Blocked by:** #12, #15 (BL-002, BL-004)
- **Blocks:** #18, #22 (BL-005, BL-019)
```

GitHub auto-links issue numbers, making cross-navigation easy.

#### Layer 2: Task Lists in Milestone Epic Issues

Create one "epic" tracking issue per milestone that uses task lists to track constituent issues:

```bash
gh issue create \
  --title "[EPIC] M1: Orchestrator" \
  --label "type:docs" \
  --milestone "M1: Orchestrator" \
  --body "$(cat <<'EOF'
## Phase 1: Research Orchestrator (Weeks 3-5)

### Wave 1 (unblocked after BL-002)
- [ ] #XX [BL-001] Research Orchestrator Graph

### Wave 2 (unblocked after BL-001)
- [ ] #XX [BL-003] Web Research MCP Tools
- [ ] #XX [BL-022] Shared Data Brief
- [ ] #XX [BL-017] Meta-Reasoning Node

### Completion Criteria
- [ ] SSE stream shows full PLAN_CREATED -> SUBAGENT_* -> synthesis flow
- [ ] DataBrief populated in final graph state
- [ ] Meta-reasoning fires for complex queries, skips for simple
- [ ] All integration tests passing
EOF
)"
```

Create 5 epic issues (one per milestone). As issues are completed, check them off in the epic. The task list progress bar provides at-a-glance milestone completion tracking.

#### Layer 3: "Blocked by" Label Discipline

- When an issue's dependencies are NOT all closed, apply `status:blocked` label
- When all blocking issues close, remove `status:blocked` and apply `status:ready-to-start`
- This can be partially automated via GitHub Actions:

```yaml
# .github/workflows/dependency-check.yml
name: Dependency Check
on:
  issues:
    types: [closed]
jobs:
  unblock:
    runs-on: ubuntu-latest
    steps:
      - name: Check if closing this unblocks others
        uses: actions/github-script@v7
        with:
          script: |
            // Parse all open issues for "Blocked by: #N" references
            // If #N matches the just-closed issue, check if ALL blockers are now closed
            // If so, remove status:blocked and add status:ready-to-start
            // (Implementation left as exercise -- or use a community action)
```

#### Layer 4: PR-to-Issue Auto-Close

Use conventional branch naming and PR body references:

```
Branch: feat/BL-002-runevent-schema
PR body: Closes #12
```

When the PR merges, GitHub auto-closes #12 and the dependency check workflow fires.

#### Layer 5: Wave-Based Work Ordering

The `Wave` field on the project board provides a simple numeric ordering:

| Wave | Issues | Can Start When |
|------|--------|----------------|
| 0 | BL-002, BL-004, BL-008, BL-015, BL-012, BL-022 (design), BL-003 (API wrapper) | Immediately |
| 1 | BL-001, BL-007, BL-014, BL-020, BL-016 | Wave 0 items they depend on are done |
| 2 | BL-003 (integration), BL-017, BL-005, BL-006, BL-018, BL-021, BL-019 | Wave 0-1 items they depend on are done |
| 3 | BL-009, BL-010, BL-011, BL-013 | Wave 0-2 items they depend on are done |

In sprint planning, only pull from the lowest available wave with unblocked items.

### Dependency Graph Summary

```
Wave 0 (no deps or design-phase only):
  BL-002 ──┬──────────────────────────────────────────────────────┐
  BL-004 ──┤                                                      │
  BL-008   │ (weak dep on BL-015)                                 │
  BL-015   │ (independent)                                        │
  BL-012 ──┤ (needs Mig-0005c)                                    │
  BL-022   │ (design phase; integration wiring needs BL-001)      │
  BL-003   │ (API wrappers; integration wiring needs BL-001)      │
            │                                                      │
Wave 1:     │                                                      │
  BL-001 ◄─┤ (needs BL-002)                                      │
  BL-007 ◄─┤ (needs BL-002)                                      │
  BL-014 ◄─┤ (needs BL-002)                                      │
  BL-020 ◄─┤ (needs BL-002)                                      │
  BL-016 ◄─┤ (needs BL-002 + Mig-0005a)                          │
            │                                                      │
Wave 2:     │                                                      │
  BL-003 ◄─┤ (integration: needs BL-001)                         │
  BL-017 ◄─┤ (needs BL-001)                                      │
  BL-005 ◄─┤ (needs BL-001, BL-004, Mig-0005a)                   │
  BL-006 ◄─┤ (needs BL-001, Mig-0005a)                           │
  BL-018 ◄─┤ (needs BL-001, Mig-0005a)                           │
  BL-021 ◄─┤ (needs BL-001, BL-002)                              │
  BL-019 ◄─┤ (needs BL-004, BL-005)                              │
            │                                                      │
Wave 3:     │                                                      │
  BL-009 ◄──── (needs BL-004, BL-005)                            │
  BL-010 ◄──── (needs BL-006)                                    │
  BL-011 ◄──── (needs BL-003, BL-016)                            │
  BL-013 ◄──── (needs BL-012)                                    │
```

**Note on BL-016:** It depends on BL-002 (Wave 0) and Migration 0005a (Wave 0). BL-005 is a soft dependency for citation-binding integration testing only; service layer work can begin after BL-002 + Mig-0005a. In practice, treat as two sub-phases.

**Note on BL-003:** API wrappers (Brave/Jina) can be built and tested in Wave 0. Integration into research_worker_node requires BL-001 (Wave 2).

**Note on BL-022:** DataBrief schema design is Wave 0 (feeds into ResearchState design). Integration testing requires BL-001.

---

## 7. Machine-Readable Index

```json
{
  "metadata": {
    "document_id": "GIT-ISSUES",
    "version": 1,
    "date": "2026-02-18",
    "target_repo": "nyqst-intelli-230126",
    "total_issues": 22,
    "total_story_points": 72
  },
  "milestones": [
    {"id": "M0", "title": "M0: Foundation", "due_date": "2026-03-14", "story_points": 5},
    {"id": "M1", "title": "M1: Orchestrator", "due_date": "2026-04-04", "story_points": 16},
    {"id": "M2", "title": "M2: Deliverables", "due_date": "2026-04-25", "story_points": 18},
    {"id": "M3", "title": "M3: Frontend", "due_date": "2026-05-16", "story_points": 23},
    {"id": "M4", "title": "M4: Billing & Polish", "due_date": "2026-05-30", "story_points": 7}
  ],
  "issues": [
    {
      "bl_id": "BL-001",
      "title": "[BL-001] Research Orchestrator Graph",
      "labels": ["type:feature", "phase:1-orchestrator", "priority:critical-path", "track:orchestrator", "size:XL"],
      "milestone": "M1",
      "size_points": 8,
      "wave": 1,
      "blocked_by": ["BL-002"],
      "blocks": ["BL-003", "BL-005", "BL-006", "BL-017", "BL-018", "BL-021", "BL-022"],
      "has_sub_issues": true,
      "sub_issue_count": 5
    },
    {
      "bl_id": "BL-002",
      "title": "[BL-002] RunEvent Schema Extensions",
      "labels": ["type:infrastructure", "phase:0-foundation", "priority:critical-path", "track:infrastructure", "size:S"],
      "milestone": "M0",
      "size_points": 2,
      "wave": 0,
      "blocked_by": [],
      "blocks": ["BL-001", "BL-007", "BL-014", "BL-016", "BL-020", "BL-021"],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-003",
      "title": "[BL-003] Web Research MCP Tools",
      "labels": ["type:integration", "phase:1-orchestrator", "priority:critical-path", "track:orchestrator", "size:M"],
      "milestone": "M1",
      "size_points": 3,
      "wave": 2,
      "blocked_by": ["BL-001 (integration only)"],
      "blocks": ["BL-011"],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-004",
      "title": "[BL-004] NYQST Markup AST Schema",
      "labels": ["type:infrastructure", "phase:0-foundation", "priority:critical-path", "track:deliverables", "size:M"],
      "milestone": "M0",
      "size_points": 3,
      "wave": 0,
      "blocked_by": [],
      "blocks": ["BL-005", "BL-009", "BL-019"],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-005",
      "title": "[BL-005] Report Generation Node",
      "labels": ["type:feature", "phase:2-deliverables", "priority:critical-path", "track:deliverables", "size:L"],
      "milestone": "M2",
      "size_points": 5,
      "wave": 2,
      "blocked_by": ["BL-001", "BL-004", "Migration-0005a"],
      "blocks": ["BL-016", "BL-019", "BL-009"],
      "has_sub_issues": true,
      "sub_issue_count": 3
    },
    {
      "bl_id": "BL-006",
      "title": "[BL-006] Website Generation Pipeline",
      "labels": ["type:feature", "phase:2-deliverables", "priority:high", "track:deliverables", "size:L"],
      "milestone": "M2",
      "size_points": 5,
      "wave": 2,
      "blocked_by": ["BL-001", "Migration-0005a"],
      "blocks": ["BL-010"],
      "has_sub_issues": true,
      "sub_issue_count": 3
    },
    {
      "bl_id": "BL-007",
      "title": "[BL-007] PlanViewer Component",
      "labels": ["type:frontend", "phase:3-frontend", "priority:high", "track:frontend", "size:M"],
      "milestone": "M3",
      "size_points": 3,
      "wave": 1,
      "blocked_by": ["BL-002"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-008",
      "title": "[BL-008] DeliverableSelector Component",
      "labels": ["type:frontend", "phase:0-foundation", "priority:medium", "track:frontend", "size:S"],
      "milestone": "M0",
      "size_points": 2,
      "wave": 0,
      "blocked_by": ["BL-015 (weak)"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-009",
      "title": "[BL-009] ReportRenderer Component",
      "labels": ["type:frontend", "phase:3-frontend", "priority:critical-path", "track:frontend", "size:L"],
      "milestone": "M3",
      "size_points": 5,
      "wave": 3,
      "blocked_by": ["BL-004", "BL-005"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-010",
      "title": "[BL-010] WebsitePreview Component",
      "labels": ["type:frontend", "phase:3-frontend", "priority:medium", "track:frontend", "size:M"],
      "milestone": "M3",
      "size_points": 3,
      "wave": 3,
      "blocked_by": ["BL-006"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-011",
      "title": "[BL-011] Enhanced SourcesPanel",
      "labels": ["type:frontend", "phase:3-frontend", "priority:medium", "track:frontend", "size:M"],
      "milestone": "M3",
      "size_points": 3,
      "wave": 3,
      "blocked_by": ["BL-003", "BL-016"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-012",
      "title": "[BL-012] Billing System",
      "labels": ["type:billing", "phase:4-billing", "priority:high", "track:billing", "size:L"],
      "milestone": "M4",
      "size_points": 5,
      "wave": 0,
      "blocked_by": ["Migration-0005c"],
      "blocks": ["BL-013"],
      "has_sub_issues": true,
      "sub_issue_count": 4
    },
    {
      "bl_id": "BL-013",
      "title": "[BL-013] Quota Enforcement Middleware",
      "labels": ["type:billing", "phase:4-billing", "priority:high", "track:billing", "size:S"],
      "milestone": "M4",
      "size_points": 2,
      "wave": 3,
      "blocked_by": ["BL-012"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-014",
      "title": "[BL-014] Enhanced RunTimeline",
      "labels": ["type:frontend", "phase:3-frontend", "priority:medium", "track:frontend", "size:M"],
      "milestone": "M3",
      "size_points": 3,
      "wave": 1,
      "blocked_by": ["BL-002"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-015",
      "title": "[BL-015] DeliverableStore (Zustand)",
      "labels": ["type:frontend", "phase:0-foundation", "priority:medium", "track:frontend", "size:XS"],
      "milestone": "M0",
      "size_points": 1,
      "wave": 0,
      "blocked_by": [],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-016",
      "title": "[BL-016] Entity/Citation Substrate",
      "labels": ["type:feature", "phase:2-deliverables", "priority:high", "track:infrastructure", "size:M"],
      "milestone": "M2",
      "size_points": 3,
      "wave": 1,
      "blocked_by": ["BL-002", "Migration-0005a"],
      "blocks": ["BL-011"],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-017",
      "title": "[BL-017] Meta-Reasoning Node",
      "labels": ["type:feature", "phase:1-orchestrator", "priority:high", "track:orchestrator", "size:M"],
      "milestone": "M1",
      "size_points": 3,
      "wave": 2,
      "blocked_by": ["BL-001"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-018",
      "title": "[BL-018] Slides Deliverable Pipeline",
      "labels": ["type:feature", "phase:2-deliverables", "priority:medium", "track:deliverables", "size:M"],
      "milestone": "M2",
      "size_points": 3,
      "wave": 2,
      "blocked_by": ["BL-001", "Migration-0005a"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-019",
      "title": "[BL-019] Document Deliverable (PDF/DOCX Export)",
      "labels": ["type:feature", "phase:2-deliverables", "priority:medium", "track:deliverables", "size:M"],
      "milestone": "M2",
      "size_points": 3,
      "wave": 2,
      "blocked_by": ["BL-004", "BL-005"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-020",
      "title": "[BL-020] Generation Progress Overlay",
      "labels": ["type:frontend", "phase:3-frontend", "priority:high", "track:frontend", "size:M"],
      "milestone": "M3",
      "size_points": 3,
      "wave": 1,
      "blocked_by": ["BL-002"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-021",
      "title": "[BL-021] Clarification Flow",
      "labels": ["type:feature", "phase:3-frontend", "priority:medium", "track:orchestrator", "size:M"],
      "milestone": "M3",
      "size_points": 3,
      "wave": 2,
      "blocked_by": ["BL-001", "BL-002"],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    },
    {
      "bl_id": "BL-022",
      "title": "[BL-022] Shared Data Brief",
      "labels": ["type:feature", "phase:1-orchestrator", "priority:high", "track:orchestrator", "size:S"],
      "milestone": "M1",
      "size_points": 2,
      "wave": 0,
      "blocked_by": [],
      "blocks": [],
      "has_sub_issues": false,
      "sub_issue_count": 0
    }
  ],
  "waves": {
    "0": ["BL-002", "BL-004", "BL-008", "BL-015", "BL-012", "BL-022", "BL-003 (API wrapper)"],
    "1": ["BL-001", "BL-007", "BL-014", "BL-020", "BL-016"],
    "2": ["BL-003 (integration)", "BL-017", "BL-005", "BL-006", "BL-018", "BL-021", "BL-019"],
    "3": ["BL-009", "BL-010", "BL-011", "BL-013"]
  },
  "critical_path": ["BL-002", "BL-001", "BL-005", "BL-009"],
  "story_points_by_milestone": {
    "M0": 5,
    "M1": 16,
    "M2": 19,
    "M3": 23,
    "M4": 7
  },
  "story_points_by_track": {
    "orchestrator": 19,
    "frontend": 23,
    "billing": 7,
    "deliverables": 19,
    "infrastructure": 5
  }
}
```

---

## Appendix A: Complete Dependency Matrix

| BL-ID | Blocked By | Blocks | Wave | Phase | Size |
|-------|-----------|--------|------|-------|------|
| BL-001 | BL-002 | BL-003, BL-005, BL-006, BL-017, BL-018, BL-021, BL-022 | 1 | 1 | XL(8) |
| BL-002 | -- | BL-001, BL-007, BL-014, BL-016, BL-020, BL-021 | 0 | 0 | S(2) |
| BL-003 | None (standalone); BL-001 (integration) | BL-011 | 0/2 | 1 | M(3) |
| BL-004 | -- | BL-005, BL-009, BL-019 | 0 | 0 | M(3) |
| BL-005 | BL-001, BL-004, Mig-0005a | BL-016, BL-019, BL-009 | 2 | 2 | L(5) |
| BL-006 | BL-001, Mig-0005a | BL-010 | 2 | 2 | L(5) |
| BL-007 | BL-002 | -- | 1 | 3 | M(3) |
| BL-008 | BL-015 (weak) | -- | 0 | 0 | S(2) |
| BL-009 | BL-004, BL-005 | -- | 3 | 3 | L(5) |
| BL-010 | BL-006 | -- | 3 | 3 | M(3) |
| BL-011 | BL-003, BL-016 | -- | 3 | 3 | M(3) |
| BL-012 | Mig-0005c | BL-013 | 0 | 4 | L(5) |
| BL-013 | BL-012 | -- | 3 | 4 | S(2) |
| BL-014 | BL-002 | -- | 1 | 3 | M(3) |
| BL-015 | -- | -- | 0 | 0 | XS(1) |
| BL-016 | BL-002, Mig-0005a | BL-011 | 1* | 2 | M(3) |
| BL-017 | BL-001 | -- | 2 | 1 | M(3) |
| BL-018 | BL-001, Mig-0005a | -- | 2 | 2 | M(3) |
| BL-019 | BL-004, BL-005 | -- | 2 | 2 | M(3) |
| BL-020 | BL-002 | -- | 1 | 3 | M(3) |
| BL-021 | BL-001, BL-002 | -- | 2 | 3 | M(3) |
| BL-022 | None (design phase) | -- | 0 | 1 | S(2) |

*BL-016 is Wave 1 for the service scaffolding (needs BL-002 only) but Wave 2+ for citation binding (needs BL-005). In practice, start early and complete after BL-005 lands.

**Totals:** 22 issues, 70 story points across 5 milestones and 4 dependency waves.

---

## Appendix B: Quick Reference Card

### Sprint Planning Checklist

1. Check milestone due date -- are we on track?
2. Look at Wave 0/1/2/3 -- what is unblocked?
3. Look at critical path items first (BL-002 -> BL-001 -> BL-005 -> BL-009)
4. Assign by track: orchestrator dev gets BL-001/003/017/022, frontend dev gets BL-007/008/009/010, etc.
5. Check `status:blocked` label -- anything newly unblocked?
6. Update epic tracking issues with checkmarks

### Branch Naming Convention

```
feat/BL-002-runevent-schema
feat/BL-001a-research-state-extension
feat/BL-005-report-generation
fix/BL-009-chart-rendering
```

### PR Title Convention

```
feat(BL-002): add 19 new RunEvent types to schema
feat(BL-001): extend research orchestrator with fan-out
fix(BL-009): handle unknown node types in ReportRenderer
```

### PR Body Convention

```markdown
## Summary
[What changed and why]

## Backlog Item
Closes #XX (BL-YYY)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration test passes
- [ ] Existing tests unaffected

## Dependencies
Unblocks: #AA (BL-ZZZ), #BB (BL-WWW)
```
