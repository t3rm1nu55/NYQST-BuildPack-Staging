# BACKEND CODE PATTERNS — Reusable Catalog

**Source**: Design reconstruction extracts (2026-02-20)
**Target platform**: Python/FastAPI + LangGraph + SQLAlchemy 2.0 async
**Confidence**: HIGH on schemas/payloads; MEDIUM on LangGraph node internals

---

## 1. PYDANTIC SCHEMAS

### 1.1 Planning Hierarchy

#### PlanSet (Root Execution Context)
```python
from typing import Dict, Optional, List, Annotated
from enum import Enum
import operator
from pydantic import BaseModel, Field

class Status(str, Enum):
    LOADING = "loading"
    SUCCESS = "success"
    ERROR = "error"

class Source(BaseModel):
    source_id: str
    url: str
    title: str
    provider: str  # "brave" | "firecrawl" | "factset" | ...
    retrieved_at: Optional[str] = None

class PlanSet(BaseModel):
    chat_id: str
    creator_user_id: str
    user_chat_message_id: str
    workspace_id: str
    plans: Dict[str, 'Plan']  # plan_id -> Plan

    class Config:
        validate_assignment = True
```

#### Plan (Phase / Orchestration Unit)
```python
class Plan(BaseModel):
    id: str                                   # plan_id
    plan_set_id: str
    title: Optional[str] = None
    summary: Optional[str] = None
    plan_tasks: Dict[str, 'PlanTask']         # task_id -> PlanTask
    previous_plan_id: Optional[str] = None    # LinkedList chain
    status: Status
    used_sources: Optional[List[str]] = None
    iteration_number: Optional[int] = None

    class Config:
        extra = "allow"
```

#### PlanTask (Atomic Unit of Parallel Work)
```python
class PlanTask(BaseModel):
    id: str                                      # plan_task_id
    plan_id: str
    title: str
    message: str                                 # Task description/prompt
    previous_task_id: Optional[str] = None
    status: Status

    # Execution telemetry
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    duration_ms: Optional[int] = None

    # Results
    notes: Optional[str] = None
    sources: List[Source] = []
    entities: List[str] = []

    class Config:
        extra = "allow"
```

#### DataBrief (Shared State Across Generators)
```python
class DataBrief(BaseModel):
    """
    Unified data context passed to all downstream generators.
    Created by synthesis_node, consumed by report/website/slides generators.
    """
    # Research findings
    financial_data: Dict[str, Any] = {}
    market_data: Dict[str, Any] = {}
    company_metadata: Dict[str, Any] = {}

    # Strategic analysis
    swot_summary: Optional[str] = None
    risk_factors: List[str] = []
    growth_opportunities: List[str] = []

    # Research metadata
    primary_sources: List['Entity'] = []
    all_sources: List['Entity'] = []
    data_gaps: List[str] = []

    collected_at: str   # ISO timestamp

    class Config:
        extra = "allow"   # Extensible for domain-specific fields
```

---

### 1.2 RunEvent Enum + Event Payloads

#### RunEventType (Complete 22-type Enum)
```python
from enum import Enum

class RunEventType(str, Enum):
    # Lifecycle
    STREAM_START = "stream_start"
    HEARTBEAT = "heartbeat"
    DONE = "done"
    ERROR = "ERROR"

    # Planning
    TASK_UPDATE = "task_update"
    PENDING_SOURCES = "pending_sources"

    # Execution
    NODE_TOOLS_EXECUTION_START = "node_tools_execution_start"
    NODE_TOOL_EVENT = "node_tool_event"
    UPDATE_SUBAGENT_CURRENT_ACTION = "update_subagent_current_action"

    # Messaging
    MESSAGE_DELTA = "message_delta"
    AI_MESSAGE = "ai_message"
    MESSAGE_IS_ANSWER = "message_is_answer"
    CHAT_TITLE_GENERATED = "chat_title_generated"

    # Deliverables (report streaming)
    NODE_REPORT_PREVIEW_START = "node_report_preview_start"
    NODE_REPORT_PREVIEW_DELTA = "node_report_preview_delta"
    NODE_REPORT_PREVIEW_DONE = "node_report_preview_done"

    # Citations
    REFERENCES_FOUND = "references_found"

    # Human-in-loop (browser)
    BROWSER_USE_START = "browser_use_start"
    BROWSER_USE_AWAIT_USER_INPUT = "browser_use_await_user_input"
    BROWSER_USE_STOP = "browser_use_stop"

    # Clarification
    CLARIFICATION_NEEDED = "clarification_needed"
    UPDATE_MESSAGE_CLARIFICATION_MESSAGE = "update_message_clarification_message"

    # NYQST proposed extensions
    PING = "ping"
    USAGE_UPDATE = "usage-update"
    MESSAGE_FILE = "message-file"
```

