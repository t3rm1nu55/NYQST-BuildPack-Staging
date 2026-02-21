---
document_id: PRD-ADR-DIGEST
version: 1
date: 2026-02-19
sources: [PRD 01-09, ADR 001-010, requirements/WHAT-TO-BUILD-FIRST.md]
---

# PRD & ADR Vision Digest

**Purpose:** Authoritative reference for evaluating all implementation decisions against the established product vision, user model, and architectural commitments.

**Sources read:**
- `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/docs/prd/` (01–09)
- `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/docs/adr/` (001–010)
- `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/requirements/WHAT-TO-BUILD-FIRST.md`

---

## Section 1: Product Vision

### What Is NYQST?

NYQST is **deterministic agentic infrastructure for the mid-cap enterprise**. It is the "Cognitive ERP" — the structured layer that makes agentic workforces productive rather than chaotic. The platform externalizes organizational knowledge into an ontology, then injects that context into AI agents at zero latency, enabling organizations to deploy burst-elastic agent teams without the knowledge-loss and context-loading problems that afflict human labor.

It is not a chat interface, not an AI assistant, and not a generic automation tool. It is knowledge infrastructure: auditable, deterministic, sovereign.

**Core thesis:** "In a world where intelligence is abundant and cheap, the only enduring competitive advantage is the structured context within which that intelligence operates."

### Target Users

**Organizational profile:** Mid-cap enterprises with fiduciary responsibilities — $500M–$10B AUM, 20–200 knowledge workers, regulated or quasi-regulated industries, document-intensive workflows. These organizations face enterprise-grade requirements without enterprise-grade budgets.

**PropSygnal personas:**
- Investment Analyst (2–5 yrs) — screens deals, builds models, coordinates DD
- Investment Director/Principal (8–15 yrs) — deal leadership, team management, IC decisions
- Asset Manager (5–12 yrs) — covenant monitoring, reporting, lease events, value-add
- Fund/Portfolio Manager (15–25 yrs) — portfolio intelligence, investor reporting, governance
- Property Manager (3–10 yrs) — operations, compliance, tenant management
- Financial Controller (10–20 yrs) — covenant calculations, audit support, NAV

**RegSygnal personas:**
- Compliance Officer — regulatory tracking, gap analysis, defensible audit trails
- Regulatory Analyst — interpretation, implementation mapping
- Technology Lead (RegTech) — requirement specs, traceability, test cases

**Universal user requirements across all personas:**
1. Explainability — show sources and reasoning; "the AI said so" is not acceptable
2. Accuracy over speed — errors are costly; hallucinations are career-ending
3. Integration — work with existing tools (Excel, Argus), do not replace them
4. Auditability — everything traceable; regulators, auditors, investors will ask
5. Appropriate confidence — flag uncertainty explicitly; never guess silently

### Commercial Positioning

**Positioning:** "Sovereignty over Knowledge" — not making people faster with tools, making organizations smarter with infrastructure.

**Price point:** ~$200k/annum (positioned as capitalizing knowledge work, equivalent to two analysts with perfect memory and absolute governance adherence).

**Two implementation packages:**
- **Accelerate** — high-velocity expansion, adaptive fluid ontology, throughput focus ("Capture opportunity")
- **Preserve** — institutional asset management, rigid standard-compliant ontology, auditability focus ("Defend the asset")

**Competitive differentiation:** Most competitors build chat interfaces on top of chaos. NYQST builds the ordered foundation underneath. The barrier is no longer technical capability — it is architectural discipline.

**Not:** an AI model company, a generic automation platform, a replacement for existing systems. NYQST is an integration layer adding structure underneath AI capability.

### Key Product Design Values

1. **Evidence by default** — every output traces to source; this is fundamental architecture, not a compliance feature
2. **AI for translation, deterministic engines for truth** — AI handles extraction and interpretation; deterministic engines handle calculations
3. **Schema-first development** — data model defined before features; becomes the contract between components
4. **Human oversight at checkpoints** — AI accelerates; humans retain judgment on high-stakes decisions
5. **One source of truth** — data flows through the lifecycle with a full audit trail; no module-specific "truth"
6. **Strong kernel, weak periphery** — the backbone is rigid around containers, sessions, provenance, runs, promotion, policy, and indexing contracts; domain content is extensible

---

## Section 2: Product Capabilities (from PRD 04_PRODUCTS)

