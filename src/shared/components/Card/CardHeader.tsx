import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'pt-lg pb-md flex flex-row items-start justify-between gap-[12px] border-b px-5',
        className,
      )}
      {...props}
    />
  ),
)
CardHeader.displayName = 'CardHeader'

export { CardHeader }