#### Lifecycle Payloads
```python
from pydantic import BaseModel, Field
from typing import Literal, Optional, Any

class StreamStart(BaseModel):
    type: Literal["stream_start"]
    chat_id: str
    creator_user_id: str
    user_chat_message_id: str
    workspace_id: str

class Heartbeat(BaseModel):
    type: Literal["heartbeat"]

class DoneEvent(BaseModel):
    type: Literal["done"]
    has_async_entities_pending: Optional[bool] = None
    message: Optional[dict] = None   # Full Message object if present

class StreamError(BaseModel):
    type: Literal["ERROR"]
    error_type: str
    error_message: str
```

#### Planning Payloads
```python
class TaskUpdate(BaseModel):
    type: Literal["task_update"]
    key: str
    title: str
    message: str
    status: Literal["loading", "success", "error"]
    plan_set: PlanSet
    metadata: Optional[Dict[str, Any]] = None
    timestamp: int   # epoch ms

class PendingSource(BaseModel):
    plan_id: str
    plan_set_id: str
    plan_task_id: str
    title: str
    type: Literal["WEB", "DOCUMENT", "CODING_AGENT"]
    web_domain: Optional[str] = None

class PendingSources(BaseModel):
    type: Literal["pending_sources"]
    pending_sources: List[PendingSource]
```

#### Tool Execution Payloads
```python
class NodeToolsExecutionStart(BaseModel):
    type: Literal["node_tools_execution_start"]
    node_id: str
    plan_id: str
    plan_set_id: str
    tool_ids: List[str]
    total_tools: int
    timestamp: int   # Unix milliseconds

class NodeToolEvent(BaseModel):
    type: Literal["node_tool_event"]
    event: str   # "tool_call_started" | "tool_call_completed" | "fallback_used" | "all_tools_failed"
    node_id: str
    plan_id: str
    plan_set_id: str
    tool_id: Optional[str] = None
    tool_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: int

class UpdateSubagentCurrentAction(BaseModel):
    type: Literal["update_subagent_current_action"]
    current_action: str   # "Searching the web...", "Analyzing results..."
    node_id: str
    plan_id: str
    plan_set_id: str
    tool_id: Optional[str] = None
    timestamp: int
```

#### Report Preview Payloads
```python
class NodeReportPreviewStart(BaseModel):
    type: Literal["node_report_preview_start"]
    preview_id: str
    report_title: str
    report_user_query: str
    final_report: bool   # True = final synthesis; False = intermediate
    node_id: str
    plan_id: str
    plan_set_id: str
    entity: 'Entity'   # GENERATED_REPORT type
    section_id: Optional[str] = None
    tool_id: Optional[str] = None
    timestamp: int
    workspace_id: str

class NodeReportPreviewDelta(BaseModel):
    type: Literal["node_report_preview_delta"]
    preview_id: str
    delta: str   # incremental GML content (stream this to client)
    node_id: str
    plan_id: str
    plan_set_id: str
    section_id: Optional[str] = None

class NodeReportPreviewDone(BaseModel):
    type: Literal["node_report_preview_done"]
    preview_id: str
    content: str   # full GML content (XML-like with gml-* tags)
    report_title: str
    final_report: bool
    node_id: str
    plan_id: str
    plan_set_id: str
    entity: Optional['Entity'] = None
    section_id: Optional[str] = None
    tool_id: Optional[str] = None
    timestamp: int
    workspace_id: str
```

