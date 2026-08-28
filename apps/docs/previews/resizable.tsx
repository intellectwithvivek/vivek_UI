'use client'

import { Resizable, Text } from '@the_viveksingh/vivek-ui'

const pane = {
  padding: '1rem',
  blockSize: '100%',
  boxSizing: 'border-box' as const,
  background: 'var(--vk-color-surface)',
}

export default function ResizablePreview() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div
        style={{
          blockSize: '16rem',
          border: '1px solid var(--vk-color-border)',
          borderRadius: 'var(--vk-radius-md)',
          overflow: 'hidden',
        }}
      >
        <Resizable defaultSizes={[28, 72]} storageKey="vk-docs-resizable">
          <Resizable.Panel minSize={15} maxSize={50}>
            <div style={pane}>
              <Text weight="medium">Files</Text>
              <Text size="sm" tone="muted">
                Drag the bar, or focus it and use the arrow keys. Shift moves five steps; Home and
                End go to the limits; Enter or a double-click resets.
              </Text>
            </div>
          </Resizable.Panel>
          <Resizable.Handle label="Resize the file list" />
          <Resizable.Panel>
            <Resizable orientation="vertical" defaultSizes={[65, 35]}>
              <Resizable.Panel minSize={20}>
                <div style={pane}>
                  <Text weight="medium">Editor</Text>
                  <Text size="sm" tone="muted">
                    Panels nest. This one is split top and bottom; the split is remembered per
                    storageKey.
                  </Text>
                </div>
              </Resizable.Panel>
              <Resizable.Handle label="Resize the terminal" />
              <Resizable.Panel minSize={15}>
                <div style={{ ...pane, fontFamily: 'var(--vk-font-mono, monospace)' }}>
                  <Text size="sm" tone="muted">
                    $ pnpm test — 2042 passed
                  </Text>
                </div>
              </Resizable.Panel>
            </Resizable>
          </Resizable.Panel>
        </Resizable>
      </div>
    </div>
  )
}
