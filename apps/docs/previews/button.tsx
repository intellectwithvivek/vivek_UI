import { Button, Stack } from '@the_viveksingh/vivek-ui'
import Link from 'next/link'

// Server-safe: Button needs no client boundary, so neither does this preview.
export default function ButtonPreview({ name }: { name: string }) {
  if (name === 'sizes') {
    return (
      <Stack gap={4}>
        <Stack direction="horizontal" gap={4} align="center" wrap>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
        <Button fullWidth>Full width</Button>
      </Stack>
    )
  }
  if (name === 'loading') {
    return (
      <Stack direction="horizontal" gap={4} wrap>
        <Button loading>Saving changes</Button>
        <Button loading variant="outline">
          Loading
        </Button>
        <Button disabled>Disabled</Button>
      </Stack>
    )
  }
  if (name === 'asChild') {
    return (
      <Button asChild>
        <Link href="/docs/installation">Get started</Link>
      </Button>
    )
  }
  if (name === 'override') {
    return <Button className="preview-override">Beats the library</Button>
  }
  return (
    <Stack direction="horizontal" gap={4} wrap>
      <Button>Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </Stack>
  )
}
