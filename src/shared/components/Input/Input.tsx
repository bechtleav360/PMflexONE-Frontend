import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary aria-invalid:border-destructive bg-card px-md hover:border-border-strong flex h-11 w-full rounded-md border py-0 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:[box-shadow:var(--focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
