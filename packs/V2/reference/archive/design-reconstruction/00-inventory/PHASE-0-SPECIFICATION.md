# Phase 0 Specification — Event Contract & Instrumentation (2 weeks)
**Status**: Ready for Implementation
**Source**: SUPERAGENT_PARITY_CLEAN_ROOM_PLAN §5.0 + IMPLEMENTATION-PLAN v3
**Document**: Actionable specification for first 2-week sprint

---

## Executive Summary

**Objective**: Make the agentic workflow visible and replayable by instrumenting LangGraph with a formal event contract.

**Success Metric**: For any agent run, the UI can reconstruct:
1. What was planned (plan set + tasks)
2. What was executed (nodes + actions)
3. What was called (tool invocations)
4. What was generated (artifacts)

All from **run ledger events** (not LangGraph checkpoints).

**Outcome**: Foundation for Phases 1–5 (planning, deliverables, search, HITL, hardening).

---

## 1. Intelli Run Event Contract v1

### Scope
Define new `event_type` enum values in the PostgreSQL `run_events` table. No schema migrations required (payload is JSON, already flexible).

### New Event Types

#### Planning Events
```python
"plan_set_created"       # Plan generation started
  payload: {
    "plan_set_id": "uuid",
    "title": "Research PropCo Debt Structure",
    "task_count": 3,
    "timestamp": "2026-02-20T10:00:00Z"
  }

"plan_set_updated"       # Plan status change or delta
  payload: {
    "plan_set_id": "uuid",
    "status": "in_progress" | "completed" | "failed",
    "completed_tasks": 2,
    "total_tasks": 3,
    "delta": { "task_2": { "status": "completed" } } | null  # Full snapshot if null
  }

"plan_task_updated"      # Individual task progress
  payload: {
    "plan_set_id": "uuid",
    "task_id": "uuid",
    "task_name": "Search comparable properties",
    "status": "pending" | "in_progress" | "completed" | "failed",
    "sources_pending": ["URL-1", "URL-2"],  # citation_ids waiting
    "progress_percent": 33
  }
```

#### Node Execution Events
```python
"node_started"           # LangGraph node began execution
  payload: {
    "node_id": "uuid",  # MUST be persistent (stored in DB)
    "node_name": "research_subagent",
    "node_type": "subagent" | "planner" | "tool" | "router",
    "timestamp": "2026-02-20T10:05:00Z"
  }

"node_action_updated"    # Current human-friendly action
  payload: {
    "node_id": "uuid",
    "action_string": "Searching for comparable properties in zip 94301",
    "timestamp": "2026-02-20T10:05:15Z"
  }

"node_completed"         # LangGraph node finished
  payload: {
    "node_id": "uuid",
    "status": "success" | "failed",
    "duration_ms": 5432,
    "output_size_tokens": 2100,
    "error_message": null | "Tool timeout"
  }
```

#### Tool Events (Enhanced)
```python
"tool_call_started"      # Already exists, enhance
  payload: {
    "tool_call_id": "uuid",  # MUST persist (was ephemeral)
    "node_id": "uuid",       # NEW: link to node
    "tool_name": "index.search",
    "tool_input": { "query": "...", "scope": "..." },
    "timestamp": "2026-02-20T10:05:20Z"
  }

"tool_call_completed"    # Already exists, enhance
  payload: {
    "tool_call_id": "uuid",
    "status": "success" | "error",
    "tool_output": { "results": [...], "count": 42 },
    "error_message": null,
    "duration_ms": 234,
    "output_refs": [
      { "type": "artifact", "id": "sha256:abc123..." },
      { "type": "pointer", "id": "uuid" }
    ]
  }

"tool_event"             # Optional: telemetry/log lines
  payload: {
    "tool_call_id": "uuid",
    "level": "info" | "warning" | "error",
    "message": "Found 42 comparable properties",
    "timestamp": "2026-02-20T10:05:21Z"
  }
```

#### Evidence Events
```python
"references_found"       # Source/entity list discovered
  payload: {
    "node_id": "uuid",
    "entity_count": 5,
    "entities": [
      { "type": "url", "id": "ent-123", "source": "https://..." },
      { "type": "document", "id": "ent-456", "artifact_id": "sha256:..." }
    ],
    "timestamp": "2026-02-20T10:05:30Z"
  }
```

