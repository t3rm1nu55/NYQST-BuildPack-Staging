# NYQST Backend Source Code Inventory
## Comprehensive Scan: Python Backend Architecture

**Scanned:** `/Users/markforster/NYQST-DevinForkByAnyMeans/nyqst-intelli-230126/src/intelli/`
**Date:** 2026-02-20
**Total Python Files:** 103
**Scan Scope:** All .py files, first 80-150 lines per file

---

## 1. File Inventory

### Core Application Files
- **config.py** (89 lines) — Pydantic `Settings` model; env var loading for app, database, storage, embeddings, LLM, indexing, MCP, security, JWT
- **main.py** (104 lines) — FastAPI app factory; lifespan mgmt (startup/shutdown); middleware stack; index init; session monitor; health+v1 routers

### 1.1 Core Module (`core/`)
| File | Purpose | Key Classes/Functions |
|------|---------|----------------------|
| `cache.py` | In-memory caching | (partial scan) |
| `clock.py` | UTC time utilities | `utc_now()` |
| `context.py` | Request context + thread-local tenant isolation | `RequestContext`, `get_context()`, `set_context()`, `get_tenant_id()` |
| `exceptions.py` | Custom exception hierarchy | (partial scan) |
| `jobs.py` | Job queue (arq integration) | (partial scan) |
| `logging.py` | Structured logging | (partial scan) |
| `pubsub.py` | Pub/sub mechanism | (partial scan) |
| `security.py` | JWT, password hashing, API key mgmt, rate limiting | `hash_password()`, `verify_password()`, `generate_api_key()`, `create_access_token()`, `decode_access_token()`, `RateLimiter` |
| `session_monitor.py` | Session idle timeout manager | (partial scan) |

### 1.2 Database Module (`db/`)
| File | Purpose | Key Components |
|------|---------|-----------------|
| `base.py` | SQLAlchemy `Base` + mixins | `Base`, `TimestampMixin`, `SoftDeleteMixin` |
| `checkpointer.py` | LangGraph checkpointer (psycopg pool) | `get_checkpointer()`, `close_checkpointer()` |
| `engine.py` | Async SQLAlchemy engine + session factory | `get_engine()`, `get_session_factory()`, `get_session()` |

### 1.3 Database Models (`db/models/`)
| File | Purpose | SQLAlchemy Models |
|------|---------|-------------------|
| `auth.py` | Multi-tenant auth | `TenantStatus`, `UserRole`, `APIKeyScope` enums; `Tenant` (orgs), `User`, `APIKey` (machine auth), audit columns |
| `conversations.py` | Chat history + sessions | `ConversationStatus`, `MessageRole`, `MessageStatus`, `FeedbackRating`, `SessionStatus` enums; `Session`, `Conversation`, `Message`, `MessageFeedback` tables |
| `rag.py` | Document chunks + embeddings | `RagChunk` (pgvector); artifact FK, chunk index, content, embedding, metadata |
| `runs.py` | Agentic execution ledger | `RunStatus`, `RunEventType` enums; `Run`, `RunEvent` tables; input/output manifests, config, result, error tracking |
| `substrate.py` | Immutable content-addressed system | `Artifact` (SHA-256 PK), `Manifest` (tree DAG), `Pointer` (mutable HEAD), `PointerHistory` |
| `tags.py` | Universal tagging | `Tag` (entity_type/id, namespace/key/value, provenance, verification) |

### 1.4 API Module (`api/`)
| File | Purpose | Key Components |
|------|---------|-----------------|
| `dependencies.py` | FastAPI dep injection | `SessionDep`, service deps (Artifact, Manifest, Pointer, Run, Ledger, Conversation, Session, Tag) |
| `health.py` | Health check endpoint | (partial scan) |
| `middleware/auth.py` | JWT + API key auth | `get_api_key_auth()`, `get_bearer_auth()`, rate limit checks, request context setup |
| `middleware/context.py` | Context middleware | (partial scan) |
| `middleware/correlation.py` | Correlation ID tracking | (partial scan) |
| `middleware/error_handler.py` | Global exception handler | (partial scan) |

