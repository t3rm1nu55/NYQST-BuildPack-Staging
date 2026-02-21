# Technical Deep-Dive: GML Healer, Chart Schemas, Streaming Protocol

> **Date**: 2026-02-18
> **Sources**: Reverse-engineered from Superagent JS bundles and existing analysis docs
> **Primary bundle files**:
> - `extracted/Superagent/0053_1889-c64cad4788e7b7b9.js` — GML renderer + chart components
> - `extracted/Superagent/0055_774-e1971e2500ea1c79.js` — Streaming Zod schemas + stream connection
> - `extracted/Superagent/0027__app-7122b4604941924b.js` — Core data models (PlanSet, Message, Entity)
> - `docs/GML_REPORT_RENDERING_PATTERNS.md` — Rendered analysis
> - `docs/JS_DESIGN_TOKENS.md` — Extracted tokens
> - `reports/02_streaming_protocol.md`, `reports/03_agent_orchestration_inference.md`

---

## AREA 1: GML Healer / Validator System

### 1.1 Width Constraint Table (CONFIRMED — source: `0053_1889`)

The healer uses two lookup objects extracted verbatim from the bundle:

**Width Enum (`T`):**
```typescript
type Width = "sidebar" | "primary" | "full_row" | "half";
```

**Healing Behavior Enum (`I`):**
```typescript
type HealingBehavior = "remove" | "hoist";
```

**Widget Widths Map (`M`) — exact source:**
```typescript
const WIDGET_WIDTHS: Record<string, { widths: Width[], healingBehavior?: HealingBehavior }> = {
  "gml-blockquote":           { widths: ["primary"] },
  "gml-chartcontainer":       { widths: ["primary"] },
  "gml-downloadfile":         { widths: [] },          // unrestricted
  "gml-gradientinsightbox":   { widths: ["primary"] },
  "gml-halfcolumn":           { widths: ["full_row"] },
  "gml-infoblockevent":       { widths: ["sidebar"] },
  "gml-infoblockmetric":      { widths: ["sidebar"] },
  "gml-infoblockstockticker": { widths: ["sidebar"] },
  "gml-inlinecitation":       { widths: [] },          // unrestricted (inline)
  "gml-primarycolumn":        { widths: ["full_row"] },
  "gml-row":                  { widths: [] },          // top-level, unrestricted
  "gml-sidebarcolumn":        { widths: ["full_row"] },
  "gml-viewreport":           { widths: [] },          // unrestricted
  // NOTE: gml-viewwebsite, gml-viewpresentation, gml-viewgenerateddocument
  // are NOT in the widths map — they are unrestricted
};
```

**Container Map (`P`) — exact source:**
```typescript
const WIDTH_TO_CONTAINER: Record<Width, string> = {
  full_row: "gml-row",
  half:     "gml-halfcolumn",
  primary:  "gml-primarycolumn",
  sidebar:  "gml-sidebarcolumn",
};
```

**Confidence: HIGH** — extracted directly from minified source, not inferred.

---

### 1.2 Healer Algorithm (CONFIRMED — verbatim logic from `0053_1889`)

The healer is the `L` function. It uses `unified`/`hast`'s `visit` (module `z.VG`) to walk the AST:

```typescript
// Pseudocode reconstructed from minified JS (L function)
function healGML(tree: HastNode): void {
  const mutations: Array<
    | { type: "hoist"; parent: HastNode; index: number; newParent: HastNode }
    | { type: "remove"; parent: HastNode; index: number }
  > = [];

  visit(tree, "element", (node, ancestors) => {
    const config = WIDGET_WIDTHS[node.tagName];

    // Skip: tag not in registry, or has no width constraints (widths=[])
    if (!config || config.widths.length === 0) return;

    // Check if the node's ancestors already satisfy all required width constraints
    const elementAncestors = ancestors.filter(a => a.type === "element");
    const ancestorTagNames = elementAncestors.map(a => a.tagName);

    // If ALL required parents are present → node is valid, do nothing
    if (config.widths.every(w => ancestorTagNames.includes(WIDTH_TO_CONTAINER[w]))) return;

    const immediateParent = ancestors[ancestors.length - 1];
    const indexInParent = immediateParent.children.indexOf(node);

    if (indexInParent === -1) return;

    // Determine healing behavior: node.properties.healing_behavior ?? config.healingBehavior ?? "hoist"
    const behavior = node.properties?.healing_behavior ?? config.healingBehavior ?? "hoist";

    if (behavior === "hoist") {
      // Try to find a valid ancestor to reparent into
      let targetAncestor: HastNode | undefined;

      // Walk ancestors from closest to root, find one that satisfies width requirements
      for (let i = elementAncestors.length - 1; i >= 0; i--) {
        const ancestorSubset = elementAncestors.slice(0, i + 1).map(a => a.tagName);
        if (config.widths.every(w => ancestorSubset.includes(WIDTH_TO_CONTAINER[w]))) {
          targetAncestor = elementAncestors[i];
          break;
        }
      }

      // Fallback: look for gml-row in siblings, then find required container child of it
      if (!targetAncestor) {
        const siblingRow = elementAncestors.find(a => a.tagName === "gml-row");
        if (siblingRow && isElement(siblingRow)) {
          const requiredContainerTags = config.widths.map(w => WIDTH_TO_CONTAINER[w]);
          const containerChild = siblingRow.children.find(
            c => isElement(c) && requiredContainerTags.includes(c.tagName)
          );
          if (containerChild) targetAncestor = containerChild;
        }
      }

      if (targetAncestor) {
        mutations.push({ type: "hoist", parent: immediateParent, index: indexInParent, newParent: targetAncestor });
        return;
      }
    }

    // Fallback: remove the node
    mutations.push({ type: "remove", parent: immediateParent, index: indexInParent });
  });

  // Apply mutations in REVERSE order (to preserve indexes)
  for (const mutation of mutations.reverse()) {
    if (mutation.type === "remove") {
      mutation.parent.children.splice(mutation.index, 1);
    } else if (mutation.type === "hoist" && mutation.newParent) {
      const [node] = mutation.parent.children.splice(mutation.index, 1);
      if (node) mutation.newParent.children.push(node);
    }
  }
}
```

**Key algorithmic details:**
- Traversal: `unified/hast visit()` — operates on parsed HTML AST
- Mutations collected first, applied in reverse order (critical for index stability)
- Hoist target: searches from innermost valid ancestor outward, then falls back to a `gml-row` sibling's child
- Per-node override: `node.properties.healing_behavior` can override the default ("hoist")
- Tags with `widths: []` are SKIPPED — they can go anywhere

**Confidence: HIGH** — algorithm logic is exact from minified source.

---

### 1.3 Algorithm Flow: Parse → Validate → Heal → Render

```
1. INPUT: Raw GML string (from LLM stream or node_report_preview_done.content)

2. PARSE: unified() + rehype-parse + custom GML tag handling
   → Produces hast (Hypertext Abstract Syntax Tree)

3. HEAL: L(tree) runs the healer
   → Visits all elements
   → Identifies width-constraint violations
   → Collects hoist/remove mutations
   → Applies mutations in reverse order

4. SANITIZE: unified sanitization (via unified/hast, not full DOMPurify)

5. RENDER: hast-to-jsx with component registry
   → GML tags resolved to React components via registry
   → Standard HTML tags rendered natively
   → gml-inlinecitation resolved to entity lookup
   → gml-chartcontainer renders Plotly (via eM schema validation)

6. OUTPUT: React component tree displayed in chat
```

