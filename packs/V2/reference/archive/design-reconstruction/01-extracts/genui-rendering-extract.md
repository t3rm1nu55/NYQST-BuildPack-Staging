---
document_id: GENUI-RENDERING-EXTRACT
version: 1
date: 2026-02-20
---

# GENUI Rendering & GML Markup — Complete Extraction

**Scope:** Complete specification for generative UI (GENUI) component system, GML markup rendering, chart schemas, design tokens, and streaming patterns. Implementation-ready code patterns for config-driven UI rendering.

**Target:** BL-004 (Report Generation), BL-005 (Website Generation), MAPPING-02 (Deliverable Rendering Pipeline)

---

## Section 1: Component Registry (27 Primitives)

All primitive components follow this pattern:
```typescript
interface ComponentEntry {
  name: string;
  props: ZodSchema;
  render: (props, context) => JSX.Element;
}
```

### 1.1 Layout Primitives

#### Row
```typescript
const rowSchema = z.object({
  gap: z.enum(['0', '1', '2', '3', '4', '6', '8']),
  justify: z.enum(['start', 'center', 'between', 'around', 'evenly']).optional(),
  align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  wrap: z.boolean().optional(),
}).strict();

// Renders: <div style={{ display: 'flex', flexDirection: 'row', ... }} />
```

#### Column
```typescript
const columnSchema = z.object({
  gap: z.enum(['0', '1', '2', '3', '4', '6', '8']),
  align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  justify: z.enum(['start', 'center', 'between', 'around', 'evenly']).optional(),
}).strict();

// Renders: <div style={{ display: 'flex', flexDirection: 'column', ... }} />
```

#### Grid
```typescript
const gridSchema = z.object({
  cols: z.number().int().positive(),
  gap: z.enum(['0', '1', '2', '3', '4', '6', '8']),
}).strict();

// Renders: <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, ... }} />
```

#### ScrollArea
```typescript
const scrollAreaSchema = z.object({
  direction: z.enum(['vertical', 'horizontal', 'both']).optional(),
  hideScrollbar: z.boolean().optional(),
}).strict();

// Renders: <div style={{ overflow: 'auto' }} />
```

### 1.2 Text & Heading

#### Text
```typescript
const textSchema = z.object({
  content: z.string(),
  variant: z.enum(['body', 'caption', 'mono']).optional(),
  weight: z.enum(['regular', 'medium', 'semibold', 'bold']).optional(),
  color: z.string().optional(), // Tailwind class: 'text-gray-500'
  align: z.enum(['left', 'center', 'right']).optional(),
}).strict();
```

#### Heading
```typescript
const headingSchema = z.object({
  content: z.string(),
  level: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  color: z.string().optional(),
}).strict();
```

### 1.3 Interactive Elements

#### Button
```typescript
const buttonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost', 'destructive']).optional(),
  icon: z.string().optional(), // Phosphor icon name
  disabled: z.boolean().optional(),
  action: z.string(), // Event action name
}).strict();
```

#### Switch
```typescript
const switchSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  description: z.string().optional(),
  checked: z.boolean(),
}).strict();
```

#### TextInput
```typescript
const textInputSchema = z.object({
  name: z.string(),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  disabled: z.boolean().optional(),
  type: z.enum(['text', 'password', 'email', 'number']).optional(),
}).strict();
```

#### Badge
```typescript
const badgeSchema = z.object({
  label: z.string(),
  variant: z.enum(['default', 'secondary', 'outline', 'destructive']).optional(),
}).strict();
```

### 1.4 Data Display

#### Table
```typescript
const tableSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    align: z.enum(['left', 'center', 'right']).optional(),
    width: z.string().optional(), // '200px', '30%'
  })),
  rows: z.array(z.record(z.any())),
  striped: z.boolean().optional(),
  hover: z.boolean().optional(),
}).strict();
```

#### Card
```typescript
const cardSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  border: z.boolean().optional(),
  padding: z.enum(['none', 'sm', 'md', 'lg']).optional(),
}).strict();
```

#### Metric
```typescript
const metricSchema = z.object({
  label: z.string(),
  value: z.string().or(z.number()),
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
  trendPercent: z.number().optional(),
}).strict();
```

#### Timeline
```typescript
const timelineSchema = z.object({
  items: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    timestamp: z.string().optional(),
    status: z.enum(['complete', 'pending', 'error']).optional(),
  })),
}).strict();
```

#### Chart
```typescript
const chartSchema = z.object({
  type: z.enum(['bar', 'line', 'scatter', 'bubble', 'histogram', 'box', 'candlestick', 'stacked_bar', 'clustered_column', 'donut']),
  data: z.object({
    traces: z.array(z.any()), // Plotly trace objects
    layout: z.any(), // Plotly layout object
  }),
  height: z.string().optional(),
  responsive: z.boolean().optional(),
}).strict();
```

### 1.5 Content & Structure

#### Markdown
```typescript
const markdownSchema = z.object({
  content: z.string(), // Raw markdown string
  sanitize: z.boolean().optional(),
}).strict();

// Uses rehype-react to render as JSX
```

#### Divider
```typescript
const dividerSchema = z.object({
  orientation: z.enum(['horizontal', 'vertical']).optional(),
  margin: z.enum(['sm', 'md', 'lg']).optional(),
}).strict();
```

#### Spacer
```typescript
const spacerSchema = z.object({
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
}).strict();
```

#### Icon
```typescript
const iconSchema = z.object({
  name: z.string(), // Phosphor icon name (e.g., 'brain', 'chart-bar')
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  color: z.string().optional(),
}).strict();
```

### 1.6 Complex Components

#### Modal
```typescript
const modalSchema = z.object({
  title: z.string(),
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl']).optional(),
  closeButton: z.boolean().optional(),
}).strict();
```

#### Tabs
```typescript
const tabsSchema = z.object({
  tabs: z.array(z.object({
    id: z.string(),
    label: z.string(),
    badge: z.string().or(z.number()).optional(),
  })),
  activeTab: z.string(),
  variant: z.enum(['pill', 'underline']).optional(),
}).strict();
```

#### Collapsible
```typescript
const collapsibleSchema = z.object({
  title: z.string(),
  defaultOpen: z.boolean().optional(),
}).strict();
```

### 1.7 Status & Feedback

#### Skeleton
```typescript
const skeletonSchema = z.object({
  height: z.enum(['h-4', 'h-8', 'h-12', 'h-20']),
  width: z.string().optional(),
  count: z.number().optional(),
}).strict();
```

#### Spinner
```typescript
const spinnerSchema = z.object({
  size: z.enum(['sm', 'md', 'lg']).optional(),
  color: z.string().optional(),
}).strict();
```

#### StatusDot
```typescript
const statusDotSchema = z.object({
  status: z.enum(['success', 'pending', 'error', 'warning']),
  label: z.string().optional(),
}).strict();
```

