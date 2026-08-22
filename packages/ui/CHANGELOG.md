# @the_viveksingh/vivek-ui

## 0.4.0

### Minor Changes

- 810a702: Rebuild the design foundation, and fix five measured accessibility failures.
  
  **Heads up: this changes how the library looks.** No token was renamed or removed, so it
  is not a MAJOR bump, but 46 existing tokens keep their names while their *values* were
  retuned. If you were relying on a specific default, re-set it in your own `:root`.
  
  **59 new tokens.** The old file was 80 lines, and a thin palette is why a UI reads as
  basic no matter how good the components are:
  
  - **Layered surfaces** — `--vk-color-surface`, `-subtle`, `-sunken`, plus `-hover` and
    `-active` interaction washes. Previously every panel, input, menu and code block landed
    on the same flat `--vk-color-bg`, so nothing receded and nothing lifted.
  - **A five-step shadow ramp**, each step two layers (contact + ambient), and **re-tuned
    for dark mode**. Black shadows are invisible on a dark page, so dark-mode cards were
    rendering completely flat. Dark now also inverts the surface ramp — raised surfaces are
    *lighter* than the page, which is the only depth cue left.
  - **Typography**: line-height, letter-spacing and font-weight scales, plus
    `--vk-font-mono`, `--vk-text-xs` and `--vk-text-3xl`. `Heading` now tracks optically —
    tighter as type grows, rather than one flat value at every size.
  - **`--vk-color-ring`** as its own token, so rebranding `--vk-color-primary` to a pale
    colour can no longer silently destroy your focus indicator.
  - Accent hover/active/subtle steps, per-status `-fg`/`-subtle`/`-subtle-fg` pairs,
    `--vk-radius-xs`/`-xl`, six more spacing steps, and a motion scale
    (`--vk-duration-fast`/`-slow`/`-slower`, `--vk-ease-out`/`-in`/`-spring`).
  
  **Accessibility fixes, all found by measurement rather than by eye:**
  
  - `--vk-color-warning` measured **2.94:1** on white and `--vk-color-success` **3.30:1** —
    both below WCAG AA, so `<Text tone="warning">` and warning Alerts and Badges were
    unreadable. Every accent now clears 4.5:1 in both directions, in both themes.
  - Solid `Alert`, `Badge` and `Toast` hardcoded `color: #fff`. Against the bright
    dark-theme accents that is **1.7:1**. They use the `-fg` tokens now, which flip to
    near-black in dark mode.
  - Soft `Alert` and `Badge` variants tinted themselves with a transparent `color-mix`, so
    their contrast depended on whatever sat behind them — unverifiable, and worst exactly
    where badges live. They now use opaque `-subtle` pairs.
  - Two chart series failed non-text contrast (SC 1.4.11) on white: `#e69f00` at **2.25:1**
    and `#56b4e9` at **2.31:1**. The light palette is repaired *and* reordered so the four
    Okabe-Ito colours that already passed take slots 1–4. Measured worst-pair separation
    under simulated protanopia, deuteranopia and tritanopia is now **dE 17.0 for one to four
    series** — better than unmodified Okabe-Ito's 16.1 — and the two compromises sit at 5–6
    where dash patterns and marker shapes carry series identity anyway.
  - The dark chart palette had amber and pink at **dE 10.6** under tritanopia, close enough
    that a four-series chart could read as three. Series 4 moved a barely-visible dE 5.5 to
    reach 14.2.
  
  **Motion.** Hover feedback across all six charts — bars, slices, lines, markers and
  legend items now dim their siblings rather than brightening the target, so a value being
  compared against the axis does not shift colour as the pointer moves. Cards lift and
  settle. All of it behind `@media (hover: hover)` so a touch device never gets a state it
  cannot leave, and all of it reduced-motion guarded.
  
  **Two new gates** so none of the above can regress: `tokens.test.ts` (27 assertions) and
  `charts/palette.test.ts` (12), the latter running real Viénot/Brettel dichromacy
  simulation rather than trusting that a palette is colourblind-safe.
