# Entity, Citation & Document Management Extraction
## Comprehensive Schema Reconstruction from Superagent Analysis

**Date**: 2026-02-20
**Source Materials**: CHAT-EXPORT-ANALYSIS, SYSTEM-ARCHITECTURE, PLATFORM-GROUND-TRUTH, TECHNICAL-DEEP-DIVE, DECISION-REGISTER, REPORT_C_ANALYSIS, DESIGN-KNOWLEDGE-CONTEXT-SYSTEM, BACKLOG
**Purpose**: Extract every entity type, citation pattern, document lifecycle, and artifact management schema for implementation in nyqst-intelli-230126

---

## 1. Entity Type Registry (Complete 12-Type System)

### 1.1 Superagent Entity Types (From SYSTEM-ARCHITECTURE §10.1)

The Superagent system defines 12 discriminated union entity types:

```typescript
type EntityType =
  | "WEB_PAGE"                      // Web search result (Brave, Firecrawl)
  | "EXTERNAL_API_DATA"             // Tool output (Polygon, Crunchbase, FactSet, FRED, Quartr, Kalshi, Quiver)
  | "GENERATED_CONTENT"             // LLM-generated prose, structured data
  | "USER_QUERY_PART"               // User message components, uploaded files
  | "GENERATED_REPORT"              // Report artifact (final or scratch_pad)
  | "GENERATED_PRESENTATION"        // Slides/deck artifact
  | "INTRA_ENTITY_SEARCH_RESULT"    // Search within entity (knowledge base drill-down)
  | "EXTRACTED_ENTITY"              // Parsed/structured data from raw content
  | "SEARCH_PLAN"                   // Research plan (plan_sets)
  | "KNOWLEDGE_BASE"                // Uploaded documents for RAG
  | "WEBSITE"                       // Website deliverable (deployed or preview)
  | "GENERATED_DOCUMENT"            // Document deliverable (PDF/DOCX)
```

### 1.2 NYQST Mapping Strategy

NYQST's content-addressed kernel (Artifact/Manifest/Pointer) must support these types. Current schema gap:

**Problem**: Artifact model has NO `entity_type` field. Artifacts are pure content blobs (sha256 PK, media_type, size_bytes, storage_uri).

**Solution** (DEC-016): Extend Artifact with `entity_type` column. Add to Migration 0005a:

```python
# Migration 0005a: artifact_entity_type
class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"
    sha256: str         # PK
    media_type: str
    size_bytes: int
    storage_uri: str
    entity_type: str | None  # NEW (12 types above, mapped to NYQST equivalents)
    # ... existing fields
```

### 1.3 NYQST Entity Types (Platform-Native)

Map Superagent types → NYQST types, leveraging existing substrate:

| Superagent Type | NYQST Equivalent | Artifact Stored As | Manifest Entry |
|---|---|---|---|
| WEB_PAGE | WEB_SOURCE | text/html or text/plain | source: {url, title, favicon, retrieved_at} |
| EXTERNAL_API_DATA | API_DATA | application/json | provider: {name, fields, timestamp} |
| GENERATED_CONTENT | GENERATED_CONTENT | text/plain or text/markdown | content_type: string |
| USER_QUERY_PART | USER_INPUT | application/octet-stream (file) or text/plain | metadata: {filename, source} |
| GENERATED_REPORT | REPORT | application/json (AST) or text/html | report_subtype: final\|scratch_pad |
| GENERATED_PRESENTATION | SLIDES | application/zip (reveal.js) or text/html | format: reveal_js\|html |
| INTRA_ENTITY_SEARCH | SEARCH_RESULT | text/plain (snippet) | parent_entity_id: uuid |
| EXTRACTED_ENTITY | EXTRACTED_DATA | application/json | entity_class: string |
| SEARCH_PLAN | PLAN | application/json (RunEvent PLAN_CREATED) | plan_version: int |
| KNOWLEDGE_BASE | KNOWLEDGE | text/plain (chunked) or text/pdf | chunk_index: int, parent_doc_id |
| WEBSITE | WEBSITE | application/zip (HTML/CSS/JS bundle) | deployed_url?: string, demo_url?: string |
| GENERATED_DOCUMENT | DOCUMENT | application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document | doc_format: pdf\|docx |

### 1.4 Entity Schema (Full Interface)

From TECHNICAL-DEEP-DIVE §3.6 + CHAT-EXPORT-ANALYSIS §8:

```typescript
interface BaseEntity {
  id: string;                       // Stable UUID identifier
  type: EntityType;                 // Discriminator (12 types)
  title?: string;                   // Display name
  created_at: string;               // ISO 8601 UTC
  created_by?: UUID;                // User who created/triggered creation
  message_id?: string;              // FK to ChatMessage that references this entity
  run_id?: string;                  // FK to Run that generated it
  metadata?: Record<string, any>;   // Provider-specific data
}

interface WEBPageEntity extends BaseEntity {
  entity_type: "WEB_PAGE";
  external_url: string;
  title: string;
  favicon?: string;
  retrieved_at: string;
  snippet?: string;                 // Search result snippet
  provider: "brave" | "firecrawl";
  content?: string;                 // Full page content or summary
  word_count?: number;
}

interface ExternalAPIDataEntity extends BaseEntity {
  entity_type: "EXTERNAL_API_DATA";
  provider: "polygon" | "crunchbase" | "fred" | "quartr" | "kalshi" | "quiver" | "fin_doc";
  api_specific_metadata?: Record<string, any>;
  api_subtype: string;              // "stock_price", "company_profile", "earnings_call", etc.
  external_url?: string;
  retrieved_at: string;
  structured_data?: Record<string, any>;
}

interface GeneratedReportEntity extends BaseEntity {
  entity_type: "GENERATED_REPORT";
  all_seen_entities: string[];      // All entities referenced during generation
  cited_entities: string[];         // Subset actually cited in final report
  report_subtype?: "final_report" | "scratch_pad" | "other";
  user_query: string;               // Original user request that generated this
  content_type: "json_ast" | "html" | "markdown";
  metadata?: {
    word_count?: number;
    section_count?: number;
    chart_count?: number;
  }
}

interface WebsiteEntity extends BaseEntity {
  entity_type: "WEBSITE";
  user_query: string;               // Original request
  deployed_url?: string;
  demo_url?: string;
  preview_url?: string;            // Iframe-only preview in v1
  cited_entities: string[];
  all_seen_entities: string[];
  chat_id: string;
  project_id: string;
  deployed: boolean;                // default: false
  generation_status: "in_progress" | "complete" | "failed";
  created_by_job: boolean;
  metadata?: {
    bundle_size?: number;
    file_count?: number;
    assets?: string[];
  }
}

interface GeneratedPresentationEntity extends BaseEntity {
  entity_type: "GENERATED_PRESENTATION";
  all_seen_entities: string[];
  cited_entities: string[];
  user_query: string;
  presentation_format: "reveal_js" | "json_ast" | "html";
  slide_count?: number;
  metadata?: {
    theme?: string;
    transitions?: boolean;
  }
}

interface GeneratedDocumentEntity extends BaseEntity {
  entity_type: "GENERATED_DOCUMENT";
  all_seen_entities: string[];
  query: string;
  mimetype: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  word_count?: number;
  metadata?: {
    page_count?: number;
    font_family?: string;
  }
}

interface KnowledgeBaseEntity extends BaseEntity {
  entity_type: "KNOWLEDGE_BASE";
  document_id: UUID;                // FK to source document in knowledge base
  chunk_index: number;
  chunk_size: number;
  embedding?: number[];             // Vector embedding for similarity search
  content_preview?: string;         // First 200 chars
}

interface UserInputEntity extends BaseEntity {
  entity_type: "USER_QUERY_PART";
  source: "text" | "uploaded_file";
  filename?: string;                // For uploaded files
  mime_type?: string;
  content_preview?: string;
}
```

