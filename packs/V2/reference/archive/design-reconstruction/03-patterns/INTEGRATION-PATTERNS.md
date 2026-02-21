# INTEGRATION PATTERNS — Reusable Catalog

**Source**: Design reconstruction extracts (2026-02-20)
**Purpose**: End-to-end flow patterns connecting backend, frontend, and infrastructure
**Read alongside**: BACKEND-PATTERNS.md (schemas/services) and FRONTEND-PATTERNS.md (components/stores)

---

## 1. EVENT CONTRACT (End-to-End)

### 1.1 Full Event Chain: RunEventType → Pydantic → TypeScript → SSE → Frontend Handler

```
RunEventType enum (backend)
  ↓  emitted by LangGraph node
Pydantic BaseModel (payload)
  ↓  .model_dump_json()
PG NOTIFY payload (raw JSON string)
  ↓  pg_notify("run:{id}", payload)
SSE data frame: "data: {json}\n\n"
  ↓  EventSource.onmessage
TypeScript RunEvent union type (frontend)
  ↓  switch(event.type)
Zustand store update → React re-render
```

### 1.2 TypeScript RunEvent Union Type (Frontend Mirror of Pydantic Schemas)

```typescript
// ui/src/types/run-events.ts

export type PlanSet = {
  chat_id: string;
  creator_user_id: string;
  user_chat_message_id: string;
  workspace_id: string;
  plans: Record<string, Plan>;
};

export type Plan = {
  id: string;
  plan_set_id: string;
  title?: string;
  summary?: string;
  status: 'loading' | 'success' | 'error';
  plan_tasks: Record<string, PlanTask>;
  previous_plan_id?: string;
  used_sources?: string[];
};

export type PlanTask = {
  id: string;
  plan_id: string;
  title: string;
  message: string;
  status: 'loading' | 'success' | 'error';
  previous_task_id?: string;
  start_time?: number;
  end_time?: number;
  duration_ms?: number;
  notes?: string;
  sources: Source[];
  entities: string[];
};

export type Entity = {
  entity_type: EntityType;
  identifier: string;
  title?: string;
  file_name: string;
  mimetype: string;
  workspace_id: string;
  stored_entity_id?: string;
  content_artifact_id?: string;
  external_url?: string;
  api_subtype?: string;
  user_query?: string;
  all_seen_entities: string[];
  cited_entities: string[];
  created_at?: string;
};

export type EntityType =
  | 'WEB_PAGE' | 'EXTERNAL_API_DATA' | 'GENERATED_CONTENT'
  | 'USER_QUERY_PART' | 'GENERATED_REPORT' | 'GENERATED_PRESENTATION'
  | 'INTRA_ENTITY_SEARCH_RESULT' | 'EXTRACTED_ENTITY' | 'SEARCH_PLAN'
  | 'KNOWLEDGE_BASE' | 'WEBSITE' | 'GENERATED_DOCUMENT';

// Discriminated union on "type" field
export type RunEvent =
  | { type: 'stream_start'; chat_id: string; creator_user_id: string; user_chat_message_id: string; workspace_id: string }
  | { type: 'heartbeat' }
  | { type: 'done'; has_async_entities_pending?: boolean; message?: Message }
  | { type: 'ERROR'; error_type: string; error_message: string }
  | { type: 'message_delta'; delta: string }
  | { type: 'ai_message'; message: Message }
  | { type: 'message_is_answer'; is_answer: boolean }
  | { type: 'chat_title_generated'; title: string }
  | { type: 'task_update'; key: string; title: string; message: string; status: 'loading' | 'success' | 'error'; plan_set: PlanSet; metadata?: Record<string, any>; timestamp: number }
  | { type: 'pending_sources'; pending_sources: PendingSource[] }
  | { type: 'references_found'; references: Entity[] }
  | { type: 'node_tools_execution_start'; node_id: string; plan_id: string; plan_set_id: string; tool_ids: string[]; total_tools: number; timestamp: number }
  | { type: 'node_tool_event'; event: string; node_id: string; plan_id: string; plan_set_id: string; tool_id?: string; tool_type?: string; metadata?: Record<string, any>; timestamp: number }
  | { type: 'update_subagent_current_action'; current_action: string; node_id: string; plan_id: string; plan_set_id: string; tool_id?: string; timestamp: number }
  | { type: 'node_report_preview_start'; preview_id: string; report_title: string; report_user_query: string; final_report: boolean; node_id: string; plan_id: string; plan_set_id: string; entity: Entity; section_id?: string; timestamp: number; workspace_id: string }
  | { type: 'node_report_preview_delta'; preview_id: string; delta: string; node_id: string; plan_id: string; plan_set_id: string; section_id?: string }
  | { type: 'node_report_preview_done'; preview_id: string; content: string; report_title: string; final_report: boolean; node_id: string; plan_id: string; plan_set_id: string; entity?: Entity; timestamp: number; workspace_id: string }
  | { type: 'browser_use_start'; browser_session_id: string; browser_stream_url: string; timestamp: number }
  | { type: 'browser_use_stop'; browser_session_id: string }
  | { type: 'browser_use_await_user_input'; browser_session_id: string; agent_message?: string }
  | { type: 'clarification_needed'; message: Message }
  | { type: 'update_message_clarification_message'; update: { chat_message_id: string; needs_clarification_message: string | null } }
  | { type: 'ping'; timestamp: string }
  | { type: 'usage-update'; input_tokens: number; output_tokens: number; total_tokens: number; cost_cents?: number };
```

