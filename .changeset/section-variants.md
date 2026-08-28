---
'@the_viveksingh/vivek-ui': minor
---

Section variants for 1.0 — the props that turn four section components into forty layouts.

- **Hero**: `backdrop` (a full-bleed `<img>`, `<video>` or gradient behind the copy, decorative),
  `overlay` (`light` / `dark` / `gradient` scrims; the dark ones switch the copy to light),
  `mediaPosition` (`start` puts split-layout media before the copy) and `minHeight`
  (`half` / `screen`, copy centred).
- **Navbar**: `variant` — `solid` (default), `transparent` for sitting over a hero, `floating`
  for an inset, rounded, shadowed bar — and `layout` for where links sit on a wide bar:
  `start`, `center` or `end`.
- **FAQ**: `columns={2}` splits the list once the section is wide enough; `layout="side"` puts
  the header beside the list instead of above it.
- **CTA**: `inset` paints the tone on a rounded card inside the container rather than a
  full-bleed band; `layout="split"` puts the actions beside the copy whatever the alignment.

All are additive with unchanged defaults. Each is a `data-*` attribute the stylesheet keys
on, so they are overridable the same way as everything else.
