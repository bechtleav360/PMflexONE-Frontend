import * as React from 'react'

import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    className="px-md flex items-center border-b"
    // eslint-disable-next-line react/no-unknown-property -- cmdk-input-wrapper is a required DOM attribute consumed by the cmdk library for styling
    cmdk-input-wrapper=""
  >
    <Search
      aria-hidden="true"
      className="mr-sm h-4 w-4 shrink-0 opacity-50"
    />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'placeholder:text-muted-foreground py-md flex h-10 w-full rounded-md bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

export { CommandInput }
