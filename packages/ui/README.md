# VivekUI

<!-- This file mirrors the repository README so it renders on npm. Edit the root README.md. -->

**One install. Zero configuration. Every building block of a website.**

A React UI library with **zero runtime dependencies** — no Tailwind config, no PostCSS plugin, no
Babel plugin, no required ThemeProvider, nothing to install beyond React itself. Works in React 18
and 19, and in Next.js with both the Pages and App Router.

> **Status: M0 — proving the pipe.** Today the catalog is `Button` plus the design token system.
> That is deliberate: the build, publish, test and consume path is verified end to end *before*
> forty components get written. See the [roadmap](#roadmap).

## Install

```bash
npm install @the_viveksingh/vivek-ui
# or: pnpm add @the_viveksingh/vivek-ui / yarn add @the_viveksingh/vivek-ui
```

## Setup — two lines, total

Import the stylesheet **once**, at your app's entry point:

```tsx
// Next.js App Router: app/layout.tsx
// Next.js Pages Router: pages/_app.tsx
// Vite / CRA: src/main.tsx
import '@the_viveksingh/vivek-ui/styles.css'
```

Then use components anywhere:

```tsx
import { Button } from '@the_viveksingh/vivek-ui'

export function SignupCta() {
  return (
    <>
      <Button size="lg">Start free</Button>
      <Button size="lg" variant="outline">
        Read the docs
      </Button>
    </>
  )
}
```

That's the entire setup. There is no step three.

## What "zero dependency" means

The published package's `dependencies` field is **empty** — verify it yourself:

```bash
npm ls --package-lock-only --omit=dev @the_viveksingh/vivek-ui
```

`react` and `react-dom` are declared as `peerDependencies` only (`^18.0.0 || ^19.0.0`) and are never
bundled, so you can never end up with two copies of React and the duplicate-hooks errors that
follow. Our own repo uses devDependencies — TypeScript, tsup, Vitest, Biome — to build and test;
none of them reach your `node_modules`.

## Button

```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost" size="sm">Ghost, small</Button>
<Button variant="link">Link</Button>
<Button loading>Saving</Button>
<Button fullWidth size="lg">Full width</Button>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | Maps to `data-variant` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Maps to `data-size` |
| `fullWidth` | `boolean` | — | Maps to `data-full-width` |
| `loading` | `boolean` | — | Shows a spinner **and** disables the button |
| ...rest | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Spread onto the `<button>` |

`className` and `style` are **merged**, never replaced, and the ref forwards to the underlying
`<button>` element. Every component in the library follows this same contract.

## Theming — plain CSS you already know

Every visual value is a CSS custom property. Rebrand the whole library from your own stylesheet:

```css
:root {
  --vk-color-primary: #0ea5e9; /* brand color */
  --vk-radius-md: 2px;         /* sharp corners */
  --vk-font-sans: 'Inter', sans-serif;
}
```

Dark mode is one attribute — no provider, and the CSS works with JavaScript disabled:

```html
<html data-theme="dark">
```

### Overrides always win

Every library selector is wrapped in `:where()`, which has specificity **zero**. So a single flat
class of your own beats the library's own styles with no `!important` anywhere:

```css
.my-cta {
  background: #db2777;
  border-radius: 999px;
}
```

```tsx
<Button className="my-cta">Beats .vk-button[data-variant="solid"]</Button>
```

`vk-` class names and `--vk-` custom properties are treated as **public API** — renaming one is a
major version bump.

## Server Components

Static components ship without `'use client'` and render fine in React Server Components. Only
genuinely interactive components (Modal, Tabs, Dropdown — arriving in M4) will carry the directive,
declared per file. The build is deliberately unbundled so each file keeps its own directive, and CI
asserts they survive every build.

## Roadmap

The plan is the whole catalog — primitives, forms, full page **sections**, overlays, icons, a
DataTable and charts — shipped in tiers so it arrives instead of stalling half-finished. Sections
are the differentiator: installable, prop-driven `Navbar` / `Hero` / `Pricing` / `Footer` rather
than primitives you assemble yourself.

| Milestone | Ships |
|---|---|
| **M0** (here) | Tokens, build pipeline, CI, `Button` |
| M1 | Primitives — Box, Stack, Grid, Heading, Text, Card, Badge, Avatar, Alert… + ~60 icons |
| M2 | Forms — Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch |
| M3 | **Sections** — Navbar, Hero, Footer, Pricing, FAQ, CTA, Stats, Sidebar + docs site |
| M4 | Overlays — Tabs, Accordion, Tooltip, Popover, Modal, Drawer, Toast |
| M5 | **v1.0.0** |
| M6–M8 | Icon set to 150+, `DataTable`, `@the_viveksingh/vivek-ui/charts` |

Full detail, including the complete catalog by tier and the decision log:
[docs/ARCHITECTURE.md](https://github.com/intellectwithvivek/vivek-ui/blob/main/docs/ARCHITECTURE.md) — see §12 for the roadmap.

## Contributing

See [CONTRIBUTING.md](https://github.com/intellectwithvivek/vivek-ui/blob/main/CONTRIBUTING.md). Issues and component requests are welcome; requests with
traction jump the queue between tiers.

## License

[MIT](https://github.com/intellectwithvivek/vivek-ui/blob/main/LICENSE) © 2026 Vivek Kumar Singh
