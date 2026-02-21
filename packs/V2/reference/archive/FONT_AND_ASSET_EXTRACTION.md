# Font & Asset Extraction Report

**Source file:** `55ccf76ff5ccbea2.css` (212,769 bytes, minified)
**Generated:** 2026-02-16

---

## 1. @font-face Declarations

### 1.1 Geist (Variable Font)

| Property       | Value                                       |
|----------------|---------------------------------------------|
| font-family    | `Geist`                                     |
| src            | `url(/static/font/Geist-Variable.ttf) format("truetype")` |
| font-weight    | `100 900` (variable, full range)            |
| font-style     | _(not specified, defaults to normal)_       |
| font-display   | `swap`                                      |
| unicode-range  | _(not specified)_                           |

### 1.2 Seasons Sans (12 Static Weights)

Airtable's custom brand font. The `AT` prefix in filenames (`ATSeasonSans-*`) confirms this is **Airtable Seasons Sans** -- a proprietary/licensed typeface.

| Weight | Style    | File                                      |
|--------|----------|-------------------------------------------|
| 300    | normal   | `/static/font/ATSeasonSans-Light.ttf`     |
| 300    | italic   | `/static/font/ATSeasonSans-LightItalic.ttf` |
| 400    | normal   | `/static/font/ATSeasonSans-Regular.ttf`   |
| 400    | italic   | `/static/font/ATSeasonSans-RegularItalic.ttf` |
| 500    | normal   | `/static/font/ATSeasonSans-Medium.ttf`    |
| 500    | italic   | `/static/font/ATSeasonSans-MediumItalic.ttf` |
| 600    | normal   | `/static/font/ATSeasonSans-SemiBold.ttf`  |
| 600    | italic   | `/static/font/ATSeasonSans-SemiBoldItalic.ttf` |
| 700    | normal   | `/static/font/ATSeasonSans-Bold.ttf`      |
| 700    | italic   | `/static/font/ATSeasonSans-BoldItalic.ttf` |
| 800    | normal   | `/static/font/ATSeasonSans-Heavy.ttf`     |
| 800    | italic   | `/static/font/ATSeasonSans-HeavyItalic.ttf` |

All 12 declarations share:
- `font-family: Seasons Sans`
- `format("truetype")`
- `font-display: swap`
- No `unicode-range` specified

### 1.3 Font Stack Summary

The CSS defines font stacks via custom properties:

| Token                   | Default (:root)            | Redesign Theme (`[data-theme=redesign]`)                                     |
|-------------------------|----------------------------|-----------------------------------------------------------------------------|
| `--font-family-sans`    | `Geist, sans-serif`        | `"Seasons Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif` |
| `--font-family-mono`    | `"DM Mono", "Courier New", Courier, monospace` | _(same)_ |
| `--font-sans-medium`    | _(not set)_                | `"Seasons Sans", -apple-system, ...` (same system stack) |
| `--font-sans-semibold`  | _(not set)_                | `"Seasons Sans", -apple-system, ...` |
| `--font-sans-bold`      | _(not set)_                | `"Seasons Sans", -apple-system, ...` |
| `--font-serif`          | `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` | _(same)_ |

**Key insight:** The redesign theme switches from Geist to Seasons Sans as the primary typeface. The weight-specific font-family vars (`--font-sans-medium`, etc.) suggest the redesign may use separate font files per weight rather than relying on `font-weight` alone, possibly to work around rendering differences.

---

## 2. All External URL References

### 2.1 Font Files (14 total)

