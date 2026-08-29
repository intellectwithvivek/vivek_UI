# @the_viveksingh/vivek-ui

## 1.0.1

### Patch Changes

- 67fad5d: Restore `-webkit-backdrop-filter` in the published stylesheet, and pin a Safari floor.
  
  1.0.0 shipped without it. The prefix is in the source and a test requires it there, but the
  CSS build is given browser targets and lightningcss removes a prefix it judges unnecessary
  for that range — correctly. The range was the problem: `last 2 safari versions` resolves to
  Safari 26.x, which reads `backdrop-filter` unprefixed, so the twin was stripped from the
  bundle. Safari 16.4 to 17.x — macOS Ventura and Sonoma, which plenty of people are still on
  — do need it, and lost the sticky navbar's blur.
  
  The targets now pin `safari >= 16.4` and `ios_saf >= 16.4`, which is the oldest Safari that
  supports what the library actually requires (container queries, `color-mix()`, `:has()`).
  Supported browsers are documented as that floor rather than as a moving window, and the
  compat test now reads `dist/styles.css` as well as the source — checking the source alone
  could never have seen this — and rejects a `last N safari versions` target outright.
  
  Costs 381 bytes gzipped. No API change.

## 1.0.0

### Major Changes

- 60cc8b7: **1.0.0** — the stable release. One package, 109 components, 10 charts, zero runtime
  dependencies, and an API that will not move for the next two years of minors.
  
  This is the release the pre-1.0 line was working towards, and it lands as one version rather
  than a trail of deprecations: everything below the fold of this changelog — the API canon
  (`value` / `defaultValue` / `onValueChange`, `size`, `tone`, `invalid`, required labels on
  unlabelled widgets, `asChild` everywhere a child can be the element), the twenty-two new
  components since 0.5, the section variants, the four charts, the hardening gates — ships
  together and is what 1.x is measured against.
  
  **What "stable" means here**
  
  - Every `vk-` class and `--vk-` token is public API; renaming one is a 2.0.
  - Every exported prop is documented in the props table generated from the declarations, and
    every component page has a live example.
  - Every component has a `vitest-axe` assertion, a keyboard map from the WAI-ARIA Authoring
    Practices where it is interactive, and is hydrated in the SSR sweep.
  - Gates that fail the build, not a checklist: §4.1 contract, leaks, hydration, logical
    properties, reduced motion, Safari prefixes, shrinkable scroll containers,
    dangerouslySetInnerHTML budget, packaging, install matrix (npm / yarn / pnpm), Node 18 and
    20, React 18 and 19, and a browser suite that runs every route and every demo in Chromium
    (phone / tablet / desktop), Firefox and WebKit.
  - Browser support is stated and tested, not assumed: the last two versions of Chrome, Edge,
    Firefox and Safari, plus iOS Safari. The CSS build targets exactly that list.
  
  **Migrating from 0.x**: see `/docs/migration`. Renames are listed one per line with the
  before and after; nothing was removed without a replacement.

### Minor Changes

- 97d87ce: `AnchorNav` — the "On this page" table of contents that knows where you are.
  
  Every entry is a real `<a href="#id">`, so it works before JavaScript and copies as a link.
  Once mounted, an IntersectionObserver tracks the targets and marks the section in view with
  `aria-current="location"`; with nothing in view, the last section scrolled past stays
  current. Clicking scrolls smoothly — instantly under `prefers-reduced-motion` — accounts
  for a fixed header via `offset`, replaces the hash without adding history entries, and
  moves focus to the target so a keyboard user continues from the section. One level of
  nesting, vertical rail or horizontal underline, controlled or uncontrolled `activeId`.
- 3a81372: `AudioPlayer` — an audio player with its own controls, for podcasts, voice notes and samples.
  
  A bordered card in the theme's colours with an optional artwork + title row, then one
  control row: play, elapsed, seek, total, mute, volume, speed. Every control is a real
  `<button>` or `<input type="range">` with a name; the seek bar announces "1:23 of 4:56"
  and volume announces a percentage. Space/K play, arrows seek and change volume, J/L jump
  ten seconds, M mutes. Several `src` sources, an error state with `role="status"`, `size="sm"`
  for inline use, and `audioRef` / `audioProps` for anything the player does not model.
  Progressive files only (MP3, OGG, WAV, AAC).
  
  `formatTime` — the media clock formatter both players share — is an internal utility.
