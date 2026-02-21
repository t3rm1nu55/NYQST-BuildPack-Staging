# Mapping 02: Deliverables → Artifact Model (Superagent → Intelli)

> **Date**: 2026-02-16
> **Status**: Definitive mapping — grounded in `nyqst-intelli-230126` codebase
> **Depends on**: Mapping 01 (Research Orchestrator)

---

## What Superagent Does (Observed)

Superagent produces 6 deliverable types via a unified flow:

| Type | Branding | Content | Deployment |
|---|---|---|---|
| `REPORT` | "Super Report" | GML markup → rich React rendering in chat | In-chat, shareable link |
| `SLIDES` | "Super Slides" | Presentation deck | Preview in slide-out panel |
| `WEBSITE` | Website | HTML/CSS/JS bundle | Deployed to Vercel, iframe preview |
| `DOCUMENT` | "Super Document" | Downloadable .docx/.pdf | Download link |
| `CODE` | Code | Code artifacts | Code viewer |
| `AUTOMATION` | Automation | Recurring task definition | Task scheduler |

Key patterns observed:
- **Deliverable type selected at prompt time** (in chat composer)
- **Generation streamed** with progress events (`Generating output...`, `Designing output...`, `Building components...`, `Polishing typography and layout...`)
- **Website uses blob: URL iframe** for preview, then deployed URL after deployment
- **Reports use GML** (18 custom tags) with a **healer system** for LLM output repair
- **All deliverables stored as entities** with `content_artifact_id` and `stored_entity_id`
- **v0.app is the code generation engine** for websites (confirmed by `[v0]` console.log artifacts)

### GML Tag Inventory (from cache + CSS analysis)

Layout: `gml-row`, `gml-primarycolumn`, `gml-sidebarcolumn`, `gml-halfcolumn`
Content: `gml-header`, `gml-blockquote`, `gml-gradientinsightbox`, `gml-chartcontainer`
Data: `gml-infoblockmetric`, `gml-infoblockevent`, `gml-infoblockstockticker`
References: `gml-inlinecitation`, `gml-viewreport`, `gml-viewpresentation`, `gml-viewwebsite`, `gml-viewgenerateddocument`, `gml-downloadfile`

### Generation Pipeline (from `GENERATION_PIPELINE.md`)

```
Stage 0: Research/RAG → shared data brief
Stage 1: Template assembly (frozen 181K shadcn/ui bundle)
Stage 2: Architecture decision (monolithic / coordinator / four-tier)
Stage 3: Theme generation (CSS variables, fonts, design utilities)
Stage 4: Layout primitive generation (parameterized, domain-agnostic)
Stage 5: Content section generation (prose from data brief)
Stage 6: Widget generation (standardized scaffold, data from brief)
Stage 7: Atomic export (all files written simultaneously)
```

---

## What Intelli Already Has

### Substrate (WORKING)
- **Artifacts**: Content-addressed blobs (SHA-256), S3-compatible storage (MinIO in dev)
- **Manifests**: Immutable trees of artifact refs
- **Pointers**: Mutable HEAD refs to manifests
- API: `src/intelli/api/v1/{artifacts,manifests,pointers}.py`

### This Is the Perfect Fit

Superagent stores deliverables as entities with `content_artifact_id`. Intelli's substrate is a **superset** of this — it adds content-addressing (immutability, dedup) and manifest trees (versioning, provenance).

---

## Definitive Mapping

### How Deliverables Map to Substrate Primitives

| Superagent Concept | Intelli Primitive | Mapping |
|---|---|---|
| Entity (deliverable output) | Artifact | Content-addressed blob. Report HTML, website bundle, slide JSON, document bytes. |
| Entity collection (all outputs of a run) | Manifest | Immutable tree referencing all Artifacts produced by a Run. |
| "Latest version" of a deliverable | Pointer | Mutable HEAD ref. Advancing pointer = publishing new version. |
| `content_artifact_id` | Artifact ID (SHA-256 hash) | Direct mapping. |
| `stored_entity_id` | Pointer ID | Mutable reference to latest manifest. |
| `generation_status` | Run status + Artifact presence | `in_progress` = Run active, no final Artifact yet. `complete` = Artifact exists in Manifest. |
| `deployed_url` | Metadata on Pointer or Run | Deployment URL stored as metadata after deploy step. |

### Deliverable Type Implementation

Each deliverable type is a **LangGraph node** in the research orchestrator graph (from Mapping 01), selected by `deliverable_type` on the Run:

#### Report (`deliverable_type: 'report'`)

