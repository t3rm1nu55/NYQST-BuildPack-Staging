# NYQST Platform — Production Intelligence Build Guide v5

> **What this is:** The comprehensive build specification for the NYQST DocuIntelli platform (2,338 dense lines), distilled from reverse-engineering Superagent (production), analyzing Dify (competitor), extracting DocuIntelli domain intelligence (54 document types, 16 frameworks, 17 mental models), and deep exploration of the existing dev repo. Every pattern here was extracted from shipping product — not from library tutorials.
>
> **How to use:**
> 1. **Pattern Files** (3,256 lines) contain ALL code patterns — schemas, components, services, store shapes. Read the referenced section before implementing.
> 2. **This document** provides: platform architecture + 6 domain modules, 13 knowledge domains (A-M), Dify competitive intel, 8 frontend recipes, 8 view specs + user flows, build sequence, verification, and 4 appendices.
> 3. **DON'T implement** without reading the referenced pattern file section first.
>
> **Sections A-G:** Platform primitives (streaming, orchestration, GenUI, entity/citation, deliverables, billing, auth)
> **Section H:** DocuIntelli domain intelligence (54 doc types, 16 frameworks, 17 mental models, full LangGraph integration)
> **Sections I-K:** Backend service patterns (22+ event payloads), frontend component patterns (stores, GML, charts), integration flows (4-surface rollout, entity lifecycle, billing, deliverables)
> **Section L:** 51 identified gaps (8 critical, 17 high, 26 medium/low)
> **Section M:** Quality systems (healer constraints, multi-stage pipelines, DataBrief)
>
> **Dev repo:** `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126`

---

## Platform Architecture & Domain Modules

### Three-Layer Architecture

```
Layer 1: PLATFORM PRIMITIVES (10) — built and proven via Research Module
  Agentic Runtime, GENUI, MCP Tool Layer, Document Management, Provenance & Citation,
  Context Engineering, LLM Integration, Reactive State & Streaming, Agent Management, Billing & Metering

Layer 2: DOMAIN MODULES (6) — each runs ON Layer 1, adds domain-specific agents/schemas/tools/UI
  Research Module, Lease CDs, Debt MVP, PropSygnal (5 product areas), RegSygnal, DocuIntelli

Layer 3: ENTERPRISE SHELL — SSO/OIDC, RBAC/ABAC, multi-tenant isolation, data residency, enterprise billing
```

Every domain module inherits all 10 primitives without reimplementation. Modules add: domain-specific agent graphs, domain-specific MCP tools, domain-specific Pydantic schemas, domain-specific UI components, domain-specific policy template selection, domain-specific RunEvent emissions, domain-specific artifact storage.

### Module 1: Research Module (IN BUILD — v1 platform proof)

**Purpose:** Multi-format research deliverables engine. Proves all 10 Layer 1 primitives work end-to-end. NOT the commercial product — it's the test harness that exercises every platform capability before domain modules run on them.

**What it does:** User query → parallel agent fan-out (LangGraph Send()) → N research workers with web search + RAG → DataBrief synthesis → multi-format deliverable generation (Report, Website, Slides, Document) with full citation provenance.

**Unique to Research:** Only module exercising all 10 primitives simultaneously in a single run (13+ parallel workstreams, 23+ subtasks, all deliverable types, full streaming + citation).

**Status:** 7-week critical path. Existing 3-node ResearchAssistantGraph; extending with Send() fan-out, planner, meta-reasoning.

**Key decisions:** DEC-012 (extend graph), DEC-013 (Send() fan-out), DEC-015a/b (JSON AST + rehype), DEC-021 (dual SSE), DEC-043 (ReportPanel), DEC-046 (MCP search), DEC-048 (Plotly charts).

### Module 2: Lease Critical Dates (V1 WEDGE — post-platform)

**Purpose:** Commercial entry point. Extract critical date events from lease documents (break options, rent reviews, expiries, renewals, notice periods) → live event calendar with deadline alerts.

**Business case:** Missing a break option costs £500k–£2M per event. A portfolio of 500 leases contains 2,000+ events buried in documents. The "aha moment": user uploads leases, discovers break options they didn't have calendared.

**Target users:** Asset Managers (£500M–£2B portfolio, 10–30 assets), Property Managers, Financial Controllers.

**Key capabilities (V1):**
- PDF/Word/image ingestion with OCR; lease document identification
- Break option extraction (date, notice period, conditions, party) with confidence scores
- Rent reviews, expiries, renewal options — each with source citation to page + paragraph
- Event calendar, deadline calculation, configurable alert rules, email notifications
- Verification UX: click extraction → see highlighted source in document viewer → confirm/correct

**Platform primitives consumed:** All 10 + **Event Engine** (calendar triggers, deadline calc, alerts — NEW primitive beyond Research) + **Full Doc Processing** (Docling full pipeline with OCR, DocIR — Research only uses partial RAG flow).

**Expansion path:** V1 Dates → V2 Full Lease Extraction → V3 Covenant Monitoring → V4 DD Acceleration → V5 Investor Reporting → V6 Platform.

**Status:** Post-v1. Not yet designed in detail. Requires platform primitives (current 7-week build) + Event Engine + Full Doc Processing.

### Module 3: Debt MVP (FIRST COMMERCIAL PRODUCT — Q2 2026)

**Purpose:** Single-asset covenant monitoring with deterministic calculation engines and evidence trails. First PropSygnal product to ship commercially.

**Target users:** Asset Managers (covenant compliance across portfolio), Financial Controllers (lender submissions, audit), Credit Analysts.

**Key capabilities:**
- Rent roll + operating statement extraction (95%+ accuracy) with per-value confidence scores + source citation
- Deterministic covenant calculations (LLMs extract, engines compute — 100% accuracy guarantee):

| Covenant | Formula | Typical Threshold |
|----------|---------|-------------------|
| DSCR | NOI / Debt Service | ≥ 1.20x |
| LTV | Loan Balance / Property Value | ≤ 65% |
| ICR | EBITDA / Interest Expense | ≥ 1.50x |
| Debt Yield | NOI / Loan Balance | ≥ 8% |

- Evidence chain: result → formula → each input → source document → page → line number
- Covenant compliance reports (PASS/FAIL), headroom analysis, trend tracking, early warning alerts
- Audit-ready lender packs in Excel, generated in <30 minutes

**Platform primitives consumed:** All 10 + **Deterministic Calc Engine** (versioned, deterministic, LLM-free — ADR principle: "AI for translation, deterministic engines for truth") + **Event Engine** (breach alerts, risk monitoring) + **Full Doc Processing** (rent roll parsing, operating statement OCR).

**Success metrics:** 100% calculation accuracy, 95%+ extraction accuracy, <30min lender packs, 80% time savings vs manual.

**Status:** Q2 2026 target. Post-platform-primitive build.

### Module 4: PropSygnal (PRIMARY COMMERCIAL PRODUCT — 5 areas)

**Purpose:** Full CRE investment lifecycle intelligence platform: acquisition → asset management → exit. Single source of truth + complete evidence trails. ~$200k/annum.

**Five product areas:**

| Area | Phase | Target | Key Outputs |
|------|-------|--------|-------------|
| Debt & Credit | Q2 2026 (first) | Asset Mgr, Financial Controller | Covenant calcs, lender packs, breach alerts |
| Asset Management | Q3 2026 | Asset Mgr, Property Mgr | Quarterly reports, business plans, budget variance, Building Passport |
| Investment & Acquisitions | Q3 2026 | Investment Analyst, Director | Deal screening, DD workflows, IC memos, comparables |
| Development & PM | Q4 2026 | Development Manager | Cost/programme/risk dashboards, BSA compliance packs |
| Property Management | 2027 | Property Mgr | Leasing, tenant mgmt, service charge, compliance, maintenance |

**Lifecycle architecture:**
```
Yielding:    Investment → Asset Management → Property Management (Debt throughout)
Development: Investment → Development & PM → Asset Management → Property Management (Debt throughout)
```

**Two implementation packages:**
- **Accelerate:** High-velocity acquisition orgs, adaptive fluid ontology, throughput focus ("Capture opportunity")
- **Preserve:** Institutional asset management, rigid standard-compliant ontology, audit readiness ("Defend the asset")

**Additional Layer 2 extensions beyond Debt MVP:** External market data tools (CoStar, Bloomberg — Phase 3), BSA document processing, planning portal integrations, multi-asset dashboards + batch operations.

**Key decisions:** ADR-001 (domain-first data models — CRE entities are NYQST-native, CDM is integration layer), ADR-010 (Neo4j Aura for CRE knowledge graph).

### Module 5: RegSygnal (FINANCIAL SERVICES REGULATORY INTELLIGENCE)

**Purpose:** Transform regulatory documents into executable compliance logic. Manages the full chain: regulatory text → modelled requirements → captured ambiguity → resolved interpretations → tested, traced implementation.

**Core departure:** Regulations are treated as specifications to be modelled, tested, and verified — NOT documents to be read and interpreted by humans. Traditional: Regulation → Human reads → Human interprets → Human implements (interpretation varies, knowledge leaves with people, audit requires reconstructing reasoning). RegSygnal: Regulation → Model → Capture ambiguity → Resolve with evidence → Implement with traceability (interpretation explicit + versioned, knowledge persists, audit built-in).

**Target users:** Compliance Officers (10-20 yrs), Regulatory Analysts (EMIR, MiFID II specialists), Technology Leads / RegTech Architects, Internal Audit, Risk Managers.

**Three product areas:**

**Regulatory Intelligence:** Regulatory corpus ingestion (EMIR, MiFID II, SFTR, Basel III, BCBS 239, ISDA, UK law); requirement extraction + classification (compiler-style: undefined terms, missing specificity, inconsistencies); change detection + impact analysis; cross-regulation mapping (overlaps, conflicts, dependencies); corpus scraping tools.

**Reporting Validation:** Report schema validation against submission requirements; data quality checks; reconciliation; exception tracking; submission audit trails.

**Compliance Modelling (most distinctive):** Requirement decomposition into atomic testable assertions; ambiguity capture + resolution tracking; logic modelling (verifiable rules, not text); implementation mapping (requirement → controls → systems); gap analysis; Domain Model Tests (universally applicable test cases); Code Tests linked to requirements.

**Common Plane:** Project/Analysis tracking, ISDA CDM/DRR import, Problems/Issues/Commits (git-style), Graph Canvas, Plan + Claims Reviews.

**Platform primitives consumed:** All 10 + **Event Engine** (regulatory change alerts, requirement impact notifications) + **Full Doc Processing** (regulatory corpus ingestion, XML/XSD handling, EU law packaging).

**Status:** Planning. Architecture + initial regulatory domain models Q2 2026, pilot regulatory framework Q3 2026, reporting validation Q4 2026, full compliance modelling 2027.

### Module 6: DocuIntelli (CORPUS INTELLIGENCE — described in Section H)

**Purpose:** Analyze unknown document sets without methodological bias. 5-phase discovery workflow (Observe → Select → Discover → Weight → Apply) with 54 document types, 16 analytical frameworks, 17 mental models.

**Core principle:** "Observe before interpreting. The method should not determine the findings."

**Target users:** Regulated enterprises performing due diligence, audit, dispute resolution, fraud investigation, contract portfolio analysis on unknown document collections.

**Full spec in Section H.** New platform requirements: 7 new entity types, new GML tag family (13 tags), BL-023 through BL-029, 40+ new MCP tools.

**Status:** Skills extract and platform synthesis complete. Not yet in implementation planning. Second domain module after Research v1.

### Module Summary

| Module | Status | Role | Layer 2 Extensions | Timeline |
|--------|--------|------|--------------------|----------|
| Research | In build (7wk) | Platform proof harness | None (proves all 10 primitives) | Now |
| Lease CDs | Post-v1 | Commercial wedge | Event Engine, Full Doc Processing | Post-v1 |
| Debt MVP | Q2 2026 | First commercial product | Deterministic Calc, Event Engine, Full Doc Processing | Q2 2026 |
| PropSygnal | Multi-phase | Primary CRE product (5 areas) | All Debt extensions + market data, BSA, multi-asset | Q2 2026→2027 |
| RegSygnal | Planning | FinServ regulatory intelligence | Event Engine, Full Doc Processing (regulatory) | Q2→2027 |
| DocuIntelli | Extract done | Corpus intelligence | Full Doc Processing (54 types), 7 entity types, 13 GML tags | Post-v1 |

### Non-Negotiable Architectural Constraints (ALL modules)

1. **Run ledger is canonical audit record** — not LangGraph checkpoints, not chat logs
2. **Artifacts are immutable + content-addressed** — versioning via new artifacts + pointer advancement
3. **Provenance is mandatory** — every extracted value traces to source document, page, span
4. **Deterministic engines for calculations** — LLMs extract, engines compute (DSCR is never an LLM output)
5. **Agents operate within policy boundaries** — exploratory / standard / regulated / audit_critical (ADR-009)
6. **MCP as universal tool protocol** — `{domain}.{resource}.{action}` namespace
7. **DocIR as document interface** — all modules consume canonical DocIR, not parser-specific formats
8. **Index Service profiles, not knobs** — modules select profiles (`docs.citation_strict`), never tune chunking
9. **Never confidently wrong** — hallucinations are career-ending + liability-creating; top non-negotiable across all personas

---

## Pattern File Index

These three files contain the full production code patterns. Every section in this spec references them.

| File | Lines | Contains |
|------|-------|----------|
| `docs/design-reconstruction/03-patterns/BACKEND-PATTERNS.md` | 860 | Pydantic schemas (PlanSet, Entity, Message, RunEvents), SQLAlchemy models (Artifact, Subscription, UsageRecord), LangGraph patterns (state, fan-out, structured output, per-node sessions), service layer (emit_run_event, BillingService, EntityService), API routes (SSE streaming, Stripe webhook, quota middleware, dual-auth) |
| `docs/design-reconstruction/03-patterns/FRONTEND-PATTERNS.md` | 1536 | GenUI component registry (27 primitives + 17 composed patterns), GenUI renderer (descriptor engine with conditional/repeat/binding), Zustand stores (DeliverableStore, RunStore, PlanStore), rehype-to-JSX pipeline (18 GML tags → React), chart rendering (10 Plotly types + HSLA palette), SSE event consumption hook (useRunStream), component specs (DeliverableSelector, PlanViewer, WebsitePreview, GenerationOverlay) |
| `docs/design-reconstruction/03-patterns/INTEGRATION-PATTERNS.md` | 860 | End-to-end event chain (RunEventType → Pydantic → TypeScript → SSE → Zustand), 4-surface event rollout checklist, entity lifecycle (9-step creation → citation → display), billing flow (6-step from run start → Stripe invoice), deliverable pipeline (8-step user selection → artifact → UI), authentication flow (JWT + API key dual-mode), co-generation flow (website + report via arq), SSE streaming lifecycle (sequence diagram), migration sequencing (0005a/b/c) |

### Section Cross-Reference (Pattern File → Topic)

| Topic | Backend § | Frontend § | Integration § |
|-------|-----------|------------|---------------|
| PlanSet/Plan/PlanTask | §1.1 | §5.3 | — |
| RunEvent payloads (22 types) | §1.2 | — | §1.2 |
| Entity schema (12 types) | §1.2 (Entity) | — | §3 |
| Message schema (26 fields) | §1.2 (Message) | — | — |
| DataBrief | §1.1 | — | §5.1 (Step 5) |
| Artifact extension | §2.1 | — | §5.2 |
| Billing tables | §2.2 | — | §4 |
| LangGraph state + fan-out | §3.1, §3.2 | — | — |
| Structured output | §3.3 | — | — |
| Per-node async sessions | §3.4 | — | — |
| Event emission + PG NOTIFY | §4.1 | §8 (useRunStream) | §1.1, §8.1 |
| Billing service + quota | §4.2, §5.3 | — | §4 |
| Entity service | §4.3 | §3.2 (entity store) | §3 |
| SSE streaming route | §5.1 | — | §8 |
| Stripe webhook (raw body) | §5.2 | — | §4 |
| Dual-mode auth | §5.4 | — | §6 |
| GenUI 27 primitives | — | §1.1-§1.7 | — |
| GenUI 17 patterns | — | §3.1-§3.4 | — |
| GenUI renderer engine | — | §2.1-§2.2 | — |
| GenUI streaming tools | — | §4 | — |
| Zustand stores (3) | — | §5.1-§5.3 | — |
| rehype-to-JSX pipeline | — | §6.1-§6.2 | — |
| GML tag implementations | — | §6.2 | — |
| Chart rendering (10 types) | — | §7.1-§7.2 | — |
| SSE consumption hook | — | §8 | §8.2 |
| Citation buffer | — | — | §3.3 |
| Deliverable flow | — | — | §5.1 |
| Co-generation (arq) | — | — | §7 |
| 4-surface rollout checklist | — | — | §2 |
| Migration sequencing | — | — | §9 |

---

## Part 1: Production Knowledge by Domain

Each domain section identifies: (1) what's NOVEL (can't look up, must understand deeply), (2) what's GUIDED (follow library docs + apply specifics), (3) key gotchas.

---

### A. STREAMING PROTOCOL — NOVEL

**Why it's novel:** Superagent does NOT use native EventSource/SSE. It uses NDJSON over chunked HTTP with `fetch()` + `ReadableStream`. This is undocumented in any library and changes the entire transport layer. NYQST adapts this to PG LISTEN/NOTIFY (already working in platform).

