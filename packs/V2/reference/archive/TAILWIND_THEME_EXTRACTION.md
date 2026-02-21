# Tailwind v4 Theme Extraction

**Source:** `55ccf76ff5ccbea2.css` (212,769 bytes)
**Generator:** Tailwind CSS v4.0.7 (`/*! tailwindcss v4.0.7 | MIT License | https://tailwindcss.com */`)
**Extracted:** 2026-02-16

---

## 1. File Structure & @layer Map

```
Position 0-64:        Comment header
Position 65-15,572:   @layer theme     (15,507 chars)
Position 15,572-28,309: @layer base    (12,737 chars)
Position 28,309-31,515: @layer components (3,206 chars)
Position 31,515-196,791: @layer utilities (165,276 chars)
Position 196,791-199,298: Non-layered custom styles
Position 199,298-201,757: @font-face declarations (13 total)
Position 201,757-203,337: @keyframes declarations (13 total)
Position 203,337-208,090: @property declarations (76 total)
Position 208,090-212,660: Redesign theme overrides + custom redesign classes
Position 212,660-212,769: scrollbar-hide utilities
```

Each `@layer` appears exactly once. The ordering is: `theme` -> `base` -> `components` -> `utilities`.

---

## 2. @layer theme -- Full Custom Properties

The entire theme block lives inside `@layer theme { :host, :root { ... } }`.

### 2a. Font

```css
--font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
--font-family-sans: Geist, sans-serif;
--font-family-mono: "DM Mono", "Courier New", Courier, monospace;
```

### 2b. Color Palette (277 variables, 31 families)

**Color format distribution:**
- OKLCH: 231 variables (all standard Tailwind palette colors)
- Hex: 45 variables (neutral, black, custom semantic colors)
- var()/other: 1 variable (--color-text)

#### Standard Tailwind OKLCH Palette (22 families, 11 shades each: 50-950)

