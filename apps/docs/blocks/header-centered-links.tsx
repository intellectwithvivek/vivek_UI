import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderCenteredLinks() {
  return (
    <Navbar bordered container="lg" layout="center">
      <NavbarBrand href="#">Halcyon</NavbarBrand>
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
        <Button size="sm">Book a demo</Button>
      </NavbarActions>
    </Navbar>
  )
}