**Pattern files:** Backend §4.1 (emit_run_event), §5.1 (SSE route); Frontend §8 (useRunStream); Integration §1 (event chain), §8 (lifecycle)

**22 production-confirmed event types** in 7 categories:

| Category | Types | Terminal? |
|----------|-------|-----------|
| Lifecycle | `stream_start`, `heartbeat`, `done`, `ERROR` | done/ERROR = YES |
| Text | `message_delta`, `ai_message`, `message_is_answer`, `chat_title_generated` | No |
| Planning | `task_update`, `pending_sources`, `references_found` | No |
| Tool Exec | `node_tools_execution_start`, `node_tool_event`, `update_subagent_current_action` | No |
| Report | `node_report_preview_start`, `node_report_preview_delta`, `node_report_preview_done` | No |
| Browser | `browser_use_start`, `browser_use_stop`, `browser_use_await_user_input` | No |
| Clarification | `clarification_needed`, `update_message_clarification_message` | clarification_needed = YES |

**Every payload shape** is in Backend §1.2 (Pydantic) and Integration §1.2 (TypeScript union).

**5 critical production behaviors** (not in any docs):

1. **NDJSON envelope:** `{"data": {...}, "timestamp": ms}` — each line is one JSON object terminated by `\n`, NOT SSE `data:` prefix. NYQST adaptation: use standard SSE `data:` prefix (PG LISTEN/NOTIFY delivers raw strings).

2. **Report delta accumulation:** Client concatenates `node_report_preview_delta.delta` into buffer. When `node_report_preview_done` arrives, its `content` field **REPLACES the entire buffer** — do NOT append.

3. **Heartbeat:** Server sends every 20s on idle. Client watchdog at 30s. Reconnection: exponential backoff `min(1000 * 2^attempt, 30000)`, max 5 attempts.

4. **Dual-stream architecture (DEC-021):**
   - Chat stream: `/api/chat/message/stream` → text deltas, final message, clarification (per user→AI turn)
   - Run stream: `/api/run/{run_id}/stream` → planning, tools, report preview, browser (per run, spans turns)

5. **`done` event includes `has_async_entities_pending: bool`** — tells frontend to keep polling for async entity completion (website co-generation via arq). Frontend must NOT show "complete" state until all pending entities resolve.

**4-surface rollout checklist** (Integration §2): Every new event type requires synchronized changes across: (1) Python enum, (2) Pydantic payload, (3) TypeScript union type, (4) useRunStream handler + Zustand update.

---

### B. ORCHESTRATION & PLANNING — NOVEL

**Why it's novel:** The PlanSet → Plan → PlanTask hierarchy uses linked-list ordering (not array indices), dynamic `Send()` fan-out (LangGraph's newest API), and a meta-reasoning loop that adaptively re-plans on data gaps. No library tutorial covers this — it's the critical platform gap.

**Pattern files:** Backend §1.1 (schemas), §3.1-§3.4 (LangGraph patterns); Frontend §5.3 (PlanStore); Integration §5.1 (deliverable pipeline)

**PlanSet linked-list ordering:**
```
PlanSet.plans: Dict[plan_id → Plan]
Plan.plan_tasks: Dict[task_id → PlanTask]
Plan.previous_plan_id → next plan in chain (NOT array index)
PlanTask.previous_task_id → next task in chain (NOT array index)
```
Ordered traversal: follow `previous_plan_id` / `previous_task_id` chains. Frontend must reconstruct display order from linked list. This is an intentional design — allows plans to be extended without array reindexing.

**Send() fan-out dispatch** (Backend §3.2):
- `Send()` ONLY valid from conditional edges, NOT from nodes
- Parallel nodes share a SNAPSHOT of state — they don't see each other's writes
- Each node MUST use its own `AsyncSession` from `async_sessionmaker(expire_on_commit=False)` (DEC-051, Backend §3.4)
- Budget enforcement: `cost_cents_spent: Annotated[int, operator.add]` as LangGraph state accumulator
- $2/run hard limit (DEC-045) — conditional edge checks after each worker completion

**Graph topology** (Backend §3.2):
```
START → planner → dispatch →(Send)→ research_executor[] → fan_in → synthesize → report_generator → END
```

**Meta-reasoning** (deferred to Wave 2): Post-synthesis quality check that reviews aggregated results, identifies gaps, and optionally triggers additional research round. Latency: 30-60s (DEC-003: worth it for quality).

**DataBrief pattern** (Backend §1.1, Integration §5.1 Step 5): Single structured object that feeds ALL downstream generators. Ensures numerical consistency across outputs (e.g., "MSFT $281.7B" appears identically in report, website, and slides). Created by `synthesis_node`, consumed by `report_generator_node`, `website_generator_node`, `slides_generator_node`.

**Follow this guide + specifics:**
- LangGraph Send() tutorial: https://langchain-ai.github.io/langgraph/how-tos/map-reduce/
- Apply: per-node sessions (DEC-051), budget accumulator, PlanSet emission as task_update events
- LangGraph structured output: https://python.langchain.com/docs/how_to/structured_output/
- Apply: ALL JSON-generating nodes use `llm.with_structured_output(PydanticModel)` (DEC-050)

---

### C. GENERATIVE UI — NOVEL

**Why it's novel:** NYQST implements a two-tier rendering system: (1) a GenUI descriptor engine with 27 primitives + 17 composed patterns for dynamic UI generation, and (2) an 18-tag GML (Generative Markup Language) system for report rendering via rehype-to-JSX. Neither exists in any library — both are fully specified in our reconstruction.

**Pattern files:** Frontend §1-§4 (GenUI), §6 (rehype pipeline), §7 (charts)

#### C.1 GenUI Component System (27 + 17)

Full specs in Frontend §1.1-§1.7 (27 primitives) and §3.1-§3.4 (17 patterns).

**27 Primitives** organized in 6 categories:
- **Primitive** (8): Text, Heading, Button, Badge, Avatar, Icon, Divider, Spacer
- **Feedback** (5): Skeleton, Spinner, StatusDot, Progress, Toast, EmptyState
- **Container** (7): Card, Row, Column, Grid, ScrollArea, Collapsible, Modal, Tabs
- **Data** (4): Metric, Table, Chart (Plotly wrapper), Markdown
- **Media** (2): Iframe, Image
- **Form** (1): TextInput

**17 Composed Patterns** (Frontend §3):
- **Chat** (3): ChatMessage, ChatInput, ChatList
- **Report** (3): ReportHeader, InsightCallout, SourceCard
- **Progress** (3): PlanProgress, BrowserAgentBanner, FileCard
- **Chrome** (2): PageHeader, NavSidebar
- **Deliverable** (2): WebsitePreview, ClarificationRequest
- **Billing** (1): UsageMeter
- **Data** (3): MetricGrid, DataTable, ChartPanel

**Descriptor engine** (Frontend §2): JSON-driven rendering with:
- `when` / `unless` for conditional rendering
- `bind` for data binding
- `repeat` for array iteration
- `on` for event binding
- Zod schema validation per component

**7 Streaming Tools** (Frontend §4): Server-side tools that trigger client-side GenUI rendering:
- `updateResearchPlan` → PlanProgress pattern
- `streamReportSection` → GML content
- `reportSources` → SourceCard pattern
- `askClarification` → ClarificationRequest (client-side tool, waits for `addToolOutput()`)
- `browserAgentAction` → BrowserAgentBanner
- `setChatTitle` → title update
- `renderUI` → universal component descriptor

#### C.2 GML Tag System (18 tags)

Full implementations in Frontend §6.2.

| Category | Tags |
|----------|------|
| Layout | `gml-row`, `gml-primarycolumn`, `gml-sidebarcolumn`, `gml-halfcolumn`, `gml-chartcontainer` |
| Content | `gml-blockquote`, `gml-header-elt` |
| Metrics | `gml-infoblockmetric`, `gml-infoblockevent`, `gml-infoblockstockticker` |
| Media | `gml-downloadfile`, `gml-viewreport`, `gml-viewwebsite`, `gml-viewpresentation`, `gml-viewgenerateddocument` |
| Annotation | `gml-gradientinsightbox`, `gml-inlinecitation` |
| Generic | `gml-components` |

**Healer algorithm** (MUST implement — Backend §1.2 references, QUALITY-METHODS.md has full spec):
```
WIDGET_WIDTHS = {
    "gml-chartcontainer": ["primary"],
    "gml-infoblockmetric": ["sidebar"],
    "gml-halfcolumn": ["full_row"],
    "gml-inlinecitation": [],   # unrestricted
    "gml-row": [],              # unrestricted
}
Walk AST → check ancestor constraints → collect mutations → apply in reverse order (index stability)
Actions: HOIST (move to valid parent) or REMOVE (discard)
```

**DEC-043:** GML rendered in separate ReportPanel, NOT in chat Thread. Chat uses `<answer>...</answer>` XML wrapper (DEC-022).

#### C.3 Chart Rendering (10 types)

Full Plotly specs in Frontend §7.

10 chart types: bar, scatter, line, bubble, histogram, box, candlestick, stacked_bar, clustered_column, donut.

**DEC-048:** Plotly.js required (NOT Recharts) — candlestick charts need financial viz support.

HSLA color palette (Frontend §7.1):
```
blue:   hsla(217, 91%, 60%, 0.8)    green:  hsla(142, 71%, 45%, 0.8)
amber:  hsla(38, 92%, 50%, 0.8)     red:    hsla(0, 84%, 60%, 0.8)
purple: hsla(271, 76%, 53%, 0.8)    cyan:   hsla(189, 94%, 43%, 0.8)
orange: hsla(25, 95%, 53%, 0.8)     gray:   hsla(220, 9%, 46%, 0.8)
```

**Donut palette (ordered):** `['hsla(217,91%,60%,1)', 'hsla(160,84%,39%,1)', 'hsla(38,92%,50%,1)', 'hsla(0,84%,60%,1)', 'hsla(259,84%,60%,1)', 'hsla(326,86%,59%,1)']`
**Line sentiment:** positive=`hsla(160,84%,39%,1)` (green), negative=`hsla(0,84%,60%,1)` (red)

**Per-type Plotly trace shapes** (compact — use these exact structures):
```
bar:              traces:[{name,x:string[],y:number[],type:'bar',marker:{color}}] layout:{barmode:'group'}
line:             traces:[{name,x:date[],y:number[],mode:'lines+markers',line:{color,width:2}}] layout:{hovermode:'x unified'}
scatter:          traces:[{name,x:number[],y:number[],mode:'markers',marker:{size:10,color,opacity:0.7}}]
bubble:           traces:[{name,x:number[],y:number[],z:number[],mode:'markers',marker:{size:z-derived,color:[]}}]
histogram:        traces:[{name,x:number[],type:'histogram',nbinsx:10}] layout:{barmode:'overlay'}
box:              traces:[{name,y:number[],type:'box'}] layout:{boxmode:'group'}
candlestick:      traces:[{name,x:date[],open:number[],high:number[],low:number[],close:number[],type:'candlestick'}]
stacked_bar:      traces:[{name,x:string[],y:number[],type:'bar',stackgroup:'1'}] layout:{barmode:'stack'}
clustered_column: traces:[{name:'North',x:string[],y:number[],type:'bar'},{name:'South',...}] layout:{barmode:'group'}
donut:            traces:[{labels:string[],values:number[],type:'pie',hole:0.4,marker:{colors:donutPalette}}]
```

**Chart Zod hierarchy** (from extraction — used for validation):
```typescript
DataTraceSchema: { name, x:array, y:array, z?:array, mode?, type?, marker?:{size,color,opacity,symbol}, line?:{color,width,dash}, fill?, fillcolor?, text?, textposition?, hovertemplate?, stackgroup?, orientation? }
AxisConfigSchema: { title?:{text}, type?:'linear'|'log'|'category'|'date', autotick?, dtick?, tickformat?, tickangle?, showgrid?, gridwidth?, gridcolor?, zeroline?, showline?, linewidth?, linecolor?, mirror? }
LayoutSchema:     { title?:TitleConfig, xaxis?:AxisConfig, yaxis?:AxisConfig, legend?:LegendConfig, margin?:{l,r,t,b,pad}, paper_bgcolor?, plot_bgcolor?, font?:{family,size,color}, height?, width?, hovermode?, showlegend?, barmode?, boxmode? }
ChartObjectSchema: { traces: DataTraceSchema[], layout: LayoutSchema }
```

#### C.4 GenUI Primitive Zod Schemas (all 27)

Every primitive has a strict Zod schema. Key schemas (field names exact):
```
Row:        { gap:'0'|'1'|'2'|'3'|'4'|'6'|'8', justify?:'start'|'center'|'between'|'around'|'evenly', align?:'start'|'center'|'end'|'stretch', wrap?:boolean }
Column:     { gap, align?, justify? }  (same enums as Row)
Grid:       { cols:int, gap }
Text:       { content:string, variant?:'body'|'caption'|'mono', weight?:'regular'|'medium'|'semibold'|'bold', color?:string, align?:'left'|'center'|'right' }
Heading:    { content:string, level:'h1'..'h6', color? }
Button:     { label:string, variant?:'primary'|'secondary'|'ghost'|'destructive', icon?:string, disabled?:boolean, action:string }
Badge:      { label:string, variant?:'default'|'secondary'|'outline'|'destructive' }
Card:       { title?:string, subtitle?:string, border?:boolean, padding?:'none'|'sm'|'md'|'lg' }
Metric:     { label:string, value:string|number, unit?:string, trend?:'up'|'down'|'stable', trendPercent?:number }
Table:      { columns:[{key,label,align?,width?}], rows:[Record<any>], striped?:boolean, hover?:boolean }
Chart:      { type:'bar'|'line'|...(10 types), data:{traces:any[],layout:any}, height?:string, responsive?:boolean }
TextInput:  { name:string, placeholder?, value?, disabled?, type?:'text'|'password'|'email'|'number' }
Tabs:       { tabs:[{id,label,badge?}], activeTab:string, variant?:'pill'|'underline' }
Modal:      { title:string, maxWidth?:'sm'|'md'|'lg'|'xl'|'2xl', closeButton?:boolean }
Skeleton:   { height:'h-4'|'h-8'|'h-12'|'h-20', width?:string, count?:number }
Progress:   { value:number(0-100), label?:string, color?:string }
StatusDot:  { status:'success'|'pending'|'error'|'warning', label?:string }
Toast:      { message:string, type:'success'|'error'|'warning'|'info', duration?:number }
Iframe:     { src:string(url), title?:string, height?:string, sandbox?:boolean }
Avatar:     { src?:string, name?:string, size?:'sm'|'md'|'lg' }
Markdown:   { content:string, sanitize?:boolean }
Divider:    { orientation?:'horizontal'|'vertical', margin?:'sm'|'md'|'lg' }
Spacer:     { size?:'xs'|'sm'|'md'|'lg'|'xl'|'2xl' }
Icon:       { name:string, size?:'xs'|'sm'|'md'|'lg'|'xl', color?:string }
Switch:     { name:string, label?:string, description?:string, checked:boolean }
ScrollArea: { direction?:'vertical'|'horizontal'|'both', hideScrollbar?:boolean }
Collapsible:{ title:string, defaultOpen?:boolean }
EmptyState: { icon?:string, title:string, description?:string }
Spinner:    { size?:'sm'|'md'|'lg', color?:string }
```

#### C.5 ComponentDescriptor Engine

```typescript
interface ComponentDescriptor {
  type: string;               // Registry key: 'Row','Column','Text','Chart',...
  props: Record<string, any>; // Raw values OR state path strings ('$path.to.value')
  children?: ComponentDescriptor[];
  className?: string;
}

// State path resolver — '$user.name' → resolves against runtime state
function resolveStatePath(path: string, state: any): any {
  if (!path.startsWith('$')) return path;
  const segments = path.slice(1).split('.');
  let current = state;
  for (const seg of segments) {
    if (current == null) return undefined;
    const m = seg.match(/^(\w+)\[(\d+)\]$/);
    current = m ? current[m[1]]?.[parseInt(m[2])] : current[seg];
  }
  return current;
}

// Props parser — handles state binding + conditional rendering
function parseComponentProps(propsDef: Record<string, any>, state: any, schema: ZodSchema): Record<string, any> {
  const parsed: Record<string, any> = {};
  for (const [key, value] of Object.entries(propsDef)) {
    if (typeof value === 'string' && value.startsWith('$')) parsed[key] = resolveStatePath(value, state);
    else if (typeof value === 'object' && value !== null && 'when' in value) {
      if (!evaluateCondition(value.when, state)) continue;
      parsed[key] = value.value;
    } else parsed[key] = value;
  }
  return schema.parse(parsed);  // Zod throws on bad props
}
```

#### C.6 Design Tokens

```css
/* Primary (brand blue) */
--color-primary-50: #eff6ff; --color-primary-500: #3b82f6; --color-primary-900: #1e3a8a;
/* Neutral (text/bg) */
--color-neutral-50: #fafafa; --color-neutral-500: #737373; --color-neutral-900: #171717;
/* Semantic */
--color-success-500: #10b981; --color-warning-500: #f59e0b; --color-error-500: #ef4444;
/* Shadows */
--shadow-low: 0 1px 2px 0 rgba(0,0,0,0.04); --shadow-high: 0 10px 24px 0 rgba(0,0,0,0.12);
--radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px;
```

