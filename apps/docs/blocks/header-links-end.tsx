import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderLinksEnd() {
  return (
    <Navbar bordered container="xl" layout="end">
      <NavbarBrand href="#">Fieldwork</NavbarBrand>
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
        <Button size="sm" variant="outline">
          Log in
        </Button>
      </NavbarActions>
    </Navbar>
  )
}
