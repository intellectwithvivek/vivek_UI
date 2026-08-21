/**
 * Contract test: a realistic API response must be able to drive the whole library.
 *
 * This exists because "can developers actually map their data into this?" is the question
 * that decides whether a component library is usable, and it is not answered by unit
 * tests of individual components.
 *
 * Every shape below is deliberately WRONG for the components — snake_case, different
 * field names, nested objects, nulls, strings where numbers are wanted — because that is
 * what a real backend returns. Nothing here is tailored to the library.
 */
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { BarChart } from './charts/bar-chart'
import { LineChart } from './charts/line-chart'
import { DataTable } from './components/data-table'
import { FAQ } from './components/faq'
import { FeatureGrid } from './components/feature-grid'
import { Footer } from './components/footer'
import { Pricing } from './components/pricing'
import { Select } from './components/select'
import { Stats } from './components/stats'
import { Testimonials } from './components/testimonials'

// ---------------------------------------------------------------- an API payload
const API = {
  capabilities: [
    { id: 7, headline: 'Zero deps', blurb: 'Nothing to install.', glyph: null },
    { id: 9, headline: 'Server safe', blurb: 'RSC by default.', glyph: null },
  ],
  tiers: [
    { sku: 'free', display_name: 'Free', amount_cents: 0, perks: ['1 project'], popular: false },
    { sku: 'pro', display_name: 'Pro', amount_cents: 900, perks: ['Unlimited'], popular: true },
  ],
  reviews: [
    { review_id: 'r1', body: 'Shipped in a day.', reviewer: { name: 'Ada', title: 'CTO' } },
  ],
  help: [{ q_id: 1, q: 'Is it free?', a: 'MIT, forever.' }],
  kpis: { mrr_cents: 1234500, churn_pct: 1.8, seats: 42 },
  revenue_series: [
    { month: '2026-01', total_cents: 120000 },
    { month: '2026-02', total_cents: 260000 },
    { month: '2026-03', total_cents: 245000 },
  ],
  users: [
    { user_id: 'u1', full_name: 'Ada Lovelace', team: { name: 'Eng' }, joined_at: '2026-01-04' },
    { user_id: 'u2', full_name: 'Alan Turing', team: null, joined_at: '2026-02-11' },
  ],
  nav: {
    legal: [
      { text: 'Terms', url: '/terms' },
      { text: 'Mail', url: 'mailto:a@b.co' },
    ],
  },
  regions: [
    { code: 'eu', name: 'Europe' },
    { code: 'us', name: 'Americas' },
  ],
}

// A real formatter, not string concatenation - Intl is built in, so this needs no
// dependency either.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const money = (cents: number) => usd.format(cents / 100)