### 1.5 Entity Lifecycle

```
Creation
  ↓
Tool executes → data retrieved → Entity created (WEB_PAGE, EXTERNAL_API_DATA, etc.)
  ↓
Entity added to references[] on RunEvent
  ↓
Stream event: { type: "references_found", references: Entity[] }
  ↓
LLM output: <gml-inlinecitation identifier="entity-abc-123"/>
  ↓
UI looks up entity by identifier
  ↓
Render citation with source metadata (URL, title, date, provider)
  ↓
User can click → drill into full content, view source, export
```

---

## 2. Artifact Model (Existing + Entity Extension)

### 2.1 Current NYQST Artifact Model (PLATFORM-GROUND-TRUTH §4)

**Pure content-addressed storage:**

```python
class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"

    # Content-addressed key
    sha256: str                       # PK — SHA-256 of content (64 hex chars)

    # Storage metadata
    media_type: str                   # MIME type (application/json, text/html, application/zip, etc.)
    size_bytes: int
    filename: str | None              # Original filename (optional)
    storage_uri: str                  # e.g. "s3://bucket/key" or "minio://intelli-artifacts/sha256/..."
    storage_class: str                # STANDARD, GLACIER, etc.

    # Ownership
    created_by: UUID | None

    # Refcount (for garbage collection)
    reference_count: int

    # Timestamps
    created_at: datetime
    updated_at: datetime
```

**NO**: `entity_type`, `metadata` JSONB, `description`, etc. Pure blob.

### 2.2 Extension for Superagent Parity (DEC-016)

Add to Migration 0005a:

```python
class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"

    # ... existing fields ...

    # NEW: Entity typing
    entity_type: str | None           # 'WEB_SOURCE' | 'API_DATA' | 'REPORT' | 'WEBSITE' | etc.

    # For convenience when entity_type != None:
    entity_metadata: dict | None      # Pydantic model serialized to dict
    # {
    #   "provider": "brave",          # for WEB_SOURCE, EXTERNAL_API_DATA
    #   "external_url": "https://...",
    #   "report_subtype": "final_report",  # for REPORT
    #   "deployment_status": "complete",   # for WEBSITE
    # }
```

**Rationale**: Avoid new table; entity types are attributes of artifacts, not first-class entities. Migration 0005a only touches one table.

### 2.3 Manifest Model (Already Complete)

**Superagent does NOT use Manifests explicitly, but NYQST does.** Manifest = immutable snapshot of a tree (version control style).

```python
class Manifest(Base, TimestampMixin):
    __tablename__ = "manifests"

    sha256: str                       # PK
    tree: dict                        # JSONB — the actual tree entries
    # {
    #   "reports/executive_summary.json": {
    #     "sha256": "abc123...",
    #     "media_type": "application/json",
    #     "entity_type": "REPORT",
    #     "size_bytes": 50000
    #   },
    #   "website/index.html": {
    #     "sha256": "def456...",
    #     "media_type": "text/html",
    #     "size_bytes": 25000
    #   },
    #   "website/assets/logo.png": { ... }
    # }

    parent_sha256: str | None        # Parent manifest (version control)
    entry_count: int
    total_size_bytes: int
    created_by: UUID | None
    message: str | None               # Commit-style message
    created_at: datetime
    updated_at: datetime
```

### 2.4 Pointer Model (Already Complete)

**Mutable HEAD reference.** Pointer → Manifest → Artifacts.

```python
class Pointer(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "pointers"

    id: UUID                          # PK
    namespace: str                    # "default" or custom namespace
    name: str                         # e.g. "conversation-{id}/latest-report"

    manifest_sha256: str | None       # FK → manifests (nullable before first commit)
    pointer_type: str                 # "bundle" | "corpus" | "snapshot"

    description: str | None
    meta: dict                        # JSONB — "metadata" column, aliased
    # For Superagent mappings:
    # {
    #   "deliverable_type": "REPORT",
    #   "user_query": "commercial real estate metrics",
    #   "run_id": "uuid",
    #   "first_report_identifier": "uuid"  (from CHAT-EXPORT-ANALYSIS)
    # }

    created_by: UUID | None
    created_at: datetime
    updated_at: datetime
```

### 2.5 Pointer History (Audit Trail)