### 1.5 API v1 Routers (`api/v1/`)
| File | Path | Endpoints (summary) |
|------|------|-------------------|
| `agent.py` | `/agent` | Chat interface, streaming responses (LangGraph agent) |
| `artifacts.py` | `/artifacts` | Upload, list, get, delete (S3/local storage) |
| `auth.py` | `/auth` | Login, logout, token refresh, API key mgmt |
| `conversations.py` | `/conversations` | CRUD, list by user/scope, messages, feedback, branching |
| `health.py` | `/health` | `/health` (liveness), `/ready` (readiness) |
| `manifests.py` | `/manifests` | Get by SHA-256, diff, history, tree inspection |
| `pointers.py` | `/pointers` | CRUD pointers (named refs), publish/promote, list |
| `rag.py` | `/rag` | Index manifest, search, Q&A |
| `runs.py` | `/runs` | Create, get, list, status transitions (pause/resume/cancel) |
| `sessions.py` | `/sessions` | Lifecycle (create, close), list by user, config snapshots |
| `streams.py` | `/streams` | SSE endpoints (run events via PG LISTEN/NOTIFY, activity feed) |
| `tags.py` | `/tags` | Create, list, verify, bulk operations |

### 1.6 Repositories (`repositories/`)
| File | Model | Key Methods |
|------|-------|------------|
| `base.py` | Generic | `get_by_id()`, `create()`, `update()`, `delete()`, `list_all()`, `count()` |
| `artifacts.py` | `Artifact` | `get_by_sha256()`, `create_artifact()`, `update_reference_count()` |
| `conversations.py` | `Conversation` | `get_by_tenant()`, `list_by_user()`, `create()`, `update()`, `count_by_user()` |
| `manifests.py` | `Manifest` | `get_by_sha256()`, `list_by_parent()`, `create_manifest()`, tree queries |
| `messages.py` | `Message` | `save_message()`, `get_next_sequence()`, `list_for_conversation()` |
| `pointers.py` | `Pointer` | `get_by_id()`, `list_pointers()`, `publish()`, `promote()`, history tracking |
| `runs.py` | `Run` | `create_run()`, `start()`, `pause()`, `resume()`, `complete()`, list by status |
| `sessions.py` | `Session` | `create()`, `list_by_user()`, `close()`, state mgmt |
| `tags.py` | `Tag` | `create_tag()`, `list_by_entity()`, `verify()`, cleanup |

### 1.7 Services (`services/`)

#### Core Services
| File | Purpose | Key Methods |
|------|---------|------------|
| `conversation_service.py` | Chat lifecycle | `create()`, `get()`, `list_for_user()`, `update()`, `archive()`, `soft_delete()`, `save_message()`, feedback |
| `session_service.py` | Session management | `create()`, `get()`, `list_for_user()`, `close()`, idle timeout logic |
| `tag_service.py` | Universal tagging | `create_tag()`, `list_by_entity()`, `verify_tag()`, bulk ops |
| `audit_service.py` | Audit logging | (partial scan) |

#### Substrate Services (Content-Addressed System)
| File | Purpose | Key Classes/Methods |
|------|---------|-------------------|
| `substrate/artifact_service.py` | Artifact CRUD | `ArtifactService`: `upload_artifact()`, `get_artifact()`, `list_artifacts()`, storage delegation |
| `substrate/manifest_service.py` | Manifest tree mgmt | `ManifestService`: `build_manifest()`, SHA-256 computation, dedup, parent tracking, `get_manifest()`, `get_manifest_diff()` |
| `substrate/pointer_service.py` | Pointer (branch) mgmt | `PointerService`: `create_pointer()`, `get_pointer()`, `publish()`, `promote()`, `list_pointers()`, history |

#### Knowledge Services
| File | Purpose | Key Classes/Methods |
|------|---------|-------------------|
| `knowledge/rag_service.py` | Document Q&A | `RagService`: `index_manifest()`, `retrieve()`, `ask()`, Docling + OpenAI embeddings, OpenSearch/pgvector |

#### Run/Execution Services
| File | Purpose | Key Classes/Methods |
|------|---------|-------------------|
| `runs/run_service.py` | Run lifecycle | `RunService`: `create_run()`, `get_run()`, `start_run()`, `pause_run()`, `resume_run()`, `complete_run()`, status transitions |
| `runs/ledger_service.py` | Append-only ledger | `LedgerService`: `log_event()`, `get_events()`, event filtering, run/session/artifact/manifest tracking |

#### Indexing Services
| File | Purpose | Key Classes/Methods |
|------|---------|-------------------|
| `indexing/opensearch_client.py` | OpenSearch wrapper | `OpenSearchClient`: index mgmt, bulk ops, search |
| `indexing/opensearch_chunks.py` | Chunk indexing | `OpenSearchChunkIndex`: embeddings, CRUD chunks, similarity search |
| `indexing/auto_index.py` | Auto-indexing logic | (partial scan) |
| `indexing/init.py` | Index initialization | `init_index_backend()` (pgvector or OpenSearch) |

