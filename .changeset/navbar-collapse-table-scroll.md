---
'@the_viveksingh/vivek-ui': minor
---

`Navbar` gains `collapseAt`, and two scroll regions become reachable by keyboard.

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
