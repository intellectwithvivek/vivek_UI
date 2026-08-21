import {
  Badge,
  Sidebar,
  SidebarItem,
  SidebarSection,
  SidebarToggle,
} from '@the_viveksingh/vivek-ui'
import type { ReactNode } from 'react'

/*
 * Icons matter here rather than being decoration: collapsing clips every label, so the icon
 * is the whole of what remains. The first version of this preview passed none, which
 * collapsed to an empty rail - the component now falls back to the label's initial, but a
 * real app should supply icons.
 */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  )
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const HomeIcon = () => (
  <Glyph>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z" {...stroke} />
  </Glyph>
)

const ChartIcon = () => (
  <Glyph>
    <path d="M4 20V7M10 20V11M16 20v-6M22 20H2" {...stroke} />
  </Glyph>
)

const InvoiceIcon = () => (
  <Glyph>
    <path d="M6 3h9l4 4v14H6V3ZM15 3v4h4M9 12h7M9 16h5" {...stroke} />
  </Glyph>
)

const CardIcon = () => (
  <Glyph>
    <path d="M3 7h18v10H3V7ZM3 11h18M7 15h3" {...stroke} />
  </Glyph>
)

const PlanIcon = () => (
  <Glyph>
    <path
      d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8L12 3Z"
      {...stroke}
    />
  </Glyph>
)

export default function SidebarPreview({ name }: { name: string }) {
  const collapsible = name !== 'static'
  return (
    <div className="preview-stage" style={{ display: 'flex', minHeight: '20rem' }}>
      <Sidebar collapsible={collapsible} label="Dashboard" width="15rem">
        {collapsible ? <SidebarToggle /> : null}
        <SidebarSection title="Overview">
          <SidebarItem href="#" icon={<HomeIcon />} active>
            Home
          </SidebarItem>
          <SidebarItem href="#" icon={<ChartIcon />}>
            Analytics
          </SidebarItem>
        </SidebarSection>
        <SidebarSection title="Billing">
          <SidebarItem href="#" icon={<InvoiceIcon />} badge={<Badge tone="warning">3</Badge>}>
            Invoices
          </SidebarItem>
          <SidebarItem href="#" icon={<CardIcon />}>
            Payments
          </SidebarItem>
          <SidebarItem href="#" icon={<PlanIcon />}>
            Plans
          </SidebarItem>
        </SidebarSection>
      </Sidebar>
    </div>
  )
}
