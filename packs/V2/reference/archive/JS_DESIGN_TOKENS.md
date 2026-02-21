# JS Design Tokens -- Extracted from Bundle Analysis

> Source: `/Users/markforster/AirTable-SuperAgent/extracted/Superagent/` JavaScript bundles
> Date: 2026-02-16
> Method: Regex extraction from minified production bundles

---

## Table of Contents

1. [Color Constants in JS](#1-color-constants-in-js)
2. [Semantic Color Token Scale (Tailwind)](#2-semantic-color-token-scale-tailwind)
3. [Redesign Tokens](#3-redesign-tokens)
4. [Spacing / Sizing Constants](#4-spacing--sizing-constants)
5. [Typography Constants](#5-typography-constants)
6. [Animation / Transition Constants](#6-animation--transition-constants)
7. [Plotly Chart Configuration](#7-plotly-chart-configuration)
8. [Icon Configuration (Phosphor Icons)](#8-icon-configuration-phosphor-icons)
9. [Zod Schemas -- Stream Events & UI State](#9-zod-schemas----stream-events--ui-state)
10. [CVA Component Variants](#10-cva-component-variants)

---

## 1. Color Constants in JS

### 1.1 HSLA Chart Palette (Teal Sequence)

**Source:** `0053_1889-c64cad4788e7b7b9.js` -- variable `eb`
**Import path:** `../../../shared_ui/components/gml-components/chart-container.tsx`

```js
// Full 6-stop teal palette (used for donut/pie charts)
const eb = [
  "hsla(186, 60%, 20%, 1)",   // darkest teal
  "hsla(186, 54%, 36%, 1)",   // dark teal
  "hsla(186, 44%, 43%, 1)",   // mid teal
  "hsla(186, 44%, 58%, 1)",   // light-mid teal
  "hsla(186, 53%, 65%, 1)",   // light teal
  "hsla(185, 50%, 80%, 1)",   // lightest teal
];

// 2-stop teal palette (used for stacked_bar, clustered_column)
const ey = [
  "hsla(186, 54%, 36%, 1)",   // dark teal
  "hsla(185, 50%, 80%, 1)",   // light teal
];

// Default line chart color (green)
const ew = "hsla(103, 40%, 43%, 1)";
```

### 1.2 HSLA Functional Colors (Chart Annotations)

```
hsla(9, 90%, 48%, 1)     -- error/negative line color (red-orange)
hsla(9, 90%, 48%, 0)     -- error color fully transparent (for area fill gradient start)
hsla(0, 65%, 55%, 0.32)  -- red highlight at 32% opacity
hsla(103, 40%, 43%, 0)   -- green transparent (for area fill gradient start)
hsla(103, 40%, 43%, 0.32)-- green at 32% opacity (area fill)
hsla(103, 40%, 43%, 1)   -- green solid (default line color)
```

### 1.3 Hex Color Constants -- App Bundle (`0027__app`)

#### Custom SVG Icon Fill Default
```js
// Custom icon components default fill
const fill = "#1D1F25";  // dark charcoal (near-black)
const size = 16;         // default icon size in px
```

#### Decorative Dot Pattern SVG
```
#DEEDEF  -- light teal-gray (background dots)
#498591  -- medium teal (accent dots)
```

#### Toast/Alert Variant Colors (via CVA)
```
bg-[#31353e]   -- default toast background (dark charcoal)
bg-[#E85C4A]   -- destructive toast background (coral-red)
```

### 1.4 Hex Color Constants -- Chart Chunk (`0053_1889`)

#### Status/Sentiment Colors (Hardcoded Hex)

| Usage | Hex | Color | Context |
|-------|-----|-------|---------|
| Good background | `#E6FCE8` | Light green | Chart/badge good state |
| Good text | `#006400` | Dark green | Chart/badge good text |
| Good border | `#006400` | Dark green | Border-left accent |
| Bad background | `#FFF2FA` | Light pink | Chart/badge bad state |
| Bad text/border | `#B10F41` | Crimson | Badge bad text, border-left |
| Warning background | `#FFF6DD` | Light amber | Warning state |
| Warning text/border | `#AF6002` | Dark amber | Warning text, border-left |
| Neutral background | `#F1F5FF` | Light blue-gray | Neutral state |
| Neutral text/border | `#41454D` | Medium gray | Neutral text, border-left |
| Dark background | `#012D99` | Deep blue | Accent background |
| Placeholder | `#D9D9D9` | Light gray | Disabled/placeholder |

#### Text/UI Colors (Arbitrary Tailwind)
```
#1D1F25   -- primary dark text
#1D1F250D -- dark with 5% opacity (subtle backgrounds)
#1D1F2540 -- dark with 25% opacity (hover states)
#41454D   -- secondary text
#4a4d54   -- secondary text hover
#616670   -- tertiary text / muted
```

### 1.5 Hex Color Palette -- App Bundle (Full)

Organized by hue family. These appear in the `0027__app-7122b4604941924b.js` bundle:

#### Neutrals
```
#000000  -- black
#121926  -- near-black (darkest bg)
#1D1F25  -- charcoal (default icon fill)
#1F1F1F  -- dark gray
#181311  -- warm black
#202939  -- dark slate
#31353e  -- dark charcoal (toast bg)
#364152  -- slate
#4B5565  -- medium gray
#697586  -- gray
#9AA4B2  -- silver
#CDD5DF  -- light silver
#E3E8EF  -- light gray
#EEF2F6  -- near-white
#F8FAFC  -- off-white
#FCFCFD  -- almost-white
#FFFFFF  -- white
```

#### Teals / Greens
```
#1E2E35  -- dark teal
#335015  -- dark green
#3F611A  -- forest green
#4F7A21  -- green
#669F2A  -- bright green
#86CB3C  -- lime green
#ACDC79  -- light lime
#CDEAAF  -- very light lime
#E6F4D7  -- palest green
#F5FBEE  -- green tint
#FAFDF7  -- lightest green
```

#### Blues / Purples
```
#4E4BCC  -- purple
#6D68D4  -- medium purple
#918FF9  -- light purple
#D0CFFE  -- lavender
#ECEBFF  -- lightest lavender
#36C5F0  -- sky blue (Slack brand)
```

#### Oranges / Reds
```
#B93814  -- dark red-orange
#C7471B  -- red-orange
#CE511D  -- orange
#DF4F16  -- bright orange
#EF681F  -- light orange
#F38743  -- peach-orange
#F7B279  -- light peach
#F8DBAF  -- pale peach
#FCEAD7  -- lightest peach
#FEF6EE  -- peach tint
#FFF6EE  -- warmest white
#E85C4A  -- coral (destructive)
#CE4747  -- red
#DF3330  -- bright red
#F15959  -- light red
#FAD2D0  -- pink
#FFF0EF  -- lightest pink
#FC5F7F  -- hot pink
#FFD4E0  -- baby pink
#AB0A83  -- magenta
```

#### Yellows / Ambers
```
#342613  -- dark brown
#462416  -- warm brown
#684232  -- medium brown
#A07A69  -- tan
#D8AF5F  -- gold
#E9D4A0  -- light gold
#EBD8AB  -- pale gold
#F5E6C2  -- cream
#F9DC94  -- light amber
#FEF2D2  -- pale amber
#FDF7E7  -- lightest amber
#ECB22E  -- amber
#E2A712  -- dark amber
#FFC226  -- yellow
#FFC940  -- bright yellow
#FBF1DA  -- cream
#F8F6F2  -- warm white
#FEFAF5  -- warmest white
```

#### Warm Earth Tones
```
#321306  -- darkest brown
#772917  -- brown
#932F18  -- rust
#CFAB9B  -- beige
#ECDDD7  -- light beige
#F5EFEC  -- palest beige
#78896C  -- sage green
#2B4212  -- dark olive
```

### 1.6 Payment Provider Brand Colors (`0060_3108`)

```
#003087  -- PayPal blue (dark)
#009CDE  -- PayPal blue
#2BA6DF  -- PayPal blue (light)
#D9222A  -- Visa red
#0079BE  -- Diners Club blue
#000C9D  -- deep blue
#FEFEFE  -- card bg
#3F3A39  -- Mastercard dark
#F47216  -- Mastercard orange
#F2AE14  -- Mastercard gold
#EE9F2D  -- Amex gold
#EE4023  -- JCB red
#ffe700  -- yellow brand
#f37421  -- orange brand
#FFF100  -- bright yellow
#E30138  -- red brand
#D10429  -- dark red brand
#B3131B  -- deep red brand
#A5A5A5  -- gray brand
```

### 1.7 Landing Page / Marketing Colors (`0052_8869`)

```
#0A0A0A  -- near-black
#0D0D0D  -- dark background
#0F172A  -- dark slate
#1A1A1A  -- dark gray
#1A1A2E  -- dark blue-gray
#1B1B3A  -- dark purple-gray
#2A2A2A  -- charcoal
#2C2C2C  -- dark gray
#2D3748  -- slate
#3B82F6  -- Tailwind blue-500
#004E98  -- deep blue
#6E7681  -- medium gray
#8B6914  -- dark gold
#8B7355  -- warm gray
#A0B4C7  -- silver-blue
#C9A84C  -- gold
#D4AF37  -- gold
#D4C5A9  -- warm silver
#D5F0E8  -- light teal
#E5E5E5  -- light gray
#E8D5F5  -- lavender
#E8EDF2  -- light slate
#F1F5F9  -- off-white
#F5E0D5  -- peach
#F5F0E8  -- warm off-white
#FAFAFA  -- near-white
#FF0000  -- red
#FF0033  -- bright red
#FF6B35  -- orange
#FFF8F0  -- warmest white
#FFECD2  -- cream
```

### 1.8 Debug Color Palette (`0058_2386`)

A systematic color matrix for debug/console output (logging library):

```
#FF0000 #FF0033 #FF0066 #FF0099 #FF00CC #FF00FF
#FF3300 #FF3333 #FF3366 #FF3399 #FF33CC #FF33FF
#FF6600 #FF6633 #FF9900 #FF9933 #FFCC00 #FFCC33
#CC0000 #CC0033 #CC0066 #CC0099 #CC00CC #CC00FF
#CC3300 #CC3333 #CC3366 #CC3399 #CC33CC #CC33FF
#CC6600 #CC6633 #CC9900 #CC9933
#9933CC #9933FF #99CC00 #99CC33
... (full RGB matrix for debug console colors)
```

---

## 2. Semantic Color Token Scale (Tailwind)

Extracted from Tailwind class usage across all bundles. These map to CSS custom properties.

### Primary (Teal)
```
primary-50     -- lightest primary bg
primary-100    -- hover accent bg
primary-200    -- border, focus ring
primary-300    -- medium accent
primary-400    -- gradient start
primary-500    -- brand color
primary-600    -- active/prominent
primary-700    -- strong accent
primary-800    -- default text
primary-950    -- darkest primary / heading text
```

### Neutral
```
neutral-0      -- pure white
neutral-50     -- off-white bg
neutral-100    -- hover bg
neutral-200    -- borders
neutral-300    -- subtle borders
neutral-400    -- placeholder
neutral-500    -- muted text
neutral-600    -- secondary text
neutral-700    -- icon strokes
neutral-800    -- body text
neutral-8400   -- (typo/custom -- appears once)
neutral-900    -- strong text
neutral-950    -- near-black text
```

### Error (Red)
```
error-50       -- error bg
error-100      -- error border
error-300      -- error badge dot
error-400      -- error badge text
error-500      -- error heading text
```

### Warning (Amber)
```
warning-50     -- warning bg
warning-100    -- warning border
warning-200    -- warning border
warning-300    -- warning badge dot
warning-400    -- warning badge text
warning-500    -- warning strong
```

### Success (Green)
```
success-50     -- success bg
success-100    -- success border
success-400    -- success badge text
```

---

## 3. Redesign Tokens

A newer token namespace for the redesign system, using Tailwind custom classes:

```
redesign-warm-white       -- warm off-white background
redesign-black            -- pure black text
redesign-black-4          -- 4% opacity overlay
redesign-black-8          -- 8% opacity overlay
redesign-black-16         -- 16% opacity overlay
redesign-black-24         -- 24% opacity overlay
redesign-black-48         -- 48% opacity overlay
redesign-black-64         -- 64% opacity overlay
redesign-high             -- high contrast variant
redesign-body-default     -- body text size
redesign-body-small       -- small body text
```

---

## 4. Spacing / Sizing Constants

### 4.1 Max-Width Values (Content Containers)

| Class | Value | Context |
|-------|-------|---------|
| `max-w-[688px]` | 688px | Primary chat message container width |
| `sm:max-w-[688px]` | 688px | Chat container (responsive) |
| `max-w-[720px]` | 720px | Wider content container |
| `max-w-[640px]` | 640px | Chat page container |
| `max-w-[327px]` | 327px | Card / narrow element |
| `max-w-[250px]` | 250px | Compact element |
| `max-w-sm` | 384px | Small container |
| `max-w-md` | 448px | Medium container |
| `max-w-3xl` | 768px | Large container |
| `max-w-4xl` | 896px | Extra-large container |

### 4.2 Spacing Usage (Most Common, from chart chunk)

```
gap-2    (8px)   -- 49 uses  -- Primary component gap
gap-1    (4px)   -- 34 uses  -- Tight gap
gap-3    (12px)  -- 10 uses  -- Medium gap
gap-4    (16px)  -- 3 uses   -- Loose gap
px-4     (16px)  -- 23 uses  -- Primary horizontal padding
p-2      (8px)   -- 22 uses  -- Compact all-around padding
p-0      (0)     -- 20 uses  -- No padding
py-2     (8px)   -- 19 uses  -- Vertical padding
px-3     (12px)  -- 14 uses  -- Medium horizontal padding
px-1     (4px)   -- 12 uses  -- Tight horizontal padding
p-4      (16px)  -- 11 uses  -- Standard padding
```

### 4.3 Chart Container Aspect Ratio

```
aspect-[41/29]  -- Chart card aspect ratio (~1.414:1)
max-h-[320px]   -- Chart card max height
```

### 4.4 Z-Index Scale

```
z-0             -- base
z-1             -- minimal lift
z-2             -- slight lift
z-5             -- element overlay
z-10            -- standard overlay
z-20            -- elevated overlay
z-39            -- just below modal
z-40            -- overlay
z-50            -- top overlay
z-100           -- highest numeric z-index
z-modal         -- modal layer (custom token)
z-bottom-banner -- bottom banner (custom token)
```

### 4.5 Border Radius Scale Usage

```
rounded-full    -- 22 uses  -- Fully round (pills, avatars)
rounded-md      -- 22 uses  -- Medium radius
rounded-2xl     -- 18 uses  -- Large radius (cards)
rounded-lg      -- 14 uses  -- Standard radius
rounded-sm      -- 9 uses   -- Small radius
rounded-xl      -- 7 uses   -- Large radius
rounded-none    -- 6 uses   -- No radius
rounded-xs      -- Used for badges and tabs
rounded-[3px]   -- Toast container
rounded-[6px]   -- Tab pills
```

### 4.6 Shadow Scale Usage

```
shadow-2xs     -- Minimal elevation (badges, source pills)
shadow-xs      -- Subtle elevation
shadow-sm      -- Selected state
shadow-md      -- Hover state
shadow-xl      -- Elevated elements
shadow-2xl     -- Modal/popover
shadow-none    -- Flat/pressed state
shadow-redesign -- Custom redesign shadow
```

---

## 5. Typography Constants

### 5.1 System Font Stack (Error/Fallback)

**Source:** `0026_main-f911148da9e1c065.js`

```js
fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
```

### 5.2 Custom Typography Scale (Tailwind Utility Classes)

These are custom Tailwind utility classes mapping to text styles:

```
headline-2    -- Large heading (used in chart title 2xl variant)
headline-3    -- Medium heading (used in chart title xl variant, chat page)
label-1       -- Large label text
label-2       -- Standard label text (default chart title)
body-2        -- Body text
caption-1     -- Caption/small text
```

### 5.3 Tailwind Text Size Usage

| Class | Approx Size | Uses (chart) | Uses (app) |
|-------|-------------|--------------|------------|
| `text-xs` | 12px | 37 | 4 |
| `text-sm` | 14px | 39 | 14 |
| `text-base` | 16px | 5 | 1 |
| `text-lg` | 18px | 2 | -- |
| `text-xl` | 20px | 2 | 5 |
| `text-2xl` | 24px | 3 | 2 |
| `text-3xl` | 30px | 3 | 2 |

### 5.4 Font Weight Classes Observed

```
font-normal     -- body text
font-semibold   -- emphasized text, selected tabs
font-bold       -- headings, error titles
```

### 5.5 Font Variant Numeric (Tailwind Config)

From the Tailwind config resolver in the app bundle:

```
fvn-normal        -- normal-nums
fvn-ordinal       -- ordinal
fvn-slashed-zero  -- slashed-zero
fvn-figure        -- lining-nums, oldstyle-nums
fvn-spacing       -- proportional-nums, tabular-nums
fvn-fraction      -- diagonal-fractions, stacked-fractions
```

---

## 6. Animation / Transition Constants

### 6.1 Framer Motion Animations

**Source:** `0057__5BchatId_5D` (Chat Page), `0053_1889` (Chart Components)

#### Slide-in Panel (Chat Info Drawer)
```js
initial: { x: "100%" },
animate: { x: 0 },
exit:    { x: "100%" },
transition: {
  type: "spring",
  stiffness: 300,
  damping: 30,
}
```

#### Pulsing Dots (Loading Indicator)
```js
animate: "pulse",
transition: {
  staggerChildren: -0.2,
  staggerDirection: -1,
}
// Individual dot:
animate: {
  opacity: [.5, .5, 1, .5, .5],
  scale: [1, 1 + .5 * amplitude, 1],
},
transition: {
  delay: .12 * index,
  duration: 1,
  ease: "easeInOut",
  repeat: Infinity,
}
```

#### Opacity Dot Sequence (Typing Indicator)
```js
animate: {
  opacity: [0, 0, 1, 1, 0],
},
transition: {
  duration: 1.6,
  times: [0, .15 * index, .15 * index + .01, .7, .7 + .2],
  repeat: Infinity,
  ease: "linear",
}
```

#### Accordion Expand/Collapse
```js
initial: { height: 0, marginBottom: 0 },
animate: { height: "auto", marginBottom: 16 },
// Content fade:
animate: { opacity: [0, .1, 1] },
transition: { duration: .6 },
```

#### Fade-in Elements
```js
initial: { opacity: 0 },
animate: { opacity: 1 },
transition: {
  delay: shouldAnimate ? .15 * index : 0,
}
```

#### Progress Bar
```js
className: "transition-[width] duration-500 ease-out"
```

### 6.2 CSS Transition Classes (Frequency)

| Class | Uses | Purpose |
|-------|------|---------|
| `transition-shadow` | 9 | Card hover shadows |
| `transition-colors` | 12+ | Button/link color changes |
| `transition-opacity` | 4+ | Fade effects |
| `transition-all` | 4+ | General transitions |
| `transition-transform` | 1 | Banner slide |
| `transition-[width]` | 1 | Progress bar |
| `transition-[padding-left]` | 1 | Layout shift |
| `transition-[rotate]` | 1 | Chevron rotation |

### 6.3 Duration Classes

```
duration-150   -- Fast (hover feedback)
duration-200   -- Standard (micro-interactions)
duration-300   -- Medium (panel slide, banner)
duration-500   -- Slow (progress bar)
```

### 6.4 Easing Functions

```
ease-in        -- Accelerate
ease-out       -- Decelerate (most common)
ease-in-out    -- Smooth (pulsing, loaders)
"linear"       -- Constant (typing dots)
"easeInOut"    -- Framer Motion (pulsing dots)
```

---

## 7. Plotly Chart Configuration

### 7.1 Plotly Config Object

**Source:** `0053_1889-c64cad4788e7b7b9.js`

```js
config: {
  displayModeBar: false,
  displaylogo: false,
}
```

### 7.2 Color Application Logic

| Chart Type | Color Source | How Applied |
|------------|-------------|-------------|
| `donut` / `pie` | `eb` (6-color teal palette) | `marker.colors` |
| `stacked_bar` | `ey` (2-color teal) | `marker.color = ey[index % ey.length]` |
| `clustered_column` | `ey` (2-color teal) | `marker.color = ey[index % ey.length]` |
| `line` (positive) | `ew` (green) | `line.color = ew` |
| `line` (negative/decline) | Red HSLA | `line.color = "hsla(9, 90%, 48%, 1)"` |
| `scatter` | Per-data-point | `marker.color = data.map(d => d.marker_color)` |
| `bubble` | Per-data-point | `marker.color = data.map(d => d.marker_color)` |
| `bar` | Default | Plotly default |
| `histogram` | Default | Plotly default |

### 7.3 Chart Layout Schema (via Zod)

**Layout Object (`eR`):**
```
autosize:       boolean?
bargap:         number?
bargroupgap:    number?
barmode:        "stack" | "group" | "overlay" | "relative"
hovermode:      "closest" | "x" | "y" | false | "x unified" | "y unified"
legend:         LegendConfig?
margin:         MarginConfig?
paper_bgcolor:  string?
plot_bgcolor:   string?
showlegend:     boolean?
title:          TitleConfig?
xaxis:          XAxisConfig?
yaxis:          YAxisConfig?
```

**Margin Object (`eN`):**
```
b: number?  -- bottom
l: number?  -- left
pad: number?
r: number?  -- right
t: number?  -- top
```

**Legend Object (`ek`):**
```
orientation:  "v" | "h"
x:            number?
xanchor:      "auto" | "left" | "center" | "right"
y:            number?
yanchor:      "auto" | "top" | "middle" | "bottom"
```

**Title Object (`e_`):**
```
font:     { color?: string, family?: string, size?: number }
text:     string
x:        number?
xanchor:  "auto" | "left" | "center" | "right"
y:        number?
yanchor:  "auto" | "bottom" | "middle" | "top"
```

**X-Axis Object (`eS`):**
```
autorange:     boolean?
dtick:         number | string?
range:         (number | string)[]?
rangeselector: { buttons: any[] }?
rangeslider:   { visible: boolean }?
showgrid:      boolean?
tick0:         number | string?
tickangle:     number?
tickformat:    string?
tickmode:      "auto" | "linear" | "array"
title:         string | { text: string }
type:          "linear" | "log" | "date" | "category"
zeroline:      boolean?
```

**Y-Axis Object (`ez`):**
```
autorange:     boolean?
dtick:         number | string?
range:         (number | string)[]?
showgrid:      boolean?
tick0:         number | string?
tickformat:    string?
tickmode:      "auto" | "linear" | "array"
title:         string | { text: string }
type:          "linear" | "log" | "date" | "category"
zeroline:      boolean?
```

### 7.4 Chart Data Schemas

**Top-level Chart Object (`eM`):**
```
citation?: {
  citation_number: number,
  citation_on_click: any,
  citation_title?: string,
  entity?: Entity?,
}
data:    DataTrace[]  (array of eD)
layout?: LayoutConfig (eR)
title?:  string
```

**Data Trace (`eD`):**
```
data:                    DataPoint[]  (array of eT)
error_x?:               ConstantError | DataError
error_y?:               ConstantError | DataError
marker_colorbar_title?:  string
marker_colorscale?:      string | [number, string][]
marker_showscale?:       boolean
name:                    string  (required)
type:                    "bar" | "scatter" | "line" | "bubble" | "histogram" |
                         "box" | "candlestick" | "stacked_bar" |
                         "clustered_column" | "donut"
x_type?:                 "number" | "datetime" | "category"
```

**Data Point (`eT`):**
```
close?:              number
error_x_value?:      number
error_x_value_minus?: number
error_y_value?:      number
error_y_value_minus?: number
high?:               number
label?:              string
low?:                number
marker_color?:       number | string
marker_size?:        number
open?:               number
x:                   number | ISO-date-string | string
y?:                  number | null
```

**Error Bar (`eA` -- constant/percent):**
```
color?:       string
symmetric?:   boolean
thickness?:   number
type:         "constant" | "percent"
value?:       number
valueminus?:  number
visible?:     boolean
width?:       number
```

**Error Bar (`eI` -- data-driven):**
```
color?:       string
symmetric?:   boolean
thickness?:   number
type:         "data"
visible?:     boolean
width?:       number
```

### 7.5 Chart Title Display Modes

```
"line-title"   -- title displayed as line above chart
"basic-title"  -- standard chart title
```

---

## 8. Icon Configuration (Phosphor Icons)

### 8.1 IconBase Component Defaults

**Source:** `0027__app-7122b4604941924b.js` -- module ID `90584`

```js
// Default context values
const defaultContext = {
  color: "currentColor",
  size: "1em",
  weight: "regular",
  mirrored: false,
};
```

```jsx
// IconBase renders as:
<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size ?? contextSize}     // default: "1em"
  height={size ?? contextSize}    // default: "1em"
  fill={color ?? contextColor}    // default: "currentColor"
  viewBox="0 0 256 256"          // Phosphor standard viewBox
  transform={mirrored ? "scale(-1, 1)" : undefined}
>
```

### 8.2 Icon Weight Variants

Each icon is defined as a `Map` of weight variants with SVG path data:

```
"bold"       -- Thicker strokes
"duotone"    -- Two-tone with opacity layer
"fill"       -- Solid filled
"light"      -- Thin strokes
"regular"    -- Default weight
"thin"       -- Thinnest strokes
```

### 8.3 Icons Bundled in `0051_563`

```
CopyIcon
SpinnerIcon
CircleNotchIcon
UserCircleIcon
ShieldStarIcon
```

### 8.4 Custom SVG Icons (in `0027__app`)

Custom icons using size=16 viewBox="0 0 16 16" paradigm:

- Fill default: `#1D1F25`
- Size default: `16`

Additional SVG symbol icons defined inline:
```
Printer      -- viewBox "0 0 16 16"
SlackLogo    -- viewBox "0 0 16 16"
```

### 8.5 Progress Component (Radix UI)

**Source:** `0051_563-5d3a472a1ffe06f3.js` -- includes `@radix-ui/react-progress`

```js
// Progress component with indicator
displayName: "Progress"         // outer container
displayName: "ProgressIndicator" // inner bar
```

---

## 9. Zod Schemas -- Stream Events & UI State

### 9.1 Stream Event Types (`0055_774-e1971e2500ea1c79.js`)

The chat streaming system uses a discriminated union of 22 event types:

```ts
type StreamEvent =
  | { type: "stream_start"; chat_id: string; creator_user_id: string; user_chat_message_id: string; workspace_id: string }
  | { type: "task_update"; key: string; message: string; metadata?: Record<string, unknown>; plan_set: PlanSet; status: Status; title: string }
  | { type: "node_tool_event"; event: string; metadata?: Record<string, unknown>; node_id: string; plan_id: string; plan_set_id: string; ... }
  | { type: "node_report_preview_start"; entity: Entity; final_report: boolean; node_id: string; plan_id: string; plan_set_id: string; preview_id: string; ... }
  | { type: "node_report_preview_delta"; delta: string; node_id: string; plan_id: string; plan_set_id: string; preview_id: string; ... }
  | { type: "node_report_preview_done"; content: string; entity?: Entity; final_report: boolean; node_id: string; plan_id: string; plan_set_id: string; preview_id: string; ... }
  | { type: "node_tools_execution_start"; node_id: string; plan_id: string; plan_set_id: string; timestamp: number; tool_ids: string[]; total_tools: number }
  | { type: "update_message_clarification_message"; update: { chat_message_id: string; needs_clarification_message: string } }
  | { type: "message_delta"; delta: string }
  | { type: "pending_sources"; pending_sources: PendingSource[] }
  | { type: "references_found"; references: Entity[] }
  | { type: "done"; has_async_entities_pending?: boolean; message?: Message; }
  | { type: "ERROR"; error_message: string; error_type: string }
  | { type: "chat_title_generated"; title: string }
  | { type: "clarification_needed"; message: Message }
  | { type: "ai_message"; message: Message }
  | { type: "message_is_answer"; is_answer: boolean }
  | { type: "browser_use_start"; browser_session_id: string; browser_stream_url: string; timestamp: number }
  | { type: "browser_use_stop"; browser_session_id: string }
  | { type: "browser_use_await_user_input"; agent_message?: string; browser_session_id: string }
  | { type: "heartbeat" }
  | { type: "update_subagent_current_action"; current_action: string; node_id: string; plan_id: string; plan_set_id: string; ... }
```

### 9.2 Supporting Enum Types

```ts
// Task/loading status
type Status = "error" | "loading" | "success";

// Source type enum
type SourceType = "WEB" | "DOCUMENT" | "CODING_AGENT";
```

### 9.3 Pending Source Schema

```ts
type PendingSource = {
  plan_id: string;
  plan_set_id: string;
  plan_task_id: string;
  title: string;
  type: SourceType;       // "WEB" | "DOCUMENT" | "CODING_AGENT"
  web_domain: string | null;
};
```

### 9.4 Stream Envelope

```ts
type StreamEnvelope = {
  data: StreamEvent;
  timestamp: number;
};
```

---

## 10. CVA Component Variants

Component variants defined using `class-variance-authority` (module ID `47146`, function `.F()`).

### 10.1 Status Badge Card

```js
cva("relative p-6 rounded-xl", {
  defaultVariants: { variant: "default" },
  variants: {
    color: {
      bad:     "bg-[#FFF2FA] text-[#B10F41]",
      good:    "bg-[#E6FCE8] text-[#006400]",
      neutral: "bg-[#F1F5FF] text-[#41454D]",
      warning: "bg-[#FFF6DD] text-[#AF6002]",
    }
  }
})
```

### 10.2 Status Border Accent

```js
cva("border-l-4 pl-4", {
  variants: {
    color: {
      bad:     "border-l-[#B10F41]",
      good:    "border-l-[#006400]",
      neutral: "border-l-[#41454D]",
      warning: "border-l-[#AF6002]",
    }
  }
})
```

### 10.3 Source Pill

```js
cva("rounded-full flex items-center justify-center cursor-pointer relative group/source-pill focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-200", {
  variants: {
    variant: {
      "web-unselected": [
        "text-neutral-800 bg-neutral-50 shadow-2xs border border-neutral-200",
        "hover:bg-neutral-100 hover:border-neutral-300",
        "active:bg-neutral-200 active:border-neutral-400 active:shadow-none"
      ],
      "web-selected": "shadow-sm border bg-neutral-600 border-neutral-700 text-primary-50",
      "pro-unselected": [
        "text-primary-800 shadow-2xs bg-[linear-gradient(90deg,var(--color-primary-400)_0%,var(--color-primary-50)_100%)]",
        "hover:bg-[linear-gradient(90deg,var(--color-primary-600)_0%,var(--color-primary-100)_100%)]",
        "active:bg-primary-400 active:bg-none"
      ],
      "pro-selected": "shadow-sm border bg-primary-600 border-primary-700 text-primary-50",
    },
    size: {
      default: "h-6 px-1",
      sm:      "h-4",
    }
  },
  defaultVariants: { variant: "web-unselected", size: "default" }
})
```

### 10.4 Card Container

```js
cva("rounded border border-neutral-200 bg-neutral-0 shadow-2xs py-4 flex flex-col gap-1", {
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      dark:    "border-neutral-300 bg-neutral-100 text-primary-800",
      default: "",
      grid:    "bg-[url(/square-bg-tile-sm.svg)] bg-repeat-x bg-bottom",
    }
  }
})
```

### 10.5 Chat Message Container

```js
cva("max-w-full sm:max-w-[688px] mx-auto px-4 sm:px-8 flex mb-2 first:pt-4", {
  defaultVariants: { variant: "full" },
  variants: {
    variant: {
      full:       "w-full",
      left:       "pr-4 sm:pr-30",
      right:      "pl-4 sm:pl-30 justify-end",
      scrollable: "overflow-x-auto max-w-full pr-0 pl-4 sm:pl-[calc(50%-312px)]",
    }
  }
})
```

### 10.6 Chart Card

```js
cva("border flex flex-col justify-center p-0 transition-all duration-200 shrink-0 gap-0 w-full min-w-0 max-h-[320px] aspect-[41/29] overflow-hidden relative shadow-2xs hover:shadow-md", {
  defaultVariants: { size: "xs" },
  variants: {
    size: {
      md: "text-sm md:text-base",
      xs: "text-xs md:text-sm",
    }
  }
})
```

### 10.7 Chart Toolbar Header

```js
cva("border-b px-3 py-2 flex flex-row items-center gap-2 h-10 bg-primary-50", {
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "",
      error:   "bg-error-50 text-error-500",
      warning: "bg-warning-50 text-warning-500",
    }
  }
})
```

### 10.8 Chart Title Size

```js
cva("", {
  defaultVariants: { size: "default" },
  variants: {
    size: {
      "2xl":    "headline-2",
      default:  "label-2 line-clamp-2",
      xl:       "headline-3",
    }
  }
})
```

### 10.9 Badge / Tag

```js
cva("inline-flex shrink-0 items-center rounded-xs border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative", {
  defaultVariants: { variant: "default", size: "default" },
  variants: {
    variant: {
      default: [
        "text-primary-800 border-neutral-200 bg-neutral-50 hover:bg-neutral-100",
        "aria-selected:text-primary-950 aria-selected:border-primary-200 aria-selected:bg-primary-50 aria-selected:hover:bg-primary-100"
      ],
      primary: "text-primary-950 border-primary-200 bg-primary-50 hover:bg-primary-100",
      error:   "text-error-400 border-error-100 bg-error-50 hover:bg-error-100",
      warning: "text-warning-400 border-warning-200 bg-warning-50 hover:bg-warning-100",
      success: "text-success-400 border-success-100 bg-success-50 hover:bg-success-100",
    }
  }
})
```

### 10.10 Notification Dot

```js
cva("absolute -top-1 -right-1 w-2 h-2 rounded-full", {
  defaultVariants: { variant: "error" },
  variants: {
    variant: {
      error:   "bg-error-300",
      warning: "bg-warning-300",
    }
  }
})
```

### 10.11 Alert Box

```js
cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default:     "bg-background text-foreground",
      destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    }
  }
})
```

### 10.12 Toast

```js
cva("group pointer-events-auto relative flex w-fit items-center justify-center gap-4 overflow-hidden rounded-[3px] px-...", {
  // (partial extraction from minified code)
  variants: {
    variant: {
      default:     "bg-[#31353e] text-white",
      destructive: "bg-[#E85C4A] text-white",
    }
  }
})
```

### 10.13 Tab Trigger

```js
cva("... inline-flex items-center justify-center rounded-xs px-2 transition-all", {
  variants: {
    variant: {
      default: [
        "button-sm text-primary-800 hover:text-primary-950 border border-transparent h-6",
        "data-[state=active]:bg-neutral-0 data-[state=active]:border-neutral-200 data-[state=active]:text-primary-950"
      ]
    }
  }
})
```

### 10.14 Chart Layout Direction

```js
cva("group flex flex-col gap-4", {
  defaultVariants: { layout: "vertical" },
  variants: {
    layout: {
      horizontal: "flex-row",
      vertical:   "flex-col",
    }
  }
})
```

---

## Appendix: File Index

| File | Content | Key Tokens Found |
|------|---------|------------------|
| `0027__app-7122b4604941924b.js` | App shell, Framer Motion, Phosphor IconBase, CVA framework, Toast | Hex palette, IconBase defaults, animation, toast colors |
| `0053_1889-c64cad4788e7b7b9.js` | Chart components, GML components, CVA variants | HSLA chart palette, Plotly Zod schemas, CVA variants, status colors |
| `0055_774-e1971e2500ea1c79.js` | Stream connection, chat hooks | 22 stream event Zod schemas, status enums |
| `0057__5BchatId_5D-058fa92e7cc73e56.js` | Chat page UI | Animation constants, redesign tokens |
| `0051_563-5d3a472a1ffe06f3.js` | Phosphor icons, Radix Progress | Icon SVG data, weight variants |
| `0026_main-f911148da9e1c065.js` | Next.js main runtime | System font stack, error page |
| `0028_landing-00f33e9346c62673.js` | Landing page | Brand logos, CTA |
| `0052_8869-186e070c6edc2d8e.js` | UI components/themes | Marketing hex palette, gold/earth tones |
| `0058_2386-1f584ee4d249842e.js` | Debug/logging library | Debug color matrix |
| `0060_3108-10b48447b6595b7e.js` | Payment/billing | Payment provider brand colors |
