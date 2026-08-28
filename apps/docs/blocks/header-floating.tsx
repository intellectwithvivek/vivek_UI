import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderFloating() {
  return (
    <div style={{ background: 'var(--vk-color-surface)', paddingBlockEnd: '1rem' }}>
      <Navbar variant="floating" layout="center" container="lg" sticky>
        <NavbarBrand href="#">Overtone</NavbarBrand>
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
          <Button size="sm">Start free</Button>
        </NavbarActions>
      </Navbar>
    </div>
  )
}
