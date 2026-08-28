import { Button, CTA } from '@the_viveksingh/vivek-ui'

export default function CtaBandPrimary() {
  return (
    <CTA
      background="primary"
      title="Start with a Button and see how far it goes"
      description="One npm install and one stylesheet import. There is no configuration step."
      actions={
        <>
          <Button size="lg">Install the package</Button>
          <Button size="lg" variant="outline">
            Browse components
          </Button>
        </>
      }
    />
  )
}
