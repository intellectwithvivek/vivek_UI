import { Newsletter } from '@the_viveksingh/vivek-ui'

export default function CtaWithNewsletter() {
  return (
    <Newsletter
      title="Get the changelog in your inbox"
      description="One email per release. What changed, what broke, what to do about it."
      buttonLabel="Subscribe"
      note="No marketing, ever. Unsubscribe in one click."
      layout="inline"
    />
  )
}