#### Deliverable Events (Preview)
```python
"deliverable_preview_started"  # Report/website generation began
  payload: {
    "deliverable_id": "uuid",
    "deliverable_type": "report" | "website" | "slides" | "document" | "code",
    "mode": "streaming" | "batch",
    "timestamp": "2026-02-20T10:10:00Z"
  }

"deliverable_preview_delta"    # Section/chunk generated
  payload: {
    "deliverable_id": "uuid",
    "section_id": "section-1",
    "section_title": "Executive Summary",
    "delta": "Markdown or JSON chunk",
    "progress_percent": 15,
    "timestamp": "2026-02-20T10:10:05Z"
  }

"deliverable_preview_completed"  # Preview done, before publish
  payload: {
    "deliverable_id": "uuid",
    "section_count": 8,
    "artifact_id": "sha256:preview-artifact...",
    "timestamp": "2026-02-20T10:10:30Z"
  }

"deliverable_published"        # Final artifact created + run linked
  payload: {
    "deliverable_id": "uuid",
    "artifact_id": "sha256:final...",
    "pointer_id": "uuid",
    "manifest_sha": "sha256:manifest...",
    "download_url": "/api/artifact/{id}/download",
    "timestamp": "2026-02-20T10:11:00Z"
  }
```

#### Human-in-Loop Events (Preview)
```python
"interrupt_started"      # Approval/input requested
  payload: {
    "interrupt_id": "uuid",
    "interrupt_type": "approval" | "browser_use",
    "question": "Approve $2.5M debt facility?",
    "timeout_seconds": 3600,
    "timestamp": "2026-02-20T10:15:00Z"
  }

"interrupt_waiting"      # Waiting for user response
  payload: {
    "interrupt_id": "uuid",
    "elapsed_seconds": 45
  }

"interrupt_resumed"      # User responded
  payload: {
    "interrupt_id": "uuid",
    "response": "approved" | "denied" | "user_input_text",
    "timestamp": "2026-02-20T10:15:45Z"
  }
```

### Payload Validation

All new events validated via Pydantic models:

```python
# src/intelli/schemas/run_events.py

class NodeStartedEvent(BaseModel):
    event_type: Literal["node_started"]
    node_id: UUID
    node_name: str
    node_type: Literal["subagent", "planner", "tool", "router"]
    timestamp: datetime

class NodeActionUpdatedEvent(BaseModel):
    event_type: Literal["node_action_updated"]
    node_id: UUID
    action_string: str
    timestamp: datetime

# ... etc for all new types

# Union type for all events
RunEvent = Union[
    NodeStartedEvent,
    NodeActionUpdatedEvent,
    NodeCompletedEvent,
    ToolCallStartedEvent,  # enhanced
    ToolCallCompletedEvent,  # enhanced
    ToolEventEvent,
    ReferencesFoundEvent,
    DeliverablePreviewStartedEvent,
    # ... etc
]
```

---

## 2. Stable ID Strategy

### Problem
Current implementation uses ephemeral UUIDs (`uuid4()[:8]` string truncations). Necessary for:
- Linking tool calls to nodes
- Linking nodes to plan tasks
- Replay and audit trails

### Solution
Persist IDs in the database at generation time.

#### Node IDs
```python
# In LangGraph node setup
node_id = uuid4()  # Generate once
context.write_state({"_phase_0_node_id": str(node_id)})

# Log to run ledger
ledger_service.log_event(
    event_type="node_started",
    payload={
        "node_id": str(node_id),
        "node_name": node.name,
        ...
    }
)
```

#### Tool Call IDs
```python
# In tool invocation wrapper
tool_call_id = uuid4()
ledger_service.log_event(
    event_type="tool_call_started",
    payload={
        "tool_call_id": str(tool_call_id),
        "node_id": str(node_id),  # Link to parent
        "tool_name": tool_name,
        ...
    }
)

# Return to client
return {
    "tool_call_id": str(tool_call_id),
    "result": result,
}
```

