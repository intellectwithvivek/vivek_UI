# VivekUI — Design & Architecture Document

**A zero-runtime-dependency React UI library for React and Next.js**
Draft v0.2 · August 2026 · Author: Vivek Kumar Singh

> Package name used throughout: `vivek-ui` (placeholder). Verify availability with `npm view vivek-ui` before scaffolding; fallback is a scoped name like `@vivekui/react`, which requires creating a free npm organization.

---

## 1. Vision

One install. Zero configuration. Every building block of a website.

```bash
npm install vivek-ui     # or: yarn add vivek-ui / pnpm add vivek-ui
```

```tsx
// Next.js: app/layout.tsx  |  Vite/CRA: main.tsx — import the stylesheet ONCE
import 'vivek-ui/styles.css'

// then anywhere in the app
import { Navbar, Hero, FeatureGrid, Pricing, Footer, Button } from 'vivek-ui'
```

That is the entire setup. No Tailwind config, no PostCSS plugin, no Babel plugin, no required ThemeProvider, no extra packages beyond React itself.

### 1.1 What "zero dependency" means precisely

The **published package** has an empty `dependencies` field. `react` and `react-dom` are declared as `peerDependencies` only (never bundled — bundling React causes duplicate-React hook errors in consumer apps). Our own repo uses `devDependencies` (TypeScript, tsup, Vitest, etc.) for building and testing; these never reach the user's `node_modules`. This distinction should be stated in the README, because "zero dependency" is the core marketing promise and it must be verifiable with `npm ls`.

### 1.2 Product principles

1. **One install, one CSS import, nothing else.** If a user needs a second step, that is a bug in the design.
2. **Props-first customization.** Every visual decision a typical user wants (variant, size, tone, alignment, spacing, layout) is reachable through props. Deep rebranding happens through CSS variables, not a config file or a new syntax to learn.
3. **Sections, not just atoms — the differentiator.** MUI, Chakra and Ant give primitives; shadcn gives copy-paste snippets. VivekUI ships full, installable, prop-driven page sections: Navbar, Hero, Footer, Pricing, Testimonials, Sidebar. A user should be able to assemble a complete landing page from imports alone.
4. **Server-first, Next.js native.** Static components are React Server Component–safe; only genuinely interactive components carry `'use client'`.
5. **Accessible by default.** Keyboard support, focus management and ARIA are part of each component's definition of done, not an afterthought.
6. **Boring, stable APIs.** Predictable prop names shared across components, semver discipline, deprecation warnings before removals.
7. **Total coverage as the end state.** The catalog target is "install `vivek-ui` and never need a second UI package" — icons, charts and data tables included as subpaths of the same install. Completeness is free for *users* (tree-shaking means unused components never reach their bundle) but not free for *us*, so coverage grows in tiers (§12) — never at the cost of shipping.

### 1.3 Non-goals (scope control)

Not goals *for v1.0*, but firmly on the roadmap as Tier B/C (§12): charts, DataTable, combobox, date-picker. Never goals: a utility-class CSS framework, a rich-text editor, a scientific data-viz engine (our charts target the common 90% — dashboards and product sites, not research plotting), a theming DSL. Sequencing is the discipline that gets the total-coverage vision shipped instead of abandoned at thirty half-finished components.

---

## 2. High-Level Architecture

```
+----------------------------------------------------------+
|  L4 - SITE SECTIONS (the differentiator)                 |
|  Navbar - Hero - Footer - Sidebar - Pricing - FAQ - CTA  |
|  FeatureGrid - Testimonials - Stats                      |
+----------------------------------------------------------+
|  L3 - COMPOSITE COMPONENTS                               |
|  Tabs - Accordion - Modal - Drawer - Dropdown - Toast    |
|  Table - Pagination - Tooltip - Popover                  |
+----------------------------------------------------------+
|  L2 - PRIMITIVES                                         |
|  Button - Input - Card - Badge - Avatar - Stack - Grid   |
|  Heading - Text - Divider - Spinner - Skeleton           |
+----------------------------------------------------------+
|  L1 - BASE STYLES        reset.css + global.css          |
+----------------------------------------------------------+
|  L0 - DESIGN TOKENS      CSS custom properties           |
|  --vk-color-* - --vk-space-* - --vk-radius-* - --vk-*    |
+----------------------------------------------------------+
     Internal, not public API:  hooks/  utils/  (focus trap,
     scroll lock, portal, roving tabindex, cx, Slot ...)
```

Dependency rules: a layer may only depend on layers below it. Sections (L4) are compositions of primitives and composites — they contain almost no new styling logic, which keeps them cheap to build and consistent to theme. Internal hooks and utils are shared across layers but are **not exported** from the package entry point, so they can be refactored freely without a major version bump.

---

