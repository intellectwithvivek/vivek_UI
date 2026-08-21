import { Timeline } from '@the_viveksingh/vivek-ui'

export default function TimelinePreview({ name }: { name: string }) {
  if (name === 'horizontal') {
    return (
      <Timeline orientation="horizontal">
        <Timeline.Item title="Ordered" status="complete" timestamp="Mon" />
        <Timeline.Item title="Packed" status="complete" timestamp="Tue" />
        <Timeline.Item title="Shipped" status="current" timestamp="Wed" />
        <Timeline.Item title="Delivered" status="pending" timestamp="Fri" />
      </Timeline>
    )
  }
  return (
    <Timeline>
      <Timeline.Item
        title="Pull request opened"
        description="feat: forms milestone, 9 components and useControllableState."
        timestamp="2 days ago"
        status="complete"
      />
      <Timeline.Item
        title="Review requested"
        description="Two approvals needed before merge."
        timestamp="Yesterday"
        status="complete"
      />
      <Timeline.Item
        title="Checks running"
        description="typecheck, lint, test, build, size-limit."
        timestamp="Just now"
        status="current"
      />
      <Timeline.Item title="Merge to main" timestamp="Pending" status="pending" />
    </Timeline>
  )
}
