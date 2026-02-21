# Project Brief: Superagent Parity on NYQST Intelli

> **Date**: 2026-02-16
> **Status**: Active — design approved, implementation planning next
> **Owner**: Mark Forster

---

## OPERATIONAL RULES FOR AI AGENTS

### Context Management (CRITICAL)
- **NEVER read full JS source files** — they are minified production bundles (100K+ each)
- **NEVER inline large documents into context** — reference by path, read only needed sections
- **Use agent tiers appropriately**:
  - `haiku` — summarize files, catalog directories, extract specific data points
  - `sonnet` — investigate findings, implement code, run focused analysis
  - `opus` — review designs, validate architecture, dispatch complex multi-step work
- **Funnel pattern**: haiku scans broadly → sonnet investigates specific findings → opus validates and decides
- **If context is getting heavy**: stop, summarize what you have, write to a file, start fresh with references

### File Reading Strategy
- For `.md` analysis docs: read title + first 10 lines to orient, then specific sections as needed
- For `.js` bundles: NEVER read whole file. Use `grep` patterns to find specific code
- For planning docs: these are your specs — read fully when working on that phase
- For the intelli codebase: use Serena symbolic tools (find_symbol, get_symbols_overview)

---

## 1. What We're Building

**Extending the `nyqst-intelli-230126` platform** (Python/FastAPI/LangGraph) with features reverse-engineered from Superagent.com (Gradient Labs/Preemo). This is NOT a greenfield build — it's adding capabilities to a working platform.

### v1 Feature Scope (User-Approved)
| Feature | Priority | Status |
|---------|----------|--------|
| Research orchestrator (plan → parallel research → synthesis) | Core | Mapped (MAPPING-01) |
| Report deliverable (NYQST Markup AST → React renderer) | Core | Mapped (MAPPING-02) |
| Website deliverable (LLM → file bundle → iframe preview) | Core | Mapped (MAPPING-02) |
| Slides deliverable | Core | Mapped (MAPPING-02) |
| Document deliverable (PDF/DOCX export) | Core | Mapped (MAPPING-02) |
| Billing & quotas (Stripe, free/pro tiers) | Supporting | Mapped (MAPPING-04) |
| Document upload + RAG | Supporting | Already working in intelli |
| Deliverable selector in chat | Core UI | Mapped (MAPPING-03) |
| Plan viewer + enhanced timeline | Core UI | Mapped (MAPPING-03) |

### Explicitly Deferred
- Scheduled tasks / automations
- Content library / curated reports
- Browser agent (Playwright automation)
- Public share system
- Replay bar
- Push notifications

---

## 2. Where Information Is Stored

### This Repo (`/Users/markforster/AirTable-SuperAgent/`)

#### Analysis Documents (`docs/`)
| File | Size | Content |
|------|------|---------|
| `INDEX.md` | 10K | Master index of all analysis, cross-report synthesis |
| `TAILWIND_THEME_EXTRACTION.md` | 44K | 277 CSS custom properties from Superagent's UI |
| `GML_CSS_EXTRACTION.md` | 35K | 40+ GML tag CSS rules, CVA variant patterns |
| `JS_DESIGN_TOKENS.md` | 33K | Chart schemas (Plotly, 10 types), 22 streaming event types |
| `GML_REPORT_RENDERING_PATTERNS.md` | 27K | GML rendering pipeline, healer/fixer system |
| `GENERATION_PIPELINE.md` | 13K | 7-stage website generation pipeline |
| `SUPERAGENT_REPORT_ANALYSIS.md` | 13K | Report B deep dive (DMN-Ontology, 11 viz components) |
| `REPORT_C_ANALYSIS.md` | 9K | Report C (AAPL/MSFT/GOOG, Soft Brutalism) |
| `FONT_AND_ASSET_EXTRACTION.md` | 16K | ATSeasonSans font family, 19 external URLs |
| `SCREENSHOT_ANALYSIS.md` | 8K | 9 screenshot analysis: generation states, subagent cards, activity panel |

#### Earlier Analysis Reports (`reports/`)
| File | Content |
|------|---------|
| `01_observed_surface.md` | Observable surface analysis of Superagent UI |
| `02_streaming_protocol.md` | Streaming protocol documentation |
| `03_agent_orchestration_inference.md` | Agent orchestration and inference analysis |
| `04_prompt_and_output_formats.md` | Prompt and output format specs |
| `05_validation_playbook.md` | Validation testing playbook |
| `data/extracted_signals.json` | JSON signals extracted from Superagent artifacts |
| `data/next_data_sanitized.json` | Sanitized Next.js data structure |

#### Chat Export (root)
| File | Content |
|------|---------|
| `5988fe2c-..._chat` (788K) | Full Superagent chat session export — contains prompts, responses, agent reasoning |