- ce22e8e: `Chip` and `NumberInput`.
  
  **Chip** is three shapes, and the element changes with the job: a `<span>` when static, a
  real `aria-pressed` button when selectable (a filter bar announces correctly for free), and
  a span with its **own** remove button when removable — never a button inside a button, which
  is why `selectable` and `onRemove` are mutually exclusive and removal wins. Delete and
  Backspace on a focused chip remove it, matching TagInput. Tones use the soft washes with
  their AA-verified `-subtle-fg` text partners.
  
  **NumberInput** is `<input type="number">`'s defects, fixed: `type="text"` +
  `inputmode="decimal"` + the APG spinbutton contract. The value is `number | null` — null is
  empty, `NaN` never escapes. Drafts stay free text until Enter or blur, then parse, round to
  `precision`, and clamp into range; garbage reverts instead of lingering as text that looks
  accepted. Arrows step, Shift steps ×10, Home/End jump to the bounds; the hold-to-repeat
  steppers are pointer-only chrome hidden from AT because the input *is* the spinbutton; the
  mouse wheel is off by default because a page scroll silently drifting a focused quantity is
  the classic corruption bug.
- 9855eb8: `ColorPicker` — a colour picker made of real controls.
  
  Hue, saturation, brightness (and alpha) are `<input type="range">`s with names and spoken
  values ("217 degrees", "76%"); the hex field is a text input that commits on Enter or blur,
  accepts `#rgb`, `#rrggbbaa` and `rgb()` on the way in, and reverts what it cannot parse;
  presets are pressed toggles. The two-dimensional area is a pointer convenience over the
  same state, hidden from assistive tech because the sliders already say everything it shows.
  Emits lower-case hex, keeps hue through zero saturation, offers the browser's EyeDropper
  where one exists, posts through a hidden input with `name`, and takes `Field`'s injected
  `id` / `aria-describedby` / `invalid`. `variant="popover"` puts the panel behind a swatch.
  
  `parseColor`, `toHex`, `rgbToHsv`, `hsvToRgb` and `contrastRatio` are internal utilities.
- f21e35a: `ContextMenu` — a right-click menu with the keyboard path everyone leaves out.
  
  `contextmenu` is a pointer event, so a menu that opens only on it does not exist for anyone
  without a mouse. The trigger surface is focusable and opens on **Shift+F10** and the
  **ContextMenu key** — the two keys every desktop operating system already uses for this —
  at its own centre. Closing returns focus to wherever it was, not merely to the trigger.
  
  Inside, it is `DropdownMenu`'s menu: roving arrows that skip disabled items and wrap,
  Home/End, typeahead, Enter/Space to activate, `aria-disabled` rather than `disabled` so an
  unavailable command is still announced, Tab and Escape to leave. The panel is positioned by
  the same solver as every other overlay, fed a zero-size anchor at the pointer, so it flips
  and clamps at the viewport edges instead of running off the screen.
  
  `ContextMenu.Item asChild` makes an item a real link. `ContextMenu.Trigger asChild` makes any
  element the surface — a canvas, a table row, a card.
