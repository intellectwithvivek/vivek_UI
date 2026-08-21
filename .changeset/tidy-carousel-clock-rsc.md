---
'@the_viveksingh/vivek-ui': patch
---

Fix `Carousel` and `Clock` failing in real apps, and document the seven components that had no description.

- **`Carousel` could not be rendered from a Server Component.** With `showDots`, the root forwarded the `dotLabel` callback to its client-side controls, and React refuses to serialise a function across that boundary — so any App Router page using it threw *"Functions cannot be passed directly to Client Components"*. The dot names are now resolved before the boundary and passed as strings. `dotLabel` itself is unchanged.
- **`Clock` threw on `dateStyle` or `timeStyle`.** `format` was spread on top of the `hour`/`minute`/`second` defaults, leaving both families of options present, which `Intl.DateTimeFormat` rejects outright with `TypeError: Invalid option`. The documented "anything set here wins over the shortcuts" now actually overrides them. A `timeStyle` of `medium` or longer also correctly ticks once a second instead of once a minute.
- Added JSDoc to `Button`, `DataTable`, `Heading`, `IconButton`, `Label`, `Text` and `Textarea`, which had none — so their docs pages showed no description.

Both bugs were found by building every component's documentation page from Server Components.
