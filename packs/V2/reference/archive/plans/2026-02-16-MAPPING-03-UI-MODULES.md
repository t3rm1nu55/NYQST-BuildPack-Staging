# Mapping 03: UI Modules (Superagent → Intelli Frontend)

> **Date**: 2026-02-16
> **Status**: Definitive mapping — grounded in `nyqst-intelli-230126` UI codebase
> **Depends on**: Mapping 01 (Orchestrator), Mapping 02 (Deliverables)

---

## What Superagent's UI Has (Observed)

### Route Map
| Route | Purpose |
|---|---|
| `/` | Landing with prompt input, deliverable selector, use-case gallery, personalized suggestions |
| `/chat/[chatId]` | Core product: chat + streaming + plan viewer + subagent list + deliverable slide-outs |
| `/content-library` | Curated library reports (deferred for v1) |
| `/tasks` | Scheduled automations (deferred for v1) |
| `/account` | Settings, subscription, billing |
| `/share/[slug]` | Public share (deferred for v1) |
| `/admin` | Internal admin (deferred for v1) |

### Chat Page Component Architecture (from `[chatId]` chunk)

The chat page is the core product surface. It consists of:

1. **Message list** — AI and user messages with streaming support
2. **Chat input** — with deliverable type selector and file upload
3. **Plan viewer** — animated 3-phase planning visualization (plan → subagents → deliver)
4. **Subagent panel** — list of running/completed subagent tasks with progress
5. **Deliverable slide-outs** — side panels for report, slides, website, document preview
6. **Sources/Activity tabs** — per-message sources and activity timeline
7. **Replay bar** — for replaying completed runs
8. **Share button** — create public link
9. **Notification nudge** — prompt for push notification permission

### Streaming State
The chat page manages extensive streaming state:
- `activeStreamId`, `streamedMessage`, `streamedPlanSet`, `streamedToolEvents`
- `streamedPendingPlanSources`, `streamedReportPreviews`
- `nodeCurrentActions`, `nodeStartTimes`, `nodeToolProgress`
- `awaitingBrowserUserInput`, `browserAgentMessage`, `browserSessionId`

---

## What Intelli's UI Already Has

### Working Pages
| Page | Component | Status |
|---|---|---|
| Notebooks | `ui/src/pages/NotebooksPage.tsx` | **Working** — create pointer, upload files, advance manifest |
| Notebook Detail | `ui/src/pages/NotebookPage.tsx` | **Working** — file list, ask questions via RAG |
| Research | `ui/src/pages/ResearchPage.tsx` | **Working** — notebook selector + ChatPanel |

### Working Components
| Component | Status | Notes |
|---|---|---|
| `ChatPanel` | **Working** | `@assistant-ui/react-ui` + `@ai-sdk/react`, streaming, tool call display |
| `SourcesPanel` | **Working** | Shows RAG sources for citations |
| `RunTimeline` | **Working** | Shows tool calls, LLM calls, retrieval events from run ledger |
| `ui/src/components/ui/*` | **Working** | shadcn/ui primitives (Button, Card, Dialog, Input, Tabs, etc.) |

### Key Architectural Decisions Already Made
- `@assistant-ui/react` for chat UI (actively migrating, Feb 5 commit)
- AI SDK Data Stream Protocol for streaming (not NDJSON — already proven)
- Two SSE streams: chat (AI SDK) + run events (platform SSE)
- "Sources / Files / Activity" maps to existing primitives

---

## Definitive Mapping

### New UI Components Needed (Superagent → Intelli)

#### 1. PlanViewer (maps to Superagent's planning animation + subagent panel)

**Where**: `ui/src/components/plans/PlanViewer.tsx`

**Data source**: Run events (type `PLAN_CREATED`, `SUBAGENT_STARTED`, `SUBAGENT_PROGRESS`, `SUBAGENT_COMPLETED`) via existing `useRunEventStream` hook.

**UI spec**:
- Phase indicator: "Planning → Researching → Synthesizing → Generating"
- Task list: each subagent task with title, status badge, progress bar, duration
- Expand task to see sources found and result summary
- Animated transitions between phases (Framer Motion, consistent with existing UI)

**Does NOT need**: Lottie animations (Superagent uses custom Lottie files for brand — unnecessary for v1)

#### 2. DeliverableSelector (maps to Superagent's chat composer deliverable type control)

**Where**: `ui/src/components/chat/DeliverableSelector.tsx`

**Integration**: Slot into existing ChatPanel's composer area

**UI spec**:
- Segmented control or dropdown: Report | Website | Slides | Document
- Selected type passed as parameter when creating a Run
- Visual indicator in chat showing selected deliverable type

#### 3. ReportRenderer (maps to Superagent's GML renderer)

**Where**: `ui/src/components/reports/ReportRenderer.tsx`

