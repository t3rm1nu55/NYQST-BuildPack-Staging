# Frontend Architecture & State Management Extraction

**Date**: 2026-02-20
**Analyst**: Claude Opus 4.6 (Deep Content Extraction Agent)
**Source Files**: 10 comprehensive design documents analyzed
**Confidence**: CONFIRMED (production codebase), INFERRED (patterns), SPECULATED (future extensions)

---

## 1. Component Inventory

### 1.1 Existing Components (nyqst-intelli-230126)

#### Chat UI Components
- `ChatPanel.tsx` — Main chat interface using `@assistant-ui/react`
- `CitationAwareText.tsx` — Renders text with inline citation links
- `CitationLink.tsx` — Clickable citation component (links to sources)
- `SourcesPanel.tsx` — Sidebar showing citation sources (web URLs, documents)
- `SourcesSidebar.tsx` — Alternative sources layout variant
- `message-feedback.tsx` — Thumbs up/down rating on messages
- `message-metadata.tsx` — Displays message timestamp, model info, tokens
- `branch-indicator.tsx` — Shows conversation branching (multiple responses)
- `tool-uis.tsx` — Renders tool call outputs (makeAssistantToolUI pattern)

#### Run Management Components
- `RunTimeline.tsx` — Linear timeline of run events (tool calls, LLM calls, etc.)
- `RunViewer.tsx` — Container for run detail view

#### Content Viewers
- `ArtifactViewer.tsx` — Generic artifact browser (blobs, downloads)
- `ManifestViewer.tsx` — Tree view of manifest entries
- `PointerViewer.tsx` — Pointer history and resolution viewer
- `NotebookPanel.tsx` — Notebook/RAG documents view

#### Layout & Navigation
- `Workbench.tsx` — Main IDE-like multi-pane layout
- `WorkbenchHeader.tsx` — Top bar with search, user menu
- `DetailsPanel.tsx` — Right sidebar for resource details
- `ExplorerPanel.tsx` — Left sidebar for resource browsing
- `MainPanel.tsx` — Central content area
- `TimelinePanel.tsx` — Activity timeline panel

#### Auth
- `AuthGuard.tsx` — Route protection wrapper
- `LoginPage.tsx` — Login form

### 1.2 New Components (v1 Required)

#### BL-007: PlanViewer Component
**File**: `ui/src/components/plans/PlanViewer.tsx`
**Purpose**: Display plan phases and task progress
**Hierarchy**:
```
PlanViewer
├─ PhaseIndicator (e.g., "Research Phase 1 of 3")
├─ TaskList
│  ├─ TaskCard (per task)
│  │  ├─ TaskId (left-aligned sequential number)
│  │  ├─ TaskTitle (bold, multi-line)
│  │  ├─ TaskStatus (ALL CAPS badge: "PROCESSING" | "CREATING_NOTES")
│  │  ├─ ElapsedTime (M:SS format, right side)
│  │  ├─ ProgressBar (bottom of card)
│  │  └─ LeftBorder (color-coded category)
└─ CompletedSection (collapsed, shows completed tasks)
```
**State**: Connected to `runStore` → SSE events → task updates
**Styling**: Card layout with left color border (4+ category colors: orange, blue, pink, green)

#### BL-008: DeliverableSelector Component
**File**: `ui/src/components/chat/DeliverableSelector.tsx`
**Purpose**: Segmented control in chat input for deliverable type
**Props**:
```typescript
type DeliverableSelectorProps = {
  value: 'standard' | 'report' | 'website' | 'slides' | 'document'
  onChange: (type: string) => void
  disabled?: boolean
}
```
**State**: Connected to `deliverableStore` (Zustand)
**UI**: Segmented/tab buttons, no modal

#### BL-009: ReportRenderer Component
**File**: `ui/src/components/reports/ReportRenderer.tsx`
**Purpose**: Recursive MarkupNode → React element renderer
**Inputs**: JSON AST from `node_report_preview_done` SSE event
**Outputs**: React elements (text, charts, tables, citations)
**Dependencies**: BL-004 (NYQST Markup AST schema)
**Integration**: Uses `rehype-to-JSX` pipeline (LIB-18/19/20)

#### BL-010: WebsitePreview Component
**File**: `ui/src/components/deliverables/WebsitePreview.tsx`
**Purpose**: Render website deliverable in iframe
**Logic**:
```typescript
1. Fetch artifact by SHA256 from artifact API
2. Create blob URL from artifact bytes
3. Render in sandboxed <iframe>
4. Handle artifact download fallback
```
**v1 Scope**: iframe-only, no unauthenticated `/website/[id]` route (DEC-044)

