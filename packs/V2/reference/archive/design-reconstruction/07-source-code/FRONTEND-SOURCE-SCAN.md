# NYQST Frontend Source Code Scan

**Date:** 2026-02-20
**Target:** `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/ui/src/`
**Scope:** React/TypeScript frontend (v0.1.0)

---

## 1. File Inventory

### Root Entry Points
| Path | Purpose | Exports |
|------|---------|---------|
| `main.tsx` | App bootstrap | ReactDOM root, QueryClient, Router setup |
| `App.tsx` | Route definitions | App component with route tree |
| `index.css` | Global styles | Tailwind + custom CSS |

### API Clients (`api/`)
| File | Purpose | Key Exports |
|------|---------|------------|
| `auth.ts` | Auth API (login, bootstrap, API keys) | `authApi`, `ApiError` |
| `client.ts` | Core CRUD APIs (artifacts, manifests, pointers, runs, RAG) | `artifactsApi`, `manifestsApi`, `pointersApi`, `runsApi`, `ragApi` |
| `conversations.ts` | Chat conversations & messages | `conversationsApi` |
| `sessions.ts` | Session lifecycle (cost tracking) | `sessionsApi` |
| `tags.ts` | Tagging system | `tagsApi` |
| `tour-feedback.ts` | Tour feedback collection | `tourFeedbackApi` |

### Stores (`stores/`) — Zustand State Management
| File | Purpose | Key State | Actions |
|------|---------|-----------|---------|
| `auth-store.ts` | Auth state (tokens, user, tenant) | `accessToken`, `apiKey`, `userId`, `tenantId`, `isAuthenticated` | `setAccessToken`, `setApiKey`, `logout`, `clearError` |
| `conversation-store.ts` | Conversations & active session | `conversations[]`, `activeConversationId`, `activeSessionId` | `setConversations`, `addConversation`, `updateConversation`, `removeConversation`, `setActiveConversationId` |
| `workbench-store.ts` | IDE-style panel state (layout, tabs) | `leftPanelCollapsed`, `rightPanelCollapsed`, `bottomPanelCollapsed`, `tabs[]`, `activeTabId` | `toggleLeftPanel`, `toggleRightPanel`, `openTab`, `closeTab`, `setActiveTab`, `selectNamespace`, `selectPointer`, `selectRun` |
| `run-store.ts` | Active run ID for timeline | `activeRunId` | `setActiveRunId`, `clear` |
| `tour-store.ts` | Product tour state | `isOpen`, `currentStepIndex`, `feedbackByStep` | `openTour`, `closeTour`, `nextStep`, `prevStep`, `setFeedback`, `markSubmitted` |

### Hooks (`hooks/`)
| File | Purpose | Params | Return |
|------|---------|--------|--------|
| `use-sse.ts` | Server-Sent Events real-time stream | `{ url, onEvent, onError, reconnectDelay }` | `{ status, lastEventId, reconnect, disconnect }` |
| `use-session-lifecycle.ts` | Session creation/cleanup | `module: string` | `sessionId` |
| `use-thread-sources.ts` | Extract sources from tool calls | (none) | `AgentSource[]` |
| `use-toast.ts` | Toast notifications | (none) | `{ toast }` |

### Types (`types/`)
| File | Purpose |
|------|---------|
| `api.ts` | Artifact, Manifest, Pointer, Run, RAG types (matches FastAPI Pydantic) |
| `conversations.ts` | ConversationResponse, MessageResponse, FeedbackResponse, BranchResponse |
| `sessions.ts` | SessionResponse, SessionCostBreakdown |
| `tags.ts` | Tag types |

### Components (`components/`)

#### Layout & Workbench (`workbench/`)
| Component | Purpose | Props |
|-----------|---------|-------|
| `Workbench.tsx` | IDE-style 4-panel layout | (none) |
| `ExplorerPanel.tsx` | Left sidebar (pointers, artifacts, runs) | (none) |
| `MainPanel.tsx` | Center area with tabbed content | (none) |
| `DetailsPanel.tsx` | Right sidebar (properties) | (none) |
| `TimelinePanel.tsx` | Bottom panel (run timeline) | (none) |
| `WorkbenchHeader.tsx` | Top bar with controls | (none) |

