# GML Component System & Redesign Theme -- Full Extraction

**Source files:**
- CSS: `55ccf76ff5ccbea2.css` (212,769 bytes)
- JS:  `extracted/Superagent/0053_1889-c64cad4788e7b7b9.js` (176,610 bytes, single-line minified)

---

## 1. All CSS Rules Containing "gml-" Selectors

These define report layout structure. The `.gml-primarycolumn` and `.report-prose` classes are co-applied via `:is()` for typography rules.

### 1a. Typography (base theme)

```css
:is(.gml-primarycolumn, .report-prose) > h1 {
  font-size: var(--text-2xl);
  line-height: calc(var(--spacing) * 7);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tighter-2);
}

:is(.gml-primarycolumn, .report-prose) > h2 {
  font-size: var(--text-xl);
  line-height: calc(var(--spacing) * 6.5);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tighter);
}

:is(.gml-primarycolumn, .report-prose) > h3 {
  font-size: var(--text-base);
  line-height: calc(var(--spacing) * 6);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
}

:is(.gml-primarycolumn, .report-prose) > h4 {
  font-size: var(--text-sm);
  line-height: calc(var(--spacing) * 5);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-normal);
}

:is(.gml-primarycolumn, .report-prose) p,
:is(.gml-primarycolumn, .report-prose) > ol > * > li,
:is(.gml-primarycolumn, .report-prose) > ul > * > li {
  font-size: var(--text-sm);
  line-height: calc(var(--spacing) * 5);
  font-weight: 440;
  letter-spacing: var(--tracking-normal);
}

:is(.gml-primarycolumn, .report-prose) > code,
:is(.gml-primarycolumn, .report-prose) > pre {
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  line-height: calc(var(--spacing) * 5);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--tracking-normal);
}

:is(.gml-primarycolumn, .report-prose) > figcaption {
  font-size: var(--text-xs);
  line-height: calc(var(--spacing) * 4);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-normal);
}
```

### 1b. Spacing / Layout (`@layer components`)

```css
@layer components {
  .gml-primarycolumn:not(:last-child) {
    margin-bottom: 20px;
  }

  :is(.gml-primarycolumn, .report-prose) > p:not(:last-child) {
    margin-top: 0;
    margin-bottom: 8px;
  }

  :is(.gml-primarycolumn, .report-prose) > p:has(em) {
    margin-top: 0;
    margin-bottom: 0;
  }

  :is(.gml-primarycolumn, .report-prose) > p:has(em):not(:last-child) {
    margin-bottom: 24px;
  }

  :is(.gml-primarycolumn, .report-prose) > p:has(em):not(:first-child) {
    margin-top: 24px;
  }

  :is(.gml-primarycolumn, .report-prose) > h1 {
    margin-top: 0;
    margin-bottom: 8px;
  }
  :is(.gml-primarycolumn, .report-prose) > h1:not(:first-child) {
    margin-top: 24px;
  }

  :is(.gml-primarycolumn, .report-prose) > h2 {
    margin-top: 24px;
    margin-bottom: 14px;
  }

  :is(.gml-primarycolumn, .report-prose) > h3 {
    margin-top: 0;
    margin-bottom: 6px;
  }
  :is(.gml-primarycolumn, .report-prose) > h3:not(:first-child) {
    margin-top: 24px;
  }

  :is(.gml-primarycolumn, .report-prose) > h4 {
    margin-top: 0;
    margin-bottom: 4px;
  }
  :is(.gml-primarycolumn, .report-prose) > h4:not(:first-child) {
    margin-top: 24px;
  }

  :is(.gml-primarycolumn, .report-prose) > hr {
    margin-top: 24px;
    margin-bottom: 24px;
  }

  :is(.gml-primarycolumn, .report-prose) > strong {
    font-weight: var(--font-weight-semibold);
  }

  :is(.gml-primarycolumn, .report-prose) > ul {
    list-style-type: disc;
  }

  :is(.gml-primarycolumn, .report-prose) > ol,
  :is(.gml-primarycolumn, .report-prose) > ul {
    margin-top: 0;
    margin-bottom: 24px;
    padding-left: 1.25em;
  }

  :is(.gml-primarycolumn, .report-prose) > ol li:not(:last-child),
  :is(.gml-primarycolumn, .report-prose) > ul li:not(:last-child) {
    margin-bottom: 14px;
  }

  :is(.gml-primarycolumn, .report-prose) > * + * {
    margin-top: 20px;
  }

  :is(.gml-primarycolumn, .report-prose) > ol > * > li,
  :is(.gml-primarycolumn, .report-prose) > ul > * > li {
    margin-top: 0;
    margin-bottom: 8px;
    padding-left: 1.25em;
  }

  :is(.gml-primarycolumn, .report-prose) > ol > * > li::marker {
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary-800);
  }

  :is(.gml-primarycolumn, .report-prose) > ul > * > li::marker {
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary-800);
  }

  :is(.gml-primarycolumn, .report-prose) > ol > * > li:last-child,
  :is(.gml-primarycolumn, .report-prose) > ul > * > li:last-child {
    margin-bottom: 0;
  }

  :is(.gml-primarycolumn, .report-prose) > blockquote {
    border-left: 4px var(--tw-border-style) var(--color-primary-400);
    color: var(--color-neutral-700);
    margin-top: 16px;
    margin-bottom: 16px;
    padding-left: 1rem;
    font-style: italic;
  }

  :is(.gml-primarycolumn, .report-prose) > pre {
    border-radius: var(--radius-md);
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-950);
    margin-bottom: 16px;
    padding: 12px 16px;
    overflow-x: auto;
  }

  :is(.gml-primarycolumn, .report-prose) > a {
    font-weight: var(--font-weight-medium);
    color: var(--color-primary-800);
    text-decoration-line: underline;
  }

  :is(.gml-primarycolumn, .report-prose) > a:hover {
    color: var(--color-primary-900);
  }

  :is(.gml-primarycolumn, .report-prose) > img {
    border-radius: 8px;
    max-width: 100%;
    height: auto;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  :is(.gml-primarycolumn, .report-prose) > figure {
    text-align: center;
    margin: 16px 0;
  }

  :is(.gml-primarycolumn, .report-prose) > figcaption {
    color: var(--color-neutral-600);
    margin-top: 4px;
  }

  :is(.gml-primarycolumn, .report-prose) > del {
    color: var(--color-neutral-600);
    text-decoration: line-through;
  }
}
```