#### BL-011: Enhanced SourcesPanel
**File**: Extend `ui/src/components/chat/SourcesPanel.tsx`
**Changes**:
- Add tab for "Web Sources" (Brave Search results)
- New fields per web source: `url`, `title`, `favicon`, `relevance_score`, `snippet`
**State**: References from `sources` SSE event + web search results from BL-003

#### BL-014: Enhanced RunTimeline
**File**: Extend `ui/src/components/runs/RunTimeline.tsx`
**Changes**:
- Group events by plan phase (planner → research → synthesis → deliverable)
- Embed PlanViewer (BL-007) to show subagent cards
- Show continuous progress bar across all phases
**Integration**: SSE `task_update`, `node_*` event stream

#### BL-020: Generation Progress Overlay
**File**: `ui/src/components/generation/GenerationOverlay.tsx`
**Purpose**: Full-screen overlay during deliverable generation
**Layout**:
```
┌─────────────────────────────────┐
│                                 │
│     Generating output...        │ ← Primary heading (large, bold)
│                                 │
│ ████████████████░░░░░░░░░░░░   │ ← Continuous progress bar
│                                 │
│  Polishing typography...        │ ← Secondary substep (gray)
│                                 │
└─────────────────────────────────┘
```
**State**: Updated by `node_report_preview_delta` SSE events
**Progress**: Single continuous bar (not reset per substep)

### 1.3 Component Hierarchy Diagram

```
App
├─ Workbench (IDE-like multi-pane)
│  ├─ WorkbenchHeader
│  │  ├─ Search
│  │  ├─ UserMenu
│  │  └─ ContextBreadcrumb
│  ├─ ExplorerPanel (left sidebar)
│  │  └─ ResourceTree
│  ├─ MainPanel
│  │  ├─ ChatPanel
│  │  │  ├─ MessageList
│  │  │  │  ├─ MessageGroup
│  │  │  │  │  ├─ UserMessage
│  │  │  │  │  └─ AIMessage
│  │  │  │  │     ├─ CitationAwareText
│  │  │  │  │     ├─ ReportRenderer (NEW - BL-009)
│  │  │  │  │     └─ WebsitePreview (NEW - BL-010)
│  │  │  ├─ ChatInput
│  │  │  │  ├─ TextArea
│  │  │  │  ├─ FileUploadButton
│  │  │  │  ├─ DeliverableSelector (NEW - BL-008)
│  │  │  │  └─ SendButton
│  │  │  └─ EnhancedSourcesPanel (BL-011 updated)
│  │  │     ├─ SourcesTab
│  │  │     ├─ FilesTab
│  │  │     └─ ActivityTab (shows PlanViewer - BL-007)
│  │  ├─ EnhancedRunTimeline (BL-014 updated)
│  │  │  └─ PlanViewer (NEW - BL-007)
│  │  │     └─ TaskCard[] (color borders, progress)
│  │  ├─ RunViewer
│  │  └─ ArtifactViewer / ManifestViewer / PointerViewer
│  └─ DetailsPanel (right sidebar)
│     ├─ ResourceDetails
│     └─ ContextPinboard
├─ GenerationOverlay (NEW - BL-020)
│  ├─ PrimaryStatus
│  ├─ ProgressBar
│  ├─ SecondaryStatus
│  └─ SubagentTaskQueue
└─ Auth (AuthGuard, LoginPage)
```

---

## 2. Zustand Store Catalog

### 2.1 Existing Stores (nyqst-intelli-230126)

#### auth-store.ts
```typescript
interface AuthState {
  // User identity
  userId: string | null
  userEmail: string | null
  accessToken: string | null

  // Actions
  setUser: (user: { id: string; email: string }) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({...}),
    { name: 'auth-store' }  // localStorage
  )
)
```
**Persistence**: localStorage (JWT tokens)
**Usage**: Auth guard, API client headers

#### conversation-store.ts
```typescript
interface ConversationState {
  // Conversation list
  conversations: Conversation[]
  currentConversationId: string | null

  // Actions
  addConversation: (c: Conversation) => void
  setCurrentConversation: (id: string) => void
  deleteConversation: (id: string) => void
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({...}),
    { name: 'conversation-store' }
  )
)
```

