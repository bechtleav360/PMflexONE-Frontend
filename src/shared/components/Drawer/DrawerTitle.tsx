import * as React from 'react'

import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@/shared/lib/utils'

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[15px] leading-none font-bold', className)}
    {...props}
  />
))
DrawerTitle.displayName = DialogPrimitive.Title.displayName

export { DrawerTitle }
