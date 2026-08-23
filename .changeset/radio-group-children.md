---
'@the_viveksingh/vivek-ui': patch
---

Fix `RadioGroup`'s documented `children` API, which did nothing.

`options` worked. `children` — the other half of the documented API, the half you reach for
when a radio needs custom content — silently did not:

- no `name` reached the radios, so they were **not a native group at all**. Clicking one did
  not deselect the others, and nothing submitted with the form.
- no `onChange` reached them, so the group's handler never fired.
- `value` and `defaultValue` on the group were ignored, so a controlled group could not
  control anything.

Each `Radio` child now receives the group's `name`, `required`, selection and change
handler. Anything you set on the child yourself still wins, and a child's own `onChange`
runs alongside the group's.

This reaches direct children. A context would survive arbitrary nesting, but `createContext`
cannot run in a React Server Component, and `RadioGroup` renders on the server today —
turning it into a client component to support wrapping a radio in a `<div>` is the wrong
trade.

Found by a new test that asserts every exported component is rendered by at least one test,
and by a suite that runs axe. `Radio` and `ChatThread.Empty` were both exported, documented
and shipped without ever being rendered by anything; both are covered now.
