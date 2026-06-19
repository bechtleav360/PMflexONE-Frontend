import * as React from 'react'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

import { cn } from '@/shared/lib/utils'

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
    variant?: 'default' | 'destructive'
  }
>(({ className, inset, variant = 'default', ...props }, ref) => (
  <DropdownMenuPrimitive.Item
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
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

export { DropdownMenuItem }
