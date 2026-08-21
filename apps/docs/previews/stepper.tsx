import { Stepper } from '@the_viveksingh/vivek-ui'

const STEPS = [
  { label: 'Account', description: 'Email and password' },
  { label: 'Workspace', description: 'Name and region' },
  { label: 'Billing', description: 'Card or invoice' },
  { label: 'Done', description: 'Invite your team' },
]

export default function StepperPreview({ name }: { name: string }) {
  if (name === 'vertical') {
    return <Stepper steps={STEPS} activeStep={1} orientation="vertical" label="Onboarding" />
  }
  if (name === 'strings') {
    return <Stepper steps={['Cart', 'Address', 'Payment']} activeStep={1} size="sm" />
  }
  return <Stepper steps={STEPS} activeStep={2} label="Onboarding" />
}
