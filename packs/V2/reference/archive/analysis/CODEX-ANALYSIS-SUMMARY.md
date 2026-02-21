---
document_id: CODEX-SUMMARY
version: 1
date: 2026-02-18
sources:
  - INTELLI_BUILD_STATUS_2026-02-16.md
  - SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md
  - SUPERAGENT_PARITY_INFRA_SWAPPOINTS_2026-02-16.md
caution: These documents were produced by Codex and may contain errors or incorrect assumptions about the codebase. Claims below are quoted directly and should be cross-checked against ground truth.
---

# Codex Analysis Summary

## Section 1: Build Status (from Codex)

### 1.1 What Codex says is built and working

#### Backend (FastAPI, Python)
- **Artifacts**: content-addressed blobs (SHA-256), S3-compatible storage (MinIO in dev)
  - API: `src/intelli/api/v1/artifacts.py`
- **Manifests**: immutable trees of artifact refs
  - API: `src/intelli/api/v1/manifests.py`
- **Pointers**: mutable HEAD refs to manifests (bundle semantics)
  - API: `src/intelli/api/v1/pointers.py`
- **Runs + Run Ledger**:
  - Run lifecycle + append-only events (`run_events` table)
  - API: `src/intelli/api/v1/runs.py`
  - SSE stream for run events via Postgres LISTEN/NOTIFY: `GET /api/v1/streams/runs/{run_id}` in `src/intelli/api/v1/streams.py`
  - Includes 30-second heartbeat
- **RAG / Doc Intelligence**:
  - Index + retrieve scoped to a manifest/pointer
  - Doc parsing via Docling conversion for PDFs/DOCX/HTML
  - Index backend: OpenSearch or pgvector (configurable)
  - Service: `src/intelli/services/knowledge/rag_service.py`
  - API: `src/intelli/api/v1/rag.py`
- **Sessions**: Session lifecycle present, used by UI mount/unmount
  - API: `src/intelli/api/v1/sessions.py`
- **Conversations + Messages**: Conversations table + message persistence exist
  - Service: `src/intelli/services/conversation_service.py`
  - API: `src/intelli/api/v1/conversations.py`
- **Tags**: Universal tagging primitives exist
  - API: `src/intelli/api/v1/tags.py`

#### Agent runtime (LangGraph)
- **Research agent graph**: `src/intelli/agents/graphs/research_assistant.py`
  - Tool-use loop (ToolNode) with tools: `search_documents`, `list_notebooks`, `get_document_info`, `compare_manifests`
  - Prompt includes explicit `[1]` style citation instructions
- **Streaming chat endpoint**: `POST /api/v1/agent/chat` in `src/intelli/api/v1/agent.py`
  - Streams Vercel AI SDK Data Stream Protocol over SSE (`text/event-stream`)
  - Adapter: `src/intelli/agents/adapters/__init__.py`

#### Frontend (Vite, React)
- **Canonical frontend**: `ui/` directory per `docs/START_HERE.md`
  - `ui/src/pages/NotebooksPage.tsx` + `ui/src/pages/NotebookPage.tsx`: Create notebook pointer, upload files, advance pointer
  - `ui/src/pages/ResearchPage.tsx`: Notebook selector + chat experience
  - `ChatPanel` (`ui/src/components/chat/ChatPanel.tsx`): Uses `@assistant-ui/react-ui` + `@ai-sdk/react`
  - `SourcesPanel`: Renders sources in chat
  - `RunTimeline` (`ui/src/components/runs/RunTimeline.tsx`): Shows tool calls, LLM calls, retrieval events from run ledger

#### Observability & Reliability
- Optional tracing via Langfuse: `src/intelli/agents/observability.py`
- Backend logging + correlation middleware: `src/intelli/api/middleware/*`
- Validated local startup: `bash scripts/dev/validate.sh` and `bash scripts/dev/run.sh`

### 1.2 What Codex says is missing or broken

#### Agent runtime gaps
- No multi-agent "planner → parallel executors → synthesizer" workflow yet (single agent loop only)
- No explicit "plan/node/tool" identifiers in the UI contract (run events exist, but not mapped to a plan DAG)
- No human-in-the-loop "browser-use" subsystem (interrupt/resume around real browser automation)
- No durable run replay UI (event history exists, but replay UX is not first-class)

#### Deliverable gaps
- No first-class deliverables beyond chat + citations (no report/slides/website/document generator pipelines)
- No declarative rich-output markup (Superagent has a tag/component language for report rendering)

#### Product gaps
- No deliverable selector + credit gating / feature gates in the chat composer
- No "tasks" UX for long-running/background jobs across deliverables
- Provider control plane is single-provider (OpenAI env config) rather than managed multi-provider profiles

