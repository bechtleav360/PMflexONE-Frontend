import * as React from 'react'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'

import { cn } from '@/shared/lib/utils'

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-md pb-xs text-muted-foreground pt-[6px] text-[11px] font-bold tracking-[.07em] uppercase',
      inset && 'pl-2xl',
      className,
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

export { ContextMenuLabel }
