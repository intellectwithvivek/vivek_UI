'use client'

import {
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { cx } from '../../utils/cx'

export interface TreeNode {
  id: string
  label: string
  /** Presence of this array is what makes a node a folder — an empty one is an empty folder. */
  children?: TreeNode[]
  icon?: ReactNode
  disabled?: boolean
  /** Anything you need back in `onSelect`. */
  meta?: unknown
}

export interface FileTreeProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  nodes: readonly TreeNode[]
  /** Required. A tree with no accessible name is unnavigable. */
  label: string
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelect?: (node: TreeNode) => void
  expandedIds?: readonly string[]
  defaultExpandedIds?: readonly string[]
  onExpandedChange?: (ids: string[]) => void
  /** Show the connecting guide lines. Default `true`. */
  guides?: boolean
  /**
   * Reports selection changes for a controlled tree — the id twin of `onSelect`, which
   * hands you the whole node. Fires alongside it.
   */
  onSelectedIdChange?: (id: string) => void
}

interface FlatNode {
  node: TreeNode
  level: number
  /** Position among its siblings, 1-based, for `aria-posinset`. */
  posInSet: number
  setSize: number
  isFolder: boolean
  expanded: boolean
}

/**
 * Depth-first walk of everything currently visible.
 *
 * The keyboard model needs a flat list: Down from the last child of a folder goes to the
 * folder's next sibling, which is only simple to express once the tree is flattened.
 */
function flatten(
  nodes: readonly TreeNode[],
  expanded: ReadonlySet<string>,
  level = 0,
  out: FlatNode[] = [],
): FlatNode[] {
  nodes.forEach((node, index) => {
    const isFolder = Array.isArray(node.children)
    const isExpanded = isFolder && expanded.has(node.id)
    out.push({
      node,
      level,
      posInSet: index + 1,
      setSize: nodes.length,
      isFolder,
      expanded: isExpanded,
    })
    if (isExpanded && node.children) flatten(node.children, expanded, level + 1, out)
  })
  return out
}

/**
 * A file tree, implementing the WAI-ARIA treeview pattern.
 *
 * Trees are the control people most often build as a pile of nested `<div>`s with click
 * handlers, which produces something a keyboard cannot drive and a screen reader cannot
 * describe. The pattern is specific, and all of it is here:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Up / Down | Previous / next **visible** node, crossing folder boundaries |
 * | Right | Expand a collapsed folder, or move into it |
 * | Left | Collapse an expanded folder, or move out to its parent |
 * | Home / End | First / last visible node |
 * | Enter or Space | Select |
 * | `*` | Expand every sibling at this level |
 * | Type a letter | Jump to the next node starting with it |
 *
 * **One tab stop for the whole tree.** A tree with a tab stop per node is unusable once it
 * has more than a handful — the same mistake as an input per grid cell.
 *
 * `aria-level`, `aria-posinset` and `aria-setsize` are set on every node, because a
 * collapsed tree gives a screen reader no other way to convey depth or position.
 */
