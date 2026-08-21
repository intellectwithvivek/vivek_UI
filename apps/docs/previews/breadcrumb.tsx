import { Breadcrumb } from '@the_viveksingh/vivek-ui'

export default function BreadcrumbPreview({ name }: { name: string }) {
  if (name === 'compound') {
    return (
      <Breadcrumb>
        <Breadcrumb.Item href="/docs">Docs</Breadcrumb.Item>
        <Breadcrumb.Item href="/docs/components">Components</Breadcrumb.Item>
        <Breadcrumb.Item current>Breadcrumb</Breadcrumb.Item>
      </Breadcrumb>
    )
  }
  return (
    <Breadcrumb
      items={[
        { label: 'Docs', href: '/docs' },
        { label: 'Components', href: '/docs/components' },
        { label: 'Breadcrumb', current: true },
      ]}
    />
  )
}