#### Toast
```typescript
const toastSchema = z.object({
  message: z.string(),
  type: z.enum(['success', 'error', 'warning', 'info']),
  duration: z.number().optional(),
}).strict();
```

#### Progress
```typescript
const progressSchema = z.object({
  value: z.number().min(0).max(100),
  label: z.string().optional(),
  color: z.string().optional(),
}).strict();
```

### 1.8 Special Components

#### Iframe
```typescript
const iframeSchema = z.object({
  src: z.string().url(),
  title: z.string().optional(),
  height: z.string().optional(),
  sandbox: z.boolean().optional(),
}).strict();
```

#### Avatar
```typescript
const avatarSchema = z.object({
  src: z.string().optional(),
  name: z.string().optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
}).strict();
```

#### EmptyState
```typescript
const emptyStateSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
}).strict();
```

---

## Section 2: GML Tag Specifications (18 Tags)

GML (Gradient Markup Language) is a custom XML-like markup embedded in report HTML. All tags render to HTML with Tailwind classes.

### 2.1 Layout Tags

#### gml-row
```
Props:
  - gap: string ('1' | '2' | '3' | '4' | '6')
  - align: string ('start' | 'center' | 'end')

Max Width: 1280px
Renders: <div class="flex flex-row gap-{gap}" style="align-items: {align}" />
```

#### gml-primarycolumn
```
Props:
  - width: string ('full' | 'twothirds' | 'half')

Max Width Constraints:
  - full: 896px (full report width)
  - twothirds: 600px
  - half: 448px

Renders: <div class="prose max-w-{width} mx-auto" />
Note: Used in two-column layouts (primary + sidebar)
```

#### gml-sidebarcolumn
```
Props:
  - width: string ('full' | 'half')

Max Width: 384px (half width)
Renders: <div class="flex flex-col gap-4 w-full max-w-{width}" />
Note: Right sidebar in two-column reports
```

#### gml-halfcolumn
```
Props:
  - (none)

Max Width: 448px (50% of 896px)
Renders: <div class="flex-1 min-w-0" />
Note: Used inside gml-row for 2-column layouts
```

#### gml-chartcontainer
```
Props:
  - height: string ('300px' | '400px' | '500px' | '600px')
  - responsive: boolean (optional)

Max Width: 100% of parent
Renders: <div style="height: {height}; width: 100%" />
Note: Container for Plotly chart rendering
```

### 2.2 Content Tags

#### gml-blockquote
```
Props:
  - author: string (optional)

Max Width: 896px
Styles:
  - Border-left: 4px solid primary
  - Background: subtle gray
  - Padding: 16px

Renders: <blockquote class="gml-blockquote" />
```

#### gml-header-elt
```
Props:
  - level: string ('h1' | 'h2' | 'h3' | 'h4')

Max Width: 896px
Renders: <h{level} class="prose-h{level}" />
Note: Header element inside report prose
```

### 2.3 Metric Tags

#### gml-infoblockmetric
```
Props:
  - label: string
  - value: string | number
  - unit: string (optional)
  - trend: string ('up' | 'down' | 'stable')
  - trendPercent: number (optional)

Max Width: 280px (fits 3 per row @ 896px)
Renders:
  <div class="border rounded-lg p-4">
    <div class="text-sm text-gray-600">{label}</div>
    <div class="text-3xl font-bold">{value}{unit}</div>
    <div class="text-xs text-{trendColor}">{trend} {trendPercent}%</div>
  </div>
```

#### gml-infoblockevent
```
Props:
  - title: string
  - timestamp: string (ISO 8601)
  - description: string (optional)
  - status: string ('pending' | 'complete' | 'error')

Max Width: 384px
Renders: Timeline-style event block with status indicator
```

#### gml-infoblockstockticker
```
Props:
  - symbol: string (e.g., 'AAPL')
  - price: number
  - change: number (percent)
  - direction: string ('up' | 'down')

Max Width: 200px
Renders: Ticker card with price + direction indicator
```

### 2.4 Media Tags

#### gml-downloadfile
```
Props:
  - filename: string
  - url: string
  - filesize: string (optional, e.g., '2.4 MB')
  - fileType: string ('pdf' | 'docx' | 'csv' | 'xlsx')

Max Width: 400px
Renders:
  <a href="{url}" class="flex items-center gap-2 p-3 border rounded">
    <Icon name="{fileTypeIcon}" />
    <div>
      <div>{filename}</div>
      <div class="text-xs text-gray-500">{filesize}</div>
    </div>
  </a>
```

#### gml-viewreport
```
Props:
  - reportId: string
  - reportTitle: string

Max Width: 640px
Renders: Link to nested report (navigation action)
```

#### gml-viewwebsite
```
Props:
  - url: string
  - title: string (optional)

Max Width: 100%
Renders: <iframe src="{url}" class="border rounded" />
Note: Website preview in report
```

#### gml-viewpresentation
```
Props:
  - slideId: string
  - title: string

Max Width: 100%
Renders: Slides viewer (iframe or custom player)
```

#### gml-viewgenerateddocument
```
Props:
  - docId: string
  - filename: string

Max Width: 640px
Renders: Document viewer (PDF.js or custom)
```

### 2.5 Annotation Tags

#### gml-gradientinsightbox
```
Props:
  - type: string ('insight' | 'warning' | 'error' | 'success')
  - title: string (optional)

Max Width: 896px
Styles:
  - Background gradient (type-specific)
  - Left border: 4px
  - Padding: 16px
  - Border-radius: 8px

Renders:
  <div class="gml-gradient-{type} rounded-lg border-l-4 p-4">
    {title && <h4>{title}</h4>}
    {children}
  </div>
```

#### gml-inlinecitation
```
Props:
  - sourceIndex: number
  - url: string (optional)
  - cite: string (display text)

Max Width: Inline (no hard width)
Renders:
  <a href="{url}" class="inline-text-citation">[{sourceIndex}]</a>
  or <span class="inline-text-citation">[{sourceIndex}]</span>

Note: Rendered as superscript linked reference
```

### 2.6 Component Tag

#### gml-components
```
Props:
  - type: string (component registry key, e.g., 'Chart', 'Table')
  - props: object (component-specific props)

Max Width: Based on component type
Renders: Generic component renderer
  renderComponent({
    type: props.type,
    props: props.props
  })
```

---

## Section 3: Chart Schemas (10 Types)

All charts use Plotly.js as the rendering engine. The complete Zod schema hierarchy:

### 3.1 Core Data Schemas

