'use client'

import { Button, Stack, Toast, ToastProvider, useToast } from '@the_viveksingh/vivek-ui'

function Triggers() {
  const { toast, dismissAll } = useToast()
  return (
    <Stack direction="horizontal" gap={3} wrap>
      <Button
        size="sm"
        onClick={() =>
          toast({ title: 'Invoice sent', description: 'Northwind will get it shortly.' })
        }
      >
        Info
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          toast({ tone: 'success', title: 'Saved', description: 'All changes stored.' })
        }
      >
        Success
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          toast({
            tone: 'danger',
            title: 'Payment failed',
            description: 'The card was declined.',
            duration: null,
          })
        }
      >
        Danger, sticky
      </Button>
      <Button size="sm" variant="ghost" onClick={dismissAll}>
        Dismiss all
      </Button>
    </Stack>
  )
}

export default function ToastPreview({ name }: { name: string }) {
  if (name === 'standalone') {
    return (
      <Stack gap={3}>
        <Toast title="Invoice sent" description="Northwind will get it shortly." />
        <Toast tone="success" title="Deploy finished" description="Live in 4 regions." />
        <Toast tone="warning" title="Storage almost full" description="92% of 10 GB used." />
        <Toast tone="danger" title="Payment failed" description="The card was declined." />
      </Stack>
    )
  }
  return (
    <ToastProvider position="bottom-end" duration={4000}>
      <Triggers />
    </ToastProvider>
  )
}
