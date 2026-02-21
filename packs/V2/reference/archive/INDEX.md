# SuperAgent Analysis Index

Forensic analysis of Airtable SuperAgent's report generation system, conducted across three v0.app-exported reports and one set of production chat UI bundles.

**Date**: 2026-02-16
**Analyst**: Claude Opus 4.6 (multi-session, parallel agent analysis)

---

## Source Materials

| ID | Location | Type | Domain |
|----|----------|------|--------|
| **Chat UI** | `/Users/markforster/AirTable-SuperAgent/*.js, *.css` | Production bundles (minified JS/CSS) | SuperAgent chat application itself |
| **Report A** (b1252e1e) | `/Users/markforster/Downloads/b1252e1e-1211-460a-b18e-c82b7a1ba3b7/` | v0.app export (13K zip) | CRE Metric Template Library |
| **Report B** (df815ed8) | `/Users/markforster/Downloads/df815ed8-6570-4545-9c32-35b3f9c33c05.zip` | v0.app export (161K zip) | DMN-Ontology Decision Management System |
| **Report C** (aa71f148) | `/Users/markforster/Downloads/aa71f148-4b46-470a-bbc8-0549b99bc178.zip` | v0.app export (155K zip) | AAPL/MSFT/GOOG Strategic Market Intelligence |

---

## Analysis Documents

### 1. `TAILWIND_THEME_EXTRACTION.md` (44K)

**What it covers**: Complete extraction of the Tailwind v4 CSS theme from SuperAgent's **production chat UI** (the `55ccf76ff5ccbea2.css` bundle, 208KB). Documents 277 CSS custom properties across 6 categories: base tokens, sidebar tokens, chart colors, alpha-based neutral scale, animation keyframes, and component-specific overrides.

**Key findings**:
- Tailwind v4 CSS-first configuration (no `tailwind.config.js`)
- OKLCH + HSLA dual color system with alpha-neutral scale
- 6-layer multi-shadow system for depth hierarchy
- Complete dark mode via `.dark` class

**What could change with more data**: This extraction is from a single minified CSS bundle. Additional SuperAgent sessions or A/B testing variants might reveal conditional theme branches, feature-flagged styles, or user-customizable theme tokens not present in this snapshot. The OKLCH values could be generated from a higher-level design tool (Figma tokens, Style Dictionary) — seeing the source config would clarify whether these are hand-authored or compiled.

---

### 2. `FONT_AND_ASSET_EXTRACTION.md` (16K)

**What it covers**: All font-face declarations and external asset URLs extracted from the chat UI production bundles. Documents the proprietary "Seasons Sans" / "ATSeasonSans" font family (12 weights including non-standard 440/550/580/650), Geist Mono for code, and 19 external URLs (CDN, analytics, API endpoints).

**Key findings**:
- Seasons Sans is a proprietary font not publicly available — custom-commissioned or licensed
- 12 font weights (including unusual intermediate weights) suggest a bespoke type specification
- Font files served from Vercel's asset CDN with content-hash filenames

**What could change with more data**: We only see fonts loaded in one session. Different report types or user roles might load different font stacks. The intermediate weights (440, 550, 580, 650) might map to specific UI contexts we haven't identified — seeing the component CSS that references these weights would clarify usage.

---

### 3. `GML_CSS_EXTRACTION.md` (35K)

**What it covers**: All CSS rules targeting GML (a custom markup language used by SuperAgent for report rendering in the chat UI). Documents 40+ GML-specific CSS selectors, CVA (class-variance-authority) variant patterns, and the GML tag styling system.

**Key findings**:
- GML uses custom HTML-like tags (`<gml-heading>`, `<gml-callout>`, `<gml-metric>`, etc.)
- Styling uses CVA for variant management (size, color, sentiment)
- GML layout system has 18 custom elements for structured report output within chat

**What could change with more data**: GML appears to be SuperAgent's proprietary markup for in-chat report rendering. The v0.app exports (Reports A/B/C) do NOT use GML — they use standard React/JSX. This suggests GML is used only for the chat interface rendering path, while v0.app handles standalone report exports. Seeing the GML parser/renderer source code would confirm whether GML is compiled to React or interpreted at runtime.

---

### 4. `JS_DESIGN_TOKENS.md` (33K)

**What it covers**: Design tokens, chart configurations, streaming event types, and Plotly.js schemas extracted from the chat UI JavaScript bundles. Covers the HSLA chart color palette, 10 Plotly chart type schemas with Zod validation, 22 NDJSON streaming event types, and the report rendering pipeline.

