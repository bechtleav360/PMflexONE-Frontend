import * as React from 'react'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'focus:bg-muted data-[state=open]:bg-muted px-md [&_svg]:text-muted-foreground flex min-h-[44px] cursor-pointer items-center gap-[10px] rounded-sm py-[10px] text-sm outline-none select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-2xl',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

export { ContextMenuSubTrigger }