Typography: h1=2.25rem/700, h2=1.875rem/700, h3=1.5rem/600, h4=1.25rem/600, body=1rem/400, caption=0.875rem/400
Font: `Geist Variable, ui-sans-serif, system-ui, -apple-system, ...sans-serif` / Mono: `Cascadia Code, Source Code Pro, Menlo`
Spacing: 0=0, 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 12=48px, 16=64px
Z-index: dropdown=1000, sticky=1020, fixed=1030, modal-backdrop=1040, modal=1060, popover=1070, tooltip=1080

#### C.7 CSS Architecture

```css
@layer base { h1-h6 { font-weight: 700 } body { font-size: 1rem; line-height: 1.5 } }
@layer components {
  .prose { max-width: 896px }
  .prose h1 { font-size: 2.25rem; margin-top: 1.5em }
  .prose code { font-family: "Cascadia Code"; background: var(--color-neutral-100); padding: 0.2em 0.4em; border-radius: 0.25rem }
  .prose-blockquote { border-left: 4px solid var(--color-primary-500); padding-left: 1rem; font-style: italic }
}
/* GML container queries */
@container (max-width: 600px) { .gml-primarycolumn { max-width: 100% } .gml-halfcolumn { flex: 1 1 calc(50% - 0.5rem) } }
@container (max-width: 900px) { .gml-row { flex-direction: column } .gml-sidebarcolumn { max-width: 100% } }
/* Gradient insight box variants */
.gml-gradient-insight { @apply rounded-lg border-l-4 p-4; border-color: var(--color-success-500); background: linear-gradient(to right, rgba(16,185,129,0.05), rgba(16,185,129,0.02)) }
.gml-gradient-warning { border-color: var(--color-warning-500); background: linear-gradient(to right, rgba(245,158,11,0.05), rgba(245,158,11,0.02)) }
.gml-gradient-error   { border-color: var(--color-error-500); background: linear-gradient(to right, rgba(239,68,68,0.05), rgba(239,68,68,0.02)) }
/* Animations */
@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
@keyframes pulse-scale { 0%,100% { opacity:1 } 50% { opacity:0.7; transform:scale(1.05) } }
.animate-fade-slide-in { animation: fadeSlideIn 300ms ease-out }
```

#### C.8 Healer Python Implementation (full)

```python
MAX_WIDTHS = {
    'gml-row': (1280, 'report'), 'gml-primarycolumn': (896, 'layout'),
    'gml-sidebarcolumn': (384, 'sidebar'), 'gml-halfcolumn': (448, 'half'),
    'gml-chartcontainer': (float('inf'), 'parent'), 'gml-infoblockmetric': (280, 'grid-item'),
    'gml-downloadfile': (400, 'block'), 'gml-blockquote': (896, 'prose'),
    'gml-gradientinsightbox': (896, 'prose'), 'gml-viewwebsite': (float('inf'), 'full'),
}
CONTEXT_WIDTHS = {'report': 1280, 'layout': 896, 'sidebar': 384, 'half': 448, 'grid-item': 280}

def heal_gml(ast, parent_width=1280.0):
    issues = []
    def validate(node, pw):
        if node.tag not in MAX_WIDTHS:
            children = [c for child in node.children for c in [validate(child, pw)] if c]
            return GMLNode(node.tag, node.props, children, node.text)
        max_w, ctx = MAX_WIDTHS[node.tag]
        actual_max = CONTEXT_WIDTHS.get(ctx, pw)
        declared_w = parse_width(node.props.get('width'))
        if declared_w and declared_w > actual_max:
            issues.append(f'{node.tag}: {declared_w}px > {actual_max}px — removed')
            return None  # REMOVE action
        child_max = actual_max if max_w == float('inf') else float(max_w)
        children = [c for child in node.children for c in [validate(child, child_max)] if c]
        return GMLNode(node.tag, node.props, children, node.text)
    return validate(ast, 1280.0) or ast, issues
```

---

### D. ENTITY & CITATION SYSTEM — NOVEL

**Why it's novel:** The 9-step entity lifecycle, citation buffering state machine, and content-addressed deduplication pattern are production behaviors extracted from Superagent — not documented anywhere.

**Pattern files:** Backend §1.2 (Entity schema), §4.3 (EntityService); Integration §3 (full lifecycle + citation buffer)

**12 entity types** (discriminated union on `entity_type`):
```
WEB_PAGE, EXTERNAL_API_DATA, GENERATED_CONTENT, USER_QUERY_PART,
GENERATED_REPORT, GENERATED_PRESENTATION, INTRA_ENTITY_SEARCH_RESULT,
EXTRACTED_ENTITY, SEARCH_PLAN, KNOWLEDGE_BASE, WEBSITE, GENERATED_DOCUMENT
```

**9-step entity lifecycle** (Integration §3.1):
1. Tool executes (web search, API, RAG)
2. `EntityService.store_entity()` → SHA-256 content-addressing → MinIO/S3
3. Entity dict added to run's in-memory references
4. `emit_run_event(ReferencesFound)` → SSE push
5. Frontend receives `references_found` → entities Map updated
6. LLM outputs `<gml-inlinecitation identifier="entity-abc"/>` in GML
7. rehype-to-JSX resolves identifier → `entities.get("entity-abc")`
8. InlineCitation component renders `[Source Title]` (clickable)
9. Click → SourcesPanel opens (URL, title, favicon, snippet, provider)

**Citation buffer** (Integration §3.3): Character-by-character buffer that freezes rendering on `[` until `]` or `\n` (safety valve). Prevents incomplete `[citation...` text flashing during token streaming. This is critical UX — without it, citations appear as broken text fragments.

**Content-addressed dedup** (Backend §4.3): Same content → same SHA-256 → same artifact. `store_entity()` checks existence first, increments reference_count if found. Idempotent — safe to call from parallel fan-out workers.

**Async entity creation** (Integration §7): Website co-generation dispatched via arq. `done` event carries `has_async_entities_pending=true`. Frontend shows "generating..." state until `references_found` event arrives with WEBSITE entity.

---

### E. DELIVERABLE PIPELINES — NOVEL + GUIDED

**Pattern files:** Integration §5 (full pipeline), §7 (co-generation); Backend §3.2 (graph nodes)

**8-step deliverable flow** (Integration §5.1):
1. User selects type in DeliverableSelector (standard | report | website | slides | document)
2. POST with `deliverable_type` from DeliverableStore
3. Backend creates Run with `deliverable_type` in LangGraph state
4. Research phase: planner → dispatch → workers → fan_in
5. Synthesis: DataBrief created (ensures cross-deliverable data consistency)
6. Router dispatches to type-specific generator
7. Generator produces artifact (report=GML streaming, website=HTML bundle via arq, slides=reveal.js, document=PDF/DOCX)
8. Frontend renders per type (report=rehype→JSX, website=iframe, slides=embed, document=download)

**Report generation** (multi-stage, NOVEL):
```
Stage 1: Outline — DataBrief → section titles + key points
Stage 2: Components — per-section content gen (GML tags + charts)
Stage 3: Review — multiple passes for consistency + quality
Stage 4: Polish — typography, spacing, final healer pass
```
Progress events: `node_report_preview_start` → `_delta` (per section) → `_done`
Output: ~342K generated content ceiling, 8 of 10 widgets cluster at 506-685 LOC

**Co-generation** (DEC-024, Integration §7): Single WEBSITE request produces BOTH website AND companion report. Website gen triggers report gen via arq job. Both consume same DataBrief → consistent numbers.

**Content-addressed artifact storage** (Integration §5.2):
```
Artifact (sha256 PK) → Manifest (tree snapshot) → Pointer (mutable HEAD reference)
```
Example: `conversation-{id}/latest-report` Pointer → Manifest → Artifact containing GML

**Follow this guide + specifics (GUIDED parts):**
- **reveal.js slides**: Generate standalone HTML with embedded CSS/JS — no external deps. See: https://revealjs.com/installation/#full-setup
  - Apply: Single-file HTML output, not multi-file. Embed theme CSS inline. Store as single Artifact.
- **WeasyPrint PDF export**: `brew install pango cairo libffi gdk-pixbuf` then add to pyproject.toml. See: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html
  - Apply: Render MarkupDocument → HTML string (reuse GML templates) → `HTML(string=html).write_pdf()`. Charts need kaleido for server-side PNG.
  - **Gotcha (macOS):** brew handles deps. Linux needs `apt-get install libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev libcairo2`.
- **python-docx**: See: https://python-docx.readthedocs.io/en/latest/
  - Apply: Map MarkupDocument sections → paragraphs/tables. Charts embedded as PNG images.

---

### F. BILLING & METERING — GUIDED + SPECIFICS

**Why partially guided:** Stripe integration follows standard docs, but our pricing model, quota algorithm, and the "costs as integer cents" pattern are production-extracted.

**Pattern files:** Backend §2.2 (models), §4.2 (BillingService), §5.2 (Stripe webhook), §5.3 (QuotaMiddleware); Integration §4 (full billing flow)

**Pricing model** (from chat export analysis):
- Sandbox: free, 10 runs/month, no overage
- Professional: $20/month → 200 runs/month, $0.50/run overage
- 1 run = 1 AI generation (reads are free)
- **All costs as integer cents, NEVER float** (Backend §6)

**Quota enforcement** (Integration §4.2): Decision tree with 6 branches — subscription missing, canceled, past_due, trial expired, limit reached (sandbox blocks / professional allows overage), under limit.

**In-graph budget** (DEC-045): `cost_cents_spent: Annotated[int, operator.add]` in LangGraph state. Conditional edge after each worker: if `cost_cents_spent > 200` (= $2.00) → END graph.

**Stripe webhooks** (Backend §5.2): 4 events handled: `subscription.updated`, `subscription.deleted`, `invoice.payment_failed`, `invoice.paid`. **CRITICAL: `await request.body()` for raw bytes before ANY JSON parsing** — Stripe signature verification breaks on pre-parsed bodies.

