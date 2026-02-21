---
document_id: GRAPH-EDITOR
version: 1
date: 2026-02-19
---

# LangGraph Graph Editor / Viewer / Debugger Research

## Summary

The ecosystem has matured significantly but remains fragmented. The canonical tool — LangGraph Studio (now renamed LangSmith Studio) — provides strong debug/trace capabilities but is **not a graph editor**: you cannot drag nodes to restructure your graph. Visual editing tools exist but are immature and do not support `Send()` fan-out. For our platform, the pragmatic path is: use LangSmith Studio for debugging (free, zero integration work), use Langfuse for self-hosted observability, and write graph definitions in well-structured Python with no visual editor dependency.

---

## 1. LangGraph Studio (now: LangSmith Studio)

### What It Is

LangGraph Studio was the original desktop IDE for debugging LangGraph agents locally. As of **October 2025**, LangChain renamed the product suite:

- **LangGraph Studio** → **LangSmith Studio** (the UI/IDE layer)
- **LangGraph Platform** → **LangSmith Deployment** (the hosting/serving layer)

The core functionality is unchanged; only the branding shifted.

### Deployment Modes

| Mode | How to Access |
|---|---|
| Desktop app (legacy) | macOS-only `.dmg` (Apple Silicon), requires Docker. Now deprecated in favour of the web UI. |
| Web app (current) | `langgraph dev` in your project dir → opens `studio.langchain.com` connected to your local dev server |
| VS Code (none) | Studio is NOT a VS Code extension |

The `langgraph dev` command starts a local Agent Server (FastAPI) and a tunnel/URL pointing to the hosted Studio web UI that connects back to it.

### What Studio Actually Does

**It is a debugger and trace viewer, NOT a graph editor.**

