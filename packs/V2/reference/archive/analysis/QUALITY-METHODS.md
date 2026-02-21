# SuperAgent Quality Methods Analysis

> **Date**: 2026-02-16
> **Purpose**: Comprehensive documentation of quality systems, prompting patterns, validation methods, and workflows that produce SuperAgent's professional outputs
> **Scope**: Artifact generation (reports, websites) + platform UX quality systems

---

## Executive Summary

SuperAgent achieves professional-grade output quality through **layered quality systems** operating at different stages:

1. **Structured Output Constraints** — Zod schemas + GML tag system force well-formed artifacts
2. **Multi-Stage Generation Pipeline** — 7-stage website pipeline, 4-stage report pipeline with review passes
3. **Healer/Validator System** — Post-generation structural repair for imperfect LLM markup
4. **Data Consistency Layer** — Shared data brief ensures cross-component accuracy
5. **Real-Time Progress UX** — Dual-status streaming keeps users engaged during 30s-2min generation cycles
6. **Fallback Strategies** — FactSet failure → alternative sources (SEC filings, Balance)

**Critical Distinction**: This document separates OUTPUT quality (dynamically generated reports/websites) from PLATFORM quality (chat UI, streaming, etc.).

---

## SECTION A: OUTPUT QUALITY SYSTEM (Artifact Generation)

### A1. Prompting Patterns

#### A1.1 Structured Output Schemas (HIGH CONFIDENCE)

**Evidence**: JS_DESIGN_TOKENS.md documents extensive Zod schemas for chart configuration, stream events, and component props.

**Chart Configuration Schema**:
```typescript
// Extracted from 0053_1889-c64cad4788e7b7b9.js
const ChartSchema = z.object({
  data: z.array(DataTraceSchema),    // Array of traces
  layout: LayoutSchema.optional(),    // Plotly layout config
  title: z.string().optional(),       // Chart title
  citation: CitationSchema.optional() // Source citation
});

const DataTraceSchema = z.object({
  name: z.string(),                  // Required trace name
  type: z.enum([
    "bar", "scatter", "line", "bubble", "histogram",
    "box", "candlestick", "stacked_bar", "clustered_column", "donut"
  ]),
  data: z.array(DataPointSchema),
  // ... marker, error bars, etc.
});

const LayoutSchema = z.object({
  margin: z.object({ t, r, b, l, pad }).optional(),
  legend: z.object({ orientation, x, y, xanchor, yanchor }).optional(),
  xaxis: AxisSchema.optional(),
  yaxis: AxisSchema.optional(),
  title: TitleSchema.optional(),
  // ... 15+ layout properties
});
```

**Stream Event Schema** (22 event types):
```typescript
// Extracted from 0055_774-e1971e2500ea1c79.js
type StreamEvent =
  | { type: "stream_start"; chat_id, creator_user_id, ... }
  | { type: "task_update"; key, message, metadata, plan_set, status, title }
  | { type: "node_tool_event"; event, metadata, node_id, plan_id, ... }
  | { type: "node_report_preview_start"; entity, final_report, preview_id, ... }
  | { type: "node_report_preview_delta"; delta, preview_id, ... }
  | { type: "node_report_preview_done"; content, entity, final_report, ... }
  | { type: "message_delta"; delta }
  | { type: "references_found"; references: Entity[] }
  | { type: "done"; has_async_entities_pending?, message? }
  | { type: "ERROR"; error_message, error_type }
  // ... 12 more event types
```

**Implication**: The system uses **structured output** to constrain LLM generation. Charts MUST conform to Zod schemas before rendering.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 640-806
**Confidence**: HIGH (extracted from production bundles)

#### A1.2 GML Tag System as Prompt Constraint (HIGH CONFIDENCE)

**Evidence**: GML_REPORT_RENDERING_PATTERNS.md documents 18 custom tags that reports MUST use.

**Complete Tag Set**:
```
Layout (4): gml-row, gml-primarycolumn, gml-sidebarcolumn, gml-halfcolumn
Content (8): gml-chartcontainer, gml-gradientinsightbox, gml-infoblockmetric,
             gml-infoblockevent, gml-infoblockstockticker, gml-inlinecitation,
             gml-blockquote, gml-downloadfile
Viewers (4): gml-viewreport, gml-viewwebsite, gml-viewpresentation,
             gml-viewgenerateddocument
Meta (2): gml-components, gml-header-elt
```

**Layout Recipe Example**:
```html
<gml-row>
  <gml-primarycolumn>
    <h1>Report Title</h1>
    <p>Content with citation <gml-inlinecitation identifier="entity-123"/></p>
    <gml-chartcontainer props='{"data": [...], "layout": {...}}'/>
  </gml-primarycolumn>
  <gml-sidebarcolumn>
    <gml-infoblockmetric props='{"label": "Revenue", "value": "$2.4M", "trend": "up"}'/>
    <gml-gradientinsightbox>
      <p><strong>Key Insight:</strong> Summary...</p>
    </gml-gradientinsightbox>
  </gml-sidebarcolumn>
</gml-row>
```