#### Entity & Reference Payloads
```python
class Entity(BaseModel):
    """Discriminated union on entity_type"""
    entity_type: Literal[
        "WEB_PAGE", "EXTERNAL_API_DATA", "GENERATED_CONTENT",
        "USER_QUERY_PART", "GENERATED_REPORT", "GENERATED_PRESENTATION",
        "INTRA_ENTITY_SEARCH_RESULT", "EXTRACTED_ENTITY", "SEARCH_PLAN",
        "KNOWLEDGE_BASE", "WEBSITE", "GENERATED_DOCUMENT"
    ]
    identifier: str
    title: Optional[str] = None
    description: Optional[str] = None
    file_name: str
    mimetype: str
    workspace_id: str
    stored_entity_id: Optional[str] = None
    content_artifact_id: Optional[str] = None
    content_length: Optional[int] = None
    created_at: Optional[str] = None
    purpose: Optional[str] = None

    # Type-specific fields
    external_url: Optional[str] = None
    api_name: Optional[str] = None
    api_subtype: Optional[str] = None
    user_query: Optional[str] = None
    all_seen_entities: List[str] = Field(default_factory=list)
    cited_entities: List[str] = Field(default_factory=list)

class ReferencesFound(BaseModel):
    type: Literal["references_found"]
    references: List[Entity]
```

#### Message Schema (26 fields)
```python
class Message(BaseModel):
    id: str
    chat_id: str
    creator_type: Literal["AI", "USER"]
    creator_user_id: Optional[str] = None      # null for AI messages
    message_type: Optional[Literal["normal", "super_report"]] = None
    deliverable_type: Optional[Literal["WEBSITE", "REPORT", "DOCUMENT", "SLIDE", "CODE"]] = None
    is_answer: bool
    is_running: Optional[bool] = None
    needs_clarification_message: Optional[str] = None
    retry_attempts: Optional[int] = None
    content: str                                # raw (often empty)
    hydrated_content: Optional[str] = None     # rendered HTML with gml-* components
    user_content_artifact_id: Optional[str] = None
    user_message_entity_ids: Optional[List[str]] = None
    user_message_entities: Optional[List[Entity]] = None
    ai_output_id: Optional[str] = None
    first_report_identifier: Optional[str] = None   # UUID of primary deliverable
    entities: List[Entity] = Field(default_factory=list)
    event_stream_artifact_id: Optional[str] = None  # pointer to SSE log
    error_type: Optional[Literal["TIMEOUT", "INVALID_RESPONSE"]] = None
    created_at: str   # ISO 8601
```

#### Browser Automation Payloads
```python
class BrowserUseStart(BaseModel):
    type: Literal["browser_use_start"]
    browser_session_id: str
    browser_stream_url: str
    timestamp: int

class BrowserUseStop(BaseModel):
    type: Literal["browser_use_stop"]
    browser_session_id: str

class BrowserUseAwaitUserInput(BaseModel):
    type: Literal["browser_use_await_user_input"]
    browser_session_id: str
    agent_message: Optional[str] = None
```

#### NYQST Proposed New Events
```python
class PingEvent(BaseModel):
    type: Literal["ping"]
    timestamp: str   # ISO 8601

class ErrorEvent(BaseModel):
    type: Literal["error"]
    code: Literal[
        "rate_limit_exceeded", "tool_execution_failed", "llm_request_failed",
        "validation_error", "context_length_exceeded", "unknown_error"
    ]
    message: str
    recoverable: bool
    context: Optional[Dict[str, Any]] = None

class UsageUpdateEvent(BaseModel):
    type: Literal["usage-update"]
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost_cents: Optional[int] = None   # cost in cents
```

---

## 2. SQLALCHEMY MODEL PATTERNS

### 2.1 Artifact Extension (Migration 0005a)
```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB

class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"

    # Existing fields (content-addressed key)
    sha256: Mapped[str] = mapped_column(String(64), primary_key=True)
    media_type: Mapped[str] = mapped_column(String(255))
    size_bytes: Mapped[int] = mapped_column(Integer)
    filename: Mapped[str | None] = mapped_column(String(500), nullable=True)
    storage_uri: Mapped[str] = mapped_column(Text)
    storage_class: Mapped[str] = mapped_column(String(50), default="STANDARD")
    created_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    reference_count: Mapped[int] = mapped_column(Integer, default=0)

    # NEW (Migration 0005a): Entity typing for Superagent parity
    entity_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    # Values: 'WEB_SOURCE' | 'API_DATA' | 'GENERATED_CONTENT' | 'USER_INPUT' |
    #         'REPORT' | 'SLIDES' | 'SEARCH_RESULT' | 'EXTRACTED_DATA' |
    #         'PLAN' | 'KNOWLEDGE' | 'WEBSITE' | 'DOCUMENT'

    entity_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # Example for WEB_SOURCE: {"provider": "brave", "external_url": "...", "retrieved_at": "..."}
    # Example for REPORT: {"report_subtype": "final_report", "word_count": 3500}
    # Example for WEBSITE: {"deployment_status": "complete", "deployed_url": "..."}
```

