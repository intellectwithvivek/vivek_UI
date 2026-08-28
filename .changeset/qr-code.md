---
'@the_viveksingh/vivek-ui': minor
---

`QRCode` — a QR code rendered as crisp SVG from an in-house encoder. No dependency, no canvas.

ISO/IEC 18004 byte mode, versions 1–40, all four error-correction levels, mask chosen by
penalty score, and a free level upgrade whenever the chosen version has room. The encoder
is verified in the test suite by a real decoder reading every payload back — short URLs at
every level, Devanagari and emoji, and a 2,953-byte payload that fills version 40.

It is an image with a name: `role="img"` and an `aria-label` that says what it encodes.
Defaults are the ones that scan — black on white, a four-module quiet zone, level M —
with `fg` / `bg` / `margin` / `moduleShape="round"` to depart deliberately, and `image` to
put a logo in the centre (modules beneath it are cleared; pair it with `level="H"`).

The whole-library size budget rises from 60 kB to 72 kB (brotli) to make room for the 1.0
scope — the encoder's tables account for about 3 kB of it. The per-import budgets that
consumers actually pay (Button 3 kB, Modal 6 kB, a full landing page 8 kB, all charts
12 kB) are unchanged: the package is side-effect free and tree-shakes, so nobody ships the
whole library.
