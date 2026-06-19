import * as React from 'react'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'

import { cn } from '@/shared/lib/utils'

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
    variant?: 'default' | 'destructive'
  }
>(({ className, inset, variant = 'default', ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      'px-md relative flex min-h-[44px] cursor-pointer items-center gap-[10px] rounded-sm py-[10px] text-sm transition-colors outline-none select-none',
      'focus:bg-muted',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      '[&_svg]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-2xl',
      variant === 'destructive' &&
        'text-destructive focus:bg-destructive-soft [&_svg]:text-destructive',
      className,
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

export { ContextMenuItem }
