import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-muted-foreground text-[13px]', className)}
      {...props}
    />
  ),
)
CardDescription.displayName = 'CardDescription'

export { CardDescription }
