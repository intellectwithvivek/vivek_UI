---
'@the_viveksingh/vivek-ui': minor
---

`ContextMenu` — a right-click menu with the keyboard path everyone leaves out.

`contextmenu` is a pointer event, so a menu that opens only on it does not exist for anyone
without a mouse. The trigger surface is focusable and opens on **Shift+F10** and the
**ContextMenu key** — the two keys every desktop operating system already uses for this —
at its own centre. Closing returns focus to wherever it was, not merely to the trigger.

Inside, it is `DropdownMenu`'s menu: roving arrows that skip disabled items and wrap,
Home/End, typeahead, Enter/Space to activate, `aria-disabled` rather than `disabled` so an
unavailable command is still announced, Tab and Escape to leave. The panel is positioned by
the same solver as every other overlay, fed a zero-size anchor at the pointer, so it flips
and clamps at the viewport edges instead of running off the screen.

`ContextMenu.Item asChild` makes an item a real link. `ContextMenu.Trigger asChild` makes any
element the surface — a canvas, a table row, a card.
