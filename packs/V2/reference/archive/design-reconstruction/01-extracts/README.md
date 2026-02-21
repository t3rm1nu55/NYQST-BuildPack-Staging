---
document_id: EXTRACTS-INDEX
version: 1
date: 2026-02-20
---

# Design Reconstruction — Domain Extracts Index

This directory contains deep, comprehensive extractions of critical domains from analysis documents. Each extract is designed to be **implementation-ready**: complete specification without reinvention risk.

## Available Extracts

### billing-metering-extract.md

**Scope:** Complete billing, metering, quota enforcement, and Stripe integration specification

**Sections:**
1. Pricing Model (Superagent observed pricing, $20/month = 200 runs/month, $0.50 overage)
2. Database Schema (Subscriptions + UsageRecords complete SQLAlchemy models)
3. Stripe Integration (Webhook handler with raw body signature verification, checkout flow)
4. Budget Enforcement (Per-run $2 hard limit in LangGraph state with DEC-045 implementation)
5. Quota Enforcement Middleware (FastAPI + decorator patterns for run creation gating)
6. Usage Tracking (Post-run batch recording via Langfuse REST API cost queries)
7. Monthly Billing & Invoicing (arq cron job, Stripe line items, overage calculation)
8. Webhook Security Deep Dive (Raw body requirement gotcha, timestamp validation)
9. Competitive Analysis (Dify vs NYQST billing architecture comparison)
10. Port Strategy from DocuIntelli (What to take, what to redesign)
11. Reusable Code Patterns (Templates for webhook handler, quota middleware, budget accumulator, usage recording)
12. Implementation Roadmap (BL-012 & BL-013 detailed week-by-week plan)
13. Configuration (Environment variables, Stripe setup, Redis keys)
14. Summary & Next Steps (All decisions captured, files to create)

**Sources:**
- CHAT-EXPORT-ANALYSIS.md (Discovery 3 — observed pricing model)
- DECISION-REGISTER.md (DEC-025, DEC-036, DEC-042, DEC-045)
- BACKLOG.md (BL-012, BL-013 definitions)
- INTERACTION-POINTS.md (EXT-003 Stripe, DB-004/005 data boundaries, UF-004 checkout)
- LIBRARY-REFERENCE.md (LIB-08 Stripe Python SDK gotchas)
- dify-analysis/31-billing-and-feature-management.md (Dify billing patterns)
- DIFY-ANALYSIS-SUMMARY.md (Competitive analysis)

**Ready for:** BL-012 (Billing System) and BL-013 (Quota Enforcement Middleware) implementation

**Key takeaways:**
- Pricing unit: 1 run = 1 AI generation message
- Budget enforcement: $2/run hard limit in LangGraph state (DEC-045)
- Stripe integration: Direct API (port working code from DocuIntelli)
- Cost tracking: LiteLLM proxy + Langfuse self-hosted (MIT license)
- Webhook security: Raw body required for signature verification (critical gotcha)
- Database: Two new tables (Subscription, UsageRecord)
- Implementation: 4 weeks (Phase 1–5) with complete code patterns provided

---

### genui-rendering-extract.md

**Scope:** Complete GENUI component system, GML markup rendering, chart schemas, design tokens, and streaming patterns

**Sections:**
1. Component Registry (27 primitives with Zod schemas)
2. GML Tag Specifications (18 tags with width constraints)
3. Chart Schemas (10 Plotly.js chart types with full specs)
4. Color Palettes & Design Tokens (HSLA, Tailwind, semantic colors)
5. Rendering Pipeline (4-phase: parse → heal → sanitize → render)
6. Streaming Patterns (22 stream event types + examples)
7. CSS Architecture (Tailwind @layer organization + animations)
8. Reusable Code Catalog (State resolver, pattern factories, healers, helpers)

**Sources:**
- genui-00-findings.md through genui-06-comparison.md
- GML-RENDERING-ANALYSIS.md (healer algorithm, constraint table)
- GML_REPORT_RENDERING_PATTERNS.md (design patterns)
- TAILWIND_THEME_EXTRACTION.md (design tokens)
- JS_DESIGN_TOKENS.md (color palettes)
- TECHNICAL-DEEP-DIVE.md (chart schemas)

**Ready for:** BL-004 (Report Generation), BL-005 (Website Generation), MAPPING-02 (Deliverable Rendering)

**Key takeaways:**
- 27 primitives + 1 universal renderer = entire app UI
- GML tags have hard width constraints (896px primary, 280px metrics, 100% charts)
- Healer algorithm fixes malformed GML via constraint validation
- 10 chart types via Plotly.js with auto-detect X-axis type
- Streaming via 22 event types (task updates, report sections, sources, browser agent)
- Implementation: backend Python healer + frontend React renderers + chart integration

---

## Future Extracts (Planned)

### [Pending] agent-orchestration-extract.md
- Research orchestrator graph design
- Planner node decomposition
- Fan-out Send() dispatch patterns
- Fan-in aggregation and meta-reasoning
- Tool registry and MCP integration
- Error handling and retry logic

### [Pending] deliverable-generation-extract.md
- NYQST Markup AST (18 node types)
- GML healer algorithm (pseudocode + validation logic)
- Report generation pipeline
- Website generation pipeline
- Slides generation pipeline
- Document export (PDF/DOCX)

### [Pending] rag-retrieval-extract.md
- Document chunking strategies
- Embedding cache implementation
- Hybrid search (pgvector + BM25)
- Reranking integration
- Metadata filtering
- Hierarchical chunking

### [Pending] conversation-persistence-extract.md
- Conversation model (Dify pattern)
- Message storage and retrieval
- Feedback mechanism (like/dislike)
- Token/cost tracking per message
- Tree-structured branching

---

## How to Use These Extracts

1. **For implementation:** Read the extract cover-to-cover before writing code. It contains complete specifications, patterns, and gotchas.

2. **For code reviews:** Reference the extract to verify implementation matches specification (e.g., "Is raw body used for Stripe signature verification?").

3. **For technical decisions:** Extracts include competitive analysis (Dify patterns, DocuIntelli ports) to inform design choices.

4. **For documentation:** Extracts provide ready-to-adapt code templates, environment variable lists, and implementation roadmaps.

5. **For onboarding:** New team members should read the relevant extract before working on a domain.

---

## Format Conventions

- **Decision references:** DEC-xxx, BL-xxx (link back to decision register, backlog)
- **Code language:** Primarily Python (SQLAlchemy, FastAPI, LangGraph). Frontend code in TypeScript/TSX.
- **Code examples:** Real patterns from analysis, not pseudocode. Can be copy-pasted with variable substitution.
- **Gotchas:** Sections labeled "Design notes" capture anti-patterns and lessons learned.
- **Sources:** Every section cites the analysis document(s) it came from.

---

## Revision Log

| Date | Extract | Status | Notes |
|------|---------|--------|-------|
| 2026-02-20 | billing-metering-extract.md | Complete | All sections, 14k words, ready for BL-012/BL-013 |
| 2026-02-20 | genui-rendering-extract.md | Complete | 60KB, 2263 lines, 8 sections, ready for BL-004/BL-005/MAPPING-02 |
| TBD | agent-orchestration-extract.md | Planned | Will cover BL-001, MAPPING-01 |
| TBD | rag-retrieval-extract.md | Planned | Will cover BL-003, improved retrieval patterns |
| TBD | conversation-persistence-extract.md | Planned | Will cover critical Dify pattern adoption |

---

*Index last updated: 2026-02-20*
