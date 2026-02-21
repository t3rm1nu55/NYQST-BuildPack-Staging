# Spec ↔ repo delta (alignment report)

Repo snapshot: `nyqst-intelli-230126-main` (local zip you provided). Generated: 2026-02-20T20:31:19.629044Z.

This report is written to help agents start from the code that exists today, while aligning implementation to **NYQST Platform — Production Intelligence Build Guide v5** (included in `reference/`).

## What already exists (keep, don’t rewrite)

Backend:
- FastAPI service layout with clear router separation (`src/intelli/api/v1/*`).
- Agent entrypoint already uses **Vercel AI SDK protocol** via `LangGraphToAISDKAdapter` (streaming text + data chunks).
- **Run ledger** tables + event streaming endpoint exist (`runs`, `run_events`, `/api/v1/streams/runs/{run_id}`), already using Postgres LISTEN/NOTIFY.
- Document substrate primitives exist: `Artifact`, `Manifest`, `Pointer` tables + APIs; UI workbench already reads them.
- First-cut RAG exists: `KnowledgeBase`, `Document`, `RagChunk`, `RagQuery`, plus OpenSearch + embeddings service (`RagService`).
- MCP server scaffold exists (`src/intelli/mcp/*`) + substrate tools.

Frontend:
- A shadcn-style shell with the right module-level navigation already exists (`ui/src/App.tsx`).
- Docs/Notebook workflows exist (`DocsPage`, `NotebooksPage`, `NotebookPage`) including upload + ask flow.
- Research surface exists (`ResearchPage`) with ChatPanel + SourcesPanel + NotebookPanel.
- Run event timeline UI exists (`RunTimeline`) and is wired to SSE.

## What is present but diverges from the spec

1) **Deliverable selection location**
- Repo: `deliverable_type` is currently on `Conversation`.
- Spec (DEC-023): `deliverable_type` should be on **USER Message**, so a single conversation can produce different deliverables per turn.
- Alignment action: add `messages.deliverable_type` + treat `conversation.deliverable_type` as a default/backfill field.

2) **Run event taxonomy**
- Repo: run ledger emits operational events (`run_started`, `step_*`, `tool_call_*`, `llm_call_*`, `retrieval_*`).
- Spec: adds user-facing plan/tool/report events (PlanSet/task updates, report preview deltas, references_found / citation lifecycle).
- Alignment action: keep operational events (useful for debugging) and extend with spec events. Update UI renderers accordingly.

3) **Research graph scope**
- Repo: a single agent loop built with `create_react_agent()`.
- Spec: planner → Send() fan-out workers → fan-in synth → DataBrief → generator.
- Alignment action: wrap the existing tool-using agent as the *worker* node and introduce orchestration above it.

4) **MCP tool coverage**
- Repo: substrate tools exist; knowledge tools are stubbed.
- Spec: MCP is universal tool protocol `{domain}.{resource}.{action}` with discovery, filtering, and policy gating.
- Alignment action: implement knowledge tools + add tool discovery/registry + per-scope enablement.

## Not implemented yet (pure gaps)

- GenUI descriptor engine + GML tag renderer + healer.
- Deliverables pipelines: report, website (arq), slides (reveal), document export (PDF/DOCX).
- Entity/citation system (content-addressed entity store + references_found events + inline citations).
- Billing/metering (Stripe + quota middleware + usage records).
- Context inheritance / background indexing “Cursor-like” (task ↔ app ↔ project ↔ workspace).
- Analysis infinite canvas with diffing + linking + agentic workflows (dashboard builders, modelling validation).
- Domain modules beyond Research harness (Lease CDs, Debt, RegSygnal, DocuIntelli, PropSygnal).

## Immediate repo-level fixes to unblock parallel work

- Fix arq worker registration (functions evaluated at import time).
- Fix run_event sequence race under concurrency.
- Add `tenant_id` FK to `Run` for billing aggregation.
- Add CI pipeline to run backend + frontend tests on PR.

