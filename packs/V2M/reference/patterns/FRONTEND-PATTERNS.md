# FRONTEND CODE PATTERNS — Reusable Catalog

**Source**: GenUI prototype files (genui-01 through 05) + design reconstruction extracts (2026-02-20)
**Target platform**: React + Vite + @assistant-ui/react + shadcn/ui + Zustand
**Key decisions**: Plotly.js (NOT Recharts), rehype-to-JSX pipeline, GenUI config-driven rendering

---

## 1. GENUI COMPONENT REGISTRY (27 Primitives)

### 1.1 Registry Infrastructure

```typescript
// genui-01-primitive-registry.tsx
import React from 'react';
import { z } from 'zod';

export interface ComponentEntry {
  component: React.ComponentType<any>;
  schema: z.ZodSchema;
  category: 'primitive' | 'container' | 'data' | 'media' | 'form' | 'feedback';
}

export const primitiveRegistry: Record<string, ComponentEntry> = {};

function register(
  name: string,
  component: React.ComponentType<any>,
  schema: z.ZodSchema,
  category: ComponentEntry['category']
) {
  primitiveRegistry[name] = { component, schema, category };
}
```

### 1.2 Primitive Components (Text/Typography)

```typescript
// Text
const TextSchema = z.object({
  content: z.string(),
  variant: z.enum(['body', 'caption', 'label', 'mono']).default('body'),
  weight: z.enum(['normal', 'medium', 'semibold', 'bold']).default('normal'),
  color: z.string().optional(),   // Tailwind class e.g. 'text-gray-500'
  truncate: z.boolean().default(false),
  maxLines: z.number().optional(),
});

function Text({ content, variant, weight, color, truncate, maxLines }: z.infer<typeof TextSchema>) {
  const variantClasses = {
    body: 'text-[15px] leading-relaxed',
    caption: 'text-xs',
    label: 'text-sm',
    mono: 'text-sm font-mono',
  };
  const weightClasses = {
    normal: 'font-normal', medium: 'font-medium',
    semibold: 'font-semibold', bold: 'font-bold',
  };
  const cls = [
    variantClasses[variant || 'body'],
    weightClasses[weight || 'normal'],
    color || 'text-gray-900',
    truncate ? 'truncate' : '',
    maxLines ? `line-clamp-${maxLines}` : '',
  ].filter(Boolean).join(' ');
  return <span className={cls}>{content}</span>;
}
register('Text', Text, TextSchema, 'primitive');

// Heading
const HeadingSchema = z.object({
  content: z.string(),
  level: z.enum(['h1', 'h2', 'h3', 'h4']).default('h2'),
});

function Heading({ content, level }: z.infer<typeof HeadingSchema>) {
  const classes = {
    h1: 'text-[32px] font-[650] leading-tight',
    h2: 'text-xl font-semibold',
    h3: 'text-base font-semibold',
    h4: 'text-sm font-semibold',
  };
  const Tag = level || 'h2';
  return <Tag className={classes[Tag]}>{content}</Tag>;
}
register('Heading', Heading, HeadingSchema, 'primitive');
```

### 1.3 Primitive Components (Interactive)

```typescript
// Button
const ButtonSchema = z.object({
  label: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost', 'destructive']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  icon: z.string().optional(),
  iconPosition: z.enum(['left', 'right']).default('left'),
  disabled: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  action: z.string().optional(),   // Action ID for the event bus
});

function Button({ label, variant, size, disabled, fullWidth, action }: z.infer<typeof ButtonSchema>) {
  const base = 'inline-flex items-center justify-center rounded-lg transition-colors font-medium';
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-sm px-6 py-3',
  };
  const cls = [base, variants[variant || 'primary'], sizes[size || 'md'],
    fullWidth ? 'w-full' : '', disabled ? 'opacity-50 pointer-events-none' : '',
  ].filter(Boolean).join(' ');
  return <button className={cls} disabled={disabled} data-action={action}>{label}</button>;
}
register('Button', Button, ButtonSchema, 'primitive');

// Badge
const BadgeSchema = z.object({
  label: z.string(),
  variant: z.enum(['default', 'success', 'warning', 'error', 'info', 'pro']).default('default'),
});

function Badge({ label, variant }: z.infer<typeof BadgeSchema>) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-50 text-blue-600',
    pro: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${variants[variant || 'default']}`}>
      {label}
    </span>
  );
}
register('Badge', Badge, BadgeSchema, 'primitive');
```

### 1.4 Status + Feedback Primitives

```typescript
// Skeleton
const SkeletonSchema = z.object({
  width: z.string().default('w-full'),
  height: z.string().default('h-4'),
  rounded: z.boolean().default(true),
});
register('Skeleton', function Skeleton({ width, height, rounded }: z.infer<typeof SkeletonSchema>) {
  return <div className={`animate-pulse bg-gray-200 ${width} ${height} ${rounded ? 'rounded-lg' : ''}`} />;
}, SkeletonSchema, 'feedback');

// Spinner
const SpinnerSchema = z.object({ size: z.enum(['sm', 'md', 'lg']).default('md') });
register('Spinner', function Spinner({ size }: z.infer<typeof SpinnerSchema>) {
  const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-8' };
  return <div className={`animate-spin border-2 border-current border-t-transparent rounded-full ${sizes[size || 'md']}`} />;
}, SpinnerSchema, 'feedback');

// StatusDot
const StatusDotSchema = z.object({
  status: z.enum(['success', 'active', 'warning', 'error', 'idle']).default('idle'),
  pulse: z.boolean().default(false),
});
register('StatusDot', function StatusDot({ status, pulse }: z.infer<typeof StatusDotSchema>) {
  const colors = {
    success: 'bg-green-500', active: 'bg-blue-500',
    warning: 'bg-yellow-500', error: 'bg-red-500', idle: 'bg-gray-300',
  };
  return <div className={`size-2 rounded-full ${colors[status || 'idle']} ${pulse ? 'animate-pulse' : ''}`} />;
}, StatusDotSchema, 'feedback');

