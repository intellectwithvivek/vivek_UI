---
'@the_viveksingh/vivek-ui': minor
---

Fixes found by using the live site, and the gates that now catch their kind.

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
