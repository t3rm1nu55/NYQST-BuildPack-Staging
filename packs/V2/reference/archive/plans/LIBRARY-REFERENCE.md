---
document_id: LIB-REF
version: 2
date: 2026-02-19
---

# Library Reference

This document catalogs every third-party library referenced in the implementation plan. Each entry records the install command, canonical docs URL, key patterns we will use, and known gotchas.

---

## Summary Table

| LIB-ID  | Library               | Install                               | Purpose                              |
|---------|-----------------------|---------------------------------------|--------------------------------------|
| LIB-01  | LangGraph             | `pip install langgraph`               | Graph-based agent orchestration      |
| LIB-02  | FastAPI               | `pip install fastapi`                 | Web framework / API layer            |
| LIB-03  | SQLAlchemy 2.0        | `pip install sqlalchemy[asyncio]`     | Async ORM                            |
| LIB-04  | Alembic               | `pip install alembic`                 | DB schema migrations                 |
| LIB-05  | Pydantic v2           | `pip install pydantic`                | Data validation / schemas            |
| LIB-06  | WeasyPrint            | `pip install weasyprint`              | HTML → PDF rendering                 |
| LIB-07  | python-docx           | `pip install python-docx`             | DOCX document generation             |
| LIB-08  | Stripe Python SDK     | `pip install stripe`                  | Billing / subscriptions / metering   |
| LIB-09  | arq                   | `pip install arq`                     | Async Redis job queue                |
| LIB-10  | httpx                 | `pip install httpx`                   | Async HTTP client                    |
| LIB-11  | @assistant-ui/react   | `npm install @assistant-ui/react`     | Chat UI primitives / runtime         |
| LIB-12  | Zustand               | `npm install zustand`                 | React state management               |
| LIB-13  | Plotly.js             | `npm install plotly.js`               | Interactive charting                 |
| LIB-14  | reveal.js             | `npm install reveal.js`               | Presentation / slides                |
| LIB-15  | Brave Search API      | REST (HTTP, no SDK)                   | Web search for research agents       |
| LIB-16  | Jina Reader API       | REST (HTTP, no SDK)                   | URL-to-markdown scraping             |
| LIB-17  | shadcn/ui             | `npx shadcn@latest add <component>`   | Accessible UI component primitives   |
| LIB-18  | unified               | `npm install unified`                 | Text processing pipeline interface   |
| LIB-19  | rehype-parse          | `npm install rehype-parse`            | HTML → HAST parser                   |
| LIB-20  | rehype-react          | `npm install rehype-react`            | HAST → React element compiler        |
| LIB-21  | react-plotly.js       | `npm install react-plotly.js plotly.js` | React wrapper for Plotly.js charts |

---

## Backend Libraries

### LIB-01: LangGraph

- **Purpose**: Low-level orchestration framework for building stateful, long-running agents as directed graphs. Core primitive for the research orchestrator: nodes, edges, Send fan-out, checkpointing.
- **Install**: `pip install langgraph`
- **Version to target**: 0.4.x+ (use `pip install "langgraph>=0.4"`)
- **Docs**: https://docs.langchain.com/oss/python/langgraph/
- **Key Patterns**:
  - `StateGraph` — define a typed state schema, add nodes and edges, compile to a runnable graph.
  - `Send` — return `Send` objects from conditional edge functions to dynamically fan-out to N parallel nodes with per-node state slices (map-reduce pattern).
  - `add_conditional_edges` — route to one or more nodes based on a routing function; all returned nodes run in parallel in the next superstep.
  - `AsyncPostgresSaver` — LangGraph's Postgres checkpointer for durable, resumable agent runs (from `langgraph-checkpoint-postgres`).
  - Subgraphs — compile inner `StateGraph` objects and register them as nodes in the outer graph for modular orchestration.
- **Code Example**:
  ```python
  from langgraph.graph import StateGraph
  from langgraph.types import Send

  # Fan-out pattern: generate one subagent task per subject
  def continue_to_jobs(state: OverallState):
      return [Send("run_subagent", {"subject": s}) for s in state["subjects"]]

  builder = StateGraph(OverallState)
  builder.add_node("plan", plan_node)
  builder.add_node("run_subagent", run_subagent_node)
  builder.add_node("aggregate", aggregate_node)

  builder.add_edge("plan", "run_subagent")          # static edge
  builder.add_conditional_edges("plan", continue_to_jobs)  # dynamic fan-out
  builder.add_edge("run_subagent", "aggregate")

  graph = builder.compile(checkpointer=postgres_saver)
  ```
- **Gotchas**:
  - `Send` is only valid from **conditional** edges, not static ones.
  - Parallel nodes in a superstep share the same graph state snapshot going in; reducer functions merge their outputs.
  - `AsyncPostgresSaver` requires `pip install langgraph-checkpoint-postgres` as a separate package.
  - Existing `ResearchAssistantGraph` in the platform must be extended, not replaced — check for existing node names before adding new ones.

---

### LIB-02: FastAPI

- **Purpose**: High-performance ASGI web framework. Hosts all API routers, dependency injection, background task dispatch, and SSE streaming endpoints.
- **Install**: `pip install fastapi[standard]`  (includes uvicorn, httpx, email-validator, etc.)
- **Version to target**: `>=0.115`
- **Docs**: https://fastapi.tiangolo.com/
- **Key Patterns**:
  - `BackgroundTasks` — fire-and-forget non-blocking work after response is sent (e.g., enqueue arq job, write audit log).
  - `StreamingResponse` with `media_type="text/event-stream"` — SSE for LangGraph streaming events.
  - `Depends()` — dependency injection for auth, DB session, config.
  - Router-based modular structure: `APIRouter(prefix="/api/v1/...")`.