```css
/* RED */
--color-red-50: oklch(97.1% .013 17.38);
--color-red-100: oklch(93.6% .032 17.717);
--color-red-200: oklch(88.5% .062 18.334);
--color-red-300: oklch(80.8% .114 19.571);
--color-red-400: oklch(70.4% .191 22.216);
--color-red-500: oklch(63.7% .237 25.331);
--color-red-600: oklch(57.7% .245 27.325);
--color-red-700: oklch(50.5% .213 27.518);
--color-red-800: oklch(44.4% .177 26.899);
--color-red-900: oklch(39.6% .141 25.723);
--color-red-950: oklch(25.8% .092 26.042);

/* ORANGE */
--color-orange-50: oklch(98% .016 73.684);
--color-orange-100: oklch(95.4% .038 75.164);
--color-orange-200: oklch(90.1% .076 70.697);
--color-orange-300: oklch(83.7% .128 66.29);
--color-orange-400: oklch(75% .183 55.934);
--color-orange-500: oklch(70.5% .213 47.604);
--color-orange-600: oklch(64.6% .222 41.116);
--color-orange-700: oklch(55.3% .195 38.402);
--color-orange-800: oklch(47% .157 37.304);
--color-orange-900: oklch(40.8% .123 38.172);
--color-orange-950: oklch(26.6% .079 36.259);

/* AMBER */
--color-amber-50: oklch(98.7% .022 95.277);
--color-amber-100: oklch(96.2% .059 95.617);
--color-amber-200: oklch(92.4% .12 95.746);
--color-amber-300: oklch(87.9% .169 91.605);
--color-amber-400: oklch(82.8% .189 84.429);
--color-amber-500: oklch(76.9% .188 70.08);
--color-amber-600: oklch(66.6% .179 58.318);
--color-amber-700: oklch(55.5% .163 48.998);
--color-amber-800: oklch(47.3% .137 46.201);
--color-amber-900: oklch(41.4% .112 45.904);
--color-amber-950: oklch(27.9% .077 45.635);

/* YELLOW */
--color-yellow-50: oklch(98.7% .026 102.212);
--color-yellow-100: oklch(97.3% .071 103.193);
--color-yellow-200: oklch(94.5% .129 101.54);
--color-yellow-300: oklch(90.5% .182 98.111);
--color-yellow-400: oklch(85.2% .199 91.936);
--color-yellow-500: oklch(79.5% .184 86.047);
--color-yellow-600: oklch(68.1% .162 75.834);
--color-yellow-700: oklch(55.4% .135 66.442);
--color-yellow-800: oklch(47.6% .114 61.907);
--color-yellow-900: oklch(42.1% .095 57.708);
--color-yellow-950: oklch(28.6% .066 53.813);

/* LIME */
--color-lime-50: oklch(98.6% .031 120.757);
--color-lime-100: oklch(96.7% .067 122.328);
--color-lime-200: oklch(93.8% .127 124.321);
--color-lime-300: oklch(89.7% .196 126.665);
--color-lime-400: oklch(84.1% .238 128.85);
--color-lime-500: oklch(76.8% .233 130.85);
--color-lime-600: oklch(64.8% .2 131.684);
--color-lime-700: oklch(53.2% .157 131.589);
--color-lime-800: oklch(45.3% .124 130.933);
--color-lime-900: oklch(40.5% .101 131.063);
--color-lime-950: oklch(27.4% .072 132.109);

/* GREEN */
--color-green-50: oklch(98.2% .018 155.826);
--color-green-100: oklch(96.2% .044 156.743);
--color-green-200: oklch(92.5% .084 155.995);
--color-green-300: oklch(87.1% .15 154.449);
--color-green-400: oklch(79.2% .209 151.711);
--color-green-500: oklch(72.3% .219 149.579);
--color-green-600: oklch(62.7% .194 149.214);
--color-green-700: oklch(52.7% .154 150.069);
--color-green-800: oklch(44.8% .119 151.328);
--color-green-900: oklch(39.3% .095 152.535);
--color-green-950: oklch(26.6% .065 152.934);

/* EMERALD */
--color-emerald-50: oklch(97.9% .021 166.113);
--color-emerald-100: oklch(95% .052 163.051);
--color-emerald-200: oklch(90.5% .093 164.15);
--color-emerald-300: oklch(84.5% .143 164.978);
--color-emerald-400: oklch(76.5% .177 163.223);
--color-emerald-500: oklch(69.6% .17 162.48);
--color-emerald-600: oklch(59.6% .145 163.225);
--color-emerald-700: oklch(50.8% .118 165.612);
--color-emerald-800: oklch(43.2% .095 166.913);
--color-emerald-900: oklch(37.8% .077 168.94);
--color-emerald-950: oklch(26.2% .051 172.552);

/* TEAL */
--color-teal-50: oklch(98.4% .014 180.72);
--color-teal-100: oklch(95.3% .051 180.801);
--color-teal-200: oklch(91% .096 180.426);
--color-teal-300: oklch(85.5% .138 181.071);
--color-teal-400: oklch(77.7% .152 181.912);
--color-teal-500: oklch(70.4% .14 182.503);
--color-teal-600: oklch(60% .118 184.704);
--color-teal-700: oklch(51.1% .096 186.391);
--color-teal-800: oklch(43.7% .078 188.216);
--color-teal-900: oklch(38.6% .063 188.416);
--color-teal-950: oklch(27.7% .046 192.524);

/* CYAN */
--color-cyan-50: oklch(98.4% .019 200.873);
--color-cyan-100: oklch(95.6% .045 203.388);
--color-cyan-200: oklch(91.7% .08 205.041);
--color-cyan-300: oklch(86.5% .127 207.078);
--color-cyan-400: oklch(78.9% .154 211.53);
--color-cyan-500: oklch(71.5% .143 215.221);
--color-cyan-600: oklch(60.9% .126 221.723);
--color-cyan-700: oklch(52% .105 223.128);
--color-cyan-800: oklch(45% .085 224.283);
--color-cyan-900: oklch(39.8% .07 227.392);
--color-cyan-950: oklch(30.2% .056 229.695);

/* SKY */
--color-sky-50: oklch(97.7% .013 236.62);
--color-sky-100: oklch(95.1% .026 236.824);
--color-sky-200: oklch(90.1% .058 230.902);
--color-sky-300: oklch(82.8% .111 230.318);
--color-sky-400: oklch(74.6% .16 232.661);
--color-sky-500: oklch(68.5% .169 237.323);
--color-sky-600: oklch(58.8% .158 241.966);
--color-sky-700: oklch(50% .134 242.749);
--color-sky-800: oklch(44.3% .11 240.79);
--color-sky-900: oklch(39.1% .09 240.876);
--color-sky-950: oklch(29.3% .066 243.157);

/* BLUE */
--color-blue-50: oklch(97% .014 254.604);
--color-blue-100: oklch(93.2% .032 255.585);
--color-blue-200: oklch(88.2% .059 254.128);
--color-blue-300: oklch(80.9% .105 251.813);
--color-blue-400: oklch(70.7% .165 254.624);
--color-blue-500: oklch(62.3% .214 259.815);
--color-blue-600: oklch(54.6% .245 262.881);
--color-blue-700: oklch(48.8% .243 264.376);
--color-blue-800: oklch(42.4% .199 265.638);
--color-blue-900: oklch(37.9% .146 265.522);
--color-blue-950: oklch(28.2% .091 267.935);

/* INDIGO */
--color-indigo-50: oklch(96.2% .018 272.314);
--color-indigo-100: oklch(93% .034 272.788);
--color-indigo-200: oklch(87% .065 274.039);
--color-indigo-300: oklch(78.5% .115 274.713);
--color-indigo-400: oklch(67.3% .182 276.935);
--color-indigo-500: oklch(58.5% .233 277.117);
--color-indigo-600: oklch(51.1% .262 276.966);
--color-indigo-700: oklch(45.7% .24 277.023);
--color-indigo-800: oklch(39.8% .195 277.366);
--color-indigo-900: oklch(35.9% .144 278.697);
--color-indigo-950: oklch(25.7% .09 281.288);

/* VIOLET */
--color-violet-50: oklch(96.9% .016 293.756);
--color-violet-100: oklch(94.3% .029 294.588);
--color-violet-200: oklch(89.4% .057 293.283);
--color-violet-300: oklch(81.1% .111 293.571);
--color-violet-400: oklch(70.2% .183 293.541);
--color-violet-500: oklch(60.6% .25 292.717);
--color-violet-600: oklch(54.1% .281 293.009);
--color-violet-700: oklch(49.1% .27 292.581);
--color-violet-800: oklch(43.2% .232 292.759);
--color-violet-900: oklch(38% .189 293.745);
--color-violet-950: oklch(28.3% .141 291.089);

/* PURPLE */
--color-purple-50: oklch(97.7% .014 308.299);
--color-purple-100: oklch(94.6% .033 307.174);
--color-purple-200: oklch(90.2% .063 306.703);
--color-purple-300: oklch(82.7% .119 306.383);
--color-purple-400: oklch(71.4% .203 305.504);
--color-purple-500: oklch(62.7% .265 303.9);
--color-purple-600: oklch(55.8% .288 302.321);
--color-purple-700: oklch(49.6% .265 301.924);
--color-purple-800: oklch(43.8% .218 303.724);
--color-purple-900: oklch(38.1% .176 304.987);
--color-purple-950: oklch(29.1% .149 302.717);

/* FUCHSIA */
--color-fuchsia-50: oklch(97.7% .017 320.058);
--color-fuchsia-100: oklch(95.2% .037 318.852);
--color-fuchsia-200: oklch(90.3% .076 319.62);
--color-fuchsia-300: oklch(83.3% .145 321.434);
--color-fuchsia-400: oklch(74% .238 322.16);
--color-fuchsia-500: oklch(66.7% .295 322.15);
--color-fuchsia-600: oklch(59.1% .293 322.896);
--color-fuchsia-700: oklch(51.8% .253 323.949);
--color-fuchsia-800: oklch(45.2% .211 324.591);
--color-fuchsia-900: oklch(40.1% .17 325.612);
--color-fuchsia-950: oklch(29.3% .136 325.661);

/* PINK */
--color-pink-50: oklch(97.1% .014 343.198);
--color-pink-100: oklch(94.8% .028 342.258);
--color-pink-200: oklch(89.9% .061 343.231);
--color-pink-300: oklch(82.3% .12 346.018);
--color-pink-400: oklch(71.8% .202 349.761);
--color-pink-500: oklch(65.6% .241 354.308);
--color-pink-600: oklch(59.2% .249 .584);
--color-pink-700: oklch(52.5% .223 3.958);
--color-pink-800: oklch(45.9% .187 3.815);
--color-pink-900: oklch(40.8% .153 2.432);
--color-pink-950: oklch(28.4% .109 3.907);

/* ROSE */
--color-rose-50: oklch(96.9% .015 12.422);
--color-rose-100: oklch(94.1% .03 12.58);
--color-rose-200: oklch(89.2% .058 10.001);
--color-rose-300: oklch(81% .117 11.638);
--color-rose-400: oklch(71.2% .194 13.428);
--color-rose-500: oklch(64.5% .246 16.439);
--color-rose-600: oklch(58.6% .253 17.585);
--color-rose-700: oklch(51.4% .222 16.935);
--color-rose-800: oklch(45.5% .188 13.697);
--color-rose-900: oklch(41% .159 10.272);
--color-rose-950: oklch(27.1% .105 12.094);

/* SLATE */
--color-slate-50: oklch(98.4% .003 247.858);
--color-slate-100: oklch(96.8% .007 247.896);
--color-slate-200: oklch(92.9% .013 255.508);
--color-slate-300: oklch(86.9% .022 252.894);
--color-slate-400: oklch(70.4% .04 256.788);
--color-slate-500: oklch(55.4% .046 257.417);
--color-slate-600: oklch(44.6% .043 257.281);
--color-slate-700: oklch(37.2% .044 257.287);
--color-slate-800: oklch(27.9% .041 260.031);
--color-slate-900: oklch(20.8% .042 265.755);
--color-slate-950: oklch(12.9% .042 264.695);

/* GRAY */
--color-gray-50: oklch(98.5% .002 247.839);
--color-gray-100: oklch(96.7% .003 264.542);
--color-gray-200: oklch(92.8% .006 264.531);
--color-gray-300: oklch(87.2% .01 258.338);
--color-gray-400: oklch(70.7% .022 261.325);
--color-gray-500: oklch(55.1% .027 264.364);
--color-gray-600: oklch(44.6% .03 256.802);
--color-gray-700: oklch(37.3% .034 259.733);
--color-gray-800: oklch(27.8% .033 256.848);
--color-gray-900: oklch(21% .034 264.665);
--color-gray-950: oklch(13% .028 261.692);

/* ZINC */
--color-zinc-50: oklch(98.5% 0 0);
--color-zinc-100: oklch(96.7% .001 286.375);
--color-zinc-200: oklch(92% .004 286.32);
--color-zinc-300: oklch(87.1% .006 286.286);
--color-zinc-400: oklch(70.5% .015 286.067);
--color-zinc-500: oklch(55.2% .016 285.938);
--color-zinc-600: oklch(44.2% .017 285.786);
--color-zinc-700: oklch(37% .013 285.805);
--color-zinc-800: oklch(27.4% .006 286.033);
--color-zinc-900: oklch(21% .006 285.885);
--color-zinc-950: oklch(14.1% .005 285.823);

/* STONE */
--color-stone-50: oklch(98.5% .001 106.423);
--color-stone-100: oklch(97% .001 106.424);
--color-stone-200: oklch(92.3% .003 48.717);
--color-stone-300: oklch(86.9% .005 56.366);
--color-stone-400: oklch(70.9% .01 56.259);
--color-stone-500: oklch(55.3% .013 58.071);
--color-stone-600: oklch(44.4% .011 73.639);
--color-stone-700: oklch(37.4% .01 67.558);
--color-stone-800: oklch(26.8% .007 34.298);
--color-stone-900: oklch(21.6% .006 56.043);
--color-stone-950: oklch(14.7% .004 49.25);
```