- f941ece: Cross-browser correctness, and per-component stylesheets.
  
  **Per-component CSS.** `dist/styles.css` is the whole library in one file — 34 kB gzipped,
  of which a page using a Button, a Card, an Input, a Navbar and a Hero needs about 4. Those
  pages can now import only what they use:
  
  ```ts
  import '@the_viveksingh/vivek-ui/css/reset.css'
  import '@the_viveksingh/vivek-ui/css/tokens.css'
  import '@the_viveksingh/vivek-ui/css/button.css'
  ```
  
  112 stylesheets are built alongside the bundle, one per component plus `reset`, `tokens`
  and `touch`. `styles.css` is unchanged and remains the answer for anyone who would rather
  not think about it. (The JavaScript was never the weight: a Button is 780 B brotli, a whole
  landing page 3.1 kB.)
  
  **Safari and Firefox.** The browser suite now runs in Firefox and WebKit as well as
  Chromium, and found four real defects on its first run:
  
  - `user-select`, `backdrop-filter` and `mask-image` had no `-webkit-` twin, so Safari
    ignored them — text on a chart legend was selectable, the sticky navbar had no blur. Both
    the prefixes and a test that requires them are now in place, and lightningcss is given
    browser targets so it keeps them.
  - `VideoPlayer`: sources are tried **in order**, and Safari holds the document's `load`
    event while it works through a format it cannot decode — a WebM-first list made the whole
    page appear to hang. Documented on the prop; list MP4 first.
  - `VideoPlayer`: `poster` must be a **raster** image. Safari ignores an SVG poster and, again,
    never fires `load`. Documented on the prop.
  - axe measurements now wait for entry animations to finish. WebKit still had 56 running
    right after `load`, so contrast was sampled mid-fade and reported a false failure.
  - Every horizontal scroll container — the table wrapper, code blocks, the tablist, the
    carousel track, the thumbnail strips, KanbanBoard, Scheduler — now carries
    `min-inline-size: 0` **and** a `position` that makes it a containing block, so it scrolls
    itself instead of pushing the page. The second half is the subtler bug: a
    `.vk-visually-hidden` announcement inside a wide strip is absolutely positioned, and
    without a containing block it resolved against the page and stretched it — the KanbanBoard
    docs page scrolled 491px sideways on a phone while the strip itself measured correctly. A
    gate requires both of any new container; its first version had a list of reasoned
    exemptions, and WebKit disproved all of them.
- 5a16b7e: `DateRangePicker` — the top-three request in every date library's tracker, and mostly wiring.
  
  `Calendar` already implemented range selection — click-before-start swaps the ends, the hover
  preview, disabled days unreachable rather than merely unclickable — and `DatePicker` had
  already solved the popover, positioning, dismissal and focus hand-off. Nobody had joined
  them. This is that join: one trigger reading "start – end", a popup hosting the range
  Calendar, closing on the second date and returning focus to the field.
  
  **A half-selection never leaks out of the popup.** Pick a start, press Escape, and the field
  restores the last complete range instead of holding `{ start, end: null }` — a form
  submitting one date of two is the defect every range picker ships once. The two hidden
  fields (`{name}-start`, `{name}-end`) use Calendar's own convention, as ISO dates, so a
  form does not care which component rendered them.
  
  The trigger's accessible name always carries the range in words — "Stay: March 12, 2026 to
  March 15, 2026" — because two terse ISO strings on screen are meaningless as speech. Visible
  text uses a deterministic `YYYY-MM-DD` by default; pass `format` for anything else.
- ce22e8e: `Form` — validation and submission orchestration with zero dependencies, built on the
  principle that **the browser already knows how to validate; it just reports badly.**
  
  `required`, `minLength`, `type="email"` and `pattern` work exactly as on plain HTML. Form
  intercepts submit, collects every failure through the constraint validation API, swaps in
  readable `messages` (per field, per failure kind), **focuses the first invalid control in
  document order**, and hands `{ errors, submitting, submitError }` to the layout — plain
  children or a render function. `validate` adds cross-field rules, with native failures
  winning per field. Async `onSubmit` drives `submitting`; a rejected submit lands in
  `submitError` for the layout to render instead of dying as an unhandled rejection in the
  console. Errors clear on the next attempt, not per keystroke — messages should not vanish
  while they are being read.
  
  No context, no controller, no field registration: state lives in the DOM, where the values
  already are.
