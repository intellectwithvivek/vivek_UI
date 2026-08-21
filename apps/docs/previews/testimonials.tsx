import { Avatar, Testimonials } from '@the_viveksingh/vivek-ui'

const ITEMS = [
  {
    id: 'a',
    quote:
      'We replaced three UI packages with this one and the lockfile got shorter. That never happens.',
    author: 'Priya Nair',
    role: 'Staff engineer',
    avatar: <Avatar name="Priya Nair" />,
  },
  {
    id: 'b',
    quote:
      'The :where() trick means our design system overrides just work. No specificity war, no !important.',
    author: 'Daniel Okafor',
    role: 'Design systems lead',
    avatar: <Avatar name="Daniel Okafor" />,
  },
  {
    id: 'c',
    quote: 'Half of it renders on the server with no client boundary. Our TTI dropped noticeably.',
    author: 'Mei Chen',
    role: 'Frontend architect',
    avatar: <Avatar name="Mei Chen" />,
  },
]

export default function TestimonialsPreview() {
  return (
    <Testimonials
      padding="md"
      eyebrow="Testimonials"
      title="What teams say"
      description="Illustrative quotes, shown here to demonstrate the component."
      items={ITEMS}
      columns={{ base: 1, md: 3 }}
    />
  )
}