---

### 1.4 GML Component Registry (CONFIRMED — from `0053_1889`)

All registered GML tags and their entity_type validation:

| Tag | Entity Type Required | Notes |
|-----|---------------------|-------|
| `gml-row` | none | Renders `<div class="flex flex-col @3xl:flex-row flex-wrap gml-row">` |
| `gml-primarycolumn` | none | `w-full @3xl:w-3/4 gap-[20px] @3xl:pr-5 gml-primarycolumn` |
| `gml-sidebarcolumn` | none | Wraps each child in `<div class="w-full">`; subsequent children get `mt-7` |
| `gml-halfcolumn` | none | `<div class="flex-2 max-w-[50%]">` |
| `gml-viewreport` | `GENERATED_REPORT` | Loads report content, opens slide-out on click |
| `gml-viewwebsite` | `WEBSITE` | |
| `gml-viewpresentation` | `GENERATED_PRESENTATION` | |
| `gml-viewgenerateddocument` | `GENERATED_DOCUMENT` | |

Props schema for view tags:
```typescript
z.object({ identifier: z.string().optional() })
```

---

### 1.5 Error Recovery Patterns

- **Invalid entity_type**: `gml-viewreport` logs a warning and returns `null` (renders nothing)
- **Missing parsedProps or citationData**: returns `null` with a logged warning
- **Chart render error**: `eP` component renders a red-bordered error box with `"text-2xl"` heading
- **Heal failure (no valid target)**: widget is **removed** from output entirely (silent removal, no error thrown)
- **Unrecognized tag**: not in registry → passed through as standard HTML element (no error)

**Confidence: HIGH** for heal/remove. MEDIUM for error boundary details (exact copy not captured).

---

### 1.6 Pydantic Equivalents for Our Python Stack

```python
from enum import Enum
from typing import Literal, Optional
from pydantic import BaseModel


class WidthEnum(str, Enum):
    SIDEBAR = "sidebar"
    PRIMARY = "primary"
    FULL_ROW = "full_row"
    HALF = "half"


class HealingBehavior(str, Enum):
    REMOVE = "remove"
    HOIST = "hoist"


class WidgetConfig(BaseModel):
    widths: list[WidthEnum]
    healing_behavior: Optional[HealingBehavior] = None


WIDGET_WIDTHS: dict[str, WidgetConfig] = {
    "gml-blockquote":           WidgetConfig(widths=[WidthEnum.PRIMARY]),
    "gml-chartcontainer":       WidgetConfig(widths=[WidthEnum.PRIMARY]),
    "gml-downloadfile":         WidgetConfig(widths=[]),
    "gml-gradientinsightbox":   WidgetConfig(widths=[WidthEnum.PRIMARY]),
    "gml-halfcolumn":           WidgetConfig(widths=[WidthEnum.FULL_ROW]),
    "gml-infoblockevent":       WidgetConfig(widths=[WidthEnum.SIDEBAR]),
    "gml-infoblockmetric":      WidgetConfig(widths=[WidthEnum.SIDEBAR]),
    "gml-infoblockstockticker": WidgetConfig(widths=[WidthEnum.SIDEBAR]),
    "gml-inlinecitation":       WidgetConfig(widths=[]),
    "gml-primarycolumn":        WidgetConfig(widths=[WidthEnum.FULL_ROW]),
    "gml-row":                  WidgetConfig(widths=[]),
    "gml-sidebarcolumn":        WidgetConfig(widths=[WidthEnum.FULL_ROW]),
    "gml-viewreport":           WidgetConfig(widths=[]),
}

WIDTH_TO_CONTAINER: dict[WidthEnum, str] = {
    WidthEnum.FULL_ROW: "gml-row",
    WidthEnum.HALF:     "gml-halfcolumn",
    WidthEnum.PRIMARY:  "gml-primarycolumn",
    WidthEnum.SIDEBAR:  "gml-sidebarcolumn",
}
```

**Implementation note**: The healer runs on the frontend (React). For our Python stack, we can either:
1. Run it server-side before storing the report content (using `lxml` or `html.parser` to build an element tree, then walk and mutate it)
2. Ship the healer logic to the React frontend using the same algorithm
3. Use structured output from the LLM to generate GML programmatically (no healing needed)

---

## AREA 2: Chart Zod Schemas (10 Types)

### 2.1 Chart Type Enum (CONFIRMED — source: `0053_1889`)

```typescript
type ChartType =
  | "bar"
  | "scatter"
  | "line"
  | "bubble"
  | "histogram"
  | "box"
  | "candlestick"
  | "stacked_bar"
  | "clustered_column"
  | "donut";
```

Note: "treemap", "sankey", and "heatmap" do NOT appear in the bundle. The 10 types above are the confirmed set.

**Confidence: HIGH** — directly from `z.enum([...])` in source.

---

### 2.2 Complete Schema Hierarchy (TypeScript — from Zod sources)

All schema objects below are extracted from `0053_1889-c64cad4788e7b7b9.js`. Variable names match the minified bundle.

#### Font (`ej`)
```typescript
interface Font {
  color?: string;
  family?: string;
  size?: number;
}
```

#### Title (`e_`)
```typescript
interface TitleConfig {
  text: string;          // required
  font?: Font;
  x?: number;
  xanchor?: "auto" | "left" | "center" | "right";
  y?: number;
  yanchor?: "auto" | "bottom" | "middle" | "top";
}
```

#### Margin (`eN`)
```typescript
interface MarginConfig {
  b?: number;   // bottom
  l?: number;   // left
  pad?: number;
  r?: number;   // right
  t?: number;   // top
}
```

#### Legend (`ek`)
```typescript
interface LegendConfig {
  orientation?: "v" | "h";
  x?: number;
  xanchor?: "auto" | "left" | "center" | "right";
  y?: number;
  yanchor?: "auto" | "top" | "middle" | "bottom";
}
```

#### RangeSelector (`eE`)
```typescript
interface RangeSelector {
  buttons: any[];  // z.array(z.any())
}
```

#### RangeSlider (`eC`)
```typescript
interface RangeSlider {
  visible: boolean;
}
```

#### X-Axis (`eS`)
```typescript
interface XAxisConfig {
  autorange?: boolean;
  dtick?: number | string;
  range?: (number | string)[];
  rangeselector?: RangeSelector;
  rangeslider?: RangeSlider;
  showgrid?: boolean;
  tick0?: number | string;
  tickangle?: number;
  tickformat?: string;
  tickmode?: "auto" | "linear" | "array";
  title?: string | { text: string };
  type?: "linear" | "log" | "date" | "category";
  zeroline?: boolean;
}
```

#### Y-Axis (`ez`)
```typescript
interface YAxisConfig {
  autorange?: boolean;
  dtick?: number | string;
  range?: (number | string)[];
  showgrid?: boolean;
  tick0?: number | string;
  tickformat?: string;
  tickmode?: "auto" | "linear" | "array";
  title?: string | { text: string };
  type?: "linear" | "log" | "date" | "category";
  zeroline?: boolean;
  // NOTE: no rangeselector/rangeslider/tickangle on y-axis
}
```