#### Chat UI (`chat/`)
| Component | Purpose | Props | Integrates With |
|-----------|---------|-------|-----------------|
| `ChatPanel.tsx` | Complete chat UI (Thread, Composer, sidebar) | `{ module, scopeContext?, welcomeTitle?, suggestions?, showSidebar?, rightPanel? }` | @assistant-ui/react-ui, AssistantRuntime |
| `CitationAwareText.tsx` | Message text with [1], [2] citations | (none) | CitationLink |
| `CitationLink.tsx` | Clickable citation link | `{ index }` | SourcesContext |
| `SourcesPanel.tsx` | Right panel with sources | (none) | useThreadSources |
| `SourcesSidebar.tsx` | Source list UI | `{ sources: AgentSource[] }` | SourcesContext |
| `message-metadata.tsx` | Token count + latency footer | (none) | useMessage |
| `message-feedback.tsx` | Thumbs up/down feedback | (none) | useMessage |
| `branch-indicator.tsx` | Conversation branch badge | (none) | useMessage |
| `conversation-sidebar.tsx` | Conversation list | `{ conversations, activeId, onSelect, onCreate }` | ConversationStore |
| `tool-uis.tsx` | Tool execution rendering | `{ toolName, args, result, status }` | @assistant-ui/react |

#### Artifact Viewers
| Component | Purpose | Props |
|-----------|---------|-------|
| `artifacts/ArtifactViewer.tsx` | Display file (text, image, PDF) | `{ sha256 }` |
| `manifests/ManifestViewer.tsx` | Display manifest tree | `{ sha256 }` |
| `pointers/PointerViewer.tsx` | Display pointer details | `{ pointerId }` |
| `runs/RunViewer.tsx` | Display run details | `{ runId }` |
| `runs/RunTimeline.tsx` | Timeline of run events | (none) |

#### Authentication
| Component | Purpose |
|-----------|---------|
| `auth/LoginPage.tsx` | Email/password + API key login forms |
| `auth/AuthGuard.tsx` | Redirect to login if not authenticated |

#### RAG
| Component | Purpose |
|-----------|---------|
| `rag/NotebookPanel.tsx` | Notebook file upload/management |

#### Theme
| Component | Purpose |
|-----------|---------|
| `theme-provider.tsx` | Dark/light mode provider |
| `theme-toggle.tsx` | Theme switcher UI |

#### shadcn/ui Base Components
| Component | From |
|-----------|------|
| `ui/button.tsx` | @radix-ui/react-primitive |
| `ui/dialog.tsx` | @radix-ui/react-dialog |
| `ui/tabs.tsx` | @radix-ui/react-tabs |
| `ui/tooltip.tsx` | @radix-ui/react-tooltip |
| `ui/badge.tsx` | Styled div |
| `ui/scroll-area.tsx` | @radix-ui/react-scroll-area |
| `ui/toast.tsx` + `toaster.tsx` | @radix-ui/react-toast |
| `ui/alert-dialog.tsx` | @radix-ui/react-alert-dialog |
| `ui/avatar.tsx` | @radix-ui/react-avatar |
| `ui/collapsible.tsx` | @radix-ui/react-collapsible |
| `ui/dropdown-menu.tsx` | @radix-ui/react-dropdown-menu |
| `ui/input.tsx` | HTML input |
| `ui/separator.tsx` | @radix-ui/react-separator |

### Pages (`pages/`)
| Component | Route | Purpose |
|-----------|-------|---------|
| `OverviewPage.tsx` | `/overview` | Dashboard with module cards (now/next/later) |
| `ResearchPage.tsx` | `/research` | Document Q&A with notebook selector |
| `NotebookPage.tsx` | `/docs/:id` | Single notebook with chat + sources |
| `NotebooksPage.tsx` | `/docs` | Notebook list (removed from App but kept) |
| `AnalysisPage.tsx` | `/analysis` | Placeholder for analysis module |
| `DecisionsPage.tsx` | `/decisions` | Placeholder for decisions module |
| `ClientsPage.tsx` | `/clients` | Placeholder for clients module |
| `ProjectsPage.tsx` | `/projects` | Placeholder for projects module |
| `ModulePlaceholder.tsx` | (internal) | Template for future modules |

### Providers
| File | Purpose | Context |
|------|---------|---------|
| `providers/assistant-runtime.tsx` | @assistant-ui/react setup + conversation capture | `NyqstAssistantProvider` |
| `contexts/SourcesContext.tsx` | Citation ↔ source linking | `SourcesContext` |

### Layout
| File | Purpose |
|------|---------|
| `layouts/AppShell.tsx` | Main nav + outlet for page routes |

### Testing
- `api/__tests__/` — Auth, conversations, sessions, tags mocks
- `components/**/__tests__/` — Component tests (vitest + React Testing Library)
- `stores/__tests__/` — Zustand store unit tests
- `providers/__tests__/` — Runtime provider tests
- `hooks/__tests__/` — Hook tests
- `lib/__tests__/` — Utility function tests
- `test/` — MSW fixtures, handlers, setup

