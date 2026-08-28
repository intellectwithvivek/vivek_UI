import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
  Text,
} from '@the_viveksingh/vivek-ui'

export default function HeaderAnnouncement() {
  return (
    <>
      <div
        style={{
          padding: '0.5rem 1rem',
          textAlign: 'center',
          background: 'var(--vk-color-primary)',
          color: 'var(--vk-color-primary-fg)',
        }}
      >
        <Text as="span" size="sm">
          Version 1.0 is out — 109 components, zero dependencies.{' '}
          <a href="/blog/v1" style={{ color: 'inherit', fontWeight: 600 }}>
            Read the announcement →
          </a>
        </Text>
      </div>
      <Navbar bordered container="lg">
        <NavbarBrand href="#">VivekUI</NavbarBrand>
        <NavbarToggle />
        <NavbarLinks>
          <NavbarLink active href="#">
            Product
          </NavbarLink>
          <NavbarLink href="#">Pricing</NavbarLink>
          <NavbarLink href="#">Docs</NavbarLink>
          <NavbarLink href="#">Blog</NavbarLink>
        </NavbarLinks>
        <NavbarActions>
          <Button size="sm">Install</Button>
        </NavbarActions>
      </Navbar>
    </>
  )
}
