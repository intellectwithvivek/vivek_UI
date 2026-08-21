import { Button, ButtonGroup, Stack } from '@the_viveksingh/vivek-ui'

export default function ButtonGroupPreview({ name }: { name: string }) {
  if (name === 'vertical') {
    return (
      <ButtonGroup orientation="vertical" attached label="Row actions">
        <Button variant="outline">Duplicate</Button>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Delete</Button>
      </ButtonGroup>
    )
  }
  return (
    <Stack gap={4} align="start">
      <ButtonGroup attached label="Text alignment">
        <Button variant="outline">Left</Button>
        <Button variant="outline">Center</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>
      <ButtonGroup label="Form actions">
        <Button>Save</Button>
        <Button variant="ghost">Cancel</Button>
      </ButtonGroup>
    </Stack>
  )
}
