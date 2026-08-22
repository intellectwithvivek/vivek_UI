---
'@the_viveksingh/vivek-ui': minor
---

Add `Image`, `Newsletter` and `MapEmbed` — three things every marketing page needs and
everyone rebuilds badly.

**`Image`** — a bare `<img>` in a design system is a gap, not a simplification. Three things
go wrong with one every single time, and all three are handled:

- **Layout shift.** `ratio` reserves the box before the file arrives. Images with no
  reserved space are the largest single contributor to a poor CLS score.
- **Broken images.** A dead URL renders the browser's broken-image icon on your marketing
  page. `fallback` replaces it, and the `alt` text stays in the accessibility tree even
  though the `<img>` is gone.
- **Missing alt text.** `alt` is **required at the type level**, the same way `IconButton`
  requires `aria-label`. `alt=""` is available and is the correct answer for decoration —
  the point is that the decision cannot be skipped.

**`Newsletter`** — email capture that keeps the three things hand-rolled versions lose: the
label exists (visually hidden, because a placeholder disappears the moment you type),
double submission is prevented by awaiting your promise rather than by hope, and the result
lands in an `aria-live` region instead of silently swapping the form for a tick. Validation
is `type="email"` — real, localised, accessible messages, and better than any regex.

**`MapEmbed`** — an embedded map without the privacy footgun. Dropping a Google Maps iframe
onto a contact page is one line that quietly makes your site contact Google and set cookies
on first paint, before the visitor consents to anything. It is one of the most common ways a
site acquires a GDPR problem and it is invisible unless you open the network tab. So:
**OpenStreetMap is the default** (no cookies, no analytics, loads immediately), and **Google
is gated behind a click**, with a real link out for anyone who never consents. The frame is
sandboxed without `allow-same-origin` and lazy-loaded.

25 tests across the three, including axe on each.
