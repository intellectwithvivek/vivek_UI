import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderSimple() {
  return (
    <Navbar bordered container="lg">
      <NavbarBrand href="#">Northwind</NavbarBrand>
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
        <Button size="sm" variant="ghost">
          Sign in
        </Button>
        <Button size="sm">Get started</Button>
      </NavbarActions>
    </Navbar>
  )
}
