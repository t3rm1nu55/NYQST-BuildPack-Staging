# Superagent Parity Plan (Clean Room) — NYQST Intelli (2026-02-16)

Goal: achieve a **Superagent-like** user experience and agentic delivery capability **on NYQST Intelli**, without copying any proprietary prompts or code.

This plan is based on:
- **Observed Superagent behaviors** from a saved-page reverse engineering pass:
  - Evidence set: `/Users/markforster/AirTable-SuperAgent/reports/*`
- **Current Intelli implementation reality**:
  - Build status: `docs/planning/INTELLI_BUILD_STATUS_2026-02-16.md`
- **Design docs as guidance (not a constraint)**:
  - `docs/PLATFORM_REFERENCE_DESIGN.md`, `docs/UI_ARCHITECTURE.md`, `docs/INDEX_CONTRACT.md`

## 0) Superagent parity baseline (what we’re matching)

From the saved Superagent snapshot, the key production-grade capabilities to match are:

### A) Agent runtime + orchestration
- Streaming event protocol with explicit step/tool telemetry (plan/node/tool ids).
- Replayable run history (“replay stream” / event log).
- Human-in-the-loop pause/resume (browser-use / approvals / user input).
- Multi-step planning + parallel tool execution.

### B) Deliverables (not just chat)
- Multiple deliverable types: answers + “enhanced report”, slides, website, document (and optionally code agent).
- Rich report rendering via a declarative markup/component language (with validation/healing).
- Citation system that binds output text to stored entities/sources.

### C) UI quality
- Chat composer with deliverable-type controls.
- “Sources / Files / Activity” panes tied to citations, artifacts, and run events.
- Polished interaction details: streaming, retries, gating, previews.

## 1) Target architecture on Intelli (decision-complete)

### 1.1 Keep Intelli’s kernel as the source of truth
Do not replace the kernel with a workflow engine.

- Substrate (artifacts/manifests/pointers) remains authoritative for “what exists”.
- Run ledger remains authoritative for “what happened”.
- Index Service contract remains the retrieval abstraction boundary.

This matches the philosophy already documented in `docs/PLATFORM_REFERENCE_DESIGN.md`.

### 1.2 Use LangGraph for orchestration (already chosen)
Use LangGraph as the runtime for:
- planner/executor/synthesizer graphs
- long-running deliverable graphs
- interrupts (human-in-loop) and resumability (checkpointer)

Keep LangGraph checkpoints operational (resumption), but log all critical steps to the run ledger.

### 1.3 Adopt a declarative “Deliverable Markup” (clean-room equivalent to Superagent’s GML)
We need a strict, safe rendering format for rich deliverables.

Design choice:
- Define **NYQST Markup v1** as either:
  - (Option A) a JSON AST (recommended; easiest to validate and “heal”)
  - (Option B) an HTML-like tag set parsed into an AST (compatible with existing markdown pipelines)

Key properties:
- finite component registry
- schema validation + “healing” rules
- explicit citation anchors (not free-form links)

This aligns with the “Tier 2 declarative/registry-based” guidance in `docs/RESEARCH_SYNTHESIS.md`.

### 1.4 Unify “Sources / Files / Activity” around existing Intelli primitives
- **Sources**: retrieval/tool outputs stored as artifacts + indexed, referenced by stable ids.
- **Files**: manifest entries and artifact viewers (already exist in Doc Intelligence).
- **Activity**: run ledger timeline (already exists via SSE).

## 2) Parity capability map (Superagent → Intelli)

| Superagent observed capability | Intelli current state | Target implementation on Intelli |
|---|---|---|
| NDJSON event stream with typed events | AI SDK SSE for chat + SSE for run ledger | Keep SSE, add typed “orchestration events” in run ledger payloads + a lightweight “agent event stream” API if needed |
| plan_set_id / plan_id / node_id / tool_id | run_id + run_events; tool call events exist | Add Plan/Node/ToolRun ids to run event payloads and UI components |
| ReplayStream | run event history exists | Add “Replay run” UX + deterministic playback using stored run_events |
| Browser-use + await_user_input | not implemented | Add browser automation service + interrupt/resume endpoints + UI |
| Deliverable types (report/slides/website/doc) | not implemented | Add deliverable pipelines emitting artifacts + deliverable records + preview UI |
| Rich report markup component language | not implemented | Implement NYQST Markup v1 + renderer + validation/healing |
| Inline bracket citations [1] | already used by Research agent prompt; UI supports citation parsing | Extend citations to bind to stored entities, not only RAG chunks |

## 3) Implementation plan (phased, with acceptance criteria)

This is structured as “ship slices that feel complete”.

### Phase 1 — Orchestration event contract + plan visualization (2–3 weeks)
**Outcome:** Intelli shows Superagent-like “Activity” (plan, nodes, tools) in real time.

Backend:
- Define a **canonical run event payload schema** for:
  - plan creation/update
  - node start/stop
  - tool start/stop + progress
  - “current action” strings (human-readable)
- Emit these from LangGraph graphs into `run_events` (RunEventType.STATE_UPDATE + TOOL_CALL_* + STEP_*).

Frontend:
- Extend `RunTimeline` into a richer “Run Explorer”:
  - group events by plan/node/tool
  - show current action, durations, retry states
- Add a “Plan” panel for planner output (even if v1 is simplistic).

Acceptance:
- A run shows: plan → tools → synthesis with clear step boundaries.
- Users can open a run later and see the same timeline (durable history).

