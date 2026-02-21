# Interaction Points Registry

> **Living document** — updated when analysis reveals new touchpoints
> Every external service, internal service, or boundary crossing is logged here.

---

## External Services

| ID | Service | Purpose | Integration Type | Status |
|----|---------|---------|-----------------|--------|
| EXT-001 | Brave Search API | Web research | REST API, API key | Planned |
| EXT-002 | Jina Reader API | Web page scraping/cleaning | REST API, API key | Planned |
| EXT-003 | Stripe | Billing, subscriptions, webhooks | REST API + webhooks | Planned (port from okestraai) |
| EXT-004 | Website hosting (TBD) | Deploy generated websites | API (Vercel/CF Pages/S3) | Decision needed |
| EXT-005 | LLM providers | Anthropic, OpenAI, local | REST API, multi-provider | Existing in intelli |
| EXT-006 | MinIO (S3-compat) | Artifact blob storage | S3 API | Existing in intelli |
| EXT-007 | Langfuse | Observability/tracing | REST API | Existing in intelli |
| EXT-008 | Data connector pattern | Financial/company/market data (Polygon, FRED, etc.) | REST APIs, API keys | Pattern planned (user configures providers) |
| EXT-009 | PDF export library | Server-side PDF generation from Markup AST | Python library (weasyprint/reportlab) | Planned (BL-019) |

## Internal Services (Existing Intelli Ecosystem)

| ID | Service | Purpose | Integration Type | Status |
|----|---------|---------|-----------------|--------|
| INT-001 | genui-dashboards-v2 | Dashboard generation companion | TBD | Existing, needs analysis |
| INT-002 | wiki-propresearch | Property research companion | TBD | Existing, needs analysis |
| INT-003 | Docling | Document processing/OCR | Python library | Existing in intelli |
| INT-004 | PostgreSQL + pgvector | Vector search for RAG | SQL + vector ops | Existing in intelli |
| INT-005 | OpenSearch | Full-text search | REST API | Existing in intelli |

## Data Boundaries

| ID | Boundary | Direction | Format | Notes |
|----|----------|-----------|--------|-------|
| DB-001 | Artifact storage | Write (generation) / Read (preview) | Binary blobs, SHA-256 addressed | Core substrate |
| DB-002 | Manifest trees | Write (bundle) / Read (resolve) | JSON tree of artifact refs | Immutable versioning |
| DB-003 | RunEvent ledger | Write (agents) / Read (SSE stream) | Typed events, Postgres NOTIFY | Append-only |
| DB-004 | Subscriptions table | Write (webhook) / Read (enforcement) | SQL rows | New for billing |
| DB-005 | Usage records | Write (per-run) / Read (quota check) | SQL rows | New for billing |
| DB-006 | Entity/citation store | Write (research tools) / Read (renderer, sources panel) | Artifact refs + typed metadata | New (BL-016) — extends existing Artifact |
| DB-007 | Data brief | Write (fan-in) / Read (all generators) | Structured JSON in LangGraph state | New (BL-022) — carried in graph state |

## User-Facing Boundaries

| ID | Boundary | Direction | Protocol | Notes |
|----|----------|-----------|----------|-------|
| UF-001 | Chat streaming | Server → Client | AI SDK Data Stream | Existing |
| UF-002 | Run event streaming | Server → Client | SSE (Postgres NOTIFY) | Existing |
| UF-003 | Artifact download | Client ← Server | Signed URLs from MinIO | Existing |
| UF-004 | Stripe checkout | Client → Stripe → Server | Redirect + webhook | New |
| UF-005 | File upload | Client → Server | Multipart, Docling processing | Existing |
| UF-006 | Generation progress overlay | Server → Client | RunEvents (REPORT_PREVIEW_*) via SSE | New (BL-020) |
| UF-007 | Clarification prompt | Server → Client → Server | CLARIFICATION_NEEDED RunEvent + user response | New (BL-021) |
| UF-008 | PDF/DOCX download | Client ← Server | Signed URL from MinIO (same as UF-003) | New endpoint, existing transport |

## Not Replicating (Superagent uses, we don't need)

| Service | Superagent Uses | Our Alternative | Rationale |
|---------|----------------|-----------------|-----------|
| v0.app | Code generation for React exports | Direct LLM code gen | Avoids external dependency, more control |
| Firecrawl | Web scraping | Jina Reader API | Simpler API, cheaper, sufficient for our needs |
| FactSet | Financial data | Data connector pattern (user-configured) | Proprietary, expensive — users bring their own sources |
| Ory Kratos | Authentication | Existing intelli auth (already working) | No need to change auth |
| PostHog | Analytics/feature flags | Langfuse (existing) | Already have observability |
| Sanity CMS | Content library/templates | Deferred to v2 | Content library explicitly deferred |
| OneSignal | Push notifications | Deferred to v2 | Push notifications explicitly deferred |

---

## Revision Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-02-16 | Initial interaction points from Mappings 01-04 | Project setup |
| 2026-02-16 | Added EXT-008/009, DB-006/007, UF-006/007/008, "Not Replicating" section | OBJ-1/2/3 cross-reference |