#### Layout (`eR`)
```typescript
interface LayoutConfig {
  autosize?: boolean;
  bargap?: number;
  bargroupgap?: number;
  barmode?: "stack" | "group" | "overlay" | "relative";
  hovermode?: "closest" | "x" | "y" | false | "x unified" | "y unified";
  legend?: LegendConfig;
  margin?: MarginConfig;
  paper_bgcolor?: string;
  plot_bgcolor?: string;
  showlegend?: boolean;
  title?: TitleConfig;
  xaxis?: XAxisConfig;
  yaxis?: YAxisConfig;
}
```

#### ErrorBar Constant/Percent (`eA`)
```typescript
interface ErrorBarConstant {
  type: "constant" | "percent";  // required
  color?: string;
  symmetric?: boolean;
  thickness?: number;
  value?: number;
  valueminus?: number;
  visible?: boolean;
  width?: number;
}
```

#### ErrorBar Data (`eI`)
```typescript
interface ErrorBarData {
  type: "data";  // literal
  color?: string;
  symmetric?: boolean;
  thickness?: number;
  visible?: boolean;
  width?: number;
  // NOTE: no value/valueminus — data comes from DataPoint.error_x_value/error_y_value fields
}
```

#### Data Point (`eT`)
```typescript
interface DataPoint {
  x: number | string;     // string validated as ISO date OR category string
  y?: number | null;
  // Candlestick fields:
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  // Scatter/Bubble fields:
  label?: string;
  marker_color?: number | string;
  marker_size?: number;
  // Error bar fields:
  error_x_value?: number;
  error_x_value_minus?: number;
  error_y_value?: number;
  error_y_value_minus?: number;
}
```

**Important**: `x` accepts `number`, ISO date string (validated with `!isNaN(Date.parse(e))`), or any other string (category). Priority: number → ISO date → category.

#### Data Trace (`eD`)
```typescript
interface DataTrace {
  name: string;             // required
  type: ChartType;          // required
  data: DataPoint[];        // required
  x_type?: "number" | "datetime" | "category";  // override x-axis type detection
  error_x?: ErrorBarConstant | ErrorBarData;
  error_y?: ErrorBarConstant | ErrorBarData;
  marker_colorbar_title?: string;
  marker_colorscale?: string | [number, string][];
  marker_showscale?: boolean;
}
```

#### Chart Object (`eM`) — the top-level schema passed via `gml-chartcontainer`
```typescript
interface ChartObject {
  data: DataTrace[];        // required
  layout?: LayoutConfig;
  title?: string;
  citation?: {
    citation_number: number;
    citation_on_click: any;
    citation_title?: string;
    entity?: Entity;        // optional Entity reference
  };
}
```

**Confidence: HIGH** — all schemas extracted directly from Zod definitions.

---

### 2.3 The HSLA Color Palette (CONFIRMED — source: `0053_1889`)

```typescript
// 6-stop teal palette (eb) — used for donut/pie charts
const DONUT_COLORS = [
  "hsla(186, 60%, 20%, 1)",  // darkest teal
  "hsla(186, 54%, 36%, 1)",  // dark teal
  "hsla(186, 44%, 43%, 1)",  // mid teal
  "hsla(186, 44%, 58%, 1)",  // light-mid teal
  "hsla(186, 53%, 65%, 1)",  // light teal
  "hsla(185, 50%, 80%, 1)",  // lightest teal
];

// 2-stop teal palette (ey) — used for stacked_bar and clustered_column
const BAR_COLORS = [
  "hsla(186, 54%, 36%, 1)",  // dark teal
  "hsla(185, 50%, 80%, 1)",  // light teal
];

// Default line color (ew) — used for line charts (positive trend)
const LINE_COLOR_POSITIVE = "hsla(103, 40%, 43%, 1)";  // green

// Negative trend colors (line charts, area fill)
const LINE_COLOR_NEGATIVE = "hsla(9, 90%, 48%, 1)";  // red-orange
const AREA_FILL_POSITIVE_START = "hsla(103, 40%, 43%, 0)";    // green transparent
const AREA_FILL_POSITIVE_END   = "hsla(103, 40%, 43%, 0.32)"; // green 32% opacity
const AREA_FILL_NEGATIVE_START = "hsla(9, 90%, 48%, 0)";      // red transparent
const AREA_FILL_NEGATIVE_END   = "hsla(0, 65%, 55%, 0.32)";   // red 32% opacity
```

**Confidence: HIGH**

---

### 2.4 Chart Rendering Logic Per Type (CONFIRMED — full switch statement)

The renderer maps the `DataTrace.type` to Plotly trace config:

```typescript
// line
case "line": {
  const isDecline = lastValue < firstValue;
  plotlyTrace = {
    type: "scatter",
    mode: "lines",              // "lines+markers" if data.length <= 1
    name: trace.name,
    x: xValues,                 // dates if x_type="datetime"
    y: trace.data.map(d => d.y),
    fill: "tozeroy",
    fillgradient: {
      type: "vertical",
      colorscale: [
        [0, isDecline ? AREA_FILL_NEGATIVE_START : AREA_FILL_POSITIVE_START],
        [1, isDecline ? AREA_FILL_NEGATIVE_END   : AREA_FILL_POSITIVE_END],
      ],
      start: layout?.yaxis?.range?.[0],
      stop:  layout?.yaxis?.range?.[1],
    },
    line: { color: isDecline ? LINE_COLOR_NEGATIVE : LINE_COLOR_POSITIVE },
  };
  titleMode = "line-title";
  break;
}

// scatter
case "scatter": {
  plotlyTrace = {
    type: "scatter",
    mode: "text+markers",
    name: trace.name,
    cliponaxis: false,
    x: xValues,
    y: trace.data.map(d => d.y),
    text: trace.data.map(d => d.label ?? d.y?.toString() ?? ""),
    textposition: "top center",
    marker: {
      color: trace.data.map(d => d.marker_color ?? d.y),
      colorscale: trace.marker_colorscale ?? "Blues",
      showscale: trace.marker_showscale ?? false,
      colorbar: trace.marker_colorbar_title ? {
        title: { text: trace.marker_colorbar_title },
        len: 1, orientation: "h", outlinewidth: 0,
        thickness: 6, x: 0.5, xanchor: "center", y: -0.3, yanchor: "top",
      } : undefined,
    },
  };
  break;
}

// bubble
case "bubble": {
  plotlyTrace = {
    type: "scatter",
    mode: "markers",
    name: trace.name,
    x: xValues,
    y: trace.data.map(d => d.y),
    marker: { size: trace.data.map(d => d.marker_size) },
  };
  break;
}

// stacked_bar (index = trace position in data array)
case "stacked_bar": {
  plotlyTrace = {
    type: "bar",
    name: trace.name,
    x: xValues,
    y: trace.data.map(d => d.y),
    marker: { color: BAR_COLORS[index % BAR_COLORS.length] },
  };
  layout = { ...layout, barmode: "stack" };
  break;
}

// clustered_column
case "clustered_column": {
  plotlyTrace = {
    type: "bar",
    name: trace.name,
    x: xValues,
    y: trace.data.map(d => d.y),
    marker: { color: BAR_COLORS[index % BAR_COLORS.length] },
  };
  layout = { ...layout, barmode: "group" };
  break;
}

// donut
case "donut": {
  plotlyTrace = {
    type: "pie",
    name: trace.name,
    hole: 0.4,
    hoverinfo: "label+value",
    textinfo: "label",
    labels: xValues.map(x => (typeof x === "string" ? x : String(x))),
    values: trace.data.map(d => d.y),
    marker: { colors: DONUT_COLORS },
  };
  layout = { ...layout, showlegend: true };
  break;
}

// bar
case "bar": {
  plotlyTrace = {
    type: "bar",
    name: trace.name,
    x: xValues,
    y: trace.data.map(d => d.y),
  };
  break;
}

// histogram
case "histogram": {
  plotlyTrace = {
    type: "histogram",
    x: xValues,
    // NOTE: no name, no y — histogram uses only x
  };
  break;
}

// box
case "box": {
  plotlyTrace = {
    type: "box",
    name: trace.name,
    x: xValues,
    y: trace.data.map(d => d.y),
  };
  break;
}

// candlestick
case "candlestick": {
  plotlyTrace = {
    type: "candlestick",
    name: trace.name,
    x: xValues,
    open:  trace.data.map(d => d.open),
    high:  trace.data.map(d => d.high),
    low:   trace.data.map(d => d.low),
    close: trace.data.map(d => d.close),
  };
  break;
}

// default (fallback for unknown types)
default: {
  plotlyTrace = {
    type: "scatter",
    mode: "lines",
    name: trace.name,
    x: xValues,
    y: trace.data.map(d => d.y),
    line: { color: LINE_COLOR_POSITIVE },
  };
}
```