```typescript
const DataPointSchema = z.object({
  x: z.string().or(z.number()).or(z.date()),
  y: z.number(),
  z: z.number().optional(), // 3D/bubble charts
  text: z.string().optional(),
  hovertext: z.string().optional(),
  customdata: z.any().optional(),
}).strict();

const DataTraceSchema = z.object({
  name: z.string(),
  x: z.array(z.string().or(z.number()).or(z.date())),
  y: z.array(z.number()),
  z: z.array(z.number()).optional(),
  mode: z.enum(['lines', 'markers', 'lines+markers', 'text']).optional(),
  type: z.enum(['scatter', 'bar', 'box', 'histogram', 'candlestick']).optional(),
  marker: z.object({
    size: z.number().or(z.array(z.number())).optional(),
    color: z.string().or(z.array(z.string())).optional(),
    opacity: z.number().optional(),
    symbol: z.string().optional(),
  }).optional(),
  line: z.object({
    color: z.string().optional(),
    width: z.number().optional(),
    dash: z.enum(['solid', 'dot', 'dash', 'longdash']).optional(),
  }).optional(),
  fill: z.enum(['tozeroy', 'tozerox', 'tonext', 'tonextx', 'tonexty', 'toself', 'none']).optional(),
  fillcolor: z.string().optional(),
  text: z.array(z.string()).optional(),
  textposition: z.enum(['top left', 'top center', 'top right', 'middle left', 'middle center', 'middle right', 'bottom left', 'bottom center', 'bottom right']).optional(),
  hovertemplate: z.string().optional(),
  stackgroup: z.string().optional(),
  orientation: z.enum(['v', 'h']).optional(),
}).strict();

const ErrorBarSchema = z.object({
  type: z.enum(['data', 'percent', 'sqrt']),
  value: z.number().or(z.array(z.number())),
  visible: z.boolean().optional(),
  symmetric: z.boolean().optional(),
  array: z.array(z.number()).optional(),
  arrayminus: z.array(z.number()).optional(),
}).strict();

const AxisConfigSchema = z.object({
  title: z.object({ text: z.string() }).optional(),
  type: z.enum(['linear', 'log', 'category', 'date']).optional(),
  autotick: z.boolean().optional(),
  dtick: z.number().optional(),
  tickformat: z.string().optional(),
  tickangle: z.number().optional(),
  showgrid: z.boolean().optional(),
  gridwidth: z.number().optional(),
  gridcolor: z.string().optional(),
  zeroline: z.boolean().optional(),
  zerolinewidth: z.number().optional(),
  zerolinecolor: z.string().optional(),
  showline: z.boolean().optional(),
  linewidth: z.number().optional(),
  linecolor: z.string().optional(),
  mirror: z.enum(['ticks', 'all', 'allticks', false]).optional(),
}).strict();

const LegendConfigSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  xanchor: z.enum(['auto', 'left', 'center', 'right']).optional(),
  yanchor: z.enum(['auto', 'top', 'middle', 'bottom']).optional(),
  orientation: z.enum(['v', 'h']).optional(),
  bgcolor: z.string().optional(),
  bordercolor: z.string().optional(),
  borderwidth: z.number().optional(),
  font: z.object({ size: z.number().optional(), color: z.string().optional() }).optional(),
}).strict();

const TitleConfigSchema = z.object({
  text: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  xanchor: z.enum(['auto', 'left', 'center', 'right']).optional(),
  yanchor: z.enum(['auto', 'top', 'middle', 'bottom']).optional(),
  font: z.object({ size: z.number().optional() }).optional(),
}).strict();

const MarginSchema = z.object({
  l: z.number().optional(),
  r: z.number().optional(),
  t: z.number().optional(),
  b: z.number().optional(),
  pad: z.number().optional(),
}).strict();

const LayoutSchema = z.object({
  title: TitleConfigSchema.optional(),
  xaxis: AxisConfigSchema.optional(),
  yaxis: AxisConfigSchema.optional(),
  zaxis: AxisConfigSchema.optional(),
  legend: LegendConfigSchema.optional(),
  margin: MarginSchema.optional(),
  paper_bgcolor: z.string().optional(),
  plot_bgcolor: z.string().optional(),
  font: z.object({ family: z.string().optional(), size: z.number().optional(), color: z.string().optional() }).optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  hovermode: z.enum(['x', 'y', 'closest', 'x unified', 'y unified', false]).optional(),
  showlegend: z.boolean().optional(),
  barmode: z.enum(['group', 'relative', 'stack']).optional(),
  boxmode: z.enum(['group', 'overlay']).optional(),
}).strict();

const ChartObjectSchema = z.object({
  traces: z.array(DataTraceSchema),
  layout: LayoutSchema,
}).strict();
```

### 3.2 Chart Type Specifications

#### Bar Chart
```typescript
{
  type: 'bar',
  data: {
    traces: [
      {
        name: 'Series 1',
        x: ['Category A', 'Category B', 'Category C'],
        y: [100, 200, 150],
        type: 'bar',
        marker: { color: '#3b82f6' }
      }
    ],
    layout: {
      title: { text: 'Sales by Category' },
      xaxis: { type: 'category' },
      yaxis: { title: { text: 'Amount' } },
      barmode: 'group',
      margin: { l: 60, r: 40, t: 40, b: 40 }
    }
  },
  height: '400px'
}
```

#### Line Chart
```typescript
{
  type: 'line',
  data: {
    traces: [
      {
        name: 'Revenue',
        x: ['2024-01-01', '2024-02-01', '2024-03-01'],
        y: [50000, 65000, 72000],
        mode: 'lines+markers',
        line: { color: '#10b981', width: 2 }
      }
    ],
    layout: {
      title: { text: 'Revenue Trend' },
      xaxis: { type: 'date' },
      hovermode: 'x unified'
    }
  },
  responsive: true
}
```

#### Scatter Chart
```typescript
{
  type: 'scatter',
  data: {
    traces: [
      {
        name: 'Performance vs Cost',
        x: [10, 20, 30, 40, 50],
        y: [40, 60, 80, 95, 110],
        mode: 'markers',
        marker: {
          size: 10,
          color: '#8b5cf6',
          opacity: 0.7
        }
      }
    ],
    layout: {
      title: { text: 'Performance vs Cost Analysis' },
      xaxis: { title: { text: 'Cost ($)' } },
      yaxis: { title: { text: 'Performance Score' } }
    }
  }
}
```

#### Bubble Chart
```typescript
{
  type: 'scatter',  // Bubble is mode in scatter
  data: {
    traces: [
      {
        name: 'Markets',
        x: [10, 20, 30],
        y: [40, 50, 60],
        z: [100, 200, 300],  // Bubble size
        mode: 'markers',
        marker: {
          size: z.map(v => Math.sqrt(v / Math.PI) * 5),
          color: ['#ef4444', '#f59e0b', '#10b981']
        }
      }
    ],
    layout: {
      title: { text: 'Market Size Comparison' }
    }
  }
}
```