#### Custom Hex Color Families (OVERRIDDEN neutral + custom semantic)

```css
/* NEUTRAL (hex -- overrides TW default) */
--color-neutral-50: #fafafa;
--color-neutral-100: #f2f2f2;
--color-neutral-200: #e6e6e6;
--color-neutral-300: #bdbdbd;
--color-neutral-400: #999;
--color-neutral-500: #737373;
--color-neutral-600: #666;
--color-neutral-700: #525252;
--color-neutral-800: #454545;
--color-neutral-900: #3d3d3d;
--color-neutral-950: #1f1f1f;
--color-neutral-0: #fff;

/* BLACK */
--color-black: #000;
```

#### Custom Semantic Color Families (hex)

```css
/* PRIMARY (custom teal/dark-cyan palette -- hex) */
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
--color-primary-50: #f1f7f9;

/* ERROR (red semantic) */
--color-error-500: #570d00;
--color-error-400: #931b06;
--color-error-300: #e92d0c;
--color-error-200: #f77e69;
--color-error-100: #feccc2;
--color-error-50: #fff2f0;

/* WARNING (amber semantic) */
--color-warning-500: #562701;
--color-warning-400: #8f440a;
--color-warning-300: #f09c00;
--color-warning-200: #ffd485;
--color-warning-100: #ffeebd;
--color-warning-50: #fff7db;

/* SUCCESS (green semantic) */
--color-success-500: #0c2f04;
--color-success-400: #34552a;
--color-success-300: #5b9a42;
--color-success-200: #89c171;
--color-success-100: #c7e4b9;
--color-success-50: #eef6e9;

/* CIRCLE (status/indicator) */
--color-circle-green: #8ca78b;
--color-circle-orange: #f08000;
--color-circle-yellow: #e9aa35;
```