**x_type detection logic** (runs before the switch):
```typescript
// Auto-detect if x_type is not set
if (!trace.x_type) {
  const firstX = trace.data[0]?.x;
  if (typeof firstX === "number") {
    trace.x_type = "number";
  } else if (typeof firstX === "string" && !isNaN(Date.parse(firstX))) {
    trace.x_type = "datetime";
  } else {
    trace.x_type = "category";
  }
}

// Convert x values
const xValues = trace.data.map(d =>
  trace.x_type === "datetime" ? new Date(d.x) : d.x
);
```

---

### 2.5 Plotly Config Object (CONFIRMED)

```typescript
const plotlyConfig = {
  displayModeBar: false,  // hides the Plotly toolbar
  displaylogo: false,     // hides Plotly logo
};
```

---

### 2.6 ChartContainer Component Interface

```typescript
// gml-chartcontainer props (raw from GML attribute)
interface ChartContainerProps {
  props: string;  // JSON-encoded ChartObject (eM schema)
}

// ChartContainer styling
// Container: "my-5 relative min-h-112"
// Card:      "border flex flex-col justify-center p-0 ... max-h-[320px] aspect-[41/29]"
// Plotly wrapper: className="w-full"
```

---

### 2.7 Error Bar Post-Processing

After the chart type switch, error bars are applied:
```typescript
if (trace.error_x) {
  const eb = trace.error_x;
  plotlyTrace.error_x = {
    type: eb.type === "data" ? "data" : eb.type,
    visible: eb.visible ?? true,
    symmetric: eb.symmetric,
    color: eb.color,
    thickness: eb.thickness,
    width: eb.width,
    // data type: use DataPoint fields
    ...(eb.type === "data" ? {
      array:      trace.data.map(d => d.error_x_value),
      arrayminus: trace.data.map(d => d.error_x_value_minus),
    } : {
      value:      eb.value,
      valueminus: eb.valueminus,
    }),
  };
}
// Same pattern for error_y
```

---

### 2.8 Pydantic Equivalents for Chart Schemas

```python
from typing import Literal, Union, Optional, Any
from pydantic import BaseModel, field_validator


ChartType = Literal[
    "bar", "scatter", "line", "bubble", "histogram",
    "box", "candlestick", "stacked_bar", "clustered_column", "donut"
]

XType = Literal["number", "datetime", "category"]


class DataPoint(BaseModel):
    x: Union[float, str]   # number, ISO date, or category string
    y: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None
    label: Optional[str] = None
    marker_color: Optional[Union[float, str]] = None
    marker_size: Optional[float] = None
    error_x_value: Optional[float] = None
    error_x_value_minus: Optional[float] = None
    error_y_value: Optional[float] = None
    error_y_value_minus: Optional[float] = None


class ErrorBarConstant(BaseModel):
    type: Literal["constant", "percent"]
    color: Optional[str] = None
    symmetric: Optional[bool] = None
    thickness: Optional[float] = None
    value: Optional[float] = None
    valueminus: Optional[float] = None
    visible: Optional[bool] = None
    width: Optional[float] = None


class ErrorBarData(BaseModel):
    type: Literal["data"]
    color: Optional[str] = None
    symmetric: Optional[bool] = None
    thickness: Optional[float] = None
    visible: Optional[bool] = None
    width: Optional[float] = None


class DataTrace(BaseModel):
    name: str
    type: ChartType
    data: list[DataPoint]
    x_type: Optional[XType] = None
    error_x: Optional[Union[ErrorBarConstant, ErrorBarData]] = None
    error_y: Optional[Union[ErrorBarConstant, ErrorBarData]] = None
    marker_colorbar_title: Optional[str] = None
    marker_colorscale: Optional[Union[str, list[tuple[float, str]]]] = None
    marker_showscale: Optional[bool] = None


class MarginConfig(BaseModel):
    b: Optional[float] = None
    l: Optional[float] = None
    pad: Optional[float] = None
    r: Optional[float] = None
    t: Optional[float] = None


class LegendConfig(BaseModel):
    orientation: Optional[Literal["v", "h"]] = None
    x: Optional[float] = None
    xanchor: Optional[Literal["auto", "left", "center", "right"]] = None
    y: Optional[float] = None
    yanchor: Optional[Literal["auto", "top", "middle", "bottom"]] = None


class FontConfig(BaseModel):
    color: Optional[str] = None
    family: Optional[str] = None
    size: Optional[float] = None


class TitleConfig(BaseModel):
    text: str
    font: Optional[FontConfig] = None
    x: Optional[float] = None
    xanchor: Optional[Literal["auto", "left", "center", "right"]] = None
    y: Optional[float] = None
    yanchor: Optional[Literal["auto", "bottom", "middle", "top"]] = None


class AxisConfig(BaseModel):
    autorange: Optional[bool] = None
    dtick: Optional[Union[float, str]] = None
    range: Optional[list[Union[float, str]]] = None
    showgrid: Optional[bool] = None
    tick0: Optional[Union[float, str]] = None
    tickformat: Optional[str] = None
    tickmode: Optional[Literal["auto", "linear", "array"]] = None
    title: Optional[Union[str, dict]] = None
    type: Optional[Literal["linear", "log", "date", "category"]] = None
    zeroline: Optional[bool] = None


class LayoutConfig(BaseModel):
    autosize: Optional[bool] = None
    bargap: Optional[float] = None
    bargroupgap: Optional[float] = None
    barmode: Optional[Literal["stack", "group", "overlay", "relative"]] = None
    hovermode: Optional[Union[Literal["closest", "x", "y", "x unified", "y unified"], bool]] = None
    legend: Optional[LegendConfig] = None
    margin: Optional[MarginConfig] = None
    paper_bgcolor: Optional[str] = None
    plot_bgcolor: Optional[str] = None
    showlegend: Optional[bool] = None
    title: Optional[TitleConfig] = None
    xaxis: Optional[AxisConfig] = None
    yaxis: Optional[AxisConfig] = None


class ChartCitation(BaseModel):
    citation_number: int
    citation_on_click: Any
    citation_title: Optional[str] = None
    entity: Optional[Any] = None  # Entity model


class ChartObject(BaseModel):
    data: list[DataTrace]
    layout: Optional[LayoutConfig] = None
    title: Optional[str] = None
    citation: Optional[ChartCitation] = None
```