- 6c7ea05: Four new charts — Scatter (and Bubble), Radar, Gauge, Heatmap. Ten charts total, still
  zero dependencies, still pure SVG or HTML rendered complete on the server.
  
  **`ScatterChart`** — both axes are measures, answering "do these move together". Give any
  point an `r` and the series becomes a **bubble chart**: `r` maps to the mark's *area*, not
  its radius, because radius scaling (the Chart.js default) squares every visual ratio and
  quietly exaggerates the data. Unplottable points are dropped, never drawn as NaN geometry.
  
  **`RadarChart`** — a polygon per series over shared axes. Series separate by colour *and*
  dash *and* vertex shape, so overlapping series survive greyscale and colour blindness.
  Refuses fewer than three axes in words rather than drawing a degenerate shape, and drops
  values beyond the axis count rather than wrapping two observations onto one spoke.
  
  **`Gauge`** — one value against threshold bands, the "is it in the healthy zone" chart.
  The accessible name always carries the figure, the range and the band label — the SVG is
  decoration around a number, and a title never displaces the number the way it rightly does
  on charts that ship a data table. Out-of-range values clamp instead of swinging the needle
  off the dial.
  
  **`Heatmap`** — two categorical axes, intensity for the value: the GitHub-contribution
  shape generalised. HTML grid rather than SVG (wrapping labels, container responsiveness),
  with the ramp mixed from the tokens via `color-mix` — so it holds in dark mode with no
  second palette, and because it is a *lightness* ramp it survives every form of CVD. The
  smallest value never fades to blank, and the real numbers ship in the accessible table.
  
  Every figure in all four is reachable as text. 22 new tests, plus axe across the set.
- ce22e8e: `InfiniteScroll` — an IntersectionObserver sentinel that never strands a keyboard user.
  
  `onLoadMore` fires as the sentinel approaches the viewport (256px early by default, so the
  next page is loading before anyone reaches the edge), re-entry is guarded while a returned
  promise is pending, and `hasMore={false}` disconnects and renders the `endContent` slot —
  an ending you can see, not a spinner that never resolves. `inverse` puts the sentinel at the
  start for chat-history backfilling.
  
  Where `IntersectionObserver` is missing, the component does not quietly do nothing: it
  renders a real "Load more" button instead. The loader is a `role="status"` with visually
  hidden text; the list itself is deliberately **not** a live region, because announcing every
  loaded page is noise.
- efe6fef: `Lightbox` — a full-screen image viewer built on the same dialog core as `Modal`.
  
  `role="dialog"` with `aria-modal`, focus trapped inside and returned to the trigger on
  close, the page behind made inert, scroll locked, Escape and a backdrop click to dismiss —
  all inherited. On top: a set of images with captions, arrows that wrap (or announce
  themselves disabled at the ends with `loop={false}`), ArrowLeft/ArrowRight/Home/End,
  horizontal swipe, a thumbnail strip with `aria-current`, and neighbour preloading. The
  dialog's name carries the position ("Image viewer, 2 of 5") and the counter is a live
  region, so moving through the set is announced. `alt` is required on every item: the
  image is the content. `open` / `index` are controlled or uncontrolled.
- 0ebd0d9: `Listbox` — the always-open list of options that `<select multiple>` should have been.
  
  WAI-ARIA listbox pattern with roving focus, in both modes. Single select follows focus the
  way a native select does: arrows move and select, Home/End jump, typing a letter jumps to
  the next matching label. Multiple select keeps focus and selection apart so a keyboard user
  can move without changing anything: Space toggles, Shift+Arrow moves and toggles, Ctrl/⌘+A
  selects every enabled option, Shift+click selects a range from the last click.
  
  Disabled options stay in the list and are announced as unavailable — `aria-disabled`, not
  removed — and are skipped by the keyboard. Each option can carry a `description`. With
  `name`, the selection is emitted as hidden inputs so it posts with an ordinary form; `value`
  / `defaultValue` / `onValueChange` are typed per mode (`string | null` or `string[]`).