#### workbench-store.ts
```typescript
interface WorkbenchState {
  // Layout
  layout: {
    leftPaneWidth: number      // Pixels or %
    rightPaneWidth: number
    mainPaneHeight: number
  }

  // Panel visibility
  showExplorer: boolean
  showDetails: boolean

  // Current resource
  activeResourceUri: string | null  // "run://123", "artifact://sha256", etc.

  // Pinned resources
  pinnedResources: string[]

  // Actions
  setLayout: (l: typeof layout) => void
  toggleExplorer: () => void
  toggleDetails: () => void
  setActiveResource: (uri: string) => void
  pinResource: (uri: string) => void
  unpinResource: (uri: string) => void
}

export const useWorkbenchStore = create<WorkbenchState>()(
  devtools(
    persist(
      immer((...a) => ({...})),
      { name: 'workbench-store' }
    )
  )
)
```
**Middleware**: devtools, persist, immer
**Why immer**: Complex nested state (layout, pinned resources)

#### run-store.ts
```typescript
interface RunState {
  // Current run
  activeRunId: string | null
  runStatus: 'idle' | 'running' | 'paused' | 'done' | 'error'

  // Run events (SSE stream)
  events: RunEvent[]

  // Async entity tracking
  pendingAsyncEntities: {
    [entityId: string]: 'pending' | 'done'
  }

  // Actions
  setActiveRun: (id: string) => void
  addEvent: (e: RunEvent) => void
  setStatus: (s: RunState['runStatus']) => void
  markAsyncEntityDone: (id: string) => void
}

export const useRunStore = create<RunState>()(
  devtools((set) => ({...}))
)
```
**No persistence**: Run state is transient (reloaded from API)
**Pattern**: Immutable append for events

#### tour-store.ts
```typescript
interface TourState {
  // Onboarding state
  currentTourStep: number
  tourCompleted: boolean

  // Actions
  nextStep: () => void
  skipTour: () => void
  completeTour: () => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({...}),
    { name: 'tour-store' }
  )
)
```

### 2.2 New Stores (v1 Required)

#### BL-015: DeliverableStore
**File**: `ui/src/stores/deliverableStore.ts`
**Purpose**: Track selected deliverable type and preview state
```typescript
interface DeliverableState {
  // Selection
  selectedType: 'standard' | 'report' | 'website' | 'slides' | 'document'

  // Preview state
  previewMode: boolean
  currentPreviewContent: string | null

  // Async generation
  isGenerating: boolean
  generationProgress: number  // 0-100

  // Actions
  setSelectedType: (type: string) => void
  setPreviewMode: (enabled: boolean) => void
  setGenerationProgress: (p: number) => void
  startGeneration: () => void
  completeGeneration: (content: string) => void
}

export const useDeliverableStore = create<DeliverableState>()(
  devtools((set) => ({
    selectedType: 'standard',
    previewMode: false,
    currentPreviewContent: null,
    isGenerating: false,
    generationProgress: 0,

    setSelectedType: (type) => set({ selectedType: type }),
    setPreviewMode: (enabled) => set({ previewMode: enabled }),
    setGenerationProgress: (p) => set({ generationProgress: p }),
    startGeneration: () => set({ isGenerating: true, generationProgress: 0 }),
    completeGeneration: (content) => set({
      isGenerating: false,
      generationProgress: 100,
      currentPreviewContent: content,
    }),
  }))
)
```
**Dependency**: Synced with ChatPanel user message `deliverable_type` field

#### ReportStore (Implicit - part of Enhanced RunTimeline)
**Purpose**: Cache GML content from SSE events
```typescript
interface ReportState {
  // Streaming content
  reportContent: string  // GML HTML
  reportMetadata: {
    reportId: string
    createdAt: string
    hasImages: boolean
    wordCount: number
  } | null

  // Rendering
  isRendering: boolean
  renderError: string | null

  // Actions
  updateContent: (gml: string) => void
  setMetadata: (m: typeof reportMetadata) => void
  clearReport: () => void
}
```
Integrated into run-store as a nested slice.

---

## 3. Layout Architecture

### 3.1 Page Structure