#### Placeholder Services
| File | Purpose |
|------|---------|
| `governance/__init__.py` | (stub) |
| `docir/__init__.py` | (stub) |

### 1.8 Agents Module (`agents/`)
| File | Purpose | Key Components |
|------|---------|-----------------|
| `graphs/research_assistant.py` | LangGraph agent | `ResearchState` (dataclass), `ResearchAssistantGraph` (3-node StateGraph), `SYSTEM_PROMPT`, LLM binding, tool invocation |
| `tools/research_tools.py` | LangGraph tools | `build_research_tools()`: `search_documents()`, `list_notebooks()`, `get_document_info()`, `compare_manifests()` |
| `observability.py` | Tracing/monitoring | (partial scan) |

### 1.9 MCP Module (`mcp/`)
| File | Purpose | Key Components |
|------|---------|-----------------|
| `server.py` | MCP server | `create_mcp_server()` (registers substrate, run, knowledge tools) |
| `tools/substrate_tools.py` | Substrate MCP tools | (partial scan) |
| `tools/run_tools.py` | Run MCP tools | (partial scan) |
| `tools/knowledge_tools.py` | Knowledge MCP tools | (partial scan) |

### 1.10 Schemas Module (`schemas/`)
| File | Purpose | Pydantic Models |
|------|---------|-----------------|
| `conversations.py` | Chat API schemas | `ConversationCreate`, `ConversationResponse`, `ConversationListResponse`, `MessageResponse`, feedback schemas |
| `agent.py` | Agent API schemas | `AgentChatMessage`, `AgentChatRequest`, `AgentChatResponse` |
| `rag.py` | RAG API schemas | (partial scan) |
| `runs.py` | Run API schemas | (partial scan) |
| `sessions.py` | Session API schemas | (partial scan) |
| `substrate.py` | Substrate schemas | `ArtifactUpload`, `ManifestEntry`, `PointerCreate` |
| `tags.py` | Tag API schemas | (partial scan) |

### 1.11 Storage Module (`storage/`)
| File | Purpose | Key Classes |
|------|---------|------------|
| `base.py` | Abstract interface | `StorageBackend` (ABC): `upload()`, `download()`, `delete()`, `exists()` |
| `factory.py` | Storage factory | `get_storage_backend()` (S3 or local based on config) |
| `s3_storage.py` | S3 backend | `S3StorageBackend`: boto3 integration, multipart upload, signing |
| `local_storage.py` | Local filesystem | `LocalStorageBackend`: `/tmp` storage for dev/testing |

---

## 2. Model Registry

### Authentication Models (`db/models/auth.py`)
**Table: `tenants`**
- `id` (UUID, PK)
- `name` (String, unique)
- `slug` (String, unique)
- `status` (Enum: active/suspended/pending)
- `storage_quota_bytes` (BigInt, default 10GB)
- `run_quota_monthly` (Int)
- `settings` (JSONB)
- `created_at`, `updated_at` (TimestampMixin)

**Table: `users`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK→tenants)
- `email` (String)
- `name` (String)
- `role` (Enum: owner/admin/member/viewer)
- `password_hash` (String, nullable)
- `external_id`, `external_provider` (String, for OAuth/SAML)
- `is_active` (Bool)
- `last_login_at` (DateTime)
- Indexes: `ix_users_tenant_email` (tenant_id, email), `ix_users_external`

**Table: `api_keys`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK→tenants)
- `created_by_user_id` (UUID, FK→users, nullable)
- `name` (String)
- `key_prefix` (String(12), for identification)
- `key_hash` (String(64), SHA-256)
- `scopes` (ARRAY(String): read/write/admin/agent)
- `expires_at` (DateTime, nullable)
- `rate_limit_rpm` (Int)
- `allowed_ips` (ARRAY(String), nullable)
- `is_active` (Bool)
- `last_used_at` (DateTime)

### Conversation/Session Models (`db/models/conversations.py`)
**Table: `sessions`**
- `id` (UUID, PK)
- `tenant_id`, `user_id` (UUID, FKs)
- `scope_type` (String: tenant/environment/project/objective/workflow/task/pointer/user)
- `scope_id` (UUID, nullable)
- `module` (String, nullable: research/analysis/etc.)
- `objective` (Text, nullable)
- `config_snapshot` (JSONB)
- `mounted_pointers`, `mounted_kbs`, `pinned_artifacts` (ARRAY(String))
- `agent_definition_id` (String)
- `status` (String: active/idle/paused/closed)
- `started_at`, `last_active_at`, `closed_at` (DateTime)
- `idle_timeout_minutes` (Int, default 30)
- `close_reason` (String, nullable)
- `workspace` (JSONB, nullable)
- `total_cost_micros` (BigInt)