| URL                                              | Type     |
|--------------------------------------------------|----------|
| `/static/font/Geist-Variable.ttf`               | TTF (variable) |
| `/static/font/ATSeasonSans-Light.ttf`            | TTF      |
| `/static/font/ATSeasonSans-LightItalic.ttf`      | TTF      |
| `/static/font/ATSeasonSans-Regular.ttf`          | TTF      |
| `/static/font/ATSeasonSans-RegularItalic.ttf`    | TTF      |
| `/static/font/ATSeasonSans-Medium.ttf`           | TTF      |
| `/static/font/ATSeasonSans-MediumItalic.ttf`     | TTF      |
| `/static/font/ATSeasonSans-SemiBold.ttf`         | TTF      |
| `/static/font/ATSeasonSans-SemiBoldItalic.ttf`   | TTF      |
| `/static/font/ATSeasonSans-Bold.ttf`             | TTF      |
| `/static/font/ATSeasonSans-BoldItalic.ttf`       | TTF      |
| `/static/font/ATSeasonSans-Heavy.ttf`            | TTF      |
| `/static/font/ATSeasonSans-HeavyItalic.ttf`      | TTF      |

All fonts served as `.ttf` (TrueType) from `/static/font/`. No `.woff2` or `.woff` variants detected -- notable since WOFF2 would be ~30% smaller. This suggests either the build doesn't optimize font formats, or WOFF2 is handled at a CDN/server layer.

### 2.2 SVG Background Images (4 unique)

| URL                                    | Usage Context                |
|----------------------------------------|------------------------------|
| `/content-library-header.svg`          | Background image (appears 2x)|
| `/content-library-power-bar-bg.svg`    | Background image             |
| `/square-bg-tile-sm.svg`              | Background tile pattern      |
| `/square-bg-tile.svg`                 | Background tile pattern (appears 2x) |

These are served from the root path `/`, not `/static/`. They relate to the "Content Library" feature.

### 2.3 Data URIs

**None found.** Zero `data:` URI references in the entire CSS file. All assets are externally loaded.

---

## 3. Design Tool Artifacts

### 3.1 Comments

Only one comment survived minification:

```css
/*! tailwindcss v4.0.7 | MIT License | https://tailwindcss.com */
```

This is the Tailwind CSS license banner (the `/*!` prefix preserves it through minification). Confirms **Tailwind CSS v4.0.7** as the CSS framework.

### 3.2 Figma / Style Dictionary References

**None found.** No Figma plugin markers, Style Dictionary output patterns, or design tool metadata present in the CSS.

### 3.3 Design System Token Patterns

The CSS uses a two-layer token system:

**Layer 1 -- Tailwind v4 Theme Tokens (`:root`):**
Standard Tailwind v4 `@theme` output using `@layer theme` with `@property` declarations for type-safe custom properties. Uses oklch color space for standard palette colors.

**Layer 2 -- Airtable Custom Tokens (`:root` overrides):**
Application-specific semantic tokens layered on top:

```
--color-primary-{50-950}     Teal/dark cyan palette (#1d2d34 to #f1f7f9)
--color-neutral-{0-950}      Neutral grays (#fff to #1f1f1f)
--color-error-{50-500}       Red error palette (#fff2f0 to #570d00)
--color-warning-{50-500}     Amber warning palette (#fff7db to #562701)
--color-success-{50-500}     Green success palette (#eef6e9 to #0c2f04)
--color-circle-green         #8ca78b
--color-circle-orange        #f08000
--color-circle-yellow        #e9aa35
--color-text                 var(--color-primary-950)
```

**Layer 3 -- Redesign Theme (`[data-theme=redesign]`):**
Overrides nearly everything with a warm monochrome palette:

```
--warm-white:   #fff5e9
--black:        #161616
--purple-accent: #62034a
```

The redesign theme replaces the teal primary palette with opacity-based variants of pure black (`hsl(0,0%,9%)`), switches the background to warm white (`33 100% 96%`), and introduces custom shadow tokens (`--shadow-low`, `--shadow-low-hover`, `--shadow-high`).

### 3.4 Class Name Patterns

No `.ds-*`, `.token-*`, or `.figma-*` class patterns found. The class naming is a mix of:
- Tailwind utility classes (majority)
- shadcn/ui component classes (`.sidebar-vars-default`, `.sidebar-vars-mobile`, `.skeleton-width-*`)
- Custom component classes (`.toast`, `.toaster`, `.scroll-fade-mask`, `.button-sm/md/lg`, `.label-1`, `.label-2`)

### 3.5 Component Library: Radix UI / shadcn/ui

