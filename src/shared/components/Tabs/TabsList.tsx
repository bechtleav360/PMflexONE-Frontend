import * as React from 'react'

import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/shared/lib/utils'

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'bg-muted text-muted-foreground border-border inline-flex h-auto items-center justify-center gap-0.5 rounded-md border p-[3px]',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

export { TabsList }
