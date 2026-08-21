---
'@the_viveksingh/vivek-ui': patch
---

Fix seven visual bugs, four of them layout faults you could not see in a test.

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