#### Chat Page (`/chat/[conversationId]`)
**Purpose**: Primary user interface for research + deliverable generation
**Layout**: Workbench (4-pane IDE)
```
┌──────────────────────────────────────────────────────┐
│ Header: Search │ Breadcrumb │ User │ Settings        │
├───┬────────────────────────────────────────────┬────┤
│ E │                                            │ D  │
│ x │  Main: ChatPanel / RunViewer               │ e  │
│ p │  ┌──────────────────────────────────────┐ │ t  │
│ l │  │ Messages (scrollable)                │ │ a  │
│ o │  │ - UserMsg + DeliverableSelector      │ │ i  │
│ r │  │ - AIMsg + CitationAwareText          │ │ l  │
│ e │  │ - AIMsg + ReportRenderer (BL-009)    │ │ s  │
│ r │  │ - AIMsg + WebsitePreview (BL-010)    │ │ P  │
│   │  └──────────────────────────────────────┘ │ a  │
│   │  ┌──────────────────────────────────────┐ │ n  │
│   │  │ ChatInput + DeliverableSelector      │ │ e  │
│   │  │ + FileUpload + Send                  │ │ l  │
│   │  └──────────────────────────────────────┘ │    │
│   │                                            │    │
│   │  ┌──────────────────────────────────────┐ │    │
│   │  │ EnhancedRunTimeline (BL-014) +       │ │    │
│   │  │ PlanViewer (BL-007)                  │ │    │
│   │  │ - Phase indicator                    │ │    │
│   │  │ - TaskCard[] with progress bars      │ │    │
│   │  └──────────────────────────────────────┘ │    │
├───┴────────────────────────────────────────────┴────┤
│ StatusBar: Active run │ Tokens │ Connection status  │
└──────────────────────────────────────────────────────┘
```

**Left Pane (Explorer)**: Resource tree (archived runs, templates, examples)
**Main Pane**: ChatPanel + RunTimeline + Artifact viewers (tabs)
**Right Pane (Details)**: SourcesPanel (BL-011) + ContextPinboard
**Overlay**: GenerationOverlay (BL-020) during generation

#### Analysis/Decision/Notebook Pages
**Purpose**: Secondary views for different research phases (deferred to v1.5+)
**Placeholder**: ModulePlaceholder.tsx
**State**: Accessible via `/analysis/[runId]`, `/decisions/[runId]`, etc.

### 3.2 Responsive Behavior

**Breakpoint**: Tailwind `@3xl:` (~1536px desktop)

**Mobile**: All panes stack vertically
```typescript
// PaneContainer.tsx pattern
className={`
  flex flex-col              // mobile: vertical
  @3xl:grid                  // desktop: grid
  @3xl:grid-cols-[300px_1fr_400px]  // explorer | main | details
`}
```

**Collapsible Panes**:
- Left: Click "Explorer" button to collapse (hamburger icon)
- Right: Click "Details" button to collapse
- State persisted in `workbench-store`

### 3.3 Sticky Headers/Footers

**Chat Input**: Sticky bottom
```typescript
<div className="sticky bottom-0 bg-white border-t">
  {/* ChatInput with DeliverableSelector */}
</div>
```

**Status Bar**: Sticky bottom (below chat input)
```typescript
<div className="sticky bottom-0 flex justify-between px-4 py-2 bg-gray-50 text-xs">
  <span>Active run: {activeRunId}</span>
  <span>Tokens: {tokenUsage}</span>
  <span>Status: {connectionStatus}</span>
</div>
```

---

## 4. @assistant-ui/react Integration

### 4.1 How Chat UI Hooks into Components

**Current Implementation**: intelli uses `@assistant-ui/react-ui` (v0.2.1)

```typescript
// ChatPanel.tsx
import { Thread, Composer, ChatModelAdapter } from "@assistant-ui/react-ui"

const ChatPanel = () => {
  // Custom adapter for our backend
  const adapter: ChatModelAdapter = {
    async *run({ messages, abortSignal }) {
      // POST to /api/v1/agent/chat
      // Yield message chunks for streaming
      const response = await fetch("/api/v1/agent/chat", {
        method: "POST",
        body: JSON.stringify({ messages }),
        signal: abortSignal,
      })

      let text = ""
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value)
        yield { content: [{ type: "text", text }] }
      }
    },
  }

  return (
    <AssistantRuntimeProvider adapter={adapter}>
      <Thread />
      <Composer />
    </AssistantRuntimeProvider>
  )
}
```

### 4.2 Citation Handling

**Citation Binding Flow**:
```
1. SSE event: { type: "references_found", references: [Entity] }
2. Store: runStore.events.push(event)
3. CitationAwareText detects [citation-id]
4. Lookup: references.find(r => r.id === 'citation-id')
5. Render: CitationLink component with metadata
```

**CitationLink Props**:
```typescript
interface CitationLinkProps {
  identifier: string        // "entity-abc-123"
  entity: Entity           // { id, type, title, url, snippet }
  onHover?: () => void     // Show source preview
}
```

### 4.3 SourcesPanel Context

