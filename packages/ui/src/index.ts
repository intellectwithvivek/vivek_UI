// biome-ignore-all assist/source/organizeImports: exports are grouped by category
// (layout, typography, actions, forms, overlays, sections, feedback) because that
// grouping is the map of a 60-export public API. Alphabetising would erase it.

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
// forms
export { Checkbox, type CheckboxProps } from './components/checkbox'
// typography
export { Code, type CodeProps } from './components/code'
export { Container, type ContainerProps } from './components/container'
export { Divider, type DividerProps } from './components/divider'
export { Field, type FieldProps } from './components/field'
export { Grid, type GridProps, type ResponsiveCols } from './components/grid'
export { Heading, type HeadingProps } from './components/heading'
export { IconButton, type IconButtonProps } from './components/icon-button'
export { Input, type InputProps } from './components/input'
export { Kbd, type KbdProps } from './components/kbd'
export { Label, type LabelProps } from './components/label'
export { Progress, type ProgressProps } from './components/progress'
export {
  Radio,
  RadioGroup,
  type RadioGroupProps,
  type RadioOption,
  type RadioProps,
} from './components/radio-group'
export { Select, type SelectOption, type SelectProps } from './components/select'
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
export { Switch, type SwitchProps } from './components/switch'
export { Text, type TextProps } from './components/text'
export { Textarea, type TextareaProps } from './components/textarea'

// overlays
export {
  Accordion,
  type AccordionContentProps,
  type AccordionItemProps,
  type AccordionProps,
  type AccordionSize,
  type AccordionTriggerProps,
  type AccordionVariant,
} from './components/accordion'
export {
  Drawer,
  type DrawerCloseButtonProps,
  type DrawerFocusRef,
  type DrawerProps,
  type DrawerSide,
  type DrawerSize,
  type DrawerSlotProps,
  type DrawerTitleProps,
} from './components/drawer'
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemProps,
  DropdownMenuContent,
  type DropdownMenuContentProps,
  DropdownMenuItem,
  type DropdownMenuItemProps,
  DropdownMenuLabel,
  type DropdownMenuLabelProps,
  type DropdownMenuProps,
  DropdownMenuSeparator,
  type DropdownMenuSeparatorProps,
  DropdownMenuTrigger,
  type DropdownMenuTriggerProps,
} from './components/dropdown-menu'
export {
  Modal,
  type ModalCloseButtonProps,
  type ModalFocusRef,
  type ModalProps,
  type ModalSize,
  type ModalSlotProps,
  type ModalTitleProps,
} from './components/modal'
export {
  Popover,
  PopoverClose,
  type PopoverCloseProps,
  PopoverContent,
  type PopoverContentProps,
  type PopoverProps,
  PopoverTrigger,
  type PopoverTriggerProps,
} from './components/popover'
export { Portal, type PortalContainer, type PortalProps } from './components/portal'
export {
  Tabs,
  type TabsActivationMode,
  type TabsListProps,
  type TabsOrientation,
  type TabsPanelProps,
  type TabsPanelsProps,
  type TabsProps,
  type TabsSize,
  type TabsTabProps,
  type TabsVariant,
} from './components/tabs'
export {
  Toast,
  type ToastApi,
  type ToastOptions,
  type ToastPosition,
  ToastProvider,
  type ToastProviderProps,
  type ToastProps,
  type ToastRecord,
  type ToastTone,
  useToast,
} from './components/toast'
export { Tooltip, type TooltipProps, type TooltipTriggerProps } from './components/tooltip'

// page sections
export { CTA, type CTAProps } from './components/cta'
export { FAQ, type FAQProps, type FaqItem } from './components/faq'
export { type Feature, FeatureGrid, type FeatureGridProps } from './components/feature-grid'
export { Footer, type FooterColumn, type FooterLink, type FooterProps } from './components/footer'
export { Hero, type HeroProps } from './components/hero'
export { type Logo, LogoCloud, type LogoCloudProps } from './components/logo-cloud'
export { Pricing, type PricingPlan, type PricingProps } from './components/pricing'
export {
  type HeadingLevel,
  Section,
  type SectionHeaderProps,
  type SectionProps,
} from './components/section'
export { type Stat, Stats, type StatsProps } from './components/stats'
export {
  type Testimonial,
  Testimonials,
  type TestimonialsProps,
} from './components/testimonials'

