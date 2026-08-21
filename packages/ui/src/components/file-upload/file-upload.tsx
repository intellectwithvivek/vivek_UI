'use client'

import {
  type ChangeEvent,
  type DragEvent,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

/** Why a file was refused. */
export type FileRejectReason = 'size' | 'count' | 'type' | 'duplicate'

export interface FileRejection {
  file: File
  reason: FileRejectReason
}

export interface FileUploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** Same syntax as the native attribute: `".pdf,image/*"`. Enforced here too. */
  accept?: string
  multiple?: boolean
  /** Per-file limit, in bytes. */
  maxSize?: number
  /** Cap on the accepted list. Extra files are rejected with reason `'count'`. */
  maxFiles?: number
  /** Controlled list. */
  value?: File[]
  /** Uncontrolled initial list. Default `[]`. */
  defaultValue?: File[]
  /** Called with the whole accepted list on every change, in both modes. */
  onFilesChange?: (files: File[]) => void
  /** Called with everything refused by one drop or pick, and why. */
  onReject?: (rejections: FileRejection[]) => void
  disabled?: boolean
  /** Sets `aria-invalid` on the input. Injected by `Field`. */
  invalid?: boolean
  /** Injected by `Field`. */
  required?: boolean
  /** Submits with the form. */
  name?: string
  /** Main dropzone text. Also the input's accessible name, unless `aria-label` is set. */
  label?: ReactNode
  /** Secondary line — the place for "PNG or JPG, up to 5 MB". */
  hint?: ReactNode
  size?: 'sm' | 'md'
  /** Accessible name for a row's remove button. Default `` `Remove ${name}` ``. */
  removeLabel?: (fileName: string) => string
}

const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB'] as const

/**
 * Human-readable size. Decimal units, matching what operating systems and every "max 5
 * MB" copy on the internet mean.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1000) return `${bytes} B`
  let value = bytes
  let unit = 0
  while (value >= 1000 && unit < BYTE_UNITS.length - 1) {
    value /= 1000
    unit += 1
  }
  // `Intl` rather than `toFixed`, so the decimal separator is the reader's.
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value)
  return `${formatted} ${BYTE_UNITS[unit]}`
}

/**
 * Does a file satisfy an `accept` string?
 *
 * Browsers only use `accept` to filter the picker's dialog; a drag-and-drop, or a picker
 * the user switched to "All files" in, delivers anything. So this has to be enforced in
 * code as well or the attribute is decorative.
 */
export function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true

  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()

  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(`${token.slice(0, -1)}`)
    // An empty `file.type` (common for unusual extensions, and for every file dropped
    // from some archivers) can only be judged by its extension, so a MIME token cannot
    // match it and the file falls through to the extension tokens, if any.
    return type !== '' && type === token
  })
}

/** Same name, size and mtime: as close to file identity as the browser will tell us. */
function isSameFile(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
}