## 3. Styling Strategy (ADR-003 — the most important decision)

### 3.1 Options considered

| Approach | Runtime dep? | RSC/SSR safe | User setup | Verdict |
|---|---|---|---|---|
| Tailwind preset/plugin | No, but user installs Tailwind | Yes | Install + configure Tailwind, learn utility classes | Rejected — violates zero-config promise |
| Runtime CSS-in-JS (styled-components / Emotion) | **Yes** | Poor with App Router / RSC | Provider setup, SSR wiring | Rejected — violates zero-dependency promise |
| Inline styles only | No | Yes | None | Rejected — no pseudo-classes, media queries, or dark mode |
| Build-time CSS-in-TS (vanilla-extract) | No (build-time) | Yes | None | Viable, but adds our build complexity for little user benefit |
| **Static CSS + CSS variables + data-attributes** | **No** | **Yes** | **One CSS import** | **CHOSEN** |

### 3.2 How the chosen approach works — three mechanisms

**Mechanism 1 — Design tokens as CSS custom properties.** All values flow from `tokens.css`:

```css
:root {
  /* color */
  --vk-color-primary: #4f46e5;
  --vk-color-primary-fg: #ffffff;
  --vk-color-bg: #ffffff;
  --vk-color-fg: #111827;
  --vk-color-muted: #6b7280;
  --vk-color-border: #e5e7eb;
  --vk-color-danger: #dc2626;

  /* spacing — 4px scale */
  --vk-space-1: 0.25rem;  --vk-space-2: 0.5rem;
  --vk-space-3: 0.75rem;  --vk-space-4: 1rem;
  --vk-space-6: 1.5rem;   --vk-space-8: 2rem;
  --vk-space-12: 3rem;    --vk-space-16: 4rem;

  /* typography */
  --vk-font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --vk-text-sm: 0.875rem; --vk-text-md: 1rem;
  --vk-text-lg: 1.125rem; --vk-text-xl: 1.5rem;
  --vk-text-2xl: 2rem;    --vk-text-hero: clamp(2.25rem, 5vw, 3.75rem);

  /* shape & elevation */
  --vk-radius-sm: 6px; --vk-radius-md: 10px;
  --vk-radius-lg: 16px; --vk-radius-full: 9999px;
  --vk-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.06);
  --vk-shadow-md: 0 4px 12px rgb(0 0 0 / 0.08);

  /* motion */
  --vk-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --vk-duration: 180ms;
}

[data-theme="dark"] {
  --vk-color-bg: #0b0f19;
  --vk-color-fg: #f3f4f6;
  --vk-color-border: #1f2937;
  --vk-color-muted: #9ca3af;
}
```

**Mechanism 2 — Variants via data attributes.** Props map to `data-*` attributes on the root element; CSS targets them. No class-name string concatenation logic, no runtime style computation:

```css
/* button.css */
:where(.vk-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--vk-space-2);
  font-family: var(--vk-font-sans);
  font-weight: 500;
  border-radius: var(--vk-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color var(--vk-duration) var(--vk-ease),
              border-color var(--vk-duration) var(--vk-ease);
}

:where(.vk-button[data-variant="solid"]) {
  background: var(--vk-color-primary);
  color: var(--vk-color-primary-fg);
}
:where(.vk-button[data-variant="outline"]) {
  background: transparent;
  border-color: var(--vk-color-border);
  color: var(--vk-color-fg);
}
:where(.vk-button[data-size="sm"]) { height: 2rem;   padding-inline: var(--vk-space-3); font-size: var(--vk-text-sm); }
:where(.vk-button[data-size="md"]) { height: 2.5rem; padding-inline: var(--vk-space-4); font-size: var(--vk-text-md); }
:where(.vk-button[data-size="lg"]) { height: 3rem;   padding-inline: var(--vk-space-6); font-size: var(--vk-text-lg); }
:where(.vk-button[data-full-width]) { width: 100%; }
:where(.vk-button:disabled) { opacity: 0.55; cursor: not-allowed; }
```

**Mechanism 3 — Zero-specificity base styles with `:where()`.** Every library selector is wrapped in `:where()`, which has specificity 0. Consequence: *any* CSS the user writes — a plain `.my-button { background: red }` — beats the library without `!important` wars. This single trick removes the biggest pain of styling third-party components.

### 3.3 Theming — nothing new to learn

Rebranding the entire library is plain CSS the user already knows:

```css
/* user's own globals.css */
:root {
  --vk-color-primary: #0ea5e9;   /* brand color */
  --vk-radius-md: 2px;           /* sharp corners */
  --vk-font-sans: "Inter", sans-serif;
}
```

Dark mode is `<html data-theme="dark">`. A tiny optional `<ThemeProvider>` (a client component that just toggles that attribute and persists the choice) can ship in v0.9, but the CSS works without any JS.