**Implication**: The model is prompted to emit GML tags, not standard HTML. This creates a **domain-specific markup language** optimized for report layouts.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GML_REPORT_RENDERING_PATTERNS.md` lines 19-49
**Confidence**: HIGH (observed in production bundles + documented renderer)

#### A1.3 Citation Binding Pattern (HIGH CONFIDENCE)

**Evidence**: Citations use `identifier` prop that binds to entity store via `references_found` stream event.

**Flow**:
1. During research, entities created with stable IDs: `entity-abc-123`, `jll-report-2025-q4`
2. Stream event delivers entity metadata:
```json
{
  "type": "references_found",
  "references": [{
    "citationIdentifier": "entity-abc-123",
    "external_url": "https://...",
    "title": "Source Title",
    "provider": "brave" | "firecrawl" | "polygon",
    "retrieved_at": "2026-02-16T..."
  }]
}
```
3. LLM emits: `<gml-inlinecitation identifier="entity-abc-123"/>`
4. Frontend renders as `[1]` with click-to-expand source panel

**Implication**: Model MUST output identifiers that match pre-created entities. This requires either:
- Tool-use pattern where research tools return entity IDs
- OR entity creation happens during research, IDs stored in context, then referenced in report generation

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GML_REPORT_RENDERING_PATTERNS.md` lines 224-265
**Confidence**: HIGH (stream protocol documented in JS bundles)

#### A1.4 Inferred System Prompt Fragments (MEDIUM CONFIDENCE)

Based on observed constraints, the system prompt likely includes:

```
For reports, structure content using GML tags:

Layout:
- Wrap sections in <gml-row>
- Use <gml-primarycolumn> for main narrative
- Use <gml-sidebarcolumn> for metrics, insights, context
- Use <gml-halfcolumn> for side-by-side comparisons

Content:
- Cite all facts: <gml-inlinecitation identifier="[entity-id]"/>
- Visualize data: <gml-chartcontainer props='{"data": [...], "layout": {...}}'/>
- Highlight insights: <gml-gradientinsightbox>Key finding...</gml-gradientinsightbox>
- Display metrics: <gml-infoblockmetric props='{"label": "...", "value": "...", "trend": "up|down|neutral"}'/>

Rules:
- Don't worry about perfect nesting — the renderer will heal structural issues
- Always cite sources using entity identifiers from your research
- Use standard HTML (h1-h6, p, ul, ol, table) within GML containers
```

**Source**: Inferred from renderer behavior + tag system + healer patterns
**Confidence**: MEDIUM (not directly observed, but consistent with all evidence)

---

### A2. The Healer/Fixer System

#### A2.1 What It Fixes (HIGH CONFIDENCE)

**Evidence**: GML_REPORT_RENDERING_PATTERNS.md documents structural validator with width constraints.

**Widget Width Validation Rules**:
```javascript
// Extracted from renderer source
WIDGET_WIDTHS = {
  'gml-blockquote':          [WIDTHS.primary],      // Must be in primarycolumn
  'gml-chartcontainer':      [WIDTHS.primary],      // Must be in primarycolumn
  'gml-gradientinsightbox':  [WIDTHS.primary],      // Must be in primarycolumn
  'gml-infoblockevent':      [WIDTHS.sidebar],      // Must be in sidebarcolumn
  'gml-infoblockmetric':     [WIDTHS.sidebar],      // Must be in sidebarcolumn
  'gml-infoblockstockticker':[WIDTHS.sidebar],      // Must be in sidebarcolumn
  'gml-halfcolumn':          [WIDTHS.full_row],     // Must be in row
  'gml-primarycolumn':       [WIDTHS.full_row],     // Must be in row
  'gml-sidebarcolumn':       [WIDTHS.full_row],     // Must be in row
  'gml-downloadfile':        [],                    // Can appear anywhere
  'gml-inlinecitation':      [],                    // Inline element
  'gml-viewreport':          [],                    // Can appear anywhere
}

WIDTHS = {
  full_row: 'gml-row',
  primary:  'gml-primarycolumn',
  sidebar:  'gml-sidebarcolumn',
  half:     'gml-halfcolumn',
}
```

**What Gets Fixed**:
1. **Unclosed tags** — Parser closes open tags at section boundaries
2. **Orphaned elements** — Widgets outside valid containers get hoisted or removed
3. **Nesting violations** — Charts in wrong column type get moved to correct parent
4. **Depth violations** — Deep nesting flattened to maintain responsive layout

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GML_REPORT_RENDERING_PATTERNS.md` lines 535-605
**Confidence**: HIGH (extracted from production bundle 1889-c64cad4788e7b7b9.js)

#### A2.2 How It Works (HIGH CONFIDENCE)

**Healing Actions**:

1. **Hoist** (move to valid parent):
```
Invalid:
<gml-row>
  <gml-chartcontainer .../> <!-- Wrong! Needs primarycolumn parent -->
</gml-row>

Healed:
<gml-row>
  <gml-primarycolumn>
    <gml-chartcontainer .../> <!-- Hoisted into correct container -->
  </gml-primarycolumn>
</gml-row>
```

2. **Remove** (discard if no valid placement):
```
Invalid:
<gml-infoblockmetric .../> <!-- No parent container at all -->

Healed:
<!-- Widget removed — can't be safely placed -->
```

**Algorithm** (inferred):
```
For each widget in DOM:
  1. Check if current parent is in WIDGET_WIDTHS[widget.type]
  2. If no:
     a. Walk up ancestor tree looking for valid container
     b. If found: hoist widget to that container
     c. If not found: remove widget from tree
  3. Continue to next widget
```

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GML_REPORT_RENDERING_PATTERNS.md` lines 577-605
**Confidence**: HIGH (behavior documented in source comments)

#### A2.3 When It Runs (MEDIUM CONFIDENCE)

