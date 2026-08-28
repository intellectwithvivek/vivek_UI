---
'@the_viveksingh/vivek-ui': minor
---

`Resizable` — split panes with draggable, keyboard-operable boundaries.

Each handle is a `role="separator"` with a value: `aria-valuenow` is the share of the panel
before it, `aria-controls` names that panel, arrows move it by `step` percent (Shift × 5),
Home/End go to the panel's `minSize` / `maxSize`, Enter or a double-click restores the
default split, and in a right-to-left page the arrows flip. Dragging uses pointer capture
so a fast drag that leaves the handle still follows. Shares are percentages that always
sum to 100 — controlled through `sizes`, or remembered per `storageKey` in `localStorage`
(every access wrapped, so a locked-down browser just forgets). Horizontal or vertical,
nests freely, and a boundary never pushes its neighbour past its own limits.
