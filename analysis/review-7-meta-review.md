# Review 7: Meta-Review — Design Efficiency, Risks & Strategic Recommendations

**Reviewer**: Opus 4.6
**Date**: 2026-02-21
**Scope**: Architectural step-back across all 6 reviews + 6 agent outputs

---

## SECTION 1: DESIGN EFFICIENCIES

### 6 Shared Primitives Hiding Inside Multiple Epics

| Primitive | Appears In | Savings |
|---|---|---|
| **A. Versioned Entity CRUD** (lifecycle state machine + API router factory + version-list UI) | Apps, Models, Workflows, Skills, Bundles, Insights, Dashboards, CRM (8 epics) | 40-60 issues |
| **B. Entity List/Detail Screen Skeleton** (list + search/filter + detail + loading/empty/error) | 9+ frontend epics | 20-30 issues |
| **C. Diff Viewer** (two versions of X, show changes) | Document diff, extraction diff, impact diff, app diff, model diff, canvas diff, regulatory diff (8 contexts) | 15-20 issues |
| **D. Deterministic Calc Engine** (structured input → deterministic computation → per-line explain() trace) | LeaseCD, Debt, Covenant ratios | 10-15 issues |
| **E. Extraction Skill** (DocIR blocks → pattern matcher → LLM extract → proposed values) | LeaseCD, Debt, RegSygnal, DocIR generic | 15-20 issues |
| **F. Provenance-Linked Display** (any data + drilldown to evidence panel) | Dashboard tiles, insight detail, model fields, entity detail, report citations | 10-15 issues |

**Total estimated savings: 110-160 issues (26-38% of 424)**

### Duplicate Work Across Epics

- **Workflow Builder + Analysis Canvas**: Both use React Flow node canvas. 80% shared infra. Build one `CanvasFramework`.
- **App Builder Wizard + Model Editor**: Both are multi-step config wizards producing versioned entities. Build generic `EntityWizard`.
- **Trigger Dispatcher**: Specified in both EPIC-WORKFLOWS (C3) and EPIC-APPS (C4). Build once.

### Over-Engineering to Cut

| Feature | Current | Simpler v1 | Savings |
|---|---|---|---|
| Infinite Canvas | React Flow pan/zoom + semantic edges | Vertical pinnable blocks, drag-to-reorder | 8-10 issues |
| 27 GenUI Primitives | Full registry | 8 essential (Text, Heading, Card, Table, Chart, Badge, Metric, Citation) | 6-8 issues |
| Visual Workflow Builder | n8n-style node canvas | YAML/JSON definitions + form editor + validation | 8-10 issues |

### Build-vs-Buy Opportunities

| Capability | Build | Buy/OSS |
|---|---|---|
| Notifications | 12-16 issues from scratch | **Novu** (open-source, self-hosted, multi-channel) |
| Workflow scheduling | Custom cron + dispatcher | **Temporal.io** or **Inngest** |
| Feature flags | None planned | **Unleash** (open-source, self-hosted) |
| Secret scanning | detect-secrets | **Gitleaks** (faster, fewer false positives) |

---

## SECTION 2: DESIGN RISKS

### Architectural Bets That Could Fail

1. **PG LISTEN/NOTIFY at scale**: Works at 10-50 concurrent SSE streams. At 500+, each holds an open PG connection. PgBouncer transaction mode doesn't support LISTEN/NOTIFY. Need documented scaling path (Redis Pub/Sub for notification layer).

2. **Content-Addressed Artifacts for mutable entities**: SHA-256 key is excellent for immutable outputs (reports, extracted data). Poor fit for entities that change frequently (CRM entities, user-edited lease terms). Every edit = new artifact + pointer update + orphan cleanup. The V2m internal contradiction (extend Artifact vs new tables) is a symptom of this tension.

3. **LangGraph Send() as only concurrency model**: If LangGraph changes Send() API, platform core breaks. Abstract behind interface so mechanism can be swapped.

4. **Single-LLM provider (OpenAI)**: Commercial risk for $200k/yr product. base_url override ≠ real multi-provider. Wire LiteLLM at M1.

### Scope Creep Vectors

- **DocuIntelli** (18 issues, 10 concepts): "Dimension discovery agent," "cross-framework reconciliation," "anomaly detection engine" are each research-grade. Cut to DocIR + extraction + patterns.
- **GenUI descriptor engine**: Temptation to make it Turing-complete. Ship static GML rendering only for v1.
- **Workflow condition DSL**: Language is "not specified." Use JSON-path equality for v1, no custom DSL.

### Performance Cliffs

- Fan-out 20+ subagents → 20 concurrent DB sessions → sequence number allocator bottleneck → batch event emission
- Dashboard 50+ tiles → 50 joins (evidence + model + run) → need tile data cache (Redis, 60s TTL)
- Hybrid RAG at 100k+ docs → define max corpus for v1 (10k) and test at scale

### Vendor Lock-In

- **LangGraph/LangChain**: Deep coupling, acceptable if LangGraph remains viable
- **OpenAI**: Mitigate with LiteLLM at M1
- **Stripe**: Design billing interface for non-Stripe backends (enterprise PO-based billing)
- **OpenSearch**: Start with pgvector. Add OpenSearch only when scale demands it.

