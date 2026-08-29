import { Badge, Button, Container, Hero, Image, Stack } from '@the_viveksingh/vivek-ui'

export default function HeroProductLaunch() {
  return (
    <>
      <Hero
        padding="lg"
        eyebrow={
          <Badge pill tone="success" variant="soft">
            New · Version 4 is here
          </Badge>
        }
        title="Meet the editor that finishes your sentences"
        description="Inline suggestions, a command palette that knows your project, and a diff view you will actually read."
        actions={
          <>
            <Button size="lg">Download for macOS</Button>
            <Button size="lg" variant="link">
              Other platforms →
            </Button>
          </>
        }
      />
      <Container size="lg">
        <Stack
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--vk-radius-lg)',
            background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
          }}
        >
          <Image
            src="/demo/vk-editor.svg"
            alt="The editor showing an inline suggestion"
            ratio={16 / 9}
            rounded="md"
          />
        </Stack>
      </Container>
    </>
  )
}
