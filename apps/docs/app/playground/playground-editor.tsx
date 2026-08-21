'use client'

import * as ui from '@the_viveksingh/vivek-ui'
import { Alert, Button, Select, Stack, Text, Textarea } from '@the_viveksingh/vivek-ui'
import * as charts from '@the_viveksingh/vivek-ui/charts'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { transform } from 'sucrase'
import { prepareSource } from '../../lib/prepare-source'
import { TEMPLATES } from './templates'

const STORAGE_KEY = 'vk-playground-draft'

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

/**
 * The playground.
 *
 * Sucrase, not the TypeScript compiler: it strips types in ~30 kB rather than shipping a
 * ~3 MB compiler to the browser. It does no type checking, which is the right trade here —
 * the point is to run code, and the editor is not where type errors get caught.
 *
 * The compiled function receives every library export plus React, so any example from the
 * docs can be pasted in and just work.
 */
export function PlaygroundEditor() {
  const [code, setCode] = useState(TEMPLATES[0]?.code ?? '')
  const [error, setError] = useState<string | null>(null)
  const [element, setElement] = useState<React.ReactNode>(null)
  const [ready, setReady] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      // examples are written as modules, so normalise them first - otherwise pasting one
      // fails with "Unexpected token 'default'".
      const prepared = prepareSource(source)
      const { code: js } = transform(prepared.code, {
        transforms: ['typescript', 'jsx'],
        production: true,
      })
      const scope = { ...ui, ...charts, React, ...React }
      const names = Object.keys(scope)
      const factory = new Function(
        ...names,
        `${js};
return ${prepared.resolver};`,
      )
      const Component = factory(...names.map((name) => (scope as Record<string, unknown>)[name]))
      if (typeof Component !== 'function') {
        setError(
          prepared.candidates.length > 0
            ? `Could not find a component to render. Looked for: ${prepared.candidates.join(', ')}.`
            : 'Define a component - `function App() { … }` - and it will render here.',
        )
        return
      }
      setError(null)
      setElement(React.createElement(Component as React.ComponentType))
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : String(thrown))
    }
  }, [])

  // Debounced: recompiling on every keystroke makes typing feel laggy.
  useEffect(() => {
    if (!ready) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      compile(code)
      try {
        window.localStorage.setItem(STORAGE_KEY, code)
      } catch {
        // Not persisting is acceptable.
      }
    }, 300)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [code, ready, compile])

  const share = () => {
    try {
      const hash = `#code=${btoa(encodeURIComponent(code))}`
      window.history.replaceState(null, '', hash)
      void navigator.clipboard?.writeText(window.location.href)
    } catch {
      setError('Could not build a shareable link for this code.')
    }
  }

  const options = useMemo(
    () => TEMPLATES.map((template) => ({ value: template.id, label: template.label })),
    [],
  )

  return (
    <div className="playground">
      <div className="playground__bar">
        <Select
          aria-label="Starter template"
          onChange={(event) => {
            const found = TEMPLATES.find((template) => template.id === event.target.value)
            if (found) setCode(found.code)
          }}
          options={options}
          size="sm"
        />
        <Stack direction="horizontal" gap={2}>
          <Button onClick={share} size="sm" variant="outline">
            Copy share link
          </Button>
          <Button onClick={() => setCode(TEMPLATES[0]?.code ?? '')} size="sm" variant="ghost">
            Reset
          </Button>
        </Stack>
      </div>

      <div className="playground__split">
        <div className="playground__editor">
          <Textarea
            aria-label="Playground source code"
            onChange={(event) => setCode(event.target.value)}
            resize="none"
            spellCheck={false}
            value={code}
          />
        </div>
        <div className="playground__preview">
          {error ? (
            <Alert title="That did not compile" tone="danger">
              <Text size="sm">
                <code>{error}</code>
              </Text>
            </Alert>
          ) : null}
          <PreviewBoundary onError={setError}>{element}</PreviewBoundary>
        </div>
      </div>
    </div>
  )
}