#### Mapping Documents (`docs/plans/`)
| File | Content |
|------|---------|
| `MAPPING-01-RESEARCH-ORCHESTRATOR.md` | LangGraph orchestrator design, RunEvent extensions, web tools |
| `MAPPING-02-DELIVERABLES-ARTIFACTS.md` | Deliverable types → Artifact/Manifest/Pointer mapping |
| `MAPPING-03-UI-MODULES.md` | 7 new frontend components, Zustand stores, routing |
| `MAPPING-04-BILLING-TESTING.md` | Stripe billing, test pyramid, 7-phase delivery plan |
| `PROJECT-BRIEF.md` | THIS DOCUMENT — master project reference |

#### Planning Documents (`docs/planning/`)
| File | Content |
|------|---------|
| `INTELLI_BUILD_STATUS_2026-02-16.md` | What's working in intelli today (ground truth) |
| `SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md` | 6-phase parity plan with capability map |

#### Original Cleanroom Analysis (root)
| File | Content |
|------|---------|
| `CLEANROOM-ANALYSIS.md` | Original analysis (PARTIALLY OUTDATED — built against wrong repo) |

**What's still valid in CLEANROOM-ANALYSIS.md**: Superagent feature inventory, GML docs, streaming events, data connectors, citation design, healer concept, deliverable type abstraction.

**What's INVALID**: Backend language (said Node, actually Python), data model (said flat SQL, actually content-addressed kernel), agent framework (said hand-rolled, actually LangGraph+MCP), streaming protocol (said NDJSON, actually AI SDK Data Stream), frontend chat (said custom, actually @assistant-ui).

#### Raw Artifacts (root)
- `*.js` files — 15+ cached Superagent production bundles (minified webpack chunks)
- `55ccf76ff5ccbea2.css` — 208KB Tailwind v4 theme
- `*.ttf` — ATSeasonSans font (4 weights: Regular, Medium, SemiBold, Bold)
- `*.webarchive` — 5 progressive snapshots of CRE generation session
- `_buildManifest.js` — Next.js route structure
- `firebase-debug.log` — Firebase debug output
- `extracted/` — extracted webarchive HTML/assets
- `reports/` — v0.app generated report exports

#### Screenshots (`/Users/markforster/Desktop/Screenshot 2026-02-16 at 03.*.png`)
9 screenshots of Superagent in action showing:
- Generation progress states ("Writing outline...", "Building components...", "Reviewing content...", "Polishing typography and layout...")
- 23+ numbered subagent tasks with status (PROCESSING, CREATING NOTES)
- Activity panel with "Superagent reasoning" expandable sections
- CRE Metric Library report output (SPARQL, SHACL validation, decision ontology)
- 13 parallel workstream dispatch

### Target Platform (`nyqst-intelli-230126`) — THE CODEBASE TO MODIFY
**Location**: Ask user for path if not known. Key structure:
- `src/intelli/` — Python backend (FastAPI + SQLAlchemy + LangGraph)
- `src/intelli/api/v1/` — REST endpoints
- `src/intelli/agents/` — LangGraph agent graphs
- `src/intelli/services/` — Business logic services
- `ui/src/` — React frontend (Vite + @assistant-ui + shadcn)
- 10 ADRs, 10-part PRD, Platform Reference Design

### Reference Repos
- `okestraai/DocuIntelli` — Stripe checkout/webhook code to port (GitHub public)
- `t3rm1nu55/NYQST-DocuIntelli160126` — older Node/tRPC version (reference only)
- `genui-dashboards-v2` — companion dashboard service
- `wiki-propresearch` — companion wiki/property research service

---

## 3. Architecture Summary

### Intelli Platform (Current, Working)
```
┌─────────────────────────────────────────────┐
│  React + Vite + @assistant-ui + shadcn/ui   │
│  ├── ChatPanel (working, AI SDK streaming)  │
│  ├── SourcesPanel (working, RAG citations)  │
│  ├── RunTimeline (working, tool/LLM events) │
│  └── Notebooks (working, file upload + RAG) │
├─────────────────────────────────────────────┤
│  FastAPI + SQLAlchemy 2.0 async             │
│  ├── Artifacts/Manifests/Pointers (working) │
│  ├── Runs + RunEvents ledger (working)      │
│  ├── SSE streams (Postgres LISTEN/NOTIFY)   │
│  └── LangGraph research assistant (working) │
├─────────────────────────────────────────────┤
│  PostgreSQL + pgvector + OpenSearch          │
│  MinIO (S3-compat, dev) + Docling           │
│  Langfuse observability                     │
└─────────────────────────────────────────────┘
```

### What We're Adding (6 Phases, 12-16 weeks)
```
Phase 0: Orientation & gap fixes (1-2 days)
Phase 1: Research orchestrator + plan UI (2-3 weeks)
Phase 2: Entity & citation substrate (2-4 weeks)
Phase 3: Report deliverable (3-4 weeks)
Phase 4: Website + slides deliverables (3-4 weeks)
Phase 5: Billing & quotas (1 week)
Phase 6: Polish & production (1-2 weeks)
```

