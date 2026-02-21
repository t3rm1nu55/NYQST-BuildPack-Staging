# SuperAgent GML Report Rendering Patterns
## Professional Deliverable Layout & Composition Analysis

> **Document ID**: RENDERING-PATTERNS-001
> **Date**: 2026-02-16
> **Source**: SuperAgent chat export analysis + reverse-engineered JavaScript bundles
> **Purpose**: Document the actual markup, layout structures, and component composition patterns used by SuperAgent for professional-looking reports

---

## Executive Summary

SuperAgent uses a custom markup language called **GML (Gradient Markup Language)** consisting of 18 structured tags to render professional reports. The system combines responsive layout containers, specialized info blocks, chart integration, inline citations, and a sophisticated "healing" validator that automatically fixes malformed markup.

**Key insight**: The rendering system is designed to accept imperfect LLM-generated markup and heal it into proper structure, enabling reliable report generation even when the model makes nesting mistakes.

---

## 1. GML Tag Inventory

### 1.1 Complete Tag Set (18 tags)

**Layout Containers** (4 tags):
- `gml-row` — Full-width flex container for multi-column layouts
- `gml-primarycolumn` — Main content column (3/4 width on desktop)
- `gml-sidebarcolumn` — Sidebar for metadata/insights (1/4 width)
- `gml-halfcolumn` — Half-width column for two-column layouts

**Content Widgets** (8 tags):
- `gml-chartcontainer` — Plotly chart integration with config/data props
- `gml-gradientinsightbox` — Highlighted insight box with gradient background
- `gml-infoblockmetric` — KPI/metric display card
- `gml-infoblockevent` — Event/timeline item card
- `gml-infoblockstockticker` — Stock/financial ticker widget
- `gml-inlinecitation` — Inline citation with identifier-based lookup
- `gml-blockquote` — Styled blockquote
- `gml-downloadfile` — File download button/link

**Deliverable Viewers** (4 tags):
- `gml-viewreport` — Embedded report viewer
- `gml-viewwebsite` — Website preview/link
- `gml-viewpresentation` — Slide deck viewer
- `gml-viewgenerateddocument` — Document viewer

**Metadata** (2 tags):
- `gml-components` — Component registry/manifest
- `gml-header-elt` — Header element

---

## 2. Layout Structure & Responsive Design

### 2.1 Responsive Breakpoints

The system uses Tailwind's container queries (`@3xl:`) to switch layouts at ~1536px.

**Mobile-first patterns**:
- All columns stack vertically by default
- Desktop: Primary/sidebar switch to side-by-side
- Container: `flex flex-col @3xl:flex-row`

### 2.2 Standard Layout Recipes

#### Two-Column Report Layout
```html
<gml-row>
  <gml-primarycolumn>
    <!-- Main content: sections, tables, charts -->
    <h1>Report Title</h1>
    <p>Introduction text with citation <gml-inlinecitation identifier="entity-123"/></p>

    <gml-chartcontainer props='{"data": {...}, "layout": {...}}'></gml-chartcontainer>

    <h2>Key Findings</h2>
    <!-- More content -->
  </gml-primarycolumn>

  <gml-sidebarcolumn>
    <!-- Sidebar: insights, metrics, context -->
    <gml-gradientinsightbox>
      <p><strong>Superagent Insight:</strong> Key takeaway summarized here...</p>
    </gml-gradientinsightbox>

    <gml-infoblockmetric props='{"label": "Total Revenue", "value": "$2.4M", "trend": "up"}'>
    </gml-infoblockmetric>
  </gml-sidebarcolumn>
</gml-row>
```

**Rendered styles**:
- `gml-row`: `flex flex-col @3xl:flex-row flex-wrap gml-row`
- `gml-primarycolumn`: `w-full @3xl:w-3/4 gap-[20px] @3xl:pr-5 gml-primarycolumn`
- `gml-sidebarcolumn`: `w-full @3xl:w-1/4 gml-sidebarcolumn`

#### Full-Width Single Column
```html
<gml-row>
  <gml-primarycolumn>
    <h1>Executive Summary</h1>
    <p>Full-width content without sidebar...</p>
  </gml-primarycolumn>
</gml-row>
```

