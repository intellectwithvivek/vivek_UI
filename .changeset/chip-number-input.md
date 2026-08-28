---
'@the_viveksingh/vivek-ui': minor
---

`Chip` and `NumberInput`.

**Chip** is three shapes, and the element changes with the job: a `<span>` when static, a
real `aria-pressed` button when selectable (a filter bar announces correctly for free), and
a span with its **own** remove button when removable — never a button inside a button, which
is why `selectable` and `onRemove` are mutually exclusive and removal wins. Delete and
Backspace on a focused chip remove it, matching TagInput. Tones use the soft washes with
their AA-verified `-subtle-fg` text partners.

**NumberInput** is `<input type="number">`'s defects, fixed: `type="text"` +
`inputmode="decimal"` + the APG spinbutton contract. The value is `number | null` — null is
empty, `NaN` never escapes. Drafts stay free text until Enter or blur, then parse, round to
`precision`, and clamp into range; garbage reverts instead of lingering as text that looks
accepted. Arrows step, Shift steps ×10, Home/End jump to the bounds; the hold-to-repeat
steppers are pointer-only chrome hidden from AT because the input *is* the spinbutton; the
mouse wheel is off by default because a page scroll silently drifting a focused quantity is
the classic corruption bug.