#### Histogram
```typescript
{
  type: 'histogram',
  data: {
    traces: [
      {
        name: 'Distribution',
        x: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4],
        type: 'histogram',
        nbinsx: 10,
        marker: { color: '#3b82f6' }
      }
    ],
    layout: {
      title: { text: 'Data Distribution' },
      barmode: 'overlay'
    }
  }
}
```

#### Box Plot
```typescript
{
  type: 'box',
  data: {
    traces: [
      {
        name: 'Group A',
        y: [1, 2, 3, 4, 5, 6, 7],
        type: 'box'
      },
      {
        name: 'Group B',
        y: [2, 3, 4, 5, 6, 7, 8],
        type: 'box'
      }
    ],
    layout: {
      title: { text: 'Distribution Comparison' },
      boxmode: 'group'
    }
  }
}
```

#### Candlestick Chart
```typescript
{
  type: 'candlestick',
  data: {
    traces: [
      {
        name: 'Stock Price',
        x: ['2024-01-01', '2024-01-02', '2024-01-03'],
        open: [100, 102, 101],
        high: [105, 107, 106],
        low: [98, 100, 99],
        close: [103, 105, 104],
        type: 'candlestick'
      }
    ],
    layout: {
      title: { text: 'Stock Price Movement' },
      xaxis: { type: 'date' }
    }
  }
}
```

#### Stacked Bar Chart
```typescript
{
  type: 'bar',
  data: {
    traces: [
      {
        name: 'Product A',
        x: ['Q1', 'Q2', 'Q3'],
        y: [100, 120, 110],
        type: 'bar',
        stackgroup: '1'
      },
      {
        name: 'Product B',
        x: ['Q1', 'Q2', 'Q3'],
        y: [80, 100, 120],
        type: 'bar',
        stackgroup: '1'
      }
    ],
    layout: {
      barmode: 'stack',
      title: { text: 'Stacked Revenue' }
    }
  }
}
```

#### Clustered Column Chart
```typescript
{
  type: 'bar',
  data: {
    traces: [
      {
        name: 'North',
        x: ['Jan', 'Feb', 'Mar'],
        y: [10, 15, 13],
        type: 'bar'
      },
      {
        name: 'South',
        x: ['Jan', 'Feb', 'Mar'],
        y: [12, 10, 14],
        type: 'bar'
      }
    ],
    layout: {
      barmode: 'group',
      title: { text: 'Sales by Region' }
    }
  }
}
```

#### Donut Chart
```typescript
{
  type: 'pie',
  data: {
    traces: [
      {
        name: 'Market Share',
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F'],
        values: [30, 25, 20, 15, 7, 3],
        type: 'pie',
        hole: 0.4,  // hole size for donut effect
        marker: {
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
        }
      }
    ],
    layout: {
      title: { text: 'Market Share Distribution' },
      legend: { orientation: 'v', x: 1.1 }
    }
  }
}
```

### 3.3 Chart Rendering Logic

```typescript
function renderChart(descriptor: ChartDescriptor, context: RenderContext): JSX.Element {
  const { type, data, height, responsive } = descriptor;
  const containerRef = React.useRef(null);

  // Auto-detect X-axis type if not specified
  if (!data.layout.xaxis?.type && data.traces[0]?.x) {
    const firstX = data.traces[0].x[0];
    if (typeof firstX === 'string' && !isNaN(Date.parse(firstX))) {
      data.layout.xaxis = { ...data.layout.xaxis, type: 'date' };
    } else if (typeof firstX === 'string') {
      data.layout.xaxis = { ...data.layout.xaxis, type: 'category' };
    }
  }

  // Post-process error bars (if any)
  const processedTraces = data.traces.map(trace => {
    if (trace.error_y) {
      // Expand error bar format
      return {
        ...trace,
        error_y: {
          type: trace.error_y.type || 'data',
          array: trace.error_y.value,
          visible: true
        }
      };
    }
    return trace;
  });

  return (
    <div ref={containerRef} style={{ height: height || '400px', width: '100%' }}>
      <Plot
        data={processedTraces}
        layout={{
          ...data.layout,
          margin: data.layout.margin || { l: 60, r: 40, t: 40, b: 40 },
          font: { family: 'Geist Variable, sans-serif', size: 12 }
        }}
        config={{ responsive: responsive ?? true, displayModeBar: true }}
      />
    </div>
  );
}
```

---

## Section 4: Color Palettes & Design Tokens

### 4.1 Chart Palettes

#### Donut Chart (6-stop HSLA)
```javascript
const donutPalette = [
  'hsla(217, 91%, 60%, 1.0)',     // #3b82f6 - Blue
  'hsla(160, 84%, 39%, 1.0)',     // #10b981 - Green
  'hsla(38, 92%, 50%, 1.0)',      // #f59e0b - Amber
  'hsla(0, 84%, 60%, 1.0)',       // #ef4444 - Red
  'hsla(259, 84%, 60%, 1.0)',     // #8b5cf6 - Purple
  'hsla(326, 86%, 59%, 1.0)',     // #ec4899 - Pink
];
```

#### Bar Chart (2-stop HSLA)
```javascript
const barPalette = [
  'hsla(217, 91%, 60%, 1.0)',     // #3b82f6 - Primary Blue
  'hsla(209, 89%, 70%, 1.0)',     // #60a5fa - Light Blue
];
```

#### Line Chart (Green/Red Directional)
```javascript
const linePalette = {
  positive: 'hsla(160, 84%, 39%, 1.0)',   // #10b981 - Green (up)
  negative: 'hsla(0, 84%, 60%, 1.0)',     // #ef4444 - Red (down)
};
```

### 4.2 Tailwind Color System