/**
 * A dropzone over a real `<input type="file">`.
 *
 * The input is never `display: none`. It is clipped to a pixel — the same technique
 * `Checkbox` uses — so it keeps its place in the focus order, keeps working with the
 * keyboard, keeps submitting with the form and keeps its native picker. A dropzone built
 * from a `div` and a hidden-with-`display:none` input is unreachable by keyboard, which is
 * the single most common accessibility failure in this component category.
 *
 * Validation is enforced in code, not delegated to attributes. `accept` only filters the
 * picker's dialog, and nothing at all constrains a drop, so size, count and type are all
 * checked here and everything refused is reported through `onReject` with a reason. The
 * alternative — silently dropping files — is indistinguishable from a bug.
 *
 * One honest limitation: a `FileList` cannot be constructed by hand, so the curated list
 * is written back onto the input through a `DataTransfer` where the browser supports it
 * (all current ones do). Where it does not, the component's list and the input's own
 * `files` can diverge, and only the latter is submitted natively.
 */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  {
    accept,
    multiple,
    maxSize,
    maxFiles,
    value,
    defaultValue,
    onFilesChange,
    onReject,
    disabled,
    invalid,
    required,
    name,
    label = 'Choose files or drag them here',
    hint,
    size = 'md',
    removeLabel = (fileName) => `Remove ${fileName}`,
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
  const hintId = `${baseId}-hint`
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [files, setFiles] = useControllableState<File[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onFilesChange,
  })
  const [rejections, setRejections] = useState<FileRejection[]>([])
  // A counter, not a boolean: dragging over a child fires `dragleave` on the parent, and a
  // boolean flickers the highlight off on every internal boundary crossing.
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)

  /**
   * Keep the native input's `files` in step with the curated list, so a plain form POST
   * submits what the user can see rather than whatever the last picker returned.
   */
  const syncInput = useCallback((next: File[]) => {
    const input = inputRef.current
    if (!input || typeof DataTransfer === 'undefined') return
    try {
      const transfer = new DataTransfer()
      for (const file of next) transfer.items.add(file)
      input.files = transfer.files
    } catch {
      // Some environments expose `DataTransfer` without a working `items.add`. The
      // component list stays correct either way; only native submission degrades.
    }
  }, [])

  const ingest = useCallback(
    (incoming: File[]) => {
      if (disabled || incoming.length === 0) return

      const accepted: File[] = multiple ? [...files] : []
      const refused: FileRejection[] = []
      const limit = multiple ? maxFiles : 1

      for (const file of incoming) {
        if (!matchesAccept(file, accept)) {
          refused.push({ file, reason: 'type' })
          continue
        }
        if (maxSize !== undefined && file.size > maxSize) {
          refused.push({ file, reason: 'size' })
          continue
        }
        if (accepted.some((existing) => isSameFile(existing, file))) {
          refused.push({ file, reason: 'duplicate' })
          continue
        }
        if (limit !== undefined && accepted.length >= limit) {
          refused.push({ file, reason: 'count' })
          continue
        }
        accepted.push(file)
      }

      setRejections(refused)
      if (refused.length > 0) onReject?.(refused)
      // Only touch the list when something got through: a drop of three rejected files
      // must not clear what the user already had.
      if (accepted.length !== files.length || accepted.some((file, i) => file !== files[i])) {
        setFiles(accepted)
        syncInput(accepted)
      }
    },
    [accept, disabled, files, maxFiles, maxSize, multiple, onReject, setFiles, syncInput],
  )

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      ingest(Array.from(event.target.files ?? []))
    },
    [ingest],
  )

  const removeAt = useCallback(
    (index: number) => {
      if (disabled) return
      const next = files.filter((_, position) => position !== index)
      setRejections([])
      setFiles(next)
      syncInput(next)
    },
    [disabled, files, setFiles, syncInput],
  )

  const onDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (disabled) return
      event.preventDefault()
      dragDepth.current += 1
      setDragging(true)
    },
    [disabled],
  )

  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (disabled) return
      // Without this the browser navigates to the dropped file instead of firing `drop`.
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    },
    [disabled],
  )

  const onDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (disabled) return
      event.preventDefault()
      dragDepth.current = 0
      setDragging(false)
      ingest(Array.from(event.dataTransfer?.files ?? []))
    },
    [disabled, ingest],
  )

  /** A controlled caller replacing the list must not leave the input out of step. */
  const controlledLength = value?.length
  useEffect(() => {
    if (controlledLength === undefined) return
    syncInput(value ?? [])
  }, [controlledLength, syncInput, value])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop is a pointer-only enhancement over the real file input inside; the keyboard path is the input itself, never this div.
    <div
      className={cx('vk-file-upload', className)}
      style={style}
      data-size={size}
      data-dragging={dragging || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...rest}
    >
      {/*
        A `<label>`, so a click anywhere on the zone opens the picker with no JavaScript
        and the zone's text becomes the input's accessible name.
      */}
      <label className="vk-file-upload__zone" htmlFor={baseId}>
        <input
          ref={(node) => {
            inputRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={baseId}
          type="file"
          className="vk-file-upload__input"
          accept={accept}
          multiple={multiple}
          required={required && files.length === 0}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          aria-describedby={
            [ariaDescribedBy, hint ? hintId : undefined].filter(Boolean).join(' ') || undefined
          }
          onChange={onInputChange}
        />
        <span className="vk-file-upload__icon" aria-hidden="true" />
        <span className="vk-file-upload__label">{label}</span>
        {hint ? (
          <span className="vk-file-upload__hint" id={hintId}>
            {hint}
          </span>
        ) : null}
      </label>

      {files.length > 0 ? (
        <ul className="vk-file-upload__files">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="vk-file-upload__file"
            >
              <span className="vk-file-upload__name">{file.name}</span>
              <span className="vk-file-upload__meta">
                {formatBytes(file.size)}
                {file.type ? ` · ${file.type}` : null}
              </span>
              {/*
                Outside the label on purpose: a button nested in a `<label for>` opens the
                file picker on every click, which is not what "remove" should do.
              */}
              <button
                type="button"
                className="vk-file-upload__remove"
                aria-label={removeLabel(file.name)}
                disabled={disabled}
                onClick={() => removeAt(index)}
              >
                <span className="vk-file-upload__cross" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Politely, because it follows the user's own action rather than interrupting it. */}
      <span className="vk-file-upload__sr" role="status" aria-live="polite">
        {files.length === 0
          ? 'No files selected'
          : `${files.length} ${files.length === 1 ? 'file' : 'files'} selected: ${files
              .map((file) => file.name)
              .join(', ')}`}
      </span>

      {rejections.length > 0 ? (
        <ul className="vk-file-upload__rejections" role="alert">
          {rejections.map(({ file, reason }) => (
            <li key={`${file.name}-${reason}`} className="vk-file-upload__rejection">
              {file.name}
              {reason === 'size'
                ? ` — larger than ${maxSize === undefined ? 'the limit' : formatBytes(maxSize)}`
                : null}
              {reason === 'count' ? ` — over the ${maxFiles ?? 1} file limit` : null}
              {reason === 'type' ? ' — wrong file type' : null}
              {reason === 'duplicate' ? ' — already added' : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
})
