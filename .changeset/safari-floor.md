---
'@the_viveksingh/vivek-ui': patch
---

Restore `-webkit-backdrop-filter` in the published stylesheet, and pin a Safari floor.

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