- d80c460: Fixes found by using the live site, and the gates that now catch their kind.
  
  - **Card** no longer declares `container-type: inline-size`. A size container has no
    intrinsic width, so a Card inside any shrink-to-fit context — a flex row, a centred
    wrapper, a grid auto column — collapsed to its padding with the copy wrapping one letter
    per line. Content that wants to respond to a card's width can make its own wrapper a
    container.
  - **Gauge** drew its arc opening to the right: the start angle assumed a 3-o'clock zero
    while the shared polar helper uses 12 o'clock. It now opens at the bottom, from
    seven-thirty through twelve to four-thirty, as a dial should.
  - **ScatterChart** claims the full width of its container like the other XY charts; it
    was rendering at its intrinsic 300 px inside centred frames.
  - **Sparkline** is an inline figure with its own size (`width` × `height`), so it holds a
    card open instead of stretching to a container that has nothing else to size it.
  - **Calendar** year buttons draw two real chevrons; the pseudo-element version, translated
    inside an already-rotated box, read as a bar.
  - **Chart legends are interactive by default** on Line, Area, Bar, Scatter and Radar
    charts: each entry is a checkbox that shows and hides its series. Pass
    `interactiveLegend={false}` for a figure in a report. Pie/Donut stays non-interactive on
    purpose — hiding a wedge would leave a chart that no longer sums to the whole.
  - **ChatMessage / ChatThread** format the default clock text with explicit `locale`
    (default `en-US`) and `timeZone` (default `UTC`) props instead of the runtime's, which on
    a server differed from the browser's and produced React hydration error #418 on every
    message. Pass the viewer's values from your session, or a preformatted string.
  - **Safari prefixes.** The CSS build runs with no browser targets (so logical properties
    stay logical), which means nothing adds vendor prefixes. `user-select`, `backdrop-filter`
    and `mask-image` now carry their `-webkit-` twin in source — Safari reads only the
    prefixed form for the first two — and a test fails the build if a new declaration lands
    without it.
- 619b76b: `Masonry` — items of different heights packed into columns with no gaps under the short ones.
  
  CSS `columns` fills top-to-bottom, so the second item lands under the first instead of
  beside it, and `grid-template-rows: masonry` is still behind a flag. This measures instead:
  a ResizeObserver on the container decides how many columns fit (`columnWidth`, capped at
  `columns`), and one shared observer reports each item's height so the next item goes into
  the shortest column. Before measurement — and on the server — items are dealt round-robin,
  so the first paint is already a grid and hydration matches. `balance={false}` keeps
  round-robin for strict left-to-right order; `gap` uses spacing steps.
