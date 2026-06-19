import * as React from 'react'

import { Command as CommandPrimitive } from 'cmdk'

import { cn } from '@/shared/lib/utils'

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'data-[selected=true]:bg-muted data-[selected=true]:text-foreground [&_svg:not([class*=text-])]:text-muted-foreground gap-sm px-md relative flex cursor-default items-center rounded-sm py-[10px] text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
      className,
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

export { CommandItem }