---

## 2. FOUR-SURFACE EVENT ROLLOUT CHECKLIST

When adding a new event type, apply changes across all 4 surfaces in order:

```
Surface 1: BACKEND — Pydantic schema
  □ Add to RunEventType enum in enums.py
  □ Create Pydantic BaseModel with Literal type discriminator
  □ Export from events/__init__.py

Surface 2: BACKEND — Emission point
  □ Identify LangGraph node where event is emitted
  □ Call emit_run_event(pool, run_id, EventModel(...))
  □ Verify PG NOTIFY channel name matches SSE subscription

Surface 3: FRONTEND — TypeScript type
  □ Add variant to RunEvent discriminated union (run-events.ts)
  □ Ensure field names match Pydantic model exactly (snake_case)

Surface 4: FRONTEND — Handler
  □ Add case to switch(event.type) in useRunStream hook
  □ Update appropriate Zustand store slice
  □ Add UI rendering if event has visual representation
```

### 2.1 Rollout Example: Adding `usage-update` Event

```python
# Surface 1: Pydantic schema (backend)
class UsageUpdateEvent(BaseModel):
    type: Literal["usage-update"]
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost_cents: Optional[int] = None

# Surface 2: Emission in LangGraph node (backend)
# In research_executor, after each LLM call:
await emit_run_event(pool, run_id, UsageUpdateEvent(
    type="usage-update",
    input_tokens=response.usage.input_tokens,
    output_tokens=response.usage.output_tokens,
    total_tokens=response.usage.input_tokens + response.usage.output_tokens,
    cost_cents=calculate_cost_cents(response.usage),
))
```

```typescript
// Surface 3: TypeScript type (already in RunEvent union above)

// Surface 4: Handler in useRunStream
case 'usage-update':
  useRunStore.getState().addUsage({
    inputTokens: event.input_tokens,
    outputTokens: event.output_tokens,
    totalTokens: event.total_tokens,
    costCents: event.cost_cents,
  });
  break;
```

---

## 3. ENTITY LIFECYCLE

### 3.1 Entity Creation → Citation Binding → Frontend Display