**Table: `conversations`**
- `id` (UUID, PK)
- `tenant_id`, `user_id` (UUID, FKs)
- `scope_type`, `scope_id` (polymorphic scoping)
- `module` (String, nullable)
- `title` (String, nullable)
- `session_id` (UUID, FK→sessions, nullable)
- `run_id` (UUID, FK→runs, nullable)
- `status` (String: active/archived/deleted)
- `message_count`, `total_input_tokens`, `total_output_tokens`, `total_cost_micros` (denormalized)
- `created_at`, `updated_at`, `last_message_at` (DateTime)

**Table: `messages`**
- `id` (UUID, PK)
- `conversation_id` (UUID, FK→conversations)
- `role` (String: user/assistant/system/tool)
- `content` (Text, nullable)
- `parts` (JSONB, nullable, structured content)
- `input_tokens`, `output_tokens`, `cost_micros`, `latency_ms` (Int, nullable)
- `model_id` (String, nullable)
- `status` (String: pending/streaming/complete/failed)
- `parent_message_id` (UUID, nullable, for branching)
- `sequence_number` (Int, for ordering)
- `created_at` (DateTime)

**Table: `message_feedback`**
- `id` (UUID, PK)
- `message_id` (UUID, FK→messages)
- `user_id` (UUID, FK→users)
- `rating` (String: positive/negative)
- `comment` (Text, nullable)
- `created_at` (DateTime)

### Substrate Models (`db/models/substrate.py`)
**Table: `artifacts`** (Content-Addressed)
- `sha256` (String(64), PK) — SHA-256 of content
- `media_type` (String)
- `size_bytes` (BigInt)
- `filename` (String, nullable)
- `storage_uri` (String) — S3 or local path
- `storage_class` (String: STANDARD/GLACIER/etc.)
- `created_by` (UUID, nullable)
- `reference_count` (Int, denormalized)
- `created_at` (TimestampMixin)
- Indexes: `ix_artifacts_media_type`, `ix_artifacts_created_at`

**Table: `manifests`** (Immutable Tree)
- `sha256` (String(64), PK) — SHA-256 of canonical JSON
- `tree` (JSONB) — entries + metadata
- `parent_sha256` (String(64), FK→manifests, nullable)
- `entry_count` (Int)
- `total_size_bytes` (BigInt)
- `created_by` (UUID, nullable)
- `message` (Text, nullable, commit message)
- `created_at` (TimestampMixin)
- Indexes: `ix_manifests_parent`, `ix_manifests_created_at`

**Table: `pointers`** (Mutable HEAD)
- `id` (UUID, PK)
- `tenant_id` (UUID, FK→tenants)
- `namespace` (String)
- `name` (String)
- `manifest_sha256` (String(64), FK→manifests, nullable)
- `status` (String: active/archived)
- `published_manifest_sha256` (String(64), nullable)
- `created_by`, `updated_by` (UUID)
- `created_at`, `updated_at` (TimestampMixin)
- Indexes: `uq_pointers_tenant_namespace_name`, `ix_pointers_manifest`

**Table: `pointer_history`** (Audit Trail)
- `id` (UUID, PK)
- `pointer_id` (UUID, FK→pointers)
- `old_manifest_sha256`, `new_manifest_sha256` (String(64))
- `action` (String: created/updated/published/promoted)
- `created_by` (UUID)
- `created_at` (DateTime)

### Run/Ledger Models (`db/models/runs.py`)
**Table: `runs`**
- `id` (UUID, PK)
- `run_type` (String: document_parse/research/analysis/etc.)
- `name` (String, nullable)
- `status` (String: pending/running/paused/completed/failed/cancelled)
- `started_at`, `completed_at` (DateTime, nullable)
- `input_manifest_sha256`, `output_manifest_sha256` (String(64), FKs→manifests)
- `config` (JSONB)
- `result` (JSONB, nullable)
- `error` (JSONB, nullable)
- `created_at` (TimestampMixin)
- Indexes: `ix_runs_status`, `ix_runs_created_at`

**Table: `run_events`** (Append-Only Ledger)
- `id` (UUID, PK)
- `run_id` (UUID, FK→runs)
- `event_type` (String: run_started/step_completed/tool_call/llm_request/artifact_emitted/etc.)
- `payload` (JSONB)
- `timestamp` (DateTime)
- `duration_ms` (Int, nullable)
- `sequence_num` (Int)
- Indexes: `ix_run_events_run_id`, `ix_run_events_type`