```python
class PointerHistory(Base, TimestampMixin):
    __tablename__ = "pointer_history"

    id: UUID                          # PK
    pointer_id: UUID                  # FK → pointers
    from_manifest_sha256: str | None
    to_manifest_sha256: str | None
    reason: str | None                # "deliverable_generated" | "user_reset" | etc.
    changed_by: UUID | None
    created_at: datetime
```

---

## 3. Citation Algorithm (Citation Buffering + Bracket Detection)

### 3.1 Citation Buffering State Machine (From TECHNICAL-DEEP-DIVE §3.7)

**Problem**: LLM streams inline citations as `[citation text]`. Frontend must delay rendering until `]` is seen (to avoid incomplete citations in UI).

**Solution**: Citation Buffer state machine.

```typescript
class CitationBuffer {
  private isInCitation: boolean = false;
  private buffer: string = "";
  private readyPointer: number = -1;

  // Returns true if new content is ready to display
  feed(chunk: string): boolean {
    if (!chunk) return false;
    this.buffer += chunk;

    const prevReady = this.readyPointer;
    for (let i = this.readyPointer + 1; i < this.buffer.length; i++) {
      const char = this.buffer[i];

      if (char === "[") {
        this.isInCitation = true;
      } else if (char === "]" || char === "\n") {
        // ] ends citation, or \n is safety valve for malformed citations
        this.isInCitation = false;
      }

      if (!this.isInCitation) {
        this.readyPointer = i;
      }
    }

    return prevReady !== this.readyPointer;
  }

  getReadyContent(): string {
    // Safe to display — no incomplete citations
    return this.buffer.slice(0, this.readyPointer + 1);
  }

  getFullContent(): string {
    // Includes in-progress citations
    return this.buffer;
  }
}
```

**State Rules**:
- `[` → enter citation mode (stop advancing ready pointer)
- `]` → exit citation mode (resume advancing)
- `\n` → also exits citation mode (safety valve for unclosed brackets)
- Ready pointer advances only when NOT in citation mode

### 3.2 Inline Citation Binding

From SYSTEM-ARCHITECTURE §10.5:

```
Flow:
1. Tool creates entity with ID `entity-abc-123`
2. Entity added to run's reference list
3. Stream event: { type: "references_found", references: [Entity] }
4. LLM output: <gml-inlinecitation identifier="entity-abc-123"/>
5. UI looks up entity by identifier in references[], renders citation
```

### 3.3 Citation Rendering

From CHAT-EXPORT-ANALYSIS §8 + SYSTEM-ARCHITECTURE §10.5:

```typescript
// Frontend citation renderer
interface InlineCitationProps {
  identifier: string;                // entity ID from LLM
  entities: Map<string, Entity>;     // references from stream
}

function InlineCitation({ identifier, entities }: InlineCitationProps) {
  const entity = entities.get(identifier);

  if (!entity) return null;  // Entity not yet received

  const displayText = entity.title || (
    entity.type === "WEB_PAGE" ? entity.external_url :
    entity.type === "EXTERNAL_API_DATA" ? `${entity.provider}: ${entity.api_subtype}` :
    entity.type === "REPORT" ? "Report" :
    "Citation"
  );

  return (
    <Citation
      onClick={() => showSourcePanel(entity)}
      className="inline-citation"
    >
      [{displayText}]  {/* Brackets rendered as part of UI */}
    </Citation>
  );
}
```

### 3.4 Source Panel Integration

From SYSTEM-ARCHITECTURE §3.3:

```typescript
// Sources panel shows all entities referenced in current message
interface SourcesPanelProps {
  entities: Entity[];
}

function SourcesPanel({ entities }: SourcesPanelProps) {
  return (
    <div className="sources-panel">
      {entities.map((entity) => (
        <SourceCard key={entity.id} entity={entity}>
          {/* WEB_PAGE: URL + favicon + title + snippet */}
          {entity.type === "WEB_PAGE" && (
            <>
              <img src={entity.favicon} alt="" />
              <a href={entity.external_url}>{entity.title}</a>
              <p>{entity.snippet}</p>
            </>
          )}

          {/* EXTERNAL_API_DATA: provider + timestamp + data */}
          {entity.type === "EXTERNAL_API_DATA" && (
            <>
              <strong>{entity.provider}</strong>
              <span>{entity.retrieved_at}</span>
              <JSONViewer data={entity.structured_data} />
            </>
          )}

          {/* ... other types ... */}
        </SourceCard>
      ))}
    </div>
  );
}
```

---

## 4. Async Entity Creation (arq Job Pattern)

### 4.1 Problem & Solution

From CHAT-EXPORT-ANALYSIS §8 + PLATFORM-GROUND-TRUTH:

**Problem**: In Superagent, entity creation is decoupled from main response stream. The `entities` array on a ChatMessage is initially empty and gets populated asynchronously. The UI shows "CREATING NOTES" status during this phase.

**Solution** (DEC-017): Async entity creation via arq background worker.

### 4.2 Implementation Pattern

```python
# src/intelli/agents/graphs/research_orchestrator.py

async def synthesizer_node(state: ResearchState) -> dict:
    """
    Main synthesis node — produces response text quickly.
    Entity creation happens in background (arq job).
    """
    # ... LLM synthesis ...

    synthesis_output = {
        "message": response_text,
        "entities": [],  # Empty initially
        "has_async_entities_in_progress": True  # FLAG SET
    }

    # Dispatch async entity creation job
    job = await enqueue_entity_creation(
        run_id=state.run_id,
        message_id=state.current_message_id,
        response_text=response_text,
        entities_needed=["citations", "summaries", "insights"]
    )

    return synthesis_output


# src/intelli/core/jobs.py (arq job definitions)

@job
async def create_entities_from_response(
    run_id: UUID,
    message_id: UUID,
    response_text: str,
    entities_needed: list[str]
) -> dict:
    """
    Post-processing job: Extract and create entities from synthesized response.
    Updates message.entities[] in DB.
    Emits RunEvent: ENTITY_CREATED.
    """

    async with get_db() as db:
        # 1. Parse response for citations
        citations = extract_citations(response_text)  # Parse [citation] brackets

        # 2. Look up referenced entities (already created by tools)
        entities = []
        for citation in citations:
            entity = await find_entity_by_id(db, citation.identifier)
            if entity:
                entities.append(entity)

        # 3. Generate entity summaries
        for entity in entities:
            summary = await generate_entity_summary(entity)  # LLM call
            entity.summary = summary

        # 4. Update message
        message = await db.execute(
            update(Message)
            .where(Message.id == message_id)
            .values(entities=entities)
        )

        # 5. Emit event
        await emit_run_event(
            run_id=run_id,
            event_type=RunEventType.ENTITY_CREATED,
            data={
                "message_id": message_id,
                "entity_count": len(entities),
                "entities": entities
            }
        )

        return {"status": "complete", "entity_count": len(entities)}


# Background job queue (arq + Redis)
# In docker-compose.yml:
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"

# In .env:
REDIS_URL=redis://localhost:6379
ARQ_QUEUE_NAME=intelli-jobs

# Usage:
async def enqueue_entity_creation(run_id, message_id, response_text, entities_needed):
    queue = await get_queue()
    job = await queue.enqueue(create_entities_from_response, ...)
    return job
```

