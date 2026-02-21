# Streaming + event bus (SSE done professionally)

Your platform’s “fast feel” is almost entirely a function of eventing.

If eventing is correct:
- PlanViewer feels alive
- progress feels trustworthy
- citations/sources appear deterministically
- you can support refresh/reconnect without losing state
- debugging and replay are trivial

If eventing is wrong:
- UI randomly misses tasks
- users lose confidence
- engineers lose days chasing “non-reproducible” issues

This doc defines a production-grade contract.

---

## 1) Invariants (non-negotiable)

1. **Persist first**: every event that matters is inserted into `run_events`.
2. **Order is strict**: events have a per-run monotonic sequence.
3. **NOTIFY is best-effort**: it only wakes SSE connections.
4. **Backfill is required**: SSE reconnect must query DB for missed events.
5. **Payloads are versioned/validated**: event emission validates against Pydantic schema.
6. **UI state is derived**: UI can rebuild from events; do not require in-memory UI-only state.

---

## 2) Event store design

### 2.1 Sequence allocation (recommended)

Implement a sequence allocator that never races.

Option A: counter table

```sql
CREATE TABLE run_event_counters (
  run_id uuid PRIMARY KEY REFERENCES runs(id) ON DELETE CASCADE,
  next_seq integer NOT NULL
);
```

Allocation query (atomic):

```sql
INSERT INTO run_event_counters(run_id, next_seq)
VALUES (:run_id, 1)
ON CONFLICT (run_id)
DO UPDATE SET next_seq = run_event_counters.next_seq + 1
RETURNING next_seq;
```

Use returned `next_seq` as `sequence_num` for the new event.

This is fast, simple, and concurrency-safe.

### 2.2 Event insertion

- Insert with the allocated sequence_num
- Commit (or flush if you’re within a larger transaction)
- Then publish NOTIFY with payload `{run_id, sequence_num}`

Do NOT rely on NOTIFY payload to reconstruct state; it is only a wake signal.

---

## 3) SSE endpoints and contracts

You currently describe “two SSE streams (chat + run events)”. That can work. But you must be explicit.

### 3.1 Common SSE behavior

- Content-Type: `text/event-stream`
- no buffering: set `Cache-Control: no-cache` and disable proxy buffering if applicable
- keepalive:
  - send `event: ping` every 10–20s with last known seq

### 3.2 Reconnect/catch-up protocol

Use one of these (choose one and document it):

Option A: standard SSE `Last-Event-ID`
- client sends header `Last-Event-ID: <sequence_num>`
- server reads it and backfills

Option B: explicit query param
- `GET /runs/{run_id}/events/stream?after_seq=<int>`

Both are fine. Option A is more “standard SSE”; Option B is easier to test manually.

Server behavior:
1) Determine `after_seq` (default 0)
2) Query DB: `run_events WHERE run_id = :run_id AND sequence_num > :after_seq ORDER BY sequence_num`
3) Emit those events first
4) Subscribe to live NOTIFY and stream events as they arrive

This guarantees that refresh/reconnect never loses events.

### 3.3 Event framing

Each SSE message should include:

- `id: <sequence_num>`  (critical: EventSource will store it)
- `event: <event_type>` (optional but helpful)
- `data: <json>`

Example:

```
id: 42
event: PLAN_TASK_UPDATED
data: {"run_id":"...","sequence_num":42,"event_type":"PLAN_TASK_UPDATED","payload":{...},"timestamp":"..."}
```

Recommendation: include `run_id`, `sequence_num`, `event_type`, `timestamp` at the top level; payload nested.

---

## 4) Mapping to UI (state derivation)

### 4.1 Client-side state machine

For a given run_id, the UI maintains:
- last_seq_seen (int)
- derived views:
  - plan_set + task statuses
  - progress overlay state
  - sources list
  - deliverables list
  - errors/warnings

When a new event arrives:
- validate schema (TypeScript type)
- update derived stores

When reconnecting:
- pass last_seq_seen to server
- ingest backfill events
- continue live

This removes an entire class of “works on my machine” UI bugs.

### 4.2 UI should support “replay”

Provide a UI dev tool:
- select a run_id
- fetch all events
- “replay” them at 1x/2x/10x

This makes debugging *absurdly* faster.

---

## 5) Should you adopt AI SDK Data Stream Protocol?

The Vercel AI SDK UI defines a data stream protocol over SSE for standardized message streaming and tool-calling UI.

Reference:
- https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol

You do not *need* to adopt it, because assistant-ui already supports custom runtimes.

But it can be useful if:
- you want compatibility with existing AI SDK UI clients
- you want a known-good “message start/text delta/tool call” framing

Pragmatic recommendation:

- Keep your RunEvent stream as the canonical event bus.
- If you need AI SDK compatibility, add a translation layer:
  - RunEvent → AI SDK stream parts (start/text-delta/tool-result/etc)
- Do not contaminate your internal schema with AI SDK details unless you commit to that ecosystem.

---

## 6) Schema & code generation strategy

### 6.1 Single source of truth

Backend:
- Pydantic models are the source of truth for event payloads.

Frontend:
- Types must be generated, not handwritten.

### 6.2 Generation options (pick one)

Option A (fast): OpenAPI → TS
- Use FastAPI OpenAPI output
- Use openapi-typescript or similar to generate types
- CI enforces `git diff` clean

Option B (strict): JSON Schema → TS
- Export JSON schema for run_events models
- Use quicktype or json-schema-to-typescript
- CI enforces match

Option C (DX): shared package
- Create `packages/contracts` and publish as internal package
- Python exports schema, TS consumes package
- More work initially

Given your local-first, Option A is the pragmatic default.

---

## 7) Contract tests (continuous)

Add tests that fail early:

Backend unit tests:
- event payload examples validate

Backend integration tests:
- emitting an event writes to DB with correct sequence
- SSE backfill returns correct events after after_seq

Frontend tests:
- ingest sample event stream and confirm derived state (PlanViewer, SourcesPanel, ProgressOverlay)

Golden sample files:
- `contracts/sample_events.json` (a full run)
- each UI component uses it for fixture tests

---

## 8) Failure modes to handle explicitly

- duplicate events (client may reconnect and receive overlap):
  - client ignores seq <= last_seq_seen
- missing events (should not happen if backfill correct):
  - if seq jumps, client can call `/runs/{id}/events?from=...` to resync
- schema mismatch:
  - client logs error and shows “client out of date” banner
- server restarts:
  - reconnect/backfill works

---

## 9) Checklist for BL-002 (event type rollout)

Every new RunEventType change must update:

Backend
- enum (db/models)
- schema (pydantic)
- example payload fixture

Frontend
- generated TS types
- timeline filters
- PlanViewer mappings (if relevant)

CI
- contract test runs

