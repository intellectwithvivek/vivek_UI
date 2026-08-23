'use client'

import {
  Badge,
  Button,
  Card,
  DataTable,
  Grid,
  Heading,
  Sidebar,
  SidebarItem,
  SidebarSection,
  SidebarToggle,
  Stack,
  Text,
} from '@the_viveksingh/vivek-ui'
import { AreaChart } from '@the_viveksingh/vivek-ui/charts'
import type { ReactNode } from 'react'

/*
 * The shell most internal tools start from: a rail on the left, figures across the top, a
 * trend line, and a table that has to sort, search and paginate without pulling in a data
 * library.
 *
 * Icons are not decoration in a collapsible sidebar - collapsing clips every label, so the
 * icon is all that is left. A rail of unlabelled squares is the usual result.
 */
const Glyph = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
    {children}
  </svg>
)

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

interface Invoice {
  id: string
  customer: string
  plan: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  issued: string
}

const INVOICES: Invoice[] = [
  {
    id: 'INV-2041',
    customer: 'Meridian',
    plan: 'Scale',
    amount: 4800,
    status: 'Paid',
    issued: '2026-08-01',
  },
  {
    id: 'INV-2042',
    customer: 'Halcyon',
    plan: 'Team',
    amount: 1200,
    status: 'Paid',
    issued: '2026-08-02',
  },
  {
    id: 'INV-2043',
    customer: 'Fieldwork',
    plan: 'Team',
    amount: 1200,
    status: 'Pending',
    issued: '2026-08-04',
  },
  {
    id: 'INV-2044',
    customer: 'Northgate',
    plan: 'Scale',
    amount: 4800,
    status: 'Overdue',
    issued: '2026-07-12',
  },
  {
    id: 'INV-2045',
    customer: 'Overtone',
    plan: 'Starter',
    amount: 290,
    status: 'Paid',
    issued: '2026-08-07',
  },
  {
    id: 'INV-2046',
    customer: 'Palisade',
    plan: 'Team',
    amount: 1200,
    status: 'Pending',
    issued: '2026-08-09',
  },
  {
    id: 'INV-2047',
    customer: 'Kestrel',
    plan: 'Starter',
    amount: 290,
    status: 'Paid',
    issued: '2026-08-11',
  },
  {
    id: 'INV-2048',
    customer: 'Larkfield',
    plan: 'Scale',
    amount: 4800,
    status: 'Paid',
    issued: '2026-08-14',
  },
]

const REVENUE = [
  { x: 'Mar', y: 41200 },
  { x: 'Apr', y: 44800 },
  { x: 'May', y: 47100 },
  { x: 'Jun', y: 51600 },
  { x: 'Jul', y: 55900 },
  { x: 'Aug', y: 62300 },
]

const KPIS = [
  { label: 'Monthly revenue', value: '£62,300', change: '+11.4%', good: true },
  { label: 'Active accounts', value: '1,284', change: '+64', good: true },
  { label: 'Churn', value: '1.9%', change: '−0.3pt', good: true },
  { label: 'Open tickets', value: '17', change: '+5', good: false },
]

const money = (value: number) =>
  `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100%', alignItems: 'stretch' }}>
      <Sidebar collapsible label="Main navigation">
        <SidebarSection title="Overview">
          <SidebarItem
            active
            href="#"
            icon={
              <Glyph>
                <path
                  d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z"
                  {...stroke}
                />
              </Glyph>
            }
          >
            Dashboard
          </SidebarItem>
          <SidebarItem
            href="#"
            icon={
              <Glyph>
                <path d="M4 20V7M10 20V11M16 20v-6M22 20H2" {...stroke} />
              </Glyph>
            }
          >
            Analytics
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Revenue">
          <SidebarItem
            href="#"
            icon={
              <Glyph>
                <path d="M6 3h9l4 4v14H6V3ZM15 3v4h4M9 12h7M9 16h5" {...stroke} />
              </Glyph>
            }
          >
            Invoices
          </SidebarItem>
          <SidebarItem
            href="#"
            icon={
              <Glyph>
                <path d="M2 8h20v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8ZM2 11h20" {...stroke} />
              </Glyph>
            }
          >
            Payments
          </SidebarItem>
        </SidebarSection>

        <SidebarSection title="Settings">
          <SidebarItem
            href="#"
            icon={
              <Glyph>
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 3 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"
                  {...stroke}
                />
              </Glyph>
            }
          >
            Preferences
          </SidebarItem>
        </SidebarSection>
      </Sidebar>

      <div style={{ flex: 1, minWidth: 0, padding: 'var(--vk-space-6)' }}>
        <Stack gap={6}>
          <Stack align="center" direction="horizontal" gap={3} justify="between" wrap>
            <Stack direction="horizontal" gap={3} align="center">
              <SidebarToggle />
              <Stack gap={1}>
                <Heading level={1} size="xl">
                  Dashboard
                </Heading>
                <Text size="sm" tone="muted">
                  August 2026 · updated 4 minutes ago
                </Text>
              </Stack>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button size="sm" variant="outline">
                Export
              </Button>
              <Button size="sm">New invoice</Button>
            </Stack>
          </Stack>

          <Grid gap={4} minItemWidth="13rem">
            {KPIS.map((kpi) => (
              <Card key={kpi.label} padding="md">
                <Stack gap={1}>
                  <Text size="sm" tone="muted">
                    {kpi.label}
                  </Text>
                  <Heading level={2} size="lg">
                    {kpi.value}
                  </Heading>
                  <Badge size="sm" tone={kpi.good ? 'success' : 'warning'} variant="soft">
                    {kpi.change} vs July
                  </Badge>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Card padding="lg">
            <Stack gap={4}>
              <Heading level={2} size="md">
                Revenue, last six months
              </Heading>
              {/*
                Every chart renders an accessible data table alongside the SVG, so the
                figures are readable by something other than an eye. A chart that is only a
                picture is a chart most of your users cannot read.
              */}
              <AreaChart
                formatValue={money}
                height={220}
                series={[{ name: 'Revenue', data: REVENUE }]}
                title="Monthly revenue, March to August 2026"
                xLabel="Month"
                yLabel="Revenue"
              />
            </Stack>
          </Card>

          <Card padding="lg">
            <Stack gap={4}>
              <Heading level={2} size="md">
                Recent invoices
              </Heading>
              <DataTable
                caption="Invoices issued in the last 60 days"
                columns={[
                  { key: 'id', header: 'Invoice', sortable: true },
                  { key: 'customer', header: 'Customer', sortable: true },
                  { key: 'plan', header: 'Plan', sortable: true },
                  {
                    key: 'amount',
                    header: 'Amount',
                    sortable: true,
                    numeric: true,
                    render: (row: Invoice) => money(row.amount),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    sortable: true,
                    render: (row: Invoice) => (
                      <Badge
                        size="sm"
                        tone={
                          row.status === 'Paid'
                            ? 'success'
                            : row.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                        }
                        variant="soft"
                      >
                        {row.status}
                      </Badge>
                    ),
                  },
                  { key: 'issued', header: 'Issued', sortable: true },
                ]}
                data={INVOICES}
                defaultSort={{ key: 'issued', direction: 'desc' }}
                pageSize={5}
                // Below its breakpoint the table stacks into cards instead of scrolling
                // sideways, which is the difference between usable and not on a phone.
                responsive="stack"
                rowHeader="id"
                rowKey="id"
                searchable
                searchKeys={['customer', 'id', 'plan']}
              />
            </Stack>
          </Card>
        </Stack>
      </div>
    </div>
  )
}
