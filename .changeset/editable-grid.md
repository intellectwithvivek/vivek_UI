---
'@the_viveksingh/vivek-ui': minor
---

Add `EditableGrid` — a spreadsheet-style grid you can type into.

Every component library ships a *table*. None ship an editable one, so teams reach for AG
Grid, Handsontable or TanStack Table plus glue — a second dependency, often a paid licence,
for the single feature of typing into a cell.

```tsx
<EditableGrid
  rows={rows}
  columns={[
    { key: 'name', header: 'Name', editable: true },
    { key: 'qty', header: 'Qty', editable: true, numeric: true, parse: Number },
  ]}
  label="Inventory"
  onCellChange={({ rowIndex, columnKey, value }) => update(rowIndex, columnKey, value)}
/>
```

**The keyboard model is the WAI-ARIA grid pattern, not a table with inputs in it.** That
distinction is the whole design. An input per cell means one tab stop per cell, so a
50-column grid takes fifty presses to escape. Here the entire grid is **one** tab stop,
arrows move between cells, and a cell only becomes an input while it is being edited.

| Key | Behaviour |
| --- | --- |
| Arrows | Move the focused cell |
| Home / End | First / last cell in the row |
| Ctrl+Home / Ctrl+End | First / last cell in the grid |
| Enter or F2 | Start editing |
| Any printable key | Start editing, replacing the cell |
| Enter while editing | Commit and move down |
| Tab / Shift+Tab | Commit and move right / left |
| Escape | Cancel, restoring the previous value |

**`format` and `parse` are separate from `render` on purpose.** A currency cell displays
`$1,240.00` and edits as `1240`; conflating display and edit values is how editing a
formatted cell corrupts it. `parse` returning `undefined` rejects the edit, which is
validation without a second callback or an error state to thread through.

**Nothing is mutated for you.** `onCellChange` reports the edit and your state decides. A
grid that writes into the array it was handed cannot work with immutable state, undo, or a
server round-trip that might fail.

29 tests, including axe both at rest and mid-edit — an input nested inside a `gridcell` is
exactly the arrangement most likely to produce a role violation.
