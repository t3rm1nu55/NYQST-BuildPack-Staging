# Orchestration graph design (LangGraph done in a production way)

This doc assumes:

- You are extending the existing ResearchAssistantGraph (DEC-012)
- You will use Send() fan-out (DEC-013)
- You will store plans as RunEvents (DEC-014)
- You will enforce per-node AsyncSession (DEC-051)
- You will support human-in-the-loop via interrupt/resume (Wave 2)

LangGraph references:
- Send from conditional edges: https://docs.langchain.com/oss/python/langgraph/graph-api
- Interrupts + resume with Command: https://docs.langchain.com/oss/python/langgraph/interrupts

---

## 1) What “professional” means here

Professional orchestration is not “more agents”. It is:

- deterministic run history (events)
- explicit state schema
- bounded concurrency (no runaway fan-out)
- cost/time budgets enforced
- graceful degradation on tool failures
- pause/resume semantics that work on refresh
- tracing and eval hooks

---

## 2) State schema: TypedDict is OK, but you need a stable serialization contract

You can keep TypedDict, but enforce:

- every field is JSON-serializable (or convert)
- do not store DB sessions/clients in state
- store references (ids) not objects

Recommendation: define a Pydantic `ResearchStateModel` and convert to/from dict at node boundaries.

Why:
- Pydantic gives validation and schema export
- easier for contract tests and debug dumps
- helps avoid “missing key in state” runtime errors

---

## 3) Threading model (thread_id)

LangGraph checkpointing uses thread_id as the primary key for state persistence. You already have AsyncPostgresSaver.

Professional choice:
- set `thread_id = run_id` for 1:1 run ↔ thread mapping

Benefits:
- no extra identifier mapping layer
- easier debugging: run_id uniquely identifies state
- resume endpoint can load by run_id

If you want multiple resumptions within one conversation, you can still map conversation_id to multiple run_ids.

---

## 4) Graph shape

### 4.1 High-level DAG (conceptual)

```mermaid
flowchart TD
  START --> init[init_run_state]
  init --> planner[planner_node]
  planner -->|conditional edge returns Send[]| workers[research_worker]
  workers --> gather[gather_results]
  gather --> maybe_clarify{need clarification?}
  maybe_clarify -->|yes| clarify[clarification_node (interrupt)]
  maybe_clarify -->|no| synth[synthesis_node]
  synth --> meta[meta_reasoning_node]
  meta --> router[deliverable_router]
  router --> report[report_generator]
  router --> website[website_generator]
  router --> slides[slides_generator]
  report --> END
  website --> END
  slides --> END
  clarify --> END
```

Key: Send() fan-out must happen from a conditional edge (LangGraph constraint).

### 4.2 Node responsibilities (strict separation)

- init_run_state:
  - normalize inputs (deliverable_type, budget)
  - emit RUN_STARTED
- planner_node:
  - create PlanSet (structured output)
  - emit PLAN_CREATED
- research_worker:
  - executes a single PlanTask
  - writes PLAN_TASK_UPDATED
  - uses tools (web, rag, scrape)
  - emits references found + tool events
- gather_results:
  - combine worker results
  - de-duplicate sources
- clarification_node:
  - calls interrupt(payload)
  - emits CLARIFICATION_NEEDED
- synthesis_node:
  - create DataBrief (structured)
  - emit STATE_UPDATE (optional) and SUBAGENT_ACTION (“synthesizing”)
- meta_reasoning_node:
  - gap check + optional extra research
- deliverable_router:
  - decides which generator(s) run based on deliverable_type
- report_generator / website_generator / slides_generator:
  - produce artifacts + emit preview/progress events

---

## 5) Fan-out design (Send) — what to watch

LangGraph notes:
- Send can return different state per worker invocation
- parallel nodes share a state snapshot; they do not see each other’s writes

Therefore:
- do not mutate shared lists in place
- use “append-only merge” semantics:
  - each worker returns `{research_results: [result]}` and the graph merges lists
- do not rely on worker seeing state updates from other workers

Also: bound the number of workers:
- if PlanSet has 50 tasks, you will spawn 50 workers and destroy latency/cost
- implement a planner constraint: max_tasks = 13 (you mention 13+ agents; cap it)

---

## 6) DB session model (DEC-051)

Each node must use its own AsyncSession.

Professional pattern:
- dependency injection function `get_session()` that returns a new session
- wrap in `async with session.begin():` where appropriate
- do not share session across nodes or across worker invocations

Also: event emission should not require passing session around manually. Use a “run event service” created per node invocation.

---

## 7) Budget enforcement (DEC-045)

Budget must be enforced in two places:

1) **Before** expensive actions
- tool calls (search)
- LLM calls (generate)
- background jobs enqueues

2) **After** each action
- update token count / cost estimate
- emit budget update event (optional)

Define:
- hard stop: end graph with RUN_FAILED or RUN_CANCELLED + reason “budget exceeded”
- soft stop: reduce further research tasks and synthesize from partial data

---

## 8) Interrupt / resume (clarification)

LangGraph interrupts:
- you call `interrupt(payload)` inside a node
- LangGraph saves state via checkpointer
- execution pauses until resumed with `Command(resume=...)`

References:
- https://docs.langchain.com/oss/python/langgraph/interrupts

Recommended API contract:

POST `/agent/resume`
Request:
- run_id (or thread_id)
- clarification_response (string or structured)
Response:
- SSE stream (same as /chat), continuing events until completion or another interrupt

Important:
- Resume must be idempotent:
  - if user retries submission, you should not fork the run incorrectly
- UI should attach to the same run_id and keep last_seq_seen

---

## 9) Tooling inside nodes (LangChain vs raw httpx)

Two safe patterns:

Pattern A (LangChain tools)
- define tools with clear schemas
- let model call tools via function calling
- logs tool calls and results automatically

Pattern B (explicit orchestration)
- worker decides which tools to call and in what order
- model only summarizes results

For v1 reliability, Pattern B is often more stable. Reserve model tool-calling for later once you have evals.

---

## 10) Tracing and evaluation hooks (LangSmith)

LangSmith can trace LangChain/LangGraph runs when enabled via environment variables or tracing context.

Key env variables (LangChain support docs):
- LANGCHAIN_API_KEY
- LANGCHAIN_TRACING_V2=true
- LANGSMITH_PROJECT=<project-name>

Reference:
- https://support.langchain.com/articles/3567245886-how-do-i-set-up-langsmith-api-key-environment-variables
- https://docs.langchain.com/langsmith/observability-quickstart

Professional approach:
- tracing on by default in dev
- tracing off by default in CI (unless running live)
- explicit “trace id” stored in Run.tags or RunEvent for cross-link

---

## 11) LangServe as an optional deployment surface

LangServe can wrap runnables/chains into FastAPI endpoints:
- https://github.com/langchain-ai/langserve

You do not need it if you already have FastAPI endpoints.
But you can use it later to:
- expose the graph as a standard “runnable” for other services
- support versioned graph deployments

---

## 12) Hardening checklist

- worker concurrency limit (per run and global)
- per-tool timeouts and retries with backoff
- safe HTML scraping (SSRF guard)
- structured error events (ERROR with code, not only message)
- cancellation propagation
- deterministic event ordering
- replay tool for debugging

