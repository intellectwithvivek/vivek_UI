import {
  Button,
  Hero,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderTransparent() {
  return (
    <div style={{ position: 'relative', isolation: 'isolate' }}>
      <div style={{ position: 'absolute', insetInline: 0, insetBlockStart: 0, zIndex: 1 }}>
        <Navbar variant="transparent" container="lg" style={{ color: '#fff' }}>
          <NavbarBrand href="#" style={{ color: 'inherit' }}>
            Summit
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
            <Button size="sm" variant="outline">
              Shop
            </Button>
          </NavbarActions>
        </Navbar>
      </div>
      <Hero
        overlay="dark"
        minHeight="half"
        backdrop={<img src="/demo/vk-ridge.svg" alt="" />}
        title="Built for the days the forecast was wrong"
        description="Shells, mid-layers and packs tested where the weather does not read the brochure."
        actions={<Button size="lg">Explore the range</Button>}
      />
    </div>
  )
}