**Hook**: `use-thread-sources` (custom)
```typescript
function useThreadSources() {
  const { messages } = useThread()  // From @assistant-ui/react
  const references = useRunStore(s => s.references)

  // Extract all citations from messages
  const citationIds = messages
    .flatMap(m => extractCitationIds(m.content))

  // Resolve to full entities
  const sources = citationIds
    .map(id => references.find(r => r.id === id))
    .filter(Boolean)

  return sources
}
```

Used by `SourcesPanel.tsx` to display filterable source list.

---

## 5. shadcn/ui Component Usage

### 5.1 Installed Components (v1)

| Component | Use Case | Where |
|-----------|----------|-------|
| `button` | Send, Cancel, Download | ChatInput, ActionBar, cards |
| `badge` | Status labels | RunTimeline events, TaskCard |
| `card` | Container for UI sections | TaskCard, artifact previews |
| `dialog` | Modals (confirm delete, etc.) | AppActions |
| `sheet` | Side panels | Right pane (DetailsPanel) |
| `tabs` | SourcesPanel sections | SourcesPanel (Sources \| Files \| Activity) |
| `progress` | Progress bars | GenerationOverlay, TaskCard |
| `scroll-area` | Scrollable lists | MessageList, TaskList |
| `separator` | Visual dividers | Section breaks in reports |
| `table` | Data tables in artifacts | Manifest viewer |
| `dropdown-menu` | Context menus | Message actions (copy, delete) |
| `alert` | Alerts & warnings | Error messages, clarification requests |

### 5.2 Customization Patterns

**Theme Variables** (Tailwind CSS):
```css
/* From src/index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.6%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  /* etc. */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 0 0% 3.6%;
    --foreground: 0 0% 98%;
    /* etc. */
  }
}
```

**Component Override**:
```tsx
// TaskCard.tsx - custom styling on shadcn card
import { Card } from "@/components/ui/card"

export const TaskCard = ({ task }) => (
  <Card className="border-l-4 border-orange-500">
    {/* custom content */}
  </Card>
)
```

---

## 6. ReportPanel Architecture (DEC-043, DEC-015b)

### 6.1 Separation from @assistant-ui Thread

**Why**: GML is not a chat message format; it's a structured document format that needs separate rendering.

```typescript
// ChatPanel.tsx structure
<div className="flex">
  <div className="flex-1">
    <Thread />            {/* @assistant-ui - handles text, tool calls */}
    <Composer />          {/* Chat input */}
  </div>

  <ReportPanel />        {/* Separate - renders GML from SSE events */}
</div>
```

### 6.2 GML Rendering Pipeline (BL-009 - ReportRenderer)

**Input**: GML HTML string from SSE event `node_report_preview_done`

**Pipeline**:
```
GML HTML string
  ↓
rehype-parse (LIB-19)
  → HAST (Hypertext Abstract Syntax Tree)
  ↓
unified processor with rehype-react (LIB-20)
  → Component map (gml-chart → GmlChart, etc.)
  ↓
React elements
  ↓
Browser render
```

### 6.3 Component Map (rehype-react)

```typescript
// ReportRenderer.tsx
const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeReact, {
    createElement,
    Fragment,
    components: {
      // Layout
      'gml-row': GmlRow,
      'gml-primarycolumn': GmlPrimaryColumn,
      'gml-sidebarcolumn': GmlSidebarColumn,
      'gml-halfcolumn': GmlHalfColumn,

      // Content
      'gml-chartcontainer': GmlChart,
      'gml-gradientinsightbox': GmlInsightBox,
      'gml-infoblockmetric': GmlMetricCard,
      'gml-infoblockevent': GmlEventCard,
      'gml-infoblockstockticker': GmlStockTicker,
      'gml-inlinecitation': GmlCitation,
      'gml-blockquote': GmlBlockQuote,
      'gml-downloadfile': GmlDownloadButton,

      // Deliverables
      'gml-viewreport': GmlViewReport,
      'gml-viewwebsite': GmlViewWebsite,
      'gml-viewpresentation': GmlViewPresentation,
      'gml-viewgenerateddocument': GmlViewDocument,
    },
  })

export const ReportRenderer = ({ gmlContent }: Props) => {
  const result = processor.processSync(gmlContent)
  return result.result  // React elements
}
```

### 6.4 GML Components (18 Tags)

#### Layout Containers
1. `gml-row` — flex container, responsive stacking
2. `gml-primarycolumn` — 3/4 width on desktop, full mobile
3. `gml-sidebarcolumn` — 1/4 width on desktop, full mobile
4. `gml-halfcolumn` — 50% width

