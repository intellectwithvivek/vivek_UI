/**
 * Public API surface of `@the_viveksingh/vivek-ui`.
 *
 * Only components and their prop types are exported. Internal `hooks/` and `utils/`
 * stay unexported so they can be refactored without a major version bump.
 */

// feedback
export { Alert, type AlertProps } from './components/alert'
// layout
export { AspectRatio, type AspectRatioProps } from './components/aspect-ratio'
// data display
export { Avatar, type AvatarGroupProps, type AvatarProps } from './components/avatar'
export { Badge, type BadgeProps } from './components/badge'
export { Box, type BoxProps } from './components/box'
// actions
export { Button, type ButtonProps } from './components/button'
export { ButtonGroup, type ButtonGroupProps } from './components/button-group'
export { Card, type CardProps, type CardSlotProps } from './components/card'
// typography
export { Code, type CodeProps } from './components/code'
export { Container, type ContainerProps } from './components/container'
export { Divider, type DividerProps } from './components/divider'
export { Grid, type GridProps, type ResponsiveCols } from './components/grid'
export { Heading, type HeadingProps } from './components/heading'
export { IconButton, type IconButtonProps } from './components/icon-button'
export { Kbd, type KbdProps } from './components/kbd'
export { Progress, type ProgressProps } from './components/progress'
export { Skeleton, type SkeletonProps } from './components/skeleton'
export { Spinner, type SpinnerProps } from './components/spinner'
export {
  Flex,
  type FlexProps,
  Stack,
  type StackAlign,
  type StackGap,
  type StackJustify,
  type StackProps,
} from './components/stack'
export { Text, type TextProps } from './components/text'