### Platform Modules (6 modules, all products build on these)

| Capability | Description |
|---|---|
| **Research** | NotebookLM-like fast search and deep research with full provenance; semantic search understands domain context |
| **Document Management** | Immutable versioned file storage, bundle/corpus organization, ingestion from tough sources (scanned PDFs, legacy formats) |
| **Analysis** | Infinite canvas for visual exploration of relationships, patterns, and connections across the knowledge base |
| **Modelling** | Provable methods with data provenance and explicit ambiguity management; claims tracked from extraction through verification |
| **Knowledge & Domain Management** | Ontology management, domain model definitions, context injection for agents; the "Graph" that is a core IP asset |
| **Organisational Insight** | Practical intelligence surfaced from accumulated data; portfolio dashboards, alerts, trend analysis, report generation |

### Core Infrastructure (underlies all modules)

| Capability | Description |
|---|---|
| **Agentic System** | Constrained agents operating within defined boundaries with full action logging; workflow vs. agent distinction preserved |
| **Skills Framework** | Discrete versioned reusable capabilities (e.g., Lease.Extract, Covenant.Calculate) at session/user/org levels |
| **Session Management** | User + project/objective + compute context binding; "return to topic" capability across devices |
| **Assisted Workflows** | Guided process execution with human-in-the-loop checkpoints; Camunda-backed governance for regulated processes |
| **Document Processing Pipeline** | Tiered parsing (Fast/Standard/Deep) producing canonical DocIR; adapter pattern supports swappable parsers |
| **Index Service** | Profile-driven always-on indexing (BM25, semantic, hybrid); stable contract with swappable backends |
| **Run Ledger** | Append-only event stream capturing all agent actions, tool calls, artifact production, pointer moves, human approvals |

### PropSygnal Product Areas

| Area | Focus | MVP Status |
|---|---|---|
| **Debt & Credit** | Covenant monitoring (DSCR, LTV, ICR, Debt Yield), rent roll extraction, lender pack generation with full evidence trails | **CURRENT MVP FOCUS** |
| **Asset Management** | Quarterly reporting, value-add tracking, capex/opex analysis, business plan management | Phase 2 |
| **Investment & Acquisitions** | Deal screening, DD automation, IC memo generation, market research | Phase 2 |
| **Development & Project Management** | Cost/programme control, BSA gateway compliance, planning process support | Phase 3 |
| **Property Management** | Leasing, operations, tenant management, compliance, service charges | Phase 3 |

### RegSygnal Product Areas

| Area | Focus | Status |
|---|---|---|
| **Regulatory Intelligence** | Requirement extraction, change detection, cross-regulation mapping | Planning |
| **Reporting Validation** | Schema validation, reconciliation, exception tracking, submission audit trails | Planning |
| **Compliance Modelling** | Requirement decomposition, ambiguity capture, logic modelling, implementation mapping | Planning |

---

## Section 3: Roadmap Phases

### Phase 0: Platform Foundation (Q1 2026 — Current)

**Objective:** Establish the core infrastructure that all products will build upon.

**Key deliverables:**
- Artifact substrate (immutable storage, manifests, pointers) — **Complete**
- Run ledger (append-only audit trail) — **Complete**
- Authentication (multi-tenant JWT + API key) — **Complete**
- MCP tools (agent tool integration) — **Complete**
- Workbench UI (React-based IDE interface) — In Progress
- Agent runtime (LangGraph-based orchestration) — In Progress
- Skills framework — In Progress
- Document ingestion pipeline — In Progress
- Analysis canvas — Planned
- Assisted workflows — Planned

**Success criteria:** Documents ingested from 5+ formats, agents execute skills with full audit trail, users can configure and monitor agent behavior.

### Phase 1: Platform Complete + PropSygnal Debt MVP (Q2 2026)

**Objective:** Complete all six platform modules and deliver single-asset covenant monitoring.

**PropSygnal Debt MVP scope:**
- Document ingestion (rent rolls, operating statements, loan agreements)
- AI-powered extraction with confidence scores
- Covenant calculations: DSCR, LTV, ICR, Debt Yield
- Evidence trails for every calculation
- Lender pack generation (Excel with full audit trail)
- Alert system for covenant risk

**Success criteria:** 95%+ extraction accuracy, 100% calculation accuracy (deterministic), 80% time reduction vs manual, users confident to submit outputs to lenders.

