# Superagent UI Screenshot Analysis

> **Date**: 2026-02-16
> **Source**: 9 screenshots captured during live Superagent CRE report generation session
> **Purpose**: Document UI states, progress patterns, and subagent display for replication in intelli

---

## Generation Progress States

Superagent uses a **full-screen overlay** during output generation with a dual-status display:

```
┌─────────────────────────────────────┐
│                                     │
│        Generating output...         │  ← Primary heading (large, bold)
│                                     │
│  ████████████████░░░░░░░░░░░░░░░░  │  ← Single continuous progress bar
│                                     │
│      Polishing typography...        │  ← Secondary substep (gray, smaller)
│                                     │
└─────────────────────────────────────┘
```

### Observed Substep Sequence
1. "Building components..." (earliest phase)
2. "Reviewing content..." (validation pass — appears multiple times)
3. "Writing outline..." (structure phase)
4. "Polishing typography and layout..." (final refinement)

**Key patterns**:
- Single continuous progress bar advances across ALL substeps (not reset per-substep)
- Secondary status text is de-emphasized (gray) vs primary heading (black, bold)
- Minimalist centered layout with maximum whitespace
- Progress bar: dark gray fill on light gray background, ~65% wide at page width

---

## Subagent Task Queue (Card-Based)

Screenshot at 03:31:40 shows the subagent task list with 4 visible tasks (IDs 20-23):

### Card Layout
```
┌─ color border ──────────────────────────────────┐
│ 20    Interactive Report Design: Visualization   │
│       & Aesthetics Strategy                      │
│       0:19 — PROCESSING                      ›   │
│       ████████████████████░░░░░░░░░░░░░░░░░░    │
└──────────────────────────────────────────────────┘
```

### Card Components
| Element | Details |
|---------|---------|
| **ID** | Large light gray number, left-aligned (sequential: 20, 21, 22, 23) |
| **Title** | Bold, multi-line text (descriptive, variable length) |
| **Duration** | `M:SS` format — elapsed time, not estimate |
| **Status badge** | ALL CAPS: `PROCESSING`, `CREATING NOTES` |
| **Left border** | Color-coded by category (orange, light blue, pink/magenta, dark green/teal) |
| **Progress bar** | Bottom of card, individual per-task |
| **Chevron** | Right-side `›` indicating expandable/navigable |

### Observed Task Cards
| ID | Title | Duration | Status | Border Color |
|----|-------|----------|--------|-------------|
| 20 | Interactive Report Design: Visualization & Aesthetics Strategy | 0:19 | PROCESSING | Orange/amber |
| 21 | Analytical Frameworks for Risk, ESG, and Investor Sentiment Assessment | 0:19 | PROCESSING | Light blue |
| 22 | Strategic Insights: Market Landscape, Technology, and Competitive Advantage | 0:15 | PROCESSING | Pink/magenta |
| 23 | Deep Analytical Synthesis and Framework Development | 0:37 | CREATING NOTES | Dark green/teal |

### Status Values Observed
- `PROCESSING` — standard active research state
- `CREATING NOTES` — output synthesis/note creation state

---

## Chat Info Panel (Activity Tab)

Screenshot at 03:48:18 shows a right-side panel with 3 tabs: **Sources | Files | Activity**

### Activity Tab Content
- Header: "Superagent reasoning" (with icon)
- Expandable sections showing orchestration logic:

**Section 1: "Devising Initial Research Strategy"**
> Extract and analyze the previous work from the ZIP file while simultaneously conducting comprehensive deep research across 13 parallel workstreams covering market landscape, financials, strategy, customers, regulations, technology, operations, ESG, risks, geography, investor sentiment, design excellence, and academic insights.

**13 Parallel Workstream Labels** (shown as chips/tags):
1. Extract and Analyze Previous Work
2. Deep Market Landscape Analysis
3. Comprehensive Financial Analysis
4. Strategic Initiatives Research
5. Deep Customer Insights Research
6. Regulatory Environment Analysis
7. Technology and Innovation Trends
8. Supply Chain and Operations Research
9. ESG and Sustainability Analysis
10. Comprehensive Risk Analysis
11. Geographic Market Analysis
12. Investor Sentiment and Market Perception
13. Design Excellence Research
14. Academic Research and Insights

**Section 2: "Considering Results and Refining Research Strategy"**
> Fill critical data gaps from FactSet failures by gathering financial, geographic, and investor data from alternative sources (SEC filings, Balance...) [truncated]

### Layout Pattern
- Sidebar panel (right-side, ~400px width)
- Tab bar at top with underline indicator
- Expandable reasoning sections with bullet/timeline dots
- Chip/tag layout for workstream labels (flex-wrap)
- Scrollable content area

---

## CRE Report Content (Screenshot 03:20:09)

Shows a **modal/overlay** for "Step 4: Output Generation & Post-Validation" within a CRE Metric Library report:

### Content Structure
- Step indicator with orange/amber rounded icon
- Title: "Step 4: Output Generation & Post-Validation"
- Description paragraph about RDF transformation and SHACL validation
- **SPARQL Example** code block (dark background, syntax highlighted):
  ```sparql
  PREFIX cre: <https://cre.example.org/ontology#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  INSERT DATA {
    <https://cre.example.org/decision/456> a cre:DecisionOutcome ;
      cre:decidedOn <https://cre.example.org/property/123> ;
      cre:recommendation "ACQUIRE" ;
      cre:confidence "HIGH" ;
      cre:timestamp "2026-03-15T10:30:00Z"^^xsd:dateTime ;
      cre:rationale "Strong NOI and favorable cap rate" ;
      cre:decidedBy <https://cre.example.org/user/jane.doe> .
  }
  ```
- **SHACL Validation Role** callout box explaining enforcement of required fields

### Background Elements (partially visible)
- Navigation tabs: Architecture | Ontology | Decision Matrix | Stakeholders | Lifecycle | Visualization
- Report title: "CRE Metric Library"
- Integration Benefits section discussing unified data governance
- References to "Decision" and "DecisionOutcome" as semantic entities

---

## Design Implications for Intelli

### Must Replicate
1. **Full-screen generation overlay** with dual-status (primary heading + substep)
2. **Card-based subagent queue** with color borders, sequential IDs, elapsed time, status badges
3. **Activity panel** showing reasoning breakdown with expandable sections and workstream chips
4. **Single continuous progress bar** that advances across the entire generation pipeline

### Design Tokens to Match
- Progress bar: dark gray fill / light gray track
- Status badges: ALL CAPS, monospace-style
- Task card colors: orange, blue, pink, green (at minimum 4 category colors)
- Card layout: rounded corners, left color border, generous padding
- Typography hierarchy: bold primary > gray secondary > monospace status

### New Information (Not in Previous Analysis)
1. **"CREATING NOTES" status** — a distinct state beyond PROCESSING (synthesis/output phase)
2. **Color-coded task borders** — category distinction system with at least 4 colors
3. **13 parallel workstreams** confirmed (previously estimated 12 from webarchive analysis)
4. **"Considering Results and Refining Research Strategy"** — meta-reasoning step after initial research
5. **FactSet data gap filling** — fallback strategy when primary data sources fail
6. **Sequential task IDs reaching 23+** — tasks numbered continuously, not reset per phase
7. **Elapsed time display** in `M:SS` format (not percentage or remaining time)