- 88bdbd7: `Navbar` gains `collapseAt`, and two scroll regions become reachable by keyboard.
  
  **`collapseAt: 'md' | 'lg'`** chooses the container width at which the links leave the sheet
  and line up in the bar — 48rem (the default, unchanged) or 64rem. It exists because of a
  failure that only a real browser on a different operating system could show: with six links
  plus actions, the bar fitted at 768px on Windows and overlapped on Linux, where the fallback
  font is a few pixels wider per glyph. That is not a docs-site quirk; it is what every Linux
  and Android visitor to a site with a full navbar sees. A bar that dense now says so and
  collapses one step later. The JavaScript that closes the sheet when the bar grows past the
  threshold follows the same prop, so the two never disagree.
  
  **Table's scroll wrapper is focusable.** A wide table scrolls sideways inside its wrapper on
  a narrow screen, which makes the wrapper a scrollable region — and one a keyboard cannot
  reach strands every column past the fold (WCAG 2.1.1; axe `scrollable-region-focusable`).
  The wrapper now carries a tab stop, `role="group"` and a `scrollLabel` (default
  `'Scrollable table'`; pass the table's subject when a page has several). Found by the phone
  leg of the browser suite on the first CI run — the desktop leg never scrolls a table.
  
  **Block `Code` is a group, not a landmark.** The previous fix made every code block a
  `region`, and a documentation page holds a dozen of them with the same name — axe rightly
  rejects twelve identical landmarks. The tab stop stays; the role is `group`.
  
  Also: `ScatterChart` and `RadarChart` key their series by name rather than index, and
  `NumberInput`'s unmount cleanup no longer closes over a function it has to redeclare.
- 3924087: `QRCode` — a QR code rendered as crisp SVG from an in-house encoder. No dependency, no canvas.
  
  ISO/IEC 18004 byte mode, versions 1–40, all four error-correction levels, mask chosen by
  penalty score, and a free level upgrade whenever the chosen version has room. The encoder
  is verified in the test suite by a real decoder reading every payload back — short URLs at
  every level, Devanagari and emoji, and a 2,953-byte payload that fills version 40.
  
  It is an image with a name: `role="img"` and an `aria-label` that says what it encodes.
  Defaults are the ones that scan — black on white, a four-module quiet zone, level M —
  with `fg` / `bg` / `margin` / `moduleShape="round"` to depart deliberately, and `image` to
  put a logo in the centre (modules beneath it are cleared; pair it with `level="H"`).
  
  The whole-library size budget rises from 60 kB to 72 kB (brotli) to make room for the 1.0
  scope — the encoder's tables account for about 3 kB of it. The per-import budgets that
  consumers actually pay (Button 3 kB, Modal 6 kB, a full landing page 8 kB, all charts
  12 kB) are unchanged: the package is side-effect free and tree-shakes, so nobody ships the
  whole library.
- ebb955c: `Resizable` — split panes with draggable, keyboard-operable boundaries.
  
  Each handle is a `role="separator"` with a value: `aria-valuenow` is the share of the panel
  before it, `aria-controls` names that panel, arrows move it by `step` percent (Shift × 5),
  Home/End go to the panel's `minSize` / `maxSize`, Enter or a double-click restores the
  default split, and in a right-to-left page the arrows flip. Dragging uses pointer capture
  so a fast drag that leaves the handle still follows. Shares are percentages that always
  sum to 100 — controlled through `sizes`, or remembered per `storageKey` in `localStorage`
  (every access wrapped, so a locked-down browser just forgets). Horizontal or vertical,
  nests freely, and a boundary never pushes its neighbour past its own limits.
- 33be8fc: Section variants for 1.0 — the props that turn four section components into forty layouts.
  
  - **Hero**: `backdrop` (a full-bleed `<img>`, `<video>` or gradient behind the copy, decorative),
    `overlay` (`light` / `dark` / `gradient` scrims; the dark ones switch the copy to light),
    `mediaPosition` (`start` puts split-layout media before the copy) and `minHeight`
    (`half` / `screen`, copy centred).
  - **Navbar**: `variant` — `solid` (default), `transparent` for sitting over a hero, `floating`
    for an inset, rounded, shadowed bar — and `layout` for where links sit on a wide bar:
    `start`, `center` or `end`.
  - **FAQ**: `columns={2}` splits the list once the section is wide enough; `layout="side"` puts
    the header beside the list instead of above it.
  - **CTA**: `inset` paints the tone on a rounded card inside the container rather than a
    full-bleed band; `layout="split"` puts the actions beside the copy whatever the alignment.
  
  All are additive with unchanged defaults. Each is a `data-*` attribute the stylesheet keys
  on, so they are overridable the same way as everything else.
- 4955af9: `TimePicker` — hours, minutes, optional seconds and AM/PM as real spinbutton segments.
  
  Not a free-text box that accepts "9.30pm" and silently stores nothing, and not a list of every
  quarter hour to scroll through. Each segment is a `role="spinbutton"` with a spoken value —
  "9 hours", not "09" — so a screen reader announces what a sighted user sees. Typed digits
  accumulate and focus advances when a segment is complete, the way `OTPInput` works; arrows
  step and wrap; Backspace clears, then moves back; A and P set the period.
  
  **The value is always 24-hour.** `hourCycle={12}` changes what is shown and how AM/PM is
  entered; `onValueChange` still receives `'14:30'`. Choosing the cycle explicitly rather than
  from `Intl` is deliberate: a field that renders 24-hour on the server and 12-hour in one
  visitor's browser is a hydration mismatch, and this library does not ship those.
  
  **A half-entered time is `null`, never a guess.** Bounds clamp a committed value instead of
  refusing keystrokes — refusing makes typing `9` impossible when the minimum is `09:30`. One
  hidden field carries the canonical value, so a form never sees the segments.
- f81275d: `VideoPlayer` — a video player with its own controls, for progressive files (MP4, WebM).
  
  The native `controls` attribute gives every browser a different, unstyleable bar and no
  keyboard contract worth documenting. This one has one bar, every control a real `<button>`
  or `<input type="range">` with a name, and the shortcuts people expect from every player
  they have used: Space/K play, arrows seek and change volume, J/L jump ten seconds, M mutes,
  C toggles captions, F goes fullscreen. The seek bar announces "1:23 of 4:56"; volume
  announces a percentage.
  
  Controls fade while the pointer rests during playback and come back on any movement, key
  or focus — faded, never removed, so a keyboard user always has them. Multiple `src`
  sources, WebVTT `tracks`, poster, playback speeds, picture-in-picture and fullscreen where
  the browser supports them, an error state with `role="status"`, and `videoRef` /
  `videoProps` for anything the player does not model. No streaming (HLS/DASH) — that is a
  different component.
- 5d4a5d0: Make every public claim true — and make one of them a feature.
  
  **`FAQ` now emits FAQPage structured data.** The docs claimed it already did; it did not.
  Now it does, by default: schema.org `FAQPage` JSON-LD derived 1:1 from the visible items —
  the markup an answer engine reads to quote a question and its answer directly. No other
  component library ships this.
  
  - Items whose `answer` is a string are included automatically; JSX answers join via the new
    `answerText` field; items with neither are rendered but left out of the schema.
  - Nothing is emitted when the `children` escape hatch replaces the layout, because
    structured data must describe what is actually visible — Google's policy is explicit.
  - Opt out with `structuredData={false}`.
  - The payload is `JSON.stringify` output with `<` escaped to `<`, so item content
    containing `</script>` cannot break out of the tag — the classic JSON-LD injection, and
    FAQ content routinely comes from a CMS. A test proves it with hostile content.
  
  This is the library's one and only `dangerouslySetInnerHTML` (JSON-LD has to be a raw
  script body; React escapes text children, which corrupts JSON). A new test pins the budget
  to exactly that file and asserts the escaping, so a second use anywhere fails CI. README
  and SECURITY.md now state the precise budget instead of a blanket "none".
  
  **`printElement()` works now.** Its docblock required `styles/print.css` — a file that was
  never bundled or exported, so the shipped feature could not function. The stylesheet ships
  as `@the_viveksingh/vivek-ui/print.css`, separate from `styles.css` so an app that never
  prints pays nothing, and the packaging test gates the export.
  
  **Corrections.** The security-report email in SECURITY.md and the published package
  metadata was an undeliverable typo (`gmail.comom`) — vulnerability reports bounced. The
  README's accessibility section contradicted the FAQ page (contrast is machine-verified,
  twice — it said "reasoned"); the Playwright suite was listed as roadmap after it shipped;
  the npm/yarn/pnpm verification claim is scoped to what CI actually proves until the install
  matrix lands; "no required provider" now carries its one honest caveat (toasts, theme hook).
