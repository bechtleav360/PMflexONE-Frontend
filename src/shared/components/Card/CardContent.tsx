import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('py-lg px-5', className)}
      {...props}
    />
  ),
)
CardContent.displayName = 'CardContent'

export { CardContent }