#### Plan Task IDs
```python
# In planner node
plan_set_id = uuid4()
tasks = [
    {"task_id": uuid4(), "name": "...", "status": "pending"},
    ...
]

ledger_service.log_event(
    event_type="plan_set_created",
    payload={
        "plan_set_id": str(plan_set_id),
        "tasks": tasks,
        ...
    }
)
```

---

## 3. Implementation Touchpoints

### Backend Files to Modify

#### 1. `src/intelli/db/models/runs.py` — Add RunEventType enum
```python
class RunEventType(str, Enum):
    # ... existing values ...

    # NEW Phase 0 types
    PLAN_SET_CREATED = "plan_set_created"
    PLAN_SET_UPDATED = "plan_set_updated"
    PLAN_TASK_UPDATED = "plan_task_updated"
    NODE_STARTED = "node_started"
    NODE_ACTION_UPDATED = "node_action_updated"
    NODE_COMPLETED = "node_completed"
    REFERENCES_FOUND = "references_found"
    DELIVERABLE_PREVIEW_STARTED = "deliverable_preview_started"
    DELIVERABLE_PREVIEW_DELTA = "deliverable_preview_delta"
    DELIVERABLE_PREVIEW_COMPLETED = "deliverable_preview_completed"
    DELIVERABLE_PUBLISHED = "deliverable_published"
    INTERRUPT_STARTED = "interrupt_started"
    INTERRUPT_WAITING = "interrupt_waiting"
    INTERRUPT_RESUMED = "interrupt_resumed"
```

#### 2. `src/intelli/schemas/run_events.py` — New file
Define Pydantic models for each event type. Import in `src/intelli/services/runs/ledger_service.py` for validation.

```python
# In ledger_service.log_event()
payload = event_payload  # User provides dict
validated = RunEvent.model_validate(payload)  # Raises ValidationError if invalid
# Proceed with logging
```

#### 3. `src/intelli/services/runs/ledger_service.py` — Enhanced logging
```python
async def log_event(
    run_id: UUID,
    event_type: RunEventType,
    payload: dict,
) -> RunEvent:
    """Log event with validation."""
    # 1. Validate payload against schema
    try:
        validated = RunEvent.model_validate({
            "event_type": event_type,
            **payload
        })
    except ValidationError as e:
        raise InvalidEventPayload(f"Event {event_type} failed validation: {e}")

    # 2. Persist to database
    event_record = RunEventRecord(
        run_id=run_id,
        event_type=event_type,
        payload=validated.model_dump()
    )
    session.add(event_record)
    await session.commit()

    # 3. Emit SSE to connected clients
    await self.sse_service.broadcast(
        channel=f"run:{run_id}",
        message=validated.model_dump_json()
    )

    return validated
```

#### 4. `src/intelli/agents/adapters/__init__.py` — LangGraph instrumentation
Wrap the existing research_assistant graph to emit node events.

```python
from functools import wraps

def instrument_node(original_node):
    """Wrapper to emit node_started/completed events."""
    @wraps(original_node)
    async def instrumented(*args, state, **kwargs):
        node_id = state.get("_phase_0_node_id") or str(uuid4())
        state["_phase_0_node_id"] = node_id

        ledger_service.log_event(
            event_type="node_started",
            payload={
                "node_id": node_id,
                "node_name": original_node.__name__,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        start = time.time()
        try:
            result = await original_node(*args, state=state, **kwargs)
            duration_ms = (time.time() - start) * 1000

            ledger_service.log_event(
                event_type="node_completed",
                payload={
                    "node_id": node_id,
                    "status": "success",
                    "duration_ms": int(duration_ms),
                }
            )
            return result
        except Exception as e:
            duration_ms = (time.time() - start) * 1000

            ledger_service.log_event(
                event_type="node_completed",
                payload={
                    "node_id": node_id,
                    "status": "failed",
                    "duration_ms": int(duration_ms),
                    "error_message": str(e),
                }
            )
            raise

    return instrumented

# Apply to nodes
graph.add_node("planner", instrument_node(planner_node))
graph.add_node("executor", instrument_node(executor_node))
```

#### 5. `src/intelli/agents/graphs/research_assistant.py` — Emit plan events
Add a planner node (if not already present) that emits plan_set_created.

