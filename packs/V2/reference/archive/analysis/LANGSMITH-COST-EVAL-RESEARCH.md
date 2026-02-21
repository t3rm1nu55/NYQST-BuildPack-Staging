---
document_id: LANGSMITH-RESEARCH
version: 1
date: 2026-02-19
---

# LangSmith Cost & Evaluation Research

## Executive Summary

LangSmith provides the deepest out-of-box integration for LangGraph cost/token tracking but is proprietary SaaS (self-host requires Enterprise). Langfuse is the open-source alternative with first-class LangGraph support, MIT-licensed, and free to self-host. For our platform, **Langfuse self-hosted is the recommended path** — it covers all five requirements (per-run cost, per-node tokens, eval scoring, budget enforcement, billing export), avoids vendor lock-in, and costs nothing for infrastructure. LangSmith is the better choice only if the team wants managed SaaS and is willing to pay $39+/seat/month with trace-volume billing.

Budget enforcement is NOT provided by either tool — both are observability layers. Budget must be implemented in LangGraph state directly.

---

## 1. LangSmith Overview

### What It Provides

LangSmith is a proprietary LLM observability, debugging, and evaluation platform by LangChain. Core capabilities:

- **Tracing**: Full execution tree of every LangGraph run, including per-node spans with latency, inputs/outputs, and token counts.
- **Cost tracking**: Automatic cost calculation for all major model providers. Tracks input tokens, output tokens, cached tokens, reasoning tokens, and multi-modal costs. Costs aggregate up the trace tree so a root run shows total cost and each child node shows its portion.
- **Evaluation**: Offline (dataset-based) and online (production trace) evaluators. Supports LLM-as-judge, heuristic, human annotation queues, and pairwise comparisons.
- **Prompt management**: Versioned prompts, playground, A/B experiments.
- **Monitoring dashboards**: Token usage, latency (P50/P99), error rates, cost breakdowns, feedback scores.

### Pricing (as of February 2026)

| Tier | Cost | Traces | Seats | Notes |
|------|------|--------|-------|-------|
| Developer | Free | 5k/month | 1 | Sufficient for dev/testing only |
| Plus | $39/seat/month + usage | More | Multiple | Usage billed per trace |
| Enterprise | Custom (contact sales) | Unlimited | Unlimited | Self-host option included |

LangSmith bills on **root trace volume** (not node count). Each top-level graph invocation = 1 trace. 5k free traces/month runs out quickly in production.

### Self-Hosting

Self-host is an **Enterprise-only add-on**. It is not open source. Options:

- **Managed cloud**: Standard SaaS at smith.langchain.com
- **BYOC (Bring Your Own Cloud)**: LangChain manages infra in your AWS/GCP/Azure account
- **Self-hosted**: Runs on your Kubernetes cluster; data never leaves your environment

To trial self-hosted, you must request a license key from LangChain sales. This is a hard blocker for budget-conscious projects.

---

## 2. LangGraph Integration — How Tracing Works

### Automatic via Environment Variables

The simplest integration — set two env vars and tracing is on for all LangGraph runs:

```python
import os
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = "ls_..."
# Optional: project name for grouping
os.environ["LANGSMITH_PROJECT"] = "my-research-agent"
```

LangGraph's built-in LangChain callback system picks this up automatically. No code changes needed to existing graph nodes.

### Per-Run Project Routing (Multi-Tenant Pattern)

To route different users' runs to different projects (important for billing isolation):

```python
from langsmith import LangChainTracer, Client

def invoke_for_user(graph, user_id: str, inputs: dict):
    client = Client()
    tracer = LangChainTracer(
        client=client,
        project_name=f"user-{user_id}-traces"
    )
    return graph.invoke(inputs, config={"callbacks": [tracer]})
```

### What Gets Captured Automatically

When `LANGSMITH_TRACING=true` and the LLM is a LangChain-wrapped model (e.g., `ChatOpenAI`):

- Every graph node becomes a child span
- Every LLM call within a node is a grandchild span
- Token counts are extracted from the OpenAI response and recorded
- Cost is calculated from LangSmith's internal pricing table
- Parent spans aggregate child costs upward

This means **per-node costs are visible in the trace tree** without any manual instrumentation, as long as you use LangChain model wrappers.

### LiteLLM Integration

LiteLLM supports LangSmith as a callback natively:

```python
import litellm
litellm.success_callback = ["langsmith"]

# Environment variables for LangSmith
os.environ["LANGSMITH_API_KEY"] = "ls_..."
os.environ["LANGCHAIN_PROJECT"] = "my-project"
```

LiteLLM passes token usage and model metadata to LangSmith's callback handler. However, cost accuracy depends on LangSmith having pricing data for the specific model — for non-standard or custom-routed models, costs may be missing or wrong, requiring manual `usage_metadata` injection (see Section 3).

For Langfuse + LiteLLM, integration is equally clean:

```python
import litellm
litellm.success_callback = ["langfuse"]
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-..."
```

Langfuse captures the `cost` field that LiteLLM already computes internally, which is often more accurate than LangSmith's lookup table for edge-case models.

---

## 3. Per-Node Cost Tracking

### Does It Work Out of the Box?

**Yes**, for LangChain model wrappers. The LangSmith trace tree mirrors the LangGraph execution tree:

```
run: research_graph [root] — $0.04 total
  ├── node: planner — $0.012
  │     └── llm: gpt-4o — $0.012
  ├── node: worker_1 [Send] — $0.008
  │     └── llm: gpt-4o-mini — $0.008
  ├── node: worker_2 [Send] — $0.009
  │     └── llm: gpt-4o-mini — $0.009
  └── node: synthesizer — $0.011
        └── llm: gpt-4o — $0.011
```

Send()-based parallel workers each produce their own child span. LangSmith aggregates correctly.

### For Non-LangChain LLMs (Custom / LiteLLM Direct)

If calling LLMs outside of LangChain wrappers, inject `usage_metadata` manually:

```python
from langsmith import traceable, get_current_run_tree

@traceable(run_type="llm", metadata={"ls_provider": "openai", "ls_model_name": "gpt-4o-mini"})
def call_llm_node(messages: list) -> dict:
    # Your custom LLM call here
    response = your_llm_client.chat(messages)

    # Attach token counts so LangSmith can calculate cost
    run = get_current_run_tree()
    run.set(usage_metadata={
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
        "total_tokens": response.usage.total_tokens,
    })
    return response.content
```

Alternatively, return `usage_metadata` in the output dict:

```python
@traceable(run_type="llm", metadata={"ls_provider": "openai", "ls_model_name": "gpt-4o-mini"})
def call_llm_node(messages: list) -> dict:
    response = your_llm_client.chat(messages)
    return {
        "content": response.content,
        "usage_metadata": {
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        }
    }
```

### Extracting Cost Programmatically from LangSmith API

After a run completes, retrieve cost/token data via the SDK:

```python
from langsmith import Client

client = Client()

# Get a specific run by ID (run_id passed via metadata or returned from graph invoke)
run = client.read_run(run_id="<run-uuid>")
print(f"Total tokens: {run.total_tokens}")
print(f"Prompt tokens: {run.prompt_tokens}")
print(f"Completion tokens: {run.completion_tokens}")
# run.total_cost is available if LangSmith calculated it

# List all runs for a project with cost filters
expensive_runs = client.list_runs(
    project_name="my-research-agent",
    filter='and(eq(run_type, "chain"), gt(total_tokens, 5000))',
    is_root=True,  # only top-level runs
)

for run in expensive_runs:
    print(f"Run {run.id}: {run.total_tokens} tokens")
```

To tag a run with a user ID for billing retrieval:

```python
# When invoking the graph
result = graph.invoke(
    inputs,
    config={
        "metadata": {"user_id": user_id, "run_type": "research"},
        "tags": [f"user:{user_id}"]
    }
)
```

Then query by metadata:

```python
user_runs = client.list_runs(
    project_name="my-project",
    filter=f'eq(metadata_key, "user_id", "{user_id}")',
    start_time=billing_period_start,
    end_time=billing_period_end,
)
```

---

## 4. Budget Enforcement

**Neither LangSmith nor Langfuse provide real-time budget enforcement.** They are observability layers — they record what happened, they don't intercept execution.

Budget enforcement must be implemented in LangGraph state. There are two patterns:

### Pattern A: Token Counter in State (Recommended)

Add a token accumulator to the graph state. Each node updates it after LLM calls. A guard node checks before expensive operations.