### 2.2 Billing Tables (Migration 0005b)

#### Subscription Model
```python
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship

class Subscription(Base):
    """Billing subscription for a tenant/workspace. Maps to Stripe customer + subscription."""
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True)          # UUID
    tenant_id = Column(String(36), ForeignKey("tenant.id"), index=True)

    # Stripe identifiers
    stripe_customer_id = Column(String(255), unique=True, index=True)
    stripe_subscription_id = Column(String(255), unique=True, nullable=True)

    # Plan
    plan_name = Column(String(50), default="sandbox")  # sandbox | professional | team
    billing_interval = Column(Enum("month", "year"), default="month")

    # Status lifecycle
    status = Column(
        Enum("active", "canceled", "past_due", "incomplete", "unpaid"),
        default="active"
    )

    # Entitlements (denormalized from Stripe for fast quota checks)
    monthly_runs_limit = Column(Integer, default=10)   # 10 sandbox, 200 professional
    is_trial = Column(Boolean, default=True)
    trial_ends_at = Column(DateTime, nullable=True)

    # Dates
    started_at = Column(DateTime, default=datetime.utcnow)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="subscription")
    usage_records = relationship("UsageRecord", back_populates="subscription", cascade="all, delete-orphan")
```

#### UsageRecord Model
```python
from sqlalchemy.dialects.postgresql import JSONB

class UsageRecord(Base):
    """Per-run usage tracking. One record per AI generation message."""
    __tablename__ = "usage_records"

    id = Column(String(36), primary_key=True)          # UUID

    # Foreign keys
    subscription_id = Column(String(36), ForeignKey("subscriptions.id"), index=True)
    tenant_id = Column(String(36), ForeignKey("tenant.id"), index=True)
    run_id = Column(String(36), ForeignKey("runs.id"), index=True, nullable=True)
    message_id = Column(String(36), nullable=True)

    # Usage metrics
    feature_name = Column(String(100), default="research_run")   # research_run | report_generation
    quantity = Column(Integer, default=1)

    # Cost tracking (via LangGraph state + Langfuse)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    cost_cents = Column(Integer, default=0)   # ALWAYS integer cents, never float

    # Billing lifecycle
    status = Column(Enum("pending", "billed", "refunded"), default="pending")
    billing_event_id = Column(String(255), nullable=True)   # Stripe invoice line item

    # Audit
    metadata = Column(JSONB, default={})
    # {"run_type": "website", "model": "gpt-4o-mini", "deliverable_type": "REPORT"}

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    subscription = relationship("Subscription", back_populates="usage_records")
    run = relationship("Run", back_populates="usage_records")
    tenant = relationship("Tenant")
```

### 2.3 Manifest + Pointer Models (Already Complete — Reference Only)
```python
class Manifest(Base, TimestampMixin):
    __tablename__ = "manifests"
    sha256: str         # PK (SHA-256 of tree JSON)
    tree: dict          # JSONB — path -> {sha256, media_type, entity_type, size_bytes}
    parent_sha256: str | None
    entry_count: int
    total_size_bytes: int
    created_by: UUID | None
    message: str | None
    # Timestamps from mixin

class Pointer(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "pointers"
    id: UUID            # PK
    namespace: str      # "default" or custom
    name: str           # "conversation-{id}/latest-report"
    manifest_sha256: str | None   # FK → manifests
    pointer_type: str   # "bundle" | "corpus" | "snapshot"
    description: str | None
    meta: dict          # JSONB — deliverable_type, user_query, run_id, first_report_identifier
    created_by: UUID | None
    # Timestamps from mixin
```

---

## 3. LANGGRAPH PATTERNS

### 3.1 Graph State Definition
```python
from typing import TypedDict, Annotated, Optional, List
import operator
from langgraph.graph import StateGraph, START, END

class ResearchState(TypedDict):
    # Core
    query: str
    workspace_id: str
    tenant_id: str
    run_id: str

    # Planning
    plan_set: Optional[PlanSet]

    # Parallel task results (reducer: append, not replace)
    task_results: Annotated[List['TaskResult'], operator.add]

    # Synthesis
    data_brief: Optional[DataBrief]

    # Billing budget (DEC-045: $2/run hard limit)
    cost_cents_spent: Annotated[int, operator.add]   # accumulated by each node
    budget_exceeded: bool
```