```
[Step 1] Tool executes (web search, API call, etc.)
  ↓
[Step 2] EntityService.store_entity(content, media_type, entity_type, metadata)
         → sha256 computed, artifact stored in MinIO/S3
         → Artifact row inserted (with entity_type + entity_metadata)
  ↓
[Step 3] Entity dict added to run's in-memory references list
  ↓
[Step 4] emit_run_event(run_id, ReferencesFound(references=[entity]))
         → SSE: { type: "references_found", references: [Entity] }
  ↓
[Step 5] Frontend receives references_found event
         → entities Map updated: entities.set(entity.identifier, entity)
  ↓
[Step 6] LLM synthesizes notes with inline citation:
         <gml-inlinecitation identifier="entity-abc-123"/>
  ↓
[Step 7] GML renderer resolves identifier → entities.get("entity-abc-123")
  ↓
[Step 8] InlineCitation component renders: [Source Title] (clickable)
  ↓
[Step 9] User clicks → SourcesPanel opens for this entity
         Shows: URL, title, favicon, snippet, provider, retrieved_at
```

### 3.2 Entity Store Pattern (Frontend)

```typescript
// Part of run-store.ts or dedicated entities-store.ts
interface EntityStore {
  entities: Map<string, Entity>;   // identifier → Entity
  addEntities: (refs: Entity[]) => void;
  getEntity: (identifier: string) => Entity | undefined;
}

// Usage in useRunStream:
case 'references_found':
  addEntities(event.references);
  break;

// In InlineCitation component:
function InlineCitation({ identifier }: { identifier: string }) {
  const entity = useEntityStore().getEntity(identifier);
  if (!entity) return null;

  const displayText = entity.title
    || (entity.entity_type === 'WEB_PAGE' ? new URL(entity.external_url!).hostname : 'Source');

  return (
    <button
      className="inline-citation text-blue-600 text-xs font-medium"
      onClick={() => openSourcePanel(entity)}
    >
      [{displayText}]
    </button>
  );
}
```

### 3.3 Citation Buffer (Streaming Safety)

```typescript
// Prevents incomplete [citation] text flashing during token streaming
class CitationBuffer {
  private isInCitation = false;
  private buffer = '';
  private readyPointer = -1;

  feed(chunk: string): boolean {
    if (!chunk) return false;
    this.buffer += chunk;
    const prevReady = this.readyPointer;

    for (let i = this.readyPointer + 1; i < this.buffer.length; i++) {
      const char = this.buffer[i];
      if (char === '[') {
        this.isInCitation = true;
      } else if (char === ']' || char === '\n') {
        // ']' closes citation; '\n' is safety valve for unclosed brackets
        this.isInCitation = false;
      }
      if (!this.isInCitation) {
        this.readyPointer = i;
      }
    }

    return prevReady !== this.readyPointer;   // true = new content ready
  }

  getReadyContent(): string {
    return this.buffer.slice(0, this.readyPointer + 1);
  }
}

// Usage in message_delta handler:
const citationBuffer = new CitationBuffer();

case 'message_delta':
  if (citationBuffer.feed(event.delta)) {
    setDisplayedContent(citationBuffer.getReadyContent());
  }
  break;
```

---

## 4. BILLING FLOW

### 4.1 Run Start → Usage Record → Quota Check → Stripe Webhook

```
[Step 1] POST /api/v1/runs (user creates run)
         → QuotaMiddleware intercepts
         → BillingService.check_quota(tenant_id)
         → If quota exceeded: HTTP 402 { code: "quota_exceeded" }
         → If OK: continue
  ↓
[Step 2] Run record created in DB
         BillingService.record_run_start(tenant_id, run_id, "research_run")
         → UsageRecord inserted: status="pending", quantity=1
  ↓
[Step 3] LangGraph graph executes
         → Each LLM call: track tokens (via LangChain callbacks or LiteLLM)
         → LangGraph state accumulates cost_cents_spent (Annotated[int, operator.add])
         → If cost_cents_spent > 200 (= $2.00): set budget_exceeded=True → stop graph
  ↓
[Step 4] Run completes (done event emitted)
         BillingService.finalize_run(usage_record_id, input_tokens, output_tokens, cost_cents)
         → Updates UsageRecord with final token counts and cost
  ↓
[Step 5] Monthly: Stripe invoice created
         BillingService.generate_monthly_invoice(tenant_id, current_month)
         → Counts pending UsageRecords for month
         → Calculates overage (runs > 200 at $0.50/run)
         → Marks records as "billed"
  ↓
[Step 6] Stripe webhook fires (invoice.paid or invoice.payment_failed)
         POST /api/v1/billing/webhooks/stripe
         → Raw body read (CRITICAL: not parsed JSON)
         → Signature verified via Webhook.construct_event()
         → Subscription status updated in DB
```