#### UI gaps
- Workbench exists, but modules beyond Doc/Research are placeholders
- Not yet at "polished consumer product" level across all flows

### 1.3 Potential errors in Codex's build status assessment

| Claim | Confidence | Risk |
|-------|-----------|------|
| Docling is used for PDF/DOCX/HTML parsing | Medium | Needs verification—check `rag_service.py` for actual parsing library |
| SSE heartbeat is 30s | Medium | Should verify in `streams.py` code |
| Research agent tools are exactly `{search_documents, list_notebooks, get_document_info, compare_manifests}` | Medium | Tool set may have changed; check `research_assistant.py` |
| `@assistant-ui/react-ui` is used (vs just `@assistant-ui/react`) | Low | Typo risk; check `ChatPanel.tsx` imports |
| Conversations table exists from migration 0004 | Low | Previous MEMORY.md confirms, but verify migration file exists |
| Frontend is *only* in `ui/` directory | Low | There may be other UI builds; check for `frontend/`, `web/`, etc. |

---

## Section 2: Parity Plan (from Codex)

### 2.1 Codex's proposed approach to achieving parity

Codex proposes a **phased implementation** that:
1. Keeps Intelli's kernel (artifacts/manifests/pointers/run ledger) as source of truth
2. Uses LangGraph for orchestration of planner/executor/synthesizer graphs
3. Adopts a declarative **"NYQST Markup v1"** as clean-room equivalent to Superagent's GML
4. Unifies "Sources / Files / Activity" around existing Intelli primitives (retrieval artifacts, manifest entries, run events)

### 2.2 Phased delivery plan

| Phase | Target | Duration | Key deliverable | Acceptance criteria |
|-------|--------|----------|-----------------|-------------------|
| 1 | Orchestration event contract + plan visualization | 2–3 weeks | Show plan → nodes → tools in Activity panel | Run shows plan/nodes/tools with clear step boundaries; durable history |
| 2 | Entity & citation substrate | 2–4 weeks | First-class entities (web pages, API data, reports); clickable citations | Clicking citation opens entity viewer with provenance |
| 3 | Web research toolchain | 2–4 weeks | Web search/crawl tools; WEB_PAGE entities | Structured list of sources and citations |
| 4 | Deliverables v1: Report + Document | 4–6 weeks | NYQST Markup v1 + renderer; Enhanced Report UX | Report stores as artifacts, can be shared by link |
| 5 | Deliverables v2: Slides + Website | 6–10 weeks | PPTX/HTML slides; static site generation | Browsable preview + optional deployment |
| 6 | Browser-use / HITL | 6–12 weeks | Playwright-based automation + pause/resume | Multi-step web task with user input without losing provenance |

### 2.3 Technical decisions Codex makes

| Decision | Codex's Choice | Rationale / Notes | Risk |
|----------|---|---|---|
| Kernel authority | Keep Intelli's substrate + run ledger | Matches philosophy in existing design docs | Low—existing architecture, no rewrite |
| Orchestration runtime | LangGraph | Already chosen; supports graphs + checkpoints + interrupts | Low—established, documented |
| Deliverable markup language | NYQST Markup v1 (clean-room) — either JSON AST (recommended) or HTML-like tag set | Finite component registry, schema validation, citation anchors | Medium—needs design; JSON AST vs HTML-like is unresolved |
| Streaming protocol | Keep AI SDK SSE + SSE ledger (recommended) | Dual streams can deliver same semantics as Superagent's unified NDJSON | Medium—doesn't literally match Superagent, but pragmatic |
| Run replay | Add "Replay run" UX using stored run_events | Deterministic playback | Low—run events already append-only |
| Browser-use approach | Phase 6 (later) | Deferred to 6–12 week window | Low—phased approach mitigates risk |

### 2.4 Libraries and dependencies Codex recommends

**Backend:**
- LangGraph (Python): orchestration + checkpoints
- LangGraph-checkpoint-postgres: durable resumption
- FastAPI: web framework (already chosen)
- SQLAlchemy: ORM (already chosen)
- Docling: doc parsing (already used)
- MCP: for tool/service integrations
- OpenSearch: vector search (already used)
- MinIO: S3-compatible storage (already used)
- Playwright (Python): browser automation

**Frontend:**
- Vercel AI SDK: chat streaming (already used)
- assistant-ui: chat components (already used)
- shadcn/ui: component library (already used)
- Radix UI: base components (already used)
- TanStack Query: data fetching (already used)

### 2.5 What Codex says about the existing LangGraph setup

From the Build Status document:
- "Research agent graph exists and is working for a single 'research assistant' that does doc-grounded Q&A"
- Tool-use loop is in place with citation prompt
- Streaming chat endpoint is functional