```python
async def planner_node(state: ResearchState) -> dict:
    """Generate plan set before execution."""
    plan_set_id = str(uuid4())

    # Call LLM to generate plan
    plan_json = await llm.invoke(
        f"Create a plan for: {state['query']}"
    )

    tasks = json.loads(plan_json)

    # Emit event
    await ledger_service.log_event(
        event_type="plan_set_created",
        payload={
            "plan_set_id": plan_set_id,
            "title": state["query"][:80],
            "task_count": len(tasks),
            "tasks": tasks,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )

    return {"plan_set_id": plan_set_id, "tasks": tasks}
```

#### 6. Tool wrapper (existing pattern, enhance)
Existing `src/intelli/mcp/tools/substrate_tools.py` already logs tool calls. Enhance to include persistent tool_call_id:

```python
async def search_tool(query: str, node_id: str = None) -> dict:
    tool_call_id = str(uuid4())

    ledger_service.log_event(
        event_type="tool_call_started",
        payload={
            "tool_call_id": tool_call_id,
            "node_id": node_id,
            "tool_name": "index.search",
            "tool_input": {"query": query},
            "timestamp": datetime.utcnow().isoformat(),
        }
    )

    # ... execute tool ...

    ledger_service.log_event(
        event_type="tool_call_completed",
        payload={
            "tool_call_id": tool_call_id,
            "status": "success",
            "tool_output": results,
            "output_refs": [...],
            "duration_ms": elapsed,
        }
    )

    return {"tool_call_id": tool_call_id, "results": results}
```

### Frontend Files to Modify

#### 1. `ui/src/components/runs/RunTimeline.tsx` — Event rendering
Extend timeline to render new event types:

```typescript
import { RunEvent } from "../../types";

function RunTimeline({ runId, events }: { runId: string; events: RunEvent[] }) {
  // Group events by node
  const eventsByNode = groupBy(events, (e) => {
    if ("node_id" in e) return e.node_id;
    if ("tool_call_id" in e) return extractNodeIdFromToolCall(e);
    return "global";
  });

  return (
    <div className="space-y-4">
      {Object.entries(eventsByNode).map(([nodeId, nodeEvents]) => (
        <NodeGroup
          key={nodeId}
          nodeId={nodeId}
          events={nodeEvents}
        />
      ))}
    </div>
  );
}

function NodeGroup({ nodeId, events }: { nodeId: string; events: RunEvent[] }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold">
        {events.find((e) => e.type === "node_started")?.node_name || nodeId}
      </h3>

      {/* Current action */}
      {events.find((e) => e.type === "node_action_updated")?.action_string && (
        <p className="text-sm text-gray-600 italic">
          Currently: {events.find((e) => e.type === "node_action_updated")?.action_string}
        </p>
      )}

      {/* Tool calls */}
      <div className="mt-2 space-y-1">
        {events
          .filter((e) => e.type === "tool_call_started")
          .map((e) => (
            <ToolCallRow key={e.tool_call_id} event={e} />
          ))}
      </div>

      {/* Duration */}
      {events.find((e) => e.type === "node_completed")?.duration_ms && (
        <p className="text-xs text-gray-500">
          Duration: {events.find((e) => e.type === "node_completed")?.duration_ms}ms
        </p>
      )}
    </div>
  );
}
```

#### 2. `ui/src/components/plan/PlanPanel.tsx` — New file
Right sidebar showing plan + task progress:

