---
'@the_viveksingh/vivek-ui': minor
---

Cross-browser correctness, and per-component stylesheets.

**Per-component CSS.** `dist/styles.css` is the whole library in one file — 34 kB gzipped,
of which a page using a Button, a Card, an Input, a Navbar and a Hero needs about 4. Those
pages can now import only what they use:

```ts
import '@the_viveksingh/vivek-ui/css/reset.css'
import '@the_viveksingh/vivek-ui/css/tokens.css'
import '@the_viveksingh/vivek-ui/css/button.css'
```

112 stylesheets are built alongside the bundle, one per component plus `reset`, `tokens`
and `touch`. `styles.css` is unchanged and remains the answer for anyone who would rather
not think about it. (The JavaScript was never the weight: a Button is 780 B brotli, a whole
landing page 3.1 kB.)

**Safari and Firefox.** The browser suite now runs in Firefox and WebKit as well as
Chromium, and found four real defects on its first run:

- `user-select`, `backdrop-filter` and `mask-image` had no `-webkit-` twin, so Safari
  ignored them — text on a chart legend was selectable, the sticky navbar had no blur. Both
  the prefixes and a test that requires them are now in place, and lightningcss is given
  browser targets so it keeps them.
- `VideoPlayer`: sources are tried **in order**, and Safari holds the document's `load`
  event while it works through a format it cannot decode — a WebM-first list made the whole
  page appear to hang. Documented on the prop; list MP4 first.
- `VideoPlayer`: `poster` must be a **raster** image. Safari ignores an SVG poster and, again,
  never fires `load`. Documented on the prop.
- axe measurements now wait for entry animations to finish. WebKit still had 56 running
  right after `load`, so contrast was sampled mid-fade and reported a false failure.
