'use client'

import { Badge, ScrollArea, Sidebar, SidebarItem, SidebarSection } from '@the_viveksingh/vivek-ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * One sidebar row.
 *
 * Deliberately its own tiny shape rather than the registry entry: the sidebar is a client
 * component, so everything it receives is serialised into the RSC payload of every page.
 * Passing registry entries put all 83 generated prop tables into the HTML of each page.
 */
export interface NavItem {
  href: string
  label: string
  /** Marks a client component in the components list. */
  client?: boolean
}

export interface NavGroup {
  heading: string
  items: NavItem[]
}

export function DocsSidebar({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()

  return (
    <ScrollArea className="docs-sidebar">
      <Sidebar collapsible={false} label="Documentation">
        {groups.map((group) => (
          <SidebarSection key={group.heading} title={group.heading}>
            {group.items.map((item) => (
              <SidebarItem
                active={pathname === item.href}
                asChild
                badge={
                  item.client ? (
                    <Badge size="sm" title="Client component" tone="neutral">
                      c
                    </Badge>
                  ) : undefined
                }
                key={item.href}
              >
                <Link href={item.href}>{item.label}</Link>
              </SidebarItem>
            ))}
          </SidebarSection>
        ))}
      </Sidebar>
    </ScrollArea>
  )
}
