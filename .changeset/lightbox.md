---
'@the_viveksingh/vivek-ui': minor
---

`Lightbox` — a full-screen image viewer built on the same dialog core as `Modal`.

`role="dialog"` with `aria-modal`, focus trapped inside and returned to the trigger on
close, the page behind made inert, scroll locked, Escape and a backdrop click to dismiss —
all inherited. On top: a set of images with captions, arrows that wrap (or announce
themselves disabled at the ends with `loop={false}`), ArrowLeft/ArrowRight/Home/End,
horizontal swipe, a thumbnail strip with `aria-current`, and neighbour preloading. The
dialog's name carries the position ("Image viewer, 2 of 5") and the counter is a live
region, so moving through the set is announced. `alt` is required on every item: the
image is the content. `open` / `index` are controlled or uncontrolled.