// Progress
const ProgressSchema = z.object({
  value: z.number().min(0).max(100),
  label: z.string().optional(),
  color: z.string().optional(),   // Tailwind bg color class
});
register('Progress', function Progress({ value, label, color }: z.infer<typeof ProgressSchema>) {
  return (
    <div className="w-full">
      {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color || 'bg-blue-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}, ProgressSchema, 'feedback');
```

### 1.5 Container Primitives

```typescript
// Card
const CardSchema = z.object({
  padding: z.enum(['none', 'sm', 'md', 'lg']).default('md'),
  border: z.boolean().default(true),
  shadow: z.boolean().default(false),
  rounded: z.enum(['none', 'md', 'lg', 'xl', '2xl']).default('xl'),
  background: z.string().default('bg-white'),
  children: z.array(z.any()).optional(),
});
register('Card', function Card({ padding, border, shadow, rounded, background, children }: any) {
  const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' };
  const cls = [
    background, paddings[padding || 'md'],
    border ? 'border border-gray-200' : '',
    shadow ? 'shadow-sm' : '',
    `rounded-${rounded || 'xl'}`,
  ].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}, CardSchema, 'container');

// Row
const RowSchema = z.object({
  gap: z.enum(['0', '1', '2', '3', '4', '6', '8']).default('3'),
  align: z.enum(['start', 'center', 'end', 'stretch', 'baseline']).default('center'),
  justify: z.enum(['start', 'center', 'end', 'between', 'around']).default('start'),
  wrap: z.boolean().default(false),
  children: z.array(z.any()).optional(),
});
register('Row', function Row({ gap, align, justify, wrap, children }: any) {
  return (
    <div className={`flex flex-row gap-${gap || 3} items-${align || 'center'} justify-${justify || 'start'} ${wrap ? 'flex-wrap' : ''}`}>
      {children}
    </div>
  );
}, RowSchema, 'container');

// Column
const ColumnSchema = z.object({
  gap: z.enum(['0', '1', '2', '3', '4', '6', '8']).default('3'),
  align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch'),
  children: z.array(z.any()).optional(),
});
register('Column', function Column({ gap, align, children }: any) {
  return <div className={`flex flex-col gap-${gap || 3} items-${align || 'stretch'}`}>{children}</div>;
}, ColumnSchema, 'container');

// Grid
const GridSchema = z.object({
  cols: z.number().default(2),
  gap: z.enum(['2', '3', '4', '6']).default('3'),
  children: z.array(z.any()).optional(),
});
register('Grid', function Grid({ cols, gap, children }: any) {
  return <div className={`grid grid-cols-${cols || 2} gap-${gap || 3}`}>{children}</div>;
}, GridSchema, 'container');

// Collapsible
const CollapsibleSchema = z.object({
  title: z.string(),
  defaultOpen: z.boolean().default(false),
  children: z.array(z.any()).optional(),
});
register('Collapsible', function Collapsible({ title, defaultOpen, children }: any) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-2 text-sm font-medium">
        <span>{title}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}, CollapsibleSchema, 'container');

// Tabs
register('Tabs', function Tabs({ tabs, activeTab, variant }: any) {
  return (
    <div className={`flex gap-0 ${variant === 'underline' ? 'border-b border-gray-200' : ''}`}>
      {tabs.map((tab: any) => (
        <button key={tab.id} data-action={`tab:${tab.id}`}
          className={`px-4 py-2.5 text-sm font-medium relative transition-colors ${
            tab.id === activeTab ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
          {tab.label}
          {tab.badge && <span className="ml-1.5 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
          {tab.id === activeTab && variant === 'underline' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}, z.object({ tabs: z.array(z.any()), activeTab: z.string(), variant: z.string().optional() }), 'container');
```

### 1.6 Data Display Primitives

```typescript
// Metric
const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  detail: z.string().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).default('neutral'),
});
register('Metric', function Metric({ label, value, detail, sentiment }: any) {
  const colors = { positive: 'text-green-600', negative: 'text-red-600', neutral: 'text-gray-900' };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[sentiment || 'neutral']}`}>{value}</div>
      {detail && <div className="text-xs text-gray-500 mt-1">{detail}</div>}
    </div>
  );
}, MetricSchema, 'data');

// Table
const TableSchema = z.object({
  columns: z.array(z.object({ key: z.string(), header: z.string(), align: z.enum(['left', 'center', 'right']).optional() })),
  rows: z.array(z.record(z.any())),
  compact: z.boolean().default(false),
});
register('Table', function Table({ columns, rows, compact }: any) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b border-gray-200">
          {columns.map((c: any) => (
            <th key={c.key} className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase text-${c.align || 'left'}`}>
              {c.header}
            </th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              {columns.map((c: any) => (
                <td key={c.key} className={`px-4 ${compact ? 'py-2' : 'py-3'} text-${c.align || 'left'}`}>
                  {String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}, TableSchema, 'data');

// Chart (Plotly wrapper — see Section 4 for full Plotly patterns)
const ChartSchema = z.object({
  traces: z.array(z.any()),
  layout: z.any().optional(),
  height: z.number().default(300),
});
register('Chart', function Chart({ traces, layout, height }: any) {
  // Import Plot lazily to avoid SSR issues
  const Plot = React.lazy(() => import('react-plotly.js'));
  return (
    <React.Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-xl" style={{ height }} />}>
      <Plot
        data={traces}
        layout={{
          autosize: true,
          margin: { t: 30, r: 10, b: 40, l: 50 },
          font: { family: 'Inter, sans-serif', size: 12 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          ...layout,
        }}
        style={{ width: '100%', height }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </React.Suspense>
  );
}, ChartSchema, 'data');
```

### 1.7 Complete Primitive Registry Summary

| Name | Category | Key Props |
|---|---|---|
| Text | primitive | content, variant, weight, color, truncate, maxLines |
| Heading | primitive | content, level (h1-h4) |
| Button | primitive | label, variant, size, icon, action |
| Badge | primitive | label, variant |
| Avatar | primitive | src, fallback, size |
| Icon | primitive | name, size, color |
| Divider | primitive | — |
| Spacer | primitive | size (xs/sm/md/lg/xl) |
| Skeleton | feedback | width, height, rounded |
| Spinner | feedback | size |
| StatusDot | feedback | status, pulse |
| Progress | feedback | value (0-100), label, color |
| Toast | feedback | message, type, duration |
| Card | container | padding, border, shadow, rounded, background |
| Row | container | gap, align, justify, wrap |
| Column | container | gap, align |
| Grid | container | cols, gap |
| ScrollArea | container | direction, hideScrollbar |
| Collapsible | container | title, defaultOpen |
| Modal | container | title, maxWidth |
| Tabs | container | tabs[], activeTab, variant |
| Metric | data | label, value, detail, sentiment |
| Table | data | columns[], rows[], compact |
| Chart | data | traces[], layout, height |
| Markdown | data | content, sanitize |
| Iframe | media | src, title, height, sandbox |
| EmptyState | feedback | icon, title, description |

---

## 2. GENUI RENDERER (Universal Descriptor Engine)

### 2.1 ComponentDescriptor Type
```typescript
// genui-02-renderer.tsx
export interface ComponentDescriptor {
  type: string;                        // Registry key: "Card", "Row", "Text", etc.
  props?: Record<string, any>;
  children?: ComponentDescriptor[];
  key?: string;

  // Conditional rendering
  when?: string;    // State path to evaluate (truthy = render)
  unless?: string;  // State path to evaluate (falsy = render)

  // Data binding
  bind?: string;    // State path to bind value from
  repeat?: {
    source: string; // State path to array
    as: string;     // Variable name in children
  };

  // Event handling
  on?: Record<string, string>;   // { click: "actionId", change: "actionId" }
}

export interface RenderContext {
  state: Record<string, any>;
  actions: Record<string, Function>;
  theme?: Record<string, any>;
  locale?: string;
}
```

### 2.2 renderDescriptor (Core Function)
```typescript
export function renderDescriptor(
  descriptor: ComponentDescriptor,
  ctx: RenderContext,
  index: number = 0
): React.ReactNode {
  if (!descriptor || !descriptor.type) return null;

  // Conditional rendering
  if (descriptor.when && !resolveStatePath(ctx.state, descriptor.when)) return null;
  if (descriptor.unless && resolveStatePath(ctx.state, descriptor.unless)) return null;

  // Repeat (loop)
  if (descriptor.repeat) {
    const items = resolveStatePath(ctx.state, descriptor.repeat.source);
    if (!Array.isArray(items)) return null;
    return (
      <>
        {items.map((item, i) => {
          const childCtx = {
            ...ctx,
            state: { ...ctx.state, [descriptor.repeat!.as]: item, __index: i },
          };
          return renderDescriptor({ ...descriptor, repeat: undefined, key: String(i) }, childCtx, i);
        })}
      </>
    );
  }

  let resolvedProps = { ...descriptor.props };

  // Check pattern registry first (Tier 2)
  if (patternRegistry[descriptor.type]) {
    const expanded = patternRegistry[descriptor.type](resolvedProps);
    return renderDescriptor(expanded, ctx, index);
  }

  // Check primitive registry (Tier 1)
  const entry = primitiveRegistry[descriptor.type];
  if (!entry) {
    console.warn(`Unknown component type: ${descriptor.type}`);
    return null;
  }

  // Data binding: value = state path
  if (descriptor.bind) {
    resolvedProps.value = resolveStatePath(ctx.state, descriptor.bind);
  }

  // String interpolation: props starting with "$" are state paths
  for (const [key, val] of Object.entries(resolvedProps)) {
    if (typeof val === 'string' && val.startsWith('$')) {
      resolvedProps[key] = resolveStatePath(ctx.state, val.slice(1));
    }
  }

  // Event binding
  if (descriptor.on) {
    for (const [event, actionId] of Object.entries(descriptor.on)) {
      const handler = ctx.actions[actionId];
      if (handler) {
        resolvedProps[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = handler;
      }
    }
  }

  // Prop validation (advisory — renders anyway in prod)
  const validated = entry.schema.safeParse(resolvedProps);
  if (!validated.success && process.env.NODE_ENV === 'development') {
    console.warn(`Prop validation failed for ${descriptor.type}:`, validated.error.issues);
  }

  // Render children recursively
  const childNodes = descriptor.children?.map((child, i) => renderDescriptor(child, ctx, i));
  const Component = entry.component;
  return <Component key={descriptor.key || index} {...resolvedProps}>{childNodes}</Component>;
}

// State path resolver: "chat.messages.0.content" → state.chat.messages[0].content
function resolveStatePath(state: any, path: string): any {
  return path.split('.').reduce((obj, key) => {
    if (obj == null) return undefined;
    const idx = Number(key);
    return Number.isNaN(idx) ? obj[key] : obj[idx];
  }, state);
}
```

---

## 3. GENUI PATTERN REGISTRY (17 Composed Patterns)

### 3.1 Chat Patterns

```typescript
// genui-03-pattern-registry.ts
import { ComponentDescriptor, registerPattern } from './genui-02-renderer';

registerPattern('ChatMessage', (props: {
  role: 'user' | 'ai';
  content: string;
  attachments?: { name: string; type: string }[];
  badges?: { label: string; variant: string }[];
  timestamp?: string;
}) => ({
  type: 'Column',
  props: { gap: '2' },
  children: [
    ...(props.attachments || []).map(att => ({
      type: 'Button',
      props: { label: att.name, variant: 'secondary', size: 'sm', icon: 'file' },
    })),
    { type: 'Markdown', props: { content: props.content } },
    ...(props.badges?.length ? [{
      type: 'Row',
      props: { gap: '2' },
      children: [
        ...props.badges.map(b => ({ type: 'Badge', props: b })),
        ...(props.timestamp ? [{ type: 'Text', props: { content: props.timestamp, variant: 'caption', color: 'text-gray-400' } }] : []),
      ],
    }] : []),
  ],
}));

registerPattern('ChatInput', (props: {
  placeholder?: string;
  isStreaming?: boolean;
}) => ({
  type: 'Card',
  props: { padding: 'none', rounded: '2xl', border: true, shadow: true },
  children: [
    { type: 'TextInput', props: { name: 'message', placeholder: props.placeholder || 'Ask Superagent', multiline: true, rows: 2 } },
    {
      type: 'Row',
      props: { justify: 'between', gap: '2' },
      children: [
        {
          type: 'Row',
          props: { gap: '1' },
          children: [
            { type: 'Button', props: { label: '', variant: 'ghost', icon: 'sliders', action: 'openDeliverableSelector' } },
            { type: 'Button', props: { label: '', variant: 'ghost', icon: 'paperclip', action: 'openFileUpload' } },
          ],
        },
        {
          type: 'Button',
          props: {
            label: '',
            variant: props.isStreaming ? 'destructive' : 'primary',
            icon: props.isStreaming ? 'stop' : 'send',
            action: props.isStreaming ? 'stopStream' : 'sendMessage',
          },
        },
      ],
    },
  ],
}));

registerPattern('ChatList', (props: {
  chats: { id: string; title: string; href: string }[];
}) => ({
  type: 'Column',
  props: { gap: '0' },
  children: props.chats.map(chat => ({
    type: 'Button',
    props: { label: chat.title, variant: 'ghost', fullWidth: true, action: `navigate:${chat.href}` },
    key: chat.id,
  })),
}));
```

### 3.2 Report Patterns

```typescript
registerPattern('ReportHeader', (props: {
  title: string;
  generatedDate: string;
  tocItems?: { id: string; label: string }[];
}) => ({
  type: 'Column',
  props: { gap: '0' },
  children: [
    {
      type: 'Card',
      props: { padding: 'lg', background: 'bg-gradient-to-br from-blue-900 to-blue-700', rounded: 'xl', border: false },
      children: [
        { type: 'Heading', props: { content: props.title, level: 'h2' } },
        { type: 'Text', props: { content: `Generated on ${props.generatedDate}`, variant: 'caption' } },
      ],
    },
    ...(props.tocItems ? [{
      type: 'Collapsible',
      props: { title: 'Table of Contents', defaultOpen: false },
      children: props.tocItems.map(item => ({
        type: 'Button',
        props: { label: item.label, variant: 'ghost', fullWidth: true, action: `scrollTo:${item.id}` },
      })),
    }] : []),
  ],
}));

registerPattern('InsightCallout', (props: {
  label: string;
  content: string;
}) => ({
  type: 'Card',
  props: { padding: 'md', background: 'bg-amber-50', border: true, rounded: 'xl' },
  children: [
    { type: 'Text', props: { content: props.label, variant: 'caption', weight: 'semibold', color: 'text-amber-700' } },
    { type: 'Spacer', props: { size: 'xs' } },
    { type: 'Markdown', props: { content: props.content } },
  ],
}));

registerPattern('SourceCard', (props: {
  index: number;
  title: string;
  description: string;
  favicon?: string;
  sourceType: string;
  siteName?: string;
}) => ({
  type: 'Card',
  props: { padding: 'md', border: true, rounded: 'xl' },
  children: [
    {
      type: 'Row',
      props: { gap: '3', align: 'start' },
      children: [
        { type: 'Text', props: { content: String(props.index), variant: 'mono', color: 'text-gray-400' } },
        {
          type: 'Column',
          props: { gap: '1' },
          children: [
            {
              type: 'Row',
              props: { gap: '2' },
              children: [
                ...(props.favicon ? [{ type: 'Avatar', props: { src: props.favicon, size: 'xs' } }] : []),
                ...(props.siteName ? [{ type: 'Text', props: { content: props.siteName, variant: 'caption', color: 'text-gray-500' } }] : []),
                { type: 'Badge', props: { label: props.sourceType === 'pro' ? 'Pro' : 'Web', variant: props.sourceType === 'pro' ? 'pro' : 'default' } },
              ],
            },
            { type: 'Text', props: { content: props.title, weight: 'medium' } },
            { type: 'Text', props: { content: props.description, variant: 'caption', color: 'text-gray-500', maxLines: 2 } },
          ],
        },
      ],
    },
  ],
}));
```

### 3.3 Progress Patterns

```typescript
registerPattern('PlanProgress', (props: {
  phases: { title: string; status: string; taskCount: number; completedCount: number }[];
  isStreaming: boolean;
}) => ({
  type: 'Card',
  props: { padding: 'none', border: true, rounded: 'xl' },
  children: [
    {
      type: 'Row',
      props: { gap: '3', justify: 'between' },
      children: [
        {
          type: 'Row',
          props: { gap: '2' },
          children: [
            { type: props.isStreaming ? 'Spinner' : 'StatusDot', props: props.isStreaming ? { size: 'sm' } : { status: 'success' } },
            { type: 'Text', props: { content: props.isStreaming ? 'Processing...' : 'Research Complete', weight: 'medium' } },
          ],
        },
      ],
    },
    ...props.phases.map(phase => ({
      type: 'Row',
      props: { gap: '3' },
      children: [
        { type: 'StatusDot', props: {
          status: phase.status === 'SUCCESS' ? 'success' : phase.status === 'IN_PROGRESS' ? 'active' : 'idle',
          pulse: phase.status === 'IN_PROGRESS',
        }},
        { type: 'Text', props: { content: phase.title || 'Processing...', variant: 'label', color: 'text-gray-700' } },
        { type: 'Text', props: { content: `${phase.completedCount}/${phase.taskCount}`, variant: 'caption', color: 'text-gray-400' } },
      ],
    })),
  ],
}));

registerPattern('BrowserAgentBanner', (props: {
  isActive: boolean;
  currentAction?: string;
  awaitingInput?: boolean;
}) => ({
  type: 'Card',
  props: { padding: 'md', background: 'bg-blue-50', border: true, rounded: 'xl' },
  children: [
    {
      type: 'Row',
      props: { gap: '3', justify: 'between' },
      children: [
        {
          type: 'Row',
          props: { gap: '2' },
          children: [
            { type: 'Icon', props: { name: 'globe', size: 'md', color: 'text-blue-500' } },
            {
              type: 'Column',
              props: { gap: '0' },
              children: [
                { type: 'Text', props: { content: 'Browser Agent Active', weight: 'medium', color: 'text-blue-800' } },
                ...(props.currentAction ? [{ type: 'Text', props: { content: props.currentAction, variant: 'caption', color: 'text-blue-600' } }] : []),
              ],
            },
          ],
        },
        ...(props.awaitingInput ? [{ type: 'Button', props: { label: 'Provide Input', variant: 'primary', size: 'sm', action: 'provideBrowserInput' } }] : []),
      ],
    },
  ],
}));
```

### 3.4 Pattern Registry — Summary Table

| Pattern Name | Category | Key Props |
|---|---|---|
| ChatMessage | Chat | role, content, attachments[], badges[], timestamp |
| ChatInput | Chat | placeholder, isStreaming |
| ChatList | Chat | chats[] (id, title, href) |
| ReportHeader | Report | title, generatedDate, tocItems[] |
| InsightCallout | Report | label, content |
| SourceCard | Report | index, title, description, favicon, sourceType |
| FileCard | Report | title, timestamp, type |
| PlanProgress | Progress | phases[], isStreaming |
| BrowserAgentBanner | Progress | isActive, currentAction, awaitingInput |
| PageHeader | Chrome | title, actions[], backHref |
| NavSidebar | Chrome | logo, items[], activeItem |
| WebsitePreview | Deliverable | title, src, actions[] |
| ClarificationRequest | Interaction | message, options[] |
| UsageMeter | Billing | used, limit, planName |
| MetricGrid | Data | metrics[] (label, value, trend) |
| DataTable | Data | title, columns[], rows[], downloadable |
| ChartPanel | Data | title, chartDescriptor, caption |

---

## 4. GENUI STREAMING TOOLS (7 Tool Definitions)

```typescript
// genui-05-streaming-tools.ts
import { z } from 'zod';
import { tool as createTool } from 'ai';

export const researchTools = {

  // Replaces: task_update event → PlanProgress pattern
  updateResearchPlan: createTool({
    description: 'Update the research plan with current phase and task status',
    inputSchema: z.object({
      phases: z.array(z.object({
        title: z.string(),
        status: z.enum(['pending', 'in_progress', 'complete', 'failed']),
        tasks: z.array(z.object({
          id: z.string(),
          title: z.string(),
          status: z.enum(['pending', 'in_progress', 'complete', 'failed']),
        })),
      })),
    }),
    // No execute — client-side rendering only
  }),

  // Replaces: node_report_preview_start/delta/done events → GML content
  streamReportSection: createTool({
    description: 'Stream a section of the report to the user',
    inputSchema: z.object({
      sectionTitle: z.string(),
      content: z.string(),   // GML or markdown
      sectionIndex: z.number(),
      isComplete: z.boolean(),
    }),
    execute: async ({ sectionTitle, content, sectionIndex, isComplete }) => ({
      sectionTitle, content, sectionIndex, isComplete,
    }),
  }),

  // Replaces: pending_sources / references_found events → SourceCard pattern
  reportSources: createTool({
    description: 'Report discovered sources and citations',
    inputSchema: z.object({
      sources: z.array(z.object({
        title: z.string(),
        url: z.string(),
        description: z.string(),
        sourceType: z.enum(['web', 'pro', 'api']),
        favicon: z.string().optional(),
      })),
      totalCount: z.number(),
    }),
    execute: async ({ sources, totalCount }) => ({ sources, totalCount }),
  }),

  // Replaces: clarification_needed event — client-side tool (waits for input)
  askClarification: createTool({
    description: 'Ask the user for clarification before proceeding',
    inputSchema: z.object({
      message: z.string(),
      options: z.array(z.string()).optional(),
    }),
    // No execute — client must supply addToolOutput()
  }),

  // Replaces: browser_use_start/stop/await_user_input events → BrowserAgentBanner
  browserAgentAction: createTool({
    description: 'Report browser agent activity',
    inputSchema: z.object({
      action: z.enum(['start', 'navigating', 'extracting', 'awaiting_input', 'complete']),
      url: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async (input) => input,
  }),

  // Replaces: chat_title_generated event
  setChatTitle: createTool({
    description: 'Set the chat title based on the conversation',
    inputSchema: z.object({ title: z.string() }),
    execute: async ({ title }) => ({ title }),
  }),

  // Replaces: GML output entirely — universal component renderer
  renderUI: createTool({
    description: 'Render a UI component in chat: charts, tables, metrics, callouts',
    inputSchema: z.object({
      component: z.object({
        type: z.string(),
        props: z.record(z.any()),
        children: z.array(z.any()).optional(),
      }),
    }),
    execute: async ({ component }) => component,
  }),
};
```

### 4.1 Client-Side Tool Part Renderer

```typescript
// Maps AI SDK tool parts to GenUI patterns
function renderToolPart(part: any, ctx: RenderContext, i: number): React.ReactNode {
  // Research plan → PlanProgress
  if (part.type === 'tool-updateResearchPlan') {
    if (part.state === 'input-available' || part.state === 'input-streaming') {
      return renderDescriptor({
        type: 'PlanProgress',
        props: { phases: part.input.phases, isStreaming: part.state === 'input-streaming' },
      }, ctx, i);
    }
  }

  // Report section → streamed content
  if (part.type === 'tool-streamReportSection') {
    if (part.state === 'output-available') {
      return renderDescriptor({
        type: 'Column',
        props: { gap: '2' },
        children: [
          { type: 'Heading', props: { content: part.output.sectionTitle, level: 'h3' } },
          { type: 'Markdown', props: { content: part.output.content } },
        ],
      }, ctx, i);
    }
    if (part.state === 'input-streaming') {
      return renderDescriptor({ type: 'Skeleton', props: { height: 'h-20' } }, ctx, i);
    }
  }

  // Sources → source list
  if (part.type === 'tool-reportSources' && part.state === 'output-available') {
    return renderDescriptor({
      type: 'Column',
      props: { gap: '2' },
      children: part.output.sources.map((s: any, j: number) => ({
        type: 'SourceCard',
        props: { ...s, index: j + 1 },
      })),
    }, ctx, i);
  }

  // Clarification → user interaction required
  if (part.type === 'tool-askClarification' && part.state === 'input-available') {
    return (
      <ClarificationUI
        key={i}
        message={part.input.message}
        options={part.input.options}
        onRespond={(response: string) => addToolOutput({
          tool: 'askClarification',
          toolCallId: part.toolCallId,
          output: response,
        })}
      />
    );
  }

  // Universal component
  if (part.type === 'tool-renderUI' && part.state === 'output-available') {
    return renderDescriptor(part.output, ctx, i);
  }

  // Browser agent → banner
  if (part.type === 'tool-browserAgentAction' && part.state === 'output-available') {
    return renderDescriptor({
      type: 'BrowserAgentBanner',
      props: {
        isActive: part.output.action !== 'complete',
        currentAction: part.output.description,
        awaitingInput: part.output.action === 'awaiting_input',
      },
    }, ctx, i);
  }

  // Website → preview
  if (part.type === 'tool-deployWebsite' && part.state === 'output-available') {
    return renderDescriptor({
      type: 'WebsitePreview',
      props: { title: part.output.title, src: part.output.url },
    }, ctx, i);
  }

  return null;
}
```

---

## 5. ZUSTAND STORE PATTERNS

### 5.1 DeliverableStore (BL-015)
```typescript
// ui/src/stores/deliverableStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DeliverableState {
  selectedType: 'standard' | 'report' | 'website' | 'slides' | 'document';
  previewMode: boolean;
  currentPreviewContent: string | null;
  isGenerating: boolean;
  generationProgress: number;   // 0-100

  setSelectedType: (type: DeliverableState['selectedType']) => void;
  setPreviewMode: (enabled: boolean) => void;
  setGenerationProgress: (p: number) => void;
  startGeneration: () => void;
  completeGeneration: (content: string) => void;
}

export const useDeliverableStore = create<DeliverableState>()(
  devtools((set) => ({
    selectedType: 'standard',
    previewMode: false,
    currentPreviewContent: null,
    isGenerating: false,
    generationProgress: 0,

    setSelectedType: (type) => set({ selectedType: type }),
    setPreviewMode: (enabled) => set({ previewMode: enabled }),
    setGenerationProgress: (p) => set({ generationProgress: p }),
    startGeneration: () => set({ isGenerating: true, generationProgress: 0 }),
    completeGeneration: (content) => set({
      isGenerating: false,
      generationProgress: 100,
      currentPreviewContent: content,
    }),
  }))
);
```

### 5.2 RunStore (Enhanced for SSE Events)
```typescript
// ui/src/stores/run-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ReportSlice {
  reportContent: string;
  reportMetadata: { reportId: string; createdAt: string; hasImages: boolean; wordCount: number } | null;
  isRendering: boolean;
  renderError: string | null;
  updateContent: (gml: string) => void;
  setMetadata: (m: ReportSlice['reportMetadata']) => void;
  clearReport: () => void;
}

interface RunState {
  activeRunId: string | null;
  runStatus: 'idle' | 'running' | 'paused' | 'done' | 'error';
  events: RunEvent[];
  pendingAsyncEntities: Record<string, 'pending' | 'done'>;
  report: ReportSlice;

  setActiveRun: (id: string) => void;
  addEvent: (e: RunEvent) => void;
  setStatus: (s: RunState['runStatus']) => void;
  markAsyncEntityDone: (id: string) => void;
}

export const useRunStore = create<RunState>()(
  devtools((set) => ({
    activeRunId: null,
    runStatus: 'idle',
    events: [],
    pendingAsyncEntities: {},
    report: {
      reportContent: '',
      reportMetadata: null,
      isRendering: false,
      renderError: null,
      updateContent: (gml) => set((s) => ({ report: { ...s.report, reportContent: s.report.reportContent + gml } })),
      setMetadata: (m) => set((s) => ({ report: { ...s.report, reportMetadata: m } })),
      clearReport: () => set((s) => ({ report: { ...s.report, reportContent: '', reportMetadata: null } })),
    },

    setActiveRun: (id) => set({ activeRunId: id, runStatus: 'running', events: [] }),
    addEvent: (e) => set((s) => ({ events: [...s.events, e] })),
    setStatus: (status) => set({ runStatus: status }),
    markAsyncEntityDone: (id) =>
      set((s) => ({ pendingAsyncEntities: { ...s.pendingAsyncEntities, [id]: 'done' } })),
  }))
);
```

### 5.3 PlanStore (New — BL-007)
```typescript
// ui/src/stores/plan-store.ts
import { create } from 'zustand';

interface PlanState {
  planSet: PlanSet | null;
  activePlanId: string | null;

  setPlanSet: (ps: PlanSet) => void;
  updateTask: (planId: string, taskId: string, updates: Partial<PlanTask>) => void;
  setActivePlan: (planId: string) => void;
  clear: () => void;
}

export const usePlanStore = create<PlanState>()((set) => ({
  planSet: null,
  activePlanId: null,

  setPlanSet: (ps) => set({ planSet: ps, activePlanId: Object.keys(ps.plans)[0] ?? null }),

  updateTask: (planId, taskId, updates) =>
    set((s) => {
      if (!s.planSet) return s;
      const plan = s.planSet.plans[planId];
      if (!plan) return s;
      return {
        planSet: {
          ...s.planSet,
          plans: {
            ...s.planSet.plans,
            [planId]: {
              ...plan,
              plan_tasks: {
                ...plan.plan_tasks,
                [taskId]: { ...plan.plan_tasks[taskId], ...updates },
              },
            },
          },
        },
      };
    }),

  setActivePlan: (planId) => set({ activePlanId: planId }),
  clear: () => set({ planSet: null, activePlanId: null }),
}));
```

---

## 6. REHYPE-TO-JSX PIPELINE (GML Rendering)

### 6.1 Pipeline Setup

```typescript
// ui/src/lib/gml-renderer.ts
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import { createElement, Fragment } from 'react';

// GML tag → React component mapping (18 tags)
const GML_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Layout
  'gml-row':             GmlRow,
  'gml-primarycolumn':   GmlPrimaryColumn,
  'gml-sidebarcolumn':   GmlSidebarColumn,
  'gml-halfcolumn':      GmlHalfColumn,
  'gml-chartcontainer':  GmlChartContainer,

  // Content
  'gml-blockquote':      GmlBlockquote,
  'gml-header-elt':      GmlHeaderElt,

  // Metrics
  'gml-infoblockmetric': GmlInfoblockMetric,
  'gml-infoblockevent':  GmlInfoblockEvent,
  'gml-infoblockstockticker': GmlInfoblockStockTicker,

  // Media
  'gml-downloadfile':    GmlDownloadFile,
  'gml-viewreport':      GmlViewReport,
  'gml-viewwebsite':     GmlViewWebsite,
  'gml-viewpresentation': GmlViewPresentation,
  'gml-viewgenerateddocument': GmlViewGeneratedDocument,

  // Annotation
  'gml-gradientinsightbox': GmlGradientInsightBox,
  'gml-inlinecitation':  GmlInlineCitation,

  // Generic component
  'gml-components':      GmlComponents,
};

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeReact, {
    createElement,
    Fragment,
    components: GML_COMPONENTS,
  });

export function renderGml(gmlContent: string): React.ReactNode {
  const file = processor.processSync(gmlContent);
  return file.result as React.ReactNode;
}
```

### 6.2 GML Tag Implementations

```typescript
// gml-row
function GmlRow({ gap = '3', align = 'center', children }: any) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'row',
      gap: `${parseInt(gap) * 4}px`,
      alignItems: align,
      maxWidth: '1280px',
    }}>
      {children}
    </div>
  );
}

// gml-primarycolumn
function GmlPrimaryColumn({ width = 'full', children }: any) {
  const maxWidths = { full: '896px', twothirds: '600px', half: '448px' };
  return (
    <div className="prose" style={{ maxWidth: maxWidths[width as keyof typeof maxWidths] || '896px' }}>
      {children}
    </div>
  );
}

// gml-chartcontainer
function GmlChartContainer({ height = '400px', children }: any) {
  return (
    <div style={{ height, width: '100%' }}>
      {children}
    </div>
  );
}

// gml-infoblockmetric
function GmlInfoblockMetric({ label, value, unit, trend, trendPercent }: any) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  return (
    <div className="border border-gray-200 rounded-lg p-4" style={{ maxWidth: '280px' }}>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}{unit}</div>
      {trend && (
        <div className={`text-xs ${trendColor}`}>
          {trend} {trendPercent && `${trendPercent}%`}
        </div>
      )}
    </div>
  );
}

// gml-gradientinsightbox
function GmlGradientInsightBox({ type = 'insight', title, children }: any) {
  const styles = {
    insight: 'bg-amber-50 border-amber-400',
    warning: 'bg-orange-50 border-orange-400',
    error: 'bg-red-50 border-red-400',
    success: 'bg-green-50 border-green-400',
  };
  return (
    <div className={`rounded-lg border-l-4 p-4 ${styles[type as keyof typeof styles]}`}>
      {title && <h4 className="font-semibold mb-2">{title}</h4>}
      {children}
    </div>
  );
}

// gml-inlinecitation
function GmlInlineCitation({ sourceIndex, url, cite }: any) {
  return url
    ? <a href={url} className="inline-citation text-blue-600 text-xs no-underline">[{sourceIndex || cite}]</a>
    : <span className="inline-citation text-blue-600 text-xs">[{sourceIndex || cite}]</span>;
}

// gml-downloadfile
function GmlDownloadFile({ filename, url, filesize, fileType }: any) {
  const icons = { pdf: '📄', docx: '📝', csv: '📊', xlsx: '📊' };
  return (
    <a href={url} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50" style={{ maxWidth: '400px' }}>
      <span>{icons[fileType as keyof typeof icons] || '📁'}</span>
      <div>
        <div className="text-sm font-medium">{filename}</div>
        {filesize && <div className="text-xs text-gray-500">{filesize}</div>}
      </div>
    </a>
  );
}

// gml-viewwebsite (DEC-044: iframe-only in v1)
function GmlViewWebsite({ url, title }: any) {
  return (
    <iframe
      src={url}
      title={title}
      className="w-full border border-gray-200 rounded-lg"
      style={{ height: '600px' }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
```

---

## 7. CHART RENDERING (Plotly.js — 10 Types)

### 7.1 HSLA Palette System

```typescript
// Standard palette: 8 colors, each as HSLA with 0.8 alpha
const CHART_PALETTE = {
  blue:    'hsla(217, 91%, 60%, 0.8)',
  green:   'hsla(142, 71%, 45%, 0.8)',
  amber:   'hsla(38, 92%, 50%, 0.8)',
  red:     'hsla(0, 84%, 60%, 0.8)',
  purple:  'hsla(271, 76%, 53%, 0.8)',
  cyan:    'hsla(189, 94%, 43%, 0.8)',
  orange:  'hsla(25, 95%, 53%, 0.8)',
  gray:    'hsla(220, 9%, 46%, 0.8)',
};

const PALETTE_ARRAY = Object.values(CHART_PALETTE);

// Standard Plotly layout defaults
const DEFAULT_LAYOUT = {
  autosize: true,
  margin: { t: 30, r: 10, b: 40, l: 50 },
  font: { family: 'Inter, sans-serif', size: 12, color: '#374151' },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  legend: { orientation: 'h', y: -0.2 },
  colorway: PALETTE_ARRAY,
};
```

### 7.2 Chart Type Patterns

```typescript
// Bar chart
const barTrace = (labels: string[], values: number[], name: string) => ({
  type: 'bar',
  x: labels,
  y: values,
  name,
  marker: { color: CHART_PALETTE.blue },
});

// Line chart (with fill)
const lineTrace = (x: (string | number)[], y: number[], name: string) => ({
  type: 'scatter',
  mode: 'lines+markers',
  x, y, name,
  line: { color: CHART_PALETTE.blue, width: 2 },
  fill: 'tozeroy',
  fillcolor: 'hsla(217, 91%, 60%, 0.1)',
});

// Donut chart
const donutTrace = (labels: string[], values: number[]) => ({
  type: 'pie',
  labels,
  values,
  hole: 0.4,
  marker: { colors: PALETTE_ARRAY },
});

// Candlestick (financial)
const candlestickTrace = (data: { x: string[]; open: number[]; high: number[]; low: number[]; close: number[] }) => ({
  type: 'candlestick',
  ...data,
  increasing: { line: { color: CHART_PALETTE.green } },
  decreasing: { line: { color: CHART_PALETTE.red } },
});

// Stacked bar
const stackedBarTraces = (categories: string[], series: { name: string; values: number[] }[]) =>
  series.map((s, i) => ({
    type: 'bar',
    x: categories,
    y: s.values,
    name: s.name,
    marker: { color: PALETTE_ARRAY[i % PALETTE_ARRAY.length] },
  }));

// Helper: build full Plotly spec
function buildChartSpec(type: string, data: any, overrides?: any): { traces: any[]; layout: any } {
  const layout = { ...DEFAULT_LAYOUT, ...overrides };
  switch (type) {
    case 'bar':           return { traces: [barTrace(data.labels, data.values, data.name || '')], layout };
    case 'line':          return { traces: [lineTrace(data.x, data.y, data.name || '')], layout };
    case 'donut':         return { traces: [donutTrace(data.labels, data.values)], layout };
    case 'candlestick':   return { traces: [candlestickTrace(data)], layout };
    case 'stacked_bar':   return { traces: stackedBarTraces(data.categories, data.series), layout: { ...layout, barmode: 'stack' } };
    case 'clustered_column': return { traces: stackedBarTraces(data.categories, data.series), layout: { ...layout, barmode: 'group' } };
    default:              return { traces: data.traces ?? [], layout };
  }
}
```

---

## 8. SSE EVENT CONSUMPTION PATTERN

```typescript
// ui/src/hooks/useRunStream.ts
import { useCallback, useEffect, useRef } from 'react';
import { useRunStore } from '../stores/run-store';
import { usePlanStore } from '../stores/plan-store';
import { useDeliverableStore } from '../stores/deliverableStore';

export function useRunStream(runId: string | null) {
  const eventSource = useRef<EventSource | null>(null);
  const { addEvent, setStatus, report } = useRunStore();
  const { setPlanSet } = usePlanStore();
  const { startGeneration, completeGeneration, setGenerationProgress } = useDeliverableStore();

  const connect = useCallback((id: string) => {
    if (eventSource.current) eventSource.current.close();

    const es = new EventSource(`/api/v1/runs/${id}/stream`, {
      withCredentials: true,
    });

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      addEvent(event);

      switch (event.type) {
        case 'stream_start':
          setStatus('running');
          break;

        case 'task_update':
          setPlanSet(event.plan_set);
          break;

        case 'node_report_preview_start':
          startGeneration();
          break;

        case 'node_report_preview_delta':
          report.updateContent(event.delta);
          // Estimate progress (delta-based — rough heuristic)
          setGenerationProgress(Math.min(95, useDeliverableStore.getState().generationProgress + 2));
          break;

        case 'node_report_preview_done':
          report.updateContent(event.content);
          report.setMetadata({
            reportId: event.preview_id,
            createdAt: new Date().toISOString(),
            hasImages: false,
            wordCount: event.content.split(' ').length,
          });
          completeGeneration(event.content);
          break;

        case 'done':
          setStatus('done');
          es.close();
          break;

        case 'ERROR':
          setStatus('error');
          es.close();
          break;
      }
    };

    es.onerror = () => {
      setStatus('error');
      es.close();
    };

    eventSource.current = es;
  }, []);

  useEffect(() => {
    if (runId) connect(runId);
    return () => eventSource.current?.close();
  }, [runId, connect]);
}
```

---

## 9. KEY COMPONENT SPECS (New Components — v1 Required)

### DeliverableSelector (BL-008)
```typescript
// ui/src/components/chat/DeliverableSelector.tsx
type DeliverableSelectorProps = {
  value: 'standard' | 'report' | 'website' | 'slides' | 'document';
  onChange: (type: string) => void;
  disabled?: boolean;
};

// UI: segmented control (not dropdown)
// Connected to useDeliverableStore
```

### PlanViewer Task Card (BL-007)
```typescript
// Task card layout:
// ┌─────────────────────────────────────────────┐
// │  [1]  Deep Market Landscape Analysis        │  ← sequential number + title
// │       PROCESSING                  02:34     │  ← ALL CAPS status + elapsed time
// │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← progress bar
// └─────────────────────────────────────────────┘
// Left border: color-coded category (orange/blue/pink/green)

// Status badges: "LOADING" | "PROCESSING" | "CREATING NOTES" | "SUCCESS" | "ERROR"
// Elapsed format: M:SS (e.g., "2:34")
```

### GenerationOverlay (BL-020)
```typescript
// ui/src/components/generation/GenerationOverlay.tsx
// ┌─────────────────────────────────┐
// │     Generating output...        │  ← large bold
// │ ████████████████░░░░░░░░░░░░   │  ← single continuous bar (NOT reset per substep)
// │  Polishing typography...        │  ← gray substep text
// └─────────────────────────────────┘
// Data source: useDeliverableStore.generationProgress + node_report_preview_delta events
```

### WebsitePreview (BL-010)
```typescript
// ui/src/components/deliverables/WebsitePreview.tsx
async function loadWebsite(artifactSha256: string): Promise<string> {
  const response = await fetch(`/api/v1/artifacts/${artifactSha256}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);  // Blob URL for sandboxed iframe
}

// Renders:
// <iframe src={blobUrl} sandbox="allow-scripts allow-same-origin" className="w-full h-full" />
// v1: iframe-only, no public unauthenticated route (DEC-044)
```