**Output**: NYQST Markup AST (JSON, not HTML-like tags)

Why JSON AST over HTML-like tags:
- Easier to validate with Pydantic/Zod schemas
- Easier to "heal" (fix structural issues from LLM output)
- Renders to React components via a simple recursive renderer
- Can export to HTML, PDF, DOCX from the same AST

```python
# NYQST Markup AST node types (clean-room equivalent to GML)
class MarkupNode(BaseModel):
    type: Literal[
        # Layout
        "row", "primary_column", "sidebar_column", "half_column",
        # Content
        "heading", "paragraph", "blockquote", "insight_box",
        "table", "list",
        # Data visualization
        "chart", "metric_card", "event_card", "ticker",
        # References
        "citation", "artifact_link", "download_link",
    ]
    props: dict = {}          # Type-specific properties
    children: list["MarkupNode"] = []
    text: str | None = None   # Leaf text content
```

**Healing**: Validate AST post-LLM-generation. Fix: unclosed nodes (auto-close), orphaned children (hoist to parent), missing required props (fill defaults), depth violations (flatten).

**Storage**: Serialize AST as JSON → store as Artifact. Render on frontend via recursive React component.

#### Website (`deliverable_type: 'website'`)

**Output**: HTML/CSS/JS bundle stored as multiple Artifacts in a Manifest

**Generation approach** (informed by `GENERATION_PIPELINE.md` reverse-engineering):
1. Research results → data brief (Artifact)
2. LLM generates React/Tailwind code (structured output: file list with content)
3. Each file → Artifact (content-addressed)
4. All files → Manifest (immutable tree)
5. Pointer advances to new Manifest
6. Optional: deploy Manifest contents to hosting (Vercel/Cloudflare Pages)

**Preview**: Fetch Artifacts via signed URLs → assemble as blob: URL → render in sandboxed iframe (Superagent's proven pattern)

**Deploy**: Extract Manifest contents → push to hosting API → store deployed URL as metadata

#### Slides (`deliverable_type: 'slides'`)

**Output**: Slide deck as JSON structure → Artifact

**Rendering**: React-based slide viewer in frontend, or export to PPTX via a conversion step

#### Document (`deliverable_type: 'document'`)

**Output**: Markdown/AST → PDF/DOCX conversion → binary Artifact

**Export**: Download signed URL from Artifact storage

### Citation System Extension

Superagent's citations bind to entities (stored sources). Intelli needs:

1. **Source Artifacts**: Each web page/API result from research → Artifact with metadata (URL, title, retrieved_at, relevance_score)
2. **Citation references in markup**: `{ type: "citation", props: { artifact_id: "sha256:...", number: 1 } }`
3. **Resolver API**: `GET /api/v1/artifacts/{id}` already exists — citations resolve to source Artifacts
4. **Sources panel**: Frontend lists all Artifacts referenced as citations in the current Run's output

This extends the existing `[1]` citation pattern in the research assistant prompt to be entity-backed rather than chunk-index-based.

---

## Testing Strategy

| Test Type | What | How |
|---|---|---|
| **Contract** | NYQST Markup AST schema | Pydantic validation — LLM output must parse as valid MarkupNode tree |
| **Contract** | Healer output | Malformed AST fixtures → healer → valid AST (deterministic, no LLM) |
| **Integration** | Report generation flow | Real LLM: research results → synthesis → markup AST → stored as Artifact |
| **Integration** | Website bundle | Real LLM: research → code gen → files stored as Manifest → preview renders |
| **E2E** | Deliverable selector | Playwright: select "Report" → submit prompt → assert report renders with citations |

---

## Implementation Sequence

This maps to **Phase 4** and **Phase 5** in the parity plan:

**Phase 4 (Report + Document):**
1. Define NYQST Markup AST schema (Pydantic models) — 2 days
2. Implement healer/validator — 2-3 days
3. Implement LangGraph deliverable node for reports — 3-5 days
4. Frontend: Markup AST → React renderer — 5-7 days
5. Frontend: Deliverable selector in chat composer — 1-2 days
6. Frontend: Sources panel with Artifact-backed citations — 2-3 days
7. Document export (AST → PDF/DOCX via weasyprint or python-docx) — 2-3 days

**Phase 5 (Slides + Website):**
1. Website generation node (LLM → file bundle → Manifest) — 5-7 days
2. Website preview (blob: URL iframe) — 2-3 days
3. Website deployment (hosting API integration) — 2-3 days
4. Slide generation + viewer — 5-7 days