### 3.2 Fan-Out Dispatch (Send Pattern — Critical Gap in Current Platform)
```python
from langgraph.types import Send

def planner_node(state: ResearchState) -> dict:
    """Generate PlanSet with LLM structured output."""
    plan_set = llm.with_structured_output(PlanSet).invoke(
        f"Plan research for: {state['query']}"
    )
    emit_event(TaskUpdate(
        type="task_update",
        key="planning",
        title="Devising Initial Research Strategy",
        message="Planning research tasks...",
        status="loading",
        plan_set=plan_set,
        timestamp=int(time.time() * 1000),
    ))
    return {"plan_set": plan_set}


def dispatch_node(state: ResearchState) -> list:
    """Fan-out: create parallel research tasks via Send()."""
    plan_set = state["plan_set"]
    all_tasks = [
        task
        for plan in plan_set.plans.values()
        for task in plan.plan_tasks.values()
    ]

    emit_event(NodeToolsExecutionStart(
        type="node_tools_execution_start",
        node_id="dispatch",
        plan_id=list(plan_set.plans.keys())[0],
        plan_set_id=plan_set.chat_id,
        tool_ids=[t.id for t in all_tasks],
        total_tools=len(all_tasks),
        timestamp=int(time.time() * 1000),
    ))

    # CRITICAL: Send() returns immediately — orchestrator executes all in parallel
    return [
        Send("research_executor", {"task": task, "plan_set": plan_set})
        for task in all_tasks
    ]


def research_executor(state: dict) -> dict:
    """Execute a single research task (fan-out worker)."""
    task: PlanTask = state["task"]
    plan_set: PlanSet = state["plan_set"]

    emit_event(UpdateSubagentCurrentAction(
        type="update_subagent_current_action",
        current_action=f"Starting: {task.title}",
        node_id=task.id,
        plan_id=task.plan_id,
        plan_set_id=plan_set.chat_id,
        timestamp=int(time.time() * 1000),
    ))

    results = []
    for tool in determine_tools_for_task(task):
        emit_event(NodeToolEvent(
            type="node_tool_event",
            event="tool_call_started",
            node_id=task.id,
            plan_id=task.plan_id,
            plan_set_id=plan_set.chat_id,
            tool_id=tool.id,
            timestamp=int(time.time() * 1000),
        ))
        result = tool.run(task.message)
        emit_event(NodeToolEvent(
            type="node_tool_event",
            event="tool_call_completed",
            node_id=task.id,
            plan_id=task.plan_id,
            plan_set_id=plan_set.chat_id,
            tool_id=tool.id,
            metadata={"result_preview": str(result)[:200]},
            timestamp=int(time.time() * 1000),
        ))
        results.append(result)

    # Synthesize notes
    emit_event(UpdateSubagentCurrentAction(
        type="update_subagent_current_action",
        current_action=f"Creating notes from {len(results)} sources",
        node_id=task.id,
        plan_id=task.plan_id,
        plan_set_id=plan_set.chat_id,
        timestamp=int(time.time() * 1000),
    ))
    notes = llm.invoke(f"Synthesize: {results}")
    task.notes = notes
    task.status = Status.SUCCESS

    return {"task_results": [TaskResult(task=task, results=results)]}


# Graph wiring
builder = StateGraph(ResearchState)
builder.add_node("planner", planner_node)
builder.add_node("dispatch", dispatch_node)
builder.add_node("research_executor", research_executor)
builder.add_node("fan_in", fan_in_aggregation_node)
builder.add_node("synthesize", synthesis_node)
builder.add_node("report_generator", report_generator_node)

builder.add_edge(START, "planner")
builder.add_edge("planner", "dispatch")
builder.add_conditional_edges("dispatch", lambda s: s)  # Returns list of Send()
builder.add_edge("research_executor", "fan_in")
builder.add_edge("fan_in", "synthesize")
builder.add_edge("synthesize", "report_generator")
builder.add_edge("report_generator", END)
```