### 3.4 Supporting decisions

CSS is **decoupled from JS**: component `.tsx` files never `import './button.css'`. All component CSS is concatenated at build time into a single `dist/styles.css`. This keeps components bundler-agnostic (no "CSS import from node_modules" edge cases), makes the stylesheet CDN-servable, and guarantees JS and CSS versions never drift because they ship in the same package. Class names use the `vk-` prefix and are treated as **public API** (renaming one is a breaking change), because users will target them for overrides.

### 3.5 Responsive by default (ADR-009)

Famous libraries make responsiveness the *user's* job (`sx={{ display: { xs: 'none', md: 'flex' } }}` sprinkled everywhere). VivekUI inverts it — components are responsive with **zero props** — through three layers:

**Layer 1 — intrinsic responsiveness.** Fluid typography via `clamp()` (see `--vk-text-hero` in tokens), media at `max-width: 100%`, and auto-fit grids for anything column-based:

```css
:where(.vk-feature-grid) {
  display: grid;
  gap: var(--vk-space-6);
  grid-template-columns: repeat(auto-fit, minmax(var(--vk-item-min, 16rem), 1fr));
}
```

FeatureGrid, Pricing and Footer columns reflow at every width with no configuration at all.

**Layer 2 — container queries, not just viewport queries.** Sections and layout components declare `container-type: inline-size`, and their CSS responds to *the space they actually occupy* — a card grid placed inside a narrow Sidebar stacks exactly as it would on a phone. `@container` is supported across all evergreen browsers today, and this is a genuine differentiator: the Bootstrap/MUI generation is viewport-media-query based and structurally cannot do this. The Navbar auto-collapses its links into a hamburger below a container threshold; only the drawer interaction itself is client-side.

**Layer 3 — responsive props as the escape hatch, still zero-runtime.** When users *do* want explicit control:

```tsx
<Grid cols={{ base: 1, md: 2, xl: 4 }}>...</Grid>
```

maps to inline custom properties — `style={{ '--vk-cols': 1, '--vk-cols-md': 2, '--vk-cols-xl': 4 }}` — which the *static* stylesheet consumes inside fixed breakpoints:

```css
@media (min-width: 768px) {
  :where(.vk-grid) {
    grid-template-columns: repeat(var(--vk-cols-md, var(--vk-cols, 1)), 1fr);
  }
}
```

No runtime style computation, no CSS generation, SSR-perfect. Breakpoints are fixed build-time constants (CSS cannot read variables inside media conditions): `sm 640 · md 768 · lg 1024 · xl 1280`, documented once. All animation respects `prefers-reduced-motion`.

---

## 4. Component API Design

### 4.1 The standard contract (every component follows it)

Every component: (a) exposes `variant` / `size` / `tone` props where meaningful, mapped to data attributes; (b) merges — never replaces — incoming `className` and `style`; (c) spreads all remaining host props onto the root element; (d) forwards its ref to the root DOM node; (e) renders something sensible with zero props. Consistency here is what makes the library feel "more than easy": once a user learns Button, they already know Card, Badge, and Hero.

### 4.2 Reference implementation — Button (the template for all primitives)

```tsx
// src/components/button/button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'solid', size = 'md', fullWidth, loading,
      className, children, disabled, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cx('vk-button', className)}
        data-variant={variant}
        data-size={size}
        data-full-width={fullWidth || undefined}
        data-loading={loading || undefined}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <span className="vk-button__spinner" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)
```

Notes: no CSS import inside the file (§3.4); `cx` is our own five-line class joiner, so we don't depend on `clsx`:

```ts
// src/utils/cx.ts
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
```

`forwardRef` keeps React 18 compatibility; when the library later targets React 19 only, refs-as-props allows simplification without an API change for users.

### 4.3 Compound components for structured pieces

Complex components expose named sub-components instead of a wall of props:

```tsx
<Navbar sticky>
  <Navbar.Brand href="/">Acme</Navbar.Brand>
  <Navbar.Links>
    <Navbar.Link href="/features" active>Features</Navbar.Link>
    <Navbar.Link href="/pricing">Pricing</Navbar.Link>
  </Navbar.Links>
  <Navbar.Actions>
    <Button variant="ghost">Sign in</Button>
    <Button>Get started</Button>
  </Navbar.Actions>
</Navbar>
```

### 4.4 Sections: props for the fast path, slots for full control

```tsx
<Hero
  align="center"
  eyebrow="New in v2"
  title="Ship your website in a weekend"
  description="Every section you need, one npm install away."
  actions={
    <>
      <Button size="lg">Start free</Button>
      <Button size="lg" variant="outline">Read the docs</Button>
    </>
  }
  media={<img src="/screenshot.png" alt="Product screenshot" />}
/>
```