---

### 2.9 Gaps / Unknowns

- `treemap`, `sankey`, `heatmap` are NOT in the confirmed 10 types — if seen, will hit the default fallback
- `scatter` chart has a hover interaction that checks `data.type === "scatter"` with `data.fill === "tozeroy"` (the line chart behavior) — indicates line uses scatter type under the hood
- How chart data is passed from LLM: the LLM emits `gml-chartcontainer props='<JSON>'` — the JSON is the `ChartObject`. The LLM must produce the full Plotly-compatible config. No intermediate transformation from a "chart description" format is visible.

---

## AREA 3: Streaming Protocol Implementation

### 3.1 NDJSON Envelope Format (CONFIRMED — source: `0055_774`)

```typescript
// The Zod schema: q = p.z.object({data: Q, timestamp: p.z.number()})
interface StreamEnvelope {
  data: StreamEvent;   // discriminated union, validated with Zod
  timestamp: number;   // Unix milliseconds
}
```

Each line of the NDJSON stream is one JSON object matching this envelope. Lines are split on `\n`.

**Request format:**
```
GET /api/chat/message/stream?message_stream_id=<id>
Connection: keep-alive
cache-control: no-cache
X-Gradient-Browser-Client: 1
X-Gradient-Workspace-Id: <workspace_id>  (optional)
credentials: include  (cookie auth)
```

---

### 3.2 Complete Zod Schemas for All 22 Event Types (CONFIRMED)

All event types extend a base object `y` (which contains `chat_id` and `workspace_id` fields — not visible in the individual events shown, implying `y` may be minimal or just used for `.extend()`).

**Ordering in discriminated union `Q` (exact order from bundle):**
`[b, f, S, x, I, T, R, E, O, N, M, j, U, F, A, w, h, z, v, k, C, D]`

```typescript
// b — stream_start
interface StreamStart {
  type: "stream_start";
  chat_id: string;
  creator_user_id: string;
  user_chat_message_id: string;
  workspace_id: string;
}

// f — task_update
interface TaskUpdate {
  type: "task_update";
  key: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  plan_set: PlanSet;       // full PlanSet object
  status: "error" | "loading" | "success";
  title: string;
}

// S — message_delta
interface MessageDelta {
  type: "message_delta";
  delta: string;           // incremental text token
}

// x — references_found
interface ReferencesFound {
  type: "references_found";
  references: Entity[];    // array of Entity (pe schema)
}

// I — pending_sources
interface PendingSources {
  type: "pending_sources";
  pending_sources: PendingSource[];
}

// T — done
interface Done {
  type: "done";
  has_async_entities_pending?: boolean;
  message?: Message;       // final Message object (cM schema)
}

// R — ERROR
interface StreamError {
  type: "ERROR";
  error_message: string;
  error_type: string;
}

// E — chat_title_generated
interface ChatTitleGenerated {
  type: "chat_title_generated";
  title: string;
}

// O — clarification_needed
interface ClarificationNeeded {
  type: "clarification_needed";
  message: Message;
}

// N — ai_message
interface AiMessage {
  type: "ai_message";
  message: Message;
}

// M — message_is_answer
interface MessageIsAnswer {
  type: "message_is_answer";
  is_answer: boolean;
}

// j — browser_use_start
interface BrowserUseStart {
  type: "browser_use_start";
  browser_session_id: string;
  browser_stream_url: string;
  timestamp: number;
}

// U — browser_use_stop
interface BrowserUseStop {
  type: "browser_use_stop";
  browser_session_id: string;
}

// F — browser_use_await_user_input
interface BrowserUseAwaitUserInput {
  type: "browser_use_await_user_input";
  browser_session_id: string;
  agent_message?: string | null;
}

// A — heartbeat
interface Heartbeat {
  type: "heartbeat";
}

// w — node_tool_event
interface NodeToolEvent {
  type: "node_tool_event";
  event: string;
  metadata?: Record<string, unknown>;
  node_id: string;
  plan_id: string;
  plan_set_id: string;
  timestamp: number;
  tool_id?: string | null;
  tool_type?: string | null;
}

// h — node_report_preview_start
interface NodeReportPreviewStart {
  type: "node_report_preview_start";
  entity: Entity;           // Dy (GENERATED_REPORT entity)
  final_report: boolean;
  node_id: string;
  plan_id: string;
  plan_set_id: string;
  preview_id: string;
  report_title: string;
  report_user_query: string;
  section_id?: string | null;
  timestamp: number;
  tool_id?: string | null;
  workspace_id: string;
}

// z — node_report_preview_delta
interface NodeReportPreviewDelta {
  type: "node_report_preview_delta";
  delta: string;
  node_id: string;
  plan_id: string;
  plan_set_id: string;
  preview_id: string;
  section_id?: string | null;
}

// v — node_report_preview_done
interface NodeReportPreviewDone {
  type: "node_report_preview_done";
  content: string;          // full GML content string
  entity?: Entity;
  final_report: boolean;
  node_id: string;
  plan_id: string;
  plan_set_id: string;
  preview_id: string;
  report_title: string;
  report_user_query: string;
  section_id?: string | null;
  timestamp: number;
  tool_id?: string | null;
  workspace_id: string;
}

// k — node_tools_execution_start
interface NodeToolsExecutionStart {
  type: "node_tools_execution_start";
  node_id: string;
  plan_id: string;
  plan_set_id: string;
  timestamp: number;
  tool_ids: string[];
  total_tools: number;
}

// C — update_message_clarification_message
interface UpdateMessageClarificationMessage {
  type: "update_message_clarification_message";
  update: {
    chat_message_id: string;
    needs_clarification_message: string | null;
  };
}

// D — update_subagent_current_action
interface UpdateSubagentCurrentAction {
  type: "update_subagent_current_action";
  current_action: string;
  node_id: string;
  plan_id: string;
  plan_set_id: string;
  timestamp: number;
  tool_id?: string | null;
}
```

**Confidence: HIGH** — all fields extracted from Zod `.extend()` and `.object()` calls in the bundle.

---

### 3.3 PlanSet / Plan / PlanTask Data Model (CONFIRMED — source: `0027__app`)

```typescript
// Status enum (p)
type PlanStatus = "LOADING" | "ERROR" | "SUCCESS";

// DeliverableType enum (y)
type DeliverableType = "REPORT" | "AUTOMATION" | "CODE" | "SLIDES" | "WEBSITE" | "DOCUMENT";

// MessageType enum (g)
type MessageType = "super_report" | "normal";

// PlanTask (m)
interface PlanTask {
  id: string;
  message: string;
  plan_id: string;
  previous_task_id: string | null;
  status: PlanStatus;
  title: string;
}

// Plan (v) — used internally with record<id, PlanTask>
interface Plan {
  id: string;
  plan_set_id: string;
  plan_tasks: Record<string, PlanTask>;  // key = task id
  previous_plan_id: string | null;
  status: PlanStatus;
  summary: string | null;
  title: string | null;
  used_sources: string[] | null;
}

// PlanSet (x) — the zx export, sent in task_update events
interface PlanSet {
  chat_id: string;
  creator_user_id: string;
  plans: Record<string, Plan>;  // key = plan id
  user_chat_message_id: string;
  workspace_id: string;
}

// Note: b = Plan variant with plan_tasks: PlanTask[] (array not record)
// This is the "flattened" form used in the array variant
// x.omit({plans:!0}).extend({plans: z.array(b)}) — PlanSet with array plans
```

