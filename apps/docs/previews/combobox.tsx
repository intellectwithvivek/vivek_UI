import { Combobox, Field, Stack } from '@the_viveksingh/vivek-ui'

const FRAMEWORKS = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'vite', label: 'Vite' },
  { value: 'rw', label: 'Redwood', disabled: true },
]

export default function ComboboxPreview({ name }: { name: string }) {
  if (name === 'multiple') {
    return (
      <Field label="Frameworks" help="Selected values appear as removable chips.">
        <Combobox multiple options={FRAMEWORKS} defaultValue={['next', 'astro']} />
      </Field>
    )
  }
  if (name === 'creatable') {
    return (
      <Combobox
        options={FRAMEWORKS}
        creatable
        placeholder="Search or add your own"
        aria-label="Framework"
      />
    )
  }
  return (
    <Stack gap={3}>
      <Combobox options={FRAMEWORKS} defaultValue="next" aria-label="Framework" />
    </Stack>
  )
}
