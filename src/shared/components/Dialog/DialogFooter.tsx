import * as React from 'react'

import { cn } from '@/shared/lib/utils'

/**
 * Layout wrapper for dialog footer actions.
 * @param props - Div props for the footer container.
 * @param props.className - Additional class names to merge with the default layout classes.
 * @returns The rendered dialog footer.
 */
function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'gap-sm px-dialog-x py-md bg-muted flex items-center justify-end border-t',
        className,
      )}
      {...props}
    />
  )
}

DialogFooter.displayName = 'DialogFooter'

export { DialogFooter }
