'use client'

import * as ui from '@the_viveksingh/vivek-ui'
import { Badge, Button, Select, Stack, Text, Tooltip } from '@the_viveksingh/vivek-ui'
import * as charts from '@the_viveksingh/vivek-ui/charts'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { transform } from 'sucrase'
import { assertBindable, buildScope } from '../../lib/playground-scope'
import { prepareSource } from '../../lib/prepare-source'
import { TEMPLATES } from './templates'

const STORAGE_KEY = 'vk-playground-draft'
const INDENT = '  '

/** A crash in user code must not take the page with it. */
class PreviewBoundary extends React.Component<
  { children: React.ReactNode; onError: (message: string) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message)
  }

  // Reset on every new compile, so fixing the code recovers without a reload.
  componentDidUpdate(previous: { children: React.ReactNode }) {
    if (this.state.failed && previous.children !== this.props.children) {
      this.setState({ failed: false })
    }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/*
 * Built once. `buildScope` removes the `default` and `module.exports` keys the namespace
 * objects carry, which are not legal parameter names - passing them straight to
 * `new Function` threw `SyntaxError: Unexpected token 'default'` before it ever reached
 * user code, so nothing at all could compile.
 */
const SCOPE = buildScope({ ...ui, ...charts, React, ...React })

type Viewport = 'mobile' | 'tablet' | 'full'
type Panel = 'preview' | 'output'

const VIEWPORTS: Record<Viewport, { label: string; width: string }> = {
  mobile: { label: 'Mobile, 390px', width: '390px' },
  tablet: { label: 'Tablet, 768px', width: '768px' },
  full: { label: 'Fill the panel', width: '100%' },
}

/**
 * The playground.
 *
 * Sucrase, not the TypeScript compiler: it strips types in ~30 kB rather than shipping a
 * ~3 MB compiler to the browser. It does no type checking, which is the right trade here —
 * the point is to run code, and the editor is not where type errors get caught.
 */
export function PlaygroundEditor() {
  const [code, setCode] = useState(TEMPLATES[0]?.code ?? '')
  const [error, setError] = useState<string | null>(null)
  const [element, setElement] = useState<React.ReactNode>(null)
  const [compiled, setCompiled] = useState('')
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)
  const [viewport, setViewport] = useState<Viewport>('full')
  const [dark, setDark] = useState(false)
  const [panel, setPanel] = useState<Panel>('preview')
  const [copied, setCopied] = useState<string | null>(null)

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const gutterRef = useRef<HTMLDivElement | null>(null)

  // Fail loudly at mount if the injected scope is unusable, so a host bug is never again
  // reported as a syntax error in the user's code.
  useEffect(() => {
    try {
      assertBindable(SCOPE.names)
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : String(thrown))
    }
  }, [])

  // Restore from the URL hash first, then the saved draft. Read in an effect, never during
  // render, so the server and first client render agree.
  useEffect(() => {
    let restored: string | null = null
    try {
      const hash = window.location.hash.replace(/^#code=/, '')
      if (hash) restored = decodeURIComponent(atob(hash))
    } catch {
      // A malformed hash is not worth surfacing; fall through to the draft.
    }
    if (!restored) {
      try {
        restored = window.localStorage.getItem(STORAGE_KEY)
      } catch {
        // Private mode. The template is fine.
      }
    }
    if (restored) setCode(restored)
    setReady(true)
  }, [])

  const compile = useCallback((source: string) => {
    try {
      // `new Function` evaluates a script body, where ESM syntax is a syntax error. Docs
      // examples are written as modules, so normalise them first.
      const prepared = prepareSource(source)
      const { code: js } = transform(prepared.code, {
        transforms: ['typescript', 'jsx'],
        production: true,
      })
      setCompiled(js.trim())
      const factory = new Function(...SCOPE.names, `${js};\nreturn ${prepared.resolver};`)
      const Component = factory(...SCOPE.values)
      if (typeof Component !== 'function') {
        setError(
          prepared.candidates.length > 0
            ? `Could not find a component to render. Looked for: ${prepared.candidates.join(', ')}.`
            : 'Define a component - function App() { … } - and it will render here.',
        )
        return
      }
      setError(null)
      setElement(React.createElement(Component as React.ComponentType))
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : String(thrown))
    }
  }, [])

  const run = useCallback(
    (source: string) => {
      setPending(false)
      compile(source)
      try {
        window.localStorage.setItem(STORAGE_KEY, source)
      } catch {
        // Not persisting is acceptable.
      }
    },
    [compile],
  )

  // Debounced: recompiling on every keystroke makes typing feel laggy.
  useEffect(() => {
    if (!ready) return
    setPending(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => run(code), 300)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [code, ready, run])

  const flash = (what: string) => {
    setCopied(what)
    setTimeout(() => setCopied(null), 1600)
  }

  const share = async () => {
    try {
      const hash = `#code=${btoa(encodeURIComponent(code))}`
      window.history.replaceState(null, '', hash)
      await navigator.clipboard?.writeText(window.location.href)
      flash('link')
    } catch {
      setError('Could not build a shareable link for this code.')
    }
  }

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard?.writeText(text)
      flash(what)
    } catch {
      // Clipboard denied. Selecting by hand still works.
    }
  }

  /*
   * Tab indents instead of leaving the editor.
   *
   * A textarea is a poor code editor and Tab-to-indent is the single change that makes it
   * usable. It does trap Tab, which would strand a keyboard user - so Escape moves focus
   * out, matching what CodeMirror and Monaco do, and the hint below says so.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget

    if (event.key === 'Escape') {
      target.blur()
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      if (timer.current) clearTimeout(timer.current)
      run(code)
      return
    }

    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return
    event.preventDefault()

    const { selectionStart, selectionEnd, value } = target
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1

    if (event.shiftKey) {
      // Outdent: remove one indent from the start of the line, if it is there.
      if (!value.startsWith(INDENT, lineStart)) return
      const next = value.slice(0, lineStart) + value.slice(lineStart + INDENT.length)
      setCode(next)
      requestAnimationFrame(() => {
        target.selectionStart = Math.max(lineStart, selectionStart - INDENT.length)
        target.selectionEnd = Math.max(lineStart, selectionEnd - INDENT.length)
      })
      return
    }

    const next = value.slice(0, selectionStart) + INDENT + value.slice(selectionEnd)
    setCode(next)
    requestAnimationFrame(() => {
      target.selectionStart = selectionStart + INDENT.length
      target.selectionEnd = selectionStart + INDENT.length
    })
  }

  const lineCount = useMemo(() => code.split('\n').length, [code])

  const templateOptions = useMemo(
    () => TEMPLATES.map((template) => ({ value: template.id, label: template.label })),
    [],
  )

  const status = error ? 'error' : pending ? 'pending' : 'ok'

  return (
    <div className="playground">
      <div className="playground__bar">
        <Stack direction="horizontal" gap={3} align="center" wrap>
          <Select
            aria-label="Starter template"
            onChange={(event) => {
              const found = TEMPLATES.find((template) => template.id === event.target.value)
              if (found) setCode(found.code)
            }}
            options={templateOptions}
            size="sm"
          />
          <Badge
            tone={status === 'error' ? 'danger' : status === 'pending' ? 'warning' : 'success'}
            variant="soft"
          >
            {status === 'error' ? 'Error' : status === 'pending' ? 'Compiling' : 'Live'}
          </Badge>
          {/* Announced, not just coloured: the pill is the only signal that a compile ran. */}
          <span className="vk-visually-hidden" role="status" aria-live="polite">
            {status === 'error' ? `Compile error: ${error}` : status === 'ok' ? 'Compiled' : ''}
          </span>
        </Stack>

        <Stack direction="horizontal" gap={2} align="center" wrap>
          <fieldset className="playground__group">
            <legend className="vk-visually-hidden">Preview width</legend>
            {(Object.keys(VIEWPORTS) as Viewport[]).map((key) => (
              <Tooltip content={VIEWPORTS[key].label} key={key}>
                <button
                  aria-pressed={viewport === key}
                  className="playground__toggle"
                  onClick={() => setViewport(key)}
                  type="button"
                >
                  {key === 'mobile' ? 'S' : key === 'tablet' ? 'M' : 'L'}
                </button>
              </Tooltip>
            ))}
          </fieldset>

          <Tooltip content={dark ? 'Preview in light theme' : 'Preview in dark theme'}>
            <button
              aria-pressed={dark}
              className="playground__toggle"
              onClick={() => setDark((value) => !value)}
              type="button"
            >
              {dark ? 'Dark' : 'Light'}
            </button>
          </Tooltip>

          <Button onClick={() => copy(code, 'code')} size="sm" variant="outline">
            {copied === 'code' ? 'Copied' : 'Copy code'}
          </Button>
          <Button onClick={share} size="sm" variant="outline">
            {copied === 'link' ? 'Link copied' : 'Share'}
          </Button>
          <Button onClick={() => setCode(TEMPLATES[0]?.code ?? '')} size="sm" variant="ghost">
            Reset
          </Button>
        </Stack>
      </div>

      <div className="playground__split">
        <section aria-label="Source code" className="playground__pane">
          <header className="playground__pane-head">
            <Text size="sm" weight="medium">
              TypeScript
            </Text>
            <Text size="sm" tone="muted">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </Text>
          </header>
          <div className="playground__editor">
            {/*
              A gutter rather than a real editor. Line numbers are generated from the line
              count and scrolled in lockstep with the textarea, which costs ~20 lines
              instead of the ~200 kB a CodeMirror build would add to a docs site.
            */}
            <div aria-hidden="true" className="playground__gutter" ref={gutterRef}>
              {Array.from({ length: lineCount }, (_, i) => i + 1).map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <textarea
              aria-describedby="playground-hint"
              aria-label="Playground source code"
              className="playground__code"
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={onKeyDown}
              onScroll={(event) => {
                if (gutterRef.current) {
                  gutterRef.current.scrollTop = event.currentTarget.scrollTop
                }
              }}
              ref={editorRef}
              spellCheck={false}
              value={code}
            />
          </div>
          <Text id="playground-hint" size="sm" tone="muted">
            Tab indents, Shift+Tab outdents, Ctrl+Enter runs now, Escape leaves the editor.
          </Text>
        </section>

        <section aria-label="Result" className="playground__pane">
          <header className="playground__pane-head">
            <div className="playground__tabs" role="tablist">
              <button
                aria-selected={panel === 'preview'}
                className="playground__tab"
                onClick={() => setPanel('preview')}
                role="tab"
                type="button"
              >
                Preview
              </button>
              <button
                aria-selected={panel === 'output'}
                className="playground__tab"
                onClick={() => setPanel('output')}
                role="tab"
                type="button"
              >
                Compiled JS
              </button>
            </div>
            {panel === 'output' ? (
              <Button onClick={() => copy(compiled, 'js')} size="sm" variant="ghost">
                {copied === 'js' ? 'Copied' : 'Copy JS'}
              </Button>
            ) : null}
          </header>

          {error ? (
            <div className="playground__error" role="alert">
              <Text size="sm" weight="semibold">
                That did not compile
              </Text>
              <pre>{error}</pre>
            </div>
          ) : null}

          {panel === 'preview' ? (
            /*
             * `data-theme` on a wrapper, not on the document. Tokens are plain custom
             * properties and they inherit, so a nested `[data-theme="dark"]` gives a dark
             * island inside a light page - which is the honest way to demo the theme.
             */
            <div className="playground__stage" data-theme={dark ? 'dark' : undefined}>
              <div className="playground__viewport" style={{ width: VIEWPORTS[viewport].width }}>
                <PreviewBoundary onError={setError}>{element}</PreviewBoundary>
              </div>
            </div>
          ) : (
            <div className="playground__output">
              <pre>
                <code>{compiled || '// nothing compiled yet'}</code>
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