- 5927968: Add a `.vk-visually-hidden` utility and export `./package.json`.
  
  - **`.vk-visually-hidden`** ships in `styles.css`. Text that must be announced but not seen
    is needed constantly — a live region, a table caption, an icon-only label — and the usual
    hand-rolled versions are subtly broken: `display: none` and `visibility: hidden` remove
    the element from the accessibility tree as well as the page, and the older
    `clip: rect(0,0,0,0)` recipe can be read as a 1px line break. The library already needed
    this pattern in seven places internally. There is also
    `.vk-visually-hidden-focusable`, which reveals itself on focus, for a skip link.
  
    This is not the start of a utility framework. The styling model is still tokens plus
    `data-*` attributes; what earns a place here is a pattern that is needed everywhere, easy
    to get subtly wrong, and impossible to express with a token.
  
  - **`"./package.json"` is now in the `exports` map.** Tooling routinely resolves it — test
    runners, bundler plugins, anything calling `require.resolve` — and an `exports` map that
    omits it makes those fail with a subpath error that looks like a much bigger problem than
    it is.

### Patch Changes

- d1edf28: Point the package at the documentation site, now that it is live at
  [ui.vivekkumarsingh.in](https://ui.vivekkumarsingh.in).
  
  - `homepage` was a README anchor on GitHub, chosen before the site existed. npm renders this
    as the package's primary link, and a site with a page per component is a better destination
    than a heading.
  - The README never linked the site at all. It now leads with it, above the install
    instructions, plus direct links to the component and chart indexes, the playground, the
    installation guide and the FAQ.
  - The roadmap still listed the documentation site under "Next". It shipped several releases
    ago.
  - The one-component badge said 198 B. `size-limit` measures 773 B.
  
  `src/packaging.test.ts` asserts all of it, including that the size in the badge stays within
  its own budget — the metadata a developer sees before installing is invisible from inside the
  repo, which is exactly why it drifted.
- d934962: Fix TypeScript types resolving incorrectly for CommonJS consumers.
  
  The `exports` map pointed both the `import` and `require` conditions at the same
  `dist/index.d.ts`. Because the package is `"type": "module"`, that declaration file is
  ESM-flavoured — so a project doing `require('@the_viveksingh/vivek-ui')` under
  `moduleResolution: node16`/`nodenext` got **ESM type declarations for a file Node actually
  loads as CommonJS**. `@arethetypeswrong/cli` calls this `FalseESM`, "Masquerading as ESM".
  
  In practice that meant a CJS TypeScript consumer could see spurious type errors, or types
  that only worked via a dynamic `import()`. The runtime code was always correct; only the
  declarations were mis-mapped.
  
  Both entrypoints now declare types per condition, pointing `require` at the `.d.cts` files
  the build was already emitting:
  
  ```json
  ".": {
    "import": { "types": "./dist/index.d.ts",  "default": "./dist/index.js" },
    "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
  }
  ```
  
  `@arethetypeswrong/cli` is now fully green across node10, node16 (from CJS), node16 (from
  ESM) and bundler for both `.` and `./charts`, and `publint` reports no issues. Both tools run
  in CI, so this class of defect cannot return — every existing test passed while it was
  broken, because the tests only ever import the ESM build.
  
  Also adds `engines.node: ">=18"`, which `publint` was flagging as missing. It is deliberately
  permissive: the published code is browser JavaScript plus type declarations and uses no Node
  API, so a tighter floor would only produce spurious install warnings.
- 94a7cca: Fix `Carousel` and `Clock` failing in real apps, and document the seven components that had no description.
  
  - **`Carousel` could not be rendered from a Server Component.** With `showDots`, the root forwarded the `dotLabel` callback to its client-side controls, and React refuses to serialise a function across that boundary — so any App Router page using it threw *"Functions cannot be passed directly to Client Components"*. The dot names are now resolved before the boundary and passed as strings. `dotLabel` itself is unchanged.
  - **`Clock` threw on `dateStyle` or `timeStyle`.** `format` was spread on top of the `hour`/`minute`/`second` defaults, leaving both families of options present, which `Intl.DateTimeFormat` rejects outright with `TypeError: Invalid option`. The documented "anything set here wins over the shortcuts" now actually overrides them. A `timeStyle` of `medium` or longer also correctly ticks once a second instead of once a minute.
  - Added JSDoc to `Button`, `DataTable`, `Heading`, `IconButton`, `Label`, `Text` and `Textarea`, which had none — so their docs pages showed no description.
  
  Both bugs were found by building every component's documentation page from Server Components.
- bc19b24: Fix seven visual bugs, four of them layout faults you could not see in a test.
  
  - **`Calendar` and `DatePicker` rendered as a narrow vertical capsule** with the month grid
    spilling out of it. `.vk-calendar` set `container-type: inline-size` on an `inline-flex`
    box: containment makes an element's inline size independent of its contents, so on an
    inline-level box the width collapsed to the padding. `DatePicker` inherited it because it
    embeds a `Calendar`. The container query it enabled only nudged the cell from 2.25rem to
    2.5rem, so it is gone — a calendar sizes to its seven columns.
  - **A `Badge` stretched to the full width of its container.** `align-items` defaults to
    `stretch` and `Stack` leaves it unset unless you pass `align`, so a badge in a vertical
    `Stack` or a `Card.Header` was stretched — a "Most popular" pill spanning a whole pricing
    card. `Badge`, `Kbd`, `Avatar` and `Spinner` now set `width: fit-content`, which switches
    stretch off without forcing top-alignment in a horizontal row the way `align-self` would.
  - **The horizontal `Stepper`'s connector ran through its labels**, reading as a
    strike-through. The text block clears the rail now, and sits above it.
  - **`Carousel` arrows sat on top of the slide content.** The track reserves a gutter for
    them, and matches its `scroll-padding` so a snapped slide lands clear rather than under.
    Arrows also gained a hover lift, and a border so they read against a pale slide.
  - **A collapsed `Sidebar` item with no `icon` collapsed to nothing at all** — an empty rail
    with no way to tell rows apart, or that rows existed. It falls back to the label's
    initial, `aria-hidden`, since the clipped label is still what names the link.
  - **`Clock`, `Alert`, `Badge` and `Toast` hover states**: `--vk-color-primary-hover` was set
    *lighter* than the base on the reasoning that platforms lighten on hover. That put white
    text at **4.32:1** on a hovered primary button — below AA. Hover and active now move away
    from the foreground sitting on them, so contrast can only improve on interaction: darker
    in light mode, lighter in dark. An accent 0.2 above the threshold has no room to lighten.
  
  **New: an interactive chart legend.** `interactiveLegend` on `LineChart`, `AreaChart` and
  `BarChart` turns each legend entry into a checkbox that fades its series in and out.
  
  It is built from real checkboxes and a `:has()` selector, so it needs **no client boundary
  and no JavaScript** — these charts still render entirely on the server. It also comes out
  better than a scripted version: a checkbox is keyboard-operable and announced as
  "Revenue, checkbox, checked" for free, where a clickable `<li>` would need a role, a
  tabindex, key handlers and `aria-pressed` to reach the same place. The legend drops
  `aria-hidden` when interactive, because hiding a focusable control is worse than the
  duplication that flag avoids.
  
  Deliberately **not** on `PieChart`: hiding a wedge would leave a gap while the others kept
  their angles, so the chart would stop summing to the whole and would misreport every
  remaining share.
  
  **Two new gates.** `containment.test.ts` reads every stylesheet and fails on
  `container-type` combined with an inline display — the calendar bug is invisible to jsdom,
  which does no layout, so nothing else could catch it. `tokens.test.ts` now covers hover and
  active states, which is the gap that let the 4.32:1 hover ship.
