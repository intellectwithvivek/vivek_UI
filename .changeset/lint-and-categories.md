---
'@the_viveksingh/vivek-ui': patch
---

Fix accessibility-lint failures across the six newest components, and stop uncategorised
components from shipping invisible.

`EditableGrid` held a `columnAt` helper that was rebuilt on every render, so it could never
be a correct `useCallback` dependency — two suppressions were papering over it. It now reads
`columns` directly and the dependency lists are honest.

The remaining reports were false positives against ARIA patterns, and each now carries the
reason rather than a bare suppression: `role="tree"` on a `ul` *is* the treeview pattern;
grid rows and column headers are deliberately not focusable, because the pattern puts the
single tab stop on the active cell; `role="list"` on a `list-style: none` list is what
restores the semantics Safari drops; a scrollable viewport must be focusable or a keyboard
user cannot scroll it (WCAG 2.1.1).

Separately, seven components — `EditableGrid`, `VirtualList`, `FileTree`, `KanbanBoard`,
`Image`, `MapEmbed` and `Newsletter` — had no entry in the docs category map, so they fell
into an `Other` group the sidebar does not render and were unreachable from navigation. They
are categorised now, and the registry generator exits non-zero when a component has no
category instead of quietly hiding it.
