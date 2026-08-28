'use client'

import { Code, CopyButton, Segmented } from '@the_viveksingh/vivek-ui'
import { useEffect, useState } from 'react'
import { toJavaScript } from '../lib/to-javascript'

export interface CodeBlockProps {
  /** The TypeScript source. The JavaScript tab is derived from it. */
  code: string
  language?: string
  filename?: string
  /** Skip the JS/TS tabs — for shell commands, CSS and anything not TypeScript. */
  plain?: boolean
}

const STORAGE_KEY = 'vk-docs-language'

/**
 * A code block with a JavaScript / TypeScript toggle.
 *
 * The choice is deliberately global and persisted: a developer picks a language once, and
 * every example on every page should follow. Reading it in an effect rather than during
 * render keeps the server and first client render identical, so there is no hydration
 * mismatch — the same discipline the library's own `Clock` and `Countdown` use.
 */
export function CodeBlock({ code, language = 'tsx', filename, plain }: CodeBlockProps) {
  const [lang, setLang] = useState<'ts' | 'js'>('ts')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'js' || stored === 'ts') setLang(stored)
    } catch {
      // Private mode throws on access. The default is fine.
    }
  }, [])

  const choose = (next: string) => {
    const value = next === 'js' ? 'js' : 'ts'
    setLang(value)
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Not persisting is acceptable; breaking the toggle is not.
    }
  }

  if (plain) {
    return (
      <div className="code-block">
        <div className="code-block__bar">
          <span className="code-block__name">{filename ?? language}</span>
          <CopyButton value={code} size="sm" variant="ghost" />
        </div>
        <Code block>{code}</Code>
      </div>
    )
  }

  const shown = lang === 'js' ? toJavaScript(code) : code

  return (
    <div className="code-block">
      <div className="code-block__bar">
        {filename ? <span className="code-block__name">{filename}</span> : null}
        {/*
          Segmented, not Tabs. This is exactly why Segmented exists: rendering Tabs here
          shipped role="tab" with aria-controls pointing at panels that were never rendered
          - twelve dangling references per docs page, on ~100 pages. A language toggle
          reveals nothing; it is one choice from two, which is a radiogroup.
        */}
        <Segmented
          label="Code language"
          onValueChange={(next) => choose(next as 'ts' | 'js')}
          options={[
            { value: 'ts', label: 'TS' },
            { value: 'js', label: 'JS' },
          ]}
          size="sm"
          value={lang}
        />
        <CopyButton value={shown} size="sm" variant="ghost" />
      </div>
      <Code block>{shown}</Code>
    </div>
  )
}