**Data source**: NYQST Markup AST (JSON) stored as Artifact, fetched via artifact API

**UI spec**:
- Recursive React component: `MarkupNode → React element`
- Layout components: Row, PrimaryColumn, SidebarColumn, HalfColumn
- Content components: Heading, Paragraph, Blockquote, InsightBox, Table, List
- Data viz: ChartContainer (Plotly or Recharts), MetricCard, EventCard, Ticker
- References: Citation (clickable, links to SourcesPanel), ArtifactLink, DownloadLink

**Healing display**: If healer modified the AST, show subtle indicator (dev mode only)

#### 4. WebsitePreview (maps to Superagent's website slide-out)

**Where**: `ui/src/components/deliverables/WebsitePreview.tsx`

**Pattern**: Fetch website Artifacts via signed URLs → assemble as blob → render in sandboxed iframe

**UI spec**:
- Slide-out panel (full height, max-w-6xl)
- Sandboxed iframe with `sandbox="allow-scripts allow-same-origin"`
- Deploy button → calls deploy API → shows deployed URL
- Loading state with generation progress indicators

#### 5. SlidesPreview + DocumentPreview

**Where**: `ui/src/components/deliverables/SlidesPreview.tsx`, `DocumentPreview.tsx`

**Slides**: Paginated slide viewer. Arrow navigation, slide counter.
**Document**: PDF viewer (pdf.js) or download link for DOCX.

#### 6. Enhanced SourcesPanel

**Where**: Extend existing `ui/src/components/chat/SourcesPanel.tsx`

**Current**: Shows RAG document chunks
**Extension**: Also show web research sources (URL, title, favicon, relevance score, snippet)

**UI spec**:
- Tab or filter: "Documents" | "Web Sources"
- Each source: favicon + title + URL + snippet + relevance badge
- Click to expand full content
- Sort by relevance score

#### 7. Enhanced RunTimeline

**Where**: Extend existing `ui/src/components/runs/RunTimeline.tsx`

**Current**: Shows tool calls, LLM calls, retrieval events
**Extension**: Group events by plan phases. Show subagent cards with progress.

**UI spec**:
- Phase headers: "Planning", "Research (12 subagents)", "Synthesis", "Generation"
- Under each phase: event cards with icons, durations, status
- Expandable detail for each event

---

### Components NOT Needed for v1

| Superagent Component | Why Not Needed |
|---|---|
| OneSignal push notifications | Desktop app / internal tool — no push needed |
| Replay bar | Run events are already durable — replay UX can come later |
| Share system | Internal tool for now — no public sharing |
| Content library | Deferred per user decision |
| Scheduled tasks UI | Deferred per user decision |
| Browser agent panel | Deferred (Phase 6 in parity plan) |
| OTEL trace viewer | Langfuse observability already exists |

---

## Routing Changes

Current routes remain. Add:

| Route | Component | Purpose |
|---|---|---|
| `/research/:runId` | ResearchPage (enhanced) | View a specific research run with full deliverable |
| `/deliverable/:artifactId` | DeliverableViewer | Standalone deliverable viewer (report/website/slides/doc) |

These are additive — existing notebook/research pages continue working.

---

## State Management Additions

### New Zustand Store: `deliverableStore`

```typescript
interface DeliverableStore {
  // Selected deliverable type for next run
  selectedDeliverableType: 'report' | 'website' | 'slides' | 'document';
  setDeliverableType: (type: DeliverableType) => void;

  // Active deliverable preview
  activePreview: { runId: string; artifactId: string; type: DeliverableType } | null;
  openPreview: (preview: ActivePreview) => void;
  closePreview: () => void;
}
```

### Extended Run Event Hook

Extend `useRunEventStream` to parse new event types (plan, subagent, content) and provide structured data for PlanViewer and enhanced RunTimeline.

---

## Testing Strategy

| Test Type | What | How |
|---|---|---|
| **Component** | ReportRenderer | Snapshot tests with fixed AST fixtures → assert correct React output |
| **Component** | PlanViewer | Mock run events → assert phases render correctly |
| **Component** | DeliverableSelector | Assert type changes propagate to run creation |
| **Integration** | WebsitePreview | Real artifact fetch → assert iframe renders |
| **E2E** | Full chat → deliverable flow | Playwright: submit prompt → plan appears → report renders → citations clickable |

---

## Implementation Sequence

Aligned with parity plan phases:

**Phase 1 (alongside orchestrator work):**
- PlanViewer + enhanced RunTimeline — 5-7 days

**Phase 4 (deliverables v1):**
- DeliverableSelector — 1-2 days
- ReportRenderer (recursive AST → React) — 5-7 days
- Enhanced SourcesPanel — 2-3 days
- DocumentPreview — 1-2 days

**Phase 5 (deliverables v2):**
- WebsitePreview with blob/iframe — 3-5 days
- SlidesPreview — 3-5 days