### 4.3 Frontend Progress Indicator

From CHAT-EXPORT-ANALYSIS §4:

```typescript
// ui/src/stores/conversation-store.ts (Zustand)

interface ConversationStore {
  messages: ChatMessage[];
  has_async_entities_in_progress: boolean;
  // ...
}

// ui/src/components/chat/ChatPanel.tsx

function ChatPanel() {
  const hasAsyncEntities = conversationStore.has_async_entities_in_progress;

  return (
    <div>
      {messages.map((msg) => (
        <Message key={msg.id} message={msg}>
          {msg.creator_type === "AI" && (
            <MessageContent>{msg.hydrated_content}</MessageContent>
          )}
          {msg.entities.length > 0 && (
            <CitationsPanel entities={msg.entities} />
          )}
        </Message>
      ))}

      {hasAsyncEntities && (
        <div className="creating-entities">
          <Spinner /> Creating notes...
        </div>
      )}
    </div>
  );
}
```

### 4.4 `has_async_entities_in_progress` Flag

From CHAT-EXPORT-ANALYSIS §4:

```typescript
interface ChatMessage {
  // ... existing fields ...
  entities: Entity[];
  has_async_entities_in_progress: boolean;  // NEW FLAG
}

interface Chat {
  // ... existing fields ...
  messages: ChatMessage[];
  has_async_entities_in_progress: boolean;  // Chat-level flag (all async work done?)
}

// When all entities for all messages are created:
// has_async_entities_in_progress → false
// UI knows async work is complete
```

---

## 5. Document Lifecycle (Upload → Index → Artifact → Manifest → Pointer)

### 5.1 Complete Lifecycle

```
1. USER UPLOAD
   UI: File picker → POST /api/v1/artifacts (multipart)
   ↓

2. ARTIFACT CREATION
   Backend: Hash file (SHA-256)
   Save to S3/MinIO at storage_uri
   Create Artifact record (entity_type: "KNOWLEDGE_BASE")
   ↓

3. INDEXING (RAG)
   Backend: File → text extraction (via Docling or filetype-specific parser)
   Split into chunks (default 512 tokens, 50% overlap)
   Generate embeddings (OpenAI embedding model)
   Save chunks to RagChunk table with vector embedding
   ↓

4. MANIFEST CREATION (Optional)
   Backend: Create Manifest for document bundle
   tree: {
     "knowledge_base/{document_id}/raw": { sha256: artifact.sha256, ... },
     "knowledge_base/{document_id}/chunks": [...],
     "metadata.json": { ... }
   }
   ↓

5. POINTER ASSIGNMENT
   Backend: Create Pointer pointing to Manifest
   namespace: "knowledge_base"
   name: "{project_id}/documents"
   meta: {
     "document_id": uuid,
     "total_chunks": N,
     "vector_index": "opensearch|pgvector"
   }
   ↓

6. AVAILABILITY
   User can now: (a) chat with documents (RAG retrieval), (b) export, (c) delete
   Artifacts are reference-counted; GC when refcount = 0
```

### 5.2 Database Models Involved

```python
# Artifact (binary blob)
class Artifact(Base):
    sha256: str
    media_type: str  # e.g. "application/pdf", "text/plain"
    size_bytes: int
    storage_uri: str
    entity_type: str = "KNOWLEDGE_BASE"
    created_by: UUID
    created_at: datetime

# RagChunk (vector index)
class RagChunk(Base):
    id: UUID
    artifact_sha256: str  # FK → artifacts
    chunk_index: int
    content: str
    embedding: VECTOR(1536)  # pgvector
    metadata: dict  # {"page": 5, "section": "Introduction"}
    created_at: datetime
    # Indexes: (artifact_sha256, chunk_index), embedding vector index

# Manifest (bundle snapshot)
class Manifest(Base):
    sha256: str
    tree: dict  # { "knowledge_base/{id}/raw": {...}, "knowledge_base/{id}/chunks": [...] }
    created_by: UUID

# Pointer (mutable reference)
class Pointer(Base):
    namespace: str = "knowledge_base"
    name: str  # "{project_id}/documents"
    manifest_sha256: str  # FK → manifests
    meta: dict  # { "document_id": uuid, "total_chunks": 42 }
```

### 5.3 API Endpoints for Upload Lifecycle