#### Half-Column Grid (Comparison Layouts)
```html
<gml-row>
  <gml-halfcolumn>
    <h3>Option A</h3>
    <p>Details about Option A...</p>
  </gml-halfcolumn>

  <gml-halfcolumn>
    <h3>Option B</h3>
    <p>Details about Option B...</p>
  </gml-halfcolumn>
</gml-row>
```

**Rendered style**:
- `gml-halfcolumn`: `flex-2 max-w-[50%]`

---

## 3. Data Presentation Patterns

### 3.1 Metric Cards (`gml-infoblockmetric`)

**Purpose**: Display KPIs, numerical metrics, trends

**Visual design**:
- Styled as cards with vertical spacing (`my-5`)
- Supports label/value pairs, trend indicators, badges
- Appears in sidebar or inline

**Example usage**:
```html
<gml-infoblockmetric props='{"label": "Occupancy Rate", "value": "94.2%", "trend": "up"}'>
</gml-infoblockmetric>

<gml-infoblockmetric props='{"label": "Avg. Lease Term", "value": "5.3 years"}'>
</gml-infoblockmetric>
```

### 3.2 Event Cards (`gml-infoblockevent`)

**Purpose**: Timeline items, milestones, status updates

**Layout**: Sidebar placement typical
**Spacing**: `my-5` vertical margin

### 3.3 Stock Tickers (`gml-infoblockstockticker`)

**Purpose**: Financial data display (stock prices, indices)

**Layout**: Sidebar placement
**Styling**: Similar card treatment to metrics

---

## 4. Chart Integration (`gml-chartcontainer`)

### 4.1 Chart Configuration Format

Charts use **Plotly.js-compatible schemas** passed via props.

**Color palette** (extracted from source):
```javascript
DEFAULT_COLORS = [
  "hsla(186, 60%, 20%, 1)",  // Teal dark
  "hsla(186, 54%, 36%, 1)",  // Teal medium-dark
  "hsla(186, 44%, 43%, 1)",  // Teal medium
  "hsla(186, 44%, 58%, 1)",  // Teal medium-light
  "hsla(186, 53%, 65%, 1)",  // Teal light
  "hsla(185, 50%, 80%, 1)",  // Teal very light
]

ACCENT_COLOR = "hsla(103, 40%, 43%, 1)"  // Green (for positive trends)
ERROR_COLOR = "hsla(9, 90%, 48%, 0)" → "hsla(0, 65%, 55%, 0.32)"  // Red gradient
```

**Supported chart types** (inferred from schemas):
- Line charts (`type: 'scatter', mode: 'lines'`)
- Bar charts (`type: 'bar'`)
- Scatter plots (`type: 'scatter', mode: 'markers'`)
- Candlestick charts (`type: 'candlestick'`)
- Donut/pie charts (`type: 'pie'`)

**Layout props** (Zod schemas extracted):
- `title`: Text with font customization
- `margin`: `{ t, r, b, l, pad }`
- `legend`: `{ orientation, x, y, xanchor, yanchor }`
- Axis controls: `autorange`, `tickformat`, `tickmode`, `showgrid`

### 4.2 Chart Rendering

**Container styling**:
- `my-5` vertical spacing
- `relative min-h-112` minimum height
- Error boundaries with fallback UI

**Example**:
```html
<gml-chartcontainer props='{
  "data": [{
    "type": "bar",
    "x": ["Q1", "Q2", "Q3", "Q4"],
    "y": [120, 145, 132, 158],
    "marker": {"color": "hsla(186, 54%, 36%, 1)"}
  }],
  "layout": {
    "title": {"text": "Quarterly Revenue"},
    "showlegend": false,
    "margin": {"t": 40, "r": 20, "b": 40, "l": 40}
  }
}'>
</gml-chartcontainer>
```

---

## 5. Citation System

### 5.1 Inline Citations (`gml-inlinecitation`)

**Binding mechanism**: Citations reference entities via `identifier` prop.

**Flow**:
1. During research, entities are created with stable IDs
2. LLM emits `<gml-inlinecitation identifier="entity-abc-123"/>`
3. Frontend looks up entity metadata by identifier
4. Renders as clickable citation number with hover/click to expand

**Visual treatment**:
- Superscript citation number `[1]`
- Click opens entity detail panel
- Source metadata: title, URL, provider icon, retrieval timestamp

