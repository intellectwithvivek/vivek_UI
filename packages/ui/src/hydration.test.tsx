/**
 * Every client component must hydrate the markup it server-rendered, without a mismatch.
 *
 * This is THE bug class for the library's primary audience. Next.js renders every page on
 * the server first; if a component's first client render disagrees with that HTML — a
 * `Date.now()` read during render, a locale-dependent format, a random id, a `window` check
 * that flips a branch — React logs a hydration error and re-renders the subtree from
 * scratch, which is slow, flashes, and in React 18 can leave event handlers detached.
 *
 * `expectHydrationClean` in modern.test.tsx did this for five time-based components. This
 * suite does it for every component that carries `'use client'`, with minimal real props,
 * and a meta-check at the bottom scans the source tree so the next client component cannot
 * ship outside the sweep.
 *
 * The assertion is React's own signal, not a string diff: `onRecoverableError` fires on any
 * mismatch React recovers from, and hydration warnings on `console.error` catch the rest.
 * That makes the check immune to attribute-serialisation differences (`dateTime` vs
 * `datetime`) that a byte comparison would flag falsely.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act } from '@testing-library/react'
import type { ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Accordion } from './components/accordion'
import { AnimatedCounter } from './components/animated-counter'
import { AudioPlayer } from './components/audio-player'
import { Calendar } from './components/calendar'
import { Carousel } from './components/carousel'
import { ChatCodeBlock } from './components/chat-code-block'
import { ChatInput } from './components/chat-input'
import { ChatMessage } from './components/chat-message'
import { ChatThread } from './components/chat-thread'
import { Chip } from './components/chip'
import { Clock } from './components/clock'
import { Combobox } from './components/combobox'
import { CommandPalette } from './components/command-palette'
import { ContextMenu } from './components/context-menu'
import { CopyButton } from './components/copy-button'
import { Countdown } from './components/countdown'
import { DataTable } from './components/data-table'
import { DatePicker } from './components/date-picker'
import { DateRangePicker } from './components/date-range-picker'
import { Drawer } from './components/drawer'
import { DropdownMenu } from './components/dropdown-menu'
import { EditableGrid } from './components/editable-grid'
import { Field } from './components/field'
import { FileTree } from './components/file-tree'
import { FileUpload } from './components/file-upload'
import { Form } from './components/form'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './components/hover-card'
import { Image } from './components/image'
import { InfiniteScroll } from './components/infinite-scroll'
import { Input } from './components/input'
import { KanbanBoard } from './components/kanban-board'
import { Listbox } from './components/listbox'
import { MapEmbed } from './components/map-embed'
import { Modal } from './components/modal'
import { Navbar } from './components/navbar'
import { Newsletter } from './components/newsletter'
import { NumberInput } from './components/number-input'
import { OTPInput } from './components/otp-input'
import { Pagination } from './components/pagination'
import { PasswordInput } from './components/password-input'
import { Popover, PopoverContent, PopoverTrigger } from './components/popover'
import { Portal } from './components/portal'
import { Rating } from './components/rating'
import { RelativeTime } from './components/relative-time'
import { Scheduler } from './components/scheduler'
import { Segmented } from './components/segmented'
import { Sidebar } from './components/sidebar'
import { Slider } from './components/slider'
import { Stepper } from './components/stepper'
import { Table } from './components/table'
import { Tabs } from './components/tabs'
import { TagInput } from './components/tag-input'
import { ThemeProvider } from './components/theme-provider'
import { ThemeToggle } from './components/theme-toggle'
import { TimePicker } from './components/time-picker'
import { ToastProvider } from './components/toast'
import { Tooltip } from './components/tooltip'
import { VideoPlayer } from './components/video-player'
import { VirtualList } from './components/virtual-list'

afterEach(() => {
  document.body.innerHTML = ''
})

/** Server-render, then hydrate the same element into that HTML. Fails on any mismatch. */
function expectHydrationClean(element: ReactElement): void {
  const html = renderToString(element)
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)

  const recovered: unknown[] = []
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  let root: ReturnType<typeof hydrateRoot> | undefined
  act(() => {
    root = hydrateRoot(host, element, { onRecoverableError: (error) => recovered.push(error) })
  })
  const logged = consoleError.mock.calls.map((call) => String(call[0]))
  consoleError.mockRestore()
  act(() => {
    root?.unmount()
  })
  host.remove()

  expect(recovered, 'React recovered from a hydration mismatch').toEqual([])
  expect(
    logged.filter((message) => /hydrat/i.test(message)),
    'hydration warning',
  ).toEqual([])
}

