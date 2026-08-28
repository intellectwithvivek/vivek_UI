---
'@the_viveksingh/vivek-ui': minor
---

`AnchorNav` — the "On this page" table of contents that knows where you are.

Every entry is a real `<a href="#id">`, so it works before JavaScript and copies as a link.
Once mounted, an IntersectionObserver tracks the targets and marks the section in view with
`aria-current="location"`; with nothing in view, the last section scrolled past stays
current. Clicking scrolls smoothly — instantly under `prefers-reduced-motion` — accounts
for a fixed header via `offset`, replaces the hash without adding history entries, and
moves focus to the target so a keyboard user continues from the section. One level of
nesting, vertical rail or horizontal underline, controlled or uncontrolled `activeId`.