- **Code Example**:
  ```python
  from fastapi import FastAPI, BackgroundTasks
  from fastapi.responses import StreamingResponse

  app = FastAPI()

  # Background task after response
  @app.post("/runs/{run_id}/start")
  async def start_run(run_id: str, background_tasks: BackgroundTasks):
      background_tasks.add_task(enqueue_run_job, run_id)
      return {"status": "queued"}

  # SSE streaming
  async def event_generator(run_id: str):
      async for event in pg_listen(run_id):
          yield f"data: {event.json()}\n\n"

  @app.get("/runs/{run_id}/stream")
  async def stream_run(run_id: str):
      return StreamingResponse(
          event_generator(run_id),
          media_type="text/event-stream"
      )
  ```
- **Gotchas**:
  - `BackgroundTasks` runs in the same process/event loop — for heavy CPU work, use arq instead.
  - SSE clients must set `Accept: text/event-stream`; browsers auto-reconnect but custom clients may not.
  - Starlette's `StreamingResponse` does not set `Cache-Control: no-cache` by default — add it to prevent proxy buffering.

---

### LIB-03: SQLAlchemy 2.0

- **Purpose**: Async ORM for all database access. Uses `AsyncSession`, `async_sessionmaker`, `selectinload` for relationship eager-loading, and 2.0-style `select()` queries.
- **Install**: `pip install "sqlalchemy[asyncio]>=2.0" asyncpg`
- **Version to target**: `>=2.0`
- **Docs**: https://docs.sqlalchemy.org/en/21/
- **Key Patterns**:
  - `create_async_engine` + `async_sessionmaker` — engine setup with `expire_on_commit=False`.
  - `AsyncSession.execute(select(...))` — primary query path; returns `Result`.
  - `selectinload(Model.relationship)` — eager-load collections in async context (avoids lazy-load implicit IO).
  - `AsyncAttrs` mixin — allows `await obj.awaitable_attrs.relationship` for post-commit attribute access.
  - `session.stream(stmt)` — streaming async result for large result sets.
- **Code Example**:
  ```python
  from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
  from sqlalchemy import select
  from sqlalchemy.orm import selectinload

  engine = create_async_engine(
      "postgresql+asyncpg://user:pass@localhost/db", echo=False
  )
  async_session = async_sessionmaker(engine, expire_on_commit=False)

  async def get_run_with_events(run_id: str) -> Run:
      async with async_session() as session:
          stmt = (
              select(Run)
              .where(Run.id == run_id)
              .options(selectinload(Run.events))
          )
          result = await session.execute(stmt)
          return result.scalar_one()
  ```
- **Gotchas**:
  - Never access lazy-loaded relationships outside an async context without `selectinload` or `AsyncAttrs` — raises `MissingGreenlet`.
  - Declare relationships with `lazy="raise"` as a safety net in async models.
  - `expire_on_commit=False` is mandatory for async: after commit, attributes become expired and accessing them triggers implicit IO.
  - Use `asyncpg` driver for PostgreSQL (`postgresql+asyncpg://`); `psycopg3` (`postgresql+psycopg://`) is also supported.

---

### LIB-04: Alembic

- **Purpose**: Database migration tool paired with SQLAlchemy. Autogenerates migration scripts from model changes, supports async engine configuration.
- **Install**: `pip install alembic`
- **Version to target**: `>=1.13` (current stable 1.18.x)
- **Docs**: https://alembic.sqlalchemy.org/en/latest/
- **Key Patterns**:
  - `alembic init -t async migrations` — initialise with the async template; generates `env.py` with asyncio support.
  - `alembic revision --autogenerate -m "description"` — diff models against DB and generate migration.
  - `alembic upgrade head` — apply all pending migrations.
  - `alembic downgrade -1` — roll back one migration.
  - `target_metadata = Base.metadata` in `env.py` — required for autogenerate to detect model changes.
- **Code Example** (`env.py` async pattern):
  ```python
  import asyncio
  from sqlalchemy.ext.asyncio import async_engine_from_config
  from alembic import context
  from app.models import Base  # your DeclarativeBase

  target_metadata = Base.metadata

  def do_run_migrations(connection):
      context.configure(connection=connection, target_metadata=target_metadata)
      with context.begin_transaction():
          context.run_migrations()

  async def run_async_migrations():
      connectable = async_engine_from_config(
          context.config.get_section(context.config.config_ini_section),
          prefix="sqlalchemy.",
      )
      async with connectable.connect() as connection:
          await connection.run_sync(do_run_migrations)
      await connectable.dispose()

  def run_migrations_online():
      asyncio.run(run_async_migrations())
  ```
- **Gotchas**:
  - Alembic autogenerate does **not** detect: CHECK constraints, partial indexes, column comments, or sequence changes by default.
  - `alembic init -t async` must be used upfront — retrofitting an existing sync `env.py` requires manual edits.
  - Use `compare_type=True` in `context.configure()` to detect column type changes.
  - The platform already has 4 migrations (0001–0004); new migrations must be added as 0005+.

---

### LIB-05: Pydantic v2

- **Purpose**: Data validation, serialisation, and schema generation. Used for request/response models in FastAPI, LangGraph state types, and internal data contracts.
- **Install**: `pip install "pydantic>=2.0"`
- **Version to target**: `>=2.0` (v2 is a rewrite — v1 API is incompatible)
- **Docs**: https://docs.pydantic.dev/latest/
- **Key Patterns**:
  - `BaseModel` with Python type hints — auto-validates on construction.
  - `@model_validator(mode="before"/"after")` — cross-field validation.
  - `@field_validator("field_name")` — per-field validation logic.
  - Discriminated unions — `Field(discriminator="type")` or `Discriminator(fn)` for routing to the correct submodel.
  - `model.model_dump()` / `model.model_validate(data)` — v2 serialisation API (replaces v1 `.dict()` / `.parse_obj()`).