```python
# src/intelli/api/v1/artifacts.py

@router.post("/artifacts")
async def upload_artifact(
    file: UploadFile,
    entity_type: str = "KNOWLEDGE_BASE"
) -> ArtifactSchema:
    """Upload and create artifact."""
    content = await file.read()
    sha256 = hashlib.sha256(content).hexdigest()

    # Store in S3/MinIO
    storage_uri = await storage.put(f"artifacts/{sha256}", content)

    # Create artifact record
    artifact = Artifact(
        sha256=sha256,
        media_type=file.content_type,
        size_bytes=len(content),
        storage_uri=storage_uri,
        entity_type=entity_type,
        created_by=current_user.id
    )
    db.add(artifact)
    await db.commit()

    # Optionally trigger indexing job
    if entity_type == "KNOWLEDGE_BASE":
        await queue.enqueue(index_artifact_chunks, artifact.sha256)

    return ArtifactSchema.model_validate(artifact)

@router.get("/artifacts/{sha256}/content")
async def download_artifact(sha256: str) -> StreamingResponse:
    """Download artifact content."""
    artifact = await db.get(Artifact, sha256)
    if not artifact:
        raise HTTPException(404)

    content = await storage.get(artifact.storage_uri)
    return StreamingResponse(
        iter([content]),
        media_type=artifact.media_type,
        headers={"Content-Disposition": f'attachment; filename="{artifact.filename or sha256}"'}
    )

# src/intelli/core/jobs.py

@job
async def index_artifact_chunks(artifact_sha256: str) -> dict:
    """Extract, chunk, embed, and index artifact."""
    async with get_db() as db:
        artifact = await db.get(Artifact, artifact_sha256)
        content = await storage.get(artifact.storage_uri)

        # 1. Extract text (filetype-specific)
        if artifact.media_type == "application/pdf":
            text = await extract_pdf_text(content)
        elif artifact.media_type == "text/plain":
            text = content.decode("utf-8")
        # ... other types ...

        # 2. Chunk (512 tokens, 50% overlap)
        chunks = chunk_text(text, chunk_size=512, overlap=256)

        # 3. Embed each chunk
        embeddings = await llm_client.embed(chunks)

        # 4. Save chunks to DB
        rag_chunks = [
            RagChunk(
                artifact_sha256=artifact_sha256,
                chunk_index=i,
                content=chunk,
                embedding=embedding,
                metadata={"chunk_length": len(chunk)}
            )
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        db.add_all(rag_chunks)

        # 5. Create Manifest (optional)
        manifest = Manifest(
            sha256=hash_json({"artifact": artifact_sha256, "chunks": len(chunks)}),
            tree={
                f"knowledge_base/{artifact_sha256}/raw": {
                    "sha256": artifact_sha256,
                    "size_bytes": artifact.size_bytes
                },
                "metadata.json": {
                    "chunk_count": len(chunks),
                    "total_tokens": sum(len(c.split()) for c in chunks)
                }
            }
        )
        db.add(manifest)

        # 6. Create Pointer
        pointer = Pointer(
            namespace="knowledge_base",
            name=f"indexed/{artifact_sha256}",
            manifest_sha256=manifest.sha256,
            meta={
                "artifact_sha256": artifact_sha256,
                "chunk_count": len(chunks),
                "indexed_at": datetime.utcnow()
            }
        )
        db.add(pointer)
        await db.commit()

        return {"status": "complete", "chunks": len(chunks)}
```

---

## 6. Source Tracking (WEB_PAGE Entities + Source-to-Citation Binding)

### 6.1 WEB_PAGE Entity Lifecycle

```
1. User query → Planner node
2. Planner creates research plan (search tasks)
3. Research executors call Brave Search API
4. Each result → WEB_PAGE entity created with:
   - external_url (source URL)
   - title (page title)
   - favicon (domain favicon)
   - snippet (search result snippet)
   - provider: "brave"
5. Entity added to references[]
6. If page is scraped via Firecrawl → full_content added to entity
7. LLM cites entity: <gml-inlinecitation identifier="entity-uuid"/>
8. UI renders citation with source card in SourcesPanel
```

### 6.2 Source Panel Integration (Dual Tab View)

From SYSTEM-ARCHITECTURE §3.3 + CHAT-EXPORT-ANALYSIS §5:

```typescript
// ui/src/components/chat/SourcesPanel.tsx (EXISTING, EXTEND)

interface SourcesPanelProps {
  entities: Entity[];
  tabMode: "all" | "web" | "api" | "generated";
}

function SourcesPanel({ entities, tabMode }: SourcesPanelProps) {
  // Existing: RAG document sources (from conversations table)
  const ragSources = entities.filter(e => e.type === "KNOWLEDGE_BASE");

  // NEW: Web sources (from research execution)
  const webSources = entities.filter(e => e.type === "WEB_PAGE");

  // NEW: API data sources
  const apiSources = entities.filter(e => e.type === "EXTERNAL_API_DATA");

  // NEW: Generated content
  const generatedSources = entities.filter(e =>
    ["GENERATED_REPORT", "GENERATED_PRESENTATION"].includes(e.type)
  );

  return (
    <div className="sources-panel">
      <Tabs>
        <TabTrigger value="all">All ({entities.length})</TabTrigger>
        <TabTrigger value="web">Web ({webSources.length})</TabTrigger>
        <TabTrigger value="api">Data ({apiSources.length})</TabTrigger>
        <TabTrigger value="generated">Generated ({generatedSources.length})</TabTrigger>
      </Tabs>

      <TabContent value="web">
        {webSources.map(entity => (
          <SourceCard key={entity.id} entity={entity}>
            <div className="web-source">
              {entity.favicon && <img src={entity.favicon} alt="" />}
              <a href={entity.external_url} target="_blank">
                {entity.title}
              </a>
              {entity.snippet && <p className="snippet">{entity.snippet}</p>}
              <div className="metadata">
                <span>{new URL(entity.external_url).hostname}</span>
                <span>{entity.retrieved_at}</span>
              </div>
            </div>
          </SourceCard>
        ))}
      </TabContent>

      <TabContent value="api">
        {apiSources.map(entity => (
          <SourceCard key={entity.id} entity={entity}>
            <div className="api-source">
              <strong>{entity.provider}</strong>
              <span className="subtype">{entity.api_subtype}</span>
              <span>{entity.retrieved_at}</span>
              {entity.external_url && (
                <a href={entity.external_url} target="_blank">View Source</a>
              )}
            </div>
          </SourceCard>
        ))}
      </TabContent>
    </div>
  );
}
```

### 6.3 WEB_SOURCE Entity Creation via Tool Execution