| Capability | Supported |
|---|---|
| Visualise compiled graph (nodes + edges) | Yes — renders the graph as a flowchart after compile |
| Run the graph interactively | Yes — submit inputs, see execution node-by-node |
| Step-through / time-travel debugging | Yes — pause at any node, rewind, re-run from a checkpoint |
| Edit graph structure (drag/drop nodes) | No |
| Edit node prompts/code inline | No — you edit in your IDE; Studio hot-reloads |
| Human-in-the-loop interrupt UI | Yes — surfaces `interrupt()` calls as approval dialogs |
| LangSmith trace integration | Yes — every run is logged to LangSmith automatically |
| Subgraph expansion | Partial — known issue: subgraphs invoked via `node()` do NOT expand inline (GitHub issue #3372) |
| `Send()` fan-out visualisation | Partial — the static graph structure shows the fan-out target node, but the dynamic `Send()` dispatch (runtime-determined parallelism) is not visible until execution; once running, executed nodes are highlighted |
| Export / import graph definition | No — it reads your Python code, does not export a separate graph format |
| Code generation | No |

### Open Source Status

- The **Studio UI** (web app at `studio.langchain.com`) is **NOT open source**
- The **local dev server** (`langgraph dev`, the Python CLI) is **open source** (MIT)
- The old **desktop app** (`langchain-ai/langgraph-studio`) was open source on GitHub but is now superseded by the web UI

### Requirements

- LangSmith account (free tier available)
- `langgraph.json` config file in the project root pointing to your graph entrypoint
- `langgraph dev` CLI from `langgraph` pip package

### Integration with Existing Code

Studio works directly with your existing Python code. You provide a `langgraph.json`:

```json
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./my_agent/graph.py:graph"
  }
}
```

No code changes required — it compiles your `StateGraph` and renders it. `AsyncPostgresSaver` works fine as the checkpointer; Studio uses the checkpoint data for time-travel.

### Pricing

- **Free** for all LangSmith users on the Developer plan (free tier)
- LangSmith Developer: $0/seat, 5k traces/month included, pay-as-you-go thereafter
- No usage cost for Studio UI itself

### Limitations Relevant to Our Platform

1. `Send()` fan-out is runtime-dynamic — the static graph view cannot predict how many workers will be spawned; the running execution view shows them as they appear
2. Subgraphs do not drill-down inline (issue #3372 open as of Feb 2026)
3. Studio is cloud-connected — the UI lives on `studio.langchain.com`; local traffic goes through a tunnel. Not fully air-gapped.
4. No graph editing — changes must be made in Python source

---

## 2. LangSmith Deployment (formerly LangGraph Platform / Cloud)

### Tiers

| Plan | Price | Self-host | What's included |
|---|---|---|---|
| Developer | Free | Basic (100k nodes/month free) | LangSmith Studio, 1 Agent Builder agent (50 runs/mo), 5k traces/mo |
| Plus | $39/seat/month + $0.001/node executed | Cloud-managed only | Unlimited Agent Builder agents, 1 free dev deployment, 10k traces/mo |
| Enterprise | Custom (contact sales) | Cloud / Hybrid / Self-hosted | Custom SSO, RBAC, SLA, hybrid/self-hosted deployment in your VPC |

### Self-Hosting

- **Developer plan**: self-host the LangGraph Server (open-source Python server) yourself — no cost, but no Platform management features
- **Enterprise**: full self-hosted or hybrid (SaaS control plane + your data plane)
- The **LangGraph Server** itself (the serving runtime) is open source — you can run it without any LangChain subscription

### Vendor Lock-in Assessment

**Moderate concern.** The observability/tracing layer (LangSmith traces) creates stickiness. The serving runtime (`langgraph server`) is open source. Studio UI is cloud-hosted. If you self-host LangGraph Server and use Langfuse for observability, you can eliminate most lock-in.

The `langgraph.json` config format and the deployment conventions are LangChain-specific but are simple JSON — not deeply proprietary.

---

## 3. OSS Alternatives

### 3a. LangGraph Builder (`build.langchain.com`)

- **Repo**: `github.com/langchain-ai/langgraph-builder` (open source, MIT)
- **What it does**: Visual canvas for **designing** a graph (drag-and-drop nodes/edges), then **generates boilerplate Python and TypeScript** via `langgraph-gen`
- **Hosted version**: `build.langchain.com`

**Critical limitation**: The README explicitly states: *"Graphs with parallel node execution cannot be generated."* This means **`Send()` fan-out is unsupported**. For our platform — which is built around `Send()` for parallel worker dispatch — LangGraph Builder cannot generate our core graph pattern.

**Use case**: Green-field scaffolding of simple sequential or conditional graphs. Not useful for our multi-agent fan-out architecture.

### 3b. LangGraph-GUI (`github.com/LangGraph-GUI/LangGraph-GUI`)

- **License**: MIT
- **Stack**: SvelteFlow frontend + FastAPI backend
- **Deployment**: Docker Compose or Kubernetes, self-hosted
- **What it does**: Visual node-edge graph editor for designing and running LangGraph workflows with local LLMs (Ollama) or API keys
- **Code generation**: Not documented — appears to be a workflow runner, not a code generator
- **`Send()` support**: Not documented; community project, actively maintained as of Jan 2026
- **Verdict**: Interesting self-hosted option for non-technical users to configure agent topologies, but not designed around Python code generation for complex patterns

### 3c. LangConfig (`github.com/LangConfig/langconfig`)

- **License**: Open source
- **What it does**: Drag-and-drop visual workflow builder for LangChain/LangGraph agents
- **Export**: JSON workflow config or full Python package with Streamlit UI
- **Self-hosted**: Yes (Docker)
- **`Send()` support**: Not documented
- **Verdict**: More consumer-facing; export to Streamlit suggests it wraps LangGraph in a higher-level abstraction. Not suitable for complex lower-level graph definitions.

### 3d. React Flow / xyflow (`reactflow.dev`)

- **License**: MIT (free for OSS; Pro subscription for advanced features)
- **What it is**: A React library for building node-based graph editors and visualisers — NOT a LangGraph-specific tool
- **Relevance**: LangGraph Studio's visual graph is likely built on React Flow or similar. You could build a custom LangGraph graph viewer embedded in the existing React+Vite frontend.
- **Effort**: High — you'd need to write a parser that reads a compiled LangGraph's `get_graph()` output (which returns a `MermaidGraph` / node+edge dict) and maps it to React Flow nodes/edges
- **`Send()` support**: You define the rendering — so yes, you can represent dynamic fan-out if you design the node types for it

**The `get_graph()` API**: LangGraph exposes this natively:

```python
graph = my_graph.compile()
graph.get_graph().draw_mermaid()       # Mermaid diagram string
graph.get_graph().draw_mermaid_png()  # PNG bytes
graph.get_graph(xray=True)            # Includes subgraph internals
```

This is the basis for any custom visualisation — you can serve this data from an API endpoint and render it in the frontend.

### 3e. VS Code Extensions

Two community extensions exist on the VS Code Marketplace:

| Extension | Publisher | What it does |
|---|---|---|
| `LangGraph Visualizers` | smazee | Parses Python files, shows interactive graph with node colour-coding; step-through debugging; jump-to-code; no editing |
| `LangGraph Visualizer` | hridesh-net / Naveenkumarar | Auto-detects LangGraph code in Python files, renders in webview panel; updates on file save |

Both are **read-only visualisers**, not editors. Quality varies; community-maintained with limited adoption. The `smazee` extension supports conditional edges and supervisor/worker patterns but not `Send()` fan-out specifically.

**Activation**: `cmd+shift+L` to open the panel.

### 3f. LangGraph Visualizer PoC (`github.com/Coding-Crashkurse/LangGraph-Visualizer`)

- Proof-of-concept using FastAPI + React + D3.js
- Visualises real-time state transitions during graph execution via callbacks
- Mimics LangGraph Studio's approach but in a self-contained, embeddable form
- Useful as a reference architecture for building our own viewer

### 3g. Langfuse (Self-Hosted Observability)

- **License**: MIT, 19k+ GitHub stars
- **What it does**: Full LLM observability — traces, evals, prompt management, metrics
- **LangGraph integration**: Via LangChain callback handler; captures every node execution as a trace span
- **Self-host**: Docker Compose or Kubernetes (Helm chart) — fully self-hostable, same codebase as cloud
- **Relevance**: A drop-in replacement for LangSmith's tracing layer, eliminating cloud dependency for observability
- **`Send()` fan-out tracing**: Each parallel `Send()` task appears as a separate span in the trace tree

---

## 4. Graph-as-Code Best Practices

### Module Structure

For complex graphs (our case: planner → fan-out workers → fan-in → synthesis → routers), the community-established pattern is:

```
agents/
  graph.py          # top-level StateGraph assembly, compile(), export
  state.py          # TypedDict state definitions + reducers
  nodes/
    planner.py      # planner node function
    worker.py       # worker node function (used in Send())
    fanin.py        # fan-in / aggregation node
    synthesis.py    # synthesis node
    router.py       # deliverable router node
  edges/
    conditions.py   # conditional edge functions
  subgraphs/
    report.py       # report subgraph (compiled separately)
langgraph.json      # Studio/dev server config
```

Key rules:
- **State definition is the contract** — type it fully with `TypedDict`, annotate reducers explicitly (`Annotated[list, operator.add]`)
- **Conditional edges = pure functions** — no side effects, easy to test in isolation
- **`Send()` workers** — each worker is a separate compiled graph or node function; the fan-out pattern looks like:

```python
def dispatch_workers(state: OrchestratorState) -> list[Send]:
    return [
        Send("worker", WorkerState(task=task, ...))
        for task in state["plan"]
    ]

graph.add_conditional_edges("planner", dispatch_workers)
```

### Version Control Strategy

- **Graph structure** changes (add/remove nodes, change edge logic) are Python diffs — fully reviewable in git
- **State schema** changes require migration care — `AsyncPostgresSaver` checkpoint blobs contain serialised state; breaking schema changes require checkpoint invalidation or migration
- **Prompt changes** — externalise into config/env or a prompt registry; do not hardcode in node functions
- `langgraph.json` is committed to version control (it is the deployment manifest)
- **No separate graph serialisation format** — the Python code IS the graph definition

### Testing Pattern

```python
# Test graph structure (no LLM calls)
def test_graph_structure():
    graph = compile_graph()
    schema = graph.get_graph()
    assert "planner" in [n.id for n in schema.nodes]
    assert "worker" in [n.id for n in schema.nodes]

# Test individual nodes in isolation
async def test_planner_node():
    state = OrchestratorState(query="...", plan=[])
    result = await planner_node(state)
    assert result["plan"] is not None
```

### Code Generation Tools

None of the existing tools can generate `Send()` fan-out patterns. LangGraph Builder explicitly blocks parallel execution code generation. Our graph must be hand-authored.

---

## 5. MCP Integration

### Current State

There is **no existing MCP server for LangGraph graph management** (graph editing, node introspection, or runtime control). The MCP integrations that exist are about using MCP tool servers *within* LangGraph agents (via `langchain-mcp-adapters`), not about managing the graph itself.

### Feasibility of a Graph Editor MCP Tool

Technically possible. A custom MCP server could expose tools such as:

```
graph_introspect(graph_name: str) -> node/edge schema
graph_get_state(thread_id: str) -> checkpoint state
graph_resume(thread_id: str, input: dict) -> continue interrupted run
graph_list_runs() -> active/recent run list
```

This would let Claude (or any MCP client) inspect and resume graph executions programmatically — useful for our internal tooling. Implementation would wrap the LangGraph Server API (which is a standard REST/SSE API).

The `langgraph dev` server already exposes these as REST endpoints — an MCP adapter wrapping those endpoints would be a small shim (~200 LOC).

---

## 6. Recommendation

### For Our Platform

Given: Python/FastAPI + LangGraph + existing React+Vite frontend + `Send()` fan-out as core pattern + self-hostable preference + OSS preference:

| Need | Recommendation | Rationale |
|---|---|---|
| **Day-to-day debugging** | LangSmith Studio (web, free tier) | Zero integration work — `langgraph dev` + `langgraph.json`. Free. Sufficient for node-by-node trace inspection even if `Send()` fan-out isn't pre-visualised. |
| **Self-hosted observability / tracing** | Langfuse (MIT, Docker Compose) | Replaces LangSmith traces; captures every node execution as a span including `Send()` parallel tasks. Eliminates cloud dependency. |
| **Graph structure viewer in our UI** | `graph.get_graph().draw_mermaid()` → Mermaid.js in React | LangGraph's built-in API returns a Mermaid string. Mermaid.js renders it. Cost: ~1 day. Self-contained, no external service. |
| **Visual editing** | None — not needed yet | No OSS tool supports `Send()` fan-out editing. The graph complexity requires Python authoring. Revisit when the graph stabilises. |
| **Code generation** | Not applicable | LangGraph Builder cannot generate parallel patterns. Hand-author the graph. |
| **VS Code extension** | Optional — `smazee.langgraph-visualizer` | Useful during development for quick structural validation. Low risk, free, no setup. |
| **MCP adapter for graph ops** | Build when needed | Wrap LangGraph Server's REST API as an MCP tool. Small effort, high value for Claude-assisted workflow management. |

### What NOT to Do

- Do not build a drag-and-drop graph editor from scratch — React Flow + parser + LangGraph bridge is weeks of work for commodity value
- Do not depend on LangGraph Builder for our graph — it cannot handle `Send()` patterns
- Do not require LangSmith Plus for Studio — the free tier is sufficient for debugging
- Do not use LangConfig or LangGraph-GUI — they are higher-level wrappers that would fight our low-level `StateGraph` patterns

### Implementation Order

1. **Now**: Add `langgraph.json` to the platform repo; run `langgraph dev` for Studio access. Commit the config.
2. **Sprint 1**: Wire Langfuse as the trace backend (replaces LangSmith for tracing, or runs alongside it).
3. **Sprint 2**: Add a `/graph/{name}/diagram` API endpoint that calls `get_graph().draw_mermaid()` and serve a Mermaid render in the React frontend (the existing `RunTimeline` sidebar is a natural home for this).
4. **Later**: Build the MCP adapter if Claude-assisted graph management becomes a workflow need.

---

## Sources

- [LangSmith Studio Docs](https://docs.langchain.com/langsmith/studio)
- [LangGraph Studio Blog Announcement](https://blog.langchain.com/langgraph-studio-the-first-agent-ide/)
- [LangGraph Platform GA Announcement](https://blog.langchain.com/langgraph-platform-ga/)
- [LangSmith Pricing Page](https://www.langchain.com/pricing-langgraph-platform)
- [LangGraph Pricing Guide — ZenML Blog](https://www.zenml.io/blog/langgraph-pricing)
- [Product Naming Changes Changelog](https://changelog.langchain.com/announcements/product-naming-changes-langsmith-deployment-and-langsmith-studio)
- [LangGraph Builder — GitHub](https://github.com/langchain-ai/langgraph-builder)
- [LangGraph Builder — Hosted](https://build.langchain.com)
- [LangGraph-GUI — GitHub](https://github.com/LangGraph-GUI/LangGraph-GUI)
- [LangConfig — GitHub](https://github.com/LangConfig/langconfig)
- [LangGraph Visualizers — VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=smazee.langgraph-visualizer)
- [LangGraph Visualizer (hridesh-net) — GitHub](https://github.com/hridesh-net/LangGraph_Extension)
- [LangGraph Visualizer PoC — GitHub](https://github.com/Coding-Crashkurse/LangGraph-Visualizer)
- [React Flow / xyflow](https://reactflow.dev)
- [Langfuse — Open Source LLM Observability](https://langfuse.com)
- [Langfuse LangGraph Integration Guide](https://langfuse.com/guides/cookbook/integration_langgraph)
- [Fan-out with subgraphs issue #3372](https://github.com/langchain-ai/langgraph/issues/3372)
- [LangGraph Best Practices — Swarnendu De](https://www.swarnendu.de/blog/langgraph-best-practices/)
- [DataCamp LangGraph Studio Guide](https://www.datacamp.com/tutorial/langgraph-studio)
- [mem0.ai LangGraph Studio Guide](https://mem0.ai/blog/visual-ai-agent-debugging-langgraph-studio)
- [LangGraph MCP Integration Guide — Latenode](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/langgraph-mcp-integration-complete-model-context-protocol-setup-guide-working-examples-2025)