#### Content Widgets
5. `gml-chartcontainer` — Plotly chart embed
6. `gml-gradientinsightbox` — Callout box with gradient border
7. `gml-infoblockmetric` — KPI card (label + value)
8. `gml-infoblockevent` — Timeline event
9. `gml-infoblockstockticker` — Stock price ticker
10. `gml-inlinecitation` — Citation reference
11. `gml-blockquote` — Styled blockquote
12. `gml-downloadfile` — Download button

#### Deliverable Viewers
13. `gml-viewreport` — Embed another report
14. `gml-viewwebsite` — Website preview link
15. `gml-viewpresentation` — Slides preview
16. `gml-viewgenerateddocument` — Document viewer
17. `gml-components` — Subcomponent registry
18. `gml-header-elt` — Header element wrapper

### 6.5 SSE Event Integration

```typescript
// ReportStore slice
const reportSlice: StateCreator = (set) => ({
  reportContent: null,
  reportMetadata: null,
  isRendering: false,

  // Streaming updates
  onReportPreviewStart: (event) => set({
    reportContent: '',
    reportMetadata: event.metadata,
    isRendering: true,
  }),

  onReportPreviewDelta: (delta) => set((state) => ({
    reportContent: (state.reportContent || '') + delta,
  })),

  onReportPreviewDone: (event) => set({
    reportContent: event.content,
    isRendering: false,
  }),
})
```

**Event Flow**:
```
SSE stream (GET /api/v1/streams/runs/{run_id})
  ↓
{ type: "node_report_preview_start", ... }
  ↓ (store: set rendering = true)
{ type: "node_report_preview_delta", delta: "..." }
  ↓ (store: append delta to content)
{ type: "node_report_preview_done", content: "..." }
  ↓ (store: set final content, rendering = false)
ReportRenderer receives content
  ↓
unified processor parses + renders
  ↓
React elements displayed in browser
```

---

## 7. DeliverableSelector Pattern

### 7.1 Component Interface

```typescript
// DeliverableSelector.tsx
interface DeliverableSelectorProps {
  value: 'standard' | 'report' | 'website' | 'slides' | 'document'
  onChange: (type: string) => void
  disabled?: boolean
}

export const DeliverableSelector = ({ value, onChange, disabled }: Props) => (
  <Tabs value={value} onValueChange={onChange} disabled={disabled}>
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="standard">Standard</TabsTrigger>
      <TabsTrigger value="report">Report</TabsTrigger>
      <TabsTrigger value="website">Website</TabsTrigger>
      <TabsTrigger value="slides">Slides</TabsTrigger>
      <TabsTrigger value="document">Document</TabsTrigger>
    </TabsList>
  </Tabs>
)
```

### 7.2 Store Synchronization (DEC-023)

**Data Model**: `deliverable_type` belongs on user `Message`, not Conversation

```typescript
// Backend: UserMessage schema
type UserMessage = {
  id: string
  conversationId: string
  role: "user"
  content: string
  deliverable_type?: "standard" | "report" | "website" | "slides" | "document"
  createdAt: string
}
```

**Frontend Store Sync**:
```typescript
// ChatPanel.tsx
const selectedDeliverableType = useDeliverableStore(s => s.selectedType)

const handleSendMessage = async (content: string) => {
  const userMessage: UserMessage = {
    id: uuid(),
    conversationId: currentConversationId,
    role: "user",
    content,
    deliverable_type: selectedDeliverableType,
    createdAt: new Date().toISOString(),
  }

  // POST to backend, SSE stream response
}
```

### 7.3 UI Placement

**Location**: Bottom of ChatInput, before Send button

```tsx
<div className="flex gap-2">
  <div className="flex-1">
    <TextArea value={input} onChange={setInput} />
  </div>
  <div className="flex flex-col gap-2">
    <DeliverableSelector
      value={selectedType}
      onChange={setSelectedType}
    />
    <Button onClick={send}>Send</Button>
  </div>
</div>
```

---

## 8. SSE Event → UI Update Flow

### 8.1 SSE Connection (PG LISTEN/NOTIFY)

**Endpoint**: `GET /api/v1/streams/runs/{run_id}`

