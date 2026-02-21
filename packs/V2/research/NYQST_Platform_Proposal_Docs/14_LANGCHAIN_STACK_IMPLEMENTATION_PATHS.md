# Implementation paths (LangGraph + LangChain + LangSmith + LangServe)

This doc explains how to use the LangChain ecosystem *professionally* (i.e., without turning your codebase into a pile of callbacks and magic).

Primary references:
- LangGraph graph API and Send: https://docs.langchain.com/oss/python/langgraph/graph-api
- LangGraph interrupts: https://docs.langchain.com/oss/python/langgraph/interrupts
- LCEL background: https://blog.langchain.com/langchain-expression-language/
- LangSmith tracing: https://docs.langchain.com/langsmith/observability-quickstart
- LangServe: https://github.com/langchain-ai/langserve

---

## 1) Recommended approach for NYQST

Use:

- LangGraph for orchestration (multi-node, fan-out, interrupts, persistence)
- LangChain “runnables” inside each node for:
  - prompt templates
  - structured output parsing
  - retrievers (RAG)
  - streaming text generation where needed

Keep your existing FastAPI boundary and SSE.

---

## 2) LCEL: where it fits (and where it doesn’t)

LCEL gives composable chains with streaming/batching/async “for free”.

Use LCEL inside nodes when:
- the node is a pipeline:
  - prompt -> llm -> parser
  - retriever -> prompt -> llm -> parser

Avoid LCEL for:
- graph routing decisions (that’s LangGraph)
- stateful fan-out (Send)
- pause/resume

The clean separation:
- LangGraph = orchestration and state
- LCEL = pipeline composition within nodes

---

## 3) Tracing: make it useful, not noisy

LangSmith tracing:
- enable in dev by default
- tag with run_id and tenant_id
- avoid tracing huge raw artifacts (store references)

Env var setup example:
- LANGCHAIN_API_KEY=...
- LANGCHAIN_TRACING_V2=true
- LANGSMITH_PROJECT=nyqst-dev

Reference for env vars:
- https://support.langchain.com/articles/3567245886-how-do-i-set-up-langsmith-api-key-environment-variables

---

## 4) Deployment surfaces

### 4.1 Keep your FastAPI service as the “product API”

This is correct for a platform.

### 4.2 LangServe as optional “runnable API”

LangServe can expose chains/runnables as REST endpoints, integrated with FastAPI.

When to use:
- you want a standard way to deploy and version “runnables”
- you want a client SDK

When not to use:
- you already have a stable FastAPI surface and don’t need another abstraction

---

## 5) Professional conventions (avoid chaos)

- every node has:
  - `prompt.py` (template)
  - `schema.py` (Pydantic outputs)
  - `node.py` (implementation)
  - `tests/` (unit)
- prompts are versioned and tested (golden outputs)
- tool calls are wrapped with events and timeouts

---

## 6) Suggested code layout for nodes

Example:

```
src/intelli/agents/nodes/planner/
  __init__.py
  prompt.py
  schema.py
  node.py
  tests/test_planner.py
```

This keeps changes localized and reviewable.

---

## 7) Streaming strategy

Within LangChain, streaming can produce deltas.
Within LangGraph, you can stream “events” and/or manage your own SSE.

Recommendation for your stack:
- stream “product events” (RunEvents) explicitly
- do not depend on internal LangChain streaming callbacks for your UI
- treat streaming output as a RunEvent (MESSAGE_DELTA or REPORT_PREVIEW_DELTA)

This keeps the UI stable.

---

## 8) Observability beyond LangSmith

Even with LangSmith, keep:
- structured logging (run_id, node, event_type)
- explicit event log (run_events)
- replay tool

LangSmith helps debug LLM logic. Your event log helps debug system behavior.

