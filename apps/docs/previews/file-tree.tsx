'use client'

import { Code, FileTree, Stack, Text, type TreeNode } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

const TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'button.tsx' },
          { id: 'button-css', label: 'button.css' },
          { id: 'card', label: 'card.tsx' },
        ],
      },
      {
        id: 'hooks',
        label: 'hooks',
        children: [{ id: 'use-id', label: 'use-isomorphic-id.ts' }],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    children: [{ id: 'readme', label: 'README.md' }],
  },
  { id: 'pkg', label: 'package.json' },
  { id: 'lock', label: 'pnpm-lock.yaml', disabled: true },
]

export default function FileTreePreview({ name }: { name: string }) {
  const [selected, setSelected] = useState<TreeNode | null>(null)

  if (name === 'controlled') {
    return <FileTree expandedIds={['src', 'components']} label="Always-open tree" nodes={TREE} />
  }

  return (
    <Stack gap={3}>
      <Text size="sm" tone="muted">
        Click into the tree, then use the arrow keys. Right opens a folder and steps in, Left
        collapses or moves out to the parent, and typing a letter jumps to a match.
      </Text>
      <div className="preview-stage" style={{ maxWidth: '20rem', minHeight: 'auto' }}>
        <FileTree
          defaultExpandedIds={['src']}
          label="Project files"
          nodes={TREE}
          onSelect={setSelected}
        />
      </div>
      <Text size="sm" tone="muted">
        Selected: {selected ? <Code>{selected.label}</Code> : 'nothing yet'}
      </Text>
    </Stack>
  )
}