```typescript
// useSSE.ts hook
function useRunEventStream(runId: string) {
  const [events, setEvents] = useState<RunEvent[]>([])
  const runStore = useRunStore()

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/v1/streams/runs/${runId}`
    )

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[SSE]', data.type)

        // Update store
        runStore.addEvent(data)

        // Route to handlers
        switch(data.type) {
          case 'task_update':
            runStore.updateTask(data.key, data)
            break
          case 'node_report_preview_delta':
            reportStore.onReportPreviewDelta(data.delta)
            break
          case 'node_report_preview_done':
            reportStore.onReportPreviewDone(data)
            break
          case 'references_found':
            runStore.addReferences(data.references)
            break
          // ... other event types
        }
      } catch (e) {
        console.error('SSE parse error', e)
      }
    }

    return () => eventSource.close()
  }, [runId])
}
```

### 8.2 Event Types (22 Total)

**From Superagent/intelli parity analysis**:

| Event Type | Payload | Handler |
|------------|---------|---------|
| `stream_start` | chat_id, user_id, workspace_id | Initialize run context |
| `heartbeat` | (empty) | Watchdog timer reset |
| `done` | has_async_entities_pending | Mark run complete |
| `ERROR` | error_type, error_message | Show error banner |
| `message_delta` | delta (text chunk) | Append to current message |
| `ai_message` | message (structured) | Add complete message |
| `message_is_answer` | is_answer (boolean) | Flag in metadata |
| `chat_title_generated` | title | Update conversation name |
| `clarification_needed` | message | Pause run, show input prompt |
| `task_update` | key, message, status, progress | Update PlanViewer card |
| `pending_sources` | sources[] | Update SourcesPanel |
| `node_tools_execution_start` | node_id, total_tools | Start tool execution UI |
| `node_tool_event` | tool_name, status | Update individual tool |
| `update_subagent_current_action` | current_action | Show current step |
| `node_report_preview_start` | entity, preview_id | Start GML streaming |
| `node_report_preview_delta` | delta | Append GML |
| `node_report_preview_done` | content, entity | Complete report |
| `references_found` | references[] | Update SourcesPanel |
| `browser_use_start` | browser_session_id, url | Show browser automation UI |
| `browser_use_stop` | browser_session_id | Hide browser UI |
| `browser_use_await_user_input` | agent_message | Pause for user |
| `update_message_clarification_message` | update { chat_message_id, needs_clarification_message } | Update clarification state |

### 8.3 Parallel Update Pattern

**Multiple SSE streams** (DEC-021):
```
┌─ Chat Stream (AI SDK Data Stream Protocol)
│  ├─ content chunks
│  ├─ tool calls
│  └─ completion
│
└─ Run Event Stream (PG LISTEN/NOTIFY)
   ├─ task_update (for PlanViewer)
   ├─ node_report_preview_* (for ReportPanel)
   ├─ references_found (for SourcesPanel)
   └─ token_usage (for status bar)
```

**Sync Point**: Both streams feed into single run-store state tree.

---

## 9. Dify Frontend Comparison

### 9.1 Differences from Dify

| Aspect | Dify | intelli/NYQST |
|--------|------|------------------|
| **Routing** | Next.js 15 App Router | React Router v6 |
| **State Management** | Zustand + Jotai + Context (6 layers) | Zustand + Context (3 layers) |
| **Chat UI** | Custom `Chat` component | @assistant-ui/react |
| **Streaming** | AI SDK (Vercel) | Server-Sent Events (custom) |
| **Report Rendering** | GML parser (custom 16 components) | GML → unified/rehype → React |
| **Form Handling** | React Hook Form + TanStack Form | React Hook Form (primary) |
| **URL State** | nuqs (URL query params) | Local store (can add nuqs) |
| **Test Framework** | Jest + Happy DOM | (Not yet specified in codebase) |
| **Animation** | Framer Motion | (None specified; CSS-based) |
| **i18n** | i18next + server-side | (TBD; English MVP) |

### 9.2 Learnings from Dify

1. **Message Tree**: Dify's `ChatItemInTree` structure enables branching/regeneration
   - **Lesson**: Implement sibling navigation in intelli chat (mark responses with generation index)

2. **Context Optimization**: Dify uses `use-context-selector` to prevent unnecessary re-renders
   - **Lesson**: Apply selector pattern to all Zustand stores

3. **Async Entity Creation** (DEC-017): Dify confirms async workflow outputs
   - **Pattern**: Mark run with `has_async_entities_in_progress`, poll for completion

4. **Message Feedback**: Dify's `message-feedback.tsx` (thumbs up/down) is reusable
   - **Lesson**: Same pattern in intelli for LLM output feedback

5. **Service Hooks**: Dify wraps TanStack Query in custom hooks
   - **Pattern**: `useGetInstalledAppParams()` → centralizes API logic

---

## 10. Reusable Patterns

### 10.1 Store Creation Pattern

```typescript
// Reusable Zustand store factory
function createStore<T>(
  name: string,
  initialState: T,
  persist: boolean = true
) {
  const createState = (set: SetState<T>) => ({
    ...initialState,
    // Action factories
  })

  const middleware = persist
    ? (f: any) => persist(immer(f), { name })
    : immer

  return create<T>()(devtools(middleware(createState)))
}