#### Meta/Alias Variable

```css
--color-text: var(--color-primary-950);
```

### 2c. Spacing

```css
--spacing: .25rem;
```

### 2d. Breakpoints

```css
--breakpoint-sm: 40rem;   /* 640px */
--breakpoint-md: 48rem;   /* 768px */
--breakpoint-lg: 64rem;   /* 1024px */
--breakpoint-xl: 80rem;   /* 1280px */
--breakpoint-2xl: 96rem;  /* 1536px */
```

### 2e. Container Sizes

```css
--container-3xs: 16rem;
--container-2xs: 18rem;
--container-xs: 20rem;
--container-sm: 24rem;
--container-md: 28rem;
--container-lg: 32rem;
--container-xl: 36rem;
--container-2xl: 42rem;
--container-3xl: 48rem;
--container-4xl: 56rem;
--container-5xl: 64rem;
--container-6xl: 72rem;
--container-7xl: 80rem;
```

### 2f. Typography Scale

```css
--text-xs: .75rem;        --text-xs--line-height: calc(1/.75);
--text-sm: .875rem;       --text-sm--line-height: calc(1.25/.875);
--text-base: 1rem;        --text-base--line-height: calc(1.5/1);
--text-lg: 1.125rem;      --text-lg--line-height: calc(1.75/1.125);
--text-xl: 1.25rem;       --text-xl--line-height: calc(1.75/1.25);
--text-2xl: 1.5rem;       --text-2xl--line-height: calc(2/1.5);
--text-3xl: 2rem;         --text-3xl--line-height: calc(2.25/1.875);
--text-4xl: 2.25rem;      --text-4xl--line-height: calc(2.5/2.25);
--text-5xl: 3rem;         --text-5xl--line-height: 1;
--text-6xl: 3.75rem;      --text-6xl--line-height: 1;
--text-7xl: 4.5rem;       --text-7xl--line-height: 1;
--text-8xl: 6rem;         --text-8xl--line-height: 1;
--text-9xl: 8rem;         --text-9xl--line-height: 1;
```

### 2g. Font Weights

```css
--font-weight-thin: 100;
--font-weight-extralight: 200;
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

### 2h. Letter Spacing

```css
--tracking-tighter: -.02em;
--tracking-tight: -.00625em;
--tracking-normal: 0em;
--tracking-wide: .025em;
--tracking-wider: .05em;
--tracking-widest: .1em;

/* CUSTOM (not standard TW) */
--tracking-tighter-2: -.025em;
--tracking-tighter-3: -.0275em;
```

### 2i. Line Height

```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### 2j. Border Radius

```css
--radius-xs: .125rem;
--radius-sm: 2px;
--radius-md: 4px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-3xl: 24px;
--radius-4xl: 2rem;

/* CUSTOM (not standard TW) */
--radius-none: 0px;
--radius-full: 9999px;
```

### 2k. Shadows

```css
--shadow-2xs: 0px 1px 4px 0px #1f1f1f0a;
--shadow-xs: 0 1px 2px 0 #0000000d;
--shadow-sm: 0px 2px 4px 0px #1f1f1f14;
--shadow-md: 0px 4px 8px 0px #1f1f1f14;
--shadow-lg: 0px 8px 16px 0px #1f1f1f1a;
--shadow-xl: 0px 12px 24px 0px #1f1f1f1f;
--shadow-2xl: 0 25px 50px -12px #00000040;

--inset-shadow-2xs: inset 0 1px #0000000d;
--inset-shadow-xs: inset 0 1px 1px #0000000d;
--inset-shadow-sm: inset 0 2px 4px #0000000d;

--drop-shadow-xs: 0 1px 1px #0000000d;
--drop-shadow-sm: 0 1px 2px #00000026;
--drop-shadow-md: 0 3px 3px #0000001f;
--drop-shadow-lg: 0 4px 4px #00000026;
--drop-shadow-xl: 0 9px 7px #0000001a;
--drop-shadow-2xl: 0 25px 25px #00000026;

--text-shadow-2xs: 0px 1px 0px #00000026;
--text-shadow-xs: 0px 1px 1px #0003;
--text-shadow-sm: 0px 1px 0px #00000013, 0px 1px 1px #00000013, 0px 2px 2px #00000013;
--text-shadow-md: 0px 1px 1px #0000001a, 0px 1px 2px #0000001a, 0px 2px 4px #0000001a;
--text-shadow-lg: 0px 1px 2px #0000001a, 0px 3px 2px #0000001a, 0px 4px 8px #0000001a;

/* CUSTOM shadow */
--shadow-md-glow: 0px 4px 44px 10px #f2f8f9, 0px 6px 12px -6px #1f1f1f0d;
```

### 2l. Blur

```css
--blur-xs: 4px;
--blur-sm: 8px;
--blur-md: 12px;
--blur-lg: 16px;
--blur-xl: 24px;
--blur-2xl: 40px;
--blur-3xl: 64px;
```

### 2m. Perspective

```css
--perspective-dramatic: 100px;
--perspective-near: 300px;
--perspective-normal: 500px;
--perspective-midrange: 800px;
--perspective-distant: 1200px;
```

### 2n. Easing & Animation

```css
--ease-in: cubic-bezier(.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, .2, 1);
--ease-in-out: cubic-bezier(.4, 0, .2, 1);

--animate-spin: spin 1s linear infinite;
--animate-ping: ping 1s cubic-bezier(0, 0, .2, 1) infinite;
--animate-pulse: pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;
--animate-bounce: bounce 1s infinite;

/* CUSTOM animations */
--animate-pulse-scale: pulse-scale 8s infinite ease-in-out;
--animate-pulse-scale-mini: pulse-scale-mini 8s infinite ease-in-out;
```

