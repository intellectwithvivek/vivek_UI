# @the_viveksingh/vivek-ui

## 0.5.0

### Minor Changes

- ccc7f36: Add `EditableGrid` — a spreadsheet-style grid you can type into.
  
  Every component library ships a *table*. None ship an editable one, so teams reach for AG
  Grid, Handsontable or TanStack Table plus glue — a second dependency, often a paid licence,
  for the single feature of typing into a cell.
  
  ```tsx
  <EditableGrid
    rows={rows}
    columns={[
      { key: 'name', header: 'Name', editable: true },
      { key: 'qty', header: 'Qty', editable: true, numeric: true, parse: Number },
    ]}
    label="Inventory"
    onCellChange={({ rowIndex, columnKey, value }) => update(rowIndex, columnKey, value)}
  />
  ```
  
  **The keyboard model is the WAI-ARIA grid pattern, not a table with inputs in it.** That
  distinction is the whole design. An input per cell means one tab stop per cell, so a
  50-column grid takes fifty presses to escape. Here the entire grid is **one** tab stop,
  arrows move between cells, and a cell only becomes an input while it is being edited.
  
  | Key | Behaviour |
  | --- | --- |
  | Arrows | Move the focused cell |
  | Home / End | First / last cell in the row |
  | Ctrl+Home / Ctrl+End | First / last cell in the grid |
  | Enter or F2 | Start editing |
  | Any printable key | Start editing, replacing the cell |
  | Enter while editing | Commit and move down |
  | Tab / Shift+Tab | Commit and move right / left |
  | Escape | Cancel, restoring the previous value |
  
  **`format` and `parse` are separate from `render` on purpose.** A currency cell displays
  `$1,240.00` and edits as `1240`; conflating display and edit values is how editing a
  formatted cell corrupts it. `parse` returning `undefined` rejects the edit, which is
  validation without a second callback or an error state to thread through.
  
  **Nothing is mutated for you.** `onCellChange` reports the edit and your state decides. A
  grid that writes into the array it was handed cannot work with immutable state, undo, or a
  server round-trip that might fail.
  
  29 tests, including axe both at rest and mid-edit — an input nested inside a `gridcell` is
  exactly the arrangement most likely to produce a role violation.
- d9b6b76: Add `FileTree` — the WAI-ARIA treeview pattern, implemented properly.
  
  A tree is the control most often built as nested `<div>`s with click handlers, which
  produces something a keyboard cannot drive and a screen reader cannot describe. The pattern
  is specific, and this implements all of it:
  
  | Key | Behaviour |
  | --- | --- |
  | Up / Down | Previous / next **visible** node, crossing folder boundaries |
  | Right | Expand a collapsed folder, then step into it |
  | Left | Collapse an expanded folder, or move out to its parent |
  | Home / End | First / last visible node |
  | Enter / Space | Select |
  | `*` | Expand every folder at this level |
  | Any letter | Typeahead to the next match |
  
  Two implementation notes worth knowing:
  
  **The tree is flattened internally and rendered flat**, with depth drawn as padding and
  carried semantically by `aria-level`. Real DOM nesting would mean keyboard navigation has to
  walk the DOM to answer "what is the next visible node", which is where these implementations
  usually break — Down from the last child of a folder must reach that folder's next sibling.
  
  **`aria-level`, `aria-posinset` and `aria-setsize` are on every node.** A collapsed tree
  offers no other way to convey depth or position, so without them a screen-reader user hears
  a flat list of names with no structure at all.
  
  One tab stop for the whole tree, and a disabled node is genuinely unselectable rather than
  just dimmed. 18 tests, including axe both collapsed and expanded.
- 5dfb64a: Add `KanbanBoard` — a board a keyboard can actually use.
  
  Nearly every Kanban implementation on the web is mouse-only, and the reason is structural
  rather than lazy: **the HTML5 drag-and-drop API has no keyboard equivalent at all.**
  `draggable` and `dragstart` fire for pointers and nothing else. Adding `tabindex` does not
  help, because there is no key that initiates a drag. A board built on that API is unusable
  for keyboard users, screen-reader users, and anyone with a motor impairment.
  
  So there are two complete input paths here, not one.
  
  **Pointer** — ordinary HTML5 drag and drop, with the drop target highlighted while a card is
  in the air.
  
  **Keyboard** — the pick-up / move / drop model the WAI-ARIA authoring practices recommend in
  place of dragging:
  
  | Key | Behaviour |
  | --- | --- |
  | Enter or Space | Pick the card up, or drop it |
  | Left / Right | Move it to the previous / next column |
  | Up / Down | Move it within its column |
  | Escape | Cancel and leave it where it started |
  
  Every step is announced through an always-mounted `aria-live` region — *"Moved to In
  progress, position 2 of 4"* — because a silent move is indistinguishable from nothing
  happening. The instruction to press Enter is on each card as an accessible description,
  since a screen-reader user reaching a draggable card has no other way to discover it.
  
  Columns take an optional `limit`, which shows in the header and blocks drops once reached —
  announced as *"In progress is at its limit of 2"* rather than failing silently.
  
  **Nothing is mutated for you.** `onMove` reports the intended move; your state decides. That
  is the only shape that works with an optimistic update the server might reject.
  
  19 tests, most of them covering the keyboard path, plus axe at rest and mid-drag.