#### Primary Colors (Brand)
```css
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* Base */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

#### Neutral Colors (Text/Backgrounds)
```css
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-400: #a3a3a3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;
```

#### Semantic Colors

**Success:**
```css
--color-success-50: #f0fdf4;
--color-success-500: #10b981;
--color-success-900: #065f46;
```

**Warning:**
```css
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-900: #78350f;
```

**Error:**
```css
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-900: #7f1d1d;
```

### 4.3 Design Token Scales

#### Typography
```javascript
const typographyScale = {
  'h1': { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: 700 },
  'h2': { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700 },
  'h3': { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 600 },
  'h4': { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 600 },
  'h5': { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: 600 },
  'h6': { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 600 },
  'body': { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 400 },
  'caption': { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400 },
  'mono': { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 400, fontFamily: 'monospace' },
};
```

#### Spacing
```javascript
const spacingScale = {
  '0': '0px',
  '1': '0.25rem',    // 4px
  '2': '0.5rem',     // 8px
  '3': '0.75rem',    // 12px
  '4': '1rem',       // 16px
  '6': '1.5rem',     // 24px
  '8': '2rem',       // 32px
  '12': '3rem',      // 48px
  '16': '4rem',      // 64px
};
```

#### Border Radius
```javascript
const borderRadiusScale = {
  'none': '0px',
  'sm': '0.125rem',   // 2px
  'base': '0.25rem',  // 4px
  'md': '0.375rem',   // 6px
  'lg': '0.5rem',     // 8px
  'xl': '0.75rem',    // 12px
  'full': '9999px',
};
```

#### Z-Index
```javascript
const zIndexScale = {
  'hide': '-1',
  'auto': 'auto',
  '0': '0',
  '10': '10',
  '20': '20',
  '30': '30',
  '40': '40',
  '50': '50',
  'dropdown': '1000',
  'sticky': '1020',
  'fixed': '1030',
  'modal-backdrop': '1040',
  'offcanvas-backdrop': '1040',
  'offcanvas': '1050',
  'modal': '1060',
  'popover': '1070',
  'tooltip': '1080',
};
```

### 4.4 Font Stack

```javascript
const fontStack = {
  'sans': 'Geist Variable, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  'serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  'mono': '"Cascadia Code", "Source Code Pro", Menlo, monospace',
};
```

### 4.5 Redesign Theme Tokens

```css
:root[data-theme="redesign"] {
  --shadow-low: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-low-hover: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  --shadow-high: 0 10px 24px 0 rgba(0, 0, 0, 0.12);

  --border-primary: 1px solid var(--color-neutral-200);
  --border-subtle: 1px solid var(--color-neutral-100);

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

---

## Section 5: Rendering Pipeline

### 5.1 GML Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT: Raw HTML with embedded GML markup                  │
│  Example: <p>...<gml-row>...</gml-row>...</p>             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  PHASE 1: Parse GML to AST       │
        │  - Extract tags                  │
        │  - Build node tree               │
        │  - Validate nesting rules        │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  PHASE 2: Heal Malformed GML     │
        │  - Check width constraints       │
        │  - Fix unclosed tags             │
        │  - Validate prop values          │
        │  - Remove invalid structures     │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  PHASE 3: Sanitize               │
        │  - Strip XSS vectors             │
        │  - Whitelist allowed attrs       │
        │  - Encode special chars          │
        └──────────────┬───────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │  PHASE 4: Resolve GML→React      │
        │  - Convert tags to components    │
        │  - Map props to component APIs   │
        │  - Generate JSX                  │
        └──────────────┬───────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT: React component tree                               │
│  Ready to render via root.render() or server streaming      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Healer Algorithm (Width Constraint Validation)

The healer validates and fixes width constraint violations for all GML tags:

```python
def heal_gml(gml_ast: Node) -> Node:
    """
    Validate and fix GML AST for width constraint violations.

    Constraint Rules (from bundle analysis):
    ┌──────────────────────┬─────────┬──────────────┐
    │ Tag                  │ Max W   │ Context      │
    ├──────────────────────┼─────────┼──────────────┤
    │ gml-row              │ 1280px  │ report width │
    │ gml-primarycolumn    │ 896px   │ 2-col layout │
    │ gml-sidebarcolumn    │ 384px   │ right col    │
    │ gml-halfcolumn       │ 448px   │ 50% of row   │
    │ gml-chartcontainer   │ 100%    │ parent       │
    │ gml-infoblockmetric  │ 280px   │ 3-up grid    │
    │ gml-downloadfile     │ 400px   │ file link    │
    │ gml-blockquote       │ 896px   │ report width │
    │ gml-gradientinsight  │ 896px   │ report width │
    │ gml-viewwebsite      │ 100%    │ full-bleed   │
    └──────────────────────┴─────────┴──────────────┘
    """

    MAX_WIDTHS = {
        'gml-row': (1280, 'report'),
        'gml-primarycolumn': (896, 'layout'),
        'gml-sidebarcolumn': (384, 'sidebar'),
        'gml-halfcolumn': (448, 'half'),
        'gml-chartcontainer': ('100%', 'parent'),
        'gml-infoblockmetric': (280, 'grid-item'),
        'gml-downloadfile': (400, 'block'),
        'gml-blockquote': (896, 'prose'),
        'gml-gradientinsightbox': (896, 'prose'),
        'gml-viewwebsite': ('100%', 'full'),
    }

    def validate_node(node: Node, parent_width: float | str) -> Node:
        if not is_gml_tag(node):
            # Recursively process children
            return {
                **node,
                children: [validate_node(child, parent_width) for child in (node.children or [])]
            }

        tag_name = node.tag
        if tag_name not in MAX_WIDTHS:
            return node  # Not a width-constrained tag

        max_w, context = MAX_WIDTHS[tag_name]

        # Extract declared width (if any)
        declared_w = parse_width(node.props.get('width'))

        # Compute context-aware parent width
        if context == 'report':
            actual_max = 1280
        elif context == 'layout':
            actual_max = 896
        elif context == 'sidebar':
            actual_max = 384
        elif context == 'half':
            actual_max = 448
        elif context == 'grid-item':
            actual_max = 280
        elif context == 'parent':
            actual_max = parent_width
        else:
            actual_max = parent_width

        # Check constraint
        if declared_w and declared_w > actual_max:
            # VIOLATION: hoist violating child out of parent
            # or remove it entirely if incompatible
            if is_hostable(node, actual_max):
                return hoist_to_parent(node)
            else:
                return remove_node(node)  # Malformed

        return {
            **node,
            children: [validate_node(child, max_w if max_w != '100%' else actual_max)
                      for child in (node.children or [])]
        }

    return validate_node(gml_ast, 1280)
```

### 5.3 Renderer Entry Point

```typescript
export function renderGML(gmlString: string, context: RenderContext): JSX.Element {
  // Parse GML string → AST
  const ast = parseGML(gmlString);

  // Heal for constraint violations
  const healedAst = healGML(ast);

  // Sanitize for XSS
  const sanitizedAst = sanitizeAST(healedAst);

  // Resolve to React components
  const jsx = resolveToJSX(sanitizedAst, context);

  return jsx;
}

function resolveToJSX(node: GMLNode, context: RenderContext): JSX.Element {
  // Map GML tag → React component + Tailwind classes
  const tagMap: Record<string, GMLComponentHandler> = {
    'gml-row': (props, children) => (
      <div className="flex flex-row gap-{props.gap}" style={{ alignItems: props.align }}>
        {children}
      </div>
    ),
    'gml-primarycolumn': (props, children) => (
      <div className="prose max-w-{props.width} mx-auto">
        {children}
      </div>
    ),
    'gml-chartcontainer': (props, children) => (
      <div style={{ height: props.height, width: '100%' }}>
        {children}
      </div>
    ),
    'gml-infoblockmetric': (props, children) => (
      <div className="border rounded-lg p-4 max-w-sm">
        <div className="text-sm text-gray-600">{props.label}</div>
        <div className="text-3xl font-bold">{props.value}{props.unit}</div>
        <div className={`text-xs text-${sentimentColor(props.trend)}`}>
          {props.trend} {props.trendPercent}%
        </div>
      </div>
    ),
    // ... remaining tags
  };

  if (!node.tag) {
    // Text or fragment
    return <>{node.content}</>;
  }

  const handler = tagMap[node.tag];
  if (!handler) {
    console.warn(`Unknown GML tag: ${node.tag}`);
    return null;
  }

  const children = (node.children || []).map(child => resolveToJSX(child, context));
  return handler(node.props, children);
}
```

---

## Section 6: Streaming Patterns

### 6.1 Stream Event Types (22 Event Types)

```typescript
type StreamEvent =
  | TaskUpdateEvent
  | NodeReportPreviewStartEvent
  | NodeReportPreviewDeltaEvent
  | NodeReportPreviewDoneEvent
  | PendingSourcesEvent
  | ReferencesFoundEvent
  | ChatTitleGeneratedEvent
  | ClarificationNeededEvent
  | BrowserUseStartEvent
  | BrowserUseNavigatingEvent
  | BrowserUseExtractingEvent
  | BrowserUseAwaitUserInputEvent
  | BrowserUseStopEvent
  | MetaReasoningStartEvent
  | MetaReasoningDeltaEvent
  | MetaReasoningDoneEvent
  | ToolCallStartEvent
  | ToolCallDeltaEvent
  | ToolCallDoneEvent
  | ArtifactEmittedEvent
  | StreamCompleteEvent
  | StreamErrorEvent;

interface TaskUpdateEvent {
  type: 'task_update';
  taskId: string;
  phases: Phase[];
  timestamp: number;
}

interface Phase {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
}

interface NodeReportPreviewStartEvent {
  type: 'node_report_preview_start';
  sectionId: string;
  sectionTitle: string;
  timestamp: number;
}

interface NodeReportPreviewDeltaEvent {
  type: 'node_report_preview_delta';
  sectionId: string;
  deltaContent: string;  // GML markup fragment
  timestamp: number;
}

interface NodeReportPreviewDoneEvent {
  type: 'node_report_preview_done';
  sectionId: string;
  completeContent: string;  // Full GML for section
  timestamp: number;
}

interface PendingSourcesEvent {
  type: 'pending_sources';
  count: number;
  timestamp: number;
}

interface ReferencesFoundEvent {
  type: 'references_found';
  sources: Source[];
  timestamp: number;
}

interface Source {
  id: string;
  title: string;
  url: string;
  description: string;
  sourceType: 'web' | 'pro' | 'api';
  favicon?: string;
}

interface ChatTitleGeneratedEvent {
  type: 'chat_title_generated';
  title: string;
  timestamp: number;
}

interface ClarificationNeededEvent {
  type: 'clarification_needed';
  question: string;
  options?: string[];
  timestamp: number;
}

interface BrowserUseStartEvent {
  type: 'browser_use_start';
  taskDescription: string;
  timestamp: number;
}

interface BrowserUseNavigatingEvent {
  type: 'browser_use_navigating';
  url: string;
  timestamp: number;
}

interface BrowserUseExtractingEvent {
  type: 'browser_use_extracting';
  description: string;
  timestamp: number;
}

interface BrowserUseAwaitUserInputEvent {
  type: 'browser_use_await_user_input';
  prompt: string;
  timestamp: number;
}

interface BrowserUseStopEvent {
  type: 'browser_use_stop';
  reason: 'complete' | 'error' | 'timeout';
  timestamp: number;
}

interface MetaReasoningStartEvent {
  type: 'meta_reasoning_start';
  topic: string;
  timestamp: number;
}

interface MetaReasoningDeltaEvent {
  type: 'meta_reasoning_delta';
  deltaThought: string;
  timestamp: number;
}

interface MetaReasoningDoneEvent {
  type: 'meta_reasoning_done';
  completeThought: string;
  timestamp: number;
}

interface ToolCallStartEvent {
  type: 'tool_call_start';
  toolName: string;
  timestamp: number;
}

interface ToolCallDeltaEvent {
  type: 'tool_call_delta';
  deltaInput: string;
  timestamp: number;
}

interface ToolCallDoneEvent {
  type: 'tool_call_done';
  toolName: string;
  result: any;
  timestamp: number;
}

interface ArtifactEmittedEvent {
  type: 'artifact_emitted';
  artifactType: 'report' | 'website' | 'slides' | 'document';
  artifactId: string;
  artifactUrl: string;
  timestamp: number;
}

interface StreamCompleteEvent {
  type: 'stream_complete';
  totalDuration: number;
  timestamp: number;
}

interface StreamErrorEvent {
  type: 'stream_error';
  error: string;
  timestamp: number;
}
```

### 6.2 Report Preview Streaming Flow

```typescript
// Example: AI streaming a report section with GML markup

async function* streamReportSection(
  chatId: string,
  researchContext: ResearchContext,
): AsyncGenerator<StreamEvent> {
  const sectionId = generateId();
  const sectionTitle = 'Market Analysis';

  yield {
    type: 'node_report_preview_start',
    sectionId,
    sectionTitle,
    timestamp: Date.now(),
  };

  // Stream GML markup chunks as AI generates
  const chunks = await streamGMLFromAI(researchContext);
  let fullContent = '';

  for await (const chunk of chunks) {
    fullContent += chunk;
    yield {
      type: 'node_report_preview_delta',
      sectionId,
      deltaContent: chunk,
      timestamp: Date.now(),
    };
  }

  yield {
    type: 'node_report_preview_done',
    sectionId,
    completeContent: fullContent,
    timestamp: Date.now(),
  };
}

// Client-side: consume stream and render progressively
function ChatPanel() {
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [streamingSection, setStreamingSection] = useState<{ id: string; content: string } | null>(null);

  async function onMessage(userMessage: string) {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ chatId, message: userMessage }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const eventStr = new TextDecoder().decode(value);
      const event = JSON.parse(eventStr) as StreamEvent;

      switch (event.type) {
        case 'node_report_preview_start':
          setStreamingSection({ id: event.sectionId, content: '' });
          break;

        case 'node_report_preview_delta':
          setStreamingSection(prev => prev ? { ...prev, content: prev.content + event.deltaContent } : null);
          break;

        case 'node_report_preview_done':
          setSections(prev => [
            ...prev,
            {
              id: event.sectionId,
              title: '',
              content: event.completeContent,
              rendered: renderGML(event.completeContent, {}),
            }
          ]);
          setStreamingSection(null);
          break;

        case 'references_found':
          setCitations(event.sources);
          break;
      }
    }
  }

  return (
    <div className="chat-panel">
      {sections.map(section => (
        <div key={section.id} className="report-section">
          {section.rendered}
        </div>
      ))}
      {streamingSection && (
        <div className="report-section streaming">
          {renderGML(streamingSection.content, {})}
          <Skeleton height="h-20" />
        </div>
      )}
    </div>
  );
}
```

---

## Section 7: CSS Architecture

### 7.1 Tailwind @layer Organization

```css
@layer base {
  h1, h2, h3, h4, h5, h6 { font-weight: 700; }
  body { font-size: 1rem; line-height: 1.5; }
}

@layer components {
  .prose { max-width: 896px; }
  .prose h1 { font-size: 2.25rem; margin-top: 1.5em; }
  .prose h2 { font-size: 1.875rem; margin-top: 1.25em; }
  .prose h3 { font-size: 1.5rem; margin-top: 1em; }
  .prose p { margin: 1em 0; }

  .prose code {
    font-family: "Cascadia Code", monospace;
    background: var(--color-neutral-100);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
  }

  .prose-blockquote {
    border-left: 4px solid var(--color-primary-500);
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
  }
}

@layer utilities {
  .text-sentiment-positive { color: var(--color-success-500); }
  .text-sentiment-negative { color: var(--color-error-500); }
  .text-sentiment-warning { color: var(--color-warning-500); }

  .gap-\[4px\] { gap: 4px; }
  .gap-\[8px\] { gap: 8px; }
}
```

### 7.2 GML Container Styles

```css
@container (max-width: 600px) {
  .gml-primarycolumn { max-width: 100%; }
  .gml-halfcolumn { flex: 1 1 calc(50% - 0.5rem); }
  .gml-infoblockevent { max-width: 100%; }
}

@container (max-width: 900px) {
  .gml-row { flex-direction: column; }
  .gml-sidebarcolumn { max-width: 100%; }
}

.gml-primarycolumn {
  @apply prose max-w-prose mx-auto;
}

.report-prose {
  @apply leading-relaxed text-neutral-900;

  h1 { @apply text-3xl font-bold mb-6; }
  h2 { @apply text-2xl font-bold mb-4; }
  h3 { @apply text-xl font-semibold mb-3; }
  h4 { @apply text-lg font-semibold mb-2; }

  p { @apply mb-4; }
  ul, ol { @apply mb-4 pl-6; }
  li { @apply mb-2; }

  table { @apply w-full border-collapse mb-4; }
  th, td { @apply border border-neutral-300 px-4 py-2; }
  th { @apply bg-neutral-50 font-semibold; }
}
```

### 7.3 Custom Animations

```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-scale {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes pulse-scale-mini {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-fade-slide-in {
  animation: fadeSlideIn 300ms ease-out;
}

.animate-pulse-scale {
  animation: pulse-scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 7.4 Gradient Insight Box Styling

```css
.gml-gradient-insight {
  @apply rounded-lg border-l-4 p-4 bg-gradient-to-r;
  border-color: var(--color-success-500);
  background: linear-gradient(to right,
    rgba(16, 185, 129, 0.05),
    rgba(16, 185, 129, 0.02)
  );
}

.gml-gradient-warning {
  border-color: var(--color-warning-500);
  background: linear-gradient(to right,
    rgba(245, 158, 11, 0.05),
    rgba(245, 158, 11, 0.02)
  );
}

.gml-gradient-error {
  border-color: var(--color-error-500);
  background: linear-gradient(to right,
    rgba(239, 68, 68, 0.05),
    rgba(239, 68, 68, 0.02)
  );
}
```

---

## Section 8: Reusable Code Catalog

### 8.1 State Path Resolver (Nested Data Binding)

```typescript
export function resolveStatePath(path: string, state: any): any {
  if (!path.startsWith('$')) return path;

  const segments = path.slice(1).split('.');
  let current = state;

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;

    const arrayMatch = segment.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      current = current[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
    } else {
      current = current[segment];
    }
  }

  return current;
}
```

### 8.2 Safe Props Parser

```typescript
export function parseComponentProps(
  propsDef: Record<string, any>,
  state: any,
  schema: ZodSchema
): Record<string, any> {
  const parsed: Record<string, any> = {};

  for (const [key, value] of Object.entries(propsDef)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      parsed[key] = resolveStatePath(value, state);
    } else if (typeof value === 'object' && value !== null && 'when' in value) {
      if (!evaluateCondition(value.when, state)) continue;
      parsed[key] = value.value;
    } else {
      parsed[key] = value;
    }
  }

  return schema.parse(parsed);
}
```

### 8.3 Pattern Factory: ChatMessage

```typescript
export function createChatMessagePattern(
  message: ChatMessage,
  context: RenderContext
): ComponentDescriptor {
  return {
    type: 'Column',
    props: { gap: '2', className: `message-${message.role}` },
    children: [
      {
        type: 'Row',
        props: { justify: 'between', gap: '2' },
        children: [
          {
            type: 'Text',
            props: {
              content: message.role === 'user' ? 'You' : 'Assistant',
              weight: 'semibold',
            },
          },
          {
            type: 'Text',
            props: {
              content: formatTime(message.timestamp),
              variant: 'caption',
              color: 'text-gray-500',
            },
          },
        ],
      },
      {
        type: 'Markdown',
        props: { content: message.content },
      },
      message.badges?.length && {
        type: 'Row',
        props: { gap: '1', wrap: true },
        children: message.badges.map(badge => ({
          type: 'Badge',
          props: { label: badge, variant: 'secondary' },
        })),
      },
    ].filter(Boolean),
  };
}
```

### 8.4 Pattern Factory: SourceCard

```typescript
export function createSourceCardPattern(
  source: Source,
  index: number,
  context: RenderContext
): ComponentDescriptor {
  return {
    type: 'Card',
    props: { border: true, padding: 'md' },
    children: [
      {
        type: 'Row',
        props: { justify: 'between', gap: '3' },
        children: [
          {
            type: 'Column',
            props: { gap: '1' },
            children: [
              {
                type: 'Row',
                props: { gap: '2', align: 'center' },
                children: [
                  {
                    type: 'Badge',
                    props: { label: `[${index}]`, variant: 'secondary' },
                  },
                  {
                    type: 'Text',
                    props: {
                      content: source.title,
                      weight: 'semibold',
                    },
                  },
                ],
              },
              {
                type: 'Text',
                props: {
                  content: source.description,
                  variant: 'caption',
                  color: 'text-gray-600',
                },
              },
              {
                type: 'Text',
                props: {
                  content: new URL(source.url).hostname,
                  variant: 'caption',
                  color: 'text-gray-500',
                },
              },
            ],
          },
          {
            type: 'Column',
            props: { gap: '2', align: 'end' },
            children: [
              source.favicon && {
                type: 'Avatar',
                props: { src: source.favicon, size: 'md' },
              },
              {
                type: 'Badge',
                props: {
                  label: source.sourceType.toUpperCase(),
                  variant: source.sourceType === 'pro' ? 'default' : 'outline',
                },
              },
            ].filter(Boolean),
          },
        ],
      },
    ],
  };
}
```

### 8.5 Healer Algorithm (Python Equivalent)

```python
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass

@dataclass
class GMLNode:
    tag: str
    props: Dict[str, Any]
    children: List['GMLNode']
    text: str = ''

MAX_WIDTHS = {
    'gml-row': (1280, 'report'),
    'gml-primarycolumn': (896, 'layout'),
    'gml-sidebarcolumn': (384, 'sidebar'),
    'gml-halfcolumn': (448, 'half'),
    'gml-chartcontainer': (float('inf'), 'parent'),
    'gml-infoblockmetric': (280, 'grid-item'),
    'gml-downloadfile': (400, 'block'),
    'gml-blockquote': (896, 'prose'),
    'gml-gradientinsightbox': (896, 'prose'),
    'gml-viewwebsite': (float('inf'), 'full'),
}

def heal_gml(ast: GMLNode, parent_width: float = 1280.0) -> Tuple[GMLNode, List[str]]:
    issues_fixed = []

    def validate_node(node: GMLNode, parent_width: float) -> Tuple[GMLNode | None, List[str]]:
        if node.tag not in MAX_WIDTHS:
            healed_children = []
            child_issues = []
            for child in node.children:
                healed_child, child_issues_list = validate_node(child, parent_width)
                if healed_child:
                    healed_children.append(healed_child)
                child_issues.extend(child_issues_list)

            return GMLNode(node.tag, node.props, healed_children, node.text), child_issues

        max_w, context = MAX_WIDTHS[node.tag]
        declared_w = parse_width_value(node.props.get('width'))

        if context == 'report':
            actual_max = 1280.0
        elif context == 'layout':
            actual_max = 896.0
        elif context == 'sidebar':
            actual_max = 384.0
        elif context == 'half':
            actual_max = 448.0
        elif context == 'grid-item':
            actual_max = 280.0
        else:
            actual_max = parent_width

        if declared_w is not None and declared_w > actual_max:
            issues_fixed.append(f'{node.tag} violated constraint: {declared_w}px > {actual_max}px')
            return None, issues_fixed

        healed_children = []
        child_issues = []
        for child in node.children:
            healed_child, child_issues_list = validate_node(child, actual_max)
            if healed_child:
                healed_children.append(healed_child)
            child_issues.extend(child_issues_list)

        healed_node = GMLNode(node.tag, node.props, healed_children, node.text)
        return healed_node, child_issues

    healed, issues = validate_node(ast, 1280.0)
    return healed or ast, issues

