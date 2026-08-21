import {
  Badge,
  Sidebar,
  SidebarItem,
  SidebarSection,
  SidebarToggle,
} from '@the_viveksingh/vivek-ui'

export default function SidebarPreview({ name }: { name: string }) {
  const collapsible = name !== 'static'
  return (
    <div className="preview-stage" style={{ display: 'flex', minHeight: '18rem' }}>
      <Sidebar collapsible={collapsible} label="Dashboard" width="15rem">
        {collapsible ? <SidebarToggle /> : null}
        <SidebarSection title="Overview">
          <SidebarItem href="#" active>
            Home
          </SidebarItem>
          <SidebarItem href="#">Analytics</SidebarItem>
        </SidebarSection>
        <SidebarSection title="Billing">
          <SidebarItem href="#" badge={<Badge tone="warning">3</Badge>}>
            Invoices
          </SidebarItem>
          <SidebarItem href="#">Payments</SidebarItem>
          <SidebarItem href="#">Plans</SidebarItem>
        </SidebarSection>
      </Sidebar>
    </div>
  )
}
