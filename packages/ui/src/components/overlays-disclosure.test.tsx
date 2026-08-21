import { fireEvent, render, screen } from '@testing-library/react'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Accordion } from './accordion'
import { Tabs, type TabsActivationMode, type TabsOrientation } from './tabs'

/** Indexing without a non-null assertion, and with a useful failure message. */
function at<T>(list: readonly T[], index: number): T {
  const found = list[index]
  if (found === undefined) throw new Error(`nothing at index ${index}`)
  return found
}

const tabs = () => screen.getAllByRole('tab')
const tabAt = (index: number) => at(tabs(), index)

interface TabsFixtureProps {
  orientation?: TabsOrientation
  activationMode?: TabsActivationMode
  loop?: boolean
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  /** Values rendered with the native `disabled` attribute. */
  disabled?: string[]
  /** Values rendered with `aria-disabled` — focusable, but not selectable. */
  softDisabled?: string[]
}

const TAB_VALUES = ['account', 'billing', 'team', 'limits'] as const

function TabsFixture({ disabled = [], softDisabled = [], ...props }: TabsFixtureProps) {
  return (
    <Tabs {...props}>
      <Tabs.List aria-label="Settings">
        {TAB_VALUES.map((value) => (
          <Tabs.Tab
            key={value}
            value={value}
            disabled={disabled.includes(value) || undefined}
            aria-disabled={softDisabled.includes(value) || undefined}
          >
            {value}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Tabs.Panels>
        {TAB_VALUES.map((value) => (
          <Tabs.Panel key={value} value={value}>
            {`${value} panel`}
          </Tabs.Panel>
        ))}
      </Tabs.Panels>
    </Tabs>
  )
}

describe('Tabs · ARIA contract', () => {
  it('builds the tablist / tab / tabpanel structure the APG describes', () => {
    render(<TabsFixture defaultValue="billing" />)

    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('aria-orientation', 'horizontal')
    expect(tabs()).toHaveLength(4)

    // aria-selected is on every tab, true on exactly one.
    expect(tabs().map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
      'false',
    ])

    // Only the selected panel is exposed at all, and it is wired both ways.
    const panel = screen.getByRole('tabpanel')
    const selected = tabAt(1)
    expect(panel).toHaveAttribute('id', selected.getAttribute('aria-controls'))
    expect(panel).toHaveAttribute('aria-labelledby', selected.getAttribute('id'))
    expect(panel).toHaveTextContent('billing panel')
    expect(panel).toHaveAttribute('tabindex', '0')
  })

  it('gives every tab an aria-controls that resolves to a real element', () => {
    const { container } = render(<TabsFixture defaultValue="account" />)

    for (const tab of tabs()) {
      const id = tab.getAttribute('aria-controls')
      expect(id).toBeTruthy()
      // Panels stay mounted precisely so this never dangles.
      expect(container.querySelector(`#${id}`)).not.toBeNull()
    }
  })

  it('keeps exactly one tab in the tab order, and it is the selected one', () => {
    render(<TabsFixture defaultValue="team" />)

    expect(tabs().map((tab) => tab.getAttribute('tabindex'))).toEqual(['-1', '-1', '0', '-1'])
  })

  it('falls back to the first tab when nothing is selected, so the widget stays reachable', () => {
    render(<TabsFixture />)

    expect(tabs().map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1'])
    expect(screen.queryByRole('tabpanel')).toBeNull()
  })

  it('moves the tab stop off a disabled selected tab', () => {
    render(<TabsFixture defaultValue="account" disabled={['account']} />)

    // The selection is still `account` — only the keyboard entry point moves, otherwise
    // the whole tablist would drop out of the tab order.
    expect(tabAt(0)).toHaveAttribute('aria-selected', 'true')
    expect(tabs().map((tab) => tab.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1'])
  })

  it('truly hides inactive panels instead of only visually hiding them', () => {
    const { container } = render(<TabsFixture defaultValue="account" />)

    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    // The accessibility tree, not the DOM: `hidden` is what keeps the other three out
    // of it (queryByText would still find them, which is the whole point of asserting
    // by role here).
    expect(screen.queryByRole('tabpanel', { name: 'team' })).toBeNull()
    const all = Array.from(container.querySelectorAll('[role="tabpanel"]'))
    expect(all).toHaveLength(4)
    expect(all.filter((panel) => panel.hasAttribute('hidden'))).toHaveLength(3)
  })

  it('renders tabs as real buttons, which is what makes Enter and Space work', () => {
    // jsdom does not implement a button's keyboard activation behaviour: no synthetic
    // Enter/Space here turns into a click. The assertion that carries the weight is
    // therefore structural — a native `<button>`, whose activation the browser maps to
    // click, which is the only path Tabs uses to select.
    render(<TabsFixture defaultValue="account" activationMode="manual" />)

    for (const tab of tabs()) {
      expect(tab.tagName).toBe('BUTTON')
      expect(tab).toHaveAttribute('type', 'button')
    }
  })
})

describe('Tabs · selection', () => {
  it('works uncontrolled from defaultValue', () => {
    const onValueChange = vi.fn()
    render(<TabsFixture defaultValue="account" onValueChange={onValueChange} />)

    fireEvent.click(tabAt(2))

    expect(tabAt(2)).toHaveAttribute('aria-selected', 'true')
    expect(tabAt(0)).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('team panel')
    expect(onValueChange).toHaveBeenCalledWith('team')
  })

  it('lets a controlled value win and only reports the request', () => {
    const onValueChange = vi.fn()
    render(<TabsFixture value="account" onValueChange={onValueChange} />)

    fireEvent.click(tabAt(1))

    expect(onValueChange).toHaveBeenCalledWith('billing')
    // The parent ignored it, so nothing moved.
    expect(tabAt(0)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('account panel')
  })

  it('follows a controlled parent that honours onValueChange', () => {
    function Controlled() {
      const [value, setValue] = useState('account')
      return <TabsFixture value={value} onValueChange={setValue} />
    }
    render(<Controlled />)

    fireEvent.click(tabAt(3))

    expect(tabAt(3)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('limits panel')
  })

  it('does not select a disabled tab', () => {
    const onValueChange = vi.fn()
    render(
      <TabsFixture defaultValue="account" disabled={['billing']} onValueChange={onValueChange} />,
    )

    fireEvent.click(tabAt(1))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(tabAt(0)).toHaveAttribute('aria-selected', 'true')
  })

  it('does not select an aria-disabled tab either', () => {
    const onValueChange = vi.fn()
    render(
      <TabsFixture
        defaultValue="account"
        softDisabled={['billing']}
        onValueChange={onValueChange}
      />,
    )

    fireEvent.click(tabAt(1))

    expect(onValueChange).not.toHaveBeenCalled()
    expect(tabAt(0)).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Tabs · keyboard, horizontal', () => {
  it('moves with ArrowRight and ArrowLeft', () => {
    render(<TabsFixture defaultValue="account" activationMode="manual" />)
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowRight' })
    expect(tabAt(1)).toHaveFocus()

    fireEvent.keyDown(tabAt(1), { key: 'ArrowRight' })
    expect(tabAt(2)).toHaveFocus()

    fireEvent.keyDown(tabAt(2), { key: 'ArrowLeft' })
    expect(tabAt(1)).toHaveFocus()
  })

  it('jumps to the ends with Home and End', () => {
    render(<TabsFixture defaultValue="account" activationMode="manual" />)
    tabAt(1).focus()

    fireEvent.keyDown(tabAt(1), { key: 'End' })
    expect(tabAt(3)).toHaveFocus()

    fireEvent.keyDown(tabAt(3), { key: 'Home' })
    expect(tabAt(0)).toHaveFocus()
  })

  it('wraps past the ends by default, and stops when loop is false', () => {
    const { unmount } = render(<TabsFixture defaultValue="account" activationMode="manual" />)
    tabAt(3).focus()
    fireEvent.keyDown(tabAt(3), { key: 'ArrowRight' })
    expect(tabAt(0)).toHaveFocus()
    unmount()

    render(<TabsFixture defaultValue="account" activationMode="manual" loop={false} />)
    tabAt(3).focus()
    fireEvent.keyDown(tabAt(3), { key: 'ArrowRight' })
    expect(tabAt(3)).toHaveFocus()
    tabAt(0).focus()
    fireEvent.keyDown(tabAt(0), { key: 'ArrowLeft' })
    expect(tabAt(0)).toHaveFocus()
  })

  it('ignores the cross-axis arrows', () => {
    render(<TabsFixture defaultValue="account" activationMode="manual" />)
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowDown' })
    expect(tabAt(0)).toHaveFocus()
    fireEvent.keyDown(tabAt(0), { key: 'ArrowUp' })
    expect(tabAt(0)).toHaveFocus()
  })

  it('skips disabled tabs, including with Home and End', () => {
    render(
      <TabsFixture
        defaultValue="billing"
        activationMode="manual"
        disabled={['team']}
        softDisabled={['account']}
      />,
    )
    tabAt(1).focus()

    // `team` (native disabled) is skipped …
    fireEvent.keyDown(tabAt(1), { key: 'ArrowRight' })
    expect(tabAt(3)).toHaveFocus()

    // … and so is `account` (aria-disabled), which Home would otherwise land on.
    fireEvent.keyDown(tabAt(3), { key: 'Home' })
    expect(tabAt(1)).toHaveFocus()

    fireEvent.keyDown(tabAt(1), { key: 'End' })
    expect(tabAt(3)).toHaveFocus()
  })
})

describe('Tabs · keyboard, vertical', () => {
  it('advertises its orientation', () => {
    render(<TabsFixture orientation="vertical" defaultValue="account" />)
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('moves with ArrowDown and ArrowUp, and jumps with Home and End', () => {
    render(<TabsFixture orientation="vertical" defaultValue="account" activationMode="manual" />)
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowDown' })
    expect(tabAt(1)).toHaveFocus()

    fireEvent.keyDown(tabAt(1), { key: 'ArrowUp' })
    expect(tabAt(0)).toHaveFocus()

    fireEvent.keyDown(tabAt(0), { key: 'End' })
    expect(tabAt(3)).toHaveFocus()

    fireEvent.keyDown(tabAt(3), { key: 'Home' })
    expect(tabAt(0)).toHaveFocus()
  })

  it('ignores the cross-axis arrows', () => {
    render(<TabsFixture orientation="vertical" defaultValue="account" activationMode="manual" />)
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowRight' })
    expect(tabAt(0)).toHaveFocus()
    fireEvent.keyDown(tabAt(0), { key: 'ArrowLeft' })
    expect(tabAt(0)).toHaveFocus()
  })

  it('wraps past the ends', () => {
    render(<TabsFixture orientation="vertical" defaultValue="account" activationMode="manual" />)
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowUp' })
    expect(tabAt(3)).toHaveFocus()
  })
})

describe('Tabs · activationMode', () => {
  it('automatic: arrowing to a tab selects it', () => {
    const onValueChange = vi.fn()
    render(<TabsFixture defaultValue="account" onValueChange={onValueChange} />)
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowRight' })

    expect(tabAt(1)).toHaveFocus()
    expect(tabAt(1)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('billing panel')
    expect(onValueChange).toHaveBeenCalledWith('billing')
  })

  it('manual: arrowing moves focus only, and a click (or Enter/Space) commits', () => {
    const onValueChange = vi.fn()
    render(
      <TabsFixture defaultValue="account" activationMode="manual" onValueChange={onValueChange} />,
    )
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowRight' })

    expect(tabAt(1)).toHaveFocus()
    expect(tabAt(1)).toHaveAttribute('aria-selected', 'false')
    expect(tabAt(0)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('account panel')
    expect(onValueChange).not.toHaveBeenCalled()

    // The browser turns Enter/Space on a focused button into this click.
    fireEvent.click(tabAt(1))
    expect(tabAt(1)).toHaveAttribute('aria-selected', 'true')
    expect(onValueChange).toHaveBeenCalledWith('billing')
  })

  it('automatic: does not re-report when focus returns to the already-selected tab', () => {
    const onValueChange = vi.fn()
    render(<TabsFixture defaultValue="account" onValueChange={onValueChange} />)

    tabAt(0).focus()
    fireEvent.focus(tabAt(0))

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('automatic: arrow navigation skips a disabled tab and selects the next usable one', () => {
    render(<TabsFixture defaultValue="account" disabled={['billing']} />)
    tabAt(0).focus()

    fireEvent.keyDown(tabAt(0), { key: 'ArrowRight' })

    expect(tabAt(2)).toHaveFocus()
    expect(tabAt(2)).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Tabs · component contract', () => {
  it('merges className, spreads rest and forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    const listRef = createRef<HTMLDivElement>()
    render(
      <Tabs ref={ref} defaultValue="a" className="mine" data-testid="root">
        <Tabs.List ref={listRef} className="list" aria-label="x">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel value="a">A panel</Tabs.Panel>
        </Tabs.Panels>
      </Tabs>,
    )

    const root = screen.getByTestId('root')
    expect(root).toHaveClass('vk-tabs', 'mine')
    expect(ref.current).toBe(root)
    // The forwarded list ref must still arrive even though the list keeps its own
    // internal ref for DOM-based arrow navigation.
    expect(listRef.current).toBe(screen.getByRole('tablist'))
    expect(screen.getByRole('tablist')).toHaveClass('vk-tabs__list', 'list')
  })

  it('renders variants, sizes and orientation as data-attributes', () => {
    render(
      <Tabs defaultValue="a" variant="pill" size="lg" orientation="vertical" data-testid="root">
        <Tabs.List aria-label="x">
          <Tabs.Tab value="a">A</Tabs.Tab>
        </Tabs.List>
      </Tabs>,
    )

    const root = screen.getByTestId('root')
    expect(root).toHaveAttribute('data-variant', 'pill')
    expect(root).toHaveAttribute('data-size', 'lg')
    expect(root).toHaveAttribute('data-orientation', 'vertical')
    expect(tabAt(0)).toHaveAttribute('data-variant', 'pill')
    expect(tabAt(0)).toHaveAttribute('data-state', 'active')
  })

  it('throws a useful error when a part is used outside its root', () => {
    // React logs the error as well; that noise is expected here.
    expect(() => render(<Tabs.Tab value="a">A</Tabs.Tab>)).toThrow(/inside <Tabs>/)
  })

  it('renders on the server', () => {
    // No window/document at module scope or during render. The tab-stop
    // healing lives in an effect, so a server render simply reflects the selection.
    const html = renderToString(<TabsFixture defaultValue="billing" />)
    expect(html).toContain('role="tablist"')
    expect(html).toContain('aria-selected="true"')
    expect(html).toContain('role="tabpanel"')
  })

  it('has no axe violations', async () => {
    const { container } = render(<TabsFixture defaultValue="billing" disabled={['team']} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when vertical', async () => {
    const { container } = render(<TabsFixture orientation="vertical" defaultValue="account" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

const ACCORDION_ITEMS = ['shipping', 'returns', 'sizing'] as const

interface AccordionFixtureProps {
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  disabled?: string[]
}

function SingleAccordion({
  headingLevel,
  disabled = [],
  ...props
}: AccordionFixtureProps & {
  defaultValue?: string | null
  value?: string | null
  onValueChange?: (value: string | null) => void
  collapsible?: boolean
}) {
  return (
    <Accordion headingLevel={headingLevel} {...props}>
      {ACCORDION_ITEMS.map((value) => (
        <Accordion.Item key={value} value={value} disabled={disabled.includes(value) || undefined}>
          <Accordion.Trigger>{value}</Accordion.Trigger>
          <Accordion.Content>{`${value} answer`}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

function MultipleAccordion(props: {
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  defaultValue?: string[]
  value?: string[]
  onValueChange?: (value: string[]) => void
}) {
  return (
    <Accordion type="multiple" {...props}>
      {ACCORDION_ITEMS.map((value) => (
        <Accordion.Item key={value} value={value}>
          <Accordion.Trigger>{value}</Accordion.Trigger>
          <Accordion.Content>{`${value} answer`}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

const triggers = () => screen.getAllByRole('button')
const triggerAt = (index: number) => at(triggers(), index)

describe('Accordion · ARIA contract', () => {
  it('puts a real button inside a heading, wired to a labelled region', () => {
    render(<SingleAccordion defaultValue="returns" />)

    const trigger = screen.getByRole('button', { name: 'returns' })
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).toHaveAttribute('type', 'button')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // The button is the heading's content, so it shows up in a heading list.
    const heading = screen.getByRole('heading', { name: 'returns' })
    expect(heading.tagName).toBe('H3')
    expect(heading).toContainElement(trigger)

    const region = screen.getByRole('region', { name: 'returns' })
    expect(region).toHaveAttribute('id', trigger.getAttribute('aria-controls'))
    expect(region).toHaveAttribute('aria-labelledby', trigger.getAttribute('id'))
    expect(region).toHaveTextContent('returns answer')
  })

  it('gives every trigger an aria-controls that resolves, open or closed', () => {
    const { container } = render(<SingleAccordion defaultValue="returns" />)

    for (const trigger of triggers()) {
      const id = trigger.getAttribute('aria-controls')
      expect(id).toBeTruthy()
      expect(container.querySelector(`#${id}`)).not.toBeNull()
    }
  })

  it('truly hides closed content', () => {
    const { container } = render(<SingleAccordion defaultValue="shipping" />)

    expect(screen.getAllByRole('region')).toHaveLength(1)
    // Asserted through the accessibility tree: `hidden` is what removes it, and a
    // text query would still find content that is merely invisible.
    expect(screen.queryByRole('region', { name: 'sizing' })).toBeNull()
    const all = Array.from(container.querySelectorAll('[role="region"]'))
    expect(all).toHaveLength(3)
    expect(all.filter((region) => region.hasAttribute('hidden'))).toHaveLength(2)
  })

  it('respects headingLevel instead of hardcoding h3', () => {
    render(<SingleAccordion headingLevel={2} defaultValue="shipping" />)

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
  })

  it('lets a single item override the accordion heading level', () => {
    render(
      <Accordion headingLevel={2}>
        <Accordion.Item value="a">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b" headingLevel={4}>
          <Accordion.Trigger>B</Accordion.Trigger>
          <Accordion.Content>b</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    expect(screen.getByRole('heading', { name: 'A' }).tagName).toBe('H2')
    expect(screen.getByRole('heading', { name: 'B' }).tagName).toBe('H4')
  })

  it('relies on native button activation for Enter and Space', () => {
    // jsdom never turns a keydown into a click, so Enter/Space cannot be exercised here.
    // What is assertable is that nothing custom sits in the way: the trigger is a native
    // button with no key handler of its own, which is exactly why Enter/Space work.
    render(<SingleAccordion defaultValue="shipping" />)
    const trigger = triggerAt(1)

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Accordion · single', () => {
  it('opens one item at a time, uncontrolled', () => {
    const onValueChange = vi.fn()
    render(<SingleAccordion defaultValue="shipping" onValueChange={onValueChange} />)

    fireEvent.click(triggerAt(1))

    expect(triggerAt(0)).toHaveAttribute('aria-expanded', 'false')
    expect(triggerAt(1)).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(onValueChange).toHaveBeenLastCalledWith('returns')
  })

  it('keeps the open item open when collapsible is false', () => {
    const onValueChange = vi.fn()
    render(<SingleAccordion defaultValue="shipping" onValueChange={onValueChange} />)

    fireEvent.click(triggerAt(0))

    expect(triggerAt(0)).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: 'shipping' })).toBeInTheDocument()
    // No change happened, so nothing is reported.
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('closes the open item when collapsible is true, reporting null', () => {
    const onValueChange = vi.fn()
    render(<SingleAccordion defaultValue="shipping" collapsible onValueChange={onValueChange} />)

    fireEvent.click(triggerAt(0))

    expect(triggerAt(0)).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region')).toBeNull()
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it('starts fully closed with no defaultValue', () => {
    render(<SingleAccordion />)

    expect(screen.queryByRole('region')).toBeNull()
    for (const trigger of triggers()) {
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    }
  })

  it('lets a controlled value win and only reports the request', () => {
    const onValueChange = vi.fn()
    render(<SingleAccordion value="shipping" onValueChange={onValueChange} />)

    fireEvent.click(triggerAt(2))

    expect(onValueChange).toHaveBeenCalledWith('sizing')
    expect(triggerAt(0)).toHaveAttribute('aria-expanded', 'true')
    expect(triggerAt(2)).toHaveAttribute('aria-expanded', 'false')
  })

  it('follows a controlled parent that honours onValueChange', () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('shipping')
      return <SingleAccordion value={value} onValueChange={setValue} collapsible />
    }
    render(<Controlled />)

    fireEvent.click(triggerAt(2))
    expect(triggerAt(2)).toHaveAttribute('aria-expanded', 'true')
    expect(triggerAt(0)).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(triggerAt(2))
    expect(triggerAt(2)).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('does not toggle a disabled item', () => {
    const onValueChange = vi.fn()
    render(<SingleAccordion disabled={['returns']} onValueChange={onValueChange} />)

    expect(triggerAt(1)).toBeDisabled()
    fireEvent.click(triggerAt(1))

    expect(triggerAt(1)).toHaveAttribute('aria-expanded', 'false')
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Accordion · multiple', () => {
  it('opens any number of items, uncontrolled', () => {
    const onValueChange = vi.fn()
    render(<MultipleAccordion defaultValue={['shipping']} onValueChange={onValueChange} />)

    fireEvent.click(triggerAt(2))

    expect(screen.getAllByRole('region')).toHaveLength(2)
    expect(triggerAt(0)).toHaveAttribute('aria-expanded', 'true')
    expect(triggerAt(2)).toHaveAttribute('aria-expanded', 'true')
    expect(onValueChange).toHaveBeenLastCalledWith(['shipping', 'sizing'])
  })

  it('closes an open item without needing collapsible', () => {
    const onValueChange = vi.fn()
    render(
      <MultipleAccordion defaultValue={['shipping', 'sizing']} onValueChange={onValueChange} />,
    )

    fireEvent.click(triggerAt(0))

    expect(triggerAt(0)).toHaveAttribute('aria-expanded', 'false')
    expect(onValueChange).toHaveBeenLastCalledWith(['sizing'])
  })

  it('follows a controlled parent', () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>([])
      return <MultipleAccordion value={value} onValueChange={setValue} />
    }
    render(<Controlled />)

    fireEvent.click(triggerAt(0))
    fireEvent.click(triggerAt(1))
    expect(screen.getAllByRole('region')).toHaveLength(2)

    fireEvent.click(triggerAt(0))
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'returns' })).toBeInTheDocument()
  })
})

describe('Accordion · component contract', () => {
  it('merges className, spreads rest and forwards refs', () => {
    const ref = createRef<HTMLDivElement>()
    const triggerRef = createRef<HTMLButtonElement>()
    render(
      <Accordion ref={ref} className="mine" data-testid="root" defaultValue="a">
        <Accordion.Item value="a" className="item">
          <Accordion.Trigger ref={triggerRef} className="trigger">
            A
          </Accordion.Trigger>
          <Accordion.Content className="content">a</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    const root = screen.getByTestId('root')
    expect(root).toHaveClass('vk-accordion', 'mine')
    expect(ref.current).toBe(root)
    // The ref lands on the button, not the heading wrapper: the button is the thing you
    // focus, scroll into view or measure.
    expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'A' }))
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass(
      'vk-accordion__trigger',
      'trigger',
    )
    expect(screen.getByRole('region')).toHaveClass('vk-accordion__content', 'content')
  })

  it('exposes variant, size and state as data-attributes', () => {
    render(
      <Accordion variant="contained" size="sm" defaultValue="a" data-testid="root">
        <Accordion.Item value="a" data-testid="item">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    const root = screen.getByTestId('root')
    expect(root).toHaveAttribute('data-variant', 'contained')
    expect(root).toHaveAttribute('data-size', 'sm')
    expect(root).toHaveAttribute('data-type', 'single')
    expect(screen.getByTestId('item')).toHaveAttribute('data-state', 'open')
    expect(screen.getByRole('region')).toHaveAttribute('data-state', 'open')
  })

  it('throws a useful error when a part is used outside its root', () => {
    expect(() => render(<Accordion.Trigger>A</Accordion.Trigger>)).toThrow(/inside <Accordion>/)
    expect(() =>
      render(
        <Accordion>
          <Accordion.Content>a</Accordion.Content>
        </Accordion>,
      ),
    ).toThrow(/inside <Accordion.Item>/)
  })

  it('renders on the server', () => {
    const html = renderToString(<SingleAccordion headingLevel={2} defaultValue="returns" />)
    expect(html).toContain('<h2')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('role="region"')
  })

  it('has no axe violations, single', async () => {
    const { container } = render(
      <div>
        <h1>Help</h1>
        <SingleAccordion headingLevel={2} defaultValue="shipping" disabled={['sizing']} />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations, multiple', async () => {
    const { container } = render(
      <div>
        <h1>Help</h1>
        <MultipleAccordion headingLevel={2} defaultValue={['shipping', 'returns']} />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