---

## 2. All CSS Rules Containing "redesign" (Warm Theme System)

### 2a. Root-Level Theme Variables

Activated by `<html data-theme="redesign">`.

```css
:root[data-theme=redesign] {
  --warm-white: #fff5e9;
  --black: #161616;
  --purple-accent: #62034a;

  /* Primary scale -- monochrome alpha on black */
  --color-primary-950: hsl(0, 0%, 9%);
  --color-primary-900: hsla(0, 0%, 9%, 0.9);
  --color-primary-800: hsla(0, 0%, 9%, 0.8);
  --color-primary-700: hsla(0, 0%, 9%, 0.72);
  --color-primary-600: hsla(0, 0%, 9%, 0.64);
  --color-primary-500: hsla(0, 0%, 9%, 0.48);
  --color-primary-400: hsla(0, 0%, 9%, 0.32);
  --color-primary-300: hsla(0, 0%, 9%, 0.24);
  --color-primary-200: hsla(0, 0%, 9%, 0.16);
  --color-primary-100: hsla(0, 0%, 9%, 0.08);
  --color-primary-50: hsla(0, 0%, 9%, 0.04);

  /* Neutral scale -- monochrome alpha on black */
  --color-neutral-950: hsl(0, 0%, 9%);
  --color-neutral-900: hsla(0, 0%, 9%, 0.8);
  --color-neutral-800: hsla(0, 0%, 9%, 0.78);
  --color-neutral-700: hsla(0, 0%, 9%, 0.72);
  --color-neutral-600: hsla(0, 0%, 9%, 0.64);
  --color-neutral-500: hsla(0, 0%, 9%, 0.48);
  --color-neutral-400: hsla(0, 0%, 9%, 0.24);
  --color-neutral-300: hsla(0, 0%, 9%, 0.16);
  --color-neutral-200: hsla(0, 0%, 9%, 0.08);
  --color-neutral-100: #ede5dd;          /* cream */
  --color-neutral-50:  #fff5e9;          /* warm-white */
  --color-neutral-0:   #ffffff;

  --color-text: var(--black);
  --background: 33 100% 96%;
  --foreground: 0 0% 9%;

  /* Shadow system */
  --shadow-low:       0px 0px 1px 0px rgba(0,0,0,0.32),
                      0px 0px 2px 0px rgba(0,0,0,0.08),
                      0px 1px 3px 0px rgba(0,0,0,0.08);
  --shadow-low-hover: 0px 0px 1px 0px rgba(0,0,0,0.32),
                      0px 0px 3px 0px rgba(0,0,0,0.17),
                      0px 1px 4px 0px rgba(0,0,0,0.18);
  --shadow-high:      0px 0px 1px 0px rgba(0,0,0,0.61),
                      0px 0px 2px 0px rgba(0,0,0,0.41),
                      0px 3px 4px 0px rgba(0,0,0,0.15),
                      0px 6px 8px 0px rgba(0,0,0,0.15),
                      0px 12px 16px 0px rgba(0,0,0,0.2),
                      0px 18px 32px 0px rgba(0,0,0,0.26);

  /* Shadow aliases */
  --shadow-2xs: var(--shadow-low);
  --shadow-sm:  var(--shadow-low);
  --shadow-md:  var(--shadow-low-hover);
  --shadow-md-glow: var(--shadow-low-hover);
  --shadow-lg:  var(--shadow-high);
  --shadow-xl:  var(--shadow-high);

  /* Font stack -- Seasons Sans replaces Geist */
  --font-family-sans:     "Seasons Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  --font-family-mono:     "DM Mono", "Courier New", Courier, monospace;
  --font-sans-medium:     "Seasons Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  --font-sans-semibold:   "Seasons Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  --font-sans-bold:       "Seasons Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
}
```