```typescript
function PlanPanel({ planSetId, events }: { planSetId: string; events: RunEvent[] }) {
  const planEvents = events.filter((e) => e.type.includes("plan_"));
  const taskUpdates = planEvents.filter((e) => e.type === "plan_task_updated");

  return (
    <div className="w-64 border-l p-4 bg-gray-50">
      <h2 className="font-bold mb-4">Plan</h2>

      <div className="space-y-3">
        {taskUpdates.map((task) => (
          <div key={task.task_id} className="text-sm">
            <div className="font-medium">{task.task_name}</div>
            <div className="text-xs text-gray-600">Status: {task.status}</div>

            {task.sources_pending?.length > 0 && (
              <div className="text-xs text-orange-600">
                Waiting for {task.sources_pending.length} sources
              </div>
            )}

            <div className="mt-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${task.progress_percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3. `ui/src/types/run-events.ts` — TypeScript types
Generate from Pydantic schemas via openapi-typescript.

```typescript
export type RunEvent =
  | NodeStartedEvent
  | NodeActionUpdatedEvent
  | NodeCompletedEvent
  | ToolCallStartedEvent
  | ToolCallCompletedEvent
  | PlanSetCreatedEvent
  | PlanTaskUpdatedEvent
  | ReferencesFoundEvent
  | DeliverablePreviewStartedEvent
  | DeliverablePreviewDeltaEvent;

export type NodeStartedEvent = {
  event_type: "node_started";
  node_id: string;
  node_name: string;
  node_type: "subagent" | "planner" | "tool" | "router";
  timestamp: string;
};

// ... etc
```

---

## 4. Acceptance Criteria

### For the Backend
- [ ] All new event types validate against Pydantic schemas
- [ ] Tool call IDs persist across invocations
- [ ] Node IDs persist in LangGraph state
- [ ] Ledger writes events to PostgreSQL
- [ ] SSE broadcasts events to connected clients (tested via `curl -N`)
- [ ] No existing event logging is broken (backward compatibility)

### For the UI
- [ ] RunTimeline groups events by node
- [ ] PlanPanel displays task list + progress bars
- [ ] Current action displays in real-time
- [ ] Tool calls grouped under parent nodes
- [ ] Events stream in real-time (no full page refresh)

### For Integration
- [ ] Sample run produces all 4 event categories:
  1. Planning (plan_set_created, plan_task_updated)
  2. Nodes (node_started, node_action_updated, node_completed)
  3. Tools (tool_call_started, tool_call_completed)
  4. References (references_found)
- [ ] Run can be replayed from event ledger alone (no checkpoint needed)

---

## 5. Testing Strategy

### Unit Tests
```python
# tests/intelli/services/test_ledger_service.py
def test_node_started_event_validation():
    """Reject event without node_id."""
    with pytest.raises(ValidationError):
        ledger_service.log_event(
            event_type="node_started",
            payload={"node_name": "test"}  # Missing node_id
        )

def test_tool_call_id_persistence():
    """Tool call ID same across start/complete."""
    tool_call_id = "uuid-123"

    ledger_service.log_event(
        event_type="tool_call_started",
        payload={"tool_call_id": tool_call_id, ...}
    )

    ledger_service.log_event(
        event_type="tool_call_completed",
        payload={"tool_call_id": tool_call_id, ...}
    )

    events = ledger_service.get_events(run_id)
    assert events[0].payload["tool_call_id"] == events[1].payload["tool_call_id"]
```

### Integration Tests
```python
# tests/intelli/agents/test_graph_instrumentation.py
@pytest.mark.asyncio
async def test_node_events_emitted():
    """Running graph emits node_started/completed."""
    run = create_test_run()
    events = []

    def capture_event(event):
        events.append(event)

    ledger_service.on_event(capture_event)
    await graph.ainvoke({"query": "test"}, run_id=run.id)

    assert any(e.type == "node_started" for e in events)
    assert any(e.type == "node_completed" for e in events)
    assert all(e.node_id for e in events if "node_id" in e)  # No missing IDs
