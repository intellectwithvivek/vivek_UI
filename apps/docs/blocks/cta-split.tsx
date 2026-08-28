import { Button, CTA } from '@the_viveksingh/vivek-ui'

export default function CtaSplit() {
  return (
    <CTA
      layout="split"
      background="muted"
      title="Questions before you commit?"
      description="Book twenty minutes with an engineer, not a salesperson."
      actions={
        <>
          <Button>Book a call</Button>
          <Button variant="ghost">Email us</Button>
        </>
      }
    />
  )
}
