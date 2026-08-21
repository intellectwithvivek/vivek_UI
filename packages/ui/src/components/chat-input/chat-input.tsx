'use client'

import {
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type FormHTMLAttributes,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import { Button } from '../button'

/** Native props we replace with chat-shaped ones. */
type ChatInputBase = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'defaultValue' | 'value'
>

export interface ChatInputProps extends ChatInputBase {
  /** Controlled draft text. Pair with `onValueChange`. */
  value?: string
  /** Initial draft text while uncontrolled. */
  defaultValue?: string
  /** Called on every keystroke, and with an empty string when a send clears the box. */
  onValueChange?: (value: string) => void
  /** Called with the trimmed draft on send. Never called while empty, disabled or busy. */
  onSubmit?: (value: string) => void
  placeholder?: string
  /** Rows the box may grow to before it starts scrolling. Defaults to 8. */
  maxRows?: number
  /** Rows the box starts at. Defaults to 1. */
  minRows?: number
  disabled?: boolean
  /** A reply is in flight: the send button spins and Enter will not submit. */
  busy?: boolean
  /** Slot above the box for attachment chips, file pickers, model pickers. */
  attachments?: ReactNode
  /** Send button text. Defaults to `Send`. */
  submitLabel?: string
  /** Textarea label. A real `<label>`, visually hidden unless `hideLabel` is `false`. */
  label?: string
  /** Keep the label off screen. Defaults to `true`. */
  hideLabel?: boolean
  /**
   * The `aria-describedby` hint that makes Enter-to-send discoverable. Pass `null` to
   * drop it entirely (then say it somewhere else - do not simply remove it).
   */
  hint?: ReactNode
  /** Empty the box after a successful send. Defaults to `true`. */
  clearOnSubmit?: boolean
  /** Escape hatch onto the textarea itself. */
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'defaultValue' | 'onChange' | 'onKeyDown' | 'id' | 'disabled' | 'placeholder'
  >
  /** Ref to the textarea. The forwarded ref goes to the `<form>` root. */
  textareaRef?: Ref<HTMLTextAreaElement>
}

const DEFAULT_HINT = 'Press Enter to send, Shift+Enter for a new line'

/**
 * The composer: an auto-growing textarea, an attachment slot, and a send button.
 *
 * **Auto-growing with no JavaScript measurement.** The box sits in a CSS grid whose
 * `::after` pseudo-element replicates the current text (`content: attr(data-value)`)
 * in the same font and padding. The grid cell is as tall as the taller of the two, so
 * the textarea grows with the text - no `scrollHeight` reads, no reflow thrash on every
 * keystroke, and the first server-rendered paint is already the right height. `maxRows`
 * becomes a custom property the stylesheet caps the wrapper height with; past it the
 * textarea scrolls. `attr()` yields text and only text, so it cannot inject markup.
 *
 * **Keyboard.** Enter sends. Shift+Enter and Alt+Enter insert a newline. Ctrl/Cmd+Enter
 * also sends, since neither inserts anything in a textarea. A keypress during IME
 * composition never sends - that would eat the first word every time somebody types
 * Japanese. Enter is swallowed rather than acted on when the draft is empty or a reply
 * is in flight, so it can neither queue a blank turn nor double-send.
 *
 * **Accessibility.** The textarea has a real `<label>` (visually hidden by default,
 * never an `aria-label` standing in for one) and an `aria-describedby` hint spelling
 * out the Enter/Shift+Enter contract - the shortcut is otherwise invisible to everyone,
 * sighted users included. `aria-busy` on the form marks the in-flight state.
 */
export const ChatInput = forwardRef<HTMLFormElement, ChatInputProps>(function ChatInput(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    onSubmit,
    placeholder = 'Send a message',
    maxRows = 8,
    minRows = 1,
    disabled,
    busy,
    attachments,
    submitLabel = 'Send',
    label = 'Message',
    hideLabel = true,
    hint = DEFAULT_HINT,
    clearOnSubmit = true,
    textareaProps,
    textareaRef,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  })

  const uid = useIsomorphicId()
  const fieldId = `${uid}-field`
  const hintId = `${uid}-hint`
  const showHint = hint !== null && hint !== undefined && hint !== false

  const trimmed = value.trim()
  const canSubmit = !disabled && !busy && trimmed.length > 0

  const submit = useCallback(() => {
    if (!canSubmit) return
    onSubmit?.(trimmed)
    if (clearOnSubmit) setValue('')
  }, [canSubmit, clearOnSubmit, onSubmit, setValue, trimmed])

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      // Always stop the navigation, even when the send is refused: a form that
      // reloads the page because the draft was empty is unforgivable.
      event.preventDefault()
      submit()
    },
    [submit],
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value)
    },
    [setValue],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== 'Enter') return
      // Shift/Alt mean "newline": let the browser insert it.
      if (event.shiftKey || event.altKey) return
      // Enter is committing an IME candidate, not sending a message.
      if (event.nativeEvent.isComposing) return
      // Swallow it either way, so a refused send never leaves a stray newline behind.
      event.preventDefault()
      submit()
    },
    [submit],
  )

  return (
    <form
      ref={ref}
      className={cx('vk-chat-input', className)}
      data-busy={busy || undefined}
      data-disabled={disabled || undefined}
      aria-busy={busy || undefined}
      onSubmit={handleFormSubmit}
      {...rest}
    >
      <label
        className="vk-chat-input__label"
        data-hidden={hideLabel || undefined}
        htmlFor={fieldId}
      >
        {label}
      </label>
      {attachments ? <div className="vk-chat-input__attachments">{attachments}</div> : null}
      <div className="vk-chat-input__shell">
        <div
          className="vk-chat-input__grow"
          data-value={value}
          style={
            {
              '--vk-chat-input-max-rows': maxRows,
              '--vk-chat-input-min-rows': minRows,
            } as CSSProperties
          }
        >
          <textarea
            {...textareaProps}
            ref={textareaRef}
            id={fieldId}
            className="vk-chat-input__field"
            rows={minRows}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            aria-describedby={showHint ? hintId : undefined}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          type="submit"
          className="vk-chat-input__submit"
          size="sm"
          loading={busy}
          disabled={!canSubmit}
        >
          {/* The glyph is decorative; the text below is the accessible name, and it
              stays in the a11y tree even when a narrow container hides it visually. */}
          <span className="vk-chat-input__submit-icon" aria-hidden="true">
            &#8593;
          </span>
          <span className="vk-chat-input__submit-text">{submitLabel}</span>
        </Button>
      </div>
      {showHint ? (
        <p className="vk-chat-input__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {children}
    </form>
  )
})