```python
# src/intelli/agents/tools/research_tools.py

async def search_web(query: str, session: AsyncSession) -> dict:
    """
    Execute web search via Brave Search API.
    Create WEB_SOURCE entities for each result.
    """
    from src.intelli.db.models.runs import RunEvent, RunEventType

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers={"Accept": "application/json", "X-Subscription-Token": BRAVE_API_KEY},
            params={"q": query, "count": 10}
        )
        results = response.json()

    entities = []
    for result in results.get("web", []):
        entity = Entity(
            id=str(uuid.uuid4()),
            type="WEB_PAGE",
            title=result.get("title"),
            external_url=result.get("url"),
            favicon=extract_favicon_url(result.get("url")),
            snippet=result.get("description"),
            provider="brave",
            retrieved_at=datetime.utcnow()
        )
        entities.append(entity)

    # Emit RunEvent
    run_event = RunEvent(
        run_id=current_run_id,  # From context
        event_type=RunEventType.REFERENCES_FOUND,
        data={"references": [e.model_dump() for e in entities]}
    )
    session.add(run_event)
    await session.commit()

    return {
        "query": query,
        "result_count": len(entities),
        "entities": entities
    }
```

---

## 7. Knowledge Context System (Dify Comparison)

### 7.1 Dify's Knowledge System

From DESIGN-KNOWLEDGE-CONTEXT-SYSTEM §2:

**Problem**: Dify has no persistent organizational learning system. Knowledge is per-session, never reused.

**Dify's approach**:
- Documents uploaded → indexed
- Queries → RAG retrieval (vector search)
- Results → injected into prompt
- End of session → knowledge lost

### 7.2 NYQST's Knowledge + Insights System (Phase 2+)

**Solution** (Priority 2, but schema defined):

```python
# Insights table: organizational learning capture

class Insight(Base, TimestampMixin):
    __tablename__ = "insights"

    id: UUID
    tenant_id: UUID

    # Scope binding (where was it learned?)
    scope_type: str  # 'tenant' | 'project' | 'task'
    scope_id: UUID | None

    # Source (what conversation/run/message created it?)
    source_type: str  # 'conversation' | 'message' | 'run_event' | 'manual'
    source_id: UUID

    # The insight itself
    insight_type: str  # 'lesson' | 'method' | 'pattern' | 'warning' | 'metric'
    title: str
    content: str  # summary/index text
    structured_data: dict | None  # optional structured representation

    # Substrate link
    artifact_sha256: str | None  # FK → artifacts (the immutable insight)

    # Trust
    confidence: float  # 0.0 = unverified, 1.0 = verified
    status: str  # 'proposed' | 'verified' | 'rejected'
    verified_by: UUID | None
    verified_at: datetime | None

    # Dedup
    discovered_count: int  # incremented on auto-merge
    merged_from: list[UUID]  # insights that were merged

    # Semantic retrieval
    embedding: Vector(1536)  # pgvector

    # Timestamps
    created_at: datetime
    updated_at: datetime
```

### 7.3 Context Resolution at Conversation Start (Insight Injection)

```python
# src/intelli/services/knowledge/context_resolver.py

async def resolve_context(
    scope_type: str,
    scope_id: UUID | None,
    tenant_id: UUID
) -> ConfigSnapshot:
    """
    Walk hierarchy, merge configs, retrieve relevant insights.
    Called when conversation/run starts.
    """

    # 1. Merge hierarchy configs
    config = await merge_hierarchy_configs(scope_type, scope_id, tenant_id)

    # 2. Collect tags from scope hierarchy
    scope_tags = await collect_tags_from_hierarchy(scope_type, scope_id, tenant_id)

    # 3. Retrieve relevant insights (two methods)

    # A. By tag match (exact)
    tag_matched = await query_insights_by_tags(
        tenant_id=tenant_id,
        tags=scope_tags,
        status='verified',
        min_confidence=0.7
    )

    # B. By embedding similarity (semantic)
    if config.system_prompt:
        prompt_embedding = await embed(config.system_prompt)
        semantic_matched = await query_insights_by_embedding(
            tenant_id=tenant_id,
            embedding=prompt_embedding,
            limit=5,
            min_confidence=0.7
        )
    else:
        semantic_matched = []

    # 4. Deduplicate and rank
    relevant_insights = deduplicate_and_rank(
        tag_matched + semantic_matched,
        limit=10
    )

    # 5. Inject into system prompt
    if relevant_insights:
        config.system_prompt += "\n\n## Organisational Context\n"
        config.system_prompt += "The following lessons and methods are relevant to this work:\n"
        for insight in relevant_insights:
            config.system_prompt += f"- [{insight.insight_type}] {insight.title}\n"
            config.system_prompt += f"  {insight.content}\n"
            config.system_prompt += f"  (Confidence: {insight.confidence})\n"

    # 6. Record what was injected (for audit)
    config.injected_insights = [i.id for i in relevant_insights]
    config.inherited_from = build_inheritance_chain(scope_type, scope_id, tenant_id)

    return config
```

### 7.4 NYQST vs Dify

| Capability | Dify | NYQST |
|---|---|---|
| **Document upload** | ✓ | ✓ |
| **RAG retrieval** | ✓ | ✓ (pgvector + OpenSearch) |
| **Conversation persistence** | ✗ (sessions only) | ✓ (conversations table) |
| **Organizational insights** | ✗ | ✓ (insights table, Phase 2) |
| **Cross-session knowledge reuse** | ✗ | ✓ (context resolution, tag-based + embedding) |
| **Insight tagging** | ✗ | ✓ (universal tags) |
| **Scope-based config inheritance** | ✗ | ✓ (hierarchy walk, merge rules) |
| **Token/cost tracking** | Partial | ✓ (per-message, per-conversation) |

---

## 8. Migration Strategy (0005a/b/c Split)

### 8.1 Migration 0005a: Artifact Entity Typing

**File**: `migrations/versions/20260220_0005a_artifact_entity_type.py`

```python
"""Add entity_type to Artifact for Superagent parity."""

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column(
        'artifacts',
        sa.Column('entity_type', sa.String(255), nullable=True)
    )
    op.add_column(
        'artifacts',
        sa.Column('entity_metadata', sa.JSON(), nullable=True)
    )
    op.create_index('ix_artifacts_entity_type', 'artifacts', ['entity_type'])

def downgrade():
    op.drop_index('ix_artifacts_entity_type')
    op.drop_column('artifacts', 'entity_metadata')
    op.drop_column('artifacts', 'entity_type')
```

### 8.2 Migration 0005b: Message Extensions