- **Code Example**:
  ```python
  from typing import Literal, Union, Annotated
  from pydantic import BaseModel, Field, Discriminator, Tag

  class TextDeliverable(BaseModel):
      type: Literal["text"]
      content: str

  class ChartDeliverable(BaseModel):
      type: Literal["chart"]
      chart_type: str
      data: dict

  class RunOutput(BaseModel):
      deliverable: Annotated[
          Union[TextDeliverable, ChartDeliverable],
          Field(discriminator="type"),
      ]
      run_id: str

  # Callable discriminator example
  def pick_model(v):
      if isinstance(v, dict):
          return v.get("type")
      return None

  class FlexOutput(BaseModel):
      payload: Annotated[
          Union[
              Annotated[TextDeliverable, Tag("text")],
              Annotated[ChartDeliverable, Tag("chart")],
          ],
          Discriminator(pick_model),
      ]
  ```
- **Gotchas**:
  - v2 `model_validator` replaces v1 `@validator` / `@root_validator` — imports and signatures differ.
  - `model_dump(mode="json")` serialises all types to JSON-safe primitives; `model_dump()` alone keeps Python types.
  - FastAPI uses Pydantic v2 internally — ensure dependency versions align.
  - `Discriminator` with a callable requires `Tag` annotations on each union member.

---

### LIB-06: WeasyPrint

- **Purpose**: Converts HTML + CSS to PDF. Used for report/deliverable PDF export with full CSS3 layout support including paged media, running headers/footers, and page counters.
- **Install**: `pip install weasyprint`
- **Version to target**: latest stable (62.x as of 2025)
- **Docs**: https://doc.courtbouillon.org/weasyprint/stable/
- **Key Patterns**:
  - `HTML(string=html_str).write_pdf(path)` — simplest form.
  - `CSS(string=css_str)` — inject custom CSS.
  - `@page` rule — control page size, margins, orientation.
  - `@top-center`, `@bottom-center` margin boxes — running headers and footers.
  - `counter(page)` / `counter(pages)` — page numbering.
  - `string-set` / `string()` — dynamic running strings from content (e.g., chapter title in header).
  - `page-break-before: always` / `break-inside: avoid` — control pagination.
- **Code Example**:
  ```python
  from weasyprint import HTML, CSS

  css = CSS(string="""
  @page {
      size: A4;
      margin: 2.5cm 2cm 3cm 2cm;

      @top-right {
          content: string(report-title);
          font-size: 9pt;
          color: #666;
      }
      @bottom-center {
          content: "Page " counter(page) " of " counter(pages);
          font-size: 9pt;
      }
  }
  @page :first {
      @top-right { content: none; }
  }
  h1 { string-set: report-title content(); }
  """)

  html = HTML(string=rendered_html_string)
  pdf_bytes = html.write_pdf(stylesheets=[css])
  ```
- **Gotchas**:
  - WeasyPrint requires system-level font and Cairo/Pango libraries — install `libpango`, `libcairo`, `libgdk-pixbuf` on the host (or use the official Docker image).
  - JavaScript is not executed — HTML must be pre-rendered server-side before passing to WeasyPrint.
  - `@page` margin boxes (`@top-center` etc.) are part of CSS Paged Media spec — not all CSS properties work there.
  - Large HTML with many images can be slow; pre-encode images as `data:` URIs to avoid external fetches.
  - Does not support `position: fixed` in the same way browsers do inside paged media.

---

### LIB-07: python-docx

- **Purpose**: Programmatic creation and editing of Microsoft Word `.docx` files. Used for report deliverable DOCX export.
- **Install**: `pip install python-docx`
- **Version to target**: `>=1.1`
- **Docs**: https://python-docx.readthedocs.io/en/latest/
- **Key Patterns**:
  - `Document()` — create new blank document (or `Document(path)` to open existing template).
  - `document.add_heading(text, level=1)` — heading paragraph (level 0 = Title).
  - `document.add_paragraph(text, style="List Bullet")` — styled paragraph.
  - `p.add_run("text").bold = True` — inline bold/italic runs.
  - `document.add_table(rows, cols, style="Table Grid")` — add a table.
  - `document.add_picture(path, width=Inches(n))` — inline image.
  - `document.add_page_break()` — explicit page break.
  - `document.save("output.docx")` — write to disk (or `io.BytesIO` for in-memory).
- **Code Example**:
  ```python
  from docx import Document
  from docx.shared import Inches
  import io

  def build_report_docx(title: str, sections: list[dict]) -> bytes:
      doc = Document()
      doc.add_heading(title, level=0)

      for section in sections:
          doc.add_heading(section["heading"], level=1)
          p = doc.add_paragraph()
          p.add_run(section["body"])

          if section.get("table"):
              rows = section["table"]
              t = doc.add_table(rows=1, cols=len(rows[0]), style="Table Grid")
              hdr = t.rows[0].cells
              for i, col in enumerate(rows[0]):
                  hdr[i].text = col
              for row_data in rows[1:]:
                  cells = t.add_row().cells
                  for i, val in enumerate(row_data):
                      cells[i].text = str(val)

      buf = io.BytesIO()
      doc.save(buf)
      return buf.getvalue()
  ```
- **Gotchas**:
  - Style names (e.g., `"Table Grid"`, `"List Bullet"`) must match those in the underlying `Normal.dotx` template — misspelled names silently fall back to default.
  - Open an existing branded `.docx` as the template (`Document("template.docx")`) to inherit corporate styles.
  - Images must be local files or `BytesIO` — no URL fetching built in.
  - `python-docx` on PyPI is the maintained fork (v1.x); the original `python-docx` package on PyPI is stale — verify you get `>=1.1`.

---

### LIB-08: Stripe Python SDK

- **Purpose**: Billing integration. Manages subscriptions, checkout sessions, usage metering, and webhook event handling.
- **Install**: `pip install stripe`
- **Version to target**: `>=11.0` (v11 introduced `StripeClient` and v2 billing APIs)
- **Docs**: https://docs.stripe.com/api?lang=python
- **Key Patterns**:
  - `StripeClient(api_key)` — preferred over legacy module-level `stripe.api_key` in v11+.
  - `client.v1.checkout.sessions.create(params={...})` — create a Checkout Session.
  - `client.v1.subscriptions.create(params={...})` — create subscription with `payment_behavior="default_incomplete"`.
  - `Webhook.construct_event(payload, sig, secret)` — verify and parse webhook payload (v1 snapshot events).
  - `client.parse_event_notification(body, sig, secret)` — v2 thin event parsing with type-safe access.
  - `client.v2.billing.meter_event_stream.create(params={"events": [...]})` — high-throughput usage metering.
