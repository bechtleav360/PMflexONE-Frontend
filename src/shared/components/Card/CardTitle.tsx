import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-[15px] leading-none font-bold', className)}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

export { CardTitle }