### Phase 2: PropSygnal Expansion (Q3 2026)

**Objective:** Asset Management + Investment & Acquisitions + portfolio scale (50+ assets).

Key deliverables: quarterly report generation, deal screening automation, DD workflows, IC memo first drafts, multi-asset dashboards.

### Phase 3: PropSygnal Full Suite (Q4 2026)

**Objective:** All five PropSygnal areas operational; full lifecycle coverage.

Adds Development & Project Management and Property Management. Data flows seamlessly from acquisition through exit in a single platform.

### Phase 4: Ecosystem + RegSygnal (2027+)

**Objective:** API access, integrations (Yardi, MRI, SharePoint, Bloomberg, CoStar), white-label options, RegSygnal v1 pilot.

### RegSygnal Timeline

| Phase | Focus | Timeline |
|---|---|---|
| Phase 1 | Architecture & domain models | Q2 2026 |
| Phase 2 | Pilot regulatory framework | Q3 2026 |
| Phase 3 | Reporting validation | Q4 2026 |
| Phase 4 | Full compliance modelling | 2027 |

---

## Section 4: ADR Decisions Summary

| ADR | Title | Decision | Status | Key Implications |
|---|---|---|---|---|
| **001** | Data Model Strategy | Domain-first with CDM mapping — custom NYQST model for all platform primitives and commercial entities; CDM used as integration layer only | Accepted | Platform primitives (Artifact, Manifest, Pointer, Run, Session) are fully custom; CDM Helper MCP is optional for CRM integration; do not constrain core model to CDM |
| **002** | Code Generation Strategy | Schema-first code generation — FastAPI/Pydantic generates OpenAPI spec; `openapi-typescript` generates TypeScript types for frontend; single source of truth is Pydantic | Proposed | API changes must automatically propagate to frontend types; CI check enforces types are in sync; separate SQLAlchemy and Pydantic models preserved for flexibility |
| **003** | Virtual Team Architecture | Virtual Team Operating System — Engineering Playbook (Confluence), agent coordination layer (project registry, questions queue), standardized workflows, tool integration (CLAUDE.md, Copilot hooks) | Proposed | Devin for complex multi-step work; Claude Code for PR review; Copilot for inline suggestions; all agents follow shared conventions via shared context docs |
| **004** | Index Service Architecture | Contract-first, profile-driven Index Service with pluggable backends — OpenSearch primary, pgvector fallback; profiles (e.g., `docs.default`, `docs.citation_strict`) abstract backend details | Proposed | Modules never talk to search backends directly — only via profiles; always-on indexing triggered by pointer advance; backends swappable without product code changes; LangChain inside Index Service, LangGraph for orchestration |
| **005** | Agent Runtime Framework | LangGraph as primary orchestration runtime — clear boundary between LangGraph (operational/resumability) and platform substrate (authoritative audit); Vercel AI SDK used only on frontend | Proposed | LangGraph checkpoints are operational aids, NOT the audit record; platform run ledger is the canonical record; stream adapter bridges LangGraph events to AI SDK UI protocol; human-in-the-loop via LangGraph `interrupt_before/after` |
| **006** | Session & Workspace Architecture | Lightweight database session model — session row binds user + project + agent state references; no VM/container orchestration in foundation phase | Proposed | Sessions inherit context from project/objective hierarchy; LangGraph thread_id stored on session for resumability; workspace state is UI-only (not authoritative); container-per-session deferred until scale demands it |
| **007** | Document Processing Pipeline | Tiered pipeline with canonical DocIR format and pluggable parser adapters — Docling as primary adapter; Fast/Standard/Deep tiers; DocIR stored as content-addressed artifact | Proposed | Downstream modules depend on DocIR, not parser-specific formats; spans in DocIR enable evidence anchoring from day one; Index Service uses DocIR blocks for intelligent chunking; parser swap is a configuration change |
| **008** | MCP Tool Architecture | MCP as primary tool protocol — namespaced `{domain}.{resource}.{action}` convention; session-scoped dynamic discovery; execution pipeline (validate → policy check → execute → log → return) | Proposed | All tool calls logged to run ledger; policy engine check before every execution; existing flat-named tools require namespace migration; LangGraph's ToolNode is a thin wrapper over MCP tools; dynamic discovery reduces context window usage |
| **009** | Human-in-the-Loop & Governance | Policy-driven governance model — three layers: LangGraph interrupts (mechanism), platform approval workflows (structured records), trust level policy templates (configuration) | Proposed | Four policy templates: exploratory / standard / regulated / audit_critical; ApprovalRequest model captures full context; decisions recorded in run ledger; Camunda deferred but designed as upgrade path |
| **010** | Bootstrap Infrastructure | Purpose-fit services — PostgreSQL + pgvector for Platform MCP (Supabase/Neon free tier); Neo4j Aura for Domain Model MCP (graph queries for ISDA CDM, CRE ontologies); Redis/Upstash for cache/queue | Proposed | Validated by Dify analysis: production RAG platforms run on PostgreSQL + pgvector only; graph is isolated to Domain Model MCP; zero infrastructure cost during bootstrap; portable to any cloud when funded |