**Confidence: HIGH**

---

### 3.4 PendingSource Schema (CONFIRMED)

```typescript
interface PendingSource {
  plan_id: string;
  plan_set_id: string;
  plan_task_id: string;
  title: string;
  type: "WEB" | "DOCUMENT" | "CODING_AGENT";
  web_domain: string | null;
}
```

---

### 3.5 Message Schema (cM / W — CONFIRMED)

```typescript
// ErrorType enum (q)
type ErrorType = "TIMEOUT" | "INVALID_RESPONSE";

// CreatorType enum (B)
type CreatorType = "AI" | "USER";

interface Message {
  id: string;                             // C.uk (UUID)
  creator_type: CreatorType;              // "AI" | "USER"
  created_at: Date;                       // transformed from ISO string
  is_answer: boolean;
  is_running: boolean | null;
  needs_clarification_message: string | null;
  ai_output_id: string | null;
  deliverable_type: DeliverableType | null;
  entities?: Entity[];
  error_type: ErrorType | null;
  event_stream_artifact_id: string | null;
  first_report_identifier: string | null;
  hydrated_content: string | null;
  message_type: MessageType | null;
  retry_attempts: number | null;
}
```

---

### 3.6 Entity Schema (pe / _ — CONFIRMED)

The Entity is a discriminated union on `entity_type`:

```typescript
// Base entity fields (o)
interface BaseEntity {
  content_artifact_id: string | null;
  content_length?: number;
  description: string | null;
  description_length?: number;
  created_at?: string | null;
  stored_entity_id?: string | null;
  entity_type: string;
  file_name: string;         // min length 3
  identifier: string;        // min length 1
  mimetype: string;          // min length 1
  purpose: string | null;
  purpose_length?: number;
  title: string | null;
  workspace_id: string;
}

type Entity =
  | WebPageEntity           // entity_type: "WEB_PAGE"
  | ExternalApiDataEntity   // entity_type: "EXTERNAL_API_DATA"
  | GeneratedContentEntity  // entity_type: "GENERATED_CONTENT"
  | UserQueryPartEntity     // entity_type: "USER_QUERY_PART"
  | GeneratedReportEntity   // entity_type: "GENERATED_REPORT"
  | IntraEntitySearchResult // entity_type: "INTRA_ENTITY_SEARCH_RESULT"
  | SearchPlanEntity        // entity_type: "SEARCH_PLAN"
  | KnowledgeBaseEntity     // entity_type: "KNOWLEDGE_BASE"
  | GeneratedPresentation   // entity_type: "GENERATED_PRESENTATION"
  | ExtractedEntity         // entity_type: "EXTRACTED_ENTITY"
  | WebsiteEntity           // entity_type: "WEBSITE"
  | GeneratedDocumentEntity // entity_type: "GENERATED_DOCUMENT"

interface WebPageEntity extends BaseEntity {
  entity_type: "WEB_PAGE";
  api_specific_metadata?: Record<string, any> | null;
  external_url: string;  // URL
}

interface ExternalApiDataEntity extends BaseEntity {
  entity_type: "EXTERNAL_API_DATA";
  api_name: string;
  api_specific_metadata?: Record<string, any> | null;
  api_subtype: string;
  external_url?: string | null;
}

interface GeneratedReportEntity extends BaseEntity {
  entity_type: "GENERATED_REPORT";
  all_seen_entities: string[];
  cited_entities: string[];
  report_subtype?: "final_report" | "scratch_pad" | "other" | null;
  user_query: string;
}

interface WebsiteEntity extends BaseEntity {
  entity_type: "WEBSITE";
  user_query: string;
  deployed_url?: string | null;
  demo_url?: string | null;
  cited_entities: string[];
  all_seen_entities: string[];
  chat_id: string;
  project_id: string;
  deployed: boolean;              // default: false
  generation_status: "in_progress" | "complete" | "failed";  // default: "complete"
  created_by_job: boolean | null; // default: null
}

interface GeneratedDocumentEntity extends BaseEntity {
  entity_type: "GENERATED_DOCUMENT";
  all_seen_entities: string[];    // default: []
  query: string;
  mimetype: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
```

**Data provider enum (`IN`):**
```typescript
type DataProvider = "brave" | "fin_doc" | "firecrawl" | "quartr" | "polygon" | "kalshi" | "crunchbase" | "fred" | "quiver";
```

---

### 3.7 Citation Buffering State Machine (CONFIRMED — verbatim from `0055_774`)

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
        this.isInCitation = false;
      }
      if (!this.isInCitation) {
        this.readyPointer = i;
      }
    }
    return prevReady !== this.readyPointer;
  }

  getReadyContent(): string {
    return this.buffer.slice(0, this.readyPointer + 1);
  }

  getFullContent(): string {
    return this.buffer;
  }
}
```

**State machine rules:**
- `[` → enter citation mode (stop advancing ready pointer)
- `]` → exit citation mode
- `\n` → ALSO exits citation mode (safety valve for malformed citations)
- Ready pointer advances only when NOT in citation mode
- `getReadyContent()` returns only the safely-displayable portion
- `getFullContent()` returns everything including in-progress citations

---

### 3.8 Stream Connection (Reconnect + Timeout — CONFIRMED)

```typescript
class TimeoutAbortController extends AbortController {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  wasTimeoutAbort: boolean = false;

  abort(reason?: any) {
    this.clearTimeout();
    this.wasTimeoutAbort = false;
    super.abort(reason);
  }

  abortAfterTimeout(reason?: string) {
    this.clearTimeout();
    this.wasTimeoutAbort = true;
    super.abort(reason ?? "Stream aborted after timeout");
  }