const at = (h: number) => new Date(2026, 0, 15, h)
const fixed = new Date(2026, 0, 15)

/**
 * One entry per client component. Overlays render CLOSED: an open dialog portals into
 * document.body on the client and renders nothing on the server, so its open state is not
 * a hydration question — the trigger and the shell are.
 */
const SWEEP: Record<string, () => ReactElement> = {
  accordion: () => (
    <Accordion type="single">
      <Accordion.Item value="a">
        <Accordion.Trigger>A</Accordion.Trigger>
        <Accordion.Content>a</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
  'animated-counter': () => <AnimatedCounter value={100} />,
  calendar: () => <Calendar defaultValue={fixed} />,
  carousel: () => (
    <Carousel>
      <div>a</div>
      <div>b</div>
    </Carousel>
  ),
  'chat-code-block': () => <ChatCodeBlock code="const x = 1" language="ts" />,
  'chat-input': () => <ChatInput />,
  'chat-message': () => (
    // biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` is the speaker (user | assistant), a component prop that is not an ARIA role.
    <ChatMessage content="hello" role="assistant" />
  ),
  'chat-thread': () => <ChatThread />,
  chip: () => <Chip>tag</Chip>,
  clock: () => <Clock />,
  combobox: () => <Combobox aria-label="Fruit" options={[{ value: 'a', label: 'Apple' }]} />,
  listbox: () => <Listbox label="Fruit" options={[{ value: 'a', label: 'Apple' }]} />,
  'video-player': () => <VideoPlayer src="/v.mp4" poster="/p.jpg" />,
  'audio-player': () => <AudioPlayer src="/a.mp3" title="Track" />,
  'command-palette': () => <CommandPalette items={[{ id: 'x', label: 'Open' }]} />,
  'context-menu': () => (
    <ContextMenu>
      <ContextMenu.Trigger>surface</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>one</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  ),
  'copy-button': () => <CopyButton value="x" />,
  countdown: () => <Countdown to={new Date(2027, 0, 1)} />,
  'data-table': () => (
    <DataTable columns={[{ key: 'a', header: 'A' }]} data={[{ id: 1, a: 'x' }]} rowKey="id" />
  ),
  'date-picker': () => <DatePicker aria-label="Date" defaultValue={fixed} />,
  'date-range-picker': () => <DateRangePicker defaultValue={{ start: fixed, end: fixed }} />,
  drawer: () => (
    <Drawer open={false} title="Menu">
      <Drawer.Body>x</Drawer.Body>
    </Drawer>
  ),
  'dropdown-menu': () => (
    <DropdownMenu>
      <DropdownMenu.Trigger>menu</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>one</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  'editable-grid': () => (
    <EditableGrid columns={[{ key: 'a', header: 'A' }]} data={[{ a: 1 }]} label="grid" />
  ),
  field: () => (
    <Field label="Name">
      <Input />
    </Field>
  ),
  'file-tree': () => <FileTree label="tree" nodes={[{ id: 'x', label: 'x' }]} />,
  'file-upload': () => <FileUpload />,
  form: () => (
    <Form onSubmit={() => {}}>
      <Input aria-label="n" name="n" />
    </Form>
  ),
  'hover-card': () => (
    <HoverCard>
      <HoverCardTrigger href="#u">@user</HoverCardTrigger>
      <HoverCardContent>card</HoverCardContent>
    </HoverCard>
  ),
  image: () => <Image alt="A landscape" ratio={16 / 9} src="/x.jpg" />,
  'infinite-scroll': () => (
    <InfiniteScroll hasMore onLoadMore={() => {}}>
      <p>rows</p>
    </InfiniteScroll>
  ),
  'kanban-board': () => (
    <KanbanBoard columns={[{ id: 'c', title: 'C', cards: [] }]} label="board" />
  ),
  'map-embed': () => <MapEmbed query="Bengaluru" title="Our office" />,
  modal: () => (
    <Modal open={false} title="Delete?">
      <Modal.Body>x</Modal.Body>
    </Modal>
  ),
  navbar: () => (
    <Navbar>
      <Navbar.Brand href="/">Brand</Navbar.Brand>
      <Navbar.Links>
        <Navbar.Link href="/a">A</Navbar.Link>
      </Navbar.Links>
      <Navbar.Toggle />
    </Navbar>
  ),
  newsletter: () => <Newsletter />,
  'number-input': () => <NumberInput aria-label="n" defaultValue={1} />,
  'otp-input': () => <OTPInput aria-label="Verification code" />,
  pagination: () => <Pagination pageCount={5} />,
  'password-input': () => <PasswordInput aria-label="Password" />,
  popover: () => (
    <Popover>
      <PopoverTrigger>open</PopoverTrigger>
      <PopoverContent>content</PopoverContent>
    </Popover>
  ),
  portal: () => (
    <Portal>
      <span>portalled</span>
    </Portal>
  ),
  rating: () => <Rating />,
  'relative-time': () => <RelativeTime date={fixed} />,
  scheduler: () => (
    <Scheduler
      events={[{ id: 'e', resourceId: 'r', title: 'E', start: at(9), end: at(10) }]}
      label="times"
      resources={[{ id: 'r', label: 'R' }]}
    />
  ),
  segmented: () => (
    <Segmented
      defaultValue="a"
      label="View"
      options={[
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
      ]}
    />
  ),
  sidebar: () => <Sidebar />,
  slider: () => <Slider aria-label="Volume" />,
  stepper: () => <Stepper activeStep={1} steps={[{ label: 'One' }, { label: 'Two' }]} />,
  table: () => (
    <Table>
      <tbody>
        <tr>
          <td>x</td>
        </tr>
      </tbody>
    </Table>
  ),
  tabs: () => (
    <Tabs defaultValue="a">
      <Tabs.List aria-label="Sections">
        <Tabs.Tab value="a">A</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel value="a">a</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  ),
  'tag-input': () => <TagInput aria-label="Tags" />,
  'theme-provider': () => (
    <ThemeProvider>
      <span>themed</span>
    </ThemeProvider>
  ),
  'theme-toggle': () => <ThemeToggle />,
  'time-picker': () => <TimePicker aria-label="Start" defaultValue="09:30" />,
  toast: () => (
    <ToastProvider>
      <span>app</span>
    </ToastProvider>
  ),
  tooltip: () => (
    <Tooltip content="hint">
      <button type="button">t</button>
    </Tooltip>
  ),
  'virtual-list': () => (
    <VirtualList itemHeight={24} items={['a', 'b']} label="rows" style={{ height: 100 }}>
      {(item: string) => <span>{item}</span>}
    </VirtualList>
  ),
}

describe('every client component hydrates its own server markup cleanly', () => {
  for (const [slug, make] of Object.entries(SWEEP)) {
    it(slug, () => {
      expectHydrationClean(make())
    })
  }
})

describe('the sweep covers every component that declares use client', () => {
  it('lists every client component directory', () => {
    const componentsDir = join(__dirname, 'components')
    // Internal parts rendered only through a public parent, so they are covered by it.
    const internal = new Set(['internal', 'carousel-controls'])
    const missing: string[] = []
    for (const dir of readdirSync(componentsDir, { withFileTypes: true })) {
      if (!dir.isDirectory() || internal.has(dir.name)) continue
      let source = ''
      try {
        source = readFileSync(join(componentsDir, dir.name, `${dir.name}.tsx`), 'utf8')
      } catch {
        continue
      }
      const isClient = /^'use client'/m.test(source)
      if (isClient && !(dir.name in SWEEP)) missing.push(dir.name)
    }
    expect(
      missing,
      'declares use client but is missing from the hydration sweep — add an entry',
    ).toEqual([])
  })
})