### Phase 2 — Entity & citation substrate (2–4 weeks)
**Outcome:** citations refer to first-class entities (web pages, external API data, generated deliverables), not just chunks.

Backend:
- Introduce an **Entity model** (clean room analogue to Superagent’s `WEB_PAGE`, `EXTERNAL_API_DATA`, `GENERATED_REPORT`, etc.).
- Store entity payloads as artifacts + metadata; link entities to:
  - run_id
  - conversation_id
  - source artifacts/manifests
- Define a stable **citation identifier** scheme (e.g., `entity://{uuid}`) and a resolver API.

Frontend:
- Upgrade citations from “index-based [1]” to “clickable entity citations”:
  - hover previews
  - open in side panel (entity viewer)

Acceptance:
- Clicking a citation opens the referenced entity, with provenance (run + artifact source).

### Phase 3 — Web research toolchain (parallelizable) (2–4 weeks)
**Outcome:** Superagent-like web research, still governed and traceable.

Backend (via MCP or internal tools):
- Add web search + crawl tools (choose providers; see “Infra choices” below).
- Store fetched pages as `WEB_PAGE` entities (artifact + extracted text + metadata).
- Add “pending sources” semantics (async entity generation tracked in run events).

Frontend:
- “Sources” panel supports both:
  - document chunks (existing)
  - web sources (new)

Acceptance:
- A prompt like “research X” produces a structured list of sources and citations, not just narrative text.

### Phase 4 — Deliverables v1: Report + Document (4–6 weeks)
**Outcome:** A user can request an “Enhanced Report” and get a rich, previewable artifact.

Backend:
- Implement “Deliverable” record type:
  - deliverable_id, type, status, input manifest(s), output artifact(s), deployed URL (optional)
- Implement **NYQST Markup v1** + renderer:
  - model outputs markup AST
  - validate + heal
  - render to HTML/React and export to PDF/DOCX as artifacts
- Stream report preview updates (section-by-section optional).

Frontend:
- Add deliverable selector in composer (Standard vs Enhanced).
- Add a “Report Preview” panel that streams and then persists.
- Add downloads (PDF/DOCX) from artifact store.

Acceptance:
- Enhanced report is materially better than standard answer (structure + widgets + citations).
- The report is stored as artifacts and can be shared internally by link/URI.

### Phase 5 — Deliverables v2: Slides + Website (6–10 weeks)
**Outcome:** comparable deliverable breadth to Superagent.

Slides:
- Generate PPTX (or HTML slide deck) as artifacts; preview in UI.

Website:
- Generate a static site bundle as artifacts.
- Optional deploy step to a configured host; store deployed URL; provide status endpoint.

Acceptance:
- A “Website” deliverable produces a browsable preview and optional deployment.

### Phase 6 — Browser-use / HITL (6–12 weeks, can start earlier)
**Outcome:** pause/resume around browser automation with user input.

Backend:
- Introduce a browser automation service (Playwright-based) that:
  - runs in an isolated worker environment
  - can stream view (screenshots/VNC/WebRTC) or emit step artifacts
  - supports interrupts (“await user input”) and resumption tokens

Frontend:
- Embedded browser view + “continue” controls.
- Run ledger events show browser steps and approvals.

Acceptance:
- The agent can complete a multi-step web task requiring user input without losing provenance.

## 4) Infra/compatibility choices (need your input)

These are the places where “Superagent-like” requires a concrete infra decision on NYQST:

1) **Search + crawl providers**
   - Options: Brave Search API, Firecrawl, SerpAPI, Tavily, self-hosted crawler
   - Decision: which are allowed, and how credentials are managed (tenant scoped?)

2) **Browser automation runtime**
   - Options: run Playwright in a worker pool (Docker/K8s), or use a managed browser provider
   - Decision: do we need live video streaming, or is step-level screenshot capture sufficient for v1?

3) **Model providers**
   - Current: OpenAI-only env vars
   - Decision: do you want multi-provider now (Anthropic/Azure/Bedrock), or defer until after deliverables v1?

4) **Deploy targets for websites**
   - Options: Vercel, Netlify, S3+CloudFront, Cloudflare Pages, internal hosting
   - Decision: what is “your platform” standard for deployments?

5) **Streaming protocol**
   - Current: AI SDK SSE for chat; SSE for run events
   - Decision: keep (recommended), or add NDJSON endpoints to match Superagent more literally?

## 5) Library and system references (for implementation)

Backend:
- LangGraph (Python): https://langchain-ai.github.io/langgraph/
- LangGraph checkpoints (Postgres): https://pypi.org/project/langgraph-checkpoint-postgres/
- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Docling: https://github.com/DS4SD/docling
- MCP: https://modelcontextprotocol.io/
- OpenSearch: https://opensearch.org/docs/
- MinIO (S3): https://min.io/docs/
- Playwright (Python): https://playwright.dev/python/

Frontend:
- Vercel AI SDK: https://sdk.vercel.ai/docs
- assistant-ui: https://www.assistant-ui.com/
- shadcn/ui: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/
- TanStack Query: https://tanstack.com/query/latest

## 6) Review agenda (what I need from you)

To finalize execution details, pick defaults for:
- Web research provider(s)
- Browser-use strategy (streaming vs screenshots)
- Website deploy target
- Multi-provider timeline (now vs later)
- Deliverable priority order (Report first is recommended)