- de8a5ee: Add `Image`, `Newsletter` and `MapEmbed` — three things every marketing page needs and
  everyone rebuilds badly.
  
  **`Image`** — a bare `<img>` in a design system is a gap, not a simplification. Three things
  go wrong with one every single time, and all three are handled:
  
  - **Layout shift.** `ratio` reserves the box before the file arrives. Images with no
    reserved space are the largest single contributor to a poor CLS score.
  - **Broken images.** A dead URL renders the browser's broken-image icon on your marketing
    page. `fallback` replaces it, and the `alt` text stays in the accessibility tree even
    though the `<img>` is gone.
  - **Missing alt text.** `alt` is **required at the type level**, the same way `IconButton`
    requires `aria-label`. `alt=""` is available and is the correct answer for decoration —
    the point is that the decision cannot be skipped.
  
  **`Newsletter`** — email capture that keeps the three things hand-rolled versions lose: the
  label exists (visually hidden, because a placeholder disappears the moment you type),
  double submission is prevented by awaiting your promise rather than by hope, and the result
  lands in an `aria-live` region instead of silently swapping the form for a tick. Validation
  is `type="email"` — real, localised, accessible messages, and better than any regex.
  
  **`MapEmbed`** — an embedded map without the privacy footgun. Dropping a Google Maps iframe
  onto a contact page is one line that quietly makes your site contact Google and set cookies
  on first paint, before the visitor consents to anything. It is one of the most common ways a
  site acquires a GDPR problem and it is invisible unless you open the network tab. So:
  **OpenStreetMap is the default** (no cookies, no analytics, loads immediately), and **Google
  is gated behind a click**, with a real link out for anyone who never consents. The frame is
  sandboxed without `allow-same-origin` and lazy-loaded.
  
  25 tests across the three, including axe on each.
- 7b22e20: Add `Scheduler` — a resource timeline, with a keyboard model.
  
  Rooms, people or machines down the side; time across the top. Every booking tool, studio
  calendar and shift roster needs this view, and no free React library ships one: shadcn/ui,
  Mantine and Radix have nothing like it, and MUI's is behind a paid licence.
  
  **Overlapping bookings stack into lanes.** Drawing them on top of one another hides a
  double-booking, which on a scheduler is a data-loss bug rather than a cosmetic one. A greedy
  pack gives each booking the first lane whose previous booking has already finished, and the
  row grows to fit.
  
  **It works without a pointer.** A timeline communicates entirely through position, and
  position is invisible to a screen reader, so every booking carries its resource, its times
  and its duration in its accessible name — *"Podcast. Studio A, 10:00 to 12:30, 2 hours 30
  minutes"* — and the whole board is one tab stop with a roving focus:
  
  | Key | Behaviour |
  | --- | --- |
  | Left / Right | Previous / next booking for this resource, in time order |
  | Up / Down | The nearest booking in time on the resource above / below |
  | Home / End | First / last booking for this resource |
  | Enter or Space | Select |
  
  Up and Down skip resources with nothing on them, because stopping on an empty row reads as a
  dead key.
  
  Two details that are easy to get wrong and hard to notice:
  
  - **The clock is never read during render.** A `Date.now()` in the render body gives the
    server one marker position and the browser another, which React reports as a hydration
    mismatch. `showNow` reads it in an effect after mount; `now` takes an explicit time.
  - **The axis snaps to local midnight, not to the epoch.** `Math.floor(ms / hour)` snaps
    against UTC, which labels an hourly axis 08:30, 09:30, 10:30 for every user in India,
    Nepal, Newfoundland or central Australia.
  
  Times are formatted by a deterministic `HH:MM` rather than `Intl.DateTimeFormat`, whose
  output varies between Node builds and browsers; pass `formatTime` for anything else.
  
  **Nothing is mutated for you.** `onEventSelect` reports; your state decides.
  
  29 tests, plus axe.
