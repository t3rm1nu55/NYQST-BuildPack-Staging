# NYQST Slice Structure

**Status**: Concept — implementation pending
**Purpose**: Function/discipline-based team coordination until platform stabilises
**Note**: Structure is temporary and expected to evolve

---

## The 10 Slices

| # | Slice | Directory | Discipline |
|---|-------|-----------|------------|
| 1 | **Backend** | `slices/backend/` | API, models, migrations, services, SSE |
| 2 | **Agentic** | `slices/agentic/` | LangGraph, MCP tools, LiteLLM, evals, graph tooling |
| 3 | **Context Management** | `slices/context-management/` | Token windows, memory, summarisation, RAG context injection |
| 4 | **Orchestration & Planning** | `slices/orchestration-planning/` | PlanSet model, Send() fan-out, arq, task scheduling |
| 5 | **Core Services** | `slices/core-services/` | Auth, tenancy, onboarding, billing, security |
| 6 | **Infrastructure** | `slices/infrastructure/` | Docker, CI/CD, environments (dev/test/prod), DB/Redis ops |
| 7 | **Testing** | `slices/testing/` | E2E, performance, contract tests, review pipelines |
| 8 | **Product / UX / Frontend** | `slices/product-ux/` | React, UI components, UX flows, domain use cases, preview |
| 9 | **Research** | `slices/research/` | Industry monitoring, tool evaluation, innovation, recommendations |
| 10 | **Standards** | `slices/standards/` | ADRs, API contracts, code standards, governance, docs templates |

---

## Key Design Decisions

- **Frontend merged into Product/UX** — not a separate engineering slice; UX owns the whole user journey
- **Context Management is separate from Agentic** — token budget and memory are distinct concerns from graph execution
- **Orchestration & Planning is separate from Agentic** — fan-out coordination and scheduling are infra-adjacent
- **Research and Standards are first-class slices** — not support functions; they drive the roadmap and governance
- **Concession model**: any slice can decide independently within its domain; schema/API/SSE/security changes require Standards review

---

## BL Item Assignments

| Slice | Primary BL Items |
|-------|-----------------|
| Backend | Migration 0005, BL-002 (RunEvent schema), BL-014 (arq wiring), BL-015 (Zustand stores) |
| Agentic | BL-001 (Research Orchestrator), BL-003 (Web Tools), BL-017 (Meta-Reasoning) |
| Context Management | BL-022 (Data Brief), part of BL-001 state design |
| Orchestration & Planning | BL-001 fan-out, BL-021 (Clarification Flow) |
| Core Services | BL-012 (Billing), BL-013 (Quota Enforcement), BL-016 (Entity/Citation) |
| Infrastructure | CI/CD, environments — cross-cutting |
| Testing | cross-cutting — all slices |
| Product / UX / Frontend | BL-007–011 (frontend components), BL-020 (Progress Overlay), BL-008 (DeliverableSelector), BL-005/006/018/019 (Report/Website/Slides/PDF delivery) |
| Research | ongoing — informs Agentic, Context, Orchestration |
| Standards | ADRs, cross-cutting governance |

---

## Cross-Slice Interface Map

```
Research ──────────────────────→ Agentic, Context Management, Orchestration & Planning
                                  (tool evaluations, approach recommendations)

Orchestration & Planning ───────→ Agentic
                                  (PlanSet graph, Send() invocations)

Agentic ────────────────────────→ Context Management
                                  (token usage, context requests)

Context Management ─────────────→ Agentic, Orchestration & Planning
                                  (context windows, RAG results)

Backend ────────────────────────→ all slices
                                  (DB models, migrations, SSE events)

Core Services ──────────────────→ Backend, Product/UX
                                  (auth tokens, billing state, quota signals)

Infrastructure ─────────────────→ all slices
                                  (environments, secrets, CI gates)

Testing ────────────────────────→ all slices
                                  (contracts, E2E coverage, review pipelines)

Product/UX/Frontend ────────────→ Backend, Core Services, Orchestration & Planning
                                  (API calls, SSE subscriptions, UX flows)

Standards ──────────────────────→ all slices
                                  (API contracts, ADRs, schema governance)
```

---

## Concession Boundaries (all slices)

**Each slice can decide independently:**
- Internal implementation choices within owned code paths
- Internal refactors that don't change public interfaces
- Tooling and library choices within their area (subject to Standards ratification)
- Test strategies for their own code

**Requires Standards review:**
- API contract changes (new routes, changed payloads, removed fields)
- Database schema changes (new tables, column changes, index strategies)
- New SSE event types
- Cross-cutting security changes
- Shared library version bumps

---

## CLAUDE.md Structure (per slice)

Each slice will have `slices/{name}/CLAUDE.md` with:

```
# [Slice Name]
## Mandate
## Objectives (v1 Superagent Parity)
## Code Ownership
## Interfaces
## Concession Boundaries
## Current Priorities (BL items)
## Where to Find Things
## Key Libraries
```

Analysis docs: `/Users/markforster/AirTable-SuperAgent/docs/analysis/`
Planning docs: `/Users/markforster/AirTable-SuperAgent/docs/plans/`

---

## Implementation (when ready)

**Phase 1** — 3 parallel agents writing CLAUDE.md files:
- Agent A: Backend, Agentic, Context Management
- Agent B: Orchestration & Planning, Core Services, Infrastructure
- Agent C: Testing, Product/UX/Frontend, Research

**Phase 2** — 1 agent after Phase 1 completes:
- Standards CLAUDE.md (references all 9 from Phase 1)
- Update root `nyqst-intelli-230126/CLAUDE.md` with slice index

Location in dev repo: `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/slices/`
