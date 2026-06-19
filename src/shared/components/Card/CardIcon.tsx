import * as React from 'react'

import { cn } from '@/shared/lib/utils'

/**
 * Square icon container used in card headers to hold a colored icon.
 * @param props - Div props; use `className` to set a background color token.
 * @returns A flex container sized for a single icon.
 */
const CardIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-[9px]',
        className,
      )}
      {...props}
    />
  ),
)
CardIcon.displayName = 'CardIcon'

export { CardIcon }
