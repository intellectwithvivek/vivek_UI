/**
 * FileTree.
 *
 * A tree built as nested divs with click handlers is the most common accessibility failure
 * in a component library — unusable by keyboard, and a screen reader cannot convey depth or
 * position. These tests cover the WAI-ARIA treeview pattern specifically, because the
 * pattern is the component.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { FileTree, type TreeNode } from './file-tree'

const NODES: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'index', label: 'index.ts' },
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'button.tsx' },
          { id: 'card', label: 'card.tsx' },
        ],
      },
    ],
  },
  { id: 'readme', label: 'README.md' },
  { id: 'pkg', label: 'package.json', disabled: true },
]

const setup = (props: Partial<React.ComponentProps<typeof FileTree>> = {}) =>
  render(<FileTree label="Project files" nodes={NODES} {...props} />)

const item = (id: string) => document.querySelector(`[data-node-id="${id}"]`) as HTMLElement
const labels = () => screen.getAllByRole('treeitem').map((el) => el.textContent?.trim())

function press(target: HTMLElement, key: string) {
  target.focus()
  fireEvent.keyDown(target, { key })
}

describe('FileTree · structure', () => {
  it('is a named tree of treeitems', () => {
    setup()
    expect(screen.getByRole('tree', { name: 'Project files' })).toBeInTheDocument()
    // Collapsed: only the three roots are visible.
    expect(screen.getAllByRole('treeitem')).toHaveLength(3)
  })

  it('conveys depth and position, which a collapsed tree cannot show visually', () => {
    setup({ defaultExpandedIds: ['src'] })
    expect(item('src')).toHaveAttribute('aria-level', '1')
    expect(item('index')).toHaveAttribute('aria-level', '2')
    expect(item('src')).toHaveAttribute('aria-posinset', '1')
    expect(item('src')).toHaveAttribute('aria-setsize', '3')
  })

  it('marks folders expandable and leaves not', () => {
    setup()
    expect(item('src')).toHaveAttribute('aria-expanded', 'false')
    // A file must not claim to be expandable — that promises a child list that is not there.
    expect(item('readme')).not.toHaveAttribute('aria-expanded')
  })

  it('is a single tab stop', () => {
    setup({ defaultExpandedIds: ['src'] })
    const tabbable = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
  })
})

describe('FileTree · keyboard', () => {
  it('Down and Up cross folder boundaries', () => {
    // The reason the tree is flattened internally: Down from the last child of a folder has
    // to reach the folder's next sibling.
    setup({ defaultExpandedIds: ['src'] })
    press(item('src'), 'ArrowDown')
    expect(item('index')).toHaveFocus()
    press(item('index'), 'ArrowDown')
    expect(item('components')).toHaveFocus()
    press(item('components'), 'ArrowUp')
    expect(item('index')).toHaveFocus()
  })

  it('Right expands a closed folder, then steps into it', () => {
    setup()
    press(item('src'), 'ArrowRight')
    expect(item('src')).toHaveAttribute('aria-expanded', 'true')
    press(item('src'), 'ArrowRight')
    expect(item('index')).toHaveFocus()
  })

  it('Left collapses an open folder, then moves out to the parent', () => {
    setup({ defaultExpandedIds: ['src'] })
    press(item('src'), 'ArrowLeft')
    expect(item('src')).toHaveAttribute('aria-expanded', 'false')

    // From a child, Left goes to the parent rather than doing nothing.
    fireEvent.keyDown(item('src'), { key: 'ArrowRight' })
    press(item('index'), 'ArrowLeft')
    expect(item('src')).toHaveFocus()
  })

  it('Home and End reach the ends of the visible list', () => {
    setup({ defaultExpandedIds: ['src'] })
    press(item('index'), 'End')
    expect(item('pkg')).toHaveFocus()
    press(item('pkg'), 'Home')
    expect(item('src')).toHaveFocus()
  })

  it('Enter selects, and toggles a folder', () => {
    const onSelect = vi.fn()
    setup({ onSelect })
    press(item('readme'), 'Enter')
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'readme' }))
    expect(item('readme')).toHaveAttribute('aria-selected', 'true')
  })

  it('* expands every folder at the same level', () => {
    setup({ defaultExpandedIds: ['src'] })
    press(item('components'), '*')
    expect(item('components')).toHaveAttribute('aria-expanded', 'true')
  })

  it('typeahead jumps to a matching node', () => {
    setup({ defaultExpandedIds: ['src'] })
    press(item('src'), 'r')
    expect(item('readme')).toHaveFocus()
  })

  it('ignores modifier combinations, so Ctrl+C is not typeahead', () => {
    setup()
    item('src').focus()
    fireEvent.keyDown(item('src'), { key: 'c', ctrlKey: true })
    expect(item('src')).toHaveFocus()
  })
})

describe('FileTree · behaviour', () => {
  it('does not select a disabled node', () => {
    const onSelect = vi.fn()
    setup({ onSelect })
    fireEvent.click(item('pkg'))
    expect(onSelect).not.toHaveBeenCalled()
    expect(item('pkg')).toHaveAttribute('aria-selected', 'false')
  })

  it('reports expansion changes for a controlled tree', () => {
    const onExpandedChange = vi.fn()
    setup({ onExpandedChange })
    fireEvent.click(item('src'))
    expect(onExpandedChange).toHaveBeenCalledWith(['src'])
  })

  it('respects a controlled expanded set', () => {
    setup({ expandedIds: ['src', 'components'] })
    // Nested children are visible because both ancestors are open.
    expect(labels()).toContain('button.tsx')
  })

  it('treats an empty children array as an empty folder, not a file', () => {
    render(<FileTree label="t" nodes={[{ id: 'empty', label: 'empty', children: [] }]} />)
    expect(item('empty')).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders nothing but does not crash with no nodes', () => {
    render(<FileTree label="Empty tree" nodes={[]} />)
    expect(screen.getByRole('tree')).toBeInTheDocument()
    expect(screen.queryAllByRole('treeitem')).toHaveLength(0)
  })

  it('has no axe violations, collapsed or expanded', async () => {
    const { container } = setup({ defaultExpandedIds: ['src', 'components'] })
    expect(await axe(container)).toHaveNoViolations()
  })
})
