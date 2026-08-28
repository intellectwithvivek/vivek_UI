---
'@the_viveksingh/vivek-ui': minor
---

`ColorPicker` — a colour picker made of real controls.

Hue, saturation, brightness (and alpha) are `<input type="range">`s with names and spoken
values ("217 degrees", "76%"); the hex field is a text input that commits on Enter or blur,
accepts `#rgb`, `#rrggbbaa` and `rgb()` on the way in, and reverts what it cannot parse;
presets are pressed toggles. The two-dimensional area is a pointer convenience over the
same state, hidden from assistive tech because the sliders already say everything it shows.
Emits lower-case hex, keeps hue through zero saturation, offers the browser's EyeDropper
where one exists, posts through a hidden input with `name`, and takes `Field`'s injected
`id` / `aria-describedby` / `invalid`. `variant="popover"` puts the panel behind a swatch.

`parseColor`, `toHex`, `rgbToHsv`, `hsvToRgb` and `contrastRatio` are internal utilities.