### 3.3 Structured Output Pattern (DEC-050)
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# Pattern: always use with_structured_output for JSON-generating nodes
plan_set = llm.with_structured_output(PlanSet).invoke(prompt)
data_brief = llm.with_structured_output(DataBrief).invoke(prompt)

# For streaming text nodes, stream directly
async for chunk in llm.astream(prompt):
    delta = chunk.content
    await emit_event(NodeReportPreviewDelta(
        type="node_report_preview_delta",
        preview_id=preview_id,
        delta=delta,
        node_id=node_id,
        plan_id=plan_id,
        plan_set_id=plan_set_id,
    ))
```

### 3.4 Per-Node Async Session Pattern (DEC-051)
```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

# Shared factory created at startup
async_session_factory: async_sessionmaker[AsyncSession]

async def research_executor(state: dict) -> dict:
    """Each node gets its own session from the shared factory."""
    async with async_session_factory() as session:
        async with session.begin():
            # DB operations scoped to this node only
            usage = UsageRecord(
                subscription_id=state["subscription_id"],
                tenant_id=state["tenant_id"],
                run_id=state["run_id"],
                feature_name="research_run",
                quantity=1,
            )
            session.add(usage)
        # Session auto-committed and closed on exit
    return {"task_results": [...]}
```

---

## 4. SERVICE LAYER PATTERNS

### 4.1 Append-Event Atomic Pattern (SSE via PG LISTEN/NOTIFY)
```python
import asyncpg
import json
import asyncio

async def emit_run_event(
    pool: asyncpg.Pool,
    run_id: str,
    event: BaseModel,
) -> None:
    """
    Atomically append run event to DB and NOTIFY SSE listeners.
    PG NOTIFY is transactional — only fires if commit succeeds.
    """
    payload = event.model_dump_json()
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Persist event
            await conn.execute(
                """
                INSERT INTO run_events (run_id, event_type, payload, created_at)
                VALUES ($1, $2, $3::jsonb, NOW())
                """,
                run_id, event.type, payload
            )
            # NOTIFY: triggers SSE delivery to all listeners on this channel
            await conn.execute(
                "SELECT pg_notify($1, $2)",
                f"run:{run_id}", payload
            )
```

### 4.2 Billing Service Pattern
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

class BillingService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def check_quota(self, tenant_id: str) -> bool:
        """Returns True if tenant can create a new run."""
        sub_result = await self.session.execute(
            select(Subscription)
            .where(Subscription.tenant_id == tenant_id)
            .where(Subscription.status == "active")
        )
        subscription = sub_result.scalar_one_or_none()
        if not subscription:
            return False

        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        usage_result = await self.session.execute(
            select(func.count(UsageRecord.id))
            .where(UsageRecord.subscription_id == subscription.id)
            .where(UsageRecord.created_at >= month_start)
        )
        used_runs = usage_result.scalar() or 0
        return used_runs < subscription.monthly_runs_limit

    async def record_run_start(
        self, tenant_id: str, run_id: str, feature: str = "research_run"
    ) -> UsageRecord:
        """Create pending usage record at run start."""
        sub_result = await self.session.execute(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        )
        subscription = sub_result.scalar_one()

        record = UsageRecord(
            id=str(uuid4()),
            subscription_id=subscription.id,
            tenant_id=tenant_id,
            run_id=run_id,
            feature_name=feature,
            quantity=1,
            status="pending",
        )
        self.session.add(record)
        await self.session.commit()
        return record

    async def finalize_run(
        self,
        usage_record_id: str,
        input_tokens: int,
        output_tokens: int,
        cost_cents: int,
    ) -> None:
        """Update usage record with final cost data."""
        result = await self.session.execute(
            select(UsageRecord).where(UsageRecord.id == usage_record_id)
        )
        record = result.scalar_one()
        record.input_tokens = input_tokens
        record.output_tokens = output_tokens
        record.total_tokens = input_tokens + output_tokens
        record.cost_cents = cost_cents
        await self.session.commit()

    async def generate_monthly_invoice(
        self, tenant_id: str, month: datetime
    ) -> dict:
        """Calculate overage for monthly billing."""
        sub_result = await self.session.execute(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        )
        subscription = sub_result.scalar_one()

        month_start = datetime(month.year, month.month, 1)
        month_end = datetime(month.year, month.month + 1, 1) if month.month < 12 else datetime(month.year + 1, 1, 1)

        records_result = await self.session.execute(
            select(UsageRecord)
            .where(UsageRecord.subscription_id == subscription.id)
            .where(UsageRecord.created_at >= month_start)
            .where(UsageRecord.created_at < month_end)
            .where(UsageRecord.status == "pending")
        )
        records = records_result.scalars().all()

        total_runs = len(records)
        overage_runs = max(0, total_runs - subscription.monthly_runs_limit)
        overage_charge_cents = overage_runs * 50   # $0.50/run = 50 cents

        # Mark as billed
        for record in records:
            record.status = "billed"
        await self.session.commit()

        return {
            "total_runs": total_runs,
            "included_runs": subscription.monthly_runs_limit,
            "overage_runs": overage_runs,
            "overage_charge_cents": overage_charge_cents,
        }
```