```python
from typing import Annotated, TypedDict
import operator
from langchain_openai import ChatOpenAI

class ResearchState(TypedDict):
    task: str
    results: Annotated[list, operator.add]
    # Token/cost tracking
    tokens_used: int
    estimated_cost_usd: float
    budget_exceeded: bool

# Pricing constants (update as needed)
GPT4O_INPUT_COST = 0.0025 / 1000   # per token
GPT4O_OUTPUT_COST = 0.010 / 1000

def worker_node(state: ResearchState) -> dict:
    """Worker that tracks its own token usage."""
    if state.get("budget_exceeded"):
        return {"results": [{"skipped": True, "reason": "budget_exceeded"}]}

    llm = ChatOpenAI(model="gpt-4o")
    response = llm.invoke([{"role": "user", "content": state["task"]}])

    # Extract usage from LangChain response
    usage = response.usage_metadata  # AIMessage has this
    new_tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    input_cost = usage.get("input_tokens", 0) * GPT4O_INPUT_COST
    output_cost = usage.get("output_tokens", 0) * GPT4O_OUTPUT_COST
    new_cost = input_cost + output_cost

    total_tokens = state["tokens_used"] + new_tokens
    total_cost = state["estimated_cost_usd"] + new_cost

    # Budget check: $5 per run
    BUDGET_USD = 5.00

    return {
        "results": [response.content],
        "tokens_used": total_tokens,
        "estimated_cost_usd": total_cost,
        "budget_exceeded": total_cost >= BUDGET_USD,
    }

def budget_guard(state: ResearchState) -> str:
    """Conditional edge: route to END if over budget."""
    if state.get("budget_exceeded"):
        return "budget_abort"
    return "continue"
```

### Pattern B: LangGraph ModelCallLimitMiddleware

LangGraph 1.0 (released October 2025) ships `ModelCallLimitMiddleware` for bounding agent LLM call count:

```python
from langgraph.middleware import ModelCallLimitMiddleware

# Limit to 20 LLM calls per run; behavior on limit: graceful end or error
graph = graph.compile(
    checkpointer=checkpointer,
    # Note: middleware API may vary — check langgraph >= 1.0 docs
)
```

This is a call-count bound, not a dollar-cost bound. Useful as a safety rail but not a billing control.

### Pattern C: Pre-Node Cost Check via Interrupt

For human-in-the-loop budget approval:

```python
from langgraph.types import interrupt

def expensive_node(state: ResearchState):
    projected_cost = estimate_cost(state)
    if projected_cost > BUDGET_USD:
        # Pause graph, surface to user for approval
        approved = interrupt({"reason": "budget_approval_needed", "projected_cost": projected_cost})
        if not approved:
            return {"budget_exceeded": True}
    # proceed...
```

### Streaming Cost Updates to Frontend

During SSE streaming, emit cost updates as custom events:

```python
from langgraph.graph import StateGraph

async def stream_with_cost_updates(graph, inputs, user_id):
    async for event in graph.astream_events(inputs, version="v2"):
        if event["event"] == "on_chain_end":
            # A node completed — extract cost delta from metadata
            state = event.get("data", {}).get("output", {})
            yield {
                "type": "cost_update",
                "tokens_used": state.get("tokens_used"),
                "estimated_cost_usd": state.get("estimated_cost_usd"),
            }
```

Wire into the existing `streams.py` PG LISTEN/NOTIFY pattern as a custom event type.

---

## 5. Evaluation Framework

### LangSmith Evaluation

LangSmith provides a full offline and online evaluation system.

**Offline Eval (dataset-based)**:

