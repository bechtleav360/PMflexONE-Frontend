import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const DESTRUCTIVE_CLASSES = 'bg-destructive-soft text-destructive-emphasis border-destructive/15'
const MUTED_CLASSES = 'bg-muted text-muted-foreground border-border'

const badgeVariants = cva(
  'inline-flex items-center gap-[5px] rounded-full border pl-sm pr-2.5 py-[3px] text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary-soft text-primary border-primary/15',
        success: 'bg-success-soft text-success-emphasis border-success/15',
        warning: 'bg-warning-soft text-warning-emphasis border-warning/15',
        /** @deprecated Use `destructive` instead */
        danger: DESTRUCTIVE_CLASSES,
        destructive: DESTRUCTIVE_CLASSES,
        secondary: MUTED_CLASSES,
        neutral: MUTED_CLASSES,
        outline: 'bg-transparent text-foreground border-border-strong',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant }), className)}
        {...props}
        ref={ref}
      />
    )
  },
)

Badge.displayName = 'Badge'

export { Badge }