**Follow this guide + specifics:**
- Stripe Subscriptions: https://docs.stripe.com/billing/subscriptions/overview
  - Apply: Use test mode from Day 1. Prices stored in STRIPE_PLANS config (Backend doesn't look up Stripe prices at runtime). Metadata on Stripe subscription carries `plan_name` and `monthly_runs_limit`.
- arq background jobs: https://arq-docs.helpmanual.io/
  - Apply: `functions` as callable (not list) to fix registration bug. Worker started separately: `arq intelli.core.jobs.WorkerSettings`.

---

### G. AUTHENTICATION & MULTI-TENANCY — GUIDED + SPECIFICS

**Pattern files:** Backend §5.4 (dual-mode auth); Integration §6 (full auth flow)

**Existing in platform:** JWT + API key dual-mode auth is ALREADY WORKING. No new auth system needed.

**Multi-tenant isolation pattern** (Integration §6.3):
```python
# Every query MUST filter by tenant_id — no exceptions
# BAD:  select(X).where(X.id == id)
# GOOD: select(X).where(X.id == id).where(X.tenant_id == current_user.tenant_id)
```

**P0-3 fix needed:** Add `tenant_id` to Run model (currently only reachable via `runs.created_by → users.tenant_id` join). Direct FK needed for billing aggregation.

### H. DOCUINTELLI DOMAIN INTELLIGENCE — EXPANSION

**Why it matters:** DocuIntelli is the first domain module (Layer 2) that runs ON the platform primitives. Understanding its full scope validates platform coverage and identifies gaps. This section captures ALL knowledge extracted from the DocuIntelli codebase — 54 document types, 16 analytical frameworks, 17 mental models with exact prompting patterns, and full LangGraph integration specs.

**Source files:** `docs/design-reconstruction/06-docuintelli/DOCUINTELLI-SKILLS-EXTRACT.md`, `docs/design-reconstruction/02-domain-synthesis/DOCUINTELLI-PLATFORM-SYNTHESIS.md`

#### H.1 Document Type Registry (54 types)

**Pre-Transaction (6):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| Request for Quote (RFQ) | Items, quantities, specs, deadline | Response deadline, scope ambiguity |
| Request for Proposal (RFP) | Requirements, evaluation criteria, timeline | Evaluation criteria that determine winner |
| Quote / Proposal | Prices, validity period, conditions, exclusions | Validity expiration, hidden exclusions |
| Requisition | Requester, items, justification, budget code | Missing approvals, budget availability |
| Credit Application | Financials, references, requested terms | Credit limit, payment terms |
| Budget Approval | Amount, period, cost center, approver | Whether this covers actual spend |

**Agreement (8):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| Contract / Agreement | Parties, obligations, term, price, remedies, signatures | Unsigned copies, missing exhibits |
| Master Service Agreement (MSA) | Terms, SOW process, liability caps, termination | Which terms flow down to orders |
| Statement of Work (SOW) | Scope, deliverables, timeline, price, acceptance criteria | Ambiguous acceptance criteria |
| Purchase Order (PO) | PO number, items, quantities, prices, delivery, terms | PO number format (for matching) |
| Sales Order | SO number, customer, items, ship date | Linkage to PO |
| Order Acknowledgment | PO reference, confirmed terms, exceptions, ship date | Exceptions to original order |
| Change Order | Original reference, changes, reason, approvals | Whether both parties signed |
| Letter of Intent (LOI) | Proposed terms, binding vs. non-binding provisions | What's actually binding |

**Fulfillment (7):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| Packing Slip | Items, quantities, PO/SO reference | Discrepancies from order |
| Bill of Lading (BOL) | Shipper, consignee, description, weight, terms | Condition notes, freight terms |
| Delivery Receipt | Date, recipient signature, condition notes | Damage notations, partial delivery |
| Goods Receipt Note (GRN) | PO reference, items received, variances, date | Quantity/quality variances |
| Service Entry Sheet | SOW reference, hours/milestones, period | Approval signatures |
| Certificate of Completion | Project/SOW ref, completion criteria, sign-off | Punch list items, conditions |
| Inspection Report | Items inspected, criteria, pass/fail, defects | Rejection rates, recurring defects |

**Billing (6):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| Invoice | Invoice number, items, amounts, taxes, terms, due date | PO reference (for matching), tax accuracy |
| Pro Forma Invoice | Same as invoice, marked "pro forma" | Confusion with actual invoice |
| Credit Memo | Original invoice reference, reason, amount | Whether credit was applied |
| Debit Memo | Reference, reason, amount | Disputed debits |
| Statement of Account | All open invoices, payments, credits, balance | Aging, disputed items |
| Disputed Invoice Notice | Invoice reference, dispute reason, proposed resolution | Resolution status |

**Payment (6):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| Remittance Advice | Invoice references, amounts, payment method | Partial payments, deductions |
| Payment Confirmation | Date, amount, reference, parties, method | Whether it cleared |
| Bank Statement | Transactions, dates, balances | Unidentified transactions |
| Check Copy | Payee, amount, date, check number | Whether it was cashed |
| Wire Transfer Confirmation | Date, amount, sender, recipient, reference | Reference number for matching |
| Receipt | Amount, date, payer, reference | Whether it's official |

**Master Data (6):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| Vendor Master Record | Name, address, tax ID, bank details, terms, contacts | Stale info, duplicate vendors |
| Customer Master Record | Name, address, credit limit, terms, contacts | Credit limit accuracy |
| Item / Product Master | SKU, description, price, unit, tax code | Price version, discontinued items |
| Price List / Rate Card | Items, prices, effective dates, volume breaks | Effective dates, superseded versions |
| Chart of Accounts | Account codes, descriptions, hierarchy | Mapping accuracy |
| Cost Center List | Codes, descriptions, owners | Active vs. inactive |

**Compliance & Control (8):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| W-9 / W-8 (US) | Name, tax ID, certification, signature | Expiration, accuracy |
| Tax Exemption Certificate | Jurisdiction, exemption type, expiry | Expired certificates |
| Insurance Certificate | Policy number, coverage types, limits, expiry | Coverage gaps, expired policies |
| Audit Report | Scope, findings, recommendations, management response | Open findings, repeat issues |
| Policy Document | Applicability, requirements, exceptions, effective date | Whether it's current |
| Procedure Document | Process steps, roles, approvals, exceptions | Gap between procedure and practice |
| Approval Record | What, who, when, authority basis | Whether approver had authority |
| Delegation of Authority | Delegator, delegate, scope, limits, period | Expiration, scope limits |

**Communication (7):**

| Type | Key Fields | Watch-For |
|------|-----------|-----------|
| Email Thread | Parties, dates, subject, content, attachments | Buried decisions, attached documents |
| Meeting Notes / Minutes | Date, attendees, topics, decisions, action items | Decisions not documented elsewhere |
| Memo | From, to, date, subject, content | Whether it was actually distributed |
| Letter | Parties, date, subject, content, signature | Whether it was sent, method of delivery |
| Notice | Type, effective date, recipient, content, delivery proof | Delivery confirmation |
| Dispute Letter | Reference, issue, requested resolution, deadline | Response deadline, escalation path |

#### H.2 Analytical Frameworks (16)

**Document Function Frameworks (8):**

| # | Name | Core Question | Blind Spots | Apply When |
|---|------|--------------|------------|-----------|
| 1 | Transactional | What exchanges occurred? Amounts, dates, counterparties, settlement? | Ongoing relationships; informal agreements | Invoice processing, payment reconciliation |
| 2 | Relational | What ongoing connections exist? History and future of these parties? | One-off transactions; arm's-length dealings | Vendor management, customer analysis |
| 3 | Evidentiary | What can be proved? Signatures, stamps, authorization chains? | Coordinating documents; informal agreements | Audit preparation, dispute analysis |
| 4 | Performative | What do documents make happen? Obligations created by signing? | Documents filed but never read | Contract analysis, authorization workflows |
| 5 | Coordinative | How do parties align? Shared references and explicit alignment? | Single-party documents | Project documentation, specifications |
| 6 | Archival | What is preserved? Retention criteria, historical significance? | Documents actively in use | Records management, retention policy |
| 7 | Operational | What guides action? Instructions, procedures, policies, directives? | Gap between documented and actual practice | Process analysis, training review |
| 8 | Communicative | What messages were sent? Parties, topics, flow, information? | What was said but not written | Email analysis, correspondence review |

**Process Frameworks (4):**

| # | Name | Core Question | Blind Spots | Apply When |
|---|------|--------------|------------|-----------|
| 9 | Lifecycle | What stage is this? Status indicators, dates, approvals, completion? | Ambiguous stage transitions; stages skipped | AP cycle, contract execution |
| 10 | Workflow | Who does what when? Author/recipient patterns, routing, timestamps? | Coordination via untracked channels | Process analysis, actual vs. documented |
| 11 | Exception | What went wrong? Correction indicators, dispute correspondence? | Normal-process docs that look exceptional | Dispute analysis, process improvement |
| 12 | Control | What prevents error/fraud? Approval signatures, dual-auth, reconciliation? | Controls that exist on paper only | Audit, compliance, fraud detection |

**Structural Frameworks (4):**

| # | Name | Core Question | Blind Spots | Apply When |
|---|------|--------------|------------|-----------|
| 13 | Hierarchical | What governs what? Parent doc references, incorporation by reference? | Flat document sets; equal-authority docs | Contract corpus, policy corpus |
| 14 | Network | What connects to what? Shared parties, cross-references, clusters? | Isolated documents; no external references | Vendor files, multi-party deal corpora |
| 15 | Temporal | What sequence occurred? Dates, version numbers, amendment sequences? | Undated documents; retroactive execution | Dispute reconstruction, audit trails |
| 16 | Categorical | What groups exist? Type indicators, common formats, naming conventions? | Mixed-format corpora; emergent categories | Initial triage, shared drive dumps |

**Framework Selection Decision Table:**

| If you observe... | Try framework... |
|-------------------|-----------------|
| High reference density, low closure | Transactional |
| Long time spans, recurring parties | Relational |
| Heavy annotations, stamps, signatures | Evidentiary / Performative |
| Multiple versions, amendment trails | Coordinative / Hierarchical |
| Checklists, procedures, policies | Operational |

#### H.3 Mental Models (17) — Exact Prompting Patterns

These are the LLM prompt templates extracted from production. Each model provides a specific reasoning approach.

| # | Name | Prompting Pattern |
|---|------|------------------|
| 1 | **Inversion** | "Instead of asking what this corpus is for, ask: What would be missing if something important were hidden? What would look different if this were fraudulent? What would an adversary exploit?" |
| 2 | **Second-Order Effects** | "If [DOCUMENT] is wrong, what downstream documents are affected? If it is missing, what can't be completed? If it is changed, who must be notified? What breaks if this single point fails?" |
| 3 | **Map vs. Territory** | "What territory is this corpus describing? Where does the map distort, omit, or embellish? What happens in the territory that never makes it onto the map? Who drew this map, and what did they want you to see?" |
| 4 | **Incentives** | "Who created this document and why? Who benefits from it existing? From it being accurate? From it being vague? What behavior does this document encourage or discourage?" |
| 5 | **Redundancy & Backup** | "If this document were lost, could the information be reconstructed? What other documents contain overlapping information? Is redundancy intentional (control) or accidental (mess)?" |
| 6 | **Margin of Safety** | "How much error can the process tolerate before failure? Where are the tight tolerances? What documents exist because someone got burned before? What looks like bureaucracy but is actually a scar?" |
| 7 | **Chesterton's Fence** | "Why was this document created? What problem was it solving? Has that problem disappeared, or just become invisible? Who would object if it were removed?" |
| 8 | **Occam's Razor** | "Is the simplest explanation sufficient? Messy corpus → messy process, not conspiracy. Missing documents → never created or lost, not hidden. But: does any pattern resist this explanation?" |
| 9 | **Hanlon's Razor** | "Is this discrepancy more likely error or fraud? One occurrence = noise; ten occurrences in same direction = signal." |
| 10 | **Availability Bias (Counter)** | "What should be here and isn't? List all expected document types for this process and check each against what is actually present. The dog that didn't bark." |
| 11 | **Survivorship Bias (Counter)** | "What was discarded, overwritten, or never formalized? Why did these documents survive and others didn't? What conclusions would change if we saw the full population?" |
| 12 | **Base Rates** | "How common is this pattern in the corpus? A 'suspicious' pattern may match 40% of all documents. Calibrate to the corpus, not to general expectation." |
| 13 | **Feedback Loops** | "Do documents reference each other in cycles? Does an invoice trigger a payment that closes the PO? Where are loops open (pending) vs. closed (complete)?" |
| 14 | **Leverage Points** | "Where would a small change have large effects? Which document, if wrong, cascades into many problems? What is the highest-value intervention?" |
| 15 | **Boundary Conditions** | "What happens at the edges? Very large transactions, very old documents, first transaction with a party, last transaction before termination. Edge cases reveal assumptions." |
| 16 | **Proximate vs. Root Cause** | "This document shows a symptom—what is the disease? How many layers back can you trace? Do not stop at the first causal layer." |
| 17 | **Reversibility** | "Can this be undone? If this document is wrong, how hard is it to correct? Prioritize accuracy checks on documents with high correction cost." |

#### H.4 Quality Dimensions (10)

| # | Dimension | Low End | High End |
|---|-----------|---------|----------|
| 1 | Completeness | Fragment, partial, missing references | Self-contained, all information present |
| 2 | Formality | Draft, informal, notes | Executed, official, on letterhead, signed |
| 3 | Authority | Advisory, informational | Binding, enforceable, creates obligations |
| 4 | Specificity | General policy, broad guidance | Named parties, exact amounts, specific dates |
| 5 | Temporality | Point-in-time snapshot | Ongoing, evergreen, continuously updated |
| 6 | Directionality | Categorical: inbound / outbound / internal | N/A |
| 7 | Contestation | Settled, uncontested | Disputed, challenged, under negotiation |
| 8 | Confidentiality | Public, shareable | Restricted, need-to-know, encrypted |
| 9 | Originality | Copy, duplicate, printout | Original, authoritative source |
| 10 | Currency | Superseded, expired, historical | Current, active, governing |

#### H.5 Use Case Weighting (10 use cases × 8 dimensions)

| Dimension | Audit | Dispute | Fraud | Process Improvement | Knowledge Transfer | Migration | Due Diligence | Automation | Compliance | Reconstruction |
|-----------|:-----:|:-------:|:-----:|:-------------------:|:------------------:|:---------:|:-------------:|:----------:|:----------:|:--------------:|
| Completeness | ●●● | ●●● | ●● | ●● | ● | ●●● | ●●● | ●●● | ●●● | ●●● |
| Formality | ●●● | ●●● | ● | ● | ● | ● | ●● | ●● | ●●● | ●● |
| Authority | ●●● | ●●● | ●● | ● | ●● | ● | ●●● | ● | ●●● | ●● |
| Temporality | ●● | ●●● | ●●● | ●●● | ●● | ●● | ●● | ●● | ●●● | ●●● |
| Ref closure | ●●● | ●● | ●●● | ●● | ●● | ●●● | ●●● | ●●● | ●●● | ●●● |
| Annotation | ●●● | ●● | ●●● | ●●● | ●● | ● | ●● | ● | ●● | ●●● |
| Format consistency | ● | ● | ●● | ●● | ● | ●●● | ● | ●●● | ●● | ● |
| Exceptions | ●● | ●● | ●●● | ●●● | ●●● | ●● | ●●● | ●●● | ●● | ●●● |

**Legend:** ●●● = Critical | ●● = Important | ● = Secondary

#### H.6 Quick-Start Corpus Patterns (8)

| # | Pattern | Trigger | Primary Framework | Focus |
|---|---------|---------|------------------|-------|
| 1 | Invoice Corpus | "I have invoices" | Transactional + Lifecycle | Missing POs, unmatched receipts, duplicate invoices, aging, amount anomalies |
| 2 | Contract Corpus | "I have contracts" | Hierarchical + Relational | Unsigned copies as executed, amendments without reference, conflicting terms |
| 3 | Shared Drive Dump | "I have a drive dump" | Categorical + Operational | Multiple versions, drafts beside finals, templates mixed with completed |
| 4 | Email Corpus | "I have emails about a deal" | Communicative + Coordinative | Decision point buried mid-thread, commitments not documented elsewhere |
| 5 | ERP Extract | "I have an ERP extract" | Transactional + Lifecycle | Orphan records, stuck states, broken FKs, required fields empty |
| 6 | Audit Workpapers | "I have audit workpapers" | Evidentiary + Control | Repeat findings, open findings, sample coverage gaps |
| 7 | Vendor Files | "I have vendor files" | Relational + Compliance | Missing W-9/insurance, expired docs, vendors without contracts |
| 8 | Unstructured Dump | "Analyze these documents" | Discover — try multiple | Form, content, identifiers, parties, references, marks |

#### H.7 DocuIntelli Platform Integration

**DocuIntelliState (extends ResearchState pattern):**
```python
@dataclass
class DocuIntelliState:
    run_id: str; session_id: str; tenant_id: str; user_id: str
    corpus_manifest_id: str
    use_case: str | None = None  # audit | dispute | fraud | ...
    # Phase 1: Observation
    document_observations: Annotated[list[dict], operator.add] = field(default_factory=list)
    corpus_profile: dict | None = None
    # Phase 2: Framework selection (human interrupt)
    selected_frameworks: list[str] = field(default_factory=list)
    # Phase 3: Dimension discovery (human interrupt)
    validated_dimensions: list[dict] = field(default_factory=list)
    # Phase 4: Weighting
    dimension_weights: dict[str, float] = field(default_factory=dict)
    # Phase 5: Analysis (fan-out)
    framework_results: Annotated[list[dict], operator.add] = field(default_factory=list)
    document_scores: dict[str, dict[str, float]] = field(default_factory=dict)
    clusters: Annotated[list[dict], operator.add] = field(default_factory=list)
    gaps: Annotated[list[dict], operator.add] = field(default_factory=list)
    anomalies: Annotated[list[dict], operator.add] = field(default_factory=list)
    # Synthesis
    corpus_data_brief: dict | None = None
    current_phase: str = "observe"  # observe | select | discover | weight | apply | synthesize
```

**16-node LangGraph graph:**
```
Phase 1: observation_engine → [document_classifier, reference_extractor, metadata_extractor] (Send fan-out) → corpus_statistician (fan-in)
Phase 2: framework_selector → framework_confirmation_interrupt (human checkpoint)
Phase 3: dimension_discoverer → dimension_validation_interrupt (human checkpoint)
Phase 4: use_case_weighting
Phase 5: [framework_executor, scoring_agent, gap_analyst, anomaly_detector] (Send fan-out) → cross_framework_reconciler (fan-in)
Output:  analysis_report → END
```

**7 new entity types:**
```python
OBSERVATION          # Phase 1 output per document (type, references, marks, parties)
CORPUS_PROFILE       # Aggregated Phase 1 statistics (doc count, ref density, temporal span)
FRAMEWORK_RESULT     # Output of applying one framework (findings, blind spots, confidence)
DIMENSION_SCORE      # Per-document scores on all dimensions (weighted aggregate)
ANALYSIS_FINDING     # Gap, anomaly, or recommendation (severity, confidence, supporting docs)
CORPUS_ANALYSIS      # Root analysis document (executive summary, key findings, recommendations)
DOCUMENT_CLUSTER     # Group of similar documents (centroid dimensions, interpretation)
```

**Platform reuse assessment:**
- **35% High Reuse:** SSE, auth, multi-tenant, artifact storage, manifests, pointers, billing, tags, checkpointing
- **30% Medium Reuse:** LangGraph orchestration (new 16-node graph, same Send()), MCP tools (new registrations), DataBrief (CorpusDataBrief variant), streaming events (extend enum), entity system (add 7 types)
- **20% Low Reuse:** GENUI (new corpus tags), document ingestion (OCR, email threading), research tools (40+ new)
- **15% Zero Reuse:** Framework reasoning engine, mental model application, dimension discovery, watch-for pattern library, process template engine, anomaly detection, dimensional visualization

**New BL items required:** BL-023 (Cross-Framework Reconciliation), BL-024 (Mental Model Prompt Library), BL-025 (Dimension Discovery Agent), BL-026 (Pattern Library & Matcher), BL-027 (Process Template Engine), BL-028 (Anomaly Detection Engine), BL-029 (Dimensional Visualization Engine)

---

### I. BACKEND SERVICE PATTERNS — DEEP REFERENCE

**Source file:** `docs/design-reconstruction/03-patterns/BACKEND-PATTERNS.md` (860 lines)

This section expands the pattern file with complete Pydantic schemas, SQLAlchemy models, and service implementations that are used during build.

#### I.1 RunEvent Pydantic Payloads (all 22+ types)

```python
# Lifecycle
class StreamStart(BaseModel):
    type: Literal["stream_start"]
    chat_id: str; creator_user_id: str; user_chat_message_id: str; workspace_id: str
class Heartbeat(BaseModel):
    type: Literal["heartbeat"]
class DoneEvent(BaseModel):
    type: Literal["done"]
    has_async_entities_pending: bool | None = None; message: dict | None = None
class StreamError(BaseModel):
    type: Literal["ERROR"]
    error_type: str; error_message: str

# Planning
class PendingSource(BaseModel):
    plan_id: str; plan_set_id: str; plan_task_id: str; title: str
    type: Literal["WEB", "DOCUMENT", "CODING_AGENT"]; web_domain: str | None = None
class PendingSources(BaseModel):
    type: Literal["pending_sources"]; pending_sources: list[PendingSource]
class TaskUpdate(BaseModel):
    type: Literal["task_update"]; key: str; title: str; message: str
    status: Literal["loading", "success", "error"]; plan_set: PlanSet
    metadata: dict | None = None; timestamp: int  # epoch ms

# Tool Execution
class NodeToolsExecutionStart(BaseModel):
    type: Literal["node_tools_execution_start"]; node_id: str; plan_id: str; plan_set_id: str
    tool_ids: list[str]; total_tools: int; timestamp: int
class NodeToolEvent(BaseModel):
    type: Literal["node_tool_event"]
    event: str  # "tool_call_started" | "tool_call_completed" | "fallback_used" | "all_tools_failed"
    node_id: str; plan_id: str; plan_set_id: str; tool_id: str | None = None
    tool_type: str | None = None; metadata: dict | None = None; timestamp: int
class UpdateSubagentCurrentAction(BaseModel):
    type: Literal["update_subagent_current_action"]
    current_action: str; node_id: str; plan_id: str; plan_set_id: str; timestamp: int

# Messaging
class MessageDelta(BaseModel):
    type: Literal["message_delta"]; content: str; message_id: str | None = None
class AIMessage(BaseModel):
    type: Literal["ai_message"]; message: dict
class MessageIsAnswer(BaseModel):
    type: Literal["message_is_answer"]; content: str

# Report
class NodeReportPreviewStart(BaseModel):
    type: Literal["node_report_preview_start"]; preview_id: str; report_title: str
    report_user_query: str; final_report: bool; node_id: str; plan_id: str; plan_set_id: str
    entity: Entity; section_id: str | None = None; timestamp: int; workspace_id: str
class NodeReportPreviewDelta(BaseModel):
    type: Literal["node_report_preview_delta"]; preview_id: str; delta: str
    node_id: str; plan_id: str; plan_set_id: str; section_id: str | None = None
class NodeReportPreviewDone(BaseModel):
    type: Literal["node_report_preview_done"]; preview_id: str; content: str
    report_title: str; final_report: bool; node_id: str; plan_id: str; plan_set_id: str
    entity: Entity | None = None; timestamp: int; workspace_id: str

# Entity (shared schema for ReferencesFound and entity store)
class Entity(BaseModel):
    entity_type: Literal["WEB_PAGE", "EXTERNAL_API_DATA", "GENERATED_CONTENT", "USER_QUERY_PART",
        "GENERATED_REPORT", "GENERATED_PRESENTATION", "INTRA_ENTITY_SEARCH_RESULT",
        "EXTRACTED_ENTITY", "SEARCH_PLAN", "KNOWLEDGE_BASE", "WEBSITE", "GENERATED_DOCUMENT"]
    identifier: str; title: str | None = None; description: str | None = None
    file_name: str; mimetype: str; workspace_id: str
    stored_entity_id: str | None = None; content_artifact_id: str | None = None
    external_url: str | None = None; api_name: str | None = None
    all_seen_entities: list[str] = []; cited_entities: list[str] = []
class ReferencesFound(BaseModel):
    type: Literal["references_found"]; references: list[Entity]

# Clarification
class ClarificationNeeded(BaseModel):
    type: Literal["clarification_needed"]; message: str; options: list[str] | None = None
```

#### I.2 Key Service Patterns

**emit_run_event with PG NOTIFY (atomically append + push to SSE):**
```python
async def emit_run_event(pool, run_id: str, event: BaseModel) -> None:
    payload = event.model_dump_json()
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "INSERT INTO run_events (run_id, event_type, payload, created_at) VALUES ($1, $2, $3::jsonb, NOW())",
                run_id, event.type, payload)
            await conn.execute("SELECT pg_notify($1, $2)", f"run:{run_id}", payload)
```

**SSE streaming endpoint (PG LISTEN/NOTIFY → Server-Sent Events):**
```python
@router.post("/api/v1/runs/{run_id}/stream")
async def stream_run_events(run_id: str, request: Request, pool=Depends(get_pg_pool)):
    async def event_generator():
        past_events = await get_run_events_from_db(run_id)  # replay
        for event in past_events:
            yield f"data: {json.dumps(event)}\n\n"
        async with pool.acquire() as conn:
            queue = asyncio.Queue()
            await conn.add_listener(f"run:{run_id}", lambda *a: queue.put_nowait(a[3]))
            try:
                while True:
                    if await request.is_disconnected(): break
                    try:
                        payload = await asyncio.wait_for(queue.get(), timeout=25.0)
                        yield f"data: {payload}\n\n"
                        if json.loads(payload).get("type") in ("done", "ERROR"): break
                    except asyncio.TimeoutError:
                        yield 'data: {"type":"heartbeat"}\n\n'
            finally:
                await conn.remove_listener(f"run:{run_id}", ...)
    return StreamingResponse(event_generator(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
```

**Stripe webhook — raw body (CRITICAL gotcha):**
```python
@billing_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db=Depends(get_db)):
    payload = await request.body()  # CRITICAL: raw bytes, NOT request.json()
    sig_header = request.headers.get("Stripe-Signature", "")
    event = Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    match event.type:
        case "customer.subscription.updated": await handle_subscription_updated(event["data"]["object"], db)
        case "customer.subscription.deleted": await handle_subscription_canceled(event["data"]["object"], db)
        case "invoice.payment_failed":        await handle_payment_failed(event["data"]["object"], db)
        case "invoice.paid":                  await handle_invoice_paid(event["data"]["object"], db)
    return {"status": "received"}
```

**Quota middleware:**
```python
class QuotaMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method == "POST" and request.url.path.endswith("/runs"):
            tenant_id = request.state.tenant_id
            async with async_session_factory() as session:
                billing = BillingService(session)
                if not await billing.check_quota(tenant_id):
                    raise HTTPException(402, {"code": "quota_exceeded", "message": "Monthly run limit reached"})
        return await call_next(request)
```

**Dual-mode auth dependency:**
```python
async def get_current_user(bearer_token=Security(bearer_scheme), api_key=Security(api_key_header), db=Depends(get_db)):
    if bearer_token:
        payload = jwt.decode(bearer_token.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        return UserContext(user_id=payload["sub"], tenant_id=payload["tenant_id"], auth_method="jwt")
    if api_key:
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        result = await db.execute(select(APIKey).where(APIKey.key_hash == key_hash, APIKey.is_active == True))
        key_record = result.scalar_one_or_none()
        if not key_record: raise HTTPException(401, "Invalid API key")
        return UserContext(user_id=str(key_record.user_id), tenant_id=str(key_record.tenant_id), auth_method="api_key")
    raise HTTPException(401, "Authentication required")
```

---

### J. FRONTEND COMPONENT PATTERNS — DEEP REFERENCE

**Source file:** `docs/design-reconstruction/03-patterns/FRONTEND-PATTERNS.md` (1536 lines)

#### J.1 Zustand Store Shapes

**DeliverableStore:**
```typescript
interface DeliverableState {
  selectedType: 'standard' | 'report' | 'website' | 'slides' | 'document';
  previewMode: boolean; currentPreviewContent: string | null;
  isGenerating: boolean; generationProgress: number;  // 0-100
  setSelectedType: (type: DeliverableState['selectedType']) => void;
  startGeneration: () => void;
  completeGeneration: (content: string) => void;
  setGenerationProgress: (p: number) => void;
}
// Middleware: devtools only. File-level singleton.
```

**RunStore (with embedded report slice):**
```typescript
interface RunState {
  activeRunId: string | null;
  runStatus: 'idle' | 'running' | 'paused' | 'done' | 'error';
  events: RunEvent[];
  pendingAsyncEntities: Record<string, 'pending' | 'done'>;
  report: {
    reportContent: string;  // GML string, accumulated via delta events
    reportMetadata: { reportId: string; createdAt: string; wordCount: number } | null;
    isRendering: boolean; renderError: string | null;
    updateContent: (gml: string) => void;  // APPEND, not replace
    setMetadata: (m: ...) => void;
    clearReport: () => void;
  };
  setActiveRun: (id: string) => void;
  addEvent: (e: RunEvent) => void;
  setStatus: (s: RunState['runStatus']) => void;
  markAsyncEntityDone: (id: string) => void;
}
```

**PlanStore:**
```typescript
interface PlanState {
  planSet: PlanSet | null;
  activePlanId: string | null;
  setPlanSet: (ps: PlanSet) => void;
  updateTask: (planId: string, taskId: string, updates: Partial<PlanTask>) => void;
  clear: () => void;
}
```

#### J.2 useRunStream Event Handler Mapping

| Event type | Zustand Action |
|-----------|---------------|
| `stream_start` | `runStore.setStatus('running')` |
| `heartbeat` | no-op (keeps SSE alive) |
| `done` | `runStore.setStatus('done')` + `es.close()` |
| `ERROR` | `runStore.setStatus('error')` + `es.close()` |
| `message_delta` | `CitationBuffer.feed(delta)` → `setDisplayedContent(buffer.getReadyContent())` |
| `task_update` | `planStore.setPlanSet(event.plan_set)` |
| `pending_sources` | `runStore.addEvent(event)` |
| `references_found` | `entityStore.addEntities(event.references)` |
| `node_tools_execution_start` | `runStore.addEvent(event)` |
| `node_tool_event` | `runStore.addEvent(event)` |
| `update_subagent_current_action` | `runStore.addEvent(event)` |
| `node_report_preview_start` | `deliverableStore.startGeneration()` |
| `node_report_preview_delta` | `runStore.report.updateContent(event.delta)` + `deliverableStore.setGenerationProgress(min(95, prev+2))` |
| `node_report_preview_done` | `runStore.report.updateContent(event.content)` + `deliverableStore.completeGeneration(event.content)` |
| `clarification_needed` | `runStore.addEvent(event)` (UI deferred — DEC-047) |
| `usage-update` | `runStore.addUsage({inputTokens, outputTokens, costCents})` |

#### J.3 GML Component Map (rehype-react)

```typescript
const GML_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'gml-row': GmlRow,                        // flex row, gap prop, maxWidth 1280px
  'gml-primarycolumn': GmlPrimaryColumn,     // prose max-w-prose mx-auto
  'gml-sidebarcolumn': GmlSidebarColumn,     // flex column, 280px
  'gml-halfcolumn': GmlHalfColumn,           // 50% of row
  'gml-chartcontainer': GmlChartContainer,   // wraps Plotly chart, height prop
  'gml-blockquote': GmlBlockquote,           // styled blockquote with left border
  'gml-header-elt': GmlHeaderElt,            // section header
  'gml-infoblockmetric': GmlInfoblockMetric, // label + value + unit + trend arrow
  'gml-infoblockevent': GmlInfoblockEvent,   // event info block
  'gml-infoblockstockticker': GmlInfoblockStockTicker,  // symbol + price + change
  'gml-downloadfile': GmlDownloadFile,       // anchor row with file type icon
  'gml-viewreport': GmlViewReport,           // link/button to open report
  'gml-viewwebsite': GmlViewWebsite,         // iframe sandbox (DEC-044)
  'gml-viewpresentation': GmlViewPresentation, // iframe embed
  'gml-viewgenerateddocument': GmlViewGeneratedDocument, // PDF.js viewer or download
  'gml-gradientinsightbox': GmlGradientInsightBox, // gradient callout (4 variants)
  'gml-inlinecitation': GmlInlineCitation,   // [n] clickable source link
  'gml-components': GmlComponents,           // generic passthrough container
};
// CRITICAL: lowercase tag names in map — rehype-react won't match otherwise
```

#### J.4 Chart Rendering

**HSLA palette:** `blue:hsla(217,91%,60%,0.8)` `green:hsla(142,71%,45%,0.8)` `amber:hsla(38,92%,50%,0.8)` `red:hsla(0,84%,60%,0.8)` `purple:hsla(271,76%,53%,0.8)` `cyan:hsla(189,94%,43%,0.8)` `orange:hsla(25,95%,53%,0.8)` `gray:hsla(220,9%,46%,0.8)`

**Chart type → Plotly dispatch:**
```
bar              → type:'bar', barmode:'group'
line             → type:'scatter', mode:'lines+markers'
scatter          → type:'scatter', mode:'markers'
bubble           → type:'scatter', marker.size from z array
histogram        → type:'histogram', x only
box              → type:'box', boxmode:'group'
candlestick      → type:'candlestick', requires open/high/low/close
stacked_bar      → type:'bar', barmode:'stack', stackgroup on each trace
clustered_column → type:'bar', barmode:'group', multiple traces
donut            → type:'pie', hole:0.4
```

**Default layout:** `autosize:true, margin:{t:30,r:10,b:40,l:50}, font:{family:'Inter',size:12}, paper_bgcolor:'transparent', plot_bgcolor:'transparent'`

**ChartComponent (lazy-loaded):**
```typescript
register('Chart', function Chart({ traces, layout, height }) {
  const Plot = React.lazy(() => import('react-plotly.js'));
  return <Suspense fallback={<Skeleton height={height}/>}>
    <Plot data={traces} layout={{autosize:true, ...layout}} style={{width:'100%',height}} config={{responsive:true, displayModeBar:false}} />
  </Suspense>;
}, ChartSchema, 'data');
```

#### J.5 New Component Specs

| Component | Props | Key Behavior |
|-----------|-------|-------------|
| **DeliverableSelector** | `value`, `onChange`, `disabled` | Segmented control (5 options), wired to DeliverableStore |
| **PlanViewer TaskCard** | `task: PlanTask`, `index: number` | Status badge (LOADING/PROCESSING/CREATING NOTES/SUCCESS/ERROR), M:SS elapsed timer, color-coded left border, progress bar |
| **GenerationOverlay** | (none — reads stores) | Single continuous progress bar (0-100, NOT reset per substep), substep label from events |
| **WebsitePreview** | `artifactSha256`, `title?` | `fetch(/api/v1/artifacts/{sha256})` → blob → `URL.createObjectURL` → sandboxed iframe, cleanup on unmount |
| **ClarificationBanner** | `message`, `options?`, `onRespond` | DEFERRED to v1.5 (DEC-047) — minimal placeholder only |

---

### K. INTEGRATION FLOWS — DEEP REFERENCE

**Source file:** `docs/design-reconstruction/03-patterns/INTEGRATION-PATTERNS.md` (860 lines)

#### K.1 4-Surface Event Rollout (worked example)

Every new event type requires synchronized changes to 4 files:

```
Surface 1: Python enum (src/intelli/db/models/runs.py RunEventType)
Surface 2: Pydantic payload (src/intelli/schemas/run_events.py)
Surface 3: TypeScript union (ui/src/types/run-events.ts)
Surface 4: useRunStream handler (ui/src/hooks/useRunStream.ts switch/case)
```

**Example: Adding `usage-update`:**
1. Add `USAGE_UPDATE = "usage-update"` to RunEventType enum
2. Create `UsageUpdateEvent(BaseModel): type: Literal["usage-update"]; input_tokens: int; output_tokens: int; cost_cents: int | None`
3. Add `| { type: 'usage-update'; input_tokens: number; output_tokens: number; cost_cents?: number }` to TS union
4. Add `case 'usage-update': runStore.addUsage({...}); break;` to switch

#### K.2 Entity Lifecycle (9 steps)

```
1. Tool executes (web search, API, RAG)
2. EntityService.store_entity(content, media_type, entity_type, metadata)
   → sha256 = hashlib.sha256(content).hexdigest()
   → Existing? Increment reference_count. New? Upload to MinIO, create Artifact row
3. Entity dict added to run's in-memory references list
4. emit_run_event(run_id, ReferencesFound(references=[entity]))
   → pg_notify("run:{run_id}", json)
5. Frontend EventSource.onmessage: entityStore.addEntities(event.references)
6. LLM outputs <gml-inlinecitation identifier="entity-abc"/> in GML
7. rehype-to-JSX: GML_COMPONENTS['gml-inlinecitation'] resolved
8. GmlInlineCitation renders: entities.get(identifier) → [Source Title] clickable
9. Click → SourcesPanel opens (URL, title, favicon, snippet, provider)
```

**Citation buffer** (prevents incomplete `[citation...` flash during streaming):
```typescript
class CitationBuffer {
  private isInCitation = false;
  private buffer = '';
  private readyPointer = -1;
  feed(chunk: string): boolean {
    this.buffer += chunk;
    const prevReady = this.readyPointer;
    for (let i = this.readyPointer + 1; i < this.buffer.length; i++) {
      if (this.buffer[i] === '[') this.isInCitation = true;
      else if (this.buffer[i] === ']' || this.buffer[i] === '\n') this.isInCitation = false;
      if (!this.isInCitation) this.readyPointer = i;
    }
    return prevReady !== this.readyPointer;
  }
  getReadyContent(): string { return this.buffer.slice(0, this.readyPointer + 1); }
}
```

#### K.3 Billing Flow (6 steps)

```
1. POST /api/v1/runs → QuotaMiddleware:
   - No subscription → 402 "No subscription found"
   - status=canceled → 402 "Subscription canceled"
   - status=past_due → 402 "Payment required"
   - trial expired → 402 "Trial expired"
   - used >= limit AND sandbox → 402 "Run limit reached"
   - used >= limit AND pro → Allow (overage at $0.50/run)
   - used < limit → Allow ✓

2. BillingService.record_run_start(tenant_id, run_id)
   → INSERT UsageRecord { run_id, tenant_id, status="pending", quantity=1 }

3. Graph executes → tokens tracked → cost_cents_spent accumulates via operator.add
   → Budget guard: cost_cents_spent > 200 ($2.00) → END graph (DEC-045)

4. Run completes → BillingService.finalize_run(record_id, tokens, cost_cents)

5. Monthly invoice: count records → base_charge + overage_runs * 50 → Stripe invoice

6. Stripe webhook → raw body → construct_event → update subscription/usage status
```

**Stripe plan config:**
```python
STRIPE_PLANS = {
    "sandbox": {"month": {"price_id": "price_xxx", "amount_cents": 0, "monthly_runs_limit": 10}},
    "professional": {"month": {"price_id": "price_xxx", "amount_cents": 2000, "monthly_runs_limit": 200}},
}
OVERAGE_RATE_CENTS = 50  # $0.50/run over limit, professional only
```

#### K.4 Deliverable Pipeline (8 steps)

```
1. User selects type in DeliverableSelector → DeliverableStore.setSelectedType(type)
2. POST /api/v1/conversations/{id}/messages with { content, deliverable_type }
3. Backend: Run record → LangGraph state.deliverable_type = type
4. Research phase: planner → dispatch → [workers × N] → fan_in (task_update events)
5. synthesis_node → DataBrief (ensures cross-deliverable data consistency)
6. Router branches on deliverable_type:
   REPORT   → report_generator (sync, streams GML via SSE)
   WEBSITE  → website_generator (async via arq)
   SLIDES   → slides_generator (sync)
   DOCUMENT → document_generator (sync)
7. Generator produces artifact → store as content-addressed Artifact → Manifest → Pointer
8. Frontend renders: report=rehype→JSX, website=iframe, slides=embed, document=download
```

**Co-generation (DEC-024):** WEBSITE request triggers BOTH website (arq) AND companion report (arq). Both read same DataBrief → consistent numbers. `done` event carries `has_async_entities_pending:true` → frontend keeps entity listeners active.

#### K.5 SSE Lifecycle + Reconnection

```
Client: new EventSource("/api/v1/runs/{id}/stream")
→ FastAPI: LISTEN "run:{id}" on PG channel
→ Replay past events from DB
→ PG NOTIFY received → yield as SSE frame
→ Heartbeat every 25s if idle (prevents 60s proxy timeout)
→ done/ERROR → es.close() → UNLISTEN
```

**Reconnection (exponential backoff):**
```typescript
const delay = Math.min(1000 * 2 ** retryCount, 30000);  // 1s, 2s, 4s, 8s, 16s, cap 30s
// Max 5 retries, then runStore.setStatus('error')
// Reset retryCount on successful connection
```

#### K.6 Migration Sequencing (DEC-052)

```
0005a: Artifact extensions (entity_type, entity_metadata JSONB)
       → Required by: BL-016, BL-004, BL-005, BL-006, BL-018
0005b: Billing tables (subscriptions, usage_records) + Run.tenant_id
       → Required by: BL-012, BL-013
0005c: Message extensions (deliverable_type, hydrated_content, retry_attempts, etc.)
       → Required by: BL-008, BL-021

Order: 0005a → 0005b → 0005c (sequential, each depends on prior)
```

---

### L. GAP ANALYSIS — REFERENCE

**Source file:** `docs/design-reconstruction/04-gaps/COMPREHENSIVE-GAP-ANALYSIS.md`

51 identified gaps: 8 CRITICAL, 17 HIGH, 18 MEDIUM, 8 LOW.

#### L.1 Critical Gaps (8)

| Gap | Description | Affected BL | Resolution |
|-----|------------|-------------|-----------|
| GAP-001 | DEC-048 locks Plotly but 4 docs still say Recharts | BL-004/005/009/019 | Update 4 docs (30 min each) |
| GAP-002 | DEC-015 split into a/b not propagated to 4 downstream docs | BL-004/005/009 | Add status update to each (1-2 hrs) |
| GAP-003 | OQ-001–007 resolved but 3 docs still show them open | All | Add resolution blocks (mechanical) |
| GAP-014 | No formal LangGraph→SSE event mapping contract | BL-001/002 | Create "Event Contract v1" doc (4 hrs) |
| GAP-022 | RunEvent sequence_num TOCTOU race under Send() concurrency | BL-001/002 | Atomic INSERT with subquery or IDENTITY column (4 hrs) |
| GAP-023 | arq WorkerSettings.functions evaluates at import time (empty) | BL-016/012 | Make functions callable or separate module (4 hrs) |
| GAP-038 | No CI/CD pipeline — no automated tests on PR | All | GitHub Actions: pytest + tsc + ruff + alembic check (1 day) |
| GAP-039 | Phase 0 validation checklist exists in audit doc but not formalized | BL-001/003/009 | Add M0-GATE blocking milestone (2 hrs) |

#### L.2 High-Priority Gaps (17)

| Gap | Description | Affected BL | Resolution Wave |
|-----|------------|-------------|-----------------|
| GAP-004 | Analysis/Modelling/Org Insight modules not explicitly deferred | Scoping | W0 |
| GAP-005 | Index Service not listed as Layer 1 primitive | BL-003/016 | W0 |
| GAP-006 | Document processing pipeline (ADR-007) not in Decision Register | BL-016 adj. | W0 |
| GAP-015 | Tool fallback chain strategy not in BL-001 spec | BL-001/003 | W0 |
| GAP-016 | Async entity creation via arq has no standalone BL item | BL-016 | W1 |
| GAP-017 | NDM v1 JSON schema (GML AST) not formalized | BL-004/005/009 | W0 |
| GAP-018 | MCP tool discovery filtering algorithm unspecified | BL-001/003 | W0 |
| GAP-024 | LiteLLM designed but not coded — needed for cost tracking? | BL-012/013 | Decision needed |
| GAP-025 | Langfuse self-hosted deployment not sized or planned | BL-012/013 | W0 |
| GAP-026 | Search provider (Brave vs Tavily) primary not selected | BL-003 | W0 (2-hr research) |
| GAP-033 | GML formal spec is inferred from JS bundle, not recovered | BL-004/009 | Accept + validate in W2 |
| GAP-036 | `gml-viewgenerateddocument` scope unclear (BL-019?) | BL-018/019 | W1 |
| GAP-040 | No monitoring or alerting specification | BL-012/013 | W1 |
| GAP-041 | No DX tooling: no `make dev`, no DB seeding, no mock data | All | W0 (4 hrs) |
| GAP-042 | No staging environment specification | BL-012/013 | W1 |
| GAP-043 | Multi-tenant data isolation not specified for v1 | BL-001/all | W0 |
| GAP-045 | 10 CLAUDE.md team briefs approved but not created | All | P0 (8 hrs) |

#### L.3 Medium/Low Gaps (26, compact)

| Gap | Description | Sev | Wave |
|-----|------------|-----|------|
| GAP-007 | ADR-010 bootstrap infra not in Decision Register | MED | W0 |
| GAP-008 | 7 stale claims not corrected | MED | P0 |
| GAP-009 | 8 blocked-by fields wrong in GIT-ISSUES | MED | P0 |
| GAP-010 | BL-015/008 at M3 but can start W0 | MED | P0 |
| GAP-011 | BL-022 dependency arrow backwards | MED | P0 |
| GAP-012 | Ground truth says 11 routers, codebase has 12 | LOW | W0 |
| GAP-013 | `<answer>` wrapper stripping not specified | LOW | W0 |
| GAP-019 | HITL policy evaluation order not specified | MED | W1 |
| GAP-020 | Entity reference algorithm edge cases unspecified | MED | W1 |
| GAP-021 | Failure mode table not enumerated | MED | W0 |
| GAP-027 | Neo4j Aura free tier limits not assessed | MED | W1 |
| GAP-028 | Migration 0005 content not specified despite DEC-052 | MED | W0 |
| GAP-029 | DocuIntelli billing code not inspected | MED | W0 |
| GAP-030 | Feature flag backend for v1 not specified | MED | W0 |
| GAP-031 | Slides pipeline not specified | LOW | W1 |
| GAP-032 | Clarification resume endpoint not specified | LOW | W1 |
| GAP-034 | Superagent auth method unknown (JWT vs cookies) | MED | W3 |
| GAP-035 | Superagent SSO details not recovered | MED | W3 |
| GAP-037 | Product analytics gap not quantified | LOW | W3 |
| GAP-044 | No data retention or backup policy | LOW | W2 |

---

### M. QUALITY SYSTEMS — DEEP SPEC

#### M.1 GML Healer — Valid Parent Contexts

```python
VALID_LOCATIONS = {
    'gml-blockquote':            ['gml-primarycolumn'],
    'gml-chartcontainer':        ['gml-primarycolumn'],
    'gml-gradientinsightbox':    ['gml-primarycolumn'],
    'gml-infoblockevent':        ['gml-sidebarcolumn'],
    'gml-infoblockmetric':       ['gml-sidebarcolumn'],
    'gml-infoblockstockticker':  ['gml-sidebarcolumn'],
    'gml-downloadfile':          ['gml-primarycolumn', 'gml-sidebarcolumn'],
    'gml-viewreport':            ['gml-primarycolumn'],
    'gml-viewwebsite':           ['gml-primarycolumn'],
    'gml-viewpresentation':      ['gml-primarycolumn'],
    'gml-viewgenerateddocument': ['gml-primarycolumn'],
    'gml-header-elt':            ['gml-primarycolumn'],
    'gml-halfcolumn':            ['gml-row'],
    'gml-primarycolumn':         ['gml-row'],
    'gml-sidebarcolumn':         ['gml-row'],
}
```

**Decision logic:** Node in wrong parent → find valid ancestor via VALID_LOCATIONS → HOIST if found, REMOVE if not. Mutations collected DFS, applied in reverse order (deepest first) for index stability.

#### M.2 Multi-Stage Pipeline Specs

**Report Generation — 4 Stages:**

| Stage | Input | Output | Quality Gate | SSE Event |
|-------|-------|--------|-------------|-----------|
| 1. Outline | DataBrief, query | ReportOutline (sections + types) | Must contain ≥1 prose + ≥1 metrics/chart | `update_subagent_current_action("Writing outline...")` |
| 2. Components | Outline + DataBrief | List[MarkupNode] per section | Each section must parse as valid GML | `node_report_preview_start/delta/done` per section |
| 3. Review | Assembled draft | ReviewResult → targeted rewrites | Zero issues OR max 2-3 passes | `update_subagent_current_action("Reviewing content...")` |
| 4. Polish | Reviewed tree | Final GML string | Healer returns zero issues → pass | `node_report_preview_done(sectionId="final")` |

**Output ceiling:** ~342K generated content, 8 of 10 widgets cluster at 506-685 LOC. Max ~550K total.

**Website Generation — 7 Stages:**

| Stage | What | Key Decision |
|-------|------|-------------|
| 1. Template Assembly | Select frozen component bundle | Architecture: monolithic (<5 sections) vs coordinator (tabbed) vs four-tier |
| 2. Architecture | Generate PageStructure | Must have chart slot if financial_data non-empty |
| 3. Theme | Generate CSS variable overrides | Industry → palette (finance=blue, healthcare=green) |
| 4. Layout Primitives | Header/footer/sidebar instances | Tailwind classes must be in frozen bundle |
| 5. Content Sections | HTML/JSX per section (parallel Send) | Cross-check numerics against DataBrief |
| 6. Widgets | Plotly chart configurations | ChartObjectSchema validation; fallback to metrics grid |
| 7. Atomic Export | Bundle all files, identical timestamp | File count = slots + 2; stored as Artifact(entity_type="website") |

#### M.3 DataBrief as Quality Anchor

```python
class DataBrief(BaseModel):
    financial_data: dict[str, Any]    # {ticker: {revenue, earnings, market_cap, pe_ratio, ...}}
    market_data: dict[str, Any]       # {market_cap, growth_rate, market_share, sector, peers}
    company_metadata: dict[str, Any]  # {name, ticker, description, industry, headquarters}
    swot_summary: str | None = None
    risk_factors: list[str] = []
    growth_opportunities: list[str] = []
    primary_sources: list[Entity] = []    # Top 10 by relevance
    all_sources: list[Entity] = []
    data_gaps: list[str] = []             # Triggers meta-reasoning if non-empty
    collected_at: str                     # ISO 8601
    class Config:
        extra = "allow"  # Extensible for domain modules (PropSygnal, RegSygnal, Lease CDs)
```

**Why it matters:** DataBrief is the SINGLE WRITE POINT for all research findings. All downstream generators are readers only — they never re-query sources or re-run synthesis. This guarantees:
- "MSFT $281.7B" appears identically in report metrics, website charts, slides, and exports
- Citation identifiers resolve to the same Entity records across all deliverables
- `data_gaps` triggers meta-reasoning before generation, preventing partially-populated briefs from reaching generators

**Consumption by generator:**

| Generator | Fields Read | Purpose |
|-----------|-----------|---------|
| Report outline | financial_data, market_data, swot_summary | Determines section types |
| Report components | Per-section slice of DataBrief | Avoids context overflow |
| Report review | All fields | Cross-check numerics for hallucination |
| Website architecture | financial_data density, company_metadata.industry | Complexity decision |
| Website theme | company_metadata.industry | Brand color selection |
| Website sections | Per-section slice | Same as report components |
| Website charts | financial_data, market_data | Chart data series |
| Slides | All summary fields | One slide per top-level field |
| Document export | All fields | Appendix tables from financial_data |

---

## Part 2: Dify Competitive Intelligence

Full analysis from reverse-engineering Dify's complete product surface across 12 areas.

### Dify Product Surface Summary

Dify is a **horizontal no-code/low-code platform** for building AI applications. It targets a fundamentally different market than NYQST (no-code creators vs. regulated enterprise analysts). However, several architectural patterns are worth studying.

| Area | Dify Implementation | NYQST Disposition |
|------|---------------------|-------------------|
| **5 App Modes** (text-gen, chatbot, agent, chatflow, workflow) | Canvas-based visual builder with drag-drop nodes | **SKIP** — we have 1 mode (research orchestrator) that does more depth |
| **Workflow Canvas** (16 node types: Start, LLM, Knowledge, If/Else, Code, Template, Variable, HTTP, Tool, Iterator, Parameter Extractor, Question Classifier, Answer, Assigner, End, DocExtractor) | Visual DAG editor, supports branching, loops, tool integration | **LEARN FROM** — our graph-as-code approach (DEC-049) is correct for CRE domain but Dify's node type catalog is comprehensive |
| **Chatflow vs Workflow** | Chatflow = conversation-aware workflow with memory; Workflow = stateless batch processing | **LEARN FROM** — our LangGraph approach handles both via state management |
| **Tool/Plugin Marketplace** (6 provider types: built-in, custom, workflow-as-tool, API-based, model tools, plugins) | Hot-swappable tools via marketplace UI | **ADOPT (partially)** — our MCP tool layer (DEC-046) achieves hot-swap via protocol, not marketplace UI. MCP is more flexible. |
| **RAG Pipeline** (4 retrieval methods, 2 reranking modes) | Full-text + semantic + hybrid search, Cohere/cross-encoder reranking, metadata filtering, multi-source retrieval | **ADOPT (RAG quality roadmap)** — our OpenSearch BM25 + pgvector exists, add hybrid search + reranking in v1.5 |
| **Knowledge Base Management** | Upload → chunk → embed → index, segment management, multi-format (PDF, DOCX, TXT, Markdown, CSV, notion import) | **EXISTS** — our RAG pipeline handles upload → chunk → index. Enhance with Dify's segment preview and metadata filtering. |
| **Conversation Management** | Message tree with annotations, user feedback (thumbs up/down), message pinning, conversation variables | **ADOPT (annotations + feedback)** — our Message model has 26 fields, add annotation support. Feedback already exists (`message_feedback` table). |
| **Multi-Model Support** (44+ providers, 6 model types) | Provider abstraction, per-node model selection, cost tracking | **DEFER** — DEC-042 (LiteLLM hot-swap) deferred to v1.5. OpenAI-only in v1. |
| **Template Gallery** | Pre-built app templates users can fork | **SKIP** — wrong fit for regulated enterprise |
| **API Access** (3 modes: completions, chat, workflow trigger) | RESTful API with API key auth per app | **EXISTS** — our dual-mode auth (JWT + API key) covers this |
| **Monitoring & Analytics** | Token usage, response latency, conversation volume, error rates | **ADOPT (partially)** — our usage_records + cost_cents covers billing. Add latency tracking via Langfuse. |
| **Team/Workspace Collaboration** | Multi-workspace, role-based access, shared apps | **LAYER 3** — deferred to enterprise shell |

### Key Dify Architecture Patterns Worth Studying

**1. Workflow Execution Engine:**
Dify uses a DAG-based execution engine with topological sorting. Each node type has: `run()` method, input/output variable mapping, error handling with retry. **Relevance:** Our LangGraph approach is more powerful (supports cycles via conditional edges) but Dify's clean node interface is worth emulating for custom tool nodes.

**2. Streaming Protocol:**
Dify uses SSE (`text/event-stream`) with typed events: `message`, `agent_message`, `agent_thought`, `message_file`, `tts_message`, `message_end`, `message_replace`, `error`, `ping`, `workflow_started/succeeded/failed`, `node_started/finished`. **Relevance:** Our 22 event types are more detailed (especially planning and report preview events). Dify lacks our fine-grained tool execution events.

**3. Plugin Isolation:**
Dify runs plugins in sandboxed processes with resource limits. Plugins communicate via gRPC. **Relevance:** Our MCP tool layer uses stdio transport (separate process) — similar isolation pattern but simpler protocol.

**4. RAG Quality Stack:**
Dify's multi-retrieval approach (full-text + vector + hybrid) with reranking is the most applicable pattern for NYQST. Their segment management (preview/edit chunks before indexing) is a UX win we should adopt post-v1.

### NYQST Structural Advantages Over Dify

1. **Content-addressed storage** (Artifact/Manifest/Pointer) — Dify uses standard object storage. Our kernel provides built-in dedup, versioning, and provenance.
2. **Run event ledger** — Dify's workflow logs are basic. Our 22-type event stream provides full observability of every tool call, planning decision, and generation step.
3. **MCP protocol** — Dify's custom plugin protocol locks tools to Dify. Our MCP tools work with any MCP-compatible host.

---

## Part 3: Frontend Implementation Recipes

Practical recipes for getting the frontend stack working. These address the "how do I get rendering to work without stupid errors" question.

### Recipe 1: rehype/unified ESM Pipeline in Vite

**Problem:** unified, rehype-parse, rehype-react are ESM-only packages. Can cause import issues in test environments.

**Vite config** (vite.config.ts):
```typescript
// Vite handles ESM natively — no special config needed for unified/rehype
// BUT: add to optimizeDeps if you see "not exported" errors
export default defineConfig({
  optimizeDeps: {
    include: ['unified', 'rehype-parse', 'rehype-react'],
  },
  // ... existing config
});
```

**Vitest config** (vitest.config.ts or in vite.config.ts):
```typescript
test: {
  // unified ecosystem is ESM-only — Vitest handles this natively
  // If problems: use 'vitest --pool=forks' (not --pool=threads)
  environment: 'jsdom',
}
```

**The full pipeline** (Frontend §6.1):
```typescript
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import { createElement, Fragment } from 'react';

// CRITICAL: component map MUST use lowercase tag names
const GML_COMPONENTS = {
  'gml-row': GmlRow,              // NOT 'GmlRow'
  'gml-chartcontainer': GmlChart, // NOT 'GmlChartContainer'
  'gml-inlinecitation': GmlInlineCitation,
  // ... all 18 tags (Frontend §6.1)
};

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeReact, { createElement, Fragment, components: GML_COMPONENTS });

export function renderGml(gmlContent: string): React.ReactNode {
  return processor.processSync(gmlContent).result;
}
```

**TypeScript declarations for custom elements** (add to `ui/src/types/gml.d.ts`):
```typescript
declare namespace JSX {
  interface IntrinsicElements {
    'gml-row': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { gap?: string; align?: string }, HTMLElement>;
    'gml-chartcontainer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { height?: string; props?: string }, HTMLElement>;
    'gml-inlinecitation': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { identifier?: string; url?: string }, HTMLElement>;
    'gml-infoblockmetric': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { label?: string; value?: string; trend?: string }, HTMLElement>;
    'gml-gradientinsightbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { type?: string; title?: string }, HTMLElement>;
    // ... remaining 13 tags
  }
}
```

**Install:**
```bash
cd ui && npm install unified rehype-parse rehype-react
```

### Recipe 2: Plotly.js Bundle Optimization

**Problem:** `plotly.js` is 8MB. `plotly.js-dist-min` is 1.2MB. Still too large for initial bundle.

**Solution: lazy load with React.lazy():**
```typescript
// ui/src/components/reports/LazyPlot.tsx
import React, { Suspense } from 'react';

// Dynamic import — only loaded when first chart renders
const Plot = React.lazy(() => import('react-plotly.js'));

export function LazyPlot({ data, layout, ...rest }: any) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl h-[300px]" />}>
      <Plot
        data={data}
        layout={{
          autosize: true,
          margin: { t: 30, r: 10, b: 40, l: 50 },
          font: { family: 'Inter, sans-serif', size: 12 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          ...layout,
        }}
        style={{ width: '100%' }}
        config={{ responsive: true, displayModeBar: false }}
        {...rest}
      />
    </Suspense>
  );
}
```

**Vite chunk splitting** (vite.config.ts):
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        plotly: ['react-plotly.js', 'plotly.js-dist-min'],
        // reveal.js also heavy — separate chunk
        revealjs: ['reveal.js'],
      },
    },
  },
},
```

**TypeScript types** (no @types for plotly.js-dist-min):
```typescript
// ui/src/types/plotly.d.ts
declare module 'react-plotly.js' {
  import { Component } from 'react';
  interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: any, graphDiv: HTMLElement) => void;
  }
  export default class Plot extends Component<PlotParams> {}
}
```

**Install:**
```bash
cd ui && npm install react-plotly.js plotly.js-dist-min
```

**Server-side rendering for PDF export** (kaleido):
```bash
pip install kaleido
# Then in Python:
import plotly.graph_objects as go
fig = go.Figure(data=[go.Bar(x=['A','B'], y=[1,2])])
fig.write_image("/tmp/chart.png", engine="kaleido")
```

### Recipe 3: @assistant-ui/react Custom Transport

**Existing NYQST setup** (confirmed from codebase scan):
- `ui/src/providers/assistant-runtime.tsx` — custom runtime provider
- `ui/src/index.css` imports `@assistant-ui/react-ui/styles/` CSS
- Uses `@assistant-ui/react-ui` for styled components

**Custom transport pattern** for connecting to our NDJSON backend:
```typescript
// ui/src/providers/assistant-runtime.tsx
import { useExternalStoreRuntime } from '@assistant-ui/react';

