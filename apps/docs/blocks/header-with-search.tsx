import {
  Button,
  Input,
  Kbd,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderWithSearch() {
  return (
    <Navbar bordered container="xl">
      <NavbarBrand href="#">Docs</NavbarBrand>
      <NavbarToggle />
      <NavbarLinks>
        <NavbarLink active href="#">
          Guides
        </NavbarLink>
        <NavbarLink href="#">API</NavbarLink>
        <NavbarLink href="#">Examples</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Input aria-label="Search the docs" placeholder="Search…" size="sm" type="search" />
          <Kbd style={{ position: 'absolute', insetInlineEnd: '0.5rem' }}>⌘K</Kbd>
        </div>
        <Button size="sm" variant="ghost">
          GitHub
        </Button>
      </NavbarActions>
    </Navbar>
  )
}