### 4.2 Quota Enforcement Decision Tree

```
User creates run?
  ├─ No active subscription → HTTP 402 "No subscription found"
  ├─ Subscription status = "canceled" → HTTP 402 "Subscription canceled"
  ├─ Subscription status = "past_due" → HTTP 402 "Payment required"
  ├─ is_trial = True AND trial_ends_at < now → HTTP 402 "Trial expired"
  ├─ used_runs >= monthly_runs_limit
  │   ├─ Plan allows overage (professional) → Allow run, will bill at $0.50
  │   └─ Plan blocks overage (sandbox) → HTTP 402 "Run limit reached"
  └─ used_runs < monthly_runs_limit → Allow run ✓
```

### 4.3 Stripe Plan Configuration

```python
# src/intelli/config/stripe_config.py
STRIPE_PLANS = {
    "sandbox": {
        "month": {
            "stripe_price_id": "price_xxx_sandbox_month",
            "amount_cents": 0,
            "monthly_runs_limit": 10,
        },
    },
    "professional": {
        "month": {
            "stripe_price_id": "price_xxx_pro_month",
            "amount_cents": 2000,         # $20.00
            "monthly_runs_limit": 200,
        },
        "year": {
            "stripe_price_id": "price_xxx_pro_year",
            "amount_cents": 19200,        # $192/year (20% discount)
            "monthly_runs_limit": 200,
        },
    },
    # team: TBD
}

OVERAGE_RATE_CENTS = 50   # $0.50 per run over limit (professional plan only)
```

---

## 5. DELIVERABLE PIPELINE

### 5.1 Complete Flow: User Selection → Orchestrator → Generator → Artifact → UI

```
[Step 1] User selects deliverable type in ChatInput
         DeliverableSelector: 'standard' | 'report' | 'website' | 'slides' | 'document'
         → useDeliverableStore.setSelectedType(type)
  ↓
[Step 2] User sends message
         POST /api/v1/conversations/{id}/messages
         {
           "content": "Analyze MSFT",
           "deliverable_type": "REPORT"   ← from DeliverableStore
         }
  ↓
[Step 3] Backend creates Run with deliverable_type
         LangGraph graph starts with state.deliverable_type = "REPORT"
  ↓
[Step 4] Graph executes research phase
         planner_node → dispatch_node → research_executor[] → fan_in
         → task_update events emitted throughout
         → PlanViewer (BL-007) updates in real-time
  ↓
[Step 5] synthesis_node creates DataBrief
         All structured data consolidated into single DataBrief object
         Ensures MSFT $281.7B revenue appears identically in all outputs
  ↓
[Step 6] Deliverable generator node executes
         match state.deliverable_type:
           case "REPORT":    → report_generator_node
           case "WEBSITE":   → website_generator_node (runs via arq)
           case "SLIDES":    → slides_generator_node
           case "DOCUMENT":  → document_generator_node
  ↓
[Step 7a] REPORT: GML streaming
           node_report_preview_start emitted
           LLM streams GML content
           → node_report_preview_delta emitted per token
           → GenerationOverlay (BL-020) shows progress
           node_report_preview_done emitted with full content
           → GML stored as Artifact (sha256-addressed)
           → Pointer updated: "conversation-{id}/latest-report" → Manifest → Artifact
  ↓
[Step 7b] WEBSITE: arq background job
           done event emitted with has_async_entities_pending=True
           → arq job enqueued for website generation
           → On completion: entity update pushed via references_found event
           → WebsitePreview (BL-010) renders artifact as blob URL in iframe
  ↓
[Step 8] Frontend renders deliverable
         REPORT:   renderGml(content) → rehype-to-JSX pipeline → React tree
         WEBSITE:  blobUrl = createObjectURL(artifact bytes) → sandboxed iframe
         SLIDES:   iframe embed or custom player
         DOCUMENT: PDF.js viewer or download link
```