**Evidence**: Healing must run **post-generation, pre-render** based on:
- No evidence of LLM retry loops in stream protocol
- Frontend renders incrementally during `node_report_preview_delta` events
- Healing is a client-side transform (in 1889-c64cad4788e7b7b9.js bundle)

**Inferred Pipeline**:
```
LLM generates GML → Streamed to client → Healer validates/repairs → Renderer displays
```

**Why this matters**: The healer enables **forgiving prompting** — the LLM doesn't need perfect markup generation, just correct tag selection. The system auto-corrects structure.

**Source**: Stream protocol analysis + bundle location
**Confidence**: MEDIUM (timing inferred, not directly observed)

---

### A3. Multi-Stage Quality Pipeline

#### A3.1 Website Generation: 7-Stage Pipeline (HIGH CONFIDENCE)

**Evidence**: GENERATION_PIPELINE.md documents atomic export with identical timestamps proving server-side orchestration.

**Stage Sequence**:

1. **Template Assembly** (181K frozen bundle)
   - 57 shadcn/ui components (byte-identical across reports)
   - Hooks, utilities, config files
   - Public assets with content-hash dedup
   - **Output**: `components/ui/`, `lib/utils.ts`, `tsconfig.json`, etc.

2. **Architecture Decision** (pattern selection)
   - **Monolithic** (997 LOC page.tsx, Report A) — all HTML inline
   - **Coordinator** (567 LOC page.tsx, Report B) — imports 20 components
   - **Four-tier** (30 LOC page.tsx, Report C) — ui/report/sections/widgets layers
   - **Selection criteria**: Unknown (content complexity? topic? temporal evolution?)

