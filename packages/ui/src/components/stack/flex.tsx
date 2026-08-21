import { forwardRef } from 'react'
import { Stack, type StackProps } from './stack'

export interface FlexProps extends Omit<StackProps, 'direction'> {
  direction?: StackProps['direction']
}

/** `Stack` that runs horizontally by default. */
export const Flex = forwardRef<HTMLElement, FlexProps>(function Flex(
  { direction = 'horizontal', ...rest },
  ref,
) {
  return <Stack ref={ref} direction={direction} {...rest} />
})
