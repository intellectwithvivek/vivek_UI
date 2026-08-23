import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Avatar } from './avatar'
import { ChatCodeBlock } from './chat-code-block'
import { ChatInput } from './chat-input'
import { ChatMessage } from './chat-message'
import { ChatThread, type ChatThreadMessage } from './chat-thread'
import { Prose } from './prose'
import { TypingIndicator } from './typing-indicator'

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

/** The scroll container is the thread root; the log is its child. */
function scrollerOf(): HTMLElement {
  const log = screen.getByRole('log')
  const root = log.parentElement
  if (!root) throw new Error('thread root missing')
  return root
}

/**
 * jsdom does no layout: scrollHeight/clientHeight are always 0 and scrollTop is inert.
 * Shadowing them with own properties is the only way to express "there is 1000px of
 * transcript in a 400px window" and then observe what the component does about it.
 */
function fakeScrollMetrics(el: HTMLElement, initialTop: number) {
  let top = initialTop
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 1000 })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: 400 })
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => top,
    set: (next: number) => {
      top = next
    },
  })
  return {
    get top() {
      return top
    },
    set(next: number) {
      top = next
    },
  }
}

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
}

const MESSAGES: ChatThreadMessage[] = [
  { id: '1', role: 'user', content: 'What is a container query?' },
  { id: '2', role: 'assistant', content: 'A query against an ancestor element size.' },
]

afterEach(() => {
  vi.restoreAllMocks()
})

/* ------------------------------------------------------------------ *
 * ChatMessage
 * ------------------------------------------------------------------ */