// Our SSE events feed into assistant-ui via useExternalStoreRuntime
// This lets us keep our custom SSE hook (useRunStream) while using
// assistant-ui's Thread/Composer components for the chat UI
const runtime = useExternalStoreRuntime({
  messages: zustandMessages,          // from our message store
  isRunning: runStore.runStatus === 'running',
  onNew: async (message) => {
    // POST to /api/v1/agent/chat
    await sendMessage(message.content, deliverableStore.selectedType);
  },
  onCancel: async () => {
    // Signal abort to backend
    await cancelRun(runStore.activeRunId);
  },
});
```

**Key docs:**
- Transport architecture: https://www.assistant-ui.com/docs/runtimes/assistant-transport
- useExternalStoreRuntime: https://www.assistant-ui.com/docs/runtimes/custom/external-store

### Recipe 4: shadcn/ui + Tailwind v3

**Confirmed from codebase:** NYQST uses Tailwind CSS v3 (not v4) with `@tailwind` directives and HSL CSS variables in shadcn convention.

**Existing setup** (from `ui/src/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    /* ... standard shadcn HSL variables */
  }
  .dark { /* dark theme overrides */ }
}
```

**Adding NYQST brand colors** for chart/report theming:
```css
/* Add to :root in index.css */
:root {
  /* Existing shadcn variables... */

  /* NYQST chart palette (from Superagent analysis) */
  --chart-blue: 217 91% 60%;
  --chart-green: 142 71% 45%;
  --chart-amber: 38 92% 50%;
  --chart-red: 0 84% 60%;
  --chart-purple: 271 76% 53%;
  --chart-cyan: 189 94% 43%;
}
```

**Adding components:**
```bash
npx shadcn-ui@latest add dropdown-menu toggle-group tabs scroll-area collapsible
# Already installed: button, badge, dialog, tooltip, avatar, separator, toast
```

### Recipe 5: SSE Consumption Pattern

**Full hook implementation** in Frontend §8.

**Key pattern:** EventSource connects to `/api/v1/runs/{id}/stream`. On each `onmessage`, dispatch to appropriate Zustand store based on `event.type`. Terminal events (`done`, `ERROR`) close the source.

**Dual-stream handling:**
```typescript
// Two EventSource instances run simultaneously:
const chatStream = new EventSource(`/api/chat/message/stream?id=${messageStreamId}`);
const runStream = new EventSource(`/api/v1/runs/${runId}/stream`);

