import * as React from 'react'

import { cn } from '@/shared/lib/utils'

/**
 * Scrollable body area between the drawer header and footer.
 * @param props - Div props for the body container.
 * @param props.className - Additional class names merged with the default layout classes.
 * @returns The rendered drawer body.
 */
function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-1 flex-col gap-[10px] overflow-y-auto p-[18px]', className)}
      {...props}
    />
  )
}

DrawerBody.displayName = 'DrawerBody'

export { DrawerBody }
