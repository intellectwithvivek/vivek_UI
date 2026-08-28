'use client'

import {
  type ClipboardEvent,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

/** Why a tag was refused. Passed to `onReject` so the caller can count or log it. */
export type TagRejectReason = 'empty' | 'duplicate' | 'max' | 'invalid'

export interface TagInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** Controlled tags. */
  value?: string[]
  /** Uncontrolled initial tags. Default `[]`. */
  defaultValue?: string[]
  /** Called with the whole new list on every add or remove, in both modes. */
  onValueChange?: (value: string[]) => void
  /** Hard cap. Further tags are rejected with reason `'max'`. */
  max?: number
  /**
   * Vet a candidate. Return `false` to reject silently, or a string to reject *and* show
   * that message — which is the version worth using, because "nothing happened" is the
   * least debuggable failure a form can offer.
   */
  validate?: (tag: string, tags: string[]) => boolean | string
  /** Permit the same tag twice. Default `false`. */
  allowDuplicates?: boolean
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readOnly?: boolean
  /** Sets `aria-invalid` on the text input. Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. Marks the input required while there are no tags. */
  required?: boolean
  /** Submits one hidden input per tag, all under this name. */
  name?: string
  /** Extra characters that commit a tag. Default `[',']` — Enter always commits. */
  delimiters?: string[]
  /** Commit whatever is typed when the field loses focus. Default `true`. */
  addOnBlur?: boolean
  /** Accessible name for a tag's remove button. Default `` `Remove ${tag}` ``. */
  removeLabel?: (tag: string) => string
  /** Told about every refusal, with the reason. */
  onReject?: (tag: string, reason: TagRejectReason) => void
}