- 1198b7f: Add `VirtualList` — windowed rendering for large datasets, with no dependency.
  
  A list of 50,000 rows mounts 50,000 components and the browser stops being interactive long
  before it finishes. `VirtualList` renders only the rows on screen and positions them with a
  transform, so the cost tracks the size of the viewport rather than the size of the data.
  
  Every other option here is a separate package — react-window, react-virtuoso, TanStack
  Virtual. This is about 150 lines and needs none of them.
  
  ```tsx
  <VirtualList items={rows} itemHeight={56} getKey={(r) => r.id} label="Customers">
    {(row) => <Row {...row} />}
  </VirtualList>
  ```
  
  **Two height modes.** A number is the fast path — scroll position maps to an index with one
  division and nothing is measured. A function is an *estimate*: rows are measured as they
  render and the estimate is replaced, so variable-height content works without the caller
  pre-computing anything.
  
  **Accessibility is the part virtualisation usually breaks.** A naive implementation
  announces "list, 12 items" when there are 50,000, because only 12 are in the DOM. Each row
  carries its true `aria-posinset` and the real `aria-setsize`, so a screen reader says
  "4,201 of 50,000".
  
  The role is `list`/`listitem` rather than `grid`/`row` for a reason worth recording:
  `aria-posinset` and `aria-setsize` are **not valid on a grid row** — axe rejects it — and a
  grid would have been a lie anyway, since these rows hold arbitrary content rather than
  cells.
  
  Also: `onRangeChange` reports the visible window, which is the hook for infinite loading;
  `scrollToIndex` jumps to a row; and the viewport is measured with a `ResizeObserver` rather
  than once, because a list inside a flex parent is routinely zero-height on first paint and
  would otherwise render empty forever.

### Patch Changes

- 7b22e20: Fix accessibility-lint failures across the six newest components, and stop uncategorised
  components from shipping invisible.
  
  `EditableGrid` held a `columnAt` helper that was rebuilt on every render, so it could never
  be a correct `useCallback` dependency — two suppressions were papering over it. It now reads
  `columns` directly and the dependency lists are honest.
  
  The remaining reports were false positives against ARIA patterns, and each now carries the
  reason rather than a bare suppression: `role="tree"` on a `ul` *is* the treeview pattern;
  grid rows and column headers are deliberately not focusable, because the pattern puts the
  single tab stop on the active cell; `role="list"` on a `list-style: none` list is what
  restores the semantics Safari drops; a scrollable viewport must be focusable or a keyboard
  user cannot scroll it (WCAG 2.1.1).
  
  Separately, seven components — `EditableGrid`, `VirtualList`, `FileTree`, `KanbanBoard`,
  `Image`, `MapEmbed` and `Newsletter` — had no entry in the docs category map, so they fell
  into an `Other` group the sidebar does not render and were unreachable from navigation. They
  are categorised now, and the registry generator exits non-zero when a component has no
  category instead of quietly hiding it.
- 694cabe: Fix three defects in the newest components.
  
  `KanbanBoard` built each card's accessible description id out of the card id alone, so two
  boards on one page emitted the same id twice and every duplicate `aria-describedby` resolved
  to whichever element the browser found first. The ids are prefixed with a generated one now.
  
  It also set `aria-grabbed`, deprecated in ARIA 1.1 and removed in 1.2. No current screen
  reader acts on it — the live region and the per-card description are what carry the state.
  
  `Scheduler` shadowed the DOM `window` global and its own `step` prop with local names.
  Neither was read in those scopes, so neither was a bug yet; both are the kind that becomes
  one on the next edit. A stray `data-testid` is gone from the published output too.
- 614d931: Fix `RadioGroup`'s documented `children` API, which did nothing.
  
  `options` worked. `children` — the other half of the documented API, the half you reach for
  when a radio needs custom content — silently did not:
  
  - no `name` reached the radios, so they were **not a native group at all**. Clicking one did
    not deselect the others, and nothing submitted with the form.
  - no `onChange` reached them, so the group's handler never fired.
  - `value` and `defaultValue` on the group were ignored, so a controlled group could not
    control anything.
  
  Each `Radio` child now receives the group's `name`, `required`, selection and change
  handler. Anything you set on the child yourself still wins, and a child's own `onChange`
  runs alongside the group's.
  
  This reaches direct children. A context would survive arbitrary nesting, but `createContext`
  cannot run in a React Server Component, and `RadioGroup` renders on the server today —
  turning it into a client component to support wrapping a radio in a `<div>` is the wrong
  trade.
  
  Found by a new test that asserts every exported component is rendered by at least one test,
  and by a suite that runs axe. `Radio` and `ChatThread.Empty` were both exported, documented
  and shipped without ever being rendered by anything; both are covered now.

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