- 665204d: **Breaking:** one naming convention, applied everywhere. This is the last release in which
  these can change, so they change now.
  
  | Component | Was | Is | Why |
  | --- | --- | --- | --- |
  | RadioGroup, OTPInput, TagInput | `onChange` | `onValueChange` | Nine components already used `onValueChange`. These three redefined the DOM's own `onChange` with a different signature, which breaks the types for anyone spreading input props. |
  | Scheduler | `onEventSelect` | `onSelect` | Verb names for actions. |
  | FAQ | `defaultOpen` (number) | `defaultOpenIndex` | Every other `defaultOpen` in the library is a boolean. Same name, different type, was a trap. |
  | EditableGrid | `rows` | `data` | Matches DataTable. Tabular row sets are `data`. |
  | PieChart, ProgressRing | `size` (pixels) | `diameter` | `size` is a `sm`/`md`/`lg` scale everywhere else. |
  | CTA | `variant` | `background` | It was Section's `background` vocabulary wearing another name. |
  | Text | `tone="default"` | `tone="neutral"` | One tone vocabulary across the library. |
  | Progress | `label?` | `label` | The last widget that could render an unlabelled `role="progressbar"`. |
  
  **`asChild` where a router needs to get in.** `PopoverTrigger`, `DropdownMenu.Trigger`,
  `DropdownMenu.Item` and `IconButton` now take it. The menu-item one matters most: a menu
  item could not be a real link, so every "Settings" row was an `onClick` calling
  `router.push` — which silently breaks middle-click, cmd-click and "open in new tab".
  
  **The component contract, enforced.** `EditableGrid`, `FileTree`, `KanbanBoard` and
  `Scheduler` shipped without `forwardRef`, `style` or `...rest` — the only four components
  that did. Attaching a test id or an inline style meant a wrapper `div`, and wrappers become
  load-bearing. All four now honour §4.1, and `contract.test.tsx` keeps them there.
  
  **`size="lg"` on the eleven controls that lacked it** — Badge, Breadcrumb, Checkbox, Code,
  Field, FileUpload, Kbd, Label, RadioGroup, Switch, TypingIndicator. A large form was
  impossible to compose: Input had `lg`, Checkbox did not, so the row came out mismatched.
  
  **`invalid` on Switch and RadioGroup**, which every other form control already had.
  
  **Two new components.** `Segmented` — a real segmented control with `radiogroup` semantics,
  which exists because `Tabs`' pill variant was being misused as a two-option toggle and
  shipping tab semantics with no panels. `HoverCard` — Popover positioning with Tooltip's
  open-intent delay and a hover bridge, opening on focus as well as hover.

