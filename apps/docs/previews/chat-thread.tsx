import { Avatar, ChatThread, ChatThreadEmpty } from '@the_viveksingh/vivek-ui'

// A fixed instant, not a local wall-clock time: the same Date on the server and in the browser.
const NOW = new Date('2026-08-21T10:42:00Z')

const MESSAGES = [
  { id: '1', role: 'system' as const, content: 'Support session started.' },
  {
    id: '2',
    role: 'user' as const,
    name: 'You',
    avatar: <Avatar name="Vivek Kumar Singh" size="sm" />,
    content: 'Does the library work with Tailwind?',
    timestamp: NOW,
    status: 'sent' as const,
  },
  {
    id: '3',
    role: 'assistant' as const,
    name: 'Assistant',
    avatar: <Avatar fallback="AI" size="sm" />,
    content:
      'It does. The components ship plain CSS with zero specificity, so Tailwind utilities on the same element override them without a plugin or a preflight tweak.',
    timestamp: NOW,
  },
  {
    id: '4',
    role: 'user' as const,
    name: 'You',
    avatar: <Avatar name="Vivek Kumar Singh" size="sm" />,
    content: 'And in Server Components?',
    timestamp: NOW,
    status: 'sent' as const,
  },
]

export default function ChatThreadPreview({ name }: { name: string }) {
  if (name === 'empty') {
    return (
      <ChatThread
        style={{ height: '14rem' }}
        emptyState={<ChatThreadEmpty>No messages yet. Ask anything.</ChatThreadEmpty>}
      />
    )
  }
  if (name === 'loading') {
    return <ChatThread style={{ height: '18rem' }} messages={MESSAGES} loading />
  }
  return <ChatThread style={{ height: '20rem' }} messages={MESSAGES} />
}