Simple content is a string prop; anything richer accepts a `ReactNode`. If a user outgrows the props, each section also accepts `children` to take over the inner layout entirely.

### 4.5 Router-agnostic links via `asChild`

Anything that renders a link (Navbar.Link, Breadcrumb.Item, Pagination, Button with `variant="link"`) supports the `asChild` pattern so users can pass `next/link` (or React Router's `Link`) without the library depending on any router:

```tsx
<Navbar.Link asChild>
  <Link href="/pricing">Pricing</Link>
</Navbar.Link>
```

Internally this is a ~30-line `Slot` utility (built on `cloneElement`) that merges our props/className onto the child — the same idea Radix popularized, implemented in-house to stay dependency-free.

### 4.6 Form controls

Inputs, Checkbox, Radio, Switch and Select follow native semantics and support both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) usage via a shared `useControllableState` hook. A `Field` wrapper wires `<label htmlFor>`, help text and error text to the control with correct `aria-describedby` — one component solves the accessibility boilerplate users always get wrong.

### 4.7 Icons built in (ADR-010)

"Button with icon" must not require installing lucide-react. The same package ships a curated icon set at `vivek-ui/icons` — roughly 60 essentials at launch (arrows, actions, navigation, social, commerce, media), growing to 200+ on request. Icons are plain React components rendering inline SVG (`currentColor` by default, a `size` prop, `aria-hidden` unless a `label` is given for meaningful icons), generated at build time by `scripts/gen-icons` (SVGO-optimized source SVGs to a TSX component template). Each icon costs ~0.3 kB and tree-shakes independently.

```tsx
import { ArrowRight, Download } from 'vivek-ui/icons'

<Button rightIcon={<ArrowRight />}>Continue</Button>
<IconButton aria-label="Download report"><Download /></IconButton>
```

`leftIcon` / `rightIcon` accept any `ReactNode`, so users who already have an icon set aren't locked out.

---

## 5. Next.js & React Server Components Strategy (ADR-006)

This is where most UI libraries break in 2026, so it is designed in from day one.

1. **Server-safe by default.** Components without state, effects, or event handlers (Card, Badge, Hero, Footer, Grid, Heading...) contain no `'use client'` and render fine in Server Components.
2. **`'use client'` only where earned.** Modal, Tabs, Accordion, Dropdown, Toast, the mobile Navbar toggle, etc. declare the directive at the top of their own file.
3. **Unbundled build preserves directives.** Bundlers typically strip or hoist directives when they merge files. We therefore compile **per-file** (transpile-only, `preserveModules`-style output) so each emitted file keeps its own directive. See §8.
4. **No `window`/`document` at module scope.** Browser APIs are touched only inside effects or event handlers; the SSR pass must never crash.
5. **Both routers supported.** Pages Router and App Router; the only integration point is the single `import 'vivek-ui/styles.css'` in `_app.tsx` or `app/layout.tsx`.
6. **Compatibility target:** `"react": "^18.0.0 || ^19.0.0"` as peer range, tested against both in CI.

| Server-safe (no directive) | Client (`'use client'`) |
|---|---|
| Box, Stack, Flex, Grid, Container | Tabs, Accordion |
| Heading, Text, Badge, Card, Avatar, Divider | Modal, Drawer, Tooltip, Popover, DropdownMenu |
| Hero, Footer, FeatureGrid, Pricing, Stats, CTA | Toast, Carousel |
| Breadcrumb, Skeleton, Spinner, Alert, Table (static) | Navbar (mobile menu), Sidebar (collapsible), Switch, Select (custom) |

---

## 6. Accessibility Engineering (the hard 20%)

Being dependency-free means re-implementing what Radix, Headless UI and floating-ui normally provide. This is the single largest engineering cost in the project — budget for it honestly. The strategy is to build a small set of internal utilities **once** and reuse them everywhere:

| Internal utility | Used by | What it does |
|---|---|---|
| `useFocusTrap` | Modal, Drawer | Keeps Tab/Shift+Tab inside the layer; restores focus on close |
| `useScrollLock` | Modal, Drawer | Locks body scroll without layout shift |
| `useDismiss` | All overlays | Escape key + outside-click close |
| `Portal` | All overlays, Toast | SSR-safe `createPortal` (renders only after mount) |
| `useRovingTabIndex` | DropdownMenu, Tabs | Arrow-key navigation, one tab stop per widget |
| `useControllableState` | All inputs, Tabs, Accordion | Controlled/uncontrolled duality |
| `useIsomorphicId` | Field, Tabs, Accordion | Stable ids for `aria-*` wiring (wraps `React.useId`) |
| `position()` | Tooltip, Popover, Dropdown | Placement math (see below) |