export const FileTree = forwardRef<HTMLUListElement, FileTreeProps>(function FileTree(
  {
    nodes,
    label,
    selectedId,
    defaultSelectedId = null,
    onSelect,
    onSelectedIdChange,
    expandedIds,
    defaultExpandedIds = [],
    onExpandedChange,
    guides = true,
    className,
    style,
    ...rest
  }: FileTreeProps,
  forwardedRef,
) {
  const [selected, setSelected] = useControllableState<string | null>({
    value: selectedId,
    defaultValue: defaultSelectedId,
    onChange: () => {},
  })
  const [expandedList, setExpandedList] = useControllableState<readonly string[]>({
    value: expandedIds,
    defaultValue: defaultExpandedIds,
    onChange: (next) => onExpandedChange?.([...next]),
  })

  const expanded = useMemo(() => new Set(expandedList), [expandedList])
  const visible = useMemo(() => flatten(nodes, expanded), [nodes, expanded])

  /** The node owning the tab stop. Falls back to the first node. */
  const [activeId, setActiveId] = useState<string | null>(null)
  const treeRef = useRef<HTMLUListElement | null>(null)
  const typeahead = useRef<{ query: string; at: number }>({ query: '', at: 0 })

  const active = activeId ?? visible[0]?.node.id ?? null

  const focusAt = useCallback(
    (index: number) => {
      const target = visible[Math.min(Math.max(index, 0), visible.length - 1)]
      if (!target) return
      setActiveId(target.node.id)
      treeRef.current
        ?.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(target.node.id)}"]`)
        ?.focus()
    },
    [visible],
  )

  const toggle = useCallback(
    (id: string, open?: boolean) => {
      const isOpen = expanded.has(id)
      const next = open ?? !isOpen
      if (next === isOpen) return
      const list = next
        ? [...expandedList, id]
        : expandedList.filter((candidate) => candidate !== id)
      setExpandedList(list)
    },
    [expanded, expandedList, setExpandedList],
  )

  const select = useCallback(
    (entry: FlatNode) => {
      if (entry.node.disabled) return
      setSelected(entry.node.id)
      onSelect?.(entry.node)
      onSelectedIdChange?.(entry.node.id)
    },
    [onSelect, onSelectedIdChange, setSelected],
  )

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>, entry: FlatNode, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusAt(index + 1)
        return
      case 'ArrowUp':
        event.preventDefault()
        focusAt(index - 1)
        return
      case 'ArrowRight':
        event.preventDefault()
        // Expand, then step into. Two presses to enter a closed folder, one to enter an
        // open one - exactly what a file explorer does.
        if (entry.isFolder && !entry.expanded) toggle(entry.node.id, true)
        else if (entry.isFolder) focusAt(index + 1)
        return
      case 'ArrowLeft':
        event.preventDefault()
        if (entry.isFolder && entry.expanded) {
          toggle(entry.node.id, false)
        } else {
          // Walk back to the nearest shallower node: that is the parent.
          for (let i = index - 1; i >= 0; i--) {
            const candidate = visible[i]
            if (candidate && candidate.level < entry.level) {
              focusAt(i)
              break
            }
          }
        }
        return
      case 'Home':
        event.preventDefault()
        focusAt(0)
        return
      case 'End':
        event.preventDefault()
        focusAt(visible.length - 1)
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (entry.isFolder) toggle(entry.node.id)
        select(entry)
        return
      case '*': {
        // Expand every sibling at this level, per the ARIA pattern.
        event.preventDefault()
        const siblings = visible
          .filter((candidate) => candidate.level === entry.level && candidate.isFolder)
          .map((candidate) => candidate.node.id)
        setExpandedList([...new Set([...expandedList, ...siblings])])
        return
      }
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
        // Typeahead. Repeated presses of the same letter cycle; different letters build a
        // prefix, which is what makes a deep tree navigable without the mouse.
        const now = Date.now()
        const state = typeahead.current
        state.query = now - state.at > 700 ? event.key : state.query + event.key
        state.at = now
        const query = state.query.toLowerCase()
        const from = index + 1
        for (let step = 0; step < visible.length; step++) {
          const candidate = visible[(from + step) % visible.length]
          if (candidate?.node.label.toLowerCase().startsWith(query)) {
            focusAt(visible.indexOf(candidate))
            break
          }
        }
      }
    }
  }

  return (
    <ul
      aria-label={label}
      className={cx('vk-file-tree', className)}
      ref={(node) => {
        treeRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: role="tree" on a ul is the WAI-ARIA treeview pattern itself.
      role="tree"
      style={style}
      {...rest}
    >
      {visible.map((entry, index) => {
        const { node, level, isFolder, expanded: isExpanded } = entry
        const isSelected = selected === node.id
        const isActive = active === node.id

        return (
          <li
            aria-expanded={isFolder ? isExpanded : undefined}
            aria-level={level + 1}
            aria-posinset={entry.posInSet}
            aria-selected={isSelected}
            aria-setsize={entry.setSize}
            className="vk-file-tree__item"
            data-active={isActive || undefined}
            data-disabled={node.disabled || undefined}
            data-folder={isFolder || undefined}
            data-guides={guides || undefined}
            data-node-id={node.id}
            key={node.id}
            onClick={(event) => {
              event.stopPropagation()
              setActiveId(node.id)
              if (isFolder) toggle(node.id)
              select(entry)
            }}
            onKeyDown={(event) => onKeyDown(event, entry, index)}
            role="treeitem"
            style={{ '--vk-tree-level': level } as React.CSSProperties}
            // One tab stop for the whole tree, moved as focus moves.
            tabIndex={isActive ? 0 : -1}
          >
            <span className="vk-file-tree__row">
              {isFolder ? (
                <span
                  aria-hidden="true"
                  className="vk-file-tree__chevron"
                  data-open={isExpanded || undefined}
                />
              ) : (
                <span aria-hidden="true" className="vk-file-tree__spacer" />
              )}
              {node.icon ? (
                <span aria-hidden="true" className="vk-file-tree__icon">
                  {node.icon}
                </span>
              ) : null}
              <span className="vk-file-tree__label">{node.label}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
})
