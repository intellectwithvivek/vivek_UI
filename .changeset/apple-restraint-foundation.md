---
'@the_viveksingh/vivek-ui': minor
---

Rebuild the design foundation, and fix five measured accessibility failures.

**Heads up: this changes how the library looks.** No token was renamed or removed, so it
is not a MAJOR bump, but 46 existing tokens keep their names while their *values* were
retuned. If you were relying on a specific default, re-set it in your own `:root`.

**59 new tokens.** The old file was 80 lines, and a thin palette is why a UI reads as
basic no matter how good the components are:

- **Layered surfaces** — `--vk-color-surface`, `-subtle`, `-sunken`, plus `-hover` and
  `-active` interaction washes. Previously every panel, input, menu and code block landed
  on the same flat `--vk-color-bg`, so nothing receded and nothing lifted.
- **A five-step shadow ramp**, each step two layers (contact + ambient), and **re-tuned
  for dark mode**. Black shadows are invisible on a dark page, so dark-mode cards were
  rendering completely flat. Dark now also inverts the surface ramp — raised surfaces are
  *lighter* than the page, which is the only depth cue left.
- **Typography**: line-height, letter-spacing and font-weight scales, plus
  `--vk-font-mono`, `--vk-text-xs` and `--vk-text-3xl`. `Heading` now tracks optically —
  tighter as type grows, rather than one flat value at every size.
- **`--vk-color-ring`** as its own token, so rebranding `--vk-color-primary` to a pale
  colour can no longer silently destroy your focus indicator.
- Accent hover/active/subtle steps, per-status `-fg`/`-subtle`/`-subtle-fg` pairs,
  `--vk-radius-xs`/`-xl`, six more spacing steps, and a motion scale
  (`--vk-duration-fast`/`-slow`/`-slower`, `--vk-ease-out`/`-in`/`-spring`).

**Accessibility fixes, all found by measurement rather than by eye:**

- `--vk-color-warning` measured **2.94:1** on white and `--vk-color-success` **3.30:1** —
  both below WCAG AA, so `<Text tone="warning">` and warning Alerts and Badges were
  unreadable. Every accent now clears 4.5:1 in both directions, in both themes.
- Solid `Alert`, `Badge` and `Toast` hardcoded `color: #fff`. Against the bright
  dark-theme accents that is **1.7:1**. They use the `-fg` tokens now, which flip to
  near-black in dark mode.
- Soft `Alert` and `Badge` variants tinted themselves with a transparent `color-mix`, so
  their contrast depended on whatever sat behind them — unverifiable, and worst exactly
  where badges live. They now use opaque `-subtle` pairs.
- Two chart series failed non-text contrast (SC 1.4.11) on white: `#e69f00` at **2.25:1**
  and `#56b4e9` at **2.31:1**. The light palette is repaired *and* reordered so the four
  Okabe-Ito colours that already passed take slots 1–4. Measured worst-pair separation
  under simulated protanopia, deuteranopia and tritanopia is now **dE 17.0 for one to four
  series** — better than unmodified Okabe-Ito's 16.1 — and the two compromises sit at 5–6
  where dash patterns and marker shapes carry series identity anyway.
- The dark chart palette had amber and pink at **dE 10.6** under tritanopia, close enough
  that a four-series chart could read as three. Series 4 moved a barely-visible dE 5.5 to
  reach 14.2.

**Motion.** Hover feedback across all six charts — bars, slices, lines, markers and
legend items now dim their siblings rather than brightening the target, so a value being
compared against the axis does not shift colour as the pointer moves. Cards lift and
settle. All of it behind `@media (hover: hover)` so a touch device never gets a state it
cannot leave, and all of it reduced-motion guarded.

**Two new gates** so none of the above can regress: `tokens.test.ts` (27 assertions) and
`charts/palette.test.ts` (12), the latter running real Viénot/Brettel dichromacy
simulation rather than trusting that a palette is colourblind-safe.
