---
'@the_viveksingh/vivek-ui': minor
---

Add a `.vk-visually-hidden` utility and export `./package.json`.

- **`.vk-visually-hidden`** ships in `styles.css`. Text that must be announced but not seen
  is needed constantly — a live region, a table caption, an icon-only label — and the usual
  hand-rolled versions are subtly broken: `display: none` and `visibility: hidden` remove
  the element from the accessibility tree as well as the page, and the older
  `clip: rect(0,0,0,0)` recipe can be read as a 1px line break. The library already needed
  this pattern in seven places internally. There is also
  `.vk-visually-hidden-focusable`, which reveals itself on focus, for a skip link.

  This is not the start of a utility framework. The styling model is still tokens plus
  `data-*` attributes; what earns a place here is a pattern that is needed everywhere, easy
  to get subtly wrong, and impossible to express with a token.

- **`"./package.json"` is now in the `exports` map.** Tooling routinely resolves it — test
  runners, bundler plugins, anything calling `require.resolve` — and an `exports` map that
  omits it makes those fail with a subpath error that looks like a much bigger problem than
  it is.