From the Parity Plan:
- "Use LangGraph as the runtime for planner/executor/synthesizer graphs"
- "Keep LangGraph checkpoints operational (resumption), but log all critical steps to the run ledger"
- This suggests the current Research agent graph is a *single-agent* example that will be extended, not replaced

### 2.6 Infrastructure dependencies deferred to you

Codex explicitly flags these as "need your input":

1. **Search + crawl providers**: Brave Search API, Firecrawl, SerpAPI, Tavily, self-hosted crawler?
2. **Browser automation runtime**: Playwright self-hosted vs managed browser provider?
3. **Model providers**: OpenAI-only vs multi-provider router (Anthropic/Azure/Bedrock)?
4. **Deploy targets for websites**: Vercel, Netlify, S3+CloudFront, Cloudflare Pages, internal?
5. **Streaming protocol**: Keep dual SSE vs add NDJSON endpoints?

---

## Section 3: Infrastructure Swap Points (from Codex)

### 3.1 High-impact decisions (Codex flags these as "decide early")

| Item | Intelli current | Superagent observed | Codex recommendation | Your input needed |
|------|---|---|---|---|
| **Streaming contract** | Chat: AI SDK SSE; Ledger: Postgres LISTEN/NOTIFY SSE | Unified NDJSON over `fetch()` | Keep AI SDK + ledger SSE (recommended) | Do you want literal NDJSON parity or is dual-SSE OK? |
| **Long-running execution** | Request/response + streaming | Appears to run multi-day research tasks | Minimal (short runs) vs durable queue (Celery/Dramatiq/RQ/Temporal) | Do you need "pause task, return tomorrow" capability? |
| **Browser-use (HITL)** | Kernel has approval event types, no browser service | Browser automation + approvals | Approvals-only first (recommended) | Browser-use now vs Phase 6? |

### 3.2 Infrastructure swap matrix (by subsystem)

| Subsystem | Intelli current default | Likely parity requirement | Decision needed | Status |
|---|---|---|---|---|
| **Auth** | Dev bootstrap + API auth middleware | Production auth + workspace scoping | Supabase/Auth0/Ory/custom? SSO? | Unresolved |
| **DB** | Postgres | Postgres is fine | Managed Postgres vendor? backup/restore? | Postgres OK; vendor choice deferred |
| **Object storage** | MinIO in dev (S3-compatible) | S3-style artifact store | AWS S3 / GCS / Azure Blob? encryption? | Unresolved |
| **Vector/search** | OpenSearch preferred + pgvector fallback | Hybrid retrieval + provenance | OpenSearch vs pgvector-only vs Elastic vs managed | Unresolved |
| **Model provider** | OpenAI via `langchain_openai` + `openai` SDK | Multi-provider + governance | OpenAI-only vs router (OpenAI/Anthropic/etc)? private base URL? | Unresolved |
| **Web search** | Not present | Web research + citations | Which provider(s): Brave/SerpAPI/custom? | Unresolved |
| **Crawl/extract** | Not present | Reliable URL fetch + extraction | Firecrawl/custom crawler? anti-bot stance? | Unresolved |
| **"Pro sources"** | Not present | Optional premium connectors | In-scope or defer? which data sources? | Unresolved |
| **Browser automation** | Not present | HITL actions, login walls, etc | Playwright self-hosted vs hosted browser provider | Unresolved |
| **Observability** | Langfuse optional | Tracing + run costs + evaluations | Langfuse vs LangSmith vs OpenTelemetry-first | Unresolved |
| **Analytics/flags** | Not present | Feature gates + experiments | PostHog? internal? none initially? | Unresolved |
| **Deployment** | Docker compose for dev | Production deploy pipeline | Single-tenant vs multi-tenant; k8s vs VM vs serverless | Unresolved |

### 3.3 Intentional divergences (where Intelli differs from Superagent by design)

Codex flags these as "expected differences, accept unless strong reason not to":

1. **Frontend framework**: Superagent uses Next.js pages router; Intelli uses Vite + React + assistant-ui. Parity is UX quality, not framework.
2. **Deliverable rendering contract**: Superagent uses custom tag set; Intelli plans NYQST Markup v1 JSON AST (clean-room).
3. **Unified stream vs dual stream**: Superagent uses unified NDJSON; Intelli uses chat stream (AI SDK) + ledger stream (SSE). Codex claims "we can still deliver the same semantics."

---

## Section 4: Key Claims to Verify Against Ground Truth

Below are 10 specific factual claims from Codex's documents that could be right or wrong and need cross-checking:

### Priority 1: Critical to build plan

