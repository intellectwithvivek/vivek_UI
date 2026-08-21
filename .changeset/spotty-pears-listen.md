---
'vivek-ui': minor
---

Initial release: design tokens, Button.

- `Button` with `variant` (`solid` | `outline` | `ghost` | `link`), `size` (`sm` | `md` | `lg`),
  `fullWidth` and `loading`. Merges `className`/`style`, spreads host props, forwards its ref.
- The full `--vk-*` design token set plus a `[data-theme="dark"]` block, shipped as a single
  `vivek-ui/styles.css`. Every library selector is `:where()`-wrapped, so consumer CSS wins
  without `!important`.
- Zero runtime dependencies; `react` / `react-dom` are peers (`^18.0.0 || ^19.0.0`).
