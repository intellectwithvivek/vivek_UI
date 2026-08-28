---
'@the_viveksingh/vivek-ui': minor
---

`TimePicker` — hours, minutes, optional seconds and AM/PM as real spinbutton segments.

Not a free-text box that accepts "9.30pm" and silently stores nothing, and not a list of every
quarter hour to scroll through. Each segment is a `role="spinbutton"` with a spoken value —
"9 hours", not "09" — so a screen reader announces what a sighted user sees. Typed digits
accumulate and focus advances when a segment is complete, the way `OTPInput` works; arrows
step and wrap; Backspace clears, then moves back; A and P set the period.

**The value is always 24-hour.** `hourCycle={12}` changes what is shown and how AM/PM is
entered; `onValueChange` still receives `'14:30'`. Choosing the cycle explicitly rather than
from `Intl` is deliberate: a field that renders 24-hour on the server and 12-hour in one
visitor's browser is a hydration mismatch, and this library does not ship those.

**A half-entered time is `null`, never a guess.** Bounds clamp a committed value instead of
refusing keystrokes — refusing makes typing `9` impossible when the minimum is `09:30`. One
hidden field carries the canonical value, so a form never sees the segments.