### 5.2 Artifact Storage Pattern (Content-Addressed)

```python
# Deliverable → Artifact → Manifest → Pointer
async def store_deliverable_artifact(
    content: bytes,
    media_type: str,
    entity_type: str,
    conversation_id: str,
    deliverable_type: str,
    run_id: str,
    entity_metadata: dict,
    session: AsyncSession,
) -> tuple[Artifact, Manifest, Pointer]:
    """Store deliverable in content-addressed store and update mutable pointer."""
    entity_service = EntityService(session, storage_backend)

    # 1. Store content-addressed artifact
    artifact = await entity_service.store_entity(
        content=content,
        media_type=media_type,
        entity_type=entity_type,
        entity_metadata=entity_metadata,
        created_by=run_id,
    )

    # 2. Build manifest tree
    manifest = Manifest(
        sha256=compute_manifest_hash({
            f"deliverables/{deliverable_type.lower()}": artifact.sha256
        }),
        tree={
            f"deliverables/{deliverable_type.lower()}": {
                "sha256": artifact.sha256,
                "media_type": media_type,
                "entity_type": entity_type,
                "size_bytes": artifact.size_bytes,
            }
        },
        entry_count=1,
        total_size_bytes=artifact.size_bytes,
        message=f"Generated {deliverable_type} for run {run_id}",
    )
    session.add(manifest)

    # 3. Update pointer (mutable HEAD reference)
    pointer_name = f"conversation-{conversation_id}/latest-{deliverable_type.lower()}"
    pointer_result = await session.execute(
        select(Pointer).where(Pointer.name == pointer_name)
    )
    pointer = pointer_result.scalar_one_or_none()
    old_manifest_sha256 = pointer.manifest_sha256 if pointer else None

    if pointer:
        pointer.manifest_sha256 = manifest.sha256
        pointer.meta = {**pointer.meta, "run_id": run_id}
    else:
        pointer = Pointer(
            id=uuid4(),
            namespace="default",
            name=pointer_name,
            manifest_sha256=manifest.sha256,
            pointer_type="snapshot",
            meta={"deliverable_type": deliverable_type, "run_id": run_id},
        )
        session.add(pointer)

    # 4. Record pointer history (audit trail)
    history = PointerHistory(
        id=uuid4(),
        pointer_id=pointer.id,
        from_manifest_sha256=old_manifest_sha256,
        to_manifest_sha256=manifest.sha256,
        reason="deliverable_generated",
        changed_by=run_id,
    )
    session.add(history)
    await session.commit()

    return artifact, manifest, pointer
```

---

## 6. AUTHENTICATION FLOW

### 6.1 JWT + API Key Dual-Mode (Full Sequence)

```
Interactive User (Browser):
  1. POST /api/v1/auth/login { email, password }
  2. Server verifies credentials, returns { access_token, refresh_token }
  3. Frontend stores access_token in Zustand (auth-store, persisted to localStorage)
  4. All API calls: Authorization: Bearer {access_token}
  5. get_current_user() validates JWT locally (HS256, no DB lookup)
  6. Token expiry: 401 → refresh via POST /api/v1/auth/refresh

Programmatic Client (API Key):
  1. User generates API key via POST /api/v1/api-keys
  2. Key stored as SHA-256 hash in api_keys table
  3. All API calls: X-API-Key: {raw_key}
  4. get_current_user() hashes key, looks up in DB, verifies is_active=True
  5. Key revocation: DELETE /api/v1/api-keys/{key_id} → is_active=False
```