---

## Section 5: Architecture Principles

Derived from PRD 06_ARCHITECTURE and the ADR set:

### Substrate Principles

1. **Single source of truth** — Immutable artifacts + manifests + run ledger. No module-specific "truth." Every piece of data has one authoritative location.

2. **Ephemeral compute, persistent outputs** — Sessions, VMs, and workbenches are disposable. Outputs are published into the substrate. The substrate is permanent; compute is not.

3. **Pointers not mutations** — Reversion is moving pointers to older manifests (Git-like), not rewriting history. The past is immutable.

4. **Content-addressed storage** — Artifacts identified by SHA-256 of content, ensuring integrity and deduplication.

### Knowledge and Trust Principles

5. **Schema-on-read first, promote later** — Accept discovered structures initially. Promote stable structures with governance. Allows rapid exploration while maintaining rigor for production.

6. **Evidence by default** — Every output traces to source; not a compliance feature, a fundamental architectural requirement.

7. **AI for translation, deterministic engines for truth** — LLMs extract and interpret; versioned deterministic engines compute. DSCR = NOI / Debt Service, not "the AI estimated DSCR."

8. **Claims with confidence** — Extracted information is a claim with a confidence score and source location, not a fact. Claims require verification before becoming decisions.

### Agent and Governance Principles

9. **Agents are constrained workers** — Agent definitions specify capabilities, allowed tools, retrieval profiles, policy templates. Not autonomous; not magic.

10. **Policy-driven levels of care** — Required provenance, tool permissions, and gates vary by configurable policy templates (exploratory → standard → regulated → audit_critical). Higher-stakes work requires more verification.

11. **Everything is inspectable** — Agentic work produces structured events + artifacts, not just "chat logs." Every action, decision, and output can be examined and audited.

12. **LangGraph operational, substrate authoritative** — LangGraph checkpoints enable resumability; the platform run ledger is the canonical audit record. These are explicitly separate concerns.

### Integration Principles

13. **MCP as universal tool protocol** — All agent-platform interaction uses MCP with namespaced `{domain}.{resource}.{action}` convention. Single interop standard for internal and external tools.

14. **Contract-first with swappable backends** — Index Service, Document Pipeline, and infrastructure are defined by stable contracts; backends can be swapped without product code changes.

15. **Profile abstraction over configuration knobs** — Modules select profiles (e.g., `docs.citation_strict`), not chunking parameters. Users never see indexing internals.

16. **Strong kernel, extensible periphery** — Platform kernel (containers, sessions, provenance, runs, promotion, policy, indexing contracts) is rigid. Domain content (ontologies, models, schemas, skills) is extensible and promotable.

---

## Section 6: What the PRD Says to Build First

From `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/requirements/WHAT-TO-BUILD-FIRST.md`

### The Wedge Strategy: "Never Miss a Critical Date"

The core argument: 95% of failed AI projects had good technology — they failed on adoption. Don't launch a platform; launch a tool that does ONE thing so well professionals can't live without it, then expand.

**The chosen wedge: Lease Critical Date monitoring.**

Why this wedge:
- High pain: missing a break option costs $500k–$2M
- Frequent events: happening constantly across portfolios
- Visible to decision-makers: asset managers, portfolio managers, investors
- Low risk to try: runs in parallel with existing system
- Hard to do manually: 2000+ events across 500 leases scattered in documents
- Natural expansion: once they trust dates, they trust extraction, then analysis

**The "aha moment":** User uploads leases and discovers break options they didn't have calendared, with direct source citations. The demo only works if it finds something they missed.