**Example**:
```html
<p>
  The commercial real estate market saw 15% growth
  <gml-inlinecitation identifier="jll-report-2025-q4"/>
  driven primarily by industrial demand
  <gml-inlinecitation identifier="costar-industrial-trends"/>.
</p>
```

### 5.2 Source Reference Streaming

**Protocol**: Separate `references_found` event in stream contains:
```json
{
  "type": "references_found",
  "data": [{
    "citationIdentifier": "entity-abc-123",
    "external_url": "https://...",
    "title": "Source Title",
    "provider": "brave" | "firecrawl" | "polygon" | ...,
    "retrieved_at": "2026-02-16T..."
  }]
}
```

This enables the citation lookup system to bind inline citations to full source metadata.

---

## 6. Typography Hierarchy

### 6.1 Heading Levels

Standard HTML headings (`<h1>` - `<h6>`) are used within GML containers.

**Font system**: AT Season Sans (custom)
- Regular
- Medium
- SemiBold
- Bold

**Text sizing** (from CSS variables):
```
--text-xs:   0.75rem  (line-height: calc(1/0.75))
--text-sm:   0.875rem (line-height: calc(1.25/0.875))
--text-base: 1rem     (line-height: calc(1.5/1))
--text-lg:   1.125rem (line-height: calc(1.75/1.125))
```

### 6.2 Text Formatting

**Base text styles**:
- `text-sm text-neutral-700 whitespace-pre-wrap break-words`
- `pt-2 pr-4 pb-2 pl-0` (padding)

**Lists**:
- Standard `<ul>` and `<ol>` within content
- Nested lists supported

**Emphasis**:
- `<strong>` for bold
- `<em>` for italic
- Inline code: monospace font family

---

## 7. Visual Hierarchy Techniques

### 7.1 Spacing System

**Vertical rhythm**:
- Widget spacing: `my-5` (margin top/bottom: 1.25rem)
- Column gap: `gap-[20px]` (between flex items)
- Section spacing: `pt-2 pr-4 pb-2 pl-0`

**Container queries** enable responsive gap adjustments:
- Mobile: stacked with consistent gaps
- Desktop: horizontal spacing between columns

### 7.2 Gradient Insight Box

**Visual signature**: Highlighted insight with gradient background

**Styling pattern** (extracted):
```css
.gradient-insight {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;  /* rounded-xl */
  background: gradient-to-l from-neutral-0 to-neutral-0/0;
  margin: 1.25rem 0;  /* my-5 */
}
```

**Header badge**:
```css
.insight-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;  /* rounded-full */
  border: 1px solid ...;
  padding: ...;
}
```

**Title**: "Superagent Insight" (hardcoded label)

### 7.3 Color Usage

**Neutral palette** (primary):
- Text: `text-neutral-700`
- Borders: `border-neutral-300`, `border-black/10`
- Backgrounds: `neutral-0`, `neutral-0/0` (transparent)

**Accent colors**:
- Primary: Teal family (see chart palette)
- Success/Up trend: Green (`hsla(103, 40%, 43%, 1)`)
- Error/Down trend: Red gradients

### 7.4 Borders & Cards

**Card pattern**:
- Border: `border border-neutral-300` or `border-black/10`
- Radius: `rounded-xl` (0.75rem)
- Shadow: Minimal or none (clean, flat design)

---

## 8. Metric/KPI Display Patterns

### 8.1 Large Number Display

**Hierarchy**:
1. **Large value**: Primary metric (emphasized font size/weight)
2. **Label**: Smaller text above or below value
3. **Trend indicator**: Badge or icon (up/down arrow)
4. **Context**: Comparison value, time range, units

### 8.2 Trend Badges

**Pattern** (inferred from code):
- `trend: "up"` → Green badge with ↑ icon
- `trend: "down"` → Red badge with ↓ icon
- `trend: "neutral"` → Gray badge with → icon

### 8.3 Metric Grid

**Two-column sidebar pattern**:
```html
<gml-sidebarcolumn>
  <gml-infoblockmetric props='{"label": "Total Revenue", "value": "$2.4M", "trend": "up"}'/>
  <gml-infoblockmetric props='{"label": "Occupancy", "value": "94.2%", "trend": "neutral"}'/>
  <gml-infoblockmetric props='{"label": "Avg Rent", "value": "$42/sqft", "trend": "up"}'/>
</gml-sidebarcolumn>
```

