import {
  Button,
  Field,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'

export default function PopoverPreview({ name }: { name: string }) {
  if (name === 'form') {
    return (
      <Popover>
        <PopoverTrigger>Rename project</PopoverTrigger>
        <PopoverContent>
          <Stack gap={3} style={{ minWidth: '16rem' }}>
            <Field label="Project name">
              <Input defaultValue="vivek-ui" />
            </Field>
            <Stack direction="horizontal" gap={2} justify="end">
              <PopoverClose>Cancel</PopoverClose>
              <Button size="sm">Save</Button>
            </Stack>
          </Stack>
        </PopoverContent>
      </Popover>
    )
  }
  return (
    <Popover side="bottom" align="start">
      <PopoverTrigger>What is included?</PopoverTrigger>
      <PopoverContent>
        <Stack gap={2} style={{ maxWidth: '18rem' }}>
          <Text weight="semibold">Everything, at no cost</Text>
          <Text size="sm" tone="muted">
            All 104 components, all ten charts and the design tokens ship in one MIT-licensed
            package. There is no paid tier to upgrade to.
          </Text>
        </Stack>
      </PopoverContent>
    </Popover>
  )
}
