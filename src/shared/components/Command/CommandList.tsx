import * as React from 'react'

import { Command as CommandPrimitive } from 'cmdk'

import { cn } from '@/shared/lib/utils'

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, onWheel, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      'scroll-py-xs max-h-[300px] overflow-x-hidden overflow-y-auto overscroll-y-contain',
      className,
    )}
    onWheel={(e) => {
      // Stop propagation before the event reaches document-level listeners
      // (e.g. react-remove-scroll from a parent Dialog) that call preventDefault()
      // and block wheel scrolling for portal content outside the Dialog's DOM tree.
      e.stopPropagation()
      onWheel?.(e)
    }}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

export { CommandList }