Strong evidence of **Radix UI** primitives with **shadcn/ui** styling:

**Radix data attributes found:**
- `[data-state=open|closed|active|checked|unchecked|hidden|visible]`
- `[data-side=top|right|bottom|left]`
- `[data-motion=from-start|from-end|to-start|to-end]`
- `[data-swipe=move|end|cancel]`
- `[data-highlighted]`
- `[data-disabled]`
- `[data-active=true]`
- `[data-slot=navigation-menu-link]`
- `[data-viewport=false]`
- `[data-outline]`
- `[data-line-numbers]`

**Radix CSS custom properties:**
- `--radix-accordion-content-height`
- `--radix-dropdown-menu-content-available-height`
- `--radix-navigation-menu-viewport-height`
- `--radix-navigation-menu-viewport-width`
- `--radix-select-trigger-height`
- `--radix-select-trigger-width`
- `--radix-toast-swipe-end-x`
- `--radix-toast-swipe-move-x`

**shadcn/ui semantic tokens** (HSL-based, classic shadcn pattern):
```
--background, --foreground, --card, --card-foreground, --popover, --popover-foreground,
--primary, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground,
--accent, --accent-foreground, --destructive, --destructive-foreground, --border, --input, --ring,
--chart-1 through --chart-5, --sidebar-* (8 tokens), --radius
```

### 3.6 Additional Libraries Detected

- **rehype-pretty-code**: Syntax highlighting (`[data-rehype-pretty-code-fragment]`, `[data-rehype-pretty-code-title]`, `[data-line-numbers]`)
- **DM Mono**: Monospace font reference in `--font-family-mono`

---

## 4. CSS @import Statements

**None found.** The file is fully self-contained with no `@import` directives.

---

## 5. Vendor Prefixes & Build Toolchain Analysis

### 5.1 Vendor Prefix Inventory

| Prefix / Property                    | Count | Purpose                        |
|--------------------------------------|-------|--------------------------------|
| `-webkit-backdrop-filter`            | 7     | Blur/filter effects (Safari)   |
| `-webkit-line-clamp`                 | 6     | Text truncation                |
| `-webkit-box-decoration-break`       | 5     | Box decoration handling        |
| `-webkit-scrollbar` (+ track/thumb/corner/button) | 4+3+3+1+1 = 12 | Custom scrollbar styling |
| `-webkit-font-smoothing`            | 4     | Antialiasing (antialiased)     |
| `-webkit-box-orient` / `-webkit-box` | 4+3   | Legacy flexbox (line-clamp)    |
| `-moz-osx-font-smoothing`           | 4     | Antialiasing (Firefox/macOS)   |
| `-ms-overflow-style`                | 3     | Scrollbar hiding (IE/Edge)     |
| `-webkit-hyphens`                   | 3     | Text hyphenation               |
| `-webkit-user-select`               | 2     | Selection control              |
| `-webkit-text-decoration`           | 2     | Text decoration                |
| `-webkit-datetime-edit-*`           | 9     | Date/time input styling        |
| `-webkit-background-clip`           | 2     | Text gradient effects          |
| `-webkit-appearance`                | 2     | Form control reset             |
| `-webkit-text-size-adjust`          | 1     | Viewport text scaling          |
| `-webkit-text-fill-color`           | 1     | Text color override            |
| `-webkit-tap-highlight-color`       | 1     | Touch highlight removal        |
| `-webkit-search-decoration`         | 1     | Search input styling           |
| `-webkit-mask-*` (image/repeat/size)| 3     | Mask effects                   |
| `-webkit-inner/outer-spin-button`   | 2     | Number input spinners          |
| `-webkit-calendar-picker-indicator` | 1     | Calendar picker                |
| `-webkit-date-and-time-value`       | 1     | Date value styling             |
| `-moz-ui-invalid`                   | 1     | Firefox invalid state          |
| `-moz-focusring`                    | 1     | Firefox focus ring             |

### 5.2 Modern CSS Features Used

