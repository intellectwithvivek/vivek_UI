import {
  Avatar,
  Button,
  DropdownMenu,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarLink,
  NavbarLinks,
  NavbarToggle,
} from '@the_viveksingh/vivek-ui'

export default function HeaderWithAvatar() {
  return (
    <Navbar bordered container="full" size="sm">
      <NavbarBrand href="#">Ledger</NavbarBrand>
      <NavbarToggle />
      <NavbarLinks>
        <NavbarLink active href="#">
          Overview
        </NavbarLink>
        <NavbarLink href="#">Invoices</NavbarLink>
        <NavbarLink href="#">Customers</NavbarLink>
        <NavbarLink href="#">Reports</NavbarLink>
      </NavbarLinks>
      <NavbarActions>
        <Button size="sm" variant="ghost">
          Feedback
        </Button>
        <DropdownMenu align="end">
          <DropdownMenu.Trigger aria-label="Account menu" style={{ borderRadius: '50%' }}>
            <Avatar name="Priya Raman" size="sm" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
            <DropdownMenu.Item>Billing</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Sign out</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </NavbarActions>
    </Navbar>
  )
}
