---
'@the_viveksingh/vivek-ui': minor
---

**Breaking:** one naming convention, applied everywhere. This is the last release in which
these can change, so they change now.

| Component | Was | Is | Why |
| --- | --- | --- | --- |
| RadioGroup, OTPInput, TagInput | `onChange` | `onValueChange` | Nine components already used `onValueChange`. These three redefined the DOM's own `onChange` with a different signature, which breaks the types for anyone spreading input props. |
| Scheduler | `onEventSelect` | `onSelect` | Verb names for actions. |
| FAQ | `defaultOpen` (number) | `defaultOpenIndex` | Every other `defaultOpen` in the library is a boolean. Same name, different type, was a trap. |
| EditableGrid | `rows` | `data` | Matches DataTable. Tabular row sets are `data`. |
| PieChart, ProgressRing | `size` (pixels) | `diameter` | `size` is a `sm`/`md`/`lg` scale everywhere else. |
| CTA | `variant` | `background` | It was Section's `background` vocabulary wearing another name. |
| Text | `tone="default"` | `tone="neutral"` | One tone vocabulary across the library. |
| Progress | `label?` | `label` | The last widget that could render an unlabelled `role="progressbar"`. |

**`asChild` where a router needs to get in.** `PopoverTrigger`, `DropdownMenu.Trigger`,
`DropdownMenu.Item` and `IconButton` now take it. The menu-item one matters most: a menu
item could not be a real link, so every "Settings" row was an `onClick` calling
`router.push` — which silently breaks middle-click, cmd-click and "open in new tab".

**The component contract, enforced.** `EditableGrid`, `FileTree`, `KanbanBoard` and
`Scheduler` shipped without `forwardRef`, `style` or `...rest` — the only four components
that did. Attaching a test id or an inline style meant a wrapper `div`, and wrappers become
load-bearing. All four now honour §4.1, and `contract.test.tsx` keeps them there.

**`size="lg"` on the eleven controls that lacked it** — Badge, Breadcrumb, Checkbox, Code,
Field, FileUpload, Kbd, Label, RadioGroup, Switch, TypingIndicator. A large form was
impossible to compose: Input had `lg`, Checkbox did not, so the row came out mismatched.

**`invalid` on Switch and RadioGroup**, which every other form control already had.

**Two new components.** `Segmented` — a real segmented control with `radiogroup` semantics,
which exists because `Tabs`' pill variant was being misused as a two-option toggle and
shipping tab semantics with no panels. `HoverCard` — Popover positioning with Tooltip's
open-intent delay and a hover bridge, opening on focus as well as hover.