### V1 Minimal Scope (Core, Must Have)

**Document Processing:**
- PDF/Word/image ingestion, OCR for scanned documents
- Basic structure extraction (pages, paragraphs), date pattern detection
- Lease identification

**Event Extraction:**
- Break options (date, notice period, conditions, party)
- Rent reviews, lease expiries, renewal options
- Confidence scoring per extraction
- Source citation (page, paragraph, highlighted text)

**Event Management:**
- Event calendar (filterable), deadline calculation from notice periods
- Alert rules with configurable lead times, email notifications, dashboard

**Verification UX:**
- Click extraction to see source document
- Highlight extraction in document
- Correct/confirm extraction with corrections feeding future extractions

### V1 Explicitly Deferred

Entity resolution, document relationships, claim/decision workflows, report generation, external integrations, multi-tenant complexity, advanced analytics.

### Expansion Path After V1

```
V1: Critical Dates
     → V2: Full Lease Extraction (trust earned on dates extends to extraction)
     → V3: Covenant Monitoring (same pattern: extract + monitor + alert)
     → V4: DD Acceleration (extracted lease data already available)
     → V5: Investor Reporting (generate from trusted data)
     → V6: Platform (users are dependent; now it's a platform)
```

### Architecture Guidance from WHAT-TO-BUILD-FIRST

- **Build now:** document ingestion pipeline, date/event extraction, event management engine, alert system, verification UX
- **Design now, build later:** entity resolution hooks, document relationship model, claim/decision framework, generation/review workflow
- The existing schemas are right — implement them incrementally
- Event schema: V1; Document schema (extraction part): V1; Claim schema: V3; Entity schema: V2–V3

**The 30-day plan:**
- Week 1: Extraction POC (PDF ingestion, date extraction, 85% accuracy target, verification UI)
- Week 2: Event Engine (event schema, deadline calculation, alert system, dashboard)
- Week 3: Integration (connect extraction to event engine, end-to-end flow)
- Week 4: User testing (3–5 real users, real leases, observe and learn)

---

## Section 7: Success Metrics

### Metrics Hierarchy

The PRD states explicitly: "Accuracy → Trust → Efficiency → Adoption → Growth." Accuracy is the foundation; everything else is downstream.

**Anti-metrics** (explicitly do NOT optimize for):
- Raw throughput (speed without accuracy is dangerous)
- Feature count (features without value add complexity)
- AI autonomy (more autonomy without more trust is risky)
- Engagement time (we want efficiency, not stickiness)

### Platform Accuracy Metrics (most critical)

| Metric | Target |
|---|---|
| Extraction Accuracy | 95%+ |
| Calculation Accuracy | 100% (deterministic engines guarantee this) |
| Claim Accuracy | 95%+ (user verification feedback) |
| False Positive Rate | <10% |
| False Negative Rate | <5% |

### Trust Metrics

| Metric | Target |
|---|---|
| Override Rate | <15% of AI outputs modified by users |
| Confidence Calibration | >0.9 correlation between stated confidence and actual accuracy |
| Trust Score (survey) | >4/5 |
| Verification Rate | Decreasing over time (users need to check less as trust builds) |

### PropSygnal Debt MVP Metrics

| Metric | Target |
|---|---|
| Covenant Calculation Accuracy | 100% |
| Extraction Accuracy (Rent Rolls) | 95%+ |
| Extraction Accuracy (Op Statements) | 95%+ |
| Lender Pack Generation Time | <30 minutes |
| User Confidence to Submit | >80% willing to submit to lenders without additional review |
| Time Savings | 80% vs manual process |

### Phase Gate Criteria

| Phase | Key Criteria |
|---|---|
| Phase 0 (Platform Foundation) | 5+ document formats, 100% of runs logged, basic canvas functional |
| Phase 1 (Debt MVP) | 95%+ extraction, 100% calculation, 80% time savings, 3+ paying customers |
| Phase 2 (Expansion) | 50+ assets per customer, <2hr report generation, 75% deal screening time reduction |
| Phase 3 (Full Suite) | Full lifecycle in single platform, NPS >50, ARR growing >50% |

### Business Metrics

| Metric | Target |
|---|---|
| Average Contract Value | ~$200k/annum |
| Net Revenue Retention | >110% |
| Logo Churn | <10% annually |
| NPS | >50 |

---

## Section 8: Key Constraints