**File**: `migrations/versions/20260220_0005b_message_extensions.py`

```python
"""
Extend messages table with citation, run event, and async entity fields.
Required for BL-002 (RunEvent extensions), BL-016 (Entity linking).
"""

def upgrade():
    # For linking messages to run events (provenance)
    op.add_column('messages', sa.Column('run_event_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_messages_run_event', 'messages', 'run_events', ['run_event_id'], ['id'])

    # For conversation branching
    op.add_column('messages', sa.Column('parent_message_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_messages_parent', 'messages', 'messages', ['parent_message_id'], ['id'])

    # Async entity tracking
    op.add_column('conversations', sa.Column('has_async_entities_in_progress', sa.Boolean(), server_default='false'))
```

### 8.3 Migration 0005c: Billing Tables

**File**: `migrations/versions/20260220_0005c_billing_tables.py`

```python
"""Create Stripe billing tables (ported from okestraai/DocuIntelli)."""

def upgrade():
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.UUID(), primary_key=True),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('stripe_subscription_id', sa.String(255), nullable=False),
        sa.Column('stripe_customer_id', sa.String(255), nullable=False),
        sa.Column('plan_type', sa.String(50), nullable=False),  # 'free' | 'pro' | 'enterprise'
        sa.Column('status', sa.String(50), nullable=False),  # 'active' | 'paused' | 'cancelled'
        sa.Column('current_period_start', sa.DateTime(), nullable=False),
        sa.Column('current_period_end', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.UniqueConstraint('stripe_subscription_id')
    )

    op.create_table(
        'usage_records',
        sa.Column('id', sa.UUID(), primary_key=True),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('run_id', sa.UUID(), nullable=True),
        sa.Column('usage_type', sa.String(50), nullable=False),  # 'run' | 'token' | 'storage'
        sa.Column('quantity', sa.Numeric(10, 2), nullable=False),
        sa.Column('unit_cost_micros', sa.Integer(), nullable=False),
        sa.Column('total_cost_micros', sa.Integer(), nullable=False),
        sa.Column('period_start', sa.DateTime(), nullable=False),
        sa.Column('period_end', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='SET NULL')
    )
```

### 8.4 Rationale for Split

- **0005a** (Artifact): Independent, low-risk. Can land and ship independently.
- **0005b** (Messages): Pairs with RunEvent extensions (BL-002). Can test message provenance separately.
- **0005c** (Billing): Fully isolated from a/b. Can wait if timeline slips.

---

## 9. Reusable Code (Entity Service CRUD, Citation Parser, Async Job Pattern)

### 9.1 Entity Service CRUD

```python
# src/intelli/services/entity_service.py

from typing import Optional
from uuid import UUID
import uuid as uuid_lib

class EntityService:
    """CRUD operations for entities (type-agnostic)."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_entity(
        self,
        entity_type: str,
        title: Optional[str] = None,
        message_id: Optional[UUID] = None,
        run_id: Optional[UUID] = None,
        data: dict = None
    ) -> Entity:
        """Create a new entity from any data."""
        entity = Entity(
            id=str(uuid_lib.uuid4()),
            type=entity_type,
            title=title,
            message_id=message_id,
            run_id=run_id,
            metadata=data or {}
        )
        # Type-specific handling
        if entity_type == "WEB_PAGE":
            entity = WEBPageEntity(**entity.model_dump(), **data)
        elif entity_type == "EXTERNAL_API_DATA":
            entity = ExternalAPIDataEntity(**entity.model_dump(), **data)
        # ... other types ...

        self.session.add(entity)
        return entity

    async def get_entity(self, entity_id: str) -> Optional[Entity]:
        """Get entity by ID."""
        return await self.session.get(Entity, entity_id)

    async def list_entities_by_run(self, run_id: UUID) -> list[Entity]:
        """Get all entities for a run."""
        stmt = select(Entity).where(Entity.run_id == run_id)
        return (await self.session.execute(stmt)).scalars().all()

    async def list_entities_by_message(self, message_id: UUID) -> list[Entity]:
        """Get all entities cited in a message."""
        stmt = select(Entity).where(Entity.message_id == message_id)
        return (await self.session.execute(stmt)).scalars().all()

    async def update_entity(self, entity_id: str, updates: dict) -> Entity:
        """Update entity metadata."""
        entity = await self.get_entity(entity_id)
        if not entity:
            raise ValueError(f"Entity {entity_id} not found")

        for key, value in updates.items():
            if hasattr(entity, key):
                setattr(entity, key, value)

        await self.session.commit()
        return entity

    async def delete_entity(self, entity_id: str) -> bool:
        """Delete entity."""
        entity = await self.get_entity(entity_id)
        if not entity:
            return False

        await self.session.delete(entity)
        await self.session.commit()
        return True
```

### 9.2 Citation Parser

```python
# src/intelli/utils/citation_parser.py

import re
from typing import NamedTuple

class Citation(NamedTuple):
    text: str
    start_pos: int
    end_pos: int
    identifier: Optional[str] = None

def parse_citations(text: str) -> list[Citation]:
    """
    Parse inline citations from text.

    Formats supported:
    - [text]: matched by \[[^\]]+\]
    - <gml-inlinecitation identifier="uuid"/> (GML tag format)
    - {citation:uuid} (alternative format)
    """
    citations = []

    # Pattern 1: [text]
    for match in re.finditer(r'\[([^\]]+)\]', text):
        citations.append(Citation(
            text=match.group(1),
            start_pos=match.start(),
            end_pos=match.end()
        ))

    # Pattern 2: <gml-inlinecitation identifier="uuid"/>
    for match in re.finditer(r'<gml-inlinecitation\s+identifier="([^"]+)"\s*/>', text):
        citations.append(Citation(
            text=f"[Citation]",
            start_pos=match.start(),
            end_pos=match.end(),
            identifier=match.group(1)
        ))

    # Sort by position
    citations.sort(key=lambda c: c.start_pos)
    return citations

def extract_inline_citations(text: str) -> dict[str, str]:
    """Extract all [text]: url pairs from markdown-style citations."""
    result = {}
    for match in re.finditer(r'\[([^\]]+)\]:\s*(\S+)', text):
        result[match.group(1)] = match.group(2)
    return result

def get_text_without_citations(text: str) -> str:
    """Remove all [brackets] from text for clean display."""
    return re.sub(r'\[[^\]]*\]', '', text).strip()
```