### RAG Models (`db/models/rag.py`)
**Table: `rag_chunks`**
- `id` (UUID, PK)
- `artifact_sha256` (String(64), FK→artifacts)
- `chunk_index` (Int)
- `content` (Text)
- `metadata` (JSONB)
- `embedding_model` (String)
- `embedding_dimensions` (Int)
- `embedding` (Vector, pgvector)
- `created_at` (TimestampMixin)
- Indexes: `uq_rag_chunks_artifact_chunk_model`

### Tag Model (`db/models/tags.py`)
**Table: `tags`**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK→tenants)
- `entity_type` (String: artifact/pointer/conversation/run/etc.)
- `entity_id` (UUID)
- `namespace` (String)
- `key`, `value` (String)
- `source` (String: manual/agent/system)
- `confidence` (Float, nullable)
- `verified_by`, `verified_at` (UUID, DateTime, nullable)
- `created_at` (DateTime)
- Indexes: `uq_tags_entity_tag`, `ix_tags_entity`, `ix_tags_lookup`, `ix_tags_unverified`

---

## 3. Schema Registry (Pydantic Models)

### Conversation Schemas (`schemas/conversations.py`)
- **ConversationCreate** — scope_type, scope_id, module, title, session_id, config_snapshot
- **ConversationUpdate** — title, status
- **ConversationResponse** — id, tenant_id, user_id, scope*, module, title, status, message_count, tokens (input/output), cost, session_id, run_id, timestamps
- **ConversationListResponse** — items: list[ConversationResponse], total: int
- **MessageResponse** — id, conversation_id, role, content, parts, tokens, cost, latency, model_id, status, parent_id, sequence, created_at
- **MessageListResponse** — items, total
- **BranchResponse**, **SiblingResponse**, **FeedbackResponse** (partial scan)

### Agent Schemas (`schemas/agent.py`)
- **AgentChatMessage** — role, content
- **AgentChatRequest** — messages[], pointer_id, manifest_sha256, conversation_id, session_id
- **AgentChatResponse** — run_id, message, sources[]

### Substrate Schemas (`schemas/substrate.py`)
- **ManifestEntry** — path, artifact_sha256, metadata
- **ArtifactUpload** — filename, media_type, content
- **PointerCreate**, **PointerResponse** (partial scan)

---

## 4. Service Layer Architecture

### Dependency Injection Graph (`api/dependencies.py`)
```
SessionDep (base)
  ├→ ArtifactServiceDep
  ├→ ManifestServiceDep
  ├→ PointerServiceDep
  ├→ RunServiceDep
  ├→ LedgerServiceDep
  ├→ ConversationServiceDep
  ├→ SessionServiceDep
  └→ TagServiceDep
```

### Service Dependencies
```
ConversationService
  ├→ ConversationRepository
  └→ MessageRepository

RunService
  ├→ RunRepository
  └→ LedgerService

ManifestService
  ├→ ManifestRepository
  └→ ArtifactRepository

RagService
  ├→ ArtifactService
  ├→ ManifestService
  ├→ Docling (PDF/document parsing)
  ├→ OpenAI (embeddings)
  └→ OpenSearchClient or pgvector

ResearchAssistantGraph (LangGraph)
  ├→ RagService
  ├→ LedgerService
  ├→ ChatOpenAI (LLM)
  └→ build_research_tools() (4 tools)
```

### Service Responsibilities
| Service | Key Responsibility |
|---------|-------------------|
| **ArtifactService** | Upload, retrieve, delete; delegates to storage backend (S3/local) |
| **ManifestService** | Build immutable trees; SHA-256 computation; dedup; history/diff |
| **PointerService** | Create/update refs; publish/promote workflows; history tracking |
| **RagService** | Chunk extraction (Docling), embedding (OpenAI), indexing (OpenSearch/pgvector), retrieval |
| **RunService** | Create, transition states, link to inputs/outputs |
| **LedgerService** | Log run events, retrieve event stream, filter by type |
| **ConversationService** | Create/manage conversations, save/retrieve messages, feedback |
| **SessionService** | Session lifecycle, idle timeout, state snapshots |
| **TagService** | Tag CRUD, entity scoping, verification workflow |
| **ResearchAssistantGraph** | LangGraph orchestration; tool invocation; message streaming |

---

## 5. Agent/Graph Architecture

### ResearchAssistantGraph (`agents/graphs/research_assistant.py`)

