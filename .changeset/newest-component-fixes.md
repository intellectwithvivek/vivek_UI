---
'@the_viveksingh/vivek-ui': patch
---

Fix three defects in the newest components.

`KanbanBoard` built each card's accessible description id out of the card id alone, so two
boards on one page emitted the same id twice and every duplicate `aria-describedby` resolved
to whichever element the browser found first. The ids are prefixed with a generated one now.

It also set `aria-grabbed`, deprecated in ARIA 1.1 and removed in 1.2. No current screen
reader acts on it — the live region and the per-card description are what carry the state.

`Scheduler` shadowed the DOM `window` global and its own `step` prop with local names.
Neither was read in those scopes, so neither was a bug yet; both are the kind that becomes
one on the next edit. A stray `data-testid` is gone from the published output too.