### 2b. Body & Globals

```css
:root[data-theme=redesign] body {
  color: var(--black);
  font-family: var(--font-family-sans);
  background-color: var(--warm-white);
}

:root[data-theme=redesign] img {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  image-rendering: auto;
}

:root[data-theme=redesign] body * {
  scrollbar-color: var(--color-neutral-300) transparent;
}

:root[data-theme=redesign] body ::-webkit-scrollbar-track {
  background: transparent;
}
```

### 2c. Redesign Typography Overrides (within GML/prose)

```css
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > h1 {
  color: #000; font-size: 32px; font-weight: 600; line-height: 36px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > h2 {
  color: #000; font-size: 24px; font-weight: 600; line-height: 30px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > h3 {
  color: #000; font-size: 20px; font-weight: 600; line-height: 26px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > h4 {
  color: #000; font-size: 16px; font-weight: 600; line-height: 22px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) li,
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) p {
  color: #000; font-size: 16px; font-weight: 500; line-height: 22px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > code,
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > pre {
  font-size: 14px; line-height: 18px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > figcaption {
  font-size: 14px; font-weight: 500; line-height: 18px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) > blockquote {
  font-size: 16px; font-weight: 500; line-height: 22px;
}
:root[data-theme=redesign] :is(.gml-primarycolumn, .report-prose) strong {
  font-weight: 600;
}
```

### 2d. Redesign Utility Classes (semantic)

```css
.redesign-bg-warm        { background-color: var(--warm-white); }
.redesign-bg-black        { background-color: var(--black); }
.redesign-text-black       { color: var(--black); }
.redesign-text-warm        { color: var(--warm-white); }
.redesign-shadow-low       { box-shadow: var(--shadow-low); }
.redesign-shadow-high      { box-shadow: var(--shadow-high); }
.redesign-border-black     { border-color: var(--black); }

.redesign-heading-xl {
  font-family: var(--font-sans-bold); font-size: 44px;
  line-height: 1; letter-spacing: -.88px; font-weight: 500;
}
.redesign-heading-lg {
  font-family: var(--font-sans-bold); font-size: 32px; line-height: 1.1;
}
.redesign-heading-md {
  font-family: var(--font-sans-medium); font-size: 22px;
  line-height: 1.1; letter-spacing: -.22px;
}
.redesign-body {
  font-family: var(--font-sans-medium); font-size: 18px; line-height: normal;
}
.redesign-body-semibold {
  font-family: var(--font-sans-semibold); font-size: 18px;
  line-height: normal; letter-spacing: -.18px;
}
.redesign-title-large {
  color: var(--black); font-family: var(--font-sans-medium);
  font-size: 38px; font-weight: 580; line-height: normal;
}
.redesign-title-medium {
  color: var(--black); font-family: var(--font-sans-medium);
  font-size: 24px; font-weight: 580; line-height: normal;
}
.redesign-header-small {
  color: var(--black); font-family: var(--font-sans-semibold);
  font-size: 16px; font-weight: 650; line-height: normal;
}
.redesign-body-default {
  color: var(--black); font-family: var(--font-sans-medium);
  font-size: 16px; font-weight: 550; line-height: normal;
}
.redesign-body-small {
  color: var(--black); font-family: var(--font-sans-medium);
  font-size: 13px; font-weight: 550; line-height: normal;
}
.redesign-label-mono-large {
  color: #979aa0; font-family: var(--font-family-mono);
  font-size: 24px; font-weight: 500; line-height: normal;
}
.redesign-label-mono-small {
  color: #616670; font-family: var(--font-family-mono);
  font-size: 12px; font-weight: 500; line-height: normal;
  letter-spacing: .24px;
}
.redesign-gradient-text-pink {
  background: linear-gradient(90deg, #65064d, #fac4f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 2e. Redesign Tailwind Color Utilities

All use the base color `#161616` at various alpha levels:

| Class pattern | Hex value |
|---|---|
| `redesign-black` | `#161616` (100%) |
| `redesign-black-4` | `#1616160a` (~2.5%) |
| `redesign-black-8` | `#16161614` (~8%) |
| `redesign-black-16` | `#16161629` (~16%) |
| `redesign-black-24` | `#1616163d` (~24%) |
| `redesign-black-48` | `#1616167a` (~48%) |
| `redesign-black-64` | `#161616a3` (~64%) |
| `redesign-black-72` | `#161616b8` (~72%) |
| `redesign-black-78` | `#161616c7` (~78%) |
| `redesign-black-80` | `#161616cc` (~80%) |
| `redesign-cream` | `#ede5dd` |
| `redesign-warm-white` | `#fff6eb` |
| `redesign-white` | `#fff` |
| `redesign-white-60` | `#fff9` (60%) |
| `redesign-darken-5` | `#1d1f250d` (~5%) |
| `redesign-darken-10` | `#1d1f251a` (~10%) |
| `redesign-darken-25` | `#1d1f2540` (~25%) |
| `redesign-blue-primary` | `#166ee1` |