### 9.3 Async Job Pattern

```python
# src/intelli/core/jobs.py

from arq import Retry
import logging

logger = logging.getLogger(__name__)

# Job definitions (decorated with @job)

@job
async def create_entities_from_response(
    run_id: UUID,
    message_id: UUID,
    response_text: str
) -> dict:
    """Create entities from LLM response."""
    try:
        async with get_db() as db:
            entity_service = EntityService(db)

            # Parse citations from response
            citations = parse_citations(response_text)

            # Create entity records
            for citation in citations:
                await entity_service.create_entity(
                    entity_type="GENERATED_CONTENT",
                    title=citation.text,
                    message_id=message_id,
                    run_id=run_id,
                    data={"citation_text": citation.text}
                )

            # Emit RunEvent
            run_event = RunEvent(
                run_id=run_id,
                event_type=RunEventType.ENTITY_CREATED,
                data={"entity_count": len(citations)}
            )
            db.add(run_event)
            await db.commit()

            return {"status": "success", "entity_count": len(citations)}

    except Exception as e:
        logger.error(f"Job failed: {e}")
        raise Retry(max_tries=3, backoff=2)  # Retry up to 3 times with exponential backoff

@job
async def index_artifact_chunks(artifact_sha256: str) -> dict:
    """Index artifact into RAG system."""
    # ... (as shown in section 5.3) ...
    pass

# Queue management

async def get_queue():
    """Get the arq job queue."""
    return await create_pool(redis_settings=RedisSettings(host="localhost", port=6379))

async def enqueue_job(job_fn, *args, **kwargs):
    """Enqueue a background job."""
    queue = await get_queue()
    return await queue.enqueue(job_fn, *args, **kwargs)

# Usage in LangGraph node
async def synthesizer_node(state: ResearchState) -> dict:
    response_text = await llm.generate(state.messages)

    # Dispatch async entity creation
    job = await enqueue_job(
        create_entities_from_response,
        state.run_id,
        state.current_message_id,
        response_text
    )

    return {
        "message": response_text,
        "job_id": str(job.job_id),
        "has_async_entities_in_progress": True
    }
```

### 9.4 RunEvent Extensions (BL-002)

```python
# src/intelli/db/models/runs.py

class RunEventType(StrEnum):
    # ... existing types ...

    # NEW: Entity creation
    ENTITY_CREATED = "entity_created"
    REFERENCES_FOUND = "references_found"  # Entities discovered during research

    # NEW: Plan/phase tracking
    PLAN_CREATED = "plan_created"
    PHASE_STARTED = "phase_started"  # planner, research, synthesis, deliverable
    PHASE_COMPLETED = "phase_completed"

    # NEW: Subagent coordination
    SUBAGENT_SPAWNED = "subagent_spawned"
    SUBAGENT_RESULT = "subagent_result"
    SUBAGENT_FAILED = "subagent_failed"

    # NEW: Deliverable generation
    ARTIFACT_CREATED = "artifact_created"  # Report, website, document
    MANIFEST_CREATED = "manifest_created"

    # NEW: Content streaming
    CONTENT_DELTA = "content_delta"  # GML markup delta for report streaming

    # NEW: User interaction
    CLARIFICATION_NEEDED = "clarification_needed"
    CLARIFICATION_RECEIVED = "clarification_received"

# Schema examples
class PlanCreatedEvent(BaseModel):
    plan_id: str
    phase: str  # "research", "synthesis", "deliverable"
    task_count: int
    task_descriptions: list[str]

class ReferencesFoundEvent(BaseModel):
    references: list[Entity]

class EntityCreatedEvent(BaseModel):
    entity_id: str
    entity_type: str
    message_id: UUID

class SubagentSpawnedEvent(BaseModel):
    subagent_id: str
    task_index: int
    task_description: str
    tool_ids: list[str]

class SubagentResultEvent(BaseModel):
    subagent_id: str
    result_artifact_sha256: str
    entity_ids: list[str]
```

---

## 10. Summary: Full Entity-Citation-Document System

### 10.1 Components Implemented

| Component | File/Location | Status | Dependency |
|---|---|---|---|
| **Entity Types (12)** | DB model, schemas | Design complete | — |
| **Artifact + entity_type** | Migration 0005a | Ready to implement | — |
| **Manifest + Pointer** | Existing in intelli | ✓ Working | — |
| **Citation Buffer** | Frontend StateBuffer | Design complete | — |
| **Citation Binding** | Frontend + backend schema | Design complete | Entity types |
| **Async Entity Creation** | arq job + RunEvent | Design complete | BL-002 |
| **WEB_SOURCE entities** | Tool execution | Design complete | Research tools (BL-003) |
| **Document Upload → Index → Artifact** | src/intelli/api/v1/artifacts + jobs | Design complete | — |
| **Insights + Context Resolution** | Phase 2 tables | Design complete (not yet implemented) | Tag system |
| **Entity Service CRUD** | src/intelli/services/entity_service.py | Reusable skeleton | — |
| **Citation Parser** | src/intelli/utils/citation_parser.py | Reusable skeleton | — |
| **RunEvent Extensions** | BL-002 | Design complete | — |

### 10.2 Integration Points

1. **Research Orchestrator (BL-001)** → entities via tool execution
2. **Synthesizer Node** → triggers async entity creation (BL-016)
3. **Report Generation (BL-005)** → citations from entity references
4. **Website Generation (BL-006)** → cites web_sources
5. **Frontend Chat (BL-008)** → displays citations via SourcesPanel
6. **Billing (BL-012)** → cost tracked per run/message

### 10.3 Testing Strategy (DEC-070)

- **Contract tests**: Entity schemas validate against Superagent types
- **Integration tests**: Tool execution creates entities, they appear in stream events
- **E2E tests**: Citation appears in rendered chat, user can click source card

---

**Extraction complete. All 12 entity types, citation algorithms, document lifecycle, async patterns, and migration strategy fully documented.**
