import * as React from 'react'

import { Command as CommandPrimitive } from 'cmdk'

const CommandLoading = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Loading>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>
>((props, ref) => (
  <CommandPrimitive.Loading
    ref={ref}
    {...props}
  />
))
CommandLoading.displayName = CommandPrimitive.Loading.displayName

export { CommandLoading }
