import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function NavbarPreview({ name }: { name: string }) {
  return (
    <Navbar bordered sticky={name === 'sticky'} container="lg">
      <NavbarBrand href="/">VivekUI</NavbarBrand>
      <NavbarToggle />
      <NavbarLinks>
        <NavbarLink href="/docs" active>
          Docs
        </NavbarLink>
        <NavbarLink href="/docs/components">Components</NavbarLink>
        <NavbarLink href="/docs/charts">Charts</NavbarLink>
        <NavbarLink href="/playground">Playground</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button size="sm" variant="outline">
          GitHub
        </Button>
        <Button size="sm">Install</Button>
      </NavbarActions>
    </Navbar>
  )
}
