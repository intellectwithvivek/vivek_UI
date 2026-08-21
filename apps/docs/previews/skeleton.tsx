import { Skeleton, Stack } from '@the_viveksingh/vivek-ui'

export default function SkeletonPreview({ name }: { name: string }) {
  if (name === 'shapes') {
    return (
      <Stack direction="horizontal" gap={4} align="center">
        <Skeleton variant="circle" width={48} height={48} />
        <Stack gap={2} style={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="70%" />
        </Stack>
      </Stack>
    )
  }
  return (
    <Stack gap={4}>
      <Skeleton variant="rect" height={120} />
      <Skeleton lines={3} />
    </Stack>
  )
}
