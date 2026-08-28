---
'@the_viveksingh/vivek-ui': minor
---

`DateRangePicker` — the top-three request in every date library's tracker, and mostly wiring.

`Calendar` already implemented range selection — click-before-start swaps the ends, the hover
preview, disabled days unreachable rather than merely unclickable — and `DatePicker` had
already solved the popover, positioning, dismissal and focus hand-off. Nobody had joined
them. This is that join: one trigger reading "start – end", a popup hosting the range
Calendar, closing on the second date and returning focus to the field.

**A half-selection never leaks out of the popup.** Pick a start, press Escape, and the field
restores the last complete range instead of holding `{ start, end: null }` — a form
submitting one date of two is the defect every range picker ships once. The two hidden
fields (`{name}-start`, `{name}-end`) use Calendar's own convention, as ISO dates, so a
form does not care which component rendered them.

The trigger's accessible name always carries the range in words — "Stay: March 12, 2026 to
March 15, 2026" — because two terse ISO strings on screen are meaningless as speech. Visible
text uses a deterministic `YYYY-MM-DD` by default; pass `format` for anything else.
