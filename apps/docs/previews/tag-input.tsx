'use client'

// A predicate or validator prop is a function, and a function cannot cross from a
// Server Component into a Client Component. This preview therefore has to be a client
// component itself - the same constraint applies in any app that uses these props.
import { Field, TagInput } from '@the_viveksingh/vivek-ui'

export default function TagInputPreview({ name }: { name: string }) {
  if (name === 'validated') {
    return (
      <Field label="Invite by email" help="Type an address and press Enter or comma.">
        <TagInput
          defaultValue={['vivek@example.com']}
          max={5}
          delimiters={[',', ' ']}
          addOnBlur
          validate={(tag) => (tag.includes('@') ? true : 'That is not an email address')}
          placeholder="name@company.com"
        />
      </Field>
    )
  }
  return (
    <TagInput
      defaultValue={['react', 'typescript', 'accessibility']}
      placeholder="Add a topic"
      aria-label="Topics"
    />
  )
}
