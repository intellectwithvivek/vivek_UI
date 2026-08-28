import { Button, CTA } from '@the_viveksingh/vivek-ui'

export default function CtaInsetCard() {
  return (
    <CTA
      inset
      background="primary"
      eyebrow="Ready when you are"
      title="Ship your first page this afternoon"
      description="The templates are free, the components are typed, and the docs assume you are busy."
      actions={
        <Button size="lg" variant="outline">
          Get started
        </Button>
      }
    />
  )
}
