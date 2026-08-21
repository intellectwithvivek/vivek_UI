'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'
import { Button } from '../button'
import { Code } from '../code'

/**
 * Render-prop escape hatch for syntax highlighting. It receives the raw source and the
 * language and returns whatever React nodes it likes - a Shiki/Prism/Highlight.js
 * integration, or nothing.
 *
 * It returns a `ReactNode` on purpose. A highlighter that hands back an HTML string
 * would force `dangerouslySetInnerHTML` on output that came from a model, and this
 * family does not do that anywhere. Highlighters that only produce HTML strings can be
 * parsed by the consumer into elements before returning them.
 */
export type ChatCodeBlockHighlighter = (code: string, language?: string) => ReactNode

/**
 * `onCopy` shadows the native clipboard event handler of the same name, which is the
 * right trade: the interesting event here is "the user copied this block", not "a
 * selection inside it was copied". Reach for the native one via a wrapper element.
 */
export interface ChatCodeBlockProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onCopy'> {
  /** The source. Rendered as text, never as markup. */
  code?: string
  /** Language tag shown in the header, and passed to `highlight`. */
  language?: string
  /** Shown in the header, and used as the code region's accessible name. */
  filename?: string
  /** Show the copy button. Defaults to `true`. */
  copy?: boolean
  /** Accessible name of the copy button. Stable - it does not change on success. */
  copyLabel?: string
  /** Announced, and shown on the button, after a successful copy. */
  copiedLabel?: string
  /** Announced when the clipboard write fails or is unavailable. */
  copyErrorLabel?: string
  /** Called with the source after a successful copy. */
  onCopy?: (code: string) => void
  /** Plug your own highlighter in. Without it the source renders as plain text. */
  highlight?: ChatCodeBlockHighlighter
  /** Soft-wrap long lines instead of scrolling horizontally. */
  wrap?: boolean
  /** How long the copied/error state sticks, in ms. Defaults to 2000. */
  feedbackDuration?: number
}

type CopyState = 'idle' | 'copied' | 'error'

/**
 * A fenced code block with a copy button, built on `Code`.
 *
 * **No syntax highlighting.** Every highlighter is a runtime dependency and this
 * library has none, so the default output is plain monospaced text. `highlight` is the
 * seam: pass a function and it renders your tokens instead.
 *
 * **Accessibility.** The `<pre>` scrolls, so it is focusable (`tabIndex={0}`) - a
 * scrollable region a keyboard user cannot reach is a WCAG failure. Being focusable it
 * needs a name, so it is a `role="group"` (not `region`: a long answer would otherwise
 * pepper the page with landmarks) named after the filename or the language.
 *
 * The copy button's accessible name never changes, so a screen reader does not re-read
 * the button when the state flips. Success is announced instead by a permanently
 * mounted `role="status"` region whose text swaps - the reliable ordering, since the
 * live region exists before its content changes.
 *
 * **Security.** `code` is rendered as a text child. `highlight`'s return value is a
 * `ReactNode`, so React escapes it too. Nothing here touches `innerHTML`.
 */
export const ChatCodeBlock = forwardRef<HTMLDivElement, ChatCodeBlockProps>(function ChatCodeBlock(
  {
    code = '',
    language,
    filename,
    copy = true,
    copyLabel = 'Copy code',
    copiedLabel = 'Copied',
    copyErrorLabel = 'Copy failed',
    onCopy,
    highlight,
    wrap,
    feedbackDuration = 2000,
    className,
    ...rest
  },
  ref,
) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )

  const handleCopy = useCallback(async () => {
    let next: CopyState = 'error'
    try {
      // Guarded rather than assumed: no clipboard on the server, none in an insecure
      // context, and none in some embedded webviews.
      const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
      if (clipboard) {
        await clipboard.writeText(code)
        next = 'copied'
      }
    } catch {
      next = 'error'
    }
    setState(next)
    if (next === 'copied') onCopy?.(code)
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), feedbackDuration)
  }, [code, feedbackDuration, onCopy])

  const hasHeader = Boolean(filename || language || copy)
  const codeName = filename ?? (language ? `${language} code` : 'Code')
  const buttonText =
    state === 'copied' ? copiedLabel : state === 'error' ? copyErrorLabel : copyLabel

  return (
    <div
      ref={ref}
      className={cx('vk-chat-code-block', className)}
      data-wrap={wrap || undefined}
      {...rest}
    >
      {hasHeader ? (
        <div className="vk-chat-code-block__header">
          {filename ? <span className="vk-chat-code-block__filename">{filename}</span> : null}
          {language ? <span className="vk-chat-code-block__language">{language}</span> : null}
          {copy ? (
            <Button
              type="button"
              className="vk-chat-code-block__copy"
              variant="ghost"
              size="sm"
              data-state={state}
              aria-label={copyLabel}
              onClick={handleCopy}
            >
              {/* Decorative: the button's name comes from aria-label and stays put,
                    so the state swap does not re-announce the control. */}
              <span aria-hidden="true">{state === 'copied' ? '✓' : '⧉'}</span>
              <span className="vk-chat-code-block__copy-text" aria-hidden="true">
                {buttonText}
              </span>
            </Button>
          ) : null}
        </div>
      ) : null}
      <Code
        block
        className="vk-chat-code-block__code"
        role="group"
        aria-label={codeName}
        tabIndex={0}
      >
        {highlight ? highlight(code, language) : code}
      </Code>
      {/*
          Mounted at all times with its text swapped, rather than mounted on success:
          a live region has to exist before its content changes to be announced reliably.
        */}
      <span className="vk-chat-code-block__announce" role="status">
        {state === 'copied' ? copiedLabel : state === 'error' ? copyErrorLabel : ''}
      </span>
    </div>
  )
})
