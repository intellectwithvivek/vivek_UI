<div align="center">

# VivekUI

**One install. Zero configuration. Every building block of a website.**

A React component library with **zero runtime dependencies** — no Tailwind, no PostCSS plugin,
no Babel plugin, no required provider. Works in React 18 and 19, and in Next.js with both the
Pages and App Router.

[![npm](https://img.shields.io/npm/v/@the_viveksingh/vivek-ui?color=4f46e5)](https://www.npmjs.com/package/@the_viveksingh/vivek-ui)
[![license](https://img.shields.io/npm/l/@the_viveksingh/vivek-ui?color=4f46e5)](https://github.com/intellectwithvivek/vivek_UI/blob/main/LICENSE)
[![runtime deps](https://img.shields.io/badge/runtime%20deps-0-4f46e5)](#zero-dependencies-verifiable)
[![one component](https://img.shields.io/badge/one%20component-773%20B-4f46e5)](#how-small-actually)
[![docs](https://img.shields.io/badge/docs-ui.vivekkumarsingh.in-4f46e5)](https://ui.vivekkumarsingh.in)

### [**Documentation, live examples and a playground &rarr;**](https://ui.vivekkumarsingh.in)

Every component and chart has a page with a rendered example, the code in TypeScript **and**
JavaScript, and a props table generated from the package's own type declarations.

[Components](https://ui.vivekkumarsingh.in/docs/components) &middot; [Charts](https://ui.vivekkumarsingh.in/docs/charts) &middot; [Playground](https://ui.vivekkumarsingh.in/playground) &middot; [Installation](https://ui.vivekkumarsingh.in/docs/installation) &middot; [FAQ](https://ui.vivekkumarsingh.in/docs/faq)

[Author's site](https://vivekkumarsingh.in) &middot; [GitHub](https://github.com/intellectwithvivek) &middot; [LinkedIn](https://www.linkedin.com/in/singhvvk/)

</div>

---

## Install

```bash
npm install @the_viveksingh/vivek-ui
# or: yarn add @the_viveksingh/vivek-ui
# or: pnpm add @the_viveksingh/vivek-ui
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

## Contents

[Why not copy-paste?](#why-not-copy-paste-components) &middot;
[Components](#components) &middot;
[Charts](#charts) &middot;
[Your data](#feeding-it-your-data) &middot;
[Size](#how-small-actually) &middot;
[Responsive](#responsive-with-no-props) &middot;
[Theming](#theming) &middot;
[Accessibility](#accessibility) &middot;
[Server Components](#server-components) &middot;
[Security](#security) &middot;
[Roadmap](#roadmap)

## Why not copy-paste components?

The copy-paste approach hands you the source and the maintenance burden with it. Once a dozen
components live in your repo, every upstream fix is a manual re-copy, and every file you edited has
drifted. VivekUI is a normal dependency: `npm update` and you have the fixes.

|  | VivekUI | Copy-paste kits | MUI / Chakra / Ant |
|---|---|---|---|
| Setup | 1 install + 1 CSS import | CLI, config file, Tailwind, per-component adds | Install + provider + theme setup |
| Runtime dependencies | **0** | Tailwind + Radix + CVA + clsx | Emotion or styled-components |
| Updates | `npm update` | Re-copy each file by hand | `npm update` |
| Overrides | One flat class wins (zero specificity) | Edit the source you own | `sx`, `!important`, specificity fights |
| Server Components | 49 of 90 need no client boundary | Depends what you copied | Often needs a client boundary |
| Charts | Built in, pure SVG, 0 deps | Wraps Recharts (~100 kB) | Separate package |
| Theming | Plain CSS custom properties | Tailwind config | Theme object / JS API |

## Components

**90 components. 138 runtime exports.** Every one is covered by tests including
automated `axe` assertions, and **44 need no `'use client'`** — they render directly in React Server
Components.

### Layout

`Box` &middot; `Stack` &middot; `Flex` &middot; `Grid` &middot; `Container` &middot; `Section` &middot; `Divider` &middot; `AspectRatio` &middot; `BentoGrid` &middot; `ScrollArea`

### Typography

`Heading` &middot; `Text` &middot; `Code` &middot; `Kbd` &middot; `Prose`

### Actions

`Button` &middot; `IconButton` &middot; `ButtonGroup` &middot; `CopyButton`

### Forms

`Field` &middot; `Label` &middot; `Input` &middot; `Textarea` &middot; `Select` &middot; `Checkbox` &middot; `RadioGroup` &middot; `Switch` &middot; `Slider` &middot; `PasswordInput` &middot; `OTPInput` &middot; `Rating` &middot; `TagInput` &middot; `FileUpload` &middot; `Combobox` &middot; `Calendar` &middot; `DatePicker`

`Field` owns the ARIA wiring, so it cannot drift:

```tsx
<Field label="Email" help="We will never share it." error={errors.email} required>
  <Input type="email" autoComplete="email" />
</Field>
```

It labels the control with `htmlFor`, sets `required` and `aria-invalid`, and points
`aria-describedby` at the **error** when there is one and the **hint** when there is not — because a
screen-reader user needs the reason their input was rejected, not the tip. The error is a live
region, so a message appearing after submit is genuinely announced.

### Overlays

`Modal` &middot; `Drawer` &middot; `Tabs` &middot; `Accordion` &middot; `Tooltip` &middot; `Popover` &middot; `DropdownMenu` &middot; `Toast` &middot; `Portal`

### Navigation

`Navbar` &middot; `Sidebar` &middot; `Breadcrumb` &middot; `Pagination` &middot; `CommandPalette`

Every link-rendering part accepts `asChild`, so your router's `Link` works without the library
depending on a router:

```tsx
<Navbar.Link asChild><Link href="/pricing">Pricing</Link></Navbar.Link>
```

### Data display

`Table` &middot; `DataTable` &middot; `Card` &middot; `Badge` &middot; `Avatar` &middot; `Timeline` &middot; `Stepper`

`DataTable` is batteries-included — client-side sort, search, pagination and row selection, with
controlled escape hatches (`onSortChange`, `onPageChange`, `onSearchChange`) for server-driven data:

```tsx
<DataTable
  data={users} rowKey="id" pageSize={10} searchable selectable stickyHeader
  responsive="stack"          // rows become cards in a narrow container
  columns={[
    { key: 'name', header: 'Name', sortable: true },
    { key: 'team', header: 'Team', render: (row) => row.team?.name ?? '—' },
  ]}
/>
```

### AI chat

`ChatThread` &middot; `ChatMessage` &middot; `ChatInput` &middot; `TypingIndicator` &middot; `ChatCodeBlock`

Message content is always a `ReactNode`, never an HTML string — there is no
`dangerouslySetInnerHTML` anywhere in the library, so model output cannot become markup. The
transcript is a `role="log"` with `aria-relevant="additions"`, so new turns are announced without
re-reading the thread, and auto-scroll sticks to the bottom **without** yanking the user back when
they have scrolled up to read.

### Feedback

`Alert` &middot; `Toast` &middot; `Spinner` &middot; `Skeleton` &middot; `Progress` &middot; `EmptyState`

### Sections

`Hero` &middot; `FeatureGrid` &middot; `Pricing` &middot; `Testimonials` &middot; `FAQ` &middot; `CTA` &middot; `Stats` &middot; `Footer` &middot; `LogoCloud`

Installable page sections are the differentiator. Primitives are everywhere, but assembling a
landing page still means hand-writing the pricing table. Here it is a component. `FAQ` is built on
native `<details>`, so it needs **no ARIA and no JavaScript**.

### Media and time

`Carousel` &middot; `Marquee` &middot; `AnimatedCounter` &middot; `Countdown` &middot; `Clock` &middot; `RelativeTime`

`Countdown` and `Clock` accept a `now` prop and never read the clock during render, so server and
client HTML agree and there is no hydration mismatch. `AnimatedCounter` renders its **final** value
in server HTML, never `0`.

### Theming

`ThemeProvider` &middot; `ThemeToggle`

## Charts

Six chart types at a separate subpath, pure inline SVG, no charting dependency:

```tsx
import { LineChart, AreaChart, BarChart, PieChart, Sparkline, ProgressRing }
  from '@the_viveksingh/vivek-ui/charts'
import '@the_viveksingh/vivek-ui/charts.css'   // separate, so no-chart apps pay nothing

<LineChart data={revenue} series={[{ key: 'y', label: 'Revenue' }]} height={280} showGrid />
```

Each chart renders a real `<table>` fallback so screen-reader users get the actual numbers, and
never encodes a series by colour alone — every series carries a distinct dash pattern **and** marker
shape, on a colourblind-safe palette with a lifted dark-mode ramp.

## Feeding it your data

Every data-driven component takes a plain array of plain objects, and also accepts `children` as an
escape hatch. `DataTable` and the charts need **no pre-transform** — `render` and `sortAccessor`
handle nested objects and nulls in place. Everything else is a one-line `.map()`.

The prop name is domain-specific, so here is the lookup table:

| Prop | Components |
|---|---|
| `data` | all charts, `DataTable` |
| `items` | `FAQ`, `Stats`, `Testimonials`, `Breadcrumb`, `CommandPalette` |
| `options` | `Select`, `RadioGroup`, `Combobox` |
| `columns` | `DataTable` (table columns), `Footer` (link groups) |
| `features` / `plans` / `logos` / `messages` / `steps` | `FeatureGrid` / `Pricing` / `LogoCloud` / `ChatThread` / `Stepper` |

```tsx
// An API response, mapped in one line per component
<FeatureGrid features={api.capabilities.map((c) => ({
  id: c.id, title: c.headline, description: c.blurb,
}))} />
```

Pass `id` on list items whenever the data is dynamic. The fallback key is a content field, which
collides when two items share it — two reviews by the same author, two metrics labelled "Users" —
and makes React mis-attach state across a reorder.

## How small, actually

Measured with `size-limit`, minified and brotlied, React excluded:

| Import | Cost |
|---|---|
| `{ Button }` | **198 B** |
| `{ Modal }` (focus trap + scroll lock + portal) | **2.91 kB** |
| A whole landing page (`Hero`+`FeatureGrid`+`Pricing`+`FAQ`+`CTA`+`Footer`) | **2.66 kB** |
| All six charts | **8.14 kB** |
| Every one of the 90 components | **41.6 kB** |
| `styles.css` | 166 kB raw, **23 kB gzipped** |
| `charts.css` | 6 kB raw, **1.5 kB gzipped** |

Per-file ESM plus `sideEffects: false` means you pay only for what you import — importing `Button`
alone costs 198 B, not 40.5 kB.

**One caveat, stated plainly:** the CSS is a single stylesheet, so an app using five components
still downloads all 23 kB gzipped. That is the trade for "one import, no build configuration".
Chart CSS is split out separately.

### Zero dependencies, verifiable

```bash
npm ls --omit=dev @the_viveksingh/vivek-ui
```

`react` and `react-dom` are `peerDependencies` (`^18 || ^19`) and are never bundled, so you cannot
end up with two copies of React and the duplicate-hooks errors that follow.

Verified on every release against **npm, yarn and pnpm**, in **ESM and CJS**, under all three
TypeScript `moduleResolution` modes (`bundler`, `node16`, legacy `node`).

## Responsive with no props

Grids reflow on their own. No breakpoint props, no `sx` objects:

```tsx
<Grid />                                   {/* auto-fits at every width */}
<Grid minItemWidth="20rem" />
<Grid cols={{ base: 1, md: 2, xl: 4 }} />  {/* explicit, when you want it */}
```

Responsive `cols` compile to CSS custom properties that a static stylesheet reads inside fixed
breakpoints — no runtime style computation, no CSS generated at render, identical output on server
and client.

Sections and cards declare `container-type`, so they respond to **their own width**, not the
viewport: a card grid inside a narrow sidebar stacks exactly as it would on a phone, even on a 27"
display. `Navbar` collapses to a mobile sheet the same way.

Breakpoints: `sm 640` &middot; `md 768` &middot; `lg 1024` &middot; `xl 1280`.

## Theming

Every value is a CSS custom property. Rebrand the whole library from your own stylesheet:

```css
:root {
  --vk-color-primary: #0ea5e9;
  --vk-radius-md: 2px;
  --vk-font-sans: 'Inter', sans-serif;
}
```

Tokens cover colour (including `success`, `warning`, `danger`, `overlay`), spacing, typography,
radius, shadow, motion, z-index layering and overlay sizing.

### Dark mode

One attribute, and the CSS works with JavaScript disabled:

```html
<html data-theme="dark">
```

`ThemeProvider` handles `light` / `dark` / `system` with `localStorage` persistence. To avoid a
flash of the wrong theme on first paint, inline the exported script in `<head>` — React cannot fix
this, because the server does not know the visitor's choice:

```tsx
import { themeScript } from '@the_viveksingh/vivek-ui'

<head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
```

### Your CSS always wins

Every library selector is wrapped in `:where()`, which has specificity **zero**. A single flat class
of your own beats the library, with no `!important` anywhere:

```css
.my-cta { background: #db2777; border-radius: 999px; }
```

`vk-` class names and `--vk-` custom properties are public API. Renaming one is a major version bump.

## Accessibility

Not a later phase. Every component ships with automated `axe` assertions, and the API is designed so
the accessible thing is the default:

- `IconButton` **requires** `aria-label` at the type level — an icon-only control cannot ship nameless
- `Alert` and `Toast` pick `role="alert"` for urgent tones and `role="status"` for the rest, so they do not talk over the user
- `Combobox` and `CommandPalette` move the active option with `aria-activedescendant` while DOM focus stays in the input, per the ARIA pattern
- `Modal` and `Drawer` trap focus, lock scroll without layout shift, make the rest of the page `inert`, and return focus to the trigger
- `Calendar` is a real `role="grid"` with the full APG keyboard map, localised through `Intl`
- `RadioGroup` is a `<fieldset>` with a `<legend>`, which names the group with no ARIA at all
- `Divider` is a real `<hr>` unless labelled; `FAQ` is native `<details>`
- Every animation respects `prefers-reduced-motion`

**Known gap:** colour contrast is reasoned, not machine-verified — `axe`'s contrast rule cannot run
without a browser. A Playwright pass is on the roadmap.

## Server Components

**49 of the 90 components carry no `'use client'`** and render directly in React Server Components.
Only genuinely interactive ones declare it, per file.

The build is unbundled precisely so each file keeps its own directive, and CI asserts on every build
that all 47 client files still carry theirs in **both** the ESM and CJS output.

## Security

- **No `dangerouslySetInnerHTML`, `innerHTML`, or `eval` anywhere** in the library
- Consumer-supplied `href` values are **scheme-validated** in every link component. React 18 renders
  a `javascript:` URL verbatim (only React 19 blocks it) and `^18` is supported here, so a CMS-fed
  link would otherwise be a stored-XSS vector. Unsafe schemes are dropped, and `target="_blank"`
  gets `rel="noopener noreferrer"` automatically
- `toCsv` guards against **spreadsheet formula injection** — a cell starting `=`, `+`, `-`, `@`, tab
  or CR is neutralised, so an export cannot execute on your user's machine
- No `localStorage` except in `ThemeProvider`, wrapped in `try`/`catch`; no `console` output; no
  `window`/`document` at module scope
- CI asserts the published package has **no runtime dependencies**, and GitHub Actions are pinned to
  commit SHAs

Report a vulnerability via [SECURITY.md](https://github.com/intellectwithvivek/vivek_UI/blob/main/SECURITY.md).

## Roadmap

| Status | |
|---|---|
| **Shipped** | Layout, typography, actions, forms, overlays, navigation, data, AI chat, sections, media, charts, theming |
| **Shipped** | [Documentation site](https://ui.vivekkumarsingh.in) &mdash; a page per component with live previews, props tables and an in-browser playground |
| Next | Built-in icon set; a Playwright pass for colour contrast and real-browser behaviour |
| Later | `DataTable` virtualisation, richer chart types — driven by what people actually ask for |

## Contributing

See [CONTRIBUTING.md](https://github.com/intellectwithvivek/vivek_UI/blob/main/CONTRIBUTING.md). Issues and component requests are welcome, and requests with
real demand jump the queue.

## Author

**Vivek Kumar Singh**

- Documentation &mdash; [ui.vivekkumarsingh.in](https://ui.vivekkumarsingh.in)
- Website &mdash; [vivekkumarsingh.in](https://vivekkumarsingh.in)
- GitHub &mdash; [@intellectwithvivek](https://github.com/intellectwithvivek)
- LinkedIn &mdash; [in/singhvvk](https://www.linkedin.com/in/singhvvk/)

## License

[MIT](https://github.com/intellectwithvivek/vivek_UI/blob/main/LICENSE) &copy; 2026 Vivek Kumar Singh. Free forever, for any use, commercial included.