---

## 9. Table Formatting

### 9.1 Table Component Structure

**Base table HTML**:
```html
<table class="w-full table-fixed border-collapse">
  <thead>
    <tr class="border-b border-neutral-300">
      <th class="p-0 min-w-[160px] align-top">Column 1</th>
      <th class="p-0 min-w-[160px] align-top">Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-neutral-300">
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>
```

### 9.2 Table Styling

**Layout**:
- `w-full` — Full width of container
- `table-fixed` — Fixed table layout for consistent column widths
- `border-collapse` — Collapsed borders

**Headers** (`<th>`):
- `p-0` — No padding (padding applied to inner element)
- `min-w-[160px]` — Minimum column width
- `align-top` — Top-aligned content

**Rows** (`<tr>`):
- `border-b border-neutral-300` — Bottom border between rows

**Cell content wrapper**:
```css
.table-cell-content {
  font-size: 0.875rem;          /* text-sm */
  color: rgb(64, 64, 64);       /* text-neutral-700 */
  white-space: pre-wrap;        /* Preserve line breaks */
  word-break: break-words;      /* Wrap long words */
  padding: 0.5rem 1rem 0.5rem 0; /* pt-2 pr-4 pb-2 pl-0 */
}
```

**Scrolling**: Wrapped in `overflow-x-auto` container for horizontal scroll on mobile

### 9.3 Table Content Patterns

**Key-value tables**:
| Metric | Value |
|--------|-------|
| Total Units | 450 |
| Occupancy Rate | 94.2% |

**Comparison tables**:
| Property | Cap Rate | Price/SF |
|----------|----------|----------|
| Property A | 6.2% | $425 |
| Property B | 5.8% | $480 |

**Data tables with citations**:
```html
<table>
  <tr>
    <td>Market Cap</td>
    <td>$2.4B <gml-inlinecitation identifier="source-123"/></td>
  </tr>
</table>
```

---

## 10. Summary/Conclusion Patterns

### 10.1 Gradient Insight Box for Key Takeaways

**Standard pattern**:
```html
<gml-gradientinsightbox>
  <p><strong>Superagent Insight:</strong> The analysis reveals three critical trends...</p>
  <ul>
    <li>Key finding #1</li>
    <li>Key finding #2</li>
    <li>Key finding #3</li>
  </ul>
</gml-gradientinsightbox>
```

**Visual treatment**:
- Gradient background (subtle)
- Rounded corners (`rounded-xl`)
- Border accent
- "Superagent Insight" badge/label

### 10.2 Bulleted Takeaways

**Pattern** (from observed chat export):
```html
<p>This award-winning resource delivers actionable metric frameworks that conform to industry best practices for data storytelling, decision-making, and visual design. You'll find:</p>

<ul>
  <li><strong>Lifecycle Coverage:</strong> Templates for every stage from pre-development and construction through stabilization, operations, asset management, and disposition</li>
  <li><strong>Stakeholder Views:</strong> Customized dashboards for developers, investors, asset managers, property managers, brokers, tenants, and lenders</li>
  <li><strong>Property Segments:</strong> Segment-specific metrics for office, retail, industrial, multifamily, hospitality, healthcare, data centers, and mixed-use properties</li>
  <!-- ... -->
</ul>
```

**Formatting**:
- **Bold labels** followed by description
- Colon separator
- Scannable list structure

### 10.3 Deliverable Links

**Pattern**: End reports with links to generated artifacts

```html
<div>
  <gml-viewwebsite props='{"identifier": "b1252e1e-1211-460a-b18e-c82b7a1ba3b7"}'></gml-viewwebsite>
</div>

<div>
  <gml-viewreport props='{"identifier": "688b5468-af17-43d3-9447-d3b17f335332"}'></gml-viewreport>
</div>
```

These render as interactive cards/buttons that open the deliverable viewer.

---

## 11. Structural Validation ("Healing")

### 11.1 Why Healing Exists

**Problem**: LLMs don't always generate perfectly nested markup. A widget might appear outside its required container.

**Solution**: The renderer includes a **structural validator** that:
1. Checks if widgets are in acceptable parent containers
2. **Hoists** widgets to the nearest valid parent if possible
3. **Removes** widgets that can't be safely placed