// Chat stream → message content + deliverable routing
// Run stream → planning, tools, report preview, entity updates
```

**PG NOTIFY payload limit:** 8000 bytes. For events with large payloads (e.g., `node_report_preview_done` with full GML content), the backend stores the full content in the run_events table and the NOTIFY payload carries a truncated version with a `full_payload_in_db: true` flag. Frontend fetches full payload via REST if needed.

### Recipe 6: Code Splitting Strategy

**Heavy components** that must be lazy-loaded:
```typescript
// Plotly charts (1.2MB)
const LazyPlot = React.lazy(() => import('./reports/LazyPlot'));

// reveal.js slides (400KB)
const SlideViewer = React.lazy(() => import('./deliverables/SlideViewer'));

// PDF viewer (if using PDF.js)
const PdfViewer = React.lazy(() => import('./deliverables/PdfViewer'));
```

**Suspense boundaries:**
```typescript
// Wrap each heavy component group
<Suspense fallback={<Skeleton className="h-[400px]" />}>
  <LazyPlot data={traces} layout={layout} />
</Suspense>
```

### Recipe 7: reveal.js Slides in React

**Problem:** reveal.js expects DOM control. React wants DOM control. They fight.

**Solution: useRef + useEffect, render once:**
```typescript
import { useRef, useEffect } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';