### 6.2 UserContext (Shared Between Both Auth Modes)

```python
from dataclasses import dataclass

@dataclass
class UserContext:
    user_id: str
    tenant_id: str
    auth_method: str   # "jwt" | "api_key"

    @property
    def workspace_id(self) -> str:
        return self.tenant_id   # workspace_id = tenant_id (Superagent mapping)
```

### 6.3 Multi-Tenant Isolation Pattern

```python
# Every query MUST filter by tenant_id — no exceptions
async def get_conversations(
    db: AsyncSession,
    current_user: UserContext,
    limit: int = 20,
) -> list[Conversation]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.tenant_id == current_user.tenant_id)   # ALWAYS include
        .order_by(Conversation.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()

# Pattern:
#   BAD:  select(X).where(X.id == id)
#   GOOD: select(X).where(X.id == id).where(X.tenant_id == current_user.tenant_id)
```

---

## 7. CO-GENERATION FLOW (Website + Report via arq)

### 7.1 Async Job Dispatch Pattern

```python
from arq import ArqRedis

async def dispatch_website_generation(
    arq_pool: ArqRedis,
    conversation_id: str,
    run_id: str,
    data_brief: DataBrief,
    user_query: str,
    workspace_id: str,
) -> str:
    """Enqueue website generation job. Returns job ID for tracking."""
    job = await arq_pool.enqueue_job(
        "generate_website",
        conversation_id=conversation_id,
        run_id=run_id,
        data_brief=data_brief.model_dump(),
        user_query=user_query,
        workspace_id=workspace_id,
    )
    return job.job_id


# arq worker function
async def generate_website(
    ctx: dict,
    conversation_id: str,
    run_id: str,
    data_brief: dict,
    user_query: str,
    workspace_id: str,
) -> None:
    """Background job: generate website artifact, store, notify frontend via SSE."""
    brief = DataBrief(**data_brief)

    # 1. Generate website content with LLM
    website_html = await generate_website_html(brief, user_query)

    # 2. Store artifact (content-addressed)
    artifact, manifest, pointer = await store_deliverable_artifact(
        content=website_html.encode(),
        media_type="text/html",
        entity_type="WEBSITE",
        conversation_id=conversation_id,
        deliverable_type="WEBSITE",
        run_id=run_id,
        entity_metadata={
            "user_query": user_query,
            "generation_status": "complete",
            "deployed": False,
        },
        session=ctx["db"],
    )

    # 3. Notify frontend via references_found event
    await emit_run_event(
        ctx["pg_pool"],
        run_id,
        ReferencesFound(
            type="references_found",
            references=[Entity(
                entity_type="WEBSITE",
                identifier=str(pointer.id),
                title=f"Generated Website: {user_query[:50]}",
                file_name="index.html",
                mimetype="text/html",
                workspace_id=workspace_id,
                content_artifact_id=artifact.sha256,
            )],
        ),
    )
```

### 7.2 Companion Report + Website (Same DataBrief → Consistency)

```python
async def generate_companion_deliverables(
    state: ResearchState,
    pool: asyncpg.Pool,
    session: AsyncSession,
) -> None:
    """
    Generate report synchronously (streams to SSE), then kick off
    async website generation from the same DataBrief.
    Both use identical DataBrief → numerical values are consistent across outputs.
    """
    data_brief = state["data_brief"]
    run_id = state["run_id"]
    deliverable_type = state.get("deliverable_type", "REPORT")

    # Always generate report (primary deliverable, synchronous stream)
    await generate_report_streaming(data_brief, state, pool)

    # Optionally co-generate website if requested
    if deliverable_type in ("WEBSITE", "REPORT_WITH_WEBSITE"):
        await dispatch_website_generation(
            arq_pool=state["arq_pool"],
            conversation_id=state["conversation_id"],
            run_id=run_id,
            data_brief=data_brief,
            user_query=state["query"],
            workspace_id=state["workspace_id"],
        )

    # done event signals SSE stream is complete
    # has_async_entities_pending=True tells frontend to wait for async entity
    await emit_run_event(pool, run_id, DoneEvent(
        type="done",
        has_async_entities_pending=(deliverable_type != "REPORT"),
    ))
```