```python
from langsmith import evaluate, Client
from langsmith.evaluation import LangChainStringEvaluator

client = Client()

# 1. Create a dataset of test cases
dataset = client.create_dataset("research-quality-benchmark")
client.create_examples(
    dataset_id=dataset.id,
    examples=[
        {
            "inputs": {"topic": "climate change mitigation"},
            "outputs": {"expected_sections": ["causes", "solutions", "policy"]}
        }
    ]
)

# 2. Define evaluators
def has_required_sections(inputs: dict, outputs: dict, reference_outputs: dict) -> dict:
    """Check that research output covers required sections."""
    content = outputs.get("report", "").lower()
    required = reference_outputs.get("expected_sections", [])
    covered = [s for s in required if s in content]
    return {
        "key": "section_coverage",
        "score": len(covered) / len(required) if required else 0,
        "comment": f"Covered: {covered}"
    }

# 3. LLM-as-judge evaluator
from openai import OpenAI
from pydantic import BaseModel
from langsmith import wrappers

oai = wrappers.wrap_openai(OpenAI())

def quality_judge(inputs: dict, outputs: dict) -> dict:
    class Score(BaseModel):
        score: int  # 1-5
        reasoning: str

    response = oai.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Rate the research quality 1-5. Be critical."},
            {"role": "user", "content": f"Topic: {inputs['topic']}\n\nReport:\n{outputs['report']}"}
        ],
        response_format=Score
    )
    result = response.choices[0].message.parsed
    return {"key": "quality_score", "score": result.score / 5, "comment": result.reasoning}

# 4. Run evaluation
results = evaluate(
    lambda inputs: your_research_graph.invoke(inputs),
    data=dataset.id,
    evaluators=[has_required_sections, quality_judge],
    experiment_prefix="v1-baseline",
    max_concurrency=4,
)
```

**Online Eval (automatic on production traces)**:

LangSmith supports "online evaluators" that run automatically against production traces as they arrive. Configure in the UI: select a project, define a sampled evaluator (e.g., run on 10% of traces), and LangSmith runs the judge LLM automatically. Results appear in the monitoring dashboard.

Multi-turn evals (launched 2025) measure whether an agent accomplished its goal across a full conversation, not just a single turn — relevant for multi-step research workflows.

**`openevals` and `agentevals` libraries**:

LangChain maintains two companion eval libraries:

```python
# openevals: general LLM output evaluators
from openevals.evaluators import ConcisenessEvaluator, CorrectnessEvaluator

# agentevals: agent trajectory evaluators (tool call sequences, decision paths)
# pip install agentevals
from agentevals import TrajectoryEvaluator
```

`agentevals` is specifically designed for evaluating multi-step agent runs — the tool call sequence, intermediate decisions, and whether the agent took a reasonable path to the answer. This is directly applicable to our research orchestrator.

### Automatic Post-Run Eval Pattern for Our Platform

```python
from langsmith import Client, traceable
import asyncio

client = Client()

async def run_and_evaluate(graph, inputs: dict, user_id: str) -> dict:
    """Run research graph, then auto-evaluate and return result + scores."""

    # Run the graph with a tagged trace
    with client.trace(
        name="research_run",
        project_name="research-prod",
        metadata={"user_id": user_id}
    ) as run:
        result = await graph.ainvoke(inputs)
        run_id = run.id

    # Post-run evaluation (async, non-blocking for user)
    asyncio.create_task(evaluate_run(run_id, inputs, result))

    return result

async def evaluate_run(run_id: str, inputs: dict, outputs: dict):
    """Background task: score this run and attach feedback."""
    score = quality_judge(inputs, outputs)
    client.create_feedback(
        run_id=run_id,
        key="quality_score",
        score=score["score"],
        comment=score["comment"],
    )
```

---

## 6. Alternatives

### Langfuse

**Verdict: Best alternative to LangSmith for self-hosted deployments.**

| Aspect | Langfuse | LangSmith |
|--------|----------|-----------|
| License | MIT (open source) | Proprietary |
| Self-host | Free, Docker/K8s, first-class | Enterprise license required |
| LangGraph support | Yes — uses LangChain callback | Yes — native integration |
| Token/cost tracking | Automatic via LiteLLM callback; manual for others | Automatic for LangChain wrappers |
| Pricing model | Units (data depth) | Traces (volume) |
| Eval framework | Yes — datasets, LLM judge, human annotation | Yes — more mature, more features |
| OpenTelemetry | Yes | No |
| UI quality | Good | Excellent (more mature) |

**LangGraph + Langfuse integration**:

```python
from langfuse.callback import CallbackHandler

langfuse_handler = CallbackHandler(
    public_key="pk-...",
    secret_key="sk-...",
    host="https://your-langfuse-instance.com",  # self-hosted URL
)

# Pass to LangGraph invoke
result = graph.invoke(
    inputs,
    config={"callbacks": [langfuse_handler]}
)
```

Token/cost tracking with LangFuse is automatic when using LiteLLM (LiteLLM computes cost and passes it through). For custom models, add pricing to Langfuse's model registry via UI or API.

