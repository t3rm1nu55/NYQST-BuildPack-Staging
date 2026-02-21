# Design Inventory & Knowledge Map — NYQST DocuIntelli Platform

**Purpose**: Central index and navigation hub for all design, specification, and implementation documents.

**Last Updated**: 2026-02-20
**Status**: Ready for Sprint Planning
**Author**: Claude (Multi-Agent Design Reconstruction)

---

## What's In This Directory

### Core Manifests (Catalogs of Source Documents)

| File | Purpose | Entry Count | Sources |
|------|---------|-------------|---------|
| **devrepo-docs-manifest.json** | 29 NYQST development repository documents (PRDs, ADRs, planning) | 29 | `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/docs/` |
| **analysis-manifest.json** | Design analysis and synthesis documents | 8 | `/Users/markforster/AirTable-SuperAgent/docs/analysis/` |
| **plans-manifest.json** | Planning, roadmaps, and schedules | 7 | `/Users/markforster/AirTable-SuperAgent/docs/plans/` |
| **superagent-js-manifest.json** | Superagent bundle extraction (API surface, GML tags) | 112 files | Superagent Next.js bundles |

### Knowledge Synthesis Documents

| File | Purpose | Audience | Read Time |
|------|---------|----------|-----------|
| **KNOWLEDGE-MAP.md** | Comprehensive architecture reference map | Architects, Tech Leads | 30 min |
| **PHASE-0-SPECIFICATION.md** | Actionable 2-week sprint specification | Engineers, Tech Leads | 45 min |
| **EXTRACTION-SUMMARY.md** | Superagent JS bundle extraction findings | Architects | 20 min |

---

## Quick Start Guide

### If You Have 5 Minutes
→ Read: `PHASE-0-SPECIFICATION.md` § Executive Summary

**Key Takeaway**: Spend 2 weeks instrumenting the agent runtime to emit structured events.

### If You Have 15 Minutes
→ Read: `KNOWLEDGE-MAP.md` § 1–3 (Document Graph, Thematic Clusters, Architectural Themes)

### If You Have 1 Hour
→ Read: `KNOWLEDGE-MAP.md` (all) + `PHASE-0-SPECIFICATION.md` § 1–3

---

## Document Navigation by Role

### For Backend Engineers
**Sequence**:
1. `PHASE-0-SPECIFICATION.md` (full document)
2. `KNOWLEDGE-MAP.md` § 4 (Technology Stack)
3. ADRs 005 & 008 (LangGraph, MCP)

### For Frontend Engineers
**Sequence**:
1. `PHASE-0-SPECIFICATION.md` § 3.2 (Frontend Touchpoints)
2. `KNOWLEDGE-MAP.md` § 4 (Tech Stack)
3. UI_ARCHITECTURE.md

### For Architects
**Sequence**:
1. `KNOWLEDGE-MAP.md` (full)
2. All 10 ADRs
3. PLATFORM_REFERENCE_DESIGN.md

---

## Key Documents by Topic

### Strategic Vision
- `KNOWLEDGE-MAP.md` § 2 (Thematic Clusters)
- PRD: 01_EXECUTIVE_SUMMARY, 02_VISION, 03_PLATFORM

### Architecture & Technology
- `KNOWLEDGE-MAP.md` § 3–4 (Decisions, Tech Stack)
- All 10 ADRs (001–010)
- PLATFORM_REFERENCE_DESIGN.md

### Implementation Roadmap
- `PHASE-0-SPECIFICATION.md` (sprint-level detail)
- `KNOWLEDGE-MAP.md` § 6 (phases overview)
- IMPLEMENTATION-PLAN.md (master schedule)

---

## Manifest File Format

Each JSON manifest contains an array of document entries:

```json
{
  "path": "/absolute/path/to/document.md",
  "basename": "document.md",
  "primary_topic": "Short description",
  "document_type": "prd|adr|analysis|planning|reference|tracking",
  "product_requirements": [...],
  "architectural_decisions": [...],
  "technology_choices": [...],
  "user_scenarios": [...],
  "domain_concepts": [...],
  "cross_references": [...],
  "key_signals": [...]
}
```

---

## Implementation Phases at a Glance

| Phase | Duration | Objective |
|-------|----------|-----------|
| **Phase 0** | 1–2 weeks | Event contract + instrumentation |
| **Phase 1** | 2–4 weeks | Planning layer + multi-agent |
| **Phase 2** | 2–4 weeks | Deliverables v1 (report) |
| **Phase 3** | 3–6 weeks | Web research + entity store |
| **Phase 4** | 3–6 weeks | Human-in-loop + browser-use |
| **Phase 5** | Ongoing | Production hardening |

**Total**: ~7 weeks parallel (4 waves, 80 SP)

---

## Technology Stack Summary

### Backend
```
LangGraph, FastAPI, SQLAlchemy, Pydantic,
PostgreSQL+pgvector, Neo4j, OpenSearch, Redis,
Docling, MCP SDK, LangChain, OpenAI, Langfuse
```

### Frontend
```
React 18+, TypeScript, Vite, TailwindCSS v4,
@assistant-ui/react, shadcn/ui, Zustand,
react-plotly.js, rehype-react
```

---

## Status Summary

- ✓ 29 development documents cataloged
- ✓ 52+ design decisions documented
- ✓ 7 open questions resolved
- ✓ All inconsistencies corrected
- ✓ Phase 0 specification complete
- ✓ Ready for sprint planning

---

## Next Steps

### For Sprint Planning
1. Read `PHASE-0-SPECIFICATION.md` (full)
2. Create Jira tickets from § 4
3. Schedule 2-week sprint

### For Architecture Review
1. Read `KNOWLEDGE-MAP.md`
2. Review relevant ADRs
3. Schedule design review

### For Implementation
1. Read `PHASE-0-SPECIFICATION.md` § 3 (Touchpoints)
2. Assign files to team
3. Start with unit tests

---

**Version**: 1.0
**Generated**: 2026-02-20
**Total Artifacts Cataloged**: 150+ files across 5 repositories