---

## 4. User Decisions (Locked, Do Not Re-Ask)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React+Vite+FastAPI | Internal tool, no SSR/social previews needed |
| Architecture | Pragmatic vertical | Superagent-style, not meta-architecture |
| Testing | Real LLM calls, contract+integration+E2E | Get to prod looking nice, then refine |
| Plan storage | RunEvents (no new tables) | Run ledger already has append-only + SSE |
| Markup format | JSON AST (not HTML tags) | Easier to validate, heal, render, export |
| Billing source | Port from okestraai/DocuIntelli | Working Stripe code exists |
| Deferred features | Tasks, library, browser, share, replay | v2 scope |

---

## 5. Key Technical Decisions

### From Superagent Analysis
- **18 GML tags** → mapped to 18 NYQST Markup AST node types (see MAPPING-02)
- **PlanSet/Plan/PlanTask linked lists** → LangGraph StateGraph with `Send()` fan-out
- **12+ parallel subagents** → LangGraph parallel research nodes
- **v0.app code generation** → direct LLM code gen (no v0.app dependency)
- **NDJSON streaming** → AI SDK Data Stream Protocol (already working in intelli)
- **GML healer** → Pydantic validator + AST repair logic
- **Brave Search + Firecrawl** → Brave Search + Jina Reader API

### Open Infrastructure Decisions
| Decision | Options | When |
|----------|---------|------|
| Web search provider | Brave (recommended) vs Tavily vs SerpAPI | Phase 1 |
| Browser automation | Playwright vs browser-use (deferred) | Phase 6+ |
| Website deploy target | Vercel vs Cloudflare Pages vs S3+CloudFront | Phase 4 |
| Model providers | Anthropic + OpenAI + local (already multi-provider) | Ongoing |

---

## 6. Superagent Feature Reference

### What We Observed (Screenshots + JS Analysis)

**Orchestration Pipeline**:
1. User submits prompt with deliverable type selection
2. "Superagent reasoning" → initial research strategy
3. 13-23 parallel workstreams dispatched (numbered tasks with colored left borders)
4. Task statuses: PROCESSING → CREATING NOTES → completed
5. "Considering Results and Refining Research Strategy" (meta-reasoning step)
6. Generation phases: "Writing outline..." → "Building components..." → "Reviewing content..." → "Polishing typography and layout..."
7. Final deliverable rendered in chat or slide-out panel

**UI Components We're Replicating**:
- Chat info panel with Sources / Files / Activity tabs
- Expandable "Superagent reasoning" sections
- Numbered subagent task cards with progress bars and colored borders
- Full-screen "Generating output..." progress overlay
- CRE-style structured reports with SPARQL examples, SHACL validation

**Deliverable Types**:
- Super Report → in-chat GML rendering + export
- Super Slides → presentation viewer
- Website → iframe preview + Vercel deploy
- Super Document → PDF/DOCX download
- Code → code viewer (deferred)
- Automation → scheduler (deferred)

---

## 7. Cross-Reference Guide

Need to understand... → Read this:
- Superagent's full feature set → `docs/INDEX.md` + `CLEANROOM-ANALYSIS.md` (features section only)
- How reports render → `docs/GML_REPORT_RENDERING_PATTERNS.md`
- How websites generate → `docs/GENERATION_PIPELINE.md`
- Streaming event types → `docs/JS_DESIGN_TOKENS.md`
- CSS theme/design tokens → `docs/TAILWIND_THEME_EXTRACTION.md`
- Report B architecture → `docs/SUPERAGENT_REPORT_ANALYSIS.md`
- Report C architecture → `docs/REPORT_C_ANALYSIS.md`
- Orchestrator implementation plan → `docs/plans/MAPPING-01-RESEARCH-ORCHESTRATOR.md`
- Deliverable/artifact mapping → `docs/plans/MAPPING-02-DELIVERABLES-ARTIFACTS.md`
- Frontend component plan → `docs/plans/MAPPING-03-UI-MODULES.md`
- Billing + testing + delivery → `docs/plans/MAPPING-04-BILLING-TESTING.md`
- What intelli has today → `docs/planning/INTELLI_BUILD_STATUS_2026-02-16.md`
- Phase plan for parity → `docs/planning/SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md`
- Screenshot UI patterns → `docs/SCREENSHOT_ANALYSIS.md`
- Streaming protocol details → `reports/02_streaming_protocol.md`
- Prompt/output formats → `reports/04_prompt_and_output_formats.md`
- Validation playbook → `reports/05_validation_playbook.md`
- Full chat session data → `5988fe2c-871f-4de0-afcb-381cdecdb107_chat`
- This document → `docs/plans/PROJECT-BRIEF.md`
