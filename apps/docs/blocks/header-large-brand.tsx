import {
  Button,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderLargeBrand() {
  return (
    <Navbar bordered container="lg" size="lg" layout="end">
      <NavbarBrand href="#">
        <svg aria-hidden="true" height="28" viewBox="0 0 28 28" width="28">
          <rect fill="var(--vk-color-primary)" height="28" rx="8" width="28" />
          <path d="M8 18l6-10 6 10" fill="none" stroke="#fff" strokeWidth="2.5" />
        </svg>
        <span>Atelier &amp; Co.</span>
      </NavbarBrand>
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
        <Button variant="outline">Start a project</Button>
      </NavbarActions>
    </Navbar>
  )
}
