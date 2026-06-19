import * as React from 'react'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'

import { cn } from '@/shared/lib/utils'

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn('bg-border my-xs h-px', className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

export { ContextMenuSeparator }
