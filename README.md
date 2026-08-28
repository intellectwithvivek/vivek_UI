<div align="center">

<a href="https://ui.vivekkumarsingh.in">
  <img src="https://ui.vivekkumarsingh.in/opengraph-image" alt="VivekUI - a free, zero-dependency React component library" width="720">
</a>

# VivekUI

**Every building block of a website. One install, zero configuration, no dependencies.**

<!-- hero-stats:start -->
**98 accessible React components**, **10 SVG charts** and **12 ready-made pages** you can copy.
No Tailwind, no PostCSS plugin, no Babel plugin, no required provider.
Works in React 18 and 19, and in Next.js with both the Pages and App Router.
<!-- hero-stats:end -->

[![npm](https://img.shields.io/npm/v/@the_viveksingh/vivek-ui?color=4f46e5&label=npm)](https://www.npmjs.com/package/@the_viveksingh/vivek-ui)
[![license](https://img.shields.io/npm/l/@the_viveksingh/vivek-ui?color=4f46e5)](LICENSE)
[![runtime deps](https://img.shields.io/badge/runtime%20deps-0-4f46e5)](#zero-dependencies-verifiable)
<!-- size-badge:start -->
[![one component](https://img.shields.io/badge/one%20component-774%20B-4f46e5)](#how-small-actually)
<!-- size-badge:end -->
[![axe tested](https://img.shields.io/badge/axe-tested%20per%20component-4f46e5)](#accessibility)
[![provenance](https://img.shields.io/badge/npm-signed%20provenance-4f46e5)](#security)

### [**Documentation, live examples and a playground &rarr;**](https://ui.vivekkumarsingh.in)

[Components](https://ui.vivekkumarsingh.in/docs/components) &middot; [Page templates](https://ui.vivekkumarsingh.in/pages) &middot; [Charts](https://ui.vivekkumarsingh.in/docs/charts) &middot; [Playground](https://ui.vivekkumarsingh.in/playground) &middot; [Installation](https://ui.vivekkumarsingh.in/docs/installation) &middot; [FAQ](https://ui.vivekkumarsingh.in/docs/faq)

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

[What is different here](#what-you-will-not-find-in-another-free-library) &middot;
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

## What you will not find in another free library

Every free React library gives you a button and a modal. These are the pieces that are
missing when you try to finish an actual product, and the reason they are missing is always
the same: doing them properly means writing a keyboard model, and that is the part people
skip.

| | What it does | Why nobody else ships it |
|---|---|---|
| **`EditableGrid`** | A spreadsheet you type into | The full ARIA grid model, with **one tab stop for the whole grid**. An input per cell makes a 20&times;8 grid 160 tab stops. |
| **`Scheduler`** | Rooms or people down the side, time across the top | A timeline speaks through position, which a screen reader cannot see. MUI's is behind a paid licence; the rest have none. |
| **`KanbanBoard`** | Drag a card, or move it with the keyboard | **HTML5 drag-and-drop has no keyboard equivalent at all.** So this ships two complete input paths, the second announced through a live region. |
| **`FileTree`** | A real treeview | Arrows crossing folder boundaries, `*` to expand a level, typeahead. Most "trees" are nested `div`s with click handlers. |
| **`VirtualList`** | 50,000 rows, 12 in the DOM | `aria-posinset` and `aria-setsize` stay honest, so a screen reader hears "4,201 of 50,000", not "of 12". |

And **[twelve complete pages](https://ui.vivekkumarsingh.in/pages)** &mdash; landing, pricing,
dashboard, checkout, sign in, settings, blog, product, contact, team, sign up and 404. Each one
is built only from exports of this package, which a build step enforces, so the code on the page
runs as-is. Copy it, change the words, ship it.

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
| Server Components | 49 of 98 need no client boundary | Depends what you copied | Often needs a client boundary |
| Charts | Built in, pure SVG, 0 deps | Wraps Recharts (~100 kB) | Separate package |
| Theming | Plain CSS custom properties | Tailwind config | Theme object / JS API |

## Components

<!-- component-stats:start -->
**98 components. 149 runtime exports.** Every one is covered by tests including
automated `axe` assertions, and **49 need no `'use client'`** — they render directly in React
Server Components.
<!-- component-stats:end -->

### Layout

<!-- catalog-layout:start -->
`AspectRatio` &middot; `BentoGrid` &middot; `Box` &middot; `Container` &middot; `Divider` &middot; `Grid` &middot; `InfiniteScroll` &middot; `ScrollArea` &middot; `Section` &middot; `Flex` &middot; `Stack`
<!-- catalog-layout:end -->

### Typography

<!-- catalog-typography:start -->
`Code` &middot; `Heading` &middot; `Kbd` &middot; `isSafeHref` &middot; `Prose` &middot; `Text`
<!-- catalog-typography:end -->

### Actions

<!-- catalog-actions:start -->
`Button` &middot; `ButtonGroup` &middot; `CopyButton` &middot; `IconButton`
<!-- catalog-actions:end -->

### Forms

<!-- catalog-forms:start -->
`Calendar` &middot; `formatDate` &middot; `parseISODate` &middot; `toISODate` &middot; `Checkbox` &middot; `Chip` &middot; `Combobox` &middot; `DatePicker` &middot; `Field` &middot; `FileUpload` &middot; `formatBytes` &middot; `matchesAccept` &middot; `Form` &middot; `Input` &middot; `Label` &middot; `NumberInput` &middot; `OTPInput` &middot; `PasswordInput` &middot; `Radio` &middot; `RadioGroup` &middot; `Rating` &middot; `Segmented` &middot; `Select` &middot; `Slider` &middot; `Switch` &middot; `TagInput` &middot; `Textarea`
<!-- catalog-forms:end -->

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

<!-- catalog-overlays:start -->
`Accordion` &middot; `Drawer` &middot; `DropdownMenu` &middot; `HoverCard` &middot; `Modal` &middot; `Popover` &middot; `Portal` &middot; `Tabs` &middot; `Toast` &middot; `useToast` &middot; `Tooltip`
<!-- catalog-overlays:end -->

### Navigation

<!-- catalog-navigation:start -->
`Breadcrumb` &middot; `CommandPalette` &middot; `Navbar` &middot; `Pagination` &middot; `Sidebar`
<!-- catalog-navigation:end -->

Every link-rendering part accepts `asChild`, so your router's `Link` works without the library
depending on a router:

```tsx
<Navbar.Link asChild><Link href="/pricing">Pricing</Link></Navbar.Link>
```

### Data display

<!-- catalog-data-display:start -->
`Avatar` &middot; `Badge` &middot; `Card` &middot; `DataTable` &middot; `EditableGrid` &middot; `FileTree` &middot; `KanbanBoard` &middot; `Scheduler` &middot; `Stepper` &middot; `Table` &middot; `Timeline` &middot; `VirtualList`
<!-- catalog-data-display:end -->

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

`EditableGrid`, `VirtualList`, `FileTree`, `KanbanBoard` and `Scheduler` are here because no other
free React library ships them — and the reason they are missing elsewhere is always the keyboard.

| Component | The part everyone skips |
|---|---|
| `EditableGrid` | The full WAI-ARIA grid model, with **one tab stop for the whole grid**. An input per cell makes a 20&times;8 grid 160 tab stops. |
| `VirtualList` | `aria-posinset` and `aria-setsize` stay honest while it windows, so a screen reader hears "item 4,201 of 50,000" rather than "of 12". |
| `FileTree` | Arrows crossing folder boundaries, Right to open then enter, `*` to expand a level, typeahead. Most trees are nested `div`s with click handlers. |
| `KanbanBoard` | **HTML5 drag-and-drop has no keyboard equivalent at all** — no key starts a drag. So this ships two complete input paths, the second a pick-up / move / drop model with live-region announcements. |
| `Scheduler` | A timeline says everything through position, which a screen reader cannot see, so each booking carries its resource, times and duration in its accessible name. Overlaps stack into lanes instead of hiding each other. |

None of them mutate your data. Each reports the intended change and your state decides, which is
the only shape that survives an optimistic update the server rejects.

### AI chat

<!-- catalog-ai-chat:start -->
`ChatCodeBlock` &middot; `ChatInput` &middot; `ChatMessage` &middot; `ChatThread` &middot; `TypingIndicator`
<!-- catalog-ai-chat:end -->

Message content is always a `ReactNode`, never an HTML string — nothing in the chat path
touches `dangerouslySetInnerHTML`, so model output cannot become markup. The
transcript is a `role="log"` with `aria-relevant="additions"`, so new turns are announced without
re-reading the thread, and auto-scroll sticks to the bottom **without** yanking the user back when
they have scrolled up to read.

### Feedback

<!-- catalog-feedback:start -->
`Alert` &middot; `EmptyState` &middot; `Progress` &middot; `Skeleton` &middot; `Spinner`
<!-- catalog-feedback:end -->

### Sections

<!-- catalog-sections:start -->
`CTA` &middot; `FAQ` &middot; `FeatureGrid` &middot; `Footer` &middot; `Hero` &middot; `LogoCloud` &middot; `Newsletter` &middot; `Pricing` &middot; `Stats` &middot; `Testimonials`
<!-- catalog-sections:end -->

Installable page sections are the differentiator. Primitives are everywhere, but assembling a
landing page still means hand-writing the pricing table. Here it is a component. `FAQ` is built on
native `<details>`, so it needs **no ARIA and no JavaScript**.

### Media and time

<!-- catalog-media-time:start -->
`AnimatedCounter` &middot; `Carousel` &middot; `Clock` &middot; `Countdown` &middot; `Image` &middot; `MapEmbed` &middot; `Marquee` &middot; `RelativeTime`
<!-- catalog-media-time:end -->

`Countdown` and `Clock` accept a `now` prop and never read the clock during render, so server and
client HTML agree and there is no hydration mismatch. `AnimatedCounter` renders its **final** value
in server HTML, never `0`.

### Theming

<!-- catalog-theming:start -->
`createThemeScript` &middot; `DEFAULT_STORAGE_KEY` &middot; `DEFAULT_THEME_ATTRIBUTE` &middot; `ThemeProvider` &middot; `themeScript` &middot; `useTheme` &middot; `ThemeToggle`
<!-- catalog-theming:end -->

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

<!-- size-table:start -->
| Import | Cost |
|---|---|
| `{ Button }` | **774 B** |
| `{ Modal }` (focus trap + scroll lock + portal) | **2.9 kB** |
| A whole landing page (`Hero`+`FeatureGrid`+`Pricing`+`FAQ`+`CTA`+`Footer`) | **2.9 kB** |
| All six charts | **10.5 kB** |
| Every component, imported at once | **51.3 kB** |
| `styles.css` | 207.7 kB raw, **28.9 kB gzipped** |
| `charts.css` | 12.2 kB raw, **2.5 kB gzipped** |
<!-- size-table:end -->

Per-file ESM plus `sideEffects: false` means you pay only for what you import: importing `Button`
alone costs a fraction of the whole-library figure above.

**One caveat, stated plainly:** the CSS is a single stylesheet, so an app using five components
still downloads the whole thing. That is the trade for "one import, no build configuration".
Chart CSS is split out separately.

### Zero dependencies, verifiable

```bash
npm ls --omit=dev @the_viveksingh/vivek-ui
```

`react` and `react-dom` are `peerDependencies` (`^18 || ^19`) and are never bundled, so you cannot
end up with two copies of React and the duplicate-hooks errors that follow.

Verified on every commit against **npm, yarn and pnpm** — the real tarball, installed and
SSR-rendered in bare Node — in **ESM and CJS**, under all three
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

Colour contrast is verified twice: arithmetically against the tokens (WCAG 2.1 ratios computed in
`tokens.test.ts`, both themes), and by `axe` in a real browser against composed pages — including
dark mode — in the Playwright suite, where contrast is measured on the pixels actually painted.

## Server Components

<!-- server-components:start -->
**49 of the 98 components carry no `'use client'`** and render directly in React Server Components.
Only genuinely interactive ones declare it, per file.

The build is unbundled precisely so each file keeps its own directive, and CI asserts on every build
that all 61 client files still carry theirs in **both** the ESM and CJS output.
<!-- server-components:end -->

## Security

- **No `innerHTML` or `eval` anywhere; `dangerouslySetInnerHTML` exactly once** — the FAQ's
  opt-out JSON-LD block, whose payload is `JSON.stringify` output with `<` escaped to `<`,
  so no markup can pass through it whatever the items contain. A test pins the budget to that
  one file and asserts the escaping, so a second use anywhere fails CI
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

Report a vulnerability via [SECURITY.md](SECURITY.md).

## Roadmap

| Status | |
|---|---|
| **Shipped** | Layout, typography, actions, forms, overlays, navigation, data, AI chat, sections, media, charts, theming |
| **Shipped** | [Documentation site](https://ui.vivekkumarsingh.in) &mdash; a page per component with live previews, props tables and an in-browser playground |
| **Shipped** | Playwright suite: real-browser layout at phone/tablet/desktop, axe on composed pages in both themes, touch-target audit |
| Next | Built-in icon set |
| Later | `DataTable` virtualisation, richer chart types — driven by what people actually ask for |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and component requests are welcome, and requests with
real demand jump the queue.

## Author

**Vivek Kumar Singh**

- Documentation &mdash; [ui.vivekkumarsingh.in](https://ui.vivekkumarsingh.in)
- Website &mdash; [vivekkumarsingh.in](https://vivekkumarsingh.in)
- GitHub &mdash; [@intellectwithvivek](https://github.com/intellectwithvivek)
- LinkedIn &mdash; [in/singhvvk](https://www.linkedin.com/in/singhvvk/)

## License

[MIT](LICENSE) &copy; 2026 Vivek Kumar Singh. Free forever, for any use, commercial included.