3. **Theme Generation** (design system creation)
   - CSS variables, brand tokens, animation keyframes
   - Font imports, metadata (title, description)
   - Responsive breakpoints, utilities
   - **Examples**:
     - Report A: Default shadcn (OKLCH blue)
     - Report B: "Royal Blue Corporate" (#1e3a8a, Inter + Playfair Display)
     - Report C: "Soft Brutalism" (#1e3a8a + #ea580c accent, 4px offset shadows)

4. **Layout Primitive Generation** (reusable containers)
   - Report B: 7 primitives (section-wrapper, content-row, metric-card, ...)
   - Report C: 11 primitives (adds table-of-contents, prose, insight-box, block-quote)
   - **Pattern**: Fully parameterized, zero domain content

5. **Content Section Generation** (NEW in Report C)
   - Layer between primitives and widgets
   - Composes: `SectionWrapper + SectionHeader + ContentColumns + Prose + Widgets`
   - **Example**:
```tsx
<SectionWrapper id="market-landscape" variant="sunken">
  <SectionHeader sectionNumber="02" title="Market Landscape" />
  <ContentColumns sidebar={<MetricCard metric="..." sentiment="good" />}>
    <Prose><p>Domain content...</p></Prose>
    <InsightBox variant="teal"><p>Key finding...</p></InsightBox>
    <WidgetWrapper><CompetitiveMatrix /></WidgetWrapper>
  </ContentColumns>
</SectionWrapper>
```

6. **Interactive Widget Generation** (data visualization)
   - Report B: D3 + Recharts (655-1,176 LOC per widget)
   - Report C: Recharts + react-simple-maps (373-685 LOC per widget, uniform sizing)
   - **Scaffold pattern** (identical across all widgets):
```typescript
// 1. "use client" + React imports + cn + useScrollReveal
// 2. /* ───── DATA ───── */ separator
// 3. TypeScript interfaces
// 4. const data = [...] (inline from data brief)
// 5. /* ───── COMPONENTS ───── */ separator
// 6. Sub-components as named functions
// 7. /* ───── MAIN ───── */ separator
// 8. Default export with useState/useMemo
```

7. **Atomic Export** (single write operation)
   - All files share identical timestamp (104-113 files)
   - 93-byte stub `pnpm-lock.yaml` (never resolved)
   - `next.config: ignoreBuildErrors: true` (pragmatic — allows minor type issues)
   - **Evidence**: Byte-identical comparison across Reports B & C

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GENERATION_PIPELINE.md` lines 10-169
**Confidence**: HIGH (timestamp evidence is conclusive, stages inferred from artifact comparison)

#### A3.2 Report Generation: Observed Progress States (HIGH CONFIDENCE)

**Evidence**: SCREENSHOT_ANALYSIS.md captures live UI states during report generation.

**Substep Sequence**:
1. "Writing outline..." — Structure phase
2. "Building components..." — Component selection/layout
3. "Reviewing content..." — **Validation pass (appears MULTIPLE times)**
4. "Polishing typography and layout..." — Final refinement

**UX Pattern**:
- Full-screen overlay during generation
- Dual-status display:
  - Primary: "Generating output..." (large, bold)
  - Secondary: Current substep (gray, smaller)
- Single continuous progress bar (advances across ALL substeps, not reset)
- Progress bar: ~65% page width, dark gray fill on light gray track

**Implication**: The system performs **multiple review passes** during generation. The "Reviewing content..." substep appearing more than once suggests iterative quality checks.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` lines 9-35
**Confidence**: HIGH (captured from live UI)

#### A3.3 Meta-Quality Step: "Considering Results and Refining Research Strategy" (HIGH CONFIDENCE)

**Evidence**: Screenshot at 03:48:18 shows Activity panel with reasoning breakdown.

**Observed Reasoning Steps**:
1. "Devising Initial Research Strategy"
   - 13 parallel workstreams defined
   - Research tasks launched simultaneously

2. **"Considering Results and Refining Research Strategy"** ← Meta-quality check
   - System reviews initial research results
   - Identifies data gaps (e.g., "FactSet failures")
   - Launches secondary research with alternative sources

**Quote from Activity panel**:
> "Fill critical data gaps from FactSet failures by gathering financial, geographic, and investor data from alternative sources (SEC filings, Balance...)"

**Implication**: The system performs **self-evaluation** after initial research and adapts strategy based on results quality.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` lines 80-111
**Confidence**: HIGH (direct screenshot capture)

---

### A4. Report Output Quality

#### A4.1 GML Layout System (HIGH CONFIDENCE)

**Layout Recipes** (from live report captures):

**Two-Column Report** (primary + sidebar):
```html
<gml-row>
  <gml-primarycolumn>
    <!-- Main narrative: sections, tables, charts -->
  </gml-primarycolumn>
  <gml-sidebarcolumn>
    <!-- Context: metrics, insights, events -->
  </gml-sidebarcolumn>
</gml-row>
```

**Full-Width Single Column**:
```html
<gml-row>
  <gml-primarycolumn>
    <!-- Executive summary, conclusions -->
  </gml-primarycolumn>
</gml-row>
```

**Half-Column Grid** (comparisons):
```html
<gml-row>
  <gml-halfcolumn>Option A details...</gml-halfcolumn>
  <gml-halfcolumn>Option B details...</gml-halfcolumn>
</gml-row>
```

**Responsive Behavior**:
- Mobile: All columns stack vertically
- Desktop (@3xl, ~1536px): Side-by-side layout
- Primary/sidebar ratio: 3/4 : 1/4 width

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GML_REPORT_RENDERING_PATTERNS.md` lines 50-125
**Confidence**: HIGH (extracted from renderer CSS + documented patterns)

#### A4.2 Data Visualization Quality (HIGH CONFIDENCE)

**Chart Types Supported** (10 types with Zod validation):
- Line charts, bar charts, scatter plots, bubble charts
- Candlestick (financial), histogram, box plots
- Stacked bar, clustered column, donut/pie

**Color System** (HSLA palette):
```javascript
// 6-stop teal sequence for categorical data
DEFAULT_COLORS = [
  "hsla(186, 60%, 20%, 1)",  // Darkest teal
  "hsla(186, 54%, 36%, 1)",  // Dark teal
  "hsla(186, 44%, 43%, 1)",  // Mid teal
  "hsla(186, 44%, 58%, 1)",  // Light-mid teal
  "hsla(186, 53%, 65%, 1)",  // Light teal
  "hsla(185, 50%, 80%, 1)",  // Lightest teal
]

// Functional colors
ACCENT_COLOR = "hsla(103, 40%, 43%, 1)"  // Green (positive trends)
ERROR_COLOR = "hsla(9, 90%, 48%, 1)"     // Red-orange (negative trends)
```

**Layout Configuration** (validated via Zod):
```typescript
layout: {
  margin: { t: 40, r: 20, b: 40, l: 40 },
  legend: { orientation: "h", x: 0.5, xanchor: "center" },
  showlegend: false,
  title: { text: "Chart Title", font: { size: 14 } },
  xaxis: { showgrid: false, tickformat: "..." },
  yaxis: { showgrid: true, zeroline: true }
}
```

**Quality Signals**:
- All charts use professional color palette (not random colors)
- Consistent margin/padding across charts
- Grid lines optional but standardized when present
- Legend positioning follows UX best practices

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 632-806
**Confidence**: HIGH (Zod schemas extracted from production bundle)

#### A4.3 Citation Quality (HIGH CONFIDENCE)

**Citation Pattern**:
- **Entity-backed**: Every citation has full metadata (URL, title, provider, timestamp)
- **Clickable**: Citations render as `[1]` with click-to-expand panel
- **Source tracking**: Provider metadata indicates source type (brave, firecrawl, polygon, factset)
- **Retrieval timestamps**: `retrieved_at` field enables freshness verification

**Example Entity**:
```json
{
  "citationIdentifier": "jll-q4-report",
  "external_url": "https://www.jll.com/research/2025-q4-market-report",
  "title": "JLL Q4 2025 Commercial Real Estate Market Report",
  "provider": "brave",
  "retrieved_at": "2026-02-16T14:30:00Z"
}
```

**Quality Markers**:
- No broken citations (identifier binding enforced)
- Rich metadata beyond just URLs
- Provider diversity (web search, specialized APIs, documents)

**Source**: `/Users/markforster/AirTable-SuperAgent/reports/04_prompt_and_output_formats.md` lines 36-45
**Confidence**: HIGH (stream protocol documented)

---

### A5. Website Output Quality

#### A5.1 Architecture Selection (MEDIUM CONFIDENCE)

**Three Observed Patterns**:

| Pattern | Page.tsx | Components | Evidence |
|---------|----------|------------|----------|
| Monolithic | 997 LOC | 0 imports (all inline) | Report A |
| Coordinator | 567 LOC | 20 imports, some inline JSX | Report B |
| Four-tier | 30 LOC | Pure imports, zero inline | Report C |

**Progression Hypothesis**:
- Report A (older) → monolithic approach
- Report B → coordinator pattern emerges
- Report C (newest) → pure composition architecture

**Quality Impact**:
- Four-tier = cleanest separation of concerns
- Easier maintenance/modification
- Reusable primitives across reports

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GENERATION_PIPELINE.md` lines 56-74
**Confidence**: MEDIUM (patterns proven, selection mechanism unknown)

#### A5.2 Component Scaffold Pattern (HIGH CONFIDENCE)

**Identical Structure** (Report C, all 10 widgets):
```typescript
"use client"                          // Line 1
import { useState, useMemo, ... }     // Lines 2-4
import { cn } from "@/lib/utils"      // Line 5
import { useScrollReveal } from "..."  // Line 6
import { Chart components } from "recharts" // Lines 7-10
import { Icons } from "lucide-react"  // Lines 11-12

/* ───── DATA ───── */                 // Separator comment
interface DataType { ... }            // TypeScript types
const data: DataType[] = [...]        // Inline data array

/* ───── COMPONENTS ───── */           // Separator comment
function SubComponent1() { ... }      // Named function components
function SubComponent2() { ... }

/* ───── MAIN ───── */                 // Separator comment
export default function WidgetName() {
  const [state, setState] = useState(...)
  const computed = useMemo(() => ..., [deps])
  return <ResponsiveContainer>...</ResponsiveContainer>
}
```

**Uniformity Metrics**:
- 8 of 10 widgets: 506-685 LOC (tight clustering)
- All use identical comment separators
- All follow same import ordering
- All export default function (not const)

**Implication**: This scaffold is **system-prompt enforced**, not manually coded. The consistency is too high for human variance.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GENERATION_PIPELINE.md` lines 132-154
**Confidence**: HIGH (measured variance is negligible)

#### A5.3 shadcn/ui Frozen Template (HIGH CONFIDENCE)

**Bundle Evidence**:
- `components/ui/`: 57 files, 181,174 bytes
- **Byte-for-byte identical** between Reports B and C
- Timestamp identical across all template files
- 93-byte stub `pnpm-lock.yaml` (dependencies never resolved)

**Utilization**:
- Report B: ~8 of 57 components imported (14% usage)
- Report C: ~8 of 57 components imported (14% usage)
- Most components unused (avatar, calendar, command, form, input, label, etc.)

**Why ship unused components?**
- Simpler to ship frozen bundle than compute minimal set
- Bundle size not critical (source code export, not production build)
- Template updates propagate instantly to all reports

**Quality Impact**:
- Consistent component API across all reports
- No version drift between reports
- Battle-tested components (shadcn/ui is production-grade)

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GENERATION_PIPELINE.md` lines 40-55
**Confidence**: HIGH (byte-comparison is conclusive)

---

### A6. Libraries & Tools for Output Quality

#### A6.1 Chart Rendering (HIGH CONFIDENCE)

**Primary Library**: Plotly.js (chat UI, report previews)
- 10 chart types with Zod validation
- HSLA color palette (6-stop teal + accent colors)
- Professional layout defaults (margins, grid, legend)
- Config: `{ displayModeBar: false, displaylogo: false }` (clean UI)

**Export Library**: Recharts (v0.app report exports)
- Report B: Recharts + D3 (force-directed graphs)
- Report C: Recharts only (D3 dependency removed)
- React-native friendly (SSR compatible)

**Geographic Viz**: react-simple-maps (Report C)
- World map projections
- Region click-to-drill
- Metric overlay on geographic data

**Advanced Viz**: D3 (Report B only)
- Force-directed network graphs
- Custom SVG paths
- Note: Dropped in Report C (simpler stack)

**Source**:
- `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 632-686
- `/Users/markforster/AirTable-SuperAgent/docs/REPORT_C_ANALYSIS.md` lines 22-25
**Confidence**: HIGH (package.json + bundle analysis)

#### A6.2 Animation & Interaction (HIGH CONFIDENCE)

**Chat UI**: Framer Motion + Lottie
- Slide-in panels (spring physics: stiffness 300, damping 30)
- Pulsing dots (loading indicators)
- Accordion expand/collapse
- Staggered fade-in (0.15s delay per item)

**Report Exports**: CSS keyframes + SVG animate
- Scroll-reveal (IntersectionObserver hook)
- 4 animation classes: `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-fade`
- Cubic-bezier easing: `(0.16, 1, 0.3, 1)` (snappy deceleration)
- Staggered children (8-child cascade, 50-540ms delays)

**Source**:
- `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 525-628
- `/Users/markforster/AirTable-SuperAgent/docs/SUPERAGENT_REPORT_ANALYSIS.md` lines 85-107
**Confidence**: HIGH (extracted from bundles + report CSS)

---

## SECTION B: PLATFORM QUALITY SYSTEM (Site UI Engineering)

### B1. Streaming UX Quality

#### B1.1 Real-Time Progress Communication (HIGH CONFIDENCE)

**Dual-Status Display Pattern**:
```
┌─────────────────────────────────────┐
│     Generating output...            │  ← Primary (large, bold, black)
│  ████████████████░░░░░░░░░░░░░░░░  │  ← Progress bar (continuous)
│   Polishing typography...           │  ← Secondary (small, gray)
└─────────────────────────────────────┘
```

**Status Hierarchy**:
- **Primary**: High-level action ("Generating output...", "Processing request...")
- **Secondary**: Current substep ("Writing outline...", "Reviewing content...", "Polishing typography...")
- **Progress bar**: Single continuous bar (0-100%), not reset per substep

**Substeps Observed** (in order):
1. Writing outline...
2. Building components...
3. Reviewing content... ← **Appears multiple times** (iterative quality checks)
4. Polishing typography and layout...

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` lines 9-35
**Confidence**: HIGH (live UI capture)

#### B1.2 Subagent Task Queue UX (HIGH CONFIDENCE)

**Card-Based Design**:
```
┌─ Orange ─────────────────────────────────────┐
│ 20  Interactive Report Design: Visualization │
│     & Aesthetics Strategy                    │
│     0:19 — PROCESSING                    ›   │
│     ████████████████████░░░░░░░░░░░░░░░      │
└───────────────────────────────────────────────┘
```

**Card Components**:
- **ID**: Large gray number (sequential: 20, 21, 22, 23...)
- **Title**: Bold, multi-line (descriptive)
- **Duration**: `M:SS` format (elapsed time, not estimate)
- **Status badge**: ALL CAPS ("PROCESSING", "CREATING NOTES")
- **Left border**: Color-coded (orange, blue, pink, green = category)
- **Progress bar**: Individual per-task (bottom of card)
- **Chevron**: Right `›` (expandable/clickable)

**Status Values**:
- `PROCESSING` — Active research
- `CREATING NOTES` — Output synthesis phase

**Quality Signals**:
- Color coding = visual category grouping
- Elapsed time = transparency (users see actual progress, not fake estimates)
- Sequential IDs = continuity across phases
- Individual progress bars = granular status

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` lines 37-75
**Confidence**: HIGH (screenshot analysis)

#### B1.3 Activity Panel: Reasoning Transparency (HIGH CONFIDENCE)

**Layout**:
- Right sidebar panel (~400px)
- 3 tabs: Sources | Files | Activity
- Expandable reasoning sections
- Chip/tag layout for workstream labels

**Content Example**:
```
Superagent reasoning

▼ Devising Initial Research Strategy
  Extract and analyze previous work while conducting comprehensive
  research across 13 parallel workstreams:

  [Chip] Deep Market Landscape Analysis
  [Chip] Comprehensive Financial Analysis
  [Chip] Strategic Initiatives Research
  ... (14 total workstream chips)

▼ Considering Results and Refining Research Strategy
  Fill critical data gaps from FactSet failures by gathering data
  from alternative sources (SEC filings, Balance...)
```

**Quality Impact**:
- **Transparency**: Users see orchestration logic
- **Trust**: Reasoning exposed, not black-box
- **Debuggability**: Can identify if strategy went wrong

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` lines 77-127
**Confidence**: HIGH (screenshot capture)

---

### B2. Component Design Quality

#### B2.1 shadcn/ui + CVA Variant System (HIGH CONFIDENCE)

**Class Variance Authority (CVA)** pattern:
```javascript
const badgeVariants = cva(
  "inline-flex shrink-0 items-center rounded-xs border transition-colors",
  {
    variants: {
      variant: {
        default: "text-primary-800 bg-neutral-50 border-neutral-200",
        primary: "text-primary-950 bg-primary-50 border-primary-200",
        error: "text-error-400 bg-error-50 border-error-100",
        warning: "text-warning-400 bg-warning-50 border-warning-200",
        success: "text-success-400 bg-success-50 border-success-100",
      }
    },
    defaultVariants: { variant: "default" }
  }
)
```

**12 CVA Component Patterns** documented:
- Status badge card (4 color variants)
- Source pill (web/pro, selected/unselected)
- Chart card (size variants)
- Chart toolbar (default/error/warning)
- Toast (default/destructive)
- Alert box (default/destructive)
- Tab trigger (active state variants)

**Quality Impact**:
- Type-safe variants (TypeScript autocomplete)
- Consistent state styling (hover, active, selected)
- Composable styles (can combine variants)

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 958-1185
**Confidence**: HIGH (extracted from production bundles)

#### B2.2 Design Token System (HIGH CONFIDENCE)

**Dual Color Spaces**:
- **OKLCH** (perceptually uniform, dark mode)
- **HSLA** (traditional, chart colors)

**Semantic Scales**:
```css
/* Primary (Teal) */
--primary-50   /* Lightest bg */
--primary-100  /* Hover accent */
--primary-500  /* Brand color */
--primary-800  /* Default text */
--primary-950  /* Darkest text/headings */

/* Neutral */
--neutral-0    /* Pure white */
--neutral-200  /* Borders */
--neutral-500  /* Muted text */
--neutral-700  /* Icon strokes */
--neutral-900  /* Strong text */

/* Functional */
--error-50, --error-500
--warning-50, --warning-500
--success-50, --success-400
```

**Redesign Tokens** (warm palette):
```css
--redesign-warm-white   /* #fff5e9 warm bg */
--redesign-black        /* Pure black text */
--redesign-black-{4,8,16,24,48,64}  /* Opacity variants */
```

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 294-378
**Confidence**: HIGH (CSS variable extraction)

#### B2.3 Responsive Patterns (HIGH CONFIDENCE)

**Breakpoint System** (Tailwind):
```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
3xl:  ~1536px (container queries for reports)
```

**Mobile-First Patterns**:
```css
/* Base (mobile): Stack vertically */
.chat-message { padding: 1rem; }

/* Desktop: Side-by-side layout */
@media (min-width: 768px) {
  .chat-message { padding: 2rem 8rem; }
}
```

**Container Queries** (reports):
```css
/* Report columns stack by default */
.gml-row { display: flex; flex-direction: column; }

/* Desktop: Horizontal layout */
@container (min-width: 1536px) {
  .gml-row { flex-direction: row; }
}
```

**Source**: GML rendering patterns + Tailwind analysis
**Confidence**: HIGH (documented in renderer)

---

### B3. Error & Edge Case Handling

#### B3.1 Generation Failures (MEDIUM CONFIDENCE)

**Observable Patterns**:
- `ERROR` stream event type exists with `error_message` and `error_type` fields
- Chart toolbar has `error` variant (red background)
- Toast has `destructive` variant

**Inferred Behavior**:
- Stream emits `{ type: "ERROR", error_message: "...", error_type: "..." }`
- UI switches overlay to error state
- User can retry or cancel

**Not Observed**: Actual error handling flow (would need to trigger failure)

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 899-922
**Confidence**: MEDIUM (schema exists, behavior inferred)

#### B3.2 Loading States (HIGH CONFIDENCE)

**Skeleton Patterns**:
- Pulsing dots (3-dot animated sequence)
- Opacity animation (0 → 1 → 0 cycle)
- Progress bars (continuous, not indeterminate)

**Loading Animation** (typing indicator):
```javascript
animate: { opacity: [0, 0, 1, 1, 0] },
transition: {
  duration: 1.6,
  times: [0, .15 * index, .15 * index + .01, .7, .7 + .2],
  repeat: Infinity,
  ease: "linear"
}
```

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md` lines 525-585
**Confidence**: HIGH (animation code extracted)

#### B3.3 Timeout Handling (LOW CONFIDENCE)

**Evidence**: No explicit timeout values found in bundles. Likely server-side.

**Hypothesis**:
- Long-running tasks (30s-2min) use heartbeat events to keep connection alive
- `{ type: "heartbeat" }` stream event exists in protocol
- Client displays progress during long operations

**Source**: Stream event types list
**Confidence**: LOW (heartbeat exists, timeout behavior not observed)

---

## SECTION C: CROSS-CUTTING QUALITY PATTERNS

### C1. Review Passes

#### C1.1 Iterative Content Review (HIGH CONFIDENCE)

**Evidence**: "Reviewing content..." substep appears **multiple times** during generation.

**Inferred Flow**:
```
1. Writing outline...
2. Building components...
3. Reviewing content...     ← First pass
4. [Content adjustment]
5. Reviewing content...     ← Second pass
6. [Content adjustment]
7. Polishing typography...
```

**Implication**: The system doesn't generate once and finish. It performs **iterative quality checks** with potential refinement loops.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` lines 25-29
**Confidence**: HIGH (observed in live UI)

#### C1.2 Meta-Research Quality Check (HIGH CONFIDENCE)

**Pattern**: "Considering Results and Refining Research Strategy"

**What Happens**:
1. Initial research launches (13 parallel workstreams)
2. System waits for results
3. **Meta-evaluation step**: System reviews research quality
4. Identifies gaps: "FactSet failures", missing data
5. Launches secondary research with alternative sources
6. Proceeds with enriched dataset

**Quality Signal**: System is **self-aware** of data quality and adapts.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` lines 102-107
**Confidence**: HIGH (Activity panel reasoning text)

#### C1.3 FactSet Fallback Strategy (HIGH CONFIDENCE)

**Evidence**: Activity panel explicitly mentions fallback:

> "Fill critical data gaps from FactSet failures by gathering financial, geographic, and investor data from alternative sources (SEC filings, Balance...)"

**Providers**:
- **Primary**: FactSet (financial data API)
- **Fallbacks**: SEC filings (EDGAR), Balance, other web sources

**Quality Impact**:
- **Resilience**: Single data source failure doesn't block generation
- **Completeness**: System actively seeks missing data
- **Transparency**: User sees fallback strategy in Activity panel

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md` line 106
**Confidence**: HIGH (explicit text in screenshot)

---

### C2. Quality Signals & Metrics

#### C2.1 Data Consistency Signals (HIGH CONFIDENCE)

**Evidence**: Report C contains MSFT revenue figure `$281.7B` in 5+ separate files:
- `competitive-matrix.tsx`
- `dynamic-financial-chart.tsx`
- `financial-performance` prose
- `executive-summary` prose
- `financial-ratios-table.tsx`

**What This Proves**:
- Shared data brief feeds all generators
- No manual copy-paste (would have typos/drift)
- Centralized data source ensures accuracy

**Quality Mechanism**:
```
Research phase → Structured data brief → Shared context → All generators reference same source
```

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GENERATION_PIPELINE.md` lines 36-42
**Confidence**: HIGH (measured consistency is 100%)

#### C2.2 Output Uniformity Metrics (HIGH CONFIDENCE)

**Report C Widgets** (10 components):
- 8 of 10 widgets: 506-685 LOC (clustering around ~600 LOC)
- Standard deviation: ~60 LOC
- All follow identical scaffold pattern

**What This Proves**:
- Output budget exists (~600 LOC per widget)
- System prompt enforces structure
- Not free-form generation (would have wider variance)

**Total Output Limits**:
| Report | Total Source | Generated TSX | Template Bundle |
|--------|--------------|---------------|-----------------|
| A | 288K | 115K (2,719 LOC) | N/A (minimal) |
| B | 562K | 342K (9,286 LOC) | 181K |
| C | 506K | 286K (7,206 LOC) | 181K |

**Pattern**: Reports B & C cluster near ~550K total, ~300K generated TSX. Likely hard or soft limit.

**Source**: `/Users/markforster/AirTable-SuperAgent/docs/GENERATION_PIPELINE.md` lines 195-209
**Confidence**: HIGH (measured file sizes)

#### C2.3 Self-Evaluation Indicators (MEDIUM CONFIDENCE)

**Observable Signals**:
1. **"Reviewing content..."** appears multiple times → iterative refinement
2. **"Considering Results..."** → meta-quality evaluation
3. **FactSet fallback** → data quality resilience
4. **Data consistency** (MSFT $281.7B) → shared brief validation

**Inferred System Behavior**:
- Quality checks happen at multiple stages
- System can detect insufficient data and adapt
- Review passes can trigger regeneration or refinement

**Not Observable**:
- What criteria trigger re-review
- How many review iterations max
- Whether review is LLM-based or rule-based

**Source**: Multiple screenshot + pipeline analyses
**Confidence**: MEDIUM (signals observed, mechanism inferred)

---

## Key Findings Summary

### OUTPUT QUALITY (Artifacts)

**1. Structured Output Enforcement** (HIGH)
- Zod schemas for charts (10 types), stream events (22 types), component props
- GML tag system (18 tags) constrains report structure
- Healer system auto-corrects malformed markup

**2. Multi-Stage Pipelines** (HIGH)
- Websites: 7 stages (template → architecture → theme → layout → content → widgets → export)
- Reports: 4 stages (outline → components → review → polish)
- Review passes appear multiple times (iterative quality checks)

**3. Data Consistency** (HIGH)
- Shared data brief ensures cross-file accuracy
- MSFT $281.7B appears identically in 5+ files (Report C)
- Entity-backed citations prevent broken references

**4. Quality Resilience** (HIGH)
- FactSet failure → SEC filings fallback
- "Considering Results..." meta-step adapts research strategy
- Healer repairs structural issues without LLM retry

### PLATFORM QUALITY (UX)

**1. Streaming Progress UX** (HIGH)
- Dual-status display (primary action + substep)
- Continuous progress bar (0-100%, not reset)
- Real-time substep updates ("Writing outline...", "Reviewing content...")

**2. Transparency Features** (HIGH)
- Activity panel shows reasoning breakdown
- 13 parallel workstreams visible as chips
- Elapsed time (not fake estimates) on task cards
- Color-coded task categories

**3. Professional UI Standards** (HIGH)
- shadcn/ui component library (57 components, frozen bundle)
- CVA variant system (type-safe state styling)
- OKLCH + HSLA dual color spaces
- Responsive patterns (mobile-first, container queries)

---

## Actionable Recommendations

### For Replication in Other Systems

**1. Implement Structured Output First**
- Use Zod or Pydantic to schema-validate LLM output
- Create domain-specific markup (like GML) for complex layouts
- Don't rely on perfect generation — build healers/validators

**2. Multi-Stage Generation with Review**
- Separate outline → components → content → polish
- Run review passes at multiple stages
- Display progress substeps to users (keeps engagement)

**3. Data Brief Pattern**
- Research phase creates structured data brief
- All downstream generators reference same brief
- Ensures consistency across sections/components

**4. Fallback Strategies**
- Primary source failure → alternative sources
- Make fallback logic visible (transparency = trust)
- Log data gaps and resolution paths

**5. Real-Time Progress Communication**
- Dual-status display (never static "Loading...")
- Show current substep (users tolerate 2min if they see progress)
- Use continuous progress bars (visual feedback loop)

### For Quality Improvement

**1. Add Self-Evaluation**
- After initial generation, LLM reviews own output
- Prompt: "Review this report. Identify gaps, inconsistencies, weak citations."
- Trigger refinement loop if issues found

**2. Measure Output Uniformity**
- Track component size variance (should cluster)
- Wide variance = inconsistent system prompts
- Tight variance = good prompt enforcement

**3. Build Transparency Panels**
- Show reasoning steps (like Activity panel)
- Display data sources (like Sources tab)
- Expose retries/fallbacks (builds trust)

---

## Confidence Levels

**HIGH CONFIDENCE** (direct evidence):
- Zod schemas, GML tags, healer rules (extracted from bundles)
- 7-stage pipeline (timestamp evidence)
- Streaming progress UX (screenshot captures)
- Data consistency patterns (measured cross-file)
- FactSet fallback (explicit in Activity panel text)

**MEDIUM CONFIDENCE** (inferred with strong supporting evidence):
- System prompt fragments (consistent with all constraints)
- Review pass mechanics (observed multiple times, mechanism inferred)
- Architecture selection criteria (patterns proven, logic unknown)
- Meta-quality evaluation (observed reasoning step, internals unknown)

**LOW CONFIDENCE** (speculative):
- Timeout handling (heartbeat exists, behavior not tested)
- LLM-based vs rule-based review (method not observable)
- Max review iterations (limit not documented)

---

## Source Files

All findings traceable to:
- `/Users/markforster/AirTable-SuperAgent/docs/GML_REPORT_RENDERING_PATTERNS.md`
- `/Users/markforster/AirTable-SuperAgent/docs/GENERATION_PIPELINE.md`
- `/Users/markforster/AirTable-SuperAgent/docs/SUPERAGENT_REPORT_ANALYSIS.md`
- `/Users/markforster/AirTable-SuperAgent/docs/REPORT_C_ANALYSIS.md`
- `/Users/markforster/AirTable-SuperAgent/docs/JS_DESIGN_TOKENS.md`
- `/Users/markforster/AirTable-SuperAgent/reports/04_prompt_and_output_formats.md`
- `/Users/markforster/AirTable-SuperAgent/reports/05_validation_playbook.md`
- `/Users/markforster/AirTable-SuperAgent/docs/SCREENSHOT_ANALYSIS.md`
- Production JavaScript bundles (extracted/Superagent/*.js)

---

*End of Quality Methods Analysis*