Available as `bg-`, `text-`, `border-`, `ring-`, `shadow-`, `divide-` utilities, plus interactive states (`hover:`, `focus-visible:`, `active:`, `disabled:`, `data-[state=...]`).

### 2f. Redesign Shadow Utilities

```css
.shadow-redesign-low {
  --tw-shadow: 0px 0px 1px 0px rgba(0,0,0,0.32),
               0px 0px 2px 0px rgba(0,0,0,0.08),
               0px 1px 3px 0px rgba(0,0,0,0.08);
}
.shadow-redesign-high {
  --tw-shadow: 0px 0px 1px 0px rgba(0,0,0,0.24),
               0px 0px 2px 0px rgba(0,0,0,0.16),
               0px 3px 4px 0px rgba(0,0,0,0.06),
               0px 6px 8px 0px rgba(0,0,0,0.06),
               0px 12px 16px 0px rgba(0,0,0,0.08),
               0px 18px 32px 0px rgba(0,0,0,0.10);
}
.hover\:shadow-redesign-low-hover:hover {
  --tw-shadow: 0px 0px 1px 0px rgba(0,0,0,0.32),
               0px 0px 3px 0px rgba(0,0,0,0.11),
               0px 1px 4px 0px rgba(0,0,0,0.12);
}
```

---

## 3. Gradient-Insight / Insight CSS Rules

```css
.bg-gradient-insight {
  background-image:
    linear-gradient(90deg,
      #00f5f508,
      #66a3ff08 19.94%,
      #ad93fb08 39.87%,
      #ff758c08 59.81%,
      #ff9d7008 79.75%,
      #ffdc5e08 99.68%,
      #10ef9908 119.62%
    ),
    radial-gradient(250.22% 100% at 0,
      #f5f5f5 0,
      #fcfcfc 49.52%,
      #f7f7f7 100%
    );
}

.bg-gradient-badge {
  background-image: radial-gradient(
    551% 102.42% at 0 168.75%,
    #fff3 0,
    #fff 49.52%,
    #fff6 100%
  );
}
```

The `eL` component (GradientInsightBox) applies these classes:
```
className="flex flex-col items-start gap-1 self-stretch text-neutral-800
           pt-3 pb-4 px-4 bg-gradient-insight border border-black/10 rounded-xl"
```

With a badge child:
```
className="flex justify-center items-center gap-2 rounded-full
           border border-black/20 px-3 py-0.5 bg-gradient-badge"
```

Default title: `"Superagent Insight"`

---

## 4. JS Bundle Extraction (from `1889-c64cad4788e7b7b9.js`)

### 4a. Complete GML Tag Registry (`tm`)

Maps tag names to React component functions.

| Tag Name | Component Behavior |
|---|---|
| `gml-blockquote` | Parses `ed` schema (citation_identifier, quote_text). Wraps in `<div className="my-5">`, renders `eu` component. |
| `gml-chartcontainer` | Parses `eM` schema (citation object). Renders chart via `eF` + children. Falls back to error display. |
| `gml-downloadfile` | Uses identifier prop to look up citation entity. Renders file download card `K`. |
| `gml-gradientinsightbox` | Container-only. Wraps children in `eL` (GradientInsightBox) with title "Superagent Insight". |
| `gml-halfcolumn` | Layout: `<div className="flex-2 max-w-[50%]">` |
| `gml-infoblockevent` | Parses `eO` schema (citation_identifier, date, event). Renders `eU` component. |
| `gml-infoblockmetric` | Parses `eG` schema (citation_identifier, description, formatted_metric, sentiment). Renders `eq` component. |
| `gml-infoblockstockticker` | Parses `eW` schema (change, changePercent, companyName, price, symbol, citation_identifier). Renders `eH` component. |
| `gml-inlinecitation` | Inline citation marker. Uses identifier prop to look up citation. Renders `et` superscript. |
| `gml-primarycolumn` | Layout: `<div className="w-full @3xl:w-3/4 gap-[20px] @3xl:pr-5 gml-primarycolumn">` |
| `gml-row` | Layout: `<div className="flex flex-col @3xl:flex-row flex-wrap gml-row">` |
| `gml-sidebarcolumn` | Smart layout: measures primary column height, truncates sidebar items that overflow. Uses `e2` wrapper with responsive grid. |
| `gml-viewgenerateddocument` | Renders document entity viewer (`e4.A`). Validates `entity_type === "GENERATED_DOCUMENT"`. |
| `gml-viewpresentation` | Renders presentation/slides viewer (`eJ.a`). Validates `entity_type === "GENERATED_PRESENTATION"`. |
| `gml-viewreport` | Renders report card/slide-out (`eK.y`). Downloads report content artifact. Validates `entity_type === "GENERATED_REPORT"`. |
| `gml-viewwebsite` | Renders website preview card (`tr`). Validates `entity_type === "WEBSITE"`. |