```

### E2E Tests
```typescript
// tests/e2e/phase-0-timeline.spec.ts
test("RunTimeline reconstructs plan from events", async ({ page }) => {
  // Create run via API
  const run = await api.createRun({ query: "Search properties" });

  // Wait for events to stream
  await page.goto(`/runs/${run.id}`);

  // Verify UI elements appear
  await expect(page.locator("text=plan_set_created")).toBeVisible();
  await expect(page.locator("text=node_started")).toBeVisible();
  await expect(page.locator("[data-testid='plan-panel']")).toBeVisible();
});
```

---

## 6. Risk Mitigation

### Risk: Backward Compatibility
**Problem**: Existing clients may break if new event types appear.
**Mitigation**:
- New event types are _additions_, not replacements
- Existing `tool_call_started/completed` behavior unchanged (payloads enhanced but not required)
- UI gracefully ignores unknown event types (defensive code)

### Risk: Database Capacity
**Problem**: Running 100 tools per request × 500 requests/day = 50K events/day.
**Mitigation**:
- Run events already batched via SSE (not one INSERT per event if using batch)
- Archive old runs after 30 days (optional, Phase 5)
- Payload size capped (plan_set max 10KB, no arbitrary binary data)

### Risk: Late Payload Addition
**Problem**: Tool returns before event logged, race condition.
**Mitigation**:
- Log `tool_call_started` _before_ invoking tool
- Log `tool_call_completed` _after_ tool returns (in finally block)
- If logging fails, log to stderr (non-blocking)

---

## 7. Deployment Checklist

### Pre-Deploy
- [ ] All Pydantic schemas in `src/intelli/schemas/run_events.py` reviewed
- [ ] LangGraph adapter instrumentation tested in isolation
- [ ] Frontend TypeScript types generated from OpenAPI
- [ ] SSE broadcast tested with concurrent clients

### Deploy Steps
1. Deploy backend: `new event types + validation + instrumentation`
2. Wait 1 hour for rollout
3. Deploy frontend: `RunTimeline + PlanPanel + types`
4. Canary: 10% users see new plan panel
5. If no errors, 100% rollout

### Post-Deploy
- [ ] Langfuse ingesting events correctly
- [ ] No database lock contention from event logging
- [ ] Zero event validation errors (check logs)
- [ ] UI timeline rendering correctly (screenshot test)

---

## 8. Success Stories (Examples)

### Example 1: Search Task
**User Query**: "Find comparable properties in San Francisco"

**Event Sequence**:
```
plan_set_created: "Search + Analyze"
  └─ task_1: "Search SF properties"
  └─ task_2: "Extract data"

node_started: planner (from graph)
node_completed: planner (3.2s)

node_started: executor
  └─ node_action_updated: "Searching for properties in SF"
  └─ tool_call_started: index.search (query: "SF properties")
  └─ tool_call_completed: 42 results
  └─ tool_call_started: index.ingest (artifacts)
  └─ tool_call_completed
  └─ references_found: 42 entities
node_completed: executor (5.1s)

plan_task_updated: task_1 (status: completed)
plan_task_updated: task_2 (status: in_progress)
```

**UI Rendering**:
- Plan panel shows 2 tasks, task 1 done, task 2 active
- Timeline shows planner node (3.2s), executor node (5.1s)
- Executor node expanded shows 4 tool calls with results

### Example 2: Tool Failure & Retry
**User Query**: "Fetch market data"

**Event Sequence**:
```
node_started: executor

tool_call_started: fetch_market_data (ticker: "AAPL")
tool_call_completed: error_timeout

node_action_updated: "Retrying market data fetch"

tool_call_started: fetch_market_data (ticker: "AAPL", retry: 1)
tool_call_completed: success (1500 data points)

references_found: 1 entity (market data artifact)

node_completed: executor (success)
```

**UI Rendering**:
- Tool call row shows retry with duration comparison
- Final state shows success after 2 attempts
- References panel shows the data artifact link

---

## 9. Next Steps (Post-Phase-0)

Once Phase 0 is complete:
- **Phase 1 (2–4 weeks)**: PlanSet model + multi-agent executor
- **Phase 2 (2–4 weeks)**: Deliverable preview + publish
- **Phase 3 (3–6 weeks)**: Web research + entity store

Each phase adds new event types (e.g., Phase 2 adds `deliverable_preview_*`).

---

## Document Index

- **SUPERAGENT_PARITY_CLEAN_ROOM_PLAN.md** — Original 5-phase plan
- **IMPLEMENTATION-PLAN.md v3** — Master delivery schedule
- **KNOWLEDGE-MAP.md** — Full architecture reference
- **devrepo-docs-manifest.json** — All 29 source documents

---

**Status**: Ready for sprint planning
**Sprint Size**: 80 story points (2 sprints if 40 SP/week velocity)
**Confidence**: HIGH (all design finalized, no dependencies)
**Recommended Start**: Week of 2026-02-24