---

## 8. SSE STREAMING LIFECYCLE

### 8.1 Complete Sequence Diagram

```
Client                     FastAPI                   LangGraph               PG LISTEN/NOTIFY
  │                           │                           │                         │
  │── POST /runs ────────────>│                           │                         │
  │<── 200 {run_id} ──────────│                           │                         │
  │                           │── graph.astream() ───────>│                         │
  │── GET /runs/{id}/stream ─>│                           │                         │
  │   EventSource opens       │── LISTEN run:{id} ───────────────────────────────>│
  │                           │                           │── emit stream_start ────>│
  │<── data: {stream_start} ──│<──────────────────────────────── NOTIFY ────────────│
  │                           │                           │── emit task_update ─────>│
  │<── data: {task_update} ───│<──────────────────────────────── NOTIFY ────────────│
  │                           │                           │   [parallel tasks...]    │
  │<── data: {node_tool_event}│<──────────────────────────────── NOTIFY ────────────│
  │<── data: {heartbeat} ─────│  (every 25s if idle)     │                         │
  │<── data: {task_update} ───│<──────────────────────────────── NOTIFY ────────────│
  │<── data: {references_found│<──────────────────────────────── NOTIFY ────────────│
  │<── data: {preview_start} ─│<──────────────────────────────── NOTIFY ────────────│
  │<── data: {preview_delta} ─│<──────────────────────────────── NOTIFY (per token)─│
  │<── data: {preview_done} ──│<──────────────────────────────── NOTIFY ────────────│
  │<── data: {ai_message} ────│<──────────────────────────────── NOTIFY ────────────│
  │<── data: {done} ──────────│<──────────────────────────────── NOTIFY ────────────│
  │   EventSource closes      │── UNLISTEN run:{id} ──────────────────────────────>│
```

### 8.2 Reconnection Handling (Frontend)

```typescript
// Exponential backoff reconnect on EventSource error
function useRunStreamWithRetry(runId: string) {
  const retryCount = useRef(0);
  const maxRetries = 5;

  function connect() {
    const es = new EventSource(`/api/v1/runs/${runId}/stream`, { withCredentials: true });

    es.onopen = () => { retryCount.current = 0; };

    es.onerror = () => {
      es.close();
      if (retryCount.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
        retryCount.current++;
        setTimeout(connect, delay);
      } else {
        useRunStore.getState().setStatus('error');
      }
    };

    es.onmessage = handleEvent;
    return es;
  }

  useEffect(() => {
    const es = connect();
    return () => es.close();
  }, [runId]);
}
```

---

## 9. MIGRATION SEQUENCING (0005a/b/c)

Per DEC-052, Migration 0005 is split into three sequential migrations:

```python
# Migration 0005a: Artifact entity_type extension
# Adds: entity_type (str | None), entity_metadata (JSONB | None) to artifacts table
# Prerequisite: migrations 0001-0004 complete
# Required by: BL-016 (entity/citation), BL-004 (report), BL-005 (website)

# Migration 0005b: Billing tables
# Creates: subscriptions, usage_records tables
# Prerequisite: 0005a complete (UsageRecord references runs.id)
# Required by: BL-012 (Stripe integration), BL-013 (quota middleware)

# Migration 0005c: Plan/PlanTask tables (if persisting to DB)
# Creates: plan_sets, plans, plan_tasks tables
# Prerequisite: 0005b complete
# Required by: BL-007 (PlanViewer), BL-019 (plan persistence)
```

