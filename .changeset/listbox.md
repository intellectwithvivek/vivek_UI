---
'@the_viveksingh/vivek-ui': minor
---

`Listbox` — the always-open list of options that `<select multiple>` should have been.

WAI-ARIA listbox pattern with roving focus, in both modes. Single select follows focus the
way a native select does: arrows move and select, Home/End jump, typing a letter jumps to
the next matching label. Multiple select keeps focus and selection apart so a keyboard user
can move without changing anything: Space toggles, Shift+Arrow moves and toggles, Ctrl/⌘+A
selects every enabled option, Shift+click selects a range from the last click.

Disabled options stay in the list and are announced as unavailable — `aria-disabled`, not
removed — and are skipped by the keyboard. Each option can carry a `description`. With
`name`, the selection is emitted as hidden inputs so it posts with an ordinary form; `value`
/ `defaultValue` / `onValueChange` are typed per mode (`string | null` or `string[]`).
