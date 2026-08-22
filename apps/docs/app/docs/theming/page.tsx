import { Alert, Heading, Table, Text } from '@the_viveksingh/vivek-ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CodeBlock } from '../../../components/code-block'
import { pageMeta } from '../../../lib/page-meta'

export const metadata: Metadata = pageMeta({
  title: 'Theming',
  description:
    'Rebrand every VivekUI component by redefining a few --vk-* CSS custom properties. No theme object, no provider, no build step - just plain CSS.',
  path: '/docs/theming',
  keywords: [
    'react theming css variables',
    'customise react component library',
    'design tokens react',
  ],
})

const TOKENS: [string, string, string][] = [
  ['--vk-color-primary', '#4f46e5', 'Brand colour. Buttons, links, focus rings.'],
  ['--vk-color-primary-fg', '#ffffff', 'Text on a primary surface.'],
  ['--vk-color-bg', '#ffffff', 'Page background.'],
  ['--vk-color-fg', '#111827', 'Body text.'],
  ['--vk-color-muted', '#6b7280', 'Secondary text.'],
  ['--vk-color-border', '#e5e7eb', 'Borders and dividers.'],
  ['--vk-color-danger', '#dc2626', 'Errors and destructive actions.'],
  ['--vk-color-success', '#16a34a', 'Success states.'],
  ['--vk-color-warning', '#ca8a04', 'Warnings.'],
  ['--vk-color-overlay', 'rgb(9 9 11 / 0.6)', 'Modal and drawer backdrops.'],
  ['--vk-space-1 to --vk-space-16', '0.25rem to 4rem', 'Spacing scale, 4px based.'],
  ['--vk-font-sans', 'system-ui, ...', 'Every component inherits this.'],
  ['--vk-text-sm to --vk-text-2xl', '0.875rem to 2rem', 'Type scale.'],
  ['--vk-text-hero', 'clamp(2.25rem, 5vw, 3.75rem)', 'Fluid hero size.'],
  ['--vk-radius-sm / md / lg / full', '6px / 10px / 16px / 9999px', 'Corner radii.'],
  ['--vk-shadow-sm / --vk-shadow-md', 'subtle / medium', 'Elevation.'],
  ['--vk-ease', 'cubic-bezier(0.2, 0.8, 0.2, 1)', 'Transition easing.'],
  ['--vk-duration', '180ms', 'Transition duration.'],
  ['--vk-z-overlay / --vk-toast-z', '1000 / 1100', 'Layering.'],
  ['--vk-modal-width-sm to xl', '24rem to 56rem', 'Dialog sizes.'],
  ['--vk-drawer-size-sm to xl', '18rem to 42rem', 'Drawer sizes.'],
]

export default function ThemingPage() {
  return (
    <>
      <header className="doc-header">
        <Heading level={1}>Theming</Heading>
        <Text size="lg">
          Every value is a CSS custom property. Rebranding is plain CSS you already know: no config
          file, no theme object, no build step.
        </Text>
      </header>

      <section>
        <Heading level={2} size="lg">
          Rebrand the whole library
        </Heading>
        <CodeBlock
          code={`:root {
  --vk-color-primary: #0ea5e9;   /* your brand */
  --vk-radius-md: 2px;           /* sharp corners */
  --vk-font-sans: 'Inter', sans-serif;
}`}
          filename="globals.css"
          plain
        />
        <Text tone="muted">
          Load this after the library's stylesheet. Every component picks it up. There is nothing to
          wire up and no provider to add.
        </Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          Per-component and per-instance
        </Heading>
        <Text tone="muted">
          Custom properties cascade, so an override can be scoped to a subtree or a single element.
        </Text>
        <CodeBlock
          code={`{/* one instance */}
<Button style={{ '--vk-color-primary': '#db2777' } as React.CSSProperties}>
  Pink button
</Button>

{/* a whole subtree */}
<div style={{ '--vk-radius-md': '0px' } as React.CSSProperties}>
  <Card>Square corners in here only</Card>
</div>`}
        />
      </section>

      <section>
        <Heading level={2} size="lg">
          Token reference
        </Heading>
        <Alert icon={null} tone="warning">
          <Text size="sm">
            These names are public API. Renaming one is a major version bump, exactly like renaming
            a prop, because you will be targeting them from your own stylesheet.
          </Text>
        </Alert>
        <Table bordered hoverable size="sm">
          <Table.Caption visuallyHidden>Design tokens</Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Token</Table.HeaderCell>
              <Table.HeaderCell>Default</Table.HeaderCell>
              <Table.HeaderCell>Used for</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {TOKENS.map(([token, value, use]) => (
              <Table.Row key={token}>
                <Table.Cell>
                  <code>{token}</code>
                </Table.Cell>
                <Table.Cell>
                  <code>{value}</code>
                </Table.Cell>
                <Table.Cell>{use}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Text tone="muted">
          Charts add <code>--vk-chart-1</code> through <code>--vk-chart-6</code> plus axis, grid and
          label colours, declared in <code>charts.css</code>.
        </Text>
      </section>

      <section>
        <Heading level={2} size="lg">
          Next
        </Heading>
        <Text>
          <Link href="/docs/dark-mode">Dark mode</Link> covers the one attribute and how to avoid a
          flash of the wrong theme. <Link href="/docs/styling">Overriding styles</Link> explains why
          your CSS always wins.
        </Text>
      </section>
    </>
  )
}