**Positioning policy:** floating-ui's collision engine is genuinely hard to replicate. v1 constrains the API instead: explicit `side="top|bottom|left|right"` + `align="start|center|end"` props, absolute positioning relative to the trigger, and a single "flip if no space" check. CSS Anchor Positioning gets adopted as a progressive enhancement as cross-browser support matures. Constraining the API is the honest trade-off that keeps zero-dependency viable.

Every interactive component follows the relevant **WAI-ARIA Authoring Practices** pattern, and its docs page publishes the keyboard map (e.g., Tabs: left/right move, Home/End jump, Tab exits). Automated `vitest-axe` checks run in unit tests; a manual keyboard + screen-reader pass is part of the release checklist for every overlay component.

---

## 7. Repository Layout (ADR-001, ADR-002)

Monorepo with **pnpm workspaces** — but only **one published package**, so the user experience stays "one install."

```
vivek-ui/
  packages/
    ui/                          # <- the ONLY published package
      src/
        components/
          button/
            button.tsx
            button.css
            button.test.tsx
            index.ts
          navbar/ ...            # same shape for every component
          hero/ ...
        styles/
          reset.css
          tokens.css
          entry.css              # @imports everything -> dist/styles.css
        icons/                   # generated by scripts/gen-icons -> vivek-ui/icons
        charts/                  # v1.3 — vivek-ui/charts subpath
        hooks/                   # internal only
        utils/                   # cx, Slot, mergeRefs ...
        index.ts                 # public exports
      package.json
      tsup.config.ts
      tsconfig.json
  apps/
    docs/                        # Next.js + MDX docs site (dogfoods the lib)
    playground/                  # Vite app for fast local dev
  .github/
    workflows/ci.yml
    workflows/release.yml
  .changeset/
  pnpm-workspace.yaml
  turbo.json                     # optional; add when builds feel slow
  CONTRIBUTING.md · LICENSE (MIT) · README.md
```

The docs app imports the library through the workspace, so writing docs continuously exercises the real public API — the docs site is the library's first production consumer.

---

## 8. Build & Distribution (ADR-006, ADR-007)

### 8.1 Published package.json (the parts that matter)

```jsonc
{
  "name": "vivek-ui",
  "version": "0.1.0",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css",
    "./icons": {
      "types": "./dist/icons/index.d.ts",
      "import": "./dist/icons/index.js",
      "require": "./dist/icons/index.cjs"
    },
    "./charts": {
      "types": "./dist/charts/index.d.ts",
      "import": "./dist/charts/index.js",
      "require": "./dist/charts/index.cjs"
    }
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
  /* dependencies: intentionally ABSENT — the whole point */
}
```

### 8.2 Pipeline

1. **JS/TS:** `tsup` in transpile-only mode (`bundle: false`) over `src/**/*.{ts,tsx}` produces per-file ESM + CJS output + `.d.ts`. Per-file output is what preserves each component's own `'use client'` directive (§5). If directive handling ever gets fiddly in tsup, the known-solid fallback is Rollup with `preserveModules: true` plus `rollup-plugin-preserve-directives` — same output shape, slightly more config.
2. **CSS:** LightningCSS bundles `styles/entry.css` (which `@import`s reset, tokens, and every component css) into a minified `dist/styles.css`.
3. **Tree-shaking:** ESM output + `sideEffects: false` + per-file modules means `import { Button } from 'vivek-ui'` pulls only Button into the user's bundle.
4. **Subpath domains:** `vivek-ui/icons` (from v0.2) and `vivek-ui/charts` (v1.3) live inside the same package via the `exports` map — one install, many domains, and tree-shaking ensures each app pays only for what it imports. Per-component subpaths (`vivek-ui/button`) stay a v1.x option if users request surgical imports.
5. **Size budget:** `size-limit` runs in CI with a budget per entry (e.g., Button <= 1.5 kB min+gzip) so the "lightweight" promise stays measurable, not vibes.

---

## 9. Quality Gates

**Tooling:** TypeScript `strict: true`; **Biome** for lint + format (single fast tool, fits the zero-config philosophy — swap for ESLint+Prettier only if you want typed-lint rules later).

**Tests:** Vitest + `@testing-library/react` (jsdom) for behavior; `vitest-axe` for automated a11y assertions; Playwright smoke tests against the docs site added around M4.

**CI (GitHub Actions, on every PR):** install -> typecheck -> lint -> test -> build -> size-limit report. A PR cannot merge red.

**Definition of done for every component:** types exported · zero-props render works · tests incl. axe pass · keyboard map implemented (if interactive) · docs page with live example + props table · changeset added.

---

## 10. Versioning, Releases & Updates (ADR-008)

### 10.1 SemVer policy for a UI library (write this in CONTRIBUTING.md)