---

## SECTION 3: WHAT OTHER REVIEWS WOULD HELP?

| Review | Value | Cost | Worth It? |
|---|---|---|---|
| **Data Model Review** — schema walkthrough, Artifact extension viability, missing indexes, FK constraints | HIGH | MEDIUM | **YES** — prevents weeks of migration pain |
| **Cost Model Review** — LLM cost/run, infra cost/tenant, margin at 10/50 customers, pricing validation | HIGH | LOW | **YES** — 2-hour spreadsheet could change billing model |
| **Migration Path Review** — delta from current codebase to V3, what extends vs replaces, actual first PR | HIGH | LOW | **YES** — bridge between plan and execution |
| **API Design Review** — naming conventions, pagination, error formats, versioning strategy, OpenAPI spec | MEDIUM | MEDIUM | Yes, incrementally |
| **UX/Design Review** — Lease CD user journey, admin screens, onboarding | MEDIUM | HIGH | Partially — target Lease CD journey only |
| **Team Structure/Staffing** | LOW | LOW | No — premature |
| **Regulatory Compliance** | LOW | MEDIUM | No — defer to EPIC-ENTERPRISE |
| **Frontend Architecture** | LOW | MEDIUM | No — V2m patterns are solid |

**Recommended next reviews: Data Model + Cost Model + Migration Path (all 3 are high-value, low-cost)**

---

## SECTION 4: WHAT THE V3 PACK DOES WELL

### Genuinely Novel

**The intelligence stack is best-in-class.** Evidence (confidence scores, span pointers, source typing) → Insights (lifecycle, stale flags, evidence requirements) → Models (validation rules, coverage checks) → Dashboards (per-tile provenance drilldown). No competing platform treats provenance as a first-class architectural concern woven through every layer.

**Stale propagation is a unique capability.** New document version → evidence marked stale → insights marked stale → model fields marked stale → dashboard exceptions surface automatically. This dependency graph traversal is what makes $200k/yr defensible against ChatGPT wrappers.

### Decisions That Should NOT Be Changed

1. Pydantic as schema source of truth (Pydantic → JSON Schema → TypeScript)
2. SSE over PG LISTEN/NOTIFY for v1 (simple, transactionally consistent)
3. Content-addressed Artifacts for immutable outputs
4. Per-node async sessions from shared async_sessionmaker (DEC-051)
5. Plotly.js over Recharts (DEC-048) — candlestick charts essential for financial data
6. Native MCP from day 1 — MCP is the emerging standard
7. Run-based billing for v1 — simpler to explain, implement, audit

### What the Standards Framework Provides (2-3 months to recreate if lost)

- 5-tier testing with named tools and concrete triggers
- Golden fixture discipline with named files and versioning rules
- CI pipeline spec (ci.yml, e2e.yml, live.yml) with named jobs
- Definition of Done (PR-level + milestone-level VSGs)
- Security threat model (7-item checklist with specific attack vectors)
- SSE protocol invariants (6 non-negotiable rules + SQL for counter allocator)

---

## SECTION 5: TOP 10 STRATEGIC RECOMMENDATIONS

Ranked by impact-to-effort ratio:

| # | Action | Impact | Effort | Ratio |
|---|---|---|---|---|
| 1 | **Create Wave 0.5: Lease CD MVP** (8-10 issues pulled from 4 epics, demo in 8 weeks) | 10 | 3 | 3.3x |
| 2 | **Resolve 8 internal contradictions** (2 hours of decisions) | 9 | 2 | 4.5x |
| 3 | **Build Versioned Entity CRUD Framework** (mixin + router factory + UI) | 8 | 4 | 2.0x |
| 4 | **Wire LiteLLM at M1** (1-2 days, eliminates single-provider risk) | 7 | 2 | 3.5x |
| 5 | **Do cost model analysis** (2-hour spreadsheet validates pricing) | 7 | 1 | 7.0x |
| 6 | **Add EPIC-NOTIFICATIONS + EPIC-EXPORT** (Novu for notifications, openpyxl for Excel) | 6 | 3 | 2.0x |
| 7 | **Fix SSE tenant isolation** (one guard clause, one test — security P0) | 8 | 1 | 8.0x |
| 8 | **Simplify DocuIntelli** (cut 10 concepts to 4, defer research-grade features) | 5 | -5 | ∞ (removes work) |
| 9 | **Write + test Migration 0005a/b/c** (unblocks 8 BL items, Week 1 work) | 6 | 2 | 3.0x |
| 10 | **Document PG LISTEN/NOTIFY scaling path** (1-page ADR, prevents production crisis) | 4 | 1 | 4.0x |

---

## BOTTOM LINE

> The V3 pack is an excellent engineering specification with a commercial sequencing problem. The intelligence stack (provenance, stale propagation, evidence-linked everything) is genuinely differentiated and worth building. The standards framework is production-grade. The main risks are: building too much platform before shipping revenue product, internal contradictions that will cause implementation confusion, and missing product-surface features that enterprise buyers expect. Fix the sequencing (Lease CD MVP at Week 8), resolve the contradictions (2 hours of decisions), build shared primitives (save 30% of issues), and the V3 pack becomes a viable build plan for a $200k/yr product.