### 2o. Defaults & Aspect Ratio

```css
--aspect-video: 16/9;
--default-transition-duration: .15s;
--default-transition-timing-function: cubic-bezier(.4, 0, .2, 1);
--default-font-family: var(--font-family-sans);
--default-font-feature-settings: normal;
--default-font-variation-settings: normal;
--default-mono-font-family: var(--font-family-mono);
--default-mono-font-feature-settings: normal;
--default-mono-font-variation-settings: normal;
```

### 2p. Custom Design System Variables

```css
/* Z-index scale */
--z-index-bottom-banner: 1000;
--z-index-bottom-banner-background: 999;
--z-index-modal: 50;
--z-index-dropdown: 40;
--z-index-tooltip: 30;
--z-index-header: 20;
--z-index-base: 10;

/* Other custom tokens */
--font-size-body: 14px;
--border: var(--color-neutral-200);
--background: var(--color-primary-50);
```

---

## 3. @font-face Declarations (13 total)

### Font 1: Geist (variable font)

```css
@font-face {
  font-family: Geist;
  src: url(/static/font/Geist-Variable.ttf) format("truetype");
  font-weight: 100 900;
  font-display: swap;
}
```

### Font 2: Seasons Sans (13 individual weights/styles)

| Weight | Style  | File                               |
|--------|--------|------------------------------------|
| 300    | normal | /static/font/ATSeasonSans-Light.ttf         |
| 300    | italic | /static/font/ATSeasonSans-LightItalic.ttf   |
| 400    | normal | /static/font/ATSeasonSans-Regular.ttf       |
| 400    | italic | /static/font/ATSeasonSans-RegularItalic.ttf |
| 500    | normal | /static/font/ATSeasonSans-Medium.ttf        |
| 500    | italic | /static/font/ATSeasonSans-MediumItalic.ttf  |
| 600    | normal | /static/font/ATSeasonSans-SemiBold.ttf      |
| 600    | italic | /static/font/ATSeasonSans-SemiBoldItalic.ttf|
| 700    | normal | /static/font/ATSeasonSans-Bold.ttf          |
| 700    | italic | /static/font/ATSeasonSans-BoldItalic.ttf    |
| 800    | normal | /static/font/ATSeasonSans-Heavy.ttf         |
| 800    | italic | /static/font/ATSeasonSans-HeavyItalic.ttf   |

All served as TTF from `/static/font/`. Font prefix "AT" suggests **A-Type foundry** ("ATSeasonSans").

**Note:** "DM Mono" (used for `--font-family-mono`) has NO @font-face -- it's loaded externally (likely Google Fonts or a CDN link in HTML `<head>`).

---

## 4. Tool Signatures & Design Token Provenance

### Comments
Only one comment exists in the entire file:
```css
/*! tailwindcss v4.0.7 | MIT License | https://tailwindcss.com */
```

### Findings
- **No** `@import` directives
- **No** `@source` directives
- **No** `@custom-media` definitions
- **No** `@utility` blocks
- **No** `--token-*`, `--ds-*`, `--dt-*` variable prefixes
- **No** Figma, Style Dictionary, or Tokens Studio references
- **No** design system package references
- **No** generator/version tags beyond the Tailwind comment

### Analysis
The CSS is a clean Tailwind v4 production build with **no evidence of external design token tooling**. The custom color palette (primary, error, warning, success, circle) and custom variables (z-index scale, tracking variants, shadow-md-glow) were defined directly in a Tailwind v4 CSS-first config file (likely `app.css` or similar with `@theme` blocks). The "Seasons Sans" font files with "AT" prefix point to a commercially licensed typeface from A-Type foundry, manually configured.

---

## 5. @keyframes -- All 13 Animations

```css
@keyframes fadeSlideIn {
  0% {
    opacity: 0;
    background-color: #0000;
    transform: translateY(-8px);
  }
  40% {
    opacity: 1;
    background-color: #ffe08259;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    background-color: #0000;
    transform: translateY(0);
  }
}

@keyframes enter {
  0% {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0)
               scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1))
               rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0)
               scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1))
               rotate(var(--tw-exit-rotate, 0));
  }
}

@keyframes spin {
  to { transform: rotate(1turn); }
}

@keyframes ping {
  75%, to { opacity: 0; transform: scale(2); }
}

@keyframes pulse {
  50% { opacity: .5; }
}

@keyframes bounce {
  0%, to {
    animation-timing-function: cubic-bezier(.8, 0, 1, 1);
    transform: translateY(-25%);
  }
  50% {
    animation-timing-function: cubic-bezier(0, 0, .2, 1);
    transform: none;
  }
}

/* CUSTOM keyframes */
@keyframes pulse-scale {
  0%, to { transform: scale(1); }
  50% { transform: scale(1.5); }
}

@keyframes pulse-scale-mini {
  0%, to { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes shimmerLine {
  0% { transform: translate(-100%); }
  to { transform: translate(100%); }
}

@keyframes accordion-down {
  0% { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  0% { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

@keyframes infinite-slide {
  0% { transform: translate(0); }
  to { transform: translate(-25%); }
}
```

**Custom (non-standard Tailwind):** `fadeSlideIn`, `pulse-scale`, `pulse-scale-mini`, `shimmerLine`, `accordion-down`, `accordion-up`, `infinite-slide`

**Standard Tailwind:** `spin`, `ping`, `pulse`, `bounce`

**From tailwindcss-animate (Radix/shadcn):** `enter`, `exit`, `accordion-down`, `accordion-up`

---

## 6. @container Query Definitions (4 total)