describe('ChatMessage', () => {
  it('renders with zero props', () => {
    const { container } = render(<ChatMessage />)
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('data-role', 'assistant')
    expect(article).toHaveAttribute('data-variant', 'bubble')
    expect(article).toHaveAttribute('data-status', 'sent')
    expect(container.querySelector('.vk-chat-message')).toBe(article)
  })

  it('exposes the speaker in the accessible name for every role', () => {
    render(
      <>
        {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
        <ChatMessage role="user" content="hi" />
        {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
        <ChatMessage role="assistant" content="hello" />
        {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
        <ChatMessage role="system" content="model switched" />
      </>,
    )
    // "Who said this" is the first thing a screen-reader user loses in a transcript.
    expect(screen.getByRole('article', { name: 'You' })).toHaveTextContent('hi')
    expect(screen.getByRole('article', { name: 'Assistant' })).toHaveTextContent('hello')
    expect(screen.getByRole('article', { name: 'System' })).toHaveTextContent('model switched')
  })

  it('prefers an explicit name over the role label', () => {
    // biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role.
    render(<ChatMessage role="assistant" name="Claude" content="hi" />)
    expect(screen.getByRole('article', { name: 'Claude' })).toBeInTheDocument()
  })

  it('folds a non-sent status into the accessible name and hides the duplicate text', () => {
    // biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role.
    render(<ChatMessage role="user" status="error" content="oops" />)
    const article = screen.getByRole('article', { name: 'You, Not sent' })
    expect(article).toHaveAttribute('data-status', 'error')
    // Announced once, via the name - not a second time as content.
    expect(screen.getByText('Not sent')).toHaveAttribute('aria-hidden', 'true')
  })

  it('announces a sending message as such', () => {
    // biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role.
    render(<ChatMessage role="user" status="sending" content="wait" />)
    expect(screen.getByRole('article', { name: 'You, Sending' })).toBeInTheDocument()
  })

  it('localises the status labels', () => {
    render(
      // biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role.
      <ChatMessage
        role="user"
        status="error"
        content="x"
        statusLabels={{ error: 'Fehlgeschlagen' }}
      />,
    )
    expect(screen.getByRole('article', { name: 'You, Fehlgeschlagen' })).toBeInTheDocument()
  })

  it('renders a Date as a machine-readable time element', () => {
    const when = new Date('2026-08-21T09:30:00.000Z')
    const { container } = render(<ChatMessage content="x" timestamp={when} />)
    const time = container.querySelector('time')
    expect(time).toHaveAttribute('datetime', when.toISOString())
    expect(time?.textContent).toBeTruthy()
  })

  it('renders a string timestamp verbatim, with no datetime attribute', () => {
    // The string is the caller's own formatting; re-formatting it is exactly the
    // server/client drift the component avoids.
    const { container } = render(<ChatMessage content="x" timestamp="2 min ago" />)
    expect(screen.getByText('2 min ago')).toBeInTheDocument()
    expect(container.querySelector('time')).toBeNull()
  })

  it('ignores an unparseable timestamp instead of rendering Invalid Date', () => {
    const { container } = render(<ChatMessage content="x" timestamp={Number.NaN} />)
    expect(container.querySelector('.vk-chat-message__time')).toBeNull()
  })

  it('honours a custom timestamp formatter', () => {
    render(
      <ChatMessage
        content="x"
        timestamp={new Date('2026-08-21T09:30:00.000Z')}
        formatTimestamp={() => 'just now'}
      />,
    )
    expect(screen.getByText('just now')).toBeInTheDocument()
  })

  it('renders avatar, actions and children', () => {
    render(
      <ChatMessage
        avatar={<Avatar name="Vivek Singh" />}
        actions={<button type="button">Retry</button>}
      >
        body text
      </ChatMessage>,
    )
    expect(screen.getByRole('img', { name: 'Vivek Singh' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveTextContent('body text')
  })

  it('escapes content that looks like markup instead of parsing it', () => {
    // The trust boundary: model output is a ReactNode, so React escapes it. There is
    // no dangerouslySetInnerHTML anywhere in this family.
    const { container } = render(<ChatMessage content={'<img src=x onerror="alert(1)">'} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument()
  })

  it('is programmatically focusable without joining the tab order', () => {
    render(<ChatMessage content="x" />)
    expect(screen.getByRole('article')).toHaveAttribute('tabindex', '-1')
  })

  it('forwards its ref, merges className and spreads rest', () => {
    const ref = createRef<HTMLElement>()
    render(<ChatMessage ref={ref} className="mine" data-testid="msg" content="x" />)
    const article = screen.getByTestId('msg')
    expect(ref.current).toBe(article)
    expect(article.className).toBe('vk-chat-message mine')
  })

  it('renders on the server', () => {
    // Server-safe: no hooks, no effects, no event handlers.
    // biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role.
    const html = renderToString(<ChatMessage role="user" content="ssr" timestamp="now" />)
    expect(html).toContain('vk-chat-message')
    expect(html).toContain('ssr')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      // biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role.
      <ChatMessage
        role="assistant"
        name="Claude"
        avatar={<Avatar name="Claude" />}
        timestamp="09:30"
        content="hello"
        actions={<button type="button">Copy</button>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------------ *
 * ChatThread
 * ------------------------------------------------------------------ */

describe('ChatThread.Empty', () => {
  // Exported as `ChatThread.Empty` and as `ChatThreadEmpty`, so it is public API, but every
  // test reached the empty state through the `emptyState` prop - which meant the exported
  // part itself had never been rendered by anything.
  it('carries the empty-state styling, so a custom empty state matches the built-in one', () => {
    const { container } = render(
      <ChatThread
        label="Conversation"
        emptyState={<ChatThread.Empty>No messages yet</ChatThread.Empty>}
      />,
    )
    const empty = container.querySelectorAll('.vk-chat-thread__empty')
    expect(empty.length).toBeGreaterThan(0)
    expect(screen.getByText('No messages yet')).toBeInTheDocument()
  })

  it('merges className and spreads the rest onto its root, per the component contract', () => {
    render(
      <ChatThread
        label="Conversation"
        emptyState={
          <ChatThread.Empty className="mine" data-testid="empty">
            Nothing here
          </ChatThread.Empty>
        }
      />,
    )
    const node = screen.getByTestId('empty')
    expect(node).toHaveClass('vk-chat-thread__empty')
    expect(node).toHaveClass('mine')
  })

  it('forwards a ref to its root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <ChatThread
        label="Conversation"
        emptyState={<ChatThread.Empty ref={ref}>Nothing</ChatThread.Empty>}
      />,
    )
    expect(ref.current?.tagName).toBe('DIV')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ChatThread
        label="Conversation"
        emptyState={<ChatThread.Empty>Ask the assistant anything.</ChatThread.Empty>}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ChatThread', () => {
  it('renders an empty log with zero props', () => {
    render(<ChatThread />)
    expect(screen.getByRole('log')).toBeEmptyDOMElement()
  })

  it('marks the transcript as a polite, additions-only live region', () => {
    render(<ChatThread messages={MESSAGES} />)
    const log = screen.getByRole('log', { name: 'Conversation' })
    expect(log).toHaveAttribute('aria-live', 'polite')
    // additions-only: a new turn is announced on its own instead of the whole thread
    // being re-read from the top.
    expect(log).toHaveAttribute('aria-relevant', 'additions')
    expect(log).toHaveAttribute('aria-atomic', 'false')
  })

  it('accepts a custom log label', () => {
    render(<ChatThread label="Support chat" />)
    expect(screen.getByRole('log', { name: 'Support chat' })).toBeInTheDocument()
  })

  it('renders messages from data, each individually navigable', () => {
    render(<ChatThread messages={MESSAGES} />)
    const log = screen.getByRole('log')
    const turns = within(log).getAllByRole('article')
    expect(turns).toHaveLength(2)
    expect(turns[0]).toHaveAccessibleName('You')
    expect(turns[1]).toHaveAccessibleName('Assistant')
  })

  it('renders children when no messages array is given', () => {
    render(
      <ChatThread>
        {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
        <ChatThread.Message role="user" content="from children" />
      </ChatThread>,
    )
    expect(within(screen.getByRole('log')).getByRole('article')).toHaveTextContent('from children')
  })

  it('shows the empty state only while there is nothing to show', () => {
    const { rerender } = render(<ChatThread emptyState="Ask me anything" />)
    expect(screen.getByText('Ask me anything')).toBeInTheDocument()
    // Outside the log: otherwise it announces itself on first paint.
    expect(screen.getByRole('log').contains(screen.getByText('Ask me anything'))).toBe(false)
    rerender(<ChatThread emptyState="Ask me anything" messages={MESSAGES} />)
    expect(screen.queryByText('Ask me anything')).toBeNull()
  })

  it('puts the typing indicator outside the log live region', () => {
    render(<ChatThread messages={MESSAGES} loading />)
    const status = screen.getByRole('status')
    // Inside the log it would be an "addition" on every toggle, and a streaming reply
    // toggles it constantly - the classic screen-reader spam.
    expect(screen.getByRole('log').contains(status)).toBe(false)
    expect(status).toHaveTextContent('Assistant is typing')
  })

  it('takes a custom loading label', () => {
    render(<ChatThread loading loadingLabel="Searching the docs" />)
    expect(screen.getByRole('status')).toHaveTextContent('Searching the docs')
  })

  it('sticks to the bottom when new content arrives and the user is already there', () => {
    const { rerender } = render(<ChatThread messages={[MESSAGES[0] as ChatThreadMessage]} />)
    const scroller = scrollerOf()
    const metrics = fakeScrollMetrics(scroller, 600) // 1000 - 600 - 400 = 0px from bottom
    fireEvent.scroll(scroller)

    rerender(<ChatThread messages={MESSAGES} />)
    expect(metrics.top).toBe(1000)
  })

  it('does NOT yank the user back down when they have scrolled up to read', () => {
    const { rerender } = render(<ChatThread messages={[MESSAGES[0] as ChatThreadMessage]} />)
    const scroller = scrollerOf()
    const metrics = fakeScrollMetrics(scroller, 100) // 500px from the bottom
    fireEvent.scroll(scroller)

    rerender(<ChatThread messages={MESSAGES} />)
    expect(metrics.top).toBe(100)
  })

  it('re-arms once the user scrolls back to the bottom', () => {
    const { rerender } = render(<ChatThread messages={[MESSAGES[0] as ChatThreadMessage]} />)
    const scroller = scrollerOf()
    const metrics = fakeScrollMetrics(scroller, 100)
    fireEvent.scroll(scroller)
    rerender(<ChatThread messages={MESSAGES} />)
    expect(metrics.top).toBe(100)

    metrics.set(600)
    fireEvent.scroll(scroller)
    rerender(<ChatThread messages={[...MESSAGES, { id: '3', content: 'more' }]} />)
    expect(metrics.top).toBe(1000)
  })

  it('never scrolls when autoScroll is off', () => {
    const { rerender } = render(
      <ChatThread autoScroll={false} messages={[MESSAGES[0] as ChatThreadMessage]} />,
    )
    const scroller = scrollerOf()
    const metrics = fakeScrollMetrics(scroller, 600)
    fireEvent.scroll(scroller)
    rerender(<ChatThread autoScroll={false} messages={MESSAGES} />)
    expect(metrics.top).toBe(600)
    expect(scroller).toHaveAttribute('data-auto-scroll', 'false')
  })

  it('keeps the caller own onScroll working', () => {
    const onScroll = vi.fn()
    render(<ChatThread onScroll={onScroll} messages={MESSAGES} />)
    fireEvent.scroll(scrollerOf())
    expect(onScroll).toHaveBeenCalledTimes(1)
  })

  it('forwards its ref to the scroll container and merges className', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ChatThread ref={ref} className="mine" />)
    expect(ref.current).toBe(scrollerOf())
    expect(ref.current?.className).toBe('vk-chat-thread mine')
  })
})

/* ------------------------------------------------------------------ *
 * ChatInput
 * ------------------------------------------------------------------ */

describe('ChatInput', () => {
  it('renders a labelled textarea and a send button with zero props', () => {
    render(<ChatInput />)
    const field = screen.getByLabelText('Message')
    expect(field.tagName).toBe('TEXTAREA')
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('uses a real label, not an aria-label stand-in', () => {
    const { container } = render(<ChatInput label="Ask a question" />)
    const label = container.querySelector('label')
    const field = screen.getByLabelText('Ask a question')
    expect(label).toHaveAttribute('for', field.id)
    // Visually hidden, never display:none - a hidden label is a lost label.
    expect(label).toHaveAttribute('data-hidden', 'true')
  })

  it('makes Enter-to-submit discoverable through aria-describedby', () => {
    render(<ChatInput />)
    expect(screen.getByLabelText('Message')).toHaveAccessibleDescription(
      'Press Enter to send, Shift+Enter for a new line',
    )
  })

  it('drops the hint when asked, and the description with it', () => {
    render(<ChatInput hint={null} />)
    expect(screen.getByLabelText('Message')).not.toHaveAttribute('aria-describedby')
  })

  it('submits on Enter with the trimmed draft and clears the box', () => {
    const onSubmit = vi.fn()
    render(<ChatInput onSubmit={onSubmit} />)
    const field = screen.getByLabelText('Message')
    fireEvent.change(field, { target: { value: '  hello there  ' } })
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('hello there')
    expect(field).toHaveValue('')
  })

  it('does not submit on Shift+Enter', () => {
    const onSubmit = vi.fn()
    render(<ChatInput onSubmit={onSubmit} />)
    const field = screen.getByLabelText('Message')
    fireEvent.change(field, { target: { value: 'line one' } })
    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(field).toHaveValue('line one')
  })

  it('does not submit on Alt+Enter', () => {
    const onSubmit = vi.fn()
    render(<ChatInput onSubmit={onSubmit} defaultValue="draft" />)
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter', altKey: true })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not submit an empty or whitespace-only draft', () => {
    const onSubmit = vi.fn()
    render(<ChatInput onSubmit={onSubmit} />)
    const field = screen.getByLabelText('Message')
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.change(field, { target: { value: '   ' } })
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('does not submit while busy', () => {
    const onSubmit = vi.fn()
    render(<ChatInput busy onSubmit={onSubmit} defaultValue="queued" />)
    const field = screen.getByLabelText('Message')
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    expect(field.closest('form')).toHaveAttribute('aria-busy', 'true')
  })

  it('does not submit while disabled', () => {
    const onSubmit = vi.fn()
    render(<ChatInput disabled onSubmit={onSubmit} defaultValue="nope" />)
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Message')).toBeDisabled()
  })

  it('does not submit while an IME is composing', () => {
    const onSubmit = vi.fn()
    render(<ChatInput onSubmit={onSubmit} defaultValue="日本" />)
    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter', isComposing: true })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits when the send button is pressed', () => {
    const onSubmit = vi.fn()
    render(<ChatInput onSubmit={onSubmit} defaultValue="via button" />)
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).toHaveBeenCalledWith('via button')
  })

  it('reports every keystroke through onValueChange', () => {
    const onValueChange = vi.fn()
    render(<ChatInput onValueChange={onValueChange} />)
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'ab' } })
    expect(onValueChange).toHaveBeenLastCalledWith('ab')
  })

  it('works controlled, and reports the clear after a send', () => {
    function Controlled() {
      const [value, setValue] = useState('controlled')
      return <ChatInput value={value} onValueChange={setValue} onSubmit={vi.fn()} />
    }
    render(<Controlled />)
    const field = screen.getByLabelText('Message')
    expect(field).toHaveValue('controlled')
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(field).toHaveValue('')
  })

  it('keeps the draft when clearOnSubmit is off', () => {
    render(<ChatInput clearOnSubmit={false} onSubmit={vi.fn()} defaultValue="keep me" />)
    const field = screen.getByLabelText('Message')
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(field).toHaveValue('keep me')
  })

  it('grows with the text up to maxRows, then hands scrolling to the textarea', () => {
    /*
     * The growth itself is CSS: the wrapper is a one-cell grid whose ::after replicates
     * `data-value` in the same font, so the cell is as tall as the text, and
     * `--vk-chat-input-max-rows` caps it before the textarea starts scrolling. jsdom has
     * no layout engine, so what is verifiable here is the mechanism and its inputs -
     * the replica tracks the value and the cap is applied. The rendered pixel heights
     * are NOT covered by this suite.
     */
    const { container } = render(<ChatInput maxRows={4} minRows={2} />)
    const grow = container.querySelector('.vk-chat-input__grow') as HTMLElement
    const field = screen.getByLabelText('Message')

    expect(grow.style.getPropertyValue('--vk-chat-input-max-rows')).toBe('4')
    expect(grow.style.getPropertyValue('--vk-chat-input-min-rows')).toBe('2')
    expect(field).toHaveAttribute('rows', '2')
    expect(grow).toHaveAttribute('data-value', '')

    fireEvent.change(field, { target: { value: 'one\ntwo\nthree' } })
    expect(grow).toHaveAttribute('data-value', 'one\ntwo\nthree')
  })

  it('renders the attachments slot and a custom submit label', () => {
    render(<ChatInput attachments={<span>report.pdf</span>} submitLabel="Ask" />)
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask' })).toBeInTheDocument()
  })

  it('forwards refs to both the form and the textarea, and merges className', () => {
    const formRef = createRef<HTMLFormElement>()
    const fieldRef = createRef<HTMLTextAreaElement>()
    render(<ChatInput ref={formRef} textareaRef={fieldRef} className="mine" />)
    expect(formRef.current?.className).toBe('vk-chat-input mine')
    expect(fieldRef.current).toBe(screen.getByLabelText('Message'))
  })

  it('has no axe violations', async () => {
    const { container } = render(<ChatInput attachments={<span>file.txt</span>} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------------ *
 * TypingIndicator
 * ------------------------------------------------------------------ */

describe('TypingIndicator', () => {
  it('announces politely with a default label', () => {
    render(<TypingIndicator />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Assistant is typing')
    // role="status" carries an implicit aria-live="polite": never alert, because a
    // reply being composed must not interrupt what the user is reading.
    expect(status).not.toHaveAttribute('aria-live', 'assertive')
  })

  it('hides the dots from assistive tech', () => {
    const { container } = render(<TypingIndicator />)
    expect(container.querySelector('.vk-typing-indicator__dots')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(container.querySelectorAll('.vk-typing-indicator__dot')).toHaveLength(3)
  })

  it('takes a dot count and a size', () => {
    const { container } = render(<TypingIndicator dots={5} size="sm" />)
    expect(container.querySelectorAll('.vk-typing-indicator__dot')).toHaveLength(5)
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'sm')
  })

  it('keeps the live region mounted but empty when inactive', () => {
    // The bulletproof announcement pattern: the region exists before its text changes.
    const { rerender } = render(<TypingIndicator active={false} />)
    const status = screen.getByRole('status')
    expect(status).toBeEmptyDOMElement()
    expect(status).toHaveAttribute('data-active', 'false')
    rerender(<TypingIndicator active />)
    expect(screen.getByRole('status')).toHaveTextContent('Assistant is typing')
  })

  it('can show the label on screen', () => {
    render(<TypingIndicator showLabel label="Thinking" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-show-label', 'true')
    expect(screen.getByText('Thinking')).toBeInTheDocument()
  })

  it('renders on the server', () => {
    expect(renderToString(<TypingIndicator />)).toContain('vk-typing-indicator')
  })

  it('has no axe violations', async () => {
    const { container } = render(<TypingIndicator />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------------ *
 * ChatCodeBlock
 * ------------------------------------------------------------------ */

describe('ChatCodeBlock', () => {
  it('renders the source as text inside a named, focusable region', () => {
    render(<ChatCodeBlock code="const a = 1" language="ts" filename="a.ts" />)
    expect(screen.getByText('const a = 1')).toBeInTheDocument()
    const region = screen.getByRole('group', { name: 'a.ts' })
    // A scrollable region a keyboard user cannot reach is a WCAG failure.
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region.tagName).toBe('PRE')
  })

  it('names the region after the language when there is no filename', () => {
    render(<ChatCodeBlock code="x" language="python" />)
    expect(screen.getByRole('group', { name: 'python code' })).toBeInTheDocument()
  })

  it('copies to the clipboard and announces the success', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    render(<ChatCodeBlock code="pnpm add vivek-ui" />)

    const button = screen.getByRole('button', { name: 'Copy code' })
    fireEvent.click(button)

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('pnpm add vivek-ui'))
    // The announcement comes from a permanently mounted status region, not from the
    // button, whose accessible name stays put so it is not re-read on every copy.
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied'))
    expect(button).toHaveAccessibleName('Copy code')
  })

  it('calls onCopy after a successful copy', async () => {
    stubClipboard(vi.fn(() => Promise.resolve()))
    const onCopy = vi.fn()
    render(<ChatCodeBlock code="abc" onCopy={onCopy} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    await waitFor(() => expect(onCopy).toHaveBeenCalledWith('abc'))
  })

  it('announces a failed clipboard write instead of lying', async () => {
    stubClipboard(vi.fn(() => Promise.reject(new Error('denied'))))
    render(<ChatCodeBlock code="abc" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copy failed'))
  })

  it('can hide the copy button', () => {
    render(<ChatCodeBlock code="x" copy={false} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('delegates to a highlight render prop when given one', () => {
    // No syntax highlighter ships with the library - that would be a runtime
    // dependency. This is the seam for the consumer's own.
    render(
      <ChatCodeBlock
        code="let x"
        language="rust"
        highlight={(code, language) => <em data-testid="hl">{`${language}:${code}`}</em>}
      />,
    )
    expect(screen.getByTestId('hl')).toHaveTextContent('rust:let x')
  })

  it('renders with zero props', () => {
    const { container } = render(<ChatCodeBlock />)
    expect(container.querySelector('.vk-chat-code-block')).toBeInTheDocument()
  })

  it('sets data-wrap and merges className, forwards its ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ChatCodeBlock ref={ref} wrap className="mine" code="x" />)
    expect(ref.current).toHaveAttribute('data-wrap', 'true')
    expect(ref.current?.className).toBe('vk-chat-code-block mine')
  })

  it('has no axe violations', async () => {
    stubClipboard(vi.fn(() => Promise.resolve()))
    const { container } = render(<ChatCodeBlock code="x = 1" language="py" filename="run.py" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------------ *
 * Prose
 * ------------------------------------------------------------------ */

describe('Prose', () => {
  it('styles children without parsing anything', () => {
    const { container } = render(
      <Prose>
        <h2>Heading</h2>
        <p>
          Body with <code>inline</code> code.
        </p>
      </Prose>,
    )
    const root = container.querySelector('.vk-prose')
    expect(root).toHaveAttribute('data-size', 'md')
    expect(root).toHaveAttribute('data-measure', 'true')
    expect(screen.getByRole('heading', { level: 2, name: 'Heading' })).toBeInTheDocument()
  })

  it('renders a text child that looks like HTML as text', () => {
    const { container } = render(<Prose>{'<script>alert(1)</script>'}</Prose>)
    expect(container.querySelector('script')).toBeNull()
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument()
  })

  it('renders as another element and takes a size', () => {
    const { container } = render(<Prose as="section" size="lg" measure={false} />)
    const root = container.querySelector('.vk-prose')
    expect(root?.tagName).toBe('SECTION')
    expect(root).toHaveAttribute('data-size', 'lg')
    expect(root).toHaveAttribute('data-measure', 'false')
  })

  it('allows an http(s) link', () => {
    render(<Prose.Link href="https://example.com">Docs</Prose.Link>)
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      'https://example.com',
    )
  })

  it('allows scheme-less references', () => {
    render(
      <>
        <Prose.Link href="/docs">Rel</Prose.Link>
        <Prose.Link href="#top">Hash</Prose.Link>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Rel' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hash' })).toBeInTheDocument()
  })

  it('refuses a javascript: href and renders inert text instead', () => {
    // biome-ignore lint/security/noScriptUrl: refusing this href is exactly what the test asserts.
    render(<Prose.Link href="javascript:alert(1)">Click me</Prose.Link>)
    expect(screen.queryByRole('link')).toBeNull()
    const blocked = screen.getByText('Click me')
    expect(blocked.tagName).toBe('SPAN')
    expect(blocked).toHaveAttribute('data-blocked-href', 'true')
  })

  it('refuses a scheme obfuscated with control characters', () => {
    // Browsers strip these before resolving, so a naive startsWith() check misses it.
    render(<Prose.Link href={'java\tscript:alert(1)'}>Sneaky</Prose.Link>)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Sneaky')).toHaveAttribute('data-blocked-href', 'true')
  })

  it('refuses data: and other non-allowlisted schemes', () => {
    render(
      <>
        <Prose.Link href="data:text/html,<script>1</script>">Data</Prose.Link>
        <Prose.Link href="vbscript:msgbox">VB</Prose.Link>
        <Prose.Link href="mailto:a@b.c">Mail</Prose.Link>
      </>,
    )
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('adds rel="noopener noreferrer" to every new-tab link', () => {
    render(
      <Prose.Link href="https://example.com" target="_blank" rel="author">
        Out
      </Prose.Link>,
    )
    const link = screen.getByRole('link', { name: 'Out' })
    const rel = (link.getAttribute('rel') ?? '').split(' ')
    expect(rel).toContain('author')
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')
  })

  it('leaves rel alone for same-tab links', () => {
    render(<Prose.Link href="https://example.com">In</Prose.Link>)
    expect(screen.getByRole('link', { name: 'In' })).not.toHaveAttribute('rel')
  })

  it('renders on the server', () => {
    expect(renderToString(<Prose>text</Prose>)).toContain('vk-prose')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <Prose>
        <h2>Answer</h2>
        <p>
          See <Prose.Link href="https://example.com">the docs</Prose.Link>.
        </p>
        <ul>
          <li>one</li>
        </ul>
      </Prose>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* ------------------------------------------------------------------ *
 * the whole panel
 * ------------------------------------------------------------------ */

describe('a full chat panel', () => {
  function Panel() {
    return (
      <main>
        <h1>Assistant</h1>
        <ChatThread loading label="Conversation">
          {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
          <ChatThread.Message
            role="user"
            name="Vivek"
            avatar={<Avatar name="Vivek Singh" />}
            timestamp="09:30"
            content="Show me a container query."
          />
          {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
          <ChatThread.Message
            role="assistant"
            avatar={<Avatar name="Assistant" />}
            timestamp="09:31"
            actions={<button type="button">Regenerate</button>}
            content={
              <Prose>
                <p>
                  Here you go - see <Prose.Link href="https://example.com">the spec</Prose.Link>.
                </p>
                <ChatCodeBlock
                  filename="card.css"
                  language="css"
                  code="@container (min-width: 30rem) {}"
                />
              </Prose>
            }
          />
          {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
          <ChatThread.Message role="user" status="error" content="Retry that?" />
          {/* biome-ignore lint/a11y/useValidAriaRole: ChatMessage's `role` prop is who is speaking, not an ARIA role. */}
          <ChatThread.Message role="system" content="Model switched to fast mode." />
        </ChatThread>
        <ChatInput busy defaultValue="follow-up" />
      </main>
    )
  }

  it('has no axe violations, error message and typing indicator included', async () => {
    stubClipboard(vi.fn(() => Promise.resolve()))
    const { container } = render(<Panel />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('exposes every turn with its speaker, and keeps the indicator out of the log', () => {
    stubClipboard(vi.fn(() => Promise.resolve()))
    render(<Panel />)
    const log = screen.getByRole('log', { name: 'Conversation' })
    const names = within(log)
      .getAllByRole('article')
      .map((el) => el.getAttribute('aria-label'))
    expect(names).toEqual(['Vivek', 'Assistant', 'You, Not sent', 'System'])
    // The typing indicator lives outside the log. The code block's copy-announce region
    // is inside it, which is fine: `aria-relevant="additions"` ignores text changes, so
    // the log stays silent and the inner role="status" does the announcing.
    expect(log.contains(screen.getByText('Assistant is typing'))).toBe(false)
  })
})