**State Machine:**
```python
@dataclass
class ResearchState:
    messages: Annotated[list[BaseMessage], add_messages]
    context_pointer_id: str | None
    manifest_sha256: str | None
    sources: list[dict]
    error: str | None
    run_id: UUID | None
```

**Graph Structure (3 nodes):**
1. **Agent Node** — ChatOpenAI with tools bound; invoke_model + tools_condition
2. **ToolNode** — Tool execution (search_documents, list_notebooks, get_document_info, compare_manifests)
3. **END** — Conversation termination

**Tools Available:**
- `search_documents(query, manifest_sha256)` → retrieve chunks with similarity scores
- `list_notebooks()` → enumerate pointers with current manifest
- `get_document_info(artifact_sha256)` → artifact metadata (size, type, path)
- `compare_manifests(old_sha256, new_sha256)` → diff between versions

**System Prompt:**
- "Act first, explain after"
- Auto-citation format: [1], [2], [3]
- 3x search max per question
- Defers to tools (except greetings)
- Confidence reporting for ambiguous cases

**Checkpointer Integration:**
- Uses LangGraph checkpointer (DEC-051) for multi-turn state persistence
- Per-session async_sessionmaker binding

---

## 6. API Surface

### Router Composition (`api/v1/__init__.py`)
All routers prefixed with `/api/v1`:
- `/health` → health checks
- `/auth` → authentication
- `/agent` → agent chat
- `/artifacts` → artifact CRUD
- `/conversations` → conversation CRUD + messages + feedback
- `/manifests` → manifest inspection
- `/pointers` → pointer management
- `/rag` → RAG operations
- `/runs` → run lifecycle
- `/sessions` → session management
- `/streams` → SSE (run events, activity)
- `/tags` → tagging

### Authentication Middleware (`api/middleware/auth.py`)
**Two Auth Paths:**
1. **API Key** (X-API-Key header) → hash → lookup APIKey record → rate limit → update last_used_at
2. **Bearer Token** (Authorization: Bearer {jwt}) → decode → validate expiry → lookup User record

**Context Setup:**
- RequestContext with tenant_id, user_id/api_key_id, scopes, ip, user_agent
- Rate limiting per API key (configurable RPM)
- IP allowlist (optional)
- Expiry checks

### Example Endpoint: Create Conversation
```
POST /api/v1/conversations
Body: ConversationCreate
Response: ConversationResponse (201)
Auth: WriteContext (write scope required)
```

### Example Endpoint: Stream Run Events
```
GET /api/v1/streams/run/{run_id}
Response: text/event-stream (SSE)
Events: run_event (JSON), heartbeat, error
Backend: PostgreSQL LISTEN/NOTIFY
```

---

## 7. Configuration System

### Settings Model (`config.py`)
```python
class Settings(BaseSettings):
    # Application
    app_name: str = "Intelli Document Platform"
    debug: bool = False
    log_level: str = "INFO"

    # Database
    database_url: PostgresDsn = "postgresql+asyncpg://..."
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Storage
    storage_backend: Literal["s3", "local"] = "s3"
    s3_endpoint_url, s3_bucket, s3_region: str
    local_storage_path: str = "/tmp/intelli-storage"

    # Embeddings
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    openai_api_key, openai_base_url: str

    # LLM
    chat_model: str = "gpt-4o-mini"
    chat_model_temperature: float = 0.2
    chat_model_max_tokens: int = 4096
    chat_model_reasoning_effort: str | None = None  # low/medium/high for o-series

    # Indexing
    index_backend: Literal["pgvector", "opensearch"] = "pgvector"
    opensearch_url, opensearch_username, opensearch_password: str
    opensearch_verify_certs: bool = False
    opensearch_chunks_index: str = "intelli-chunks-v1"

    # MCP Server
    mcp_transport: Literal["streamable-http", "stdio"] = "streamable-http"
    mcp_port: int = 8001

    # Security
    secret_key: str  # JWT signing
    jwt_expiry_hours: int = 24
    cors_origins: list[str] = ["http://localhost:3000"]
    rate_limit_rpm: int = 60

    # LangGraph
    checkpointer_pool_size: int = 5  # psycopg pool for checkpointer
```

### Storage Factory Pattern
```python
def get_storage_backend() -> StorageBackend:
    if settings.storage_backend == "s3":
        return S3StorageBackend()
    elif settings.storage_backend == "local":
        return LocalStorageBackend()
```

---

## 8. Import Dependency Graph

