import * as React from 'react'

import { cn } from '@/shared/lib/utils'

/**
 * Displays shortcut text aligned to the end of a dropdown item.
 * @param props - Span props for the shortcut label.
 * @param props.className - Additional class names to merge with the default shortcut styling.
 * @returns The rendered shortcut label.
 */
function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-muted-foreground ml-auto font-mono text-[11px]', className)}
      {...props}
    />
  )
}

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export { DropdownMenuShortcut }