1. **CLAIM**: "Research agent graph exists in `src/intelli/agents/graphs/research_assistant.py` with tools: `search_documents`, `list_notebooks`, `get_document_info`, `compare_manifests`"
   - **Why verify**: Codex may have outdated tool set; tools may have been renamed/removed
   - **How to verify**: Read actual file and inspect ToolNode definition

2. **CLAIM**: "Run events are stored in `run_events` table with append-only semantics"
   - **Why verify**: Schema changes may have renamed/restructured this; append-only semantics must be enforced in code
   - **How to verify**: Check migrations folder for table definition; inspect runs.py for event insertion logic

3. **CLAIM**: "SSE stream at `GET /api/v1/streams/runs/{run_id}` uses Postgres LISTEN/NOTIFY with 30-second heartbeat"
   - **Why verify**: Implementation details like heartbeat interval could be wrong; LISTEN/NOTIFY may not be the transport
   - **How to verify**: Read `src/intelli/api/v1/streams.py` and look for asyncio/sleep/LISTEN/NOTIFY calls

4. **CLAIM**: "LangGraph checkpoints are operational for resumption"
   - **Why verify**: Checkpoints may not be wired into the current research agent; resumption UX may not exist
   - **How to verify**: Search for checkpoint configuration in research_assistant.py or agent startup code

### Priority 2: Important for phased plan

5. **CLAIM**: "RAG service uses Docling for PDF/DOCX/HTML parsing"
   - **Why verify**: Parser library could be different; Docling may only be used in one path
   - **How to verify**: Grep for `docling` or `from docling` in rag_service.py and related files

6. **CLAIM**: "Conversations table exists and message persistence is implemented"
   - **Why verify**: Conversations may be ephemeral in the current schema; messages may be log-only
   - **How to verify**: Check migrations for conversations/messages table creation; inspect conversation_service.py

7. **CLAIM**: "Frontend ChatPanel uses `@assistant-ui/react-ui` + `@ai-sdk/react`"
   - **Why verify**: Package names/imports could be slightly different; may be using older assistant-ui versions
   - **How to verify**: Check `ui/src/components/chat/ChatPanel.tsx` imports and package.json versions

### Priority 3: Important for infra decisions

8. **CLAIM**: "OpenSearch is preferred for vector/search; pgvector is fallback"
   - **Why verify**: Only pgvector may be configured in dev/prod; OpenSearch may not be deployed
   - **How to verify**: Check environment variables and rag_service.py backend selection logic

9. **CLAIM**: "Object storage uses S3-compatible API (MinIO in dev)"
   - **Why verify**: May be hardcoded to AWS S3 or GCS; S3-compatible abstraction may not be fully implemented
   - **How to verify**: Check artifact storage initialization in app startup and any S3 client configuration

10. **CLAIM**: "Migrations include 4 files (0001–0004); migration 0004 added conversations/messages/sessions/tags"
    - **Why verify**: Migration set could be out of date; table names could differ; other migrations may have been added
    - **How to verify**: List files in migrations folder; inspect 0004.sql or equivalent for table definitions

---

## Section 5: Recommendations for Next Steps

### Immediate (before building)
1. Run the verification checklist (Section 4) against actual codebase
2. Get explicit decisions on the 5 "infra/compatibility choices" flagged in Codex's plan
3. Confirm phasing expectations: is Phase 1 → Phase 2 → Phase 3 → etc. the actual roadmap?

### Before Phase 1 starts
1. Verify Research agent graph structure and tool set
2. Confirm run event schema matches Codex's description
3. Test SSE heartbeat and LISTEN/NOTIFY reliability under load

### Cross-check with existing docs
1. Compare Codex's build status against `docs/PLATFORM_REFERENCE_DESIGN.md`, `docs/UI_ARCHITECTURE.md`, `docs/INDEX_CONTRACT.md`
2. Check if `docs/START_HERE.md` still points to `ui/` as canonical frontend
3. Verify startup scripts still work: `scripts/dev/validate.sh` and `scripts/dev/run.sh`

### Document decisions
1. Use Codex's "decision record template" (Section 4 of INFRA_SWAPPOINTS doc) for each infrastructure choice
2. Create a companion "INFRASTRUCTURE_DECISIONS.md" in the project repo
3. Link phased plan to specific team members / sprint capacity

---

## Appendix: Document source locations

- **INTELLI_BUILD_STATUS_2026-02-16.md**: `/Users/markforster/AirTable-SuperAgent/docs/planning/INTELLI_BUILD_STATUS_2026-02-16.md`
- **SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md**: `/Users/markforster/AirTable-SuperAgent/docs/planning/SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md`
- **SUPERAGENT_PARITY_INFRA_SWAPPOINTS_2026-02-16.md**: `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/docs/planning/SUPERAGENT_PARITY_INFRA_SWAPPOINTS_2026-02-16.md`
