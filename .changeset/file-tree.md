---
'@the_viveksingh/vivek-ui': minor
---

Add `FileTree` — the WAI-ARIA treeview pattern, implemented properly.

A tree is the control most often built as nested `<div>`s with click handlers, which
produces something a keyboard cannot drive and a screen reader cannot describe. The pattern
is specific, and this implements all of it:

| Key | Behaviour |
| --- | --- |
| Up / Down | Previous / next **visible** node, crossing folder boundaries |
| Right | Expand a collapsed folder, then step into it |
| Left | Collapse an expanded folder, or move out to its parent |
| Home / End | First / last visible node |
| Enter / Space | Select |
| `*` | Expand every folder at this level |
| Any letter | Typeahead to the next match |

Two implementation notes worth knowing:

**The tree is flattened internally and rendered flat**, with depth drawn as padding and
carried semantically by `aria-level`. Real DOM nesting would mean keyboard navigation has to
walk the DOM to answer "what is the next visible node", which is where these implementations
usually break — Down from the last child of a folder must reach that folder's next sibling.

**`aria-level`, `aria-posinset` and `aria-setsize` are on every node.** A collapsed tree
offers no other way to convey depth or position, so without them a screen-reader user hears
a flat list of names with no structure at all.

One tab stop for the whole tree, and a disabled node is genuinely unselectable rather than
just dimmed. 18 tests, including axe both collapsed and expanded.