export function SlideViewer({ html }: { html: string }) {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<Reveal.Api | null>(null);

  useEffect(() => {
    if (!deckRef.current) return;
    // Note: sanitize HTML before setting if content is untrusted
    deckRef.current.textContent = '';
    deckRef.current.insertAdjacentHTML('afterbegin', html);  // Set slides HTML BEFORE init
    const deck = new Reveal(deckRef.current, {
      embedded: true,       // Don't take over full viewport
      hash: false,          // Don't mess with URL
      controls: true,
      progress: true,
    });
    deck.initialize();
    revealRef.current = deck;
    return () => { deck.destroy(); revealRef.current = null; };
  }, [html]);

  return <div ref={deckRef} className="reveal" style={{ height: '500px' }} />;
}
```

**Standalone HTML export** (for Artifact storage — DEC-031):
```python
def generate_slides_html(sections: list[dict]) -> str:
    slides_html = '\n'.join(
        f'<section><h2>{s["title"]}</h2>{s["content"]}</section>'
        for s in sections
    )
    return f'''<!DOCTYPE html>
<html><head>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/white.css">
</head><body>
<div class="reveal"><div class="slides">{slides_html}</div></div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
<script>Reveal.initialize();</script>
</body></html>'''
```

### Recipe 8: Streaming Tools (7 client-side GenUI tools)

**Pattern:** Server-side tools that trigger client-side rendering. Defined with `@assistant-ui/react`'s `tool()` helper. Tools WITHOUT `execute` function are client-side only — they render UI but don't make server round-trips.

```typescript
import { z } from 'zod';
import { tool as createTool } from 'ai';