---

## 10. DEPENDENCY + IMPLEMENTATION ORDER

### 10.1 Critical Path (Dependency Chain)

```
BL-022 (async_sessionmaker per-node) ← MUST BE FIRST
  ↓
BL-001 (LangGraph StateGraph setup)
  ↓ (parallel)
  ├── BL-003 (MCP tool integration — independent)
  └── BL-016 (entity/artifact store)
        ↓ (needs 0005a)
        ├── BL-002 (SSE streaming + PG NOTIFY)
        │     ↓
        │     BL-007 (PlanViewer — needs SSE task_update)
        │     BL-014 (RunTimeline — needs SSE node_* events)
        │     BL-020 (GenerationOverlay — needs SSE preview events)
        │
        ├── BL-004 (Report generation → GML)
        │     ↓
        │     BL-009 (ReportRenderer — needs GML)
        │     BL-015 (DeliverableStore — needs SSE + report)
        │
        ├── BL-005 (Website generation → artifact)
        │     ↓
        │     BL-010 (WebsitePreview — needs artifact API)
        │
        └── BL-012 (Stripe billing — needs 0005b)
              ↓
              BL-013 (Quota middleware — needs Subscription model)
```

### 10.2 Backlog Items Reference

| BL ID | Description | Key Dependencies |
|---|---|---|
| BL-001 | LangGraph ResearchAssistantGraph extension | BL-022 |
| BL-002 | SSE streaming via PG LISTEN/NOTIFY | existing platform |
| BL-003 | MCP tool integration (Brave/Firecrawl) | independent |
| BL-004 | Report generator (GML streaming) | BL-001, BL-016 |
| BL-005 | Website generator (arq job) | BL-001, BL-016, 0005a |
| BL-007 | PlanViewer component | BL-002 (task_update SSE) |
| BL-008 | DeliverableSelector component | DeliverableStore |
| BL-009 | ReportRenderer (rehype-to-JSX) | BL-004 |
| BL-010 | WebsitePreview (iframe + blob URL) | BL-005 |
| BL-012 | Stripe billing integration | 0005b, DocuIntelli port |
| BL-013 | Quota middleware | BL-012 |
| BL-014 | Enhanced RunTimeline | BL-002, BL-007 |
| BL-015 | DeliverableStore (Zustand) | BL-008, BL-002 |
| BL-016 | Entity/Artifact service | 0005a |
| BL-018 | Migration 0005a/b/c | 0004 |
| BL-019 | Plan persistence to DB | 0005c |
| BL-020 | GenerationOverlay | BL-002, BL-015 |
| BL-022 | Per-node async_sessionmaker | infrastructure |

---

## 11. DESIGN DECISION QUICK REFERENCE

| Decision | Chosen Approach | Rejected Alternative |
|---|---|---|
| Chart library | `react-plotly.js` | Recharts |
| GML rendering | `unified` + `rehype-parse` + `rehype-react` | Raw HTML injection |
| LLM provider | `ChatOpenAI` (base_url override for others) | LiteLLM in v1 |
| Search tool | MCP hot-swap (Brave/Tavily) | Hardcoded provider |
| Cost tracking | Langfuse self-hosted | LangSmith (hosted cost) |
| Clarification UI | Deferred to v1.5 | — |
| Website preview | iframe-only (DEC-044) | Public unauthenticated route |
| Structured output | `llm.with_structured_output(Schema)` | Manual JSON parsing |
| Session pattern | Per-node `async_sessionmaker` | Shared session across nodes |
| Migration 0005 | Split into 0005a/b/c | Single monolithic migration |
| Billing unit | 1 run = 1 AI generation message | Token-based billing |
| Budget limit | $2/run LangGraph state accumulator | External budget service |
| Overage rate | $0.50/run (professional plan only) | — |
| Webhook body | `await request.body()` (raw bytes) | Pre-parsed JSON body |
