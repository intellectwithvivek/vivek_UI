import { useState } from 'react'
// Imports the package by NAME, never a relative path into packages/ui/src.
// That is the point of this app: it exercises the real exports map and the built
// dist/, exactly as an npm consumer would (ARCHITECTURE §7).
import { Button, type ButtonProps } from 'vivek-ui'

const VARIANTS: NonNullable<ButtonProps['variant']>[] = ['solid', 'outline', 'ghost', 'link']
const SIZES: NonNullable<ButtonProps['size']>[] = ['sm', 'md', 'lg']

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    // Dark mode is one attribute on <html>. No provider, no context, no JS required
    // for the CSS itself to work (ARCHITECTURE §3.3).
    if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
  }

  return (
    <main>
      <header className="pg-header">
        <div>
          <div className="pg-title">VivekUI playground</div>
          <div className="pg-subtitle">
            Consuming <code>vivek-ui</code> through its exports map — same as npm.
          </div>
        </div>
        <Button variant="outline" onClick={toggleTheme}>
          {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
        </Button>
      </header>

      <section className="pg-section">
        <h2 className="pg-section-title">Every variant, every size</h2>
        <div className="pg-matrix">
          <div />
          {SIZES.map((size) => (
            <div key={size} className="pg-matrix-label">
              size="{size}"
            </div>
          ))}
          {VARIANTS.map((variant) => (
            <FragmentRow key={variant} variant={variant} />
          ))}
        </div>
      </section>

      <section className="pg-section">
        <h2 className="pg-section-title">States</h2>
        <div className="pg-row">
          <Button loading>Saving changes</Button>
          <Button variant="outline" loading>
            Loading outline
          </Button>
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled outline
          </Button>
        </div>
        <p className="pg-note">
          <code>loading</code> also disables the button, so a click cannot fire twice.
        </p>
      </section>

      <section className="pg-section">
        <h2 className="pg-section-title">Full width</h2>
        <div className="pg-stack">
          <Button fullWidth size="lg">
            Start free
          </Button>
          <Button fullWidth variant="outline">
            Read the docs
          </Button>
        </div>
      </section>

      <section className="pg-section">
        <h2 className="pg-section-title">Consumer overrides win</h2>
        <div className="pg-row">
          <Button className="pg-override">Overridden by one flat class</Button>
          <Button style={{ borderRadius: 0 }}>Overridden by inline style</Button>
        </div>
        <p className="pg-note">
          Library selectors are wrapped in <code>:where()</code>, so a plain{' '}
          <code>.pg-override</code> beats <code>.vk-button[data-variant="solid"]</code> with no{' '}
          <code>!important</code>.
        </p>
      </section>

      <section className="pg-section">
        <h2 className="pg-section-title">Host props pass through</h2>
        <form
          className="pg-row"
          onSubmit={(event) => {
            event.preventDefault()
            window.alert('submitted via type="submit"')
          }}
        >
          <Button type="submit">Submit</Button>
          <Button type="reset" variant="ghost">
            Reset
          </Button>
          <Button aria-label="Icon-only action" variant="outline">
            ★
          </Button>
        </form>
      </section>
    </main>
  )
}

function FragmentRow({ variant }: { variant: NonNullable<ButtonProps['variant']> }) {
  return (
    <>
      <div className="pg-matrix-label">{variant}</div>
      {SIZES.map((size) => (
        <div key={size}>
          <Button variant={variant} size={size}>
            Button
          </Button>
        </div>
      ))}
    </>
  )
}