export const researchTools = {
  // 1. updateResearchPlan — client-side, NO execute (renders PlanProgress)
  updateResearchPlan: createTool({
    description: 'Update the research plan with current phase and task status',
    inputSchema: z.object({
      phases: z.array(z.object({
        title: z.string(),
        status: z.enum(['pending', 'in_progress', 'complete', 'failed']),
        tasks: z.array(z.object({ id: z.string(), title: z.string(), status: z.enum(['pending', 'in_progress', 'complete', 'failed']) })),
      })),
    }),
  }),

  // 2. streamReportSection — HAS execute (server stores section)
  streamReportSection: createTool({
    description: 'Stream a section of the report to the user',
    inputSchema: z.object({
      sectionTitle: z.string(), content: z.string(), sectionIndex: z.number(), isComplete: z.boolean(),
    }),
    execute: async ({ sectionTitle, content, sectionIndex, isComplete }) => ({ sectionTitle, content, sectionIndex, isComplete }),
  }),

  // 3. reportSources — HAS execute (returns source data)
  reportSources: createTool({
    description: 'Report discovered sources and citations',
    inputSchema: z.object({
      sources: z.array(z.object({
        title: z.string(), url: z.string(), description: z.string(),
        sourceType: z.enum(['web', 'pro', 'api']), favicon: z.string().optional(),
      })),
      totalCount: z.number(),
    }),
    execute: async ({ sources, totalCount }) => ({ sources, totalCount }),
  }),

  // 4. askClarification — client-side, NO execute (waits for addToolOutput)
  askClarification: createTool({
    description: 'Ask the user for clarification before proceeding',
    inputSchema: z.object({ message: z.string(), options: z.array(z.string()).optional() }),
  }),

  // 5. browserAgentAction — HAS execute
  browserAgentAction: createTool({
    description: 'Report browser agent activity',
    inputSchema: z.object({
      action: z.enum(['start', 'navigating', 'extracting', 'awaiting_input', 'complete']),
      url: z.string().optional(), description: z.string().optional(),
    }),
    execute: async (input) => input,
  }),

  // 6. setChatTitle — HAS execute
  setChatTitle: createTool({
    description: 'Set the chat title based on the conversation',
    inputSchema: z.object({ title: z.string() }),
    execute: async ({ title }) => ({ title }),
  }),

  // 7. renderUI — universal GenUI renderer, HAS execute
  renderUI: createTool({
    description: 'Render a UI component in chat: charts, tables, metrics, callouts',
    inputSchema: z.object({
      component: z.object({ type: z.string(), props: z.record(z.any()), children: z.array(z.any()).optional() }),
    }),
    execute: async ({ component }) => component,
  }),
};
```

**Key distinction:** Tools 1 and 4 have NO `execute` — client-side only. Tool 4 (`askClarification`) blocks the LLM until `addToolOutput({ tool, toolCallId, output: userResponse })` is called from the frontend.

---

## Part 4: Views & User Flows

### 4.1 Existing Views (13 — already working)

| View | Component | Route | Description |
|------|-----------|-------|-------------|
| Login | `pages/Login` | `/login` | JWT auth form |
| Overview | `pages/Overview` | `/` | Conversation list + new chat |
| Research | `pages/Research` | `/research/:id` | Main chat interface with Thread |
| Notebooks | `pages/Notebooks` | `/notebooks` | Saved conversations browser |
| Workbench | `pages/Workbench` | `/workbench` | Artifact inspector |
| Workbench > Artifacts | tab | — | SHA-256 keyed content browser |
| Workbench > Manifests | tab | — | Tree snapshot viewer |
| Workbench > Pointers | tab | — | Mutable HEAD reference tracker |
| Workbench > Runs | tab | — | Run event timeline |
| Workbench > RAG | tab | — | Chunk inspector |
| Settings | `pages/Settings` | `/settings` | User/tenant config |
| SourcesPanel | sidebar | — | Citation source list |
| RunTimeline | sidebar | — | Event stream visualizer |

### 4.2 New Views (8 — to build)

| View | BL Item | Depends On | Description |
|------|---------|------------|-------------|
| **DeliverableSelector** | BL-008 | DeliverableStore | Segmented control in chat input: Standard · Report · Website · Slides · Document. Writes to Zustand store. Sends `deliverable_type` with user message. |
| **PlanViewer** | BL-007 | SSE task_update events | Real-time task card grid. Cards: sequential number + title, ALL CAPS status badge (LOADING/PROCESSING/CREATING NOTES/SUCCESS/ERROR), elapsed timer (M:SS format), progress bar, color-coded left border (orange/blue/pink/green by category). |
| **Enhanced SourcesPanel** | BL-011 | Entity API | Add "Web Sources" tab to existing SourcesPanel. 4 tabs: All, Web, Data, Generated. No backend query at display time — entities already in frontend Map from `references_found` events. |
| **Enhanced RunTimeline** | BL-014 | New event types | Add new event type renderers to existing RunTimeline. Currently hard-filters to subset — add planning, tool, and report events. |
| **ReportPanel** | BL-009 | rehype pipeline + Plotly | Separate panel (NOT in Thread) rendering MarkupDocument via rehype-to-JSX. Contains GML layout, charts, citations, metrics. Toggle between report and chat via tabs. |
| **WebsitePreview** | BL-010 | Artifact API | Sandboxed iframe. Loads website bundle via authenticated API endpoint → blob URL. `sandbox="allow-scripts allow-same-origin"`. No public URL in v1 (DEC-044). |
| **ProgressOverlay** | BL-020 | SSE report preview events | Floating overlay: "Generating output..." + single continuous progress bar (0-100%, NOT reset per substep) + gray substep text. Data from DeliverableStore.generationProgress. |
| **ClarificationBanner** | BL-021 | SSE clarification events | Minimal v1 (DEC-047 defers full UI to v1.5). Shows clarification question + free-text response input. Submits to `/agent/resume`. |

### 4.3 User Flows (8)

**Flow 1: Standard Chat**
User types → POST /agent/chat → SSE stream_start → message_delta tokens → ai_message → done → display in Thread

**Flow 2: Report Generation**
User selects "Report" in DeliverableSelector → types query → POST with `deliverable_type: "REPORT"` → task_update events drive PlanViewer → research workers execute → node_report_preview_start → delta streaming into ReportPanel → preview_done replaces buffer → healer validates → GML rendered via rehype → user sees full report with charts + citations

**Flow 3: Website Generation**
User selects "Website" → POST → same research phase → done with `has_async_entities_pending: true` → arq job generates website → references_found with WEBSITE entity → WebsitePreview renders iframe with blob URL → companion report also generated (co-gen)

**Flow 4: Document Export**
From ReportPanel → click "Export PDF" → GET /runs/{id}/export?format=pdf → backend renders MarkupDocument → HTML → WeasyPrint → PDF with chart images (kaleido) → download

**Flow 5: Workbench Inspection**
Navigate to /workbench → browse artifacts by entity_type → click artifact → see content + manifest tree + pointer history → view run that created it → see full event timeline

**Flow 6: RAG Upload**
Navigate to notebooks → upload document → auto_index_manifest() fires (asyncio background task) → OpenSearch/pgvector chunks indexed (512 tokens, 50% overlap) → document appears in Knowledge Base entities

**Flow 7: Progress Monitoring**
During research run → PlanViewer shows task cards (pending → processing → creating_notes → success) → ProgressOverlay shows generation progress → RunTimeline shows full event log → on completion, counters show token usage + cost

**Flow 8: Billing Lifecycle**
New user → sandbox (10 free runs) → upgrade via /billing/checkout → Stripe checkout → webhook confirms → subscription active → pro quota (200 runs) → monthly cron calculates overage → invoice sent → webhook records payment

---

## Part 5: Build Sequence

### P0 Fixes (before any wave)

| Fix | Problem | Solution | Files |
|-----|---------|----------|-------|
| **P0-1: arq Worker Bug** | `WorkerSettings.functions` evaluates at class def time → empty list. Redis has `profiles: ["full"]` → not started by default. | Make `functions` a callable. Remove profiles from redis. Add REDIS_URL to .env. | `core/jobs.py`, `docker-compose.yml`, `.env` |
| **P0-2: Sequence Race** | `_get_next_sequence()` SELECT max + 1 without locking → IntegrityError under parallel Send() | Atomic INSERT with subquery + 3-retry wrapper. Remove `_get_next_sequence()`. | `repositories/runs.py` |
| **P0-3: Tenant on Run** | No `tenant_id` on Run model → expensive join for billing | Add `tenant_id` FK to Run + populate from auth context | `models/runs.py`, `api/v1/agent.py`, migration 0005b |

### Wave 0: Foundation (1.5 weeks, all parallel)

| Item | Type | What | Pattern Ref | Key Files |
|------|------|------|-------------|-----------|
| Migration 0005a | Infrastructure | `entity_type`, `entity_metadata` on Artifact | Backend §2.1 | migration file + `models/substrate.py` |
| Migration 0005b | Infrastructure | Message extensions + tenant_id on Run | Backend §1.2 (Message) | migration + `models/conversations.py`, `models/runs.py` |
| Migration 0005c | Infrastructure | Subscription + UsageRecord tables | Backend §2.2 | migration + `models/billing.py` (new) |
| BL-002 | Contracts | ~10 new RunEvent types + Pydantic payloads + TS types | Backend §1.2, Integration §1.2 | 4-surface rollout (Integration §2) |
| BL-004 | Contracts | MarkupDocument AST + MarkupHealer | Backend (healer algo in Part 1C above) | `schemas/markup.py`, `services/markup/healer.py` |
| BL-015 | Frontend | DeliverableStore (Zustand) | Frontend §5.1 | `stores/deliverable-store.ts` |
| BL-008 | Frontend | DeliverableSelector component | Frontend §9 | `components/chat/DeliverableSelector.tsx` |
| BL-022 | Contracts | DataBrief schema + add to ResearchState | Backend §1.1 | `schemas/data_brief.py` |
| BL-003 | Standalone | Brave Search + Jina Reader wrappers | — | `agents/tools/web_search.py`, `web_scrape.py` |

### Wave 1: Core Platform (2 weeks)

| Item | Type | What | Pattern Ref | Key Files |
|------|------|------|-------------|-----------|
| BL-001 (XL, 5 sub-PRs) | Core | ResearchAssistantGraph extension: state, planner, fan-out, workers, synthesis, router | Backend §3.1-§3.4 | `agents/graphs/research_assistant.py`, `agents/nodes/*.py` |
| BL-007 | Frontend | PlanViewer with task cards | Frontend §5.3, §3.3 | `components/plans/PlanViewer.tsx`, `stores/plan-store.ts` |
| BL-014 | Frontend | Enhanced RunTimeline | — | `components/runs/RunTimeline.tsx` (modify) |
| BL-020 | Frontend | Progress Overlay | Frontend §9 | `components/chat/ProgressOverlay.tsx` |
| BL-012 (L) | Billing | Stripe integration: services + webhook + routes | Backend §4.2, §5.2; Integration §4 | `services/billing/*.py`, `api/v1/billing.py`, `api/v1/webhooks.py` |
| BL-016 scaffold | Entity | Entity artifact CRUD + API | Backend §4.3; Integration §3 | `services/entities/entity_service.py`, `api/v1/entities.py` |
| BL-009 fixture | Frontend | ReportRenderer with rehype pipeline (fixture data) | Frontend §6, §7 | `components/reports/ReportPanel.tsx`, `gml-registry.ts` |

### Wave 2: Deliverables & Integration (2 weeks)

| Item | Type | What | Key Files |
|------|------|------|-----------|
| BL-005 | Core | Report generation (multi-stage pipeline) | `agents/nodes/report_generator.py` |
| BL-006 | Core | Website generation (arq background job) | `agents/nodes/website_generator.py`, `services/website/bundle_service.py` |
| BL-018 | Core | Slides pipeline (reveal.js) | `agents/nodes/slides_generator.py` |
| BL-003 integration | Integration | Wire web tools into orchestrator | `agents/nodes/research_worker.py` (modify) |
| BL-013 | Billing | Quota enforcement middleware | `api/middleware/quota.py` |
| BL-017 | Core | Meta-reasoning node | `agents/nodes/meta_reasoning.py` |
| BL-021 | Core | Clarification flow (backend contract) | `api/v1/agent.py` (resume endpoint) |
| BL-022 integration | Integration | DataBrief population in synthesis | `agents/nodes/synthesis.py` (modify) |

### Wave 3: Polish & Integration (1.5 weeks)

| Item | Type | What | Key Files |
|------|------|------|-----------|
| BL-009 full | Integration | ReportRenderer with real artifacts | `components/reports/ReportPanel.tsx` (modify) |
| BL-010 | Frontend | WebsitePreview (iframe) | `components/reports/WebsitePreview.tsx`, `api/v1/artifacts.py` |
| BL-011 | Frontend | Enhanced SourcesPanel (web sources tab) | `components/sources/SourcesPanel.tsx` (modify) |
| BL-016 citation | Integration | Citation binding (entity ↔ report) | `services/entities/entity_service.py` (modify) |
| BL-019 | Core | Document export (PDF/DOCX) | `services/export/pdf_service.py`, `docx_service.py`, `api/v1/exports.py` |

### Critical Path: 7 weeks
```
Migration 0005 → BL-002 → BL-001 → BL-005 → BL-016 → BL-011
```

---

## Part 6: Verification

### Infrastructure Check
```bash
cd /Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126
docker compose up -d postgres minio minio-init opensearch redis
uvicorn intelli.main:app --reload --port 8000     # terminal 1
./scripts/start-worker.sh                          # terminal 2
cd ui && npm run dev                               # terminal 3
```

### E2E Verification (10 steps after Wave 3)

1. `curl http://localhost:8000/health/ready` → 200
2. Log in, select "Report" deliverable type
3. Send: "What are the latest trends in commercial real estate technology in 2026?"
4. **Observe:** PlanViewer shows 5+ research tasks appearing (PLAN_CREATED → TaskCards)
5. **Observe:** Tasks transition pending → processing → done with ProgressOverlay
6. **Observe:** ReportPanel shows report with sections, Plotly charts, citations
7. **Observe:** SourcesPanel shows web sources with URLs
8. Click "Export PDF" — downloads formatted PDF with chart images
9. Check billing: `usage_records` created with `cost_cents > 0`, linked to tenant
10. Send another query with "Website" type — iframe preview renders, companion report via arq

### Test Strategy

| Tier | Marker | CI Cadence | Cost Control |
|------|--------|------------|--------------|
| Unit | `@pytest.mark.unit` | Every push | Zero — no external calls |
| Integration | `@pytest.mark.integration` | Every PR | Zero — fake API keys |
| Live | `@pytest.mark.live` | Manual trigger | `max_tokens=2000`, fast models, $0.50 cap |

### Standards

- **API routes:** FastAPI router → Pydantic request/response → service layer. No logic in handlers.
- **DB access:** SQLAlchemy 2.0 async. `async_sessionmaker(expire_on_commit=False)` (DEC-051). New columns nullable.
- **SSE events:** ALL 4 surfaces per new event type (Integration §2).
- **LLM output:** `with_structured_output(PydanticModel)` for JSON (DEC-050).
- **Frontend:** shadcn/ui primitives. Zustand stores. GML in separate ReportPanel (DEC-043).
- **Tests:** New tests marked with appropriate tier.
- **LangGraph:** Extend existing graph (DEC-012). Per-node sessions (DEC-051). Send() only from conditional edges.
- **Error handling:** Complete with partial data rather than hard fail.

---

## Appendix: Library Doc Reference

| Library | Install | Key Doc | NYQST-Specific Config |
|---------|---------|---------|----------------------|
| LangGraph | `pip install langgraph` | [Send() map-reduce](https://langchain-ai.github.io/langgraph/how-tos/map-reduce/) | Per-node sessions, budget accumulator, PlanSet events |
| Zustand | `npm install zustand` | [Middleware](https://docs.pmnd.rs/zustand/guides/typescript) | `devtools` middleware for debug, file-level singletons |
| shadcn/ui | `npx shadcn-ui@latest add` | [Components](https://ui.shadcn.com/docs/components) | HSL variables, NYQST chart palette in CSS |
| react-plotly.js | `npm install react-plotly.js plotly.js-dist-min` | [React Plotly](https://plotly.com/javascript/react/) | Lazy load, plotly.js-dist-min (1.2MB not 8MB) |
| unified + rehype | `npm install unified rehype-parse rehype-react` | [rehype-react](https://github.com/rehypejs/rehype-react) | Lowercase component map, fragment: true |
| Stripe | `pip install stripe` | [Subscriptions](https://docs.stripe.com/billing/subscriptions/overview) | Raw body for webhooks, test mode from Day 1 |
| arq | `pip install arq` | [Quick start](https://arq-docs.helpmanual.io/) | `functions` as callable, separate worker process |
| FastAPI SSE | built-in | [StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/) | PG LISTEN/NOTIFY trigger, 25s heartbeat |
| Alembic | `pip install alembic` | [Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html) | env.py reads URL from pydantic-settings, NOT alembic.ini |
| WeasyPrint | `pip install weasyprint` | [First steps](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html) | macOS: brew install pango cairo. Charts via kaleido. |
| python-docx | `pip install python-docx` | [Quickstart](https://python-docx.readthedocs.io/en/latest/) | Map MarkupDocument → paragraphs/tables |
| reveal.js | `npm install reveal.js` | [Full setup](https://revealjs.com/installation/) | Standalone HTML with embedded CSS/JS |
| Pydantic v2 | built-in | [Discriminated unions](https://docs.pydantic.dev/latest/concepts/unions/) | `Annotated[Union[...], Field(discriminator='type')]` |
| SQLAlchemy 2.0 | built-in | [Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html) | `expire_on_commit=False` for parallel nodes |
| @assistant-ui/react | existing | [Custom transport](https://www.assistant-ui.com/docs/runtimes/assistant-transport) | useExternalStoreRuntime with Zustand message store |

---

## Appendix: 52+ Locked Decisions (Quick Reference)

Full register: `docs/plans/DECISION-REGISTER.md`

**Scope:** DEC-001 (v1 scope), DEC-002 (deferred), DEC-003 (meta-reasoning YES), DEC-005 (5 feature flags)

**Architecture:** DEC-012 (extend graph), DEC-013 (Send fan-out), DEC-014 (plans as events), DEC-016 (entity via Artifact), DEC-018 (PG LISTEN/NOTIFY SSE), DEC-021 (dual streams), DEC-043 (GML in ReportPanel), DEC-051 (per-node sessions), DEC-052 (split migrations), DEC-053 (local topology)

**Technology:** DEC-015a/b (JSON AST + rehype), DEC-022 (answer wrapper + GML), DEC-023 (deliverable_type on USER msg), DEC-024 (co-gen), DEC-025 ($20/200 runs), DEC-030 (WeasyPrint), DEC-031 (reveal.js), DEC-042 (OpenAI-only v1), DEC-045 ($2/run budget), DEC-046 (MCP search), DEC-048 (Plotly.js), DEC-050 (structured output)

**Testing:** DEC-070 (real LLM), DEC-071 (CI cost control), DEC-072 (cadence)

**NOT replicating:** DEC-034 (v0.app), DEC-038 (Ory Kratos), DEC-060-067 (Firecrawl, FactSet, PostHog, Sanity, OneSignal, OTEL)

---

## Appendix: TypeScript RunEvent Union (THE Frontend Contract)

This is the single most important type in the frontend. Every SSE event is parsed into this union. Field names MUST match Pydantic models exactly (snake_case).

```typescript
// ui/src/types/run-events.ts — discriminated union on "type"
export type RunEvent =
  // Lifecycle (4)
  | { type: 'stream_start'; chat_id: string; creator_user_id: string; user_chat_message_id: string; workspace_id: string }
  | { type: 'heartbeat' }
  | { type: 'done'; has_async_entities_pending?: boolean; message?: Message }
  | { type: 'ERROR'; error_type: string; error_message: string }
  // Text (4)
  | { type: 'message_delta'; delta: string }
  | { type: 'ai_message'; message: Message }
  | { type: 'message_is_answer'; is_answer: boolean }
  | { type: 'chat_title_generated'; title: string }
  // Planning (3)
  | { type: 'task_update'; key: string; title: string; message: string; status: 'loading' | 'success' | 'error'; plan_set: PlanSet; metadata?: Record<string, any>; timestamp: number }
  | { type: 'pending_sources'; pending_sources: PendingSource[] }
  | { type: 'references_found'; references: Entity[] }
  // Tool Execution (3)
  | { type: 'node_tools_execution_start'; node_id: string; plan_id: string; plan_set_id: string; tool_ids: string[]; total_tools: number; timestamp: number }
  | { type: 'node_tool_event'; event: string; node_id: string; plan_id: string; plan_set_id: string; tool_id?: string; tool_type?: string; metadata?: Record<string, any>; timestamp: number }
  | { type: 'update_subagent_current_action'; current_action: string; node_id: string; plan_id: string; plan_set_id: string; tool_id?: string; timestamp: number }
  // Report Preview (3)
  | { type: 'node_report_preview_start'; preview_id: string; report_title: string; report_user_query: string; final_report: boolean; node_id: string; plan_id: string; plan_set_id: string; entity: Entity; section_id?: string; timestamp: number; workspace_id: string }
  | { type: 'node_report_preview_delta'; preview_id: string; delta: string; node_id: string; plan_id: string; plan_set_id: string; section_id?: string }
  | { type: 'node_report_preview_done'; preview_id: string; content: string; report_title: string; final_report: boolean; node_id: string; plan_id: string; plan_set_id: string; entity?: Entity; timestamp: number; workspace_id: string }
  // Browser/HIL (3)
  | { type: 'browser_use_start'; browser_session_id: string; browser_stream_url: string; timestamp: number }
  | { type: 'browser_use_stop'; browser_session_id: string }
  | { type: 'browser_use_await_user_input'; browser_session_id: string; agent_message?: string }
  // Clarification (2)
  | { type: 'clarification_needed'; message: Message }
  | { type: 'update_message_clarification_message'; update: { chat_message_id: string; needs_clarification_message: string | null } }
  // NYQST Extensions (3)
  | { type: 'ping'; timestamp: string }
  | { type: 'usage-update'; input_tokens: number; output_tokens: number; total_tokens: number; cost_cents?: number }
  | { type: 'message-file'; file_id: string; file_name: string; mimetype: string };

// Supporting types
export type PlanSet = { plans: Record<string, Plan>; chat_id: string; workspace_id: string };
export type Plan = { plan_tasks: Record<string, PlanTask>; previous_plan_id: string | null; status: string };
export type PlanTask = { title: string; message: string; previous_task_id: string | null; status: 'pending' | 'processing' | 'creating_notes' | 'success' | 'error' };
export type PendingSource = { plan_id: string; plan_set_id: string; plan_task_id: string; title: string; type: 'WEB' | 'DOCUMENT' | 'CODING_AGENT'; web_domain?: string };
export type EntityType = 'WEB_PAGE' | 'EXTERNAL_API_DATA' | 'GENERATED_CONTENT' | 'USER_QUERY_PART' | 'GENERATED_REPORT' | 'GENERATED_PRESENTATION' | 'INTRA_ENTITY_SEARCH_RESULT' | 'EXTRACTED_ENTITY' | 'SEARCH_PLAN' | 'KNOWLEDGE_BASE' | 'WEBSITE' | 'GENERATED_DOCUMENT';
export type Entity = { entity_type: EntityType; identifier: string; title?: string; file_name: string; mimetype: string; workspace_id: string; stored_entity_id?: string; content_artifact_id?: string; external_url?: string; all_seen_entities: string[]; cited_entities: string[] };
```

---

## Appendix: Source File Manifest

All reconstruction files produced by the multi-wave agent swarm:

```
docs/design-reconstruction/
├── 01-inventory/
│   ├── PLANS-DOCS-INVENTORY.md                    # 14 planning docs catalog
│   ├── ANALYSIS-DOCS-INVENTORY.md                 # 16 analysis docs catalog
│   ├── GENUI-PROTOTYPES-INVENTORY.md              # 6 GenUI prototype descriptions
│   ├── CONTEXT-SYSTEM-REPORTS-INVENTORY.md         # Context engineering reports
│   ├── NYQST-MCP-RESEARCH-INVENTORY.md            # MCP research docs
│   ├── DEV-REPO-PRD-ADR-INVENTORY.md              # PRD + ADR catalog from dev repo
│   ├── SUPERAGENT-JS-BUNDLES-INVENTORY.md         # Superagent JS bundle analysis
│   └── ROOT-FILES-CHAT-EXPORT-INVENTORY.md        # Root files + chat export
├── 02-domain-extracts/
│   ├── ORCHESTRATION-DOMAIN.md                    # PlanSet/Plan/PlanTask, fan-out, meta-reasoning
│   ├── GENUI-RENDERING-DOMAIN.md                  # 18 GML tags, healer, rehype pipeline
│   ├── STREAMING-EVENTS-DOMAIN.md                 # 22 event types, NDJSON protocol
│   ├── BILLING-METERING-DOMAIN.md                 # Pricing model, Stripe, quota
│   ├── ENTITY-CITATION-DOMAIN.md                  # 12 entity types, citation buffer, lifecycle
│   └── FRONTEND-ARCHITECTURE-DOMAIN.md            # 6 Zustand stores, component tree, routing
├── 03-patterns/
│   ├── BACKEND-PATTERNS.md           (860 lines)  # Pydantic schemas, SQLAlchemy, services, API routes, LangGraph
│   ├── FRONTEND-PATTERNS.md          (1536 lines) # GenUI (27+17), renderer, stores, hooks, components
│   └── INTEGRATION-PATTERNS.md       (860 lines)  # Event chain, 4-surface rollout, billing, auth, SSE lifecycle
├── 04-hypotheses/
│   ├── DESIGN-CONSISTENCY-TEST.md                 # Plan internal consistency verification
│   ├── CODE-DOC-ALIGNMENT-TEST.md                 # Code vs. documentation alignment
│   ├── COMPETITIVE-GAPS-TEST.md                   # Dify comparison gaps
│   └── TECHNICAL-FEASIBILITY-TEST.md              # LangGraph Send() + WeasyPrint feasibility
├── 05-synthesis/
│   ├── SYSTEM-ARCHITECTURE.md                     # Platform architecture summary
│   ├── REUSABLE-CODE-CATALOG.md                   # Categorized reusable code
│   ├── GAP-ANALYSIS-SUMMARY.md                    # 51 gaps prioritized
│   └── MASTER-INDEX.json                          # Machine-readable file index
├── 06-docuintelli/
│   ├── DOCUINTELLI-SKILLS-EXTRACT.md              # 54 types, 16 frameworks, 17 models
│   ├── DOCUINTELLI-BACKEND-SCAN.md                # Backend code scan
│   ├── DOCUINTELLI-FRONTEND-SCAN.md               # Frontend code scan
│   └── DOCUINTELLI-REUSABLE-CATALOG.md            # Reusable code from DocuIntelli
├── 07-synthesis/
│   ├── CODE-DOC-REVALIDATION.md                   # Post-DocuIntelli alignment check
│   ├── DOCUINTELLI-GAP-MERGE.md                   # Merged gaps
│   ├── MASTER-INDEX-W6.json                       # Updated index with DocuIntelli
│   └── DOCUINTELLI-PLATFORM-SYNTHESIS.md          # Platform synthesis with DocuIntelli
└── 08-extracts/
    ├── FRONTEND-RECIPES.md                        # 8 implementation recipes
    ├── GENUI-ZOD-DESIGN-TOKENS.md                 # Zod schemas + design tokens
    ├── DOCUINTELLI-DOMAIN-SPECS.md                # Full domain specs
    ├── BACKEND-SERVICE-API-PATTERNS.md            # Service + API patterns
    ├── FRONTEND-COMPONENT-STORE-PATTERNS.md       # Component + store patterns
    ├── INTEGRATION-FLOW-PATTERNS.md               # Integration flows
    └── GAP-PLATFORM-SYNTHESIS.md                  # Gap analysis + synthesis

Total: 40+ files, ~30,609 lines, ~1.5MB
```
