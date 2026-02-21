# UI/UX product spec (make it feel fast, trustworthy, controllable)

This is a buildable spec for the UI. It is intentionally detailed so a frontend lead can implement without guessing.

Core principle: the UI is event-driven. The UI “rebuilds” from RunEvents, not from ephemeral client state.

---

## 1) UX goals (what users should feel)

1) **Fast**: feedback within 200ms (spinner/progress), meaningful updates every 1–3 seconds while running.
2) **Trustworthy**: sources appear early, citations are clickable, failures are explicit not hidden.
3) **Controllable**: user can cancel, retry, resume, export, and see what’s happening.
4) **Predictable**: after refresh/reconnect, the UI is in the same state.

---

## 2) Competitive UX benchmarks (what “good” looks like)

SurfSense: positions as a team research + knowledge hub with citations and many integrations. It emphasizes “find, ask, act” and collaboration. Source:
- https://www.surfsense.com/
- https://github.com/Decentralised-AI/SurfSense-Open-Source-Alternative-to-NotebookLM

Claude Cowork: a “Tasks” mode in a desktop app, designed for autonomous work across files and apps. Source:
- https://support.claude.com/en/articles/13345190-getting-started-with-cowork

Takeaways to implement:
- “task mode” UI: visible plan + task statuses
- “what I’m doing” text: SUBAGENT_ACTION
- citations/sources as first-class UI
- connectors as a visible set of capabilities

---

## 3) Frontend architecture (assistant-ui + Zustand)

assistant-ui provides production-grade chat primitives:
- https://www.assistant-ui.com/docs
Runtimes:
- ExternalStoreRuntime (fits custom backend): https://www.assistant-ui.com/docs/runtimes/custom/external-store
- Picking a runtime: https://www.assistant-ui.com/docs/runtimes/pick-a-runtime

Recommendation:
- Use `ExternalStoreRuntime` to bridge your existing Zustand stores with assistant-ui components.
- Treat Zustand as your “state derivation layer” from RunEvents.

Why:
- assistant-ui handles scrolling, accessibility, streaming rendering
- Zustand keeps derived state explicit and testable
- you avoid tangled component state.

---

## 4) Core screens and flows

### 4.1 Chat screen (primary)

Layout:
- left: conversation/chat thread
- right: side panel with tabs:
  - Plan
  - Sources
  - Timeline
  - Deliverables

Top bar:
- tenant/workspace selector (later)
- model selector (optional)
- run budget indicator

Input area:
- DeliverableSelector (Report/Website/Slides/Document)
- text input
- send
- stop/cancel

### 4.2 Run lifecycle UX

State: idle
- user types question
- selects deliverable_type (optional default)

State: running
- show PlanViewer immediately after PLAN_CREATED
- show ProgressOverlay (lightweight)
- show sources “pending” as they are discovered
- show partial report preview in ReportPanel (if report) per REPORT_PREVIEW_* events

State: needs clarification
- show ClarificationBanner with question
- disable send box (or switch send to “answer clarification”)
- preserve plan/task state
- after submit, reconnect SSE and continue

State: completed
- show final deliverable
- show export actions
- show run summary (cost, duration, sources used)
- allow “rerun with changes” (optional)

State: failed
- show error banner with “what happened” and next steps
- preserve partial outputs if any
- offer retry (new run) and “download logs” (events)

State: cancelled
- show “stopped” state
- preserve partial outputs
- allow “resume” only if graph supports it (usually no; resume is for clarification)

---

## 5) UI components (build specs)

### 5.1 DeliverableSelector

- location: chat input area
- default: null (or last used)
- options: Report, Website, Slides, Document
- behavior: sets `deliverable_type` on the next user message
- state stored in DeliverableStore (Zustand)

Acceptance:
- persists selection per conversation (optional)
- resets after run completes (configurable)

### 5.2 PlanViewer (task mode)

Inputs:
- PLAN_CREATED event payload (PlanSet)
- PLAN_TASK_UPDATED events

Render:
- grid of TaskCards
- each card shows:
  - title
  - status badge
  - elapsed timer
  - latest “what I’m doing” subtext from SUBAGENT_ACTION
  - optional progress bar (simple: pending/processing/creating_notes/success/error)

Rules:
- tasks are created only once from PLAN_CREATED
- status updates are idempotent: only apply if seq increases