- **`@property`**: 78 CSS Houdini custom property registrations (all `--tw-*` variables). This is a Tailwind v4 feature for type-safe animations and transitions.
- **`@layer`**: `theme`, `base`, `components`, `utilities` (Tailwind v4 cascade layers)
- **`@supports`**: Feature queries for backdrop-filter and Apple Pay button appearance
- **`oklch()` color space**: Used for all standard Tailwind palette colors
- **CSS Container Queries / Media Queries**: Modern `width >= X` syntax (CSS Media Queries Level 4)
- **`forced-colors: active`**: Windows High Contrast mode support
- **`prefers-reduced-motion`**: Motion preference respect

### 5.3 Build Toolchain Deductions

| Signal                              | Conclusion                                           |
|--------------------------------------|-----------------------------------------------------|
| `/*! tailwindcss v4.0.7 */`          | Tailwind CSS v4.0.7                                 |
| `@layer theme/base/components/utilities` | Tailwind v4 layer system (not v3)               |
| `@property --tw-*`                   | Tailwind v4 CSS-native approach (no PostCSS transforms) |
| `[vite:css]`, `[vite:html]` in escaped selectors | **Vite** as bundler               |
| Hash in filename `55ccf76ff5ccbea2`  | Content-hashed output (Vite default)                |
| Vendor prefixes present              | Autoprefixer or Lightning CSS (likely Lightning CSS, which ships with Tailwind v4) |
| No `@import`, single file            | CSS is bundled/concatenated at build time            |
| Minified, no sourcemap reference     | Production build with minification enabled           |

---

## 6. Z-Index System

Custom z-index scale defined as design tokens:

| Token                                 | Value |
|---------------------------------------|-------|
| `--z-index-base`                     | 10    |
| `--z-index-header`                   | 20    |
| `--z-index-tooltip`                  | 30    |
| `--z-index-dropdown`                 | 40    |
| `--z-index-modal`                    | 50    |
| `--z-index-bottom-banner-background` | 999   |
| `--z-index-bottom-banner`            | 1000  |

---

## 7. Theming Architecture Summary

The CSS implements a **three-layer theming system**:

1. **`:root` (Tailwind v4 theme)** -- Standard Tailwind palette in oklch, spacing, typography, shadows, etc. Primary brand color is a teal/cyan palette (`#1d2d34` to `#f1f7f9`). Default sans font: **Geist**.

2. **`:root` (shadcn/ui overrides)** -- HSL-based semantic tokens for the component library. Classic shadcn/ui pattern with light/dark mode support via `.dark` class.

3. **`[data-theme=redesign]`** -- A complete visual redesign that:
   - Replaces Geist with **Seasons Sans** as the primary typeface
   - Switches to a warm monochrome aesthetic (`--warm-white: #fff5e9`, `--black: #161616`)
   - Introduces `--purple-accent: #62034a`
   - Converts the primary/neutral palettes from hex values to opacity-based hsla variants
   - Redefines the shadow system with multi-layer box-shadows
   - Sets `--font-size-body: 14px`

The redesign theme is toggled via `data-theme="redesign"` on the root element, suggesting a feature-flagged or A/B-tested design refresh.

---

## 8. Actionable Notes for Clone/Rebuild

1. **Font acquisition needed**: Both Geist (open source, from Vercel) and Seasons Sans (Airtable proprietary, `ATSeasonSans-*` files) must be obtained or substituted.
2. **Font format optimization**: The source only serves TTF. For production, generate WOFF2 versions for ~30% size savings.
3. **SVG assets needed**: 4 SVG files from root path: `content-library-header.svg`, `content-library-power-bar-bg.svg`, `square-bg-tile-sm.svg`, `square-bg-tile.svg`.
4. **No data URIs to extract**: All assets are external references.
5. **Tailwind v4 required**: The CSS uses v4-specific features (@property, @layer theme, oklch colors). Cannot be reproduced with Tailwind v3.
6. **Theme switching**: Must implement `[data-theme=redesign]` attribute toggling and `.dark` class toggling for full theme support.
7. **Radix UI + shadcn/ui**: Component styling depends on Radix data attributes. Use shadcn/ui v2+ with Radix primitives.
