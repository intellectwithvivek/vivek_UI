import { Newsletter } from '@the_viveksingh/vivek-ui'

export default function FormNewsletterInline() {
  return (
    <Newsletter
      title="Stay in the loop"
      description="A short note when something ships."
      layout="inline"
      buttonLabel="Sign up"
      note="No spam. Unsubscribe any time."
    />
  )
}
