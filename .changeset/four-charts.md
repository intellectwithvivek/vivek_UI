---
'@the_viveksingh/vivek-ui': minor
---

Four new charts — Scatter (and Bubble), Radar, Gauge, Heatmap. Ten charts total, still
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
