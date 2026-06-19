import * as React from 'react'

import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@/shared/lib/utils'

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-[13px]', className)}
    {...props}
  />
))
DrawerDescription.displayName = DialogPrimitive.Description.displayName

export { DrawerDescription }