### Utilities
| File | Purpose |
|------|---------|
| `lib/utils.ts` | `cn()`, `truncateHash()`, `formatBytes()` |

---

## 2. Component Tree

```
App
├── Routes
│   ├── /login → LoginPage
│   └── /overview → AppShell
│       ├── AppHeader (nav, user menu)
│       ├── Outlet
│       │   ├── /overview → OverviewPage
│       │   │   └── Module Cards (Research, Docs, Analysis, Decisions, Clients, Projects)
│       │   ├── /research → ResearchPage
│       │   │   ├── Header (notebook selector)
│       │   │   └── ChatPanel
│       │   │       ├── Conversation Sidebar
│       │   │       ├── Thread (messages + composer)
│       │   │       ├── CitationAwareText (in messages)
│       │   │       └── SourcesPanel (right panel)
│       │   │           └── SourcesSidebar (with SourcesContext)
│       │   ├── /docs → NotebooksPage
│       │   │   └── Notebook list
│       │   ├── /docs/:id → NotebookPage
│       │   │   └── ChatPanel (scoped to pointer)
│       │   ├── /analysis → AnalysisPage (placeholder)
│       │   ├── /decisions → DecisionsPage (placeholder)
│       │   ├── /clients → ClientsPage (placeholder)
│       │   └── /projects → ProjectsPage (placeholder)
│       └── Toaster (toast notifications)
│
└── /workbench → Workbench
    ├── WorkbenchHeader
    ├── ExplorerPanel (left)
    │   ├── Namespace explorer
    │   ├── Artifacts list
    │   └── Runs list
    ├── MainPanel (center)
    │   ├── TabBar
    │   └── TabContent
    │       ├── ArtifactViewer
    │       ├── ManifestViewer
    │       ├── PointerViewer
    │       └── RunViewer
    ├── DetailsPanel (right)
    │   └── Resource properties
    └── TimelinePanel (bottom)
        └── RunTimeline (event stream)
```

---

## 3. Store Registry

### `useAuthStore` (Zustand + Persist)
```typescript
interface AuthState {
  // Tokens
  accessToken: string | null
  apiKey: string | null

  // User info
  userId: string | null
  tenantId: string | null
  tenantName: string | null
  role: string | null
  scopes: string[]

  // State
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setAccessToken(token, userInfo) → void
  setApiKey(key) → void
  logout() → void
  clearError() → void
}
```
**Persistence:** `intelli-auth` (localStorage, partial: accessToken, userId, tenantId, isAuthenticated)

### `useConversationStore` (Zustand + Persist)
```typescript
interface ConversationState {
  conversations: ConversationResponse[]
  activeConversationId: string | null
  activeSessionId: string | null

  setConversations(conversations) → void
  addConversation(conversation) → void
  updateConversation(id, updates) → void
  removeConversation(id) → void
  setActiveConversationId(id) → void
  setActiveSessionId(id) → void
  clear() → void
}
```
**Persistence:** `intelli-conversations` (partial: activeConversationId, activeSessionId)

### `useWorkbenchStore` (Zustand + Persist)
```typescript
type OpenTab = {
  id: string
  type: 'artifact' | 'manifest' | 'pointer' | 'run' | 'settings'
  title: string
  resourceId: string
}

interface WorkbenchState {
  // Panel visibility
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  bottomPanelCollapsed: boolean
  leftPanelSize: number (default 20%)
  rightPanelSize: number (default 25%)
  bottomPanelSize: number (default 30%)

  // Tabs
  tabs: OpenTab[]
  activeTabId: string | null

  // Selection
  selectedNamespace: string | null
  selectedPointerId: string | null
  selectedRunId: string | null

  // Actions
  toggleLeftPanel() → void
  toggleRightPanel() → void
  toggleBottomPanel() → void
  setLeftPanelSize(size) → void
  setRightPanelSize(size) → void
  setBottomPanelSize(size) → void
  openTab(tab) → void (generates tab.id as `${type}-${resourceId}`)
  closeTab(tabId) → void
  setActiveTab(tabId) → void
  selectNamespace(namespace) → void
  selectPointer(pointerId) → void (auto-opens run tab if runId set)
  selectRun(runId) → void
}
```
**Persistence:** `intelli-workbench` (panel sizes only, not tabs)

### `useRunStore` (Zustand, no persist)
```typescript
interface RunState {
  activeRunId: string | null
  setActiveRunId(id) → void
  clear() → void
}
```
**Purpose:** Timeline display in RunTimeline component