| Change | Bump |
|---|---|
| Remove/rename a prop, component, `vk-` class name, or CSS variable | **MAJOR** |
| Drop a supported React version | **MAJOR** |
| New component, new prop, new token (additive) | **MINOR** |
| Bug fix, a11y fix, docs | **PATCH** |
| Visual change that may break user overrides | PATCH/MINOR **+ explicit release-note callout** |

Deprecations: mark with JSDoc `@deprecated` + a dev-only `console.warn`, keep working for at least one minor before removal.

### 10.2 Release flow — Changesets + GitHub Actions

1. Every PR that changes the package runs `pnpm changeset` — contributor writes a one-line summary + bump type (enforced by a changeset-check in CI).
2. Merge to `main` — the Changesets bot opens/updates a **"Version Packages"** PR (version bump + generated CHANGELOG).
3. Merging that PR triggers `release.yml`: build -> test -> `npm publish --provenance --access public` (provenance needs `id-token: write` permission and an `NPM_TOKEN` repo secret) -> GitHub Release with notes.
4. **Prerelease channel:** betas publish to the `next` dist-tag (`npm i vivek-ui@next`) via Changesets pre mode — lets early adopters test sections before stable.

Users update with a normal `npm update vivek-ui`; because JS and CSS ship in the same versioned package, styles and components can never drift apart.

---

## 11. Documentation & Open-Source Hygiene

`apps/docs` is a Next.js + MDX site (deployed free on Vercel). Every component page has: live rendered examples, copyable code, a props table, theming notes, and — for interactive components — the keyboard map and ARIA notes. Phase 1 writes props tables by hand; phase 2 generates them from TypeScript types with `react-docgen-typescript`.

Repo hygiene from day one: README with the 30-second install-to-Hero example and a visual component gallery; `CONTRIBUTING.md` (setup, changeset flow, DoD checklist); MIT `LICENSE`; `CODE_OF_CONDUCT.md`; issue templates (bug / component request) and a PR template. These files are cheap now and expensive to retrofit after the first external contributor arrives.

---

## 12. Full Coverage Catalog & Phased Roadmap

### 12.1 Coverage philosophy — "never open another package's docs"

End state: `npm install vivek-ui` and never install an icon package, TanStack Table, Recharts, a toast library, or a date-picker again. The architecture makes this affordable for **users**: per-file ESM + `sideEffects: false` (§8) means a 200-component catalog adds *zero bytes* to an app that imports ten of them — coverage is a catalog problem, not a bundle problem. What it costs is **maintainer time**, so the catalog grows in tiers: Tier A ships v1.0, Tier B lands across v1.x minors, Tier C is v2.0 territory. Escape hatches (`className`, `style`, `asChild`, `children` takeover on sections) guarantee the last 5% of edge cases never blocks a user while the catalog fills in.

Things provided here that the famous libraries make people assemble from three to five packages: installable full sections (§1.2), a batteries-included **DataTable** (§12.3), built-in **icons** (§4.7), built-in **charts** (§12.4), container-query **auto-responsiveness** (§3.5), plus site-builder pieces most kits skip entirely — AnnouncementBar, CookieConsent, MegaMenu, BottomNav, Timeline, ComparisonTable, Gallery + Lightbox, EmptyState, Stepper.

### 12.2 Tier A — the road to v1.0

| Phase | Version | Components | Notes |
|---|---|---|---|
| **1 · Foundation** | 0.1–0.3 | tokens + reset, Box, Stack, Flex, Grid, Container, AspectRatio, Heading, Text, List, Code, Kbd, Button, IconButton, ButtonGroup, Badge, Tag, Card (+Header/Body/Footer), Avatar (+Group), Divider, Spinner, Skeleton, Alert, **core icon set (~60)** | All server-safe; establishes the API contract, the pipeline, and the icon generator |
| **2 · Forms** | 0.4–0.5 | Label, Field, Input, Textarea, Select (native), Checkbox, RadioGroup, Switch, Slider (native range), FileInput | `useControllableState` lands here |
| **3 · Site sections** (star) | 0.6–0.8 | Navbar (auto-collapse + mobile drawer), Footer (multi-column), Hero (3 layouts), Section, FeatureGrid, Pricing, Testimonials, FAQ, CTA, Stats, LogoCloud, Team, ContactSection, AnnouncementBar, Breadcrumb, Sidebar (app shell), EmptyState | The differentiator; mostly composition of Phases 1–2 |
| **4 · Interactive/overlays** | 0.9–1.0 | Tabs, Accordion, Tooltip, Popover, DropdownMenu, Modal, Drawer, Toast, Pagination, Table (static), Progress, Stepper | Hardest phase — all six a11y utilities from §6 land here |