- **Code Example**:
  ```python
  import stripe
  from stripe import StripeClient, Webhook, SignatureVerificationError

  client = StripeClient(api_key="sk_live_...")

  # Create checkout session
  session = client.v1.checkout.sessions.create(params={
      "mode": "subscription",
      "line_items": [{"price": "price_xxx", "quantity": 1}],
      "success_url": "https://app.example.com/billing/success",
      "cancel_url": "https://app.example.com/billing/cancel",
  })

  # Webhook handler (FastAPI)
  @app.post("/webhooks/stripe")
  async def stripe_webhook(request: Request):
      payload = await request.body()
      sig = request.headers.get("Stripe-Signature", "")
      try:
          event = Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
      except SignatureVerificationError:
          raise HTTPException(400, "Bad signature")
      if event.type == "customer.subscription.updated":
          sub = event.data.object
          await update_subscription_status(sub.id, sub.status)
      return {"ok": True}
  ```
- **Gotchas**:
  - `StripeClient` (v11+) is **not** backward-compatible with the old `stripe.Customer.create()` module-level API — pick one style and be consistent.
  - Webhook signature verification requires the **raw bytes** body, not a parsed JSON dict.
  - Meter event sessions expire — refresh before each batch send (see `refresh_meter_event_session` pattern in docs).
  - Test mode vs. live mode: keys starting with `sk_test_` vs `sk_live_`.

---

### LIB-09: arq

- **Purpose**: Asyncio-native Redis job queue. Used for heavy background work (LangGraph graph execution, PDF export, DOCX generation) that should not block the FastAPI event loop.
- **Install**: `pip install arq`
- **Version to target**: `>=0.25`
- **Docs**: https://arq-docs.helpmanual.io/
- **Key Patterns**:
  - `ArqRedis` pool — shared connection pool; `await pool.enqueue_job("function_name", *args)`.
  - `WorkerSettings` class — declare `functions`, `cron_jobs`, `redis_settings`, `max_jobs`, `job_timeout`.
  - `cron(coroutine, hour=..., minute=..., unique=True)` — declare scheduled cron jobs.
  - `Retry(defer=N)` exception — raise inside a job to reschedule after N seconds.
  - `_job_id` kwarg on `enqueue_job` — enforce deduplication (same job_id → single execution).
  - `ctx["redis"]` — access the ArqRedis pool from inside a worker function.
- **Code Example**:
  ```python
  import arq
  from arq import cron
  from arq.connections import RedisSettings

  # Worker function
  async def run_research_graph(ctx, run_id: str):
      graph = ctx["graph"]
      await graph.ainvoke({"run_id": run_id})

  # Cron: clean up old runs daily at 02:00
  async def cleanup_old_runs(ctx):
      await ctx["db"].execute("DELETE FROM runs WHERE created_at < now() - interval '30 days'")

  class WorkerSettings:
      functions = [run_research_graph]
      cron_jobs = [cron(cleanup_old_runs, hour=2, minute=0, unique=True)]
      redis_settings = RedisSettings(host="redis", port=6379)
      max_jobs = 10
      job_timeout = 3600  # 1 hour

  # Enqueue from FastAPI
  async def enqueue_run(run_id: str, pool: arq.ArqRedis):
      await pool.enqueue_job(
          "run_research_graph",
          run_id,
          _job_id=f"run:{run_id}",  # deduplication
          _queue_name="default",
      )
  ```
- **Gotchas**:
  - arq uses **asyncio** throughout — all worker functions must be `async def`.
  - `_job_id` deduplication means re-enqueuing with the same ID is a no-op — good for idempotency, but reset it after completion if re-runs are needed.
  - Jobs serialize arguments with `msgpack` — arguments must be msgpack-serialisable (no custom classes).
  - Health-check: arq has no built-in UI; use `arq.worker.check_health()` or inspect Redis keys directly.
  - Worker process must share startup state (e.g., compiled graph, DB engine) via `ctx` populated in `on_startup`.

---

### LIB-10: httpx

- **Purpose**: Async HTTP client for calling external APIs (Brave Search, Jina Reader, LLM APIs). Supports streaming, retries, connection pooling, and timeout configuration.
- **Install**: `pip install httpx`
- **Version to target**: `>=0.27`
- **Docs**: https://www.python-httpx.org/
- **Key Patterns**:
  - `httpx.AsyncClient()` — reuse across requests (use as async context manager or inject as dependency).
  - `AsyncHTTPTransport(retries=N)` — automatic retry on connection errors.
  - `client.stream("GET", url)` — async streaming response; iterate with `aiter_text()` / `aiter_bytes()` / `aiter_lines()`.
  - `Timeout(connect=5.0, read=60.0)` — granular timeout control.
- **Code Example**:
  ```python
  import httpx

  # Reusable async client with retries and timeout
  transport = httpx.AsyncHTTPTransport(retries=3)
  client = httpx.AsyncClient(
      transport=transport,
      timeout=httpx.Timeout(connect=5.0, read=60.0),
  )

  # Simple JSON fetch
  async def brave_search(query: str, api_key: str) -> dict:
      resp = await client.get(
          "https://api.search.brave.com/res/v1/web/search",
          params={"q": query, "count": 10},
          headers={"X-Subscription-Token": api_key, "Accept": "application/json"},
      )
      resp.raise_for_status()
      return resp.json()

  # Streaming response
  async def stream_llm(prompt: str):
      async with client.stream("POST", "https://api.openai.com/v1/chat/completions",
                               json={...}) as response:
          async for line in response.aiter_lines():
              if line.startswith("data: "):
                  yield line[6:]
  ```