### `useTourStore` (Zustand, no persist)
```typescript
interface TourState {
  isOpen: boolean
  currentStepIndex: number
  feedbackByStep: Record<string, { text, rating? }>
  submittedSteps: Set<string>

  openTour() → void
  closeTour() → void
  nextStep() → void
  prevStep() → void
  goToStep(index) → void
  setFeedback(stepId, text, rating) → void
  markSubmitted(stepId) → void
}
```
**Purpose:** Product onboarding tour state

---

## 4. Hook Registry

### `useSSE<T>(options)` — Real-time streaming
```typescript
interface UseSSEOptions<T> {
  url: string
  onEvent?: (eventType, data: T) => void
  onError?: (error) => void
  onConnect?: () => void
  enabled?: boolean
  reconnectDelay?: number (default 3000)
  maxReconnectAttempts?: number (default 5)
}

return {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastEventId: string | null
  reconnect: () => void
  disconnect: () => void
}
```

### `useSessionLifecycle(module)` — Session management
- **Creates** session on mount (POST `/api/v1/sessions`)
- **Reuses** if `activeSessionId` already set
- **Idles** session on unmount (PATCH with status='idle')
- **Returns:** `sessionId`

### `useThreadSources()` — Extract sources from chat
- **Monitors** thread messages (useThread hook)
- **Parses** `search_documents` tool results
- **Returns:** `AgentSource[]` (chunk_id, artifact_sha256, content, score)
- **Deduplicates** by `${sha256}-${chunk_id}`

### `useToast()` — Toast notifications (shadcn)
- **From:** `@radix-ui/react-toast`
- **Returns:** `{ toast(props) }`

### Built-in hooks used:
- `useQuery()` — @tanstack/react-query
- `useThread()` — @assistant-ui/react
- `useMessage()` — @assistant-ui/react
- `useChatRuntime()` — @assistant-ui/react-ai-sdk
- `useNavigate()` — react-router-dom
- `useParams()` — react-router-dom
- `useEffect()`, `useMemo()`, `useCallback()`, `useRef()`, `useState()` — React

---

## 5. Type System

### Core API Types (`types/api.ts`)

#### Artifact
```typescript
interface Artifact {
  sha256: string
  media_type: string
  size_bytes: number
  filename?: string | null
  storage_uri: string
  storage_class: string
  reference_count: number
  created_at: string
  created_by?: string | null
}
```

#### Manifest
```typescript
interface Manifest {
  sha256: string
  tree: ManifestTree
  parent_sha256?: string
  message?: string
  entry_count: number
  total_size_bytes: number
  created_at: string
  created_by?: string | null
}

interface ManifestEntry {
  path: string
  artifact_sha256: string
  metadata?: Record<string, unknown> | null
}
```

#### Pointer
```typescript
type PointerType = 'bundle' | 'corpus' | 'snapshot'

interface Pointer {
  id: string
  namespace: string
  name: string
  pointer_type: PointerType
  manifest_sha256?: string | null
  description?: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  created_by?: string | null
}
```

#### Run
```typescript
type RunStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

interface Run {
  id: string
  run_type: string
  name?: string | null
  status: RunStatus
  started_at?: string | null
  completed_at?: string | null
  input_manifest_sha256?: string | null
  output_manifest_sha256?: string | null
  config: Record<string, unknown>
  result?: Record<string, unknown> | null
  error?: Record<string, unknown> | null
  token_usage: Record<string, unknown>
  cost_cents: number
  created_at: string
  created_by?: string | null
  project_id?: string | null
  session_id?: string | null
  parent_run_id?: string | null
}
```

### Conversation Types (`types/conversations.ts`)
```typescript
type ConversationStatus = 'active' | 'archived' | 'deleted'
type MessageRole = 'user' | 'assistant' | 'system' | 'tool'
type MessageStatus = 'pending' | 'streaming' | 'complete' | 'failed'
type FeedbackRating = 'positive' | 'negative'

interface ConversationResponse {
  id: string
  tenant_id: string
  user_id: string
  scope_type: string
  scope_id: string | null
  module: string | null
  title: string | null
  status: ConversationStatus
  message_count: number
  total_input_tokens: number
  total_output_tokens: number
  total_cost_micros: number
  session_id: string | null
  run_id: string | null
  created_at: string
  updated_at: string
  last_message_at: string | null
}

interface MessageResponse {
  id: string
  conversation_id: string
  role: MessageRole
  content: string | null
  parts: Record<string, unknown> | null
  input_tokens: number | null
  output_tokens: number | null
  cost_micros: number | null
  latency_ms: number | null
  model_id: string | null
  status: MessageStatus
  parent_message_id: string | null
  sequence_number: number
  created_at: string
}

interface FeedbackResponse {
  id: string
  message_id: string
  user_id: string
  rating: FeedbackRating
  content: string | null
  created_at: string
}
```

