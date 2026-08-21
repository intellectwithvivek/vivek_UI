---
'@the_viveksingh/vivek-ui': patch
---

Remove references to internal working documents from source comments.

JSDoc comments cited internal design notes, and tsup preserves JSDoc into the emitted
`.d.ts` files — so the published package was shipping those references to every consumer.
The explanations are kept; only the citations are gone. A CI check now fails the build if
one reappears.