- **Gotchas**:
  - `AsyncHTTPTransport(retries=N)` only retries on **connection** errors, not HTTP 4xx/5xx — implement application-level retry for those.
  - Do not create a new `AsyncClient()` per request — reuse a module-level or dependency-injected instance to benefit from connection pooling.
  - Streaming responses must be consumed inside the `async with client.stream(...)` context manager; exiting closes the connection.
  - `raise_for_status()` raises `httpx.HTTPStatusError` (not `requests.HTTPError`) — update exception handlers accordingly.

---

## Frontend Libraries

### LIB-11: @assistant-ui/react

- **Purpose**: React primitives for building AI chat interfaces. Provides `ChatModelAdapter` for custom backend integration, streaming support, tool call rendering, and composable message part components.
- **Install**: `npm install @assistant-ui/react`
- **Version to target**: `>=0.7` (check npm for latest)
- **Docs**: https://www.assistant-ui.com/docs
- **Key Patterns**:
  - `ChatModelAdapter` interface — implement `run()` as an `AsyncGenerator` that yields `{ content: [...] }` chunks for streaming.
  - `MessagePrimitive.Parts` — render message content parts (Text, Reasoning, Audio, Tools) with custom component overrides.
  - `MessagePrimitive.PartByIndex` — render a single part at a known index.
  - Tool registration via `useAui` + `Tools({ toolkit })` — define tools with Zod params, `execute`, and `render` functions.
  - `AssistantRuntimeProvider` — wraps the app; injects runtime context consumed by all assistant-ui primitives.
- **Code Example**:
  ```tsx
  import { ChatModelAdapter, ThreadMessage, type ModelContext } from "@assistant-ui/react";

  const MyAdapter: ChatModelAdapter = {
    async *run({ messages, abortSignal, context }) {
      const res = await fetch("/api/runs/stream", {
        method: "POST",
        signal: abortSignal,
        body: JSON.stringify({ messages }),
      });

      let text = "";
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        yield { content: [{ type: "text", text }] };
      }
    },
  };

  // Tool with custom render
  const toolkit = {
    generateChart: {
      description: "Render a chart deliverable",
      parameters: z.object({ chart_json: z.string() }),
      execute: async ({ chart_json }) => JSON.parse(chart_json),
      render: ({ result }) => result ? <PlotlyChart data={result} /> : <Spinner />,
    },
  };
  ```
- **Gotchas**:
  - The `run()` generator must be an `async function*` — a plain `async function` returning a value is not valid.
  - Tool `render` receives `{ args, result }` — `result` is `undefined` while the tool is executing; guard against it.
  - `MessagePrimitive.Parts` component mapping overrides render for **all** messages — make it a stable reference to avoid re-renders.
  - Check for breaking changes between minor versions; the library is actively developed as of 2025.

---

### LIB-12: Zustand

- **Purpose**: Minimal, hook-based React state management. Used for client-side UI state: active run, streaming status, deliverable list, billing state.
- **Install**: `npm install zustand`
- **Version to target**: `>=5.0`
- **Docs**: https://zustand.pmnd.rs/
- **Key Patterns**:
  - `create<StateType>()(...)` — create a typed store hook.
  - `devtools(...)` middleware — Redux DevTools integration; pass action names as third arg to `set`.
  - `persist(..., { name: "key" })` — localStorage/sessionStorage persistence.
  - `immer(...)` middleware — mutable draft state updates (eliminates spread boilerplate for nested state).
  - Slices pattern — compose multiple `StateCreator` functions into one store for modularity.
- **Code Example**:
  ```typescript
  import { create, StateCreator } from "zustand";
  import { devtools, persist, immer } from "zustand/middleware";

  type RunSlice = {
    activeRunId: string | null;
    status: "idle" | "running" | "done" | "error";
    setActiveRun: (id: string) => void;
    setStatus: (s: RunSlice["status"]) => void;
  };

  const createRunSlice: StateCreator<RunSlice, [["zustand/immer", never]], [], RunSlice> =
    (set) => ({
      activeRunId: null,
      status: "idle",
      setActiveRun: (id) => set((state) => { state.activeRunId = id; }),
      setStatus: (s) => set((state) => { state.status = s; }),
    });

  export const useAppStore = create<RunSlice>()(
    devtools(
      persist(
        immer((...a) => ({ ...createRunSlice(...a) })),
        { name: "app-store" }
      )
    )
  );
  ```
- **Gotchas**:
  - `immer` middleware from `zustand/middleware/immer` — import path differs from plain `immer`.
  - Middleware order matters: `devtools(persist(immer(...)))` — outermost is devtools.
  - `persist` by default uses `localStorage` — for sensitive billing state, use `sessionStorage` or exclude keys with `partialize`.
  - Zustand v5 removed some legacy APIs (`StoreApi` type adjustments) — check migration guide if upgrading from v4.
  - Selector functions passed to `useAppStore(selector)` must be stable or use `useShallow` for object equality.

---

### LIB-13: Plotly.js

- **Purpose**: Interactive charting library. Powers all chart deliverables: bar, scatter, line, bubble, histogram, box, candlestick, pie/donut.
- **Install**: `npm install plotly.js` (full bundle) or `npm install plotly.js-dist-min` (minified)
- **Version to target**: `>=2.35`
- **Docs**: https://plotly.com/javascript/
- **Key Patterns**:
  - `Plotly.newPlot(divId, traces, layout, config)` — initial render; clears existing plot.
  - `Plotly.react(divId, traces, layout, config)` — declarative update; diffs and applies only changes (preferred for React integration).
  - `type: "bar"` / `"scatter"` / `"histogram"` / `"box"` / `"candlestick"` / `"pie"` — trace type selector.
  - `barmode: "group"` / `"stack"` in layout — grouped vs. stacked bars.
  - `config: { responsive: true, displayModeBar: true }` — make chart resize with container.
  - For React: use `react-plotly.js` wrapper (`npm install react-plotly.js`) or call `Plotly.react` in a `useEffect`.