### Session Types (`types/sessions.ts`)
```typescript
interface SessionResponse {
  id: string
  tenant_id: string
  user_id: string
  scope_type: string
  scope_id: string | null
  module: string | null
  objective: string | null
  status: string
  started_at: string
  last_active_at: string
  idle_timeout_minutes: number
  closed_at: string | null
  close_reason: string | null
  total_cost_micros: number
  created_at: string
  updated_at: string
}

interface SessionCostBreakdown {
  session_id: string
  total_cost_micros: number
  conversation_count: number
  total_input_tokens: number
  total_output_tokens: number
  conversations: Array<{
    id: string
    title: string | null
    cost_micros: number
    input_tokens: number
    output_tokens: number
  }>
}
```

### Agent Source (for citations)
```typescript
interface AgentSource {
  chunk_id: string
  artifact_sha256: string
  chunk_index: number
  content: string
  score: number
  path_hint?: string
}
```

---

## 6. Routing

```
/                          → /overview (if authenticated)
/login                     → LoginPage
/overview                  → OverviewPage (protected)
  /research                → ResearchPage (protected)
  /docs                    → NotebooksPage (protected)
  /docs/:id                → NotebookPage (protected)
  /analysis                → AnalysisPage (placeholder)
  /decisions               → DecisionsPage (placeholder)
  /clients                 → ClientsPage (placeholder)
  /projects                → ProjectsPage (placeholder)
/workbench/*               → Workbench IDE (protected)
/advanced                  → /workbench (redirect)
/notebooks                 → /docs (legacy redirect)
/notebooks/:id             → /docs/:id (legacy redirect)
```

**Protected routes:** AuthGuard wrapper checks `useAuthStore().isAuthenticated`

---

## 7. API Integration

### Base URL
- Vite proxy: `/api/v1` → `INTELLI_API_URL` env var or `http://localhost:8000`

### Authentication
```typescript
// Auth headers helper (from auth-store)
function getAuthHeaders(): Record<string, string> {
  if (apiKey) return { 'X-API-Key': apiKey }
  if (accessToken) return { Authorization: `Bearer ${accessToken}` }
  return {}
}
```

### API Modules

#### `authApi`
- `login(email, password, tenant_slug)` → `LoginResponse`
- `devBootstrap()` → `LoginResponse` (DEBUG mode only)
- `getCurrentUser()` → `CurrentUser`
- `createAPIKey(data)` → `APIKeyCreated`
- `listAPIKeys()` → `APIKey[]`
- `deleteAPIKey(keyId)` → `void`

#### `artifactsApi`
- `upload(file, mediaType?)` → `ArtifactUploadResponse`
- `get(sha256)` → `Artifact`
- `list(limit, offset)` → `Artifact[]`
- `getContentUrl(sha256)` → `{ url: string }`
- `delete(sha256)` → `void`

#### `manifestsApi`
- `create(data)` → `ManifestCreateResponse`
- `get(sha256)` → `Manifest`
- `getEntries(sha256)` → `ManifestEntry[]`
- `getHistory(sha256)` → `Manifest[]`
- `diff(oldSha256, newSha256)` → `ManifestDiff`

#### `pointersApi`
- `list()` → `Pointer[]`
- `get(id)` → `Pointer`
- `create(data)` → `Pointer`
- `update(id, data)` → `Pointer`
- `advance(id, data)` → `PointerAdvanceResponse`
- `getHistory(id)` → `PointerHistoryEntry[]`

#### `runsApi`
- `list(params)` → `RunListResponse`
- `get(id)` → `Run`
- `getEvents(id, limit, offset)` → `RunEventListResponse`
- `create(data)` → `Run`

#### `conversationsApi`
- `list(params)` → `ConversationListResponse` (supports scope_type, scope_id, module, session_id)
- `get(id)` → `ConversationResponse`
- `create(data)` → `ConversationResponse`
- `update(id, data)` → `ConversationResponse`
- `getMessages(id, limit, offset)` → `MessageListResponse`
- `getFeedback(messageId)` → `FeedbackResponse[]`
- `createFeedback(messageId, data)` → `FeedbackResponse`
- `getBranches(id, messageId)` → `BranchResponse[]`
- `branch(id, messageId)` → `BranchResponse`
- `getSiblings(id, messageId)` → `SiblingResponse`

#### `sessionsApi`
- `create(data)` → `SessionResponse`
- `list(params)` → `SessionListResponse`
- `get(id)` → `SessionResponse`
- `updateStatus(id, data)` → `SessionResponse`
- `getCost(id)` → `SessionCostBreakdown`