/**
 * A list of tags with a text field on the end.
 *
 * The accessibility trap here is that the interesting state — the set of tags — lives
 * outside the text input, so a screen-reader user typing into the field gets no feedback
 * at all when a tag is added or removed. The fix is the polite live region at the bottom
 * that carries the whole list; it is why adding "svelte" announces "3 tags: react, vue,
 * svelte" rather than silence. Rejections get their own `role="alert"`, because a tag that
 * silently fails to appear is indistinguishable from a broken keyboard.
 *
 * Each tag's remove button is a real focusable button with its own name, so Tab reaches
 * every one of them. That is a deliberate trade: a roving tab index would collapse a long
 * list to one stop, but it also means the buttons stop being discoverable by the most
 * common way people explore a form.
 */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    value,
    defaultValue,
    onValueChange,
    max,
    validate,
    allowDuplicates = false,
    placeholder,
    size = 'md',
    disabled,
    readOnly,
    invalid,
    required,
    name,
    delimiters = [','],
    addOnBlur = true,
    removeLabel = (tag) => `Remove ${tag}`,
    onReject,
    className,
    style,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const baseId = useIsomorphicId(id)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  })
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reject = useCallback(
    (tag: string, reason: TagRejectReason, message?: string) => {
      setError(message ?? null)
      onReject?.(tag, reason)
    },
    [onReject],
  )

  /** Returns the tags to keep, or `null` when the candidate was refused. */
  const vet = useCallback(
    (candidate: string, current: string[]): string[] | null => {
      const tag = candidate.trim()
      if (tag.length === 0) {
        reject(tag, 'empty')
        return null
      }
      if (max !== undefined && current.length >= max) {
        reject(tag, 'max', `No more than ${max} ${max === 1 ? 'tag' : 'tags'}.`)
        return null
      }
      if (!allowDuplicates && current.includes(tag)) {
        reject(tag, 'duplicate', `"${tag}" has already been added.`)
        return null
      }
      const verdict = validate?.(tag, current)
      if (verdict === false) {
        reject(tag, 'invalid')
        return null
      }
      if (typeof verdict === 'string') {
        reject(tag, 'invalid', verdict)
        return null
      }
      return [...current, tag]
    },
    [allowDuplicates, max, reject, validate],
  )

  const commit = useCallback(
    (candidate: string) => {
      if (disabled || readOnly) return
      const next = vet(candidate, tags)
      if (!next) return
      setError(null)
      setTags(next)
      setDraft('')
    },
    [disabled, readOnly, setTags, tags, vet],
  )

  /** Adds as many as survive vetting, so one paste is one state update. */
  const commitMany = useCallback(
    (candidates: string[]) => {
      if (disabled || readOnly) return
      let accumulated = tags
      let added = false
      for (const candidate of candidates) {
        const next = vet(candidate, accumulated)
        if (!next) continue
        accumulated = next
        added = true
      }
      if (!added) return
      setError(null)
      setTags(accumulated)
      setDraft('')
    },
    [disabled, readOnly, setTags, tags, vet],
  )

  const removeAt = useCallback(
    (index: number) => {
      if (disabled || readOnly) return
      setError(null)
      setTags(tags.filter((_, position) => position !== index))
    },
    [disabled, readOnly, setTags, tags],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented) return

      if (event.key === 'Enter') {
        // Only swallow Enter when there is something to commit, so an otherwise empty
        // field still submits the form the way a plain text input would.
        if (draft.trim().length === 0) return
        event.preventDefault()
        commit(draft)
        return
      }

      if (delimiters.includes(event.key)) {
        event.preventDefault()
        commit(draft)
        return
      }

      if (event.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
        event.preventDefault()
        removeAt(tags.length - 1)
        return
      }

      if (event.key === 'Escape' && draft.length > 0) {
        event.preventDefault()
        setDraft('')
        setError(null)
      }
    },
    [commit, delimiters, draft, removeAt, tags.length],
  )

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      const text = event.clipboardData.getData('text')
      // Split on every configured delimiter plus newlines, so pasting a column from a
      // spreadsheet does the obvious thing.
      const parts = text
        .split(new RegExp(`[\\n\\r${delimiters.map((d) => `\\${d}`).join('')}]+`))
        .map((part) => part.trim())
        .filter(Boolean)
      if (parts.length < 2) return
      event.preventDefault()
      commitMany(parts)
    },
    [commitMany, delimiters],
  )

  /** Clicking the padding focuses the field — but a click on a remove button is its own. */
  const onRootMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    event.preventDefault()
    inputRef.current?.focus()
  }, [])

  const summary =
    tags.length === 0
      ? 'No tags'
      : `${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}: ${tags.join(', ')}`

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: this only forwards a press on the box's own padding to the real input inside it; every interactive affordance is a focusable control.
    <div
      className={cx('vk-tag-input', className)}
      style={style}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      onMouseDown={onRootMouseDown}
      {...rest}
    >
      {tags.length > 0 ? (
        <ul className="vk-tag-input__tags">
          {tags.map((tag, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: duplicates are allowed, so the tag alone is not unique; position is part of a tag's identity here.
            <li key={`${tag}-${index}`} className="vk-tag-input__tag">
              <span className="vk-tag-input__text">{tag}</span>
              <button
                type="button"
                className="vk-tag-input__remove"
                aria-label={removeLabel(tag)}
                disabled={disabled || readOnly}
                onClick={() => removeAt(index)}
              >
                <span className="vk-tag-input__cross" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        id={baseId}
        type="text"
        className="vk-tag-input__field"
        value={draft}
        placeholder={placeholder}
        // Required only while empty: once there is a tag the constraint is satisfied,
        // and leaving it on would block submission over an empty *draft*.
        required={required && tags.length === 0}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        autoComplete="off"
        onChange={(event) => {
          setDraft(event.target.value)
          if (error) setError(null)
        }}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => {
          if (addOnBlur && draft.trim().length > 0) commit(draft)
        }}
      />

      {/* One hidden input per tag: `getAll(name)` on the server, no JSON encoding. */}
      {name
        ? tags.map((tag, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: same reason as the chips above - duplicate tags are legal, so position disambiguates.
            <input key={`${name}-${tag}-${index}`} type="hidden" name={name} value={tag} />
          ))
        : null}

      {/*
        The whole list, politely. This is the only feedback a screen-reader user gets that
        their tag landed, since the change happens outside the input they are typing in.
      */}
      <span className="vk-tag-input__sr" role="status" aria-live="polite">
        {summary}
      </span>

      {error ? (
        <p className="vk-tag-input__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
})
