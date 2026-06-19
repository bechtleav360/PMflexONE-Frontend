import * as React from 'react'

import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/shared/lib/utils'

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'group data-[state=active]:bg-card data-[state=active]:text-foreground text-muted-foreground hover:text-foreground inline-flex h-9 items-center justify-center gap-1.5 rounded-sm px-3.5 text-[13px] font-medium whitespace-nowrap transition-all focus-visible:[box-shadow:var(--focus)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export { TabsTrigger }
