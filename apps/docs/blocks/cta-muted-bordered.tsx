import { Button, CTA } from '@the_viveksingh/vivek-ui'

export default function CtaMutedBordered() {
  return (
    <CTA
      inset
      layout="split"
      background="muted"
      padding="md"
      title="Still reading?"
      description="The docs are shorter than this page. Start with the quick start."
      actions={<Button variant="link">Quick start →</Button>}
    />
  )
}
