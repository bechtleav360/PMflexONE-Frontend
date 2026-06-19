import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

import { AlertDescription } from './AlertDescription'
import { AlertTitle } from './AlertTitle'

const alertVariants = cva(
  'relative grid w-full grid-cols-[auto_1fr] items-start gap-x-md gap-y-1 rounded-lg border px-lg py-3.5 text-sm [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>*:not(svg)]:col-start-2',
  {
    variants: {
      variant: {
        default: 'bg-muted border-border text-foreground',
        info: 'bg-info-soft border-info/20 text-info',
        success: 'bg-success-soft border-success/20 text-success',
        warning: 'bg-warning-soft border-warning/20 text-warning-emphasis',
        destructive: 'bg-destructive-soft border-destructive/20 text-destructive',
        danger: 'bg-destructive-soft border-destructive/20 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = 'Alert'

export { Alert, AlertTitle, AlertDescription }
