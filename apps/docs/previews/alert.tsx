import { Alert, Stack } from '@the_viveksingh/vivek-ui'

export default function AlertPreview() {
  return (
    <Stack gap={3}>
      <Alert tone="info" title="Heads up">
        Deploys take about a minute.
      </Alert>
      <Alert tone="success" title="Saved">
        Your changes are live.
      </Alert>
      <Alert tone="warning" title="Check this">
        Your trial ends tomorrow.
      </Alert>
      <Alert tone="danger" title="Payment failed">
        Try another card.
      </Alert>
    </Stack>
  )
}
