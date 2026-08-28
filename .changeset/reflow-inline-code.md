---
'@the_viveksingh/vivek-ui': patch
---

Inline `Code` breaks long tokens instead of breaking the page.

Inline code held `white-space: nowrap`, so a single long token — a package name, a URL —
grew wider than a 320px viewport and forced the entire page to scroll sideways, failing
WCAG 1.4.10 Reflow for every element on the page at 200–400% zoom. Found by the new 320px
reflow spec on its first run. `overflow-wrap: anywhere` lets the token break only when the
alternative is page overflow; normal-width layouts are pixel-identical.
