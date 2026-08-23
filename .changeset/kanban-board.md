---
'@the_viveksingh/vivek-ui': minor
---

Add `KanbanBoard` — a board a keyboard can actually use.

Nearly every Kanban implementation on the web is mouse-only, and the reason is structural
rather than lazy: **the HTML5 drag-and-drop API has no keyboard equivalent at all.**
`draggable` and `dragstart` fire for pointers and nothing else. Adding `tabindex` does not
help, because there is no key that initiates a drag. A board built on that API is unusable
for keyboard users, screen-reader users, and anyone with a motor impairment.

So there are two complete input paths here, not one.

**Pointer** — ordinary HTML5 drag and drop, with the drop target highlighted while a card is
in the air.

**Keyboard** — the pick-up / move / drop model the WAI-ARIA authoring practices recommend in
place of dragging:

| Key | Behaviour |
| --- | --- |
| Enter or Space | Pick the card up, or drop it |
| Left / Right | Move it to the previous / next column |
| Up / Down | Move it within its column |
| Escape | Cancel and leave it where it started |

Every step is announced through an always-mounted `aria-live` region — *"Moved to In
progress, position 2 of 4"* — because a silent move is indistinguishable from nothing
happening. The instruction to press Enter is on each card as an accessible description,
since a screen-reader user reaching a draggable card has no other way to discover it.

Columns take an optional `limit`, which shows in the header and blocks drops once reached —
announced as *"In progress is at its limit of 2"* rather than failing silently.

**Nothing is mutated for you.** `onMove` reports the intended move; your state decides. That
is the only shape that works with an optimistic update the server might reject.

19 tests, most of them covering the keyboard path, plus axe at rest and mid-drag.