### 5.3 ProgressOverlay (fast feel)

Driven by:
- REPORT_PREVIEW_START/DELTA/DONE
- SUBAGENT_ACTION (for generic progress text)

Behavior:
- single continuous progress bar (0–100) that does not reset
- progress increases on each preview done event
- overlay can collapse into a compact “running…” pill

### 5.4 SourcesPanel

assistant-ui already has a Sources UI primitive:
- https://www.assistant-ui.com/docs/ui/sources

Your SourcesPanel should support:
- “Pending” sources (loading)
- “Cited” sources (used in report)
- “All sources” (seen by tools)

Data:
- WEB_PAGE entities from entity API
- REFERENCES_FOUND events for citations

UX:
- show favicon + title + domain
- open external link in new tab
- show snippet or extracted highlights (optional)
- show which section/task used the source (later)

### 5.5 RunTimeline

A chronological log of events.
- should allow filtering:
  - tool calls only
  - errors/warnings only
  - plan/task only
  - deliverable generation only

Performance:
- virtualize list for long runs
- do not re-render entire list on each delta (use memoization)

### 5.6 ReportPanel (separate from chat thread)

DEC-043: report rendered in separate panel, not in chat Thread.

ReportPanel responsibilities:
- render MarkupDocument JSON into components
- charts rendered via Plotly
- inline citations clickable and open SourcesPanel to the source

Also:
- handle streaming preview:
  - show sections as they arrive
  - show skeletons for not-yet-generated sections
  - smooth scroll to current section (optional)

### 5.7 WebsitePreview (iframe)

DEC-035 iframe-only v1.
- iframe src points to authenticated endpoint serving website bundle
- show loading state
- show “open in new tab” (still authenticated)

### 5.8 Export actions

- button: Export PDF / Export DOCX
- show modal with:
  - format choice
  - progress indicator (export can be slow)
  - error handling
- download should be a standard file download with auth

### 5.9 Billing UI (minimal v1)

- show plan + quota remaining
- checkout button (Stripe test mode)
- usage table (runs per month)

---

## 6) Event-to-UI mapping table (partial)

PLAN_CREATED → PlanViewer initializes tasks
PLAN_TASK_UPDATED → update a task card
SUBAGENT_ACTION → PlanViewer subtext + ProgressOverlay text
PENDING_SOURCES → SourcesPanel shows loading source row
REFERENCES_FOUND → SourcesPanel marks source as cited
REPORT_PREVIEW_START → ProgressOverlay state begins; ReportPanel creates section placeholder
REPORT_PREVIEW_DELTA → ReportPanel appends section content
REPORT_PREVIEW_DONE → ReportPanel finalizes section; ProgressOverlay increments
ARTIFACT_CREATED → Deliverables tab shows new artifact
RUN_COMPLETED → show summary + export actions
RUN_FAILED/ERROR → show failure banner + preserve partial

---

## 7) UX for failure modes (explicit, not hidden)

### 7.1 Tool failure (web search rate limit)

- show task card state “error”
- show banner “Web search rate limited; continuing with partial sources”
- SourcesPanel shows the failed source with error badge
- run continues unless critical

### 7.2 Budget exceeded

- show banner “Stopped due to run budget limit”
- show partial deliverable if available
- show suggestion: “reduce scope” or “increase plan”

### 7.3 Clarification needed

- show ClarificationBanner with clear question and optional choices
- disable other interactions that would create a new run
- preserve current progress UI

### 7.4 Connection drop

- show “Reconnecting…” toast
- reconnect using Last-Event-ID
- no loss of state

---

## 8) Accessibility and polish

- keyboard navigation for the entire chat + panels
- ARIA for streaming updates (“new content available”)
- reduce motion toggle for auto-scrolling
- color contrast for status badges
- timestamps in local timezone but store UTC

assistant-ui already handles some accessibility; don’t break it.

---

## 9) Performance targets (feels fast)

- first visible feedback: < 200ms (local UI)
- first server event: < 1s
- plan created: < 5s
- tasks update cadence: ~1–3s
- report preview: section updates every ~5–15s depending on length

To hit these:
- start streaming early (SUBAGENT_ACTION at start of every node)
- avoid long “silent” tool calls: emit TOOL_CALL_STARTED immediately
- show pending sources early.