```css
/* Container query 1 -- md equivalent (28rem = 448px) */
@container (width >= 28rem) {
  .\@md\:grid { display: grid; }
  .\@md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .\@md\:gap-x-4 { column-gap: calc(var(--spacing) * 4); }
}

/* Container query 2 -- 3xl equivalent (48rem = 768px) */
@container (width >= 48rem) {
  .\@3xl\:block { display: block; }
  .\@3xl\:w-1\/4 { width: 25%; }
  .\@3xl\:w-3\/4 { width: 75%; }
  .\@3xl\:flex-row { flex-direction: row; }
  .\@3xl\:pr-5 { padding-right: calc(var(--spacing) * 5); }
  .\@3xl\:pl-0 { padding-left: calc(var(--spacing) * 0); }
}

/* Container query 3 -- custom breakpoint (45.5rem = 728px) */
@container (width >= 45.5rem) {
  .\[\@container\(min-width\:45\.5rem\)\]\:\[grid-template-columns\:repeat\(auto-fit\,minmax\(22rem\,1fr\)\)\] {
    grid-template-columns: repeat(auto-fit, minmax(22rem, 1fr));
  }
}

/* Container query 4 -- custom breakpoint (91rem = 1456px) */
@container (width >= 91rem) {
  .\[\@container\(min-width\:91rem\)\]\:\[grid-template-columns\:repeat\(auto-fit\,minmax\(22rem\,28\.5rem\)\)\] {
    grid-template-columns: repeat(auto-fit, minmax(22rem, 28.5rem));
  }
  .\[\@container\(min-width\:91rem\)\]\:justify-start {
    justify-content: flex-start;
  }
}
```

Container-type declarations found in utilities:
- `container-type: inline-size` (standard for width-based queries)
- `container-type: size` (for both width+height queries)

No named containers (`container-name`) found.

---

## 7. @custom-media

**None found.** No `@custom-media` definitions exist in this file.

---

## 8. ShadCN/UI Base Layer Variables (from @layer base)

### Light mode (:root)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: .5rem;
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;
  --overlay-bg: hsl(var(--primary) / .24);
  --overlay-border: hsl(var(--border));
}
```

### Second :root override (app-specific)

```css
:root {
  --foreground: var(--color-primary-950);
  --overlay-bg: #1d2d343d;
  --overlay-border: #dbdbdb;
  color: var(--color-primary-950);
}
```

### Dark mode (.dark)

```css
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --sidebar-background: 240 5.9% 10%;
  --sidebar-foreground: 240 4.8% 95.9%;
  --sidebar-primary: 224.3 76.3% 48%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 240 3.7% 15.9%;
  --sidebar-accent-foreground: 240 4.8% 95.9%;
  --sidebar-border: 240 3.7% 15.9%;
  --sidebar-ring: 217.2 91.2% 59.8%;
  --overlay-bg: hsl(var(--primary) / .24);
  --overlay-border: hsl(var(--border));
}
```

---

## 9. Redesign Theme Overrides (`data-theme="redesign"`)

This is the complete recipe for the "redesign" variant. Applied via `:root[data-theme=redesign]`.

### 9a. CSS Custom Properties (the core theme switch)

```css
:root[data-theme=redesign] {
  /* Brand colors */
  --warm-white: #fff5e9;
  --black: #161616;
  --purple-accent: #62034a;

  /* Primary scale -- HSLA opacity-based on near-black (#161616 = hsl(0,0%,9%)) */
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

  /* Neutral scale -- also opacity-based on near-black */
  --color-neutral-950: hsl(0, 0%, 9%);
  --color-neutral-900: hsla(0, 0%, 9%, 0.8);
  --color-neutral-800: hsla(0, 0%, 9%, 0.78);
  --color-neutral-700: hsla(0, 0%, 9%, 0.72);
  --color-neutral-600: hsla(0, 0%, 9%, 0.64);
  --color-neutral-500: hsla(0, 0%, 9%, 0.48);
  --color-neutral-400: hsla(0, 0%, 9%, 0.24);
  --color-neutral-300: hsla(0, 0%, 9%, 0.16);
  --color-neutral-200: hsla(0, 0%, 9%, 0.08);
  --color-neutral-100: #ede5dd;
  --color-neutral-50: #fff5e9;
  --color-neutral-0: #ffffff;

  /* Text */
  --color-text: var(--black);

  /* ShadCN overrides */
  --background: 33 100% 96%;       /* warm white as HSL */
  --foreground: 0 0% 9%;           /* near-black */

  /* Shadow system -- 3-tier: low, low-hover, high */
  --shadow-low: 0px 0px 1px 0px rgba(0,0,0,0.32),
                0px 0px 2px 0px rgba(0,0,0,0.08),
                0px 1px 3px 0px rgba(0,0,0,0.08);
  --shadow-low-hover: 0px 0px 1px 0px rgba(0,0,0,0.32),
                      0px 0px 3px 0px rgba(0,0,0,0.17),
                      0px 1px 4px 0px rgba(0,0,0,0.18);
  --shadow-high: 0px 0px 1px 0px rgba(0,0,0,0.61),
                 0px 0px 2px 0px rgba(0,0,0,0.41),
                 0px 3px 4px 0px rgba(0,0,0,0.15),
                 0px 6px 8px 0px rgba(0,0,0,0.15),
                 0px 12px 16px 0px rgba(0,0,0,0.2),
                 0px 18px 32px 0px rgba(0,0,0,0.26);

  /* Shadow aliases -- map TW shadow scale to 3-tier system */
  --shadow-2xs: var(--shadow-low);
  --shadow-sm: var(--shadow-low);
  --shadow-md: var(--shadow-low-hover);
  --shadow-md-glow: var(--shadow-low-hover);
  --shadow-lg: var(--shadow-high);
  --shadow-xl: var(--shadow-high);

  /* Font families -- switch from Geist to Seasons Sans */
  --font-family-sans: "Seasons Sans", -apple-system, BlinkMacSystemFont,
                      "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: "DM Mono", "Courier New", Courier, monospace;
  --font-sans-medium: "Seasons Sans", -apple-system, BlinkMacSystemFont,
                      "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  --font-sans-semibold: "Seasons Sans", -apple-system, BlinkMacSystemFont,
                        "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
  --font-sans-bold: "Seasons Sans", -apple-system, BlinkMacSystemFont,
                    "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
}
```

### 9b. Body & Global Rules

```css
:root[data-theme=redesign] body {
  color: var(--black);
  font-family: var(--font-family-sans);
}

