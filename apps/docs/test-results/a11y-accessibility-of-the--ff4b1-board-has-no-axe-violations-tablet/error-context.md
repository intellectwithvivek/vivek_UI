# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> accessibility of the composed pages >> /pages/dashboard has no axe violations
- Location: e2e\a11y.spec.ts:36:9

# Error details

```
Error: 
  [serious] scrollable-region-focusable: Scrollable region must have keyboard access
    <pre class="vk-code vk-code--block" data-size="sm">
    <pre class="vk-code vk-code--block" data-size="sm">

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 11

- Array []
+ Array [
+   Object {
+     "help": "Scrollable region must have keyboard access",
+     "id": "scrollable-region-focusable",
+     "impact": "serious",
+     "nodes": Array [
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\">",
+       "<pre class=\"vk-code vk-code--block\" data-size=\"sm\">",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#content"
  - navigation "Main" [ref=e3]:
    - generic [ref=e4]:
      - link "VivekUI" [ref=e5] [cursor=pointer]:
        - /url: /
      - list [ref=e7]:
        - listitem [ref=e8]:
          - link "Docs" [ref=e9] [cursor=pointer]:
            - /url: /docs
        - listitem [ref=e10]:
          - link "Components" [ref=e11] [cursor=pointer]:
            - /url: /docs/components
        - listitem [ref=e12]:
          - link "Charts" [ref=e13] [cursor=pointer]:
            - /url: /docs/charts
        - listitem [ref=e14]:
          - link "Showcase" [ref=e15] [cursor=pointer]:
            - /url: /showcase
        - listitem [ref=e16]:
          - link "Pages" [ref=e17] [cursor=pointer]:
            - /url: /pages
        - listitem [ref=e18]:
          - link "Playground" [ref=e19] [cursor=pointer]:
            - /url: /playground
      - generic [ref=e20]:
        - 'button "Accent colour: Blue" [ref=e21] [cursor=pointer]'
        - button "Switch to light theme" [ref=e23] [cursor=pointer]
        - link "GitHub" [ref=e27] [cursor=pointer]:
          - /url: https://github.com/intellectwithvivek/vivek_UI
  - main [ref=e28]:
    - generic [ref=e29]:
      - navigation "Breadcrumb" [ref=e30]:
        - list [ref=e31]:
          - listitem [ref=e32]:
            - link "Home" [ref=e33] [cursor=pointer]:
              - /url: /
          - listitem [ref=e34]
          - listitem [ref=e37]:
            - link "Page templates" [ref=e38] [cursor=pointer]:
              - /url: /pages
          - listitem [ref=e39]
          - listitem [ref=e42]:
            - generic [ref=e43]: App dashboard
      - generic [ref=e44]:
        - paragraph [ref=e45]: Application
        - heading "App dashboard" [level=1] [ref=e46]
        - paragraph [ref=e47]: A collapsible sidebar, KPI cards, an accessible chart, and a table that sorts, searches and paginates. Free and MIT licensed.
        - generic [ref=e48]:
          - generic [ref=e49]: 13 components
          - generic [ref=e50]: 325 lines
          - generic "Declares 'use client'" [ref=e51]: Client component
          - link "Source on GitHub" [ref=e52] [cursor=pointer]:
            - /url: https://github.com/intellectwithvivek/vivek_UI/blob/main/apps/docs/page-templates/dashboard.tsx
      - paragraph [ref=e54]: The shell every internal tool starts from. The sidebar collapses to an icon rail, the table sorts and searches and paginates without a data library, and the chart ships an accessible data table alongside the SVG so the figures are readable by something other than an eye.
      - generic [ref=e55]:
        - heading "Live demo" [level=2] [ref=e56]
        - generic [ref=e57]:
          - generic [ref=e58]:
            - group "Preview width" [ref=e59]:
              - generic [ref=e60]:
                - button "Phone" [ref=e61] [cursor=pointer]
                - button "Tablet" [ref=e62] [cursor=pointer]
                - button "Desktop" [pressed] [ref=e63] [cursor=pointer]
            - paragraph [ref=e64]: Full width · the frame has its own viewport, so the breakpoints are real
          - iframe [ref=e66]:
            - generic [ref=f1e2]:
              - navigation "Main navigation" [ref=f1e3]:
                - generic [ref=f1e4]:
                  - generic [ref=f1e5]: Overview
                  - list "Overview" [ref=f1e6]:
                    - listitem [ref=f1e7]:
                      - link "Dashboard" [ref=f1e8] [cursor=pointer]:
                        - /url: "#"
                    - listitem [ref=f1e13]:
                      - link "Analytics" [ref=f1e14] [cursor=pointer]:
                        - /url: "#"
                - generic [ref=f1e19]:
                  - generic [ref=f1e20]: Revenue
                  - list "Revenue" [ref=f1e21]:
                    - listitem [ref=f1e22]:
                      - link "Invoices" [ref=f1e23] [cursor=pointer]:
                        - /url: "#"
                    - listitem [ref=f1e28]:
                      - link "Payments" [ref=f1e29] [cursor=pointer]:
                        - /url: "#"
                - generic [ref=f1e34]:
                  - generic [ref=f1e35]: Settings
                  - list "Settings" [ref=f1e36]:
                    - listitem [ref=f1e37]:
                      - link "Preferences" [ref=f1e38] [cursor=pointer]:
                        - /url: "#"
              - generic [ref=f1e44]:
                - generic [ref=f1e45]:
                  - generic [ref=f1e46]:
                    - button "Collapse sidebar" [expanded] [ref=f1e47] [cursor=pointer]
                    - generic [ref=f1e50]:
                      - heading "Dashboard" [level=1] [ref=f1e51]
                      - paragraph [ref=f1e52]: August 2026 · updated 4 minutes ago
                  - generic [ref=f1e53]:
                    - button "Export" [ref=f1e54] [cursor=pointer]
                    - button "New invoice" [ref=f1e55] [cursor=pointer]
                - generic [ref=f1e56]:
                  - generic [ref=f1e58]:
                    - paragraph [ref=f1e59]: Monthly revenue
                    - heading "£62,300" [level=2] [ref=f1e60]
                    - generic [ref=f1e61]: +11.4% vs July
                  - generic [ref=f1e63]:
                    - paragraph [ref=f1e64]: Active accounts
                    - heading "1,284" [level=2] [ref=f1e65]
                    - generic [ref=f1e66]: +64 vs July
                  - generic [ref=f1e68]:
                    - paragraph [ref=f1e69]: Churn
                    - heading "1.9%" [level=2] [ref=f1e70]
                    - generic [ref=f1e71]: −0.3pt vs July
                  - generic [ref=f1e73]:
                    - paragraph [ref=f1e74]: Open tickets
                    - heading "17" [level=2] [ref=f1e75]
                    - generic [ref=f1e76]: +5 vs July
                - generic [ref=f1e78]:
                  - heading "Revenue, last six months" [level=2] [ref=f1e79]
                  - generic [ref=f1e80]:
                    - img "Monthly revenue, March to August 2026" [ref=f1e81]:
                      - generic [ref=f1e82]:
                        - generic [ref=f1e83]: "0"
                        - generic [ref=f1e84]: 10k
                        - generic [ref=f1e85]: 20k
                        - generic [ref=f1e86]: 30k
                        - generic [ref=f1e87]: 40k
                        - generic [ref=f1e88]: 50k
                        - generic [ref=f1e89]: 60k
                        - generic [ref=f1e90]: Mar
                        - generic [ref=f1e91]: Apr
                        - generic [ref=f1e92]: May
                        - generic [ref=f1e93]: Jun
                        - generic [ref=f1e94]: Jul
                        - generic [ref=f1e95]: Aug
                    - table [ref=f1e105]:
                      - caption [ref=f1e106]: Monthly revenue, March to August 2026
                      - rowgroup [ref=f1e107]:
                        - row [ref=f1e108]:
                          - columnheader "Month" [ref=f1e109]
                          - columnheader "Revenue" [ref=f1e110]
                      - rowgroup [ref=f1e111]:
                        - row [ref=f1e112]:
                          - rowheader "Mar" [ref=f1e113]
                          - cell "£41,200" [ref=f1e114]
                        - row [ref=f1e115]:
                          - rowheader "Apr" [ref=f1e116]
                          - cell "£44,800" [ref=f1e117]
                        - row [ref=f1e118]:
                          - rowheader "May" [ref=f1e119]
                          - cell "£47,100" [ref=f1e120]
                        - row [ref=f1e121]:
                          - rowheader "Jun" [ref=f1e122]
                          - cell "£51,600" [ref=f1e123]
                        - row [ref=f1e124]:
                          - rowheader "Jul" [ref=f1e125]
                          - cell "£55,900" [ref=f1e126]
                        - row [ref=f1e127]:
                          - rowheader "Aug" [ref=f1e128]
                          - cell "£62,300" [ref=f1e129]
                - generic [ref=f1e131]:
                  - heading "Recent invoices" [level=2] [ref=f1e132]
                  - generic [ref=f1e133]:
                    - searchbox "Search" [ref=f1e135]
                    - table [ref=f1e137]:
                      - caption [ref=f1e138]: Invoices issued in the last 60 days
                      - rowgroup [ref=f1e139]:
                        - row [ref=f1e140]:
                          - columnheader [ref=f1e141]:
                            - button "Invoice" [ref=f1e142] [cursor=pointer]
                          - columnheader [ref=f1e145]:
                            - button "Customer" [ref=f1e146] [cursor=pointer]
                          - columnheader [ref=f1e149]:
                            - button "Plan" [ref=f1e150] [cursor=pointer]
                          - columnheader [ref=f1e153]:
                            - button "Amount" [ref=f1e154] [cursor=pointer]
                          - columnheader [ref=f1e157]:
                            - button "Status" [ref=f1e158] [cursor=pointer]
                          - columnheader [ref=f1e161]:
                            - button "Issued" [ref=f1e162] [cursor=pointer]
                      - rowgroup [ref=f1e165]:
                        - row [ref=f1e166]:
                          - rowheader "INV-2048" [ref=f1e167]
                          - cell "Customer Larkfield" [ref=f1e168]
                          - cell "Plan Scale" [ref=f1e169]
                          - cell "Amount £4,800" [ref=f1e170]
                          - cell "Status Paid" [ref=f1e171]:
                            - text: Status
                            - generic [ref=f1e172]: Paid
                          - cell "Issued 2026-08-14" [ref=f1e173]
                        - row [ref=f1e174]:
                          - rowheader "INV-2047" [ref=f1e175]
                          - cell "Customer Kestrel" [ref=f1e176]
                          - cell "Plan Starter" [ref=f1e177]
                          - cell "Amount £290" [ref=f1e178]
                          - cell "Status Paid" [ref=f1e179]:
                            - text: Status
                            - generic [ref=f1e180]: Paid
                          - cell "Issued 2026-08-11" [ref=f1e181]
                        - row [ref=f1e182]:
                          - rowheader "INV-2046" [ref=f1e183]
                          - cell "Customer Palisade" [ref=f1e184]
                          - cell "Plan Team" [ref=f1e185]
                          - cell "Amount £1,200" [ref=f1e186]
                          - cell "Status Pending" [ref=f1e187]:
                            - text: Status
                            - generic [ref=f1e188]: Pending
                          - cell "Issued 2026-08-09" [ref=f1e189]
                        - row [ref=f1e190]:
                          - rowheader "INV-2045" [ref=f1e191]
                          - cell "Customer Overtone" [ref=f1e192]
                          - cell "Plan Starter" [ref=f1e193]
                          - cell "Amount £290" [ref=f1e194]
                          - cell "Status Paid" [ref=f1e195]:
                            - text: Status
                            - generic [ref=f1e196]: Paid
                          - cell "Issued 2026-08-07" [ref=f1e197]
                        - row [ref=f1e198]:
                          - rowheader "INV-2043" [ref=f1e199]
                          - cell "Customer Fieldwork" [ref=f1e200]
                          - cell "Plan Team" [ref=f1e201]
                          - cell "Amount £1,200" [ref=f1e202]
                          - cell "Status Pending" [ref=f1e203]:
                            - text: Status
                            - generic [ref=f1e204]: Pending
                          - cell "Issued 2026-08-04" [ref=f1e205]
                    - generic [ref=f1e206]:
                      - status [ref=f1e207]: Showing 1 to 5 of 8 rows, sorted by Issued descending
                      - navigation "Pagination" [ref=f1e208]:
                        - button "Previous page" [disabled] [ref=f1e209]:
                          - generic [ref=f1e210]: ‹
                        - generic [ref=f1e211]: Page 1 of 2
                        - button "Next page" [ref=f1e212] [cursor=pointer]:
                          - generic [ref=f1e213]: ›
      - generic [ref=e67]:
        - heading "What it uses" [level=2] [ref=e68]
        - paragraph [ref=e69]: "Every one of these is an export of the published package. Nothing on this page is hand-rolled, which is the point of the gallery: if a page needed something the library does not have, the library would be missing a component."
        - generic [ref=e70]:
          - link "Badge" [ref=e71] [cursor=pointer]:
            - /url: /docs/components/badge
          - link "Button" [ref=e72] [cursor=pointer]:
            - /url: /docs/components/button
          - link "Card" [ref=e73] [cursor=pointer]:
            - /url: /docs/components/card
          - link "DataTable" [ref=e74] [cursor=pointer]:
            - /url: /docs/components/data-table
          - link "Grid" [ref=e75] [cursor=pointer]:
            - /url: /docs/components/grid
          - link "Heading" [ref=e76] [cursor=pointer]:
            - /url: /docs/components/heading
          - link "Sidebar" [ref=e77] [cursor=pointer]:
            - /url: /docs/components/sidebar
          - link "SidebarItem" [ref=e78] [cursor=pointer]:
            - /url: /docs/components/sidebar
          - link "SidebarSection" [ref=e79] [cursor=pointer]:
            - /url: /docs/components/sidebar
          - link "SidebarToggle" [ref=e80] [cursor=pointer]:
            - /url: /docs/components/sidebar
          - link "Stack" [ref=e81] [cursor=pointer]:
            - /url: /docs/components/stack
          - link "Text" [ref=e82] [cursor=pointer]:
            - /url: /docs/components/text
          - link "AreaChart" [ref=e83] [cursor=pointer]:
            - /url: /docs/charts/area-chart
      - generic [ref=e84]:
        - heading "Imports" [level=2] [ref=e85]
        - generic [ref=e86]:
          - generic [ref=e87]:
            - radiogroup "Code language" [ref=e88]:
              - radio "TS" [checked] [ref=e90] [cursor=pointer]
              - radio "JS" [ref=e92] [cursor=pointer]
            - generic [ref=e94]:
              - button "Copy" [ref=e95] [cursor=pointer]
              - status [ref=e96]
          - code [ref=e98]: "import { Badge, Button, Card, DataTable, Grid, Heading, Sidebar, SidebarItem, SidebarSection, SidebarToggle, Stack, Text } from '@the_viveksingh/vivek-ui' import { AreaChart } from '@the_viveksingh/vivek-ui/charts'"
      - generic [ref=e99]:
        - heading "The whole page" [level=2] [ref=e100]
        - paragraph [ref=e101]:
          - text: This is the file that renders the demo above, read at build time. Copy it into your project, change the words, and it runs — the only thing it needs is
          - code [ref=e102]: "@the_viveksingh/vivek-ui"
          - text: and its stylesheet.
        - alert [ref=e103]:
          - generic [ref=e104]: "!"
          - generic [ref=e105]:
            - generic [ref=e106]: This one is a client component
            - paragraph [ref=e108]:
              - text: It opens with
              - code [ref=e109]: "'use client'"
              - text: because it holds state. Everything above it in your tree stays on the server.
        - generic [ref=e110]:
          - generic [ref=e111]:
            - radiogroup "Code language" [ref=e112]:
              - radio "TS" [checked] [ref=e114] [cursor=pointer]
              - radio "JS" [ref=e116] [cursor=pointer]
            - generic [ref=e118]:
              - button "Copy" [ref=e119] [cursor=pointer]
              - status [ref=e120]
          - code [ref=e122]: "'use client' import { Badge, Button, Card, DataTable, Grid, Heading, Sidebar, SidebarItem, SidebarSection, SidebarToggle, Stack, Text, } from '@the_viveksingh/vivek-ui' import { AreaChart } from '@the_viveksingh/vivek-ui/charts' import type { ReactNode } from 'react' /* * The shell most internal tools start from: a rail on the left, figures across the top, a * trend line, and a table that has to sort, search and paginate without pulling in a data * library. * * Icons are not decoration in a collapsible sidebar - collapsing clips every label, so the * icon is all that is left. A rail of unlabelled squares is the usual result. */ const Glyph = ({ children }: { children: ReactNode }) => ( <svg aria-hidden=\"true\" fill=\"none\" height=\"18\" viewBox=\"0 0 24 24\" width=\"18\"> {children} </svg> ) const stroke = { stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, } interface Invoice { id: string customer: string plan: string amount: number status: 'Paid' | 'Pending' | 'Overdue' issued: string } const INVOICES: Invoice[] = [ { id: 'INV-2041', customer: 'Meridian', plan: 'Scale', amount: 4800, status: 'Paid', issued: '2026-08-01', }, { id: 'INV-2042', customer: 'Halcyon', plan: 'Team', amount: 1200, status: 'Paid', issued: '2026-08-02', }, { id: 'INV-2043', customer: 'Fieldwork', plan: 'Team', amount: 1200, status: 'Pending', issued: '2026-08-04', }, { id: 'INV-2044', customer: 'Northgate', plan: 'Scale', amount: 4800, status: 'Overdue', issued: '2026-07-12', }, { id: 'INV-2045', customer: 'Overtone', plan: 'Starter', amount: 290, status: 'Paid', issued: '2026-08-07', }, { id: 'INV-2046', customer: 'Palisade', plan: 'Team', amount: 1200, status: 'Pending', issued: '2026-08-09', }, { id: 'INV-2047', customer: 'Kestrel', plan: 'Starter', amount: 290, status: 'Paid', issued: '2026-08-11', }, { id: 'INV-2048', customer: 'Larkfield', plan: 'Scale', amount: 4800, status: 'Paid', issued: '2026-08-14', }, ] const REVENUE = [ { x: 'Mar', y: 41200 }, { x: 'Apr', y: 44800 }, { x: 'May', y: 47100 }, { x: 'Jun', y: 51600 }, { x: 'Jul', y: 55900 }, { x: 'Aug', y: 62300 }, ] const KPIS = [ { label: 'Monthly revenue', value: '£62,300', change: '+11.4%', good: true }, { label: 'Active accounts', value: '1,284', change: '+64', good: true }, { label: 'Churn', value: '1.9%', change: '−0.3pt', good: true }, { label: 'Open tickets', value: '17', change: '+5', good: false }, ] const money = (value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` export default function DashboardPage() { return ( <div style={{ display: 'flex', minHeight: '100%', alignItems: 'stretch' }}> <Sidebar collapsible label=\"Main navigation\"> <SidebarSection title=\"Overview\"> <SidebarItem active href=\"#\" icon={ <Glyph> <path d=\"M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z\" {...stroke} /> </Glyph> } > Dashboard </SidebarItem> <SidebarItem href=\"#\" icon={ <Glyph> <path d=\"M4 20V7M10 20V11M16 20v-6M22 20H2\" {...stroke} /> </Glyph> } > Analytics </SidebarItem> </SidebarSection> <SidebarSection title=\"Revenue\"> <SidebarItem href=\"#\" icon={ <Glyph> <path d=\"M6 3h9l4 4v14H6V3ZM15 3v4h4M9 12h7M9 16h5\" {...stroke} /> </Glyph> } > Invoices </SidebarItem> <SidebarItem href=\"#\" icon={ <Glyph> <path d=\"M2 8h20v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8ZM2 11h20\" {...stroke} /> </Glyph> } > Payments </SidebarItem> </SidebarSection> <SidebarSection title=\"Settings\"> <SidebarItem href=\"#\" icon={ <Glyph> <path d=\"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 3 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z\" {...stroke} /> </Glyph> } > Preferences </SidebarItem> </SidebarSection> </Sidebar> <div style={{ flex: 1, minWidth: 0, padding: 'var(--vk-space-6)' }}> <Stack gap={6}> <Stack align=\"center\" direction=\"horizontal\" gap={3} justify=\"between\" wrap> <Stack direction=\"horizontal\" gap={3} align=\"center\"> <SidebarToggle /> <Stack gap={1}> <Heading level={1} size=\"xl\"> Dashboard </Heading> <Text size=\"sm\" tone=\"muted\"> August 2026 · updated 4 minutes ago </Text> </Stack> </Stack> <Stack direction=\"horizontal\" gap={2}> <Button size=\"sm\" variant=\"outline\"> Export </Button> <Button size=\"sm\">New invoice</Button> </Stack> </Stack> <Grid gap={4} minItemWidth=\"13rem\"> {KPIS.map((kpi) => ( <Card key={kpi.label} padding=\"md\"> <Stack gap={1}> <Text size=\"sm\" tone=\"muted\"> {kpi.label} </Text> <Heading level={2} size=\"lg\"> {kpi.value} </Heading> <Badge size=\"sm\" tone={kpi.good ? 'success' : 'warning'} variant=\"soft\"> {kpi.change} vs July </Badge> </Stack> </Card> ))} </Grid> <Card padding=\"lg\"> <Stack gap={4}> <Heading level={2} size=\"md\"> Revenue, last six months </Heading> {/* Every chart renders an accessible data table alongside the SVG, so the figures are readable by something other than an eye. A chart that is only a picture is a chart most of your users cannot read. */} <AreaChart formatValue={money} height={220} series={[{ name: 'Revenue', data: REVENUE }]} title=\"Monthly revenue, March to August 2026\" xLabel=\"Month\" yLabel=\"Revenue\" /> </Stack> </Card> <Card padding=\"lg\"> <Stack gap={4}> <Heading level={2} size=\"md\"> Recent invoices </Heading> <DataTable caption=\"Invoices issued in the last 60 days\" columns={[ { key: 'id', header: 'Invoice', sortable: true }, { key: 'customer', header: 'Customer', sortable: true }, { key: 'plan', header: 'Plan', sortable: true }, { key: 'amount', header: 'Amount', sortable: true, numeric: true, render: (row: Invoice) => money(row.amount), }, { key: 'status', header: 'Status', sortable: true, render: (row: Invoice) => ( <Badge size=\"sm\" tone={ row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger' } variant=\"soft\" > {row.status} </Badge> ), }, { key: 'issued', header: 'Issued', sortable: true }, ]} data={INVOICES} defaultSort={{ key: 'issued', direction: 'desc' }} pageSize={5} // Below its breakpoint the table stacks into cards instead of scrolling // sideways, which is the difference between usable and not on a phone. responsive=\"stack\" rowHeader=\"id\" rowKey=\"id\" searchable searchKeys={['customer', 'id', 'plan']} /> </Stack> </Card> </Stack> </div> </div> ) }"
      - separator [ref=e123]
      - navigation "Adjacent templates" [ref=e124]:
        - link "← Create account" [ref=e125] [cursor=pointer]:
          - /url: /pages/signup
        - link "Settings →" [ref=e126] [cursor=pointer]:
          - /url: /pages/settings
      - link "← All 12 page templates" [ref=e128] [cursor=pointer]:
        - /url: /pages
  - alert [ref=e129]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | import { axeViolations, KEY_ROUTES } from './helpers'
  3   | 
  4   | /**
  5   |  * axe against whole pages, in a real browser.
  6   |  *
  7   |  * The unit suite already runs axe on every component — but in isolation, in jsdom. That
  8   |  * misses everything that only exists once a page is assembled, and everything that needs
  9   |  * layout to detect:
  10  |  *
  11  |  *   - two landmarks of the same kind with no distinguishing label
  12  |  *   - a second `<h1>`, or an outline that jumps a level, once sections are composed
  13  |  *   - **colour contrast**, which axe skips entirely in jsdom because it has to sample the
  14  |  *     rendered pixels of an element against whatever is actually painted behind it
  15  |  *
  16  |  * That last one is the reason this file earns its keep. Every contrast claim the library
  17  |  * makes has been checked against token pairs in the abstract; this is the first thing that
  18  |  * checks the colours as a browser really paints them, on a real background, at a real
  19  |  * font size.
  20  |  */
  21  | 
  22  | /*
  23  |  * Rules disabled, with the reason each one is not ours to fix.
  24  |  *
  25  |  * Nothing to do with severity — an unexplained disabled rule is how an accessibility suite
  26  |  * quietly stops testing anything.
  27  |  */
  28  | const NOT_OURS = [
  29  |   // The showcase embeds twelve third-party sites. axe walks into same-origin frames and
  30  |   // reports their problems as ours; we cannot fix another site's markup from here.
  31  |   'frame-tested',
  32  | ]
  33  | 
  34  | test.describe('accessibility of the composed pages', () => {
  35  |   for (const route of KEY_ROUTES) {
  36  |     test(`${route} has no axe violations`, async ({ page }) => {
  37  |       await page.goto(route)
  38  |       // 'load', never 'networkidle': the showcase page lazy-loads twelve live iframes that
  39  |       // trickle requests indefinitely, so networkidle times the test out on a healthy page.
  40  |       await page.waitForLoadState('load')
  41  | 
  42  |       const violations = await axeViolations(page, NOT_OURS)
  43  |       const report = violations
  44  |         .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
  45  |         .join('\n')
> 46  |       expect(violations, `\n${report}`).toEqual([])
      |                                         ^ Error: 
  47  |     })
  48  |   }
  49  | })
  50  | 
  51  | test.describe('accessibility in dark mode', () => {
  52  |   // Contrast is the failure mode that flips between themes: a pairing that clears 4.5:1 on
  53  |   // white can fall under it on the dark surface, and nothing about the markup changes.
  54  |   for (const route of ['/', '/docs/components/button', '/showcase'] as const) {
  55  |     test(`${route} has no axe violations in dark mode`, async ({ page }) => {
  56  |       await page.goto(route)
  57  |       await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  58  |       await page.waitForLoadState('load')
  59  | 
  60  |       const violations = await axeViolations(page, NOT_OURS)
  61  |       const report = violations
  62  |         .map((v) => `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.join('\n    ')}`)
  63  |         .join('\n')
  64  |       expect(violations, `\n${report}`).toEqual([])
  65  |     })
  66  |   }
  67  | })
  68  | 
  69  | test.describe('keyboard reachability', () => {
  70  |   test('tabbing from the top reaches the main content quickly', async ({ page }) => {
  71  |     // A skip link exists so a keyboard user does not walk the whole nav on every page. If it
  72  |     // is not the first stop, it is not doing its job.
  73  |     await page.goto('/')
  74  |     await page.keyboard.press('Tab')
  75  | 
  76  |     const focused = await page.evaluate(() => {
  77  |       const el = document.activeElement
  78  |       return { text: (el?.textContent ?? '').trim(), href: el?.getAttribute('href') ?? '' }
  79  |     })
  80  |     expect(focused.text).toMatch(/skip/i)
  81  |     expect(focused.href).toBe('#content')
  82  |   })
  83  | 
  84  |   test('every focused control shows a visible focus ring', async ({ page }) => {
  85  |     /*
  86  |      * WCAG 2.4.7. A control that can be focused but shows nothing leaves a keyboard user
  87  |      * with no idea where they are — and it is invisible to every other kind of test, because
  88  |      * the element is present, enabled and correctly labelled.
  89  |      */
  90  |     await page.goto('/')
  91  |     await page.waitForLoadState('load')
  92  | 
  93  |     const invisible: string[] = []
  94  |     for (let step = 0; step < 12; step++) {
  95  |       await page.keyboard.press('Tab')
  96  |       const result = await page.evaluate(() => {
  97  |         const el = document.activeElement as HTMLElement | null
  98  |         if (!el || el === document.body) return null
  99  |         const style = getComputedStyle(el)
  100 |         const ring =
  101 |           (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
  102 |           style.boxShadow !== 'none'
  103 |         return {
  104 |           ring,
  105 |           label: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24)}"`,
  106 |         }
  107 |       })
  108 |       if (result && !result.ring) invisible.push(result.label)
  109 |     }
  110 |     expect(invisible, `no focus indicator on:\n  ${invisible.join('\n  ')}`).toEqual([])
  111 |   })
  112 | })
  113 | 
```