Langfuse exposes a REST API and Python SDK for programmatic cost retrieval, suitable for billing pipelines.

### Phoenix / Arize

**Verdict: Good for OpenTelemetry-native architectures; weaker eval and billing pipeline support.**

- Open source (Apache 2.0), 7,800+ GitHub stars
- OpenTelemetry native — no vendor lock-in at the instrumentation level
- LangGraph support via LangChain instrumentor
- Cost tracking: present but not the primary strength
- Evaluation: supports LLM-as-judge via `phoenix.evals`, but ecosystem is smaller than LangSmith
- Best suited for teams already using OTel and wanting to avoid LangChain ecosystem dependency entirely

```python
import phoenix as px
from openinference.instrumentation.langchain import LangChainInstrumentor

px.launch_app()  # or point to self-hosted Phoenix
LangChainInstrumentor().instrument()

# All LangGraph runs are now traced via OTel
result = graph.invoke(inputs)
```

### Braintrust

- Proprietary SaaS focused on eval and prompt management
- Strong eval tooling, especially for regression testing
- No native LangGraph integration; requires manual trace submission
- Not recommended for our use case (cost tracking, per-run billing)

---

## 7. Recommended Approach

### Decision: Langfuse Self-Hosted

For the platform described (Python/FastAPI + LangGraph + LiteLLM, internal tool, billing requirements), **Langfuse self-hosted** is the correct choice:

1. **Zero observability licensing cost** — MIT, self-hosted on existing infra
2. **LiteLLM integration is first-class** — cost tracking works automatically across all 100+ providers without manual instrumentation
3. **LangGraph integration is one line** — pass `CallbackHandler` to any graph invoke
4. **Per-node visibility** — the callback system captures every node as a child span
5. **Billing pipeline** — Langfuse REST API lets us pull per-user, per-run cost data for Stripe metering
6. **Eval support** — sufficient for automated quality scoring (LLM-as-judge via Langfuse's eval UI or custom via SDK)

**LangSmith is the better choice only if**: the team wants best-in-class eval tooling (`agentevals`, multi-turn evals, online evaluators) and is willing to pay for managed SaaS at scale.

**Hybrid approach (if budget allows)**: Use Langfuse for production observability and billing, and run LangSmith evals offline against exported datasets. LangSmith's `agentevals` library works independently of the LangSmith tracing infrastructure — you can use it with traces stored anywhere.

### What We Must Build Ourselves

Regardless of tool choice, these require custom implementation:

| Requirement | Tool Coverage | What to Build |
|-------------|--------------|---------------|
| Per-run cost tracking | Automatic (Langfuse/LangSmith) | None — read from API |
| Per-node token counting | Automatic via callbacks | None |
| Eval scoring | LangSmith eval / Langfuse eval | Prompt templates for quality judge |
| **Budget enforcement** | **Not provided by any tool** | **Token accumulator in LangGraph state** |
| Usage reporting for billing | Langfuse/LangSmith API | Cron job querying API, feeding Stripe metered billing |
| Streaming cost updates | Not provided | Custom event in `astream_events` loop → SSE |

---

## 8. Code Examples

### 8.1 Full LangGraph + LiteLLM + Langfuse Setup

```python
# requirements: langfuse, litellm, langgraph, langchain-openai

import os
from langfuse.callback import CallbackHandler
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from typing import Annotated, TypedDict
import operator

# Langfuse config (self-hosted)
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-..."
os.environ["LANGFUSE_HOST"] = "https://langfuse.your-domain.com"

# LiteLLM cost tracking passthrough
os.environ["LITELLM_LOG"] = "ERROR"

class ResearchState(TypedDict):
    topic: str
    subtopics: list[str]
    findings: Annotated[list[str], operator.add]
    tokens_used: int
    estimated_cost_usd: float
    budget_exceeded: bool
    report: str

GPT4O_MINI_INPUT = 0.00015 / 1000
GPT4O_MINI_OUTPUT = 0.0006 / 1000
BUDGET_USD = 2.00

def planner(state: ResearchState) -> dict:
    llm = ChatOpenAI(model="gpt-4o-mini")
    response = llm.invoke([
        {"role": "user", "content": f"Break '{state['topic']}' into 3 research subtopics. Return as comma-separated list."}
    ])
    usage = response.usage_metadata or {}
    tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    cost = (usage.get("input_tokens", 0) * GPT4O_MINI_INPUT +
            usage.get("output_tokens", 0) * GPT4O_MINI_OUTPUT)

    subtopics = [s.strip() for s in response.content.split(",")]
    return {
        "subtopics": subtopics,
        "tokens_used": state["tokens_used"] + tokens,
        "estimated_cost_usd": state["estimated_cost_usd"] + cost,
        "budget_exceeded": (state["estimated_cost_usd"] + cost) >= BUDGET_USD,
    }

def dispatch_workers(state: ResearchState):
    if state.get("budget_exceeded"):
        return END
    return [Send("worker", {"topic": state["topic"], "subtopic": s,
                            "tokens_used": state["tokens_used"],
                            "estimated_cost_usd": state["estimated_cost_usd"],
                            "budget_exceeded": False,
                            "findings": [], "subtopics": [], "report": ""})
            for s in state["subtopics"]]

def worker(state: ResearchState) -> dict:
    if state.get("budget_exceeded"):
        return {"findings": [f"[SKIPPED: budget exceeded] {state.get('subtopic', '')}"],
                "budget_exceeded": True}

    llm = ChatOpenAI(model="gpt-4o-mini")
    response = llm.invoke([
        {"role": "user", "content": f"Research this subtopic in 2 paragraphs: {state.get('subtopic', '')}"}
    ])
    usage = response.usage_metadata or {}
    tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    cost = (usage.get("input_tokens", 0) * GPT4O_MINI_INPUT +
            usage.get("output_tokens", 0) * GPT4O_MINI_OUTPUT)

    new_total_cost = state["estimated_cost_usd"] + cost
    return {
        "findings": [response.content],
        "tokens_used": state["tokens_used"] + tokens,
        "estimated_cost_usd": new_total_cost,
        "budget_exceeded": new_total_cost >= BUDGET_USD,
    }

def synthesizer(state: ResearchState) -> dict:
    llm = ChatOpenAI(model="gpt-4o-mini")
    findings_text = "\n\n".join(state["findings"])
    response = llm.invoke([
        {"role": "user", "content": f"Synthesize these research findings on '{state['topic']}':\n\n{findings_text}"}
    ])
    usage = response.usage_metadata or {}
    tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    cost = (usage.get("input_tokens", 0) * GPT4O_MINI_INPUT +
            usage.get("output_tokens", 0) * GPT4O_MINI_OUTPUT)

    return {
        "report": response.content,
        "tokens_used": state["tokens_used"] + tokens,
        "estimated_cost_usd": state["estimated_cost_usd"] + cost,
    }

# Build graph
builder = StateGraph(ResearchState)
builder.add_node("planner", planner)
builder.add_node("worker", worker)
builder.add_node("synthesizer", synthesizer)
builder.add_edge(START, "planner")
builder.add_conditional_edges("planner", dispatch_workers, ["worker", END])
builder.add_edge("worker", "synthesizer")
builder.add_edge("synthesizer", END)
graph = builder.compile()

# Invoke with Langfuse tracing
async def run_research(topic: str, user_id: str) -> dict:
    handler = CallbackHandler(
        user_id=user_id,
        session_id=f"research-{user_id}-{topic[:20]}",
        metadata={"run_type": "research", "user_id": user_id}
    )

    initial_state = ResearchState(
        topic=topic, subtopics=[], findings=[],
        tokens_used=0, estimated_cost_usd=0.0,
        budget_exceeded=False, report=""
    )

    result = await graph.ainvoke(
        initial_state,
        config={"callbacks": [handler]}
    )

    return {
        "report": result["report"],
        "tokens_used": result["tokens_used"],
        "cost_usd": result["estimated_cost_usd"],
        "budget_exceeded": result.get("budget_exceeded", False),
    }
```

### 8.2 Billing Data Extraction from Langfuse API

```python
from langfuse import Langfuse
from datetime import datetime, timedelta

langfuse = Langfuse(
    public_key="pk-...",
    secret_key="sk-...",
    host="https://langfuse.your-domain.com"
)

def get_user_usage_for_billing(user_id: str, period_start: datetime, period_end: datetime) -> dict:
    """Pull all runs for a user in a billing period and sum costs."""

    traces = langfuse.get_traces(
        user_id=user_id,
        from_timestamp=period_start,
        to_timestamp=period_end,
    )

    total_tokens = 0
    total_cost = 0.0
    run_count = 0

    for trace in traces.data:
        # Langfuse stores per-trace cost and token totals
        total_tokens += trace.total_tokens or 0
        total_cost += trace.total_cost or 0.0  # in USD
        run_count += 1

    return {
        "user_id": user_id,
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "run_count": run_count,
        "total_tokens": total_tokens,
        "total_cost_usd": total_cost,
        # Pass to Stripe metered billing
        "stripe_units": run_count,  # or round(total_cost_usd * 100) for cent-based billing
    }
```

### 8.3 Automated Quality Eval After Each Run

```python
from langsmith import Client, traceable, wrappers
from openai import OpenAI
from pydantic import BaseModel

ls_client = Client()
oai = wrappers.wrap_openai(OpenAI())

class QualityScore(BaseModel):
    score: int  # 1-5
    completeness: bool
    reasoning: str

async def auto_evaluate_run(run_id: str, topic: str, report: str):
    """Post-run quality evaluation. Call as background task."""

    response = oai.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": (
                "You are a research quality evaluator. "
                "Score the report 1-5 and assess completeness."
            )},
            {"role": "user", "content": f"Topic: {topic}\n\nReport:\n{report}"}
        ],
        response_format=QualityScore
    )

    result = response.choices[0].message.parsed

    # Attach feedback to the LangSmith run
    ls_client.create_feedback(
        run_id=run_id,
        key="quality_score",
        score=result.score / 5,
        comment=result.reasoning,
    )
    ls_client.create_feedback(
        run_id=run_id,
        key="completeness",
        score=1 if result.completeness else 0,
    )
```

### 8.4 LangSmith-Only Setup (No Langfuse)

```python
import os
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = "ls_..."
os.environ["LANGSMITH_PROJECT"] = "research-prod"

# That's it. LangGraph auto-traces through env vars.
result = graph.invoke(inputs)

# Retrieve cost after run
from langsmith import Client
client = Client()

# get_run returns a Run object with token fields
run = client.read_run(run_id=result_run_id)
cost_data = {
    "prompt_tokens": run.prompt_tokens,
    "completion_tokens": run.completion_tokens,
    "total_tokens": run.total_tokens,
    # total_cost may or may not be present depending on model coverage
}
```

---

## Sources

### LangSmith Docs
- [Cost tracking — Docs by LangChain](https://docs.langchain.com/langsmith/cost-tracking)
- [LangSmith Evaluation](https://docs.langchain.com/langsmith/evaluation)
- [LangSmith Plans and Pricing](https://www.langchain.com/pricing)
- [Self-hosted LangSmith](https://docs.langchain.com/langsmith/self-hosted)
- [LangSmith SDK — list_runs](https://langsmith-sdk.readthedocs.io/en/latest/client/langsmith.client.Client.list_runs.html)
- [openevals — readymade evaluators](https://github.com/langchain-ai/openevals)
- [agentevals — agent trajectory evaluators](https://github.com/langchain-ai/agentevals)

### LangGraph Docs
- [LangGraph forum: token usage from LangGraph](https://forum.langchain.com/t/how-to-obtain-token-usage-from-langgraph/1727)
- [LangGraph Pricing Guide — ZenML](https://www.zenml.io/blog/langgraph-pricing)

### Langfuse
- [Langfuse: LangChain/LangGraph integration](https://langfuse.com/integrations/frameworks/langchain)
- [Langfuse: Token and cost tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- [Langfuse: LangGraph cookbook](https://langfuse.com/guides/cookbook/integration_langgraph)
- [Langfuse GitHub](https://github.com/langfuse/langfuse)

### LiteLLM
- [LiteLLM: LangSmith integration](https://docs.litellm.ai/docs/observability/langsmith_integration)
- [LiteLLM: Completion token usage](https://docs.litellm.ai/docs/completion/token_usage)

### Comparisons
- [Langfuse vs LangSmith — Langfuse](https://langfuse.com/faq/all/langsmith-alternative)
- [LangSmith alternatives 2026 — SigNoz](https://signoz.io/comparisons/langsmith-alternatives/)
- [Arize Phoenix overview](https://arize.com/docs/phoenix)
- [Langfuse vs Phoenix — ZenML](https://www.zenml.io/blog/langfuse-vs-phoenix)