Sequencing rationale: sections ship *before* overlays because they deliver the library's unique value with lower engineering risk, letting you launch publicly at 0.6–0.8 while the hard a11y work proceeds.

### 12.3 DataTable — Tier B flagship (v1.2)

The component people currently glue together from TanStack Table plus their own CSS. Ours is batteries-included:

```tsx
<DataTable
  data={users}
  columns={[
    { key: 'name',   header: 'Name',   sortable: true },
    { key: 'role',   header: 'Role' },
    { key: 'joined', header: 'Joined', sortable: true, align: 'right',
      render: (row) => formatDate(row.joined) },
  ]}
  pageSize={10}
  searchable
  selectable
  stickyHeader
  responsive="stack"   /* 'scroll' | 'stack' -> rows become cards in narrow containers */
/>
```

v1.2 scope: client-side sort/search/pagination, row selection, loading and empty states, semantic `<table>` markup with `aria-sort` and keyboard-operable header buttons, and two responsive modes powered by container queries. v1.3 adds controlled mode with server callbacks (`onSortChange`, `onPageChange`) for large datasets. Virtualization only when real users ask — it's the classic complexity trap.

### 12.4 Charts — Tier B (v1.3, `vivek-ui/charts`)

Pure-SVG chart components: no d3, no canvas library. They are client components that measure their container with `ResizeObserver`, so they are auto-responsive like everything else, and they are themed by the same token system (`--vk-chart-1` through `--vk-chart-6` series colors, following light/dark automatically). Launch set: **Sparkline, LineChart, AreaChart, BarChart (grouped/stacked), PieChart/Donut, ProgressRing** — each with axes, legend, and hover tooltip that have sane defaults and prop switches.

```tsx
import { LineChart } from 'vivek-ui/charts'

<LineChart
  data={revenue}                       /* [{ x: 'Jan', y: 42 }, ...] */
  series={[{ key: 'y', label: 'Revenue' }]}
  height={280}
  showGrid
  showTooltip
/>
```

The positioning is explicit and honest: these cover the ~90% "show numbers on a website or dashboard" case. Zoom/brush, 3D, and scientific plotting stay out of scope permanently — that is ECharts territory, and pretending otherwise would sink the project.

### 12.5 The full catalog by tier

| Category | Tier A -> v1.0 | Tier B -> v1.x | Tier C -> v2.0 |
|---|---|---|---|
| Layout | Box, Stack, Flex, Grid, Container, Section, Divider, AspectRatio | Masonry | SplitPane |
| Typography | Heading, Text, List, Blockquote, Code, Kbd | Prose (article styling) | — |
| Actions | Button, IconButton, ButtonGroup, Link | FAB, CopyButton | — |
| Forms | Field, Label, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, FileInput | Combobox/Autocomplete, OTPInput, Rating, TagInput, PasswordInput (strength meter) | DatePicker, DateRangePicker, Calendar, TimePicker, ColorPicker, PhoneInput, TransferList |
| Data display | Card, Badge, Tag, Avatar, Table (static), Stat, Tooltip | **DataTable**, Timeline, ComparisonTable, TreeView (read-only) | TreeView (interactive), VirtualList |
| Charts | — | **Sparkline, Line, Area, Bar, Pie/Donut, ProgressRing** | Radar, Scatter, Heatmap |
| Feedback | Alert, Toast, Spinner, Skeleton, Progress, EmptyState | Banner, Result page | — |
| Navigation | Navbar, Sidebar, Tabs, Breadcrumb, Pagination, Footer | MegaMenu, BottomNav (mobile), CommandPalette, Anchor nav | Tour / Coachmarks |
| Overlays | Modal, Drawer, Popover, DropdownMenu, Tooltip | Lightbox, ContextMenu | — |
| Sections | Hero, FeatureGrid, Pricing, Testimonials, FAQ, CTA, Stats, LogoCloud, Team, ContactSection, AnnouncementBar | Gallery, BlogGrid, Careers list, Newsletter, CookieConsent | Storefront set (ProductCard, Cart drawer) |
| Media | — | Carousel, Image (aspect/fallback), VideoEmbed | Audio player |
| Icons | Core set (~60) | grows to 200+ on request | — |

Requests drive promotion between tiers: a Tier C item with heavy GitHub thumbs-up votes jumps the queue. The roadmap lives on a public GitHub Projects board, so "we will provide it" is visible, dated, and honest.

---

## 13. What You Need Before Writing Code

1. **Node >= 20 LTS** and **pnpm >= 9** installed.
2. **Public GitHub repo** (e.g., `intellectwithvivek/vivek-ui`).
3. **npm account** with 2FA enabled + a **granular access token** (publish scope, this package only) stored as the `NPM_TOKEN` GitHub secret.
4. **Package name verified:** `npm view vivek-ui` — if taken, create the free npm org for `@vivekui/react`.
5. **Vercel account** connected to the repo for the docs app.
6. **Decisions locked:** license = MIT; class prefix = `vk-`; token prefix = `--vk-`.
7. Optional: simple wordmark/logo for README and docs.

