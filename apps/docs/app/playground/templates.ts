/**
 * Playground starters.
 *
 * Each one must define a component called `App` — that is what the preview renders. They
 * are deliberately realistic rather than one-component demos, because the question people
 * arrive with is "can I build my screen with this", not "what does a Button look like".
 *
 * No import statements: every library export is already in scope, so a snippet pasted from
 * a docs page works with its import line removed.
 */
export interface Template {
  id: string
  label: string
  code: string
}

export const TEMPLATES: Template[] = [
  {
    id: 'welcome',
    label: 'Welcome',
    code: `function App() {
  const [count, setCount] = React.useState(0)

  return (
    <Stack gap={6}>
      <Heading level={1}>Hello from the playground</Heading>
      <Text tone="muted">
        Every export is already in scope. Edit this and it re-renders.
      </Text>

      <Card variant="elevated" padding="lg">
        <Card.Header>
          <Heading level={3}>Counter</Heading>
        </Card.Header>
        <Card.Body>
          <Text>Clicked {count} times.</Text>
        </Card.Body>
        <Card.Footer>
          <Button onClick={() => setCount(count + 1)}>Click me</Button>
          <Button variant="outline" onClick={() => setCount(0)}>Reset</Button>
        </Card.Footer>
      </Card>
    </Stack>
  )
}`,
  },
  {
    id: 'login',
    label: 'Login form',
    code: `function App() {
  const [email, setEmail] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const invalid = submitted && !email.includes('@')

  return (
    <Card padding="lg" style={{ maxWidth: '24rem', margin: '0 auto' }}>
      <Card.Header>
        <Heading level={2}>Sign in</Heading>
        <Text tone="muted" size="sm">Welcome back.</Text>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <Field
            label="Email"
            error={invalid ? 'Enter a valid email address.' : undefined}
          >
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <PasswordInput autoComplete="current-password" strength />
          </Field>
          <Checkbox label="Remember me" />
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button fullWidth onClick={() => setSubmitted(true)}>Sign in</Button>
      </Card.Footer>
    </Card>
  )
}`,
  },
  {
    id: 'dashboard',
    label: 'Dashboard with charts',
    code: `function App() {
  const revenue = [
    { x: 'Jan', y: 1200 }, { x: 'Feb', y: 2600 }, { x: 'Mar', y: 2450 },
    { x: 'Apr', y: 3800 }, { x: 'May', y: 3200 }, { x: 'Jun', y: 4600 },
  ]

  const rows = [
    { id: 'u1', name: 'Ada Lovelace', plan: 'Pro', mrr: 90 },
    { id: 'u2', name: 'Alan Turing', plan: 'Free', mrr: 0 },
    { id: 'u3', name: 'Grace Hopper', plan: 'Pro', mrr: 90 },
    { id: 'u4', name: 'Katherine Johnson', plan: 'Team', mrr: 240 },
  ]

  return (
    <Stack gap={6}>
      <Stats
        items={[
          { id: 'mrr', value: '$4,600', label: 'MRR' },
          { id: 'users', value: '1,284', label: 'Users' },
          { id: 'churn', value: '1.8%', label: 'Churn' },
        ]}
      />

      <Grid cols={{ base: 1, lg: 2 }} gap={6}>
        <Card padding="lg">
          <Card.Header><Heading level={3}>Revenue</Heading></Card.Header>
          <Card.Body>
            <LineChart data={revenue} height={220} showGrid title="Revenue" />
          </Card.Body>
        </Card>
        <Card padding="lg">
          <Card.Header><Heading level={3}>By month</Heading></Card.Header>
          <Card.Body>
            <BarChart data={revenue} height={220} title="Revenue by month" />
          </Card.Body>
        </Card>
      </Grid>

      <Card padding="lg">
        <Card.Header><Heading level={3}>Customers</Heading></Card.Header>
        <Card.Body>
          <DataTable
            data={rows}
            rowKey="id"
            searchable
            caption="Customers"
            columns={[
              { key: 'name', header: 'Name', sortable: true },
              { key: 'plan', header: 'Plan', sortable: true },
              { key: 'mrr', header: 'MRR', align: 'end', numeric: true, sortable: true,
                render: (row) => '$' + row.mrr },
            ]}
          />
        </Card.Body>
      </Card>
    </Stack>
  )
}`,
  },
  {
    id: 'chat',
    label: 'AI chat panel',
    code: `function App() {
  const [messages, setMessages] = React.useState([
    { id: 'm1', role: 'user', content: 'What is this library?' },
    { id: 'm2', role: 'assistant', content: 'A zero-dependency React component library.' },
  ])
  const [busy, setBusy] = React.useState(false)

  const send = (value) => {
    const id = 'm' + (messages.length + 1)
    setMessages((prev) => [...prev, { id, role: 'user', content: value }])
    setBusy(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: id + 'r', role: 'assistant', content: 'Echo: ' + value },
      ])
      setBusy(false)
    }, 700)
  }

  return (
    <Card padding="none" style={{ height: '32rem', display: 'flex', flexDirection: 'column' }}>
      <ChatThread messages={messages} loading={busy} style={{ flex: 1 }} />
      <ChatInput onSubmit={send} busy={busy} placeholder="Ask something" />
    </Card>
  )
}`,
  },
  {
    id: 'landing',
    label: 'Landing page',
    code: `function App() {
  return (
    <>
      <Hero
        eyebrow="New"
        title="Ship your website in a weekend"
        description="Every section you need, one npm install away."
        actions={
          <>
            <Button size="lg">Start free</Button>
            <Button size="lg" variant="outline">Read the docs</Button>
          </>
        }
      />
      <FeatureGrid
        title="Why it is different"
        features={[
          { id: 'a', title: 'Zero dependencies', description: 'Nothing but React.' },
          { id: 'b', title: 'Server safe', description: 'Most components need no client boundary.' },
          { id: 'c', title: 'Accessible', description: 'Tested with axe, not asserted.' },
        ]}
      />
      <Pricing
        title="Pricing"
        plans={[
          { id: 'free', name: 'Free', price: '$0', features: ['1 project', 'Community support'] },
          { id: 'pro', name: 'Pro', price: '$9', period: '/mo', highlighted: true,
            badge: 'Popular', features: ['Unlimited projects', 'Email support'] },
        ]}
      />
      <FAQ
        title="Questions"
        items={[
          { id: 'q1', question: 'Is it really free?', answer: 'MIT licensed, forever.' },
          { id: 'q2', question: 'Does it work with Next.js?', answer: 'Both routers.' },
        ]}
      />
      <CTA title="Get started" actions={<Button size="lg">Install</Button>} />
    </>
  )
}`,
  },
  {
    id: 'settings',
    label: 'Settings page',
    code: `function App() {
  return (
    <Tabs defaultValue="general">
      <Tabs.List>
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
        <Tabs.Tab value="danger">Danger zone</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel value="general">
          <Stack gap={4} style={{ maxWidth: '28rem' }}>
            <Field label="Display name"><Input defaultValue="Ada Lovelace" /></Field>
            <Field label="Time zone">
              <Select
                options={[
                  { value: 'utc', label: 'UTC' },
                  { value: 'ist', label: 'India Standard Time' },
                ]}
              />
            </Field>
            <Field label="Tags"><TagInput defaultValue={['engineering', 'compilers']} /></Field>
            <Button>Save changes</Button>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="notifications">
          <Stack gap={4}>
            <Switch label="Email digests" description="A weekly summary." defaultChecked />
            <Switch label="Product updates" />
            <Switch label="Security alerts" defaultChecked />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="danger">
          <Alert tone="danger" title="Delete this workspace">
            This cannot be undone.
          </Alert>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  )
}`,
  },
]