### Top-Level Entry
```
main.py
├→ config.py (Settings)
├→ api.health (health router)
├→ api.v1 (all v1 routers)
├→ api.middleware (auth, context, correlation, error_handler)
├→ core.logging (setup_logging)
├→ core.session_monitor (start/stop)
├→ services.indexing.init (init_index_backend)
└→ db.checkpointer (get/close_checkpointer)
```

### Router Dependencies (Example: conversations)
```
api.v1.conversations
├→ api.dependencies (ConversationServiceDep, WriteContext)
├→ api.middleware.auth (AuthContext, WriteContext)
├→ services.conversation_service (ConversationService)
└→ schemas.conversations (request/response models)
```

### Service Dependencies (Example: RagService)
```
services.knowledge.rag_service (RagService)
├→ config (Settings)
├→ db.models (Artifact, RagChunk)
├→ repositories.artifacts (ArtifactRepository)
├→ services.indexing.opensearch_* (OpenSearchClient, OpenSearchChunkIndex)
├→ services.substrate.artifact_service (ArtifactService)
├→ services.substrate.manifest_service (ManifestService)
├→ services.runs.ledger_service (LedgerService)
├→ docling (DocumentConverter, for PDF → text)
└→ openai.AsyncOpenAI (embeddings)
```

### Graph Dependencies (ResearchAssistantGraph)
```
agents.graphs.research_assistant
├→ langchain_openai (ChatOpenAI)
├→ langgraph (StateGraph, ToolNode, tools_condition)
├→ agents.tools.research_tools (build_research_tools)
├→ services.knowledge.rag_service (RagService)
├→ services.runs.ledger_service (LedgerService)
└→ config (Settings for LLM params)
```

---

## 9. Code Metrics

### Lines of Code (LOC) by Directory
| Directory | Est. LOC | Primary Purpose |
|-----------|----------|-----------------|
| `db/models/` | 600+ | SQLAlchemy models (6 files) |
| `api/v1/` | 1200+ | FastAPI routers (11 files) |
| `services/` | 1500+ | Business logic (21 files) |
| `repositories/` | 400+ | Data access (9 files) |
| `schemas/` | 250+ | Pydantic models (7 files) |
| `agents/` | 300+ | LangGraph + tools (5 files) |
| `core/` | 400+ | Utilities (8 files) |
| `api/middleware/` | 300+ | Auth + context (4 files) |
| `storage/` | 200+ | S3/local backend (4 files) |
| `mcp/` | 200+ | MCP server (4 files) |
| `api/` | 100+ | Dependencies, health (2 files) |
| `db/` | 150+ | Engine, checkpointer, base (3 files) |

**Estimated Total:** 5500–6000 LOC

### Classes & Functions per Module
| Module | Classes | Functions |
|--------|---------|-----------|
| `db.models.auth` | 3 + 3 enums (Tenant, User, APIKey) | — |
| `db.models.conversations` | 4 models + 4 enums | — |
| `db.models.substrate` | 4 models (Artifact, Manifest, Pointer, PointerHistory) | — |
| `db.models.runs` | 2 models + 2 enums | — |
| `repositories.base` | 1 generic repo | 7 methods |
| `services.conversation_service` | 1 service | 10+ methods |
| `services.substrate.manifest_service` | 1 service + 2 dataclasses | 5+ methods |
| `services.knowledge.rag_service` | 1 service + 2 dataclasses | 8+ methods |
| `agents.graphs.research_assistant` | 1 graph class + 1 dataclass | 4 methods |
| `agents.tools.research_tools` | — | 1 factory + 4 tools |
| `api.v1.conversations` | — | 6 endpoints |
| `api.v1.agent` | — | 2 endpoints (chat + stream) |

---

## 10. Gap Identification & Implementation Status

### Fully Implemented
✅ **Multi-tenant Auth** — Tenant, User, APIKey models with scopes, rate limiting, IP allowlist
✅ **Artifacts (Content-Addressed)** — SHA-256 PK, storage delegation, deduplication
✅ **Manifests** — Immutable trees, SHA-256, parent tracking, diff logic
✅ **Pointers** — Mutable HEAD refs, namespace/name, publish/promote workflows
✅ **Runs + Ledger** — Append-only event stream, status transitions, reproducibility
✅ **Sessions** — Lifecycle mgmt, idle timeout, config snapshots
✅ **Conversations** — Chat history, messages, feedback, branching (parent_message_id)
✅ **RAG** — Chunking (Docling), embeddings (OpenAI), indexing (OpenSearch/pgvector), retrieval
✅ **Research Assistant Graph** — 3-node LangGraph, tool binding, citation formatting
✅ **Storage Factory** — S3 + local backends, pluggable
✅ **MCP Server** — Substrate, run, knowledge tools exposed
✅ **SSE Streaming** — PG LISTEN/NOTIFY for real-time run events
✅ **Authentication** — JWT + API key auth, WriteContext, rate limiting

