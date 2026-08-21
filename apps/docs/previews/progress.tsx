import { Progress, Stack } from '@the_viveksingh/vivek-ui'

export default function ProgressPreview({ name }: { name: string }) {
  if (name === 'tones') {
    return (
      <Stack gap={4}>
        <Progress value={72} label="Upload progress" />
        <Progress value={92} tone="success" label="Tests passed" />
        <Progress value={48} tone="warning" label="Storage used" />
        <Progress value={18} tone="danger" label="Budget remaining" />
      </Stack>
    )
  }
  if (name === 'indeterminate') {
    return <Progress label="Deploying" />
  }
  return (
    <Stack gap={4}>
      <Progress value={30} size="sm" label="Small" />
      <Progress value={55} size="md" label="Medium" />
      <Progress value={80} size="lg" label="Large" />
    </Stack>
  )
}