### 4.3 Entity Service Pattern
```python
import hashlib
import json
from uuid import uuid4

class EntityService:
    def __init__(self, session: AsyncSession, storage_backend):
        self.session = session
        self.storage = storage_backend

    async def store_entity(
        self,
        content: bytes | str,
        media_type: str,
        entity_type: str,
        entity_metadata: dict,
        created_by: str | None = None,
    ) -> Artifact:
        """
        Store content-addressed artifact with entity typing.
        Idempotent: same content always produces same sha256.
        """
        if isinstance(content, str):
            content = content.encode("utf-8")

        sha256 = hashlib.sha256(content).hexdigest()
        size_bytes = len(content)

        # Check if already exists (idempotent)
        existing = await self.session.get(Artifact, sha256)
        if existing:
            existing.reference_count += 1
            await self.session.commit()
            return existing

        # Upload to storage
        storage_uri = await self.storage.put(sha256, content, media_type)

        artifact = Artifact(
            sha256=sha256,
            media_type=media_type,
            size_bytes=size_bytes,
            storage_uri=storage_uri,
            entity_type=entity_type,
            entity_metadata=entity_metadata,
            created_by=created_by,
            reference_count=1,
        )
        self.session.add(artifact)
        await self.session.commit()
        return artifact
```

---

## 5. API ROUTE PATTERNS

### 5.1 SSE Streaming Route
```python
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import asyncpg
import json
import asyncio

router = APIRouter()

@router.post("/api/v1/runs/{run_id}/stream")
async def stream_run_events(
    run_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    pool: asyncpg.Pool = Depends(get_pg_pool),
    current_user = Depends(get_current_user),
):
    """
    SSE endpoint: streams RunEvents for a given run.
    Uses PG LISTEN/NOTIFY — production-ready (existing platform pattern).
    """
    async def event_generator():
        # 1. Replay past events from DB
        past_events = await get_run_events_from_db(run_id, db)
        for event in past_events:
            yield f"data: {json.dumps(event)}\n\n"

        # 2. Subscribe to live NOTIFY channel
        async with pool.acquire() as conn:
            channel = f"run:{run_id}"
            queue: asyncio.Queue = asyncio.Queue()

            async def handle_notify(conn, pid, channel, payload):
                await queue.put(payload)

            await conn.add_listener(channel, handle_notify)
            try:
                while True:
                    if await request.is_disconnected():
                        break
                    try:
                        payload = await asyncio.wait_for(queue.get(), timeout=25.0)
                        yield f"data: {payload}\n\n"
                        # Check for terminal event
                        event_data = json.loads(payload)
                        if event_data.get("type") in ("done", "ERROR"):
                            break
                    except asyncio.TimeoutError:
                        # Heartbeat
                        yield 'data: {"type":"heartbeat"}\n\n'
            finally:
                await conn.remove_listener(channel, handle_notify)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # Disable nginx buffering
        },
    )
```

