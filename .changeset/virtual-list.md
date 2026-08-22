---
'@the_viveksingh/vivek-ui': minor
---

Add `VirtualList` — windowed rendering for large datasets, with no dependency.

A list of 50,000 rows mounts 50,000 components and the browser stops being interactive long
before it finishes. `VirtualList` renders only the rows on screen and positions them with a
transform, so the cost tracks the size of the viewport rather than the size of the data.

Every other option here is a separate package — react-window, react-virtuoso, TanStack
Virtual. This is about 150 lines and needs none of them.

```tsx
<VirtualList items={rows} itemHeight={56} getKey={(r) => r.id} label="Customers">
  {(row) => <Row {...row} />}
</VirtualList>
```

**Two height modes.** A number is the fast path — scroll position maps to an index with one
division and nothing is measured. A function is an *estimate*: rows are measured as they
render and the estimate is replaced, so variable-height content works without the caller
pre-computing anything.

**Accessibility is the part virtualisation usually breaks.** A naive implementation
announces "list, 12 items" when there are 50,000, because only 12 are in the DOM. Each row
carries its true `aria-posinset` and the real `aria-setsize`, so a screen reader says
"4,201 of 50,000".

The role is `list`/`listitem` rather than `grid`/`row` for a reason worth recording:
`aria-posinset` and `aria-setsize` are **not valid on a grid row** — axe rejects it — and a
grid would have been a lie anyway, since these rows hold arbitrary content rather than
cells.

Also: `onRangeChange` reports the visible window, which is the hook for infinite loading;
`scrollToIndex` jumps to a row; and the viewport is measured with a `ResizeObserver` rather
than once, because a list inside a flex parent is routinely zero-height on first paint and
would otherwise render empty forever.
