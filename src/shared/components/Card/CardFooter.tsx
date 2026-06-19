import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('gap-sm py-md bg-muted flex items-center justify-end border-t px-5', className)}
      {...props}
    />
  ),
)
CardFooter.displayName = 'CardFooter'

export { CardFooter }