**Key findings**:
- Chat UI uses Plotly.js (10 chart types, Zod-validated schemas) — completely different from v0.app exports which use Recharts
- NDJSON streaming with 22 discriminated union event types for real-time report generation
- Chart colors defined as HSLA tuples, not CSS variables

**What could change with more data**: The Plotly schemas show the chat UI's charting capability, but we don't know if SuperAgent dynamically chooses between Plotly (chat) and Recharts (export). Additional report exports might reveal whether Recharts is always used in v0.app exports or if Plotly sometimes appears. The streaming event types suggest a complex server-side pipeline — seeing the server code would reveal the full generation orchestration.

---

### 5. `GML_REPORT_RENDERING_PATTERNS.md` (27K)

**What it covers**: How GML tags are composed into reports within the chat UI. Documents the GML tag inventory, layout recipes (hero sections, metric grids, comparison tables), and the healer/fixer system that repairs malformed GML output.

**Key findings**:
- GML has a "healer" system that post-processes LLM output to fix structural issues
- Reports follow a templated structure: hero -> executive summary -> sections -> footer
- The healer handles unclosed tags, mismatched nesting, and orphaned elements

**What could change with more data**: The healer system suggests LLM output sometimes needs repair — this is a quality control mechanism. Seeing the healer's rules would reveal what kinds of errors the LLM commonly makes. The GML rendering pipeline is entirely separate from the v0.app export pipeline documented in `SUPERAGENT_REPORT_ANALYSIS.md`.

---

### 6. `SUPERAGENT_REPORT_ANALYSIS.md` (13K)

**What it covers**: Analysis of Report B (df815ed8), the DMN-Ontology Decision Management System. Documents the tech stack, Royal Blue Corporate design system, animation system, report structure (6 sections), all 11 visualization components (8,658 lines), rendering approaches, interactive patterns, and state management.

**Key findings**:
- SuperAgent builds complex interactive diagrams purely in React + SVG + math-based layout — no D3 DOM manipulation
- Hub-and-spoke highlighting pattern using Set<string> for O(1) membership
- Recursive upstream/downstream path tracing in Metric Cascade component
- SVG animated particles using `<animateMotion>` for "data flowing" visual