### 4b. Width Constraint Configuration

**Width Enum (`T`):**
```
"sidebar" | "primary" | "full_row" | "half"
```

**Container Mapping (`P`):**
```js
{
  full_row: "gml-row",
  half:     "gml-halfcolumn",
  primary:  "gml-primarycolumn",
  sidebar:  "gml-sidebarcolumn"
}
```

**Tag Width Constraints (`M`):**

| Tag | Allowed Container Widths |
|---|---|
| `gml-blockquote` | `[primary]` -- must be inside `gml-primarycolumn` |
| `gml-chartcontainer` | `[primary]` |
| `gml-downloadfile` | `[]` -- no constraint (can be anywhere) |
| `gml-gradientinsightbox` | `[primary]` |
| `gml-halfcolumn` | `[full_row]` -- must be inside `gml-row` |
| `gml-infoblockevent` | `[sidebar]` -- must be inside `gml-sidebarcolumn` |
| `gml-infoblockmetric` | `[sidebar]` |
| `gml-infoblockstockticker` | `[sidebar]` |
| `gml-inlinecitation` | `[]` -- no constraint |
| `gml-primarycolumn` | `[full_row]` -- must be inside `gml-row` |
| `gml-row` | `[]` -- top-level, no constraint |
| `gml-sidebarcolumn` | `[full_row]` -- must be inside `gml-row` |
| `gml-viewreport` | `[]` -- no constraint |

### 4c. Healer / Validator Logic

**Healing Behavior Enum (`I` / `D`):**
```
"remove" | "hoist"
```

Default healing behavior: `"hoist"` (when not specified).

**The Healer Function (`L`):**

```js
let L = e => {
  let t = [];

  // Walk the AST tree, visiting each "element" node
  z.VG(e, "element", (element, ancestors) => {
    let config = M[element.tagName];

    // Skip if tag not in config or has no width constraints
    if (!config || config.widths.length === 0) return;

    // Get ancestor elements and their tag names
    let ancestorElements = ancestors.filter(e => e.type === "element");
    let ancestorTags = ancestorElements.map(e => e.tagName);

    // If all required containers are already present in ancestors, OK
    if (config.widths.every(w => ancestorTags.includes(P[w]))) return;

    let parent = ancestors[ancestors.length - 1];
    let index = parent.children.indexOf(element);
    if (index === -1) return;

    // Determine healing behavior (prop > config > default "hoist")
    let behavior = element.properties?.healing_behavior
                ?? config.healingBehavior
                ?? D.hoist;

    if (behavior === D.hoist) {
      // Try to find a valid ancestor to hoist into
      let target;
      for (let i = ancestorElements.length - 1; i >= 0; i--) {
        let ancestorSlice = ancestorElements.slice(0, i + 1).map(e => e.tagName);
        if (config.widths.every(w => ancestorSlice.includes(P[w]))) {
          target = ancestorElements[i];
          break;
        }
      }

      // Fallback: look inside a gml-row for a matching column
      if (!target) {
        let row = ancestorElements.find(e => e.tagName === "gml-row");
        if (row && F(row)) {
          let requiredTags = config.widths.map(w => P[w]);
          let column = row.children.find(
            e => F(e) && requiredTags.includes(e.tagName)
          );
          if (column) target = column;
        }
      }

      if (target) {
        t.push({ index, newParent: target, parent, type: "hoist" });
        return;
      }
    }

    // Fallback: remove the misplaced element
    t.push({ index, parent, type: "remove" });
  });

  // Apply mutations in reverse order
  for (let r of t.reverse()) {
    if (r.type === "remove") {
      r.parent.children.splice(r.index, 1);
    } else if (r.type === "hoist" && r.newParent) {
      let removed = r.parent.children.splice(r.index, 1)[0];
      if (removed) r.newParent.children.push(removed);
    }
  }
};
```

**Summary of healing logic:**
1. Walks the parsed GML AST (hast tree)
2. For each GML element, checks if it is inside the correct container(s) per the width constraint table
3. If misplaced and behavior is `"hoist"`: moves the element into the correct ancestor container
4. If no valid ancestor found (or behavior is `"remove"`): strips the element entirely
5. Mutations applied in reverse index order to avoid index shifts

### 4d. Component Props Schemas (Zod)

**`ed` -- gml-blockquote props:**
```ts
z.object({
  citation_identifier: z.preprocess(
    e => e === null ? undefined : e,
    z.string().optional()
  ),
  quote_text: z.string()
})
```

