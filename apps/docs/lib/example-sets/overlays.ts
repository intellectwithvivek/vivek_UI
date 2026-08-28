import type { ExampleSet } from '../example-types'

/** Overlays, disclosure and navigation. */
export const OVERLAY_EXAMPLES: ExampleSet = {
  accordion: [
    {
      title: 'One panel at a time',
      description:
        'Each trigger is a button inside a heading, which is what lets a screen reader list the sections and jump between them. collapsible allows closing the open one.',
      name: 'basic',
      code: `<Accordion defaultValue="deps" collapsible>
  <AccordionItem value="deps">
    <AccordionTrigger>Does it really have zero dependencies?</AccordionTrigger>
    <AccordionContent>Yes. There is no dependencies field in package.json.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="styling">
    <AccordionTrigger>How do I override a style?</AccordionTrigger>
    <AccordionContent>Pass a className. Library selectors carry zero specificity.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    },
    {
      title: 'Several at once',
      description:
        'type="multiple" changes value from string | null to string[]. The props are a union, so the wrong onValueChange signature does not compile.',
      name: 'multiple',
      code: `<Accordion type="multiple" defaultValue={['deps', 'styling']} variant="contained">
  {/* same items */}
</Accordion>`,
    },
  ],

  tooltip: [
    {
      title: 'On hover and on focus',
      description:
        'Focus matters as much as hover: a tooltip only reachable with a mouse is invisible to keyboard users. The trigger gets aria-describedby, so the text is announced rather than merely drawn.',
      name: 'basic',
      code: `<Tooltip content="Copied to your clipboard on click">
  <Button>Hover or focus me</Button>
</Tooltip>

<Tooltip content="Billed per active seat, per month">
  <IconButton variant="ghost" aria-label="About seat pricing">
    <InfoIcon />
  </IconButton>
</Tooltip>`,
    },
    {
      title: 'Sides',
      description:
        'side is a preference. If the tooltip would leave the viewport it flips, so it never renders off-screen.',
      name: 'sides',
      code: `<Tooltip content="Above" side="top"><Button variant="outline">Top</Button></Tooltip>
<Tooltip content="To the right" side="right"><Button variant="outline">Right</Button></Tooltip>
<Tooltip content="Below" side="bottom"><Button variant="outline">Bottom</Button></Tooltip>
<Tooltip content="To the left" side="left"><Button variant="outline">Left</Button></Tooltip>`,
    },
  ],

  popover: [
    {
      title: 'Rich content on click',
      description:
        'Unlike a tooltip, a popover can hold interactive content, so it takes focus and closes on Escape or an outside click.',
      name: 'basic',
      code: `<Popover side="bottom" align="start">
  <PopoverTrigger>What is included?</PopoverTrigger>
  <PopoverContent>
    <Stack gap={2} style={{ maxWidth: '18rem' }}>
      <Text weight="semibold">Everything, at no cost</Text>
      <Text size="sm" tone="muted">All components and charts ship in one MIT-licensed package.</Text>
    </Stack>
  </PopoverContent>
</Popover>`,
    },
    {
      title: 'A small form',
      description: 'PopoverClose is a button that closes it, so Cancel needs no state of your own.',
      name: 'form',
      code: `<Popover>
  <PopoverTrigger>Rename project</PopoverTrigger>
  <PopoverContent>
    <Stack gap={3} style={{ minWidth: '16rem' }}>
      <Field label="Project name">
        <Input defaultValue="vivek-ui" />
      </Field>
      <Stack direction="horizontal" gap={2} justify="end">
        <PopoverClose>Cancel</PopoverClose>
        <Button size="sm">Save</Button>
      </Stack>
    </Stack>
  </PopoverContent>
</Popover>`,
    },
  ],

  'context-menu': [
    {
      title: 'Right-click, or Shift+F10',
      description:
        'contextmenu is a pointer event, so a menu that opens only on it does not exist for keyboard users. The surface is focusable and opens on Shift+F10 and the ContextMenu key at its own centre; closing returns focus to wherever it was. Inside, it is DropdownMenu: roving arrows, typeahead, aria-disabled items that stay announced.',
      name: 'default',
      code: `<ContextMenu>
  <ContextMenu.Trigger>Right-click here</ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Label>Report</ContextMenu.Label>
    <ContextMenu.Item onSelect={duplicate} shortcut="⌘D">Duplicate</ContextMenu.Item>
    <ContextMenu.Item onSelect={rename} shortcut="F2">Rename</ContextMenu.Item>
    <ContextMenu.Item disabled shortcut="⌘P">Print</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item onSelect={trash}>Move to trash</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu>

// Any element can be the surface, and an item can be a real link:
<ContextMenu.Trigger asChild><tr>...</tr></ContextMenu.Trigger>
<ContextMenu.Item asChild><Link href="/reports/42">Open</Link></ContextMenu.Item>`,
    },
  ],

  'dropdown-menu': [
    {
      title: 'A menu of actions',
      description:
        'role="menu" with the full keyboard map: arrows move, typeahead jumps, Escape closes and returns focus to the trigger. shortcut is display only - bind the key yourself.',
      name: 'basic',
      code: `<DropdownMenu>
  <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Invoice INV-1042</DropdownMenuLabel>
    <DropdownMenuItem shortcut="E" onSelect={edit}>Edit</DropdownMenuItem>
    <DropdownMenuItem shortcut="D" onSelect={duplicate}>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem disabled>Send reminder</DropdownMenuItem>
    <DropdownMenuItem onSelect={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    },
    {
      title: 'Checkbox items',
      description:
        'closeOnSelect={false} keeps the menu open so several columns can be toggled in one pass, which is what a column picker needs.',
      name: 'checkboxItems',
      code: `<DropdownMenu>
  <DropdownMenuTrigger>View options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Columns</DropdownMenuLabel>
    <DropdownMenuCheckboxItem defaultChecked closeOnSelect={false}>Invoice</DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem defaultChecked closeOnSelect={false}>Client</DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem closeOnSelect={false}>Tax</DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem shortcut="R">Reset to defaults</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    },
  ],

  drawer: [
    {
      title: 'A panel from the edge',
      description:
        'Same dialog machinery as Modal: focus is trapped, Escape closes, the page behind is marked inert, and focus returns to whatever opened it.',
      name: 'basic',
      code: `const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>New invoice</Button>

<Drawer open={open} onOpenChange={setOpen} side="end" size="md" title="New invoice">
  <DrawerHeader>
    <DrawerTitle>New invoice</DrawerTitle>
    <DrawerCloseButton />
  </DrawerHeader>
  <DrawerBody>
    <Field label="Client">
      <Input placeholder="Northwind Traders" />
    </Field>
  </DrawerBody>
  <DrawerFooter>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={submit}>Create invoice</Button>
  </DrawerFooter>
</Drawer>`,
    },
    {
      title: 'From the bottom',
      description:
        'side="bottom" gives the sheet pattern that suits phones better than a side panel.',
      name: 'bottom',
      code: `<Drawer open={open} onOpenChange={setOpen} side="bottom" size="md" title="Filters">
  {/* same parts */}
</Drawer>`,
    },
  ],

  toast: [
    {
      title: 'Fire a toast from anywhere',
      description:
        'Mount one ToastProvider near the root, then call useToast from any client component. duration: null makes it stay until dismissed, which is right for an error the user must read.',
      name: 'basic',
      code: `// app/layout.tsx
<ToastProvider position="bottom-end" duration={4000}>
  {children}
</ToastProvider>

// anywhere below it
const { toast, dismissAll } = useToast()

toast({ title: 'Invoice sent', description: 'Northwind will get it shortly.' })
toast({ tone: 'success', title: 'Saved' })
toast({ tone: 'danger', title: 'Payment failed', duration: null })`,
    },
    {
      title: 'The Toast element on its own',
      description:
        'Exported so a static notification - an inline banner, a Storybook story - can reuse the same visual without the provider.',
      name: 'standalone',
      code: `<Toast title="Invoice sent" description="Northwind will get it shortly." />
<Toast tone="success" title="Deploy finished" description="Live in 4 regions." />
<Toast tone="warning" title="Storage almost full" description="92% of 10 GB used." />
<Toast tone="danger" title="Payment failed" description="The card was declined." />`,
    },
  ],

  'command-palette': [
    {
      title: 'Ctrl+K search',
      description:
        'A modal combobox: the hotkey is bound for you, filtering is over label plus keywords, and arrows move aria-activedescendant rather than DOM focus, so the query box keeps the caret.',
      name: 'basic',
      code: `const [open, setOpen] = useState(false)

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  placeholder="Search components, charts and pages"
  items={[
    {
      heading: 'Navigate',
      items: [
        { id: 'overview', label: 'Overview', keywords: ['start', 'install'] },
        { id: 'button', label: 'Button', description: 'Component' },
      ],
    },
    {
      heading: 'Actions',
      items: [
        { id: 'theme', label: 'Toggle dark mode', shortcut: 'T' },
        { id: 'copy', label: 'Copy install command', shortcut: 'C' },
      ],
    },
  ]}
  onSelect={(item) => run(item.id)}
/>`,
    },
  ],

  'anchor-nav': [
    {
      title: 'On this page',
      description:
        'Real hash links that work before JavaScript, then an IntersectionObserver marks the section in view with aria-current="location". offset accounts for a fixed header in both the spy and the jump. Clicking scrolls smoothly (instantly under prefers-reduced-motion), replaces the hash without a history entry, and moves focus to the section.',
      name: 'default',
      code: `<AnchorNav
  title="On this page"
  offset={64}
  items={[
    { id: 'overview', label: 'Overview' },
    {
      id: 'install',
      label: 'Installation',
      children: [
        { id: 'npm', label: 'With npm' },
        { id: 'pnpm', label: 'With pnpm' },
      ],
    },
    { id: 'usage', label: 'Usage' },
  ]}
  style={{ position: 'sticky', top: '5rem' }}
/>`,
    },
    {
      title: 'Horizontal, under a page header',
      description:
        'orientation="horizontal" turns the rail into one scrolling row with an underline; nested items are hidden there. onActiveChange reports the current id; pass activeId to drive it yourself.',
      name: 'horizontal',
      code: `<AnchorNav
  orientation="horizontal"
  label="Sections"
  items={[
    { id: 'summary', label: 'Summary' },
    { id: 'activity', label: 'Activity' },
    { id: 'billing', label: 'Billing' },
    { id: 'members', label: 'Members' },
  ]}
  onActiveChange={(id) => track('section_view', { id })}
/>`,
    },
  ],

  breadcrumb: [
    {
      title: 'From data',
      description:
        'A nav with an ordered list. The current page gets aria-current="page" and is not a link, because linking to where you already are is a dead end.',
      name: 'items',
      code: `<Breadcrumb
  items={[
    { label: 'Docs', href: '/docs' },
    { label: 'Components', href: '/docs/components' },
    { label: 'Breadcrumb', current: true },
  ]}
/>`,
    },
    {
      title: 'Or as children',
      description:
        'Use the compound form when an item needs a router link - Breadcrumb.Item takes asChild.',
      name: 'compound',
      code: `<Breadcrumb>
  <Breadcrumb.Item asChild>
    <Link href="/docs">Docs</Link>
  </Breadcrumb.Item>
  <Breadcrumb.Item href="/docs/components">Components</Breadcrumb.Item>
  <Breadcrumb.Item current>Breadcrumb</Breadcrumb.Item>
</Breadcrumb>`,
    },
  ],

  pagination: [
    {
      title: 'Page through a list',
      description:
        'Controlled on purpose: the page number usually belongs in the URL, not in component state. siblingCount decides how many numbers flank the current page before it collapses to an ellipsis.',
      name: 'basic',
      code: `const [page, setPage] = useState(1)

<Pagination page={page} pageCount={12} onPageChange={setPage} />`,
    },
    {
      title: 'First and last',
      name: 'firstLast',
      code: `<Pagination page={page} pageCount={12} onPageChange={setPage} showFirstLast siblingCount={2} />`,
    },
  ],

  stepper: [
    {
      title: 'Progress through a flow',
      description:
        'Status is conveyed by a visually hidden label as well as by colour and glyph, so "current" survives being read aloud or seen in greyscale.',
      name: 'basic',
      code: `<Stepper
  steps={[
    { label: 'Account', description: 'Email and password' },
    { label: 'Workspace', description: 'Name and region' },
    { label: 'Billing', description: 'Card or invoice' },
    { label: 'Done', description: 'Invite your team' },
  ]}
  activeStep={2}
  label="Onboarding"
/>`,
    },
    {
      title: 'Vertical',
      name: 'vertical',
      code: `<Stepper steps={steps} activeStep={1} orientation="vertical" label="Onboarding" />`,
    },
    {
      title: 'Plain strings',
      description: 'When there is nothing to say beyond the name.',
      name: 'strings',
      code: `<Stepper steps={['Cart', 'Address', 'Payment']} activeStep={1} size="sm" />`,
    },
  ],

  'button-group': [
    {
      title: 'Related actions',
      description:
        'attached merges the borders into a segmented control. label names the group for assistive technology, since a bare row of buttons has no collective name.',
      name: 'basic',
      code: `<ButtonGroup attached label="Text alignment">
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>

<ButtonGroup label="Form actions">
  <Button>Save</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonGroup>`,
    },
    {
      title: 'Vertical',
      name: 'vertical',
      code: `<ButtonGroup orientation="vertical" attached label="Row actions">
  <Button variant="outline">Duplicate</Button>
  <Button variant="outline">Archive</Button>
  <Button variant="outline">Delete</Button>
</ButtonGroup>`,
    },
  ],

  navbar: [
    {
      title: 'A site header',
      description:
        'NavbarToggle handles the mobile menu, including aria-expanded and aria-controls. NavbarLink takes asChild, so a Next.js Link keeps client-side routing.',
      name: 'basic',
      code: `<Navbar bordered container="lg">
  <NavbarBrand href="/">VivekUI</NavbarBrand>
  <NavbarToggle />
  <NavbarLinks>
    <NavbarLink asChild active>
      <Link href="/docs">Docs</Link>
    </NavbarLink>
    <NavbarLink asChild>
      <Link href="/docs/components">Components</Link>
    </NavbarLink>
  </NavbarLinks>
  <NavbarActions>
    <Button size="sm">Install</Button>
  </NavbarActions>
</Navbar>`,
    },
    {
      title: 'Sticky',
      name: 'sticky',
      code: `<Navbar sticky bordered container="lg">
  {/* same parts */}
</Navbar>`,
    },
  ],

  sidebar: [
    {
      title: 'App navigation',
      description:
        'SidebarToggle collapses it to icons only. The collapsed width is a custom property, so your CSS can change it without a prop.',
      name: 'basic',
      code: `<Sidebar collapsible label="Dashboard" width="15rem">
  <SidebarToggle />
  <SidebarSection title="Overview">
    <SidebarItem href="/dashboard" active>Home</SidebarItem>
    <SidebarItem href="/analytics">Analytics</SidebarItem>
  </SidebarSection>
  <SidebarSection title="Billing">
    <SidebarItem href="/invoices" badge={<Badge tone="warning">3</Badge>}>Invoices</SidebarItem>
    <SidebarItem href="/payments">Payments</SidebarItem>
  </SidebarSection>
</Sidebar>`,
    },
    {
      title: 'Fixed width',
      description: 'Leave collapsible off when there is room and the toggle would be clutter.',
      name: 'static',
      code: `<Sidebar label="Dashboard" width="15rem">
  {/* sections */}
</Sidebar>`,
    },
  ],

  carousel: [
    {
      title: 'One slide at a time',
      description:
        'The track is a real scroll container, so touch and trackpad gestures work natively. Arrows, dots and a pause button are all keyboard reachable, and autoPlay stops on hover, focus and reduced motion.',
      name: 'single',
      code: `<Carousel loop showArrows showDots label="Why VivekUI">
  {slides.map((slide) => (
    <Stack key={slide.title} gap={2} className="panel">
      <Heading level={4} size="md">{slide.title}</Heading>
      <Text size="sm" tone="muted">{slide.body}</Text>
    </Stack>
  ))}
</Carousel>`,
    },
    {
      title: 'Several per view',
      description: 'A responsive object, same shape as Grid cols.',
      name: 'multiple',
      code: `<Carousel slidesPerView={{ base: 1, sm: 2, lg: 3 }} gap={4} loop showArrows showDots>
  {/* slides */}
</Carousel>`,
    },
  ],

  'theme-provider': [
    {
      title: 'Light, dark and system',
      description:
        'Persists the choice, follows the OS when set to system, and exposes it through useTheme. Inject themeScript into the head so the first paint is already correct - otherwise dark-mode users get a white flash.',
      name: 'basic',
      code: `// app/layout.tsx
import { ThemeProvider, themeScript } from '@the_viveksingh/vivek-ui'

<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  </head>
  <body>
    <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
  </body>
</html>

// anywhere below it
const { theme, resolvedTheme, setTheme } = useTheme()`,
    },
  ],

  'theme-toggle': [
    {
      title: 'A toggle button',
      description:
        'Reads and writes the ThemeProvider context, and takes IconButton props, so it matches whatever else sits in your header.',
      name: 'basic',
      code: `<ThemeToggle />
<ThemeToggle variant="outline" />
<ThemeToggle variant="solid" size="lg" round />`,
    },
    {
      title: 'Toggle or cycle',
      description:
        'cycle includes system, which matters if you want people to be able to hand control back to the OS.',
      name: 'modes',
      code: `<ThemeToggle mode="toggle" />
<ThemeToggle mode="cycle" />`,
    },
  ],
}