.redesign-bg-warm,
:root[data-theme=redesign] body {
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

### 9c. Typography Overrides (prose/report content)

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

### 9d. Redesign Utility Classes

```css
/* Backgrounds */
.redesign-bg-warm    { background-color: var(--warm-white); }
.redesign-bg-black   { background-color: var(--black); }

/* Text */
.redesign-text-black { color: var(--black); }
.redesign-text-warm  { color: var(--warm-white); }

/* Shadows */
.redesign-shadow-low  { box-shadow: var(--shadow-low); }
.redesign-shadow-high { box-shadow: var(--shadow-high); }

/* Borders */
.redesign-border-black { border-color: var(--black); }

/* Heading typography */
.redesign-heading-xl {
  font-family: var(--font-sans-bold);
  font-size: 44px;
  line-height: 1;
  letter-spacing: -.88px;
  font-weight: 500;
}

.redesign-heading-lg {
  font-family: var(--font-sans-bold);
  font-size: 32px;
  line-height: 1.1;
}

.redesign-heading-md {
  font-family: var(--font-sans-medium);
  font-size: 22px;
  line-height: 1.1;
  letter-spacing: -.22px;
}

/* Body typography */
.redesign-body {
  font-family: var(--font-sans-medium);
  font-size: 18px;
  line-height: normal;
}

.redesign-body-semibold {
  font-family: var(--font-sans-semibold);
  font-size: 18px;
  line-height: normal;
  letter-spacing: -.18px;
}

/* Title styles */
.redesign-title-large {
  color: var(--black);
  font-family: var(--font-sans-medium);
  font-size: 38px;
  font-style: normal;
  font-weight: 580;
  line-height: normal;
}

.redesign-title-medium {
  color: var(--black);
  font-family: var(--font-sans-medium);
  font-size: 24px;
  font-style: normal;
  font-weight: 580;
  line-height: normal;
}

/* Header/body size variants */
.redesign-header-small {
  color: var(--black);
  font-family: var(--font-sans-semibold);
  font-size: 16px;
  font-style: normal;
  font-weight: 650;
  line-height: normal;
}

.redesign-body-default {
  color: var(--black);
  font-family: var(--font-sans-medium);
  font-size: 16px;
  font-style: normal;
  font-weight: 550;
  line-height: normal;
}

.redesign-body-small {
  color: var(--black);
  font-family: var(--font-sans-medium);
  font-size: 13px;
  font-style: normal;
  font-weight: 550;
  line-height: normal;
}

/* Mono labels */
.redesign-label-mono-large {
  color: #979aa0;
  font-family: var(--font-family-mono);
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
}

.redesign-label-mono-small {
  color: #616670;
  font-family: var(--font-family-mono);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: .24px;
}

/* Gradient text */
.redesign-gradient-text-pink {
  background: linear-gradient(90deg, #65064d, #fac4f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 10. Custom Non-Tailwind Utilities & Component Classes

### From @layer base (custom utility classes)

```css
/* Z-index utilities */
.z-base                    { z-index: var(--z-index-base); }
.z-header                  { z-index: var(--z-index-header); }
.z-tooltip                 { z-index: var(--z-index-tooltip); }
.z-dropdown                { z-index: var(--z-index-dropdown); }
.z-modal                   { z-index: var(--z-index-modal); }
.z-bottom-banner           { z-index: var(--z-index-bottom-banner); }
.z-bottom-banner-background { z-index: var(--z-index-bottom-banner-background); }

/* Zoom utilities */
.zoom-50  { zoom: .5; }
.zoom-75  { zoom: .75; }
.zoom-100 { zoom: 1; }
.zoom-150 { zoom: 1.5; }
.zoom-200 { zoom: 2; }
.zoom-300 { zoom: 3; }

/* Shimmer animation system */
.text-shimmer {
  color: inherit; display: inline-block; position: relative; overflow: hidden;
}
.text-shimmer:after {
  content: "";
  pointer-events: none;
  filter: blur(1px);
  background: linear-gradient(90deg, #fff0, #ffffff1a 40%, #fff9 50%, #ffffff1a 60%, #fff0);
  width: 200%; height: 100%;
  position: absolute; top: 0; left: -150%;
  transform: translate(100%);
}
.shimmer-delay-0:after { animation: shimmerLine 2s ease-in-out infinite; }
.shimmer-delay-1:after { animation: shimmerLine 2s ease-in-out .2s infinite; }
.shimmer-delay-2:after { animation: shimmerLine 2s ease-in-out .4s infinite; }
.shimmer-delay-3:after { animation: shimmerLine 2s ease-in-out .6s infinite; }
.shimmer-delay-4:after { animation: shimmerLine 2s ease-in-out .8s infinite; }
.shimmer-delay-5:after { animation: shimmerLine 2s ease-in-out 1s infinite; }
.shimmer-delay-6:after { animation: shimmerLine 2s ease-in-out 1.2s infinite; }
.shimmer-delay-7:after { animation: shimmerLine 2s ease-in-out 1.4s infinite; }
.shimmer-delay-8:after { animation: shimmerLine 2s ease-in-out 1.6s infinite; }
.shimmer-delay-9:after { animation: shimmerLine 2s ease-in-out 1.8s infinite; }
```

### From @layer components (prose/report typography)

The entire `@layer components` block contains typography/spacing rules for `.gml-primarycolumn` and `.report-prose` content scopes. These are the rich text rendering rules for report/document content.

### Non-layered custom classes (outside all @layer blocks)

```css
/* Code syntax highlighting (rehype-pretty-code) */
[data-rehype-pretty-code-fragment]          { color: hsl(0 0 100%/1); position: relative; }
[data-rehype-pretty-code-fragment] code     { /* grid layout, no background, line counter reset */ }
[data-rehype-pretty-code-fragment] .line    { /* inline-block, padding */ }
[data-rehype-pretty-code-fragment] .line--highlighted  { /* zinc-700 50% bg */ }
[data-rehype-pretty-code-fragment] .word--highlighted  { /* zinc-700 50% bg, border */ }
[data-rehype-pretty-code-title]             { /* sm text, medium weight */ }

/* Sidebar variables */
.sidebar-vars-default { --sidebar-width: 16rem; --sidebar-width-icon: 3rem; }
.sidebar-vars-mobile  { --sidebar-width: 18rem; }

/* Skeleton loading widths */
.skeleton-width-50 { max-width: 50%; }
.skeleton-width-60 { max-width: 60%; }
.skeleton-width-70 { max-width: 70%; }
.skeleton-width-80 { max-width: 80%; }
.skeleton-width-90 { max-width: 90%; }

/* Scroll utilities */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Scroll fade mask */
.scroll-fade-mask {
  --scroll-fade-mask-height: 0px;
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - var(--scroll-fade-mask-height)), #0000 100%);
  mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - var(--scroll-fade-mask-height)), #0000 100%);
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
}
.scroll-fade-mask-default { --scroll-fade-mask-height: 32px; }
.scroll-fade-mask-40      { --scroll-fade-mask-height: 40px; }

