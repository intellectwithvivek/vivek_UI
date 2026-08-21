---
'@the_viveksingh/vivek-ui': minor
---

Add overlays, charts, page sections and the shared accessibility primitives.

**Overlays** — `Modal`, `Drawer`, `Tabs`, `Accordion`, `Tooltip`, `Popover`, `DropdownMenu`, `Toast`
(with `ToastProvider` and `useToast`), plus `Portal`.

**Charts** at the new `./charts` subpath — `Sparkline`, `LineChart`, `AreaChart`, `BarChart`,
`PieChart`, `ProgressRing`. Pure SVG, no charting dependency. Each renders a real `<table>`
fallback so screen-reader users get the values, and encodes series by dash pattern and marker
shape as well as colour, on a colourblind-safe palette. Chart CSS ships separately as
`./charts.css`, so a consumer who never imports a chart pays nothing for it.

**Page sections** — `Section`, `Hero`, `FeatureGrid`, `Pricing`, `Testimonials`, `FAQ`, `CTA`,
`Stats`, `Footer`, `LogoCloud`. All server-safe, responsive through container queries rather than
viewport media queries, so a section inside a narrow sidebar collapses the way it would on a phone.
`FAQ` is built on native `<details>` and needs no ARIA and no JavaScript.

**New tokens** — `--vk-color-success`, `--vk-color-warning` and `--vk-color-overlay` (all
previously hard-coded, so they could not be themed), plus `--vk-z-overlay`, `--vk-toast-z`,
`--vk-modal-width-*`, `--vk-drawer-size-*` and `--vk-toast-*`.
