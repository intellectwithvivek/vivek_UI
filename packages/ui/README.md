<div align="center">

# VivekUI

**One install. Zero configuration. Every building block of a website.**

A React component library with **zero runtime dependencies** — no Tailwind, no PostCSS plugin,
no Babel plugin, no required provider. Works in React 18 and 19, and in Next.js with both the
Pages and App Router.

[![npm](https://img.shields.io/npm/v/@the_viveksingh/vivek-ui?color=4f46e5)](https://www.npmjs.com/package/@the_viveksingh/vivek-ui)
[![license](https://img.shields.io/npm/l/@the_viveksingh/vivek-ui?color=4f46e5)](https://github.com/intellectwithvivek/vivek_UI/blob/main/LICENSE)
[![one component](https://img.shields.io/badge/one%20component-199%20B-4f46e5)](#how-small-actually)

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

**28 components shipping today.** All but one are server-safe (no `'use client'`), every one is
accessible, and every one is covered by tests including automated axe checks.

| Layout | Typography | Actions | Forms | Display | Feedback |
|---|---|---|---|---|---|
| `Box` | `Heading` | `Button` | `Field` | `Badge` | `Alert` |
| `Stack` | `Text` | `IconButton` | `Label` | `Card` | `Spinner` |
| `Flex` | `Code` | `ButtonGroup` | `Input` | `Card.Header` | `Skeleton` |
| `Grid` | `Kbd` | | `Textarea` | `Card.Body` | `Progress` |
| `Container` | | | `Select` | `Card.Footer` | |
| `Divider` | | | `Checkbox` | `Avatar` | |
| `AspectRatio` | | | `RadioGroup` | `Avatar.Group` | |
| | | | `Switch` | | |

Full page sections, overlays, icons, DataTable and charts are next — see the
[roadmap](#roadmap).

### Forms solve the boilerplate everyone gets wrong

`Field` derives every id and ARIA relationship from one place, so the wiring cannot drift:

```tsx
<Field label="Email" help="We will never share it." error={errors.email} required>
  <Input type="email" autoComplete="email" />
</Field>
```

That renders the label with `htmlFor`, sets `required` and `aria-invalid` on the input, and points
`aria-describedby` at the **error** when there is one and the **hint** when there is not — because a
screen-reader user needs the reason their input was rejected, not the tip. The error is a live region,
so a message that appears after submit is actually announced. Any `aria-describedby` you pass
yourself is preserved alongside it.

Controls stay native underneath: `Select` is a real `<select>`, `RadioGroup` is a real `<fieldset>`
with a `<legend>` (which is what names the group, with no ARIA at all), and `Checkbox` and `Switch`
are real inputs that are visually hidden but never `display: none` — so focus, keyboard toggling,
form submission and the browser's own validation all keep working.

## How small, actually

Measured with `size-limit`, minified and brotlied, React excluded:

| Import | Cost |
|---|---|
| `{ Button }` | **199 B** |
| `{ Card, Badge, Alert }` | **501 B** |
| The entire library (28 components) | **3.48 kB** |
| `styles.css` (every component) | 35 kB, ~5 kB gzipped |

Per-file ESM plus `sideEffects: false` means you pay only for what you import. A hundred-component
catalog will still cost 199 B if `Button` is all you use.

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

27 of the 28 components carry no `'use client'` and render fine in React Server Components. Only
`Field` declares it, and only because `useId` is a hook — pass `id` yourself and nothing else in the
library needs a client boundary.

The build is unbundled precisely so each file keeps its own directive, and CI asserts it survives
every build in **both** ESM and CJS output.

## Roadmap

| Status | Ships |
|---|---|
| **Now** | Tokens, layout, typography, actions, **forms**, display, feedback — 28 components |
| Next | **Sections** — `Navbar`, `Hero`, `Footer`, `Pricing`, `FAQ`, `CTA`, `Stats`, `Sidebar` |
| Then | Overlays — `Modal`, `Drawer`, `Tabs`, `Accordion`, `Tooltip`, `Popover`, `Dropdown`, `Toast` |
| Then | Built-in icon set, `DataTable`, charts |

Installable full page **sections** are the differentiator. Primitives are everywhere, but assembling
a landing page still means writing the Navbar and the pricing table yourself. Those ship as
components here.

## Contributing

See [CONTRIBUTING.md](https://github.com/intellectwithvivek/vivek_UI/blob/main/CONTRIBUTING.md). Issues and component requests are welcome, and requests with
real demand jump the queue.

## Author

**Vivek Kumar Singh**

- Website &mdash; [vivekkumarsingh.in](https://vivekkumarsingh.in)
- GitHub &mdash; [@intellectwithvivek](https://github.com/intellectwithvivek)
- LinkedIn &mdash; [in/singhvvk](https://www.linkedin.com/in/singhvvk/)

## License

[MIT](https://github.com/intellectwithvivek/vivek_UI/blob/main/LICENSE) &copy; 2026 Vivek Kumar Singh. Free forever, for any use, commercial included.