---

## 14. Milestones (realistic solo, evenings/weekends pace)

| Milestone | Duration | Deliverable |
|---|---|---|
| **M0 · Prove the pipe** | ~1 week | Monorepo scaffold, tokens.css, build pipeline, CI, Changesets, docs skeleton — and **Button published to npm as `0.1.0-next.0`**. Proving install to import to render end-to-end *before* writing 40 components de-risks everything. |
| M1 · Primitives | 2–3 weeks | Phase 1 complete + playground |
| M2 · Forms | 2 weeks | Phase 2 complete |
| M3 · Sections + docs | 3 weeks | Phase 3 complete, docs site live on Vercel, **public 0.8 launch** (LinkedIn/dev.to post) |
| M4 · Overlays & a11y | 3–4 weeks | Phase 4 complete, axe + keyboard passes |
| M5 · Polish to **v1.0.0** | 2 weeks | Full docs, size budgets green, migration notes |
| M6 · **v1.1** | ~3 weeks | Icon set to 150+, Combobox, CommandPalette, OTPInput, Rating, Carousel |
| M7 · **v1.2** | 3–4 weeks | **DataTable** (sort/search/paginate/select, responsive stack mode) |
| M8 · **v1.3** | ~4 weeks | **`vivek-ui/charts`** — Sparkline, Line, Area, Bar, Pie/Donut, ProgressRing |

Total: roughly 3–4 months to a credible v1.0. Ship 0.x publicly from M3 — early users are the best prioritization signal, and "sections library with zero setup" is a launchable story on its own. After 1.0, cadence is a minor release roughly every month, with Tier B/C promotion driven by GitHub issue votes — the public roadmap is how "we will provide everything" stays a schedule instead of a slogan.

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| A11y scope creep (rebuilding Radix) | Six shared utilities (§6), APG checklists per component, overlays deferred to Phase 4 |
| Positioning-engine complexity | Constrained placement API in v1; CSS Anchor Positioning as future enhancement |
| User CSS override wars | `:where()` zero-specificity everywhere; `vk-` class names treated as stable public API |
| Duplicate-React bugs in consumer apps | React strictly in `peerDependencies`; never in `dependencies`; CI installs the package into a fixture app to verify |
| `'use client'` stripped by build | Per-file (unbundled) output; a CI test greps `dist/` to assert directives survived |
| Name squatting / brand | Verify npm name in M0, register the scoped org as backup |
| Solo-maintainer burnout | Phased scope, "post-1.0 maybe" list, Changesets automation, DoD checklist keeps quality without heroics |

---

## 16. Decision Log (ADR summary)

| # | Decision | Rationale (one line) |
|---|---|---|
| ADR-001 | pnpm monorepo (`packages/ui` + `apps/docs` + `apps/playground`) | Docs dogfood the lib; fast local iteration |
| ADR-002 | Single published package | Preserves the "one install" promise |
| ADR-003 | Static CSS + CSS custom properties; no Tailwind, no runtime CSS-in-JS | Zero runtime deps, RSC-safe, nothing new for users to learn |
| ADR-004 | Variants via `data-*` attributes; `:where()` zero-specificity base styles | Clean prop-to-style mapping; user overrides always win |
| ADR-005 | CSS decoupled from JS; one shipped `styles.css` | Bundler-agnostic, CDN-friendly, versions never drift |
| ADR-006 | Unbundled per-file build (tsup `bundle:false`; Rollup `preserveModules` fallback) | Preserves per-file `'use client'`; maximizes tree-shaking |
| ADR-007 | `react`/`react-dom` as peerDependencies `^18 || ^19` | Prevents duplicate React; widest compatibility |
| ADR-008 | Changesets + GitHub Actions publishing with npm provenance | Automated semver, changelog, and supply-chain trust |
| ADR-009 | Responsive by default: container queries + auto-fit grids + CSS-variable responsive props | Zero-config responsiveness at zero runtime cost |
| ADR-010 | Built-in icon set at `vivek-ui/icons`, generated at build time | Removes the "install an icon package" step; tree-shakes per icon |
| ADR-011 | DataTable & charts as domains of the single package (`vivek-ui/charts`) | Total coverage without a second install or bundle bloat |

**Revisit as it grows:** per-component subpath exports beyond `/icons` and `/charts` (if bundle-size requests arrive), CSS Anchor Positioning adoption (when browser support allows), React-19-only simplifications (when 18 usage drops), visual-regression testing via Playwright/Chromatic (when contributors join), DataTable virtualization (when big-data users appear).
