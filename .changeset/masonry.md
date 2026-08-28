---
'@the_viveksingh/vivek-ui': minor
---

`Masonry` — items of different heights packed into columns with no gaps under the short ones.

CSS `columns` fills top-to-bottom, so the second item lands under the first instead of
beside it, and `grid-template-rows: masonry` is still behind a flag. This measures instead:
a ResizeObserver on the container decides how many columns fit (`columnWidth`, capped at
`columns`), and one shared observer reports each item's height so the next item goes into
the shortest column. Before measurement — and on the server — items are dealt round-robin,
so the first paint is already a grid and hydration matches. `balance={false}` keeps
round-robin for strict left-to-right order; `gap` uses spacing steps.