- **Code Example**:
  ```javascript
  // Vanilla JS — render mixed chart
  Plotly.newPlot("chart-div",
    [
      { x: ["Q1", "Q2", "Q3"], y: [10, 15, 13], type: "bar", name: "Revenue" },
      { x: ["Q1", "Q2", "Q3"], y: [8, 12, 11], type: "scatter", mode: "lines+markers", name: "Cost" },
    ],
    { title: "Quarterly P&L", barmode: "group" },
    { responsive: true }
  );

  // Declarative update (React useEffect)
  useEffect(() => {
    Plotly.react("chart-div", traces, layout, { responsive: true });
  }, [traces, layout]);

  // Pie/donut
  Plotly.newPlot("pie-div", [{
    values: [40, 30, 30],
    labels: ["A", "B", "C"],
    type: "pie",
    hole: 0.4,  // donut
  }], { title: "Market Share" });
  ```
- **Gotchas**:
  - The full `plotly.js` bundle is ~3 MB — use `plotly.js-dist-min` or per-chart partial bundles to reduce bundle size.
  - `Plotly.newPlot` destroys and recreates the DOM element — use `Plotly.react` for live-updating charts.
  - In React strict mode, `useEffect` fires twice — guard with a cleanup ref or use `react-plotly.js` which handles this.
  - WebGL-backed traces (`scattergl`, `heatmapgl`) require a capable GPU — fall back gracefully.
  - Candlestick requires `open`, `high`, `low`, `close` arrays; partial data causes silent rendering failures.

---

### LIB-14: reveal.js

- **Purpose**: HTML presentation framework. Powers slide-based deliverables. Supports programmatic initialization, theming, speaker notes, and PDF export.
- **Install**: `npm install reveal.js`
- **Version to target**: `>=5.1`
- **Docs**: https://revealjs.com/
- **Key Patterns**:
  - `Reveal.initialize({ ...config, plugins: [...] })` — init with plugins (Markdown, Highlight, Notes, Math, Zoom).
  - `hash: true` — URL-driven slide navigation.
  - `transition: "slide"` / `"fade"` / `"none"` — slide transition.
  - `?print-pdf` query parameter + Chrome print → PDF — browser-based export.
  - `view: "print"` in config — programmatic print mode for Puppeteer/Playwright PDF generation.
  - `pdfMaxPagesPerSlide: 1` — one PDF page per slide.
  - Plugin API: `{ id, init(reveal) { ... } }` — custom plugin structure; use `reveal.on("slidechanged", ...)`.
- **Code Example**:
  ```javascript
  import Reveal from "reveal.js";
  import RevealMarkdown from "reveal.js/plugin/markdown/markdown.esm.js";
  import RevealHighlight from "reveal.js/plugin/highlight/highlight.esm.js";
  import RevealNotes from "reveal.js/plugin/notes/notes.esm.js";

  const deck = new Reveal(document.querySelector(".reveal"), {
    hash: true,
    transition: "slide",
    width: 1280,
    height: 720,
    margin: 0.04,
    slideNumber: true,
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes],
  });

  await deck.initialize();

  // PDF export (server-side via Puppeteer)
  // 1. Navigate to: presentation.html?print-pdf
  // 2. Wait for networkidle
  // 3. page.pdf({ printBackground: true })
  ```
- **Gotchas**:
  - reveal.js requires `.reveal > .slides` DOM structure — the wrapper div matters.
  - `Reveal.initialize()` returns a Promise — `await` it before calling API methods like `Reveal.slide(n)`.
  - PDF export via browser print requires `?print-pdf` in the URL **and** background graphics enabled in the print dialog.
  - Nested slides (vertical) use `<section>` inside `<section>` — AI-generated HTML must follow this structure exactly.
  - ESM imports (`reveal.js/plugin/...`) differ from CDN script tag usage — be consistent with the build system.

---

## External APIs

### LIB-15: Brave Search API

- **Purpose**: Web search for research agent workstreams. Provides organic web results, news, images, and video search from Brave's independent index.
- **No SDK** — use `httpx.AsyncClient` directly.
- **Sign-up / keys**: https://api.search.brave.com/ (subscription required; free tier available)
- **Docs**: https://api-dashboard.search.brave.com/app/documentation/web-search/response-headers
- **Auth guide**: https://api-dashboard.search.brave.com/documentation/guides/authentication
- **Endpoint**: `GET https://api.search.brave.com/res/v1/web/search`
- **Authentication**: `X-Subscription-Token: <YOUR_API_KEY>` header on every request.
- **Rate Limits**: Returned in response headers per subscription plan. Free tier is heavily limited; Pro plans provide higher RPM. Monitor `X-RateLimit-*` response headers.
- **Response Format** (JSON):
  ```json
  {
    "type": "search",
    "query": { "original": "...", "show_strict_warning": false },
    "web": {
      "type": "search",
      "results": [
        {
          "title": "Example Result",
          "url": "https://example.com",
          "description": "...",
          "is_source_local": false,
          "is_source_both": false
        }
      ]
    }
  }
  ```
- **Integration Pattern**:
  ```python
  async def brave_web_search(query: str, count: int = 10) -> list[dict]:
      resp = await http_client.get(
          "https://api.search.brave.com/res/v1/web/search",
          params={"q": query, "count": count},
          headers={
              "Accept": "application/json",
              "X-Subscription-Token": settings.BRAVE_API_KEY,
          },
      )
      resp.raise_for_status()
      data = resp.json()
      return data.get("web", {}).get("results", [])
  ```
- **Gotchas**:
  - Always send `Accept: application/json` — the API also supports `text/html`.
  - `count` parameter maximum is 20 per request; paginate with `offset` for more.
  - Rate limit 429s are silent failures for users — implement exponential backoff.
  - API key must never be exposed in client-side code — proxy through the FastAPI backend.

---

### LIB-16: Jina Reader API