// Usage
const useMyStore = createStore('my-store', {
  value: null,
  items: [],
})
```

### 10.2 Component Composition (shadcn + Custom)

```typescript
// Base shadcn component
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Composed domain component
export const TaskCard = ({ task, onStatusChange }: Props) => (
  <Card className="border-l-4 border-orange-500 p-4 cursor-pointer hover:bg-gray-50">
    <div className="flex justify-between">
      <h4 className="font-bold text-sm">{task.title}</h4>
      <Badge>{task.status}</Badge>
    </div>
    <p className="text-xs text-gray-500 mt-2">{task.duration}</p>
    <Progress value={task.progress} className="mt-3" />
  </Card>
)
```

### 10.3 SSE Event Handler Pattern

```typescript
// Generic SSE event router
function createEventHandler<T extends { type: string }>(
  eventType: string,
  handler: (event: T) => void
) {
  return (event: unknown) => {
    if (isEvent<T>(event, eventType)) {
      handler(event)
    }
  }
}

// Usage
const handlers = {
  task_update: createEventHandler('task_update', (e) => {
    runStore.updateTask(e.key, e)
  }),
  node_report_preview_delta: createEventHandler('node_report_preview_delta', (e) => {
    reportStore.append(e.delta)
  }),
}

eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data)
  handlers[data.type]?.(data)
}
```

### 10.4 Hook for Server State

```typescript
// TanStack Query pattern
function useRunData(runId: string) {
  return useQuery({
    queryKey: ['run', runId],
    queryFn: () => fetchRun(runId),
    staleTime: 30_000,  // 30s
  })
}

// Usage in component
const MyComponent = ({ runId }) => {
  const { data: run, isLoading, error } = useRunData(runId)

  if (isLoading) return <Skeleton />
  if (error) return <Error message={error.message} />
  return <Content run={run} />
}
```

### 10.5 Citation Resolver Pattern

```typescript
// Generic citation resolution
function useResolveCitation(citationId: string) {
  const references = useRunStore(s => s.references)
  const entity = useMemo(
    () => references.find(r => r.id === citationId),
    [citationId, references]
  )

  return entity
}

// Usage
const CitationLink = ({ citationId }) => {
  const entity = useResolveCitation(citationId)

  if (!entity) return <span>[broken citation]</span>

  return (
    <a href={entity.url} title={entity.title}>
      {entity.title}
    </a>
  )
}
```

---

## Summary & Critical Decisions

### Key Architectural Choices (from DEC-* register)

| Decision | Impact | Rationale |
|----------|--------|-----------|
| **DEC-043**: Separate ReportPanel from Thread | Clean rendering path | GML ≠ chat message format |
| **DEC-015b**: rehype-to-JSX pipeline | Simpler frontend | Direct HTML→React, no AST reconstruction |
| **DEC-023**: deliverable_type on Message | Clearer data model | One deliverable per user message |
| **DEC-024**: Co-generation (WEBSITE + REPORT) | User sees both | Simultaneous generation improves UX |
| **DEC-021**: Dual SSE streams | Clear separation | Chat content vs. run events |
| **DEC-046**: MCP-based search (hot-swap) | Provider agnostic | Brave is default, Tavily is swap |

### Files to Create (Priority Order)

1. **BL-008**: `ui/src/components/chat/DeliverableSelector.tsx` (1 day)
2. **BL-015**: `ui/src/stores/deliverableStore.ts` (0.5 day)
3. **BL-020**: `ui/src/components/generation/GenerationOverlay.tsx` (1 day)
4. **BL-007**: `ui/src/components/plans/PlanViewer.tsx` (1.5 days)
5. **BL-009**: `ui/src/components/reports/ReportRenderer.tsx` (2 days)
6. **BL-014**: Extend `ui/src/components/runs/RunTimeline.tsx` (1 day)
7. **BL-010**: `ui/src/components/deliverables/WebsitePreview.tsx` (1 day)
8. **BL-011**: Extend `ui/src/components/chat/SourcesPanel.tsx` (1 day)

**Estimated**: ~10 days for all new components

### NPM Dependency Additions

```bash
npm install unified rehype-parse rehype-react react-plotly.js plotly.js
```

---

**Document Version**: 1.0
**Status**: LOCKED (all 10 source docs analyzed)
**Next Step**: Implementation phase (BL-008 first - 1 day)

---
