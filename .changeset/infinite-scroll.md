---
'@the_viveksingh/vivek-ui': minor
---

`InfiniteScroll` — an IntersectionObserver sentinel that never strands a keyboard user.

`onLoadMore` fires as the sentinel approaches the viewport (256px early by default, so the
next page is loading before anyone reaches the edge), re-entry is guarded while a returned
promise is pending, and `hasMore={false}` disconnects and renders the `endContent` slot —
an ending you can see, not a spinner that never resolves. `inverse` puts the sentinel at the
start for chat-history backfilling.

Where `IntersectionObserver` is missing, the component does not quietly do nothing: it
renders a real "Load more" button instead. The loader is a `role="status"` with visually
hidden text; the list itself is deliberately **not** a live region, because announcing every
loaded page is noise.