### 11.2 Widths Validation Rules

**Extracted width constraints**:
```javascript
WIDGET_WIDTHS = {
  'gml-blockquote':          [WIDTHS.primary],
  'gml-chartcontainer':      [WIDTHS.primary],
  'gml-downloadfile':        [],  // Can appear anywhere
  'gml-gradientinsightbox':  [WIDTHS.primary],
  'gml-halfcolumn':          [WIDTHS.full_row],
  'gml-infoblockevent':      [WIDTHS.sidebar],
  'gml-infoblockmetric':     [WIDTHS.sidebar],
  'gml-infoblockstockticker':[WIDTHS.sidebar],
  'gml-inlinecitation':      [],  // Inline
  'gml-primarycolumn':       [WIDTHS.full_row],
  'gml-row':                 [],  // Top-level
  'gml-sidebarcolumn':       [WIDTHS.full_row],
  'gml-viewreport':          [],  // Can appear anywhere
}

WIDTHS = {
  full_row: 'gml-row',
  half:     'gml-halfcolumn',
  primary:  'gml-primarycolumn',
  sidebar:  'gml-sidebarcolumn',
}
```

**Interpretation**:
- `gml-infoblockmetric` MUST be inside `gml-sidebarcolumn`
- `gml-chartcontainer` MUST be inside `gml-primarycolumn`
- If the LLM puts a chart in the wrong place, the healer moves it

### 11.3 Healing Actions

**Hoist**:
```
Original (invalid):
<gml-row>
  <gml-chartcontainer .../> <!-- Wrong! Needs to be in primarycolumn -->
</gml-row>

Healed:
<gml-row>
  <gml-primarycolumn>
    <gml-chartcontainer .../> <!-- Hoisted into primary -->
  </gml-primarycolumn>
</gml-row>
```

**Remove**:
```
Original (invalid):
<gml-infoblockmetric .../> <!-- No parent container at all -->

Healed:
<!-- Widget removed because it can't be safely placed -->
```

This "forgiving" approach means the LLM doesn't need perfect markup generation — it just needs to emit the right tags, and the renderer will fix the structure.

---

## 12. Complete Example: Multi-Section Report

