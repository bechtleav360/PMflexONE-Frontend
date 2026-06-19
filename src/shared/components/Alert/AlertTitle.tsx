import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-[3px] text-sm leading-none font-bold', className)}
      {...props}
    >
      {children}
    </h5>
  ),
)
AlertTitle.displayName = 'AlertTitle'

export { AlertTitle }