### Partial/Stub Implementations
⚠️ **Governance** — Placeholder package (`services/governance/__init__.py`)
⚠️ **DocIR** — Placeholder package (`services/docir/__init__.py`)
⚠️ **Tags** — Basic CRUD; verification workflow exists but optional
⚠️ **Audit Service** — File exists but scanned first 80 lines only
⚠️ **Jobs/Scheduling** — `core/jobs.py` (arq integration) not scanned in detail
⚠️ **Observability** — `agents/observability.py` not scanned in detail
⚠️ **Cache Layer** — `core/cache.py` not scanned in detail

### Known Design Notes
- **No Send() Tool** (Per ADR-004) — Run ledger is primary; Send() deferred to v1.5
- **No Visual Editor** (DEC-049) — LangSmith Studio + graph-as-code
- **LangGraph Checkpointer** (DEC-051) — Uses psycopg pool with per-session binding
- **Charts: Plotly.js** (DEC-048) — NOT Recharts (early doc references are wrong)
- **GML Rendering** (DEC-015a/b split) — Backend JSON AST + frontend rehype-to-JSX
- **Search via MCP** (DEC-046) — Hot-swap Brave/Tavily (supersedes DEC-032)

---

## 11. Critical Architectural Patterns

### Request Lifecycle
```
1. Request arrives at FastAPI
2. ErrorHandlerMiddleware (global exception handler)
3. CorrelationMiddleware (trace ID)
4. AuthContextMiddleware (JWT/API key → RequestContext)
5. Route handler receives WriteContext (tenant_id, user_id, can_write())
6. Service dependency injected (e.g., ConversationServiceDep)
7. Service calls repository (e.g., ConversationRepository)
8. Repository executes SQL via AsyncSession
9. Response serialized to Pydantic schema
10. On commit: session.commit(); on error: session.rollback()
```

### Content-Addressing Pattern
```
Artifact:
  1. Upload binary → compute SHA-256
  2. Store in S3 with URI = s3://bucket/{sha256}
  3. PK = sha256 (no ID generation)
  4. Dedup: if artifact already exists, reuse

Manifest:
  1. Build tree structure (entries + metadata)
  2. Canonicalize JSON (sorted keys, no whitespace)
  3. Compute SHA-256 of canonical JSON
  4. PK = sha256
  5. parent_sha256 links to previous → DAG

Pointer:
  1. Create named ref (namespace/name)
  2. manifest_sha256 points to HEAD
  3. publish() → published_manifest_sha256
  4. PointerHistory tracks all transitions
```

### Tool/Graph Pattern
```
ResearchAssistantGraph:
  1. Initialize with session → RagService + tools
  2. build_research_tools(session) → list of @tool functions
  3. ChatOpenAI.bind_tools(tools)
  4. StateGraph with message reducer (add_messages)
  5. Node: agent → calls LLM with tools bound
  6. Node: tool_node → invokes selected tool
  7. Conditional edge: tools_condition (end or loop)
  8. Checkpointer persists intermediate state
```

---

## 12. External Dependencies (Key Integrations)

| Library | Purpose | Version/Config |
|---------|---------|-----------------|
| **FastAPI** | API framework | 0.100+ |
| **SQLAlchemy 2.0** | ORM + async | Latest async |
| **Pydantic** | Schemas + validation | v2 |
| **LangGraph** | Graph orchestration | Latest |
| **LangChain** | LLM/tool abstraction | Latest |
| **OpenAI** | Embeddings + ChatOpenAI | AsyncOpenAI client |
| **Docling** | PDF/document parsing | Latest |
| **pgvector** | Vector embeddings in Postgres | SQLAlchemy integration |
| **OpenSearch** | Vector search (optional) | HTTP client + urllib |
| **asyncpg** | Postgres async driver | For LISTEN/NOTIFY |
| **boto3** | S3 integration | Async wrapper |
| **PyJWT** | JWT signing | For token generation |
| **passlib** | Password hashing | Argon2 + bcrypt |

---

## Revision Notes
- **Scope:** First 80–150 lines per file to capture structure
- **Exclusions:** __pycache__, __init__.py (mostly empty)
- **Completeness:** All 103 Python files inventoried
- **Next Steps:** Detailed scan of stubs (governance, docir, jobs, observability) if needed