#### `tagsApi`
- `list(params)` → `TagListResponse`
- `create(data)` → `TagResponse`
- `update(id, data)` → `TagResponse`
- `delete(id)` → `void`
- `addToResource(tagId, resourceId, resourceType)` → `void`
- `removeFromResource(tagId, resourceId, resourceType)` → `void`

#### `tourFeedbackApi`
- `submitFeedback(data)` → `{ id: string }`

### Chat Stream (`/api/v1/agent/chat`)
- **Transport:** DefaultChatTransport from `ai` package
- **Payload:**
  ```typescript
  {
    messages: Array<{ role, content }>
    module: 'research' | 'analysis' | 'decisions' | 'knowledge'
    pointer_id?: string
    manifest_sha256?: string
    conversation_id?: string
    session_id?: string
  }
  ```
- **Response:** SSE stream with MessageDelta events
- **Message metadata:** Captured from `message.metadata` (conversationId, runId, outputTokens, latencyMs)

### Demo Mode
- Env: `VITE_DEMO_MODE=true`
- Mocks: `api/mocks/` (MSW handlers for dev)
- Real API used when demo mode off

---

## 8. Dependencies

### Core Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | React rendering |
| `react-router-dom` | ^6.24.1 | Client-side routing |
| `zustand` | ^4.5.4 | State management |

### AI & Assistant UI
| Package | Version | Purpose |
|---------|---------|---------|
| `ai` | ^6.0.57 | Vercel AI SDK (chat streaming) |
| `@assistant-ui/react` | ^0.12.3 | Chat UI framework |
| `@assistant-ui/react-ai-sdk` | ^1.3.3 | AI SDK integration |
| `@assistant-ui/react-ui` | ^0.2.1 | Pre-built UI components (Thread, Composer) |
| `@ai-sdk/react` | ^3.0.59 | React AI SDK hooks |

### Data Fetching & State
| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | ^5.51.0 | Server state, caching |
| `@tanstack/react-query-devtools` | ^5.51.0 | Debug panel |

### UI Components & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-*` | ^1.x | Unstyled accessible primitives (15 packages) |
| `tailwindcss` | ^3.4.5 | Utility CSS framework |
| `class-variance-authority` | ^0.7.0 | CSS-in-JS variants |
| `tailwind-merge` | ^2.4.0 | Merge Tailwind classes |
| `clsx` | ^2.1.1 | Class name utilities |
| `lucide-react` | ^0.408.0 | Icon library |
| `date-fns` | ^3.6.0 | Date formatting |

### Layout & Content
| Package | Version | Purpose |
|---------|---------|---------|
| `react-resizable-panels` | ^2.0.22 | Draggable split panels |
| `react-markdown` | ^10.1.0 | Markdown rendering |
| `remark-gfm` | ^4.0.1 | GitHub Flavored Markdown |

### Build & Dev
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^5.3.3 | Build tool |
| `@vitejs/plugin-react` | ^4.3.1 | React plugin |
| `typescript` | ^5.5.3 | Type checking |

### Testing
| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | ^2.1.8 | Test runner |
| `@vitest/coverage-v8` | ^2.1.8 | Coverage reporting |
| `@testing-library/react` | ^16.1.0 | React component testing |
| `@testing-library/jest-dom` | ^6.6.3 | DOM matchers |
| `@testing-library/user-event` | ^14.5.2 | User interaction simulation |
| `jsdom` | ^25.0.1 | DOM implementation |
| `msw` | ^2.7.0 | Mock Service Worker |

---

## 9. Build Config