### Non-Negotiable Architectural Constraints

1. **The run ledger is the canonical audit record** — not LangGraph checkpoints, not chat logs, not database state. The run ledger is append-only and authoritative. Implementation decisions that bypass or duplicate this are wrong.

2. **Artifacts are immutable and content-addressed** — once created, artifacts never change. Versioning is achieved by creating new artifacts and advancing pointers. Any design that mutates stored artifacts violates this constraint.

3. **Provenance is mandatory** — every extracted value must trace to its source document, page, and span. Outputs without source citations are not acceptable, regardless of their apparent correctness.

4. **Deterministic engines for calculations** — financial calculations (DSCR, LTV, ICR, covenant covenants) must produce identical results from identical inputs, every time. LLMs are not used for calculations, only for extraction and interpretation.

5. **Agents operate within defined boundaries** — agents have AgentDefinitions specifying capabilities, allowed tools, and policy templates. No agent makes unrestricted decisions. Policy templates govern all high-stakes actions.

6. **MCP as the tool protocol** — all agent-platform interaction uses MCP with the `{domain}.{resource}.{action}` namespace convention. Tools not exposed via MCP are not available to agents.

7. **DocIR as the document interface** — all downstream modules consume canonical DocIR, not parser-specific formats. The document processing adapter pattern must be respected.

8. **Index Service profiles, not knobs** — modules and agents select Index Service profiles, never interact with chunking parameters or embedding configurations directly.

### Structural Constraints from ADRs

9. **Custom data model, no CDM foundation** (ADR-001) — platform primitives and commercial entities use the NYQST-native model; CDM is only an integration layer for CRM connectivity.

10. **OpenAPI as the API contract** (ADR-002) — Pydantic models are the source of truth; TypeScript types are generated from the OpenAPI spec. Manual frontend type definitions for API-served data are wrong.

11. **LangGraph for orchestration only** (ADR-005) — LangGraph handles workflow state and resumability; the platform substrate handles trust/audit/governance. LangGraph state is never the authoritative record of what happened.

12. **Lightweight sessions first, VMs deferred** (ADR-006) — session-scoped context is implemented as database rows; container/VM orchestration is deferred until scale demands it.

13. **Tiered document processing with DocIR** (ADR-007) — Docling is the current primary adapter; the pipeline must remain swappable. Fast/Standard/Deep tiers must be respected.

14. **PostgreSQL + pgvector for Platform MCP, Neo4j isolated to Domain Model MCP** (ADR-010) — do not introduce additional databases unless there is a clear, isolated use case.

### Product and Commercial Constraints

15. **Accuracy before features** — the metrics hierarchy makes this explicit. Any feature that compromises extraction or calculation accuracy is wrong regardless of user demand.

16. **Never confidently wrong** — the user trust hierarchy (PRD 05) ranks "never confidently wrong" as the absolute top requirement. Hallucinations are described as "career-ending and liability-creating."

17. **The wedge before the platform** (WHAT-TO-BUILD-FIRST) — build critical date monitoring before expanding. The schemas are right; implement them incrementally. The expansion path must be respected.

18. **Mid-cap enterprise focus** — the product is built for organizations with $500M–$10B AUM and fiduciary responsibilities. Design decisions optimized for consumer UX, consumer scale, or large-enterprise complexity are misaligned.

19. **Preserve existing tools** — NYQST integrates with Excel, Argus, SharePoint, and other existing tools rather than replacing them. Designs that require users to abandon existing workflows will fail adoption.

### Risk Constraints (from PRD 09_RISKS)

20. **Security is critical** — data breach is described as catastrophic. Content-addressed storage, encryption at rest and transit, RBAC/ABAC, and immutable audit logs are required, not optional.

21. **Data protection compliance** — GDPR and equivalent regulations apply. Privacy-by-design, data residency controls, and configurable retention policies are required from the start.

22. **Professional liability** — terms of service limiting liability, confidence scoring on all outputs, and clear documentation of human verification requirements are mandatory.

23. **Multi-provider AI model strategy** — no single LLM provider dependency. Model abstraction layer must allow provider swapping. Any implementation that hardcodes an LLM provider is a risk.

---

*This document is the authoritative reference for evaluating implementation decisions against the product vision. When a proposed implementation is in tension with any constraint in Section 8, the constraint takes precedence unless there is an explicit user decision to change it recorded elsewhere.*
