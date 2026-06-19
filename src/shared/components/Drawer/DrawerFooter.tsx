import * as React from 'react'

import { cn } from '@/shared/lib/utils'

/**
 * Layout wrapper for drawer footer actions.
 * @param props - Div props for the footer container.
 * @param props.className - Additional class names to merge with the default layout classes.
 * @returns The rendered drawer footer.
 */
function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'gap-sm py-md bg-muted flex items-center justify-end border-t px-[18px]',
        className,
      )}
      {...props}
    />
  )
}

DrawerFooter.displayName = 'DrawerFooter'

export { DrawerFooter }