- **Purpose**: URL-to-markdown conversion for web scraping. Prepend `https://r.jina.ai/` to any URL; the API fetches, renders, and returns clean markdown suitable for LLM input.
- **No SDK** — use `httpx.AsyncClient` directly.
- **Sign-up / keys**: https://jina.ai/reader/ (free tier available; API key for higher limits)
- **Docs**: https://docs.jina.ai/
- **GitHub**: https://github.com/jina-ai/reader
- **Endpoints**:
  - **Reader**: `GET https://r.jina.ai/{URL}` — fetches URL and returns LLM-friendly markdown.
  - **Search**: `GET https://s.jina.ai/?q={query}` — web search returning top 5 results with markdown content.
- **Authentication**: `Authorization: Bearer <YOUR_API_KEY>` header (optional for basic use, required for higher rate limits).
- **Rate Limits**: Tracked per IP (anonymous) or per API key (authenticated). Limits enforced by both RPM and TPM (tokens per minute).
- **Response Format** (JSON, with `Accept: application/json` header):
  ```json
  {
    "code": 200,
    "status": 20000,
    "data": {
      "title": "Page Title",
      "description": "Meta description",
      "url": "https://example.com",
      "content": "# Markdown content...",
      "images": { "Figure 1": "https://..." },
      "links": { "Link text": "https://..." },
      "usage": { "tokens": 1234 }
    }
  }
  ```
- **Integration Pattern**:
  ```python
  async def jina_read_url(url: str) -> str:
      resp = await http_client.get(
          f"https://r.jina.ai/{url}",
          headers={
              "Accept": "application/json",
              "Authorization": f"Bearer {settings.JINA_API_KEY}",
          },
      )
      resp.raise_for_status()
      return resp.json()["data"]["content"]

  async def jina_search(query: str) -> list[dict]:
      resp = await http_client.get(
          f"https://s.jina.ai/",
          params={"q": query},
          headers={
              "Accept": "application/json",
              "Authorization": f"Bearer {settings.JINA_API_KEY}",
          },
      )
      resp.raise_for_status()
      return resp.json()["data"]  # list of result objects
  ```
- **Gotchas**:
  - Without `Accept: application/json`, the API returns plain text markdown — add the header to get structured JSON with metadata.
  - Token usage is charged based on **content length** of the returned markdown, not the request — long pages are expensive.
  - JavaScript-heavy SPAs may not render fully — Jina uses a headless browser but complex apps may produce incomplete content.
  - The search endpoint returns at most 5 results per query.
  - Include the full URL including scheme in the Reader endpoint path: `https://r.jina.ai/https://example.com`.

---

## UI Components (shadcn/ui)

### LIB-17: shadcn/ui

- **Purpose**: Copy-paste React component primitives built on Radix UI + Tailwind CSS. Components are added to the project source (not installed as a black-box package) and can be customised freely.
- **Registry**: `@shadcn`
- **Docs**: https://ui.shadcn.com/docs
- **Install individual components**:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- **Install all key components for this project** (single command):
  ```bash
  npx shadcn@latest add @shadcn/dialog @shadcn/sheet @shadcn/tabs @shadcn/scroll-area @shadcn/progress @shadcn/badge @shadcn/card @shadcn/table @shadcn/separator @shadcn/command @shadcn/combobox
  ```

#### Key Components

| Component    | Add Command                            | Use In This Project                                              |
|--------------|----------------------------------------|------------------------------------------------------------------|
| `dialog`     | `npx shadcn@latest add dialog`         | Confirmation modals, deliverable previews, billing prompts       |
| `sheet`      | `npx shadcn@latest add sheet`          | Slide-over panel for run details, agent activity feed            |
| `tabs`       | `npx shadcn@latest add tabs`           | Deliverable type switcher, settings sections                     |
| `scroll-area`| `npx shadcn@latest add scroll-area`    | Long chat threads, deliverable list, log streams                 |
| `progress`   | `npx shadcn@latest add progress`       | Run completion %, subagent task progress bars                    |
| `badge`      | `npx shadcn@latest add badge`          | Run status chips (RUNNING / DONE / ERROR), tag labels            |
| `card`       | `npx shadcn@latest add card`           | Deliverable cards, pricing plan cards, agent task cards          |
| `table`      | `npx shadcn@latest add table`          | Data table deliverables, billing usage table, run history        |
| `separator`  | `npx shadcn@latest add separator`      | Visual dividers in sidebars, between card sections               |
| `command`    | `npx shadcn@latest add command`        | Command palette (Cmd+K), searchable dropdown base                |
| `combobox`   | `npx shadcn@latest add combobox`       | Searchable selects: agent model picker, template chooser         |

- **Key Pattern**:
  ```tsx
  // Sheet (slide-over) for run detail panel
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

  <Sheet open={isOpen} onOpenChange={setIsOpen}>
    <SheetContent side="right" className="w-[480px]">
      <SheetHeader>
        <SheetTitle>Run Details</SheetTitle>
      </SheetHeader>
      <RunDetailPanel runId={activeRunId} />
    </SheetContent>
  </Sheet>

  // Badge for run status
  import { Badge } from "@/components/ui/badge";
  <Badge variant={run.status === "error" ? "destructive" : "default"}>
    {run.status.toUpperCase()}
  </Badge>

  // Progress bar
  import { Progress } from "@/components/ui/progress";
  <Progress value={run.progress_pct} className="w-full" />
  ```
- **Gotchas**:
  - Components are copied into `src/components/ui/` — they are **your** code after `add`. Edit freely.
  - `combobox` is a **composite pattern** (not a standalone primitive) — it's built from `Popover` + `Command`. Running `npx shadcn@latest add combobox` installs both dependencies automatically.
  - Requires Tailwind CSS v3 and `tailwind-merge` / `clsx` (usually installed by `shadcn init`).
  - Dark mode variants are included by default via Tailwind `dark:` prefix — ensure `ThemeProvider` is in the app root.
  - The `table` component is a structural primitive only — for sortable/filterable tables, combine with `@tanstack/react-table`.