  abortWithTimeout(ms: number) {
    this.clearTimeout();
    this.wasTimeoutAbort = true;
    this.timeoutId = setTimeout(
      () => this.abortAfterTimeout(`Stream aborted after ${ms}ms timeout reached`),
      ms
    );
    return this.timeoutId;
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

// Stream connection function (exact logic)
function connectStream({ eventStreamId, onConnectionError, onEvent, onStreamEnd, onStreamNotFound, reconnectOnError = true }) {
  const url = `/api/chat/message/stream?message_stream_id=${eventStreamId}`;
  const controller = new TimeoutAbortController();
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
  let streamCompleted = false;

  // 30-second watchdog — reset on each chunk
  const resetWatchdog = () => {
    clearWatchdog();
    watchdogTimer = setTimeout(() => {
      controller.abortAfterTimeout();
      clearWatchdog();
    }, 30000);  // 30s exact
  };

  const connect = async () => {
    streamCompleted = false;
    try {
      const workspaceId = getWorkspaceId(); // from app state
      const headers: Record<string, string> = {
        Connection: "keep-alive",
        "X-Gradient-Browser-Client": "1",
        "cache-control": "no-cache",
      };
      if (workspaceId) headers["X-Gradient-Workspace-Id"] = workspaceId;

      const response = await fetch(url, {
        credentials: "include",
        headers,
        method: "GET",
        signal: controller.signal,
      });

      if (response.status === 404) {
        onStreamNotFound();
        onStreamEnd();
        return;
      }
      if (!response.ok || !response.body) throw new Error("No stream body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processBuffer = async (): Promise<boolean> => {
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIdx).trim();
          buffer = buffer.slice(newlineIdx + 1);
          if (!line) continue;

          // Parse and validate line
          const parsed = parseLine(line); // uses q.parse(JSON.parse(line)).data
          if (parsed) {
            // Reset retry count on successful non-error event
            if (parsed.event.type !== "ERROR") retryCount = 0;
            await onEvent(parsed);
            if (parsed.shouldEndStream) return true;
          }
        }
        return false;
      };

      let done = false;
      while (!done) {
        const { done: chunkDone, value } = await reader.read();
        resetWatchdog();  // reset 30s watchdog on each chunk
        done = chunkDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          if (await processBuffer()) done = true;
        }
      }

      clearWatchdog();
      streamCompleted = true;
      onStreamEnd();
    } catch (err) {
      // Don't retry if:
      // 1. Manual abort (not a timeout abort)
      // 2. Stream completed normally
      if (isManualAbort(err, controller) && !controller.wasTimeoutAbort) return;

      // Retry if partial data received (buffer not empty) and under retry limit
      if (!streamCompleted && buffer) {
        const nextRetry = retryCount + 1;
        if (nextRetry <= 5) {
          retryCount = nextRetry;
          const delay = Math.min(1000 * Math.pow(2, nextRetry - 1), 30000);
          // delays: 1s, 2s, 4s, 8s, 16s (capped at 30s)
          retryTimer = setTimeout(connect, delay);
          return;
        }
      }

      onConnectionError(new Error("Connection error with the event stream"));
      onStreamEnd();
    }
  };

  connect();

  return {
    abort: (reason?: string) => {
      streamCompleted = true;
      clearTimers();
      controller.abort(reason);
    },
    isConnected: () => !streamCompleted,
  };
}
```

**Retry schedule:**
| Retry # | Delay |
|---------|-------|
| 1       | 1,000ms  |
| 2       | 2,000ms  |
| 3       | 4,000ms  |
| 4       | 8,000ms  |
| 5       | 16,000ms |
| >5      | No retry → error |

**Max delay cap**: 30,000ms (but with 5 retries, never actually reached — max is 16s)

**Watchdog**: 30,000ms — fires on NO data arrival (distinct from retry which fires on connection drop)

---

### 3.9 Replay Mode (CONFIRMED — source: `0055_774`)

The replay stream is activated when `replayState === "playing"` AND `replayEvents` is non-null AND `finalReplayMessage` exists.

```typescript
function createReplayStream({ events, finalMessage, onEvent, onStreamEnd }) {
  let aborted = false;
  let eventIndex = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const playNextEvent = async () => {
    const event = events[eventIndex];

    if (aborted || !event) {
      if (!aborted) {
        // Synthesize terminal "done" event with stored final message
        await new Promise(r => setTimeout(r, 100));
        await onEvent({
          event: { data: { message: finalMessage, type: "done" }, timestamp: Date.now() }.data,
          shouldEndStream: true,
        });
        onStreamEnd();
      }
      return;
    }

    eventIndex++;
    try {
      // Heartbeats are played immediately (no delay)
      if (event.data.type === "heartbeat") {
        timer = setTimeout(playNextEvent, 0);
        return;
      }
      await onEvent({ event: event.data, shouldEndStream: false });
    } catch (e) {
      if (!aborted) console.error("[ReplayStream] Error during playback", e);
    }

    // 5ms between events (fast playback, but not instant)
    timer = setTimeout(playNextEvent, 5);
  };

  timer = setTimeout(playNextEvent, 0);

  return {
    abort: (reason?: string) => {
      aborted = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    isConnected: () => !aborted,
  };
}
```

**Key replay behaviors:**
- Heartbeats: replayed with 0ms delay (skipped effectively)
- All other events: 5ms apart
- Terminal "done": synthesized from `finalReplayMessage` (not replayed from stored event)
- Implies the backend stores: `events[]` (the NDJSON log) + `finalMessage` separately

---

### 3.10 How Events Map to React State (CONFIRMED — partial, from `0055_774`)

State variables maintained by `useGeneralChatStream`:

```typescript
const [currentMessage, setCurrentMessage] = useState<Message | null>(initialStreamedMessage);
const [planSet, setPlanSet] = useState<PlanSet | null>(null);
const [pendingSources, setPendingSources] = useState<PendingSource[]>([]);
const [entities, setEntities] = useState<Entity[]>([]);
const [nodeCurrentActions, setNodeCurrentActions] = useState<Record<string, string>>({});
const [reportPreviews, setReportPreviews] = useState<Record<string, ReportPreview>>({});
const [nodeToolsInfo, setNodeToolsInfo] = useState<Record<string, ToolInfo>>({});
const [subagentActions, setSubagentActions] = useState<Record<string, string>>({});
const [browserSession, setBrowserSession] = useState<BrowserSession | null>(null);
const [streamError, setStreamError] = useState<StreamError | null>(null);
```

**Event → state mapping (reconstructed from onEvent handler):**

| Event type | State updated |
|------------|---------------|
| `task_update` | `planSet` (full replacement) |
| `pending_sources` | `pendingSources` |
| `references_found` | `entities` (appended) |
| `message_delta` | `currentMessage.content` via CitationBuffer |
| `node_report_preview_start` | `reportPreviews[preview_id]` created |
| `node_report_preview_delta` | `reportPreviews[preview_id].content` appended |
| `node_report_preview_done` | `reportPreviews[preview_id]` finalized + entity attached |
| `node_tools_execution_start` | `nodeToolsInfo[plan_set_id+plan_id+node_id]` |
| `update_subagent_current_action` | `subagentActions[plan_set_id+plan_id+node_id]` |
| `browser_use_start` | `browserSession` |
| `browser_use_stop` | `browserSession = null` |
| `done` | finalization; `currentMessage` set from `done.message` |
| `ai_message` | `currentMessage` replaced |
| `chat_title_generated` | chat title updated |
| `clarification_needed` | triggers `onClarificationNeeded` callback |
| `heartbeat` | no-op |

**Node action key construction:**
```typescript
// From module L.t in 0055_774
function buildNodeKey(plan_set_id: string, plan_id: string, node_id: string): string {
  return `${plan_set_id}${plan_id}${node_id}`;  // simple concatenation
}
```

---

### 3.11 Python/FastAPI Implementation Notes

#### Server-Side Stream Emitter (FastAPI)

```python
import json
import asyncio
from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator

async def ndjson_stream(event_generator: AsyncGenerator) -> AsyncGenerator[bytes, None]:
    """Wrap events in NDJSON envelope format."""
    async for event in event_generator:
        envelope = {
            "data": event,
            "timestamp": int(datetime.utcnow().timestamp() * 1000)
        }
        yield (json.dumps(envelope) + "\n").encode()

@app.get("/api/chat/message/stream")
async def stream_chat(message_stream_id: str):
    return StreamingResponse(
        ndjson_stream(run_stream(message_stream_id)),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disable nginx buffering
        }
    )
```

#### Heartbeat (30s watchdog keep-alive)

```python
async def stream_with_heartbeat(generator, interval=20):
    """Send heartbeat every 20s to beat the 30s watchdog."""
    while True:
        try:
            event = await asyncio.wait_for(generator.__anext__(), timeout=interval)
            yield event
        except asyncio.TimeoutError:
            yield {"type": "heartbeat"}
        except StopAsyncIteration:
            break
```

#### Pydantic stream event models

```python
from pydantic import BaseModel, Field
from typing import Union, Literal, Optional, Any
from datetime import datetime


class StreamStart(BaseModel):
    type: Literal["stream_start"]
    chat_id: str
    creator_user_id: str
    user_chat_message_id: str
    workspace_id: str