/* Lottie player */
.lf-player-container { width: 100%; height: 100%; }

/* Word break */
.break-word-hard { word-break: break-word; }

/* Next.js layout */
#__next, body, html { height: 100%; }
#__next { flex-direction: column; display: flex; }

/* Font smoothing (global) */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
```

---

## 11. @property Declarations (76 total)

All 76 are standard Tailwind v4 internal properties (prefixed `--tw-`). None are custom. Full list:

```
--tw-translate-x, --tw-translate-y, --tw-translate-z,
--tw-scale-x, --tw-scale-y, --tw-scale-z,
--tw-rotate-x, --tw-rotate-y, --tw-rotate-z,
--tw-skew-x, --tw-skew-y,
--tw-pan-x, --tw-pan-y, --tw-pinch-zoom,
--tw-scroll-snap-strictness,
--tw-space-y-reverse, --tw-space-x-reverse,
--tw-divide-x-reverse, --tw-divide-y-reverse,
--tw-border-style,
--tw-gradient-position, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to,
--tw-gradient-stops, --tw-gradient-via-stops,
--tw-gradient-from-position, --tw-gradient-via-position, --tw-gradient-to-position,
--tw-leading, --tw-font-weight, --tw-tracking,
--tw-ordinal, --tw-slashed-zero, --tw-numeric-figure, --tw-numeric-spacing, --tw-numeric-fraction,
--tw-shadow, --tw-shadow-color, --tw-inset-shadow, --tw-inset-shadow-color,
--tw-ring-color, --tw-ring-shadow, --tw-inset-ring-color, --tw-inset-ring-shadow,
--tw-ring-inset, --tw-ring-offset-width, --tw-ring-offset-color, --tw-ring-offset-shadow,
--tw-outline-style,
--tw-blur, --tw-brightness, --tw-contrast, --tw-grayscale, --tw-hue-rotate,
--tw-invert, --tw-opacity, --tw-saturate, --tw-sepia, --tw-drop-shadow,
--tw-backdrop-blur, --tw-backdrop-brightness, --tw-backdrop-contrast,
--tw-backdrop-grayscale, --tw-backdrop-hue-rotate, --tw-backdrop-invert,
--tw-backdrop-opacity, --tw-backdrop-saturate, --tw-backdrop-sepia,
--tw-duration, --tw-ease,
--tw-contain-size, --tw-contain-layout, --tw-contain-paint, --tw-contain-style,
--tw-content
```

---

## 12. Summary of Key Findings

| Aspect | Default Theme | Redesign Theme |
|--------|--------------|----------------|
| **Primary font** | Geist (variable, 100-900) | Seasons Sans (A-Type, 300-800) |
| **Mono font** | DM Mono | DM Mono (unchanged) |
| **Background** | `#f1f7f9` (cool blue-white) | `#fff5e9` (warm white) |
| **Text color** | `#1d2d34` (dark teal) | `#161616` (near-black) |
| **Primary palette** | Teal/cyan hex scale | Single-hue HSLA opacity scale on `#161616` |
| **Neutral palette** | Custom hex grays | HSLA opacity scale on `#161616` + warm tones |
| **Shadow system** | 7-level (2xs through 2xl) | 3-tier (low/low-hover/high) mapped to TW names |
| **Color format** | OKLCH (standard TW), hex (custom) | HSLA (primary/neutral), hex (brand) |
| **Brand accent** | None | `--purple-accent: #62034a` |
| **Gradient** | None | Pink gradient: `#65064d` to `#fac4f7` |
| **Font weights** | Standard numeric (400, 500, 600, 700) | Custom numeric (440, 500, 550, 580, 600, 650) |

### Design Philosophy Shift
- **Default:** Cool-toned, teal-cyan professional palette. Geist sans-serif. Tailwind-native OKLCH colors.
- **Redesign:** Warm-toned, editorial aesthetic. Serif-inflected "Seasons Sans" typeface. Opacity-based color scale from a single near-black base. Warm white (`#fff5e9`) background. Simplified 3-tier shadow system. Purple brand accent with pink gradient for emphasis.