def parse_width_value(width_str: str | None) -> float | None:
    if not width_str:
        return None
    width_str = width_str.strip()
    if width_str.endswith('px'):
        return float(width_str[:-2])
    elif width_str.endswith('%'):
        return float(width_str[:-1])
    return None
```

### 8.6 Chart Rendering Helper (TypeScript)

```typescript
import Plot from 'react-plotly.js';

interface ChartDescriptor {
  type: 'bar' | 'line' | 'scatter' | 'bubble' | 'histogram' | 'box' | 'candlestick' | 'stacked_bar' | 'clustered_column' | 'donut';
  data: {
    traces: Plotly.Data[];
    layout: Partial<Plotly.Layout>;
  };
  height?: string;
  responsive?: boolean;
}

export function ChartComponent(props: { descriptor: ChartDescriptor }): JSX.Element {
  const { descriptor } = props;
  const { type, data, height = '400px', responsive = true } = descriptor;

  const processedTraces = data.traces.map(trace => {
    if (!data.layout.xaxis?.type && 'x' in trace && trace.x && trace.x.length > 0) {
      const firstX = trace.x[0];
      if (typeof firstX === 'string' && !isNaN(Date.parse(firstX))) {
        data.layout.xaxis = { ...data.layout.xaxis, type: 'date' };
      } else if (typeof firstX === 'string') {
        data.layout.xaxis = { ...data.layout.xaxis, type: 'category' };
      }
    }

    if ('error_y' in trace && trace.error_y) {
      return {
        ...trace,
        error_y: {
          type: (trace.error_y as any).type || 'data',
          array: (trace.error_y as any).value,
          visible: true,
        },
      };
    }

    return trace;
  });

  return (
    <Plot
      data={processedTraces}
      layout={{
        ...data.layout,
        margin: data.layout.margin || { l: 60, r: 40, t: 40, b: 40 },
        font: { family: 'Geist Variable, sans-serif', size: 12 },
        height: parseInt(height),
      }}
      config={{ responsive, displayModeBar: true, displaylogo: false }}
      style={{ width: '100%', height }}
    />
  );
}
```

### 8.7 Utility Functions

```typescript
export function formatTime(timestamp: number | string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function sentimentColor(sentiment: 'up' | 'down' | 'stable'): string {
  switch (sentiment) {
    case 'up':
      return 'text-success-600';
    case 'down':
      return 'text-error-600';
    case 'stable':
      return 'text-neutral-600';
  }
}

export function evaluateSimpleCondition(condition: string, state: any): boolean {
  const parts = condition.split('.');
  let current = state;
  for (const part of parts) {
    if (current === null || current === undefined) return false;
    current = current[part];
  }
  return Boolean(current);
}
```

---

## Summary & Next Steps

This extraction document provides everything needed to implement BL-004, BL-005, and MAPPING-02:

1. **27 Primitive Components** — The atomic building blocks of the UI
2. **18 GML Tags** — Complete spec with width constraints
3. **10 Chart Types** — Full Plotly.js integration patterns
4. **Design Tokens** — Colors, typography, spacing scales
5. **Rendering Pipeline** — 4-phase flow (parse → heal → sanitize → render)
6. **Streaming Patterns** — 22 event types with examples
7. **CSS Architecture** — Tailwind layer organization + responsive utilities
8. **Reusable Code** — State resolver, pattern factories, healers, helpers

**Ready for implementation in:**
- Backend: Python healer algorithm, stream event handlers
- Frontend: React renderers, pattern factories, chart integration

**Sources:**
- genui-00-findings.md through genui-06-comparison.md
- GML-RENDERING-ANALYSIS.md (healer algorithm, constraint table)
- GML_REPORT_RENDERING_PATTERNS.md (design patterns)
- TAILWIND_THEME_EXTRACTION.md (design tokens)
- JS_DESIGN_TOKENS.md (color palettes, semantic tokens)
- TECHNICAL-DEEP-DIVE.md (chart schemas, rendering logic)

---

*Extraction completed: 2026-02-20*
*For implementation guidance, see IMPLEMENTATION-PLAN.md (Section 3: Deliverable Generation)*