class TaskUpdate(BaseModel):
    type: Literal["task_update"]
    key: str
    message: str
    metadata: Optional[dict] = None
    plan_set: "PlanSet"
    status: Literal["error", "loading", "success"]
    title: str


class MessageDelta(BaseModel):
    type: Literal["message_delta"]
    delta: str


class NodeToolEvent(BaseModel):
    type: Literal["node_tool_event"]
    event: str
    metadata: Optional[dict] = None
    node_id: str
    plan_id: str
    plan_set_id: str
    timestamp: int
    tool_id: Optional[str] = None
    tool_type: Optional[str] = None


class NodeReportPreviewStart(BaseModel):
    type: Literal["node_report_preview_start"]
    entity: Any  # Entity discriminated union
    final_report: bool
    node_id: str
    plan_id: str
    plan_set_id: str
    preview_id: str
    report_title: str
    report_user_query: str
    section_id: Optional[str] = None
    timestamp: int
    tool_id: Optional[str] = None
    workspace_id: str


class NodeReportPreviewDelta(BaseModel):
    type: Literal["node_report_preview_delta"]
    delta: str
    node_id: str
    plan_id: str
    plan_set_id: str
    preview_id: str
    section_id: Optional[str] = None


class NodeReportPreviewDone(BaseModel):
    type: Literal["node_report_preview_done"]
    content: str      # full GML content
    entity: Optional[Any] = None
    final_report: bool
    node_id: str
    plan_id: str
    plan_set_id: str
    preview_id: str
    report_title: str
    report_user_query: str
    section_id: Optional[str] = None
    timestamp: int
    tool_id: Optional[str] = None
    workspace_id: str


class NodeToolsExecutionStart(BaseModel):
    type: Literal["node_tools_execution_start"]
    node_id: str
    plan_id: str
    plan_set_id: str
    timestamp: int
    tool_ids: list[str]
    total_tools: int


class UpdateSubagentCurrentAction(BaseModel):
    type: Literal["update_subagent_current_action"]
    current_action: str
    node_id: str
    plan_id: str
    plan_set_id: str
    timestamp: int
    tool_id: Optional[str] = None


class ReferencesFound(BaseModel):
    type: Literal["references_found"]
    references: list[Any]  # Entity[]


class PendingSourceEvent(BaseModel):
    type: Literal["pending_sources"]
    pending_sources: list["PendingSource"]


class DoneEvent(BaseModel):
    type: Literal["done"]
    has_async_entities_pending: Optional[bool] = None
    message: Optional[Any] = None  # Message


class Heartbeat(BaseModel):
    type: Literal["heartbeat"]


class StreamError(BaseModel):
    type: Literal["ERROR"]
    error_message: str
    error_type: str


class ChatTitleGenerated(BaseModel):
    type: Literal["chat_title_generated"]
    title: str


# Full discriminated union
StreamEvent = Union[
    StreamStart, TaskUpdate, MessageDelta, ReferencesFound,
    PendingSourceEvent, DoneEvent, StreamError, ChatTitleGenerated,
    NodeToolEvent, NodeReportPreviewStart, NodeReportPreviewDelta,
    NodeReportPreviewDone, NodeToolsExecutionStart,
    UpdateSubagentCurrentAction, Heartbeat,
    # + browser events, clarification events...
]
```

---

### 3.12 Gaps / Unknowns in Streaming

1. **`references_found` vs `pending_sources`**: `pending_sources` arrives during execution (before results), `references_found` arrives with completed entities. The exact timing relative to `task_update` events is not confirmed from the bundle alone.

2. **`node_report_preview_start` entity field**: Uses `c.Dy` (the GENERATED_REPORT entity variant), not the full discriminated union `c.pe`. Confirmed type.

3. **`update_message_clarification_message` vs `clarification_needed`**: Both exist. `clarification_needed` terminates the stream (`shouldEndStream: true`). `update_message_clarification_message` does not — it updates an existing message mid-stream.

4. **Event log persistence format**: Backend stores events as NDJSON or as structured records; replay uses them in original order. Format of the stored event log on the backend is not visible from client bundles.

5. **`has_async_entities_pending`** in `done`: indicates background entity generation continues after the primary answer. The mechanism for notifying completion is not visible (likely polling or a separate websocket).

---

## Cross-Cutting: What We Can Reuse vs. Adapt

### Reuse Directly
- **Streaming envelope format**: `{data: <event>, timestamp: <ms>}` — identical to implement in Python
- **Event type schemas**: All 22 types have exact field lists — direct Pydantic port
- **PlanSet/Plan/PlanTask model**: Direct Pydantic port, maps cleanly to SQLAlchemy models
- **Citation buffer logic**: Can be ported to Python for server-side GML post-processing
- **Chart schemas**: Direct Pydantic port; Plotly is library-agnostic

### Needs Adaptation
- **Healer algorithm**: Uses `unified/hast` (JS AST library). Python equivalent: `lxml` with `etree` or `html.parser`. Same algorithm, different AST library.
- **Chart rendering**: Superagent renders Plotly in React. We can reuse the same Plotly JSON schema on the frontend — the schema is identical.
- **Component registry**: React-specific; we implement equivalent React components
- **GML parsing**: `rehype-parse` in JS → `lxml.html.fragment_fromstring` or `BeautifulSoup` in Python for server-side validation

### Cannot Reuse (Build Fresh)
- **Orchestrator/LangGraph nodes**: The backend that generates `plan_set_id/plan_id/node_id` is invisible from client bundles
- **Entity persistence layer**: We need our own Artifact/Entity system (but schema is confirmed above)
- **Replay event log**: We need to store events per run in our DB (RunEvents table fits this)

---

## Summary: Confidence Levels

| Item | Confidence | Source |
|------|------------|--------|
| WIDGET_WIDTHS complete map | HIGH | Exact from bundle `0053_1889` |
| Healer algorithm (hoist/remove) | HIGH | Exact from bundle `0053_1889` |
| 22 event types with all fields | HIGH | Exact Zod schemas from `0055_774` |
| NDJSON envelope format | HIGH | `q = z.object({data: Q, timestamp: z.number()})` |
| Citation buffer state machine | HIGH | Verbatim class from `0055_774` |
| Retry schedule (5 retries, exponential) | HIGH | `Math.min(1000 * 2^(n-1), 30000)` from bundle |
| 30s watchdog timer | HIGH | `setTimeout(3e4)` from bundle |
| PlanTask/Plan/PlanSet schemas | HIGH | Exact Zod from `0027__app` |
| Message schema (cM) | HIGH | Exact Zod from `0027__app` |
| Entity discriminated union (12 types) | HIGH | Exact Zod from `0027__app` |
| 10 chart types (confirmed list) | HIGH | Exact enum from `0053_1889` |
| Chart rendering logic per type | HIGH | Full switch statement from `0053_1889` |
| Plotly config (no modebar/logo) | HIGH | From bundle |
| HSLA color palette | HIGH | From bundle variables `eb`, `ey`, `ew` |
| Replay 5ms timing | HIGH | `setTimeout(5)` from bundle |
| GML parse → heal → render flow | MEDIUM | Inferred from healer code + component registry; exact unified pipeline setup not captured |
| Event → Redux/state mapping | MEDIUM | Partially reconstructed from state variable names in closure |
| Backend event log format | LOW | Not visible from client bundles |
| LLM prompt for GML generation | LOW | Not in client bundles |
