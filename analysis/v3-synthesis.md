# V3 Merged Build Pack — Synthesis
> Combined analysis from 6 parallel agents across V1, V2, and V2-merged build packs
> Date: 2026-02-21

---

## V3 Merged Build Pack — Synthesis

### Merge Principles Applied

| Source | What V3 Takes |
|---|---|
| **V1** | Product breadth (17 epics), standards framework (15 areas), contract governance, SSE protocol, testing tiers, golden fixtures, Definition of Done |
| **V2** | Domain modules (5), enterprise hardening, wave structure, sub-task decomposition, DocIR primitive, context inheritance, hybrid RAG |
| **V2-merged** | Pattern files (3), corrected dependencies, implementation blueprints, 45 GAP audit items, migration specs, file path references, P0 bug specifications |

### Critical Conflict Resolutions (from cross-pack analysis)

| # | Conflict | Resolution |
|---|---|---|
| 1 | **Event naming**: V2 `snake_case` vs V2m `UPPER_CASE` | V2m: UPPER_CASE (matches Python enum convention) |
| 2 | **BL-022 dependency**: V2 downstream of BL-001, V2m upstream | V2m: BL-022 → BL-001 (DataBrief schema precedes orchestrator) |
| 3 | **Chart library**: V2m BL-009 still says Recharts | **Plotly.js** (DEC-048, V2m GAP-001 flags the error) |
| 4 | **BL-004 scope**: V2=frontend GenUI, V2m=backend AST | V2m: backend Pydantic MarkupAST |
| 5 | **BL-005 scope**: V2=frontend ReportPanel, V2m=backend pipeline | V2m: backend Report Generation Node |
| 6 | **Entity storage**: V2=new tables, V2m=Artifact extension | **DEC-016b (hybrid)**: immutable outputs → Artifacts (SHA-256 content-addressed); mutable LLM-extracted entities → relational tables per MIG-0005B (`entities` + `citations` tables with `source_artifact_id` FK for provenance). Supersedes DEC-016 ("extend Artifact, no new entity table"). MIG-0005A = `entity_type` enum constraint on Artifacts; MIG-0005B = new `entities`/`citations` tables. See #30 decision register. |
| 7 | **FE Shell**: Missing from V2/V2m | **Restore V1's STORY-FE-001** at M0 |
| 8 | **Billing milestone**: V1=M9, V2=M6, V2m=M4 | V2m: M4 (billing can't wait) |
| 9 | **BL-012 collision**: V2=planner prompts, V2m=billing | Rename V2's to BL-031 |
| 10 | **MCP approach**: V2=LangChain→MCP later, V2m=native MCP day 1 | V2m: native MCP from day 1 (DEC-046) |
| 11 | **tenant_id scope**: V1/V2=Run only, V2m=all 4 core tables | V2m: runs + artifacts + manifests + pointers |
| 12 | **Orchestration timing**: V1=M5, V2/V2m=M1 | V2m: M1 (correct prioritization) |
| 13 | **Meta-reasoning**: V2=citation validation, V2m=gap detection + recovery | V2m: richer scope at M1 |

### V3 Epic Structure: 30 Epics Across 5 Tracks

**Track 0: Standards & Governance (3 epics)** — *from V1, no other pack has this*
| Epic | Source | Issues |
|---|---|---|
| **Contract Governance** | V1 EPIC-CONTRACTS + STORY-CON-001 | 8 |
| **Standards & Quality Framework** | V1 docs/06-10 (15 standard areas) | 10 |
| **Design System** | V1 frontend conventions + V2m pattern files | 8 |

**Track A: Platform Core (8 epics)** — *V1 structure + V2m implementation depth*
| Epic | Source | Issues |
|---|---|---|
| **Platform Foundation & CI** | V1 EPIC-PLATFORM + V2m P0-001/002/003 + GAPs | 14 |
| **Frontend Shell** | V1 EPIC-FE-SHELL (restored, missing from V2/V2m) | 12 |
| **Orchestration** | V1 EPIC-ORCH + V2m BL-001/002/017/022 | 18 |
| **GenUI & Rendering** | V1 EPIC-GENUI + V2m 27 primitives + 18 GML tags | 16 |
| **Run Progress & Streaming** | V1 STORY-STREAM-001 + V2m SSE lifecycle | 14 |
| **Documents & Knowledge (EPIC-DOC-INGEST)** | V1 EPIC-DOCUMENTS (6 stories, full pipeline) + **DocIR** platform primitive (DI-002, promoted to Wave 0.5) | 18 |
| **Deliverables** | V1 EPIC-DELIVERABLES + V2m BL-005/006/018/019 | 22 |
| **Notebook** | V1 EPIC-STUDIO C1 + V2m NX-004 | 14 |

> **Track A Platform Primitives** (shared infrastructure consumed by all tracks):
> DocIR (DI-002) — normalizes PDF, DOCX, HTML, scanned images into a structured block tree before any extraction occurs. Identified by agent-4 as the single most important new technical primitive from V2; was absent from V3 synthesis draft and is now restored. Lives in EPIC-DOC-INGEST, Wave 0.5, as a prerequisite for all document-dependent epics across Tracks B, C, and D.

**Track B: Builder Surface (6 epics)** — *V1 + V2 merged*
| Epic | Source | Issues |
|---|---|---|
| **Apps** | V1 EPIC-APPS (6 concepts) + V2m pattern files | 20 |
| **Agents & MCP** | V1 EPIC-AGENTS + V2m native MCP approach | 16 |
| **Skills** | V2 PLUG-005 (packaged subgraphs + registry) | 10 |
| **Tools & Connectors** | V1 tools + V2 PLUG-003 (OAuth, Composio) | 16 |
| **Workflows** | V1 EPIC-WORKFLOWS (full n8n-style spec) | 18 |
| **Decisions** | V2 STUDIO-003 | 8 |

**Track C: Intelligence & Domain (10 epics)** — *V1 intelligence + V2 domain modules*
| Epic | Source | Issues |
|---|---|---|
| **Evidence & Intelligence** | V1 EPIC-INTEL (stale propagation, review queue) | 20 |
| **Analysis Canvas** | V1 EPIC-STUDIO C2 + V2 STUDIO-004 | 16 |
| **CRM / Clients** | V1 EPIC-CRM | 12 |
| **Models & Validation** | V1 EPIC-MODELS (impact diff, explain traces) | 16 |
| **Dashboards** | V1 EPIC-DASH (provenance drilldowns) | 14 |
| **DocuIntelli Module** | V2 (10 concepts: frameworks, anomalies, extraction rules — domain surface only; DocIR primitive is in Track A) | 18 |
| **Lease CD Module** | V2 (calc engine, scenario builder) | 12 |
| **Debt Module** | V2 (amortization, covenant monitoring) | 12 |
| **PropSygnal** | V2 (asset mgmt, signal ingest, dashboards) | 8 |
| **RegSygnal** | V2 (regulatory ingest, obligation mapping) | 8 |

**Track D: Enterprise Shell (3 epics)** — *V1 billing + V2 enterprise + V2m GAPs*
| Epic | Source | Issues |
|---|---|---|
| **Billing & Usage** | V1 EPIC-BILLING + V2m BL-012/013 | 14 |
| **Enterprise Auth (SSO/RBAC)** | V2 EPIC-ENTERPRISE (ENT-001 through ENT-005) | 14 |
| **Observability & Production** | V1 EPIC-PROD + V2 EPIC-OBS | 12 |

### V3 Final Numbers

| Dimension | Count |
|---|---|
| **Tracks** | 5 (0=Standards, A=Core, B=Builder, C=Domain, D=Enterprise) |
| **Epics** | 30 |
| **Estimated Issues** | ~424 |
| **Estimated Tasks** (at screen/API/DB/test depth) | ~2,970 |
| **Decisions to lock** | ~85 (concepts with decision points from agent analysis) |
| **GAP items to resolve first** | 45 (V2-merged audit) |
| **P0 bug fixes before anything** | 5 (arq, sequence race, tenant_id, Redis, CI) |

### What V3 Uniquely Includes That No Single Pack Had

1. **V1's standards framework** (15 areas, DoD, golden fixtures, 5-tier testing) applied to **V2m's implementation blueprints** (27 GenUI primitives, 22 RunEvent types, pattern files)
2. **V1's intelligence stack** (Evidence→Models→Dashboards→Workflows chain) sitting alongside **V2's domain modules** (DocuIntelli→LeaseCD→Debt→PropSygnal→RegSygnal)
3. **V2m's corrected dependencies** and **GAP audit** applied to the **full product scope** rather than just the research harness
4. **V1's contract governance** enforcing quality on **V2m's implementation patterns** — contracts as code + RunEventType Rollout Checklist (6-step, see `Standards/methodology/runeventtype-rollout-checklist.md`) + CI codegen gate applied to all 30 epics
5. **DocIR (DI-002)** restored as a Track A platform primitive — the document normalization layer (PDF, DOCX, HTML, scanned → structured block tree) that all document-dependent epics depend on; identified by agent-4 as V2's most important new technical primitive, promoted from M7 to Wave 0.5

---

> **Insight**
>
> The three packs were never competing — they were three incomplete views of the same product. V1 knew *what* to build (broadest scope, best standards). V2 knew *what comes next* (domain modules, enterprise). V2-merged knew *how* to build (pattern files, corrected deps, implementation blueprints). V3 is the first time all three perspectives exist in one place. The 45 GAP items from V2-merged are now the entrance gate — resolve those, then execute against V1's product scope using V2-merged's engineering rigor.