**`eO` -- gml-infoblockevent props:**
```ts
z.object({
  citation_identifier: z.preprocess(
    e => e === null ? undefined : e,
    z.string().optional()
  ),
  date: z.preprocess(
    /* parses Date objects and ISO date strings */,
    z.date()
  ),
  event: z.string()
})
```

**`eG` -- gml-infoblockmetric props:**
```ts
z.object({
  citation_identifier: z.preprocess(
    e => e === null ? undefined : e,
    z.string().optional()
  ),
  description: z.string(),
  formatted_metric: z.string(),
  sentiment: z.preprocess(
    /* normalizes to lowercase, defaults to "neutral" */,
    z.enum(["good", "bad", "neutral", "warning"])  // eB
  )
})
```

**`eW` -- gml-infoblockstockticker props:**
```ts
z.object({
  change: z.number(),
  changePercent: z.number(),
  citation_identifier: z.preprocess(
    e => e === null ? undefined : e,
    z.string().optional()
  ),
  companyName: z.string(),
  price: z.number(),
  symbol: z.string()
})
```

**`eM` -- gml-chartcontainer props:**
```ts
z.object({
  citation: z.object({
    citation_number: z.number(),
    citation_on_click: z.any(),
    citation_title: z.string().optional(),
    entity: /* EntitySchema */
  })
  /* plus chart data fields from eD */
})
```

**`eD` -- Chart data series:**
```ts
z.object({
  data: z.array(eT),  // data points
  error_x: z.union([eA, eI]).optional(),
  error_y: z.union([eA, eI]).optional(),
  marker_colorbar_title: z.string().optional(),
  marker_colorscale: z.union([z.string(), z.array(z.tuple([z.number(), z.string()]))]).optional(),
  marker_showscale: z.boolean().optional(),
  name: z.string(),
  type: z.enum([
    "bar", "scatter", "line", "bubble", "histogram",
    "box", "candlestick", "stacked_bar", "clustered_column", "donut"
  ]),
  x_type: z.enum(["number", "datetime", "category"]).optional()
})
```

**`eT` -- Chart data point:**
```ts
z.object({
  close: z.number().optional(),
  error_x_value: z.number().optional(),
  error_x_value_minus: z.number().optional(),
  error_y_value: z.number().optional(),
  error_y_value_minus: z.number().optional(),
  high: z.number().optional(),
  label: z.string().optional(),
  low: z.number().optional(),
  marker_color: z.union([z.number(), z.string()]).optional(),
  marker_size: z.number().optional(),
  open: z.number().optional(),
  x: z.union([z.number(), z.string(/* ISO date or category */)]),
  /* ... y value etc. */
})
```

**`eR` -- Chart layout:**
```ts
z.object({
  autosize: z.boolean().optional(),
  bargap: z.number().optional(),
  bargroupgap: z.number().optional(),
  barmode: z.enum(["stack", "group", "overlay", "relative"]).optional(),
  hovermode: z.union([
    z.literal("closest"), z.literal("x"), z.literal("y"),
    z.literal(false), z.literal("x unified"), z.literal("y unified")
  ]).optional(),
  legend: /* ek schema */.optional(),
  margin: z.object({ b, l, pad, r, t: z.number().optional() }).optional(),
  paper_bgcolor: z.string().optional(),
  plot_bgcolor: z.string().optional(),
  showlegend: z.boolean().optional(),
  title: z.object({ text: z.string(), /* font, x, xanchor */ }).optional(),
  xaxis: /* eS */.optional(),
  yaxis: /* ez */.optional()
})
```

**Chart default color palette:**
```js
// Primary palette (6 teal shades)
eb = [
  "hsla(186, 60%, 20%, 1)",
  "hsla(186, 54%, 36%, 1)",
  "hsla(186, 44%, 43%, 1)",
  "hsla(186, 44%, 58%, 1)",
  "hsla(186, 53%, 65%, 1)",
  "hsla(185, 50%, 80%, 1)"
];

// Secondary/minimal palette
ey = [
  "hsla(186, 54%, 36%, 1)",
  "hsla(185, 50%, 80%, 1)"
];

// Positive/growth accent
ew = "hsla(103, 40%, 43%, 1)";
```

### 4e. Sanitization / Allowed Tags Config

**Stripped (forbidden) tags:**
```js
tp = ["foreignObject", "iframe", "script", "style", "svg"]
```

**Sanitization config (`tx`):**
- Inherits from base rehype-sanitize defaults (`j.j`)
- Removes `style` from allowed global attributes
- Removes `xlink:href` from allowed anchor attributes
- Empties `svg` attribute list
- All GML custom tags (`Object.keys(tm)`) get `["props"]` as their only allowed attribute
- All GML custom tags added to allowed tag names list

**Header elements (h1-h6) get automatic ID generation:**
```js
tf = Object.fromEntries(
  ["h1","h2","h3","h4","h5","h6"].map(tag => [tag, props => {
    let { children } = props;
    // generates slug-based IDs for anchor linking: "gml-header-elt-{slug}"
  }])
);
```

