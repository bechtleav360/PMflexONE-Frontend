import * as React from 'react'

import { cn } from '@/shared/lib/utils'

/**
 * Scrollable body area between the dialog header and footer.
 * @param props - Div props for the body container.
 * @param props.className - Additional class names merged with the default layout classes.
 * @returns The rendered dialog body.
 */
function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-dialog-x py-lg flex-1 overflow-y-auto', className)}
      {...props}
    />
  )
}

DialogBody.displayName = 'DialogBody'

export { DialogBody }