### 5.2 Stripe Webhook Route (Raw Body Pattern)
```python
from fastapi import APIRouter, Request, HTTPException
from stripe import Webhook, SignatureVerificationError, StripeClient
import os

billing_router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
stripe_client = StripeClient(api_key=os.getenv("STRIPE_API_KEY"))

@billing_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    CRITICAL: Must read RAW body for Stripe signature verification.
    FastAPI's request.body() gives raw bytes before JSON parsing.
    """
    payload = await request.body()   # raw bytes, not parsed JSON
    sig_header = request.headers.get("Stripe-Signature", "")

    try:
        event = Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Bad signature: {str(e)}")

    match event.type:
        case "customer.subscription.updated":
            await handle_subscription_updated(event["data"]["object"], db)
        case "customer.subscription.deleted":
            await handle_subscription_canceled(event["data"]["object"], db)
        case "invoice.payment_failed":
            await handle_payment_failed(event["data"]["object"], db)
        case "invoice.paid":
            await handle_invoice_paid(event["data"]["object"], db)

    return {"status": "received"}


async def handle_subscription_updated(sub_data: dict, db: AsyncSession):
    stripe_sub_id = sub_data["id"]
    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub_id)
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        # Fallback: lookup by customer ID (race condition guard)
        result = await db.execute(
            select(Subscription).where(
                Subscription.stripe_customer_id == sub_data["customer"]
            )
        )
        subscription = result.scalar_one()

    subscription.status = sub_data["status"]
    subscription.current_period_start = datetime.fromtimestamp(sub_data["current_period_start"])
    subscription.current_period_end = datetime.fromtimestamp(sub_data["current_period_end"])

    meta = sub_data.get("metadata", {})
    subscription.plan_name = meta.get("plan_name", "sandbox")
    subscription.monthly_runs_limit = int(meta.get("monthly_runs_limit", 10))

    if "trial_end" in sub_data and sub_data["trial_end"]:
        subscription.trial_ends_at = datetime.fromtimestamp(sub_data["trial_end"])

    await db.commit()
```

### 5.3 Quota Middleware
```python
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class QuotaMiddleware(BaseHTTPMiddleware):
    """
    Check quota before allowing run creation.
    Applied to POST /api/v1/runs only.
    """
    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and request.url.path.endswith("/runs"):
            tenant_id = request.state.tenant_id   # set by auth middleware
            async with async_session_factory() as session:
                billing = BillingService(session)
                if not await billing.check_quota(tenant_id):
                    raise HTTPException(
                        status_code=402,
                        detail={
                            "code": "quota_exceeded",
                            "message": "Monthly run limit reached. Upgrade your plan or wait for reset.",
                        }
                    )
        return await call_next(request)
```

### 5.4 Dual-Mode Authentication (JWT + API Key)
```python
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, APIKeyHeader
import jwt

bearer_scheme = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_current_user(
    bearer_token = Security(bearer_scheme),
    api_key: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db),
):
    """
    Dual-mode auth: JWT (interactive users) or API key (programmatic access).
    JWT is validated locally; API key is looked up in DB.
    """
    if bearer_token:
        try:
            payload = jwt.decode(
                bearer_token.credentials,
                settings.JWT_SECRET,
                algorithms=["HS256"],
            )
            return UserContext(
                user_id=payload["sub"],
                tenant_id=payload["tenant_id"],
                auth_method="jwt",
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    if api_key:
        result = await db.execute(
            select(APIKey)
            .where(APIKey.key_hash == hashlib.sha256(api_key.encode()).hexdigest())
            .where(APIKey.is_active == True)
        )
        key_record = result.scalar_one_or_none()
        if not key_record:
            raise HTTPException(status_code=401, detail="Invalid API key")
        return UserContext(
            user_id=str(key_record.user_id),
            tenant_id=str(key_record.tenant_id),
            auth_method="api_key",
        )

    raise HTTPException(status_code=401, detail="Authentication required")
```

---

## 6. KEY CONSTRAINTS AND GOTCHAS

| Area | Constraint | Source |
|---|---|---|
| Stripe webhooks | Raw body required for signature verification — NEVER parse JSON first | LIB-08 |
| Cost tracking | Store as integer cents, never float | DB-005 |
| Billing unit | 1 run = 1 AI generation message (not tokens, not chat) | DEC-025 |
| Budget limit | $2/run hard limit via LangGraph state accumulator | DEC-045 |
| Send() fan-out | Returns list of Send() objects, NOT results — orchestrator queues them | LangGraph docs |
| Per-node sessions | Each node gets its own session from `async_sessionmaker`, never share | DEC-051 |
| Structured output | All JSON-generating nodes use `llm.with_structured_output(Schema)` | DEC-050 |
| Migration order | 0005a (artifact entity_type) BEFORE 0005b (billing tables) | DEC-052 |
| Quota check | Always check before creating run, not after | BL-013 |
| Entity dedup | Same content → same sha256 → same artifact (idempotent store) | Kernel design |