---

## 5. Component-Level CSS Classes

### 5a. Typography Scale (Design System)

```css
.headline-1 {
  font-size: var(--text-3xl); line-height: calc(var(--spacing) * 9);
  font-weight: var(--font-weight-bold); letter-spacing: var(--tracking-tighter-3);
}
.headline-2 {
  font-size: var(--text-2xl); line-height: calc(var(--spacing) * 7);
  font-weight: var(--font-weight-semibold); letter-spacing: var(--tracking-tighter-2);
}
.headline-3 {
  font-size: var(--text-xl); line-height: calc(var(--spacing) * 6.5);
  font-weight: var(--font-weight-semibold); letter-spacing: var(--tracking-tighter);
}
.label-1 {
  font-size: var(--text-base); line-height: calc(var(--spacing) * 6);
  font-weight: var(--font-weight-semibold); letter-spacing: var(--tracking-tight);
}
.label-2 {
  font-size: var(--text-sm); line-height: calc(var(--spacing) * 5);
  font-weight: var(--font-weight-semibold); letter-spacing: var(--tracking-normal);
}
.body-1 {
  font-size: var(--text-base); line-height: calc(var(--spacing) * 6);
  font-weight: var(--font-weight-medium); letter-spacing: var(--tracking-tight);
}
.body-2 {
  font-size: var(--text-sm); line-height: calc(var(--spacing) * 5);
  font-weight: 440; letter-spacing: var(--tracking-normal);
}
.body-mono {
  font-size: var(--text-sm); line-height: calc(var(--spacing) * 5);
  font-weight: var(--font-weight-normal); letter-spacing: var(--tracking-normal);
}
.caption-1 {
  font-size: var(--text-xs); line-height: calc(var(--spacing) * 4);
  font-weight: var(--font-weight-medium); letter-spacing: var(--tracking-normal);
}
.caption-mono {
  font-family: var(--font-family-mono);
  font-size: var(--text-xs); line-height: calc(var(--spacing) * 4);
  font-weight: var(--font-weight-normal); letter-spacing: var(--tracking-normal);
}
.button-lg {
  font-size: var(--text-base); line-height: calc(var(--spacing) * 6);
  font-weight: var(--font-weight-semibold); letter-spacing: var(--tracking-tight);
}
.button-md {
  font-size: var(--text-sm); line-height: calc(var(--spacing) * 6);
  font-weight: var(--font-weight-semibold); letter-spacing: var(--tracking-normal);
}
.button-sm {
  line-height: calc(var(--spacing) * 4);
  font-weight: var(--font-weight-semibold); letter-spacing: var(--tracking-normal);
}
```

### 5b. Accent Color Classes

```css
.bg-accent-dark-blue   { background-color: #012d99; }
.bg-accent-dark-green  { background-color: #013327; }
.bg-accent-light-blue  { background-color: #ccecfa; }
.bg-accent-orange      { background-color: #ffa47a; }
.bg-accent-pink        { background-color: #fa91e0; }
.bg-accent-yellow      { background-color: #fcb42a; }
.text-accent-dark-blue { color: #012d99; }
```

### 5c. Docx Preview

```css
.docx-preview-wrapper {
  min-height: 100%;
  background-color: var(--color-neutral-100);
  padding: calc(var(--spacing) * 4);
}
.docx-preview {
  margin-inline: auto;
  margin-bottom: calc(var(--spacing) * 4);
  width: 200% !important;
  max-width: var(--container-4xl);
  transform-origin: 0 0 !important;
  scale: 0.5 !important;
  background-color: hsl(0 0 100% / 1);
  padding: calc(var(--spacing) * 10) !important;
  box-shadow: 0px 8px 16px 0px #1f1f1f1a;
}
```

### 5d. Code Highlighting

```css
.line {
  width: 100%; min-height: 1rem;
  padding-inline: calc(var(--spacing) * 4);
  padding-block: calc(var(--spacing) * 0.5);
  display: inline-block;
}
.line--highlighted {
  background-color: color-mix(in oklab, var(--color-zinc-700) 50%, transparent);
}
.word--highlighted {
  border-radius: var(--radius-md);
  border-color: color-mix(in oklab, var(--color-zinc-700) 70%, transparent);
  background-color: color-mix(in oklab, var(--color-zinc-700) 50%, transparent);
  padding: calc(var(--spacing) * 1);
}
```

### 5e. Sidebar Variables

```css
.sidebar-vars-default {
  --sidebar-width: 16rem;
  --sidebar-width-icon: 3rem;
}
.sidebar-vars-mobile {
  --sidebar-width: 18rem;
}
```

### 5f. UI Helpers

