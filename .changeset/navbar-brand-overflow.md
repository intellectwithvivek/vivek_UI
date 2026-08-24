---
'@the_viveksingh/vivek-ui': patch
---

Fix `Navbar` brand text painting over the links at tablet widths.

`.vk-navbar__brand` carried `flex: 0 1 auto` with `min-width: 0` and no `overflow`. Those two
together mean the box shrinks below its own content and the content keeps painting anyway —
so at the width where the links come inline, the brand and the first link rendered on top of
one another. The comment above the rule said "nothing shrinks the brand away before the links
have collapsed", which was the intent and not what the CSS did.

The brand now clips instead of overflowing, and the links can shrink past their content
rather than pushing the actions out of the bar. Nothing changes at widths where the header
already fitted.
