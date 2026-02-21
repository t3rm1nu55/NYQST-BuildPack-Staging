# Mapping 01: Research Orchestrator (Superagent → Intelli)

> **Date**: 2026-02-16
> **Status**: Definitive mapping — grounded in `nyqst-intelli-230126` codebase
> **Depends on**: `docs/planning/INTELLI_BUILD_STATUS_2026-02-16.md`, `docs/planning/SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md`

---

## What Superagent Does (Observed)

Superagent's orchestration follows a 4-phase pipeline:

1. **Decompose**: User prompt → LLM structured output → `PlanSet` containing `Plans` (linked-list ordered), each containing `PlanTasks` (also linked-list ordered)
2. **Dispatch**: Fan-out subagents in parallel (12 concurrent in observed session), each using web search/scrape tools
3. **Synthesize**: Combine all subagent results into structured report content
4. **Generate**: Produce deliverable (report/website/slides/document) with citations

Key data structures (from Zod schemas in cached JS):
- `PlanSet { plans: Record<string, Plan>, chat_id, workspace_id }`
- `Plan { plan_tasks: Record<string, PlanTask>, previous_plan_id, status, used_sources[] }`
- `PlanTask { title, message, previous_task_id, status: LOADING|ERROR|SUCCESS }`

Streaming events observed: `plan.created`, `task.started`, `task.progress`, `task.completed`, `content.delta`, `entity.created`, `clarification.needed`, `run.completed`

---

## What Intelli Already Has

### Run + RunEvent Ledger (WORKING)
- `Run` model with lifecycle states
- `RunEvent` append-only ledger with typed events
- SSE stream: `GET /api/v1/streams/runs/{run_id}` (Postgres LISTEN/NOTIFY)
- RunEvent types already include: `STATE_UPDATE`, `TOOL_CALL_*`, `STEP_*`

### LangGraph Agent Runtime (WORKING)
- Research assistant graph: `src/intelli/agents/graphs/research_assistant.py`
- Tool-use loop with ToolNode pattern
- Existing tools: `search_documents`, `list_notebooks`, `get_document_info`, `compare_manifests`
- Streaming via Vercel AI SDK Data Stream Protocol
- Adapter: `src/intelli/agents/adapters/__init__.py`

### What's Missing for Superagent Parity
- **No planner agent** — current graph is a single agent loop, not planner→executors→synthesizer
- **No parallel subagent dispatch** — no fan-out/fan-in pattern
- **No web research tools** — only document-grounded tools exist
- **No plan/node identifiers in run events** — events exist but aren't structured as a plan DAG

---

## Definitive Mapping

### Extension 1: Research Orchestrator Graph

**Where**: New file `src/intelli/agents/graphs/research_orchestrator.py`

**Pattern**: LangGraph StateGraph with parallel branches

```
[START] → planner_node → fan_out_research → [parallel_research_nodes] → fan_in_results → synthesizer_node → deliverable_node → [END]
```

**Planner node**: Takes user prompt + deliverable type. Calls LLM with structured output (Pydantic model matching Superagent's PlanSet structure). Creates Run + RunEvents for plan creation.

**Fan-out**: LangGraph's `Send()` API dispatches N parallel research subgraph invocations. Each subgraph is a mini agent loop with web search + scrape tools.

**Fan-in**: Collects all subagraph results. Stores each as an Artifact in the substrate.

**Synthesizer**: Combines results into structured content. Output format depends on deliverable type.

**Deliverable node**: Routes to type-specific generator (report markup, website code, slide deck, document).

### Extension 2: Run Event Schema Extensions

**Where**: Extend existing `RunEventType` enum in run model

New event types to add (mapping from Superagent's streaming events):

| Superagent Event | Intelli RunEvent | Payload |
|---|---|---|
| `plan.created` | `RunEventType.PLAN_CREATED` | `{ plan_set: PlanSet, reasoning: str }` |
| `task.started` | `RunEventType.SUBAGENT_STARTED` | `{ task_id, title, tool_name }` |
| `task.progress` | `RunEventType.SUBAGENT_PROGRESS` | `{ task_id, progress_pct, current_action }` |
| `task.completed` | `RunEventType.SUBAGENT_COMPLETED` | `{ task_id, result_summary, sources_used[] }` |
| `content.delta` | `RunEventType.CONTENT_DELTA` | `{ chunk: str }` |
| `entity.created` | `RunEventType.ARTIFACT_CREATED` | `{ artifact_id, artifact_type }` |
| `clarification.needed` | `RunEventType.CLARIFICATION_NEEDED` | `{ question: str }` |
| `run.completed` | Existing `RunEventType.COMPLETED` | `{ artifact_ids[] }` |

These events flow through existing Postgres LISTEN/NOTIFY → SSE stream. No new transport needed.

### Extension 3: Web Research MCP Tools

**Where**: New MCP tool server or internal tools registered in the agent graph

| Tool Name | Maps To (Superagent) | Implementation |
|---|---|---|
| `research.web.search` | Brave Search | Brave Search API wrapper, returns structured results with URL, title, snippet, relevance score |
| `research.web.scrape` | Firecrawl | Jina Reader API (or Firecrawl), returns cleaned markdown content |
| `research.web.domain_search` | N/A (enhanced) | Search restricted to domain allowlists per policy profile |

Each tool call:
1. Executes the search/scrape
2. Stores result as Artifact (content-addressed in substrate)
3. Emits RunEvent with source metadata
4. Returns structured result to the LangGraph node

### Extension 4: Plan Data Model

**Option A (Recommended)**: Store plans as RunEvents with structured payloads. No new tables needed — the run ledger IS the plan history.

**Option B**: Dedicated `plans` and `plan_tasks` tables (Superagent's approach). More queryable but duplicates information already in the run ledger.

Recommendation: **Option A** for v1. The run ledger already has append-only semantics and SSE streaming. Plans are just a specific event type. If query patterns require it later, materialize a view.

---

## Testing Strategy

| Test Type | What | How |
|---|---|---|
| **Contract** | Plan structured output schema | Pydantic model validation — LLM output must parse as valid PlanSet |
| **Integration** | Full orchestrator flow | Real LLM call: submit CRE prompt → assert ≥3 parallel tasks created → assert synthesis artifact created |
| **Integration** | Web search tool | Real Brave API call → assert results stored as Artifacts → assert RunEvents emitted |
| **E2E** | Chat → plan → report | Playwright: submit prompt in ChatPanel → assert PlanViewer shows tasks → assert report renders |

---

## Implementation Sequence

This maps to **Phase 1** and **Phase 3** in `SUPERAGENT_PARITY_CLEAN_ROOM_PLAN_2026-02-16.md`:

1. Define RunEvent schema extensions (1-2 days)
2. Implement planner node with structured output (2-3 days)
3. Implement fan-out/fan-in pattern in LangGraph (2-3 days)
4. Add Brave Search + Jina scrape tools (2-3 days)
5. Wire to existing SSE stream + RunTimeline UI (2-3 days)
6. Add PlanViewer component to frontend (3-5 days)

**Total**: ~3 weeks, aligning with Phase 1 estimate in the parity plan.