```css
.text-shimmer {
  color: inherit; display: inline-block;
  position: relative; overflow: hidden;
}
.text-shimmer:after {
  content: "";
  pointer-events: none;
  filter: blur(1px);
  background: linear-gradient(90deg,
    #fff0, #ffffff1a 40%, #fff9 50%, #ffffff1a 60%, #fff0
  );
  width: 200%; height: 100%;
  position: absolute; top: 0; left: -150%;
  transform: translate(100%);
}

.scroll-fade-mask {
  --scroll-fade-mask-height: 0px;
  -webkit-mask-image: linear-gradient(to bottom,
    #000 0, #000 calc(100% - var(--scroll-fade-mask-height)), #0000 100%
  );
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
}
.scroll-fade-mask-default { --scroll-fade-mask-height: 32px; }
.scroll-fade-mask-40      { --scroll-fade-mask-height: 40px; }

.hide-scrollbar   { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar     { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide   { -ms-overflow-style: none; scrollbar-width: none; }
.lf-player-container { width: 100%; height: 100%; }
```

---

## 6. Prose Typography (report-prose)

The `.report-prose` class is used interchangeably with `.gml-primarycolumn`. All rules are shown above in Section 1 under the `:is(.gml-primarycolumn, .report-prose)` selectors.

**Key characteristics:**
- Applied to the primary content column of reports
- All children get vertical rhythm via `> * + * { margin-top: 20px }`
- Body text: `--text-sm` / `font-weight: 440` (semi-light)
- Headings: semibold, with progressive tracking tightening
- Lists: disc markers in `--color-primary-800`, 14px bottom margin between items
- Blockquotes: 4px left border in `--color-primary-400`, italic
- Code blocks: `--color-neutral-100` background, `--radius-md` corners
- Links: underlined in `--color-primary-800`

In the **redesign theme**, typography shifts to:
- Absolute pixel sizes (32/24/20/16px instead of rem variables)
- Pure black (`#000`) text color
- Slightly heavier weights (600 for headings, 500 for body)
- Font family switches from Geist to Seasons Sans

---

## 7. Default Theme Color Tokens (`:root`)

The base (non-redesign) theme uses a custom teal-based palette:

```css
--color-primary-950: #1d2d34;
--color-primary-900: #30434b;
--color-primary-800: #344d56;
--color-primary-700: #385b66;
--color-primary-600: #3e6c79;
--color-primary-500: #498692;
--color-primary-400: #639fab;
--color-primary-300: #96c3ca;
--color-primary-200: #c2dce0;
--color-primary-100: #ddecee;
--color-primary-50:  #f1f7f9;
--color-neutral-0:   #fff;

--color-error-500: #570d00;    --color-error-50:  #fff2f0;
--color-warning-500: #562701;  --color-warning-50: #fff7db;
--color-success-500: #0c2f04;  --color-success-50: #eef6e9;

--font-family-sans: Geist, sans-serif;
--font-family-mono: "DM Mono", "Courier New", Courier, monospace;
--background: var(--color-primary-50);
```

---

## 8. Sidebar Column Smart Truncation (e2 component)

The sidebar column (`gml-sidebarcolumn`) uses a smart height-matching algorithm:

1. Finds the closest `.gml-row` ancestor
2. Finds the `.gml-primarycolumn` sibling within that row
3. Measures the total height of primary column children
4. Iteratively adds sidebar items until they would exceed the primary column height
5. Hides overflow items with `display: hidden`
6. Uses responsive grid at medium breakpoints:
   - `@md`: 2-column grid with `gap-x-4`
   - `@3xl`: single column, 25% width

CSS classes on the sidebar wrapper:
```
"block w-full pl-0
 @md:grid @md:grid-cols-2 @md:gap-x-4
 @3xl:block @3xl:w-1/4 @3xl:pl-0
 gml-sidebarcolumn"
```

---

## Summary: GML Component Hierarchy

```
gml-row                          (flex-col @3xl:flex-row)
  +-- gml-primarycolumn          (w-full @3xl:w-3/4, pr-5)
  |     +-- gml-blockquote       (props: quote_text, citation_identifier)
  |     +-- gml-chartcontainer   (props: citation, chart data)
  |     +-- gml-gradientinsightbox (container, no props)
  |     +-- gml-downloadfile     (props: identifier)
  |     +-- gml-inlinecitation   (inline, props: identifier)
  |     +-- gml-viewreport       (props: identifier)
  |     +-- gml-viewpresentation (props: identifier)
  |     +-- gml-viewgenerateddocument (props: identifier)
  |     +-- gml-viewwebsite      (props: identifier)
  |     +-- (markdown content: h1-h6, p, ul, ol, blockquote, pre, a, img, etc.)
  |
  +-- gml-sidebarcolumn          (w-full @3xl:w-1/4, smart truncation)
  |     +-- gml-infoblockevent   (props: date, event, citation_identifier)
  |     +-- gml-infoblockmetric  (props: formatted_metric, description, sentiment, citation_identifier)
  |     +-- gml-infoblockstockticker (props: symbol, companyName, price, change, changePercent, citation_identifier)
  |
  +-- gml-halfcolumn             (flex-2 max-w-[50%])
```