### Patch Changes

- a03bc19: Fix `Navbar` brand text painting over the links at tablet widths.
  
  `.vk-navbar__brand` carried `flex: 0 1 auto` with `min-width: 0` and no `overflow`. Those two
  together mean the box shrinks below its own content and the content keeps painting anyway —
  so at the width where the links come inline, the brand and the first link rendered on top of
  one another. The comment above the rule said "nothing shrinks the brand away before the links
  have collapsed", which was the intent and not what the CSS did.
  
  The brand now clips instead of overflowing, and the links can shrink past their content
  rather than pushing the actions out of the bar. Nothing changes at widths where the header
  already fitted.
- 4c53ad2: Inline `Code` breaks long tokens instead of breaking the page.
  
  Inline code held `white-space: nowrap`, so a single long token — a package name, a URL —
  grew wider than a 320px viewport and forced the entire page to scroll sideways, failing
  WCAG 1.4.10 Reflow for every element on the page at 200–400% zoom. Found by the new 320px
  reflow spec on its first run. `overflow-wrap: anywhere` lets the token break only when the
  alternative is page overflow; normal-width layouts are pixel-identical.
- baa519b: Security and accessibility hardening, from a browser-level audit.
  
  - **Breadcrumb could render a `javascript:` URL.** `linkProps` is typed as full anchor
    attributes and was spread *after* the sanitised `href`, so a CMS-fed `linkProps.href`
    replaced the validated value with a raw one. Spread order is the fix: `linkProps` can add
    rels and targets, never the URL.
  - **TagInput's paste handler compiled delimiters into a RegExp** with only the first
    character escaped — a multi-character delimiter crashed the paste handler, and a crafted
    one could build a catastrophic-backtracking pattern run against clipboard text. Splitting
    is now a character scan; there is no pattern to poison.
  - **`isSafeHref` is one function again.** The exported predicate and the one the nav
    components use had quietly diverged (Prose kept a stricter local copy) — meaning
    SECURITY.md's "the same allowlist" claim was false, and a future bypass fix could land in
    one copy and not the other. Prose's stricter policy is now a *parameter set* of the shared
    function, not a fork of it.
  - **MapEmbed leaked full page URLs** to map providers via `no-referrer-when-downgrade` —
    inconsistent with its own consent gate. Now `strict-origin-when-cross-origin`.
  - **Two contrast failures measured by browser axe**, invisible to token arithmetic: the
    active sidebar link painted the accent on its own subtle wash (~4.0:1), and Scheduler's
    tone timestamps were faded with `opacity: 0.75` (~3.4:1). The `-subtle-fg` tokens exist
    precisely as text partners for the `-subtle` surfaces; both use them now, full strength.
  - **RTL is enforced, not hoped for.** The library is logical-properties throughout, and a
    new source gate bans physical direction properties — with a four-entry allowlist where
    physical is *correct* (viewport-coordinate anchors for JS-positioned overlays, and a
    rotated-border chevron whose "down" is down in every script). Each entry carries its
    reason, and the gate fails if an entry stops matching real code.

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