```html
<!-- Section 1: Executive Summary -->
<gml-row>
  <gml-primarycolumn>
    <h1>Commercial Real Estate Market Analysis</h1>
    <p>
      The CRE market demonstrated strong performance in Q4 2025, with industrial and
      multifamily sectors leading growth <gml-inlinecitation identifier="jll-q4-report"/>.
    </p>

    <gml-gradientinsightbox>
      <p><strong>Superagent Insight:</strong> Despite economic headwinds, CRE fundamentals
      remain solid with 94.2% average occupancy across core markets.</p>
    </gml-gradientinsightbox>

    <h2>Market Overview</h2>
    <p>Transaction volume reached $124B, up 8% YoY...</p>
  </gml-primarycolumn>

  <gml-sidebarcolumn>
    <gml-infoblockmetric props='{"label": "Total Transaction Volume", "value": "$124B", "trend": "up"}'/>
    <gml-infoblockmetric props='{"label": "Avg Cap Rate", "value": "6.2%", "trend": "down"}'/>
    <gml-infoblockmetric props='{"label": "Occupancy Rate", "value": "94.2%", "trend": "neutral"}'/>
  </gml-sidebarcolumn>
</gml-row>

<!-- Section 2: Sector Performance -->
<gml-row>
  <gml-primarycolumn>
    <h2>Sector Performance Breakdown</h2>

    <gml-chartcontainer props='{
      "data": [{
        "type": "bar",
        "x": ["Industrial", "Multifamily", "Office", "Retail"],
        "y": [15.2, 12.8, -3.4, 2.1],
        "marker": {"color": [
          "hsla(103, 40%, 43%, 1)",
          "hsla(103, 40%, 43%, 1)",
          "hsla(0, 65%, 55%, 1)",
          "hsla(186, 54%, 36%, 1)"
        ]}
      }],
      "layout": {
        "title": {"text": "YoY Growth by Sector (%)"},
        "margin": {"t": 40, "r": 20, "b": 60, "l": 60}
      }
    }'>
    </gml-chartcontainer>

    <h3>Industrial</h3>
    <p>E-commerce demand continues to drive industrial absorption
    <gml-inlinecitation identifier="costar-industrial"/>...</p>
  </gml-primarycolumn>

  <gml-sidebarcolumn>
    <gml-infoblockevent props='{"date": "2025-12-15", "title": "Major Lease Signed",
    "description": "Amazon signs 1.2M sqft lease in Phoenix"}'/>
  </gml-sidebarcolumn>
</gml-row>

<!-- Section 3: Regional Analysis -->
<gml-row>
  <gml-halfcolumn>
    <h3>West Coast Markets</h3>
    <p>Strong multifamily fundamentals...</p>

    <table class="w-full table-fixed border-collapse">
      <thead>
        <tr class="border-b border-neutral-300">
          <th>Market</th>
          <th>Cap Rate</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-neutral-300">
          <td>Los Angeles</td>
          <td>4.8%</td>
        </tr>
        <tr class="border-b border-neutral-300">
          <td>San Francisco</td>
          <td>5.1%</td>
        </tr>
      </tbody>
    </table>
  </gml-halfcolumn>

  <gml-halfcolumn>
    <h3>East Coast Markets</h3>
    <p>Office sector showing resilience...</p>

    <table class="w-full table-fixed border-collapse">
      <thead>
        <tr class="border-b border-neutral-300">
          <th>Market</th>
          <th>Cap Rate</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-neutral-300">
          <td>New York</td>
          <td>5.4%</td>
        </tr>
        <tr class="border-b border-neutral-300">
          <td>Boston</td>
          <td>5.7%</td>
        </tr>
      </tbody>
    </table>
  </gml-halfcolumn>
</gml-row>

<!-- Section 4: Conclusion -->
<gml-row>
  <gml-primarycolumn>
    <h2>Key Takeaways</h2>

    <gml-gradientinsightbox>
      <p><strong>Superagent Insight:</strong> The CRE market shows sector divergence with clear winners and opportunities:</p>
      <ul>
        <li><strong>Industrial:</strong> Sustained demand from e-commerce and logistics</li>
        <li><strong>Multifamily:</strong> Strong rental growth in Sunbelt markets</li>
        <li><strong>Office:</strong> Flight to quality continues, suburban assets lag</li>
        <li><strong>Retail:</strong> Experiential concepts driving selective growth</li>
      </ul>
    </gml-gradientinsightbox>

    <p>Investors should focus on industrial and multifamily core assets while being
    selective in office and retail <gml-inlinecitation identifier="ncreif-outlook-2026"/>.</p>

    <div>
      <gml-viewreport props='{"identifier": "detailed-analysis-123"}'></gml-viewreport>
    </div>
  </gml-primarycolumn>
</gml-row>
```

---

## 13. Design System Summary

### 13.1 Visual Language

**Characteristics**:
- **Clean & minimal**: Flat design, subtle borders, no heavy shadows
- **Scannable**: Clear typography hierarchy, generous spacing
- **Professional**: Teal color palette, custom font, balanced layouts
- **Responsive**: Mobile-first with intelligent desktop breakpoints
- **Forgiving**: Structural healing allows imperfect markup

### 13.2 Component Palette

| Component | Use Case | Placement |
|-----------|----------|-----------|
| `gml-row` | Section container | Top-level |
| `gml-primarycolumn` | Main content | Inside row |
| `gml-sidebarcolumn` | Metadata/context | Inside row |
| `gml-halfcolumn` | Comparisons | Inside row |
| `gml-chartcontainer` | Data visualization | Primary column |
| `gml-gradientinsightbox` | Key insights | Primary column |
| `gml-infoblockmetric` | KPI display | Sidebar |
| `gml-infoblockevent` | Timeline items | Sidebar |
| `gml-inlinecitation` | Source references | Inline in text |
| `<table>` | Tabular data | Primary or half columns |

### 13.3 Layout Decision Tree

