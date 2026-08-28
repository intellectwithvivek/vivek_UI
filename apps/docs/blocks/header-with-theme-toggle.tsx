import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
  ThemeProvider,
  ThemeToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderWithThemeToggle() {
  return (
    <ThemeProvider>
      <Navbar bordered container="lg">
        <NavbarBrand href="#">Palisade</NavbarBrand>
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
          <ThemeToggle size="sm" />
          <Button size="sm">Sign up</Button>
        </NavbarActions>
      </Navbar>
    </ThemeProvider>
  )
}