### Vite (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react(), tourFeedbackPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: process.env.INTELLI_UI_PORT || 3000,
    proxy: {
      '/api': {
        target: process.env.INTELLI_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Strict: true
- Path alias: `@/*` → `./src/*`

### Scripts (`package.json`)
```json
{
  "dev": "vite",
  "dev:demo": "VITE_DEMO_MODE=true vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

---

## 10. UI Library Usage

### @assistant-ui/react Integration

#### `NyqstAssistantProvider` (wrapper)
- **Wraps:** ChatPanel component tree
- **Provides:** AssistantRuntimeProvider with custom transport
- **Features:**
  - Custom chat transport pointing to `/api/v1/agent/chat`
  - Message ID mapping for feedback
  - Conversation ID capture from SSE metadata
  - Scope context (pointerId, manifestSha256) for document-scoped chats
  - Run ID extraction for timeline

#### `Thread` component
- **From:** @assistant-ui/react-ui
- **Usage:** Display chat messages
- **Customization:**
  ```typescript
  <ThreadConfigProvider
    config={{
      assistantMessage: {
        components: {
          Text: CitationAwareText,
          Footer: MessageMetadataFooter,
        },
      },
    }}
  >
    <Thread />
  </ThreadConfigProvider>
  ```

#### `Composer` component
- **From:** @assistant-ui/react-ui
- **Usage:** Message input field
- **Auto-submit with Enter**

### shadcn/ui Components Used
- Button (variants: default, ghost, outline)
- Dialog (modals)
- Tabs (workbench main content)
- Tooltip (hover hints)
- Badge (score display, status)
- ScrollArea (long lists)
- Toast (notifications)
- AlertDialog (confirmations)
- Avatar (user profile pictures)
- Collapsible (expandable sections)
- DropdownMenu (context menus)
- Input (form fields)
- Separator (dividers)

### Radix UI Primitives (underlying)
All shadcn components built on @radix-ui:
- `@radix-ui/react-dialog`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-toast`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-avatar`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-separator`
- `@radix-ui/react-label`
- `@radix-ui/react-popover`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-icons` (icon source)

### React Query Integration
```typescript
// In main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

<QueryClientProvider client={queryClient}>
  {/* app */}
</QueryClientProvider>
```

**Usage patterns:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['conversations', scopeId],
  queryFn: () => conversationsApi.list({ scope_id: scopeId }),
})
```

### Tailwind CSS
- Configured in `tailwind.config.js` (assumed)
- shadcn presets applied
- @tailwindcss/typography for markdown
- Dark mode support via class toggle

---

## 11. Context & Providers

### Root Providers (main.tsx)
```
ThemeProvider (defaultTheme="system")
  ↓
QueryClientProvider (React Query)
  ↓
BrowserRouter (React Router)
  ↓
App
```

### Chat Scope Providers
```
SourcesProvider (Citation ↔ Source linking)
  ↓
NyqstAssistantProvider (AI SDK + conversation capture)
  ↓
ChatPanel
  ├── Thread
  ├── Composer
  └── Sidebar / RightPanel
```

---

## 12. Key Integration Points

### 1. **Chat to Workbench**
- ChatPanel in pages (ResearchPage, NotebookPage)
- Workbench at `/workbench` route
- **Data:** Pointers (notebooks) queried from API, conversations persisted in ConversationStore

### 2. **Citation to Sources**
- CitationAwareText parses `[1]`, `[2]` from messages
- CitationLink calls `SourcesContext.scrollToSource(index)`
- SourcesSidebar highlights source at index using refs
- useThreadSources extracts sources from `search_documents` tool results

### 3. **Conversation Capture**
- NyqstAssistantProvider monitors SSE response metadata
- Captures `conversationId`, `runId`, `assistantMessageId`
- Stores in ConversationStore for sidebar updates
- Stores runId in RunStore for timeline display

### 4. **Session Lifecycle**
- useSessionLifecycle hook creates session on mount
- Idled on unmount
- Session ID stored in ConversationStore for cost tracking
- Conversations linked to sessions for grouping

### 5. **Workbench Tabs**
- ExplorerPanel selects resource (pointer, artifact, run)
- WorkbenchStore.selectPointer/selectRun auto-opens tab
- MainPanel renders TabBar + active TabContent (viewer)
- DetailsPanel shows resource metadata

---

## 13. Error Handling & Loading States

### API Errors
- `ApiError` class in client files
- Status code + body captured
- Caught in component try/catch
- Displayed via toast notifications

### Loading States
```typescript
const { data, isLoading, error } = useQuery(...)

if (isLoading) return <Spinner />
if (error) return <ErrorMessage />
return <Content data={data} />
```

### SSE Reconnection
- useSSE auto-reconnects (5 attempts max, 3s delay)
- Status tracked: connecting → connected → error → disconnected

---

## 14. Notable Implementation Details

### Message ID Mapping
- Assistant-ui uses internal message IDs
- NyqstAssistantProvider maps them to backend UUIDs via `messageIdMapRef`
- Used for feedback adapter to send correct backend message ID

### Scope Context Pattern
- ChatPanel accepts optional `scopeContext: { pointerId, manifestSha256 }`
- Passed to agent in chat request for document-scoped search
- ResearchPage uses this for notebook-scoped chats

### Branch Indicator
- BranchIndicator component shows when message is in alternate conversation branch
- Extracted from message metadata
- Visual badge on message timestamp

### Message Feedback
- Thumbs up/down on assistant messages
- Feedback adapter hooks into @assistant-ui/react lifecycle
- Persists to backend via conversationsApi.createFeedback

### Artifact Preview
- ArtifactViewer detects media type
- Image: renders <img />
- Text/JSON: <pre> with syntax
- PDF: iframe embed
- Default: file icon + download button

### Workbench Tab Auto-open
- selectRun action auto-opens run tab
- selectPointer does NOT auto-open (just selects)
- Tab IDs: `${type}-${resourceId}` for deduplication

---

## 15. Testing Structure

### Unit Tests
- **Stores:** `stores/__tests__/auth-store.test.ts`, `conversation-store.test.ts`, `workbench-store.test.ts`
- **Hooks:** `hooks/__tests__/use-session-lifecycle.test.ts`, `use-sse.test.ts`
- **Utilities:** `lib/__tests__/api-client.test.ts`

### Component Tests
- **Auth:** `components/auth/__tests__/AuthGuard.test.tsx`, `LoginPage.test.tsx`
- **Chat:** `components/chat/**/__tests__/` (CitationLink, SourcesPanel, message-feedback, etc.)
- **Runs:** `components/runs/RunTimeline.test.tsx`
- **RAG:** `components/rag/__tests__/NotebookPanel.test.tsx`
- **Pages:** `pages/__tests__/OverviewPage.test.tsx`, `ResearchPage.test.tsx`

### API Tests
- **Conversations:** `api/__tests__/conversations.test.ts` (fixtures + handlers)
- **Sessions:** `api/__tests__/sessions.test.ts`
- **Auth:** `api/__tests__/auth.test.ts`
- **Tags:** `api/__tests__/tags.test.ts`

### Integration Tests
- **E2E:** `test/__tests__/sse-contract.test.ts` (backend contract validation)
- **Provider:** `providers/__tests__/assistant-runtime.test.tsx`

### Mocks
- **MSW:** `test/mocks/handlers.ts` (Mock Service Worker interceptors)
- **Fixtures:** `api/mocks/fixtures.ts` (sample data)
- **Setup:** `test/setup.ts` (vitest config)

---

## 16. File Count Summary

| Category | Count |
|----------|-------|
| **API Clients** | 6 files + tests |
| **Stores** | 5 files + tests |
| **Hooks** | 3 custom + 10+ built-in |
| **Types** | 4 files |
| **Components** | ~40 files |
| **Pages** | 8 files |
| **Context/Providers** | 2 files |
| **Layout** | 1 file |
| **Utilities** | 1 file |
| **Tests** | ~25 files |
| **Configuration** | 5 files (vite, ts, etc.) |
| **Total** | ~110+ .ts/.tsx files |

---

## 17. Key Architectural Patterns

### 1. **API Abstraction Layer**
- All API calls behind `api/*.ts` modules
- Demo mode support with switchable implementations
- Error handling centralized in ApiError class

### 2. **State Management (Zustand)**
- Separate stores for orthogonal concerns (auth, conversation, workbench)
- Minimal stores + localStorage persistence where needed
- No Redux-style boilerplate

### 3. **Context for Scoped Data**
- SourcesContext for citation ↔ source linking
- NyqstAssistantProvider for chat runtime
- Avoids prop drilling

### 4. **Composable Chat UI**
- ChatPanel is reusable across modules (Research, Docs, etc.)
- scopeContext parameter allows document-scoped chats
- rightPanel prop for pluggable side panels (SourcesPanel, NotebookPanel)

### 5. **Hook-based Feature Composition**
- useSSE for streaming
- useSessionLifecycle for cost tracking
- useThreadSources for citation extraction
- Easy to test in isolation

### 6. **Panel-based Workbench**
- react-resizable-panels for draggable layout
- WorkbenchStore tracks panel state + tabs
- Persistent panel sizes + collapse state
- Tab system for multi-resource editing

### 7. **Message Streaming**
- DefaultChatTransport from `ai` SDK
- Custom request builder for module/scope context
- SSE metadata extraction for conversation capture
- No Redux/state management needed for thread (all in @assistant-ui)

---

## Summary

The NYQST frontend is a **React 18 + TypeScript** SPA with:
- **Modular chat UI** (Research, Docs, Analysis modules via ChatPanel)
- **IDE-style workbench** (4-panel layout with resizable panels, tabs)
- **Zustand state management** (auth, conversations, workbench UI)
- **@assistant-ui/react integration** (Thread, Composer, custom transport)
- **Citation system** (message [1] → sources panel)
- **shadcn/ui + Tailwind** for styling
- **React Query** for server state
- **Full API abstraction** with auth headers, error handling, mocking
- **Session-based cost tracking** (sessions → conversations → runs)

Ground truth: All routes, stores, hooks, and components are accounted for. No hidden magic—straightforward React patterns throughout.