describe('data mapping: an untailored API payload drives every component', () => {
  it('maps sections with a plain .map() per component', () => {
    render(
      <div>
        <FeatureGrid
          features={API.capabilities.map((c) => ({
            title: c.headline,
            description: c.blurb,
            icon: c.glyph ?? undefined,
          }))}
        />
        <Pricing
          plans={API.tiers.map((t) => ({
            name: t.display_name,
            price: t.amount_cents === 0 ? 'Free' : money(t.amount_cents),
            period: t.amount_cents === 0 ? undefined : '/mo',
            features: t.perks,
            highlighted: t.popular,
          }))}
        />
        <Testimonials
          items={API.reviews.map((r) => ({
            quote: r.body,
            author: r.reviewer.name,
            role: r.reviewer.title,
          }))}
        />
        <FAQ items={API.help.map((h) => ({ question: h.q, answer: h.a }))} />
        <Stats
          items={[
            { value: money(API.kpis.mrr_cents), label: 'MRR' },
            { value: `${API.kpis.churn_pct}%`, label: 'Churn' },
            { value: String(API.kpis.seats), label: 'Seats' },
          ]}
        />
        <Footer
          columns={[
            { title: 'Legal', links: API.nav.legal.map((l) => ({ label: l.text, href: l.url })) },
          ]}
        />
      </div>,
    )

    expect(screen.getByText('Zero deps')).toBeInTheDocument()
    expect(screen.getByText('$9.00')).toBeInTheDocument()
    expect(screen.getByText('Shipped in a day.')).toBeInTheDocument()
    expect(screen.getByText('Is it free?')).toBeInTheDocument()
    expect(screen.getByText('$12,345.00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mail' })).toHaveAttribute('href', 'mailto:a@b.co')
  })

  it('feeds charts by mapping to the {x, y} shape', () => {
    render(
      <div>
        <LineChart
          data={API.revenue_series.map((p) => ({ x: p.month, y: p.total_cents / 100 }))}
          title="Revenue"
        />
        <BarChart
          data={API.revenue_series.map((p) => ({ x: p.month, y: p.total_cents / 100 }))}
          title="Monthly"
        />
      </div>,
    )
    // The accessible table fallback is where the mapped numbers become assertable.
    expect(screen.getAllByRole('img', { name: /Revenue|Monthly/ })).toHaveLength(2)
  })

  it('feeds DataTable with NO pre-transform, using render + sortAccessor', () => {
    // This is the payoff: raw snake_case rows, nested objects and nulls go straight in.
    render(
      <DataTable
        data={API.users}
        rowKey="user_id"
        columns={[
          { key: 'full_name', header: 'Name', sortable: true },
          {
            key: 'team',
            header: 'Team',
            render: (row) => row.team?.name ?? '—',
            sortAccessor: (row) => row.team?.name ?? '',
            sortable: true,
          },
          {
            key: 'joined_at',
            header: 'Joined',
            align: 'end',
            render: (row) => new Date(row.joined_at).toLocaleDateString('en-GB'),
            sortable: true,
          },
        ]}
        caption="Users"
      />,
    )
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Eng')).toBeInTheDocument()
    // The null team renders the placeholder rather than crashing.
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('feeds form controls from a lookup table', () => {
    render(
      <Select
        aria-label="Region"
        options={API.regions.map((r) => ({ value: r.code, label: r.name }))}
      />,
    )
    expect(screen.getByRole('option', { name: 'Europe' })).toHaveValue('eu')
  })

  it('renders the whole mapped page on the server', () => {
    const html = renderToStaticMarkup(
      <div>
        <FeatureGrid
          features={API.capabilities.map((c) => ({ title: c.headline, description: c.blurb }))}
        />
        <Stats items={[{ value: money(API.kpis.mrr_cents), label: 'MRR' }]} />
        <LineChart
          data={API.revenue_series.map((p) => ({ x: p.month, y: p.total_cents / 100 }))}
          title="Revenue"
        />
      </div>,
    )
    expect(html).toContain('Zero deps')
    expect(html).toContain('$12,345.00')
    expect(html).not.toContain('NaN')
    expect(html).not.toContain('undefined')
  })

  it('survives an empty payload everywhere', () => {
    expect(() =>
      render(
        <div>
          <FeatureGrid features={[]} />
          <Pricing plans={[]} />
          <Testimonials items={[]} />
          <FAQ items={[]} />
          <Stats items={[]} />
          <LineChart data={[]} title="Empty" />
          <BarChart data={[]} title="Empty" />
          <DataTable data={[]} rowKey="user_id" columns={[]} caption="None" />
        </div>,
      ),
    ).not.toThrow()
  })
  it('accepts an id so duplicate content values do not collide', () => {
    // The fallback key is a content field (author, label, title). Real API data happily
    // contains two reviews by the same person or two metrics with the same label, which
    // would collide and make React mis-attach state across a reorder. `id` fixes it.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <div>
        <Testimonials
          items={[
            { id: 'r1', quote: 'First.', author: 'Ada' },
            { id: 'r2', quote: 'Second.', author: 'Ada' },
          ]}
        />
        <Stats
          items={[
            { id: 'eu', value: '1', label: 'Users' },
            { id: 'us', value: '2', label: 'Users' },
          ]}
        />
        <FeatureGrid
          features={[
            { id: 1, title: 'Fast', description: 'a' },
            { id: 2, title: 'Fast', description: 'b' },
          ]}
        />
      </div>,
    )
    const warnings = spy.mock.calls.map((call) => String(call[0])).join(String.fromCharCode(10))
    spy.mockRestore()
    expect(warnings).not.toMatch(/same key|duplicate/i)
  })
})
