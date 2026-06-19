import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-ring hover:border-border-strong flex min-h-[88px] w-full resize-y rounded-md border px-3 py-2.5 text-sm leading-normal transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