---

## GML Rendering Pipeline Libraries

### LIB-18: unified

- **Purpose**: Interface for processing text with syntax trees. Core of the rehype ecosystem. Creates a processor pipeline that parses input into a syntax tree, transforms it, and compiles it to output.
- **Install**: `npm install unified`
- **Version to target**: `>=11.0`
- **Docs**: https://unifiedjs.com/
- **BL Items**: BL-009 (ReportRenderer)
- **Key Patterns**:
  - `unified().use(rehypeParse).use(rehypeReact, options).process(html)` — full parse-to-React pipeline.
  - Plugins are composable: `.use(plugin, options)` — each plugin transforms the syntax tree.
  - `processSync(input)` — synchronous processing (suitable for React render path).
- **Code Example**:
  ```typescript
  import { unified } from "unified";
  import rehypeParse from "rehype-parse";
  import rehypeReact from "rehype-react";
  import { createElement } from "react";

  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeReact, {
      createElement,
      components: {
        "gml-chart": GmlChart,
        "gml-citation": GmlCitation,
      },
    });

  const result = processor.processSync(gmlHtmlString);
  // result.result is a React element tree
  ```
- **Note**: Core of the rehype ecosystem. Creates a processor pipeline. All three LIB-18/19/20 libraries work together.

---

### LIB-19: rehype-parse

- **Purpose**: Parse HTML strings into HAST (Hypertext Abstract Syntax Tree). Parses GML tag strings (which are valid HTML) into a tree for processing.
- **Install**: `npm install rehype-parse`
- **Version to target**: `>=9.0`
- **Docs**: https://github.com/rehypejs/rehype/tree/main/packages/rehype-parse
- **BL Items**: BL-009 (ReportRenderer)
- **Key Patterns**:
  - `.use(rehypeParse, { fragment: true })` — parse an HTML fragment (not a full document with `<html>/<body>` wrapper).
  - Without `{ fragment: true }`, the parser wraps input in `<html><head><body>` nodes.
- **Gotchas**:
  - Always use `{ fragment: true }` for GML content — GML tags are fragments, not full documents.
  - Self-closing tags like `<gml-chart />` are handled correctly in HTML5 parsing mode.

---

### LIB-20: rehype-react

- **Purpose**: Compile HAST into React elements. Allows mapping HTML tag names to React components. Key for rendering `<gml-chart>` as a `GmlChart` React component.
- **Install**: `npm install rehype-react`
- **Version to target**: `>=8.0`
- **Docs**: https://github.com/rehypejs/rehype-react
- **BL Items**: BL-009 (ReportRenderer)
- **Key Patterns**:
  - `components` option — map HTML element names to React components: `{ "gml-chart": GmlChart }`.
  - `createElement` — must pass React's `createElement` (or `jsx` from React 17+ JSX transform).
  - `Fragment` — optionally pass React's `Fragment` for wrapping.
- **Code Example**:
  ```typescript
  import rehypeReact from "rehype-react";
  import { createElement, Fragment } from "react";

  .use(rehypeReact, {
    createElement,
    Fragment,
    components: {
      "gml-chart": GmlChart,
      "gml-viewreport": GmlViewReport,
      "gml-viewwebsite": GmlViewWebsite,
      "gml-citation": GmlCitation,
    },
  })
  ```
- **Gotchas**:
  - Component names in the `components` map must be **lowercase** (HTML tag names are case-insensitive and normalised to lowercase by the parser).
  - Props are passed as HTML attributes (strings) — components must handle string-to-object conversion for complex props like chart data.
  - The `components` map must be a stable reference to avoid re-creating the processor on every render.

---

### LIB-21: react-plotly.js

- **Purpose**: React wrapper for Plotly.js charting library. Provides a declarative `<Plot>` component that manages Plotly lifecycle (init, update, resize, cleanup) within React's render cycle.
- **Install**: `npm install react-plotly.js plotly.js`
- **Version to target**: `>=2.6` (react-plotly.js), `>=2.35` (plotly.js)
- **Docs**: https://github.com/plotly/react-plotly.js
- **BL Items**: BL-009 (chart rendering)
- **Key Patterns**:
  - `<Plot data={traces} layout={layout} config={config} />` — declarative usage.
  - `useResizeHandler` prop — auto-resize on container change.
  - `onInitialized` / `onUpdate` callbacks — hook into Plotly lifecycle.
  - Partial bundle import to reduce size: `import Plotly from "plotly.js-basic-dist-min"; import createPlotlyComponent from "react-plotly.js/factory"; const Plot = createPlotlyComponent(Plotly);`
- **Code Example**:
  ```tsx
  import Plot from "react-plotly.js";

  function GmlChart({ data, layout, chartType }: GmlChartProps) {
    return (
      <Plot
        data={data}
        layout={{
          ...layout,
          autosize: true,
        }}
        config={{ responsive: true, displayModeBar: true }}
        useResizeHandler
        style={{ width: "100%", height: "400px" }}
      />
    );
  }

  // With partial bundle (smaller footprint)
  import Plotly from "plotly.js-basic-dist-min";
  import createPlotlyComponent from "react-plotly.js/factory";
  const Plot = createPlotlyComponent(Plotly);
  ```
- **Gotchas**:
  - Plotly.js full bundle is ~3MB. Use partial bundles if needed: `plotly.js-basic-dist-min` (~1MB) covers bar, scatter, pie but NOT candlestick. For candlestick, use `plotly.js-finance-dist-min` or the full bundle.
  - `react-plotly.js` re-renders on every prop change — memoize `data` and `layout` objects to avoid unnecessary Plotly redraws.
  - The `factory` import pattern (`react-plotly.js/factory`) is required for partial bundles — the default import assumes the full bundle.
  - TypeScript types: install `@types/react-plotly.js` for type definitions (may lag behind the latest release).

---

*Document generated 2026-02-18, updated 2026-02-19. Re-run research when targeting new major versions.*
