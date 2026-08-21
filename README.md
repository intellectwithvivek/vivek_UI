<div align="center">

# VivekUI

**One install. Zero configuration. Every building block of a website.**

A React component library with **zero runtime dependencies** — no Tailwind, no PostCSS plugin,
no Babel plugin, no required provider. Works in React 18 and 19, and in Next.js with both the
Pages and App Router.

[![npm](https://img.shields.io/npm/v/@the_viveksingh/vivek-ui?color=4f46e5)](https://www.npmjs.com/package/@the_viveksingh/vivek-ui)
[![license](https://img.shields.io/npm/l/@the_viveksingh/vivek-ui?color=4f46e5)](LICENSE)
[![one component](https://img.shields.io/badge/one%20component-201%20B-4f46e5)](#how-small-actually)

[Website](https://vivekkumarsingh.in) &middot; [GitHub](https://github.com/intellectwithvivek) &middot; [LinkedIn](https://www.linkedin.com/in/singhvvk/)

</div>

---

## Install

```bash
npm install @the_viveksingh/vivek-ui
```

Import the stylesheet **once**, at your app's entry point:

```tsx
// Next.js App Router: app/layout.tsx
// Next.js Pages Router: pages/_app.tsx
// Vite / CRA: src/main.tsx
import '@the_viveksingh/vivek-ui/styles.css'
```

Then use anything, anywhere:

```tsx
import { Card, Heading, Text, Badge, Button } from '@the_viveksingh/vivek-ui'

export function Plan() {
  return (
    <Card variant="elevated" padding="lg">
      <Card.Header>
        <Badge tone="success" pill>Most popular</Badge>
        <Heading level={3}>Pro</Heading>
      </Card.Header>
      <Card.Body>
        <Text tone="muted">Everything you need to ship, nothing you don't.</Text>
      </Card.Body>
      <Card.Footer>
        <Button fullWidth size="lg">Start free</Button>
      </Card.Footer>
    </Card>
  )
}
```

There is no step three. No config file, no CLI, no code generation.

## Why not copy-paste components?

The copy-paste approach hands you the source and the maintenance burden with it. Once a dozen
components live in your repo, every upstream fix is a manual re-copy, and every file you edited has
drifted from upstream. VivekUI is a normal dependency: `npm update` and you have the fixes.

|  | VivekUI | Copy-paste kits | MUI / Chakra / Ant |
|---|---|---|---|
| Setup | 1 install + 1 CSS import | CLI, config file, Tailwind, per-component adds | Install + provider + theme setup |
| Runtime dependencies | **0** | Tailwind + Radix + CVA + clsx | Emotion or styled-components |
| Updates | `npm update` | Re-copy each file by hand | `npm update` |
| Overrides | One flat class wins (zero specificity) | Edit the source you own | `sx`, `!important`, specificity fights |
| Server Components | Safe by default | Depends what you copied | Often needs a client boundary |
| Theming | Plain CSS custom properties | Tailwind config | Theme object / JS API |

## Components

**20 components shipping today.** Every one is server-safe, accessible, and covered by tests
including automated axe checks.

| Layout | Typography | Actions | Display | Feedback |
|---|---|---|---|---|
| `Box` | `Heading` | `Button` | `Badge` | `Alert` |
| `Stack` | `Text` | `IconButton` | `Card` | `Spinner` |
| `Flex` | `Code` | `ButtonGroup` | `Card.Header` | `Skeleton` |
| `Grid` | `Kbd` | | `Card.Body` | `Progress` |
| `Container` | | | `Card.Footer` | |
| `Divider` | | | `Avatar` | |
| `AspectRatio` | | | `Avatar.Group` | |

Forms, full page sections, overlays, icons, DataTable and charts are next — see the
[roadmap](#roadmap).

## How small, actually

Measured with `size-limit`, minified and brotlied, React excluded:

| Import | Cost |
|---|---|
| `{ Button }` | **201 B** |
| `{ Card, Badge, Alert }` | **497 B** |
| The entire library | **2.42 kB** |
| `styles.css` (every component) | 23 kB, ~4 kB gzipped |

Per-file ESM plus `sideEffects: false` means you pay only for what you import. A hundred-component
catalog will still cost 201 B if `Button` is all you use.

### Zero dependencies, verifiable

```bash
npm ls --omit=dev @the_viveksingh/vivek-ui
```

`react` and `react-dom` are `peerDependencies` (`^18 || ^19`) and are never bundled, so you cannot
end up with two copies of React and the duplicate-hooks errors that follow.

## Responsive with no props

Grids reflow on their own. No breakpoint props, no `sx` objects:

```tsx
<Grid />                                {/* auto-fits: as many columns as fit, at every width */}
<Grid minItemWidth="20rem" />
<Grid cols={{ base: 1, md: 2, xl: 4 }} />  {/* explicit, when you want it */}
```

Responsive `cols` compile to CSS custom properties that a static stylesheet reads inside fixed
breakpoints — no runtime style computation, no CSS generated at render, identical output on server
and client. Cards declare `container-type`, so a grid inside a narrow sidebar stacks exactly as it
would on a phone.

Breakpoints: `sm 640` &middot; `md 768` &middot; `lg 1024` &middot; `xl 1280`.

## Theming: plain CSS you already know

Every value is a CSS custom property. Rebrand the whole library from your own stylesheet:

```css
:root {
  --vk-color-primary: #0ea5e9;
  --vk-radius-md: 2px;
  --vk-font-sans: 'Inter', sans-serif;
}
```

Dark mode is one attribute, and works with JavaScript disabled:

```html
<html data-theme="dark">
```

### Your CSS always wins

Every library selector is wrapped in `:where()`, which has specificity **zero**. A single flat class
of your own beats the library, with no `!important` anywhere:

```css
.my-cta { background: #db2777; border-radius: 999px; }
```

```tsx
<Button className="my-cta">Beats .vk-button[data-variant="solid"]</Button>
```

`vk-` class names and `--vk-` custom properties are public API. Renaming one is a major version bump.

## Accessibility

Not a later phase. Every component ships with automated `axe` assertions in its tests, and the API
is designed so the accessible thing is the default:

- `IconButton` **requires** `aria-label` at the type level, so an icon-only control cannot ship nameless
- `Alert` uses `role="alert"` for urgent tones and `role="status"` for the rest, so it does not talk over the user
- `Avatar` labels itself when it falls back to initials, and stays silent when the image already carries the name
- `Divider` is a real `<hr>` unless labelled, rather than hand-rolled ARIA
- `Spinner` has a screen-reader label by default, with an opt-out for decorative use
- `Heading` decouples visual size from semantic level, so the document outline stays correct
- Every animation respects `prefers-reduced-motion`

## Server Components

Static components carry no `'use client'` and render fine in React Server Components. Only genuinely
interactive components will declare it, per file. The build is unbundled precisely so each file keeps
its own directive, and CI asserts they survive every build.

## Roadmap

| Status | Ships |
|---|---|
| **Now** | Design tokens, layout, typography, actions, display, feedback — 20 components |
| Next | Forms — `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch` |
| Then | **Sections** — `Navbar`, `Hero`, `Footer`, `Pricing`, `FAQ`, `CTA`, `Stats`, `Sidebar` |
| Then | Overlays — `Modal`, `Drawer`, `Tabs`, `Accordion`, `Tooltip`, `Popover`, `Dropdown`, `Toast` |
| Then | Built-in icon set, `DataTable`, charts |

Installable full page **sections** are the differentiator. Primitives are everywhere, but assembling
a landing page still means writing the Navbar and the pricing table yourself. Those ship as
components here.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and component requests are welcome, and requests with
real demand jump the queue.

## Author

**Vivek Kumar Singh**

- Website &mdash; [vivekkumarsingh.in](https://vivekkumarsingh.in)
- GitHub &mdash; [@intellectwithvivek](https://github.com/intellectwithvivek)
- LinkedIn &mdash; [in/singhvvk](https://www.linkedin.com/in/singhvvk/)

## License

[MIT](LICENSE) &copy; 2026 Vivek Kumar Singh. Free forever, for any use, commercial included.
