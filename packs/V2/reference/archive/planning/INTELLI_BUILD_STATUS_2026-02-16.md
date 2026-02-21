# Intelli Build Status (2026-02-16)

This is a **repo-grounded** snapshot of what exists today in:
`/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126`

Design/reference docs are used as a guide (not a constraint):
- `docs/PLATFORM_REFERENCE_DESIGN.md`
- `docs/UI_ARCHITECTURE.md`
- `docs/INDEX_CONTRACT.md`
- `docs/STARTUP_SEQUENCE.md`

## 1) What is running end-to-end today (demo-grade but real)

### Backend (FastAPI, Python)
**Status:** Working, with validated local startup scripts.

Core services exist and are wired:
- **Substrate**
  - Artifacts: content-addressed blobs (SHA-256), S3-compatible storage (MinIO in dev)
  - Manifests: immutable trees of artifact refs
  - Pointers: mutable HEAD refs to manifests (bundle semantics)
  - API: `src/intelli/api/v1/{artifacts,manifests,pointers}.py`
- **Runs + Run Ledger**
  - Run lifecycle + append-only events (`run_events`)
  - API: `src/intelli/api/v1/runs.py`
  - SSE stream for run events via Postgres LISTEN/NOTIFY:
    - `GET /api/v1/streams/runs/{run_id}` in `src/intelli/api/v1/streams.py`
- **RAG / Doc Intelligence (minimal)**
  - Index + retrieve scoped to a manifest/pointer
  - Doc parsing via Docling conversion for PDFs/DOCX/HTML
  - Index backend: OpenSearch or pgvector (configurable)
  - Service: `src/intelli/services/knowledge/rag_service.py`
  - API: `src/intelli/api/v1/rag.py`
- **Sessions**
  - Session lifecycle is present (used by UI mount/unmount)
  - API: `src/intelli/api/v1/sessions.py`
- **Conversations + Messages**
  - Conversations table + message persistence exist
  - Service: `src/intelli/services/conversation_service.py`
  - API: `src/intelli/api/v1/conversations.py`
- **Tags**
  - Universal tagging primitives exist
  - API: `src/intelli/api/v1/tags.py`

### Agent runtime (LangGraph)
**Status:** Working for a single “research assistant” that does doc-grounded Q&A.

- Research agent graph: `src/intelli/agents/graphs/research_assistant.py`
  - Tool-use loop (ToolNode) with a small tool set:
    - `search_documents` (RAG retrieve)
    - `list_notebooks`
    - `get_document_info`
    - `compare_manifests`
  - Prompt includes explicit **[1]** style citation instructions.
- Streaming chat endpoint:
  - `POST /api/v1/agent/chat` in `src/intelli/api/v1/agent.py`
  - Streams **Vercel AI SDK Data Stream Protocol** over SSE (`text/event-stream`)
  - Adapter: `src/intelli/agents/adapters/__init__.py`

### Frontend (Vite, React)
**Status:** Working “Doc Intelligence” + “Research Assistant” flows; other modules are placeholders.

Canonical frontend is `ui/` (per `docs/START_HERE.md`):
- `ui/src/pages/NotebooksPage.tsx` + `ui/src/pages/NotebookPage.tsx`
  - Create notebook pointer, upload files, advance pointer to new manifest
  - Ask questions via `ragApi.ask`
- `ui/src/pages/ResearchPage.tsx`
  - Notebook selector + chat experience (`ChatPanel`)
- `ChatPanel` (`ui/src/components/chat/ChatPanel.tsx`)
  - Uses `@assistant-ui/react-ui` + `@ai-sdk/react`
  - Sources panel (`SourcesPanel`) and run timeline (`RunTimeline`) are present
- Run timeline viewer (`ui/src/components/runs/RunTimeline.tsx`)
  - Shows tool calls, LLM calls, retrieval events from the run ledger

## 2) Observability, debugging, and reliability primitives

- Optional tracing via Langfuse:
  - Docs: `docs/OBSERVABILITY.md`
  - Integration hook: `src/intelli/agents/observability.py`
- Backend logging + correlation middleware exists:
  - `src/intelli/api/middleware/*`
- Streaming reliability:
  - Run event SSE includes heartbeat every 30s in `src/intelli/api/v1/streams.py`

## 3) “Validated startup” and developer UX

The repo includes a validated local startup sequence:
- `bash scripts/dev/validate.sh` (infra → migrations → health → API smoke → UI build)
- `bash scripts/dev/run.sh` (interactive demo)

Docs: `docs/STARTUP_SEQUENCE.md`

## 4) Notable architectural choices already made (and working)

### A) Two different streams exist (chat vs run events)

1) **Chat stream**: AI SDK SSE (assistant output + tool UI events)
- `POST /api/v1/agent/chat` (SSE)
- Used by the chat UI transport (`@assistant-ui/react-ai-sdk`)

2) **Run stream**: platform SSE for run ledger events (audit timeline)
- `GET /api/v1/streams/runs/{run_id}` (SSE)
- Used by `RunTimeline` via `useRunEventStream`

This is a good foundation for a “Sources / Files / Activity” UX:
- “Activity” maps to run ledger events
- “Sources” maps to retrieval/tool outputs
- “Files” maps to the manifest’s entries / artifacts

### B) Kernel primitives are in place

The substrate + run ledger design in `README.md` / `docs/PLATFORM_REFERENCE_DESIGN.md`
is already implemented to a “works locally / demo” standard:
- content-addressed artifacts
- immutable manifests
- pointer advances as the main mutation
- append-only run event ledger

## 5) Current gaps vs a Superagent-like product (high-level)

Relative to the Superagent behaviors observed in `/Users/markforster/AirTable-SuperAgent/reports/*`:

### Agent runtime gaps
- No multi-agent “planner → parallel executors → synthesizer” workflow yet (single agent loop only).
- No explicit “plan/node/tool” identifiers in the UI contract (run events exist, but not mapped to a plan DAG).
- No human-in-the-loop “browser-use” subsystem (interrupt/resume around real browser automation).
- No durable run replay UI (event history exists, but replay UX is not first-class).

### Deliverable gaps
- No first-class deliverables beyond chat + citations (no report/slides/website/document generator pipelines).
- No declarative rich-output markup (Superagent has a tag/component language for report rendering).

### Product gaps
- No deliverable selector + credit gating / feature gates in the chat composer.
- No “tasks” UX for long-running/background jobs across deliverables.
- Provider control plane is single-provider (OpenAI env config) rather than managed multi-provider profiles.

### UI gaps
- Workbench exists, but modules beyond Doc/Research are placeholders.
- The UI is functional and modern, but not yet at “polished consumer product” level across all flows.