```
Choose layout structure:
├─ Single column → <gml-row><gml-primarycolumn>...</gml-primarycolumn></gml-row>
├─ Two columns (main + sidebar) → <gml-row><gml-primarycolumn>...</gml-primarycolumn><gml-sidebarcolumn>...</gml-sidebarcolumn></gml-row>
└─ Side-by-side comparison → <gml-row><gml-halfcolumn>...</gml-halfcolumn><gml-halfcolumn>...</gml-halfcolumn></gml-row>

Place content:
├─ Long-form text, charts, tables → gml-primarycolumn
├─ Metrics, events, insights → gml-sidebarcolumn
└─ Citations → inline with <gml-inlinecitation>

Add emphasis:
├─ Key takeaway → <gml-gradientinsightbox>
├─ Important metric → <gml-infoblockmetric> in sidebar
└─ Data visualization → <gml-chartcontainer> with Plotly config
```

---

## 14. Implementation Recommendations

### 14.1 For LLM Prompt Engineering

**Instruct the model to**:
1. Structure reports in `<gml-row>` sections
2. Use `<gml-primarycolumn>` for main narrative
3. Place metrics/insights in `<gml-sidebarcolumn>`
4. Add `<gml-inlinecitation identifier="..."/>` for all factual claims
5. Use `<gml-chartcontainer>` for data visualizations
6. Highlight key findings in `<gml-gradientinsightbox>`
7. Don't worry about perfect nesting — the renderer will heal it

**Example system prompt fragment**:
```
When generating reports, use this markup structure:

<gml-row>
  <gml-primarycolumn>
    <h1>Title</h1>
    <p>Content with citations <gml-inlinecitation identifier="source-id"/>.</p>
    <gml-chartcontainer props='{"data": [...], "layout": {...}}'></gml-chartcontainer>
  </gml-primarycolumn>
  <gml-sidebarcolumn>
    <gml-infoblockmetric props='{"label": "Metric Name", "value": "123"}'/>
    <gml-gradientinsightbox>
      <p><strong>Key Insight:</strong> Summary...</p>
    </gml-gradientinsightbox>
  </gml-sidebarcolumn>
</gml-row>

Cite all facts. Use charts for data. Keep insights concise.
```

### 14.2 For Frontend Implementation

**Required components**:
1. GML tag parser (regex or HTML parser)
2. Component registry mapping tags to React components
3. Structural validator/healer
4. Citation lookup system
5. Plotly chart wrapper
6. Responsive layout containers

**Tech stack** (proven by SuperAgent):
- React 18+ for component rendering
- Tailwind CSS for styling (container queries)
- Plotly.js for charts
- Zod for validation (props, stream events)
- unified/hast for sanitization

### 14.3 For Structured Output

**Use Zod schemas to force proper GML generation**:
```typescript
const ReportSectionSchema = z.object({
  title: z.string(),
  content: z.string(),  // Can contain GML markup
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    trend: z.enum(['up', 'down', 'neutral']).optional(),
  })),
  charts: z.array(z.object({
    data: z.array(z.any()),  // Plotly data array
    layout: z.object({...}),  // Plotly layout
  })),
  insights: z.array(z.string()),
  citations: z.array(z.string()),  // Entity identifiers
});
```

Then have the LLM return structured JSON, and your renderer converts it to GML markup programmatically.

---

## 15. Key Differences from Standard Markdown Reports

| Aspect | Markdown | GML |
|--------|----------|-----|
| **Layout** | Linear, single column | Responsive multi-column with sidebars |
| **Widgets** | Limited (code blocks, images) | Rich (charts, metrics, events, insights) |
| **Citations** | Footnotes or inline links | Entity-bound citations with metadata lookup |
| **Visual hierarchy** | Typography only | Typography + layout + specialized containers |
| **Responsiveness** | Text reflow only | Smart column stacking + container queries |
| **Healing** | Strict syntax | Forgiving with automatic structure repair |
| **Charts** | External images | Native Plotly integration with data/config |
| **Metrics** | Plain text or tables | Dedicated KPI cards with trends |

---

## 16. Production Evidence

**From the actual chat export**:
- User request: Complex CRE metric template library
- Agent response: 12 parallel research tasks
- Deliverable: Professional multi-section report using GML
- Result: Clean, scannable, visually hierarchical output

**Observable quality markers**:
- Clear visual hierarchy (headings, spacing, cards)
- Scannable insights (gradient boxes, bullet lists)
- Data-driven (charts, metric cards, tables)
- Fully sourced (60 citations with URLs)
- Responsive layout (works on mobile and desktop)

This analysis documents the **actual patterns** used in production to deliver "award-winning" professional reports.

---

*End of GML Rendering Patterns Analysis*