**What could change with more data**: This analysis covers only Report B. The comparison with Reports A and C (documented in this session's conversation but not yet in a standalone doc) reveals that the visualization approach varies significantly per report — Report B uses D3 + custom SVG, Report C uses Recharts + react-simple-maps. A larger sample of reports would clarify whether these are distinct "visualization strategies" selected by the generator or ad-hoc choices.

---

## Cross-Report Analysis (This Session, Not Yet in Standalone Documents)

### Report Comparison (A vs B vs C)

| Aspect | Report A | Report B | Report C |
|--------|----------|----------|----------|
| **Architecture** | Monolithic (997 LOC page) | Two-tier (coordinator + flat components) | Four-tier (page/sections/widgets/primitives) |
| **Viz libraries** | Recharts only | Recharts + D3 | Recharts + react-simple-maps |
| **Design system** | Generic OKLCH (default shadcn) | Royal Blue Corporate (hex) | Soft Brutalism (hex + offset shadows) |
| **shadcn/ui bundle** | 3 components (all used) | 57 components (19% used) | 57 components (14% used) |
| **Custom hooks** | 0 | 3 | 3 |
| **Animations** | None | Scroll-reveal (smooth) | Scroll-reveal (staggered) + brutalist hover |
| **Fonts** | Geist + Geist Mono | Inter + Geist Mono + Playfair Display | Inter + Space Grotesk + IBM Plex Mono |
| **Generated TSX** | 2,719 lines | 9,286 lines | 7,206 lines |
| **Zip size** | 13K | 161K | 155K |

### Template Bundle Analysis

Reports B and C ship an **identical 181,174-byte shadcn/ui template bundle** (57 components, byte-for-byte identical confirmed via `diff`). This bundle is:
- **8 custom SuperAgent additions** (empty, item, field, input-group, button-group, kbd, spinner, use-mobile)
- **~45 stock shadcn components with modifications** (data-slot attributes, enhanced focus rings, aria-invalid states, extra size variants)
- **~5 completely stock** (aspect-ratio, skeleton, separator, sonner, sidebar)

85% of bundled components are unused in any given report — they ship the full kit regardless.

### Generation Pipeline (Reverse-Engineered)

Evidence from file timestamps, git history, code comments, cross-file data consistency, and structural patterns reveals:

```
Stage 0: Research/RAG → shared data brief
Stage 1: Template assembly (frozen 181K bundle)
Stage 2: Architecture decision (monolithic / coordinator / four-tier)
Stage 3: Theme generation (CSS variables, fonts, design utilities)
Stage 4: Layout primitive generation (parameterized, domain-agnostic)
Stage 5: Content section generation (prose from data brief)
Stage 6: Widget generation (standardized scaffold, data from brief)
Stage 7: Atomic export (all files written simultaneously)
```

**Key evidence**:
- Reports B & C: every file has identical timestamp (atomic write)
- Report A: git history shows 4 named agents (A/B/C/D) working in parallel on feature branches
- Report C: financial figures (MSFT $281.7B, AAPL $416.2B) are consistent across 5+ files, proving shared data context
- `[v0]` console.log artifacts in Report B confirm v0.app as code generation engine
- `"Generated by Superagent."` in footer of all three reports confirms SuperAgent as orchestrator
- Widgets follow identical scaffold (import order, `/* ───── DATA ───── */` separators) suggesting system prompt template

### Output Ceiling

Reports B (161K) and C (155K) cluster at similar zip sizes. Widget sizes in Report C are remarkably uniform (506-685 lines, 8 of 10 widgets). This suggests a **per-component or total output token limit** in v0.app's generation, estimated at ~550K total output or ~350K generated content.

---

## What Further Analysis Could Change

### More Reports Would Clarify

1. **Architecture selection criteria**: Is the monolithic→four-tier progression an evolution of v0.app over time, or does the system choose architecture based on content complexity? Analyzing 5-10 more reports would reveal the pattern.

2. **Design system generation**: Are "Royal Blue Corporate" and "Soft Brutalism" from a finite set of presets, or can the system generate arbitrary design languages? Reports with explicitly different style requests would test this.

3. **Visualization library selection**: B uses D3, C uses react-simple-maps, both use Recharts. Is library choice driven by widget type (force graphs → D3, maps → react-simple-maps) or by some other factor? More reports with geographic or graph visualizations would clarify.

4. **Output ceiling**: Two data points (155K, 161K) suggest a limit but don't confirm it. Reports that attempted more complex content might show truncation, simplified widgets, or fewer sections.

5. **Template bundle evolution**: Report A has only 3 UI components while B and C have 57. Is this because A used an older template, or because simple reports get a stripped bundle? More reports from different time periods would answer this.

### Server-Side Evidence Would Confirm

6. **System prompts**: The identical widget scaffold pattern strongly implies a detailed system prompt, but we've only inferred its existence from output patterns. Seeing the actual prompts would confirm the scaffold template and reveal any instructions we've missed.

7. **Research/RAG pipeline**: Cross-file data consistency proves a shared data context, but we don't know whether it comes from RAG, web search, Airtable data, or user-provided documents. Access to the orchestration layer would clarify.

8. **Multi-agent execution**: Report A's git history proves parallel agents. We can't determine from B and C's atomic exports whether they also used parallel agents or single-pass generation. Server logs would resolve this.

9. **GML vs v0.app relationship**: The chat UI uses GML markup; exports use React/JSX. We hypothesize these are separate rendering paths (chat preview vs standalone export). Seeing the routing logic would confirm whether GML content is ever compiled to React or always interpreted.

### What's Unlikely to Change

- **Template bundle is frozen and static** — confirmed by byte-identical comparison
- **v0.app is the code generation engine, SuperAgent is the orchestrator** — multiple watermarks confirm
- **Reports are atomic exports, not interactive builds** — timestamp evidence is conclusive for B and C
- **shadcn/ui customizations are SuperAgent's own design system** — 8 custom components + data-slot attributes confirm deliberate engineering, not default output

---

## Document Status

| Document | Status | Coverage |
|----------|--------|----------|
| `INDEX.md` | **This document** | Master index, cross-report synthesis, open questions |
| `TAILWIND_THEME_EXTRACTION.md` | Complete | Chat UI CSS theme (277 variables) |
| `FONT_AND_ASSET_EXTRACTION.md` | Complete | Chat UI fonts (Seasons Sans, 12 weights) and assets |
| `GML_CSS_EXTRACTION.md` | Complete | Chat UI GML styling (40+ rules, CVA variants) |
| `JS_DESIGN_TOKENS.md` | Complete | Chat UI JS tokens, Plotly schemas, streaming events |
| `GML_REPORT_RENDERING_PATTERNS.md` | Complete | Chat UI GML rendering pipeline and healer system |
| `SUPERAGENT_REPORT_ANALYSIS.md` | Complete | Report B deep dive (DMN-Ontology, 11 viz components) |
| `REPORT_C_ANALYSIS.md` | Complete | Report C deep dive (AAPL/MSFT/GOOG, Soft Brutalism, 10 widgets) |
| `GENERATION_PIPELINE.md` | Complete | Reverse-engineered 7-stage pipeline, template forensics, multi-agent evidence |
