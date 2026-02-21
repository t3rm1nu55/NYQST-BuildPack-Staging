# Project Objectives & Methodology

> **Date**: 2026-02-16
> **Status**: Active
> **Master systems**: GitHub (code/docs), Serena (code intelligence)

---

## Objectives

### OBJ-1: Understand Superagent System Completely
Full reverse-engineering of the Superagent product as a system. Every route, component, data flow, API call, state machine, and user journey.

**Deliverable**: `docs/analysis/SYSTEM-ARCHITECTURE.md` — complete system map

### OBJ-2: Understand Agentic System Completely
The mechanics AND specific agents. How orchestration works, what each agent does, how they coordinate, what tools they use, how state flows between them, how errors are handled, how results are aggregated.

**Deliverable**: `docs/analysis/AGENTIC-SYSTEM.md` — agent catalog, orchestration mechanics, tool registry

### OBJ-3: Infer Methods for Top-Class Results
Separate from UI. This is about:
- **Prompting**: System prompts, structured output schemas, chain-of-thought patterns
- **Helpers**: Healers, validators, formatters, post-processors
- **Libraries**: What they use and why (Plotly, Recharts, pdf.js, Lottie, etc.)
- **Workflows**: Review passes, handoffs, specialization (e.g., research agent → synthesis agent → generation agent)
- **Hooks**: Pre/post processing, quality gates, fallback strategies
- **Quality signals**: What makes outputs excellent vs mediocre

**CRITICAL DISTINCTION**:
- Artifact outputs (reports, websites, slides) = dynamic, LLM-generated, per-request
- Site UI (chat, plan viewer, activity panel) = wired, engineered, static architecture
- These are COMPLETELY SEPARATE analysis tracks

**Deliverable**: `docs/analysis/QUALITY-METHODS.md` — prompting patterns, quality pipeline, workflow analysis

### OBJ-4: Continuous Goal Focus — Build At Least As Good
Iterative delivery planning with:
- Build stages aligned to system components
- Interactions with wider design (existing intelli services)
- Service dependencies and integration points
- Pragmatic delivery with consensus checkpoints
- Constant revision cycles on backlog proposals
- New interaction points identified and tracked
- **Prefer existing components** — flag tradeoffs when new ones seem needed
- Async/parallel execution wherever possible
- Professional standards: design → build → test → review → deploy

**Deliverable**: Living backlog in `docs/plans/BACKLOG.md` + task tracking

---

## Methodology

### Analysis Method: Three-Layer Decomposition

```
Layer 1: PRODUCT (what users see)
  Routes, pages, components, interactions, state machines
  → OBJ-1 deliverable

Layer 2: AGENTS (what produces results)
  Orchestrator, subagents, tools, state flow, error handling
  → OBJ-2 deliverable

Layer 3: QUALITY (what makes it good)
  Prompts, helpers, workflows, review passes, output repair
  → OBJ-3 deliverable
```

Each layer is analyzed independently, then cross-referenced.

### Agent Dispatch Protocol

| Task Type | Agent Tier | Pattern |
|-----------|-----------|---------|
| Scan JS bundles for patterns | haiku | grep → extract → summarize |
| Trace specific code paths | sonnet | read symbols → follow references → document |
| Analyze architecture decisions | opus | review findings → synthesize → validate |
| Cross-reference layers | opus | compare layer outputs → identify gaps → dispatch follow-ups |

### Revision Cycle

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Analyze    │───→│  Document    │───→│  Review     │
│  (agents)   │    │  (write .md) │    │  (validate) │
└─────────────┘    └──────────────┘    └─────────────┘
       ↑                                      │
       │           ┌──────────────┐           │
       └───────────│  Revise      │←──────────┘
                   │  (update)    │
                   └──────────────┘
```

Every analysis doc gets:
1. Written by analysis agent
2. Reviewed against source material
3. Cross-referenced with other layers
4. Gaps identified → new analysis dispatched
5. Backlog updated with build implications

### Documentation Standards
- All docs in `docs/analysis/` (analysis) or `docs/plans/` (build planning)
- Serena memories for persistent operational knowledge
- GitHub commits for all document milestones
- Cross-references between docs using relative paths
- Every finding tagged with source evidence (file:line or screenshot)
- Confidence levels: CONFIRMED (multiple sources) | INFERRED (single source) | SPECULATED (logical deduction)

### Build Planning Standards
- System components identified and cataloged
- Each component checked against existing intelli design FIRST
- New components flagged with tradeoff analysis
- Integration points mapped explicitly
- Async/parallel opportunities identified
- Test strategy defined per component
- Dependencies tracked in backlog

### Interaction Point Tracking
Every time analysis reveals a touchpoint between our system and:
- External services (Stripe, Brave, Jina, hosting)
- Existing intelli services (genui-dashboards, wiki-propresearch)
- User-facing boundaries (auth, quota, streaming)
- Data boundaries (artifact storage, DB schema, search index)

→ Log it in `docs/plans/INTERACTION-POINTS.md`

---

## Current State

### What We Have
- 15+ analysis documents from JS/CSS/webarchive forensics
- 5 earlier analysis reports (reports/ directory)
- 4 mapping documents (Mappings 01-04)
- 9 screenshot analyses
- 788K chat export (unanalyzed — HIGH VALUE)
- Build status + parity plan for intelli platform

### What We Need Next
1. **Deep analysis of chat export** — likely contains actual agent prompts, reasoning chains, tool calls
2. **Systematic JS bundle analysis** — extract ALL Zod schemas, API routes, state machines
3. **Webarchive diff analysis** — progressive snapshots reveal orchestration timeline
4. **Cross-reference existing reports/** with main analysis docs — fill gaps
5. **Artifact vs UI separation** — explicitly categorize every component

---

## Tracking

All objectives tracked via:
- Serena memories (operational knowledge)
- Task system (immediate work items)
- `docs/plans/BACKLOG.md` (build backlog — living document)
- `docs/plans/INTERACTION-POINTS.md` (integration touchpoints)
- Git commits (milestones)
